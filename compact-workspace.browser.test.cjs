/* Isolated source-renderer layout checks. All network and radio work are blocked. */
const {chromium}=require('C:/Users/ryank/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
 try{
  const page=await browser.newPage({viewport:{width:1500,height:900}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*',async route=>{
   const u=new URL(route.request().url());if(u.origin!=='http://127.0.0.1:4173')return route.abort();
   const file=u.pathname==='/'?'index.html':u.pathname.slice(1);
   try{
    let body=await fs.readFile(path.join(__dirname,file));
    // Root integration may be pending while this owned component is tested.
    if(file==='index.html'&&!body.includes(Buffer.from('src="compact-workspace.js"'))){body=Buffer.from(body.toString('utf8').replace('</head>','<link rel="stylesheet" href="compact-workspace.css"></head>').replace('</body>','<script src="compact-workspace.js"></script></body>'));}
    await route.fulfill({body,contentType:file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/html'});
   }catch{await route.fulfill({status:404,body:''});}
  });
  await page.goto('http://127.0.0.1:4173');await page.waitForSelector('#overview-splitter');
  await page.evaluate(()=>{window.layoutCommands=[];radioSession.request=ble.command=async()=>{layoutCommands.push('blocked');throw Error('Physical radio blocked');};view('Overview');});
  const splitter=page.locator('#overview-splitter');
  await splitter.focus();await page.keyboard.press('ArrowRight');
  assert.equal(await splitter.getAttribute('aria-valuenow'),'62');
  assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('nightlink.overview-layout.v1')).messages),62);
  await page.keyboard.press('Enter');assert.equal(await splitter.getAttribute('aria-valuenow'),'60');
  const before=await page.locator('#overview .conversation').boundingBox(),handle=await splitter.boundingBox();
  await page.mouse.move(handle.x+handle.width/2,handle.y+handle.height/2);await page.mouse.down();
  await page.mouse.move(handle.x+120,handle.y+handle.height/2,{steps:5});await page.mouse.up();
  const after=await page.locator('#overview .conversation').boundingBox();
  assert.ok(after.width>before.width+80,'pointer increases message panel even across an embedded map');
  assert.equal(await page.locator('.overview-resizing').count(),0,'drag shield is removed after pointer release');
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('nightlink.overview-layout.v1')).messages);
  await page.reload();await page.waitForSelector('#overview-splitter');
  assert.ok(Math.abs(Number(await splitter.getAttribute('aria-valuenow'))-saved)<1,'split survives reload');
  for(const [w,h]of [[1500,900],[1100,740],[1001,650],[920,650],[760,528]]){
   await page.setViewportSize({width:w,height:h});
   for(const compact of [false,true]){
    await page.evaluate(c=>{setCompact(c,false,false);applyTextSize(1.3,false);view('Overview');},compact);await page.waitForTimeout(50);
    assert.equal(await splitter.isVisible(),w>1000);
    const size=await page.evaluate(()=>({w:innerWidth,h:innerHeight,sw:document.documentElement.scrollWidth,sh:document.documentElement.scrollHeight,panels:[...document.querySelectorAll('#overview>.dashboard-grid>.panel')].filter(e=>e.getClientRects().length).map(e=>e.getBoundingClientRect().toJSON())}));
    assert.ok(size.sw<=size.w&&size.sh<=size.h,'no app-level scrolling');
    for(const panel of size.panels)assert.ok(panel.right<=w+1&&panel.bottom<=h+1,'panels fit viewport');
   }
  }
  await page.setViewportSize({width:1500,height:900});
  await page.evaluate(()=>{live.channels=[{slot:0,id:'public',name:'Public'}];renderChannels();view('Overview');});
  const group=page.locator('#channels [data-sidebar-group=channels]');await group.locator('summary').click();
  const open=await group.evaluate(e=>e.open);await page.evaluate(()=>renderChannels());
  assert.equal(await group.evaluate(e=>e.open),open,'existing conversation disclosure retains choice');
  assert.equal(await page.locator('aside nav>button').count(),5,'no new primary destinations');
  await page.evaluate(()=>view('Messages'));assert.equal(await splitter.isVisible(),false);
  assert.deepEqual(await page.evaluate(()=>window.layoutCommands||[]),[]);assert.deepEqual(errors,[]);
  console.log('PASS Overview keyboard/pointer split, persisted preference, five viewport sizes/two densities at 130% text, existing conversation collapse and no new primary destinations. Synthetic only; no radio operations.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
