(() => {
  const STORAGE_KEY = "ownex-language";
  const SUPPORTED = new Set(["vi", "en"]);
  const textOrigins = new WeakMap();
  const attributeOrigins = new WeakMap();
  let scheduled = false;

  const vi = {
    "About Us": "Về chúng tôi",
    "About OWNEX": "Về OWNEX",
    "Contact": "Liên hệ",
    "Catalog": "Danh mục",
    "Services": "Dịch vụ",
    "Product Development": "Phát triển sản phẩm",
    "Commerce Operations": "Vận hành thương mại",
    "Global Fulfillment": "Hoàn tất đơn hàng toàn cầu",
    "Blog": "Bài viết",
    "Support": "Hỗ trợ",
    "Help center": "Trung tâm trợ giúp",
    "FAQs": "Câu hỏi thường gặp",
    "What are you looking?": "Bạn đang tìm gì?",
    "Search products": "Tìm kiếm sản phẩm",
    "Start a project": "Bắt đầu dự án",
    "Open menu": "Mở menu",
    "Close menu": "Đóng menu",
    "Primary navigation": "Điều hướng chính",
    "Mobile navigation": "Điều hướng di động",

    "FULFILLMENT MADE SIMPLE": "HOÀN TẤT ĐƠN HÀNG ĐƠN GIẢN",
    "Build products.": "Phát triển sản phẩm.",
    "Ship with confidence.": "Giao hàng vững tin.",
    "Product development, production support, quality control, packing, and global fulfillment in one dependable workflow.": "Phát triển sản phẩm, hỗ trợ sản xuất, kiểm soát chất lượng, đóng gói và hoàn tất đơn hàng toàn cầu trong một quy trình đáng tin cậy.",
    "View catalog": "Xem danh mục",
    "Start without inventory": "Bắt đầu không cần tồn kho",
    "Processing workflow": "Quy trình xử lý",
    "Global": "Toàn cầu",
    "Shipping capability": "Năng lực vận chuyển",
    "Factory-backed": "Nền tảng nhà máy",
    "Quality checked before shipping": "Kiểm tra chất lượng trước khi giao",
    "Connect your commerce channels": "Kết nối các kênh bán hàng",

    "PRODUCT CATEGORIES": "DANH MỤC SẢN PHẨM",
    "Ready directions for your next launch": "Gợi ý sẵn sàng cho lần ra mắt tiếp theo",
    "Explore all products": "Khám phá tất cả sản phẩm",
    "Home Decor": "Trang trí nhà cửa",
    "Apparel": "Thời trang",
    "Personalized Gifts": "Quà tặng cá nhân hóa",
    "Beauty & Care": "Làm đẹp & chăm sóc",
    "Seasonal Products": "Sản phẩm theo mùa",
    "View products": "Xem sản phẩm",

    "SIMPLE OPERATING FLOW": "QUY TRÌNH VẬN HÀNH ĐƠN GIẢN",
    "Send the requirement. We prepare, check, and ship.": "Gửi yêu cầu. Chúng tôi chuẩn bị, kiểm tra và giao hàng.",
    "Choose or develop": "Lựa chọn hoặc phát triển",
    "Select a product direction or prepare a custom specification.": "Chọn hướng sản phẩm hoặc chuẩn bị thông số tùy chỉnh.",
    "Produce and inspect": "Sản xuất và kiểm tra",
    "Production follows defined standards with quality checkpoints.": "Sản xuất theo tiêu chuẩn đã xác định với các điểm kiểm soát chất lượng.",
    "Pack and fulfill": "Đóng gói và hoàn tất",
    "Orders are packed, labeled, and prepared for global delivery.": "Đơn hàng được đóng gói, dán nhãn và chuẩn bị để giao toàn cầu.",

    "REAL PRODUCTION CAPABILITY": "NĂNG LỰC SẢN XUẤT THỰC TẾ",
    "Factory-backed execution from Vietnam": "Vận hành dựa trên nhà máy tại Việt Nam",
    "Bring product development, packaging, quality control, and fulfillment into one coordinated operating flow.": "Kết nối phát triển sản phẩm, đóng gói, kiểm soát chất lượng và hoàn tất đơn hàng trong một quy trình phối hợp.",
    "Product possibilities": "Khả năng sản phẩm",
    "Operational support": "Hỗ trợ vận hành",
    "Fulfillment reach": "Phạm vi hoàn tất đơn hàng",
    "Learn about OWNEX": "Tìm hiểu về OWNEX",

    "SERVICES": "DỊCH VỤ",
    "Support built around better control and growth": "Hỗ trợ được xây dựng để kiểm soát và tăng trưởng tốt hơn",
    "Product development": "Phát triển sản phẩm",
    "Turn concepts into production-ready products through sampling and specifications.": "Biến ý tưởng thành sản phẩm sẵn sàng sản xuất thông qua mẫu và thông số.",
    "Commerce operations": "Vận hành thương mại",
    "Coordinate production, quality, order processing, and workflow visibility.": "Phối hợp sản xuất, chất lượng, xử lý đơn hàng và khả năng theo dõi quy trình.",
    "Global fulfillment": "Hoàn tất đơn hàng toàn cầu",
    "Prepare, pack, and deliver orders through a dependable fulfillment system.": "Chuẩn bị, đóng gói và giao đơn hàng qua hệ thống hoàn tất đáng tin cậy.",
    "Discover service": "Khám phá dịch vụ",

    "TRENDING PRODUCTS": "SẢN PHẨM NỔI BẬT",
    "Launch ideas for every season": "Ý tưởng ra mắt cho mọi mùa",
    "View product": "Xem sản phẩm",
    "Personalized Baseball Glove Sign": "Biển găng bóng chày cá nhân hóa",
    "Premium Printed T-Shirt": "Áo thun in cao cấp",
    "Graduation Teddy Bear": "Gấu bông tốt nghiệp",
    "Custom Ceramic Plant Pot": "Chậu cây gốm tùy chỉnh",
    "Embroidered Lifestyle Cap": "Mũ thêu phong cách",

    "Lower cost": "Chi phí tối ưu",
    "Better control": "Kiểm soát tốt hơn",
    "Faster launch": "Ra mắt nhanh hơn",
    "White-label ready": "Sẵn sàng nhãn riêng",

    "WHY OWNEX": "VÌ SAO CHỌN OWNEX",
    "Fulfillment support built for serious sellers": "Hỗ trợ hoàn tất đơn hàng dành cho nhà bán hàng chuyên nghiệp",
    "Factory-backed production": "Sản xuất dựa trên nhà máy",
    "Real production capability supports stronger cost and quality control.": "Năng lực sản xuất thực tế giúp kiểm soát chi phí và chất lượng tốt hơn.",
    "Fast operating workflow": "Quy trình vận hành nhanh",
    "Defined preparation and packing steps keep orders moving.": "Các bước chuẩn bị và đóng gói rõ ràng giúp đơn hàng vận hành liên tục.",
    "Quality before shipping": "Chất lượng trước khi giao",
    "Products, variants, and packing requirements are reviewed.": "Sản phẩm, biến thể và yêu cầu đóng gói đều được kiểm tra.",
    "Better commercial margin": "Biên lợi nhuận tốt hơn",
    "Reduce unnecessary middle steps and improve cost visibility.": "Giảm các bước trung gian không cần thiết và minh bạch chi phí.",
    "White-label ready": "Sẵn sàng nhãn riêng",
    "Use custom packaging, labels, inserts, and brand presentation.": "Sử dụng bao bì, nhãn, tờ chèn và hình ảnh thương hiệu tùy chỉnh.",
    "Multi-platform support": "Hỗ trợ đa nền tảng",
    "Connect major marketplaces, stores, CSV, API, or custom workflows.": "Kết nối sàn thương mại điện tử, cửa hàng, CSV, API hoặc quy trình tùy chỉnh.",
    "Wide product catalog": "Danh mục sản phẩm đa dạng",
    "Build campaigns and collections from flexible product directions.": "Xây dựng chiến dịch và bộ sưu tập từ nhiều hướng sản phẩm linh hoạt.",
    "Responsive support": "Hỗ trợ nhanh chóng",
    "Get help with orders, fulfillment updates, and special requirements.": "Nhận hỗ trợ về đơn hàng, cập nhật hoàn tất và yêu cầu đặc biệt.",

    "SEASONAL CAMPAIGN SUPPORT": "HỖ TRỢ CHIẾN DỊCH THEO MÙA",
    "Turn trends into product opportunities": "Biến xu hướng thành cơ hội sản phẩm",
    "Launch seasonal products faster with development, branding, packing, and fulfillment support.": "Ra mắt sản phẩm theo mùa nhanh hơn với hỗ trợ phát triển, thương hiệu, đóng gói và hoàn tất đơn hàng.",
    "Shop the collection": "Xem bộ sưu tập",
    "PRODUCT OPTIONS": "LỰA CHỌN SẢN PHẨM",
    "and growing": "và tiếp tục tăng",

    "SELLER RESOURCES": "TÀI NGUYÊN NHÀ BÁN HÀNG",
    "Guides for smarter commerce operations": "Hướng dẫn vận hành thương mại hiệu quả hơn",
    "View all resources": "Xem tất cả tài nguyên",
    "How to prepare custom products for scalable growth": "Cách chuẩn bị sản phẩm tùy chỉnh để tăng trưởng quy mô",
    "Build a reliable fulfillment workflow from day one": "Xây dựng quy trình hoàn tất đáng tin cậy ngay từ đầu",
    "Quality standards that support sustainable scale": "Tiêu chuẩn chất lượng hỗ trợ tăng trưởng bền vững",
    "OPERATIONS": "VẬN HÀNH",
    "Read article": "Đọc bài viết",

    "FACTORY-BACKED FULFILLMENT": "HOÀN TẤT ĐƠN HÀNG DỰA TRÊN NHÀ MÁY",
    "Start with one product. Scale with confidence.": "Bắt đầu với một sản phẩm. Mở rộng với sự tự tin.",
    "Talk to our team": "Trao đổi với đội ngũ",

    "Standardized commerce operations that turn ambition into reliable execution and sustainable growth.": "Vận hành thương mại tiêu chuẩn hóa, biến tham vọng thành thực thi đáng tin cậy và tăng trưởng bền vững.",
    "Explore": "Khám phá",
    "Product catalog": "Danh mục sản phẩm",
    "Solutions": "Giải pháp",
    "Integrations": "Tích hợp",
    "Resources": "Tài nguyên",
    "Company": "Công ty",
    "STAY INFORMED": "CẬP NHẬT THÔNG TIN",
    "Commerce insights, built for action.": "Kiến thức thương mại có thể áp dụng.",
    "Practical updates on products, operations, quality, and growth.": "Cập nhật thực tế về sản phẩm, vận hành, chất lượng và tăng trưởng.",
    "Business email": "Email công việc",
    "Subscribe": "Đăng ký",
    "Privacy": "Quyền riêng tư",
    "Terms": "Điều khoản",
    "© 2026 OWNEX COMMERCE. All rights reserved.": "© 2026 OWNEX COMMERCE. Bảo lưu mọi quyền.",

    "PRODUCT CATALOG": "DANH MỤC SẢN PHẨM",
    "Find the right starting point.": "Tìm điểm khởi đầu phù hợp.",
    "Explore customizable product directions prepared for dependable commercial execution.": "Khám phá các hướng sản phẩm tùy chỉnh được chuẩn bị cho vận hành thương mại đáng tin cậy.",
    "Contact for price": "Liên hệ báo giá",
    "View full catalog": "Xem toàn bộ danh mục",
    "View website": "Xem website"
  };

  const dictionary = { vi, en: {} };
  const originalTitle = document.title;

  const resolveLanguage = () => {
    const fromQuery = new URLSearchParams(window.location.search).get("lang");
    if (SUPPORTED.has(fromQuery)) return fromQuery;
    const stored = localStorage.getItem(STORAGE_KEY);
    return SUPPORTED.has(stored) ? stored : "vi";
  };

  let language = resolveLanguage();

  const translated = (value) => {
    if (language === "en") return value;
    return dictionary.vi[value] || value;
  };

  const preserveWhitespace = (source, value) => {
    const leading = source.match(/^\s*/)?.[0] || "";
    const trailing = source.match(/\s*$/)?.[0] || "";
    return `${leading}${value}${trailing}`;
  };

  const translateTextNode = (node) => {
    if (!textOrigins.has(node)) textOrigins.set(node, node.nodeValue || "");
    const source = textOrigins.get(node) || "";
    const key = source.trim();
    if (!key) return;
    const next = language === "en" ? source : preserveWhitespace(source, translated(key));
    if (node.nodeValue !== next) node.nodeValue = next;
  };

  const translateAttributes = (element) => {
    const names = ["placeholder", "aria-label", "title", "alt"];
    let originals = attributeOrigins.get(element);
    if (!originals) {
      originals = new Map();
      attributeOrigins.set(element, originals);
    }

    names.forEach((name) => {
      if (!element.hasAttribute(name)) return;
      if (!originals.has(name)) originals.set(name, element.getAttribute(name) || "");
      const source = originals.get(name) || "";
      const next = language === "en" ? source : translated(source);
      if (element.getAttribute(name) !== next) element.setAttribute(name, next);
    });
  };

  const translateTree = (root = document.body) => {
    if (!root) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!parent || parent.closest("script, style, code, pre, textarea, [data-no-i18n]")) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      },
    });

    let node;
    while ((node = walker.nextNode())) translateTextNode(node);
    root.querySelectorAll?.("[placeholder], [aria-label], [title], [alt]").forEach(translateAttributes);

    document.documentElement.lang = language === "vi" ? "vi" : "en";
    document.title = language === "vi" ? "OWNEX COMMERCE — Vận hành vững tin" : originalTitle;
  };

  const switcherMarkup = (mobile = false) => `
    <div class="ownex-language-switcher${mobile ? " ownex-language-switcher--mobile" : ""}" role="group" aria-label="Chọn ngôn ngữ" data-language-switcher>
      <button type="button" data-language="vi" aria-label="Tiếng Việt">VI</button>
      <button type="button" data-language="en" aria-label="English">EN</button>
    </div>`;

  const updateSwitchers = () => {
    document.querySelectorAll("[data-language-switcher] button").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.language === language));
    });
  };

  const bindSwitcher = (switcher) => {
    if (switcher.dataset.bound === "true") return;
    switcher.dataset.bound = "true";
    switcher.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-language]");
      if (!button) return;
      setLanguage(button.dataset.language);
    });
  };

  const ensureSwitchers = () => {
    const actions = document.querySelector(".ownex-new-header__actions");
    if (actions && !actions.querySelector("[data-language-switcher]")) {
      actions.insertAdjacentHTML("afterbegin", switcherMarkup(false));
    }

    const mobilePanel = document.querySelector(".ownex-new-header__mobile-panel");
    if (mobilePanel && !mobilePanel.querySelector("[data-language-switcher]")) {
      mobilePanel.insertAdjacentHTML("afterbegin", switcherMarkup(true));
    }

    document.querySelectorAll("[data-language-switcher]").forEach(bindSwitcher);
    updateSwitchers();
  };

  const apply = () => {
    scheduled = false;
    ensureSwitchers();
    translateTree(document.body);
    updateSwitchers();
  };

  const scheduleApply = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(apply);
  };

  const setLanguage = (next) => {
    if (!SUPPORTED.has(next)) return;
    language = next;
    localStorage.setItem(STORAGE_KEY, next);
    apply();
    window.dispatchEvent(new CustomEvent("ownex:languagechange", { detail: { language } }));
  };

  window.OWNEX_I18N = {
    getLanguage: () => language,
    setLanguage,
    translate: (value) => translated(value),
  };

  const start = () => {
    apply();
    new MutationObserver(scheduleApply).observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["placeholder", "aria-label", "title", "alt"],
    });
    window.addEventListener("popstate", scheduleApply);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
