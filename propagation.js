/* Passive RF propagation monitor. Consumes existing receive events only: never transmits, probes or uses the network.
   Scores are anomaly indicators, not proof of atmospheric propagation. See docs/propagation-monitor.md. */
(function(root){
 const node=typeof module!=='undefined'&&typeof require==='function';
 const evidence=root.NightlinkEvidence||(node?require('./diagnostics.js'):null);
 const workbench=root.NightlinkWorkbench||(node?require('./radio-workbench.js'):null);
 const protocol=root.MeshlineProtocol||(node?require('./radio.js'):null);
 const HOUR=3600000,MINUTE=60000;
 const defaults=Object.freeze({
  enabled:true,sensitivity:'medium',baselineDays:30,bucketMs:HOUR,windowMs:30*MINUTE,dedupMs:2*MINUTE,
  minBaselineHours:24,minCoverageRatio:0.5,maxStations:5000,maxStationsPerBucket:512,maxSnrClassesPerBucket:256,
  maxRecent:200,maxEvents:100,maxDistances:500,
  weights:{distance:40,stations:25,snr:20,sustained:15},
  thresholds:{low:{possible:55,strong:80},medium:{possible:40,strong:70},high:{possible:30,strong:55}},
  hysteresis:10,clearMs:20*MINUTE,cooldownMs:30*MINUTE,
  unusualDistanceKm:80,distanceFactor:1.5,minDistanceSamples:5,rareMaxBuckets:1,minStationsNew:2,
  snrMinDelta:3,snrFullDelta:12,snrMinComparable:3,snrMinSamples:3,sustainedWindows:3,
  // Full sustained credit needs flagged observations spread over (sustainedWindows-1) x sustainedSlotMs; evaluation calls add nothing.
  sustainedSlotMs:10*MINUTE,
  // Time without any observation or heartbeat beyond this gap is not counted as monitored coverage (null disables).
  idleGapMs:30*MINUTE,maxLocations:5000
 });
 const baselineChoices=[14,30,60],sensitivities=['low','medium','high'];
 const levels=['normal','possible-opening','strong-anomaly'];
 const labels={disabled:'Monitoring disabled',unavailable:'Monitoring unavailable','insufficient-data':'Learning baseline',normal:'Normal','possible-opening':'Possible RF opening','strong-anomaly':'Strong RF anomaly'};
 const clamp=x=>Math.max(0,Math.min(1,x));
 const finite=x=>typeof x==='number'&&Number.isFinite(x);
 const located=p=>!!p&&finite(p.lat)&&finite(p.lon)&&(protocol?.validLocation?protocol.validLocation(p.lat,p.lon):Math.abs(p.lat)<=90&&Math.abs(p.lon)<=180&&(p.lat!==0||p.lon!==0));
 const hex=a=>Array.from(a,v=>v.toString(16).padStart(2,'0')).join('');
 function fnv(values){let h=0x811c9dc5;for(const v of values){h^=v&255;h=Math.imul(h,0x01000193)>>>0;}return h.toString(16);}
 function percentile(values,p){if(!values.length)return null;const s=[...values].sort((a,b)=>a-b);return s[Math.min(s.length-1,Math.floor(p*(s.length-1)+0.5))];}

 // Relation of a reception to its originator: 'direct' only when a flood packet carries zero path hashes.
 function relation(route,count){if(count==null)return 'unknown';if(route===2||route===3)return 'unknown';return count===0?'direct':'forwarded';}
 const normalize={
  // 0x88 RX-log push; parsed by the existing diagnostics parser (diagnostics.js packet()).
  rxLog(frame,at){
   if(!evidence||!finite(at))return null;let p;try{p=evidence.packet(frame);}catch{return null;}
   if(!p||!p.valid)return null;
   const raw=p.bytes,count=p.path.length,payload=raw.slice(p.payloadOffset);
   let key=null;
   // Assumption (not parsed elsewhere in this repository): an Advert payload begins with the 32-byte originator public key.
   if(p.type===4&&payload.length>=32+4+64)key=hex(payload.slice(0,32));
   return {source:'rxlog',at,snr:finite(p.snr)?p.snr:null,rssi:finite(p.rssi)?p.rssi:null,route:p.route,routeName:p.routeName,type:p.type,typeName:p.typeName,
    hops:count,relation:relation(p.route,count),station:key,stationKind:key?'key':null,path:p.path.slice(),dedup:'rx:'+p.type+':'+fnv(payload)};
  },
  // Decoded companion message (radio.js message()). pathLength 255 is unknown, never direct.
  message(m,at){
   if(!m||!finite(at)||(m.kind!=='direct'&&m.kind!=='channel'))return null;
   const raw=Number.isInteger(m.pathLength)?m.pathLength:null,hops=raw==null||raw===255?null:raw&63;
   const prefix=m.kind==='direct'&&typeof m.prefix==='string'&&/^[a-f0-9]{12}$/.test(m.prefix)?m.prefix:null;
   const text=typeof m.text==='string'?Array.from(new TextEncoder().encode(m.text)):[];
   return {source:'message',at,snr:finite(m.snr)?m.snr:null,rssi:null,route:null,type:m.kind==='direct'?2:5,typeName:m.kind==='direct'?'Direct text':'Channel text',
    hops,relation:hops==null?'unknown':hops===0?'direct':'forwarded',station:prefix,stationKind:prefix?'prefix':null,path:[],
    dedup:'msg:'+m.kind+':'+(prefix||m.slot)+':'+m.timestamp+':'+fnv(text)};
  },
  // 0x8a advert push (radio.js contact()). Its path length describes the stored route, not this reception.
  advert(c,at){
   if(!c||!finite(at)||typeof c.key!=='string'||!/^[a-f0-9]{64}$/.test(c.key))return null;
   return {source:'advert',at,snr:null,rssi:null,route:null,type:4,typeName:'Advert',hops:null,relation:'unknown',station:c.key,stationKind:'key',path:[],
    location:located(c)?{lat:c.lat,lon:c.lon}:null,dedup:'adv:'+c.key+':'+(c.lastAdvert||0)};
  }
 };

 function emptyRadio(){return {buckets:[],stations:new Map(),distances:[],events:[],locations:new Map(),own:null,fingerprint:null,comparable:true,warning:null,
  window:[],seen:new Map(),seenQ:[],seenHead:0,recent:[],level:'normal',score:0,anomalyStreak:0,below:null,lastQualifying:null,current:null,lastEnd:null,lastEndLevel:null,baseCache:null};}
 // SNR comparison class: same station, packet type and reception route.
 const snrClass=o=>o.station+'|'+o.type+'|'+o.relation+'|'+(o.hops==null?'u':o.hops);

 function score(input,options=defaults){
  const w={...defaults.weights,...(options.weights||{})},parts={distance:null,stations:null,snr:null,sustained:null};
  if(input.distance)parts.distance=w.distance*clamp(input.distance.stations/2);
  if(input.stations&&input.stations.available)parts.stations=input.stations.unusual>=(options.minStationsNew??defaults.minStationsNew)?w.stations*clamp((input.stations.unusual-input.stations.expected-1)/4):0;
  if(input.snr&&input.snr.delta!=null){const lo=options.snrMinDelta??defaults.snrMinDelta,hi=options.snrFullDelta??defaults.snrFullDelta;parts.snr=w.snr*clamp((input.snr.delta-lo)/(hi-lo));}
  if(input.sustained!=null)parts.sustained=w.sustained*clamp((input.sustained-1)/Math.max(1,(options.sustainedWindows??defaults.sustainedWindows)-1));
  const total=Object.values(parts).reduce((a,v)=>a+(v||0),0);
  return {total:Math.round(Math.min(100,total)),parts};
 }

 function createMonitor(opts={}){
  const settings={...defaults,...opts,weights:{...defaults.weights,...(opts.weights||{})},thresholds:{...defaults.thresholds,...(opts.thresholds||{})}};
  const now=opts.now||(()=>Date.now()),listeners=new Set(),radios=new Map();
  let key=null,connected=false,coverFrom=null,lastActivity=null,rxlogSeen=false,rejected=0,settingsVersion=0;
  const emit=(type,detail)=>{for(const f of listeners){try{f({type,detail});}catch{}}};
  const radio=()=>{if(!key)return null;if(!radios.has(key))radios.set(key,emptyRadio());return radios.get(key);};
  const thresholds=()=>settings.thresholds[sensitivities.includes(settings.sensitivity)?settings.sensitivity:'medium'];

  function bucketAt(r,at){const start=Math.floor(at/settings.bucketMs)*settings.bucketMs;let b=r.buckets[r.buckets.length-1];
   if(!b||b.start!==start){if(b&&b.start>start)return r.buckets.find(x=>x.start===start)||null;b={start,coverageMs:0,packets:0,rxlog:0,keys:new Set(),newKeys:0,snr:new Map()};r.buckets.push(b);prune(r,at);}
   return b;}
  function prune(r,at){const min=at-settings.baselineDays*86400000-settings.windowMs;while(r.buckets.length&&r.buckets[0].start+settings.bucketMs<min)r.buckets.shift();
   const cap=Math.ceil(settings.baselineDays*86400000/settings.bucketMs)+2;if(r.buckets.length>cap)r.buckets.splice(0,r.buckets.length-cap);
   if(r.stations.size>settings.maxStations){const old=[...r.stations].sort((a,b)=>a[1].last-b[1].last).slice(0,r.stations.size-settings.maxStations);for(const [k] of old)r.stations.delete(k);}
   r.distances=r.distances.filter(d=>d.at>=min).slice(-settings.maxDistances);}
  function cover(at){const r=radio();if(!r||!connected)return;if(coverFrom==null||at<=coverFrom){if(coverFrom==null)coverFrom=at;return;}
   // A link silent beyond idleGapMs (no observation, no heartbeat) may be down without a disconnect event.
   const until=settings.idleGapMs!=null&&lastActivity!=null?Math.min(at,Math.max(coverFrom,lastActivity+settings.idleGapMs)):at;
   let t=coverFrom;while(t<until){const b=bucketAt(r,t);const end=Math.min(until,(b?b.start:Math.floor(t/settings.bucketMs)*settings.bucketMs)+settings.bucketMs);if(b)b.coverageMs=Math.min(settings.bucketMs,b.coverageMs+(end-t));t=end;}coverFrom=at;}

  function baselineRange(at){return {from:at-settings.baselineDays*86400000,to:at-settings.windowMs};}
  // Cached per radio for the current from/to bucket pair; completed buckets do not change within it.
  function baseline(r,at){
   const {from,to}=baselineRange(at),ck=settingsVersion+'|'+Math.floor(from/settings.bucketMs)+'|'+Math.floor(to/settings.bucketMs)+'|'+r.buckets.length;
   if(r.baseCache&&r.baseCache.key===ck)return r.baseCache.value;
   const usable=r.buckets.filter(b=>b.start>=from&&b.start+settings.bucketMs<=to&&b.coverageMs>=settings.bucketMs*settings.minCoverageRatio);
   const hours=usable.reduce((a,b)=>a+b.coverageMs,0)/HOUR,snr=new Map();let packets=0,newKeys=0;
   for(const b of usable){packets+=b.packets;newKeys+=b.newKeys;for(const [c,v] of b.snr){const s=snr.get(c)||{n:0,sum:0};s.n+=v.n;s.sum+=v.sum;snr.set(c,s);}}
   const dist=r.distances.filter(d=>d.at>=from&&d.at<=to).map(d=>d.km);
   const value={hours,buckets:usable.length,packetRate:hours?packets/hours:null,newRate:hours?newKeys/hours:null,snr,distanceP95:dist.length>=settings.minDistanceSamples?percentile(dist,0.95):null,distanceSamples:dist.length};
   r.baseCache={key:ck,value};return value;
  }

  function observe(obs){
   if(!obs||!finite(obs.at)){rejected++;return false;}
   const r=radio();if(!r||!settings.enabled)return false;
   if(obs.source==='rxlog')rxlogSeen=true;
   if(obs.location&&obs.station)setLocation(r,obs.station,obs.location);
   const at=obs.at;cover(at);if(connected)lastActivity=Math.max(lastActivity??at,at);
   while(r.seenHead<r.seenQ.length&&r.seenQ[r.seenHead][1]<at-settings.dedupMs){const [k,t]=r.seenQ[r.seenHead++];if(r.seen.get(k)===t)r.seen.delete(k);}
   if(r.seenHead>1024&&r.seenHead*2>r.seenQ.length){r.seenQ=r.seenQ.slice(r.seenHead);r.seenHead=0;}
   if(obs.dedup&&r.seen.has(obs.dedup))return false;if(obs.dedup){r.seen.set(obs.dedup,at);r.seenQ.push([obs.dedup,at]);}
   const b=bucketAt(r,at);if(!b)return false;b.packets++;if(obs.source==='rxlog')b.rxlog++;
   const flags=[];let distance=null;
   if(obs.station){
    let s=r.stations.get(obs.station);const fresh=!s;
    if(fresh){s={first:at,last:at,buckets:0,lastBucket:null,kind:obs.stationKind};r.stations.set(obs.station,s);b.newKeys++;}
    if(s.lastBucket!==b.start){s.buckets++;s.lastBucket=b.start;}
    const prior=fresh?0:s.buckets-1;s.last=Math.max(s.last,at);
    if(b.keys.size<settings.maxStationsPerBucket)b.keys.add(obs.station);
    if(fresh)flags.push('new station');else if(prior<=settings.rareMaxBuckets&&s.first<at-settings.windowMs)flags.push('rarely received station');
    if(obs.snr!=null){const c=snrClass(obs);const v=b.snr.get(c)||(b.snr.size<settings.maxSnrClassesPerBucket?{n:0,sum:0}:null);if(v){v.n++;v.sum+=obs.snr;b.snr.set(c,v);}}
   }
   // Distance only for a zero-hop flood reception whose originator key and both locations are known.
   if(obs.source==='rxlog'&&obs.relation==='direct'&&obs.stationKind==='key'&&located(r.own)&&r.locations.has(obs.station)&&workbench?.geometry){
    try{distance=workbench.geometry(r.own,r.locations.get(obs.station),0,0,915).km;}catch{distance=null;}
    if(distance!=null){r.distances.push({at,km:distance,station:obs.station});const base=baseline(r,at),limit=Math.max(settings.unusualDistanceKm,base.distanceP95!=null?base.distanceP95*settings.distanceFactor:0);if(distance>limit)flags.push('unusual direct distance');}
   }
   const row={at,source:obs.source,station:obs.station,stationKind:obs.stationKind,type:obs.type,typeName:obs.typeName,snr:obs.snr,rssi:obs.rssi,relation:obs.relation,hops:obs.hops,distanceKm:distance,flags};
   r.window.push(row);r.recent.push(row);if(r.recent.length>settings.maxRecent)r.recent.splice(0,r.recent.length-settings.maxRecent);
   return true;
  }

  function measure(r,at){
   const from=at-settings.windowMs;r.window=r.window.filter(x=>x.at>=from);
   const base=baseline(r,at),win=r.window,hours=settings.windowMs/HOUR;
   const unusualKeys=new Set(win.filter(x=>x.flags.includes('new station')||x.flags.includes('rarely received station')).map(x=>x.station));
   const directKeys=new Set(win.filter(x=>x.flags.includes('unusual direct distance')).map(x=>x.station));
   const enough=base.hours>=settings.minBaselineHours&&r.comparable;
   const stations={available:enough,unusual:unusualKeys.size,expected:enough&&base.newRate!=null?base.newRate*hours:0};
   let snr={delta:null,comparable:0};
   if(enough){const per=new Map();for(const x of win){if(x.snr==null||!x.station)continue;const c=snrClass(x);const v=per.get(c)||{n:0,sum:0};v.n++;v.sum+=x.snr;per.set(c,v);}
    const deltas=[];for(const [c,v] of per){const b=base.snr.get(c);if(b&&b.n>=settings.snrMinSamples)deltas.push(v.sum/v.n-b.sum/b.n);}
    if(deltas.length>=settings.snrMinComparable)snr={delta:deltas.reduce((a,v)=>a+v,0)/deltas.length,comparable:deltas.length};}
   const distance=directKeys.size?{stations:directKeys.size}:null;
   const packets=win.length,unique=new Set(win.filter(x=>x.station).map(x=>x.station)).size;
   const flaggedAt=win.filter(x=>x.flags.length).map(x=>x.at),flaggedSpanMs=flaggedAt.length>1?Math.max(...flaggedAt)-Math.min(...flaggedAt):0;
   return {base,enough,stations,snr,distance,packets,unique,flaggedSpanMs,
    summary:{newStations:win.filter(x=>x.flags.includes('new station')).length,unusualStations:unusualKeys.size,unusualDirect:win.some(x=>x.distanceKm!=null)?directKeys.size:null,
     snrDelta:snr.delta,snrComparable:snr.comparable,packetRate:packets/hours,baselinePacketRate:base.packetRate,uniqueStations:unique,baselineHours:base.hours}};
  }

  function evaluate(at=now()){
   const r=radio();
   if(!settings.enabled)return status('disabled');
   if(!r||!connected)return status('unavailable');
   cover(at);const m=measure(r,at);
   if(!m.enough){close(r,at,'insufficient data');r.level='insufficient-data';r.score=0;r.anomalyStreak=0;r.below=null;return status('insufficient-data',m);}
   const partial=score({distance:m.distance,stations:m.stations,snr:m.snr},settings).total,th=thresholds();
   // Sustained evidence is the time spread of flagged observations in the window, so repeated evaluations add nothing.
   r.anomalyStreak=partial>=th.possible?1+m.flaggedSpanMs/settings.sustainedSlotMs:0;
   const s=score({distance:m.distance,stations:m.stations,snr:m.snr,sustained:r.anomalyStreak||null},settings);r.score=s.total;
   // Hysteresis: enter at a threshold, leave only below threshold minus hysteresis; clearing also needs clearMs below.
   let level=r.level==='insufficient-data'?'normal':r.level;
   if(s.total>=th.strong)level='strong-anomaly';
   else if(level==='strong-anomaly'&&s.total<th.strong-settings.hysteresis)level='possible-opening';
   if(level==='normal'&&s.total>=th.possible)level='possible-opening';
   if(level==='normal'||s.total>=th.possible-settings.hysteresis)r.below=null;
   else{r.below=r.below??at;if(at-r.below>=settings.clearMs){level='normal';r.below=null;}}
   if(level!=='normal'&&s.total>=th.possible)r.lastQualifying=at;
   transition(r,level,s,m,at);r.level=level;
   return status(level,m,s);
  }

  function transition(r,level,s,m,at){
   const evidenceSnapshot={...m.summary,parts:s.parts};
   if(level!=='normal'&&!r.current){
    // Cooldown suppresses a repeat alert, except an escalation beyond the previous event's peak.
    if(r.lastEnd!=null&&at-r.lastEnd<settings.cooldownMs&&!(level==='strong-anomaly'&&r.lastEndLevel!=='strong-anomaly')){r.current={id:'suppressed',suppressed:true,level};return;}
    r.current={id:key.slice(0,8)+'-'+at,start:at,end:null,peakLevel:level,peakScore:s.total,evidence:evidenceSnapshot,endReason:null,stale:false};
    r.events.push(r.current);if(r.events.length>settings.maxEvents)r.events.splice(0,r.events.length-settings.maxEvents);
    emit('alert',{radio:key,level,label:labels[level],score:s.total,event:{...r.current}});return;}
   if(r.current&&r.current.suppressed&&level==='strong-anomaly'&&r.current.level!=='strong-anomaly'&&r.lastEndLevel!=='strong-anomaly'){r.current=null;return transition(r,level,s,m,at);}
   if(r.current&&!r.current.suppressed&&level!=='normal'){
    if(s.total>r.current.peakScore){r.current.peakScore=s.total;r.current.evidence=evidenceSnapshot;}
    if(level==='strong-anomaly'&&r.current.peakLevel!=='strong-anomaly'){r.current.peakLevel=level;emit('alert',{radio:key,level,label:labels[level],score:s.total,escalated:true,event:{...r.current}});}
    return;}
   if(r.current&&level==='normal')close(r,at,'cleared');
  }
  function close(r,at,reason){if(!r.current)return;if(!r.current.suppressed){r.current.end=at;r.current.endReason=reason;r.current.stale=reason!=='cleared';r.lastEnd=at;r.lastEndLevel=r.current.peakLevel;emit('cleared',{radio:key,reason,event:{...r.current}});}r.current=null;}

  function status(state,m,s){const r=radio();
   return {state,label:labels[state],radio:key,connected,rxLogObserved:rxlogSeen,score:s?s.total:0,parts:s?s.parts:null,
    confidence:state==='strong-anomaly'?'high':state==='possible-opening'?'medium':state==='normal'?'low':null,
    comparable:r?r.comparable:null,warning:r?r.warning:null,lastQualifying:r?r.lastQualifying:null,
    evidence:m?m.summary:null,activeEvent:r&&r.current&&!r.current.suppressed?{...r.current}:null};}

  function connect(radioKey,at=now()){
   if(typeof radioKey!=='string'||!radioKey)throw Error('Radio identity required.');
   if(key&&key!==radioKey){const prev=radio();if(prev){cover(at);close(prev,at,'radio switched');resetState(prev);}}
   key=radioKey;radio();connected=true;coverFrom=at;lastActivity=at;rxlogSeen=false;}
  // Clears transient detection state so a later reconnect starts from new evidence only.
  function resetState(r){r.window=[];r.level='normal';r.score=0;r.anomalyStreak=0;r.below=null;}
  // Link-alive signal (e.g. radio statistics or sync) so quiet but connected time still counts as coverage.
  function heartbeat(at=now()){if(!connected||!finite(at))return;cover(at);lastActivity=Math.max(lastActivity??at,at);}
  function setLocation(r,k,loc){r.locations.delete(k);r.locations.set(k,loc);if(r.locations.size>settings.maxLocations){let extra=r.locations.size-settings.maxLocations;for(const old of r.locations.keys()){if(extra--<=0)break;r.locations.delete(old);}}}
  function disconnect(at=now()){cover(at);const r=radio();connected=false;coverFrom=null;lastActivity=null;if(r){close(r,at,'disconnected');resetState(r);}}

  function fingerprint(cfg){return JSON.stringify(['frequency','bandwidth','sf','cr','txPower','antenna','rxLog'].map(k=>cfg?.[k]??null));}
  function noteConfig(cfg){const r=radio();if(!r)return null;const f=fingerprint(cfg);
   if(r.fingerprint!=null&&r.fingerprint!==f&&r.buckets.some(b=>b.coverageMs>0)){r.comparable=false;r.warning='Radio or logging configuration changed. The historical baseline may no longer be comparable; reset it to start learning again.';emit('baseline-warning',{radio:key,warning:r.warning});}
   r.fingerprint=f;return r.warning;}
  function resetBaseline(){const r=radio();if(!r)return;close(r,now(),'baseline reset');const keep={own:r.own,locations:r.locations,events:r.events,fingerprint:r.fingerprint,lastEnd:r.lastEnd,lastEndLevel:r.lastEndLevel};radios.set(key,Object.assign(emptyRadio(),keep));coverFrom=connected?now():null;emit('baseline-reset',{radio:key});}
  function clearHistory(){const r=radio();if(r){r.events=r.current&&!r.current.suppressed?[r.current]:[];r.lastEnd=null;}}
  function setOwnLocation(p){const r=radio();if(r)r.own=located(p)?{lat:p.lat,lon:p.lon}:null;}
  function setContacts(list){const r=radio();if(!r||!Array.isArray(list))return;for(const c of list)if(c&&typeof c.key==='string'&&located(c))setLocation(r,c.key,{lat:c.lat,lon:c.lon});}
  function configure(next={}){
   if(next.sensitivity!==undefined&&!sensitivities.includes(next.sensitivity))throw Error('Sensitivity must be low, medium or high.');
   if(next.baselineDays!==undefined&&!baselineChoices.includes(next.baselineDays))throw Error('Baseline period must be 14, 30 or 60 days.');
   Object.assign(settings,next);settingsVersion++;if(next.enabled===false)for(const r of radios.values()){close(r,now(),'disabled');resetState(r);}}

  function summary(at=now()){const r=radio(),st=evaluate(at);
   return {...st,recent:r?r.recent.slice(-50).reverse():[],flagged:r?r.recent.filter(x=>x.flags.length).slice(-50).reverse():[],
    events:r?r.events.filter(e=>!e.suppressed).slice().reverse().map(e=>({...e,active:e===r.current})):[],
    trend:r?r.buckets.slice(-48).map(b=>({start:b.start,coverageMs:b.coverageMs,packets:b.coverageMs?b.packets:null,stations:b.coverageMs?b.keys.size:null})):[],rejected};}

  function serialize(){const out={version:1,radios:{}};for(const [k,r] of radios){
   out.radios[k]={buckets:r.buckets.map(b=>({start:b.start,coverageMs:b.coverageMs,packets:b.packets,rxlog:b.rxlog,keys:[...b.keys],newKeys:b.newKeys,snr:[...b.snr].map(([c,v])=>[c,v.n,v.sum])})),
    stations:[...r.stations].map(([s,v])=>[s,v.first,v.last,v.buckets,v.lastBucket,v.kind]),distances:r.distances,
    events:r.events.filter(e=>!e.suppressed).map(e=>e.end==null?{...e,end:null,stale:true,endReason:e.endReason||'not observed after restart'}:e),
    own:r.own,locations:[...r.locations],fingerprint:r.fingerprint,comparable:r.comparable,warning:r.warning,lastEnd:r.lastEnd,lastEndLevel:r.lastEndLevel,lastQualifying:r.lastQualifying};}
   return JSON.stringify(out);}
  // Restores validated state only. Malformed entries are skipped or clamped; the call never throws.
  function restore(json){
   let data;try{data=typeof json==='string'?JSON.parse(json):json;}catch{return false;}
   if(!data||typeof data!=='object'||data.version!==1||!data.radios||typeof data.radios!=='object'||Array.isArray(data.radios))return false;
   const num=(x,d=0)=>finite(x)?x:d,count=x=>finite(x)&&x>=0?Math.floor(x):0,opt=x=>finite(x)?x:null,str=x=>typeof x==='string'?x:null,list=x=>Array.isArray(x)?x:[];
   const cap=Math.ceil(settings.baselineDays*86400000/settings.bucketMs)+2,next=new Map();
   for(const [k,v] of Object.entries(data.radios)){
    if(!/^[a-f0-9]{64}$/.test(k)||!v||typeof v!=='object')continue;
    try{
     const r=emptyRadio();
     r.buckets=list(v.buckets).filter(b=>b&&finite(b.start)).sort((a,b)=>a.start-b.start).slice(-cap).map(b=>({start:b.start,
      coverageMs:Math.min(settings.bucketMs,Math.max(0,num(b.coverageMs))),packets:count(b.packets),rxlog:count(b.rxlog),
      keys:new Set(list(b.keys).filter(x=>typeof x==='string').slice(0,settings.maxStationsPerBucket)),newKeys:count(b.newKeys),
      snr:new Map(list(b.snr).filter(x=>Array.isArray(x)&&x.length===3&&typeof x[0]==='string'&&finite(x[1])&&x[1]>=0&&finite(x[2])).slice(0,settings.maxSnrClassesPerBucket).map(([c,n,sum])=>[c,{n,sum}]))}));
     r.stations=new Map(list(v.stations).filter(x=>Array.isArray(x)&&typeof x[0]==='string'&&finite(x[1])&&finite(x[2]))
      .sort((a,b)=>a[2]-b[2]).slice(-settings.maxStations)
      .map(([id,first,last,buckets,lastBucket,kind])=>[id,{first,last,buckets:count(buckets),lastBucket:opt(lastBucket),kind:kind==='key'||kind==='prefix'?kind:null}]));
     r.distances=list(v.distances).filter(d=>d&&finite(d.km)&&d.km>=0&&finite(d.at)).slice(-settings.maxDistances).map(d=>({at:d.at,km:d.km,station:str(d.station)}));
     r.events=list(v.events).filter(e=>e&&typeof e==='object'&&finite(e.start)).slice(-settings.maxEvents).map(e=>({
      id:str(e.id)||'event-'+e.start,start:e.start,end:opt(e.end),peakLevel:e.peakLevel==='strong-anomaly'?'strong-anomaly':'possible-opening',
      peakScore:Math.max(0,Math.min(100,num(e.peakScore))),evidence:e.evidence&&typeof e.evidence==='object'&&!Array.isArray(e.evidence)?e.evidence:null,
      endReason:str(e.endReason)||(finite(e.end)?null:'not observed after restart'),stale:finite(e.end)?!!e.stale:true}));
     r.own=located(v.own)?{lat:v.own.lat,lon:v.own.lon}:null;
     for(const x of list(v.locations).slice(-settings.maxLocations))if(Array.isArray(x)&&typeof x[0]==='string'&&located(x[1]))r.locations.set(x[0],{lat:x[1].lat,lon:x[1].lon});
     r.fingerprint=str(v.fingerprint);r.comparable=v.comparable!==false;r.warning=str(v.warning);
     r.lastEnd=opt(v.lastEnd);r.lastEndLevel=v.lastEndLevel==='strong-anomaly'||v.lastEndLevel==='possible-opening'?v.lastEndLevel:null;r.lastQualifying=opt(v.lastQualifying);
     next.set(k,r);
    }catch{continue;}
   }
   radios.clear();for(const [k,r] of next)radios.set(k,r);
   return true;}

  return {observe,evaluate,summary,connect,disconnect,heartbeat,noteConfig,resetBaseline,clearHistory,setOwnLocation,setContacts,configure,serialize,restore,
   on(f){listeners.add(f);return()=>listeners.delete(f);},get settings(){return {...settings};},get radio(){return key;}};
 }
 root.NightlinkPropagation={createMonitor,normalize,score,relation,defaults,labels,baselineChoices,sensitivities};
 if(typeof module!=='undefined')module.exports=root.NightlinkPropagation;
})(globalThis);
