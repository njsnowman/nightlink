/* Tactical skin map overlay: crosshair markers for your radio, contacts and repeaters, bearing/distance/grid tooltips,
   north arrow and cursor readout on the Network street map; nothing for the Standard skin. Synthetic only; tiles blocked. */
const {chromium}=require(process.env.NIGHTLINK_PLAYWRIGHT||'playwright'),fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict');
const serve=async r=>{const u=new URL(r.request().url());if(u.origin!=='http://127.0.0.1:4173')return r.abort();const f=u.pathname==='/'?'index.html':u.pathname.slice(1);try{await r.fulfill({body:await fs.readFile(path.join(__dirname,f)),contentType:f.endsWith('.js')?'text/javascript':f.endsWith('.css')?'text/css':'text/html'});}catch{await r.fulfill({status:404,body:''});}};
(async()=>{const browser=await chromium.launch({headless:true,...(process.env.NIGHTLINK_BROWSER?{executablePath:process.env.NIGHTLINK_BROWSER}:{})});try{
 const open=async skin=>{const page=await browser.newPage({viewport:{width:1320,height:860}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(s=>{try{localStorage.setItem('nightlink.interface','cards');localStorage.setItem('nightlink.cards-skin',s);localStorage.setItem('nightlink.map.corescope','off');localStorage.setItem('nightlink.map.meshmapper','off');}catch{}},skin);
  await page.route('**/*',serve);await page.goto('http://127.0.0.1:4173');await page.waitForFunction(()=>window.NightlinkTacticalMap);
  await page.evaluate(()=>{live.identity={key:'cd'.repeat(32),name:'DEMO HQ',located:true,lat:40,lon:-86,frequency:910.525,txPower:22};live.sync='ready';
   live.contacts=[{key:'ab'.repeat(32),name:'DEMO Ridge',type:1,located:true,lat:41,lon:-86},{key:'ac'.repeat(32),name:'DEMO Tower',type:2,located:true,lat:40,lon:-85},{key:'ad'.repeat(32),name:'No fix',type:1,located:false}];view('Overview');renderMap();});await page.getByRole('button',{name:'Use Radio map'}).click().catch(()=>{});await page.evaluate(()=>{renderMap();networkStreetMap?.invalidateSize();});
  await page.waitForTimeout(200);return {page,errors};};
 let {page,errors}=await open('tactical');
 assert.equal(await page.locator('#overview .map-offline').count(),0,'offline note does not cover the Radio map');
 assert.equal(await page.locator('.tac-marker.tac-self').count(),1);assert.equal(await page.locator('.tac-marker.tac-node').count(),1);assert.equal(await page.locator('.tac-marker.tac-repeater').count(),1);
 assert.equal(await page.locator('.tac-marker.tac-node').getAttribute('title'),'DEMO Ridge · 000° N · 111.2 km / 69.1 mi · EN71aa');
 assert.match(await page.locator('.tac-marker.tac-repeater').getAttribute('title'),/^DEMO Tower · 090° E · 85\.2 km \/ 52\.9 mi · EN70ma$/);
 assert.equal(await page.locator('.tac-north').isVisible(),true);assert.equal(await page.locator('.tac-readout').textContent(),'YOU EN70aa');
 const box=await page.locator('#network-street-map').boundingBox();await page.mouse.move(box.x+box.width/2-40,box.y+box.height/2-30);await page.mouse.move(box.x+box.width/2,box.y+box.height/2,{steps:4});assert.match(await page.locator('.tac-readout').textContent(),/^CURSOR \d{3}° [NESW]{1,3} · .* · [A-R]{2}\d{2}[a-x]{2}$/);
 if(process.env.NIGHTLINK_SCREENSHOTS){await page.evaluate(()=>{networkStreetMap.fitBounds([[39.8,-86.3],[41.2,-84.7]]);});await page.waitForTimeout(200);await page.locator('.tac-marker.tac-node').hover({force:true}).catch(()=>{});await page.waitForTimeout(150);await page.screenshot({path:path.join(process.env.NIGHTLINK_SCREENSHOTS,'Cards-Tactical-Map.png')});}
 await page.evaluate(()=>{localStorage.setItem('nightlink.cards-skin','standard');NightlinkCardsSkins.apply();});await page.waitForTimeout(100);
 assert.equal(await page.locator('.tac-marker').count(),0,'switching skin removes markers');assert.equal(await page.locator('.tac-overlay').count(),0);
 if(process.env.NIGHTLINK_SCREENSHOTS)await page.screenshot({path:path.join(process.env.NIGHTLINK_SCREENSHOTS,'Cards-Tactical-Map-off.png')});
 assert.deepEqual(errors,[]);await page.close();
 ({page,errors}=await open('standard'));assert.equal(await page.locator('.tac-marker').count(),0,'Standard skin has no tactical overlay');assert.deepEqual(errors,[]);await page.close();
 console.log('PASS Tactical map: crosshair markers for self, contact and repeater, bearing/distance/Maidenhead titles, north arrow, cursor readout, removed when the skin changes, absent for Standard. Synthetic only.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
