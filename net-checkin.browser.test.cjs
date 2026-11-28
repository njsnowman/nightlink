/* Net check-in: opens from Ctrl+P, Terminal More and the Cards Tools menu; roster from favourites; channel posts after
   start check people in; manual mark and undo; restart keeps the net; end, copy and CSV. Nothing transmitted. */
const {chromium}=require(process.env.NIGHTLINK_PLAYWRIGHT||'playwright'),fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict');
const serve=async r=>{const u=new URL(r.request().url());if(u.origin!=='http://127.0.0.1:4173')return r.abort();const f=u.pathname==='/'?'index.html':u.pathname.slice(1);try{await r.fulfill({body:await fs.readFile(path.join(__dirname,f)),contentType:f.endsWith('.js')?'text/javascript':f.endsWith('.css')?'text/css':'text/html'});}catch{await r.fulfill({status:404,body:''});}};
(async()=>{const browser=await chromium.launch({headless:true,...(process.env.NIGHTLINK_BROWSER?{executablePath:process.env.NIGHTLINK_BROWSER}:{})});try{
 for(const iface of ['cards','terminal']){const context=await browser.newContext({viewport:{width:1320,height:860},acceptDownloads:true});await context.grantPermissions(['clipboard-read','clipboard-write'],{origin:'http://127.0.0.1:4173'});
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(i=>{try{if(!sessionStorage.getItem('seeded')){localStorage.setItem('nightlink.interface',i);localStorage.setItem('nightlink.favorites',JSON.stringify(['aa'.repeat(32),'bb'.repeat(32)]));sessionStorage.setItem('seeded','1');}}catch{}},iface);
  await page.route('**/*',serve);await page.goto('http://127.0.0.1:4173');await page.waitForFunction(()=>window.NightlinkNet);
  const seed=()=>page.evaluate(()=>{const sends=[];window.__sends=sends;radioSession.request=ble.command=(...a)=>{sends.push(a);throw Error('Radio blocked in fixture');};live.identity={key:'cd'.repeat(32),name:'NET CONTROL',frequency:910.525,txPower:22};live.sync='ready';
   live.channels=[{slot:0,id:'01'.repeat(12),name:'Public'},{slot:1,id:'02'.repeat(12),name:'county-net'}];live.contacts=[{key:'aa'.repeat(32),name:'Alpha',type:1},{key:'bb'.repeat(32),name:'Bravo',type:1},{key:'cc'.repeat(32),name:'Charlie',type:1}];
   try{favoriteKeys=new Set(['aa'.repeat(32),'bb'.repeat(32)]);}catch{}if(!live.messages)live.messages=[];selectConversation({kind:'channel',...live.channels[1]});});
  await seed();
  if(iface==='cards'){assert.equal(await page.locator('#open-net-checkin').count(),1,'Cards Tools menu entry');await page.evaluate(()=>document.querySelector('#open-net-checkin').click());}
  else{assert.equal(await page.evaluate(()=>NightlinkMoreMenu.some(([l])=>l==='Net check-in')),true,'Terminal More menu entry');assert.equal(await page.evaluate(()=>NightlinkPalette.items().some(i=>i.label==='Net check-in')),true,'Ctrl+P entry');await page.evaluate(()=>NightlinkNet.open());}
  const d=page.locator('#net-dialog');await d.waitFor();assert.equal(await d.locator('#net-channel').inputValue(),'1','defaults to the open channel');
  await d.getByRole('button',{name:'Start net'}).click();assert.match(await d.locator('.net-status').textContent(),/#county-net · started \d\d:\d\d · 0 of 2 checked in/);
  await page.evaluate(()=>{const t={kind:'channel',...live.channels[1]},c=conversationId(t),now=Math.floor(Date.now()/1000)+1;live.messages.push({id:'n1',conversation:c,target:t,kind:'channel',slot:1,sender:'Alpha',text:'Alpha checking in',timestamp:now,own:false,status:'Received'},{id:'n2',conversation:c,target:t,kind:'channel',slot:1,sender:'Delta',text:'Delta, visitor',timestamp:now,own:false,status:'Received'},{id:'n3',conversation:'x',target:{kind:'channel',slot:0},kind:'channel',slot:0,sender:'Bravo',text:'wrong channel',timestamp:now,own:false,status:'Received'});});
  await page.evaluate(()=>NightlinkNet.open());
  assert.match(await d.locator('.net-status').textContent(),/1 of 2 checked in/);assert.equal(await d.locator('.net-row.net-in .net-name').allTextContents().then(x=>x.join()),'Alpha');assert.equal(await d.locator('.net-row.net-other .net-name').textContent(),'Delta');
  await d.locator('.net-row',{hasText:'Bravo'}).getByRole('button',{name:'Mark'}).click();assert.match(await d.locator('.net-status').textContent(),/2 of 2 checked in/);
  await d.locator('.net-row',{hasText:'Bravo'}).getByRole('button',{name:'Undo'}).click();assert.match(await d.locator('.net-status').textContent(),/1 of 2 checked in/);
  await d.getByRole('button',{name:'Put call in message box'}).click();const box=iface==='cards'?'#message-input':'#mrc-input';assert.match(await page.locator(box).inputValue(),/^Net check-in open on #county-net\./);
  await page.reload();await page.waitForFunction(()=>window.NightlinkNet);await seed();assert.equal(await page.evaluate(()=>NightlinkNet.state()?.channel),'county-net','net survives restart');
  await page.evaluate(()=>NightlinkNet.open());await d.getByRole('button',{name:'End net'}).click();assert.match(await d.locator('.net-status').textContent(),/ended \d\d:\d\d/);
  await d.getByRole('button',{name:'Copy log'}).click();await page.waitForTimeout(100);assert.match(await page.evaluate(()=>navigator.clipboard.readText()),/^Net check-in · #county-net/);
  const [dl]=await Promise.all([page.waitForEvent('download'),d.getByRole('button',{name:'Download CSV'}).click()]);assert.match(dl.suggestedFilename(),/^net-county-net-\d{4}-\d\d-\d\d\.csv$/);
  await d.getByRole('button',{name:'New net'}).click();assert.equal(await page.evaluate(()=>NightlinkNet.state()),null);
  if(process.env.NIGHTLINK_SCREENSHOTS)await page.screenshot({path:path.join(process.env.NIGHTLINK_SCREENSHOTS,'Net-checkin-'+iface+'.png')});
  assert.deepEqual(await page.evaluate(()=>window.__sends||[]),[],'nothing transmitted');assert.deepEqual(errors,[]);await context.close();}
 console.log('PASS Net check-in: Cards Tools, Terminal More and Ctrl+P entries, favourites roster, auto check-in from channel posts after start, others heard, manual mark/undo, call put in message box only, restart keeps net, end, copy log, CSV, nothing transmitted. Synthetic only.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
