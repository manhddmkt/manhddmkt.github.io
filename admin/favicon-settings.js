(() => {
  const DEFAULT_FAVICON = "/assets/ownex-favicon.svg";
  let draft = { src: DEFAULT_FAVICON, alt: "OWNEX" };
  let selectedFile = null;
  let objectUrl = "";

  function normalizeFavicon(value = {}) {
    return {
      src: value.src || value.faviconUrl || DEFAULT_FAVICON,
      alt: value.alt || value.faviconAlt || "OWNEX",
    };
  }

  function currentFavicon() {
    const site = state.content.site || (state.content.site = {});
    const favicon = normalizeFavicon(
      site.favicon || {
        src: site.faviconUrl,
        alt: site.faviconAlt,
      },
    );
    site.favicon = { ...favicon };
    site.faviconUrl = favicon.src;
    site.faviconAlt = favicon.alt;
    return favicon;
  }

  function clearObjectUrl() {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    objectUrl = "";
  }

  function setStatus(message = "", type = "") {
    const node = document.querySelector("#faviconStatus");
    if (!node) return;
    node.textContent = message;
    node.className = `favicon-status${type ? ` is-${type}` : ""}`;
  }

  function previewSource() {
    return objectUrl || draft.src || DEFAULT_FAVICON;
  }

  function updatePreview() {
    const image = document.querySelector("#faviconPreviewImage");
    if (image) {
      image.src = previewSource();
      image.alt = draft.alt || "OWNEX";
    }
  }

  async function inspectSquareImage(file) {
    if (!file || file.type.includes("svg") || file.type.includes("icon")) {
      return { valid: true, message: "Định dạng vector/ICO sẽ được trình duyệt tự co về ô vuông." };
    }

    const url = URL.createObjectURL(file);
    try {
      const dimensions = await new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
        image.onerror = () => reject(new Error("Không đọc được kích thước ảnh."));
        image.src = url;
      });
      const valid = dimensions.width === dimensions.height;
      return {
        valid,
        message: `${dimensions.width} × ${dimensions.height}px${valid ? " · ảnh vuông" : " · ảnh chưa vuông"}`,
      };
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  function renderFaviconView() {
    draft = { ...currentFavicon() };
    selectedFile = null;
    clearObjectUrl();

    document.querySelector("#viewTitle").textContent = "Biểu tượng tab";
    document.querySelector("#viewSubtitle").textContent =
      "Tải favicon vuông riêng cho tab trình duyệt và thiết bị.";

    contentRoot.innerHTML = `
      <section class="favicon-settings">
        <div class="favicon-settings__grid">
          <article class="favicon-preview-card">
            <span class="eyebrow">XEM TRƯỚC</span>
            <h3>Biểu tượng tab</h3>
            <p>Ảnh này hiển thị trong ô vuông nhỏ trên tab trình duyệt.</p>
            <div class="favicon-preview-box">
              <img id="faviconPreviewImage" src="${escapeHtml(draft.src)}" alt="${escapeHtml(draft.alt)}">
            </div>
            <span class="favicon-size-note">✓ Khuyến nghị 512 × 512 px</span>
          </article>

          <article class="favicon-form-card">
            <span class="eyebrow">FAVICON RIÊNG</span>
            <h3>Tải ảnh vuông</h3>
            <p>Không dùng logo ngang của Header. Hãy chọn PNG, WebP, SVG hoặc ICO có tỷ lệ 1:1.</p>

            <div class="favicon-upload-zone">
              <label>
                <span>Chọn ảnh favicon</span>
                <input id="faviconFileInput" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml,image/x-icon,.ico">
              </label>
              <small id="faviconDimensionNote">Tối đa 5 MB.</small>
            </div>

            <div class="favicon-fields">
              <label class="favicon-field">
                <span>Đường dẫn favicon</span>
                <input id="faviconUrlInput" value="${escapeHtml(draft.src)}" placeholder="/assets/favicon.png">
              </label>
              <label class="favicon-field">
                <span>Mô tả biểu tượng</span>
                <input id="faviconAltInput" value="${escapeHtml(draft.alt)}" placeholder="OWNEX">
              </label>
            </div>

            <div class="favicon-actions">
              <button type="button" class="primary-button" id="faviconSaveButton">Tải lên & lưu favicon</button>
              <button type="button" class="secondary-button" id="faviconResetButton">Dùng biểu tượng mặc định</button>
            </div>
            <div class="favicon-status" id="faviconStatus" aria-live="polite"></div>
          </article>
        </div>
      </section>`;

    bindFaviconEvents();
  }

  async function uploadFile(file) {
    if (!file) return draft.src;
    if (file.size > 5 * 1024 * 1024) {
      throw new Error("Favicon vượt quá giới hạn 5 MB.");
    }

    const form = new FormData();
    form.append("file", file);
    form.append("altText", draft.alt || file.name.replace(/\.[^.]+$/, ""));
    const payload = await adminApi("/api/admin/media", {
      method: "POST",
      body: form,
    });
    return new URL(payload.url, CONFIG.apiBase).href;
  }

  async function saveFavicon() {
    const button = document.querySelector("#faviconSaveButton");
    button.disabled = true;
    setStatus("Đang tải và lưu favicon...");

    try {
      const alt = document.querySelector("#faviconAltInput")?.value?.trim() || "OWNEX";
      let src = document.querySelector("#faviconUrlInput")?.value?.trim() || DEFAULT_FAVICON;
      draft.alt = alt;

      if (selectedFile) src = await uploadFile(selectedFile);
      draft.src = src;

      const site = state.content.site || (state.content.site = {});
      site.favicon = { src: draft.src, alt: draft.alt };
      site.faviconUrl = draft.src;
      site.faviconAlt = draft.alt;

      await adminApi("/api/admin", {
        method: "PATCH",
        body: JSON.stringify({ resource: "site", id: "site", data: site }),
      });

      const bootstrap = await adminApi(`/api/public/bootstrap?faviconVerify=${Date.now()}`);
      const savedSite = bootstrap?.content?.site || {};
      const saved = normalizeFavicon(
        savedSite.favicon || {
          src: savedSite.faviconUrl,
          alt: savedSite.faviconAlt,
        },
      );

      if (saved.src !== draft.src) {
        throw new Error("Máy chủ chưa ghi nhận favicon mới.");
      }

      state.content.site = savedSite;
      selectedFile = null;
      clearObjectUrl();
      document.querySelector("#faviconUrlInput").value = saved.src;
      updatePreview();
      setStatus("Đã lưu favicon riêng thành công.", "success");
      showToast("Đã lưu biểu tượng tab và đồng bộ với website.");
    } catch (error) {
      setStatus(error.message || "Không thể lưu favicon.", "error");
    } finally {
      button.disabled = false;
    }
  }

  function bindFaviconEvents() {
    document.querySelector("#faviconFileInput")?.addEventListener("change", async (event) => {
      const file = event.target.files?.[0] || null;
      selectedFile = file;
      clearObjectUrl();
      setStatus("");

      if (!file) {
        updatePreview();
        return;
      }

      objectUrl = URL.createObjectURL(file);
      updatePreview();
      const note = document.querySelector("#faviconDimensionNote");

      try {
        const result = await inspectSquareImage(file);
        note.textContent = `${result.message} · ${(file.size / 1024).toFixed(0)} KB`;
        note.style.color = result.valid ? "#148458" : "#c77a00";
        if (!result.valid) {
          setStatus("Ảnh không vuông. Nên cắt về tỷ lệ 1:1 trước khi lưu.", "error");
        }
      } catch (error) {
        note.textContent = error.message;
        note.style.color = "#c63838";
      }
    });

    document.querySelector("#faviconUrlInput")?.addEventListener("input", (event) => {
      if (selectedFile) return;
      draft.src = event.target.value.trim() || DEFAULT_FAVICON;
      updatePreview();
    });

    document.querySelector("#faviconAltInput")?.addEventListener("input", (event) => {
      draft.alt = event.target.value;
      updatePreview();
    });

    document.querySelector("#faviconSaveButton")?.addEventListener("click", saveFavicon);

    document.querySelector("#faviconResetButton")?.addEventListener("click", () => {
      selectedFile = null;
      clearObjectUrl();
      draft = { src: DEFAULT_FAVICON, alt: "OWNEX" };
      document.querySelector("#faviconUrlInput").value = draft.src;
      document.querySelector("#faviconAltInput").value = draft.alt;
      document.querySelector("#faviconFileInput").value = "";
      document.querySelector("#faviconDimensionNote").textContent = "Tối đa 5 MB.";
      updatePreview();
      setStatus("Bấm “Tải lên & lưu favicon” để áp dụng biểu tượng mặc định.");
    });
  }

  function openFaviconView(event) {
    event?.preventDefault();
    event?.stopPropagation();
    document.querySelectorAll("#adminNav button").forEach((button) =>
      button.classList.toggle("active", button.id === "faviconNavButton"),
    );
    state.view = "favicon";
    renderFaviconView();
  }

  function installNavigation() {
    const nav = document.querySelector("#adminNav");
    if (!nav || document.querySelector("#faviconNavButton")) return;

    const button = document.createElement("button");
    button.type = "button";
    button.id = "faviconNavButton";
    button.innerHTML = "<span>◩</span>Biểu tượng tab";
    button.addEventListener("click", openFaviconView, true);

    const settingsButton = nav.querySelector('[data-view="settings"]');
    nav.insertBefore(button, settingsButton || null);
  }

  document.addEventListener("click", (event) => {
    const regularNavButton = event.target.closest?.("#adminNav button[data-view]");
    if (regularNavButton) {
      document.querySelector("#faviconNavButton")?.classList.remove("active");
    }
  });

  installNavigation();
  new MutationObserver(installNavigation).observe(document.body, {
    childList: true,
    subtree: true,
  });
})();
