/* Cards skins: each skin applies in Cards only, keeps 4.5:1 text contrast on the Messages page, turns glass off,
   School / District name and colour (with refusal of low-contrast colours), detached DM and startup lock. Synthetic only. */
const {chromium}=require(process.env.NIGHTLINK_PLAYWRIGHT||'playwright'),fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict');
const serve=async r=>{const u=new URL(r.request().url());if(u.origin!=='http://127.0.0.1:4173')return r.abort();const f=u.pathname==='/'?'index.html':u.pathname.slice(1);try{await r.fulfill({body:await fs.readFile(path.join(__dirname,f)),contentType:f.endsWith('.js')?'text/javascript':f.endsWith('.css')?'text/css':'text/html'});}catch{await r.fulfill({status:404,body:''});}};
const seed=(store)=>{try{if(!sessionStorage.getItem('seeded')){for(const [k,v] of Object.entries(store))localStorage.setItem(k,v);localStorage.setItem('meshline.profile',JSON.stringify({identity:{key:'cd'.repeat(32),name:'DEMO HQ',version:'t',model:'T',frequency:906.875,txPower:22},contacts:[],channels:[{slot:0,id:'01'.repeat(12),name:'Public'}]}));sessionStorage.setItem('seeded','1');}}catch{}};
// Contrast of every visible text element in the chat and headings against its first opaque ancestor background.
const audit=()=>{const lum=c=>{const m=c.match(/[\d.]+/g).map(Number);return [m[0],m[1],m[2]].map(v=>v/255).map(v=>v<=.03928?v/12.92:((v+.055)/1.055)**2.4).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);};
 const bg=e=>{for(let n=e;n;n=n.parentElement){const c=getComputedStyle(n).backgroundColor,a=c.match(/[\d.]+/g);if(a&&(a.length<4||+a[3]>.85))return c;}return 'rgb(255,255,255)';};
 const bad=[];for(const e of document.querySelectorAll('#chat-log .message p, #chat-log .sender, h1, .panel-heading strong, #message-input, #workspace-sidebar nav button')){const r=e.getBoundingClientRect();if(!r.width||!r.height||!e.textContent.trim()&&e.tagName!=='TEXTAREA')continue;
  const fg=getComputedStyle(e).color,a=lum(fg),b=lum(bg(e)),ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);if(ratio<4.5)bad.push(e.tagName+'.'+e.className+' '+fg+' on '+bg(e)+' = '+ratio.toFixed(2));}return bad;};
