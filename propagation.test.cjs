/* Synthetic fixtures only: frames and stations below are generated, not recorded from any radio. */
const {test}=require('node:test'),assert=require('node:assert/strict');
const P=require('./propagation.js');
const HOUR=3600000,MIN=60000,T0=Date.UTC(2026,0,1);
const RADIO='aa'.repeat(32),OTHER='bb'.repeat(32);
const key=n=>n.toString(16).padStart(64,'0');
const int8=v=>(Math.round(v)+256)%256;
// RX-log 0x88 frame: snr*4, rssi, header (version 0, type, route), [transport codes], path byte, path hashes, payload.
function rx({type=4,route=1,hops=0,snr=-5,rssi=-100,station=key(1),nonce=0,pathBytes}={}){
 const header=(type<<2)|route,out=[0x88,int8(snr*4),int8(rssi),header];
 if(route===0||route===3)out.push(0,0,0,0);
 out.push(hops);for(let i=0;i<hops;i++)out.push(pathBytes?pathBytes[i]:0x10+i);
 if(type===4){out.push(...Buffer.from(station,'hex'),nonce&255,nonce>>8&255,0,0,...Array(64).fill(7),0x81);}
 else out.push(nonce&255,nonce>>8&255,1,2,3);
 return out;
}
function setup(opts={}){let clock=T0;const m=P.createMonitor({now:()=>clock,...opts});const events=[];m.on(e=>events.push(e));
 m.connect(RADIO,clock);
 return {m,events,get now(){return clock;},set now(v){clock=v;},tick(ms){clock+=ms;return clock;}};}
// Steady traffic: the same three stations every 10 minutes, heard through one repeater.
function learn(s,hours=30,stations=[1,2,3]){let n=0;for(let i=0;i<hours*6;i++){s.tick(10*MIN);for(const id of stations)s.m.observe(P.normalize.rxLog(rx({station:key(id),hops:1,snr:-8,nonce:n++}),s.now));s.m.evaluate(s.now);}}
const feed=(s,frame)=>s.m.observe(P.normalize.rxLog(frame,s.now));

test('a new radio is learning the baseline, not normal',()=>{const s=setup();const st=s.m.evaluate(s.now);assert.equal(st.state,'insufficient-data');assert.equal(st.label,'Learning baseline');assert.equal(st.confidence,null);});
test('baseline accumulates covered hours and steady traffic stays normal without alerts',()=>{const s=setup();learn(s);const st=s.m.evaluate(s.now);assert.equal(st.state,'normal');assert.ok(st.evidence.baselineHours>=24);assert.equal(s.events.filter(e=>e.type==='alert').length,0);assert.equal(st.score,0);});
test('disconnected time is not counted as RF silence',()=>{const s=setup();learn(s,10);s.m.disconnect(s.now);s.tick(48*HOUR);s.m.connect(RADIO,s.now);const st=s.m.evaluate(s.now);assert.equal(st.state,'insufficient-data');assert.ok(st.evidence.baselineHours<24);const trend=s.m.summary(s.now).trend;assert.ok(trend.every(b=>b.coverageMs>0||b.packets===null));});
test('many new forwarded stations raise the station score without any distance claim',()=>{const s=setup();learn(s);s.m.setOwnLocation({lat:40,lon:-86});s.m.setContacts([100,101,102,103,104,105,106,107].map(i=>({key:key(i),lat:42,lon:-80})));
 for(let i=100;i<108;i++){s.tick(MIN);feed(s,rx({station:key(i),hops:3,snr:-12,nonce:i}));}
 const st=s.m.evaluate(s.now),sum=s.m.summary(s.now);assert.ok(st.parts.stations>0);assert.equal(st.parts.distance,null);assert.ok(sum.recent.every(r=>r.distanceKm===null));assert.equal(st.evidence.unusualDirect,null,'no measurable distance is unknown, not 0');assert.ok(sum.recent.every(r=>!r.flags.includes('unusual direct distance')));});
