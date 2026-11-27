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
