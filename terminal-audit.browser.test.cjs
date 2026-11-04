/* Terminal interface accessibility audit (#131): on every page, dialog window, detached DM and startup lock, checks
   text contrast (4.5:1 against the nearest opaque background), accessible names on controls and visible keyboard
   focus. Synthetic state only; radio commands are blocked. External frames get a local stub page so the embedded map can take focus, as it does on Windows CI. Set NIGHTLINK_AUDIT_REPORT=1 to print every finding. */
const {chromium}=require(process.env.NIGHTLINK_PLAYWRIGHT||'playwright'),fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict');
async function serve(context){await context.route('**/*',async route=>{const u=new URL(route.request().url());if(u.origin!=='http://127.0.0.1:4173')return route.request().resourceType()==='document'?route.fulfill({body:'<!doctype html><a href="#">embedded page</a>',contentType:'text/html'}):route.abort();const file=u.pathname==='/'?'index.html':u.pathname.slice(1);try{await route.fulfill({body:await fs.readFile(path.join(__dirname,file)),contentType:file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':file.endsWith('.svg')?'image/svg+xml':'text/html'});}catch{await route.fulfill({status:404,body:''});}});}
async function fixture(page){await page.evaluate(async()=>{if(window.cardsReady)await cardsReady;radioSession.request=ble.command=async()=>{throw Error('blocked in test');};
 const now=Math.floor(Date.now()/1000);
 live.identity={key:'dd'.repeat(32),name:'SNOMAN',frequency:910.525,txPower:22,model:'Synthetic',version:'1.9.2',located:true,lat:39.08,lon:-84.6};radioSession.identity=live.identity;radioSession.ready=true;ble.state='connected';live.sync='ready';live.sending=false;live.battery={millivolts:4020};live.stats={snr:11.5};
 live.channels=[{slot:0,id:'a'.repeat(24),name:'field-ops'}];
 live.contacts=[{key:'a1b2c3d4'+'0'.repeat(56),name:'KD9XYZ',type:1,snr:8.2,lastAdvert:now-600,pathLength:2},{key:'a1'+'11'.repeat(31),name:'Batesville Relay',type:2,snr:11,lastAdvert:now-300,pathLength:0,located:true,lat:39.3,lon:-85.22}];
 const ch={kind:'channel',...live.channels[0]},cid=conversationId(ch);
 live.messages=[{id:'t1',conversation:cid,target:ch,kind:'channel',timestamp:now-120,sender:'KD9XYZ',text:'net check tonight',status:'Received',snr:8.2,pathLength:1,observedRoute:{path:['a1']}},{id:'t2',conversation:cid,target:ch,kind:'channel',timestamp:now-60,own:true,text:'copy',status:'Broadcast accepted by radio',phase:'broadcast'}];
 live.selected={...ch};renderChannels();renderStats();});}
// Runs in the page: returns findings for the visible document (or a subtree).
function audit(scope){
 const root=scope?document.querySelector(scope):document.body;const out=[];
 const parse=c=>{const m=c.match(/[\d.]+/g);return m?m.map(Number):[0,0,0,0];};
 const lum=([r,g,b])=>{const f=x=>{x/=255;return x<=.03928?x/12.92:((x+.055)/1.055)**2.4;};return .2126*f(r)+.7152*f(g)+.0722*f(b);};
 const ratio=(a,b)=>{const [x,y]=[lum(a),lum(b)].sort((p,q)=>q-p);return (x+.05)/(y+.05);};
 const visible=e=>{const r=e.getBoundingClientRect();if(!r.width||!r.height)return false;const s=getComputedStyle(e);return s.visibility!=='hidden'&&s.display!=='none'&&+s.opacity>.05&&!e.closest('[aria-hidden=true],[hidden]');};
 function bg(e){for(let n=e;n&&n.nodeType===1;n=n.parentElement){const s=getComputedStyle(n);if(s.backgroundImage!=='none'&&!/gradient/.test(s.backgroundImage))return null;const c=parse(s.backgroundColor);if(c.length<4||c[3]>=.95)return c.slice(0,3);}return [0,0,0];}
 const label=e=>{const t=e.tagName;let s=e.closest('[id]')?.id||'';return t.toLowerCase()+(e.id?'#'+e.id:'')+(e.className&&typeof e.className==='string'?'.'+e.className.trim().split(/\s+/).slice(0,2).join('.'):'')+(s&&!e.id?' in #'+s:'');};
 // Contrast: each element that directly owns visible text.
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);const seen=new Set();
 for(let t;(t=walker.nextNode());){if(!t.textContent.trim())continue;const e=t.parentElement;if(!e||seen.has(e)||!visible(e)||e.closest('svg,.term-path-grid,.leaflet-container,iframe,option'))continue;seen.add(e);
  if(e.closest('button:disabled,input:disabled,select:disabled,[aria-disabled=true]'))continue;
  const s=getComputedStyle(e),b=bg(e);if(!b)continue;const c=parse(s.color);if(c[3]!==undefined&&c[3]<.1)continue;
  const fg=c.length>3&&c[3]<1?c.slice(0,3).map((v,i)=>v*c[3]+b[i]*(1-c[3])):c.slice(0,3),r=ratio(fg,b),size=parseFloat(s.fontSize),bold=+s.fontWeight>=700,large=size>=24||(bold&&size>=18.66);
  if(r<(large?3:4.5))out.push({kind:'contrast',el:label(e),text:t.textContent.trim().slice(0,40),ratio:+r.toFixed(2),fg:s.color,bg:'rgb('+b.join(',')+')'});}
 // Names: interactive controls need an accessible name.
 for(const e of root.querySelectorAll('button,a[href],input:not([type=hidden]),select,textarea,[role=button],[role=tab],summary')){if(!visible(e))continue;
  const name=(e.getAttribute('aria-label')||e.getAttribute('aria-labelledby')&&document.getElementById(e.getAttribute('aria-labelledby'))?.textContent||e.textContent||e.getAttribute('title')||e.getAttribute('placeholder')||(e.id&&document.querySelector(`label[for="${CSS.escape(e.id)}"]`)?.textContent)||e.closest('label')?.textContent||e.value||'').trim();
  if(!name)out.push({kind:'name',el:label(e)});}
 return out;}
async function focusCheck(page,max){const out=[];for(let i=0;i<max;i++){await page.keyboard.press('Tab');
  // Read after the next frame: what the operator sees, not the style mid-event.
  await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>setTimeout(r,0))));
  const r=await page.evaluate(()=>{const e=document.activeElement;if(!e||e===document.body)return null;const s=getComputedStyle(e),r=e.getBoundingClientRect();
   const has=n=>{const t=getComputedStyle(n);return (t.outlineStyle!=='none'&&parseFloat(t.outlineWidth)>=1)||(/rgb/.test(t.boxShadow)&&t.boxShadow!=='none');};
   // A ring on the element, or on an ancestor that draws it through :focus-within (MRC input line).
   let ringed=has(e);for(let n=e.parentElement,i=0;!ringed&&n&&i<3;n=n.parentElement,i++)ringed=n.matches(':focus-within')&&has(n);const outline=ringed,ring=false;return {el:e.tagName.toLowerCase()+(e.id?'#'+e.id:'')+(typeof e.className==='string'&&e.className?'.'+e.className.split(/\s+/)[0]:''),ok:outline||ring,shown:r.width>0&&r.height>0};});
  if(r&&r.shown&&!r.ok)out.push({kind:'focus',el:r.el});}return out;}
(async()=>{const browser=await chromium.launch({headless:true,...(process.env.NIGHTLINK_BROWSER?{executablePath:process.env.NIGHTLINK_BROWSER}:{})});const report={};try{
 const context=await browser.newContext({viewport:{width:1320,height:860}}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await serve(context);
 await page.goto('http://127.0.0.1:4173');await page.waitForFunction(()=>typeof view==='function'&&window.NightlinkTerminalWindows);await fixture(page);
 assert.equal(await page.evaluate(()=>document.documentElement.dataset.interface),'terminal');
 await page.evaluate(async()=>{await NightlinkBook.ready;await NightlinkBook.store.save({id:'audit-person',displayName:'Saved operator',callSign:'N0ABC',notes:'Personal notes',identities:[{key:'aa'.repeat(32),name:'Operator',location:{lat:39.1,lon:-84.2,at:Date.now(),source:'radio advert'}}],history:[{id:'audit-message',kind:'channel',sender:'Operator',channel:'Public',text:'Recorded observation',at:Date.now(),sentAt:1}]});await NightlinkBook.reload();});
 const screens=[['Contact Book',()=>{view('Contact Book');document.querySelector('.book-row').click();}],['Contact Book map',()=>{view('Contact Book');document.querySelector('.book-row').click();[...document.querySelectorAll('.book-tabs button')].find(b=>b.textContent==='Map').click();}],['Contact Book activity',()=>{view('Contact Book');document.querySelector('.book-row').click();[...document.querySelectorAll('.book-tabs button')].find(b=>b.textContent==='Activity').click();}],['Overview',()=>view('Overview')],['Messages',()=>view('Messages')],['Direct Messages',()=>view('Direct Messages')],['Nodes',()=>view('Nodes')],['Network map',()=>{view('Network map');const d=document.querySelector('#term-node-map');if(d)d.open=true;}],['Activity',()=>view('Activity')],['Search',()=>view('Search')],['Radio',()=>view('Radio')]];
 for(const [name,fn] of screens){await page.evaluate(`(${fn})()`);await page.waitForTimeout(150);await page.evaluate(()=>document.activeElement?.blur());
  report[name]=[...await page.evaluate(audit,null),...await focusCheck(page,25)];}
 for(const cat of await page.evaluate(()=>{view('Settings');return [...document.querySelectorAll('[data-settings-category],[data-category]')].map(b=>b.dataset.settingsCategory||b.dataset.category);})){
  await page.evaluate(c=>NightlinkSettings.open(c),cat);await page.waitForTimeout(100);report['Settings/'+cat]=await page.evaluate(audit,null);}
 if(!Object.keys(report).some(k=>k.startsWith('Settings/'))){await page.evaluate(()=>view('Settings'));report.Settings=await page.evaluate(audit,null);}
 const dialogs=[['Contact Book editor',()=>{view('Contact Book');document.querySelector('#book-new').click();}],['Contact Book picker',()=>{view('Contact Book');document.querySelector('#book-pick').click();}],['Device Center',()=>showDeviceCenter()],['Propagation Monitor',()=>showPropagationMonitor()],['Message path',()=>showMessageRoute(live.messages[0])]];
 for(const [name,fn] of dialogs){await page.evaluate(`(${fn})()`);await page.waitForTimeout(200);report['dialog/'+name]=[...await page.evaluate(audit,'#dialog'),...await focusCheck(page,15)];await page.keyboard.press('Escape');await page.evaluate(()=>document.querySelector('#dialog').open&&document.querySelector('#dialog').close());}
 const lock=await context.newPage();await lock.addInitScript(()=>{window.nightlinkSecurity={info:async()=>({}),unlock:async()=>({ok:false}),quit(){}};});await lock.goto('http://127.0.0.1:4173/security-lock.html');
 report['startup lock']=[...await lock.evaluate(audit,null),...await focusCheck(lock,6)];
 const dm=await context.newPage();await dm.addInitScript(()=>{window.dmWindow={onUpdate:fn=>window.__dmUpdate=fn,contact(){},reply(){},action(){},read(){},draft(){},onFocus(){}};});await dm.goto('http://127.0.0.1:4173/dm.html');
 report['detached DM']=[...await dm.evaluate(audit,null),...await focusCheck(dm,8)];
 const total=Object.values(report).reduce((n,l)=>n+l.length,0);
 if(process.env.NIGHTLINK_AUDIT_REPORT)console.log(JSON.stringify(report,null,1));
 for(const [k,l] of Object.entries(report))if(l.length)console.log(k+': '+l.length+' finding(s)\n'+l.map(f=>'  '+JSON.stringify(f)).join('\n'));
 assert.deepEqual(errors,[]);assert.equal(total,0,'accessibility findings: '+total);console.log('terminal accessibility audit passed: '+Object.keys(report).length+' screens');
}finally{await browser.close();}})().catch(e=>{console.error(e.message);process.exit(1);});
