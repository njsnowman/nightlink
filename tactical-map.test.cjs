const test=require('node:test'),assert=require('node:assert/strict'),T=require('./tactical-map.js');
test('bearing and distance',()=>{const a={lat:40,lon:-86},n={lat:41,lon:-86},e={lat:40,lon:-85};assert.equal(T.bearing(a,n),0);assert.equal(T.bearing(a,e),90);assert.equal(T.compass(T.bearing(n,a)),'S');
 assert.ok(Math.abs(T.distanceKm(a,n)-111.2)<0.2);assert.ok(Math.abs(T.distanceKm({lat:51.5007,lon:-0.1246},{lat:40.6892,lon:-74.0445})-5574.8)<3);});
test('Maidenhead locator',()=>{assert.equal(T.maidenhead(51.5007,-0.1246),'IO91wm');assert.equal(T.maidenhead(40.6892,-74.0445),'FN20xq');assert.equal(T.maidenhead(-33.8568,151.2153),'QF56od');assert.equal(T.maidenhead(NaN,0),'');});
test('describe without your location gives the grid only',()=>{assert.equal(T.describe(null,{lat:51.5007,lon:-0.1246}),'IO91wm');assert.match(T.describe({lat:40,lon:-86},{lat:41,lon:-86}),/^000° N · 111\.\d km \/ 69\.\d mi · EN/);assert.equal(T.rangeText(0.5),'500 m / 1640 ft');});
