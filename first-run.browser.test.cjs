/* First-run setup guide and Report a bug / Request a feature, in both interfaces. Synthetic; no radio, no network. */
const {chromium}=require(process.env.NIGHTLINK_PLAYWRIGHT||'playwright'),fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,...(process.env.NIGHTLINK_BROWSER?{executablePath:process.env.NIGHTLINK_BROWSER}:{})});try{
 for(const mode of ['terminal','cards']){
  const page=await browser.newPage({viewport:{width:1320,height:860}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(m=>{try{localStorage.setItem('nightlink.interface',m);}catch{}window.__opened=[];window.nightlinkLinks={open:async u=>{__opened.push(u);return true;},preview:async()=>null};},mode);
  await page.route('**/*',async r=>{const u=new URL(r.request().url());if(u.origin!=='http://127.0.0.1:4173')return r.abort();const f=u.pathname==='/'?'index.html':u.pathname.slice(1);try{await r.fulfill({body:await fs.readFile(path.join(__dirname,f)),contentType:f.endsWith('.js')?'text/javascript':f.endsWith('.css')?'text/css':'text/html'});}catch{await r.fulfill({status:404,body:''});}});
  await page.goto('http://127.0.0.1:4173');await page.waitForFunction(()=>window.NightlinkFirstRun&&window.NightlinkFeedback);await page.evaluate(()=>{radioSession.request=async()=>{throw Error('radio blocked');};});
  await page.waitForTimeout(900);assert.equal(await page.locator('#first-run[open]').count(),0,'not shown automatically under automation');
  // Guide: open, steps, connect button, live status, help link, finish stores the flag.
  await page.evaluate(()=>NightlinkFirstRun.open(0));assert.equal(await page.textContent('#first-run-title'),'Welcome to Nightlink');
  await page.click('#first-run-next');assert.equal(await page.textContent('#first-run-title'),'Connect your radio');assert.equal(await page.textContent('.first-run-radio'),'Not connected yet');
  await page.click('#first-run-connect');await page.waitForFunction(()=>[...document.querySelectorAll('dialog[open]')].length>=2);await page.keyboard.press('Escape');
  await page.evaluate(()=>{live.identity={key:'ee'.repeat(32),name:'SN0WMAN',frequency:910.525,bandwidth:250,spreadingFactor:11,codingRate:5,txPower:22};live.sync='ready';radioSession.dispatchEvent(new CustomEvent('sync',{detail:{state:'ready'}}));});
  await page.waitForFunction(()=>document.querySelector('.first-run-radio')?.dataset.state==='ok');assert.match(await page.textContent('.first-run-radio'),/synchronized · SN0WMAN/);
  await page.click('.first-run-help-link >> text=Bluetooth help');await page.waitForFunction(()=>[...document.querySelectorAll('.help-topics button')].some(b=>b.getAttribute('aria-current')==='true'&&/Connect with Bluetooth/.test(b.textContent)));
  await page.evaluate(()=>NightlinkFirstRun.open(3));await page.click('#first-run-next');assert.equal(await page.evaluate(()=>localStorage.getItem('nightlink.firstRun')),'done');assert.equal(await page.locator('#first-run[open]').count(),0);
  // Feedback: empty form is rejected, filled form opens a GitHub issue URL with the fields.
  await page.evaluate(()=>NightlinkFeedback.open('bug'));await page.click('#feedback-open');assert.match(await page.textContent('.feedback-status'),/Add a title/);
  await page.fill('#feedback-title','Chat stops scrolling');await page.fill('#feedback-what','After reconnect');await page.click('#feedback-open');
  await page.waitForFunction(()=>__opened.length===1);const url=new URL(await page.evaluate(()=>__opened[0]));
  assert.equal(url.pathname,'/njsnowman/nightlink/issues/new');assert.equal(url.searchParams.get('title'),'Chat stops scrolling');assert.equal(url.searchParams.get('labels'),'bug');assert.match(url.searchParams.get('body'),/After reconnect[\s\S]*\*\*Interface:\*\* /);
  assert.match(await page.textContent('.feedback-status'),/Opened in your browser/);await page.keyboard.press('Escape');
  // Entry points: palette and Help.
  await page.keyboard.press('Control+p');await page.keyboard.type('feature');assert.match(await page.locator('#cmd-palette [role=option]').first().textContent(),/Request a feature/);await page.keyboard.press('Enter');
  assert.equal(await page.textContent('#feedback-dialog h2'),'Request a feature');await page.keyboard.press('Escape');
  assert.deepEqual(errors,[],mode+' errors');await page.close();}
 console.log('PASS first-run guide (not automatic under automation, steps, connect dialog, live sync status, help topic link, finish flag) and feedback (validation, pre-filled GitHub issue URL, palette entry) in terminal and cards. Synthetic only.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1);});
