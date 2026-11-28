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
  await page.evaluate(()=>{const c=live.channels[0];live.contacts.push({key:'44'.repeat(32),name:'Ridge RPT',type:2,snr:null,lastAdvert:Math.floor(Date.now()/1000)-60});
   live.messages.push({id:'r1',conversation:conversationId(c),target:c,kind:'channel',sender:'X',text:'via ridge',timestamp:Math.floor(Date.now()/1000)-30,status:'Received',observedRoute:{path:['44'],direct:false,snr:2.5,rssi:-90}});view('Nodes');renderNodes(true);});
  const rows=await page.evaluate(()=>[...document.querySelectorAll('#node-table tr')].map(r=>({level:r.querySelector('.node-bars')?.dataset.level,heard:r.children[3]?.textContent,label:r.querySelector('td.signal')?.getAttribute('aria-label')})));
  assert.deepEqual(rows.map(r=>r.level),['4','1','0','3']);assert.deepEqual(rows.map(r=>r.heard),['5m ago','2h ago','Unknown','1m ago']);assert.equal(rows[3].label,'SNR 2.5 dB, 3 of 4 bars','repeater SNR from relayed message');
  // A zero-hop advert from a repeater with no relayed messages gives it an exact-key reading.
  await page.evaluate(()=>{const key='55'.repeat(32);live.contacts.push({key,name:'Far RPT',type:2,snr:null,lastAdvert:Math.floor(Date.now()/1000)});
   const k=Array.from({length:32},()=>0x55),frame=Uint8Array.from([0x88,-6*4&255,-100&255,(4<<2)|1,0,...k,1,0,0,0,...Array(64).fill(0),0x81]);
   ble.dispatchEvent(new CustomEvent('packet',{detail:frame}));renderNodes(true);});
  assert.equal(await page.evaluate(()=>[...document.querySelectorAll('#node-table tr')].at(-1).querySelector('td.signal').getAttribute('aria-label')),'SNR -6 dB, 1 of 4 bars','advert-derived repeater SNR');
  // A node heard only through repeaters shows how far away it is instead of a bare dash.
  const relayed=await page.evaluate(()=>{const key='66'.repeat(32);live.contacts.push({key,name:'Distant RPT',type:2,snr:null,lastAdvert:Math.floor(Date.now()/1000),pathLength:null});
   const k=Array.from({length:32},()=>0x66),frame=Uint8Array.from([0x88,8,-100&255,(4<<2)|1,2,0x11,0x22,...k,1,0,0,0,...Array(64).fill(0),0x81]);ble.dispatchEvent(new CustomEvent('packet',{detail:frame}));renderNodes(true);
   const row=[...document.querySelectorAll('#node-table tr')].find(r=>/Distant RPT/.test(r.textContent));return [row.querySelector('td.signal').textContent.trim(),row.querySelector('td.signal').getAttribute('aria-label')];});
  assert.match(relayed[0],/relayed · 2 hops$/);assert.equal(relayed[1],'No direct signal, relayed 2 hops');
  // Rows are matched by contact, not position: the favourites view removes non-favourite rows before readings are applied.
  const fav=await page.evaluate(()=>{favoriteKeys=new Set(['55'.repeat(32)]);renderNodes(false);return [...document.querySelectorAll('#node-table tr')].filter(r=>r.querySelector('[data-node]')).map(r=>[r.querySelector('.node-name')?.textContent.replace(/\s+/g,' ').trim(),r.querySelector('td.signal')?.getAttribute('aria-label')]);});
  assert.equal(fav.length,1,'only the favourite row: '+JSON.stringify(fav));assert.match(fav[0][0],/Far RPT/);assert.equal(fav[0][1],'SNR -6 dB, 1 of 4 bars','reading stays on its own node');
  await page.evaluate(()=>{favoriteKeys=new Set();});assert.equal(rows[0].label,'SNR 7 dB, 4 of 4 bars');assert.equal(rows[2].label,'Signal unavailable');
  assert.deepEqual(errors,[],mode+' page errors');await page.close();
 }
 console.log('PASS command palette (Ctrl+P open, filter, Enter to channel, arrows/aria-activedescendant, Escape, empty state, contacts) and Nodes signal bars/relative age in terminal and cards. Synthetic only.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1);});
