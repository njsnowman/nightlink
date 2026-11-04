/* Synthetic startup/manual synchronization: no physical radio commands. */
const {chromium}=require(process.env.NIGHTLINK_PLAYWRIGHT||'playwright'),fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,...(process.env.NIGHTLINK_BROWSER?{executablePath:process.env.NIGHTLINK_BROWSER}:{})});try{
 const context=await browser.newContext({viewport:{width:1320,height:860}});
 await context.route('**/*',async route=>{const u=new URL(route.request().url());if(u.origin!=='http://127.0.0.1:4173')return route.abort();const f=u.pathname==='/'?'index.html':u.pathname.slice(1);try{await route.fulfill({body:await fs.readFile(path.join(__dirname,f)),contentType:f.endsWith('.js')?'text/javascript':f.endsWith('.css')?'text/css':'text/html'});}catch{await route.fulfill({status:404,body:''});}});
 const page=await context.newPage();await page.addInitScript(()=>{
  const config={enabled:true,last:{kind:'bluetooth',name:'Test companion'}};
  window.nightlinkStartup={info:async()=>config,attempt:()=>new Promise(resolve=>window.__startupResolve=resolve),remember:async()=>{window.__remembered=true;},cancel:async()=>{},setEnabled:async()=>config};
 });
 await page.goto('http://127.0.0.1:4173');await page.waitForFunction(()=>window.__startupResolve&&window.NightlinkMRC);
 await page.evaluate(()=>{radioSession.request=async()=>{throw Error('radio blocked');};live.identity={key:'11'.repeat(32),name:'Test companion',frequency:910.525,txPower:20};ble.state='connected';radioSession.dispatchEvent(new CustomEvent('sync',{detail:{state:'syncing'}}));const ch={kind:'channel',slot:0,id:'a'.repeat(24),name:'public'};live.channels=[ch];live.selected=ch;view('Messages');});
 await page.fill('#mrc-input','keep this draft');await page.focus('#mrc-input');
 await page.evaluate(()=>{window.__startupResolve(true);radioSession.dispatchEvent(new CustomEvent('sync',{detail:{state:'ready'}}));});await page.waitForFunction(()=>window.__remembered);await page.waitForTimeout(50);
 assert.equal(await page.evaluate(()=>current),'Messages','startup sync must not return the user to the main menu');assert.equal(await page.inputValue('#mrc-input'),'keep this draft');assert.equal(await page.evaluate(()=>document.activeElement.id),'mrc-input');
 // Manual connection opened from Chat closes its sheet without changing the page.
 await page.evaluate(()=>{showBluetooth();radioSession.dispatchEvent(new CustomEvent('sync',{detail:{state:'syncing'}}));radioSession.dispatchEvent(new CustomEvent('sync',{detail:{state:'ready'}}));});await page.waitForTimeout(50);
 assert.equal(await page.evaluate(()=>current),'Messages');assert.equal(await page.evaluate(()=>bleSheet.open),false);assert.equal(await page.inputValue('#mrc-input'),'keep this draft');
 // A page selected while async startup bookkeeping is pending stays selected.
 const later=await context.newPage();await later.addInitScript(()=>{const config={enabled:true,last:{kind:'bluetooth',name:'Test companion'}};window.nightlinkStartup={info:async()=>config,attempt:()=>new Promise(r=>window.__startupResolve=r),remember:()=>new Promise(r=>window.__rememberResolve=r),cancel:async()=>{}};});
 await later.goto('http://127.0.0.1:4173');await later.waitForFunction(()=>window.__startupResolve&&window.NightlinkMRC);
 await later.evaluate(()=>{radioSession.request=async()=>{throw Error('radio blocked');};live.identity={key:'fa'.repeat(32),name:'Test companion'};ble.state='connected';window.__startupResolve(true);radioSession.dispatchEvent(new CustomEvent('sync',{detail:{state:'ready'}}));view('Settings');});
 await later.waitForFunction(()=>window.__rememberResolve);await later.evaluate(()=>window.__rememberResolve());await later.waitForTimeout(50);assert.equal(await later.evaluate(()=>current),'Settings');
 await context.close();console.log('startup/manual sync navigation checks passed');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1);});
