/* Optional BBS introduction. Dial-up is simulated; the separate radio line uses real state.
   Presentation only: no connections or navigation. Any key/click skips; audio is opt-in. */
(function(root){
 'use strict';
 const KEY='nightlink.bootScreen',SOUND_KEY='nightlink.bootSound';
 const enabled=s=>{try{return s?.getItem(KEY)!=='off';}catch{return true;}};
 const soundEnabled=s=>{try{return s?.getItem(SOUND_KEY)==='on';}catch{return false;}};
 const setEnabled=(s,on)=>{try{s?.setItem(KEY,on?'on':'off');}catch{}};
 const core={KEY,SOUND_KEY,enabled,setEnabled,soundEnabled};
 if(typeof module==='object'&&module.exports){module.exports=core;return;}
 const doc=root.document;root.NightlinkBootScreen=core;
 if(!root.NightlinkInterface?.isTerminal())return;
 if(typeof view==='function'){const previous=view;view=function(name){previous.apply(this,arguments);if(name!=='Settings'||!NightlinkInterface.isTerminal())return;
  const grid=doc.querySelector('.settings-grid');if(!grid||grid.querySelector('#boot-screen-setting'))return;
  const label=doc.createElement('label');label.className='accent-setting interface-setting';label.id='boot-screen-setting';
  const box=doc.createElement('input');box.type='checkbox';box.id='boot-screen';box.checked=enabled(root.localStorage);box.onchange=()=>setEnabled(root.localStorage,box.checked);
  const hint=doc.createElement('small');hint.textContent='A short BBS dial-up introduction. Any key or click skips it; reduced motion skips it automatically.';
  label.append(box,' Start-up screen',hint);const iface=grid.querySelector('.interface-setting:not(#boot-screen-setting)');if(iface)iface.after(label);else grid.prepend(label);
  const audioLabel=doc.createElement('label'),audioBox=doc.createElement('input');audioLabel.className='accent-setting interface-setting';audioBox.id='boot-sound';audioBox.type='checkbox';audioBox.checked=soundEnabled(root.localStorage);
  audioBox.onchange=()=>{try{root.localStorage.setItem(SOUND_KEY,audioBox.checked?'on':'off');}catch{}};
  const audioHint=doc.createElement('small');audioHint.textContent='Optional simulated modem tones during the introduction. Off by default; quiet hours apply.';
  audioLabel.append(audioBox,' Dial-up intro sound',audioHint);label.after(audioLabel);
 };}
 let played=false;try{played=root.sessionStorage?.getItem(KEY+'.played')==='1';}catch{}
 if(played||root.matchMedia?.('(prefers-reduced-motion: reduce)').matches||root.navigator?.webdriver||!enabled(root.localStorage))return;
 try{root.sessionStorage?.setItem(KEY+'.played','1');}catch{}
 const make=(tag,cls,text)=>{const e=doc.createElement(tag);e.className=cls;if(text)e.textContent=text;return e;};
 const screen=make('div','');screen.id='term-boot-screen';screen.setAttribute('role','region');screen.setAttribute('aria-label','Nightlink dial-up introduction');
 const frame=make('section','boot-frame'),bar=make('div','boot-bar','[■] NIGHTLINK / DIAL-UP TERMINAL');
 const note=make('p','boot-note','Simulated dial-up introduction · radio status shown separately');
 const log=make('pre','boot-log');log.setAttribute('aria-hidden','true');
 const modem=make('pre','boot-modem','┌─ LOCAL TERMINAL ─┐     ░ ░ ░     ┌─ NIGHTLINK ─┐\n└──────────────────┘               └─────────────┘');modem.setAttribute('aria-hidden','true');
 const progress=make('p','boot-progress','[░░░░░░░░░░░░░░░░] Initializing local terminal');progress.setAttribute('role','status');
 const radio=make('p','boot-radio boot-warn');radio.setAttribute('role','status');
 const logo=make('div','boot-logo'),skip=make('p','boot-skip','[any key / click] skip introduction');
 frame.append(bar,note,modem,log,progress,radio,logo,skip);screen.append(frame);
 let done=false,stopAudio=()=>{};const timers=[];
 const later=(ms,fn)=>timers.push(setTimeout(()=>{if(!done)fn();},ms));
 function line(text,cls='',typed=false){const e=make('span','boot-line '+cls);log.append(e,'\n');if(typed){[...text].forEach((c,i)=>later(i*28,()=>{e.textContent+=c;}));}else e.textContent=text;return e;}
 function radioState(){const sync=typeof live==='object'?live.sync:null,state=typeof ble==='object'?ble.state:null;
  const text=sync==='ready'?'synchronized':sync==='syncing'?'synchronizing':sync==='error'?'sync failed':state==='connected'?'connected · awaiting sync':['scanning','connecting','initializing'].includes(state)?'connecting':'not connected';
  radio.textContent='Radio link ............................ '+text;radio.className='boot-radio '+(sync==='ready'?'boot-ok':'boot-warn');}
 function playIntro(){if(!soundEnabled(root.localStorage)||(typeof quietHoursActive==='function'&&quietHoursActive()))return;
  try{const audio=new (root.AudioContext||root.webkitAudioContext)(),gain=audio.createGain();gain.gain.value=.018;gain.connect(audio.destination);const t=audio.currentTime+.03;
   const tone=(hz,at,duration,type='sine')=>{const o=audio.createOscillator();o.type=type;o.frequency.value=hz;o.connect(gain);o.start(t+at);o.stop(t+at+duration);};
   tone(350,0,.35);tone(440,0,.35);for(let i=0;i<4;i++){tone([697,770,852,941][i],.5+i*.12,.07);tone([1209,1336,1477,1209][i],.5+i*.12,.07);}
   tone(2100,1.2,.3);for(let i=0;i<12;i++)tone(i%2?2400:1200,1.65+i*.09,.07,'triangle');
   stopAudio=()=>{gain.gain.value=0;audio.close().catch(()=>{});};audio.resume().catch(()=>{});
  }catch{}}
 function finish(e){if(done)return;if(e?.type){e.preventDefault();e.stopPropagation();}done=true;timers.forEach(clearTimeout);stopAudio();
  if(typeof radioSession==='object')radioSession.removeEventListener('sync',radioState);if(typeof ble==='object')ble.removeEventListener('state',radioState);
  doc.removeEventListener('keydown',finish,true);doc.removeEventListener('pointerdown',finish,true);screen.classList.add('boot-out');setTimeout(()=>screen.remove(),180);}
 function start(){doc.body.append(screen);radioState();if(typeof radioSession==='object')radioSession.addEventListener('sync',radioState);if(typeof ble==='object')ble.addEventListener('state',radioState);
  const title=line('NIGHTLINK · MeshCore companion terminal','boot-title');
  try{root.meshlineUpdates?.info?.().then(info=>{if(info?.version&&!done)title.textContent='NIGHTLINK v'+info.version+' · MeshCore companion terminal';}).catch(()=>{});}catch{}
  later(150,()=>line('ATZ','boot-command',true));later(420,()=>line('OK','boot-ok'));later(650,()=>line('ATDT NIGHTLINK','boot-command',true));later(1150,()=>line('DIALING . . .','boot-info'));
  later(1550,()=>line('~ ▂▄▆█▆▄▂ ~  negotiating terminal display','boot-info'));later(2200,()=>line('ANSI / VGA 16-COLOR','boot-info'));later(2750,()=>line('LOCAL TERMINAL READY','boot-ok'));
  for(let i=1;i<=16;i++)later(150+i*170,()=>{progress.textContent='['+'▓'.repeat(i)+'░'.repeat(16-i)+'] '+(i<7?'Dial-up introduction':i<14?'Terminal handshake':'Local console ready');modem.textContent='┌─ LOCAL TERMINAL ─┐  '+(i%2?'░▒▓══════▓▒░':'▓▒░══════░▒▓')+'  ┌─ NIGHTLINK ─┐\n└──────────────────┘                 └─────────────┘';});
  later(2800,()=>{if(root.NightlinkTerminalLogo)logo.append(NightlinkTerminalLogo.logo(doc,'Nightlink'));});later(4100,()=>finish());playIntro();
  doc.addEventListener('keydown',finish,true);doc.addEventListener('pointerdown',finish,true);}
 if(doc.body)start();else doc.addEventListener('DOMContentLoaded',start);
})(typeof window==='object'?window:globalThis);
