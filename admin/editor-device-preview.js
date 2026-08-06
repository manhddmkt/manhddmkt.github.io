(() => {
  const MODES = {
    desktop: { width: 1440, height: 900, label: "Máy tính", icon: "▰" },
    tablet: { width: 768, height: 1024, label: "Máy tính bảng", icon: "▯" },
    mobile: { width: 390, height: 844, label: "Điện thoại", icon: "▯" },
  };

  let resizeObserver = null;
  let raf = 0;

  function currentMode(canvas) {
    if (canvas?.classList.contains("tablet")) return "tablet";
    if (canvas?.classList.contains("mobile")) return "mobile";
    return "desktop";
  }

  function labelButtons() {
    document.querySelectorAll("[data-fle-device]").forEach((button) => {
      const mode = button.dataset.fleDevice;
      const config = MODES[mode];
      if (!config) return;
      button.title = `${config.label} · ${config.width}px`;
      button.setAttribute("aria-label", `${config.label}, khung rộng ${config.width}px`);
      button.innerHTML = `<span aria-hidden="true">${config.icon}</span><small>${config.label}</small><em>${config.width}px</em>`;
    });
  }

  function ensureStage() {
    const canvas = document.querySelector(".fle-canvas");
    const frame = document.querySelector("#fleFrame");
    if (!canvas || !frame) return null;

    let stage = frame.closest(".fle-device-stage");
    if (!stage) {
      stage = document.createElement("div");
      stage.className = "fle-device-stage";
      frame.parentNode.insertBefore(stage, frame);
      stage.appendChild(frame);
    }

    if (resizeObserver) resizeObserver.disconnect();
    resizeObserver = new ResizeObserver(schedule);
    resizeObserver.observe(canvas);
    return { canvas, frame, stage };
  }

  function update() {
    raf = 0;
    labelButtons();
    const nodes = ensureStage();
    if (!nodes) return;

    const { canvas, frame, stage } = nodes;
    const mode = currentMode(canvas);
    const config = MODES[mode];
    const horizontalPadding = 40;
    const availableWidth = Math.max(280, canvas.clientWidth - horizontalPadding);
    const scale = Math.min(1, availableWidth / config.width);

    canvas.dataset.deviceMode = mode;
    canvas.style.setProperty("--fle-device-width", `${config.width}px`);
    canvas.style.setProperty("--fle-device-height", `${config.height}px`);
    canvas.style.setProperty("--fle-device-scale", String(scale));

    stage.style.width = `${Math.round(config.width * scale)}px`;
    stage.style.height = `${Math.round(config.height * scale)}px`;
    stage.dataset.device = mode;

    frame.style.width = `${config.width}px`;
    frame.style.minWidth = `${config.width}px`;
    frame.style.maxWidth = "none";
    frame.style.height = `${config.height}px`;
    frame.style.minHeight = `${config.height}px`;
    frame.style.transform = `scale(${scale})`;
    frame.style.transformOrigin = "top left";
    frame.style.borderRadius = mode === "desktop" ? "4px" : mode === "tablet" ? "18px" : "24px";
  }

  function schedule() {
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(update);
  }

  document.addEventListener(
    "click",
    (event) => {
      if (!event.target.closest("[data-fle-device]")) return;
      requestAnimationFrame(() => requestAnimationFrame(schedule));
    },
    true,
  );

  document.addEventListener(
    "load",
    (event) => {
      if (event.target.id === "fleFrame") schedule();
    },
    true,
  );

  new MutationObserver(schedule).observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["class"],
  });

  window.addEventListener("resize", schedule);
  schedule();
})();
