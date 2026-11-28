const test=require('node:test'),assert=require('node:assert/strict'),C=require('./cards-polish.js');
test('cards polish helpers: colour slot, SNR word, activity classes, hourly counts',()=>{
 assert.equal(C.hue('Alex'),C.hue('Alex'));assert.ok(C.hue('Alex')>=0&&C.hue('Alex')<8);
 assert.deepEqual([C.snrWord(9),C.snrWord(2),C.snrWord(-4),C.snrWord(null)],[['good','ok'],['fair','warn'],['weak','bad'],null]);
 assert.equal(C.classify('Bluetooth companion connected'),'link');assert.equal(C.classify('Radio synchronized'),'radio');assert.equal(C.classify('Message received from Alex'),'message');assert.equal(C.classify('Sync failed: timed out'),'error');assert.equal(C.classify('Nightlink started'),'info');
 assert.deepEqual(C.splitEntry('1:01:36 AM · Radio synchronized'),{time:'1:01:36 AM',text:'Radio synchronized'});assert.deepEqual(C.splitEntry('Plain'),{time:'',text:'Plain'});
 const now=100000;assert.deepEqual(C.hourly([{timestamp:now-60},{timestamp:now-30},{heardAt:now-3700,timestamp:1},{timestamp:now-99999}],now,3),[0,1,2]);
});
