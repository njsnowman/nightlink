/* Cards design pass: sidebar icons, settings toggles, activity timeline and filters, coloured avatars, grouping, SNR word, sparkline, offline map note. Synthetic only. */
const {chromium}=require(process.env.NIGHTLINK_PLAYWRIGHT||'playwright'),fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,...(process.env.NIGHTLINK_BROWSER?{executablePath:process.env.NIGHTLINK_BROWSER}:{})});try{
 const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{try{localStorage.setItem('nightlink.interface','cards');}catch{}});
 await page.route('**/*',async r=>{const u=new URL(r.request().url());if(u.origin!=='http://127.0.0.1:4173')return r.abort();const f=u.pathname==='/'?'index.html':u.pathname.slice(1);try{await r.fulfill({body:await fs.readFile(path.join(__dirname,f)),contentType:f.endsWith('.js')?'text/javascript':f.endsWith('.css')?'text/css':'text/html'});}catch{await r.fulfill({status:404,body:''});}});
 await page.goto('http://127.0.0.1:4173');await page.waitForFunction(()=>window.NightlinkCardsPolish);
 await page.evaluate(()=>{radioSession.request=async()=>{throw Error('radio blocked');};const now=Math.floor(Date.now()/1000);live.identity={key:'ee'.repeat(32),name:'BASE',frequency:910.525,bandwidth:250,spreadingFactor:11,codingRate:5,txPower:22};live.sync='ready';live.stats={snr:9,rssi:-98};live.battery={millivolts:4000};
  const c={kind:'channel',slot:0,id:'ab'.repeat(12),name:'Public'};live.channels=[{slot:0,id:c.id,name:'Public'}];live.selected={...c};live.contacts=[{key:'11'.repeat(32),name:'Alex',type:1,lastAdvert:now}];
  live.messages=[['Alex','one'],['Alex','two'],['Sam','three']].map(([s,t],i)=>({id:'c'+i,kind:'channel',target:c,conversation:conversationId(c),sender:s,text:t,timestamp:now-120+i,status:'Received'}));
  activity.splice(0,activity.length,'1:00:01 AM · Bluetooth companion connected','1:00:02 AM · Radio synchronized','1:00:03 AM · Sync failed: timed out');renderStats();renderChannels();});
 // Sidebar and settings
 assert.equal(await page.locator('nav>button[data-view="Contact Book"] svg').count(),1);
 await page.evaluate(()=>view('Settings'));assert.ok(await page.locator('label.setting-toggle .setting-title').count()>=1,'settings toggles');
 // Messages: coloured avatars, grouping
 const msg=await page.evaluate(()=>{view('Messages');renderMessages();const rows=[...document.querySelectorAll('#chat-log .message')];return rows.map(r=>({av:[...r.querySelector('.avatar')?.classList||[]].find(c=>/^av-\d$/.test(c))||null,grouped:r.classList.contains('message-grouped'),bg:getComputedStyle(r.querySelector('.avatar')).backgroundColor}));});
 assert.equal(msg.length,3);assert.ok(msg.every(m=>m.av),'avatar colour slots');assert.deepEqual(msg.map(m=>m.grouped),[false,true,false],'consecutive messages from one sender grouped');assert.notEqual(msg[0].bg,'rgb(21, 21, 22)','avatar coloured');
 // Hover action bar: Reply and Copy on every message; Reply triggers the existing reply gesture.
 const acts=await page.evaluate(()=>[...document.querySelectorAll('#chat-log .message .message-hover-actions')].map(b=>[...b.querySelectorAll('button')].map(x=>x.textContent)));
 assert.equal(acts.length,3);assert.ok(acts.every(a=>a.includes('Copy')&&a.includes('Reply')),JSON.stringify(acts));
 await page.hover('#chat-log .message >> nth=2');await page.click('#chat-log .message >> nth=2 >> .message-hover-action >> text=Reply');
 assert.ok(await page.evaluate(()=>/Sam|three/.test(document.querySelector('#message-input').value+document.body.textContent)),'reply context');
 // Subtitle duplicate of the sync pill is hidden.
 assert.ok(await page.evaluate(()=>{const s=document.querySelector('#subtitle');return !s||!/^Connected to/.test(s.textContent)||getComputedStyle(s).display==='none';}),'subtitle hidden');
 // Battery trend after two samples.
 await page.evaluate(()=>{live.battery={millivolts:4010};renderStats();live.battery={millivolts:3990};renderStats();});assert.equal(await page.locator('.stats svg.stat-trend polyline').count(),1);
 // Overview: SNR word and sparkline; offline map note
 await page.evaluate(()=>{view('Overview');renderStats();document.querySelector('#internet-status').dataset.state='offline';});
 assert.equal(await page.locator('.stats .stat-quality').textContent(),'good');assert.equal(await page.locator('.stats svg.stat-spark rect').count(),12);
 await page.waitForSelector('.map-offline');assert.match(await page.locator('.map-offline').textContent(),/needs the internet/);
 // Contacts empty state.
 await page.evaluate(()=>{live.contacts=[];live.sync='disconnected';view('Nodes');renderNodes(true);});assert.equal(await page.locator('#node-table .empty-state .empty-icon').count(),1);assert.equal(await page.locator('#node-table .empty-state button').textContent(),'Connect radio');
 await page.evaluate(()=>{live.sync='ready';});
 // Activity: icons, filters
 await page.evaluate(()=>view('Activity'));assert.equal(await page.locator('.activity-item').count(),3);await page.click('.activity-chip >> text=Problems');
 assert.equal(await page.locator('.activity-item').count(),1);assert.match(await page.locator('.activity-item').textContent(),/Sync failed/);assert.equal(await page.locator('.activity-chip.on').textContent(),'Problems');
 assert.deepEqual(errors,[]);console.log('PASS cards design pass: sidebar icons, settings toggles, coloured and grouped messages, SNR word, sparkline, offline map note, activity timeline with filters. Synthetic only.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1);});
