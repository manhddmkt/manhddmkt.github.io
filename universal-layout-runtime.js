(() => {
  const API = "https://ownex-commerce-admin.manhddmkt.chatgpt.site";
  const BYPASS = new URLSearchParams(location.search).has("ownexLayoutBypass");
  let layouts = null;
  let applying = false;
  let scheduled = false;
  const contexts = new Map();

  const lang = () =>
    window.OWNEX_I18N?.getLanguage?.() ||
    localStorage.getItem("ownex-language") ||
    layouts?.defaultLanguage ||
    "vi";

  const pageKey = (path = location.pathname) => {
    const clean = path.replace(/\/+$/, "") || "/";
    if (clean === "/") return "home";
    if (clean === "/catalog") return "catalog";
    if (clean.startsWith("/product/")) return "product-template";
    if (clean === "/solutions") return "solutions";
    if (clean.startsWith("/solutions/")) return "solution-template";
    if (clean === "/integrations") return "integrations";
    if (clean === "/resources") return "resources";
    if (clean.startsWith("/blog/")) return "article-template";
    if (clean === "/about") return "about";
    if (clean === "/contact") return "contact";
    if (clean === "/help") return "help";
    if (clean === "/faq") return "faq";
    if (clean === "/privacy") return "privacy";
    if (clean === "/terms") return "terms";
    return "not-found";
  };

  const read = (root, selector, mode = "text") => {
    const node = root?.querySelector(selector);
    if (!node) return "";
    if (mode === "html") return node.innerHTML;
    if (mode === "src") return node.getAttribute("src") || "";
    return node.textContent?.trim() || "";
  };

  function extractContext(main, key) {
    const values = {};
    const slots = {};
    const addSlot = (name, selector) => {
      const node = main.querySelector(selector);
      if (node) slots[name] = node.innerHTML;
    };
    if (key === "home") {
      addSlot("home.solutions", ".solution-grid");
      addSlot("home.products", ".product-section .product-grid");
      addSlot("home.resources", ".resource-section .resource-grid");
    }
    if (key === "catalog") addSlot("catalog.layout", ".catalog-layout");
    if (key === "solutions") addSlot("solutions.list", ".solution-list");
    if (key === "resources") addSlot("resources.grid", ".resources-page .resource-grid");
    if (key === "product-template") {
      values["product.name"] = read(main, ".product-detail .detail-copy h1");
      values["product.category"] = read(main, ".product-detail .detail-copy > .eyebrow");
      values["product.description"] = read(main, ".product-detail .detail-copy > p");
      values["product.image"] = read(main, ".product-detail .detail-image img", "src");
      addSlot("product.related", ".related-products .product-grid");
    }
    if (key === "solution-template") {
      values["solution.title"] = read(main, ".solution-detail-hero h1");
      values["solution.kicker"] = read(main, ".solution-detail-hero .eyebrow");
      values["solution.copy"] = read(main, ".solution-detail-hero p");
      values["solution.image"] = read(main, ".solution-detail-hero img", "src");
    }
    if (key === "article-template") {
      values["article.title"] = read(main, ".article-heading h1");
      values["article.excerpt"] = read(main, ".article-heading > p");
      values["article.image"] = read(main, ".article-cover", "src");
      values["article.body"] = read(main, ".article-body", "html");
    }
    return { values, slots };
  }

  function hydrate(root, context) {
    root.querySelectorAll("[data-ownex-bind]").forEach((node) => {
      const value = context.values[node.dataset.ownexBind];
      if (value !== undefined) node.textContent = value;
    });
    root.querySelectorAll("[data-ownex-bind-html]").forEach((node) => {
      const value = context.values[node.dataset.ownexBindHtml];
      if (value !== undefined) node.innerHTML = value;
    });
    root.querySelectorAll("[data-ownex-bind-src]").forEach((node) => {
      const value = context.values[node.dataset.ownexBindSrc];
      if (value !== undefined) node.setAttribute("src", value);
    });
    root.querySelectorAll("[data-ownex-bind-alt]").forEach((node) => {
      const value = context.values[node.dataset.ownexBindAlt];
      if (value !== undefined) node.setAttribute("alt", value);
    });
    root.querySelectorAll("[data-ownex-slot]").forEach((node) => {
      const value = context.slots[node.dataset.ownexSlot];
      if (value !== undefined) node.innerHTML = value;
    });
  }

  function styleFor(id, css) {
    let style = document.querySelector(`#${id}`);
    if (!css) {
      style?.remove();
      return;
    }
    if (!style) {
      style = document.createElement("style");
      style.id = id;
      document.head.append(style);
    }
    style.textContent = css;
  }

  function localized(config, field) {
    const value = config?.[field];
    if (value && typeof value === "object") return value[lang()] || value.vi || value.en || "";
    return value || "";
  }

  function replaceOuter(current, html, marker) {
    if (!current || !html) return current;
    const template = document.createElement("template");
    template.innerHTML = html.trim();
    const next = template.content.firstElementChild;
    if (!next) return current;
    next.setAttribute("data-ownex-layout-custom", marker);
    current.replaceWith(next);
    return next;
  }

  function bindInteractions(root = document) {
    root.querySelectorAll(".header-search, .ownex-new-header__search, [data-ownex-search]").forEach((form) => {
      if (form.dataset.ownexBound) return;
      form.dataset.ownexBound = "1";
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const query = new FormData(form).get("search")?.toString().trim() || "";
        location.href = query ? `/catalog?search=${encodeURIComponent(query)}` : "/catalog";
      });
    });
    root.querySelectorAll("#catalog-search-form").forEach((form) => {
      if (form.dataset.ownexBound) return;
      form.dataset.ownexBound = "1";
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const params = new URLSearchParams(location.search);
        const query = new FormData(form).get("search")?.toString().trim() || "";
        query ? params.set("search", query) : params.delete("search");
        params.delete("page");
        location.href = `/catalog${params.toString() ? `?${params}` : ""}`;
      });
    });
    root.querySelectorAll(".newsletter-form").forEach((form) => {
      if (form.dataset.ownexBound) return;
      form.dataset.ownexBound = "1";
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const note = form.querySelector(".form-note");
        if (note) note.textContent = lang() === "vi" ? "Cảm ơn bạn đã đăng ký." : "Thank you for subscribing.";
      });
    });
    root.querySelectorAll(".contact-form").forEach((form) => {
      if (form.dataset.ownexBound) return;
      form.dataset.ownexBound = "1";
      form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const note = form.querySelector(".form-note");
        const submit = form.querySelector('[type="submit"]');
        if (submit) submit.disabled = true;
        if (note) note.textContent = lang() === "vi" ? "Đang gửi..." : "Sending...";
        try {
          const response = await fetch(`${API}/api/public/inquiries`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(Object.fromEntries(new FormData(form).entries())),
          });
          if (!response.ok) throw new Error("send failed");
          form.reset();
          if (note) note.textContent = lang() === "vi" ? "Yêu cầu đã được ghi nhận." : "Your request has been recorded.";
        } catch {
          if (note) note.textContent = lang() === "vi" ? "Không thể gửi. Vui lòng liên hệ qua email." : "Unable to send. Please contact us by email.";
        } finally {
          if (submit) submit.disabled = false;
        }
      });
    });
  }

  function applyGlobal(target, config, styleId) {
    if (!config?.enabled) {
      styleFor(styleId, "");
      return;
    }
    const html = localized(config, "html");
    const selector = target === "header" ? "header" : "footer";
    let node = document.querySelector(`${selector}[data-ownex-layout-custom="${target}"]`);
    if (!node) node = replaceOuter(document.querySelector(selector), html, target);
    styleFor(styleId, config.css || "");
    bindInteractions(node || document);
  }

  function applyPage() {
    if (!layouts || BYPASS || applying) return;
    const main = document.querySelector("main");
    if (!main) return;
    const key = pageKey();
    const routeId = `${key}:${location.pathname}${location.search}`;
    if (!main.dataset.ownexLayoutCustom) contexts.set(routeId, extractContext(main, key));

    applyGlobal("header", layouts.globals?.header, "ownex-custom-header-css");
    applyGlobal("footer", layouts.globals?.footer, "ownex-custom-footer-css");

    const config = layouts.pages?.[key];
    if (!config?.enabled) {
      styleFor("ownex-custom-page-css", "");
      bindInteractions();
      return;
    }
    const html = localized(config, "html");
    if (!html) return;
    const marker = `${key}:${lang()}`;
    if (main.dataset.ownexLayoutCustom === marker) return;
    applying = true;
    try {
      main.innerHTML = html;
      main.dataset.ownexLayoutCustom = marker;
      hydrate(main, contexts.get(routeId) || { values: {}, slots: {} });
      styleFor("ownex-custom-page-css", config.css || "");
      const title = localized(config, "title");
      if (title) document.title = title;
      bindInteractions(main);
    } finally {
      applying = false;
    }
  }

  function schedule() {
    if (scheduled || BYPASS) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      applyPage();
    });
  }

  async function load() {
    if (BYPASS) return;
    try {
      const response = await fetch(`${API}/api/public/bootstrap`, { cache: "no-store" });
      if (!response.ok) return;
      const payload = await response.json();
      layouts = payload?.content?.homepage?.siteLayouts || null;
      if (layouts) schedule();
    } catch (error) {
      console.warn("Universal layouts unavailable", error);
    }
  }

  function start() {
    load();
    const app = document.querySelector("#app");
    if (app) new MutationObserver(schedule).observe(app, { childList: true, subtree: true });
    addEventListener("ownex:languagechange", () => {
      document.querySelector("main")?.removeAttribute("data-ownex-layout-custom");
      document.querySelector('header[data-ownex-layout-custom="header"]')?.remove();
      document.querySelector('footer[data-ownex-layout-custom="footer"]')?.remove();
      location.reload();
    });
  }

  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", start, { once: true })
    : start();
})();