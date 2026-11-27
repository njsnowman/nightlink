const test=require('node:test'),assert=require('node:assert/strict'),P=require('./command-palette.js'),S=require('./node-signal.js');
test('palette ranks prefix, word prefix, substring, then in-order letters',()=>{
 const items=[{label:'Network map'},{label:'Nodes'},{label:'#public'},{label:'Search messages'},{label:'Messages'}].map((x,i)=>({...x,i}));
 assert.deepEqual(P.filter(items,'mes').map(x=>x.label),['Messages','Search messages']);
 assert.deepEqual(P.filter(items,'pub').map(x=>x.label),['#public']);
 assert.deepEqual(P.filter(items,'nwm').map(x=>x.label),['Network map']);
 assert.equal(P.filter(items,'zzz').length,0);assert.equal(P.filter(items,'').length,5);
});
test('node signal bars and relative age',()=>{
 assert.deepEqual([null,-12,-7,-2,3,9].map(S.bars),[0,0,1,2,3,4]);
 assert.equal(S.age(0),'Unknown');assert.equal(S.age(1000,1030),'just now');assert.equal(S.age(1000,1000+300),'5m ago');
 assert.equal(S.age(1000,1000+7200),'2h ago');assert.equal(S.age(1000,1000+3*86400),'3d ago');
});
test('node SNR from last hop or direct packets, skipping ambiguous hashes',()=>{
 const R=require('./routes.js');const resolve=(R.resolvePath?R:globalThis.MeshlineRoutes).resolvePath.bind(R.resolvePath?R:globalThis.MeshlineRoutes);
 const contacts=[{key:'a1'+'0'.repeat(62),type:2},{key:'b2'+'0'.repeat(62),type:2},{key:'b2'+'1'.repeat(62),type:2},{key:'c3'+'0'.repeat(62),type:1}];
 const msgs=[
  {timestamp:1,observedRoute:{path:['a1'],snr:-3}},{timestamp:2,observedRoute:{path:['ff','a1'],snr:6}},
  {timestamp:3,observedRoute:{path:['b2'],snr:9}},{timestamp:4,observedRoute:{direct:true,path:[],snr:4},sender:'C'},
  {timestamp:5,own:true,observedRoute:{path:['a1'],snr:1}},{timestamp:6,observedRoute:{path:['a1'],snr:null}}];
 const h=S.heard(msgs,contacts,resolve,m=>m.sender==='C'?contacts[3]:null);
 assert.deepEqual(h.get(contacts[0].key),{snr:6,at:2},'latest final-hop SNR');assert.equal(h.has(contacts[1].key),false,'ambiguous b2 skipped');
 assert.deepEqual(h.get(contacts[3].key),{snr:4,at:4},'direct sender');
});
test('zero-hop adverts give an exact-key SNR; relayed or other packet types do not',()=>{
 const R=require('./routes.js');const key=Buffer.alloc(32,0xab),frame=(header,path)=>Uint8Array.from([0x88,Math.round(7.5*4),-60&255,header,path.length,...path,...key,1,0,0,0,...Buffer.alloc(64),0x81]);
 const d=R.parseAdvert(frame((4<<2)|1,[]));assert.equal(d.key,'ab'.repeat(32));assert.equal(d.direct,true);assert.equal(d.hops,0);assert.equal(d.snr,7.5);assert.equal(d.rssi,-60);assert.equal(d.timestamp,1);
 assert.equal(R.parseAdvert(frame((4<<2)|1,[0x11,0x22])).direct,false,'relayed advert');
 assert.equal(R.parseAdvert(frame((5<<2)|1,[])),null,'group text is not an advert');assert.equal(R.parseAdvert(Uint8Array.from([0x88,0,0,0x11,0])),null,'truncated');
 const m=S.merge(new Map([['a',{snr:1,at:10}],['b',{snr:2,at:50}]]),new Map([['a',{snr:5,at:20}],['b',{snr:9,at:40}],['c',{snr:3,at:5}]]));
 assert.deepEqual([m.get('a'),m.get('b').snr,m.get('c').source],[{snr:5,at:20,source:'advert'},2,'advert']);
});
test('nodes without a direct reading show relayed hops or route length',()=>{
 assert.equal(S.relayLabel({hops:2},null),'relayed · 2 hops');assert.equal(S.relayLabel({hops:1},3),'relayed · 1 hop');
 assert.equal(S.relayLabel(null,3),'route · 3 hops');assert.equal(S.relayLabel(null,255),'—');assert.equal(S.relayLabel(null,null),'—');assert.equal(S.relayLabel({hops:0},0),'—');
});
