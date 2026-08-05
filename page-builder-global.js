(() => {
  const API="https://ownex-commerce-admin.manhddmkt.chatgpt.site";
  let config;
  const esc=(v="")=>String(v).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");
  const safe=(v="#")=>/^(\/|#|https?:\/\/|mailto:|tel:)/i.test(String(v||""))?esc(v):"#";
  const language=()=>window.OWNEX_I18N?.getLanguage?.()||localStorage.getItem("ownex-language")||config?.defaultLanguage||"vi";
  const local=(value,lang)=>value&&typeof value==="object"?(value[lang]??value.vi??value.en??""):(value??"");
  function apply(){
    if(!config)return;const lang=language(),root=document.documentElement;
    root.style.setProperty("--pb-primary",config.primaryColor||"#1769e0");root.style.setProperty("--pb-navy",config.navyColor||"#0b2342");root.style.setProperty("--pb-soft",config.softColor||"#f4f8ff");root.style.setProperty("--pb-width",`${Number(config.siteWidth||1280)}px`);root.style.setProperty("--pb-spacing",`${Number(config.sectionSpacing||88)}px`);
    const header=document.querySelector(".ownex-new-header"),h=config.header||{};
    if(header){
      const search=header.querySelector(".ownex-new-header__search");if(search)search.hidden=h.showSearch===false;
      const cta=header.querySelector(".ownex-new-header__actions .ownex-new-header__cta");if(cta&&h.cta){cta.href=safe(h.cta.href||"/contact");cta.innerHTML=`${esc(h.cta[lang]||h.cta.vi||h.cta.en||"")} <span>↗</span>`}
      if(Array.isArray(h.nav)&&h.nav.length){
        const nav=header.querySelector(".ownex-new-header__nav");if(nav)nav.innerHTML=h.nav.map(x=>`<div class="ownex-new-header__item"><a class="ownex-new-header__link" href="${safe(x.href)}">${esc(local(x.label,lang))}${x.children?.length?'<span class="ownex-new-header__caret"></span>':""}</a>${x.children?.length?`<div class="ownex-new-header__dropdown">${x.children.map(c=>`<a href="${safe(c.href)}">${esc(local(c.label,lang))}</a>`).join("")}</div>`:""}</div>`).join("");
        const mobile=header.querySelector(".ownex-new-header__mobile-panel");if(mobile){const sw=mobile.querySelector("[data-language-switcher]")?.outerHTML||"";mobile.innerHTML=sw+h.nav.map(x=>`<a href="${safe(x.href)}">${esc(local(x.label,lang))}</a>`).join("")+(h.cta?`<a class="ownex-new-header__cta" href="${safe(h.cta.href||"/contact")}">${esc(h.cta[lang]||h.cta.vi||h.cta.en||"")} <span>↗</span></a>`:"")}
      }
    }
    const footer=document.querySelector(".footer"),f=config.footer||{};
    if(footer){const p=footer.querySelector(".footer-intro p");if(p&&(f[lang]||f.vi||f.en))p.textContent=f[lang]||f.vi||f.en;const mail=footer.querySelector('.footer-intro a[href^="mailto:"]');if(mail&&f.email){mail.textContent=f.email;mail.href=`mailto:${f.email}`}}
  }
  async function load(){try{const r=await fetch(`${API}/api/public/bootstrap`,{cache:"no-store"});if(!r.ok)return;const p=await r.json();config=p?.content?.homepage?.pageBuilder?.globals;if(config)apply()}catch(e){console.warn("Page Builder globals:",e)}}
  function start(){load();window.addEventListener("ownex:languagechange",apply);const app=document.querySelector("#app");if(app)new MutationObserver(()=>{if(config)requestAnimationFrame(apply)}).observe(app,{childList:true,subtree:true})}
  document.readyState==="loading"?document.addEventListener("DOMContentLoaded",start,{once:true}):start();
})();