const test=require('node:test'),assert=require('node:assert/strict'),C=require('./coverage-map.js');
test('SNR bands and dot size',()=>{assert.equal(C.band(7)[1],'strong');assert.equal(C.band(0)[1],'good');assert.equal(C.band(-4.9)[1],'fair');assert.equal(C.band(-10)[1],'weak');assert.equal(C.band(-18)[1],'poor');
 assert.equal(C.radius(1),8);assert.equal(C.radius(8),14);assert.equal(C.radius(1000),16);});
