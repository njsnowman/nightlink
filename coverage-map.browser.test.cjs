/* Coverage layer: Coverage button on the local Radio map, coloured dots for located nodes with 24 h readings, legend,
   tooltip summary, choice remembered, off by default. Synthetic history; street tiles blocked. */
const {chromium}=require('./test-cards-interface.cjs')(require(process.env.NIGHTLINK_PLAYWRIGHT||'playwright')),fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict');
const serve=async r=>{const u=new URL(r.request().url());if(u.origin!=='http://127.0.0.1:4173')return r.abort();const f=u.pathname==='/'?'index.html':u.pathname.slice(1);try{await r.fulfill({body:await fs.readFile(path.join(__dirname,f)),contentType:f.endsWith('.js')?'text/javascript':f.endsWith('.css')?'text/css':'text/html'});}catch{await r.fulfill({status:404,body:''});}};
(async()=>{const browser=await chromium.launch({headless:true,...(process.env.NIGHTLINK_BROWSER?{executablePath:process.env.NIGHTLINK_BROWSER}:{})});try{
 const page=await browser.newPage({viewport:{width:1320,height:860}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{try{const now=Math.floor(Date.now()/1000);localStorage.setItem('nightlink.map.corescope','off');localStorage.setItem('nightlink.map.meshmapper','off');
  localStorage.setItem('nightlink.snr-history.'+'cd'.repeat(8),JSON.stringify({['ab'.repeat(8)]:[[now-600,6],[now-300,8]],['ac'.repeat(8)]:[[now-500,-12],[now-100,-14]],['ae'.repeat(8)]:[[now-100,2]]}));}catch{}});
 await page.route('**/*',serve);await page.goto('http://127.0.0.1:4173');await page.waitForFunction(()=>window.NightlinkCoverage);
 const seed=()=>page.evaluate(()=>{live.identity={key:'cd'.repeat(32),name:'DEMO HQ',located:true,lat:40,lon:-86,frequency:910.525,txPower:22};live.sync='ready';
  live.contacts=[{key:'ab'.repeat(32),name:'DEMO Ridge',type:2,located:true,lat:40.3,lon:-86},{key:'ac'.repeat(32),name:'DEMO Hollow',type:1,located:true,lat:40,lon:-85.6},{key:'ad'.repeat(32),name:'DEMO Unheard',type:1,located:true,lat:39.8,lon:-86.2},{key:'ae'.repeat(32),name:'No fix',type:1,located:false}];view('Overview');renderMap();});
 await seed();await page.getByRole('button',{name:'Use Radio map'}).click().catch(()=>{});await page.evaluate(()=>{renderMap();networkStreetMap.fitBounds([[39.7,-86.4],[40.5,-85.4]]);});
 const toggle=page.locator('.coverage-toggle');await toggle.waitFor();assert.equal(await toggle.getAttribute('aria-pressed'),'false','off by default');assert.equal(await page.locator('path.coverage-dot').count(),0);
 await toggle.click();assert.equal(await toggle.getAttribute('aria-pressed'),'true');assert.equal(await page.locator('path.coverage-dot').count(),2,'only located nodes with readings');
 assert.equal(await page.locator('path.coverage-strong').count(),1);assert.equal(await page.locator('path.coverage-poor').count(),1);assert.equal(await page.locator('.coverage-legend').isVisible(),true);
 assert.equal(await page.locator('.coverage-count').textContent(),'2 located nodes with readings');
 await page.locator('path.coverage-strong').dispatchEvent('mouseover');await page.waitForTimeout(100);assert.match(await page.locator('.leaflet-tooltip',{hasText:'readings in 24 h'}).first().textContent(),/DEMO Ridge · strong · average 7 dB \(low 6, high 8\) · 2 readings in 24 h/);
 if(process.env.NIGHTLINK_SCREENSHOTS)await page.screenshot({path:path.join(process.env.NIGHTLINK_SCREENSHOTS,'Coverage-map.png')});
 await page.reload();await page.waitForFunction(()=>window.NightlinkCoverage);await seed();await page.getByRole('button',{name:'Use Radio map'}).click().catch(()=>{});await page.evaluate(()=>renderMap());assert.equal(await page.locator('.coverage-toggle').getAttribute('aria-pressed'),'true','choice remembered');
 await page.locator('.coverage-toggle').click();assert.equal(await page.locator('path.coverage-dot').count(),0);assert.equal(await page.locator('.coverage-legend').isVisible(),false);
 assert.deepEqual(errors,[]);await page.close();
 console.log('PASS Coverage layer: off by default, Coverage button, dots only for located nodes with 24 h readings, strong/poor colouring, legend count, tooltip summary, remembered, turns off. Synthetic only.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
