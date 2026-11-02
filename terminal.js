/* Interface preference: terminal (default, issue #131) or cards (rc.11 design). Presentation only; no radio commands.
   Loaded in the <head> of index.html, dm.html and security-lock.html so the root attribute is set before first paint. */
(function(root){
 'use strict';
 const KEY='nightlink.interface',DEFAULT='terminal',VALUES=['terminal','cards'];
 const valid=value=>VALUES.includes(value)?value:DEFAULT;
 function read(storage){try{return valid(storage?.getItem(KEY));}catch{return DEFAULT;}}
 function write(storage,value){value=valid(value);try{storage?.setItem(KEY,value);}catch{}return value;}
 const core={KEY,DEFAULT,VALUES,valid,read,write};
 if(typeof module==='object'&&module.exports){module.exports=core;return;}
 const doc=root.document;
 function apply(value){value=valid(value);doc.documentElement.dataset.interface=value;return value;}
 function set(value){value=apply(write(root.localStorage,value));root.dispatchEvent(new CustomEvent('nightlink-interface',{detail:value}));return value;}
 const active=()=>valid(doc.documentElement.dataset.interface);
 root.NightlinkInterface={...core,apply,set,current:active,isTerminal:()=>active()==='terminal'};
 apply(read(root.localStorage));
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
  for(const [k,label,run] of [['F1','Help',()=>doc.querySelector('#open-help')?.click()],['F2','Chat',()=>view('Messages')],['F9','Menu',()=>view('Overview')],['Esc','Back',()=>view('Overview')]]){const b=doc.createElement('button');b.type='button';const s=doc.createElement('span');s.className='term-fkey';s.textContent=k;b.append(s,' '+label);b.onclick=run;keys.append(b);}
  const link=doc.createElement('span');link.className='term-fkeys-link';keys.append(link);
  doc.body.prepend(bar);doc.body.append(keys);
  function tick(){const now=new Date();clock.textContent=now.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit',hour12:false});
   const state=typeof live==='object'?live.sync:'disconnected',kind=typeof ble==='object'&&ble.kind==='usb'?'USB':'BLE';link.textContent='● '+kind+' '+(state==='ready'?'ok':state==='syncing'?'sync':'off');link.dataset.state=state==='ready'?'ok':state==='syncing'?'pending':'off';}
  tick();setInterval(tick,15000);
  function mark(name){for(const b of bar.querySelectorAll('[data-term-view]')){const on=b.dataset.termView===name||(b.dataset.termView==='Messages'&&name==='Direct Messages');b.classList.toggle('active',on);if(on)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');}tick();}
  const previous=view;view=function(name){previous(name);mark(name);if(name!=='Settings')return;
   const label=doc.createElement('label');label.className='accent-setting interface-setting';label.append('Interface');
   const select=doc.createElement('select');select.id='interface-mode';select.setAttribute('aria-label','Interface');
   for(const [value,title] of [['terminal','Terminal (default)'],['cards','Cards']]){const o=doc.createElement('option');o.value=value;o.textContent=title;select.append(o);}
   select.value=active();select.onchange=()=>set(select.value);label.append(select);
   const hint=doc.createElement('small');hint.textContent='Terminal uses the 16-color text interface with Mesh Relay Chat and the main menu. Cards keeps the rc.11 card layout.';label.append(hint);
   doc.querySelector('.settings-grid')?.prepend(label);};
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
