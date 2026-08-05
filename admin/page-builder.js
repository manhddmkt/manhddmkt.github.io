(() => {
  const clone = (v) => JSON.parse(JSON.stringify(v));
  const SOURCES = [
    ["hero", "Hero", "hero"],
    ["channels", "Kênh bán hàng", "channels"],
    ["categories", "Danh mục sản phẩm", "categories"],
    ["process", "Quy trình", "process"],
    ["factory", "Năng lực nhà máy", "factory"],
    ["services", "Dịch vụ", "services"],
    ["products", "Sản phẩm nổi bật", "products"],
    ["benefit-strip", "Thanh lợi ích", "benefit-strip"],
    ["benefits", "Lợi thế OWNEX", "benefits"],
    ["campaign", "Banner chiến dịch", "campaign"],
    ["resources", "Tài nguyên", "resources"],
    ["final", "CTA cuối trang", "final"]
  ];
  const DEFAULT = {
    version: 1,
    globals: {
      primaryColor: "#1769e0",
      navyColor: "#0b2342",
      softColor: "#f4f8ff",
      siteWidth: 1280,
      sectionSpacing: 88,
      defaultLanguage: "vi",
      header: { showSearch: true },
      footer: {}
    },
    sections: SOURCES.map(([source, name, type]) => ({
      id: source,
      source,
      name,
      type,
      enabled: true,
      style: { background: "", textColor: "", paddingY: "", columns: "" },
      content: { vi: {}, en: {} },
      items: null
    }))
  };

  const TYPE_LABELS = {
    hero: "Hero",
    channels: "Kênh bán hàng",
    categories: "Danh mục",
    process: "Quy trình",
    factory: "Ảnh + nội dung",
    services: "Dịch vụ",
    products: "Sản phẩm",
    "benefit-strip": "Thanh lợi ích",
    benefits: "Lợi thế",
    campaign: "Banner",
    resources: "Tài nguyên",
    final: "CTA",
    custom: "Khối tùy chỉnh"
  };

  function ensureBuilder() {
    const homepage = state.content.homepage || (state.content.homepage = {});
    if (!homepage.pageBuilder?.sections) homepage.pageBuilder = clone(DEFAULT);
    homepage.pageBuilder.globals = { ...clone(DEFAULT.globals), ...(homepage.pageBuilder.globals || {}) };
    return homepage.pageBuilder;
  }

  async function saveBuilder(message = "Update homepage page builder from OWNEX Admin") {
    await saveJsonFile("content", state.content, message);
  }

  function card(section, index) {
    const vi = section.content?.vi || {};
    return `<article class="pb-admin-card ${section.enabled === false ? "is-off" : ""}" draggable="true" data-pb-id="${escapeHtml(section.id)}">
      <div class="pb-admin-handle">⋮⋮</div>
      <div class="pb-admin-info"><div><span class="status">${index + 1}</span><b>${escapeHtml(section.name)}</b></div><small>${escapeHtml(TYPE_LABELS[section.type] || section.type)} · ${escapeHtml(vi.title || vi.eyebrow || "Dùng nội dung hiện tại")}</small></div>
      <label class="pb-admin-toggle"><input type="checkbox" data-pb-toggle ${section.enabled !== false ? "checked" : ""}><span>${section.enabled !== false ? "Hiển thị" : "Đang ẩn"}</span></label>
      <div class="pb-admin-actions">
        <button type="button" class="icon-button" data-pb-up>↑</button>
        <button type="button" class="icon-button" data-pb-down>↓</button>
        <button type="button" class="text-button" data-pb-edit>Chỉnh sửa</button>
        <button type="button" class="text-button" data-pb-copy>Nhân bản</button>
        <button type="button" class="text-button danger" data-pb-delete>Xóa</button>
      </div>
    </article>`;
  }

  function builderView() {
    const b = ensureBuilder(), g = b.globals;
    return `<section class="panel"><div class="panel-head"><div><span class="eyebrow">PAGE BUILDER</span><h2>Toàn quyền cấu trúc website</h2><p>Kéo thả, bật/tắt, nhân bản, xóa và chỉnh nội dung song ngữ của từng section.</p></div><div class="toolbar"><button type="button" class="primary-button" data-pb-publish>Lưu & xuất bản</button></div></div></section>
    <section class="panel"><div class="panel-head"><div><span class="eyebrow">GIAO DIỆN TOÀN CỤC</span><h2>Màu sắc, kích thước, Header và Footer</h2></div></div>
      <form class="panel-body form-grid" id="pbGlobalsForm">
        ${field("Màu chính","primaryColor",g.primaryColor,{type:"color"})}
        ${field("Màu navy","navyColor",g.navyColor,{type:"color"})}
        ${field("Màu nền nhạt","softColor",g.softColor,{type:"color"})}
        ${field("Chiều rộng nội dung","siteWidth",g.siteWidth,{type:"number",min:960,max:1800})}
        ${field("Khoảng cách section","sectionSpacing",g.sectionSpacing,{type:"number",min:24,max:180})}
        <label><span>Ngôn ngữ mặc định</span><select name="defaultLanguage"><option value="vi" ${g.defaultLanguage==="vi"?"selected":""}>Tiếng Việt</option><option value="en" ${g.defaultLanguage==="en"?"selected":""}>English</option></select></label>
        <label class="pb-admin-check"><input type="checkbox" name="showSearch" ${g.header?.showSearch!==false?"checked":""}><span>Hiển thị ô tìm kiếm</span></label>
        ${field("Nút Header VI","headerCtaVi",g.header?.cta?.vi||"Bắt đầu dự án")}
        ${field("Nút Header EN","headerCtaEn",g.header?.cta?.en||"Start a project")}
        ${field("Link nút Header","headerCtaHref",g.header?.cta?.href||"/contact")}
        ${field("Email Footer","footerEmail",g.footer?.email||"hello@ownexcommerce.com")}
        ${field("Mô tả Footer VI","footerVi",g.footer?.vi||"",{type:"textarea",wide:true})}
        ${field("Mô tả Footer EN","footerEn",g.footer?.en||"",{type:"textarea",wide:true})}
        <label class="wide"><span>Menu Header (JSON)</span><textarea class="pb-json" name="headerNav">${escapeHtml(JSON.stringify(g.header?.nav||[],null,2))}</textarea></label>
        <label class="wide"><span>Cột Footer (JSON)</span><textarea class="pb-json" name="footerColumns">${escapeHtml(JSON.stringify(g.footer?.columns||[],null,2))}</textarea></label>
        <div class="form-actions"><button class="primary-button" type="submit">Lưu thiết kế chung</button></div>
      </form>
    </section>
    <section class="panel"><div class="panel-head"><div><span class="eyebrow">TRANG CHỦ</span><h2>${b.sections.length} section</h2><p>Kéo thả hoặc dùng mũi tên để sắp xếp.</p></div><div class="pb-admin-add"><select id="pbNewType">${Object.entries(TYPE_LABELS).map(([v,l])=>`<option value="${v}">${l}</option>`).join("")}</select><button type="button" class="secondary-button" data-pb-add>+ Thêm section</button></div></div><div class="panel-body pb-admin-list">${b.sections.map(card).join("")}</div></section>`;
  }

  TITLES.builder = ["Cấu trúc website", "Chỉnh sửa section, Header, Footer và giao diện."];
  const oldRender = render;
  render = function () {
    if (state.view !== "builder") return oldRender();
    document.querySelector("#viewTitle").textContent = TITLES.builder[0];
    document.querySelector("#viewSubtitle").textContent = TITLES.builder[1];
    document.querySelectorAll("#adminNav button[data-view]").forEach(b => b.classList.toggle("active", b.dataset.view === "builder"));
    contentRoot.innerHTML = builderView();
  };

  const homeBtn = document.querySelector('#adminNav button[data-view="homepage"]');
  if (homeBtn && !document.querySelector('#adminNav button[data-view="builder"]')) homeBtn.insertAdjacentHTML("afterend",'<button data-view="builder"><span>▦</span>Cấu trúc website</button>');

  let editor, editingId;
  function dialog() {
    if (editor) return editor;
    editor = document.createElement("dialog");
    editor.className = "pb-admin-dialog";
    editor.innerHTML = `<form method="dialog" class="dialog-card" id="pbEditorForm"><div class="dialog-head"><div><span class="eyebrow">CHỈNH SỬA SECTION</span><h2 id="pbEditorTitle"></h2></div><button type="button" class="icon-button" data-pb-close>×</button></div><div class="dialog-fields" id="pbEditorFields"></div><div class="dialog-actions"><button type="button" class="secondary-button" data-pb-close>Hủy</button><button class="primary-button">Áp dụng</button></div></form>`;
    document.body.appendChild(editor);
    editor.addEventListener("click",e=>{if(e.target.closest("[data-pb-close]"))editor.close()});
    editor.querySelector("form").addEventListener("submit",saveDialog);
    return editor;
  }

  function openDialog(id) {
    const s = ensureBuilder().sections.find(x=>x.id===id); if(!s)return;
    editingId=id; const d=dialog(), vi=s.content?.vi||{}, en=s.content?.en||{}, st=s.style||{};
    d.querySelector("#pbEditorTitle").textContent=s.name;
    d.querySelector("#pbEditorFields").innerHTML=`
      ${field("Tên quản trị","name",s.name,{wide:true})}
      <label><span>Loại</span><select name="type">${Object.entries(TYPE_LABELS).map(([v,l])=>`<option value="${v}" ${s.type===v?"selected":""}>${l}</option>`).join("")}</select></label>
      ${field("Màu nền (để trống = giữ nguyên)","background",st.background||"")}
      ${field("Màu chữ (để trống = giữ nguyên)","textColor",st.textColor||"")}
      ${field("Padding dọc (px)","paddingY",st.paddingY||"",{type:"number",min:0,max:240})}
      ${field("Số cột","columns",st.columns||"",{type:"number",min:1,max:6})}
      <div class="wide pb-lang-head"><b>Tiếng Việt</b></div>
      ${field("Nhãn nhỏ","viEyebrow",vi.eyebrow||"",{wide:true})}
      ${field("Tiêu đề","viTitle",vi.title||"",{wide:true})}
      ${field("Dòng nhấn","viAccent",vi.accent||"",{wide:true})}
      ${field("Mô tả","viDescription",vi.description||"",{type:"textarea",wide:true})}
      ${field("Nút chính","viPrimaryLabel",vi.primaryLabel||"")}
      ${field("Link nút chính","viPrimaryUrl",vi.primaryUrl||"")}
      ${field("Nút phụ","viSecondaryLabel",vi.secondaryLabel||"")}
      ${field("Link nút phụ","viSecondaryUrl",vi.secondaryUrl||"")}
      <div class="wide pb-lang-head"><b>English</b></div>
      ${field("Small label","enEyebrow",en.eyebrow||"",{wide:true})}
      ${field("Title","enTitle",en.title||"",{wide:true})}
      ${field("Accent","enAccent",en.accent||"",{wide:true})}
      ${field("Description","enDescription",en.description||"",{type:"textarea",wide:true})}
      ${field("Primary button","enPrimaryLabel",en.primaryLabel||"")}
      ${field("Primary URL","enPrimaryUrl",en.primaryUrl||"")}
      ${field("Secondary button","enSecondaryLabel",en.secondaryLabel||"")}
      ${field("Secondary URL","enSecondaryUrl",en.secondaryUrl||"")}
      <label class="wide"><span>Danh sách mục (JSON, để trống = giữ nguyên)</span><textarea class="pb-json" name="items">${s.items?escapeHtml(JSON.stringify(s.items,null,2)):""}</textarea><small>Mỗi mục có thể gồm title.vi/title.en, text.vi/text.en, image và href.</small></label>`;
    d.showModal();
  }

  function saveDialog(e) {
    e.preventDefault(); const b=ensureBuilder(), s=b.sections.find(x=>x.id===editingId); if(!s)return;
    const v=formObject(e.target); let items=null;
    if(v.items.trim()){try{items=JSON.parse(v.items);if(!Array.isArray(items))throw 0}catch{return showToast("Danh sách mục phải là JSON dạng mảng.")}}
    s.name=v.name; s.type=v.type; s.style={background:v.background,textColor:v.textColor,paddingY:v.paddingY?Number(v.paddingY):"",columns:v.columns?Number(v.columns):""};
    s.content={vi:{eyebrow:v.viEyebrow,title:v.viTitle,accent:v.viAccent,description:v.viDescription,primaryLabel:v.viPrimaryLabel,primaryUrl:v.viPrimaryUrl,secondaryLabel:v.viSecondaryLabel,secondaryUrl:v.viSecondaryUrl},en:{eyebrow:v.enEyebrow,title:v.enTitle,accent:v.enAccent,description:v.enDescription,primaryLabel:v.enPrimaryLabel,primaryUrl:v.enPrimaryUrl,secondaryLabel:v.enSecondaryLabel,secondaryUrl:v.enSecondaryUrl}};
    s.items=items; editor.close(); render(); showToast("Đã áp dụng. Bấm Lưu & xuất bản để cập nhật website.");
  }

  function parseArray(text,label){if(!text.trim())return[];try{const x=JSON.parse(text);if(!Array.isArray(x))throw 0;return x}catch{throw new Error(`${label} phải là JSON dạng mảng.`)}}
  function sectionFromType(type){return{id:`${type}-${Date.now().toString(36)}`,source:type==="custom"?"custom":type,name:TYPE_LABELS[type],type,enabled:true,style:{background:"",textColor:"",paddingY:"",columns:""},content:{vi:{title:"Section mới"},en:{title:"New section"}},items:type==="custom"?[]:null}}

  contentRoot.addEventListener("click",async e=>{
    if(state.view!=="builder")return; const b=ensureBuilder(), cardEl=e.target.closest("[data-pb-id]"), id=cardEl?.dataset.pbId, i=b.sections.findIndex(x=>x.id===id);
    if(e.target.closest("[data-pb-add]")){b.sections.push(sectionFromType(document.querySelector("#pbNewType").value));return render()}
    if(e.target.closest("[data-pb-publish]")){const btn=e.target.closest("[data-pb-publish]");btn.disabled=true;try{await saveBuilder();showToast("Đã lưu và xuất bản cấu trúc website.")}catch(err){showToast(`Không thể lưu: ${err.message}`)}finally{btn.disabled=false}return}
    if(i<0)return;
    if(e.target.closest("[data-pb-edit]"))return openDialog(id);
    if(e.target.closest("[data-pb-up]")&&i>0){[b.sections[i-1],b.sections[i]]=[b.sections[i],b.sections[i-1]];return render()}
    if(e.target.closest("[data-pb-down]")&&i<b.sections.length-1){[b.sections[i+1],b.sections[i]]=[b.sections[i],b.sections[i+1]];return render()}
    if(e.target.closest("[data-pb-copy]")){const x=clone(b.sections[i]);x.id=`${x.source}-${Date.now().toString(36)}`;x.name+= " (bản sao)";b.sections.splice(i+1,0,x);return render()}
    if(e.target.closest("[data-pb-delete]")){if(confirm(`Xóa “${b.sections[i].name}”?`)){b.sections.splice(i,1);render()}}
  });

  contentRoot.addEventListener("change",e=>{
    if(state.view!=="builder"||!e.target.matches("[data-pb-toggle]"))return;
    const s=ensureBuilder().sections.find(x=>x.id===e.target.closest("[data-pb-id]").dataset.pbId); if(s){s.enabled=e.target.checked;render()}
  });

  contentRoot.addEventListener("submit",async e=>{
    if(e.target.id!=="pbGlobalsForm")return; e.preventDefault();e.stopImmediatePropagation();const btn=e.submitter;if(btn)btn.disabled=true;
    try{const v=formObject(e.target),g=ensureBuilder().globals;g.primaryColor=v.primaryColor;g.navyColor=v.navyColor;g.softColor=v.softColor;g.siteWidth=Number(v.siteWidth);g.sectionSpacing=Number(v.sectionSpacing);g.defaultLanguage=v.defaultLanguage;g.header={...(g.header||{}),showSearch:e.target.elements.showSearch.checked,cta:{vi:v.headerCtaVi,en:v.headerCtaEn,href:v.headerCtaHref},nav:parseArray(v.headerNav,"Menu Header")};g.footer={...(g.footer||{}),email:v.footerEmail,vi:v.footerVi,en:v.footerEn,columns:parseArray(v.footerColumns,"Cột Footer")};await saveBuilder("Update homepage page builder globals from OWNEX Admin");showToast("Đã lưu thiết kế chung.")}catch(err){showToast(`Không thể lưu: ${err.message}`)}finally{if(btn)btn.disabled=false}
  },true);

  let dragId;
  contentRoot.addEventListener("dragstart",e=>{const c=e.target.closest("[data-pb-id]");if(c){dragId=c.dataset.pbId;c.classList.add("dragging")}});
  contentRoot.addEventListener("dragend",e=>{e.target.closest("[data-pb-id]")?.classList.remove("dragging");dragId=null});
  contentRoot.addEventListener("dragover",e=>{if(dragId&&e.target.closest("[data-pb-id]"))e.preventDefault()});
  contentRoot.addEventListener("drop",e=>{const t=e.target.closest("[data-pb-id]");if(!dragId||!t||t.dataset.pbId===dragId)return;e.preventDefault();const a=ensureBuilder().sections,f=a.findIndex(x=>x.id===dragId),to=a.findIndex(x=>x.id===t.dataset.pbId);const[m]=a.splice(f,1);a.splice(to,0,m);render()});
})();