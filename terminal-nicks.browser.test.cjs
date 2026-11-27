/* Settings > Nick colours (terminal): single cyan by default, per-sender VGA colours when chosen. Synthetic only. */
const {chromium}=require(process.env.NIGHTLINK_PLAYWRIGHT||'playwright'),fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,...(process.env.NIGHTLINK_BROWSER?{executablePath:process.env.NIGHTLINK_BROWSER}:{})});try{
 const page=await browser.newPage({viewport:{width:1320,height:860}}),errors=[];page.on('pageerror',e=>errors.push(e.message+' @ '+(e.stack||'').split('\n').slice(1,3).join(' | ')));
 await page.route('**/*',async r=>{const u=new URL(r.request().url());if(u.origin!=='http://127.0.0.1:4173')return r.abort();const f=u.pathname==='/'?'index.html':u.pathname.slice(1);try{await r.fulfill({body:await fs.readFile(path.join(__dirname,f)),contentType:f.endsWith('.js')?'text/javascript':f.endsWith('.css')?'text/css':'text/html'});}catch{await r.fulfill({status:404,body:''});}});
 await page.goto('http://127.0.0.1:4173');await page.waitForFunction(()=>window.NightlinkMRC);
 await page.evaluate(()=>{radioSession.request=async()=>{throw Error('radio blocked');};live.identity={key:'ee'.repeat(32),name:'SN0WMAN',frequency:910.525,bandwidth:250,spreadingFactor:11,codingRate:5,txPower:22};live.sync='ready';const c={kind:'channel',slot:0,id:'ab'.repeat(12),name:'Public'};live.channels=[c];live.selected={...c};
  live.messages=['ALPHA','BRAVO','CHARLIE','DELTA','ECHO','FOXTROT','GOLF','HOTEL','INDIA','JULIET'].map((n,i)=>({id:'n'+i,conversation:conversationId(c),target:c,kind:'channel',sender:n,text:'hello from '+n,timestamp:1700000000+i,status:'Received'}));view('Messages');});
 const colours=()=>page.evaluate(()=>[...new Set([...document.querySelectorAll('#mrc .mrc-nick-peer')].map(e=>getComputedStyle(e).color))]);
 assert.deepEqual(await colours(),['rgb(85, 255, 255)'],'default is single cyan');
 await page.evaluate(()=>view('Settings'));await page.selectOption('#term-nicks','sender');
 assert.equal(await page.evaluate(()=>[localStorage.getItem('nightlink.term-nicks'),document.documentElement.dataset.termNicks].join()),'sender,sender');
 await page.evaluate(()=>view('Messages'));const many=await colours();assert.ok(many.length>=4,'several sender colours: '+many.join(' '));
 const lum=c=>{const [r,g,b]=c.match(/\d+/g).map(v=>{v/=255;return v<=.03928?v/12.92:((v+.055)/1.055)**2.4;});return .2126*r+.7152*g+.0722*b;};
 for(const c of many)assert.ok((lum(c)+.05)/.05>=4.5,'contrast on black '+c);
 await page.reload();await page.waitForFunction(()=>window.NightlinkMRC);assert.equal(await page.evaluate(()=>document.documentElement.dataset.termNicks),'sender','persists');
 assert.deepEqual(errors,[]);console.log('PASS nick colours: single cyan default, By sender setting, >=4 colours, contrast >=4.5 on black, persistence. Synthetic only.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1);});
