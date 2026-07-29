const CONFIG = {
  apiBase: "https://ownex-commerce-admin.manhddmkt.chatgpt.site",
};

const TITLES = {
  dashboard: ["Tổng quan", "Theo dõi và quản lý nội dung website."],
  homepage: ["Nội dung trang chủ", "Chỉnh sửa các nội dung chính đang hiển thị."],
  products: ["Sản phẩm", "Quản lý 148 sản phẩm đồng bộ với Catalog."],
  categories: ["Danh mục", "Sắp xếp nhóm chính và danh mục con."],
  posts: ["Bài viết", "Quản lý nội dung Blog và tài nguyên."],
  media: ["Thư viện ảnh", "Tải ảnh lên và dùng lại trên website."],
  settings: ["Cài đặt website", "Quản lý thông tin chung và cấu hình Catalog."],
};

const state = {
  token: sessionStorage.getItem("ownex_admin_session") || "",
  user: null,
  view: "dashboard",
  content: { homepage: {}, site: {} },
  products: [],
  posts: [],
  categories: { groups: [] },
  editing: null,
};

const loginScreen = document.querySelector("#loginScreen");
const adminShell = document.querySelector("#adminShell");
const contentRoot = document.querySelector("#content");
const toast = document.querySelector("#toast");
const editorDialog = document.querySelector("#editorDialog");
const editorForm = document.querySelector("#editorForm");

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function slugify(value = "") {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’']/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.remove("is-hidden");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.add("is-hidden"), 3600);
}

