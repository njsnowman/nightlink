/* Terminal consolidation: top strip hidden, its states in the status line, one key bar, chat bar without repeats, More menu. */
const {chromium}=require(process.env.NIGHTLINK_PLAYWRIGHT||'playwright'),fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,...(process.env.NIGHTLINK_BROWSER?{executablePath:process.env.NIGHTLINK_BROWSER}:{})});try{
 const page=await browser.newPage({viewport:{width:1320,height:860}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',async r=>{const u=new URL(r.request().url());if(u.origin!=='http://127.0.0.1:4173')return r.abort();const f=u.pathname==='/'?'index.html':u.pathname.slice(1);try{await r.fulfill({body:await fs.readFile(path.join(__dirname,f)),contentType:f.endsWith('.js')?'text/javascript':f.endsWith('.css')?'text/css':'text/html'});}catch{await r.fulfill({status:404,body:''});}});
 await page.goto('http://127.0.0.1:4173');await page.waitForFunction(()=>window.NightlinkStatusLine&&window.NightlinkMoreMenu);
 await page.evaluate(()=>{radioSession.request=async()=>{throw Error('radio blocked');};live.identity={key:'ee'.repeat(32),name:'SN0WMAN',frequency:910.525,bandwidth:250,spreadingFactor:11,codingRate:5,txPower:22};live.sync='ready';const a={kind:'channel',slot:0,id:'ab'.repeat(12),name:'Public'};live.channels=[a];live.selected={...a};live.messages=[];NightlinkStatusLine.refresh();});
 assert.ok(await page.isHidden('main>header'),'top strip hidden');
 // Internet state from the hidden strip appears in the status line.
 for(const id of ['internet-status','connection','open-activity-inbox'])assert.ok(await page.isVisible('.term-status-dock #'+id),id+' docked and visible');
 assert.ok(await page.isVisible('.term-status-dock #focus-mode-toggle'),'focus toggle docked');
 // Link field opens the radio connection dialog.
 await page.click('.term-status-dock #connection');await page.waitForFunction(()=>[...document.querySelectorAll('dialog[open]')].length>0);await page.keyboard.press('Escape');
 // One key bar: page keys sit inside the F-key bar without repeating its keys.
 await page.evaluate(()=>view('Nodes'));const keys=await page.evaluate(()=>{const p=document.querySelector('#term-page-keys');return {inBar:!!p?.closest('#term-fkeys'),keys:[...document.querySelectorAll('#term-fkeys .term-fkey')].map(k=>k.textContent)};});
 assert.ok(keys.inBar);assert.equal(new Set(keys.keys).size,keys.keys.length,'no repeated keys: '+keys.keys.join(' '));assert.ok(keys.keys.includes('Tab'));
 // Update notice is docked in the status line and does not cover the composer.
 await page.evaluate(()=>{view('Messages');const b=document.querySelector('#update-available');b.textContent='Nightlink 9.9.9 available · Open download ↗';b.hidden=false;});
 const upd=await page.evaluate(()=>{const b=document.querySelector('#update-available'),i=document.querySelector('#mrc-input')?.getBoundingClientRect(),r=b.getBoundingClientRect();return {docked:!!b.closest('.term-status-dock'),overlap:!!i&&!(r.bottom<=i.top||r.top>=i.bottom||r.right<=i.left||r.left>=i.right)};});
 assert.ok(upd.docked,'update notice docked');assert.equal(upd.overlap,false,'update notice does not cover the message box');
 // Chat bar: no clock, node name or link state.
 await page.evaluate(()=>view('Messages'));const bar=await page.textContent('.mrc-statusbar');assert.doesNotMatch(bar,/SN0WMAN|BLE|\d\d:\d\d/,bar);assert.match(bar,/#Public/);
 // More menu: keyboard open, arrows, Escape returns focus, item runs.
 await page.focus('#term-more');await page.keyboard.press('ArrowDown');assert.equal(await page.getAttribute('#term-more','aria-expanded'),'true');
 assert.equal(await page.evaluate(()=>document.activeElement.textContent),'[O] Contact Book');await page.keyboard.press('ArrowUp');assert.match(await page.evaluate(()=>document.activeElement.textContent),/RX Log/);
 await page.keyboard.press('Escape');assert.equal(await page.evaluate(()=>document.activeElement.id),'term-more');assert.ok(await page.isHidden('#term-more-menu'));
 await page.click('#term-more');await page.click('#term-more-menu >> text=Contact Book');await page.waitForFunction(()=>current==='Contact Book');
 // Propagation lives under More (owner, 2026-11-27); the RF indicator is not in the bottom bar.
 assert.equal(await page.locator('.term-status-dock #propagation-indicator').count(),0);
 await page.click('#term-more');await page.click('#term-more-menu >> text=Propagation');await page.waitForFunction(()=>document.querySelector('dialog[open]'));await page.keyboard.press('Escape');
 // Palette covers the strip's actions.
 await page.keyboard.press('Control+p');await page.keyboard.type('connection');assert.match(await page.locator('#cmd-palette [role=option]').first().textContent(),/Radio connection/);await page.keyboard.press('Escape');
 await page.evaluate(()=>NightlinkInterface.set('cards'));assert.equal(await page.evaluate(()=>document.querySelector('#connection').closest('main>header')!==null),true,'cards: controls back in strip');await page.evaluate(()=>NightlinkInterface.set('terminal'));assert.ok(await page.isVisible('.term-status-dock #connection'));
 assert.deepEqual(errors,[]);console.log('PASS consolidation: strip hidden, its controls docked (internet, connection, inbox) and focus in menu bar, connection opens dialog, one key bar without repeats, chat bar without clock/node/link, More menu keyboard and click, palette connection entry. Synthetic only.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1);});
