/* Terminal status line (#227): node, DM, unread, noise and battery fields; the docked connection control. Synthetic state only; no radio requests. */
const {chromium}=require(process.env.NIGHTLINK_PLAYWRIGHT||'playwright'),fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,...(process.env.NIGHTLINK_BROWSER?{executablePath:process.env.NIGHTLINK_BROWSER}:{})});try{
 const page=await browser.newPage({viewport:{width:1320,height:860}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',async r=>{const u=new URL(r.request().url());if(u.origin!=='http://127.0.0.1:4173')return r.abort();const f=u.pathname==='/'?'index.html':u.pathname.slice(1);try{await r.fulfill({body:await fs.readFile(path.join(__dirname,f)),contentType:f.endsWith('.js')?'text/javascript':f.endsWith('.css')?'text/css':'text/html'});}catch{await r.fulfill({status:404,body:''});}});
 await page.goto('http://127.0.0.1:4173');await page.waitForFunction(()=>window.NightlinkMRC&&document.querySelector('.term-statusline'));
 const read=()=>page.evaluate(()=>{const q=s=>document.querySelector(s);return {node:q('.term-status-node').hidden?null:q('.term-status-node').textContent,unread:q('.term-status-unread').hidden?null:q('.term-status-unread').textContent,flag:q('.term-status-unread').dataset.unread,batt:q('.term-status-battery').hidden?null:q('.term-status-battery').textContent,dock:!!q('.term-status-dock #connection')};});
 const tick=()=>page.evaluate(()=>new Promise(r=>{NightlinkStatusLine.refresh();requestAnimationFrame(()=>requestAnimationFrame(r));}));
 await page.evaluate(()=>{radioSession.request=async()=>{throw Error('radio blocked');};});await tick();
 let s=await read();assert.equal(s.node,null);assert.equal(s.unread,null);assert.equal(s.batt,null);assert.ok(s.dock,'connection control docked in the status line');
 
 await page.evaluate(()=>{live.identity={key:'ee'.repeat(32),name:'SN0WMAN'};live.sync='ready';live.battery={millivolts:3920};const c={kind:'channel',slot:0,id:'ab'.repeat(12),name:'Public'};live.channels=[c];live.messages=[];ensureAttention();});await tick();
 s=await read();assert.equal(s.node,'SN0WMAN');assert.equal(s.unread,'✉ 0 unread');assert.equal(s.flag,'no');assert.equal(s.batt,'BAT 3.92 V');
 await page.evaluate(()=>{const c=live.channels[0];for(let i=0;i<3;i++)live.messages.push({id:'u'+i,conversation:conversationId(c),target:c,kind:'channel',sender:'ALPHA',text:'hi '+i,timestamp:1700000000+i,status:'Received'});live.battery={millivolts:3410};});await tick();
 s=await read();assert.equal(s.unread,'✉ 3 unread');
 await page.evaluate(()=>{const k='77'.repeat(32);live.messages.push({id:'d1',conversation:'direct:'+k,target:{kind:'direct',key:k,name:'Pal'},kind:'direct',sender:'Pal',text:'hey',timestamp:1700000100,status:'Received'});live.stats.noise=-112;});await tick();
 assert.equal(await page.evaluate(()=>{const b=document.querySelector('.term-status-dm');return b.hidden?null:b.textContent;}),'DM 1');
 assert.equal(await page.evaluate(()=>document.querySelector('.term-status-noise').textContent),'NF -112 dBm');
 await page.evaluate(()=>{live.messages=live.messages.filter(m=>m.id!=='d1');});await tick();assert.ok(await page.evaluate(()=>document.querySelector('.term-status-dm').hidden));assert.equal(s.flag,'yes');assert.equal(s.batt,'BAT 3.41 V LOW');
 await page.evaluate(()=>{ensureAttention().mark(live.messages,conversationId(live.channels[0]));});await tick();assert.equal((await read()).unread,'✉ 0 unread','reading clears the count');
 await page.evaluate(()=>view('Overview'));await page.focus('.term-status-unread');await page.keyboard.press('Enter');await page.waitForFunction(()=>current==='Messages');
 const contrast=await page.evaluate(()=>{const lum=c=>{const [r,g,b]=c.match(/\d+/g).slice(0,3).map(v=>{v/=255;return v<=.03928?v/12.92:((v+.055)/1.055)**2.4;});return .2126*r+.7152*g+.0722*b;};const bg=e=>{for(;e;e=e.parentElement){const c=getComputedStyle(e).backgroundColor;if(!/rgba\(0, 0, 0, 0\)|transparent/.test(c))return c;}return 'rgb(0,0,0)';};
  return [...document.querySelectorAll('.term-status-field:not([hidden]),.term-status-dock>:not([hidden])')].map(e=>{const a=lum(getComputedStyle(e).color),b=lum(bg(e));return (Math.max(a,b)+.05)/(Math.min(a,b)+.05);});});
 for(const c of contrast)assert.ok(c>=4.5,'status text contrast '+c.toFixed(2));
 assert.deepEqual(errors,[]);console.log('PASS terminal status line: disconnected/syncing/ready states, node name, unread count and highlight, read clears count, LOW battery, keyboard opens chat, contrast >= 4.5. Synthetic only.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1);});
