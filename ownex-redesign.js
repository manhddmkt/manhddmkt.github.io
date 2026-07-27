const products = [
  {
    slug: "wooden-baseball-glove-sign",
    name: "Personalized Baseball Glove Sign",
    category: "Home & Living",
    image: "/assets/01-wooden-baseball-glove-sign-300x300-1.png",
    description:
      "A customizable wooden keepsake designed for gifting, team celebrations, and sports collections.",
  },
  {
    slug: "confident-dad-tshirt",
    name: "Premium Printed T-Shirt",
    category: "Apparel & Accessories",
    image: "/assets/02-confident-dad-tshirt-420x270-1.png",
    description:
      "A versatile everyday garment with dependable print quality and multiple personalization options.",
  },
  {
    slug: "graduation-teddy-bear",
    name: "Personalized Graduation Bear",
    category: "Gifts & Personalized",
    image: "/assets/03-graduation-teddy-bear-300x300-1.png",
    description:
      "A gift-ready keepsake that can be personalized for milestones and special occasions.",
  },
  {
    slug: "personalized-plant-pots",
    name: "Custom Ceramic Plant Pot",
    category: "Home & Living",
    image: "/assets/04-personalized-plant-pots-420x220-1.png",
    description:
      "A modern decorative planter made for personalized messages, names, and artwork.",
  },
  {
    slug: "silly-goose-cap",
    name: "Embroidered Lifestyle Cap",
    category: "Apparel & Accessories",
    image: "/assets/05-silly-goose-caps-300x240-1.png",
    description:
      "A structured cap with clean embroidery, flexible branding, and a polished retail finish.",
  },
  {
    slug: "birth-announcement-hoop",
    name: "Birth Announcement Hoop",
    category: "Gifts & Personalized",
    image: "/assets/06-birth-announcement-hoops-200x260-1.png",
    description:
      "A refined personalized décor piece created for newborn announcements and memorable gifting.",
  },
  {
    slug: "baseball-keychain",
    name: "Personalized Baseball Keychain",
    category: "Gifts & Personalized",
    image: "/assets/07-baseball-keychain-200x260-2.png",
    description:
      "A compact, lightweight accessory that supports names, team details, and custom graphics.",
  },
  {
    slug: "custom-lifestyle-collection",
    name: "Custom Lifestyle Collection",
    category: "Curated Collection",
    image: "/assets/gifts-personalized-products.jpg",
    description:
      "A flexible collection of personalized products prepared for seasonal and evergreen campaigns.",
  },
];

let catalogGroups = [
  {
    name: "Accessories",
    children: [
      "Beauty Accessories",
      "Car Accessories",
      "Graduation",
      "Keychains",
      "Travel Accessories",
    ],
  },
  {
    name: "Home & Living",
    children: [
      "Decoration",
      "Flags",
      "Home Decor",
      "Lights",
      "Mugs",
      "Ornaments",
      "Picture Frames & Displays",
      "Pillows & Covers",
      "Suncatchers",
      "Toys & Games",
      "Wall Arts",
    ],
  },
  {
    name: "Kid’s Clothing",
    children: ["Baby bodysuits", "Kid's Jersey", "Kid's Pajamas"],
  },
  {
    name: "Men’s Clothing",
    children: [
      "Men's Hawaiian Shirts",
      "Men's Hoodies",
      "Men's Jersey",
      "Men's Pajamas",
      "Men's Polo Shirts",
      "Men's Tank Top",
    ],
  },
  {
    name: "Women’s Clothing",
    children: ["Women's Pajamas"],
  },
];

let catalogProducts = [...products];

const solutions = [
  {
    slug: "product-development",
    title: "Product Development",
    kicker: "FROM IDEA TO READY",
    copy:
      "Turn ideas into production-ready products through structured development, sampling, specifications, and quality standards.",
    image: "/assets/1000-custom-products-1.jpg",
  },
  {
    slug: "commerce-operations",
    title: "Commerce Operations",
    kicker: "CONSISTENCY AT SCALE",
    copy:
      "Coordinate product execution, order processing, and fulfillment through one standardized operating flow.",
    image: "/assets/01-factory-backed-production-1.jpg",
  },
  {
    slug: "global-fulfillment",
    title: "Global Fulfillment",
    kicker: "DELIVER WITH CONFIDENCE",
    copy:
      "Prepare, track, and deliver orders with reliable service standards and clear operational visibility.",
    image: "/assets/fast-fulfillment-1.jpg",
  },
];

let resources = [
  {
    slug: "prepare-products-for-scalable-growth",
    title: "How to prepare custom products for scalable growth",
    image: "/assets/Ban-san-pham-custom-tren-Shopify-1.jpg",
    excerpt:
      "A practical framework for moving from a product idea to a repeatable, quality-controlled operation.",
  },
  {
    slug: "build-a-reliable-fulfillment-workflow",
    title: "Build a reliable fulfillment workflow from day one",
    image: "/assets/Shopify-Fulfillment-for-Custom-Products-Workflow.jpg",
    excerpt:
      "The operating checkpoints that help protect speed, consistency, and customer experience.",
  },
  {
    slug: "quality-standards-that-support-scale",
    title: "Quality standards that support sustainable scale",
    image: "/assets/high-quality-better-value-1.jpg",
    excerpt:
      "Why clear specifications, inspection criteria, and feedback loops matter as volume grows.",
  },
];

