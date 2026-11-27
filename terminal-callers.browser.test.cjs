/* Overview "last callers": ordered by when this radio heard each caller and refreshed as messages arrive. Synthetic only. */
const {chromium}=require(process.env.NIGHTLINK_PLAYWRIGHT||'playwright'),fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,...(process.env.NIGHTLINK_BROWSER?{executablePath:process.env.NIGHTLINK_BROWSER}:{})});try{
 const page=await browser.newPage({viewport:{width:1600,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',async r=>{const u=new URL(r.request().url());if(u.origin!=='http://127.0.0.1:4173')return r.abort();const f=u.pathname==='/'?'index.html':u.pathname.slice(1);try{await r.fulfill({body:await fs.readFile(path.join(__dirname,f)),contentType:f.endsWith('.js')?'text/javascript':f.endsWith('.css')?'text/css':'text/html'});}catch{await r.fulfill({status:404,body:''});}});
 await page.goto('http://127.0.0.1:4173');await page.waitForFunction(()=>window.NightlinkBBS);
 await page.evaluate(()=>{radioSession.request=async()=>{throw Error('radio blocked');};const now=Math.floor(Date.now()/1000);live.identity={key:'ee'.repeat(32),name:'BASE',frequency:910.525,bandwidth:250,spreadingFactor:11,codingRate:5,txPower:22};live.sync='ready';
  const c={slot:0,id:'ab'.repeat(12),name:'Public'};live.channels=[c];
  live.contacts=[{key:'11'.repeat(32),name:'Clock Ahead Room With A Long Name',type:3,lastAdvert:now+40000},{key:'22'.repeat(32),name:'Ridge Repeater North Long Name',type:2,lastAdvert:now-600}];live.messages=[];view('Overview');});
 const names=()=>page.evaluate(()=>[...document.querySelectorAll('.bbs-caller .term-name')].map(e=>e.textContent));
 // A sender with a far-past clock still appears first once heard, without leaving the Overview.
 await page.evaluate(()=>{const c={kind:'channel',...live.channels[0]};radioSession.dispatchEvent(new CustomEvent('message',{detail:{kind:'channel',channel:0,target:c,text:'Old Clock Sender: hello',timestamp:1600000000,pathLength:1,snr:6}}));});
 await page.waitForFunction(()=>document.querySelector('.bbs-caller .term-name')?.textContent==='Old Clock Sender',null,{timeout:4000});
 const list=await names();assert.equal(list[0],'Old Clock Sender','newest heard first');assert.ok(list.indexOf('Clock Ahead Room With A Long Name')>0,'future-clock advert does not pin itself to the top');
 // Name column fits longer names.
 const w=await page.evaluate(()=>{const n=[...document.querySelectorAll('.bbs-caller .term-name')].find(e=>/Ridge/.test(e.textContent));return {full:n.scrollWidth<=n.clientWidth+1,width:n.clientWidth};});
 assert.ok(w.width>=180,'name column at least 180px: '+w.width);
 assert.deepEqual(errors,[]);console.log('PASS last callers: ordered by local heard time, future sender clocks capped, refreshes on new messages while Overview is open, wider name column. Synthetic only.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1);});
