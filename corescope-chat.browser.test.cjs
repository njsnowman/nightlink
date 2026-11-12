/* Synthetic CoreScope service: tests presentation/lifecycle, not a verified live feed. */
const {chromium}=require(process.env.NIGHTLINK_PLAYWRIGHT||'playwright'),fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict'),{SCRIPT}=require('./corescope-chat-desktop.cjs');
(async()=>{const browser=await chromium.launch({headless:true,...(process.env.NIGHTLINK_BROWSER?{executablePath:process.env.NIGHTLINK_BROWSER}:{})});try{
 const context=await browser.newContext({viewport:{width:1320,height:860}});let loads=0;
 await context.addInitScript(()=>{window.nightlinkCoreScope={chatMapSupported:true};});
 await context.route('**/*',async route=>{
  const u=new URL(route.request().url());
  if(u.origin==='https://map.okimesh.org'){
   loads++;return route.fulfill({contentType:'text/html',body:'<html><head></head><body><nav>Menu nodes packets</nav><main id="app"><div class="live-page"><div id="liveMap" class="leaflet-container" tabindex="0" style="background:#102b44"><div class="leaflet-control">Settings</div><div class="leaflet-control leaflet-control-attribution">Map attribution</div></div><div id="liveFeed"><button>Packet listing</button></div></div></main><script>'+SCRIPT+'</script></body></html>'});
  }
  if(u.origin!=='http://127.0.0.1:4173')return route.abort();
  const file=u.pathname==='/'?'index.html':u.pathname.slice(1);try{await route.fulfill({body:await fs.readFile(path.join(__dirname,file)),contentType:file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/html'});}catch{await route.fulfill({status:404,body:''});}
 });
 const page=await context.newPage();await page.goto('http://127.0.0.1:4173');await page.waitForFunction(()=>window.NightlinkMRC);
 await page.evaluate(()=>view('Messages'));assert.equal(await page.locator('.mrc-map iframe').count(),0,'desktop chat starts without a live iframe');await page.locator('.mrc-map summary').click();await page.waitForSelector('.mrc-map-holder.ready');
 assert.equal(await page.locator('.mrc-nodes').count(),0,'chat has no duplicate node listing');
 assert.equal(await page.locator('.mrc-map iframe').count(),1);
 assert.equal(new URLSearchParams((await page.locator('.mrc-map iframe').getAttribute('src')).split('?')[1]).get('zoom'),'7','chat opens at regional zoom');
 const map=page.frameLocator('.mrc-map iframe');assert.equal(await map.locator('nav').isVisible(),false);assert.equal(await map.locator('#liveFeed').isVisible(),false);assert.equal(await map.locator('.leaflet-control:not(.leaflet-control-attribution)').isVisible(),false);assert.ok(await map.locator('.leaflet-control-attribution').isVisible());
 const initialLoads=loads;await page.evaluate(()=>{renderMessages();renderMessages();});await page.waitForTimeout(100);assert.equal(loads,initialLoads,'incoming chat renders do not reload the map');
 const box=await page.locator('.mrc-map-holder').boundingBox();assert.ok(box.width<=300&&box.height<=192);
 await page.evaluate(()=>NightlinkMapProviders.set('corescope',false));assert.equal(await page.locator('.mrc-map iframe').count(),0);assert.match(await page.textContent('.mrc-map-status'),/hidden in Settings/);
 await page.evaluate(()=>NightlinkMapProviders.set('corescope',true));await page.waitForSelector('.mrc-map-holder.ready');
 await context.setOffline(true);await page.waitForFunction(()=>!document.querySelector('.mrc-map iframe'));assert.match(await page.textContent('.mrc-map-status'),/Offline/);await context.setOffline(false);await page.waitForSelector('.mrc-map-holder.ready');
 await page.evaluate(()=>view('Radio'));assert.equal(await page.locator('.mrc-map iframe').count(),0);
 await page.setViewportSize({width:760,height:560});await page.evaluate(()=>view('Messages'));await page.locator('.mrc-map summary').click();await page.waitForFunction(()=>!document.querySelector('.mrc-map iframe'));
 await page.locator('.mrc-map summary').click();await page.waitForSelector('.mrc-map-holder.ready');
 const compact=await page.evaluate(()=>({width:document.documentElement.scrollWidth,input:document.querySelector('#mrc-input').getBoundingClientRect().bottom,keys:document.querySelector('#term-fkeys').getBoundingClientRect().top}));assert.ok(compact.width<=760);assert.ok(compact.input<=compact.keys);
 if(process.env.NIGHTLINK_SCREENSHOTS)await page.screenshot({path:path.join(process.env.NIGHTLINK_SCREENSHOTS,'chat-corescope-compact-simulated.png')});
 await page.evaluate(()=>NightlinkInterface.set('cards'));assert.equal(await page.locator('.mrc-map iframe').count(),0);
 await page.evaluate(()=>NightlinkInterface.set('terminal'));
 const small=await context.newPage();await small.setViewportSize({width:760,height:560});await small.goto('http://127.0.0.1:4173');await small.waitForFunction(()=>window.NightlinkMRC);await small.evaluate(()=>view('Messages'));
 assert.equal(await small.locator('.mrc-map').evaluate(e=>e.open),false,'compact windows start collapsed');assert.equal(await small.locator('.mrc-map iframe').count(),0,'collapsed compact panel does not contact the service');await small.close();
 await context.close();console.log('chat CoreScope synthetic browser checks passed');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1);});
