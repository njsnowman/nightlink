/* Terminal start-up screen (#131): a short BBS-style boot log, then the logo, then the main menu.
   Presentation only. Every line states something true at start-up: no radio is connected yet, so the log does not
   claim a carrier. Skipped on any key or pointer press, when reduced motion is set, under automation
   (navigator.webdriver), when the preference is off, and after it has played once in this session. */
(function(root){
 'use strict';
 const KEY='nightlink.bootScreen';
 const enabled=storage=>{try{return storage?.getItem(KEY)!=='off';}catch{return true;}};
 const setEnabled=(storage,on)=>{try{storage?.setItem(KEY,on?'on':'off');}catch{}};
 const core={KEY,enabled,setEnabled};
 if(typeof module==='object'&&module.exports){module.exports=core;return;}
 const doc=root.document;
 root.NightlinkBootScreen=core;
 if(!root.NightlinkInterface?.isTerminal())return;
 // Settings switch, next to the Interface selector.
 if(typeof view==='function'){const previous=view;view=function(name){previous.apply(this,arguments);if(name!=='Settings'||!NightlinkInterface.isTerminal())return;
  const grid=doc.querySelector('.settings-grid');if(!grid||grid.querySelector('#boot-screen-setting'))return;
  const label=doc.createElement('label');label.className='accent-setting interface-setting';label.id='boot-screen-setting';
  const box=doc.createElement('input');box.type='checkbox';box.id='boot-screen';box.checked=enabled(root.localStorage);box.onchange=()=>setEnabled(root.localStorage,box.checked);
  const hint=doc.createElement('small');hint.textContent='Shows a two-second BBS start-up log before the main menu. Any key skips it.';
  label.append(box,' Start-up screen',hint);const iface=grid.querySelector('.interface-setting:not(#boot-screen-setting)');if(iface)iface.after(label);else grid.prepend(label);};}
 let played=false;try{played=root.sessionStorage?.getItem(KEY+'.played')==='1';}catch{}
 const reduced=root.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
 if(played||reduced||root.navigator?.webdriver||!enabled(root.localStorage))return;
 try{root.sessionStorage?.setItem(KEY+'.played','1');}catch{}
 const LINES=[
  ['NIGHTLINK · MeshCore companion terminal','boot-title'],
  ['(c) Nightlink contributors · VGA 80x25 · 16 colors',''],
  ['',''],
  ['Loading terminal interface ............ ','','OK'],
  ['Opening local message history ......... ','','OK'],
  ['Contacts and channels ................. ','','local'],
  ['Radio link ............................ ','','not connected'],
  ['',''],
  ['ATZ',''],['OK','boot-ok'],
  ['Handing off to the main menu · press any key',''],
 ];
 const screen=doc.createElement('div');screen.id='term-boot-screen';screen.setAttribute('role','status');screen.setAttribute('aria-label','Start-up');
 const log=doc.createElement('pre');log.className='boot-log';screen.append(log);
 const logoBox=doc.createElement('div');logoBox.className='boot-logo';screen.append(logoBox);
 const skip=doc.createElement('p');skip.className='boot-skip';skip.textContent='[any key] skip';screen.append(skip);
 let done=false,installed='';const timers=[];
 // The key or click that skips the screen is consumed so it does not also trigger a menu hotkey.
 function finish(e){if(done)return;if(e&&e.type){e.preventDefault();e.stopPropagation();}done=true;timers.forEach(clearTimeout);screen.classList.add('boot-out');setTimeout(()=>screen.remove(),180);
  doc.removeEventListener('keydown',finish,true);doc.removeEventListener('pointerdown',finish,true);}
 function start(){
  doc.body.append(screen);
  // Installed version from the desktop shell; the web preview has none, so no number is shown there.
  const titled=v=>'NIGHTLINK v'+v+' · MeshCore companion terminal';
  try{root.meshlineUpdates?.info?.().then(info=>{if(!info?.version)return;installed=info.version;const t=log.querySelector('.boot-title');if(t)t.textContent=titled(installed);}).catch(()=>{});}catch{}
  LINES.forEach(([text,cls,tail],i)=>timers.push(setTimeout(()=>{const line=doc.createElement('span');line.className='boot-line '+(cls||'');line.textContent=cls==='boot-title'&&installed?'NIGHTLINK v'+installed+' · MeshCore companion terminal':text;
   if(tail){const t=doc.createElement('span');t.className=tail==='OK'?'boot-ok':tail==='not connected'?'boot-warn':'boot-info';t.textContent=tail;line.append(t);}log.append(line,'\n');},90*i)));
  timers.push(setTimeout(()=>{if(root.NightlinkTerminalLogo)logoBox.append(NightlinkTerminalLogo.logo(doc,'Nightlink'));},90*LINES.length));
  timers.push(setTimeout(finish,90*LINES.length+900));
  doc.addEventListener('keydown',finish,true);doc.addEventListener('pointerdown',finish,true);
 }
 if(doc.body)start();else doc.addEventListener('DOMContentLoaded',start);
})(typeof window==='object'?window:globalThis);
