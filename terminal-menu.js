/* BBS main menu: the Overview page in the terminal interface. Hotkeys map to existing views and tools.
   Values come from live state already held by the app; rendering never issues radio commands. */
(function(){
 'use strict';
 if(typeof view!=='function'||!window.NightlinkInterface)return;
 const doc=document;
 const el=(tag,cls,text)=>{const n=doc.createElement(tag);if(cls)n.className=cls;if(text!=null)n.textContent=text;return n;};
 const hhmm=t=>{const d=new Date(t*1000);return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');};
 const unreadTotal=()=>{try{return typeof ensureAttention==='function'?ensureAttention().unread(live.messages).length:0;}catch{return 0;}};
 function openRxLog(){view('Radio');const tab=[...doc.querySelectorAll('.radio-workbench-tabs button')].find(b=>/rx/i.test(b.textContent));if(tab)tab.click();}
 function openBackup(){view('Settings');doc.querySelector('.backup-settings')?.scrollIntoView({block:'start'});}
 const ITEMS=[
  ['C','Chat',()=>'MRC · Mesh Relay Chat'+(unreadTotal()?' · '+unreadTotal()+' new':''),()=>view('Messages')],
  ['N','Nodes',()=>'who is on the mesh · '+live.contacts.length,()=>view('Nodes')],
  ['M','Map',()=>'network map, message paths',()=>view('Network map')],
  ['A','Activity',()=>'local event log',()=>view('Activity')],
  ['B','Backup',()=>'export / restore',openBackup],
  ['?','Help',()=>'guide, about',()=>doc.querySelector('#open-help')?.click()],
  ['R','Radio',()=>'status, tools, counters',()=>view('Radio')],
  ['D','Device Center',()=>'config, remote admin',()=>typeof showDeviceCenter==='function'?showDeviceCenter():view('Radio')],
  ['P','Propagation',()=>'RF monitor, baseline',()=>typeof showPropagationMonitor==='function'?showPropagationMonitor():view('Radio')],
  ['L','RX Log',()=>'raw receive log',openRxLog],
  ['S','Settings',()=>'interface, sounds, lock',()=>view('Settings')]
 ];
 const KEYS=ITEMS.map(i=>i[0]);
 function run(key){const item=ITEMS.find(i=>i[0]===String(key).toUpperCase());if(!item)return false;item[3]();return true;}
 function frame(title,cls){const f=el('section','term-frame '+(cls||''));const h=el('h2','term-frame-title',title);f.append(h);f.setAttribute('aria-label',title);return f;}
 function kv(list,rows){for(const [k,v,cls] of rows){const dt=el('dt',null,k),dd=el('dd',cls||null);if(v instanceof Node)dd.append(v);else dd.textContent=v;list.append(dt,dd);}}
 function rfState(){try{const s=window.NightlinkPropagationUI?.monitor?.summary?.();if(!s||s.state==='unavailable'||s.state==='disabled')return null;return s;}catch{return null;}}
 function meter(fraction,cls){const s=el('span','term-meter '+cls);const n=Math.max(0,Math.min(10,Math.round(fraction*10)));s.append(el('span','term-meter-fill','█'.repeat(n)),el('span','term-meter-empty','░'.repeat(10-n)));return s;}
 function render(){
  const content=doc.querySelector('main .content');if(!content)return;
  const on=NightlinkInterface.isTerminal()&&current==='Overview';
  doc.body.classList.toggle('term-bbs',on);
  let root=doc.querySelector('#bbs');
  if(!on){root?.remove();NightlinkInterface.bootDone?.();return;}
  if(!root){root=el('section','bbs');root.id='bbs';root.setAttribute('aria-label','Main menu');}
  const focusKey=doc.activeElement?.dataset?.bbsKey;
  root.replaceChildren();
  // Logo and node status
  const top=el('div','bbs-top'),brand=el('div','bbs-brand');
  if(window.NightlinkTerminalLogo)brand.append(NightlinkTerminalLogo.logo(doc,'Nightlink'));
  const heard=live.contacts.length;
  brand.append(el('p','bbs-tagline','── MeshCore companion terminal ── '+(live.identity?heard+' contacts on '+live.identity.name:'no radio connected')+' ──'));
  const node=frame('node','bbs-node'),dl=el('dl','term-kv');
  const id=live.identity,link=live.sync==='ready'?['READY','term-ok']:live.sync==='syncing'?['SYNCING','term-pending']:live.sync==='error'?['ERROR','term-bad']:['OFFLINE','term-bad'];
  const radio=el('span');radio.append(el('span',link[1],link[0]),' '+(typeof ble==='object'&&ble.kind==='usb'?'USB':'BLE')+(id?.version?' · fw '+id.version:''));
  const rf=rfState(),rfv=el('span');if(rf)rfv.append(el('span',rf.state==='normal'?'term-ok':'term-pending',String(rf.label).toUpperCase()));else rfv.append(el('span','term-dim','not monitored'));
  if(live.stats.snr!=null)rfv.append(' · SNR '+live.stats.snr+' dB');
  const batt=live.battery?(live.battery.millivolts/1000).toFixed(2)+' V':'—';
  kv(dl,[['call',id?.name||'—','term-strong'],['radio',radio],['freq',id?.frequency?id.frequency.toFixed(3)+' MHz'+(id.sf?' SF'+id.sf:''):'—'],['rf',rfv],['batt',batt],['time',new Date().toLocaleString([],{weekday:'short',day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit',hour12:false})]]);
  node.append(dl);top.append(brand,node);root.append(top);
  // The logo carries its own speed lines; no separate band under it.
  // Main menu
  const menu=frame('MAIN MENU','bbs-menu term-frame-double'),grid=el('div','bbs-menu-grid');
  for(const [key,label,desc,action] of ITEMS){const b=el('button','bbs-item');b.type='button';b.dataset.bbsKey=key;b.setAttribute('aria-keyshortcuts',key==='?'?'Shift+Slash':key);
   const hk=el('span','term-hotkey');hk.append(el('span','term-hotkey-bracket','['),el('span','term-hotkey-key',key),el('span','term-hotkey-bracket',']'));
   b.append(hk,el('span','bbs-item-label',label),el('span','bbs-item-desc',desc()));b.onclick=()=>action();grid.append(b);}
  menu.append(grid);root.append(menu);
  // Last callers and mesh today, from stored messages and contact adverts.
  const lower=el('div','bbs-lower'),callers=frame('last callers','bbs-callers'),ul=el('ul','bbs-list');
  const events=[...live.messages.filter(m=>!m.own).slice(-12).map(m=>({t:m.timestamp,name:m.sender||m.target?.name||'Mesh',kind:'msg',route:m.pathLength!=null&&window.MeshlineRoutes?MeshlineRoutes.hopSummary(m.pathLength):'',snr:m.snr})),
   ...live.contacts.filter(c=>Number.isFinite(c.lastAdvert)).map(c=>({t:c.lastAdvert,name:typeof cardName==='function'?cardName(c.key,c.name):c.name,kind:'advert',route:c.type===2?'repeater':window.MeshlineRoutes?MeshlineRoutes.contactRoute(c.pathLength):'',snr:c.snr}))].sort((a,b)=>b.t-a.t).slice(0,5);
  for(const e of events){const li=el('li','bbs-caller');li.append(el('span','term-dim',hhmm(e.t)),el('span','term-name',e.name),el('span',null,e.kind),el('span','term-dim',e.route||''),el('span',e.snr==null?'term-dim':e.snr>=5?'term-ok':e.snr>=0?'term-pending':'term-bad',e.snr==null?'':'SNR '+e.snr));ul.append(li);}
  if(!events.length)ul.append(el('li','term-dim','No messages or adverts stored yet.'));
  callers.append(ul);
  const today=frame('mesh today','bbs-today'),tl=el('dl','term-kv'),day=new Date().toDateString(),start=new Date();start.setHours(0,0,0,0);
  const msgs=live.messages.filter(m=>new Date(m.timestamp*1000).toDateString()===day).length,heardToday=live.contacts.filter(c=>c.lastAdvert*1000>=start.getTime()).length;
  const st=live.stats||{};
  kv(tl,[['nodes',heardToday+' heard today · '+live.contacts.length+' saved'],['msgs',msgs+' sent and received today'],['radio',st.packetsSent!=null?st.packetsSent+' tx · '+st.packetsReceived+' rx':'counters after sync'],['unread',String(unreadTotal()),unreadTotal()?'term-pending':null]]);
  today.append(tl);lower.append(callers,today);root.append(lower);
  // Command prompt: a single-key field; letters also work without focus when no text field is active.
  const prompt=el('form','bbs-prompt');prompt.onsubmit=e=>{e.preventDefault();const v=input.value.trim();input.value='';if(v&&!run(v[0]))toast('Unknown command '+v[0]+'.');};
  const label=el('label',null);label.htmlFor='bbs-command';label.append(el('strong',null,'Command'),el('span','term-dim',' ('+KEYS.join(',')+')'),': ');
  const input=el('input');input.id='bbs-command';input.maxLength=1;input.autocomplete='off';input.spellcheck=false;input.setAttribute('aria-label','Menu command');
  input.addEventListener('input',()=>{const v=input.value.trim();if(v){input.value='';if(!run(v))toast('Unknown command '+v+'.');}});
  prompt.append(label,input);root.append(prompt);
  if(!root.isConnected)content.prepend(root);
  NightlinkInterface.bootDone?.();
  if(focusKey)root.querySelector(`[data-bbs-key="${CSS.escape(focusKey)}"]`)?.focus();
 }
 doc.addEventListener('keydown',e=>{
  if(!NightlinkInterface.isTerminal()||current!=='Overview'||e.ctrlKey||e.altKey||e.metaKey||e.defaultPrevented)return;
  if(e.target.closest?.('input,textarea,select,[contenteditable=""],[contenteditable=true]')||doc.querySelector('dialog[open]'))return;
  if(e.key.length===1&&KEYS.includes(e.key.toUpperCase())){e.preventDefault();run(e.key);}
 });
 const previousView=view;view=function(){previousView.apply(this,arguments);render();};
 for(const type of ['sync','contacts','identity','battery','stats'])radioSession.addEventListener(type,()=>{if(current==='Overview')render();});
 window.addEventListener('nightlink-interface',render);
 window.NightlinkBBS={render,run,keys:KEYS};
 render();
})();