let managedContent = {
  homepage: {},
  site: {
    email: "hello@ownexcommerce.com",
    footerDescription:
      "Standardized commerce operations that turn ambition into reliable execution and sustainable growth.",
    headerCtaLabel: "Start a project",
    headerCtaUrl: "/contact",
    catalogPageSize: 64,
    catalogColumns: 4,
  },
};

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function contentValue(section, key, fallback = "") {
  const value = managedContent?.[section]?.[key];
  return escapeHtml(value === undefined || value === null ? fallback : value);
}

const brand = `
  <a class="brand" href="/" aria-label="OWNEX Commerce home">
    <span class="brand-main">OWNE<span>X</span></span>
    <span class="brand-sub">COMMERCE</span>
  </a>`;

function header() {
  return `
    <header class="site-header">
      <div class="header-inner">
        ${brand}
        <nav class="desktop-nav" aria-label="Primary navigation">
          <div class="nav-group">
            <a href="/about">About Us <span>⌄</span></a>
            <div class="nav-dropdown">
              <a href="/about">About OWNEX</a>
              <a href="/contact">Contact</a>
            </div>
          </div>
          <a href="/catalog">Catalog</a>
          <div class="nav-group">
            <a href="/solutions">Services <span>⌄</span></a>
            <div class="nav-dropdown">
              ${solutions
                .map(
                  (item) =>
                    `<a href="/solutions/${item.slug}">${item.title}</a>`,
                )
                .join("")}
            </div>
          </div>
          <a href="/resources">Blog</a>
          <div class="nav-group">
            <a href="/help">Support <span>⌄</span></a>
            <div class="nav-dropdown">
              <a href="/help">Help center</a>
              <a href="/faq">FAQs</a>
              <a href="/contact">Contact</a>
            </div>
          </div>
        </nav>
        <div class="header-actions">
          <form class="header-search" role="search">
            <span class="header-search-icon" aria-hidden="true"></span>
            <input name="search" type="search" aria-label="Search products" placeholder="What are you looking?" />
          </form>
          <a class="button button-primary button-small" href="${contentValue("site", "headerCtaUrl", "/contact")}">${contentValue("site", "headerCtaLabel", "Start a project")} <span>↗</span></a>
        </div>
        <details class="mobile-nav">
          <summary aria-label="Open menu"><span></span><span></span><span></span></summary>
          <div>
            <a href="/about">About Us</a>
            <a href="/catalog">Catalog</a>
            <a href="/solutions">Services</a>
            <a href="/resources">Blog</a>
            <a href="/help">Support</a>
          </div>
        </details>
      </div>
    </header>`;
}

function footer() {
  return `
    <footer class="footer">
      <div class="footer-top">
        <div class="footer-intro">
          ${brand}
          <p>${contentValue("site", "footerDescription", "Standardized commerce operations that turn ambition into reliable execution and sustainable growth.")}</p>
          <a href="mailto:${contentValue("site", "email", "hello@ownexcommerce.com")}">${contentValue("site", "email", "hello@ownexcommerce.com")}</a>
        </div>
        <div class="footer-column">
          <h3>Explore</h3>
          <a href="/catalog">Product catalog</a>
          <a href="/solutions">Solutions</a>
          <a href="/integrations">Integrations</a>
          <a href="/resources">Resources</a>
        </div>
        <div class="footer-column">
          <h3>Company</h3>
          <a href="/about">About OWNEX</a>
          <a href="/contact">Contact</a>
          <a href="/help">Help center</a>
          <a href="/faq">FAQs</a>
        </div>
        <div class="footer-newsletter">
          <span class="eyebrow">STAY INFORMED</span>
          <h3>Commerce insights, built for action.</h3>
          <p>Practical updates on products, operations, quality, and growth.</p>
          <form class="newsletter-form">
            <input aria-label="Business email" type="email" placeholder="Business email" required />
            <button type="submit">Subscribe</button>
          </form>
          <small class="form-note" aria-live="polite"></small>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© 2026 OWNEX COMMERCE. All rights reserved.</span>
        <div><a href="/privacy">Privacy</a><a href="/terms">Terms</a></div>
      </div>
    </footer>`;
}

function buttons() {
  return `
    <div class="button-row">
      <a class="button button-primary" href="${contentValue("homepage", "primaryCtaUrl", "/solutions")}">${contentValue("homepage", "primaryCtaLabel", "Explore solutions")} <span>↗</span></a>
      <a class="button button-secondary" href="${contentValue("homepage", "secondaryCtaUrl", "/catalog")}">${contentValue("homepage", "secondaryCtaLabel", "View product catalog")} <span>→</span></a>
    </div>`;
}

function sectionHeading(eyebrow, title, copy = "") {
  return `
    <div class="section-heading">
      <span class="eyebrow">${eyebrow}</span>
      <h2>${title}</h2>
      ${copy ? `<p>${copy}</p>` : ""}
    </div>`;
}

function pageHero(eyebrow, title, copy) {
  return `
    <section class="page-hero">
      <div class="page-hero-orb"></div>
      <span class="eyebrow">${eyebrow}</span>
      <h1>${title}</h1>
      <p>${copy}</p>
    </section>`;
}

function productGrid(items = products) {
  return `
    <div class="product-grid">
      ${items
        .map(
          (item) => `
            <a class="product-card" href="/product/${item.slug}">
              <div class="product-image">
                <img src="${item.image}" alt="${item.name}" />
                <span>View product ↗</span>
              </div>
              <small>${item.category}</small>
              <h3>${item.name}</h3>
            </a>`,
        )
        .join("")}
    </div>`;
}

