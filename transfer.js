/* Trendslope storage + one-time data transfer.  Same file goes in the old and the new repo.
   - www.trendslope.com : favorites live in marcitech.is-a.dev storage, reached through bridge.html (TSB.on = true)
   - marcitech.is-a.dev : normal localStorage, plus a "move my data" popup that redirects to the new site */
(()=>{
const NEW_URL='https://www.trendslope.com/';
const BRIDGE='https://marcitech.is-a.dev/Trendslope/bridge.html';
const AUTO_FROM=Date.parse('2027-01-01');   // on/after this date the old site transfers + redirects without asking
const KEYS=['movies_favs','music_favs','stocks_favs','software_favs2','ba_favs','trending_favorites','slickdeals_favorites','singleManSavedWeeks','singleManCurrentWeek','singleManFormData'];
const okKey=k=>KEYS.includes(k)||k.startsWith('fb_');
const H=location.hostname, NEW=/(^|\.)trendslope\.com$/.test(H), OLD=/(^|\.)marcitech\.is-a\.dev$/.test(H);
const T=window.TSB={on:NEW,M:new Map()};
const fire=()=>dispatchEvent(new Event('storage'));

/* ---------- bridge client (new site only) ---------- */
let send=()=>Promise.resolve(null);
if(NEW){
 const BO=new URL(BRIDGE).origin;let frame,n=0;const pend=new Map();
 const fr=document.createElement('iframe');fr.src=BRIDGE;fr.title='storage';fr.setAttribute('aria-hidden','true');
 fr.style.cssText='position:fixed;left:-9999px;width:1px;height:1px;border:0;visibility:hidden';
 const loaded=new Promise(r=>{fr.addEventListener('load',r,{once:true});setTimeout(r,3000)});
 (document.body||document.documentElement).appendChild(fr);frame=fr;
 send=m=>new Promise(res=>{const id=++n;pend.set(id,res);m.ts=1;m.id=id;
  loaded.then(()=>{try{frame.contentWindow.postMessage(m,BO)}catch{res(null)}});
  setTimeout(()=>{if(pend.delete(id))res(null)},3500)});
 const load=()=>send({op:'get'}).then(r=>{if(r&&r.data){T.M.clear();for(const[k,v]of Object.entries(r.data))T.M.set(k,v);return true}return false});
 addEventListener('message',e=>{
  if(e.origin!==BO||e.source!==frame.contentWindow)return;const m=e.data;if(!m||m.ts!==1)return;
  if(m.re){const f=pend.get(m.id);if(f){pend.delete(m.id);f(m)}return}
  if(m.op==='changed'){if(m.key==null)load().then(fire);else{m.value==null?T.M.delete(m.key):T.M.set(m.key,m.value);fire()}}
 });
 T.ready=load().then(ok=>{T.bridgeOk=ok;return ok});
}else T.ready=Promise.resolve(true);

/* ---------- storage API used by index.html ---------- */
T.get=k=>{if(NEW)return T.M.has(k)?T.M.get(k):null;try{return localStorage.getItem(k)}catch{return null}};
T.setRaw=(k,s)=>{
 if(NEW){s==null?T.M.delete(k):T.M.set(k,s);return send({op:'set',key:k,value:s==null?null:s})}
 try{s==null?localStorage.removeItem(k):localStorage.setItem(k,s)}catch(e){return Promise.reject(e)}return Promise.resolve();
};
T.setMany=o=>{
 if(NEW){for(const[k,v]of Object.entries(o))T.M.set(k,v);return send({op:'setMany',items:o})}
 try{for(const[k,v]of Object.entries(o))localStorage.setItem(k,v)}catch{}return Promise.resolve();
};

/* ---------- helpers ---------- */
const b64=u8=>{let s='';for(let i=0;i<u8.length;i+=0x8000)s+=String.fromCharCode.apply(null,u8.subarray(i,i+0x8000));return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')};
const unb64=s=>{s=s.replace(/-/g,'+').replace(/_/g,'/');while(s.length%4)s+='=';const b=atob(s),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return u};
const pipe=async(u8,S)=>new Uint8Array(await new Response(new Blob([u8]).stream().pipeThrough(new S('gzip'))).arrayBuffer());
const enc=async o=>{const j=new TextEncoder().encode(JSON.stringify(o));
 if(typeof CompressionStream!='undefined')try{return'g.'+b64(await pipe(j,CompressionStream))}catch{}
 return'j.'+b64(j)};
const dec=async s=>{const k=s.slice(0,2),u=unb64(s.slice(2));
 const j=k==='g.'?await pipe(u,DecompressionStream):u;return JSON.parse(new TextDecoder().decode(j))};
const nextAug1=()=>{const n=new Date(),y=n.getUTCFullYear();let d=new Date(Date.UTC(y,7,1));if(n>=d)d=new Date(Date.UTC(y+1,7,1));return d.toUTCString()};
const toast=(t,ms=7000)=>{const d=document.createElement('div');d.textContent=t;d.setAttribute('role','status');
 d.style.cssText='position:fixed;left:50%;bottom:24px;transform:translateX(-50%);background:#4a1d7a;color:#fff;padding:12px 18px;border-radius:12px;font:600 14px system-ui,sans-serif;z-index:99999;box-shadow:0 6px 24px rgba(0,0,0,.35);max-width:90vw;text-align:center';
 document.body.appendChild(d);setTimeout(()=>d.remove(),ms)};

/* ---------- old site: collect + send ---------- */
async function collect(){
 const ls={},ck={};
 try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(okKey(k))ls[k]=localStorage.getItem(k)}}catch{}
 document.cookie.split(';').forEach(r=>{r=r.trim();const i=r.indexOf('=');if(i<1)return;const n=r.slice(0,i);if(/^(ts_|pick_)/.test(n))ck[n]=r.slice(i+1)});
 return{v:1,ls,ck};
}
async function goNew(){
 const p=await collect(),s=await enc(p);
 if(s.length>1500000){alert('Your saved data is too large to move automatically. Open the new site without transferring.');location.href=NEW_URL;return}
 try{localStorage.setItem('ts_migrated',String(Date.now()))}catch{}
 location.href=NEW_URL+'#migrate='+s;
}
function popup(){
 const w=document.createElement('div');
 w.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:99998;display:flex;align-items:center;justify-content:center;padding:16px;font-family:system-ui,sans-serif';
 w.innerHTML='<div style="background:#fff;color:#222;max-width:420px;width:100%;border-radius:16px;overflow:hidden;box-shadow:0 12px 48px rgba(0,0,0,.5)"><div style="background:#7B2CBF;color:#fff;padding:14px 18px;font-weight:800;font-size:17px">Trendslope has a new home</div><div style="padding:18px;line-height:1.45;font-size:15px">Trendslope now lives at <b>www.trendslope.com</b>, and <b>this site will be removed on 1/1/2027</b>. Move your favorites, picks and settings over in one click. Your data stays here too, so nothing is lost.</div><div style="display:flex;gap:10px;padding:0 18px 18px;flex-wrap:wrap"><button id="tsGo" style="flex:1;min-width:150px;background:#7B2CBF;color:#fff;border:0;border-radius:10px;padding:12px;font:700 15px system-ui,sans-serif;cursor:pointer">Transfer my data</button><button id="tsSkip" style="flex:1;min-width:110px;background:#eee;color:#333;border:0;border-radius:10px;padding:12px;font:600 15px system-ui,sans-serif;cursor:pointer">Not now</button></div></div>';
 document.body.appendChild(w);
 w.querySelector('#tsGo').onclick=()=>{w.querySelector('#tsGo').textContent='Transferring\u2026';goNew()};
 w.querySelector('#tsSkip').onclick=()=>{try{localStorage.setItem('ts_migrate_skip',String(Date.now()))}catch{}w.remove()};
}
function banner(){
 const b=document.createElement('div');b.id='tsOldBanner';
 b.style.cssText='background:#7B2CBF;color:#fff;text-align:center;padding:9px 14px;font:600 14px/1.35 system-ui,sans-serif;position:relative;z-index:50';
 b.innerHTML='This site will be removed on <b>1/1/2027</b>. Trendslope has moved to <a href="'+NEW_URL+'" style="color:#fff;text-decoration:underline">www.trendslope.com</a> \u2014 <a href="#" id="tsBannerGo" style="color:#ffe08a;text-decoration:underline">transfer my data</a>';
 const st=document.createElement('style');st.textContent='html:has(body.site-mode) #tsOldBanner{display:none}';document.head.appendChild(st);
 document.documentElement.insertBefore(b,document.body);   // above <body>, so the page's absolutely-positioned menu is measured from below the bar
 b.querySelector('#tsBannerGo').onclick=e=>{e.preventDefault();goNew()};
}
if(OLD){
 const run=()=>{
  banner();
  if(Date.now()>=AUTO_FROM){goNew();return}
  let skip=0;try{skip=+localStorage.getItem('ts_migrate_skip')||0}catch{}
  if(Date.now()-skip>3*864e5)popup();
 };
 document.readyState==='loading'?addEventListener('DOMContentLoaded',run):run();
}

/* ---------- new site: receive ---------- */
const mergeVal=(oldS,newS)=>{
 if(oldS==null)return newS;
 try{const a=JSON.parse(oldS),b=JSON.parse(newS);
  if(Array.isArray(a)&&Array.isArray(b)){const seen=new Set(a.map(x=>JSON.stringify(x))),out=a.slice();for(const x of b){const j=JSON.stringify(x);if(!seen.has(j)){seen.add(j);out.push(x)}}return JSON.stringify(out)}
  if(a&&b&&typeof a=='object'&&typeof b=='object'&&!Array.isArray(a)&&!Array.isArray(b))return JSON.stringify({...b,...a});
 }catch{}
 return oldS;   // existing value on the new site wins
};
let payload=null;
if(NEW){
 const m=location.hash.match(/^#migrate=([gj]\.[\w-]+)$/);
 if(m){payload=m[1];history.replaceState(null,'',location.pathname+location.search)}   // strip before the page's hash routing runs
 try{const n=sessionStorage.getItem('ts_imported');if(n){sessionStorage.removeItem('ts_imported');addEventListener('DOMContentLoaded',()=>toast('Transferred '+n+' saved items from the old site.'))}}catch{}
}
async function receive(){
 let p;try{p=await dec(payload)}catch{toast('The transfer data could not be read. Try the button on the old site again.');return}
 if(!p||p.v!==1)return;
 await T.ready;
 if(!T.bridgeOk){toast('Could not reach the storage bridge. Try again in a moment.');return}
 const items={};let count=0;
 // sports picks were cookies on the old site; on the new one they live in the shared store (as fb_pick_<cookie name>), so the Sports frame and Trendslope both see them
 for(const[n,v]of Object.entries(p.ck||{})){if(!/^pick_[\w.-]*$/.test(n)||typeof v!=='string')continue;const key='fb_pick_'+n;if(T.get(key)!=null)continue;
  try{items[key]=JSON.stringify({x:Date.parse(nextAug1()),v:decodeURIComponent(v)});count++}catch{}}
 for(const[k,v]of Object.entries(p.ls||{})){if(!okKey(k)||typeof v!=='string')continue;const mv=mergeVal(T.get(k),v);if(mv!==T.get(k)){items[k]=mv;count++}}
 const ack=Object.keys(items).length?await T.setMany(items):{ok:true};
 for(const[n,v]of Object.entries(p.ck||{})){if(!/^ts_[\w.-]*$/.test(n)||typeof v!=='string')continue;
  if(document.cookie.split(';').some(c=>c.trim().startsWith(n+'=')))continue;
  document.cookie=n+'='+v+'; max-age=31536000'+'; path=/; SameSite=Lax';count++}
 if(ack===null){toast('The transfer did not finish saving. Try again.');return}
 try{sessionStorage.setItem('ts_imported',String(count))}catch{}
 location.reload();
}
if(payload)document.addEventListener('DOMContentLoaded',receive);
})();
