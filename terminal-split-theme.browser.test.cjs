/* rc.61: F6 split view, custom colours with contrast guard, page title art. Terminal interface; synthetic only. */
const {chromium}=require(process.env.NIGHTLINK_PLAYWRIGHT||'playwright'),fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,...(process.env.NIGHTLINK_BROWSER?{executablePath:process.env.NIGHTLINK_BROWSER}:{})});try{
 const page=await browser.newPage({viewport:{width:1320,height:860}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',async r=>{const u=new URL(r.request().url());if(u.origin!=='http://127.0.0.1:4173')return r.abort();const f=u.pathname==='/'?'index.html':u.pathname.slice(1);try{await r.fulfill({body:await fs.readFile(path.join(__dirname,f)),contentType:f.endsWith('.js')?'text/javascript':f.endsWith('.css')?'text/css':'text/html'});}catch{await r.fulfill({status:404,body:''});}});
 await page.goto('http://127.0.0.1:4173');await page.waitForFunction(()=>window.NightlinkMRC&&window.NightlinkTerminalTheme);
 await page.evaluate(()=>{radioSession.request=async()=>{throw Error('radio blocked');};live.identity={key:'ee'.repeat(32),name:'SN0WMAN',frequency:910.525,bandwidth:250,spreadingFactor:11,codingRate:5,txPower:22};live.sync='ready';
  const a={kind:'channel',slot:0,id:'ab'.repeat(12),name:'Public'},b={kind:'channel',slot:1,id:'cd'.repeat(12),name:'field-ops'};live.channels=[a,b];live.selected={...a};
  live.messages=[{id:'a1',conversation:conversationId(a),target:a,kind:'channel',sender:'ALPHA',text:'public hello',timestamp:1700000000,status:'Received'},{id:'b1',conversation:conversationId(b),target:b,kind:'channel',sender:'BRAVO',text:'ops update',timestamp:1700000001,status:'Received'}];view('Messages');});
 // Split view
 assert.equal(await page.locator('.mrc-split').count(),0);await page.keyboard.press('F6');
 assert.equal(await page.locator('.mrc-split .mrc-split-title span').first().textContent(),'#field-ops');assert.match(await page.locator('.mrc-split-log').textContent(),/<BRAVO> ops update/);
 assert.equal(await page.locator('.mrc-split [data-message-id]').count(),0,'split lines carry no message ids');assert.equal(await page.locator('#mrc-log [data-message-id="a1"]').count(),1);
 await page.evaluate(()=>{const b=live.channels[1];live.messages.push({id:'b2',conversation:conversationId(b),target:b,kind:'channel',sender:'BRAVO',text:'second ops line',timestamp:1700000002,status:'Received'});renderMessages();});
 assert.match(await page.locator('.mrc-split-log').textContent(),/second ops line/,'split pane updates');
 await page.click('.mrc-split-close');assert.equal(await page.locator('.mrc-split').count(),0);
 await page.keyboard.press('F6');await page.keyboard.press('F6');assert.equal(await page.locator('.mrc-split').count(),0,'F6 cycles back to off');
 // Page art
 await page.evaluate(()=>view('Nodes'));assert.equal(await page.locator('#term-page-title .term-window-art').getAttribute('aria-hidden'),'true');
 // Custom colours
 await page.evaluate(()=>view('Settings'));await page.waitForSelector('#term-custom-setting');
 const setColour=(token,v)=>page.evaluate(([t,v])=>{const i=document.querySelector('#term-custom-setting input[data-token="'+t+'"]');i.value=v;i.dispatchEvent(new Event('input'));return i.closest('label').querySelector('.term-custom-ratio').textContent;},[token,v]);
 assert.match(await setColour('--t-yellow','#ffaa00'),/:1$/);assert.equal(await page.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue('--t-yellow').trim()),'#ffaa00');
 assert.match(await setColour('--t-white','#222222'),/too low, not applied/);assert.notEqual(await page.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue('--t-white').trim()),'#222222');
 await page.reload();await page.waitForFunction(()=>window.NightlinkTerminalTheme);assert.equal(await page.evaluate(()=>document.documentElement.style.getPropertyValue('--t-yellow')),'#ffaa00','persists');
 await page.evaluate(()=>view('Settings'));await page.click('#term-custom-reset');assert.equal(await page.evaluate(()=>document.documentElement.style.getPropertyValue('--t-yellow')),'','reset');
 assert.deepEqual(errors,[]);console.log('PASS F6 split view (open, live update, no duplicate ids, close, cycle), page title art hidden from AT, custom colours apply/reject low contrast/persist/reset. Synthetic only.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1);});
