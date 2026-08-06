(() => {
  const EDITOR_QUERY = "ownexVisualEditor";
  const IS_EDITOR = new URLSearchParams(location.search).has(EDITOR_QUERY);
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

  function cleanClone(node, target) {
    const clone = node.cloneNode(true);
    clone
      .querySelectorAll(
        "script, style, [data-language-switcher], .ownex-editor-outline, .ownex-editor-label",
      )
      .forEach((item) => item.remove());
    clone.querySelectorAll("[data-ownex-editor-id]").forEach((item) => {
      item.removeAttribute("data-ownex-editor-id");
      item.removeAttribute("contenteditable");
      item.removeAttribute("draggable");
    });
    if (target === "main") annotate(clone, pageKey());
    return clone;
  }

  function snapshot(target) {
    const node = targetNode(target);
    if (!node) return { html: "", key: pageKey(), title: document.title };
    const clone = cleanClone(node, target);
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
    if (IS_EDITOR) editor.refresh();
  }

  const editor = (() => {
    let enabled = IS_EDITOR;
    let selected = null;
    let hovered = null;
    let seq = 0;
    let adminOrigin = "";
    let target = "main";
    let language = "vi";
    let outline;
    let label;
    const undoStack = [];
    const redoStack = [];

    const editorStyle = document.createElement("style");
    editorStyle.id = "ownex-visual-editor-style";
    editorStyle.textContent = `
      html.ownex-visual-editing * { cursor: default !important; }
      html.ownex-visual-editing [data-ownex-editor-id] { cursor: pointer !important; }
      html.ownex-visual-editing [contenteditable="true"] { cursor: text !important; outline: 2px solid #1769e0 !important; outline-offset: 2px; }
      .ownex-editor-outline { position: fixed; z-index: 2147483646; pointer-events: none; border: 2px solid #1769e0; border-radius: 4px; box-shadow: 0 0 0 2px rgba(255,255,255,.86); }
      .ownex-editor-outline.is-hover { border-color: #55a0ff; border-style: dashed; box-shadow: none; }
      .ownex-editor-label { position: fixed; z-index: 2147483647; pointer-events: none; padding: 5px 8px; border-radius: 5px 5px 0 0; background: #1769e0; color: #fff; font: 700 11px/1.1 Arial,sans-serif; white-space: nowrap; }
    `;

    function ensureUI() {
      if (!document.head.contains(editorStyle)) document.head.append(editorStyle);
      if (!outline) {
        outline = document.createElement("div");
        outline.className = "ownex-editor-outline";
        document.body.append(outline);
      }
      if (!label) {
        label = document.createElement("div");
        label.className = "ownex-editor-label";
        document.body.append(label);
      }
    }

    function idFor(node) {
      if (!node || node.nodeType !== 1) return "";
      if (!node.dataset.ownexEditorId) {
        seq += 1;
        node.dataset.ownexEditorId = `oe-${Date.now().toString(36)}-${seq}`;
      }
      return node.dataset.ownexEditorId;
    }

    function nodeFor(id) {
      return id ? document.querySelector(`[data-ownex-editor-id="${CSS.escape(id)}"]`) : null;
    }

    function root() {
      return targetNode(target);
    }

    function eligible(node) {
      const activeRoot = root();
      if (!node || !activeRoot || !activeRoot.contains(node)) return null;
      if (node.closest(".ownex-editor-outline,.ownex-editor-label")) return null;
      return node;
    }

    function labelFor(node) {
      if (!node) return "";
      const tag = node.tagName.toLowerCase();
      const cls = [...node.classList].slice(0, 2).map((item) => `.${item}`).join("");
      const text = node.childElementCount === 0 ? (node.textContent || "").trim().slice(0, 34) : "";
      return `${tag}${cls}${text ? ` · ${text}` : ""}`;
    }

    function positionBox(node, mode = "selected") {
      ensureUI();
      if (!node || !document.documentElement.contains(node)) {
        outline.hidden = true;
        label.hidden = true;
        return;
      }
      const rect = node.getBoundingClientRect();
      if (!rect.width && !rect.height) return;
      outline.hidden = false;
      label.hidden = false;
      outline.classList.toggle("is-hover", mode === "hover");
      Object.assign(outline.style, {
        left: `${Math.max(0, rect.left)}px`,
        top: `${Math.max(0, rect.top)}px`,
        width: `${Math.max(0, rect.width)}px`,
        height: `${Math.max(0, rect.height)}px`,
      });
      label.textContent = labelFor(node);
      const labelTop = rect.top > 28 ? rect.top - 26 : rect.top;
      Object.assign(label.style, {
        left: `${Math.max(0, rect.left)}px`,
        top: `${Math.max(0, labelTop)}px`,
      });
    }

    function describe(node) {
      if (!node) return null;
      const computed = getComputedStyle(node);
      const isText = /^(H[1-6]|P|SPAN|A|BUTTON|LI|LABEL|SMALL|STRONG|B|EM)$/.test(node.tagName);
      const isImage = node.tagName === "IMG";
      const isLink = node.tagName === "A";
      const section = node.closest("section, article, header, footer") || node;
      return {
        id: idFor(node),
        tag: node.tagName.toLowerCase(),
        label: labelFor(node),
        text: isText ? node.textContent || "" : "",
        html: node.innerHTML,
        isText,
        isImage,
        isLink,
        attributes: {
          href: isLink ? node.getAttribute("href") || "" : "",
          src: isImage ? node.getAttribute("src") || "" : "",
          alt: isImage ? node.getAttribute("alt") || "" : "",
          title: node.getAttribute("title") || "",
        },
        styles: {
          color: computed.color,
          backgroundColor: computed.backgroundColor,
          fontSize: computed.fontSize,
          fontWeight: computed.fontWeight,
          lineHeight: computed.lineHeight,
          textAlign: computed.textAlign,
          width: computed.width,
          maxWidth: computed.maxWidth,
          minHeight: computed.minHeight,
          paddingTop: computed.paddingTop,
          paddingRight: computed.paddingRight,
          paddingBottom: computed.paddingBottom,
          paddingLeft: computed.paddingLeft,
          marginTop: computed.marginTop,
          marginRight: computed.marginRight,
          marginBottom: computed.marginBottom,
          marginLeft: computed.marginLeft,
          borderRadius: computed.borderRadius,
          display: computed.display,
          gap: computed.gap,
          gridTemplateColumns: computed.gridTemplateColumns,
          objectFit: computed.objectFit,
        },
        sectionId: idFor(section),
        sectionLabel: labelFor(section),
      };
    }

    function sections() {
      const activeRoot = root();
      if (!activeRoot) return [];
      const direct = [...activeRoot.children].filter((node) => node.nodeType === 1);
      return direct.map((node, index) => ({
        id: idFor(node),
        index,
        tag: node.tagName.toLowerCase(),
        label: labelFor(node) || `Khối ${index + 1}`,
        hidden: node.hidden || getComputedStyle(node).display === "none",
      }));
    }

    function emit(type, payload = {}) {
      if (!adminOrigin || !parent) return;
      parent.postMessage({ type, ...payload }, adminOrigin);
    }

    function emitSelection(node) {
      if (!node) return;
      selected = node;
      positionBox(node);
      emit("ownex-visual:selected", {
        selection: describe(node),
        sections: sections(),
        pageKey: pageKey(),
        target,
        language,
      });
    }

    function assignIds() {
      const activeRoot = root();
      if (!activeRoot) return;
      idFor(activeRoot);
      activeRoot.querySelectorAll("*").forEach(idFor);
    }

    function handlePointer(event) {
      if (!enabled) return;
      const node = eligible(event.target);
      if (!node) return;
      if (event.type === "mouseover") {
        hovered = node;
        if (node !== selected) positionBox(node, "hover");
      }
      if (event.type === "mouseout") {
        hovered = null;
        positionBox(selected);
      }
      if (event.type === "click") {
        event.preventDefault();
        event.stopPropagation();
        emitSelection(node);
      }
      if (event.type === "dblclick") {
        event.preventDefault();
        event.stopPropagation();
        if (/^(H[1-6]|P|SPAN|A|BUTTON|LI|LABEL|SMALL|STRONG|B|EM)$/.test(node.tagName)) {
          node.contentEditable = "true";
          node.focus();
          const range = document.createRange();
          range.selectNodeContents(node);
          const selection = getSelection();
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }
    }

    function finishInline(event) {
      const node = event.target.closest?.('[contenteditable="true"]');
      if (!node) return;
      node.removeAttribute("contenteditable");
      emitSelection(node);
      emit("ownex-visual:changed", { reason: "inline-text" });
    }

    function captureRootState() {
      const activeRoot = root();
      if (!activeRoot) return null;
      return {
        target,
        html: target === "main" ? activeRoot.innerHTML : activeRoot.outerHTML,
      };
    }

    function restoreRootState(state) {
      if (!state) return;
      const activeRoot = root();
      if (!activeRoot) return;
      if (target === "main") activeRoot.innerHTML = state.html;
      else {
        const template = document.createElement("template");
        template.innerHTML = state.html.trim();
        const next = template.content.firstElementChild;
        if (next) activeRoot.replaceWith(next);
      }
      selected = null;
      assignIds();
      positionBox(null);
      emit("ownex-visual:changed", { reason: "history", selection: null, sections: sections() });
    }

    function pushHistory() {
      const state = captureRootState();
      if (!state) return;
      undoStack.push(state);
      if (undoStack.length > 50) undoStack.shift();
      redoStack.length = 0;
    }

    function blockTemplate(kind) {
      const templates = {
        section: `<section class="section"><div class="section-heading"><span class="eyebrow">NHÃN KHỐI</span><h2>Tiêu đề section mới</h2><p>Mô tả section mới.</p></div></section>`,
        heading: `<div class="section-heading"><span class="eyebrow">NHÃN</span><h2>Tiêu đề mới</h2><p>Nội dung mô tả.</p></div>`,
        text: `<p>Nhập nội dung mới tại đây.</p>`,
        button: `<a class="button button-primary" href="#">Nút mới <span>↗</span></a>`,
        image: `<img src="/assets/gifts-personalized-products.jpg" alt="Hình ảnh mới" style="max-width:100%;height:auto;" />`,
        spacer: `<div aria-hidden="true" style="height:48px"></div>`,
        columns: `<section class="section" style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:32px"><div><h2>Cột thứ nhất</h2><p>Nội dung cột thứ nhất.</p></div><div><h2>Cột thứ hai</h2><p>Nội dung cột thứ hai.</p></div></section>`,
      };
      return templates[kind] || templates.section;
    }

    function mutate(command) {
      if (command.action === "undo") {
        const current = captureRootState();
        const previous = undoStack.pop();
        if (!previous) return;
        if (current) redoStack.push(current);
        restoreRootState(previous);
        return;
      }
      if (command.action === "redo") {
        const current = captureRootState();
        const next = redoStack.pop();
        if (!next) return;
        if (current) undoStack.push(current);
        restoreRootState(next);
        return;
      }
      const node = nodeFor(command.id) || selected;
      if (!node && !["insert-block", "reorder-section"].includes(command.action)) return;
      pushHistory();
      const setStyle = (prop, value) => {
        if (!value) node.style.removeProperty(prop);
        else node.style.setProperty(prop, value);
      };
      switch (command.action) {
        case "set-text":
          node.textContent = command.value ?? "";
          break;
        case "set-html":
          node.innerHTML = command.value ?? "";
          break;
        case "set-attribute":
          if (!command.value) node.removeAttribute(command.name);
          else node.setAttribute(command.name, command.value);
          break;
        case "set-style":
          setStyle(command.name, command.value);
          break;
        case "set-styles":
          Object.entries(command.styles || {}).forEach(([prop, value]) => setStyle(prop, value));
          break;
        case "delete": {
          const next = node.nextElementSibling || node.previousElementSibling || node.parentElement;
          node.remove();
          selected = null;
          if (next && root()?.contains(next)) emitSelection(next);
          break;
        }
        case "duplicate": {
          const clone = node.cloneNode(true);
          clone.querySelectorAll?.("[data-ownex-editor-id]").forEach((item) => item.removeAttribute("data-ownex-editor-id"));
          clone.removeAttribute?.("data-ownex-editor-id");
          node.after(clone);
          assignIds();
          emitSelection(clone);
          break;
        }
        case "move-up": {
          const sibling = node.previousElementSibling;
          if (sibling) sibling.before(node);
          emitSelection(node);
          break;
        }
        case "move-down": {
          const sibling = node.nextElementSibling;
          if (sibling) sibling.after(node);
          emitSelection(node);
          break;
        }
        case "hide":
          node.hidden = Boolean(command.value);
          break;
        case "insert-block": {
          const activeRoot = root();
          if (!activeRoot) return;
          const template = document.createElement("template");
          template.innerHTML = blockTemplate(command.kind).trim();
          const newNode = template.content.firstElementChild;
          if (!newNode) return;
          const anchor = nodeFor(command.afterId) || selected;
          if (anchor && activeRoot.contains(anchor)) {
            const section = anchor.closest("section, article") || anchor;
            section.after(newNode);
          } else activeRoot.append(newNode);
          assignIds();
          emitSelection(newNode);
          break;
        }
        case "reorder-section": {
          const activeRoot = root();
          const moving = nodeFor(command.movingId);
          const before = nodeFor(command.beforeId);
          if (!activeRoot || !moving || !before || moving === before) return;
          activeRoot.insertBefore(moving, before);
          emitSelection(moving);
          break;
        }
        case "select-section": {
          const sectionNode = nodeFor(command.sectionId);
          if (sectionNode) emitSelection(sectionNode);
          return;
        }
        default:
          return;
      }
      assignIds();
      positionBox(selected);
      emit("ownex-visual:changed", {
        reason: command.action,
        selection: selected ? describe(selected) : null,
        sections: sections(),
      });
    }

    function enable(options = {}) {
      enabled = true;
      adminOrigin = options.origin || adminOrigin;
      target = options.target || target;
      language = options.language || language;
      window.OWNEX_I18N?.setLanguage?.(language);
      document.documentElement.classList.add("ownex-visual-editing");
      ensureUI();
      assignIds();
      if (!undoStack.length) undoStack.push(captureRootState());
      emit("ownex-visual:ready", {
        pageKey: pageKey(),
        target,
        language,
        sections: sections(),
      });
    }

    function disable() {
      enabled = false;
      document.documentElement.classList.remove("ownex-visual-editing");
      outline?.remove();
      label?.remove();
      outline = null;
      label = null;
      document.querySelectorAll('[contenteditable="true"]').forEach((node) => node.removeAttribute("contenteditable"));
    }

    function refresh() {
      if (!enabled) return;
      selected = null;
      assignIds();
      positionBox(null);
      emit("ownex-visual:ready", {
        pageKey: pageKey(),
        target,
        language,
        sections: sections(),
      });
    }

    document.addEventListener("mouseover", handlePointer, true);
    document.addEventListener("mouseout", handlePointer, true);
    document.addEventListener("click", handlePointer, true);
    document.addEventListener("dblclick", handlePointer, true);
    document.addEventListener("blur", finishInline, true);
    addEventListener("scroll", () => positionBox(selected), true);
    addEventListener("resize", () => positionBox(selected));

    return { enable, disable, mutate, refresh, sections, emitSelection };
  })();

  addEventListener("message", async (event) => {
    if (!allowed(event.origin) || !event.data?.type?.startsWith("ownex-")) return;
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
    if (type === "ownex-visual:enable") editor.enable({ origin: event.origin, target, language });
    if (type === "ownex-visual:disable") editor.disable();
    if (type === "ownex-visual:mutate") editor.mutate(event.data.command || {});
    if (type === "ownex-visual:refresh") editor.refresh();
  });

  if (IS_EDITOR) {
    document.addEventListener("click", (event) => {
      const link = event.target.closest("a");
      if (link) event.preventDefault();
    }, true);
    document.addEventListener("submit", (event) => event.preventDefault(), true);
  }

  window.OWNEX_LAYOUT_EDITOR_BRIDGE = { pageKey, snapshot, editor };
})();
