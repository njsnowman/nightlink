/* Synthetic radio events only. No physical connection or transmission. */
const {chromium}=require(process.env.NIGHTLINK_PLAYWRIGHT||'playwright'),fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,...(process.env.NIGHTLINK_BROWSER?{executablePath:process.env.NIGHTLINK_BROWSER}:{})});try{
 const page=await browser.newPage({viewport:{width:1320,height:860},acceptDownloads:true}),errors=[];page.on('pageerror',e=>errors.push(e.stack));await page.route('**/*',async r=>{const u=new URL(r.request().url());if(u.origin!=='http://127.0.0.1:4173')return r.abort();const file=u.pathname==='/'?'index.html':u.pathname.slice(1);try{await r.fulfill({body:await fs.readFile(path.join(__dirname,file)),contentType:file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':file.endsWith('.svg')?'image/svg+xml':'text/html'});}catch{await r.fulfill({status:404,body:''});}});
 async function fixture(){await page.evaluate(()=>{radioSession.request=async()=>{throw Error('Physical radio blocked');};ble.connect=async()=>{throw Error('Physical radio blocked');};live.identity={key:'ff'.repeat(32),name:'Operator',frequency:910.525,txPower:20};live.contacts=[{key:'ab'.repeat(32),name:'ALPHA',type:1,pathLength:255,lastAdvert:1700000000,located:true,lat:39.1,lon:-84.2},{key:'cd'.repeat(32),name:'BRAVO',type:1,pathLength:255,lastAdvert:1700000001,located:false}];live.channels=[{slot:0,id:'12'.repeat(12),name:'Public'}];live.selected={kind:'channel',...live.channels[0]};live.sync='disconnected';});}
 await page.goto('http://127.0.0.1:4173');await page.waitForFunction(()=>window.NightlinkBook);await page.evaluate(()=>NightlinkBook.ready);await fixture();await page.evaluate(()=>NightlinkBook.open());await page.locator('#book-pick').click();await page.locator('#book-picker input').first().check();await page.locator('#book-pick-save').click();await page.waitForFunction(()=>document.querySelector('#book-count').textContent==='1 of 1 saved contacts');await page.locator('.book-row').click();await page.getByRole('button',{name:'Edit contact',exact:true}).click();await page.locator('[name=displayName]').fill('My friend');await page.locator('[name=callSign]').fill('N0ABC');await page.locator('[name=address]').fill('Private local address');await page.locator('[name=notes]').fill('<img src=x onerror=alert(1)> Plain notes');await page.locator('[name=lat]').fill('39.2');await page.locator('[name=lon]').fill('-84.3');const photo=await page.evaluate(()=>{const c=document.createElement('canvas');c.width=c.height=8;return c.toDataURL('image/png').split(',')[1];});await page.locator('#book-photo').setInputFiles({name:'photo.png',mimeType:'image/png',buffer:Buffer.from(photo,'base64')});await page.waitForFunction(()=>document.querySelector('#book-photo-status').textContent==='Photo ready to save');await page.waitForFunction(()=>!document.querySelector('#book-save').disabled);await page.locator('#book-save').click();await page.waitForSelector('#book-editor',{state:'hidden'});assert.match(await page.locator('#book-detail').innerText(),/N0ABC/);assert.equal(await page.locator('#book-detail .book-person img').count(),1);
 // Receiver channel events are distinct from local history loading and duplicates.
 async function message(text='ALPHA: Hello channel',timestamp=1700000010){await page.evaluate(({text,timestamp})=>radioSession.dispatchEvent(new CustomEvent('message',{detail:{kind:'channel',slot:0,text,timestamp,textType:0,pathLength:1}})),{text,timestamp});await page.evaluate(()=>NightlinkBook.flush());}
 await message();await message();let saved=await page.evaluate(()=>NightlinkBook.store.list());assert.equal(saved[0].history.length,1);assert.equal(saved[0].history[0].text,'Hello channel');assert.equal(saved[0].history[0].match,'name match; identity unverified');await page.evaluate(()=>live.contacts.push({key:'ef'.repeat(32),name:'ALPHA',type:1}));await message('ALPHA: Ambiguous',1700000011);assert.equal((await page.evaluate(()=>NightlinkBook.store.list()))[0].history.length,1);await page.evaluate(()=>live.contacts.pop());
 await page.evaluate(()=>{const contacts=live.contacts.map(c=>({...c,lastAdvert:c.lastAdvert+10,located:false}));radioSession.dispatchEvent(new CustomEvent('contacts',{detail:contacts}));});await page.evaluate(()=>NightlinkBook.flush());saved=await page.evaluate(()=>NightlinkBook.store.list());assert.equal(saved[0].history.length,2);assert.equal(saved[0].history[1].kind,'advert');assert.equal(saved[0].identities[0].location.lat,39.1,'new adverts without coordinates preserve last known location');assert.equal(saved[0].identities[0].location.at,1700000000000);assert.equal(saved[0].history[1].location,null);
 await page.evaluate(()=>{live.contacts=[];radioSession.dispatchEvent(new CustomEvent('contacts',{detail:[]}));});await page.evaluate(()=>NightlinkBook.flush());await page.reload();await page.waitForFunction(()=>window.NightlinkBook);await page.evaluate(()=>NightlinkBook.ready);await page.evaluate(()=>NightlinkBook.open());await page.locator('.book-row').click();assert.match(await page.locator('#book-detail').innerText(),/Saved locally/);assert.match(await page.locator('#book-detail').innerText(),/Plain notes/);assert.equal(await page.locator('#book-detail img[src=x]').count(),0);await page.locator('#book-detail').getByRole('button',{name:'Map',exact:true}).click();assert.equal(await page.locator('.book-plot circle').count(),2);assert.ok(await page.locator('.book-map').isVisible());await page.locator('#book-detail').getByRole('button',{name:'Activity',exact:true}).click();assert.equal(await page.locator('.book-observation').count(),2);
 // Restoring a saved identity uses the existing radio API and excludes personal fields.
 await page.locator('#book-detail').getByRole('button',{name:'Details',exact:true}).click();await page.evaluate(()=>{window.__bookAdds=[];radioSession.addContact=async value=>{__bookAdds.push(value);return value;};});assert.equal(await page.evaluate(()=>__bookAdds.length),0);await page.getByRole('button',{name:'Add identity to current radio',exact:true}).click();await page.locator('#book-radio-add').click();assert.deepEqual(await page.evaluate(()=>__bookAdds),[{key:'ab'.repeat(32),name:'ALPHA',type:1}]);
 // Export contains photos and history; import merges without overwriting local notes.
 const downloadPromise=page.waitForEvent('download');await page.locator('#book-export').click();const download=await downloadPromise,backup=await fs.readFile(await download.path(),'utf8');assert.ok(JSON.parse(backup).entries[0].photo.startsWith('data:image/jpeg;base64,'));await page.locator('#book-import').setInputFiles({name:'book.json',mimeType:'application/json',buffer:Buffer.from(backup)});await page.locator('#book-import-confirm').click();assert.equal((await page.evaluate(()=>NightlinkBook.store.list())).length,1);
 // Delete from the book and restore the exported personal data, photo and observations.
 await page.locator('#book-detail').getByRole('button',{name:'Details',exact:true}).click();await page.getByRole('button',{name:'Delete saved entry',exact:true}).click();await page.locator('#book-confirm-delete').click();await page.waitForFunction(()=>document.querySelectorAll('.book-row').length===0);await page.locator('#book-import').setInputFiles({name:'restore.json',mimeType:'application/json',buffer:Buffer.from(backup)});await page.locator('#book-import-confirm').click();await page.waitForFunction(()=>document.querySelectorAll('.book-row').length===1);await page.locator('.book-row').click();assert.equal(await page.locator('.book-person img').count(),1);
 // Invalid ownership changes roll back without partially changing the book.
 await page.evaluate(async()=>{const before=await NightlinkBook.store.list();let rejected=false;try{await NightlinkBook.store.save({...before[0],id:'duplicate-person'});}catch{rejected=true;}if(!rejected)throw Error('Duplicate ownership accepted');if((await NightlinkBook.store.list()).length!==1)throw Error('Atomic save changed record count');});
 // Concurrent updates retain history while a stale editor saves personal data.
 await page.evaluate(async()=>{const [old]=await NightlinkBook.store.list();const newer={id:'new',kind:'channel',sender:'ALPHA',channel:'Public',text:'New',at:Date.now(),sentAt:1};await NightlinkBook.store.observe(newer,[]);await NightlinkBook.store.save({...old,notes:'Edited after observation'});});assert.equal((await page.evaluate(()=>NightlinkBook.store.list()))[0].history.length,3);
 for(const mode of ['terminal','cards']){await page.evaluate(mode=>{NightlinkInterface.set(mode);NightlinkBook.open();},mode);for(const width of [1320,760]){await page.setViewportSize({width,height:860});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert.ok(await page.locator('#book-new').isVisible());}}
 await page.setViewportSize({width:1320,height:860});await page.evaluate(()=>{NightlinkInterface.set('terminal');NightlinkBook.open();});await page.locator('.book-row').click();await page.screenshot({path:'C:/Users/ryank/.cache/nightlink-backups/rc22-contact-book.png',fullPage:true});await page.locator('#book-detail').getByRole('button',{name:'Map',exact:true}).click();await page.screenshot({path:'C:/Users/ryank/.cache/nightlink-backups/rc22-contact-map.png',fullPage:true});
 await fixture();
 const savedContacts=()=>page.evaluate(()=>NightlinkBook.store.list());
 async function showSender(mode,sender){
  await page.evaluate(({mode,sender})=>{
   NightlinkInterface.set(mode);
   const target={kind:'channel',...live.channels[0]};
   live.selected=target;
   live.messages=[{id:'book-chat-'+sender,conversation:conversationId(target),target,kind:'channel',timestamp:1700000040,sender,text:'A chat message',status:'Received',pathLength:1}];
   view('Messages');
  },{mode,sender});
  if(mode==='terminal')await page.getByRole('button',{name:'Open contact card for '+sender,exact:true}).press('Enter');
  else await page.locator('#chat-log .sender .contact-link').click();
  await page.locator('#contact-save-to-book').click();
  await page.waitForFunction(()=>current==='Contact Book');
 }
 await page.evaluate(()=>Object.assign(live.contacts[0],{flags:4,snr:-3.25,pathLength:1,path:'12',lastAdvert:1700000100,lastModified:1700000090}));
 await showSender('terminal','ALPHA');
 let fromChat=await savedContacts();
 const alpha=fromChat.find(e=>e.identities.some(i=>i.key==='ab'.repeat(32)));
 assert.equal(alpha.notes,'Edited after observation');
 assert.equal(alpha.identities[0].flags,4);
 assert.equal(alpha.identities[0].snr,-3.25);
 assert.equal(alpha.identities[0].path,'12');
 assert.equal(alpha.identities[0].lastModified,1700000090);
 assert.equal(alpha.identities[0].location.lat,39.1);
 await showSender('cards','Unknown visitor');
 await showSender('terminal','Unknown visitor');
 fromChat=await savedContacts();
 const unknown=fromChat.filter(e=>e.chatSender?.name==='Unknown visitor');
 assert.equal(unknown.length,1);
 assert.deepEqual(unknown[0].identities,[]);
 await page.reload({waitUntil:'commit'});
 await page.waitForFunction(()=>window.NightlinkBook);
 assert.ok((await savedContacts()).some(e=>e.id===unknown[0].id));
 assert.deepEqual(errors,[]);console.log('Contact Book: selected radio save, personal fields/photo, map/coordinate plot, persistence after radio deletion/reload, channel attribution/ambiguity/dedupe, adverts, export/import, concurrent history, chat saves, radio snapshot refresh, name-only deduplication and terminal/cards layouts passed');
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});