function decodeCatalogText(value = "") {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&#8217;", "’")
    .replaceAll("&#039;", "'");
}

function catalogProductGrid(items) {
  return `
    <div class="product-grid catalog-product-grid">
      ${items
        .map(
          (item) => `
            <a class="product-card" href="/product/${item.slug}">
              <div class="product-image">
                <img src="${item.image}" alt="${item.name}" loading="lazy" />
                <span>View product ↗</span>
              </div>
              <h3>${item.name}</h3>
              <b class="product-price">${item.price > 0 ? `${item.currencySymbol || "$"}${item.price.toFixed(2)}` : "Contact for price"}</b>
            </a>`,
        )
        .join("")}
    </div>`;
}

function resourceGrid() {
  return `
    <div class="resource-grid">
      ${resources
        .map(
          (item) => `
            <a class="resource-card" href="/blog/${item.slug}">
              <img src="${item.image}" alt="" />
              <span>OPERATIONS • 6 MIN READ</span>
              <h3>${item.title}</h3>
              <p>${item.excerpt}</p>
              <b>Read article →</b>
            </a>`,
        )
        .join("")}
    </div>`;
}

function finalCta() {
  return `
    <section class="final-cta">
      <div>
        <span class="eyebrow">${contentValue("homepage", "finalCtaEyebrow", "READY FOR THE NEXT MOVE?")}</span>
        <h2>${contentValue("homepage", "finalCtaTitle", "Turn your commercial vision into reliable execution.")}</h2>
      </div>
      <a class="button button-primary" href="${contentValue("homepage", "finalCtaUrl", "/contact")}">${contentValue("homepage", "finalCtaLabel", "Start a conversation")} <span>↗</span></a>
    </section>`;
}

