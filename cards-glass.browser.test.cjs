/* Cards glass setting: Frosted default, Liquid refraction filter, Off, persistence, reduced transparency and terminal isolation. Synthetic only. */
const {chromium}=require(process.env.NIGHTLINK_PLAYWRIGHT||'playwright'),fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,...(process.env.NIGHTLINK_BROWSER?{executablePath:process.env.NIGHTLINK_BROWSER}:{})});try{
 const serve=async r=>{const u=new URL(r.request().url());if(u.origin!=='http://127.0.0.1:4173')return r.abort();const f=u.pathname==='/'?'index.html':u.pathname.slice(1);try{await r.fulfill({body:await fs.readFile(path.join(__dirname,f)),contentType:f.endsWith('.js')?'text/javascript':f.endsWith('.css')?'text/css':'text/html'});}catch{await r.fulfill({status:404,body:''});}};
 const open=async(iface,opts={})=>{const page=await browser.newPage({viewport:{width:1320,height:860},...opts}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(v=>{try{if(!sessionStorage.getItem('seeded')){localStorage.setItem('nightlink.interface',v);sessionStorage.setItem('seeded','1');}}catch{}},iface);await page.route('**/*',serve);await page.goto('http://127.0.0.1:4173');await page.waitForFunction(()=>window.NightlinkCardsPolish);return {page,errors};};
 const panelBg=page=>page.locator('.panel').first().evaluate(e=>{const s=getComputedStyle(e);return {filter:s.backdropFilter,bg:s.backgroundColor};});
 let {page,errors}=await open('cards');
 assert.equal(await page.evaluate(()=>document.documentElement.dataset.cardsGlass),'frosted','Frosted is the default');
 assert.match((await panelBg(page)).filter,/blur/);
 await page.evaluate(()=>view('Settings'));const sel=page.locator('#cards-glass');await sel.waitFor();
 assert.deepEqual(await sel.locator('option').evaluateAll(o=>o.map(x=>x.value)),['frosted','liquid','off']);
 assert.equal(await page.locator('#cards-glass-setting').count(),1);await page.evaluate(()=>view('Settings'));assert.equal(await page.locator('#cards-glass-setting').count(),1,'setting is not duplicated');
 await sel.selectOption('liquid');assert.equal(await page.evaluate(()=>document.documentElement.dataset.cardsGlass),'liquid');assert.equal(await page.locator('#nl-liquid').count(),1);assert.match((await panelBg(page)).filter,/url/);
 await sel.selectOption('off');assert.equal(await page.evaluate(()=>localStorage.getItem('nightlink.cards-glass')),'off');assert.equal((await panelBg(page)).filter,'none');
 await page.reload();await page.waitForFunction(()=>window.NightlinkCardsPolish);assert.equal(await page.evaluate(()=>document.documentElement.dataset.cardsGlass),'off','choice persists');
 assert.deepEqual(errors,[]);await page.close();
 ({page,errors}=await open('cards',{reducedMotion:'no-preference'}));await page.emulateMedia({});
 const cdp=await page.context().newCDPSession(page);await cdp.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-transparency',value:'reduce'}]});
 assert.equal((await panelBg(page)).filter,'none','reduced transparency turns glass off');assert.equal((await panelBg(page)).bg,'rgb(18, 24, 38)');await page.close();
 ({page,errors}=await open('terminal'));await page.evaluate(()=>view('Settings'));assert.equal(await page.locator('#cards-glass').count(),0,'Terminal has no glass setting');
 assert.equal((await panelBg(page)).filter,'none','Terminal panels are never glass');assert.deepEqual(errors,[]);
 console.log('PASS Cards glass: Frosted default, Liquid filter, Off, persistence, single setting, reduced transparency and Terminal isolation. Synthetic only.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
