/* Terminal 0.8.30 style pass: density, signal symbols, motion, custom banner, caller ID, full-name tooltips, row highlight. Synthetic only. */
const {chromium}=require(process.env.NIGHTLINK_PLAYWRIGHT||'playwright'),fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,...(process.env.NIGHTLINK_BROWSER?{executablePath:process.env.NIGHTLINK_BROWSER}:{})});try{
 const page=await browser.newPage({viewport:{width:1400,height:880}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',async r=>{const u=new URL(r.request().url());if(u.origin!=='http://127.0.0.1:4173')return r.abort();const f=u.pathname==='/'?'index.html':u.pathname.slice(1);try{await r.fulfill({body:await fs.readFile(path.join(__dirname,f)),contentType:f.endsWith('.js')?'text/javascript':f.endsWith('.css')?'text/css':'text/html'});}catch{await r.fulfill({status:404,body:''});}});
 await page.goto('http://127.0.0.1:4173');await page.waitForFunction(()=>window.NightlinkTerminalExtras);
 await page.evaluate(()=>{radioSession.request=async()=>{throw Error('radio blocked');};const now=Math.floor(Date.now()/1000);live.identity={key:'ee'.repeat(32),name:'BASE',frequency:910.525,bandwidth:250,spreadingFactor:11,codingRate:5,txPower:22};live.sync='ready';
  const c={kind:'channel',slot:0,id:'ab'.repeat(12),name:'Public'};live.channels=[{slot:0,id:c.id,name:'Public'}];live.selected={...c};
  live.contacts=[{key:'11'.repeat(32),name:'Ridge Repeater With A Very Long Name North',type:2,lastAdvert:now-30,snr:7}];window.NightlinkHeardAdverts=new Map([['11'.repeat(32),{snr:7.5,at:now-30}]]);
  live.messages=[{id:'s1',kind:'channel',target:c,conversation:conversationId(c),sender:'Alex',text:'hello',timestamp:now-60,pathLength:2,snr:9,status:'Received'}];view('Overview');});
 // Caller ID row
 const heard=await page.evaluate(()=>{const dt=[...document.querySelectorAll('.bbs-node dt')].find(d=>d.textContent==='heard');return dt?.nextElementSibling?.textContent||'';});assert.match(heard,/Ridge Repeater.*SNR 7\.5/);
 // Settings: density, symbols, motion, banner
 await page.evaluate(()=>view('Settings'));for(const id of ['term-density','term-symbols','term-motion','term-banner'])assert.equal(await page.locator('#'+id).count(),1,id);
 await page.selectOption('#term-density','compact');await page.selectOption('#term-symbols','on');await page.selectOption('#term-motion','on');
 assert.deepEqual(await page.evaluate(()=>[document.documentElement.dataset.termDensity,document.documentElement.dataset.termSymbols,document.documentElement.dataset.termMotion]),['compact','on','on']);
 await page.fill('#term-banner','KD9XYZ ░▒▓');await page.evaluate(()=>view('Nodes'));assert.equal(await page.textContent('#term-page-title .term-window-art'),'KD9XYZ ░▒▓');
 await page.evaluate(()=>{view('Settings');});await page.fill('#term-banner','');await page.evaluate(()=>view('Nodes'));assert.notEqual(await page.textContent('#term-page-title .term-window-art'),'KD9XYZ ░▒▓','empty banner restores page art');
 // Symbols in chat
 await page.evaluate(()=>{view('Messages');renderMessages();});const sym=await page.evaluate(()=>{const e=document.querySelector('#mrc-log .mrc-snr-good');return e?getComputedStyle(e,'::before').content:'none';});assert.equal(sym,'"▲ "');
 // Motion: blink class toggles on the Overview prompt.
 await page.evaluate(()=>{view('Overview');NightlinkTerminalExtras.motion();document.activeElement?.blur();});await page.waitForFunction(()=>document.querySelector('#bbs-command')?.classList.contains('term-blink-off'),null,{timeout:3000});
 // Tooltips and row highlight
 await page.waitForFunction(()=>[...document.querySelectorAll('.bbs-caller .term-name')].some(e=>/Very Long Name/.test(e.title)),null,{timeout:3000});
 await page.evaluate(()=>{view('Nodes');renderNodes(true);});await page.hover('#node-table tr >> nth=0');assert.equal(await page.evaluate(()=>getComputedStyle(document.querySelector('#node-table tr td')).backgroundColor),'rgb(0, 0, 170)');
 assert.deepEqual(errors,[]);console.log('PASS terminal style pass: caller ID, density/symbols/motion/banner settings, symbol glyphs, blinking prompt, full-name tooltips, Nodes row highlight. Synthetic only.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1);});
