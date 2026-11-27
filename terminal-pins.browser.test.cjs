/* Pinned messages in terminal chat: /pin, /pins, /unpin, bar jump, persistence. Synthetic; no radio requests. */
const {chromium}=require(process.env.NIGHTLINK_PLAYWRIGHT||'playwright'),fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,...(process.env.NIGHTLINK_BROWSER?{executablePath:process.env.NIGHTLINK_BROWSER}:{})});try{
 const page=await browser.newPage({viewport:{width:1320,height:860}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',async r=>{const u=new URL(r.request().url());if(u.origin!=='http://127.0.0.1:4173')return r.abort();const f=u.pathname==='/'?'index.html':u.pathname.slice(1);try{await r.fulfill({body:await fs.readFile(path.join(__dirname,f)),contentType:f.endsWith('.js')?'text/javascript':f.endsWith('.css')?'text/css':'text/html'});}catch{await r.fulfill({status:404,body:''});}});
 await page.goto('http://127.0.0.1:4173');await page.waitForFunction(()=>window.NightlinkMRC&&window.NightlinkPins);
 const setup=()=>page.evaluate(()=>{radioSession.request=async()=>{throw Error('radio blocked');};live.identity={key:'ee'.repeat(32),name:'SN0WMAN',frequency:910.525,bandwidth:250,spreadingFactor:11,codingRate:5,txPower:22};live.sync='ready';
  const a={kind:'channel',slot:0,id:'ab'.repeat(12),name:'Public'};live.channels=[a];live.selected={...a};
  live.messages=Array.from({length:80},(_,i)=>({id:'p'+i,conversation:conversationId(a),target:a,kind:'channel',sender:'NET'+(i%3),text:i===3?'Net tonight 20:00 on 910.525':'chatter '+i,timestamp:1700000000+i,status:'Received'}));view('Messages');});
 await setup();const cmd=v=>page.evaluate(v=>NightlinkMRC.submit(v),v);
 await cmd('/pins');assert.match(await page.locator('#mrc-log').textContent(),/No pinned messages/);
 await cmd('/pin');assert.equal(await page.locator('.mrc-pin').count(),1);assert.match(await page.locator('.mrc-pin').textContent(),/\[PIN\] <NET1> chatter 79/,'pins latest when nothing selected');
 await page.evaluate(()=>NightlinkMRC.jumpTo('p3'));await cmd('/pin');
 assert.equal(await page.locator('.mrc-pin').count(),2);assert.match(await page.locator('.mrc-pin').first().textContent(),/Net tonight/,'selected message pinned first');
 await page.evaluate(()=>{document.querySelector('#mrc-log').scrollTop=document.querySelector('#mrc-log').scrollHeight;});await page.locator('.mrc-pin').first().click();
 await page.waitForFunction(()=>{const r=document.querySelector('#mrc-log [data-message-id="p3"]')?.getBoundingClientRect(),l=document.querySelector('#mrc-log').getBoundingClientRect();return r&&r.top>=l.top&&r.bottom<=l.bottom;});
 assert.equal(await page.locator('#mrc-log .mrc-pins [data-message-id]').count(),0,'pins bar holds no message ids');
 await page.reload();await page.waitForFunction(()=>window.NightlinkMRC);await setup();assert.equal(await page.locator('.mrc-pin').count(),2,'persist');
 await cmd('/unpin 1');assert.equal(await page.locator('.mrc-pin').count(),1);await cmd('/unpin 9');assert.match(await page.locator('#mrc-log').textContent(),/Usage: \/unpin/);
 await cmd('/unpin');assert.equal(await page.locator('.mrc-pins').count(),0);
 assert.deepEqual(errors,[]);console.log('PASS pinned messages: /pins empty state, /pin latest and selected, bar jump scrolls into view, no message ids in bar, persistence, /unpin n, usage error, /unpin all. Synthetic only.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1);});
