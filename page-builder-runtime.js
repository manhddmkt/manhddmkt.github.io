(() => {
  const API="https://ownex-commerce-admin.manhddmkt.chatgpt.site";
  const ORDER=["hero","channels","categories","process","factory","services","products","benefit-strip","benefits","campaign","resources","final"];
  let config,baseline,scheduled=false;

  const esc=(v="")=>String(v).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");
  const url=(v="#")=>/^(\/|#|https?:\/\/|mailto:|tel:)/i.test(String(v||""))?esc(v):"#";
  const lang=()=>window.OWNEX_I18N?.getLanguage?.()||localStorage.getItem("ownex-language")||config?.globals?.defaultLanguage||"vi";
  const loc=(v,l=lang())=>v&&typeof v==="object"&&!Array.isArray(v)?(v[l]??v.vi??v.en??""):(v??"");
  const val=(s,k,l)=>s.content?.[l]?.[k]||"";

  function sourceMap(root){
    const children=[...root.children],map={};
    ORDER.forEach((key,i)=>{if(children[i])map[key]=children[i]});
    return map;
  }

  function setText(node,value){if(node&&value)node.textContent=value}
  function applyItems(node,s,l){
    if(!Array.isArray(s.items))return;
    const item=(x,k)=>esc(loc(x?.[k],l));
    if(s.type==="channels"){
      const box=node.querySelector(".lf-channel-bar__inner div");if(box)box.innerHTML=s.items.map(x=>`<strong>${item(x,"title")}</strong>`).join("");
    }else if(s.type==="categories"){
      const box=node.querySelector(".lf-category-grid");if(box)box.innerHTML=s.items.map(x=>`<a class="lf-category" href="${url(x.href||"/catalog")}">${x.image?`<img src="${url(x.image)}" alt="">`:""}<div><h3>${item(x,"title")}</h3><span>${item(x,"text")||(l==="vi"?"Xem sản phẩm ↗":"View products ↗")}</span></div></a>`).join("");
    }else if(s.type==="process"){
      const box=node.querySelector(".lf-process-grid");if(box)box.innerHTML=s.items.map((x,i)=>`<article class="lf-process-card"><span>${String(i+1).padStart(2,"0")}</span><h3>${item(x,"title")}</h3><p>${item(x,"text")}</p></article>`).join("");
    }else if(s.type==="services"){
      const box=node.querySelector(".lf-service-grid");if(box)box.innerHTML=s.items.map(x=>`<a class="lf-service-card" href="${url(x.href||"#")}">${x.image?`<img src="${url(x.image)}" alt="">`:""}<div><h3>${item(x,"title")}</h3><p>${item(x,"text")}</p><span>${l==="vi"?"Khám phá dịch vụ ↗":"Discover service ↗"}</span></div></a>`).join("");
    }else if(s.type==="products"){
      const box=node.querySelector(".lf-product-grid");if(box)box.innerHTML=s.items.map(x=>`<a class="lf-product-card" href="${url(x.href||"/catalog")}"><div>${x.image?`<img src="${url(x.image)}" alt="">`:""}</div><h3>${item(x,"title")}</h3><span>${l==="vi"?"Xem sản phẩm ↗":"View product ↗"}</span></a>`).join("");
    }else if(s.type==="benefit-strip"){
      const box=node.querySelector(".lf-shell");if(box)box.innerHTML=s.items.map(x=>`<span>${item(x,"title")}</span>`).join("");
    }else if(s.type==="benefits"){
      const box=node.querySelector(".lf-benefit-grid");if(box)box.innerHTML=s.items.map((x,i)=>`<article class="lf-benefit-card"><span>${String(i+1).padStart(2,"0")}</span><h3>${item(x,"title")}</h3><p>${item(x,"text")}</p></article>`).join("");
    }else if(s.type==="resources"){
      const box=node.querySelector(".lf-resource-grid");if(box)box.innerHTML=s.items.map(x=>`<a class="lf-resource-card" href="${url(x.href||"/resources")}">${x.image?`<img src="${url(x.image)}" alt="">`:""}<span>${l==="vi"?"VẬN HÀNH":"OPERATIONS"}</span><h3>${item(x,"title")}</h3><b>${l==="vi"?"Đọc bài viết →":"Read article →"}</b></a>`).join("");
    }else if(s.type==="factory"){
      const box=node.querySelector(".lf-stat-grid");if(box)box.innerHTML=s.items.map(x=>`<div><strong>${item(x,"title")}</strong><span>${item(x,"text")}</span></div>`).join("");
    }
  }

  function customNode(s,l){
    const el=document.createElement("section");el.className="pb-custom-section";
    el.innerHTML=`<div class="lf-shell">${val(s,"eyebrow",l)?`<span class="lf-kicker">${esc(val(s,"eyebrow",l))}</span>`:""}<h2>${esc(val(s,"title",l)||s.name)}</h2>${val(s,"description",l)?`<p>${esc(val(s,"description",l))}</p>`:""}<div class="pb-custom-grid">${(s.items||[]).map(x=>`<article>${x.image?`<img src="${url(x.image)}" alt="">`:""}<h3>${esc(loc(x.title,l))}</h3><p>${esc(loc(x.text,l))}</p>${x.href?`<a href="${url(x.href)}">${l==="vi"?"Xem thêm →":"Learn more →"}</a>`:""}</article>`).join("")}</div></div>`;
    return el;
  }

  function applySection(node,s,l){
    node.dataset.pbId=s.id;
    const st=s.style||{};
    if(st.background)node.style.background=st.background;
    if(st.textColor)node.style.color=st.textColor;
    if(st.paddingY!==""){node.style.paddingTop=`${Number(st.paddingY)}px`;node.style.paddingBottom=`${Number(st.paddingY)}px`}
    if(st.columns)node.style.setProperty("--pb-columns",Number(st.columns));
    const eyebrow=node.querySelector(".lf-kicker"),title=node.querySelector("h1,h2"),desc=node.querySelector("p");
    setText(eyebrow,val(s,"eyebrow",l));
    if(title&&val(s,"title",l)){
      if(s.type==="hero"){
        title.childNodes[0].nodeValue=val(s,"title",l);
        const span=title.querySelector("span");setText(span,val(s,"accent",l));
      }else title.textContent=val(s,"title",l);
    }
    setText(desc,val(s,"description",l));
    const links=[...node.querySelectorAll(".lf-actions a,.lf-heading--split>a,.lf-text-link,.lf-campaign .lf-button,.lf-final .lf-button")];
    if(links[0]&&val(s,"primaryLabel",l)){links[0].innerHTML=`${esc(val(s,"primaryLabel",l))} <span>↗</span>`;links[0].href=url(val(s,"primaryUrl",l)||links[0].getAttribute("href"))}
    if(links[1]&&val(s,"secondaryLabel",l)){links[1].innerHTML=`${esc(val(s,"secondaryLabel",l))} <span>→</span>`;links[1].href=url(val(s,"secondaryUrl",l)||links[1].getAttribute("href"))}
    applyItems(node,s,l);
    return node;
  }

  function applyGlobals(){
    const g=config.globals||{},r=document.documentElement;
    r.style.setProperty("--pb-primary",g.primaryColor||"#1769e0");r.style.setProperty("--pb-navy",g.navyColor||"#0b2342");r.style.setProperty("--pb-soft",g.softColor||"#f4f8ff");r.style.setProperty("--pb-width",`${Number(g.siteWidth||1280)}px`);r.style.setProperty("--pb-spacing",`${Number(g.sectionSpacing||88)}px`);
  }

  function applyHeader(l){
    const h=document.querySelector(".ownex-new-header"),g=config.globals?.header||{};if(!h)return;
    const search=h.querySelector(".ownex-new-header__search");if(search)search.hidden=g.showSearch===false;
    const cta=h.querySelector(".ownex-new-header__actions .ownex-new-header__cta");if(cta&&g.cta){cta.href=url(g.cta.href||"/contact");cta.innerHTML=`${esc(g.cta[l]||g.cta.vi||g.cta.en||"")} <span>↗</span>`}
    if(Array.isArray(g.nav)&&g.nav.length){
      const nav=h.querySelector(".ownex-new-header__nav");if(nav)nav.innerHTML=g.nav.map(x=>`<div class="ownex-new-header__item"><a class="ownex-new-header__link" href="${url(x.href)}">${esc(loc(x.label,l))}${x.children?.length?'<span class="ownex-new-header__caret"></span>':""}</a>${x.children?.length?`<div class="ownex-new-header__dropdown">${x.children.map(c=>`<a href="${url(c.href)}">${esc(loc(c.label,l))}</a>`).join("")}</div>`:""}</div>`).join("");
    }
  }

  function applyFooter(l){
    const f=document.querySelector(".footer"),g=config.globals?.footer;if(!f||!g)return;
    const intro=f.querySelector(".footer-intro p");if(intro&&(g[l]||g.vi||g.en))intro.textContent=g[l]||g.vi||g.en;
    const mail=f.querySelector('.footer-intro a[href^="mailto:"]');if(mail&&g.email){mail.textContent=g.email;mail.href=`mailto:${g.email}`}
    if(Array.isArray(g.columns)&&g.columns.length){
      f.querySelectorAll(".footer-column").forEach(x=>x.remove());
      const introBox=f.querySelector(".footer-intro");
      g.columns.slice().reverse().forEach(col=>introBox.insertAdjacentHTML("afterend",`<div class="footer-column"><h3>${esc(loc(col.title,l))}</h3>${(col.links||[]).map(x=>`<a href="${url(x.href)}">${esc(loc(x.label,l))}</a>`).join("")}</div>`));
    }
  }

  function render(){
    if(!config||!["/","/index.html"].includes(location.pathname))return;
    const current=document.querySelector("[data-ownex-home-v2]");if(!current)return;
    if(!baseline)baseline=current.cloneNode(true);
    const source=sourceMap(baseline.cloneNode(true)),next=document.createElement("main");next.className="lf-home";next.dataset.ownexHomeV2="";next.dataset.pageBuilderRuntime="";
    const l=lang();
    (config.sections||[]).filter(s=>s.enabled!==false).forEach(s=>{
      const node=s.source==="custom"?customNode(s,l):(source[s.source]?source[s.source].cloneNode(true):customNode(s,l));
      next.appendChild(applySection(node,s,l));
    });
    current.replaceWith(next);applyGlobals();applyHeader(l);applyFooter(l);
  }

  function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;render()})}
  async function load(){try{const r=await fetch(`${API}/api/public/bootstrap`,{cache:"no-store"});if(!r.ok)return;const p=await r.json(),b=p?.content?.homepage?.pageBuilder;if(b?.sections){config=b;schedule()}}catch(e){console.warn("Page Builder:",e)}}
  function start(){const current=document.querySelector("[data-ownex-home-v2]");if(current&&!baseline)baseline=current.cloneNode(true);load();window.addEventListener("ownex:languagechange",schedule);window.addEventListener("popstate",()=>setTimeout(schedule));const app=document.querySelector("#app");if(app)new MutationObserver(()=>{if(config&&!document.querySelector("[data-page-builder-runtime]"))schedule()}).observe(app,{childList:true,subtree:true})}
  document.readyState==="loading"?document.addEventListener("DOMContentLoaded",start,{once:true}):start();
})();