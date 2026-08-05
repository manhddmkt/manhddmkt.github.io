(() => {
  const HOME_PATHS = new Set(["/", "/index.html"]);
  let rendering = false;

  const homeMarkup = () => `
    <main class="lf-home" data-ownex-home-v2>
      <section class="lf-hero">
        <div class="lf-shell lf-hero__grid">
          <div class="lf-hero__copy">
            <span class="lf-kicker">FULFILLMENT MADE SIMPLE</span>
            <h1>Build products.<br /><span>Ship with confidence.</span></h1>
            <p>Product development, production support, quality control, packing, and global fulfillment in one dependable workflow.</p>
            <div class="lf-actions">
              <a class="lf-button lf-button--primary" href="/contact">Start a project <span>↗</span></a>
              <a class="lf-button lf-button--secondary" href="/catalog">View catalog <span>→</span></a>
            </div>
            <div class="lf-hero__facts">
              <div><strong>MOQ 1</strong><span>Start without inventory</span></div>
              <div><strong>24–72h</strong><span>Processing workflow</span></div>
              <div><strong>Global</strong><span>Shipping capability</span></div>
            </div>
          </div>
          <div class="lf-hero__visual" aria-label="OWNEX product collection">
            <img class="lf-hero__image lf-hero__image--main" src="/assets/01-wooden-baseball-glove-sign-300x300-1.png" alt="Personalized wooden sign" />
            <img class="lf-hero__image lf-hero__image--top" src="/assets/05-silly-goose-caps-300x240-1.png" alt="Custom embroidered caps" />
            <img class="lf-hero__image lf-hero__image--bottom" src="/assets/04-personalized-plant-pots-420x220-1.png" alt="Personalized plant pots" />
            <div class="lf-hero__badge"><b>Factory-backed</b><span>Quality checked before shipping</span></div>
          </div>
        </div>
      </section>

      <section class="lf-channel-bar">
        <div class="lf-shell lf-channel-bar__inner">
          <span>Connect your commerce channels</span>
          <div><strong>Shopify</strong><strong>Amazon</strong><strong>TikTok Shop</strong><strong>WooCommerce</strong><strong>Etsy</strong></div>
        </div>
      </section>

      <section class="lf-section lf-shell">
        <div class="lf-heading lf-heading--split">
          <div><span class="lf-kicker">PRODUCT CATEGORIES</span><h2>Ready directions for your next launch</h2></div>
          <a href="/catalog">Explore all products →</a>
        </div>
        <div class="lf-category-grid">
          ${[
            ["Home Decor", "/assets/home-living.jpg"],
            ["Apparel", "/assets/apparel-accessories.jpg"],
            ["Personalized Gifts", "/assets/gifts-personalized-products.jpg"],
            ["Beauty & Care", "/assets/beauty-personal-care.jpg"],
            ["Seasonal Products", "/assets/1000-custom-products-1.jpg"],
          ].map(([title, image]) => `
            <a class="lf-category" href="/catalog">
              <img src="${image}" alt="" loading="lazy" />
              <div><h3>${title}</h3><span>View products ↗</span></div>
            </a>`).join("")}
        </div>
      </section>

      <section class="lf-section lf-section--soft">
        <div class="lf-shell">
          <div class="lf-heading lf-heading--center">
            <span class="lf-kicker">SIMPLE OPERATING FLOW</span>
            <h2>Send the requirement. We prepare, check, and ship.</h2>
          </div>
          <div class="lf-process-grid">
            ${[
              ["01", "Choose or develop", "Select a product direction or prepare a custom specification."],
              ["02", "Produce and inspect", "Production follows defined standards with quality checkpoints."],
              ["03", "Pack and fulfill", "Orders are packed, labeled, and prepared for global delivery."],
            ].map(([number, title, copy]) => `
              <article class="lf-process-card"><span>${number}</span><h3>${title}</h3><p>${copy}</p></article>`).join("")}
          </div>
        </div>
      </section>

      <section class="lf-section lf-shell lf-factory">
        <div class="lf-factory__media"><img src="/assets/our-factory-4-1024x614.jpg" alt="OWNEX production facility" loading="lazy" /></div>
        <div class="lf-factory__copy">
          <span class="lf-kicker">REAL PRODUCTION CAPABILITY</span>
          <h2>Factory-backed execution from Vietnam</h2>
          <p>Bring product development, packaging, quality control, and fulfillment into one coordinated operating flow.</p>
          <div class="lf-stat-grid">
            <div><strong>1,000+</strong><span>Product possibilities</span></div>
            <div><strong>24/7</strong><span>Operational support</span></div>
            <div><strong>Global</strong><span>Fulfillment reach</span></div>
          </div>
          <a class="lf-text-link" href="/about">Learn about OWNEX →</a>
        </div>
      </section>

      <section class="lf-section lf-section--navy">
        <div class="lf-shell">
          <div class="lf-heading lf-heading--light"><span class="lf-kicker">SERVICES</span><h2>Support built around better control and growth</h2></div>
          <div class="lf-service-grid">
            ${[
              ["Product development", "Turn concepts into production-ready products through sampling and specifications.", "/assets/1000-custom-products-1.jpg", "/solutions/product-development"],
              ["Commerce operations", "Coordinate production, quality, order processing, and workflow visibility.", "/assets/01-factory-backed-production-1.jpg", "/solutions/commerce-operations"],
              ["Global fulfillment", "Prepare, pack, and deliver orders through a dependable fulfillment system.", "/assets/fast-fulfillment-1.jpg", "/solutions/global-fulfillment"],
            ].map(([title, copy, image, href]) => `
              <a class="lf-service-card" href="${href}"><img src="${image}" alt="" loading="lazy" /><div><h3>${title}</h3><p>${copy}</p><span>Discover service ↗</span></div></a>`).join("")}
          </div>
        </div>
      </section>

      <section class="lf-section lf-shell">
        <div class="lf-heading lf-heading--split"><div><span class="lf-kicker">TRENDING PRODUCTS</span><h2>Launch ideas for every season</h2></div><a href="/catalog">View catalog →</a></div>
        <div class="lf-product-grid">
          ${[
            ["Personalized Baseball Glove Sign", "/assets/01-wooden-baseball-glove-sign-300x300-1.png"],
            ["Premium Printed T-Shirt", "/assets/02-confident-dad-tshirt-420x270-1.png"],
            ["Graduation Teddy Bear", "/assets/03-graduation-teddy-bear-300x300-1.png"],
            ["Custom Ceramic Plant Pot", "/assets/04-personalized-plant-pots-420x220-1.png"],
            ["Embroidered Lifestyle Cap", "/assets/05-silly-goose-caps-300x240-1.png"],
          ].map(([title, image]) => `
            <a class="lf-product-card" href="/catalog"><div><img src="${image}" alt="${title}" loading="lazy" /></div><h3>${title}</h3><span>View product ↗</span></a>`).join("")}
        </div>
      </section>

      <section class="lf-benefit-strip"><div class="lf-shell"><span>Lower cost</span><span>Better control</span><span>Faster launch</span><span>White-label ready</span><span>Global fulfillment</span></div></section>

      <section class="lf-section lf-shell">
        <div class="lf-heading lf-heading--center"><span class="lf-kicker">WHY OWNEX</span><h2>Fulfillment support built for serious sellers</h2></div>
        <div class="lf-benefit-grid">
          ${[
            ["Factory-backed production", "Real production capability supports stronger cost and quality control."],
            ["Fast operating workflow", "Defined preparation and packing steps keep orders moving."],
            ["Quality before shipping", "Products, variants, and packing requirements are reviewed."],
            ["Better commercial margin", "Reduce unnecessary middle steps and improve cost visibility."],
            ["White-label ready", "Use custom packaging, labels, inserts, and brand presentation."],
            ["Multi-platform support", "Connect major marketplaces, stores, CSV, API, or custom workflows."],
            ["Wide product catalog", "Build campaigns and collections from flexible product directions."],
            ["Responsive support", "Get help with orders, fulfillment updates, and special requirements."],
          ].map(([title, copy], index) => `<article class="lf-benefit-card"><span>${String(index + 1).padStart(2, "0")}</span><h3>${title}</h3><p>${copy}</p></article>`).join("")}
        </div>
      </section>

      <section class="lf-section lf-shell lf-campaign">
        <div><span class="lf-kicker">SEASONAL CAMPAIGN SUPPORT</span><h2>Turn trends into product opportunities</h2><p>Launch seasonal products faster with development, branding, packing, and fulfillment support.</p><a class="lf-button lf-button--light" href="/catalog">Shop the collection →</a></div>
        <div><small>PRODUCT OPTIONS</small><strong>1,000+</strong><span>and growing</span></div>
      </section>

      <section class="lf-section lf-shell">
        <div class="lf-heading lf-heading--split"><div><span class="lf-kicker">SELLER RESOURCES</span><h2>Guides for smarter commerce operations</h2></div><a href="/resources">View all resources →</a></div>
        <div class="lf-resource-grid">
          ${[
            ["How to prepare custom products for scalable growth", "/assets/Ban-san-pham-custom-tren-Shopify-1.jpg"],
            ["Build a reliable fulfillment workflow from day one", "/assets/Shopify-Fulfillment-for-Custom-Products-Workflow.jpg"],
            ["Quality standards that support sustainable scale", "/assets/high-quality-better-value-1.jpg"],
          ].map(([title, image]) => `<a class="lf-resource-card" href="/resources"><img src="${image}" alt="" loading="lazy" /><span>OPERATIONS</span><h3>${title}</h3><b>Read article →</b></a>`).join("")}
        </div>
      </section>

      <section class="lf-final">
        <div class="lf-shell"><div><span class="lf-kicker">FACTORY-BACKED FULFILLMENT</span><h2>Start with one product. Scale with confidence.</h2></div><a class="lf-button lf-button--light" href="/contact">Talk to our team ↗</a></div>
      </section>
    </main>`;

  const renderHome = () => {
    if (!HOME_PATHS.has(window.location.pathname)) return;
    const app = document.getElementById("app");
    if (!app || rendering || app.querySelector("[data-ownex-home-v2]")) return;

    const header = app.querySelector(".ownex-new-header, .site-header");
    const footer = app.querySelector(".footer");
    if (!header || !footer) return;

    rendering = true;
    [...app.children].forEach((node) => {
      if (node !== header && node !== footer) node.remove();
    });
    footer.insertAdjacentHTML("beforebegin", homeMarkup());
    rendering = false;
  };

  const start = () => {
    renderHome();
    const app = document.getElementById("app");
    if (!app) return;
    new MutationObserver(() => requestAnimationFrame(renderHome)).observe(app, {
      childList: true,
      subtree: false,
    });
    window.addEventListener("popstate", () => setTimeout(renderHome, 0));
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
