(() => {
  const WEBSITE = "https://ownex-commerce.pages.dev";
  const API = "https://ownex-commerce-admin.manhddmkt.chatgpt.site";
  const DEFAULT_LOGO = "/assets/ownex-logo.svg";
  let currentLogo = null;
  let logoDirty = false;

  const frame = () => document.querySelector("#fleFrame");
  const post = (type, payload = {}) =>
    frame()?.contentWindow?.postMessage({ type, ...payload }, WEBSITE);

  const normalizeLogo = (logo = {}) => ({
    src: logo.src || logo.logoUrl || DEFAULT_LOGO,
    alt: logo.alt || logo.logoAlt || "OWNEX Commerce",
    width: logo.width || logo.logoWidth || "120px",
    href: logo.href || logo.logoHref || "/",
  });

  function homepageLogoConfig() {
    const homepage = state.content.homepage || (state.content.homepage = {});
    homepage.pageBuilder ||= { version: 1, globals: {}, sections: [] };
    homepage.pageBuilder.globals ||= {};
    homepage.pageBuilder.globals.header ||= {};
    homepage.pageBuilder.globals.header.logo ||= normalizeLogo();
    return homepage.pageBuilder.globals.header.logo;
  }

  function siteLogoConfig() {
    const site = state.content.site || (state.content.site = {});
    site.logo ||= normalizeLogo({
      src: site.logoUrl,
      alt: site.logoAlt,
      width: site.logoWidth,
      href: site.logoHref,
    });
    return site.logo;
  }

  function logoConfig() {
    const siteLogo = normalizeLogo(siteLogoConfig());
    const homepageLogo = homepageLogoConfig();
    Object.assign(homepageLogo, siteLogo);
    return siteLogo;
  }

  function updateStoredLogo(property, value) {
    const normalizedValue = String(value ?? "");
    const homepageLogo = homepageLogoConfig();
    const siteLogo = siteLogoConfig();
    homepageLogo[property] = normalizedValue;
    siteLogo[property] = normalizedValue;

    const site = state.content.site;
    site.logoUrl = siteLogo.src || DEFAULT_LOGO;
    site.logoAlt = siteLogo.alt || "OWNEX Commerce";
    site.logoWidth = siteLogo.width || "120px";
    site.logoHref = siteLogo.href || "/";

    logoDirty = true;
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
        <div class="fle-logo-note">Logo là một file ảnh. Bấm <b>Lưu & xuất bản</b> để lưu riêng cấu hình logo và kiểm tra lại từ máy chủ.</div>
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

  async function persistLogo() {
    if (!logoDirty) return;
    const expected = normalizeLogo(siteLogoConfig());
    const site = state.content.site || (state.content.site = {});

    await adminApi("/api/admin", {
      method: "PATCH",
      body: JSON.stringify({ resource: "site", id: "site", data: site }),
    });

    const bootstrap = await adminApi(`/api/public/bootstrap?logoVerify=${Date.now()}`);
    const savedSite = bootstrap?.content?.site || {};
    const saved = normalizeLogo(savedSite.logo || {
      src: savedSite.logoUrl,
      alt: savedSite.logoAlt,
      width: savedSite.logoWidth,
      href: savedSite.logoHref,
    });

    if (!saved.src || saved.src !== expected.src) {
      throw new Error("Máy chủ chưa ghi nhận logo mới. Vui lòng thử lại sau khi tải lại Admin.");
    }

    state.content.site = savedSite;
    homepageLogoConfig().src = saved.src;
    homepageLogoConfig().alt = saved.alt;
    homepageLogoConfig().width = saved.width;
    homepageLogoConfig().href = saved.href;
    logoDirty = false;
  }

  const originalSaveJsonFile = window.saveJsonFile;
  if (typeof originalSaveJsonFile === "function") {
    window.saveJsonFile = async function (...args) {
      const result = await originalSaveJsonFile.apply(this, args);
      if (logoDirty && args[0] === "content") {
        await persistLogo();
        showToast("Đã lưu giao diện và xác nhận logo mới trên máy chủ.");
      }
      return result;
    };
  }

  addEventListener("message", (event) => {
    if (event.origin !== WEBSITE || event.data?.type !== "ownex-logo:selected") return;
    const stored = logoConfig();
    currentLogo = normalizeLogo({
      src: event.data.logo?.src || stored.src,
      alt: event.data.logo?.alt || stored.alt,
      width: event.data.logo?.width || stored.width,
      href: event.data.logo?.href || stored.href,
    });
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
      showToast("Đã tải logo lên. Bấm Lưu & xuất bản để ghi vào website.");
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