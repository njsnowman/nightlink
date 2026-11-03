/* Terminal interface (#131): default on a fresh profile, Settings switch, MRC, main menu hotkeys, focus, contrast, fit.
   Synthetic radio state only; radio commands are blocked and sends are captured before they reach delivery. */
const {chromium}=require(process.env.NIGHTLINK_PLAYWRIGHT||'playwright'),fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict');
const shots=process.env.NIGHTLINK_SCREENSHOTS;
function contrast(a,b){const lum=c=>{const v=c.match(/[\d.]+/g).slice(0,3).map(Number).map(x=>{x/=255;return x<=.03928?x/12.92:((x+.055)/1.055)**2.4;});return .2126*v[0]+.7152*v[1]+.0722*v[2];};const [x,y]=[lum(a),lum(b)].sort((p,q)=>q-p);return (x+.05)/(y+.05);}
async function serve(context){await context.route('**/*',async route=>{const u=new URL(route.request().url());if(u.origin!=='http://127.0.0.1:4173')return route.abort();const file=u.pathname==='/'?'index.html':u.pathname.slice(1);try{await route.fulfill({body:await fs.readFile(path.join(__dirname,file)),contentType:file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':file.endsWith('.svg')?'image/svg+xml':'text/html'});}catch{await route.fulfill({status:404,body:''});}});}
async function fixture(page){await page.evaluate(async()=>{if(window.cardsReady)await cardsReady;radioSession.request=ble.command=async()=>{throw Error('blocked in test');};
 const now=Math.floor(Date.now()/1000);
 live.identity={key:'dd'.repeat(32),name:'SNOMAN',frequency:910.525,txPower:22,model:'Synthetic',version:'1.9.2'};radioSession.identity=live.identity;radioSession.ready=true;ble.state='connected';live.sync='ready';live.sending=false;live.battery={millivolts:4020};live.stats={snr:11.5};
 live.channels=[{slot:0,id:'a'.repeat(24),name:'field-ops'},{slot:1,id:'b'.repeat(24),name:'public'}];
 live.contacts=[{key:'a1b2c3d4'+'0'.repeat(56),name:'KD9XYZ',type:1,snr:8.2,lastAdvert:now-600,pathLength:2},{key:'77e0f19a'+'1'.repeat(56),name:'W9ABC-RPT',type:2,snr:11,lastAdvert:now-300,pathLength:0}];
 const ch={kind:'channel',...live.channels[0]},cid=conversationId(ch);
 live.messages=[{id:'t1',conversation:cid,target:ch,kind:'channel',timestamp:now-120,sender:'KD9XYZ',text:'net check tonight',status:'Received',snr:8.2,pathLength:2},{id:'t2',conversation:cid,target:ch,kind:'channel',timestamp:now-60,own:true,text:'copy, 5/9',status:'Broadcast accepted by radio',phase:'broadcast'}];
 live.selected={...ch};window.__sent=[];sendUIMessage=async(target,text,clear)=>{window.__sent.push({target,text});clear();};renderChannels();renderStats();});}
(async()=>{const browser=await chromium.launch({headless:true,...(process.env.NIGHTLINK_BROWSER?{executablePath:process.env.NIGHTLINK_BROWSER}:{})});try{
 const context=await browser.newContext({viewport:{width:1320,height:860}}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await serve(context);
 await page.goto('http://127.0.0.1:4173');await page.waitForFunction(()=>typeof view==='function'&&window.NightlinkBBS);
 // Fresh profile: terminal is the default, the main menu replaces the card overview.
 assert.equal(await page.evaluate(()=>document.documentElement.dataset.interface),'terminal');
 assert.equal(await page.evaluate(()=>localStorage.getItem('nightlink.interface')),null,'default is not written until chosen');
 assert.ok(await page.isVisible('#bbs'));assert.ok(await page.isVisible('#term-menubar'));assert.ok(await page.isVisible('#term-fkeys'));
 assert.ok(await page.isHidden('aside'));assert.ok(await page.isHidden('#overview'));
 assert.ok(await page.$('#bbs svg.term-logo-svg rect'),'logo SVG is rendered');
 assert.match(await page.evaluate(()=>getComputedStyle(document.body).fontFamily),/Cascadia Mono/);
 await fixture(page);await page.evaluate(()=>view('Overview'));
 // Hotkeys from the menu navigate when no text field has focus.
 await page.evaluate(()=>document.activeElement?.blur());
 await page.keyboard.press('r');assert.equal(await page.evaluate(()=>current),'Radio');
 await page.evaluate(()=>view('Overview'));await page.keyboard.press('n');assert.equal(await page.evaluate(()=>current),'Nodes');
 await page.evaluate(()=>view('Overview'));await page.keyboard.press('Shift+C');assert.equal(await page.evaluate(()=>current),'Messages');
 await page.evaluate(()=>view('Overview'));
 await page.evaluate(()=>{const i=document.createElement('input');i.id='probe-input';document.querySelector('#bbs').append(i);i.focus();});await page.keyboard.press('r');
 assert.equal(await page.evaluate(()=>current),'Overview','hotkeys are ignored while a text field has focus');
 await page.evaluate(()=>document.querySelector('#probe-input').remove());
 await page.click('[data-bbs-key="S"]');assert.equal(await page.evaluate(()=>current),'Settings');
 await page.evaluate(()=>view('Overview'));await page.fill('#bbs-command','m');assert.equal(await page.evaluate(()=>current),'Network map');
 await page.keyboard.press('F9');assert.equal(await page.evaluate(()=>current),'Overview');
 if(shots)await page.screenshot({path:path.join(shots,'term-menu.png')});
 // Focus is visible on menu items.
 await page.focus('[data-bbs-key="C"]');const outline=await page.evaluate(()=>{const s=getComputedStyle(document.activeElement);return [s.outlineStyle,s.outlineWidth,s.outlineColor];});
 await page.keyboard.press('Tab');await page.keyboard.press('Shift+Tab');
 const focus=await page.evaluate(()=>{const s=getComputedStyle(document.activeElement);return {style:s.outlineStyle,width:parseFloat(s.outlineWidth),key:document.activeElement.dataset.bbsKey};});
 assert.equal(focus.key,'C');assert.notEqual(focus.style,'none');assert.ok(focus.width>=2,JSON.stringify(outline));
 // MRC: scrollback with HH:MM timestamps and <nick>, own messages, delivery lines, windows and nodes.
 await page.evaluate(()=>view('Messages'));
 assert.ok(await page.isVisible('#mrc'));assert.ok(await page.isHidden('.conversation'));
 const readability=await page.evaluate(()=>{
  const body=document.querySelector('[data-message-id="t1"] .mrc-text'),hop=document.querySelector('.mrc-hop');
  const textStyle=getComputedStyle(body),hopStyle=getComputedStyle(hop);
  return {text:textStyle.color,weight:Number(textStyle.fontWeight),hop:hop.textContent,hopColor:hopStyle.color,hopBackground:hopStyle.backgroundColor,border:hopStyle.borderTopWidth};
 });
 assert.equal(readability.text,'rgb(255, 255, 255)');assert.ok(readability.weight>=600);
 assert.equal(readability.hop,'2 hops');assert.equal(readability.border,'1px');
 assert.ok(contrast(readability.hopColor,readability.hopBackground)>=4.5,'hop count remains readable on its blue field');
 const lines=await page.$$eval('#mrc-log .mrc-line',l=>l.map(x=>x.textContent));
 assert.ok(lines.some(l=>/^\d\d:\d\d <KD9XYZ> net check tonight$/.test(l)),lines.join('\n'));
 assert.ok(lines.some(l=>/^\d\d:\d\d >>> <SNOMAN> copy, 5\/9$/.test(l)),lines.join('\n'));
 assert.match(await page.textContent('.mrc-topic'),/MRC Mesh Relay Chat │ #field-ops/);
 assert.deepEqual(await page.$$eval('.mrc-window',b=>b.map(x=>x.textContent.trim())),['1 (status)','2 #field-ops','3 #public']);
 assert.match(await page.textContent('.mrc-nodes'),/@SNOMAN[\s\S]*\+W9ABC-RPT[\s\S]*KD9XYZ/);
 assert.match(await page.textContent('.mrc-statusbar'),/\[\d\d:\d\d\] \[SNOMAN\] \[2:#field-ops\] \[Act: .*\] \[BLE ok\] .*\[bytes 0\/133\]/);
 assert.equal(await page.textContent('.mrc-prompt'),'[#field-ops] ');
 // Delivery line opens the existing message path map for that message.
 const delivery=await page.$$eval('.mrc-delivery',b=>b.map(x=>[x.textContent,x.getAttribute('aria-label')]));
 assert.ok(delivery.some(([t])=>/└─ ✓ Broadcast accepted by radio/.test(t)),JSON.stringify(delivery));assert.ok(delivery.every(([,a])=>/^View message path on map/.test(a)));
 await page.click('.mrc-delivery >> nth=0');await page.waitForSelector('#dialog[open]');
 assert.equal(await page.textContent('#dialog-title'),'Message path');assert.ok(await page.$('#message-route-map'));
 if(shots){await page.waitForTimeout(300);await page.screenshot({path:path.join(shots,'term-map-path.png')});}
 await page.evaluate(()=>document.querySelector('#dialog').close());
 // Input line: plain text, byte counter, /join, /msg, /me, /help, unknown command.
 await page.fill('#mrc-input','hello mesh');assert.equal(await page.textContent('.mrc-bytes'),'10');
 await page.press('#mrc-input','Enter');
 let sent=await page.evaluate(()=>window.__sent);assert.equal(sent.at(-1).text,'hello mesh');assert.equal(sent.at(-1).target.name,'field-ops');assert.equal(await page.inputValue('#mrc-input'),'');
 await page.fill('#mrc-input','/join #public');await page.press('#mrc-input','Enter');
 assert.equal(await page.evaluate(()=>live.selected.name),'public');assert.equal(await page.textContent('.mrc-prompt'),'[#public] ');
 await page.fill('#mrc-input','/msg kd9xyz bringing the yagi');await page.press('#mrc-input','Enter');
 sent=await page.evaluate(()=>window.__sent);assert.equal(sent.at(-1).text,'bringing the yagi');assert.equal(sent.at(-1).target.kind,'direct');assert.equal(sent.at(-1).target.name,'KD9XYZ');
 assert.equal(await page.textContent('.mrc-prompt'),'[=KD9XYZ] ');
 await page.fill('#mrc-input','/me waves');await page.press('#mrc-input','Enter');
 sent=await page.evaluate(()=>window.__sent);assert.equal(sent.at(-1).text,'* SNOMAN waves');
 await page.fill('#mrc-input','/help');await page.press('#mrc-input','Enter');assert.match(await page.textContent('#mrc-log'),/\/join #channel[\s\S]*\/msg <name> <text>/);
 await page.fill('#mrc-input','/join #nowhere');await page.press('#mrc-input','Enter');assert.match(await page.textContent('#mrc-log'),/No channel #nowhere/);
 await page.fill('#mrc-input','/msg nobody hi');await page.press('#mrc-input','Enter');assert.match(await page.textContent('#mrc-log'),/No unique saved contact/);
 assert.equal((await page.evaluate(()=>window.__sent)).length,3,'failed commands send nothing');
 // Alt+number switches windows; the status window lists adverts from contact data.
 await page.keyboard.press('Alt+2');assert.equal(await page.evaluate(()=>live.selected.name),'field-ops');
 await page.keyboard.press('Alt+1');assert.match(await page.textContent('#mrc-log'),/-!- KD9XYZ \[a1b2c3d4@[^\]]+\] has joined/);
 await page.fill('#mrc-input','status text');await page.press('#mrc-input','Enter');assert.match(await page.textContent('#mrc-log'),/not a chat window/);
 await page.keyboard.press('Alt+2');
 // Unread count appears in the window list for a channel with new traffic.
 await page.evaluate(()=>{const c={kind:'channel',...live.channels[1]};live.messages.push({id:'t9',conversation:conversationId(c),target:c,kind:'channel',timestamp:Math.floor(Date.now()/1000),sender:'W9ABC',text:'new on public',status:'Received'});renderMessages();});
 if(shots)await page.screenshot({path:path.join(shots,'term-mrc.png')});
 // Contrast of the main text pairs.
 const pairs=await page.evaluate(()=>{const c=s=>{const e=document.querySelector(s);return e&&getComputedStyle(e).color;},bg=s=>{let e=document.querySelector(s);while(e){const b=getComputedStyle(e).backgroundColor;if(b!=='rgba(0, 0, 0, 0)')return b;e=e.parentElement;}return 'rgb(0, 0, 0)';};
  return [['body',c('body'),bg('body')],['nick',c('.mrc-nick-peer'),bg('#mrc-log')],['text',c('.mrc-text'),bg('#mrc-log')],['time',c('.mrc-time'),bg('#mrc-log')],['own',c('.mrc-own .mrc-text'),bg('#mrc-log')],['delivery',c('.mrc-delivery'),bg('#mrc-log')],['topic',c('.mrc-topic'),bg('.mrc-topic')],['status',c('.mrc-statusbar'),bg('.mrc-statusbar')],['active window',c('.mrc-window.active'),bg('.mrc-window.active')],['menu bar',c('#term-menubar button:not(.active)'),bg('#term-menubar')],['menu active',c('#term-menubar button.active'),bg('#term-menubar button.active')],['fkeys',c('#term-fkeys button'),bg('#term-fkeys')],['prompt',c('.mrc-prompt'),bg('.mrc-input-line')],['input',c('#mrc-input'),bg('#mrc-input')]];});
 for(const [name,fg,b] of pairs)assert.ok(contrast(fg,b)>=4.5,`${name}: ${fg} on ${b} = ${contrast(fg,b).toFixed(2)}`);
 await page.evaluate(()=>view('Overview'));
 const menuPairs=await page.evaluate(()=>['.bbs-item-label','.bbs-item-desc','.term-hotkey-key','.term-kv dt','.term-kv dd','.term-frame-title'].map(s=>[s,getComputedStyle(document.querySelector(s)).color]));
 for(const [name,fg] of menuPairs)assert.ok(contrast(fg,'rgb(0, 0, 0)')>=4.5,`${name}: ${fg}`);
 // Fit: no horizontal page scroll; chat input and status bar inside the window at both sizes.
 for(const [w,h] of [[760,560],[1320,860]]){await page.setViewportSize({width:w,height:h});
  for(const name of ['Overview','Messages','Radio','Settings']){await page.evaluate(n=>view(n),name);await page.waitForTimeout(50);
   const fit=await page.evaluate(()=>({sw:document.documentElement.scrollWidth,iw:innerWidth,bar:document.querySelector('#term-fkeys').getBoundingClientRect().bottom,ih:innerHeight,input:document.querySelector('#mrc-input')?.getBoundingClientRect().bottom,status:document.querySelector('.mrc-statusbar')?.getBoundingClientRect().bottom,fkeysTop:document.querySelector('#term-fkeys').getBoundingClientRect().top}));
   assert.ok(fit.sw<=fit.iw,`${name} ${w}x${h} horizontal overflow ${fit.sw}>${fit.iw}`);assert.ok(fit.bar<=fit.ih+0.5);
   if(name==='Messages'){assert.ok(fit.input<=fit.fkeysTop+0.5,`input hidden at ${w}x${h}`);assert.ok(fit.status<=fit.fkeysTop+0.5);}}
  if(shots&&w===760){await page.evaluate(()=>view('Messages'));await page.screenshot({path:path.join(shots,'term-mrc-760.png')});await page.evaluate(()=>view('Overview'));await page.screenshot({path:path.join(shots,'term-menu-760.png')});}}
 await page.setViewportSize({width:1320,height:860});
 if(shots){await page.evaluate(()=>view('Radio'));await page.waitForTimeout(200);await page.screenshot({path:path.join(shots,'term-radio.png')});}
 // MRC extras: mention highlight, /whois, Tab completion of nicks.
 await page.evaluate(()=>{const ch={kind:'channel',...live.channels[0]};live.messages.push({id:'t9',conversation:conversationId(ch),target:ch,kind:'channel',timestamp:Math.floor(Date.now()/1000),sender:'KD9XYZ',text:'@SNOMAN are you on?',status:'Received'});view('Messages');});
 assert.equal(await page.$eval('[data-message-id="t9"]',e=>e.classList.contains('mrc-mention')),true);assert.equal(await page.$eval('[data-message-id="t1"]',e=>e.classList.contains('mrc-mention')),false);
 await page.fill('#mrc-input','/whois KD9XYZ');await page.press('#mrc-input','Enter');
 const who=await page.$$eval('#mrc-log .mrc-line',l=>l.map(x=>x.textContent).join('\n'));assert.match(who,/-!-   type    companion/);assert.match(who,/-!-   signal  SNR 8\.2 dB/);assert.match(who,/End of \/whois/);
 await page.fill('#mrc-input','kd');await page.press('#mrc-input','Tab');assert.equal(await page.inputValue('#mrc-input'),'KD9XYZ: ');
 await page.fill('#mrc-input','hi w9');await page.press('#mrc-input','Tab');assert.equal(await page.inputValue('#mrc-input'),'hi W9ABC-RPT ');await page.fill('#mrc-input','');
 // Settings: switch to Cards and back; each choice persists across reloads.
 await page.evaluate(()=>view('Settings'));
 assert.deepEqual(await page.$$eval('#interface-mode option',o=>o.map(x=>[x.value,x.textContent])),[['terminal','Terminal (default)'],['cards','Cards']]);
 assert.equal(await page.inputValue('#interface-mode'),'terminal');
 await page.selectOption('#interface-mode','cards');
 assert.equal(await page.evaluate(()=>[document.documentElement.dataset.interface,localStorage.getItem('nightlink.interface')].join()),'cards,cards');
 assert.ok(await page.isHidden('#term-menubar'));assert.ok(await page.isVisible('aside'));
 await page.reload();await page.waitForFunction(()=>typeof view==='function'&&window.NightlinkBBS);
 assert.equal(await page.evaluate(()=>document.documentElement.dataset.interface),'cards');
 assert.ok(await page.isVisible('#overview'));assert.equal(await page.$('#bbs'),null);
 await fixture(page);await page.evaluate(()=>view('Messages'));assert.equal(await page.$('#mrc'),null);assert.ok(await page.isVisible('.conversation'));
 assert.doesNotMatch(await page.evaluate(()=>getComputedStyle(document.body).fontFamily),/Cascadia Mono/);
 if(shots)await page.screenshot({path:path.join(shots,'term-cards.png')});
 await page.evaluate(()=>view('Settings'));assert.equal(await page.inputValue('#interface-mode'),'cards');
 await page.selectOption('#interface-mode','terminal');
 await page.reload();await page.waitForFunction(()=>typeof view==='function'&&window.NightlinkBBS);
 assert.equal(await page.evaluate(()=>document.documentElement.dataset.interface),'terminal');assert.ok(await page.isVisible('#bbs'));
 // Detached DM and startup lock read the same preference.
 const lock=await context.newPage();lock.on('pageerror',e=>errors.push('lock: '+e.message));await lock.addInitScript(()=>{window.nightlinkSecurity={info:async()=>({}),unlock:async()=>({ok:false}),quit(){}};});await lock.goto('http://127.0.0.1:4173/security-lock.html');
 assert.equal(await lock.evaluate(()=>document.documentElement.dataset.interface),'terminal');assert.match(await lock.evaluate(()=>getComputedStyle(document.body).fontFamily),/Cascadia Mono/);
 if(shots)await lock.screenshot({path:path.join(shots,'term-lock.png')});
 const dm=await context.newPage();dm.on('pageerror',e=>errors.push('dm: '+e.message));await dm.addInitScript(()=>{window.dmWindow={onUpdate:fn=>window.__dmUpdate=fn,contact(){},reply(){},action(){},read(){},draft(){},onFocus(){}};});await dm.goto('http://127.0.0.1:4173/dm.html');
 assert.equal(await dm.evaluate(()=>document.documentElement.dataset.interface),'terminal');
 if(shots){await dm.setViewportSize({width:760,height:560});await dm.screenshot({path:path.join(shots,'term-dm.png')});}
 await page.evaluate(()=>NightlinkInterface.set('cards'));await dm.waitForFunction(()=>document.documentElement.dataset.interface==='cards');
 assert.equal(await lock.evaluate(()=>document.documentElement.dataset.interface),'cards','storage event updates open documents');
 assert.deepEqual(errors,[]);console.log('terminal interface browser checks passed');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1);});