test('verified zero-hop receptions from distant known stations score distance evidence',()=>{const s=setup();learn(s);s.m.setOwnLocation({lat:40,lon:-86});s.m.setContacts([{key:key(50),lat:41.8,lon:-86},{key:key(51),lat:40,lon:-83.6}]);
 s.tick(MIN);feed(s,rx({station:key(50),hops:0,nonce:900}));s.tick(MIN);feed(s,rx({station:key(51),hops:0,nonce:901}));
 const st=s.m.evaluate(s.now),rows=s.m.summary(s.now).flagged;assert.equal(st.parts.distance,40);assert.equal(st.evidence.unusualDirect,2);
 const d=rows.find(r=>r.station===key(50)).distanceKm;assert.ok(d>190&&d<210,String(d));assert.ok(['possible-opening','strong-anomaly'].includes(st.state));
 assert.equal(s.events.filter(e=>e.type==='alert').length,1);assert.equal(st.label,P.labels[st.state]);
 assert.deepEqual(Object.values(P.labels).sort(),['Learning baseline','Monitoring disabled','Monitoring unavailable','Normal','Possible RF opening','Strong RF anomaly']);});
test('one distant station gives at most half distance credit; unknown location gives none',()=>{const s=setup();learn(s);s.m.setOwnLocation({lat:40,lon:-86});s.m.setContacts([{key:key(60),lat:42,lon:-86}]);
 s.tick(MIN);feed(s,rx({station:key(60),hops:0,nonce:1}));s.tick(MIN);feed(s,rx({station:key(61),hops:0,nonce:2}));
 const st=s.m.evaluate(s.now);assert.equal(st.parts.distance,20);assert.equal(s.m.summary(s.now).recent.find(r=>r.station===key(61)).distanceKm,null);});
test('retransmissions of one packet count once and cannot inflate confidence',()=>{const s=setup();learn(s);s.m.setOwnLocation({lat:40,lon:-86});s.m.setContacts([{key:key(70),lat:42,lon:-86}]);
 let accepted=0;for(let i=0;i<20;i++){s.tick(1000);accepted+=feed(s,rx({station:key(70),hops:i%3,nonce:5,pathBytes:[i,i+1,i+2]}))?1:0;}
 assert.equal(accepted,1);const st=s.m.evaluate(s.now);assert.ok(st.parts.distance<=20);assert.equal(st.state,'normal');});
test('multi-hop, direct-routed and 0xFF receptions are never treated as direct',()=>{
 const a=P.normalize.rxLog(rx({hops:2}),T0);assert.equal(a.relation,'forwarded');assert.equal(a.hops,2);
 const b=P.normalize.rxLog(rx({type:2,route:2,hops:0}),T0);assert.equal(b.relation,'unknown');
 const c=P.normalize.message({kind:'direct',prefix:'abcdefabcdef',pathLength:255,snr:5,textType:0,timestamp:1,text:'x'},T0);assert.equal(c.relation,'unknown');assert.equal(c.hops,null);
 const d=P.normalize.message({kind:'channel',slot:1,pathLength:0x42,snr:null,textType:0,timestamp:2,text:'y'},T0);assert.equal(d.hops,2);assert.equal(d.relation,'forwarded');
 const e=P.normalize.advert({key:key(9),lat:41,lon:-86,pathLength:0},T0);assert.equal(e.relation,'unknown');assert.equal(e.snr,null);});
test('path prefixes from messages are labeled as prefixes, never as full identities',()=>{const o=P.normalize.message({kind:'direct',prefix:'abcdefabcdef',pathLength:0,snr:1,textType:0,timestamp:3,text:'z'},T0);assert.equal(o.stationKind,'prefix');assert.equal(o.station,'abcdefabcdef');});
test('missing SNR and RSSI stay null and do not create SNR evidence',()=>{const s=setup();learn(s);for(let i=0;i<6;i++){s.tick(MIN);s.m.observe(P.normalize.message({kind:'direct',prefix:'0102030405'+String(i).padStart(2,'0'),pathLength:0,snr:null,textType:0,timestamp:i,text:'t'},s.now));}
 const r=s.m.summary(s.now);assert.ok(r.recent.filter(x=>x.source==='message').every(x=>x.snr===null&&x.rssi===null));assert.equal(r.evidence.snrComparable,3,'only RX-log stations with SNR are comparable');});
