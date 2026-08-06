(() => {
  const IS_EDITOR = new URLSearchParams(location.search).has("ownexVisualEditor");
  if (!IS_EDITOR) return;

  const DEFAULT_LOGO = "/assets/ownex-logo.svg";
  const allowed = (origin) =>
    origin === "https://ownex-commerce-admin.pages.dev" ||
    origin === "https://ownex-commerce-admin.manhddmkt.chatgpt.site" ||
    /^https:\/\/ownex-commerce-admin(?:-[a-z0-9-]+)?\.pages\.dev$/i.test(origin);

  let adminOrigin = "";

  const brand = () =>
    document.querySelector(
      ".ownex-new-header__brand, .site-header [data-logo], header [data-ownex-logo]",
    );

  const withUnit = (value) => {
    const text = String(value || "").trim();
    if (!text) return "";
    return /^\d+(?:\.\d+)?$/.test(text) ? `${text}px` : text;
  };

  function ensureImage(node) {
    let image = node.querySelector("img");
    if (!image) {
      image = document.createElement("img");
      image.src = DEFAULT_LOGO;
      image.alt = "OWNEX Commerce";
      image.style.width = "120px";
      image.style.maxWidth = "100%";
      image.style.height = "auto";
      node.replaceChildren(image);
    }
    node.dataset.ownexLogo = "image";
    image.style.maxWidth = "100%";
    image.style.height = "auto";
    return image;
  }

  const logoInfo = () => {
    const node = brand();
    if (!node) return null;
    const image = ensureImage(node);
    return {
      mode: "image",
      src: image.getAttribute("src") || DEFAULT_LOGO,
      alt: image.getAttribute("alt") || "OWNEX Commerce",
      width: image.style.width || getComputedStyle(image).width || "120px",
      href: node.getAttribute("href") || "/",
    };
  };

  function emitSelected() {
    if (!adminOrigin || !parent) return;
    const info = logoInfo();
    if (!info) return;
    parent.postMessage({ type: "ownex-logo:selected", logo: info }, adminOrigin);
  }

  function emitChanged(reason) {
    if (!adminOrigin || !parent) return;
    parent.postMessage(
      { type: "ownex-visual:changed", reason: `logo-${reason}` },
      adminOrigin,
    );
    emitSelected();
  }

  function mutate(property, value) {
    const node = brand();
    if (!node) return;
    const image = ensureImage(node);

    if (property === "href") node.setAttribute("href", value || "/");
    if (property === "src") image.setAttribute("src", value || DEFAULT_LOGO);
    if (property === "alt") image.setAttribute("alt", value || "OWNEX Commerce");
    if (property === "width") image.style.width = withUnit(value || "120px");

    emitChanged(property);
  }

  document.addEventListener(
    "click",
    (event) => {
      const node = event.target.closest?.(
        ".ownex-new-header__brand, .site-header [data-logo], header [data-ownex-logo]",
      );
      if (!node) return;
      event.preventDefault();
      event.stopPropagation();
      ensureImage(node);
      requestAnimationFrame(emitSelected);
    },
    true,
  );

  addEventListener("message", (event) => {
    if (!allowed(event.origin)) return;
    const data = event.data || {};
    if (data.type === "ownex-logo:enable") {
      adminOrigin = event.origin;
      const node = brand();
      if (node) ensureImage(node);
      return;
    }
    if (data.type === "ownex-logo:select") {
      adminOrigin = event.origin;
      emitSelected();
      return;
    }
    if (data.type === "ownex-logo:mutate") {
      adminOrigin = event.origin;
      mutate(data.property, data.value);
    }
  });
})();