function homePage() {
  const categories = [
    ["Home Decor", "/assets/home-living.jpg"],
    ["In New", "/assets/apparel-accessories.jpg"],
    ["Decoration", "/assets/gifts-personalized-products.jpg"],
    ["Beauty Accessories", "/assets/beauty-personal-care.jpg"],
  ];

  return `
    <section class="hero">
      <div class="hero-glow hero-glow-one"></div>
      <div class="hero-glow hero-glow-two"></div>
      <div class="hero-inner">
        <div class="hero-copy">
          <span class="eyebrow">${contentValue("homepage", "heroEyebrow", "COMMERCE OPERATIONS, BUILT TO SCALE")}</span>
          <h1>${contentValue("homepage", "heroTitle", "Operate with confidence.")}<br /><span>${contentValue("homepage", "heroAccent", "Grow without limits.")}</span></h1>
          <p>${contentValue("homepage", "heroDescription", "OWNEX COMMERCE brings product development, standardized operations, and global fulfillment into one dependable commercial capability.")}</p>
          ${buttons()}
          <div class="hero-proof">
            <div><strong>Standardized</strong><span>Operating process</span></div>
            <div><strong>Controlled</strong><span>Quality at every step</span></div>
            <div><strong>Global-ready</strong><span>Commerce execution</span></div>
          </div>
        </div>
        <div class="hero-visual" aria-label="Custom product collection">
          <img class="hero-product hero-product-main" src="/assets/01-wooden-baseball-glove-sign-300x300-1.png" alt="Personalized wooden baseball glove sign" />
          <img class="hero-product hero-product-top" src="/assets/05-silly-goose-caps-300x240-1.png" alt="Embroidered custom cap" />
          <img class="hero-product hero-product-bottom" src="/assets/04-personalized-plant-pots-420x220-1.png" alt="Personalized plant pots" />
        </div>
      </div>
    </section>

    <section class="platforms">
      <span>Connect your commerce channels</span>
      <div class="platform-list"><strong>Shopify</strong><strong>Amazon</strong><strong>TikTok Shop</strong><strong>WooCommerce</strong><strong>Etsy</strong></div>
    </section>

    <section class="section categories">
      ${sectionHeading(
        contentValue("homepage", "categoryEyebrow", "EXPLORE THE CATALOG"),
        contentValue("homepage", "categoryTitle", "Product possibilities for every direction."),
        contentValue("homepage", "categoryDescription", "Start with a proven category, then shape the product around your commercial vision."),
      )}
      <div class="category-grid">
        ${categories
          .map(
            ([name, image]) => `
              <a class="category-card" href="/catalog">
                <div class="category-image"><img src="${image}" alt="" /></div>
                <span>Explore category</span><h3>${name}</h3><b>↗</b>
              </a>`,
          )
          .join("")}
      </div>
    </section>

    <section class="process">
      <div class="process-layout section">
        <div class="process-copy">
          <span class="eyebrow">ONE CLEAR OPERATING FLOW</span>
          <h2>From ambition to execution, without the guesswork.</h2>
          <p>A structured path creates clarity across development, quality, fulfillment, and growth.</p>
          <a class="inline-link" href="/solutions">See how OWNEX works <span>→</span></a>
        </div>
        <div class="process-grid">
          ${[
            ["01", "Define", "Clarify the product, market, and operating requirements."],
            ["02", "Develop", "Prepare samples, specifications, and quality standards."],
            ["03", "Execute", "Run production and fulfillment through a controlled flow."],
            ["04", "Improve", "Review performance and strengthen the next growth cycle."],
          ]
            .map(
              ([number, title, copy]) => `
                <article class="process-card"><span>${number}</span><div><h3>${title}</h3><p>${copy}</p></div></article>`,
            )
            .join("")}
        </div>
      </div>
    </section>

    <section class="section story">
      <div class="story-media">
        <img src="/assets/our-factory-4-1024x614.jpg" alt="Commerce operations team" />
      </div>
      <div class="story-copy">
        <span class="eyebrow">${contentValue("homepage", "storyEyebrow", "BUILT AROUND RELIABILITY")}</span>
        <h2>${contentValue("homepage", "storyTitle", "The operating confidence behind sustainable growth.")}</h2>
        <p>${contentValue("homepage", "storyDescription", "Growth becomes more predictable when product readiness, quality expectations, and order execution follow one consistent standard. OWNEX COMMERCE is built to make that standard repeatable.")}</p>
        <div class="metric-grid"><div><strong>1,000+</strong><span>Product possibilities</span></div><div><strong>24/7</strong><span>Operational visibility</span></div><div><strong>Global</strong><span>Fulfillment capability</span></div></div>
        <a class="button button-secondary" href="/about">Discover OWNEX <span>→</span></a>
      </div>
    </section>

    <section class="section solution-section">
      ${sectionHeading("END-TO-END CAPABILITY", "The right support at every stage.", "Choose a focused solution or connect the full operating journey.")}
      <div class="solution-grid">
        ${solutions
          .map(
            (item, index) => `
              <a class="solution-card solution-card-${index + 1}" href="/solutions/${item.slug}">
                <div><span>${item.kicker}</span><h3>${item.title}</h3><p>${item.copy}</p></div>
                <img src="${item.image}" alt="" /><b>Explore solution ↗</b>
              </a>`,
          )
          .join("")}
      </div>
    </section>

    <section class="section product-section">
      <div class="section-heading-row"><div><span class="eyebrow">SELECTED PRODUCTS</span><h2>Ready ideas. Flexible possibilities.</h2></div><a class="button button-secondary" href="/catalog">View full catalog <span>→</span></a></div>
      ${productGrid(products.slice(0, 4))}
    </section>

    <section class="advantage-section">
      <div class="section advantage-layout">
        <div class="advantage-heading"><span class="eyebrow">THE OWNEX ADVANTAGE</span><h2>Built for trust. Designed for progress.</h2></div>
        <div class="advantage-grid">
          ${[
            ["01", "Standardized operations", "Clear workflows make execution consistent and easier to scale."],
            ["02", "Quality by design", "Specifications and checkpoints are defined before volume grows."],
            ["03", "Commercial flexibility", "Capabilities adapt to product, channel, and market requirements."],
            ["04", "Responsive coordination", "A clear point of coordination keeps priorities moving forward."],
            ["05", "Growth visibility", "Useful operating information supports better commercial decisions."],
            ["06", "Continuous improvement", "Every cycle creates insight for stronger future execution."],
          ]
            .map(
              ([number, title, copy]) =>
                `<article class="advantage-card"><span>${number}</span><h3>${title}</h3><p>${copy}</p></article>`,
            )
            .join("")}
        </div>
      </div>
    </section>

    <section class="section scale-banner">
      <div><span class="eyebrow">PRODUCT. EXECUTION. GROWTH.</span><h2>One dependable capability for the next stage of commerce.</h2><p>Build new product opportunities while protecting the consistency your market expects.</p><a class="button button-light" href="/contact">Talk to our team <span>↗</span></a></div>
      <div class="scale-number"><small>PRODUCT POSSIBILITIES</small><strong>1,000+</strong><span>and growing</span></div>
    </section>

    <section class="section resource-section">
      <div class="section-heading-row"><div><span class="eyebrow">RESOURCES</span><h2>Ideas for stronger commerce operations.</h2></div><a class="inline-link" href="/resources">Explore all resources <span>→</span></a></div>
      ${resourceGrid()}
    </section>
    ${finalCta()}`;
}

