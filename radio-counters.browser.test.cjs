/* Radio Health counters from synthetic stats events; no radio commands. */
const {chromium}=require(process.env.NIGHTLINK_PLAYWRIGHT||'playwright'),fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,...(process.env.NIGHTLINK_BROWSER?{executablePath:process.env.NIGHTLINK_BROWSER}:{})});try{
 const page=await browser.newPage({viewport:{width:1100,height:950}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',async route=>{const u=new URL(route.request().url());if(u.origin!=='http://127.0.0.1:4173')return route.abort();const file=u.pathname==='/'?'index.html':u.pathname.slice(1);try{await route.fulfill({body:await fs.readFile(path.join(__dirname,file)),contentType:file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':file.endsWith('.svg')?'image/svg+xml':'text/html'});}catch{await route.fulfill({status:404,body:''});}});
 await page.goto('http://127.0.0.1:4173');await page.waitForFunction(()=>typeof showRadioHealth==='function'&&typeof NightlinkRadioCounters==='object');
 const value=key=>page.locator('.radio-counters [data-health="'+key+'"]').textContent();
 await page.evaluate(()=>{window.commandsSent=[];ble.command=async b=>{commandsSent.push([...b]);throw Error('blocked');};live.identity={key:'aa'.repeat(32),protocol:14,name:'Field Radio · DEMO',frequency:910.525,bandwidth:250,sf:10,cr:5,txPower:22,maxTxPower:22,lat:0,lon:0,located:false,model:'Companion · DEMO',version:'v1.0.0',build:'demo',maxChannels:8,repeatEnabled:false,type:1};radioSession.identity=live.identity;radioSession.emit('identity',live.identity);view('Radio');showRadioHealth();});
 await page.locator('#radio-counters-title').waitFor();
 assert.equal(await value('sent'),'—');assert.equal(await value('read'),'Not read yet · refresh radio data');
 await page.evaluate(()=>{radioSession.emit('stats',{uptime:3600,queue:0});radioSession.emit('stats',{noise:-110,rssi:-90,snr:6,txAir:42,rxAir:9001});radioSession.emit('stats',{packetsReceived:340,packetsSent:12});});
 await page.waitForFunction(()=>document.querySelector('.radio-counters [data-health="sent"]')?.textContent==='12');
 assert.equal(await value('received'),'340');assert.equal(await value('txair'),'42');assert.equal(await value('rxair'),'9001');assert.equal(await value('radiouptime'),'3600');assert.notEqual(await value('read'),'Not read yet · refresh radio data');
 assert.match(await page.locator('.radio-counters .ble-note').textContent(),/since it last started/);
 assert.equal(await page.locator('.radio-counters dl > div').count(),6);
 await page.evaluate(()=>{radioSession.statsDisabled.add(live.identity.key);renderRadioHealth();});
 assert.equal(await value('sent'),'Unavailable on this firmware');assert.equal(await value('read'),'Unavailable on this firmware');
 await page.evaluate(()=>{radioSession.statsDisabled.clear();const old={key:'bb'.repeat(32),protocol:7,name:'Old Radio · DEMO',frequency:910.525,bandwidth:250,sf:10,cr:5,txPower:22,maxTxPower:22,lat:0,lon:0,located:false,model:'Companion · DEMO',version:'v1.0.0',build:'demo',maxChannels:8,repeatEnabled:false,type:1};live.identity=old;radioSession.identity=old;radioSession.emit('identity',old);renderRadioHealth();});
 assert.equal(await value('sent'),'Unavailable on this firmware');
 await page.setViewportSize({width:760,height:560});
 assert.equal(await page.evaluate(()=>{const d=document.querySelector('#dialog');return d.scrollWidth>d.clientWidth+1;}),false);
 assert.deepEqual(await page.evaluate(()=>commandsSent),[]);assert.deepEqual(errors,[]);
 console.log('PASS Radio Health counters: synthetic stats values, raw-value labels, not-read state, statsDisabled and protocol<8 unavailable states, compact width and no radio commands. Synthetic events only.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1);});
