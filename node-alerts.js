/* Node alerts (Settings > Notifications, off by default): tell you when a watched node goes quiet for longer than a
   chosen time, and when your own radio's battery is low. Watched nodes are your favourites (★ on Nodes).
   "Last heard" is the newest of: the node's last advert, a direct or relayed advert this session, and the final hop
   of a received message. Alerts appear as a notice, an Activity entry and, when Windows allows it, a desktop
   notification. One alert per quiet spell; a recovery notice when the node is heard again. No radio commands. */
(function(root){
 'use strict';
 const KEY='nightlink.node-alerts',DEFAULTS={enabled:false,minutes:120,battery:true};
 const MINUTES=[30,60,120,240,720],LOW_MV=3500,RECOVER_MV=3600;
 function config(raw){const c={...DEFAULTS,...(raw&&typeof raw==='object'?raw:{})};c.enabled=c.enabled===true;c.battery=c.battery!==false;c.minutes=MINUTES.includes(Number(c.minutes))?Number(c.minutes):DEFAULTS.minutes;return c;}
 function lastHeard(contact,sources={}){const key=contact?.key;let t=Number(contact?.lastAdvert)||0;for(const m of [sources.heard,sources.relayed,sources.messages]){const v=m?.get?.(key);if(v&&Number(v.at)>t)t=Number(v.at);}return t||null;}
 // Compare each watched node with the threshold. `state` remembers which nodes already raised an alert.
 function evaluate(nodes,now,minutes,state){const events=[],limit=minutes*60;
  for(const n of nodes){if(!n.heard)continue;const quiet=now-n.heard>limit,was=state.get(n.key);
   if(quiet&&!was){state.set(n.key,true);events.push({type:'quiet',key:n.key,name:n.name,minutes:Math.floor((now-n.heard)/60)});}
   else if(!quiet&&was){state.delete(n.key);events.push({type:'back',key:n.key,name:n.name});}}
  return events;}
 function battery(mv,low){if(!Number.isFinite(mv)||mv<=0)return {low,event:null};if(!low&&mv<LOW_MV)return {low:true,event:{type:'battery',volts:(mv/1000).toFixed(2)}};if(low&&mv>=RECOVER_MV)return {low:false,event:null};return {low,event:null};}
 function duration(minutes){return minutes<120?minutes+' min':(Math.round(minutes/6)/10)+' h';}
 function text(e){if(e.type==='quiet')return e.name+' has not been heard for '+duration(e.minutes);if(e.type==='back')return e.name+' is heard again';if(e.type==='battery')return 'Your radio battery is low: '+e.volts+' V';return '';}
 const core={KEY,DEFAULTS,MINUTES,LOW_MV,RECOVER_MV,config,lastHeard,evaluate,battery,duration,text};
 if(typeof module==='object'&&module.exports){module.exports=core;return;}
 const doc=root.document;let quiet=new Map(),low=false,timer=null;
 const L=()=>{try{return typeof live==='object'?live:null;}catch{return null;}};
 const read=()=>{try{return config(JSON.parse(root.localStorage.getItem(KEY)||'{}'));}catch{return config({});}};
 const write=c=>{try{root.localStorage.setItem(KEY,JSON.stringify(config(c)));}catch{}};
 function favourites(){try{if(typeof favoriteKeys==='object'&&favoriteKeys)return favoriteKeys;}catch{}try{return new Set(JSON.parse(root.localStorage.getItem('nightlink.favorites')||'[]'));}catch{return new Set();}}
 function messageHeard(data){const S=root.NightlinkNodeSignal;if(!S)return null;try{return S.heard(data.messages||[],data.contacts||[],root.MeshlineRoutes?.resolvePath,typeof messageContact==='function'?m=>{try{return messageContact(m);}catch{return null;}}:null);}catch{return null;}}
 function notify(e){const msg=text(e);if(!msg)return;try{if(typeof toast==='function')toast(msg);}catch{}try{if(typeof logLive==='function')logLive('Alert · '+msg);}catch{}
  try{if(e.type!=='back'&&'Notification' in root&&root.Notification.permission==='granted')new root.Notification('Nightlink · '+(e.type==='battery'?'Low battery':'Node quiet'),{body:msg,tag:'nightlink-alert-'+(e.key||e.type),silent:false});}catch{}}
 function check(){const c=read(),data=L();if(!c.enabled||!data||data.sync!=='ready')return [];const now=Date.now()/1000,fav=favourites(),sources={heard:root.NightlinkHeardAdverts,relayed:root.NightlinkRelayedAdverts,messages:messageHeard(data)};
  const nodes=(data.contacts||[]).filter(n=>fav.has(n.key)).map(n=>({key:n.key,name:typeof cardName==='function'?cardName(n.key,n.name):n.name,heard:lastHeard(n,sources)}));
  const events=evaluate(nodes,now,c.minutes,quiet);if(c.battery){const b=battery(data.battery?.millivolts,low);low=b.low;if(b.event)events.push(b.event);}for(const e of events)notify(e);return events;}
 function settings(){if(doc.querySelector('#node-alerts-setting'))return;const grid=doc.querySelector('#settings-page-notifications')||doc.querySelector('.settings-grid');if(!grid)return;const c=read();
  const box=doc.createElement('div');box.className='interface-setting node-alerts-setting';box.id='node-alerts-setting';const title=doc.createElement('strong');title.textContent='Node alerts';
  const mk=(id,label,checked)=>{const l=doc.createElement('label');l.className='setting-toggle';const i=doc.createElement('input');i.type='checkbox';i.id=id;i.checked=checked;const s=doc.createElement('span');s.className='setting-title';s.textContent=label;l.append(i,s);return [l,i];};
  const [onRow,on]=mk('node-alerts-enabled','Alert me when a favourite node goes quiet',c.enabled);
  const sel=doc.createElement('select');sel.id='node-alerts-minutes';sel.setAttribute('aria-label','Quiet for longer than');for(const m of MINUTES){const o=doc.createElement('option');o.value=String(m);o.textContent='Quiet for more than '+duration(m);sel.append(o);}sel.value=String(c.minutes);
  const [batRow,bat]=mk('node-alerts-battery','Alert me when my radio battery is below 3.5 V',c.battery);
  const help=doc.createElement('small');help.textContent='Watches the nodes marked ★ on the Nodes page. A node counts as heard when its advert or a message through it reaches your radio. One alert per quiet spell, as a notice, an Activity entry and a desktop notification when allowed.';
  const save=()=>{write({enabled:on.checked,minutes:Number(sel.value),battery:bat.checked});quiet=new Map();if(on.checked&&'Notification' in root&&root.Notification.permission==='default')try{root.Notification.requestPermission();}catch{}};
  on.onchange=save;sel.onchange=save;bat.onchange=save;box.append(title,onRow,sel,batRow,help);grid.append(box);}
 root.NightlinkNodeAlerts={...core,check,read};
 doc.addEventListener('DOMContentLoaded',()=>{
  if(typeof view==='function'){const prev=view;view=function(name){const r=prev.apply(this,arguments);if(name==='Settings')setTimeout(()=>{try{settings();}catch(e){console.warn('node alerts',e);}},0);return r;};}
  timer=setInterval(()=>{try{check();}catch(e){console.warn('node alerts',e);}},60000);});
})(typeof window==='object'?window:globalThis);