function catalogPage() {
  const params = new URLSearchParams(window.location.search);
  const search = (params.get("search") || "").trim();
  const category = (params.get("category") || "").trim();
  const page = Math.max(1, Number.parseInt(params.get("page") || "1", 10) || 1);
  const perPage = Math.max(
    8,
    Number.parseInt(managedContent?.site?.catalogPageSize || "64", 10) || 64,
  );
  const group = catalogGroups.find((item) => item.name === category);
  const filtered = catalogProducts.filter((item) => {
    const itemCategories = item.categories || [item.category].filter(Boolean);
    const matchesCategory =
      !category ||
      itemCategories.includes(category) ||
      Boolean(group && group.children.some((child) => itemCategories.includes(child)));
    const haystack = `${item.name} ${itemCategories.join(" ")}`.toLowerCase();
    return matchesCategory && (!search || haystack.includes(search.toLowerCase()));
  });
  const pageCount = Math.max(1, Math.ceil(filtered.length / perPage));
  const currentPage = Math.min(page, pageCount);
  const visibleProducts = filtered.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage,
  );
  const linkFor = (nextPage) => {
    const next = new URLSearchParams();
    if (search) next.set("search", search);
    if (category) next.set("category", category);
    if (nextPage > 1) next.set("page", String(nextPage));
    const query = next.toString();
    return `/catalog${query ? `?${query}` : ""}`;
  };

  return `
    ${pageHero("PRODUCT CATALOG", "Find the right starting point.", "Explore customizable product directions prepared for dependable commercial execution.")}
    <section class="section catalog-page">
      <div class="catalog-layout">
        <aside class="catalog-categories" aria-label="Product categories">
          <h2>Categories</h2>
          <a class="catalog-all ${!category ? "active" : ""}" href="/catalog">All category</a>
          ${catalogGroups
            .map(
              (item) => `
                <div class="catalog-category-group">
                  <a class="${category === item.name ? "active" : ""}" href="/catalog?category=${encodeURIComponent(item.name)}">${item.name}</a>
                  <div>
                    ${item.children
                      .map(
                        (child) =>
                          `<a class="${category === child ? "active" : ""}" href="/catalog?category=${encodeURIComponent(child)}">${child}</a>`,
                      )
                      .join("")}
                  </div>
                </div>`,
            )
            .join("")}
        </aside>
        <div class="catalog-main">
          <div class="catalog-toolbar">
            <div>
              <strong>${filtered.length} products${category ? ` in ${category}` : ""}</strong>
              <span>Explore available products and categories</span>
            </div>
            <form id="catalog-search-form">
              <label>
                <span>Search products</span>
                <input id="product-search" name="search" value="${search}" placeholder="Search products or categories" />
              </label>
            </form>
          </div>
          <div id="catalog-results">
            ${
              visibleProducts.length
                ? catalogProductGrid(visibleProducts)
                : `<div class="empty-state"><h3>No matching products yet.</h3><p>Try another product name or category.</p></div>`
            }
          </div>
          ${
            pageCount > 1
              ? `<nav class="catalog-pagination" aria-label="Catalog pages">
                  ${currentPage > 1 ? `<a href="${linkFor(currentPage - 1)}">← Previous</a>` : "<span></span>"}
                  <strong>Page ${currentPage} of ${pageCount}</strong>
                  ${currentPage < pageCount ? `<a href="${linkFor(currentPage + 1)}">Next →</a>` : "<span></span>"}
                </nav>`
              : ""
          }
        </div>
      </div>
    </section>
    ${finalCta()}`;
}

function productPage(slug) {
  const item =
    catalogProducts.find((product) => product.slug === slug) ||
    products.find((product) => product.slug === slug) ||
    products[0];
  return `
    <section class="section product-detail">
      <div class="detail-image"><img src="${item.image}" alt="${item.name}" /></div>
      <div class="detail-copy">
        <div class="breadcrumbs"><a href="/">Home</a><span>·</span><a href="/catalog">Catalog</a><span>·</span><span>${item.category}</span></div>
        <span class="eyebrow">${item.category}</span><h1>${item.name}</h1><p>${item.description}</p>
        <ul><li>Flexible artwork and personalization options</li><li>Clear specifications and quality checkpoints</li><li>Packaging and fulfillment support available</li></ul>
        <a class="button button-primary" href="/contact">Request product details <span>↗</span></a>
      </div>
    </section>
    <section class="product-information"><div class="section"><span class="eyebrow">PRODUCT DEVELOPMENT</span><h2>Make the product fit the commercial vision.</h2><p>Material, finish, packaging, personalization, and operating requirements can be aligned through a clear development process before execution begins.</p></div></section>
    <section class="section related-products">${sectionHeading("KEEP EXPLORING", "Related product directions.")}${productGrid(products.slice(0, 4))}</section>
    ${finalCta()}`;
}

function solutionsPage() {
  return `
    ${pageHero("OWNEX SOLUTIONS", "A clearer path from vision to execution.", "Connect the capabilities you need across product development, commerce operations, and global fulfillment.")}
    <section class="section solution-list">
      ${solutions
        .map(
          (item, index) => `
            <article class="solution-row ${index % 2 ? "reverse" : ""}">
              <div class="solution-row-media"><img src="${item.image}" alt="" /></div>
              <div><span class="eyebrow">${item.kicker}</span><h2>${item.title}</h2><p>${item.copy}</p>
              <ul><li>Clear operating requirements</li><li>Standardized execution checkpoints</li><li>Visibility for continuous improvement</li></ul>
              <a class="button button-secondary" href="/solutions/${item.slug}">Explore this solution <span>→</span></a></div>
            </article>`,
        )
        .join("")}
    </section>
    ${finalCta()}`;
}

function solutionDetailPage(slug) {
  const item = solutions.find((solution) => solution.slug === slug) || solutions[0];
  return `
    <section class="solution-detail-hero">
      <div class="section solution-detail-layout">
        <div><span class="eyebrow">${item.kicker}</span><h1>${item.title}</h1><p>${item.copy}</p><a class="button button-primary" href="/contact">Discuss your requirements <span>↗</span></a></div>
        <img src="${item.image}" alt="" />
      </div>
    </section>
    <section class="section feature-section">
      ${sectionHeading("A STRUCTURED APPROACH", "Confidence is built into every step.", "Create clarity before execution, protect consistency while volume grows, and turn each cycle into useful operating insight.")}
      <div class="feature-grid">
        <article><span>01</span><h3>Align</h3><p>Define requirements, priorities, ownership, and the measures of a successful outcome.</p></article>
        <article><span>02</span><h3>Standardize</h3><p>Translate the plan into specifications, checkpoints, and a repeatable operating flow.</p></article>
        <article><span>03</span><h3>Execute</h3><p>Coordinate delivery with clear communication and visibility across critical milestones.</p></article>
      </div>
    </section>
    <section class="proof-band"><div class="section"><strong>Built for dependable outcomes.</strong><p>One accountable commercial capability, supported by standards that make execution clear and repeatable.</p></div></section>
    ${finalCta()}`;
}

