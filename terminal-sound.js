/* Retro sound pack (#131): optional synthesized PC-speaker style sounds. Off by default.
   When on, playback of the existing notification files (sent.wav, dm.wav, mention.wav) is replaced by a short
   square-wave pattern; whether a sound plays at all is still decided by the existing modules (mute, quiet hours,
   per-feature switches), because only HTMLAudioElement.play for those files is intercepted. A modem-style chirp
   plays once when the radio finishes synchronizing. Nothing is downloaded; Web Audio only. */
(function(root){
 'use strict';
 const KEY='nightlink.soundPack',VALUES=['standard','retro','modem','bells'];
 const read=storage=>{try{const v=storage?.getItem(KEY);return VALUES.includes(v)?v:'standard';}catch{return 'standard';}};
 const write=(storage,v)=>{try{storage?.setItem(KEY,VALUES.includes(v)?v:'standard');}catch{}};
 // [frequency Hz, duration s] steps; 0 Hz is a rest.
 const PATTERNS={
  sent:[[880,.05],[0,.02],[1320,.07]],
  dm:[[660,.06],[880,.06],[1320,.09]],
  mention:[[1000,.07],[0,.04],[1500,.07],[0,.04],[1000,.07],[0,.04],[1500,.09]],
  connect:[[1200,.08],[2400,.08],[1200,.06],[0,.03],[1800,.05],[2100,.05],[1800,.05],[2400,.12]]
 };
 // Additional packs reuse the same events. Modem: Bell 103/V.21-style FSK warble (1070/1270 and 2025/2225 Hz). Bells: soft triangle chimes.
 const PACKS={
  retro:{wave:'square',gain:.06,patterns:PATTERNS},
  modem:{wave:'sine',gain:.08,patterns:{
   sent:[[1270,.03],[1070,.03],[1270,.03],[1070,.04]],
   dm:[[2025,.03],[2225,.03],[2025,.03],[2225,.03],[2025,.03],[2225,.05]],
   mention:[[1070,.04],[2225,.04],[1070,.04],[2225,.04],[0,.05],[1070,.04],[2225,.04],[1070,.04],[2225,.06]],
   connect:[[2100,.22],[0,.03],[1270,.05],[1070,.05],[1270,.05],[2225,.05],[2025,.05],[2225,.08]]}},
  bells:{wave:'triangle',gain:.12,patterns:{
   sent:[[1568,.12]],
   dm:[[1319,.12],[1760,.2]],
   mention:[[1760,.1],[2093,.1],[1760,.1],[2637,.25]],
   connect:[[1047,.1],[1319,.1],[1568,.1],[2093,.26]]}}
 };
 const FILES={'sent.wav':'sent','dm.wav':'dm','mention.wav':'mention'};
 const duration=(name,pack='retro')=>(PACKS[pack]||PACKS.retro).patterns[name].reduce((t,[,d])=>t+d,0);
 const core={KEY,VALUES,read,write,PATTERNS,PACKS,FILES,duration};
 if(typeof module==='object'&&module.exports){module.exports=core;return;}
 let ctx=null;
 function play(name,packName=read(root.localStorage)){
  const pack=PACKS[packName]||PACKS.retro,steps=pack.patterns[name];if(!steps)return Promise.resolve();
  try{
   ctx=ctx||new (root.AudioContext||root.webkitAudioContext)();if(ctx.state==='suspended')ctx.resume().catch(()=>{});
   const gain=ctx.createGain();gain.gain.value=pack.gain;gain.connect(ctx.destination);
   let t=ctx.currentTime+0.01;
   for(const [hz,d] of steps){if(hz){const o=ctx.createOscillator();o.type=pack.wave;o.frequency.value=hz;o.connect(gain);o.start(t);o.stop(t+d);}t+=d;}
  }catch{}
  return Promise.resolve();
 }
 const active=()=>read(root.localStorage)!=='standard';
 const original=root.HTMLAudioElement?.prototype.play;
 if(original){root.HTMLAudioElement.prototype.play=function(){
  if(active()){const file=String(this.currentSrc||this.src||'').split(/[?#]/)[0].split('/').pop();const name=FILES[file];if(name)return play(name);}
  return original.apply(this,arguments);};}
 root.NightlinkSoundPack={...core,play,active,set:v=>write(root.localStorage,v)};
 const doc=root.document;
 // Connect chirp: once per transition to a synchronized radio, only with a synthesized pack on.
 doc.addEventListener('DOMContentLoaded',()=>{
  let was=null;
  if(typeof radioSession==='object')radioSession.addEventListener('sync',()=>{const ready=typeof live==='object'&&live.sync==='ready';if(ready&&was===false&&active())play('connect');was=ready;});
  // Setting, beside the Interface selector (terminal interface only).
  if(typeof view!=='function')return;const previous=view;view=function(name){previous.apply(this,arguments);if(name!=='Settings'||!root.NightlinkInterface?.isTerminal())return;
   const grid=doc.querySelector('.settings-grid');if(!grid||grid.querySelector('#sound-pack-setting'))return;
   const label=doc.createElement('label');label.className='accent-setting interface-setting';label.id='sound-pack-setting';label.append('Sound pack');
   const select=doc.createElement('select');select.id='sound-pack';select.setAttribute('aria-label','Sound pack');
   for(const [v,t] of [['standard','Standard'],['retro','Retro (PC speaker)'],['modem','Modem (FSK warble)'],['bells','BBS bells']]){const o=doc.createElement('option');o.value=v;o.textContent=t;select.append(o);}
   select.value=read(root.localStorage);select.onchange=()=>{write(root.localStorage,select.value);if(select.value!=='standard')play('dm',select.value);};
   const hint=doc.createElement('small');hint.textContent='Retro, Modem and BBS bells replace the sent, direct-message and mention sounds and adds a chirp when the radio synchronizes. Existing sound switches and quiet hours still apply.';
   label.append(select,hint);const after=grid.querySelector('#boot-screen-setting')||grid.querySelector('.interface-setting');if(after)after.after(label);else grid.prepend(label);};
 });
})(typeof window==='object'?window:globalThis);
