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
 await page.evaluate(()=>NightlinkSettings.open('help'));assert.equal(await page.textContent('#term-page-title .term-window-name'),'HELP');
 assert.equal(await page.getAttribute('#term-menubar [data-term-view=Help]','aria-current'),'page');
 if(shots)await page.screenshot({path:path.join(shots,'term-help.png')});
 for(const [name,title] of [['Nodes','NODES'],['Network map','MAP'],['Activity','ACTIVITY'],['Direct Messages','DIRECT'],['Search','SEARCH']]){
  await page.evaluate(n=>view(n),name);assert.equal(await page.textContent('#term-page-title .term-window-name'),title,name);assert.ok(await page.isVisible('#term-page-keys'),name);
  assert.ok(await page.isHidden('.page-heading'),name);assert.ok(await page.$$eval('#term-menubar .active',b=>b.length<=1&&!b.some(x=>x.dataset.termView==='Help')),name+': Help is not marked');if(shots)await page.screenshot({path:path.join(shots,'term-page-'+title.toLowerCase()+'.png')});}
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
 assert.ok(grid.includes('█'),'consecutive known hops 3 → RX are connected');
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
 assert.deepEqual(errors,[]);console.log('terminal windows browser checks passed');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1);});