function integrationsPage() {
  const channels = [
    ["Shopify", "/assets/shopify.jpg"],
    ["Amazon", "/assets/amazon.jpg"],
    ["TikTok Shop", "/assets/tiktokshop.jpg"],
    ["WooCommerce", "/assets/woocommerce.jpg"],
    ["Etsy", "/assets/esty.jpg"],
  ];
  return `
    ${pageHero("COMMERCE INTEGRATIONS", "Connect the channels that move your business.", "Bring order flow and operating coordination together across the platforms you already use.")}
    <section class="section integrations-page">
      <div class="integration-grid">
        ${channels
          .map(
            ([name, image]) =>
              `<article class="integration-card"><img src="${image}" alt="${name}" /><div><h3>${name}</h3><p>Connect channel requirements with a consistent operating and fulfillment workflow.</p><a href="/contact">Discuss integration <span>→</span></a></div></article>`,
          )
          .join("")}
      </div>
    </section>
    <section class="connection-band"><div class="section"><span class="eyebrow">ONE OPERATING VIEW</span><h2>Less fragmentation. More control.</h2><p>Integrations are most useful when the operating process around them is clear. OWNEX aligns channels, product requirements, and fulfillment priorities within one coordinated flow.</p></div></section>
    ${finalCta()}`;
}

function resourcesPage() {
  return `
    ${pageHero("OWNEX RESOURCES", "Practical thinking for stronger commerce.", "Explore focused insights on product readiness, quality, operating discipline, and sustainable growth.")}
    <section class="section resources-page">${resourceGrid()}</section>
    ${finalCta()}`;
}

function articlePage(slug) {
  const item = resources.find((resource) => resource.slug === slug) || resources[0];
  return `
    <article class="article-page">
      <div class="article-heading"><div class="breadcrumbs"><a href="/">Home</a><span>·</span><a href="/resources">Resources</a></div><span class="eyebrow">OPERATIONS • 6 MIN READ</span><h1>${item.title}</h1><p>${item.excerpt}</p></div>
      <img class="article-cover" src="${item.image}" alt="" />
      <div class="article-body">
        <p class="lead">Growth is easier to sustain when execution is designed before volume arrives. A clear operating framework protects the product, the customer experience, and the decisions that come next.</p>
        <h2>Start with the outcome</h2><p>Define what the product needs to achieve commercially, how success will be measured, and which requirements cannot be compromised. This turns a broad idea into a useful operating brief.</p>
        <h2>Make quality measurable</h2><p>Quality should be translated into specifications, checkpoints, and acceptance criteria. Clear standards make feedback more useful and reduce avoidable variation.</p>
        <blockquote>Reliable growth is not created by speed alone. It comes from making good execution repeatable.</blockquote>
        <h2>Build the feedback loop</h2><p>Review each cycle for practical insight: what worked, what created friction, and which change will strengthen the next run. The result is an operation that improves as it grows.</p>
      </div>
    </article>
    ${finalCta()}`;
}

function aboutPage() {
  return `
    ${pageHero("ABOUT OWNEX COMMERCE", "Built to make commercial ambition executable.", "OWNEX COMMERCE develops the operating clarity, standards, and coordination that help products move forward with confidence.")}
    <section class="section about-story">
      <div><span class="eyebrow">OUR POINT OF VIEW</span><h2>Growth needs a dependable operating foundation.</h2><p>We believe commercial progress becomes more sustainable when development, quality, execution, and fulfillment follow one clear standard. OWNEX COMMERCE is built around that belief.</p><p>Our role is to turn complex operating requirements into a coordinated path—so each product, order, and customer promise can be delivered consistently.</p></div>
      <img src="/assets/our-factory-4-1024x614.jpg" alt="OWNEX commerce operations" />
    </section>
    <section class="values-section"><div class="section">
      ${sectionHeading("WHAT GUIDES US", "Principles that protect progress.")}
      <div class="value-grid">
        <article><span>01</span><h3>Standardize the process</h3><p>Clear ways of working create dependable outcomes and stronger capability.</p></article>
        <article><span>02</span><h3>Control the journey</h3><p>Useful checkpoints protect quality from requirement through execution.</p></article>
        <article><span>03</span><h3>Commit to stability</h3><p>Reliable delivery creates the trust required for sustainable development.</p></article>
        <article><span>04</span><h3>Improve continuously</h3><p>Every operating cycle should create insight for the next one.</p></article>
      </div>
    </div></section>
    ${finalCta()}`;
}

function contactPage() {
  return `
    <section class="contact-page">
      <div class="section contact-layout">
        <div class="contact-details"><span class="eyebrow">START A CONVERSATION</span><h1>Tell us what you want to build next.</h1><p>Share the product, market, or operating challenge in front of you. Our team will help clarify the most useful next step.</p>
          <div class="contact-points"><div><span>01</span><p><strong>Business inquiries</strong><a href="mailto:hello@ownexcommerce.com">hello@ownexcommerce.com</a></p></div><div><span>02</span><p><strong>Response target</strong>Within one business day</p></div><div><span>03</span><p><strong>What to include</strong>Product direction, target market, and expected volume</p></div></div>
        </div>
        <form class="contact-form">
          <div class="field-row"><label>First name<input name="firstName" required /></label><label>Last name<input name="lastName" required /></label></div>
          <label>Business email<input type="email" name="email" required /></label>
          <label>Company<input name="company" /></label>
          <label>What would you like to explore?<select name="interest"><option>Product development</option><option>Commerce operations</option><option>Global fulfillment</option><option>Full operating journey</option></select></label>
          <label>Tell us about the opportunity<textarea name="message" rows="6" required placeholder="Product, market, volume, and timeline"></textarea></label>
          <button class="button button-primary" type="submit">Send inquiry <span>↗</span></button>
          <small class="form-note" aria-live="polite"></small>
        </form>
      </div>
    </section>`;
}

