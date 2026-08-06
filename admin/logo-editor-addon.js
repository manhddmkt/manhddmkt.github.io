(() => {
  const WEBSITE = "https://ownex-commerce.pages.dev";
  const API = "https://ownex-commerce-admin.manhddmkt.chatgpt.site";
  const DEFAULT_LOGO = "/assets/ownex-logo.svg";
  let currentLogo = null;

  const frame = () => document.querySelector("#fleFrame");
  const post = (type, payload = {}) =>
    frame()?.contentWindow?.postMessage({ type, ...payload }, WEBSITE);

  function logoConfig() {
    const homepage = state.content.homepage || (state.content.homepage = {});
    homepage.pageBuilder ||= { version: 1, globals: {}, sections: [] };
    homepage.pageBuilder.globals ||= {};
    homepage.pageBuilder.globals.header ||= {};
    homepage.pageBuilder.globals.header.logo ||= {
      src: DEFAULT_LOGO,
      alt: "OWNEX Commerce",
      width: "120px",
      href: "/",
    };
    return homepage.pageBuilder.globals.header.logo;
  }

  function updateStoredLogo(property, value) {
    const logo = logoConfig();
    logo[property] = value;
    logo.src ||= DEFAULT_LOGO;
    logo.alt ||= "OWNEX Commerce";
    logo.width ||= "120px";
    logo.href ||= "/";
  }

  function logoInspector(logo) {
    const src = logo.src || DEFAULT_LOGO;
    return `
      <div class="fle-selection-title">
        <div><span>LOGO ẢNH</span><h3>Logo website</h3></div>
        <button type="button" class="fle-close-selection" data-logo-close aria-label="Bỏ chọn">×</button>
      </div>
      <div class="fle-logo-preview"><img src="${escapeHtml(src)}" alt="${escapeHtml(logo.alt || "OWNEX Commerce")}"></div>
      <div class="fle-tabs">
        <button type="button" class="active">Hình ảnh</button>
      </div>
      <div class="fle-tab-panel active">
        <div class="fle-form-grid">
          <div class="fle-logo-image-fields wide">
            <label><span>Thay ảnh logo</span><input id="fleLogoUpload" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml"></label>
            <button type="button" class="secondary-button" data-logo-upload>Tải lên & sử dụng</button>
            <small>PNG, JPG, WebP hoặc SVG · tối đa 5 MB</small>
          </div>
          <label class="wide"><span>Đường dẫn ảnh logo</span><input data-logo-property="src" value="${escapeHtml(src)}" placeholder="/assets/logo.svg"></label>
          <label class="wide"><span>Mô tả ảnh (Alt text)</span><input data-logo-property="alt" value="${escapeHtml(logo.alt || "OWNEX Commerce")}"></label>
          <label class="wide"><span>Chiều rộng logo</span><input data-logo-property="width" value="${escapeHtml(logo.width || "120px")}" placeholder="120px"></label>
          <label class="wide"><span>Đường dẫn khi bấm logo</span><input data-logo-property="href" value="${escapeHtml(logo.href || "/")}" placeholder="/"></label>
        </div>
        <div class="fle-logo-note">Logo là một file ảnh. Bấm <b>Lưu & xuất bản</b> ở thanh trên cùng để áp dụng cho toàn website.</div>
      </div>`;
  }

  function renderLogoInspector() {
    const root = document.querySelector("#fleInspector");
    if (root && currentLogo) root.innerHTML = logoInspector(currentLogo);
  }

  function enableLogoBridge() {
    post("ownex-logo:enable");
  }

  async function uploadLogo(file) {
    if (!file) throw new Error("Hãy chọn file logo.");
    if (file.size > 5 * 1024 * 1024) throw new Error("Logo vượt quá giới hạn 5 MB.");
    const token = sessionStorage.getItem("ownex_admin_session") || "";
    const form = new FormData();
    form.append("file", file);
    form.append("altText", file.name.replace(/\.[^.]+$/, ""));
    const response = await fetch(`${API}/api/admin/media`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || "Không thể tải logo lên.");
    return new URL(payload.url, API).href;
  }

  addEventListener("message", (event) => {
    if (event.origin !== WEBSITE || event.data?.type !== "ownex-logo:selected") return;
    const stored = logoConfig();
    currentLogo = {
      src: event.data.logo?.src || stored.src || DEFAULT_LOGO,
      alt: event.data.logo?.alt || stored.alt || "OWNEX Commerce",
      width: event.data.logo?.width || stored.width || "120px",
      href: event.data.logo?.href || stored.href || "/",
    };
    renderLogoInspector();
  });

  document.addEventListener(
    "load",
    (event) => {
      if (event.target.id !== "fleFrame") return;
      setTimeout(enableLogoBridge, 220);
    },
    true,
  );

  document.addEventListener("change", (event) => {
    const input = event.target.closest?.("[data-logo-property]");
    if (!input || !currentLogo) return;
    const property = input.dataset.logoProperty;
    currentLogo[property] = input.value;
    updateStoredLogo(property, input.value);
    post("ownex-logo:mutate", { property, value: input.value });
  });

  document.addEventListener("input", (event) => {
    const input = event.target.closest?.("[data-logo-property]");
    if (!input || !currentLogo) return;
    const property = input.dataset.logoProperty;
    currentLogo[property] = input.value;
    updateStoredLogo(property, input.value);
    clearTimeout(input._logoTimer);
    input._logoTimer = setTimeout(
      () => post("ownex-logo:mutate", { property, value: input.value }),
      180,
    );
  });

  document.addEventListener("click", async (event) => {
    if (event.target.closest("[data-logo-close]")) {
      currentLogo = null;
      const root = document.querySelector("#fleInspector");
      if (root) root.innerHTML = `<div class="fle-inspector-empty"><div>↖</div><h3>Chọn một phần tử</h3><p>Bấm trực tiếp vào chữ, ảnh, nút hoặc logo trên trang để chỉnh sửa.</p></div>`;
      return;
    }

    const upload = event.target.closest("[data-logo-upload]");
    if (!upload) return;
    upload.disabled = true;
    try {
      const file = document.querySelector("#fleLogoUpload")?.files?.[0];
      const url = await uploadLogo(file);
      currentLogo ||= logoConfig();
      currentLogo.src = url;
      currentLogo.alt = file.name.replace(/\.[^.]+$/, "") || "OWNEX Commerce";
      updateStoredLogo("src", url);
      updateStoredLogo("alt", currentLogo.alt);
      post("ownex-logo:mutate", { property: "src", value: url });
      post("ownex-logo:mutate", { property: "alt", value: currentLogo.alt });
      renderLogoInspector();
      showToast("Đã tải logo lên và áp dụng trong bản xem trước.");
    } catch (error) {
      showToast(`Không thể tải logo: ${error.message}`);
    } finally {
      upload.disabled = false;
    }
  });

  const observer = new MutationObserver(() => {
    if (document.querySelector("#fleFrame")) enableLogoBridge();
  });
  observer.observe(document.body, { childList: true, subtree: true });
})();
