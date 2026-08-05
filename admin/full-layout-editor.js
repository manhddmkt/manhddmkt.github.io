(() => {
  const WEBSITE = "https://ownex-commerce.pages.dev";
  const DEFINITIONS = [
    ["global-header", "Header toàn website", "/", "header"],
    ["global-footer", "Footer toàn website", "/", "footer"],
    ["home", "Trang chủ", "/", "main"],
    ["about", "Về OWNEX", "/about", "main"],
    ["catalog", "Catalog", "/catalog", "main"],
    ["product-template", "Mẫu chi tiết sản phẩm", "/product/wooden-baseball-glove-sign", "main"],
    ["solutions", "Trang Dịch vụ", "/solutions", "main"],
    ["solution-template", "Mẫu chi tiết dịch vụ", "/solutions/product-development", "main"],
    ["integrations", "Tích hợp", "/integrations", "main"],
    ["resources", "Trang Blog", "/resources", "main"],
    ["article-template", "Mẫu chi tiết bài viết", "/blog/prepare-products-for-scalable-growth", "main"],
    ["contact", "Liên hệ", "/contact", "main"],
    ["help", "Trung tâm trợ giúp", "/help", "main"],
    ["faq", "Câu hỏi thường gặp", "/faq", "main"],
    ["privacy", "Chính sách riêng tư", "/privacy", "main"],
    ["terms", "Điều khoản", "/terms", "main"],
    ["not-found", "Trang 404", "/duong-dan-khong-ton-tai", "main"],
  ].map(([key, label, route, target]) => ({ key, label, route, target }));

  let selected = "home";
  let editorLanguage = "vi";
  const pending = new Map();

  const definition = () => DEFINITIONS.find((item) => item.key === selected) || DEFINITIONS[2];
  const clone = (value) => JSON.parse(JSON.stringify(value));

  function ensureLayouts() {
    const homepage = state.content.homepage || (state.content.homepage = {});
    if (!homepage.siteLayouts) {
      homepage.siteLayouts = { version: 1, defaultLanguage: "vi", pages: {}, globals: {} };
    }
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
    return root[key];
  }

  function previewUrl(route) {
    const join = route.includes("?") ? "&" : "?";
    return `${WEBSITE}${route}${join}ownexLayoutBypass=1`;
  }

  function syncForm() {
    const form = document.querySelector("#fleForm");
    if (!form) return;
    const config = currentConfig();
    const values = new FormData(form);
    config.enabled = values.get("enabled") === "on";
    config.title ||= { vi: "", en: "" };
    config.html ||= { vi: "", en: "" };
    config.title[editorLanguage] = String(values.get("title") || "");
    config.html[editorLanguage] = String(values.get("html") || "");
    config.css = String(values.get("css") || "");
  }

  function editorView() {
    const layouts = ensureLayouts();
    const def = definition();
    const config = currentConfig();
    const title = config.title?.[editorLanguage] || "";
    const html = config.html?.[editorLanguage] || "";
    return `
      <section class="panel">
        <div class="panel-head">
          <div><span class="eyebrow">FULL LAYOUT EDITOR</span><h2>Chỉnh sửa 100% bố cục toàn website</h2><p>Nạp trực tiếp giao diện đang chạy, sửa HTML/CSS và xem trước trước khi xuất bản.</p></div>
          <div class="toolbar"><button type="button" class="primary-button" data-fle-save>Lưu & xuất bản</button></div>
        </div>
      </section>
      <div class="fle-shell">
        <section class="fle-editor">
          <div class="fle-head">
            <div><span class="eyebrow">BỐ CỤC ĐANG CHỌN</span><h2>${escapeHtml(def.label)}</h2></div>
            <div class="fle-language"><button type="button" data-fle-lang="vi" class="${editorLanguage === "vi" ? "active" : ""}">VI</button><button type="button" data-fle-lang="en" class="${editorLanguage === "en" ? "active" : ""}">EN</button></div>
          </div>
          <form class="fle-body" id="fleForm">
            <div class="fle-grid">
              <label class="wide"><span>Trang hoặc template</span><select id="flePageSelect">${DEFINITIONS.map((item) => `<option value="${item.key}" ${item.key === selected ? "selected" : ""}>${escapeHtml(item.label)}</option>`).join("")}</select></label>
              <label class="fle-enabled wide"><input type="checkbox" name="enabled" ${config.enabled ? "checked" : ""}><span>Kích hoạt bố cục tùy chỉnh này</span></label>
              <label class="wide"><span>Tiêu đề trình duyệt (${editorLanguage.toUpperCase()})</span><input name="title" value="${escapeHtml(title)}" placeholder="Để trống để giữ tiêu đề hiện tại"></label>
              <label class="wide"><span>HTML (${editorLanguage.toUpperCase()})</span><textarea class="fle-code" name="html" spellcheck="false" placeholder="Bấm “Nạp bố cục hiện tại” để bắt đầu">${escapeHtml(html)}</textarea></label>
              <label class="wide"><span>CSS riêng cho bố cục</span><textarea class="fle-code fle-css" name="css" spellcheck="false" placeholder="CSS được tải sau toàn bộ CSS website">${escapeHtml(config.css || "")}</textarea></label>
            </div>
            <div class="fle-actions">
              <button type="button" class="secondary-button" data-fle-capture>Nạp bố cục hiện tại (${editorLanguage.toUpperCase()})</button>
              <button type="button" class="secondary-button" data-fle-capture-all>Nạp cả VI + EN</button>
              <button type="button" class="secondary-button" data-fle-preview>Xem trước thay đổi</button>
              <button type="button" class="text-button fle-danger" data-fle-reset>Khôi phục mặc định</button>
            </div>
            <div class="fle-help">
              Các template động tự giữ dữ liệu bằng thuộc tính <code>data-ownex-bind</code> và <code>data-ownex-slot</code>. Bạn có thể di chuyển các phần tử này nhưng không nên xóa nếu muốn sản phẩm, bài viết và danh sách tiếp tục cập nhật tự động.
            </div>
          </form>
        </section>
        <section class="fle-preview">
          <div class="fle-head">
            <div><span class="eyebrow">LIVE PREVIEW</span><h2>${escapeHtml(def.route)}</h2></div>
            <div class="fle-preview-toolbar"><span class="fle-status">Đã kết nối</span><a class="text-button" href="${previewUrl(def.route)}" target="_blank" rel="noreferrer">Mở tab mới ↗</a></div>
          </div>
          <div class="fle-frame-wrap"><iframe class="fle-frame" id="fleFrame" src="${previewUrl(def.route)}" title="Xem trước ${escapeHtml(def.label)}"></iframe></div>
        </section>
      </div>`;
  }

  TITLES.fullLayouts = ["Toàn bộ bố cục", "Chỉnh sửa HTML/CSS của mọi trang và template."];
  const previousRender = render;
  render = function () {
    if (state.view !== "fullLayouts") return previousRender();
    const [title, subtitle] = TITLES.fullLayouts;
    document.querySelector("#viewTitle").textContent = title;
    document.querySelector("#viewSubtitle").textContent = subtitle;
    document.querySelectorAll("#adminNav button[data-view]").forEach((button) => button.classList.toggle("active", button.dataset.view === "fullLayouts"));
    contentRoot.innerHTML = editorView();
  };

  function installNavigation() {
    if (document.querySelector('#adminNav button[data-view="fullLayouts"]')) return;
    const settings = document.querySelector('#adminNav button[data-view="settings"]');
    const button = document.createElement("button");
    button.dataset.view = "fullLayouts";
    button.innerHTML = "<span>▦</span>Toàn bộ bố cục";
    settings?.before(button);
  }
  installNavigation();

  function post(type, payload = {}) {
    const frame = document.querySelector("#fleFrame");
    frame?.contentWindow?.postMessage({ type, ...payload }, WEBSITE);
  }

  function requestSnapshot(language) {
    const def = definition();
    const requestId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        pending.delete(requestId);
        reject(new Error("Không nhận được dữ liệu từ cửa sổ xem trước."));
      }, 10000);
      pending.set(requestId, (data) => {
        clearTimeout(timer);
        resolve(data);
      });
      post("ownex-layout:snapshot", { requestId, target: def.target, language });
    });
  }

  addEventListener("message", (event) => {
    if (event.origin !== WEBSITE || event.data?.type !== "ownex-layout:snapshot-result") return;
    const resolve = pending.get(event.data.requestId);
    if (!resolve) return;
    pending.delete(event.data.requestId);
    resolve(event.data);
  });

  async function capture(language) {
    const result = await requestSnapshot(language);
    const config = currentConfig();
    config.html ||= { vi: "", en: "" };
    config.title ||= { vi: "", en: "" };
    config.html[language] = result.html || "";
    config.title[language] = result.title || "";
    config.enabled = true;
  }

  contentRoot.addEventListener("change", (event) => {
    if (event.target.id === "flePageSelect") {
      syncForm();
      selected = event.target.value;
      render();
    }
  });

  contentRoot.addEventListener("click", async (event) => {
    const languageButton = event.target.closest("[data-fle-lang]");
    if (languageButton) {
      syncForm();
      editorLanguage = languageButton.dataset.fleLang;
      return render();
    }
    if (event.target.closest("[data-fle-capture]")) {
      try {
        syncForm();
        await capture(editorLanguage);
        render();
        showToast(`Đã nạp bố cục ${editorLanguage.toUpperCase()} từ website.`);
      } catch (error) {
        showToast(`Không thể nạp bố cục: ${error.message}`);
      }
    }
    if (event.target.closest("[data-fle-capture-all]")) {
      try {
        syncForm();
        await capture("vi");
        await capture("en");
        render();
        showToast("Đã nạp cả bố cục Tiếng Việt và English.");
      } catch (error) {
        showToast(`Không thể nạp bố cục: ${error.message}`);
      }
    }
    if (event.target.closest("[data-fle-preview]")) {
      syncForm();
      const config = currentConfig();
      post("ownex-layout:preview", { target: definition().target, html: config.html?.[editorLanguage] || "", css: config.css || "" });
      showToast("Đã gửi thay đổi sang cửa sổ xem trước.");
    }
    if (event.target.closest("[data-fle-reset]")) {
      const config = currentConfig();
      config.enabled = false;
      config.html = { vi: "", en: "" };
      config.title = { vi: "", en: "" };
      config.css = "";
      render();
      showToast("Đã khôi phục bố cục mặc định trong bản nháp.");
    }
    if (event.target.closest("[data-fle-save]")) {
      const button = event.target.closest("[data-fle-save]");
      button.disabled = true;
      try {
        syncForm();
        const config = currentConfig();
        config.updatedAt = new Date().toISOString();
        await saveJsonFile("content", state.content, "Update full website layouts from OWNEX Admin");
        showToast("Đã lưu và xuất bản toàn bộ bố cục website.");
      } catch (error) {
        showToast(`Không thể lưu: ${error.message}`);
      } finally {
        button.disabled = false;
      }
    }
  });

  window.OWNEX_FULL_LAYOUT_EDITOR = { definitions: clone(DEFINITIONS), ensureLayouts };
})();