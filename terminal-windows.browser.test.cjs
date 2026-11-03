/* Text-mode windows (#131): Radio, Settings and Help title bars, dialog windows and the ANSI path view. Synthetic state only. */
const {chromium}=require(process.env.NIGHTLINK_PLAYWRIGHT||'playwright'),fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict');
const shots=process.env.NIGHTLINK_SCREENSHOTS;
function contrast(a,b){const lum=c=>{const v=c.match(/[\d.]+/g).slice(0,3).map(Number).map(x=>{x/=255;return x<=.03928?x/12.92:((x+.055)/1.055)**2.4;});return .2126*v[0]+.7152*v[1]+.0722*v[2];};const [x,y]=[lum(a),lum(b)].sort((p,q)=>q-p);return (x+.05)/(y+.05);}
async function serve(context){await context.route('**/*',async route=>{const u=new URL(route.request().url());if(u.origin!=='http://127.0.0.1:4173')return route.abort();const file=u.pathname==='/'?'index.html':u.pathname.slice(1);try{await route.fulfill({body:await fs.readFile(path.join(__dirname,file)),contentType:file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':file.endsWith('.svg')?'image/svg+xml':'text/html'});}catch{await route.fulfill({status:404,body:''});}});}
async function fixture(page){await page.evaluate(async()=>{if(window.cardsReady)await cardsReady;radioSession.request=ble.command=async()=>{throw Error('blocked in test');};
 live.identity={key:'fa'.repeat(32),name:'SNOMAN',located:true,lat:39.08,lon:-84.6,frequency:910.525};radioSession.identity=live.identity;live.sync='ready';
 live.contacts=[{key:'a1'+'11'.repeat(31),name:'Batesville Relay',type:2,located:true,lat:39.3,lon:-85.22},{key:'cc'+'33'.repeat(31),name:'Cedar Grove Relay',type:2,located:true,lat:39.2,lon:-84.9}];
 const ch={kind:'channel',slot:0,id:'a'.repeat(24),name:'field-ops'};live.channels=[ch];
 window.pathMessage={id:'p1',conversation:conversationId(ch),target:ch,kind:'channel',timestamp:Math.floor(Date.now()/1000),sender:'KD9XYZ',text:'net check',status:'Received',pathLength:3,snr:6};});}
(async()=>{const browser=await chromium.launch({headless:true,...(process.env.NIGHTLINK_BROWSER?{executablePath:process.env.NIGHTLINK_BROWSER}:{})});try{
 const context=await browser.newContext({viewport:{width:1320,height:860}}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await serve(context);
 await page.goto('http://127.0.0.1:4173');await page.waitForFunction(()=>typeof view==='function'&&window.NightlinkTerminalWindows);await fixture(page);
 // Page windows: Radio and Settings get a title bar and key line; the card page heading is hidden.
 await page.evaluate(()=>view('Radio'));
 assert.equal(await page.textContent('#term-page-title .term-window-name'),'RADIO');assert.ok(await page.isHidden('.page-heading'));assert.ok(await page.isVisible('#term-page-keys'));
 const bar=await page.evaluate(()=>{const s=getComputedStyle(document.querySelector('#term-page-title .term-window-sub'));const b=getComputedStyle(document.querySelector('#term-page-title'));return [s.color,b.backgroundColor];});
 assert.ok(contrast(...bar)>=4.5,'title bar subtitle contrast '+contrast(...bar));
 await page.evaluate(()=>view('Settings'));assert.equal(await page.textContent('#term-page-title .term-window-name'),'SETTINGS');
 assert.deepEqual(await page.$$eval('.switchboard-settings-nav button',b=>b.map(x=>x.dataset.hotkey)),['A','C','N','S','D','H']);
 await page.evaluate(()=>document.activeElement?.blur());await page.keyboard.press('s');assert.equal(await page.evaluate(()=>NightlinkSettings.current()),'security','S opens Security');
 if(shots)await page.screenshot({path:path.join(shots,'term-settings.png')});
 await page.evaluate(()=>NightlinkSettings.open('help'));assert.equal(await page.textContent('#term-page-title .term-window-name'),'HELP');
 assert.equal(await page.getAttribute('#term-menubar [data-term-view=Help]','aria-current'),'page');
 const firstTopic=await page.$eval('.help-topics button[aria-current=true]',b=>b.textContent);await page.evaluate(()=>document.activeElement?.blur());await page.keyboard.press('PageDown');
 assert.notEqual(await page.$eval('.help-topics button[aria-current=true]',b=>b.textContent),firstTopic,'PgDn moves to the next help topic');assert.match(await page.textContent('#term-page-keys'),/PgDn Next topic/);
 if(shots)await page.screenshot({path:path.join(shots,'term-help.png')});
 for(const [name,title] of [['Nodes','NODES'],['Network map','MAP'],['Activity','ACTIVITY'],['Direct Messages','DIRECT'],['Search','SEARCH']]){
  await page.evaluate(n=>view(n),name);assert.equal(await page.textContent('#term-page-title .term-window-name'),title,name);assert.ok(await page.isVisible('#term-page-keys'),name);
  assert.ok(await page.isHidden('.page-heading'),name);assert.ok(await page.$$eval('#term-menubar .active',b=>b.length<=1&&!b.some(x=>x.dataset.termView==='Help')),name+': Help is not marked');if(shots)await page.screenshot({path:path.join(shots,'term-page-'+title.toLowerCase()+'.png')});}
 // Empty-page art: shown on Nodes with no contacts, hidden once contacts exist; decorative only.
 await page.evaluate(()=>{live.contacts=[];view('Nodes');});assert.ok(await page.isVisible('#term-empty-art'));assert.equal(await page.getAttribute('#term-empty-art','aria-hidden'),'true');
 if(shots)await page.screenshot({path:path.join(shots,'term-nodes-empty.png')});
 await fixture(page);await page.evaluate(()=>view('Nodes'));assert.equal(await page.$('#term-empty-art'),null);
 // ANSI node map: located contacts and your radio, labelled for screen readers; updates when contacts change.
 await page.evaluate(()=>view('Network map'));
 assert.equal(await page.evaluate(()=>document.querySelector('#term-node-map').open),false,'collapsed by default so the street map keeps its height');
 await page.click('#term-node-map summary');assert.ok(await page.isVisible('#term-node-map .term-path-grid'));
 assert.match(await page.textContent('#term-node-map .term-frame-title'),/node map · 3 located of 3/);
 assert.match(await page.getAttribute('#term-node-map .term-path-grid','aria-label'),/Batesville Relay, Cedar Grove Relay, SNOMAN \(you\)/);
 const map=await page.textContent('#term-node-map .term-path-grid');assert.ok(map.includes('@')&&(map.match(/r/g)||[]).length===2,map);
 await page.evaluate(()=>{live.contacts=[];radioSession.dispatchEvent(new CustomEvent('contacts',{detail:[]}));});
 assert.match(await page.textContent('#term-node-map .term-frame-title'),/1 located of 1/);assert.equal(await page.evaluate(()=>document.querySelector('#term-node-map').open),true,'stays open after a rerender');
 await fixture(page);
 await page.evaluate(()=>view('Messages'));assert.equal(await page.$('#term-page-title'),null,'MRC has its own topic bar');
 await page.evaluate(()=>view('Overview'));assert.equal(await page.$('#term-page-title'),null,'the main menu has no window bar');assert.equal(await page.$('#term-node-map'),null);
 // Dialog windows: Device Center and Propagation Monitor open as text-mode windows with a key line; Escape closes.
 await page.evaluate(()=>showPropagationMonitor());
 assert.equal(await page.getAttribute('#dialog','data-term-window'),'Propagation Monitor');assert.ok(await page.isVisible('#dialog > .term-window-keys'));
 assert.match(await page.textContent('#dialog > .term-window-keys'),/Esc Close/);
 if(shots)await page.screenshot({path:path.join(shots,'term-propagation.png')});
 await page.keyboard.press('Escape');assert.equal(await page.evaluate(()=>document.querySelector('#dialog').open),false);
 assert.equal(await page.$('#dialog > .term-window-keys'),null);
 await page.evaluate(()=>showDeviceCenter());assert.ok(await page.evaluate(()=>document.querySelector('#dialog').classList.contains('term-window')));
 if(shots)await page.screenshot({path:path.join(shots,'term-device.png')});
 await page.keyboard.press('Escape');
 // ANSI path view: resolved hops by name, unresolved by hash, the text map plots located points with labels.
 await page.evaluate(()=>showMessageRoute({...pathMessage,observedRoute:{path:['a1','ee','cc']}}));
 const line=await page.textContent('.term-path-line');
 assert.equal(line,'KD9XYZ ──► [1] Batesville Relay ──► [2] ee ──► [3] Cedar Grove Relay ──► RX SNOMAN');
 const grid=await page.textContent('.term-path-grid');assert.match(grid,/1/);assert.match(grid,/3/);assert.match(grid,/R/);
 assert.match(await page.getAttribute('.term-path-grid','aria-label'),/3 located points: 1 Batesville Relay, 3 Cedar Grove Relay, RX SNOMAN/);
 assert.ok(/[─│╱╲]/.test(grid.replace(/^[┌└].*$/gm,'').replace(/[│]$/gm,'').replace(/^│/gm,'')),'consecutive known hops 3 → RX are connected');assert.match(grid,/┌─ N ▲/);assert.match(grid,/├─+┤ [\d.]+ k?m/);
 if(shots)await page.screenshot({path:path.join(shots,'term-path.png')});
 await page.keyboard.press('Escape');
 await page.evaluate(()=>showMessageRoute({...pathMessage,id:'count',observedRoute:null}));
 assert.match(await page.textContent('.term-path-line'),/^KD9XYZ ──► ░ .*repeaters not identified ░ ──► RX SNOMAN$/);
 await page.keyboard.press('Escape');
 await page.evaluate(()=>showMessageRoute({...pathMessage,id:'own',own:true,observedRoute:null}));
 assert.equal(await page.textContent('.term-path-line'),'SNOMAN ──► outgoing path not reported');assert.equal(await page.$('.term-path-grid'),null);
 await page.keyboard.press('Escape');
 // Cards interface: no window bars, no key lines, no ANSI path view.
 await page.evaluate(()=>NightlinkInterface.set('cards'));await page.evaluate(()=>view('Radio'));assert.equal(await page.$('#term-page-title'),null);
 await page.evaluate(()=>showMessageRoute(pathMessage));assert.equal(await page.$('.term-path'),null);assert.equal(await page.$('#dialog > .term-window-keys'),null);
 // Start-up: with the main menu script delayed, the card Overview stays hidden until the menu renders.
 {const ctx=await browser.newContext({viewport:{width:1320,height:860}});await ctx.route('**/terminal-menu.js',async r=>{await new Promise(x=>setTimeout(x,1500));await r.fallback();});await serve(ctx);
  const boot=await ctx.newPage();boot.on('pageerror',e=>errors.push('boot: '+e.message));const nav=boot.goto('http://127.0.0.1:4173');
  await boot.waitForSelector('#overview',{state:'attached'});
  assert.equal(await boot.evaluate(()=>document.documentElement.classList.contains('term-boot')),true);
  assert.equal(await boot.evaluate(()=>getComputedStyle(document.querySelector('#overview')).visibility),'hidden','card Overview is hidden while the menu loads');
  await nav;await boot.waitForFunction(()=>window.NightlinkBBS);
  assert.equal(await boot.evaluate(()=>document.documentElement.classList.contains('term-boot')),false);assert.ok(await boot.isVisible('#bbs'));
  await boot.evaluate(()=>NightlinkInterface.set('cards'));await boot.reload();await boot.waitForFunction(()=>window.NightlinkBBS);
  assert.equal(await boot.evaluate(()=>document.documentElement.classList.contains('term-boot')),false,'cards mode never hides content');assert.ok(await boot.isVisible('#overview'));
  await ctx.close();}
 // Detached DM in terminal mode: MRC-style lines, avatars hidden, outgoing marked >>>, contrast kept.
 {const dm=await context.newPage();await dm.addInitScript(()=>{localStorage.setItem('nightlink.interface','terminal');window.dmWindow={onUpdate:fn=>window.__dmUpdate=fn,contact(){},reply(){},action(){},read(){},draft(){},onFocus(){}};});await dm.goto('http://127.0.0.1:4173/dm.html');await dm.waitForFunction(()=>window.__dmUpdate);
  await dm.evaluate(()=>__dmUpdate({key:'peer',name:'KD9XYZ',connected:true,messages:[{id:'a',text:'net check',timestamp:1700000000,own:false,status:'Received',hopLabel:'2 hops'},{id:'b',text:'copy',timestamp:1700000060,own:true,status:'Acknowledged by recipient',direct:true}]}));
  await dm.waitForSelector('.dm-bubble.own');
  assert.equal(await dm.$eval('.dm-bubble .signal-message-avatar',e=>getComputedStyle(e).display),'none');
  assert.equal(await dm.$eval('.dm-bubble.own .sender>span',e=>getComputedStyle(e,'::before').content),'">>> <"');
  const c=await dm.$eval('.dm-bubble .message-reply-target',e=>[getComputedStyle(e).color,getComputedStyle(e).backgroundColor]);assert.ok(contrast(c[0],'rgb(0, 0, 0)')>=4.5);
  if(shots)await dm.screenshot({path:path.join(shots,'term-dm-lines.png')});await dm.close();}
 // Retro sound pack: off by default; when on, notification files play as synthesized square waves instead.
 {const p=await context.newPage();await p.addInitScript(()=>{localStorage.setItem('nightlink.interface','terminal');window.__osc=0;window.__wav=0;const A=window.AudioContext;window.AudioContext=class extends A{createOscillator(){window.__osc++;return super.createOscillator();}};const play=HTMLAudioElement.prototype.play;HTMLAudioElement.prototype.play=function(){window.__wav++;return Promise.resolve();};});
  await p.goto('http://127.0.0.1:4173');await p.waitForFunction(()=>window.NightlinkSoundPack);
  assert.equal(await p.evaluate(()=>NightlinkSoundPack.active()),false);
  await p.evaluate(()=>{view('Settings');});await p.selectOption('#sound-pack','retro');
  const r=await p.evaluate(async()=>{const before=window.__osc;await new Audio('sent.wav').play();return window.__osc-before;});assert.ok(r>=2,'square-wave steps played');
  await p.selectOption('#sound-pack','standard');assert.equal(await p.evaluate(()=>localStorage.getItem('nightlink.soundPack')),'standard');await p.close();}
 // Start-up screen: shown once per session outside automation, skippable, honest about the radio, off by preference.
 {const ctx=await browser.newContext({viewport:{width:1320,height:860}});await ctx.addInitScript(()=>Object.defineProperty(navigator,'webdriver',{get:()=>false}));await serve(ctx);
  const p=await ctx.newPage();p.on('pageerror',e=>errors.push('boot: '+e.message));await p.goto('http://127.0.0.1:4173');
  await p.waitForSelector('#term-boot-screen');await p.waitForFunction(()=>/not connected/.test(document.querySelector('#term-boot-screen')?.textContent||''));
  assert.match(await p.textContent('#term-boot-screen'),/Radio link \.+ not connected/);assert.doesNotMatch(await p.textContent('#term-boot-screen'),/CONNECT \d|carrier detected/i);
  await p.waitForSelector('#term-boot-screen .term-logo-svg');if(shots)await p.screenshot({path:path.join(shots,'term-boot.png')});
  await p.waitForFunction(()=>window.NightlinkBBS);await p.keyboard.press('c');await p.waitForSelector('#term-boot-screen',{state:'detached'});
  assert.equal(await p.evaluate(()=>current),'Overview','the skip key is consumed');
  await p.reload();await p.waitForFunction(()=>window.NightlinkBBS);await p.waitForTimeout(300);assert.equal(await p.$('#term-boot-screen'),null,'once per session');
  await p.evaluate(()=>view('Settings'));assert.equal(await p.isChecked('#boot-screen'),true);await p.uncheck('#boot-screen');assert.equal(await p.evaluate(()=>localStorage.getItem('nightlink.bootScreen')),'off');
  const q=await ctx.newPage();await q.emulateMedia({reducedMotion:'reduce'});await q.evaluate?.(()=>0);await q.goto('http://127.0.0.1:4173');await q.waitForFunction(()=>window.NightlinkBBS);await q.waitForTimeout(300);assert.equal(await q.$('#term-boot-screen'),null,'reduced motion or preference skips it');
  await ctx.close();}
 {const p=await context.newPage();await p.goto('http://127.0.0.1:4173');await p.waitForFunction(()=>window.NightlinkBBS);assert.equal(await p.$('#term-boot-screen'),null,'skipped under automation');await p.close();}
 assert.deepEqual(errors,[]);console.log('terminal windows browser checks passed');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1);});
