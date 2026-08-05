(() => {
  const allowed = (origin) =>
    origin === "https://ownex-commerce-admin.pages.dev" ||
    origin === "https://ownex-commerce-admin.manhddmkt.chatgpt.site" ||
    /^https:\/\/ownex-commerce-admin(?:-[a-z0-9-]+)?\.pages\.dev$/i.test(origin);

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

  const bindText = (root, selector, key) => {
    const node = root.querySelector(selector);
    if (node) node.setAttribute("data-ownex-bind", key);
  };
  const bindHtml = (root, selector, key) => {
    const node = root.querySelector(selector);
    if (node) node.setAttribute("data-ownex-bind-html", key);
  };
  const bindImage = (root, selector, imageKey, altKey) => {
    const node = root.querySelector(selector);
    if (!node) return;
    node.setAttribute("data-ownex-bind-src", imageKey);
    if (altKey) node.setAttribute("data-ownex-bind-alt", altKey);
  };
  const slot = (root, selector, key) => {
    const node = root.querySelector(selector);
    if (node) node.setAttribute("data-ownex-slot", key);
  };

  function annotate(root, key) {
    if (key === "home") {
      slot(root, ".solution-grid", "home.solutions");
      slot(root, ".product-section .product-grid", "home.products");
      slot(root, ".resource-section .resource-grid", "home.resources");
    }
    if (key === "catalog") slot(root, ".catalog-layout", "catalog.layout");
    if (key === "solutions") slot(root, ".solution-list", "solutions.list");
    if (key === "resources") slot(root, ".resources-page .resource-grid", "resources.grid");
    if (key === "product-template") {
      bindImage(root, ".product-detail .detail-image img", "product.image", "product.name");
      bindText(root, ".product-detail .detail-copy h1", "product.name");
      bindText(root, ".product-detail .detail-copy > .eyebrow", "product.category");
      bindText(root, ".product-detail .detail-copy > p", "product.description");
      bindText(root, ".product-detail .breadcrumbs span:last-child", "product.category");
      slot(root, ".related-products .product-grid", "product.related");
    }
    if (key === "solution-template") {
      bindText(root, ".solution-detail-hero h1", "solution.title");
      bindText(root, ".solution-detail-hero .eyebrow", "solution.kicker");
      bindText(root, ".solution-detail-hero p", "solution.copy");
      bindImage(root, ".solution-detail-hero img", "solution.image", "solution.title");
    }
    if (key === "article-template") {
      bindText(root, ".article-heading h1", "article.title");
      bindText(root, ".article-heading > p", "article.excerpt");
      bindImage(root, ".article-cover", "article.image", "article.title");
      bindHtml(root, ".article-body", "article.body");
    }
    return root;
  }

  function targetNode(target) {
    if (target === "header") return document.querySelector("header");
    if (target === "footer") return document.querySelector("footer");
    return document.querySelector("main");
  }

  function snapshot(target) {
    const node = targetNode(target);
    if (!node) return { html: "", key: pageKey(), title: document.title };
    const clone = node.cloneNode(true);
    clone.querySelectorAll("script, style, [data-language-switcher]").forEach((item) => item.remove());
    if (target === "main") annotate(clone, pageKey());
    return {
      html: target === "main" ? clone.innerHTML.trim() : clone.outerHTML.trim(),
      key: pageKey(),
      title: document.title,
    };
  }

  function preview(target, html, css) {
    const current = targetNode(target);
    if (!current) return;
    if (target === "main") current.innerHTML = html || "";
    else {
      const template = document.createElement("template");
      template.innerHTML = String(html || "").trim();
      const next = template.content.firstElementChild;
      if (next) current.replaceWith(next);
    }
    let style = document.querySelector("#ownex-editor-preview-style");
    if (!style) {
      style = document.createElement("style");
      style.id = "ownex-editor-preview-style";
      document.head.append(style);
    }
    style.textContent = css || "";
  }

  addEventListener("message", async (event) => {
    if (!allowed(event.origin) || !event.data?.type?.startsWith("ownex-layout:")) return;
    const { type, requestId, target = "main", language = "vi" } = event.data;
    if (type === "ownex-layout:snapshot") {
      window.OWNEX_I18N?.setLanguage?.(language);
      await new Promise((resolve) => setTimeout(resolve, 90));
      event.source?.postMessage(
        { type: "ownex-layout:snapshot-result", requestId, target, language, ...snapshot(target) },
        event.origin,
      );
    }
    if (type === "ownex-layout:preview") preview(target, event.data.html, event.data.css);
  });

  window.OWNEX_LAYOUT_EDITOR_BRIDGE = { pageKey, snapshot };
})();