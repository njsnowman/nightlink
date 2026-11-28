/* Quick replies: phrases above the message box in Cards chat, Terminal chat and the detached DM window; clicking puts the
   phrase in the box without sending; Settings edits and hides the list. Synthetic only; radio commands blocked. */
const {chromium}=require(process.env.NIGHTLINK_PLAYWRIGHT||'playwright'),fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict');
const serve=async r=>{const u=new URL(r.request().url());if(u.origin!=='http://127.0.0.1:4173')return r.abort();const f=u.pathname==='/'?'index.html':u.pathname.slice(1);try{await r.fulfill({body:await fs.readFile(path.join(__dirname,f)),contentType:f.endsWith('.js')?'text/javascript':f.endsWith('.css')?'text/css':'text/html'});}catch{await r.fulfill({status:404,body:''});}};
(async()=>{const browser=await chromium.launch({headless:true,...(process.env.NIGHTLINK_BROWSER?{executablePath:process.env.NIGHTLINK_BROWSER}:{})});try{
 for(const [iface,input] of [['cards','#message-input'],['terminal','#mrc-input']]){const page=await browser.newPage({viewport:{width:1320,height:860}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(i=>{try{if(!sessionStorage.getItem('seeded')){localStorage.setItem('nightlink.interface',i);sessionStorage.setItem('seeded','1');}}catch{}},iface);await page.route('**/*',serve);await page.goto('http://127.0.0.1:4173');await page.waitForFunction(()=>window.NightlinkQuickReplies);
  await page.evaluate(()=>{radioSession.request=ble.command=()=>{throw Error('Radio blocked in fixture');};live.identity={key:'cd'.repeat(32),name:'DEMO HQ',frequency:910.525,txPower:22};live.sync='ready';const t={kind:'channel',slot:0,id:'01'.repeat(12),name:'Public'};live.channels=[t];live.messages=[];selectConversation(t);});
  if(iface==='terminal')await page.evaluate(()=>view('Messages'));
  const bar=page.locator('.quick-replies').filter({has:page.locator('.quick-reply')}).first();await bar.waitFor();
  assert.deepEqual(await bar.locator('.quick-reply').allTextContents(),['Copy','On my way','Standing by','All clear','Need assistance','Arrived','Back shortly']);
  const before=await page.evaluate(()=>live.messages.length);await bar.getByRole('button',{name:'Copy',exact:true}).click();assert.equal(await page.locator(input).inputValue(),'Copy');
  await page.locator(input).fill('Unit 4');await bar.getByRole('button',{name:'On my way',exact:true}).click();assert.equal(await page.locator(input).inputValue(),'Unit 4 On my way');
  assert.equal(await page.evaluate(()=>live.messages.length),before,'nothing sent');assert.equal(await page.evaluate(()=>document.activeElement?.id),input.slice(1),'focus returns to the box');
  await page.evaluate(()=>view('Settings'));await page.locator('#quick-replies-text').waitFor();await page.locator('#quick-replies-text').fill('Bus 12 arrived\nDismissal delayed\nBus 12 arrived');await page.locator('#quick-replies-text').dispatchEvent('change');
  assert.equal(await page.locator('#quick-replies-text').inputValue(),'Bus 12 arrived\nDismissal delayed');await page.evaluate(()=>view('Messages'));await page.waitForTimeout(100);
  assert.deepEqual(await page.locator('.quick-replies').first().locator('.quick-reply').allTextContents(),['Bus 12 arrived','Dismissal delayed']);
  await page.evaluate(()=>view('Settings'));await page.locator('#quick-replies-show').uncheck();await page.evaluate(()=>view('Messages'));await page.waitForTimeout(100);assert.equal(await page.locator('.quick-replies').count(),0,'hidden when switched off');
  assert.deepEqual(errors,[]);await page.close();}
 const page=await browser.newPage({viewport:{width:700,height:700}});await page.route('**/*',serve);await page.goto('http://127.0.0.1:4173/dm.html');await page.waitForFunction(()=>window.NightlinkQuickReplies);await page.waitForTimeout(150);
 assert.equal(await page.locator('#dm-reply').evaluate(f=>f.previousElementSibling?.classList.contains('quick-replies')),true,'DM window has quick replies');await page.close();
 console.log('PASS Quick replies: Cards and Terminal chat and DM window, insert without sending, append to typed text, focus kept, Settings edit with duplicates removed, hide. Synthetic only.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
