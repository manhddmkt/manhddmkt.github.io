import assert from "node:assert/strict";
import { once } from "node:events";
import { createServer } from "node:http";
import test from "node:test";
import { createAppServer } from "../src/app.mjs";

async function listen(server) {
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  return `http://127.0.0.1:${server.address().port}`;
}

test("normalizes products, keeps the bearer token server-side, and protects orders", async (t) => {
  const seen = [];
  const upstream = createServer(async (request, response) => {
    seen.push({ url: request.url, method: request.method, authorization: request.headers.authorization });
    if (request.url.startsWith("/products")) {
      response.writeHead(200, { "content-type": "application/json" });
      response.end(JSON.stringify({ data: { items: [{ _id: "p1", title: "Test Jersey", base_price: "12.50", image: "https://example.com/product.jpg", category: "Jerseys" }] } }));
      return;
    }
    response.writeHead(200, { "content-type": "application/json" });
    response.end(JSON.stringify({ status: true, data: [] }));
  });
  const upstreamUrl = await listen(upstream);
  t.after(() => upstream.close());

  const logger = { info() {}, error() {} };
  const proxy = createAppServer({
    logger,
    env: {
      LEGIT_API_BASE_URL: upstreamUrl,
      LEGIT_ACCESS_TOKEN: "server-only-token",
      OWNEX_ADMIN_KEY: "admin-test-key",
      ALLOWED_ORIGINS: "https://manhddmkt.github.io",
    },
  });
  const proxyUrl = await listen(proxy);
  t.after(() => proxy.close());

  const productResponse = await fetch(`${proxyUrl}/api/products`, { headers: { origin: "https://manhddmkt.github.io" } });
  assert.equal(productResponse.status, 200);
  assert.equal(productResponse.headers.get("access-control-allow-origin"), "https://manhddmkt.github.io");
  const productBody = await productResponse.json();
  assert.equal(productBody.products.length, 1);
  assert.equal(productBody.products[0].name, "Test Jersey");
  assert.equal(productBody.products[0].price, 12.5);
  assert.equal(seen[0].authorization, "Bearer server-only-token");
  assert.equal(JSON.stringify(productBody).includes("server-only-token"), false);

  const deniedOrder = await fetch(`${proxyUrl}/api/orders`);
  assert.equal(deniedOrder.status, 401);

  const allowedOrder = await fetch(`${proxyUrl}/api/orders`, { headers: { "x-ownex-admin-key": "admin-test-key" } });
  assert.equal(allowedOrder.status, 200);
  assert.equal(seen.at(-1).url, "/order");
});

test("rejects untrusted browser origins", async (t) => {
  const proxy = createAppServer({ logger: { info() {}, error() {} }, env: { ALLOWED_ORIGINS: "https://manhddmkt.github.io" } });
  const proxyUrl = await listen(proxy);
  t.after(() => proxy.close());
  const response = await fetch(`${proxyUrl}/healthz`, { headers: { origin: "https://evil.example" } });
  assert.equal(response.status, 403);
});
