/* Synthetic presentation checks; no radio, external map, or production profile access. */
const {chromium}=require('C:/Users/ryank/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});try{
 const page=await browser.newPage({viewport:{width:1600,height:1000}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',async route=>{const url=new URL(route.request().url());if(url.hostname!=='127.0.0.1')return route.abort();const file=url.pathname==='/'?'index.html':url.pathname.slice(1);try{await route.fulfill({body:await fs.readFile(path.join(__dirname,file)),contentType:file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':file.endsWith('.svg')?'image/svg+xml':'text/html'});}catch{await route.fulfill({status:404,body:''});}});
 await page.goto('http://127.0.0.1:4173',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>document.querySelector('.switchboard-trend'));


 await page.evaluate(()=>{live.channels=[{slot:0,name:'Public'},{slot:1,name:'#echo'}];live.contacts=[];live.selected={kind:'direct',key:'b'.repeat(64),name:'Fixture'};view('Messages');});
 await page.locator('aside nav > button[data-view="Messages"]').click();
 assert.equal(await page.evaluate(()=>live.selected.kind),'channel');
 assert.equal(await page.locator('.conversation-tools .workspace-message-tabs > button').nth(0).innerText(),'Channels');
 assert.equal(await page.locator('.conversation-tools .workspace-message-tabs > button').nth(1).innerText(),'Direct messages');
 await page.locator('.conversation-tools .message-more summary').click();
 await page.locator('.conversation-tools .message-more').getByRole('button',{name:'Search messages',exact:true}).click();
 assert.equal(await page.evaluate(()=>current),'Search');
 await page.locator('aside nav > button[data-view="Messages"]').click();
 await page.locator('.conversation-tools .workspace-message-tabs > button').nth(1).click();
 assert.equal(await page.evaluate(()=>current),'Direct Messages');
 await page.locator('.dm-inbox .workspace-message-tabs > button').nth(0).click();
 assert.equal(await page.evaluate(()=>current),'Messages');
 for(const [width,height] of [[760,560],[1320,860]]){await page.setViewportSize({width,height});await page.locator('.conversation-tools .message-more summary').click();const r=await page.locator('.conversation-tools .message-more-actions').boundingBox();assert.ok(r.x>=0&&r.x+r.width<=width&&r.y+r.height<=height);await page.keyboard.press('Escape');assert.equal(await page.locator('.conversation-tools .message-more').getAttribute('open'),null);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth&&document.documentElement.scrollHeight<=innerHeight),true);}
 await page.screenshot({path:'C:/Users/ryank/.cache/nightlink-messages-menu.png'});
 assert.deepEqual(errors,[]);console.log('PASS channels-first sidebar entry, ordered destinations, search menu, DM switching, Escape and compact bounds. No radio access.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
