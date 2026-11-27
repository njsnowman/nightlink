/* Interface preference: terminal (default, issue #131) or cards (rc.11 design). Presentation only; no radio commands.
   Loaded in the <head> of index.html, dm.html and security-lock.html so the root attribute is set before first paint. */
(function(root){
 'use strict';
 const KEY='nightlink.interface',DEFAULT='terminal',VALUES=['terminal','cards'];
 const valid=value=>VALUES.includes(value)?value:DEFAULT;
 function read(storage){try{return valid(storage?.getItem(KEY));}catch{return DEFAULT;}}
 function write(storage,value){value=valid(value);try{storage?.setItem(KEY,value);}catch{}return value;}
 const CHAT_KEY='nightlink.chat-text-size',CHAT_SIZES=['small','medium','large'];
 const validChatSize=value=>CHAT_SIZES.includes(value)?value:'medium';
 function readChatSize(storage){try{return validChatSize(storage?.getItem(CHAT_KEY));}catch{return 'medium';}}
 // Terminal display: whole-app text size and colour palette (night default, daylight, high contrast).
 const TEXT_KEY='nightlink.term-text',TEXT_SIZES=['normal','large','xlarge'],PALETTE_KEY='nightlink.term-palette',PALETTES=['night','daylight','contrast'],NICK_KEY='nightlink.term-nicks',NICKS=['single','sender'];
 const pick=(list,v)=>list.includes(v)?v:list[0];
 function readDisplay(storage){try{return {text:pick(TEXT_SIZES,storage?.getItem(TEXT_KEY)),palette:pick(PALETTES,storage?.getItem(PALETTE_KEY)),nicks:pick(NICKS,storage?.getItem(NICK_KEY))};}catch{return {text:'normal',palette:'night',nicks:'single'};}}
 const core={KEY,DEFAULT,VALUES,valid,read,write,CHAT_KEY,CHAT_SIZES,validChatSize,readChatSize,TEXT_KEY,TEXT_SIZES,PALETTE_KEY,PALETTES,readDisplay};
 if(typeof module==='object'&&module.exports){module.exports=core;return;}
 const doc=root.document;
 function apply(value){value=valid(value);doc.documentElement.dataset.interface=value;return value;}
 function set(value){value=apply(write(root.localStorage,value));root.dispatchEvent(new CustomEvent('nightlink-interface',{detail:value}));return value;}
 const active=()=>valid(doc.documentElement.dataset.interface);
 root.NightlinkInterface={...core,apply,set,current:active,isTerminal:()=>active()==='terminal'};
 apply(read(root.localStorage));
 function applyDisplay(d){doc.documentElement.dataset.termText=d.text;doc.documentElement.dataset.termPalette=d.palette;doc.documentElement.dataset.termNicks=d.nicks||'single';}
 applyDisplay(readDisplay(root.localStorage));
 root.addEventListener('storage',e=>{if(e.key===TEXT_KEY||e.key===PALETTE_KEY)applyDisplay(readDisplay(root.localStorage));});
 function applyChatSize(value){value=validChatSize(value);doc.documentElement.dataset.chatSize=value;for(const select of doc.querySelectorAll('[data-chat-text-size]'))select.value=value;return value;}
 function setChatSize(value){value=applyChatSize(value);try{root.localStorage.setItem(CHAT_KEY,value);}catch{}return value;}
 applyChatSize(readChatSize(root.localStorage));
 Object.assign(root.NightlinkInterface,{setChatSize,chatSize:()=>validChatSize(doc.documentElement.dataset.chatSize)});
 root.addEventListener('storage',e=>{if(e.key===CHAT_KEY||e.key===null)applyChatSize(readChatSize(root.localStorage));});
 // Hide the card Overview until the main menu renders (terminal-menu.js runs at the end of <body>), so the
 // card layout does not flash on start. Fallbacks: window load, then 4 s, so content can never stay hidden.
 const boot=()=>doc.documentElement.classList.remove('term-boot');
 if(active()==='terminal'&&typeof doc.documentElement.classList==='object'){doc.documentElement.classList.add('term-boot');root.addEventListener('load',()=>setTimeout(boot,0));setTimeout(boot,4000);}
 root.NightlinkInterface.bootDone=boot;
 // An embedded page (CoreScope, MeshMapper) takes focus inside its own document, so the host iframe matches no
 // :focus selector. Mark it while it holds focus so terminal.css can draw the focus ring.
 function markFrame(){for(const f of doc.querySelectorAll('iframe.term-frame-focused'))if(f!==doc.activeElement)f.classList.remove('term-frame-focused');const a=doc.activeElement;if(a&&a.tagName==='IFRAME')a.classList.add('term-frame-focused');}
 root.addEventListener('blur',()=>{markFrame();setTimeout(markFrame,0);});root.addEventListener('focus',markFrame);doc.addEventListener('focusin',markFrame);doc.addEventListener('focus',e=>{if(e.target?.tagName==='IFRAME')e.target.classList.add('term-frame-focused');},true);
 root.addEventListener('storage',e=>{if(e.key===KEY){apply(e.newValue);root.dispatchEvent(new CustomEvent('nightlink-interface',{detail:active()}));}});

 // Main window only: Settings control, terminal menu bar and function-key bar.
 doc.addEventListener('DOMContentLoaded',()=>{
  if(typeof view!=='function')return;
  const MENU=[['Overview','N','Nightlink',()=>view('Overview')],['Messages','C','Chat',()=>view('Messages')],['Nodes','O','Nodes',()=>view('Nodes')],['Network map','M','Map',()=>view('Network map')],['Activity','A','Activity',()=>view('Activity')],['Radio','R','Radio',()=>view('Radio')],['Device','D','Device',()=>typeof showDeviceCenter==='function'?showDeviceCenter():view('Radio')],['Settings','S','Settings',()=>view('Settings')],['Help','H','Help',()=>doc.querySelector('#open-help')?.click()]];
  const bar=doc.createElement('div');bar.id='term-menubar';bar.className='term-only term-menubar';bar.setAttribute('role','navigation');bar.setAttribute('aria-label','Terminal menu');
  for(const [name,key,label,run] of MENU){const b=doc.createElement('button');b.type='button';b.dataset.termView=name;const i=label.toUpperCase().indexOf(key),k=doc.createElement('span');k.className='term-key';k.textContent=label[i];b.append(label.slice(0,i),k,label.slice(i+1));b.setAttribute('aria-label',label);b.onclick=run;bar.append(b);}
  const clock=doc.createElement('span');clock.className='term-menubar-clock';bar.append(clock);
  const keys=doc.createElement('div');keys.id='term-fkeys';keys.className='term-only term-fkeys';
  for(const [k,label,run] of [['F1','Help',()=>doc.querySelector('#open-help')?.click()],['F2','Chat',()=>view('Messages')],['F9','Menu',()=>view('Overview')],['^P','Go to',()=>root.NightlinkPalette?.open()],['Esc','Back',()=>view('Overview')]]){const b=doc.createElement('button');b.type='button';const s=doc.createElement('span');s.className='term-fkey';s.textContent=k;b.append(s,' '+label);b.onclick=run;keys.append(b);}
  // One-glance status line (#227): node, unread total, battery voltage and link state. Text, not colour, carries meaning.
  const status=doc.createElement('div');status.className='term-statusline';status.setAttribute('role','status');status.setAttribute('aria-label','Radio status');
  const field=cls=>{const e=doc.createElement('span');e.className='term-status-field '+cls;return e;};
  const node=field('term-status-node'),unreadBtn=doc.createElement('button'),batt=field('term-status-battery'),noise=field('term-status-noise'),dmBtn=doc.createElement('button');
  dmBtn.type='button';dmBtn.className='term-status-field term-status-dm';dmBtn.onclick=()=>view('Direct Messages');
  unreadBtn.type='button';unreadBtn.className='term-status-field term-status-unread';unreadBtn.onclick=()=>view('Messages');
  const link=doc.createElement('span');link.className='term-fkeys-link';status.append(node,dmBtn,unreadBtn,noise,batt,link);keys.append(status);
  doc.body.prepend(bar);doc.body.append(keys);
  function tick(){const now=new Date();clock.textContent=now.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit',hour12:false});
   const state=typeof live==='object'?live.sync:'disconnected',kind=typeof ble==='object'&&ble.kind==='usb'?'USB':'BLE';link.textContent='● '+kind+' '+(state==='ready'?'ok':state==='syncing'?'sync':'off');link.dataset.state=state==='ready'?'ok':state==='syncing'?'pending':'off';
   const L=typeof live==='object'?live:null,ready=state==='ready';
   node.textContent=ready&&L?.identity?.name?L.identity.name:'';node.hidden=!node.textContent;
   let unread=0,dms=0;try{if(ready&&typeof ensureAttention==='function'){const u=ensureAttention().unread(L.messages);unread=u.length;dms=u.filter(m=>m.target?.kind==='direct'||m.kind==='direct').length;}}catch{}
   dmBtn.textContent='DM '+dms;dmBtn.hidden=!ready||!dms;dmBtn.setAttribute('aria-label',dms+' unread direct message'+(dms===1?'':'s')+', open chat');
   const nf=L?.stats?.noise;noise.textContent=ready&&Number.isFinite(nf)?'NF '+nf+' dBm':'';noise.hidden=!noise.textContent;noise.title='Noise floor reported by the radio';
   unreadBtn.textContent='✉ '+unread+' unread';unreadBtn.hidden=!ready;unreadBtn.dataset.unread=unread?'yes':'no';unreadBtn.setAttribute('aria-label',unread+' unread message'+(unread===1?'':'s')+', open chat');
   const mv=L?.battery?.millivolts;batt.textContent=ready&&mv?'BAT '+(mv/1000).toFixed(2)+' V'+(mv<3500?' LOW':''):'';batt.hidden=!batt.textContent;batt.dataset.low=mv&&mv<3500?'yes':'no';}
  tick();setInterval(tick,15000);
  root.NightlinkStatusLine={refresh:tick};
  let queued=false;const soon=()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;tick();});};
  if(typeof radioSession==='object')for(const ev of ['sync','battery','identity','message','messages','stats'])radioSession.addEventListener(ev,soon);
  if(typeof ble==='object')ble.addEventListener('state',soon);
  if(typeof renderMessages==='function'){const prev=renderMessages;renderMessages=function(){const r=prev.apply(this,arguments);soon();return r;};}
  function mark(name){for(const b of bar.querySelectorAll('[data-term-view]')){const on=b.dataset.termView===name||(b.dataset.termView==='Messages'&&name==='Direct Messages');b.classList.toggle('active',on);if(on)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');}tick();}
  const previous=view;view=function(name){previous(name);mark(name);if(name!=='Settings')return;
   const label=doc.createElement('label');label.className='accent-setting interface-setting';label.append('Interface');
   const select=doc.createElement('select');select.id='interface-mode';select.setAttribute('aria-label','Interface');
   for(const [value,title] of [['terminal','Terminal (default)'],['cards','Cards']]){const o=doc.createElement('option');o.value=value;o.textContent=title;select.append(o);}
   select.value=active();select.onchange=()=>set(select.value);label.append(select);
   const hint=doc.createElement('small');hint.textContent='Terminal uses the 16-color text interface with Mesh Relay Chat and the main menu. Cards keeps the rc.11 card layout.';label.append(hint);
   doc.querySelector('.settings-grid')?.prepend(label);
   // Text size and colour palette (terminal only; stored per profile, applied in the head of every document).
   if(active()==='terminal'){const d=readDisplay(root.localStorage);
    const make=(id,title,key,options,value,help)=>{const l=doc.createElement('label');l.className='accent-setting interface-setting';l.id=id+'-setting';l.append(title);const sel=doc.createElement('select');sel.id=id;sel.setAttribute('aria-label',title);
     for(const [v,t] of options){const o=doc.createElement('option');o.value=v;o.textContent=t;sel.append(o);}sel.value=value;
     sel.onchange=()=>{try{root.localStorage.setItem(key,sel.value);}catch{}applyDisplay(readDisplay(root.localStorage));};const h=doc.createElement('small');h.textContent=help;l.append(sel,h);return l;};
    const text=make('term-text','Text size',TEXT_KEY,[['normal','Normal'],['large','Large (115%)'],['xlarge','Extra large (130%)']],d.text,'Scales the whole terminal interface, including menus, chat and dialogs.');
    const palette=make('term-palette','Colour palette',PALETTE_KEY,[['night','Night (default)'],['daylight','Daylight'],['contrast','High contrast']],d.palette,'Daylight uses a light background for bright rooms and outdoors. High contrast shows body text in white.');
    const nicks=make('term-nicks','Nick colours',NICK_KEY,[['single','Single colour (default)'],['sender','By sender']],d.nicks,'By sender gives each chat nickname one of eight VGA colours, chosen from its name, so the same person keeps the same colour.');
    label.after(text,palette,nicks);}};
  // Function keys and Escape. Escape only acts when no dialog, menu or text field owns it.
  doc.addEventListener('keydown',e=>{if(!root.NightlinkInterface.isTerminal()||e.defaultPrevented)return;
   const typing=e.target.closest?.('input,textarea,select,[contenteditable=""],[contenteditable=true]');
   if(e.key==='F1'){e.preventDefault();doc.querySelector('#open-help')?.click();}
   else if(e.key==='F2'){e.preventDefault();view('Messages');}
   else if(e.key==='F9'){e.preventDefault();view('Overview');}
   else if(e.key==='Escape'&&!typing&&!doc.querySelector('dialog[open]')&&!doc.querySelector('[aria-expanded=true]')&&current!=='Overview'){view('Overview');}
  });
  root.addEventListener('nightlink-interface',()=>{const select=doc.querySelector('#interface-mode');if(select)select.value=active();view(current);});
  mark(typeof current==='string'?current:'Overview');
 });
})(typeof window==='object'?window:globalThis);
