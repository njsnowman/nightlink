/* Accessibility scan: every visible button, link, form control, tab, menu item and summary has an accessible name;
   images have alt text; no positive tabindex; each page has a heading. Terminal and all five Cards skins on eight pages. */
const {chromium}=require(process.env.NIGHTLINK_PLAYWRIGHT||'playwright'),fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict');
const serve=async r=>{const u=new URL(r.request().url());if(u.origin!=='http://127.0.0.1:4173')return r.abort();const f=u.pathname==='/'?'index.html':u.pathname.slice(1);try{await r.fulfill({body:await fs.readFile(path.join(__dirname,f)),contentType:f.endsWith('.js')?'text/javascript':f.endsWith('.css')?'text/css':'text/html'});}catch{await r.fulfill({status:404,body:''});}};
const scan=()=>{const vis=e=>{const r=e.getBoundingClientRect();if(!r.width||!r.height)return false;const s=getComputedStyle(e);return s.visibility!=='hidden'&&s.display!=='none';};
 const name=e=>{const l=e.getAttribute('aria-label');if(l&&l.trim())return l;const by=e.getAttribute('aria-labelledby');if(by)return by.split(/\s+/).map(i=>document.getElementById(i)?.textContent||'').join(' ').trim();if(e.id){const lab=document.querySelector('label[for="'+CSS.escape(e.id)+'"]');if(lab?.textContent.trim())return lab.textContent;}const wrap=e.closest('label');if(wrap&&wrap.textContent.trim())return wrap.textContent;if(e.title?.trim())return e.title;if(['INPUT','TEXTAREA','SELECT'].includes(e.tagName))return e.placeholder||'';return (e.textContent||'').trim()||[...e.querySelectorAll('img[alt],svg[aria-label]')].map(x=>x.getAttribute('alt')||x.getAttribute('aria-label')).join(' ');};
 const out=[];const id=e=>e.tagName.toLowerCase()+(e.id?'#'+e.id:'')+(e.className&&typeof e.className==='string'?'.'+e.className.trim().split(/\s+/).slice(0,2).join('.'):'');
 for(const e of document.querySelectorAll('button,a[href],input:not([type=hidden]),select,textarea,[role=button],[role=tab],[role=menuitem],summary'))if(vis(e)&&!name(e).trim())out.push('unnamed '+id(e));
 for(const e of document.querySelectorAll('img'))if(vis(e)&&!e.hasAttribute('alt'))out.push('img without alt '+id(e));
 for(const e of document.querySelectorAll('[tabindex]'))if(+e.getAttribute('tabindex')>0)out.push('positive tabindex '+id(e));
 if(!document.querySelector('h1,h2,[role=heading]'))out.push('no heading');return out;};
(async()=>{const browser=await chromium.launch({headless:true,...(process.env.NIGHTLINK_BROWSER?{executablePath:process.env.NIGHTLINK_BROWSER}:{})});const problems=[];try{
 for(const [iface,skin] of [['terminal','standard'],['cards','standard'],['cards','tactical'],['cards','red'],['cards','radio'],['cards','school']]){const page=await browser.newPage({viewport:{width:1320,height:860}});await page.route('**/*',serve);
  await page.addInitScript(([i,s])=>{try{localStorage.setItem('nightlink.interface',i);localStorage.setItem('nightlink.cards-skin',s);}catch{}},[iface,skin]);await page.goto('http://127.0.0.1:4173');await page.waitForTimeout(250);
  for(const pg of ['Overview','Messages','Direct Messages','Nodes','Network map','Activity','Settings','Search']){
   await page.evaluate(v=>{live.identity={key:'cd'.repeat(32),name:'DEMO HQ',frequency:910.525,txPower:22,located:true,lat:40,lon:-86};live.sync='ready';live.channels=[{slot:0,id:'01'.repeat(12),name:'Public'}];live.contacts=[{key:'ab'.repeat(32),name:'DEMO Ridge',type:2,located:true,lat:40.2,lon:-86}];view(v);},pg);await page.waitForTimeout(150);
   for(const p of await page.evaluate(scan))problems.push(iface+'/'+skin+' '+pg+': '+p);}
  await page.close();}
 assert.deepEqual(problems,[]);
 console.log('PASS accessibility scan: accessible names, image alt text, no positive tabindex and a heading on 8 pages in Terminal and five Cards skins. Synthetic only.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
