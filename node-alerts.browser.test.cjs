/* Node alerts: off by default; when enabled in Settings, a quiet favourite raises one notice and an Activity entry,
   recovery is reported, low radio battery alerts once. Synthetic profile and clock; no radio commands. */
const {chromium}=require('./test-cards-interface.cjs')(require(process.env.NIGHTLINK_PLAYWRIGHT||'playwright')),fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict');
const serve=async r=>{const u=new URL(r.request().url());if(u.origin!=='http://127.0.0.1:4173')return r.abort();const f=u.pathname==='/'?'index.html':u.pathname.slice(1);try{await r.fulfill({body:await fs.readFile(path.join(__dirname,f)),contentType:f.endsWith('.js')?'text/javascript':f.endsWith('.css')?'text/css':'text/html'});}catch{await r.fulfill({status:404,body:''});}};
(async()=>{const browser=await chromium.launch({headless:true,...(process.env.NIGHTLINK_BROWSER?{executablePath:process.env.NIGHTLINK_BROWSER}:{})});try{
 const page=await browser.newPage({viewport:{width:1320,height:860}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.route('**/*',serve);await page.goto('http://127.0.0.1:4173');await page.waitForFunction(()=>window.NightlinkNodeAlerts);
 await page.evaluate(()=>{const now=Math.floor(Date.now()/1000);live.identity={key:'cd'.repeat(32),name:'DEMO HQ',frequency:910.525,txPower:22};live.sync='ready';live.battery={millivolts:3900};
  live.contacts=[{key:'ab'.repeat(32),name:'DEMO Ridge',type:2,lastAdvert:now-3*3600},{key:'ac'.repeat(32),name:'DEMO Fresh',type:2,lastAdvert:now-60},{key:'ad'.repeat(32),name:'Not watched',type:1,lastAdvert:now-9*3600}];favoriteKeys=new Set(['ab'.repeat(32),'ac'.repeat(32)]);});
 assert.deepEqual(await page.evaluate(()=>NightlinkNodeAlerts.check()),[],'off by default');
 await page.evaluate(()=>{view('Settings');NightlinkSettings.open('notifications');});await page.locator('#node-alerts-enabled').waitFor();assert.equal(await page.locator('#node-alerts-enabled').isChecked(),false);
 await page.locator('#node-alerts-enabled').check();await page.locator('#node-alerts-minutes').selectOption('120');
 const first=await page.evaluate(()=>NightlinkNodeAlerts.check());assert.deepEqual(first.map(e=>[e.type,e.name]),[['quiet','DEMO Ridge']],'only the quiet favourite');
 assert.match(await page.locator('#toast').textContent(),/DEMO Ridge has not been heard for 3 h/);assert.equal(await page.evaluate(()=>activity[0].includes('Alert · DEMO Ridge has not been heard')),true);
 assert.deepEqual(await page.evaluate(()=>NightlinkNodeAlerts.check()),[],'no repeat in the same quiet spell');
 await page.evaluate(()=>{(window.NightlinkHeardAdverts||=new Map()).set('ab'.repeat(32),{snr:4,at:Math.floor(Date.now()/1000)});});
 assert.deepEqual((await page.evaluate(()=>NightlinkNodeAlerts.check())).map(e=>e.type),['back']);
 await page.evaluate(()=>{live.battery={millivolts:3420};});assert.deepEqual((await page.evaluate(()=>NightlinkNodeAlerts.check())).map(e=>e.type),['battery']);assert.match(await page.locator('#toast').textContent(),/battery is low: 3.42 V/);
 assert.deepEqual(await page.evaluate(()=>NightlinkNodeAlerts.check()),[],'battery alerts once');
 await page.reload();await page.waitForFunction(()=>window.NightlinkNodeAlerts);assert.equal(await page.evaluate(()=>NightlinkNodeAlerts.read().enabled),true,'setting persists');
 assert.deepEqual(errors,[]);await page.close();
 console.log('PASS Node alerts: off by default, quiet favourite alert once with notice and Activity entry, unwatched ignored, recovery, low battery once, setting persists. Synthetic only.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