function helpPage() {
  const items = [
    ["How do I start a product request?", "Share the product direction, target market, expected volume, and timeline through the contact page. The team will help structure the next step."],
    ["Can OWNEX support product customization?", "Yes. Material, artwork, finish, packaging, and personalization requirements can be aligned during product development."],
    ["Which commerce channels are supported?", "The operating flow can support requirements across Shopify, Amazon, TikTok Shop, WooCommerce, Etsy, and other channels."],
    ["How are quality expectations handled?", "Quality requirements are translated into specifications and checkpoints before execution begins."],
    ["Can the solution grow with volume?", "The process is designed around standardization and continuous improvement, creating a stronger foundation as requirements expand."],
  ];
  return `
    ${pageHero("HELP CENTER", "Clear answers for the next step.", "Browse common questions or contact the OWNEX team for guidance specific to your requirements.")}
    <section class="section help-page">
      <div class="faq-list">${items.map(([q, a]) => `<details><summary>${q}<span>+</span></summary><p>${a}</p></details>`).join("")}</div>
      <aside class="help-aside"><span class="eyebrow">NEED MORE DETAIL?</span><h2>Talk through the requirement with us.</h2><p>A useful conversation starts with the product, market, expected volume, and what currently feels difficult.</p><a class="button button-primary" href="/contact">Contact OWNEX <span>↗</span></a></aside>
    </section>`;
}

function legalPage(type) {
  const privacy = type === "privacy";
  return `
    ${pageHero(privacy ? "PRIVACY" : "TERMS", privacy ? "Privacy statement." : "Website terms.", privacy ? "How information submitted through this website is handled." : "The terms that apply when accessing the OWNEX COMMERCE website.")}
    <section class="section legal-page">
      <p class="lead">Last updated: July 24, 2026</p>
      <h2>${privacy ? "Information we receive" : "Using this website"}</h2>
      <p>${privacy ? "We may receive information you choose to provide through inquiry and newsletter forms, including your name, business email, company, and project details." : "This website is provided for general business information. Content may be updated as OWNEX COMMERCE develops its services and commercial capabilities."}</p>
      <h2>${privacy ? "How information is used" : "Content and intellectual property"}</h2>
      <p>${privacy ? "Information is used to respond to inquiries, understand commercial requirements, and improve our communications. We do not sell submitted personal information." : "Text, visual design, and brand assets on this website are owned by or licensed to OWNEX COMMERCE and may not be reproduced without permission."}</p>
      <h2>Contact</h2><p>For questions, email <a href="mailto:hello@ownexcommerce.com">hello@ownexcommerce.com</a>.</p>
    </section>`;
}

function notFoundPage() {
  return `<section class="not-found"><span class="eyebrow">404</span><h1>This page has moved.</h1><p>Return to the homepage or continue exploring the OWNEX COMMERCE catalog.</p><div class="button-row"><a class="button button-primary" href="/">Go home</a><a class="button button-secondary" href="/catalog">View catalog</a></div></section>`;
}

function resolvePage(path) {
  const clean = path.replace(/\/+$/, "") || "/";
  if (clean === "/") return ["OWNEX COMMERCE — Operate with confidence", homePage()];
  if (clean === "/catalog") return ["Catalog — OWNEX COMMERCE", catalogPage()];
  if (clean.startsWith("/product/")) return ["Product — OWNEX COMMERCE", productPage(clean.split("/").pop())];
  if (clean === "/solutions") return ["Solutions — OWNEX COMMERCE", solutionsPage()];
  if (clean.startsWith("/solutions/")) return ["Solution — OWNEX COMMERCE", solutionDetailPage(clean.split("/").pop())];
  if (clean === "/integrations") return ["Integrations — OWNEX COMMERCE", integrationsPage()];
  if (clean === "/resources") return ["Resources — OWNEX COMMERCE", resourcesPage()];
  if (clean.startsWith("/blog/")) return ["Resources — OWNEX COMMERCE", articlePage(clean.split("/").pop())];
  if (clean === "/about") return ["About — OWNEX COMMERCE", aboutPage()];
  if (clean === "/contact") return ["Contact — OWNEX COMMERCE", contactPage()];
  if (clean === "/help" || clean === "/faq") return ["Help — OWNEX COMMERCE", helpPage()];
  if (clean === "/privacy") return ["Privacy — OWNEX COMMERCE", legalPage("privacy")];
  if (clean === "/terms") return ["Terms — OWNEX COMMERCE", legalPage("terms")];
  return ["Page not found — OWNEX COMMERCE", notFoundPage()];
}

