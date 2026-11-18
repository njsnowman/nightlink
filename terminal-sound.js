/* Retro sound pack (#131): optional synthesized PC-speaker style sounds. Off by default.
   When on, playback of the existing notification files (sent.wav, dm.wav, mention.wav) is replaced by a short
   square-wave pattern; whether a sound plays at all is still decided by the existing modules (mute, quiet hours,
   per-feature switches), because only HTMLAudioElement.play for those files is intercepted. A modem-style chirp
   plays once when the radio finishes synchronizing. Nothing is downloaded; Web Audio only. */
(function(root){
 'use strict';
 const KEY='nightlink.soundPack',VALUES=['standard','retro'];
 const read=storage=>{try{const v=storage?.getItem(KEY);return VALUES.includes(v)?v:'standard';}catch{return 'standard';}};
 const write=(storage,v)=>{try{storage?.setItem(KEY,VALUES.includes(v)?v:'standard');}catch{}};
 // [frequency Hz, duration s] steps; 0 Hz is a rest.
 const PATTERNS={
  sent:[[880,.05],[0,.02],[1320,.07]],
  dm:[[660,.06],[880,.06],[1320,.09]],
  mention:[[1000,.07],[0,.04],[1500,.07],[0,.04],[1000,.07],[0,.04],[1500,.09]],
  connect:[[1200,.08],[2400,.08],[1200,.06],[0,.03],[1800,.05],[2100,.05],[1800,.05],[2400,.12]]
 };
 const FILES={'sent.wav':'sent','dm.wav':'dm','mention.wav':'mention'};
 const duration=name=>PATTERNS[name].reduce((t,[,d])=>t+d,0);
 const core={KEY,VALUES,read,write,PATTERNS,FILES,duration};
 if(typeof module==='object'&&module.exports){module.exports=core;return;}
 let ctx=null;
 function play(name){
  const steps=PATTERNS[name];if(!steps)return Promise.resolve();
  try{
   ctx=ctx||new (root.AudioContext||root.webkitAudioContext)();if(ctx.state==='suspended')ctx.resume().catch(()=>{});
   const gain=ctx.createGain();gain.gain.value=0.06;gain.connect(ctx.destination);
   let t=ctx.currentTime+0.01;
   for(const [hz,d] of steps){if(hz){const o=ctx.createOscillator();o.type='square';o.frequency.value=hz;o.connect(gain);o.start(t);o.stop(t+d);}t+=d;}
  }catch{}
  return Promise.resolve();
 }
 const active=()=>read(root.localStorage)==='retro';
 const original=root.HTMLAudioElement?.prototype.play;
 if(original){root.HTMLAudioElement.prototype.play=function(){
  if(active()){const file=String(this.currentSrc||this.src||'').split(/[?#]/)[0].split('/').pop();const name=FILES[file];if(name)return play(name);}
  return original.apply(this,arguments);};}
 root.NightlinkSoundPack={...core,play,active,set:v=>write(root.localStorage,v)};
 const doc=root.document;
 // Connect chirp: once per transition to a synchronized radio, only with the retro pack on.
 doc.addEventListener('DOMContentLoaded',()=>{
  let was=null;
  if(typeof radioSession==='object')radioSession.addEventListener('sync',()=>{const ready=typeof live==='object'&&live.sync==='ready';if(ready&&was===false&&active())play('connect');was=ready;});
  // Setting, beside the Interface selector (terminal interface only).
  if(typeof view!=='function')return;const previous=view;view=function(name){previous.apply(this,arguments);if(name!=='Settings'||!root.NightlinkInterface?.isTerminal())return;
   const grid=doc.querySelector('.settings-grid');if(!grid||grid.querySelector('#sound-pack-setting'))return;
   const label=doc.createElement('label');label.className='accent-setting interface-setting';label.id='sound-pack-setting';label.append('Sound pack');
   const select=doc.createElement('select');select.id='sound-pack';select.setAttribute('aria-label','Sound pack');
   for(const [v,t] of [['standard','Standard'],['retro','Retro (PC speaker)']]){const o=doc.createElement('option');o.value=v;o.textContent=t;select.append(o);}
   select.value=read(root.localStorage);select.onchange=()=>{write(root.localStorage,select.value);if(select.value==='retro')play('dm');};
   const hint=doc.createElement('small');hint.textContent='Replaces sent, direct-message and mention sounds and adds a chirp when the radio synchronizes. Existing sound switches and quiet hours still apply.';
   label.append(select,hint);const after=grid.querySelector('#boot-screen-setting')||grid.querySelector('.interface-setting');if(after)after.after(label);else grid.prepend(label);};
 });
})(typeof window==='object'?window:globalThis);
