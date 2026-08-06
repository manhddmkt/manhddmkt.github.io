(() => {
  const IS_EDITOR = new URLSearchParams(location.search).has("ownexVisualEditor");
  if (!IS_EDITOR) return;

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

  const logoInfo = () => {
    const node = brand();
    if (!node) return null;
    const image = node.querySelector("img");
    const main = node.querySelector(".ownex-new-header__brand-main");
    const sub = node.querySelector(".ownex-new-header__brand-sub");
    return {
      mode: image ? "image" : "text",
      src: image?.getAttribute("src") || "",
      alt: image?.getAttribute("alt") || "OWNEX Commerce",
      width: image?.style.width || (image ? getComputedStyle(image).width : "120px"),
      href: node.getAttribute("href") || "/",
      main: main?.textContent?.trim() || "OWNEX",
      sub: sub?.textContent?.trim() || "COMMERCE",
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

  function ensureImage(node) {
    let image = node.querySelector("img");
    if (image) return image;
    image = document.createElement("img");
    image.src = "/assets/logo-ownex.png";
    image.alt = "OWNEX Commerce";
    image.style.width = "120px";
    image.style.maxWidth = "100%";
    image.style.height = "auto";
    node.replaceChildren(image);
    node.dataset.ownexLogo = "image";
    return image;
  }

  function setTextLogo(node, values = {}) {
    const mainValue = values.main || "OWNEX";
    const subValue = values.sub || "COMMERCE";
    const main = document.createElement("span");
    main.className = "ownex-new-header__brand-main";
    if (/x$/i.test(mainValue)) {
      main.append(document.createTextNode(mainValue.slice(0, -1)));
      const accent = document.createElement("span");
      accent.textContent = mainValue.slice(-1);
      main.append(accent);
    } else {
      main.textContent = mainValue;
    }
    const sub = document.createElement("span");
    sub.className = "ownex-new-header__brand-sub";
    sub.textContent = subValue;
    node.replaceChildren(main, sub);
    node.dataset.ownexLogo = "text";
  }

  function mutate(property, value) {
    const node = brand();
    if (!node) return;
    const before = logoInfo() || {};

    if (property === "mode") {
      if (value === "image") {
        const image = ensureImage(node);
        if (before.src) image.src = before.src;
        if (before.alt) image.alt = before.alt;
        image.style.width = withUnit(before.width || "120px");
      } else {
        setTextLogo(node, before);
      }
    }

    if (property === "href") node.setAttribute("href", value || "/");

    if (["src", "alt", "width"].includes(property)) {
      const image = ensureImage(node);
      if (property === "src") image.setAttribute("src", value || "");
      if (property === "alt") image.setAttribute("alt", value || "");
      if (property === "width") {
        image.style.width = withUnit(value);
        image.style.maxWidth = "100%";
        image.style.height = "auto";
      }
    }

    if (["main", "sub"].includes(property)) {
      if (node.querySelector("img")) setTextLogo(node, before);
      const current = logoInfo() || before;
      setTextLogo(node, {
        main: property === "main" ? value : current.main,
        sub: property === "sub" ? value : current.sub,
      });
    }

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
      requestAnimationFrame(emitSelected);
    },
    true,
  );

  addEventListener("message", (event) => {
    if (!allowed(event.origin)) return;
    const data = event.data || {};
    if (data.type === "ownex-logo:enable") {
      adminOrigin = event.origin;
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
