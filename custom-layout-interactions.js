(() => {
  function bindHeader(header) {
    if (!header || header.dataset.ownexCustomInteractions === "1") return;
    header.dataset.ownexCustomInteractions = "1";
    const button = header.querySelector(".ownex-new-header__mobile-button");
    button?.addEventListener("click", () => {
      const open = header.classList.toggle("is-open");
      button.setAttribute("aria-expanded", String(open));
      button.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    header.querySelectorAll(".ownex-new-header__mobile-panel a").forEach((link) => {
      link.addEventListener("click", () => {
        header.classList.remove("is-open");
        button?.setAttribute("aria-expanded", "false");
      });
    });
  }
  function apply() {
    document.querySelectorAll('header[data-ownex-layout-custom], .ownex-new-header').forEach(bindHeader);
  }
  function start() {
    apply();
    const app = document.querySelector("#app");
    if (app) new MutationObserver(() => requestAnimationFrame(apply)).observe(app, { childList: true, subtree: true });
  }
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", start, { once: true }) : start();
})();