test('comparable SNR improvement is measured against the same stations and packet class',()=>{const s=setup();learn(s);s.tick(31*MIN);for(let i=0;i<3;i++)for(const id of [1,2,3]){s.tick(MIN);feed(s,rx({station:key(id),hops:1,snr:4,nonce:5000+i*10+id}));}
 const st=s.m.evaluate(s.now);assert.ok(st.evidence.snrDelta>11&&st.evidence.snrDelta<13,String(st.evidence.snrDelta));assert.equal(st.evidence.snrComparable,3);assert.ok(st.parts.snr>15);});
test('corrupted and malformed events are rejected without throwing',()=>{const s=setup();
 assert.equal(P.normalize.rxLog([0x88,1],T0),null);assert.equal(P.normalize.rxLog([0x88,0,0,(4<<2)|1,0x05,1],T0),null);assert.equal(P.normalize.rxLog(null,T0),null);assert.equal(P.normalize.rxLog([0x89,0,0,4,0],T0),null);
 assert.equal(P.normalize.message({kind:'other'},T0),null);assert.equal(P.normalize.advert({key:'zz'},T0),null);
 assert.equal(s.m.observe(null),false);assert.equal(s.m.observe({at:NaN}),false);assert.equal(s.m.restore('{not json'),false);assert.equal(s.m.restore({version:2}),false);});
test('disconnect ends an active event as stale and reports monitoring unavailable',()=>{const s=setup();learn(s);s.m.setOwnLocation({lat:40,lon:-86});s.m.setContacts([{key:key(80),lat:42,lon:-86},{key:key(81),lat:40,lon:-83}]);
 s.tick(MIN);feed(s,rx({station:key(80),hops:0,nonce:1}));feed(s,rx({station:key(81),hops:0,nonce:2}));assert.notEqual(s.m.evaluate(s.now).state,'normal');
 s.m.disconnect(s.tick(MIN));const st=s.m.evaluate(s.now);assert.equal(st.state,'unavailable');assert.equal(st.activeEvent,null);
 const ev=s.m.summary(s.now).events[0];assert.equal(ev.endReason,'disconnected');assert.equal(ev.stale,true);assert.equal(ev.active,false);
 s.m.connect(RADIO,s.tick(MIN));assert.equal(s.m.evaluate(s.now).activeEvent,null);});
test('switching radios keeps baselines and history separate',()=>{const s=setup();learn(s);assert.equal(s.m.evaluate(s.now).state,'normal');
 s.m.connect(OTHER,s.tick(MIN));assert.equal(s.m.evaluate(s.now).state,'insufficient-data');feed(s,rx({station:key(1),hops:1,nonce:77}));
 assert.ok(s.m.summary(s.now).recent.every(r=>r.at>T0+30*HOUR));s.m.connect(RADIO,s.tick(MIN));assert.equal(s.m.evaluate(s.now).state,'normal');});
test('restart restores baseline and marks open events stale',()=>{const s=setup();learn(s);s.m.setOwnLocation({lat:40,lon:-86});s.m.setContacts([{key:key(90),lat:42,lon:-86},{key:key(91),lat:40,lon:-83}]);
 s.tick(MIN);feed(s,rx({station:key(90),hops:0,nonce:1}));feed(s,rx({station:key(91),hops:0,nonce:2}));s.m.evaluate(s.now);
 const json=s.m.serialize();let clock=s.now+5*MIN;const m2=P.createMonitor({now:()=>clock});assert.equal(m2.restore(json),true);m2.connect(RADIO,clock);
 const st=m2.evaluate(clock);assert.equal(st.state,'normal');assert.equal(st.activeEvent,null);const ev=m2.summary(clock).events[0];assert.equal(ev.stale,true);assert.equal(ev.active,false);
 assert.ok(!json.includes('"text"'));});
