(() => {
  const WEBSITE = "https://ownex-commerce.pages.dev";
  const DEFINITIONS = [
    ["global-header", "Header", "/", "header"],
    ["global-footer", "Footer", "/", "footer"],
    ["home", "Trang chủ", "/", "main"],
    ["about", "Về OWNEX", "/about", "main"],
    ["catalog", "Catalog", "/catalog", "main"],
    ["product-template", "Chi tiết sản phẩm", "/product/wooden-baseball-glove-sign", "main"],
    ["solutions", "Trang dịch vụ", "/solutions", "main"],
    ["solution-template", "Chi tiết dịch vụ", "/solutions/product-development", "main"],
    ["integrations", "Tích hợp", "/integrations", "main"],
    ["resources", "Blog", "/resources", "main"],
    ["article-template", "Chi tiết bài viết", "/blog/prepare-products-for-scalable-growth", "main"],
    ["contact", "Liên hệ", "/contact", "main"],
    ["help", "Trung tâm trợ giúp", "/help", "main"],
    ["faq", "Câu hỏi thường gặp", "/faq", "main"],
    ["privacy", "Chính sách riêng tư", "/privacy", "main"],
    ["terms", "Điều khoản", "/terms", "main"],
    ["not-found", "Trang 404", "/duong-dan-khong-ton-tai", "main"],
  ].map(([key, label, route, target]) => ({ key, label, route, target }));

  let selectedPage = "home";
  let editorLanguage = "vi";
  let device = "desktop";
  let selection = null;
  let sections = [];
  let dirty = false;
  let frameReady = false;
  let frameInitialized = false;
  const pending = new Map();
  const inputTimers = new Map();

  const definition = () =>
    DEFINITIONS.find((item) => item.key === selectedPage) || DEFINITIONS[2];

  function ensureLayouts() {
    const homepage = state.content.homepage || (state.content.homepage = {});
    homepage.siteLayouts ||= {
      version: 2,
      defaultLanguage: "vi",
      pages: {},
      globals: {},
    };
    homepage.siteLayouts.pages ||= {};
    homepage.siteLayouts.globals ||= {};
    return homepage.siteLayouts;
  }

  function currentConfig(create = true) {
    const layouts = ensureLayouts();
    const def = definition();
    const root = def.target === "main" ? layouts.pages : layouts.globals;
    const key = def.target === "main" ? def.key : def.target;
    if (!root[key] && create) {
      root[key] = {
        key: def.key,
        label: def.label,
        route: def.route,
        enabled: false,
        title: { vi: "", en: "" },
        html: { vi: "", en: "" },
        css: "",
        updatedAt: "",
      };
    }
    root[key].title ||= { vi: "", en: "" };
    root[key].html ||= { vi: "", en: "" };
    return root[key];
  }

  function previewUrl(route) {
    const params = new URLSearchParams({
      ownexLayoutBypass: "1",
      ownexVisualEditor: "1",
      ownexEditorLanguage: editorLanguage,
    });
    return `${WEBSITE}${route}${route.includes("?") ? "&" : "?"}${params}`;
  }

  function post(type, payload = {}) {
    const frame = document.querySelector("#fleFrame");
    frame?.contentWindow?.postMessage({ type, ...payload }, WEBSITE);
  }

  function requestSnapshot(language = editorLanguage) {
    const def = definition();
    const requestId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        pending.delete(requestId);
        reject(new Error("Không nhận được dữ liệu từ khung chỉnh sửa."));
      }, 12000);
      pending.set(requestId, (data) => {
        clearTimeout(timer);
        resolve(data);
      });
      post("ownex-layout:snapshot", {
        requestId,
        target: def.target,
        language,
      });
    });
  }

  function pageOptions() {
    return DEFINITIONS.map(
      (item) =>
        `<option value="${item.key}" ${item.key === selectedPage ? "selected" : ""}>${escapeHtml(item.label)}</option>`,
    ).join("");
  }

  function deviceButtons() {
    return [
      ["desktop", "Màn hình", "▰"],
      ["tablet", "Máy tính bảng", "▯"],
      ["mobile", "Điện thoại", "▯"],
    ]
      .map(
        ([value, label, icon]) =>
          `<button type="button" class="fle-icon-button ${device === value ? "active" : ""}" data-fle-device="${value}" title="${label}"><span>${icon}</span></button>`,
      )
      .join("");
  }

  function sectionList() {
    if (!sections.length) {
      return `<div class="fle-empty">Chọn một trang để xem danh sách các khối.</div>`;
    }
    return sections
      .map(
        (item, index) => `
          <button type="button" class="fle-layer ${selection?.sectionId === item.id || selection?.id === item.id ? "active" : ""}" draggable="true" data-fle-section="${item.id}">
            <span class="fle-layer-handle">⋮⋮</span>
            <span><b>${escapeHtml(item.label || `Khối ${index + 1}`)}</b><small>${escapeHtml(item.tag)}${item.hidden ? " · Đang ẩn" : ""}</small></span>
            <i>${index + 1}</i>
          </button>`,
      )
      .join("");
  }

  function inspectorEmpty() {
    return `
      <div class="fle-inspector-empty">
        <div>↖</div>
        <h3>Chọn một phần tử</h3>
        <p>Bấm trực tiếp vào chữ, ảnh, nút hoặc khối trên trang để chỉnh sửa.</p>
        <small>Mẹo: nhấp đúp vào chữ để sửa ngay trên trang.</small>
      </div>`;
  }

  function field(label, name, value = "", options = {}) {
    const type = options.type || "text";
    const cls = options.wide ? "wide" : "";
    if (type === "textarea") {
      return `<label class="${cls}"><span>${label}</span><textarea data-fle-property="${name}" rows="${options.rows || 4}">${escapeHtml(value)}</textarea></label>`;
    }
    if (type === "select") {
      return `<label class="${cls}"><span>${label}</span><select data-fle-property="${name}">${options.options
        .map(
          ([v, text]) =>
            `<option value="${escapeHtml(v)}" ${String(value) === String(v) ? "selected" : ""}>${escapeHtml(text)}</option>`,
        )
        .join("")}</select></label>`;
    }
    return `<label class="${cls}"><span>${label}</span><input data-fle-property="${name}" type="${type}" value="${escapeHtml(value)}" ${options.placeholder ? `placeholder="${escapeHtml(options.placeholder)}"` : ""}></label>`;
  }

  function rgbToHex(value = "") {
    if (!value || value === "transparent" || /rgba\([^)]*,\s*0\s*\)/.test(value)) return "#ffffff";
    if (value.startsWith("#")) return value.slice(0, 7);
    const parts = value.match(/[\d.]+/g);
    if (!parts || parts.length < 3) return "#ffffff";
    return `#${parts
      .slice(0, 3)
      .map((item) => Math.max(0, Math.min(255, Number(item))).toString(16).padStart(2, "0"))
      .join("")}`;
  }

  function inspector() {
    if (!selection) return inspectorEmpty();
    const s = selection.styles || {};
    const attrs = selection.attributes || {};
    return `
      <div class="fle-selection-title">
        <div><span>${escapeHtml(selection.tag || "element")}</span><h3>${escapeHtml(selection.label || "Phần tử")}</h3></div>
        <button type="button" class="fle-close-selection" data-fle-clear-selection aria-label="Bỏ chọn">×</button>
      </div>
      <div class="fle-tabs" role="tablist">
        <button type="button" class="active" data-fle-tab="content">Nội dung</button>
        <button type="button" data-fle-tab="style">Thiết kế</button>
        <button type="button" data-fle-tab="spacing">Khoảng cách</button>
      </div>
      <div class="fle-tab-panel active" data-fle-panel="content">
        <div class="fle-form-grid">
          ${selection.isText ? field("Nội dung", "text", selection.text, { type: "textarea", wide: true, rows: 5 }) : ""}
          ${selection.isLink ? field("Đường dẫn", "href", attrs.href, { wide: true, placeholder: "/contact hoặc https://..." }) : ""}
          ${selection.isImage ? field("Đường dẫn ảnh", "src", attrs.src, { wide: true }) : ""}
          ${selection.isImage ? field("Mô tả ảnh", "alt", attrs.alt, { wide: true }) : ""}
          ${field("Ghi chú khi rê chuột", "title", attrs.title, { wide: true })}
        </div>
        <div class="fle-inspector-actions">
          <button type="button" class="secondary-button" data-fle-command="duplicate">Nhân bản</button>
          <button type="button" class="secondary-button" data-fle-command="move-up">Đưa lên</button>
          <button type="button" class="secondary-button" data-fle-command="move-down">Đưa xuống</button>
          <button type="button" class="text-button fle-danger" data-fle-command="delete">Xóa</button>
        </div>
      </div>
      <div class="fle-tab-panel" data-fle-panel="style">
        <div class="fle-form-grid two">
          ${field("Màu chữ", "style:color", rgbToHex(s.color), { type: "color" })}
          ${field("Màu nền", "style:background-color", rgbToHex(s.backgroundColor), { type: "color" })}
          ${field("Cỡ chữ", "style:font-size", s.fontSize)}
          ${field("Độ đậm", "style:font-weight", s.fontWeight, { type: "select", options: [["400", "Thường"], ["500", "Medium"], ["600", "Semi Bold"], ["700", "Bold"], ["800", "Extra Bold"]] })}
          ${field("Chiều cao dòng", "style:line-height", s.lineHeight)}
          ${field("Căn chữ", "style:text-align", s.textAlign, { type: "select", options: [["left", "Trái"], ["center", "Giữa"], ["right", "Phải"], ["justify", "Đều"]] })}
          ${field("Chiều rộng", "style:width", s.width)}
          ${field("Chiều rộng tối đa", "style:max-width", s.maxWidth)}
          ${field("Bo góc", "style:border-radius", s.borderRadius)}
          ${field("Khoảng cách các phần tử", "style:gap", s.gap)}
          ${selection.isImage ? field("Cách ảnh lấp đầy", "style:object-fit", s.objectFit, { type: "select", options: [["cover", "Cắt đầy khung"], ["contain", "Hiện toàn ảnh"], ["fill", "Kéo đầy"], ["none", "Kích thước gốc"]] }) : ""}
        </div>
      </div>
      <div class="fle-tab-panel" data-fle-panel="spacing">
        <h4>Padding</h4>
        <div class="fle-form-grid four">
          ${field("Trên", "style:padding-top", s.paddingTop)}
          ${field("Phải", "style:padding-right", s.paddingRight)}
          ${field("Dưới", "style:padding-bottom", s.paddingBottom)}
          ${field("Trái", "style:padding-left", s.paddingLeft)}
        </div>
        <h4>Margin</h4>
        <div class="fle-form-grid four">
          ${field("Trên", "style:margin-top", s.marginTop)}
          ${field("Phải", "style:margin-right", s.marginRight)}
          ${field("Dưới", "style:margin-bottom", s.marginBottom)}
          ${field("Trái", "style:margin-left", s.marginLeft)}
        </div>
      </div>`;
  }

  function visualEditorView() {
    const def = definition();
    const config = currentConfig();
    return `
      <div class="fle-workspace">
        <header class="fle-toolbar">
          <div class="fle-toolbar-group fle-toolbar-page">
            <label><span>Trang</span><select id="flePageSelect">${pageOptions()}</select></label>
          </div>
          <div class="fle-toolbar-group">
            <div class="fle-language">
              <button type="button" data-fle-lang="vi" class="${editorLanguage === "vi" ? "active" : ""}">VI</button>
              <button type="button" data-fle-lang="en" class="${editorLanguage === "en" ? "active" : ""}">EN</button>
            </div>
            <div class="fle-devices">${deviceButtons()}</div>
          </div>
          <div class="fle-toolbar-group fle-toolbar-actions">
            <span class="fle-save-state ${dirty ? "is-dirty" : ""}">${dirty ? "Có thay đổi chưa lưu" : "Đã đồng bộ"}</span>
            <button type="button" class="secondary-button" data-fle-undo title="Hoàn tác">↶</button>
            <button type="button" class="secondary-button" data-fle-redo title="Làm lại">↷</button>
            <a class="secondary-button" href="${WEBSITE}${def.route}" target="_blank" rel="noreferrer">Xem trang ↗</a>
            <button type="button" class="primary-button" data-fle-save>Lưu & xuất bản</button>
          </div>
        </header>

        <div class="fle-builder">
          <aside class="fle-left-panel">
            <div class="fle-panel-heading"><div><span class="eyebrow">CẤU TRÚC</span><h3>Các khối trên trang</h3></div></div>
            <div class="fle-layers" id="fleLayers">${sectionList()}</div>
            <div class="fle-add-blocks">
              <span>THÊM KHỐI</span>
              <div class="fle-block-grid">
                ${[
                  ["section", "▱", "Section"],
                  ["heading", "H", "Tiêu đề"],
                  ["text", "¶", "Văn bản"],
                  ["image", "▧", "Hình ảnh"],
                  ["button", "▣", "Nút"],
                  ["columns", "▥", "2 cột"],
                  ["spacer", "↕", "Khoảng trống"],
                ]
                  .map(
                    ([kind, icon, label]) =>
                      `<button type="button" data-fle-add="${kind}"><b>${icon}</b><span>${label}</span></button>`,
                  )
                  .join("")}
              </div>
            </div>
          </aside>

          <main class="fle-canvas-area">
            <div class="fle-canvas-toolbar">
              <span>${escapeHtml(def.label)} · ${editorLanguage.toUpperCase()}</span>
              <small>Nhấp để chọn · Nhấp đúp để sửa chữ trực tiếp</small>
            </div>
            <div class="fle-canvas ${device}" data-device="${device}">
              <iframe class="fle-frame" id="fleFrame" src="${previewUrl(def.route)}" title="Trình chỉnh sửa ${escapeHtml(def.label)}"></iframe>
            </div>
          </main>

          <aside class="fle-right-panel">
            <div class="fle-panel-heading"><div><span class="eyebrow">CHỈNH SỬA</span><h3>Thuộc tính</h3></div></div>
            <div class="fle-inspector" id="fleInspector">${inspector()}</div>
            <details class="fle-advanced">
              <summary>Nâng cao: HTML/CSS</summary>
              <div>
                <label><span>HTML ${editorLanguage.toUpperCase()}</span><textarea id="fleAdvancedHtml" spellcheck="false">${escapeHtml(config.html?.[editorLanguage] || "")}</textarea></label>
                <label><span>CSS riêng</span><textarea id="fleAdvancedCss" spellcheck="false">${escapeHtml(config.css || "")}</textarea></label>
                <button type="button" class="secondary-button" data-fle-apply-code>Áp dụng code vào bản xem trước</button>
              </div>
            </details>
          </aside>
        </div>
      </div>`;
  }

  TITLES.fullLayouts = ["Trình sửa website", "Bấm trực tiếp vào website để chỉnh sửa như WordPress."];
  const previousRender = render;
  render = function () {
    if (state.view !== "fullLayouts") return previousRender();
    const [title, subtitle] = TITLES.fullLayouts;
    document.querySelector("#viewTitle").textContent = title;
    document.querySelector("#viewSubtitle").textContent = subtitle;
    document
      .querySelectorAll("#adminNav button[data-view]")
      .forEach((button) =>
        button.classList.toggle("active", button.dataset.view === "fullLayouts"),
      );
    contentRoot.innerHTML = visualEditorView();
    frameReady = false;
    frameInitialized = false;
  };

  function installNavigation() {
    let button = document.querySelector('#adminNav button[data-view="fullLayouts"]');
    if (!button) {
      const settings = document.querySelector('#adminNav button[data-view="settings"]');
      button = document.createElement("button");
      button.dataset.view = "fullLayouts";
      settings?.before(button);
    }
    button.innerHTML = "<span>✎</span>Sửa giao diện";
  }
  installNavigation();

  async function initializeFrame() {
    if (!frameReady || frameInitialized) return;
    frameInitialized = true;
    const config = currentConfig();
    const html = config.html?.[editorLanguage] || "";
    if (html) {
      post("ownex-layout:preview", {
        target: definition().target,
        html,
        css: config.css || "",
      });
      await new Promise((resolve) => setTimeout(resolve, 140));
    }
    post("ownex-visual:enable", {
      target: definition().target,
      language: editorLanguage,
    });
  }

  function sendMutation(action, payload = {}) {
    if (!selection && !["insert-block", "reorder-section", "undo", "redo"].includes(action)) return;
    dirty = true;
    updateSaveState();
    post("ownex-visual:mutate", {
      command: { action, id: selection?.id, ...payload },
    });
  }

  function updateSaveState() {
    const node = document.querySelector(".fle-save-state");
    if (!node) return;
    node.textContent = dirty ? "Có thay đổi chưa lưu" : "Đã đồng bộ";
    node.classList.toggle("is-dirty", dirty);
  }

  function renderLayers() {
    const root = document.querySelector("#fleLayers");
    if (root) root.innerHTML = sectionList();
  }

  function renderInspector() {
    const root = document.querySelector("#fleInspector");
    if (root) root.innerHTML = inspector();
  }

  function debouncedMutation(key, action, payload, delay = 220) {
    clearTimeout(inputTimers.get(key));
    inputTimers.set(
      key,
      setTimeout(() => sendMutation(action, payload), delay),
    );
  }

  addEventListener("message", (event) => {
    if (event.origin !== WEBSITE) return;
    const data = event.data || {};
    if (data.type === "ownex-layout:snapshot-result") {
      const resolve = pending.get(data.requestId);
      if (!resolve) return;
      pending.delete(data.requestId);
      resolve(data);
    }
    if (data.type === "ownex-visual:ready") {
      frameReady = true;
      sections = data.sections || [];
      renderLayers();
      if (!frameInitialized) initializeFrame();
    }
    if (data.type === "ownex-visual:selected") {
      selection = data.selection || null;
      sections = data.sections || sections;
      renderInspector();
      renderLayers();
    }
    if (data.type === "ownex-visual:changed") {
      dirty = true;
      selection = data.selection || selection;
      sections = data.sections || sections;
      updateSaveState();
      renderInspector();
      renderLayers();
    }
  });

  contentRoot.addEventListener("load", (event) => {
    if (event.target.id !== "fleFrame") return;
    frameReady = true;
    frameInitialized = false;
    setTimeout(initializeFrame, 180);
  }, true);

  contentRoot.addEventListener("change", (event) => {
    if (event.target.id === "flePageSelect") {
      selectedPage = event.target.value;
      selection = null;
      sections = [];
      dirty = false;
      render();
      return;
    }
    const property = event.target.dataset.fleProperty;
    if (!property || !selection) return;
    const value = event.target.value;
    if (property === "text") return sendMutation("set-text", { value });
    if (property.startsWith("style:")) {
      return sendMutation("set-style", { name: property.slice(6), value });
    }
    sendMutation("set-attribute", { name: property, value });
  });

  contentRoot.addEventListener("input", (event) => {
    const property = event.target.dataset.fleProperty;
    if (!property || !selection) return;
    const value = event.target.value;
    if (property === "text") {
      debouncedMutation(property, "set-text", { value });
    } else if (property.startsWith("style:")) {
      debouncedMutation(property, "set-style", {
        name: property.slice(6),
        value,
      });
    } else {
      debouncedMutation(property, "set-attribute", { name: property, value });
    }
  });

  contentRoot.addEventListener("click", async (event) => {
    const languageButton = event.target.closest("[data-fle-lang]");
    if (languageButton) {
      editorLanguage = languageButton.dataset.fleLang;
      selection = null;
      sections = [];
      dirty = false;
      return render();
    }

    const deviceButton = event.target.closest("[data-fle-device]");
    if (deviceButton) {
      device = deviceButton.dataset.fleDevice;
      document.querySelector(".fle-canvas")?.classList.remove("desktop", "tablet", "mobile");
      document.querySelector(".fle-canvas")?.classList.add(device);
      document.querySelectorAll("[data-fle-device]").forEach((button) => button.classList.toggle("active", button === deviceButton));
      return;
    }

    const layer = event.target.closest("[data-fle-section]");
    if (layer) {
      post("ownex-visual:mutate", {
        command: { action: "select-section", sectionId: layer.dataset.fleSection },
      });
      return;
    }

    const add = event.target.closest("[data-fle-add]");
    if (add) {
      sendMutation("insert-block", {
        kind: add.dataset.fleAdd,
        afterId: selection?.sectionId || selection?.id || "",
      });
      return;
    }

    const command = event.target.closest("[data-fle-command]");
    if (command) {
      const action = command.dataset.fleCommand;
      if (action === "delete" && !confirm("Xóa phần tử đang chọn?")) return;
      sendMutation(action);
      return;
    }

    if (event.target.closest("[data-fle-clear-selection]")) {
      selection = null;
      renderInspector();
      renderLayers();
      return;
    }

    const tab = event.target.closest("[data-fle-tab]");
    if (tab) {
      const name = tab.dataset.fleTab;
      document.querySelectorAll("[data-fle-tab]").forEach((item) => item.classList.toggle("active", item === tab));
      document.querySelectorAll("[data-fle-panel]").forEach((item) => item.classList.toggle("active", item.dataset.flePanel === name));
      return;
    }

    if (event.target.closest("[data-fle-undo]")) {
      sendMutation("undo");
      return;
    }
    if (event.target.closest("[data-fle-redo]")) {
      sendMutation("redo");
      return;
    }

    if (event.target.closest("[data-fle-apply-code]")) {
      const config = currentConfig();
      config.html[editorLanguage] = document.querySelector("#fleAdvancedHtml")?.value || "";
      config.css = document.querySelector("#fleAdvancedCss")?.value || "";
      config.enabled = true;
      post("ownex-layout:preview", {
        target: definition().target,
        html: config.html[editorLanguage],
        css: config.css,
      });
      dirty = true;
      updateSaveState();
      frameInitialized = false;
      setTimeout(initializeFrame, 160);
      return;
    }

    const saveButton = event.target.closest("[data-fle-save]");
    if (saveButton) {
      saveButton.disabled = true;
      try {
        const result = await requestSnapshot(editorLanguage);
        const config = currentConfig();
        config.html[editorLanguage] = result.html || "";
        config.title[editorLanguage] = result.title || "";
        config.enabled = true;
        config.updatedAt = new Date().toISOString();
        const advancedCss = document.querySelector("#fleAdvancedCss")?.value;
        if (advancedCss !== undefined) config.css = advancedCss;
        await saveJsonFile(
          "content",
          state.content,
          "Update homepage visual website layouts from OWNEX Admin",
        );
        dirty = false;
        updateSaveState();
        showToast("Đã lưu và xuất bản giao diện website.");
      } catch (error) {
        showToast(`Không thể lưu: ${error.message}`);
      } finally {
        saveButton.disabled = false;
      }
    }
  });

  let draggingSection = "";
  contentRoot.addEventListener("dragstart", (event) => {
    const item = event.target.closest("[data-fle-section]");
    if (!item) return;
    draggingSection = item.dataset.fleSection;
    item.classList.add("is-dragging");
    event.dataTransfer.effectAllowed = "move";
  });
  contentRoot.addEventListener("dragover", (event) => {
    const item = event.target.closest("[data-fle-section]");
    if (!item || !draggingSection) return;
    event.preventDefault();
    item.classList.add("is-drop-target");
  });
  contentRoot.addEventListener("dragleave", (event) => {
    event.target.closest("[data-fle-section]")?.classList.remove("is-drop-target");
  });
  contentRoot.addEventListener("drop", (event) => {
    const item = event.target.closest("[data-fle-section]");
    if (!item || !draggingSection) return;
    event.preventDefault();
    sendMutation("reorder-section", {
      movingId: draggingSection,
      beforeId: item.dataset.fleSection,
    });
    draggingSection = "";
  });
  contentRoot.addEventListener("dragend", () => {
    draggingSection = "";
    document.querySelectorAll(".fle-layer").forEach((item) => item.classList.remove("is-dragging", "is-drop-target"));
  });

  window.OWNEX_VISUAL_EDITOR = {
    definitions: DEFINITIONS,
    ensureLayouts,
  };
})();