function bindPageInteractions() {
  const catalogSearch = document.querySelector("#catalog-search-form");
  if (catalogSearch) {
    catalogSearch.addEventListener("submit", (event) => {
      event.preventDefault();
      const params = new URLSearchParams(window.location.search);
      const query = catalogSearch.elements.search.value.trim();
      if (query) params.set("search", query);
      else params.delete("search");
      params.delete("page");
      const target = `/catalog${params.toString() ? `?${params}` : ""}`;
      window.history.pushState({}, "", target);
      render("/catalog");
    });
  }

  document.querySelectorAll(".header-search").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const query = form.elements.search.value.trim();
      const target = query ? `/catalog?search=${encodeURIComponent(query)}` : "/catalog";
      window.history.pushState({}, "", target);
      render("/catalog");
    });
  });

  document.querySelectorAll(".newsletter-form").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      form.querySelector(".form-note").textContent =
        "Thank you — this preview has recorded the interaction locally.";
    });
  });

  const contact = document.querySelector(".contact-form");
  if (contact) {
    contact.addEventListener("submit", async (event) => {
      event.preventDefault();
      const note = contact.querySelector(".form-note");
      const submit = contact.querySelector('button[type="submit"]');
      const formData = new FormData(contact);
      submit.disabled = true;
      note.textContent = "Sending...";
      try {
        const response = await fetch("/api/public/inquiries", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(Object.fromEntries(formData.entries())),
        });
        if (!response.ok) throw new Error("Unable to send");
        contact.reset();
        note.textContent =
          "Thank you. Your request has been recorded and our team will contact you shortly.";
      } catch {
        note.textContent =
          "We could not send this request. Please email us directly.";
      } finally {
        submit.disabled = false;
      }
    });
  }
}

function render(path = window.location.pathname) {
  const [title, content] = resolvePage(path);
  document.title = title;
  document.querySelector("#app").innerHTML = `${header()}<main>${content}</main>${footer()}`;
  bindPageInteractions();
  window.scrollTo({ top: 0, behavior: "instant" });
}

async function loadManagedData() {
  try {
    const [contentResponse, productsResponse, postsResponse, categoriesResponse] =
      await Promise.all([
        fetch("/data/content.json", { cache: "no-store" }),
        fetch("/data/products.json", { cache: "no-store" }),
        fetch("/data/posts.json", { cache: "no-store" }),
        fetch("/data/categories.json", { cache: "no-store" }),
      ]);
    if (
      !contentResponse.ok ||
      !productsResponse.ok ||
      !postsResponse.ok ||
      !categoriesResponse.ok
    ) {
      throw new Error("Managed content unavailable");
    }
    const [contentPayload, productsPayload, postsPayload, categoriesPayload] =
      await Promise.all([
        contentResponse.json(),
        productsResponse.json(),
        postsResponse.json(),
        categoriesResponse.json(),
      ]);
    managedContent = {
      homepage: contentPayload.homepage || {},
      site: { ...managedContent.site, ...(contentPayload.site || {}) },
    };
    document.documentElement.style.setProperty(
      "--catalog-columns",
      String(
        Math.max(
          2,
          Math.min(5, Number(managedContent.site.catalogColumns) || 4),
        ),
      ),
    );
    if (
      Array.isArray(productsPayload.products) &&
      productsPayload.products.length
    ) {
      catalogProducts = productsPayload.products.map((item) => {
        const categories = (item.categories || []).map((category) =>
          decodeCatalogText(category.name),
        );
        return {
          slug: item.slug,
          name: decodeCatalogText(item.name),
          category: categories[0] || "In New",
          categories,
          image:
            item.images?.[0]?.src ||
            "/assets/gifts-personalized-products.jpg",
          description:
            decodeCatalogText(item.summary || "") ||
            "Custom product available through the synchronized OWNEX COMMERCE catalog.",
          price: Number(item.price),
          currencySymbol: item.currencySymbol || "$",
        };
      });
    }
    if (Array.isArray(postsPayload.posts) && postsPayload.posts.length) {
      resources = postsPayload.posts.map((item) => ({
        slug: item.slug,
        title: decodeCatalogText(item.title),
        image: item.image || "/assets/high-quality-better-value-1.jpg",
        excerpt: decodeCatalogText(item.excerpt || ""),
        body: item.body || "",
      }));
    }
    if (
      Array.isArray(categoriesPayload.groups) &&
      categoriesPayload.groups.length
    ) {
      catalogGroups = categoriesPayload.groups;
    }
  } catch {
    try {
      const response = await fetch("/data/products.json");
      if (!response.ok) return;
      const payload = await response.json();
      if (!Array.isArray(payload.products) || !payload.products.length) return;
      catalogProducts = payload.products.map((item) => {
        const categories = (item.categories || []).map((category) =>
          decodeCatalogText(category.name),
        );
        return {
          slug: item.slug,
          name: decodeCatalogText(item.name),
          category: categories[0] || "In New",
          categories,
          image:
            item.images?.[0]?.src ||
            "/assets/gifts-personalized-products.jpg",
          description:
            decodeCatalogText(item.summary || "") ||
            "Custom product available through the synchronized OWNEX COMMERCE catalog.",
          price: Number(item.price),
          currencySymbol: item.currencySymbol || "$",
        };
      });
    } catch {
      catalogProducts = [...products];
    }
  }
}

document.addEventListener("click", (event) => {
  const link = event.target.closest("a");
  if (
    !link ||
    link.origin !== window.location.origin ||
    link.target ||
    link.hasAttribute("download") ||
    link.href.startsWith("mailto:")
  ) {
    return;
  }
  event.preventDefault();
  window.history.pushState({}, "", `${link.pathname}${link.search}`);
  render(link.pathname);
});

window.addEventListener("popstate", () => render());
loadManagedData().finally(() => render());
