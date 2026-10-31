/* Synthetic source renderer. Stubs deletion acceptance; never sends a radio command. */
const {chromium}=require(process.env.NIGHTLINK_PLAYWRIGHT||'playwright');
const fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.NIGHTLINK_BROWSER?{executablePath:process.env.NIGHTLINK_BROWSER}:{})});
 try{
  const page=await browser.newPage({viewport:{width:1320,height:860}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*',async route=>{
   const u=new URL(route.request().url());if(u.origin!=='http://127.0.0.1:4173')return route.abort();const file=u.pathname==='/'?'index.html':u.pathname.slice(1);
   try{let body=await fs.readFile(path.join(__dirname,file));if(file==='index.html'&&!body.includes(Buffer.from('src="contact-deletion-ui.js"'))){body=Buffer.from(body.toString('utf8').replace('</body>','<script src="contact-deletion-ui.js"></script></body>'));}await route.fulfill({body,contentType:file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':file.endsWith('.svg')?'image/svg+xml':'text/html'});}catch{await route.fulfill({status:404,body:''});}
  });
  await page.goto('http://127.0.0.1:4173');await page.waitForFunction(()=>typeof openContactCard==='function');
  await page.evaluate(async()=>{
   await cardsReady;window.deleteCalls=[];window.unexpectedRadioCommands=[];window.deleteMode='reject';
   radioSession.request=ble.command=async b=>{unexpectedRadioCommands.push(b[0]);throw Error('Physical radio blocked');};
   live.identity={key:'aa'.repeat(32),name:'Synthetic owner',frequency:906.875,txPower:22,model:'Synthetic radio'};radioSession.identity=live.identity;radioSession.ready=true;ble.state='connected';live.sync='ready';live.sending=false;radioSession.configuring=false;
   live.contacts=[{key:'bb'.repeat(32),name:'Same advertised name',type:1,pathLength:255},{key:'cc'.repeat(32),name:'Same advertised name',type:1,pathLength:255}];radioSession.contacts=live.contacts.slice();
   live.messages=[{id:'retained-dm',own:false,kind:'direct',prefix:'bbbbbbbbbbbb',sender:'Same advertised name',target:{kind:'direct',key:'bb'.repeat(32),name:'Same advertised name'},conversation:'direct:'+'bb'.repeat(32),timestamp:1700000000,text:'Synthetic retained history',status:'Received from radio'}];
   const canvas=document.createElement('canvas');canvas.width=canvas.height=1;await saveCard({key:'bb'.repeat(32),nickname:'Keep nickname',notes:'Keep notes',photo:canvas.toDataURL('image/jpeg'),updated:123});favoriteKeys.add('bb'.repeat(32));localStorage.setItem('nightlink.favorites',JSON.stringify([...favoriteKeys]));window.beforeDelete={card:JSON.stringify(contactCards.get('bb'.repeat(32))),history:JSON.stringify(live.messages),favorites:localStorage.getItem('nightlink.favorites')};
   radioSession.removeContact=async key=>{deleteCalls.push({key,radio:live.identity?.key});if(deleteMode==='reject')throw Error('Synthetic radio refusal');radioSession.forgetContact(key);return{key};};
   view('Nodes');
  });
  const openCard=async(key='bb'.repeat(32))=>{await page.evaluate(async key=>{const c=live.contacts.find(c=>c.key===key);if(!c)throw Error('Fixture contact missing');await openContactCard(c);},key);await page.locator('#contact-more').click();};
  const confirmScreen=async(key)=>{await openCard(key);await page.locator('#contact-delete').click();await page.locator('#delete-contact-confirm').waitFor();};
  const retained=async()=>assert.deepEqual(await page.evaluate(()=>({card:JSON.stringify(contactCards.get('bb'.repeat(32))),history:JSON.stringify(live.messages),favorites:localStorage.getItem('nightlink.favorites')})),await page.evaluate(()=>beforeDelete));
  await openCard();assert.equal(await page.locator('#contact-delete').textContent(),'Remove from radio');assert.deepEqual(await page.evaluate(()=>deleteCalls),[]);
  await page.locator('#contact-delete').click();assert.deepEqual(await page.evaluate(()=>deleteCalls),[],'opening confirmation does not delete');assert.match(await page.locator('#delete-contact-panel').textContent(),/Saved messages.*favorites stay/);
  await page.locator('#delete-contact-cancel').click();await page.locator('#contact-more').waitFor();assert.deepEqual(await page.evaluate(()=>deleteCalls),[],'cancel does not delete');
  await confirmScreen();await page.locator('#delete-contact-confirm').click();await page.waitForFunction(()=>document.querySelector('#delete-contact-feedback')?.textContent.includes('Synthetic radio refusal'));assert.equal(await page.evaluate(()=>deleteCalls.length),1);assert.equal(await page.evaluate(()=>live.contacts.some(c=>c.key==='bb'.repeat(32))),true);await retained();
  await page.locator('#delete-contact-cancel').click();
  for(const state of ['offline','sending','configuring','syncing']){
   await page.evaluate(state=>{ble.state=state==='offline'?'disconnected':'connected';live.sync=state==='offline'?'disconnected':state==='syncing'?'syncing':'ready';live.sending=state==='sending';radioSession.configuring=state==='configuring';},state);
   await openCard();assert.equal(await page.locator('#contact-delete').isDisabled(),true,state+' disables removal');
  }
  await page.evaluate(()=>{ble.state='connected';live.sync='ready';live.sending=false;radioSession.configuring=false;});
  await confirmScreen();await page.evaluate(()=>live.sending=true);await page.locator('#delete-contact-confirm').evaluate(e=>e.click());assert.equal(await page.evaluate(()=>deleteCalls.length),1,'busy state is rechecked at confirmation');assert.match(await page.locator('#delete-contact-feedback').textContent(),/changed|finish|Reconnect/i);await page.evaluate(()=>live.sending=false);
  await confirmScreen();await page.evaluate(()=>{live.identity={key:'dd'.repeat(32),name:'Other radio'};radioSession.identity=live.identity;});await page.locator('#delete-contact-confirm').evaluate(e=>e.click());assert.equal(await page.evaluate(()=>deleteCalls.length),1,'confirmation cannot cross radio identity');
  await page.evaluate(()=>{live.identity={key:'aa'.repeat(32),name:'Synthetic owner',frequency:906.875,txPower:22,model:'Synthetic radio'};radioSession.identity=live.identity;});await confirmScreen();await page.evaluate(()=>radioSession.generation++);await page.locator('#delete-contact-confirm').evaluate(e=>e.click());assert.equal(await page.evaluate(()=>deleteCalls.length),1,'confirmation cannot cross connection generation');
  await confirmScreen();await page.evaluate(()=>{window.removedFixture=live.contacts[0];live.contacts=live.contacts.filter(c=>c.key!=='bb'.repeat(32));});await page.locator('#delete-contact-confirm').evaluate(e=>e.click());assert.equal(await page.evaluate(()=>deleteCalls.length),1,'same-name contact cannot replace missing exact key');assert.match(await page.locator('#delete-contact-feedback').textContent(),/no longer saved/);await page.evaluate(()=>live.contacts.unshift(removedFixture));
  await page.evaluate(()=>deleteMode='accept');await confirmScreen();await page.locator('#delete-contact-confirm').click();await page.waitForFunction(()=>!live.contacts.some(c=>c.key==='bb'.repeat(32)));assert.deepEqual(await page.evaluate(()=>deleteCalls.at(-1)),{key:'bb'.repeat(32),radio:'aa'.repeat(32)});assert.equal(await page.evaluate(()=>live.contacts.some(c=>c.key==='cc'.repeat(32))),true,'same-name different public key stays');await retained();
  await page.evaluate(async()=>openContactCard({key:'sender:synthetic:Unlinked',name:'Unlinked sender',type:0,localSender:true,pathLength:255}));assert.equal(await page.locator('#contact-delete').count(),0,'unresolved sender cannot be removed from radio');
  await page.evaluate(()=>{if(document.querySelector('#dialog').open)document.querySelector('#dialog').close();});
  // A card from an earlier radio must not start a new confirmation on the replacement radio.
  await openCard('cc'.repeat(32));await page.evaluate(()=>{live.identity={key:'ee'.repeat(32),name:'Replacement radio',frequency:906.875,txPower:22,model:'Synthetic radio'};radioSession.identity=live.identity;radioSession.emit('identity',live.identity);});
  if(await page.locator('#contact-delete').count()){await page.locator('#contact-delete').evaluate(e=>e.click());}
  assert.equal(await page.locator('#delete-contact-confirm').count(),0,'stale contact card cannot target a replacement radio');
  assert.deepEqual(await page.evaluate(()=>unexpectedRadioCommands),[]);assert.deepEqual(errors,[]);
  console.log('PASS explicit confirmation/cancel, failure retention, busy/offline guards, exact key/radio/generation ownership, successful removal preserving local card/history/favorites, and unresolved sender protection. Simulated acceptance only; no radio commands.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
