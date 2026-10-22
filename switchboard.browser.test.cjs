/* Synthetic presentation checks; no radio, external map, or production profile access. */
const {chromium}=require('C:/Users/ryank/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});try{
 const page=await browser.newPage({viewport:{width:1600,height:1000}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',async route=>{const url=new URL(route.request().url());if(url.hostname!=='127.0.0.1')return route.abort();const file=url.pathname==='/'?'index.html':url.pathname.slice(1);try{await route.fulfill({body:await fs.readFile(path.join(__dirname,file)),contentType:file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':file.endsWith('.svg')?'image/svg+xml':'text/html'});}catch{await route.fulfill({status:404,body:''});}});
 await page.goto('http://127.0.0.1:4173',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>document.querySelector('.switchboard-trend'));
 assert.equal(await page.evaluate(()=>NightlinkAccent.current()),'amber');
 await page.evaluate(()=>{live.identity={key:'ab'.repeat(32),name:'Synthetic radio',frequency:910.525,txPower:22};live.channels=[{slot:0,id:'12'.repeat(12),name:'Public'},{slot:1,id:'34'.repeat(12),name:'#echo'}];live.selected={kind:'channel',...live.channels[0]};live.messages=Array.from({length:24},(_,i)=>({id:'switchboard-'+i,text:['Batesville relay is online.','Good morning. Signal received.','Checking the local mesh.'][i%3],sender:['Shepherd','Snowman','KB9QDI'][i%3],timestamp:Math.floor(Date.now()/1000)-720+i*30,pathLength:3,own:false,status:'Received',target:live.selected,conversation:conversationId(live.selected)}));evidenceStore.rows=[];renderMessages();renderStats();view('Overview');});
 assert.match(await page.locator('.switchboard-trend small').innerText(),/No signal observations/);
 assert.equal(await page.locator('.switchboard-trend svg').isVisible(),false);
 assert.equal(await page.locator('.switchboard-channel-tabs button').count(),2);
 await page.locator('.switchboard-channel-tabs button').nth(1).click();
 assert.equal(await page.evaluate(()=>live.selected.slot),1);
 assert.equal(await page.locator('.switchboard-channel-tabs button').nth(1).getAttribute('aria-pressed'),'true');
 await page.locator('.switchboard-channel-tabs button').first().click();
 await page.evaluate(()=>{view('Overview');const now=Date.now();evidenceStore.rows=[{type:'packet',at:now-10000,data:{valid:true,snr:13}},{type:'packet',at:now-1800000,data:{valid:true,snr:8}}];renderMessages();});
 assert.equal(await page.locator('.switchboard-trend .trend-dot').count(),2);
 assert.equal(await page.locator('.switchboard-trend polyline').count(),0);
 assert.match(await page.locator('.switchboard-trend small').innerText(),/2 passive samples.*gaps/);
 await page.screenshot({path:'C:/Users/ryank/.cache/nightlink-switchboard-overview.png'});
 await page.evaluate(()=>view('Messages'));
 await page.screenshot({path:'C:/Users/ryank/.cache/nightlink-switchboard-messages.png'});
 for(const size of [{width:1600,height:1000},{width:1320,height:860},{width:920,height:700},{width:760,height:560}]){await page.setViewportSize(size);for(const compact of [false,true]){await page.evaluate(c=>{setCompact(c,false);view('Overview');},compact);await page.waitForTimeout(80);const fit=await page.evaluate(()=>({w:document.documentElement.scrollWidth,h:document.documentElement.scrollHeight,composer:document.querySelector('#chat-form').getBoundingClientRect().bottom}));assert.ok(fit.w<=size.width&&fit.h<=size.height,JSON.stringify({size,compact,fit}));assert.ok(fit.composer<=size.height,JSON.stringify({size,compact,fit}));}}
 await page.evaluate(()=>NightlinkAccent.set('ice-blue'));await page.reload({waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.NightlinkAccent);assert.equal(await page.evaluate(()=>NightlinkAccent.current()),'ice-blue');
 await page.addInitScript(()=>{window.dmWindow={onUpdate:fn=>window.__dmUpdate=fn,contact(){},reply(){},action(){},read(){},draft(){},onFocus(){}};});
 await page.setViewportSize({width:600,height:800});await page.goto('http://127.0.0.1:4173/dm.html',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.__dmUpdate);
 await page.evaluate(()=>window.__dmUpdate({key:'cd'.repeat(32),name:'Shepherd',connected:false,accent:'amber',scheme:'black',textScale:1,soundEnabled:false,messages:[{id:'dm-sample',text:'Batesville relay is online.',timestamp:Math.floor(Date.now()/1000),status:'Received',hopLabel:'3 HOPS',own:false}]}));
 assert.equal(await page.locator('.dm-bubble .signal-hop').innerText(),'3 HOPS');await page.screenshot({path:'C:/Users/ryank/.cache/nightlink-switchboard-dm.png'});
 assert.deepEqual(errors,[]);console.log('PASS: Switchboard amber default, saved accent, channel selection, passive chart unknown/gaps, viewport fit, Overview/Messages/DM screenshots. Synthetic presentation only.');
}finally{await browser.close();}})().catch(error=>{console.error(error);process.exitCode=1;});


