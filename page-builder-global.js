(() => {
  const API="";
  const DEFAULT_LOGO="/assets/ownex-logo.svg";
  const DEFAULT_FAVICON="/assets/ownex-favicon.svg";
  let config;
  const esc=(v="")=>String(v).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");
  const safe=(v="#")=>/^(\/|#|https?:\/\/|mailto:|tel:)/i.test(String(v||""))?esc(v):"#";
  const safeAsset=(v="",fallback=DEFAULT_LOGO)=>/^(\/|https?:\/\/|data:|blob:)/i.test(String(v||""))?String(v):fallback;
  const language=()=>window.OWNEX_I18N?.getLanguage?.()||localStorage.getItem("ownex-language")||config?.defaultLanguage||"vi";
  const local=(value,lang)=>value&&typeof value==="object"?(value[lang]??value.vi??value.en??""):(value??"");
  const withUnit=(value,fallback="120px")=>{const text=String(value||fallback).trim();return /^\d+(?:\.\d+)?$/.test(text)?`${text}px`:text};
  const normalizeLogo=(logo={})=>({src:logo.src||logo.logoUrl||DEFAULT_LOGO,alt:logo.alt||logo.logoAlt||"OWNEX Commerce",width:logo.width||logo.logoWidth||"120px",href:logo.href||logo.logoHref||"/"});
  const normalizeFavicon=(favicon={})=>({src:favicon.src||favicon.faviconUrl||DEFAULT_FAVICON,alt:favicon.alt||favicon.faviconAlt||"OWNEX"});

  function ensureIconLink(rel,id){let link=document.querySelector(`#${id}`)||document.querySelector(`link[rel="${rel}"]`);if(!link){link=document.createElement("link");document.head.appendChild(link)}link.id=id;link.rel=rel;link.dataset.ownexManaged="true";return link}
  function applyFavicon(favicon={}){const normalized=normalizeFavicon(favicon),href=safeAsset(normalized.src,DEFAULT_FAVICON);ensureIconLink("icon","ownexFavicon").href=href;ensureIconLink("shortcut icon","ownexShortcutIcon").href=href;ensureIconLink("apple-touch-icon","ownexAppleTouchIcon").href=href;document.documentElement.dataset.ownexFaviconLoaded="true"}

  function applyLogo(header,logo={}){const brand=header?.querySelector(".ownex-new-header__brand,[data-ownex-logo]");if(!brand)return;const normalized=normalizeLogo(logo);let image=brand.querySelector("img");if(!image){image=document.createElement("img");brand.replaceChildren(image)}brand.dataset.ownexLogo="image";brand.href=safe(normalized.href);image.src=safeAsset(normalized.src,DEFAULT_LOGO);image.alt=normalized.alt;image.style.width=withUnit(normalized.width,"120px");image.style.maxWidth="100%";image.style.height="auto";image.style.display="block"}

  function apply(){
    if(!config)return;const lang=language(),root=document.documentElement;
    root.style.setProperty("--pb-primary",config.primaryColor||"#1769e0");root.style.setProperty("--pb-navy",config.navyColor||"#0b2342");root.style.setProperty("--pb-soft",config.softColor||"#f4f8ff");root.style.setProperty("--pb-width",`${Number(config.siteWidth||1280)}px`);root.style.setProperty("--pb-spacing",`${Number(config.sectionSpacing||88)}px`);
    applyFavicon(config.favicon||{});
    const h=config.header||{},logo=normalizeLogo(h.logo||{}),header=document.querySelector(".ownex-new-header:not([data-ownex-layout-custom])");
    if(header){applyLogo(header,logo);const search=header.querySelector(".ownex-new-header__search");if(search)search.hidden=h.showSearch===false;const cta=header.querySelector(".ownex-new-header__actions .ownex-new-header__cta");if(cta&&h.cta){cta.href=safe(h.cta.href||"/contact");cta.innerHTML=`${esc(h.cta[lang]||h.cta.vi||h.cta.en||"")} <span>↗</span>`}if(Array.isArray(h.nav)&&h.nav.length){const nav=header.querySelector(".ownex-new-header__nav");if(nav)nav.innerHTML=h.nav.map(x=>`<div class="ownex-new-header__item"><a class="ownex-new-header__link" href="${safe(x.href)}">${esc(local(x.label,lang))}${x.children?.length?'<span class="ownex-new-header__caret"></span>':""}</a>${x.children?.length?`<div class="ownex-new-header__dropdown">${x.children.map(c=>`<a href="${safe(c.href)}">${esc(local(c.label,lang))}</a>`).join("")}</div>`:""}</div>`).join("");const mobile=header.querySelector(".ownex-new-header__mobile-panel");if(mobile){const sw=mobile.querySelector("[data-language-switcher]")?.outerHTML||"";mobile.innerHTML=sw+h.nav.map(x=>`<a href="${safe(x.href)}">${esc(local(x.label,lang))}</a>`).join("")+(h.cta?`<a class="ownex-new-header__cta" href="${safe(h.cta.href||"/contact")}">${esc(h.cta[lang]||h.cta.vi||h.cta.en||"")} <span>↗</span></a>`:"")}}}
    const footer=document.querySelector(".footer:not([data-ownex-layout-custom])"),f=config.footer||{};if(footer){const p=footer.querySelector(".footer-intro p");if(p&&(f[lang]||f.vi||f.en))p.textContent=f[lang]||f.vi||f.en;const mail=footer.querySelector('.footer-intro a[href^="mailto:"]');if(mail&&f.email){mail.textContent=f.email;mail.href=`mailto:${f.email}`}}
  }

  async function load(){try{const r=await fetch(`${API}/api/public/bootstrap?globals=${Date.now()}`,{cache:"no-store"});if(!r.ok)throw new Error(`Bootstrap ${r.status}`);const p=await r.json();const globals=p?.content?.homepage?.pageBuilder?.globals||{};const site=p?.content?.site||{};const siteLogo=site.logo||{src:site.logoUrl,alt:site.logoAlt,width:site.logoWidth,href:site.logoHref};const siteFavicon=site.favicon||{src:site.faviconUrl,alt:site.faviconAlt};config={...globals,favicon:normalizeFavicon(siteFavicon),header:{...(globals.header||{}),logo:{...normalizeLogo(globals.header?.logo||{}),...normalizeLogo(siteLogo)}}};apply();document.documentElement.dataset.ownexGlobalsLoaded="true"}catch(e){document.documentElement.dataset.ownexGlobalsLoaded="error";applyFavicon({src:DEFAULT_FAVICON});console.warn("Page Builder globals:",e)}}
  function start(){applyFavicon({src:DEFAULT_FAVICON});load();window.addEventListener("ownex:languagechange",apply);const app=document.querySelector("#app");if(app)new MutationObserver(()=>{if(config)requestAnimationFrame(apply)}).observe(app,{childList:true,subtree:true})}
  document.readyState==="loading"?document.addEventListener("DOMContentLoaded",start,{once:true}):start();
})();