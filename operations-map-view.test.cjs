const assert=require('node:assert/strict');
const {KEY,valid,read,save,restore,bind}=require('./operations-map-view.js');

class Storage{
 constructor(){this.values=new Map();}
 getItem(key){return this.values.get(key)??null;}
 setItem(key,value){this.values.set(key,String(value));}
}
class MapView{
 constructor(){this.center={lat:0,lng:0};this.zoom=2;this.handlers=new Map();}
 on(event,callback){if(!this.handlers.has(event))this.handlers.set(event,new Set());this.handlers.get(event).add(callback);}
 off(event,callback){this.handlers.get(event)?.delete(callback);}
 setView(center,zoom){this.center={lat:center[0],lng:center[1]};this.zoom=zoom;}
 getCenter(){return this.center;}
 getZoom(){return this.zoom;}
 move(lat,lon,zoom){this.center={lat,lng:lon};this.zoom=zoom;for(const callback of this.handlers.get('moveend')||[])callback();}
}

const storage=new Storage(),first=new MapView();
assert.equal(valid({lat:39.1,lon:-84.2,zoom:12}),true);
for(const view of [{lat:86,lon:0,zoom:5},{lat:0,lon:181,zoom:5},{lat:0,lon:0,zoom:20},{lat:NaN,lon:0,zoom:5}])assert.equal(valid(view),false);
const unbind=bind(first,storage,'operation-a');
first.move(39.1,-84.2,12);
assert.deepEqual(read(storage,'operation-a'),{lat:39.1,lon:-84.2,zoom:12});
assert.equal(read(storage,'operation-b'),null);

const reopened=new MapView();
assert.equal(restore(reopened,storage,'operation-a'),true);
assert.deepEqual(reopened.center,{lat:39.1,lng:-84.2});
assert.equal(reopened.zoom,12);
assert.equal(restore(new MapView(),storage,'operation-b'),false);

unbind();
first.move(40,-83,8);
assert.deepEqual(read(storage,'operation-a'),{lat:39.1,lon:-84.2,zoom:12});

storage.setItem(KEY,'not json');
assert.equal(read(storage,'operation-a'),null);
assert.equal(save(storage,'operation-a',{lat:0,lon:0,zoom:20}),false);

storage.setItem(KEY,JSON.stringify({version:1,views:{'operation-a':{lat:90,lon:0,zoom:2}}}));
assert.equal(read(storage,'operation-a'),null);

const limited=new Storage();
for(let i=0;i<105;i++)assert.equal(save(limited,'operation-'+i,{lat:0,lon:i/10,zoom:3}),true);
const state=JSON.parse(limited.getItem(KEY));
assert.equal(Object.keys(state.views).length,100);
assert.equal(read(limited,'operation-0'),null);
assert.deepEqual(read(limited,'operation-104'),{lat:0,lon:10.4,zoom:3});

console.log('Operation map view preference tests passed.');