async function adminApi(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (state.token) headers.Authorization = `Bearer ${state.token}`;
  if (options.body && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  const response = await fetch(`${CONFIG.apiBase}${path}`, {
    ...options,
    headers,
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    if (response.status === 401 && path !== "/api/auth/login") {
      sessionStorage.removeItem("ownex_admin_session");
      state.token = "";
    }
    throw new Error(payload.error || `Máy chủ trả về lỗi ${response.status}`);
  }
  return response.status === 204 ? null : response.json();
}

async function saveJsonFile(key, value, message) {
  let payload;
  if (key === "content") {
    const resource = message.toLowerCase().includes("homepage")
      ? "homepage"
      : "site";
    payload = { resource, id: resource, data: value[resource] };
  } else if (key === "products") {
    const item = value.products.find(
      (product) => Number(product.id) === Number(state.editing?.id),
    );
    payload = {
      resource: "products",
      id: item.id,
      data: {
        ...item,
        imageUrl: item.images?.[0]?.src || "",
        imageAlt: item.images?.[0]?.alt || item.name,
      },
    };
  } else if (key === "posts") {
    const item = value.posts[state.editing?.index];
    payload = {
      resource: "posts",
      id: item.id,
      data: { ...item, publishedAt: item.date, imageUrl: item.image },
    };
  } else {
    payload = { resource: "categories-bulk", id: "all", data: value };
  }
  await adminApi("/api/admin", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  showToast("Đã lưu và đồng bộ với website.");
}

async function loadAll() {
  const payload = await adminApi("/api/public/bootstrap");
  state.content = payload.content || { homepage: {}, site: {} };
  state.products = payload.products || [];
  state.posts = payload.posts || [];
  const rows = payload.categories || [];
  const parents = rows.filter((item) => !item.parent_slug);
  state.categories = {
    groups: parents.map((parent) => ({
      name: parent.name,
      children: rows
        .filter((item) => item.parent_slug === parent.slug)
        .map((item) => item.name),
    })),
  };
}

async function connect(username, password) {
  const result = await adminApi("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
  state.token = result.token;
  state.user = result.user;
  sessionStorage.setItem("ownex_admin_session", state.token);
  await loadAll();
  loginScreen.classList.add("is-hidden");
  adminShell.classList.remove("is-hidden");
  document.querySelector("#profileName").textContent =
    state.user?.displayName || "Quản trị viên";
  if (state.user?.mustChangePassword) {
    state.view = "settings";
    showToast("Hãy đổi mật khẩu tạm thời trong phần Cài đặt website.");
  }
  render();
  resetIdleTimer();
}

function metric(label, value, note) {
  return `<article class="metric-card"><span>${label}</span><strong>${value}</strong><small>${note}</small></article>`;
}

function dashboardView() {
  const categoryCount = state.categories.groups.reduce(
    (total, group) => total + 1 + (group.children || []).length,
    0,
  );
  return `
    <section class="metric-grid">
      ${metric("Sản phẩm", state.products.length, "Đồng bộ Catalog")}
      ${metric("Danh mục", categoryCount, `${state.categories.groups.length} nhóm chính`)}
      ${metric("Bài viết", state.posts.length, "Đang xuất bản")}
      ${metric("Hiển thị Catalog", `${state.content.site.catalogColumns || 4} cột`, `${state.content.site.catalogPageSize || 64} sản phẩm/trang`)}
    </section>
    <section class="panel">
      <div class="panel-head">
        <div><span class="eyebrow">THAO TÁC NHANH</span><h2>Chỉnh sửa nội dung</h2></div>
      </div>
      <div class="panel-body quick-grid">
        <button class="quick-card" data-go="homepage"><b>Trang chủ</b><span>Tiêu đề, mô tả và các nút hành động.</span></button>
        <button class="quick-card" data-go="products"><b>Catalog sản phẩm</b><span>Tên, giá, ảnh và mô tả sản phẩm.</span></button>
        <button class="quick-card" data-go="posts"><b>Blog</b><span>Bài viết và nội dung tài nguyên.</span></button>
      </div>
    </section>
    <section class="panel">
      <div class="panel-head">
        <div><span class="eyebrow">TRẠNG THÁI</span><h2>Website đã kết nối</h2><p>Mỗi lần lưu sẽ tạo một phiên bản trên GitHub và Cloudflare tự triển khai lại.</p></div>
        <span class="status">Sẵn sàng</span>
      </div>
    </section>`;
}

function field(label, name, value, options = {}) {
  const classes = options.wide ? "wide" : "";
  const safe = escapeHtml(value ?? "");
  if (options.type === "textarea") {
    return `<label class="${classes}"><span>${label}</span><textarea name="${name}">${safe}</textarea></label>`;
  }
  if (options.type === "number") {
    return `<label class="${classes}"><span>${label}</span><input name="${name}" type="number" value="${safe}" min="${options.min ?? 0}" max="${options.max ?? 999}" step="${options.step ?? 1}" /></label>`;
  }
  return `<label class="${classes}"><span>${label}</span><input name="${name}" type="${options.type || "text"}" value="${safe}" /></label>`;
}

function homepageView() {
  const h = state.content.homepage;
  return `
    <section class="panel">
      <div class="panel-head"><div><span class="eyebrow">TRANG CHỦ</span><h2>Hero và thông điệp chính</h2></div></div>
      <form class="panel-body form-grid" id="homepageForm">
        ${field("Nhãn phía trên", "heroEyebrow", h.heroEyebrow, { wide: true })}
        ${field("Tiêu đề chính", "heroTitle", h.heroTitle)}
        ${field("Dòng nhấn màu xanh", "heroAccent", h.heroAccent)}
        ${field("Mô tả", "heroDescription", h.heroDescription, { type: "textarea", wide: true })}
        ${field("Nút chính", "primaryCtaLabel", h.primaryCtaLabel)}
        ${field("Đường dẫn nút chính", "primaryCtaUrl", h.primaryCtaUrl)}
        ${field("Nút phụ", "secondaryCtaLabel", h.secondaryCtaLabel)}
        ${field("Đường dẫn nút phụ", "secondaryCtaUrl", h.secondaryCtaUrl)}
        ${field("Tiêu đề khối danh mục", "categoryTitle", h.categoryTitle, { wide: true })}
        ${field("Mô tả khối danh mục", "categoryDescription", h.categoryDescription, { type: "textarea", wide: true })}
        ${field("Tiêu đề câu chuyện", "storyTitle", h.storyTitle, { wide: true })}
        ${field("Mô tả câu chuyện", "storyDescription", h.storyDescription, { type: "textarea", wide: true })}
        ${field("CTA cuối trang", "finalCtaTitle", h.finalCtaTitle, { wide: true })}
        ${field("Nhãn nút cuối trang", "finalCtaLabel", h.finalCtaLabel)}
        ${field("Đường dẫn", "finalCtaUrl", h.finalCtaUrl)}
        <div class="form-actions"><button class="primary-button" type="submit">Lưu trang chủ</button></div>
      </form>
    </section>`;
}

function productCategory(product) {
  return product.categories?.[0]?.name || "In New";
}

function productsView(query = "") {
  const normalized = query.toLowerCase();
  const items = state.products.filter((product) =>
    [product.name, product.sku, product.slug, productCategory(product)]
      .join(" ")
      .toLowerCase()
      .includes(normalized),
  );
  return `
    <section class="panel">
      <div class="panel-head">
        <div><span class="eyebrow">CATALOG</span><h2>${state.products.length} sản phẩm</h2><p>Chỉnh sửa tên, giá, hình ảnh và mô tả.</p></div>
        <div class="toolbar"><input id="productSearch" type="search" placeholder="Tìm tên hoặc SKU..." value="${escapeHtml(query)}" /></div>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>SẢN PHẨM</th><th>DANH MỤC</th><th>GIÁ</th><th>TRẠNG THÁI</th><th></th></tr></thead>
          <tbody>
            ${items
              .map(
                (product) => `
                  <tr>
                    <td><div class="product-cell"><img src="${escapeHtml(product.images?.[0]?.src || "")}" alt="" /><div><b>${escapeHtml(product.name)}</b><small>${escapeHtml(product.sku || product.slug)}</small></div></div></td>
                    <td>${escapeHtml(productCategory(product))}</td>
                    <td><b>${escapeHtml(product.currencySymbol || "$")}${Number(product.price || 0).toFixed(2)}</b></td>
                    <td><span class="status">Đang hiển thị</span></td>
                    <td><button class="text-button" data-edit-product="${product.id}">Chỉnh sửa</button></td>
                  </tr>`,
              )
              .join("")}
          </tbody>
        </table>
      </div>
    </section>`;
}

function categoriesView() {
  return `
    <section class="panel">
      <div class="panel-head">
        <div><span class="eyebrow">CẤU TRÚC CATALOG</span><h2>Danh mục sản phẩm</h2><p>Mỗi danh mục con đặt trên một dòng.</p></div>
      </div>
      <form class="panel-body" id="categoriesForm">
        <div class="category-grid">
          ${state.categories.groups
            .map(
              (group, index) => `
                <div class="category-card">
                  <label><span>Tên nhóm chính</span><input name="group-${index}" value="${escapeHtml(group.name)}" /></label>
                  <label><span>Danh mục con</span><textarea name="children-${index}">${escapeHtml((group.children || []).join("\n"))}</textarea></label>
                </div>`,
            )
            .join("")}
        </div>
        <div class="form-actions"><button class="primary-button" type="submit">Lưu danh mục</button></div>
      </form>
    </section>`;
}

function postsView(query = "") {
  const normalized = query.toLowerCase();
  const items = state.posts.filter((post) =>
    [post.title, post.slug, post.excerpt].join(" ").toLowerCase().includes(normalized),
  );
  return `
    <section class="panel">
      <div class="panel-head">
        <div><span class="eyebrow">BLOG</span><h2>${state.posts.length} bài viết</h2><p>Quản lý tiêu đề, ảnh và nội dung mô tả.</p></div>
        <div class="toolbar"><input id="postSearch" type="search" placeholder="Tìm bài viết..." value="${escapeHtml(query)}" /></div>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>BÀI VIẾT</th><th>NGÀY</th><th>TRẠNG THÁI</th><th></th></tr></thead>
          <tbody>
            ${items
              .map(
                (post, index) => `
                  <tr>
                    <td><div class="product-cell post-cell"><img src="${escapeHtml(post.image || "")}" alt="" /><div><b>${escapeHtml(post.title)}</b><small>${escapeHtml(post.slug)}</small></div></div></td>
                    <td>${escapeHtml(String(post.date || "").slice(0, 10))}</td>
                    <td><span class="status">Đang hiển thị</span></td>
                    <td><button class="text-button" data-edit-post="${index}">Chỉnh sửa</button></td>
                  </tr>`,
              )
              .join("")}
          </tbody>
        </table>
      </div>
    </section>`;
}

function mediaView() {
  return `
    <section class="panel">
      <div class="panel-head"><div><span class="eyebrow">THƯ VIỆN ẢNH</span><h2>Tải ảnh lên website</h2><p>Ảnh được lưu trong repo và tự đồng bộ qua Cloudflare.</p></div></div>
      <div class="panel-body">
        <form class="upload-zone" id="uploadForm">
          <div>
            <h3>Chọn một ảnh để tải lên</h3>
            <p>PNG, JPG hoặc WebP · tối đa 5 MB</p>
            <input id="mediaFile" type="file" accept="image/png,image/jpeg,image/webp" required />
            <div style="margin-top:14px"><button class="primary-button" type="submit">Tải ảnh lên</button></div>
          </div>
        </form>
        <div id="uploadResult"></div>
      </div>
    </section>`;
}

function settingsView() {
  const s = state.content.site;
  return `
    <section class="panel">
      <div class="panel-head"><div><span class="eyebrow">CÀI ĐẶT</span><h2>Thông tin website</h2></div></div>
      <form class="panel-body form-grid" id="settingsForm">
        ${field("Tên website", "siteName", s.siteName)}
        ${field("Email liên hệ", "email", s.email, { type: "email" })}
        ${field("Số điện thoại", "phone", s.phone)}
        ${field("Nhãn nút Header", "headerCtaLabel", s.headerCtaLabel)}
        ${field("Đường dẫn nút Header", "headerCtaUrl", s.headerCtaUrl)}
        ${field("Mô tả Footer", "footerDescription", s.footerDescription, { type: "textarea", wide: true })}
        ${field("Sản phẩm mỗi trang", "catalogPageSize", s.catalogPageSize || 64, { type: "number", min: 4, max: 100 })}
        ${field("Số cột Catalog", "catalogColumns", s.catalogColumns || 4, { type: "number", min: 2, max: 5 })}
        <div class="form-actions"><button class="primary-button" type="submit">Lưu cài đặt</button></div>
      </form>
    </section>
    <section class="panel">
      <div class="panel-head"><div><span class="eyebrow">BẢO MẬT</span><h2>Đổi mật khẩu quản trị</h2><p>Mật khẩu mới cần ít nhất 12 ký tự, có chữ hoa, chữ thường và chữ số.</p></div></div>
      <form class="panel-body form-grid" id="passwordForm">
        ${field("Mật khẩu hiện tại", "currentPassword", "", { type: "password" })}
        ${field("Mật khẩu mới", "nextPassword", "", { type: "password" })}
        ${field("Nhập lại mật khẩu mới", "confirmPassword", "", { type: "password", wide: true })}
        <div class="form-actions"><button class="primary-button" type="submit">Đổi mật khẩu</button></div>
      </form>
    </section>`;
}

function render() {
  const [title, subtitle] = TITLES[state.view];
  document.querySelector("#viewTitle").textContent = title;
  document.querySelector("#viewSubtitle").textContent = subtitle;
  document.querySelectorAll("#adminNav button[data-view]").forEach((button) => {
    button.classList.toggle("active", button.dataset.view === state.view);
  });
  const views = {
    dashboard: dashboardView,
    homepage: homepageView,
    products: productsView,
    categories: categoriesView,
    posts: postsView,
    media: mediaView,
    settings: settingsView,
  };
  contentRoot.innerHTML = views[state.view]();
}

function changeView(view) {
  state.view = view;
  document.querySelector("#sidebar").classList.remove("is-open");
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function formObject(form) {
  return Object.fromEntries(new FormData(form).entries());
}

function openProductEditor(id) {
  const product = state.products.find((item) => Number(item.id) === Number(id));
  if (!product) return;
  state.editing = { type: "product", id: product.id };
  document.querySelector("#dialogEyebrow").textContent = "SẢN PHẨM";
  document.querySelector("#dialogTitle").textContent = product.name;
  document.querySelector("#dialogFields").innerHTML = `
    ${field("Tên sản phẩm", "name", product.name, { wide: true })}
    ${field("SKU", "sku", product.sku)}
    ${field("Slug", "slug", product.slug)}
    ${field("Giá", "price", product.price, { type: "number", step: 0.01 })}
    ${field("Ký hiệu tiền tệ", "currencySymbol", product.currencySymbol || "$")}
    ${field("Danh mục", "category", productCategory(product), { wide: true })}
    ${field("URL ảnh chính", "image", product.images?.[0]?.src || "", { wide: true })}
    ${field("Mô tả", "summary", product.summary || "", { type: "textarea", wide: true })}
  `;
  editorDialog.showModal();
}

function openPostEditor(index) {
  const post = state.posts[index];
  if (!post) return;
  state.editing = { type: "post", index };
  document.querySelector("#dialogEyebrow").textContent = "BÀI VIẾT";
  document.querySelector("#dialogTitle").textContent = post.title;
  document.querySelector("#dialogFields").innerHTML = `
    ${field("Tiêu đề", "title", post.title, { wide: true })}
    ${field("Slug", "slug", post.slug)}
    ${field("Ngày xuất bản", "date", String(post.date || "").slice(0, 10), { type: "date" })}
    ${field("URL ảnh", "image", post.image || "", { wide: true })}
    ${field("Mô tả ngắn", "excerpt", post.excerpt || "", { type: "textarea", wide: true })}
    ${field("Nội dung bài viết", "body", post.body || "", { type: "textarea", wide: true })}
  `;
  editorDialog.showModal();
}

async function uploadImage(file) {
  if (file.size > 5 * 1024 * 1024) throw new Error("Ảnh vượt quá giới hạn 5 MB.");
  const form = new FormData();
  form.append("file", file);
  form.append("altText", file.name.replace(/\.[^.]+$/, ""));
  const result = await adminApi("/api/admin/media", {
    method: "POST",
    body: form,
  });
  return new URL(result.url, CONFIG.apiBase).href;
}

document.querySelector("#loginForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = event.currentTarget.querySelector("button");
  const message = document.querySelector("#loginMessage");
  button.disabled = true;
  message.textContent = "Đang đăng nhập...";
  try {
    await connect(
      document.querySelector("#usernameInput").value,
      document.querySelector("#passwordInput").value,
    );
    message.textContent = "";
  } catch (error) {
    sessionStorage.removeItem("ownex_admin_session");
    message.textContent = error.message;
  } finally {
    button.disabled = false;
  }
});

document.querySelector("#adminNav").addEventListener("click", (event) => {
  const button = event.target.closest("button[data-view]");
  if (button) changeView(button.dataset.view);
});

document.querySelector("#menuButton").addEventListener("click", () => {
  document.querySelector("#sidebar").classList.toggle("is-open");
});

document.querySelector("#disconnectButton").addEventListener("click", async () => {
  await adminApi("/api/auth/logout", { method: "POST" }).catch(() => {});
  sessionStorage.removeItem("ownex_admin_session");
  location.reload();
});

editorDialog.addEventListener("click", (event) => {
  if (event.target.closest("[data-close-dialog]")) editorDialog.close();
});

contentRoot.addEventListener("click", (event) => {
  const go = event.target.closest("[data-go]");
  if (go) return changeView(go.dataset.go);
  const product = event.target.closest("[data-edit-product]");
  if (product) return openProductEditor(product.dataset.editProduct);
  const post = event.target.closest("[data-edit-post]");
  if (post) return openPostEditor(Number(post.dataset.editPost));
});

contentRoot.addEventListener("input", (event) => {
  if (event.target.id === "productSearch") {
    contentRoot.innerHTML = productsView(event.target.value);
    document.querySelector("#productSearch").focus();
  }
  if (event.target.id === "postSearch") {
    contentRoot.innerHTML = postsView(event.target.value);
    document.querySelector("#postSearch").focus();
  }
});

contentRoot.addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = event.submitter;
  if (button) button.disabled = true;
  try {
    if (event.target.id === "homepageForm") {
      state.content.homepage = { ...state.content.homepage, ...formObject(event.target) };
      await saveJsonFile("content", state.content, "Update homepage content from OWNEX Admin");
    }
    if (event.target.id === "settingsForm") {
      const values = formObject(event.target);
      values.catalogPageSize = Number(values.catalogPageSize);
      values.catalogColumns = Number(values.catalogColumns);
      state.content.site = { ...state.content.site, ...values };
      await saveJsonFile("content", state.content, "Update site settings from OWNEX Admin");
    }
    if (event.target.id === "categoriesForm") {
      const values = formObject(event.target);
      state.categories.groups = state.categories.groups.map((group, index) => ({
        name: String(values[`group-${index}`] || "").trim(),
        children: String(values[`children-${index}`] || "")
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean),
      }));
      await saveJsonFile("categories", state.categories, "Update catalog categories from OWNEX Admin");
    }
    if (event.target.id === "passwordForm") {
      const values = formObject(event.target);
      if (values.nextPassword !== values.confirmPassword) {
        throw new Error("Mật khẩu nhập lại không khớp.");
      }
      await adminApi("/api/auth/password", {
        method: "POST",
        body: JSON.stringify({
          currentPassword: values.currentPassword,
          nextPassword: values.nextPassword,
        }),
      });
      state.user.mustChangePassword = false;
      event.target.reset();
      showToast("Đã đổi mật khẩu quản trị.");
    }
    if (event.target.id === "uploadForm") {
      const file = document.querySelector("#mediaFile").files[0];
      const path = await uploadImage(file);
      document.querySelector("#uploadResult").innerHTML = `<div class="upload-result"><b>Đã tải lên:</b><br />${escapeHtml(path)}<br /><small>Sao chép đường dẫn này vào ô URL ảnh của sản phẩm hoặc bài viết.</small></div>`;
      showToast("Ảnh đã được tải lên.");
    }
  } catch (error) {
    showToast(`Không thể lưu: ${error.message}`);
  } finally {
    if (button) button.disabled = false;
  }
});

editorForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!state.editing) return;
  const values = formObject(editorForm);
  const saveButton = document.querySelector("#dialogSave");
  saveButton.disabled = true;
  try {
    if (state.editing.type === "product") {
      const index = state.products.findIndex(
        (item) => Number(item.id) === Number(state.editing.id),
      );
      const current = state.products[index];
      state.products[index] = {
        ...current,
        name: values.name.trim(),
        sku: values.sku.trim(),
        slug: values.slug.trim() || slugify(values.name),
        price: Number(values.price),
        currencySymbol: values.currencySymbol.trim() || "$",
        summary: values.summary.trim(),
        images: [
          {
            ...(current.images?.[0] || {}),
            src: values.image.trim(),
            alt: values.name.trim(),
          },
          ...(current.images || []).slice(1),
        ],
        categories: [
          {
            ...(current.categories?.[0] || {}),
            name: values.category.trim(),
            slug: slugify(values.category),
          },
        ],
      };
      await saveJsonFile(
        "products",
        { products: state.products },
        `Update product ${state.products[index].name} from OWNEX Admin`,
      );
    }
    if (state.editing.type === "post") {
      const current = state.posts[state.editing.index];
      state.posts[state.editing.index] = {
        ...current,
        title: values.title.trim(),
        slug: values.slug.trim() || slugify(values.title),
        date: values.date,
        image: values.image.trim(),
        excerpt: values.excerpt.trim(),
        body: values.body.trim(),
      };
      await saveJsonFile(
        "posts",
        { posts: state.posts },
        `Update post ${state.posts[state.editing.index].title} from OWNEX Admin`,
      );
    }
    editorDialog.close();
    render();
  } catch (error) {
    showToast(`Không thể lưu: ${error.message}`);
  } finally {
    saveButton.disabled = false;
  }
});

async function restoreSession() {
  const result = await adminApi("/api/auth/session");
  state.user = result.user;
  await loadAll();
  loginScreen.classList.add("is-hidden");
  adminShell.classList.remove("is-hidden");
  document.querySelector("#profileName").textContent =
    state.user?.displayName || "Quản trị viên";
  render();
}

let idleTimer;
function resetIdleTimer() {
  window.clearTimeout(idleTimer);
  if (!state.token) return;
  idleTimer = window.setTimeout(async () => {
    await adminApi("/api/auth/logout", { method: "POST" }).catch(() => {});
    sessionStorage.removeItem("ownex_admin_session");
    location.reload();
  }, 30 * 60 * 1000);
}

["click", "keydown", "pointerdown", "scroll"].forEach((eventName) => {
  window.addEventListener(eventName, resetIdleTimer, { passive: true });
});

if (state.token) {
  restoreSession()
    .then(resetIdleTimer)
    .catch(() => {
      sessionStorage.removeItem("ownex_admin_session");
      state.token = "";
    });
}
