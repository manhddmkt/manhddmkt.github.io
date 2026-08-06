(() => {
  const WEBSITE = "https://ownex-commerce.pages.dev";
  const API = "https://ownex-commerce-admin.manhddmkt.chatgpt.site";
  let currentLogo = null;

  const frame = () => document.querySelector("#fleFrame");
  const post = (type, payload = {}) =>
    frame()?.contentWindow?.postMessage({ type, ...payload }, WEBSITE);

  function logoInspector(logo) {
    const isImage = logo.mode === "image";
    const preview = isImage && logo.src
      ? `<img src="${escapeHtml(logo.src)}" alt="${escapeHtml(logo.alt || "")}">`
      : `<div class="fle-logo-text-preview"><b>${escapeHtml(logo.main || "OWNEX")}</b><small>${escapeHtml(logo.sub || "COMMERCE")}</small></div>`;

    return `
      <div class="fle-selection-title">
        <div><span>LOGO</span><h3>Logo website</h3></div>
        <button type="button" class="fle-close-selection" data-logo-close aria-label="Bỏ chọn">×</button>
      </div>
      <div class="fle-logo-preview">${preview}</div>
      <div class="fle-tabs">
        <button type="button" class="active">Nội dung</button>
      </div>
      <div class="fle-tab-panel active">
        <div class="fle-form-grid">
          <label class="wide"><span>Loại logo</span>
            <select data-logo-property="mode">
              <option value="image" ${isImage ? "selected" : ""}>Logo hình ảnh</option>
              <option value="text" ${!isImage ? "selected" : ""}>Logo chữ</option>
            </select>
          </label>

          <div class="fle-logo-image-fields wide ${isImage ? "" : "is-hidden"}" data-logo-image-fields>
            <label><span>Tải logo mới</span><input id="fleLogoUpload" type="file" accept="image/png,image/jpeg,image/webp"></label>
            <button type="button" class="secondary-button" data-logo-upload>Tải lên & sử dụng</button>
            <small>PNG, JPG hoặc WebP · tối đa 5 MB</small>
          </div>

          <label class="wide ${isImage ? "" : "is-hidden"}" data-logo-image-field><span>Đường dẫn ảnh logo</span><input data-logo-property="src" value="${escapeHtml(logo.src || "")}" placeholder="/assets/logo.png"></label>
          <label class="wide ${isImage ? "" : "is-hidden"}" data-logo-image-field><span>Alt text</span><input data-logo-property="alt" value="${escapeHtml(logo.alt || "OWNEX Commerce")}"></label>
          <label class="wide ${isImage ? "" : "is-hidden"}" data-logo-image-field><span>Chiều rộng logo</span><input data-logo-property="width" value="${escapeHtml(logo.width || "120px")}" placeholder="120px"></label>

          <label class="wide ${!isImage ? "" : "is-hidden"}" data-logo-text-field><span>Dòng chính</span><input data-logo-property="main" value="${escapeHtml(logo.main || "OWNEX")}"></label>
          <label class="wide ${!isImage ? "" : "is-hidden"}" data-logo-text-field><span>Dòng phụ</span><input data-logo-property="sub" value="${escapeHtml(logo.sub || "COMMERCE")}"></label>

          <label class="wide"><span>Đường dẫn khi bấm logo</span><input data-logo-property="href" value="${escapeHtml(logo.href || "/")}" placeholder="/"></label>
        </div>
        <div class="fle-logo-note">Bấm <b>Lưu & xuất bản</b> ở thanh trên cùng để áp dụng logo cho toàn website.</div>
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
    currentLogo = event.data.logo || null;
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
    post("ownex-logo:mutate", { property, value: input.value });
    if (property === "mode") setTimeout(renderLogoInspector, 80);
  });

  document.addEventListener("input", (event) => {
    const input = event.target.closest?.("[data-logo-property]");
    if (!input || !currentLogo || input.tagName === "SELECT") return;
    const property = input.dataset.logoProperty;
    currentLogo[property] = input.value;
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
      currentLogo ||= {};
      currentLogo.mode = "image";
      currentLogo.src = url;
      post("ownex-logo:mutate", { property: "mode", value: "image" });
      post("ownex-logo:mutate", { property: "src", value: url });
      showToast("Đã tải logo lên và áp dụng trong bản xem trước.");
      setTimeout(() => post("ownex-logo:select"), 120);
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