test('hysteresis holds the alert in the band, clears after clearMs, and cooldown blocks repeats',()=>{const s=setup({clearMs:10*MIN,cooldownMs:60*MIN});learn(s);s.m.setOwnLocation({lat:40,lon:-86});
 const far=(id,n)=>{s.m.setContacts([{key:key(id),lat:42,lon:-86}]);feed(s,rx({station:key(id),hops:0,nonce:n}));};
 s.tick(MIN);far(200,1);far(201,2);assert.equal(s.m.evaluate(s.now).state!=='normal',true);
 for(let i=0;i<25;i++){s.tick(2*MIN);s.m.evaluate(s.now);}
 assert.equal(s.m.evaluate(s.now).state,'normal');assert.equal(s.events.filter(e=>e.type==='cleared').length,1);
 s.tick(MIN);far(202,3);far(203,4);s.m.evaluate(s.now);assert.equal(s.events.filter(e=>e.type==='alert').length,1);
 for(let i=0;i<40;i++){s.tick(2*MIN);s.m.evaluate(s.now);}
 s.tick(MIN);far(204,5);far(205,6);s.m.evaluate(s.now);assert.equal(s.events.filter(e=>e.type==='alert').length,2);});
test('configuration changes mark the baseline not comparable until reset',()=>{const s=setup();s.m.noteConfig({frequency:910.525,sf:7});learn(s);assert.equal(s.m.evaluate(s.now).state,'normal');
 const w=s.m.noteConfig({frequency:910.525,sf:7,antenna:'new'});assert.match(w,/no longer be comparable/);const st=s.m.evaluate(s.now);assert.equal(st.state,'insufficient-data');assert.equal(st.comparable,false);
 s.m.resetBaseline();assert.equal(s.m.evaluate(s.now).comparable,true);assert.equal(s.m.evaluate(s.now).state,'insufficient-data');});
test('settings validate sensitivity and baseline period; disabled stops evaluation',()=>{const s=setup();assert.throws(()=>s.m.configure({sensitivity:'extreme'}));assert.throws(()=>s.m.configure({baselineDays:7}));
 s.m.configure({baselineDays:60,sensitivity:'high'});assert.equal(s.m.settings.baselineDays,60);s.m.configure({enabled:false});const st=s.m.evaluate(s.now);assert.equal(st.state,'disabled');assert.equal(st.label,'Monitoring disabled');});
test('storage stays bounded over long runs',()=>{const s=setup({baselineDays:14,maxStations:300});for(let h=0;h<30*24;h++){s.tick(HOUR);for(let i=0;i<3;i++)feed(s,rx({station:key(h*3+i+1),hops:1,nonce:h*3+i}));if(h%24===0)s.m.evaluate(s.now);}
 const data=JSON.parse(s.m.serialize()).radios[RADIO];assert.ok(data.buckets.length<=14*24+2,String(data.buckets.length));assert.ok(data.stations.length<=300+3,String(data.stations.length));assert.ok(s.m.summary(s.now).recent.length<=50);});
test('50,000 observations are processed within a bounded time',()=>{const s=setup();const frames=Array.from({length:500},(_,i)=>rx({station:key(i%120+1),hops:i%4,nonce:i}));const t=performance.now();
 for(let i=0;i<50000;i++){s.now=T0+i*500;s.m.observe(P.normalize.rxLog(frames[i%500].map((v,j)=>j===frames[i%500].length-5?(i&255):v),s.now));if(i%600===0)s.m.evaluate(s.now);}
 const ms=performance.now()-t;assert.ok(ms<4000,'took '+ms+' ms');});
