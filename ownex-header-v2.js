(() => {
  const headerMarkup = (legacyHeader) => {
    const legacyCta = legacyHeader?.querySelector('.button-primary');
    const ctaHref = legacyCta?.getAttribute('href') || '/contact';
    const ctaText = legacyCta?.textContent?.replace('↗', '').trim() || 'Start a project';

    return `
      <header class="ownex-new-header" data-ownex-new-header>
        <div class="ownex-new-header__inner">
          <a class="ownex-new-header__brand" href="/" aria-label="OWNEX Commerce home">
            <span class="ownex-new-header__brand-main">OWNE<span>X</span></span>
            <span class="ownex-new-header__brand-sub">COMMERCE</span>
          </a>

          <nav class="ownex-new-header__nav" aria-label="Primary navigation">
            <div class="ownex-new-header__item">
              <a class="ownex-new-header__link" href="/about">About Us <span class="ownex-new-header__caret" aria-hidden="true"></span></a>
              <div class="ownex-new-header__dropdown">
                <a href="/about">About OWNEX</a>
                <a href="/contact">Contact</a>
              </div>
            </div>

            <div class="ownex-new-header__item">
              <a class="ownex-new-header__link" href="/catalog">Catalog</a>
            </div>

            <div class="ownex-new-header__item">
              <a class="ownex-new-header__link" href="/solutions">Services <span class="ownex-new-header__caret" aria-hidden="true"></span></a>
              <div class="ownex-new-header__dropdown">
                <a href="/solutions/product-development">Product Development</a>
                <a href="/solutions/commerce-operations">Commerce Operations</a>
                <a href="/solutions/global-fulfillment">Global Fulfillment</a>
              </div>
            </div>

            <div class="ownex-new-header__item">
              <a class="ownex-new-header__link" href="/resources">Blog</a>
            </div>

            <div class="ownex-new-header__item">
              <a class="ownex-new-header__link" href="/help">Support <span class="ownex-new-header__caret" aria-hidden="true"></span></a>
              <div class="ownex-new-header__dropdown">
                <a href="/help">Help center</a>
                <a href="/faq">FAQs</a>
                <a href="/contact">Contact</a>
              </div>
            </div>
          </nav>

          <div class="ownex-new-header__actions">
            <form class="ownex-new-header__search" role="search">
              <span class="ownex-new-header__search-icon" aria-hidden="true"></span>
              <input type="search" name="search" aria-label="Search products" placeholder="What are you looking?" />
            </form>
            <a class="ownex-new-header__cta" href="${ctaHref}">${ctaText} <span aria-hidden="true">↗</span></a>
          </div>

          <button class="ownex-new-header__mobile-button" type="button" aria-label="Open menu" aria-expanded="false"><span></span></button>
          <nav class="ownex-new-header__mobile-panel" aria-label="Mobile navigation">
            <a href="/about">About Us</a>
            <a href="/catalog">Catalog</a>
            <a href="/solutions">Services</a>
            <a href="/resources">Blog</a>
            <a href="/help">Support</a>
            <a class="ownex-new-header__cta" href="${ctaHref}">${ctaText} <span aria-hidden="true">↗</span></a>
          </nav>
        </div>
      </header>`;
  };

  const bindHeader = (header) => {
    const mobileButton = header.querySelector('.ownex-new-header__mobile-button');
    const searchForm = header.querySelector('.ownex-new-header__search');

    mobileButton?.addEventListener('click', () => {
      const open = header.classList.toggle('is-open');
      mobileButton.setAttribute('aria-expanded', String(open));
      mobileButton.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });

    header.querySelectorAll('.ownex-new-header__mobile-panel a').forEach((link) => {
      link.addEventListener('click', () => {
        header.classList.remove('is-open');
        mobileButton?.setAttribute('aria-expanded', 'false');
        mobileButton?.setAttribute('aria-label', 'Open menu');
      });
    });

    searchForm?.addEventListener('submit', (event) => {
      event.preventDefault();
      const query = new FormData(searchForm).get('search')?.toString().trim() || '';
      window.location.href = query ? `/catalog?search=${encodeURIComponent(query)}` : '/catalog';
    });
  };

  const replaceLegacyHeader = () => {
    const legacyHeader = document.querySelector('.site-header');
    if (!legacyHeader) return;

    const template = document.createElement('template');
    template.innerHTML = headerMarkup(legacyHeader).trim();
    const newHeader = template.content.firstElementChild;
    legacyHeader.replaceWith(newHeader);
    bindHeader(newHeader);
  };

  const start = () => {
    replaceLegacyHeader();

    const app = document.getElementById('app');
    if (!app) return;

    const observer = new MutationObserver(() => replaceLegacyHeader());
    observer.observe(app, { childList: true, subtree: true });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
