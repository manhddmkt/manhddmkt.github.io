(() => {
  const DEFAULT_LOGO = "/assets/ownex-logo.svg";
  let current = { src: DEFAULT_LOGO, alt: "OWNEX Commerce" };
  let pending = null;

  function normalizeLogo(site = {}) {
    const logo = site.logo || {};
    return {
      src: logo.src || site.logoUrl || DEFAULT_LOGO,
      alt: logo.alt || site.logoAlt || "OWNEX Commerce",
    };
  }

  function absoluteUrl(value) {
    try {
      return new URL(value || DEFAULT_LOGO, CONFIG.apiBase || location.origin).href;
    } catch {
      return DEFAULT_LOGO;
    }
  }

  function applyBrand() {
    const src = absoluteUrl(current.src);
    document.querySelectorAll(".login-brand, .sidebar-brand").forEach((brand) => {
      let image = brand.querySelector("img[data-admin-site-logo]");
      const mark = brand.querySelector(".brand-mark");

      if (!image) {
        image = document.createElement("img");
        image.dataset.adminSiteLogo = "true";
        image.className = "admin-site-logo";
        if (mark) mark.replaceWith(image);
        else brand.prepend(image);
      }

      image.src = src;
      image.alt = current.alt;
      image.decoding = "async";
      image.loading = "eager";
    });
  }

  function applyFromState() {
    if (!window.state?.content?.site) return false;
    current = normalizeLogo(window.state.content.site);
    applyBrand();
    return true;
  }

  async function refresh() {
    if (pending) return pending;
    pending = (async () => {
      try {
        if (applyFromState()) return;
        const response = await fetch(`${CONFIG.apiBase}/api/public/bootstrap?adminBrand=${Date.now()}`, {
          cache: "no-store",
        });
        if (!response.ok) throw new Error(`Bootstrap ${response.status}`);
        const payload = await response.json();
        current = normalizeLogo(payload?.content?.site || {});
        applyBrand();
      } catch (error) {
        applyBrand();
        console.warn("Admin brand sync:", error);
      } finally {
        pending = null;
      }
    })();
    return pending;
  }

  document.addEventListener(
    "click",
    (event) => {
      if (!event.target.closest("[data-fle-save], #dialogSave, [data-logo-upload]")) return;
      setTimeout(() => {
        applyFromState();
        refresh();
      }, 1200);
    },
    true,
  );

  window.addEventListener("focus", refresh);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) refresh();
  });

  new MutationObserver(() => {
    applyFromState();
    applyBrand();
  }).observe(document.body, { childList: true, subtree: true });

  window.OWNEX_ADMIN_BRAND_REFRESH = refresh;
  refresh();
})();
