import { createServer } from "node:http";
import { randomUUID, timingSafeEqual } from "node:crypto";

const JSON_HEADERS = { "content-type": "application/json; charset=utf-8" };

function json(response, status, body, headers = {}) {
  response.writeHead(status, { ...JSON_HEADERS, ...headers });
  response.end(JSON.stringify(body));
}

function parsePositiveInteger(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function normalizePath(value, fallback) {
  const path = String(value || fallback || "");
  return path.startsWith("/") ? path : `/${path}`;
}

function createConfig(env) {
  return {
    port: parsePositiveInteger(env.PORT, 8080),
    upstreamBaseUrl: String(env.LEGIT_API_BASE_URL || "https://api.legitfulfill.com").replace(/\/$/, ""),
    accessToken: String(env.LEGIT_ACCESS_TOKEN || ""),
    adminKey: String(env.OWNEX_ADMIN_KEY || ""),
    allowedOrigins: new Set(String(env.ALLOWED_ORIGINS || "https://manhddmkt.github.io,http://localhost:5173").split(",").map((item) => item.trim()).filter(Boolean)),
    productsPath: normalizePath(env.LEGIT_PRODUCTS_PATH, "/products"),
    productPathTemplate: normalizePath(env.LEGIT_PRODUCT_PATH_TEMPLATE, "/products/{id}"),
    ordersPath: normalizePath(env.LEGIT_ORDERS_PATH, "/order"),
    createOrderPath: normalizePath(env.LEGIT_CREATE_ORDER_PATH, "/order/create"),
    trackingListPath: normalizePath(env.LEGIT_TRACKING_LIST_PATH, "/order/tracking-list"),
    cacheTtlMs: parsePositiveInteger(env.CACHE_TTL_SECONDS, 300) * 1000,
    upstreamTimeoutMs: parsePositiveInteger(env.UPSTREAM_TIMEOUT_MS, 20_000),
    maxBodyBytes: parsePositiveInteger(env.MAX_BODY_BYTES, 1_048_576),
  };
}

function securityHeaders(request, config) {
  const origin = String(request.headers.origin || "");
  const headers = {
    "cache-control": "no-store",
    "x-content-type-options": "nosniff",
    "x-frame-options": "DENY",
    "referrer-policy": "no-referrer",
    "permissions-policy": "camera=(), microphone=(), geolocation=()",
    "vary": "Origin",
  };
  if (config.allowedOrigins.has(origin)) headers["access-control-allow-origin"] = origin;
  return headers;
}

function safeEqual(left, right) {
  const a = Buffer.from(String(left || ""));
  const b = Buffer.from(String(right || ""));
  return a.length > 0 && a.length === b.length && timingSafeEqual(a, b);
}

function slugify(value) {
  return String(value || "product")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function firstValue(...values) {
  return values.find((value) => value !== undefined && value !== null && value !== "");
}

function extractProducts(payload) {
  const candidates = [
    payload,
    payload?.products,
    payload?.items,
    payload?.result,
    payload?.data,
    payload?.data?.products,
    payload?.data?.items,
    payload?.data?.result,
  ];
  return candidates.find(Array.isArray) || [];
}

function normalizeImages(product) {
  const raw = firstValue(product.images, product.image_urls, product.gallery, product.image, product.thumbnail, []);
  const images = Array.isArray(raw) ? raw : [raw];
  return images.map((image) => {
    if (typeof image === "string") return { src: image, alt: product.name || product.title || "" };
    const src = firstValue(image?.src, image?.url, image?.image_url, image?.original, image?.thumbnail);
    return src ? { src, alt: firstValue(image?.alt, image?.name, product.name, product.title, "") } : null;
  }).filter(Boolean);
}

function normalizeCategories(product) {
  const raw = firstValue(product.categories, product.category, product.product_categories, []);
  const categories = Array.isArray(raw) ? raw : [raw];
  return categories.map((category) => {
    if (typeof category === "string") return { name: category, slug: slugify(category) };
    const name = firstValue(category?.name, category?.title, category?.label, "");
    return name ? { id: firstValue(category?.id, category?._id), name, slug: firstValue(category?.slug, slugify(name)) } : null;
  }).filter(Boolean);
}

function normalizeProduct(product, index) {
  const variant = Array.isArray(product.variants) ? product.variants[0] : undefined;
  const name = firstValue(product.name, product.title, product.product_name, `Product ${index + 1}`);
  const priceValue = firstValue(product.price, product.base_price, product.sale_price, product.retail_price, variant?.price, 0);
  const price = Number.parseFloat(String(priceValue).replace(/[^0-9.-]/g, "")) || 0;
  const id = firstValue(product.id, product._id, product.product_id, product.sku, index + 1);
  return {
    id,
    slug: firstValue(product.slug, product.handle, product.product_slug, slugify(name)),
    name,
    sku: firstValue(product.sku, product.product_sku, product.code, variant?.sku, ""),
    summary: firstValue(product.summary, product.short_description, product.description, ""),
    price,
    regularPrice: Number.parseFloat(firstValue(product.regular_price, product.compare_at_price, price)) || price,
    currency: firstValue(product.currency, product.currency_code, "USD"),
    currencySymbol: firstValue(product.currency_symbol, product.currencySymbol, "$"),
    images: normalizeImages(product),
    categories: normalizeCategories(product),
    attributes: Array.isArray(product.attributes) ? product.attributes : [],
    rating: Number.parseFloat(firstValue(product.rating, product.average_rating, 0)) || 0,
    upstreamId: id,
  };
}

async function readBody(request, maxBytes) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > maxBytes) {
      const error = new Error("Request body is too large");
      error.status = 413;
      throw error;
    }
    chunks.push(chunk);
  }
  if (!chunks.length) return undefined;
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    const error = new Error("Request body must be valid JSON");
    error.status = 400;
    throw error;
  }
}

