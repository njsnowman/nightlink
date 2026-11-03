/* BBS intro uses synthetic radio events and a fake AudioContext; no radio or audible test tones. */
const {chromium}=require(process.env.NIGHTLINK_PLAYWRIGHT||'playwright'),fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,...(process.env.NIGHTLINK_BROWSER?{executablePath:process.env.NIGHTLINK_BROWSER}:{})});try{
 async function fixture({sound=false,quiet=false,reduced=false,cards=false,width=1320,height=860}={}){
  const context=await browser.newContext({viewport:{width,height},reducedMotion:reduced?'reduce':'no-preference'});
  await context.addInitScript(({sound,quiet,cards})=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});if(sound)localStorage.setItem('nightlink.bootSound','on');if(quiet)localStorage.setItem('nightlink.desktop',JSON.stringify({quietEnabled:true,start:'00:00',end:'00:00'}));if(cards)localStorage.setItem('nightlink.interface','cards');
   window.__audio={made:0,closed:0};window.AudioContext=class{constructor(){window.__audio.made++;this.currentTime=0;}createGain(){return {gain:{value:0},connect(){}};}createOscillator(){return {frequency:{value:0},connect(){},start(){},stop(){}};}resume(){return Promise.resolve();}close(){window.__audio.closed++;return Promise.resolve();}};
  },{sound,quiet,cards});
  await context.route('**/*',async route=>{const u=new URL(route.request().url());if(u.origin!=='http://127.0.0.1:4173')return route.abort();const f=u.pathname==='/'?'index.html':u.pathname.slice(1);try{await route.fulfill({body:await fs.readFile(path.join(__dirname,f)),contentType:f.endsWith('.js')?'text/javascript':f.endsWith('.css')?'text/css':'text/html'});}catch{await route.fulfill({status:404,body:''});}});
  const page=await context.newPage();await page.goto('http://127.0.0.1:4173');await page.waitForFunction(()=>window.NightlinkBBS);return {context,page};
 }
 {const {context,page}=await fixture();await page.waitForSelector('#term-boot-screen');assert.match(await page.textContent('.boot-note'),/Simulated/);assert.equal(await page.evaluate(()=>window.__audio.made),0);
  await page.waitForFunction(()=>document.querySelector('.boot-log')?.textContent.includes('ATDT NIGHTLINK'));await page.waitForFunction(()=>document.querySelector('.boot-log')?.textContent.includes('DIALING'));
  await page.evaluate(()=>{radioSession.request=async()=>{throw Error('radio blocked');};live.identity={key:'fa'.repeat(32),name:'Test companion'};radioSession.dispatchEvent(new CustomEvent('sync',{detail:{state:'syncing'}}));});assert.match(await page.textContent('.boot-radio'),/synchronizing/);
  await page.evaluate(()=>radioSession.dispatchEvent(new CustomEvent('sync',{detail:{state:'ready'}})));assert.match(await page.textContent('.boot-radio'),/synchronized/);
  await page.evaluate(()=>view('Messages'));await page.waitForSelector('.boot-logo svg');if(process.env.NIGHTLINK_SCREENSHOTS)await page.screenshot({path:path.join(process.env.NIGHTLINK_SCREENSHOTS,'bbs-dialup-startup.png')});
  await page.waitForSelector('#term-boot-screen',{state:'detached'});assert.equal(await page.evaluate(()=>current),'Messages','intro completion does not navigate');assert.equal(await page.evaluate(()=>window.__audio.made),0);
  await page.reload();await page.waitForFunction(()=>window.NightlinkBBS);assert.equal(await page.locator('#term-boot-screen').count(),0);await context.close();}
 {const {context,page}=await fixture({sound:true,width:760,height:560});await page.waitForSelector('#term-boot-screen');assert.equal(await page.evaluate(()=>window.__audio.made),1);
  const fit=await page.$eval('.boot-frame',e=>{const r=e.getBoundingClientRect();return {top:r.top,bottom:r.bottom,left:r.left,right:r.right};});assert.ok(fit.top>=0&&fit.bottom<=560&&fit.left>=0&&fit.right<=760,JSON.stringify(fit));
  await page.keyboard.press('c');await page.waitForSelector('#term-boot-screen',{state:'detached'});assert.equal(await page.evaluate(()=>current),'Overview','skip key is consumed');assert.equal(await page.evaluate(()=>window.__audio.closed),1);await context.close();}
 {const {context,page}=await fixture({sound:true,quiet:true});await page.waitForSelector('#term-boot-screen');assert.equal(await page.evaluate(()=>window.__audio.made),0,'quiet hours suppress intro audio');await page.click('.boot-skip');await page.waitForSelector('#term-boot-screen',{state:'detached'});await context.close();}
 for(const options of [{reduced:true},{cards:true}]){const {context,page}=await fixture(options);assert.equal(await page.locator('#term-boot-screen').count(),0);await context.close();}
 console.log('BBS intro, real-state display, skip, sound and compact checks passed');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1);});
