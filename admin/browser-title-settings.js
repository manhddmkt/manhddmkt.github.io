(() => {
  const DEFAULT_TITLES = {
    vi: "OWNEX COMMERCE",
    en: "OWNEX COMMERCE",
  };

  function normalizeTitles(site = {}) {
    const value = site.browserTitle;
    if (value && typeof value === "object") {
      return {
        vi: String(value.vi || value.en || DEFAULT_TITLES.vi),
        en: String(value.en || value.vi || DEFAULT_TITLES.en),
      };
    }
    if (typeof value === "string" && value.trim()) {
      return { vi: value.trim(), en: value.trim() };
    }
    return {
      vi: String(site.browserTitleVi || site.siteTitle || DEFAULT_TITLES.vi),
      en: String(site.browserTitleEn || site.siteTitle || DEFAULT_TITLES.en),
    };
  }

  function storeTitles() {
    const site = state.content.site || (state.content.site = {});
    const titles = {
      vi: document.querySelector("#browserTitleViInput")?.value?.trim() || DEFAULT_TITLES.vi,
      en: document.querySelector("#browserTitleEnInput")?.value?.trim() || DEFAULT_TITLES.en,
    };
    site.browserTitle = titles;
    site.browserTitleVi = titles.vi;
    site.browserTitleEn = titles.en;
    return titles;
  }

  function updatePreview() {
    const title = document.querySelector("#browserTitleViInput")?.value?.trim() || DEFAULT_TITLES.vi;
    const node = document.querySelector("#browserTitlePreviewText");
    if (node) node.textContent = title;
  }

  function injectFields() {
    const fields = document.querySelector(".favicon-form-card .favicon-fields");
    if (!fields || document.querySelector("#browserTitleSettings")) return;

    const site = state.content.site || (state.content.site = {});
    const titles = normalizeTitles(site);
    const panel = document.createElement("div");
    panel.id = "browserTitleSettings";
    panel.className = "browser-title-settings";
    panel.innerHTML = `
      <div class="browser-title-settings__head">
        <span class="eyebrow">TIÊU ĐỀ TRÌNH DUYỆT</span>
        <h3>Dòng chữ trên tab</h3>
        <p>Tiêu đề hiển thị cạnh favicon và tự đổi theo ngôn ngữ VI/EN.</p>
      </div>
      <label class="favicon-field">
        <span>Tiêu đề tab – Tiếng Việt</span>
        <input id="browserTitleViInput" maxlength="70" value="${escapeHtml(titles.vi)}" placeholder="OWNEX COMMERCE">
      </label>
      <label class="favicon-field">
        <span>Tab title – English</span>
        <input id="browserTitleEnInput" maxlength="70" value="${escapeHtml(titles.en)}" placeholder="OWNEX COMMERCE">
      </label>`;
    fields.appendChild(panel);

    const previewCard = document.querySelector(".favicon-preview-card");
    if (previewCard && !document.querySelector("#browserTabPreview")) {
      const preview = document.createElement("div");
      preview.id = "browserTabPreview";
      preview.className = "browser-tab-preview";
      preview.innerHTML = `
        <img data-favicon-preview-image src="${escapeHtml(document.querySelector("#faviconUrlInput")?.value || "/assets/ownex-favicon.svg")}" alt="">
        <span id="browserTitlePreviewText">${escapeHtml(titles.vi)}</span>
        <b>×</b>`;
      previewCard.appendChild(preview);
    }
  }

  function installStyles() {
    if (document.querySelector("#browserTitleSettingsStyle")) return;
    const style = document.createElement("style");
    style.id = "browserTitleSettingsStyle";
    style.textContent = `
      .browser-title-settings{display:grid;gap:16px;margin-top:8px;padding-top:22px;border-top:1px solid #dce6f2}
      .browser-title-settings__head h3{margin:4px 0 6px;color:#0b2342;font-size:20px}
      .browser-title-settings__head p{margin:0;color:#6e819a;line-height:1.5}
      .browser-tab-preview{margin:22px auto 0;max-width:300px;height:46px;padding:0 14px;display:flex;align-items:center;gap:10px;border-radius:14px;background:#e7f1df;color:#24352a;box-shadow:0 5px 14px rgba(36,53,42,.1);text-align:left}
      .browser-tab-preview img{width:20px;height:20px;object-fit:contain;flex:none}
      .browser-tab-preview span{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:14px;flex:1}
      .browser-tab-preview b{font-size:20px;font-weight:400}
    `;
    document.head.appendChild(style);
  }

  document.addEventListener("input", (event) => {
    if (!event.target.matches("#browserTitleViInput,#browserTitleEnInput")) return;
    storeTitles();
    updatePreview();
  });

  document.addEventListener(
    "click",
    (event) => {
      if (event.target.closest("#faviconSaveButton")) storeTitles();
    },
    true,
  );

  installStyles();
  new MutationObserver(injectFields).observe(document.body, {
    childList: true,
    subtree: true,
  });
  injectFields();
})();
