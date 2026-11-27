/* Command palette (Ctrl+P) and Nodes signal bars in both interfaces. Synthetic state; no radio requests. */
const {chromium}=require(process.env.NIGHTLINK_PLAYWRIGHT||'playwright'),fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,...(process.env.NIGHTLINK_BROWSER?{executablePath:process.env.NIGHTLINK_BROWSER}:{})});try{
 for(const mode of ['terminal','cards']){
  const page=await browser.newPage({viewport:{width:1320,height:860}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(m=>{try{localStorage.setItem('nightlink.interface',m);}catch{}},mode);
  await page.route('**/*',async r=>{const u=new URL(r.request().url());if(u.origin!=='http://127.0.0.1:4173')return r.abort();const f=u.pathname==='/'?'index.html':u.pathname.slice(1);try{await r.fulfill({body:await fs.readFile(path.join(__dirname,f)),contentType:f.endsWith('.js')?'text/javascript':f.endsWith('.css')?'text/css':'text/html'});}catch{await r.fulfill({status:404,body:''});}});
  await page.goto('http://127.0.0.1:4173');await page.waitForFunction(()=>window.NightlinkPalette&&window.NightlinkNodeSignal);
  await page.evaluate(()=>{radioSession.request=async()=>{throw Error('radio blocked');};const now=Math.floor(Date.now()/1000);live.identity={key:'ee'.repeat(32),name:'SN0WMAN'};live.sync='ready';
   live.channels=[{slot:0,id:'ab'.repeat(12),name:'Public'},{slot:1,id:'cd'.repeat(12),name:'field-ops'}];
   live.contacts=[{key:'11'.repeat(32),name:'Hilltop RPT',type:2,snr:7,lastAdvert:now-300},{key:'22'.repeat(32),name:'Base',type:1,snr:-8,lastAdvert:now-7200},{key:'33'.repeat(32),name:'Quiet',type:1,snr:null,lastAdvert:0}];
   renderChannels();view('Overview');});
  // Open, filter, choose a channel by keyboard.
  await page.keyboard.press('Control+p');await page.waitForSelector('#cmd-palette[open]');assert.equal(await page.evaluate(()=>document.activeElement.id),'cmd-palette-input');
  await page.keyboard.type('field');assert.equal(await page.locator('#cmd-palette [role=option]').first().textContent(),'#field-opsChannel');
  await page.keyboard.press('Enter');await page.waitForFunction(()=>current==='Messages'&&live.selected?.slot===1);assert.equal(await page.locator('#cmd-palette[open]').count(),0);
  // Arrow keys move the active option; Escape closes and returns focus.
  await page.evaluate(()=>view('Overview'));await page.locator('#search-button, button').first().focus();
  await page.keyboard.press('Control+p');await page.keyboard.type('n');const first=await page.locator('#cmd-palette [aria-selected=true]').textContent();
  await page.keyboard.press('ArrowDown');assert.notEqual(await page.locator('#cmd-palette [aria-selected=true]').textContent(),first);
  assert.equal(await page.evaluate(()=>document.querySelector('#cmd-palette-input').getAttribute('aria-activedescendant')),'cmd-opt-1');
  await page.keyboard.press('Escape');await page.waitForFunction(()=>!document.querySelector('#cmd-palette[open]'));
  await page.keyboard.press('Control+p');await page.keyboard.type('qqqzz');assert.equal(await page.locator('.cmd-palette-empty').textContent(),'No matches');await page.keyboard.press('Escape');
  // Contacts and pages are listed.
  await page.keyboard.press('Control+p');await page.keyboard.type('hill');assert.match(await page.locator('#cmd-palette [role=option]').first().textContent(),/Hilltop RPT.*Contact/);await page.keyboard.press('Escape');
  // Nodes: bars and relative age.
  await page.evaluate(()=>{view('Nodes');renderNodes(true);});
  const rows=await page.evaluate(()=>[...document.querySelectorAll('#node-table tr')].map(r=>({level:r.querySelector('.node-bars')?.dataset.level,heard:r.children[3]?.textContent,label:r.querySelector('td.signal')?.getAttribute('aria-label')})));
  assert.deepEqual(rows.map(r=>r.level),['4','1','0']);assert.deepEqual(rows.map(r=>r.heard),['5m ago','2h ago','Unknown']);assert.equal(rows[0].label,'SNR 7 dB, 4 of 4 bars');assert.equal(rows[2].label,'Signal unavailable');
  assert.deepEqual(errors,[],mode+' page errors');await page.close();
 }
 console.log('PASS command palette (Ctrl+P open, filter, Enter to channel, arrows/aria-activedescendant, Escape, empty state, contacts) and Nodes signal bars/relative age in terminal and cards. Synthetic only.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1);});
