(() => {
  const WEBSITE = "https://ownex-commerce.pages.dev";
  const API = "https://ownex-commerce-admin.manhddmkt.chatgpt.site";
  const DEFAULT_LOGO = "/assets/ownex-logo.svg";
  const DEFAULT_FAVICON = "/assets/ownex-favicon.svg";
  let currentLogo = null;
  let settingsDirty = false;

  const frame = () => document.querySelector("#fleFrame");
  const post = (type, payload = {}) =>
    frame()?.contentWindow?.postMessage({ type, ...payload }, WEBSITE);

  const normalizeLogo = (logo = {}) => ({
    src: logo.src || logo.logoUrl || DEFAULT_LOGO,
    alt: logo.alt || logo.logoAlt || "OWNEX Commerce",
    width: logo.width || logo.logoWidth || "120px",
    href: logo.href || logo.logoHref || "/",
  });

  const normalizeFavicon = (favicon = {}) => ({
    src: favicon.src || favicon.faviconUrl || DEFAULT_FAVICON,
    alt: favicon.alt || favicon.faviconAlt || "OWNEX",
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

  function siteFaviconConfig() {
    const site = state.content.site || (state.content.site = {});
    site.favicon ||= normalizeFavicon({
      src: site.faviconUrl,
      alt: site.faviconAlt,
    });
    return site.favicon;
  }

  function logoConfig() {
    const siteLogo = normalizeLogo(siteLogoConfig());
    Object.assign(homepageLogoConfig(), siteLogo);
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
    settingsDirty = true;
  }

  function updateStoredFavicon(property, value) {
    const favicon = siteFaviconConfig();
    favicon[property] = String(value ?? "");
    const site = state.content.site;
    site.faviconUrl = favicon.src || DEFAULT_FAVICON;
    site.faviconAlt = favicon.alt || "OWNEX";
    settingsDirty = true;
  }

  function logoInspector(logo) {
    const src = logo.src || DEFAULT_LOGO;
    const favicon = normalizeFavicon(siteFaviconConfig());
    return `
      <div class="fle-selection-title">
        <div><span>NHẬN DIỆN</span><h3>Logo & favicon</h3></div>
        <button type="button" class="fle-close-selection" data-logo-close aria-label="Bỏ chọn">×</button>
      </div>
      <div class="fle-logo-preview"><img src="${escapeHtml(src)}" alt="${escapeHtml(logo.alt || "OWNEX Commerce")}"></div>
      <div class="fle-tabs"><button type="button" class="active">Logo Header</button></div>
      <div class="fle-tab-panel active">
        <div class="fle-form-grid">
          <div class="fle-logo-image-fields wide">
            <label><span>Thay ảnh logo ngang</span><input id="fleLogoUpload" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml"></label>
            <button type="button" class="secondary-button" data-logo-upload>Tải lên & sử dụng</button>
            <small>Logo dùng trên Header · tối đa 5 MB</small>
          </div>
          <label class="wide"><span>Đường dẫn ảnh logo</span><input data-logo-property="src" value="${escapeHtml(src)}"></label>
          <label class="wide"><span>Mô tả ảnh</span><input data-logo-property="alt" value="${escapeHtml(logo.alt || "OWNEX Commerce")}"></label>
          <label class="wide"><span>Chiều rộng logo</span><input data-logo-property="width" value="${escapeHtml(logo.width || "120px")}"></label>
          <label class="wide"><span>Đường dẫn khi bấm logo</span><input data-logo-property="href" value="${escapeHtml(logo.href || "/")}"></label>
        </div>
      </div>
      <div class="fle-tabs" style="margin-top:22px"><button type="button" class="active">Biểu tượng tab</button></div>
      <div class="fle-tab-panel active">
        <div class="fle-logo-preview" style="width:128px;height:128px;margin:0 auto 16px;padding:14px"><img src="${escapeHtml(favicon.src)}" alt="${escapeHtml(favicon.alt)}" style="width:100%;height:100%;object-fit:contain"></div>
        <div class="fle-form-grid">
          <div class="fle-logo-image-fields wide">
            <label><span>Tải favicon vuông</span><input id="fleFaviconUpload" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml,image/x-icon"></label>
            <button type="button" class="secondary-button" data-favicon-upload>Tải lên & sử dụng</button>
            <small>Ảnh vuông riêng, nên dùng 512×512 px · tối đa 5 MB</small>
          </div>
          <label class="wide"><span>Đường dẫn favicon</span><input data-favicon-property="src" value="${escapeHtml(favicon.src)}"></label>
          <label class="wide"><span>Mô tả favicon</span><input data-favicon-property="alt" value="${escapeHtml(favicon.alt)}"></label>
        </div>
        <div class="fle-logo-note">Logo Header và favicon được lưu độc lập. Favicon không dùng ảnh logo ngang.</div>
      </div>`;
  }

  function renderLogoInspector() {
    const root = document.querySelector("#fleInspector");
    if (root && currentLogo) root.innerHTML = logoInspector(currentLogo);
  }

  function enableLogoBridge() { post("ownex-logo:enable"); }

  async function uploadAsset(file, label) {
    if (!file) throw new Error(`Hãy chọn file ${label}.`);
    if (file.size > 5 * 1024 * 1024) throw new Error(`${label} vượt quá giới hạn 5 MB.`);
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
    if (!response.ok) throw new Error(payload.error || `Không thể tải ${label} lên.`);
    return new URL(payload.url, API).href;
  }

  async function persistBrandSettings() {
    if (!settingsDirty) return;
    const expectedLogo = normalizeLogo(siteLogoConfig());
    const expectedFavicon = normalizeFavicon(siteFaviconConfig());
    const site = state.content.site || (state.content.site = {});

    await adminApi("/api/admin", {
      method: "PATCH",
      body: JSON.stringify({ resource: "site", id: "site", data: site }),
    });

    const bootstrap = await adminApi(`/api/public/bootstrap?brandVerify=${Date.now()}`);
    const savedSite = bootstrap?.content?.site || {};
    const savedLogo = normalizeLogo(savedSite.logo || {
      src: savedSite.logoUrl, alt: savedSite.logoAlt,
      width: savedSite.logoWidth, href: savedSite.logoHref,
    });
    const savedFavicon = normalizeFavicon(savedSite.favicon || {
      src: savedSite.faviconUrl, alt: savedSite.faviconAlt,
    });

    if (savedLogo.src !== expectedLogo.src || savedFavicon.src !== expectedFavicon.src) {
      throw new Error("Máy chủ chưa ghi nhận đầy đủ logo hoặc favicon mới.");
    }

    state.content.site = savedSite;
    Object.assign(homepageLogoConfig(), savedLogo);
    settingsDirty = false;
  }

  const originalSaveJsonFile = window.saveJsonFile;
  if (typeof originalSaveJsonFile === "function") {
    window.saveJsonFile = async function (...args) {
      const result = await originalSaveJsonFile.apply(this, args);
      if (settingsDirty && args[0] === "content") {
        await persistBrandSettings();
        showToast("Đã lưu logo Header và favicon riêng trên máy chủ.");
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

  document.addEventListener("load", (event) => {
    if (event.target.id === "fleFrame") setTimeout(enableLogoBridge, 220);
  }, true);

  document.addEventListener("input", (event) => {
    const logoInput = event.target.closest?.("[data-logo-property]");
    if (logoInput && currentLogo) {
      const property = logoInput.dataset.logoProperty;
      currentLogo[property] = logoInput.value;
      updateStoredLogo(property, logoInput.value);
      clearTimeout(logoInput._timer);
      logoInput._timer = setTimeout(() => post("ownex-logo:mutate", { property, value: logoInput.value }), 180);
      return;
    }
    const faviconInput = event.target.closest?.("[data-favicon-property]");
    if (faviconInput) updateStoredFavicon(faviconInput.dataset.faviconProperty, faviconInput.value);
  });

  document.addEventListener("click", async (event) => {
    if (event.target.closest("[data-logo-close]")) {
      currentLogo = null;
      const root = document.querySelector("#fleInspector");
      if (root) root.innerHTML = `<div class="fle-inspector-empty"><div>↖</div><h3>Chọn một phần tử</h3><p>Bấm trực tiếp vào chữ, ảnh, nút hoặc logo trên trang để chỉnh sửa.</p></div>`;
      return;
    }

    const logoUpload = event.target.closest("[data-logo-upload]");
    const faviconUpload = event.target.closest("[data-favicon-upload]");
    if (!logoUpload && !faviconUpload) return;
    const button = logoUpload || faviconUpload;
    button.disabled = true;
    try {
      if (logoUpload) {
        const file = document.querySelector("#fleLogoUpload")?.files?.[0];
        const url = await uploadAsset(file, "logo");
        currentLogo ||= logoConfig();
        currentLogo.src = url;
        currentLogo.alt = file.name.replace(/\.[^.]+$/, "") || "OWNEX Commerce";
        updateStoredLogo("src", url);
        updateStoredLogo("alt", currentLogo.alt);
        post("ownex-logo:mutate", { property: "src", value: url });
        post("ownex-logo:mutate", { property: "alt", value: currentLogo.alt });
        showToast("Đã tải logo Header lên.");
      } else {
        const file = document.querySelector("#fleFaviconUpload")?.files?.[0];
        const url = await uploadAsset(file, "favicon");
        updateStoredFavicon("src", url);
        updateStoredFavicon("alt", file.name.replace(/\.[^.]+$/, "") || "OWNEX");
        showToast("Đã tải favicon vuông lên.");
      }
      renderLogoInspector();
    } catch (error) {
      showToast(`Không thể tải ảnh: ${error.message}`);
    } finally {
      button.disabled = false;
    }
  });

  const observer = new MutationObserver(() => {
    if (document.querySelector("#fleFrame")) enableLogoBridge();
  });
  observer.observe(document.body, { childList: true, subtree: true });
})();