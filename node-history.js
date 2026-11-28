/* Nodes: SNR history per node over the last 24 hours, shown as a small sparkline beside LAST SNR.
   Display only; records the readings node-signal.js already derives (direct adverts and the final hop of received
   messages). Stored on this computer per radio identity: at most 48 readings per node and 400 nodes. */
(function(root){
 'use strict';
 const DAY=86400,PER_NODE=48,MAX_NODES=400;
 // Add a reading when it is newer than the node's last one; drop readings older than 24 h.
 function add(history,key,reading,now=Date.now()/1000){if(!key||!reading||!Number.isFinite(reading.snr)||!Number.isFinite(reading.at))return false;
  const list=(history[key]||[]).filter(([t])=>now-t<=DAY),last=list[list.length-1];if(last&&reading.at<=last[0]){history[key]=list;return false;}
  list.push([Math.round(reading.at),Math.round(reading.snr*4)/4]);while(list.length>PER_NODE)list.shift();history[key]=list;return true;}
 function prune(history,now=Date.now()/1000){for(const k of Object.keys(history)){history[k]=(history[k]||[]).filter(([t])=>now-t<=DAY);if(!history[k].length)delete history[k];}
  const keys=Object.keys(history);if(keys.length>MAX_NODES){keys.sort((a,b)=>history[a].at(-1)[0]-history[b].at(-1)[0]);for(const k of keys.slice(0,keys.length-MAX_NODES))delete history[k];}return history;}
 function summary(list){if(!list?.length)return null;const v=list.map(x=>x[1]);const avg=v.reduce((s,x)=>s+x,0)/v.length;return {count:v.length,min:Math.min(...v),max:Math.max(...v),avg:Math.round(avg*10)/10,last:v[v.length-1]};}
 // Bar heights 1–12 px for SNR -20…+10 dB.
 const height=snr=>Math.max(1,Math.min(12,Math.round((snr+20)/30*11)+1));
 const core={add,prune,summary,height,DAY,PER_NODE,MAX_NODES};
 if(typeof module==='object'&&module.exports){module.exports=core;return;}
 const doc=root.document,NS='http://www.w3.org/2000/svg';
 const L=()=>{try{return typeof live==='object'?live:null;}catch{return null;}};
 const storageKey=()=>{const id=L()?.identity?.key;return id?'nightlink.snr-history.'+String(id).slice(0,16):null;};
 let cache=null,cacheKey=null;
 function load(){const k=storageKey();if(!k)return null;if(cacheKey===k&&cache)return cache;cacheKey=k;try{cache=prune(JSON.parse(root.localStorage.getItem(k)||'{}')||{});}catch{cache={};}return cache;}
 function store(){const k=storageKey();if(!k||!cache)return;try{root.localStorage.setItem(k,JSON.stringify(cache));}catch{}}
 // Record the current merged readings (same source as the LAST SNR column).
 function record(){const data=L(),S=root.NightlinkNodeSignal,h=load();if(!data||!S||!h)return;
  const seen=S.merge(S.heard(data.messages||[],data.contacts||[],root.MeshlineRoutes?.resolvePath,typeof messageContact==='function'?m=>{try{return messageContact(m);}catch{return null;}}:null),root.NightlinkHeardAdverts);
  let changed=false;for(const [key,v] of seen)if(add(h,String(key).slice(0,16),v))changed=true;if(changed)store();}
 // Bars spread over the full width (at least 8 slots so a few readings do not become wide blocks).
 function spark(list){const svg=doc.createElementNS(NS,'svg'),items=list.slice(-PER_NODE),slots=Math.max(8,items.length);svg.setAttribute('class','node-spark');svg.setAttribute('viewBox','0 0 '+(slots*3)+' 12');svg.setAttribute('preserveAspectRatio','none');svg.setAttribute('aria-hidden','true');
  items.forEach(([,snr],i,arr)=>{const r=doc.createElementNS(NS,'rect'),h=height(snr);r.setAttribute('x',String((slots-arr.length+i)*3));r.setAttribute('y',String(12-h));r.setAttribute('width','2.2');r.setAttribute('height',String(h));if(snr<-10)r.setAttribute('class','weak');svg.append(r);});return svg;}
 function decorate(){const data=L(),h=load();if(!data||!h)return;
  for(const row of doc.querySelectorAll('#node-table tr')){const idx=row.querySelector('[data-node]')?.dataset.node,n=idx==null?null:data.contacts?.[Number(idx)];if(!n)continue;const sig=row.querySelector('td.signal');if(!sig)continue;
   sig.querySelector('.node-spark')?.remove();const list=h[String(n.key).slice(0,16)],s=summary(list);if(!s||s.count<2)continue;const g=spark(list);sig.append(g);
   sig.title=(sig.title?sig.title+'\n':'')+'Last 24 h: '+s.count+' readings, low '+s.min+' dB, average '+s.avg+' dB, high '+s.max+' dB';}}
 let queued=false;const soon=()=>{if(queued)return;queued=true;setTimeout(()=>{queued=false;try{record();if(typeof current==='string'&&current==='Nodes')decorate();}catch(e){console.warn('node history',e);}},1500);};
 root.NightlinkNodeHistory={...core,record,decorate,history:()=>load()};
 doc.addEventListener('DOMContentLoaded',()=>{
  if(typeof renderNodes==='function'){const prev=renderNodes;renderNodes=function(){const r=prev.apply(this,arguments);try{record();decorate();}catch(e){console.warn('node history',e);}return r;};}
  try{if(typeof radioSession==='object')for(const ev of ['message','messages'])radioSession.addEventListener(ev,soon);if(typeof ble==='object')ble.addEventListener('packet',e=>{if(e.detail?.[0]===0x88)soon();});}catch{}});
})(typeof window==='object'?window:globalThis);