function upstreamError(response, status, requestId) {
  const mappedStatus = status === 404 ? 502 : status === 401 || status === 403 ? 502 : status >= 500 ? 502 : status;
  json(response, mappedStatus, { error: "Legit API request failed", requestId }, { "cache-control": "no-store" });
}

export function createAppServer({ env = process.env, fetchImpl = fetch, logger = console } = {}) {
  const config = createConfig(env);
  const productCache = { expiresAt: 0, payload: null };
  const rateBuckets = new Map();

  function isRateLimited(request) {
    const now = Date.now();
    const ip = String(request.headers["x-forwarded-for"] || request.socket.remoteAddress || "unknown").split(",")[0].trim();
    const minute = Math.floor(now / 60_000);
    const key = `${ip}:${minute}`;
    const count = (rateBuckets.get(key) || 0) + 1;
    rateBuckets.set(key, count);
    if (rateBuckets.size > 5000) {
      for (const bucketKey of rateBuckets.keys()) if (!bucketKey.endsWith(`:${minute}`)) rateBuckets.delete(bucketKey);
    }
    return count > 180;
  }

  async function callUpstream(path, { method = "GET", body, query = "" } = {}) {
    if (!config.accessToken) {
      const error = new Error("LEGIT_ACCESS_TOKEN is not configured");
      error.status = 503;
      throw error;
    }
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), config.upstreamTimeoutMs);
    try {
      return await fetchImpl(`${config.upstreamBaseUrl}${path}${query}`, {
        method,
        headers: {
          accept: "application/json",
          authorization: `Bearer ${config.accessToken}`,
          ...(body === undefined ? {} : { "content-type": "application/json" }),
        },
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timer);
    }
  }

  return createServer(async (request, response) => {
    const requestId = randomUUID();
    const startedAt = Date.now();
    const baseHeaders = securityHeaders(request, config);
    for (const [key, value] of Object.entries(baseHeaders)) response.setHeader(key, value);
    response.setHeader("x-request-id", requestId);

    try {
      const url = new URL(request.url, "http://localhost");
      const origin = String(request.headers.origin || "");

      if (origin && !config.allowedOrigins.has(origin)) {
        json(response, 403, { error: "Origin is not allowed", requestId });
        return;
      }

      if (request.method === "OPTIONS") {
        response.writeHead(204, {
          ...baseHeaders,
          "access-control-allow-methods": "GET, POST, DELETE, OPTIONS",
          "access-control-allow-headers": "Content-Type, X-Ownex-Admin-Key",
          "access-control-max-age": "86400",
        });
        response.end();
        return;
      }

      if (isRateLimited(request)) {
        json(response, 429, { error: "Too many requests", requestId }, { "retry-after": "60" });
        return;
      }

      if (request.method === "GET" && url.pathname === "/healthz") {
        json(response, 200, { ok: true, upstreamConfigured: Boolean(config.accessToken) }, { "cache-control": "no-store" });
        return;
      }

      if (request.method === "GET" && url.pathname === "/api/products") {
        if (productCache.payload && productCache.expiresAt > Date.now()) {
          json(response, 200, productCache.payload, { "cache-control": "public, max-age=60", "x-cache": "HIT" });
          return;
        }
        const upstream = await callUpstream(config.productsPath, { query: url.search });
        if (!upstream.ok) {
          upstreamError(response, upstream.status, requestId);
          return;
        }
        const payload = await upstream.json();
        const products = extractProducts(payload).map(normalizeProduct);
        const normalized = { products, source: "legit-api", syncedAt: new Date().toISOString() };
        productCache.payload = normalized;
        productCache.expiresAt = Date.now() + config.cacheTtlMs;
        json(response, 200, normalized, { "cache-control": "public, max-age=60", "x-cache": "MISS" });
        return;
      }

      const productMatch = request.method === "GET" && url.pathname.match(/^\/api\/products\/([^/]+)$/);
      if (productMatch) {
        const id = encodeURIComponent(decodeURIComponent(productMatch[1]));
        const path = config.productPathTemplate.replace("{id}", id);
        const upstream = await callUpstream(path, { query: url.search });
        if (!upstream.ok) {
          upstreamError(response, upstream.status, requestId);
          return;
        }
        const payload = await upstream.json();
        const raw = Array.isArray(payload) ? payload[0] : firstValue(payload?.product, payload?.data?.product, payload?.data, payload);
        json(response, 200, { product: normalizeProduct(raw || {}, 0), source: "legit-api" }, { "cache-control": "public, max-age=60" });
        return;
      }

      if (url.pathname.startsWith("/api/orders")) {
        if (!config.adminKey || !safeEqual(request.headers["x-ownex-admin-key"], config.adminKey)) {
          json(response, 401, { error: "Admin authentication required", requestId });
          return;
        }

        let upstreamPath;
        let method = request.method;
        let body;
        const orderMatch = url.pathname.match(/^\/api\/orders\/([^/]+)$/);

        if (method === "GET" && url.pathname === "/api/orders") upstreamPath = config.ordersPath;
        else if (method === "POST" && url.pathname === "/api/orders") {
          upstreamPath = config.createOrderPath;
          body = await readBody(request, config.maxBodyBytes);
        } else if (method === "POST" && url.pathname === "/api/orders/tracking") {
          upstreamPath = config.trackingListPath;
          body = await readBody(request, config.maxBodyBytes);
        } else if (orderMatch && (method === "GET" || method === "DELETE")) {
          upstreamPath = `${config.ordersPath}/${encodeURIComponent(decodeURIComponent(orderMatch[1]))}`;
        } else {
          json(response, 404, { error: "Route not found", requestId });
          return;
        }

        const upstream = await callUpstream(upstreamPath, { method, body, query: method === "GET" ? url.search : "" });
        const text = await upstream.text();
        if (!upstream.ok) {
          upstreamError(response, upstream.status, requestId);
          return;
        }
        response.writeHead(upstream.status, { ...baseHeaders, ...JSON_HEADERS, "cache-control": "no-store" });
        response.end(text || "{}");
        return;
      }

      json(response, 404, { error: "Route not found", requestId });
    } catch (error) {
      const status = error?.status || (error?.name === "AbortError" ? 504 : 500);
      logger.error?.({ requestId, status, message: error?.message });
      json(response, status, { error: status >= 500 ? "Backend request failed" : error.message, requestId });
    } finally {
      logger.info?.({ requestId, method: request.method, path: request.url, durationMs: Date.now() - startedAt, status: response.statusCode });
    }
  });
}