(async()=>{const browser=await chromium.launch({headless:true,...(process.env.NIGHTLINK_BROWSER?{executablePath:process.env.NIGHTLINK_BROWSER}:{})});try{
 const open=async(store,file='')=>{const page=await browser.newPage({viewport:{width:1320,height:860}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(seed,store);await page.route('**/*',serve);await page.goto('http://127.0.0.1:4173/'+file);return {page,errors};};
 const fill=page=>page.evaluate(()=>{live.sync='ready';const t={kind:'channel',...live.channels[0]},c=conversationId(t),n=Date.now()/1000;live.messages=[['DEMO Ridge','Good evening mesh',900,0],['DEMO HQ','Thanks, RX/TX tonight',500,1],['DEMO Valley','@[DEMO HQ] copy 4 hops',200,0]].map((m,i)=>({id:'m'+i,conversation:c,target:t,kind:'channel',sender:m[0],text:m[1],timestamp:n-m[2],own:!!m[3],status:m[3]?'Broadcast accepted by radio':'Received',pathLength:i+1}));live.selected=t;view('Messages');});
 const expectBody={tactical:'rgb(13, 17, 15)',red:'rgb(0, 0, 0)',radio:'rgb(18, 19, 20)',school:'rgb(244, 246, 250)'};
 for(const s of ['tactical','red','radio','school']){const {page,errors}=await open({'nightlink.interface':'cards','nightlink.cards-skin':s,'nightlink.cards-glass':'frosted'});await fill(page);await page.waitForTimeout(250);
  assert.equal(await page.evaluate(()=>document.documentElement.dataset.cardsSkin),s);
  assert.equal(await page.evaluate(()=>getComputedStyle(document.body).backgroundColor),expectBody[s],s+' background');
  assert.equal(await page.locator('.panel').first().evaluate(e=>getComputedStyle(e).backdropFilter),'none',s+' turns glass off');
  assert.deepEqual(await page.evaluate(audit),[],s+' text contrast');
  if(s==='red')assert.deepEqual(await page.locator('#chat-log .avatar').evaluateAll(a=>[...new Set(a.map(e=>getComputedStyle(e).color))]),['rgb(255, 74, 54)'],'red light avatars are red');
  if(process.env.NIGHTLINK_SCREENSHOTS)await page.screenshot({path:path.join(process.env.NIGHTLINK_SCREENSHOTS,'Cards-Skin-'+s+'.png')});
  assert.deepEqual(errors,[]);await page.close();}
 // Settings: skin select, glass disabled off Standard, School name banner and colour refusal.
 let {page,errors}=await open({'nightlink.interface':'cards'});await page.evaluate(()=>view('Settings'));const sel=page.locator('#cards-skin');await sel.waitFor();
 assert.deepEqual(await sel.locator('option').evaluateAll(o=>o.map(x=>x.value)),['standard','tactical','red','radio','school']);assert.equal(await page.locator('#cards-glass').isDisabled(),false);assert.equal(await page.locator('#school-name-setting').isHidden(),true);
 await sel.selectOption('school');assert.equal(await page.locator('#cards-glass').isDisabled(),true);await page.locator('#school-name').fill('Lincoln County Schools');
 assert.equal(await page.locator('#workspace-sidebar .school-banner').textContent(),'Lincoln County Schools');
 await page.locator('#school-color').evaluate(e=>{e.value='#ffd700';e.dispatchEvent(new Event('input'));});assert.match(await page.locator('.school-color-note').textContent(),/Not used/);assert.equal(await page.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue('--nl-school').trim()),'#1f4e9c');
 await page.locator('#school-color').evaluate(e=>{e.value='#7a0019';e.dispatchEvent(new Event('input'));});assert.equal(await page.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue('--nl-school').trim()),'#7a0019');
 assert.equal(await page.locator('#workspace-sidebar').evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(122, 0, 25)');
 await page.reload();assert.equal(await page.evaluate(()=>document.documentElement.dataset.cardsSkin),'school','skin persists');assert.equal(await page.locator('#workspace-sidebar .school-banner').textContent(),'Lincoln County Schools');
 await sel.selectOption('standard').catch(()=>{});await page.evaluate(()=>view('Settings'));await page.locator('#cards-skin').selectOption('standard');assert.equal(await page.locator('#workspace-sidebar .school-banner').count(),0);assert.deepEqual(errors,[]);await page.close();
 // Terminal ignores the skin; detached DM and startup lock carry the attribute.
 ({page,errors}=await open({'nightlink.interface':'terminal','nightlink.cards-skin':'red'}));await page.evaluate(()=>view('Settings'));assert.equal(await page.locator('#cards-skin').count(),0,'no skin setting in Terminal');
 assert.equal(await page.evaluate(()=>[...document.querySelectorAll('body *')].filter(e=>e.getClientRects().length&&getComputedStyle(e).color==='rgb(255, 59, 48)').length),0,'Terminal keeps its palette');await page.close();
 for(const f of ['dm.html','security-lock.html']){({page,errors}=await open({'nightlink.interface':'cards','nightlink.cards-skin':'red'},f));assert.equal(await page.evaluate(()=>document.documentElement.dataset.cardsSkin),'red',f);await page.close();}
 console.log('PASS Cards skins: four skins in Cards only, 4.5:1 chat and heading contrast, glass off, red-light avatars, School name and colour with refusal, persistence, Terminal isolation, detached DM and startup lock. Synthetic only.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
