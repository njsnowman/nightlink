// Synthetic conversations only: never opens a radio or a production profile.
const {chromium}=require('C:/Users/ryank/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
 try{
  const page=await browser.newPage({viewport:{width:1100,height:740}}),errors=[];page.setDefaultTimeout(7000);
  page.on('pageerror',e=>errors.push(e.stack));
  await page.route('**/*',async route=>{const url=new URL(route.request().url());if(url.origin!=='http://127.0.0.1:4173')return route.abort();const file=url.pathname==='/'?'index.html':decodeURIComponent(url.pathname.slice(1));try{await route.fulfill({body:await fs.readFile(path.join(__dirname,file)),contentType:file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/html'});}catch{await route.fulfill({status:404,body:''});}});
  await page.goto('http://127.0.0.1:4173');await page.bringToFront();
  await page.evaluate(()=>{
   live.identity={key:'cd'.repeat(32),name:'Synthetic station',frequency:906.875,txPower:22};
   live.contacts=[{key:'ab'.repeat(32),name:'Synthetic Alice',type:1,pathLength:255},{key:'ef'.repeat(32),name:'Synthetic Bob',type:1,pathLength:255}];
   live.channels=[{slot:0,id:'01'.repeat(12),name:'general'},{slot:1,id:'02'.repeat(12),name:'echo'}];
   live.sync='syncing';live.selected={kind:'channel',...live.channels[0]};live.messages=[];renderChannels();view('Nodes');
   radioSession.dispatchEvent(new CustomEvent('message',{detail:{kind:'channel',slot:1,text:'Alice: Synthetic channel record',timestamp:100,pathLength:0}}));
   radioSession.dispatchEvent(new CustomEvent('message',{detail:{kind:'direct',prefix:'abababababab',text:'Synthetic direct record',timestamp:101,textType:0}}));
  });
  assert.equal(await page.locator('nav > [data-view="Messages"] .unread-badge').textContent(),'2','Unified Messages counts channel and direct unread');
  assert.equal(await page.locator('nav summary .sidebar-unread').count(),0,'Tools does not duplicate DM attention');
  assert.equal(await page.locator('.dm-floating').count(),0,'Recovered records do not open notification windows');
  await page.locator('nav > [data-view="Messages"]').click();
  const channel=page.getByRole('combobox',{name:'Choose channel',exact:true});await channel.selectOption('1');
  await page.waitForFunction(()=>ensureAttention().unread(live.messages).length===1);
  assert.equal(await page.locator('#chat-log').getByText('Synthetic channel record',{exact:true}).count(),1);
  assert.equal(await page.locator('nav > [data-view="Messages"] .unread-badge').textContent(),'1');
  await page.evaluate(()=>{live.sync='ready';});
  await page.locator('.conversation-tools').getByRole('button',{name:'Direct messages',exact:true}).click();
  assert.equal(await page.locator('#crumb').textContent(),'Messages / Direct messages');
  assert.equal(await page.locator('nav > [data-view="Messages"]').getAttribute('class').then(c=>c.includes('active')),true);
  await page.getByRole('textbox',{name:'Search direct message contacts'}).fill('Alice');
  assert.equal(await page.locator('.dm-inbox-contact').count(),1);
  await page.locator('.dm-inbox-contact').click();await page.locator('.dm-floating').waitFor();
  assert.equal(await page.locator('#crumb').textContent(),'Messages / Direct messages','Opening a DM retains inbox behind it');
  await page.locator('.dm-floating input').click();
  await page.waitForFunction(()=>ensureAttention().unread(live.messages).length===0);
  assert.equal(await page.locator('nav > [data-view="Messages"] .unread-badge').count(),0);
  await page.locator('.dm-inbox-contact').click();assert.equal(await page.locator('.dm-floating').count(),1,'Repeated opens reuse one popup');
  await page.locator('.dm-floating .dm-close').click();
  await page.locator('.dm-inbox .workspace-message-tabs').getByRole('button',{name:'Channels',exact:true}).click();
  assert.equal(await channel.inputValue(),'1','Returning to Channels retains selected channel');
  await channel.selectOption('0');assert.equal(await page.locator('#chat-log').getByText('Synthetic channel record',{exact:true}).count(),0);
  await channel.selectOption('1');assert.equal(await page.locator('#chat-log').getByText('Synthetic channel record',{exact:true}).count(),1);
  const focusedPicker=await channel.elementHandle();await channel.focus();await page.evaluate(()=>renderMessages());
  assert.equal(await focusedPicker.evaluate(e=>e.isConnected&&document.activeElement===e),true,'Incoming render retains picker DOM and focus');
  const tools=page.locator('aside nav .sidebar-group');
  if(!await tools.evaluate(e=>e.open))await tools.locator('summary').click();
  await page.evaluate(()=>renderMessages());assert.equal(await tools.evaluate(e=>e.open),true,'Rendering retains manually expanded Tools');
  await page.evaluate(()=>view('Diagnostics'));if(await tools.evaluate(e=>e.open))await tools.locator('summary').click();
  await page.evaluate(()=>renderMessages());assert.equal(await tools.evaluate(e=>e.open),false,'Rendering retains manually collapsed Tools on Diagnostics');
  assert.deepEqual(errors,[]);console.log('PASS: unified unread/read transitions, silent catchup, channel switching, searchable DM inbox, single popup, retained channel, picker focus and Tools expansion');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
