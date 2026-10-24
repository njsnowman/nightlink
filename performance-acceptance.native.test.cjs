/* Packaged acceptance with isolated profile and synthetic history; no physical radio/provider. */
const {_electron}=require('C:/Users/ryank/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs/promises'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict');
(async()=>{
 const source=path.resolve(process.argv[2]),runtime=process.argv[3],fixture=await fs.mkdtemp(path.join(os.tmpdir(),'nightlink-performance-acceptance-'));
 await fs.writeFile(path.join(fixture,'package.json'),JSON.stringify({name:'nightlink-performance-acceptance',version:'0.8.22-rc.26',main:'main.cjs'}));
 await fs.writeFile(path.join(fixture,'main.cjs'),"const {app}=require('electron'),path=require('node:path'),source="+JSON.stringify(source)+";const set=app.setPath.bind(app);app.setPath=(n,v)=>set(n,n==='userData'?path.join(__dirname,'profile'):v);app.setAppPath(source);require(path.join(source,'desktop.cjs'));");
 const app=await _electron.launch({executablePath:runtime,args:[fixture,'--meshline-test'],timeout:20000});
 let release;const providerHeld=new Promise(r=>release=r);
 try{
  const page=await app.firstWindow(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('https://**',async route=>{if(route.request().url().startsWith('https://map.okimesh.org/')){await providerHeld;try{await route.fulfill({body:'<!doctype html><p>Provider fixture</p>',contentType:'text/html'});}catch{}}else await route.abort();});
  await page.waitForFunction(()=>typeof live==='object'&&typeof saveProfile==='function');
  await page.evaluate(()=>{
   const key='a'.repeat(64),peer='c'.repeat(64),id='b'.repeat(24),channel={slot:0,id,name:'Acceptance'};
   localStorage.setItem('meshline.profile',JSON.stringify({identity:{key,name:'Fixture radio',frequency:906.875,txPower:20,model:'Fixture',version:'test'},contacts:[{key:peer,name:'Fixture peer',type:1,pathLength:255}],channels:[channel]}));
   const rows=Array.from({length:1000},(_,i)=>({id:'retained-'+i,text:'Retained acceptance '+i,conversation:'channel:0:'+id,kind:'channel',target:{kind:'channel',...channel},timestamp:1000+i,sender:'Fixture peer',status:'Received from radio',pathLength:2}));
   rows.push({id:'retained-direct',text:'Retained direct',conversation:'direct:'+peer,kind:'direct',target:{kind:'direct',key:peer,name:'Fixture peer'},timestamp:2001,sender:'Fixture peer',status:'Received from radio',pathLength:1});
   localStorage.setItem('meshline.history.'+key,JSON.stringify(rows));
  });
  const began=Date.now();await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>NightlinkPerformance.snapshot().completed.some(r=>r.phase==='workspace-first-frame'));
  assert.equal(await page.evaluate(()=>current),'Overview');assert.equal(await page.evaluate(()=>live.messages.length),1001);
  assert.equal(await page.locator('#chat-log .message').count(),120);assert.match(await page.locator('#chat-log .message').last().innerText(),/Retained acceptance 999/);
  assert.equal(await page.evaluate(()=>NightlinkPerformance.snapshot().pending.some(r=>r.phase==='corescope-page')),true,'workspace/history must be ready while provider remains pending');
  const readyMs=Date.now()-began;
  for(const name of ['Messages','Nodes','Radio','Settings','Network map','Overview']){
   await page.evaluate(name=>view(name),name);
   assert.equal(await page.evaluate(()=>current),name);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth||document.documentElement.scrollHeight>innerHeight),false,'viewport fit for '+name);
  }
  await page.evaluate(()=>{view('Messages');document.querySelector('#message-input').value='Retained channel draft';document.querySelector('#message-input').dispatchEvent(new Event('input'));view('Overview');});
  await page.evaluate(()=>view('Messages'));assert.equal(await page.locator('#message-input').inputValue(),'Retained channel draft');
  await page.evaluate(()=>{live.sync='ready';view('Overview');});const windowPromise=app.waitForEvent('window');await page.evaluate(()=>openDM('c'.repeat(64)));const child=await windowPromise;
  child.on('pageerror',e=>errors.push(e.message));await child.locator('.dm-bubble').waitFor();assert.equal(await child.locator('.dm-bubble').count(),1);
  await child.locator('#dm-text').fill('Native draft retained');await child.evaluate(()=>window.acceptanceRow=document.querySelector('.dm-bubble'));
  await page.waitForFunction(()=>drafts.get(live.identity.key,'direct:'+'c'.repeat(64))==='Native draft retained');
  await page.evaluate(()=>{renderMessages();renderStats();renderChannels();updateDMs();});
  assert.equal(await child.locator('#dm-text').inputValue(),'Native draft retained');assert.equal(await child.evaluate(()=>acceptanceRow===document.querySelector('.dm-bubble')),true);
  assert.equal(await page.evaluate(()=>current),'Overview');assert.equal(app.windows().length,2);assert.equal(await page.evaluate(()=>ble.state==='connected'),false,'no physical transport connection');
  await page.evaluate(()=>{live.messages.find(m=>m.id==='retained-direct').text='Updated direct fixture';updateDMs();});await child.locator('.dm-bubble').filter({hasText:'Updated direct fixture'}).waitFor();assert.equal(await child.locator('#dm-text').inputValue(),'Native draft retained');
  assert.deepEqual(errors,[]);
  console.log(JSON.stringify({workspaceWithHeldProviderMs:readyMs,retainedMessages:1001,mountedMessages:120,source:path.basename(source)}));
  console.log('PASS: packaged saved history/first frame independent of pending provider; Overview startup, six destinations fit, channel draft, real native-DM IPC/DOM reuse/draft/update, no duplicate DM or transport connection. Isolated synthetic profile only.');
 }finally{release();await app.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