test('score awards no points for unavailable evidence',()=>{const r=P.score({});assert.equal(r.total,0);assert.deepEqual(r.parts,{distance:null,stations:null,snr:null,sustained:null});});
// Review follow-ups (#120).
const burst=(s,ids,n0=0)=>{s.m.setContacts(ids.map(id=>({key:key(id),lat:42,lon:-86})));ids.forEach((id,i)=>{s.tick(1000);feed(s,rx({station:key(id),hops:0,nonce:n0+i}));});};
test('repeated evaluate and summary calls on one burst cannot add sustained points',()=>{const s=setup();learn(s);s.m.setOwnLocation({lat:40,lon:-86});
 burst(s,[300,301,302,303,304,305,306,307]);const first=s.m.evaluate(s.now);assert.ok(first.score>=40&&first.score<70,String(first.score));
 for(let i=0;i<50;i++){s.tick(600);(i%2?s.m.summary:s.m.evaluate)(s.now);}
 const st=s.m.evaluate(s.now);assert.notEqual(st.state,'strong-anomaly');assert.ok(st.parts.sustained<2,String(st.parts.sustained));assert.equal(s.events.filter(e=>e.type==='alert'&&e.detail.level==='strong-anomaly').length,0);});
test('flagged evidence spread over time earns sustained credit',()=>{const s=setup();learn(s);s.m.setOwnLocation({lat:40,lon:-86});
 for(let k=0;k<5;k++){burst(s,[400+k*2,401+k*2],k*10);s.tick(5*MIN);s.m.evaluate(s.now);}
 assert.ok(s.m.evaluate(s.now).parts.sustained>=14);});
test('switching back to a radio left mid-alert raises no alert without new evidence',()=>{const s=setup();learn(s);s.m.setOwnLocation({lat:40,lon:-86});
 burst(s,[500,501]);assert.notEqual(s.m.evaluate(s.now).state,'normal');const alerts=()=>s.events.filter(e=>e.type==='alert').length;const before=alerts();
 s.m.connect(OTHER,s.tick(MIN));s.m.evaluate(s.now);s.m.connect(RADIO,s.tick(MIN));const st=s.m.evaluate(s.now);
 assert.equal(st.state,'normal');assert.equal(alerts(),before);const ev=s.m.summary(s.now).events.find(e=>e.endReason==='radio switched');assert.ok(ev&&ev.stale&&!ev.active);});
test('restore skips structurally corrupt entries, clamps values and never throws',()=>{const m=P.createMonitor({now:()=>T0});
 const bad={version:1,radios:{[RADIO]:{buckets:[null,{start:'x'},{start:T0,coverageMs:9e15,packets:-4,keys:[1,'a'],snr:[['c','n','x'],['ok',2,'s'],['good',2,-6],null]}],
  stations:[null,['a',1],['b',T0,T0,2,null,'evil']],distances:[{km:NaN,at:1},{km:5,at:T0}],events:[null,{start:'x'},{start:T0,end:null,peakLevel:'bogus',peakScore:1e9}],
  locations:[null,['k',null],['k2',{lat:41,lon:-86}]],own:{lat:'x'},lastEndLevel:'bogus'},[OTHER]:null,zz:{buckets:[]}}};
 assert.doesNotThrow(()=>m.restore(bad));assert.equal(m.restore(bad),true);assert.equal(m.restore('[]'),false);assert.equal(m.restore({version:1,radios:[]}),false);
 const d=JSON.parse(m.serialize()).radios[RADIO];assert.equal(d.buckets.length,1);assert.equal(d.buckets[0].coverageMs,HOUR);assert.equal(d.buckets[0].packets,0);assert.deepEqual(d.buckets[0].snr,[['good',2,-6]]);
 assert.equal(d.stations.length,1);assert.equal(d.distances.length,1);assert.equal(d.events.length,1);assert.equal(d.events[0].peakScore,100);assert.equal(d.locations.length,1);assert.equal(d.lastEndLevel,null);
 m.connect(RADIO,T0+HOUR);const st=m.evaluate(T0+HOUR);assert.ok(['insufficient-data','normal'].includes(st.state));assert.ok(!Number.isNaN(st.score));});
