/* Bounded per-radio evidence. Never records channel keys or outbound command payloads. */
(function(root){
 const limit=2000,ttl=7*86400000;
 class Evidence {
  constructor(rows=[],now=()=>Date.now()){this.now=now;this.rows=Array.isArray(rows)?rows.filter(r=>r&&Number.isFinite(r.at)&&typeof r.type==='string').slice(-limit):[];this.trim();}
  trim(){this.rows=this.rows.filter(r=>r.at>=this.now()-ttl).slice(-limit);}
  add(type,data={}){const row={at:this.now(),type,data};this.rows.push(row);this.trim();return row;}
  between(from=0,to=Infinity){return this.rows.filter(r=>r.at>=from&&r.at<=to);}
 }
 function packet(input){const d=Uint8Array.from(input||[]);if(d[0]!==0x88||d.length<5)return null;const raw=d.slice(3),header=raw[0],version=header>>6,route=header&3,type=(header>>2)&15;
  const result={bytes:Array.from(raw),snr:(d[1]>127?d[1]-256:d[1])/4,rssi:d[2]>127?d[2]-256:d[2],version,route,type,typeName:({0:'Request',1:'Response',2:'Direct text',3:'Acknowledgement',4:'Advert',5:'Channel text',6:'Group data',7:'Anonymous request',8:'Path',9:'Trace',10:'Multipart',11:'Control',15:'Raw custom'})[type]||'Unknown',routeName:['Scoped flood','Flood','Direct','Scoped direct'][route],path:[],valid:false};
  if(version!==0)return result;let at=(route===0||route===3)?5:1;if(at>=raw.length)return result;const encoded=raw[at++],size=(encoded>>6)+1,count=encoded&63;if(size>3||count*size>64||at+count*size>raw.length)return result;
  for(let n=0;n<count;n++)result.path.push(Array.from(raw.slice(at+n*size,at+(n+1)*size),v=>v.toString(16).padStart(2,'0')).join(''));
  result.valid=true;result.payloadOffset=at+count*size;return result;
 }
 function summarize(rows){const groups=new Map();for(const r of rows){if(r.type!=='packet'||!r.data.valid||!Number.isFinite(r.data.snr))continue;const p=r.data,key=p.path.length?'via '+p.path.join(' → '):'direct / sender unresolved';let g=groups.get(key);if(!g){g={key,count:0,sum:0,min:Infinity,max:-Infinity,last:0};groups.set(key,g);}g.count++;g.sum+=p.snr;g.min=Math.min(g.min,p.snr);g.max=Math.max(g.max,p.snr);g.last=Math.max(g.last,r.at);}return [...groups.values()].map(g=>({...g,mean:g.sum/g.count}));}
 root.NightlinkEvidence={Evidence,packet,summarize,limit,ttl};if(typeof module!=='undefined')module.exports=root.NightlinkEvidence;
})(globalThis);
