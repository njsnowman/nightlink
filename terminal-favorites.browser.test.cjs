/* Favourite contacts are marked with a star in chat, in both interfaces. Synthetic only. */
const {chromium}=require(process.env.NIGHTLINK_PLAYWRIGHT||'playwright'),fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,...(process.env.NIGHTLINK_BROWSER?{executablePath:process.env.NIGHTLINK_BROWSER}:{})});try{
 for(const mode of ['terminal','cards']){const page=await browser.newPage({viewport:{width:1320,height:860}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(m=>{try{localStorage.setItem('nightlink.interface',m);}catch{}},mode);
  await page.route('**/*',async r=>{const u=new URL(r.request().url());if(u.origin!=='http://127.0.0.1:4173')return r.abort();const f=u.pathname==='/'?'index.html':u.pathname.slice(1);try{await r.fulfill({body:await fs.readFile(path.join(__dirname,f)),contentType:f.endsWith('.js')?'text/javascript':f.endsWith('.css')?'text/css':'text/html'});}catch{await r.fulfill({status:404,body:''});}});
  await page.goto('http://127.0.0.1:4173');await page.waitForFunction(()=>window.NightlinkMRC);
  const stars=await page.evaluate(()=>{radioSession.request=async()=>{throw Error('radio blocked');};const now=Math.floor(Date.now()/1000);live.identity={key:'ee'.repeat(32),name:'BASE',frequency:910.525,bandwidth:250,spreadingFactor:11,codingRate:5,txPower:22};live.sync='ready';
   const c={kind:'channel',slot:0,id:'ab'.repeat(12),name:'Public'};live.channels=[{slot:0,id:c.id,name:'Public'}];live.selected={...c};
   live.contacts=[{key:'11'.repeat(32),name:'Alex',type:1,lastAdvert:now},{key:'22'.repeat(32),name:'Sam',type:1,lastAdvert:now}];favoriteKeys=new Set(['11'.repeat(32)]);
   live.messages=[['Alex','hi from a favourite'],['Sam','hi from someone else']].map(([s,t],i)=>({id:'f'+i,kind:'channel',target:c,conversation:conversationId(c),sender:s,text:t,timestamp:now-60+i,status:'Received'}));
   view('Messages');renderMessages();const rows=[...document.querySelectorAll('#mrc-log [data-message-id], #chat-log .message')];
   return rows.map(r=>[r.textContent.includes('favourite')?'alex':'sam',!!r.querySelector('.mrc-fav,.message-fav')]);});
  assert.deepEqual(Object.fromEntries(stars),{alex:true,sam:false},mode+' '+JSON.stringify(stars));assert.deepEqual(errors,[],mode);await page.close();}
 console.log('PASS favourite senders marked with a star in Terminal and Cards chat; others unmarked. Synthetic only.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1);});