test('cooldown state survives restart',()=>{const s=setup({cooldownMs:60*MIN,clearMs:5*MIN});learn(s);s.m.setOwnLocation({lat:40,lon:-86});
 burst(s,[600,601]);s.m.evaluate(s.now);for(let i=0;i<25;i++){s.tick(2*MIN);s.m.evaluate(s.now);}
 const data=JSON.parse(s.m.serialize()).radios[RADIO];assert.ok(['possible-opening','strong-anomaly'].includes(data.lastEndLevel),String(data.lastEndLevel));
 const m2=P.createMonitor({now:()=>s.now});assert.equal(m2.restore(JSON.stringify({version:1,radios:{[RADIO]:data}})),true);assert.equal(JSON.parse(m2.serialize()).radios[RADIO].lastEndLevel,data.lastEndLevel);});
test('baseline reset and insufficient data close an open event',()=>{const s=setup();learn(s);s.m.setOwnLocation({lat:40,lon:-86});burst(s,[700,701]);assert.ok(s.m.evaluate(s.now).activeEvent);
 s.m.resetBaseline();let ev=s.m.summary(s.now).events[0];assert.equal(ev.endReason,'baseline reset');assert.notEqual(ev.end,null);assert.equal(ev.active,false);
 const t=setup();t.m.noteConfig({frequency:1});learn(t);t.m.setOwnLocation({lat:40,lon:-86});burst(t,[702,703]);assert.ok(t.m.evaluate(t.now).activeEvent);
 t.m.noteConfig({frequency:2});const st=t.m.evaluate(t.now);assert.equal(st.state,'insufficient-data');assert.equal(st.activeEvent,null);ev=t.m.summary(t.now).events[0];assert.equal(ev.endReason,'insufficient data');});
test('SNR comparison does not mix different routes for one station',()=>{const s=setup();learn(s);s.tick(31*MIN);for(let i=0;i<3;i++)for(const id of [1,2,3]){s.tick(MIN);feed(s,rx({station:key(id),hops:3,snr:4,nonce:7000+i*10+id}));}
 const st=s.m.evaluate(s.now);assert.equal(st.evidence.snrDelta,null);assert.equal(st.parts.snr,null);});
test('silent link time beyond the idle gap is not counted as coverage unless heartbeats arrive',()=>{
 const a=setup();a.m.observe(P.normalize.rxLog(rx({station:key(1),hops:1,nonce:1}),a.now));a.tick(5*HOUR);a.m.evaluate(a.now);
 const ha=JSON.parse(a.m.serialize()).radios[RADIO].buckets.reduce((x,b)=>x+b.coverageMs,0);assert.ok(ha<=31*MIN,String(ha));
 const b=setup();b.m.observe(P.normalize.rxLog(rx({station:key(1),hops:1,nonce:1}),b.now));for(let i=0;i<10;i++){b.tick(30*MIN);b.m.heartbeat(b.now);}b.m.evaluate(b.now);
 const hb=JSON.parse(b.m.serialize()).radios[RADIO].buckets.reduce((x,c)=>x+c.coverageMs,0);assert.equal(hb,5*HOUR);});
test('locations are capped',()=>{const s=setup({maxLocations:50});s.m.setContacts(Array.from({length:200},(_,i)=>({key:key(i+1),lat:41,lon:-86})));assert.equal(JSON.parse(s.m.serialize()).radios[RADIO].locations.length,50);});
test('50,000 direct observations with known locations stay within a bounded time',()=>{const s=setup();learn(s,30);s.m.setOwnLocation({lat:40,lon:-86});
 s.m.setContacts(Array.from({length:120},(_,i)=>({key:key(i+1000),lat:40+i/100,lon:-86})));const frames=Array.from({length:500},(_,i)=>rx({station:key(i%120+1000),hops:0,nonce:i}));const start=s.now,t=performance.now();
 for(let i=0;i<50000;i++){s.now=start+i*500;s.m.observe(P.normalize.rxLog(frames[i%500].map((v,j)=>j===frames[i%500].length-5?(i&255):v),s.now));if(i%600===0)s.m.evaluate(s.now);}
 const ms=performance.now()-t;assert.ok(ms<6000,'took '+ms+' ms');});
