/* BBS introduction: approved modem-to-laser audio gates dismissal until media ends.
   Presentation only: no connections or navigation; actual radio state is separate. */
(function(root){
 'use strict';
 const KEY='nightlink.bootScreen',SOUND_KEY='nightlink.bootSound',SOUND_FILE='startup-modem-laser.wav';
 const enabled=s=>{try{return s?.getItem(KEY)!=='off';}catch{return true;}};
 const soundEnabled=s=>{try{return s?.getItem(SOUND_KEY)!=='off';}catch{return true;}};
 const setEnabled=(s,on)=>{try{s?.setItem(KEY,on?'on':'off');}catch{}};
 const core={KEY,SOUND_KEY,SOUND_FILE,enabled,setEnabled,soundEnabled};
 if(typeof module==='object'&&module.exports){module.exports=core;return;}
 const doc=root.document;root.NightlinkBootScreen=core;
 if(typeof view==='function'){const previous=view;view=function(name){previous.apply(this,arguments);if(name!=='Settings')return;
  const grid=doc.querySelector('.settings-grid');if(!grid||grid.querySelector('#boot-screen-setting'))return;
  const label=doc.createElement('label');label.className='accent-setting interface-setting';label.id='boot-screen-setting';
  const box=doc.createElement('input');box.type='checkbox';box.id='boot-screen';box.checked=enabled(root.localStorage);box.onchange=()=>setEnabled(root.localStorage,box.checked);
  const hint=doc.createElement('small');hint.textContent='BBS introduction. The loading screen stays open until the startup sound finishes. Reduced motion uses a static screen.';
  label.append(box,' Start-up screen',hint);const iface=grid.querySelector('.interface-setting:not(#boot-screen-setting)');if(iface)iface.after(label);else grid.prepend(label);
  const audioLabel=doc.createElement('label'),audioBox=doc.createElement('input');audioLabel.className='accent-setting interface-setting';audioBox.id='boot-sound';audioBox.type='checkbox';audioBox.checked=soundEnabled(root.localStorage);
  audioBox.onchange=()=>{try{root.localStorage.setItem(SOUND_KEY,audioBox.checked?'on':'off');}catch{}};
  const audioHint=doc.createElement('small');audioHint.textContent='Modem connection transforms into a laser shot. On by default; explicit sound-off and quiet hours are respected.';
  audioLabel.append(audioBox,' Modem-to-laser startup sound',audioHint);label.after(audioLabel);
 };}
 let played=false;try{played=root.sessionStorage?.getItem(KEY+'.played')==='1';}catch{}
 const reduced=root.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
 if(played||root.navigator?.webdriver||!enabled(root.localStorage))return;
 try{root.sessionStorage?.setItem(KEY+'.played','1');}catch{}
 const make=(tag,cls,text)=>{const e=doc.createElement(tag);e.className=cls;if(text)e.textContent=text;return e;};
 const screen=make('div','');screen.id='term-boot-screen';screen.setAttribute('role','region');screen.setAttribute('aria-label','Nightlink dial-up introduction');
 const frame=make('section','boot-frame'),bar=make('div','boot-bar','[■] NIGHTLINK / DIAL-UP TERMINAL');
 const note=make('p','boot-note','Simulated dial-up introduction · radio status shown separately');
 const log=make('pre','boot-log');log.setAttribute('aria-hidden','true');
 const modem=make('pre','boot-modem','┌─ LOCAL TERMINAL ─┐     ░ ░ ░     ┌─ NIGHTLINK ─┐\n└──────────────────┘               └─────────────┘');modem.setAttribute('aria-hidden','true');
 const progress=make('p','boot-progress','[░░░░░░░░░░░░░░░░] Initializing local terminal');progress.setAttribute('role','status');
 const radio=make('p','boot-radio boot-warn');radio.setAttribute('role','status');
 const logo=make('div','boot-logo'),skip=make('p','boot-skip','Loading startup sound…');
 frame.append(bar,note,modem,log,progress,radio,logo,skip);screen.append(frame);
 let done=false,audio=null,audioDone=true,visualDone=false,requestedSkip=false,awaitingGesture=false,watchdog=null;
 const timers=[];
 const later=(ms,fn)=>timers.push(setTimeout(()=>{if(!done)fn();},ms));
 function line(text,cls='',typed=false){const e=make('span','boot-line '+cls);log.append(e,'\n');if(typed){[...text].forEach((c,i)=>later(i*28,()=>{e.textContent+=c;}));}else e.textContent=text;return e;}
 function radioState(){const sync=typeof live==='object'?live.sync:null,state=typeof ble==='object'?ble.state:null;
  const text=sync==='ready'?'synchronized':sync==='syncing'?'synchronizing':sync==='error'?'sync failed':state==='connected'?'connected · awaiting sync':['scanning','connecting','initializing'].includes(state)?'connecting':'not connected';
  radio.textContent='Radio link ............................ '+text;radio.className='boot-radio '+(sync==='ready'?'boot-ok':'boot-warn');}
 function completeAudio(failed=false){if(done||audioDone)return;audioDone=true;clearInterval(watchdog);if(failed){audio?.pause();skip.textContent='Startup sound unavailable · continuing locally';}finish();}
 function attemptPlay(){
  if(done||audioDone||!audio)return;awaitingGesture=false;
  const rejected=error=>{if(done||audioDone)return;if(error?.name==='NotAllowedError'){awaitingGesture=true;skip.textContent='[click / any key] play startup sound';}else completeAudio(true);};
  try{Promise.resolve(audio.play()).catch(rejected);}catch(error){rejected(error);}
 }
 function playIntro(){
  if(!soundEnabled(root.localStorage)||(typeof quietHoursActive==='function'&&quietHoursActive())){skip.textContent='Sound muted · [any key / click] skip introduction';return;}
  audioDone=false;
  try{audio=new root.Audio(SOUND_FILE);audio.preload='auto';
   audio.addEventListener('ended',()=>completeAudio());audio.addEventListener('error',()=>completeAudio(true));
   audio.addEventListener('playing',()=>{awaitingGesture=false;skip.textContent='Playing modem → laser · waiting for sound to finish';});
   audio.addEventListener('pause',()=>{if(!done&&!audioDone&&!audio.ended){awaitingGesture=true;skip.textContent='[click / any key] resume startup sound';}});
   let lastTime=0,lastProgress=performance.now();
   watchdog=setInterval(()=>{if(done||audioDone)return;const now=performance.now();if(awaitingGesture){lastProgress=now;return;}if(audio.currentTime>lastTime){lastTime=audio.currentTime;lastProgress=now;}else if(now-lastProgress>10000)completeAudio(true);},1000);
   attemptPlay();
  }catch{completeAudio(true);}
 }
 function input(e){if(done)return;e.preventDefault();e.stopPropagation();requestedSkip=true;
  if(!audioDone){if(awaitingGesture)attemptPlay();else skip.textContent='Finishing startup sound…';return;}finish();}
 function finish(){if(done||!audioDone||(!visualDone&&!requestedSkip))return;done=true;timers.forEach(clearTimeout);clearInterval(watchdog);audio?.pause();
  if(typeof radioSession==='object')radioSession.removeEventListener('sync',radioState);if(typeof ble==='object')ble.removeEventListener('state',radioState);
  doc.removeEventListener('keydown',input,true);doc.removeEventListener('pointerdown',input,true);screen.classList.add('boot-out');setTimeout(()=>screen.remove(),reduced?0:180);}
 function start(){doc.body.append(screen);radioState();if(typeof radioSession==='object')radioSession.addEventListener('sync',radioState);if(typeof ble==='object')ble.addEventListener('state',radioState);
  const title=line('NIGHTLINK · MeshCore companion terminal','boot-title');
  try{root.meshlineUpdates?.info?.().then(info=>{if(info?.version&&!done)title.textContent='NIGHTLINK v'+info.version+' · MeshCore companion terminal';}).catch(()=>{});}catch{}
  if(reduced){line('LOCAL TERMINAL · MODEM → LASER','boot-info');if(root.NightlinkTerminalLogo)logo.append(NightlinkTerminalLogo.logo(doc,'Nightlink'));progress.textContent='Local console ready';visualDone=true;}
  else{
  later(150,()=>line('ATZ','boot-command',true));later(420,()=>line('OK','boot-ok'));later(650,()=>line('ATDT NIGHTLINK','boot-command',true));later(1150,()=>line('DIALING . . .','boot-info'));
  later(1550,()=>line('~ ▂▄▆█▆▄▂ ~  negotiating terminal display','boot-info'));later(2200,()=>line('ANSI / VGA 16-COLOR','boot-info'));later(2750,()=>line('LOCAL TERMINAL READY','boot-ok'));
  for(let i=1;i<=16;i++)later(150+i*170,()=>{progress.textContent='['+'▓'.repeat(i)+'░'.repeat(16-i)+'] '+(i<7?'Dial-up introduction':i<14?'Terminal handshake':'Local console ready');modem.textContent='┌─ LOCAL TERMINAL ─┐  '+(i%2?'░▒▓══════▓▒░':'▓▒░══════░▒▓')+'  ┌─ NIGHTLINK ─┐\n└──────────────────┘                 └─────────────┘';});
  later(2800,()=>{if(root.NightlinkTerminalLogo)logo.append(NightlinkTerminalLogo.logo(doc,'Nightlink'));});later(4100,()=>{visualDone=true;finish();});}
  doc.addEventListener('keydown',input,true);doc.addEventListener('pointerdown',input,true);playIntro();finish();}
 if(doc.body)start();else doc.addEventListener('DOMContentLoaded',start);
})(typeof window==='object'?window:globalThis);
