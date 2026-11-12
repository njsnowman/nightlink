const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const os=require('node:os');
const path=require('node:path');
const {EventEmitter}=require('node:events');
const store=require('./plugins/nightlink-live/store.cjs');
const {getStatus,getEvents,dataFile,sanitizeEvent}=store;
const {install}=require('./codex-bridge-desktop.cjs');

test('Codex status contains only allowlisted monitor data',()=>{
 const status=store.sanitizeState({schema:1,appRunning:true,updatedAt:1000,
  snapshot:{state:'normal',connected:true,rxLogObserved:true,baselineHours:25,baselineTargetHours:24,packetRate:292,
   baselinePacketRate:140,activeAlert:null,alertCount:0,comparable:true,radio:'private key',station:'private station',lat:42.2,message:'private message',
   observations:[{at:900,source:'rxlog',relation:'forwarded',hops:2,snr:12.5,rssi:-72,flagCount:1,station:'private station',message:'private message'}]},events:[]},1000);
 assert.deepEqual(status.snapshot,{state:'normal',connected:true,rxLogObserved:true,observations:[{at:900,source:'rxlog',relation:'forwarded',hops:2,snr:12.5,rssi:-72,flagCount:1}],baselineHours:25,baselineTargetHours:24,packetRate:292,
  baselinePacketRate:140,activeAlert:null,alertCount:0,comparable:true});assert.equal(JSON.stringify(status).includes('private'),false);
});

test('status marks old snapshots stale and identifies app lifecycle',async()=>{
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'nightlink-codex-'));const file=path.join(dir,'state.json');
 await fs.writeFile(file,JSON.stringify({schema:1,appRunning:false,updatedAt:1000,snapshot:{state:'unavailable',connected:false},events:[],nextCursor:3}));
 const status=await getStatus(file,1000+121000);assert.equal(status.stale,true);assert.equal(status.appRunning,false);assert.equal(status.snapshot.connected,false);
 await fs.rm(dir,{recursive:true,force:true});
});

test('event pages are cursor ordered, bounded and redact unrecognized data',async()=>{
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'nightlink-codex-'));const file=path.join(dir,'state.json');
 const events=[{cursor:1,at:1,type:'app-started',summary:'injected secret'},{cursor:2,at:2,type:'alert',level:'strong-anomaly'},
  {cursor:3,at:3,type:'status',state:'normal',connected:true,summary:'private contact name'},{cursor:4,at:4,type:'status',state:'unknown',connected:false}];
 await fs.writeFile(file,JSON.stringify({schema:1,appRunning:true,updatedAt:4,snapshot:{state:'normal',connected:true},events,nextCursor:5}));
 const page=await getEvents({file,since:1,limit:2});assert.deepEqual(page.events.map(e=>e.cursor),[2,3]);
 assert.equal(JSON.stringify(page).includes('private'),false);assert.equal(JSON.stringify(page).includes('injected'),false);assert.equal(page.latestCursor,3);
 await assert.rejects(getEvents({file,since:-1}));await assert.rejects(getEvents({file,limit:101}));await fs.rm(dir,{recursive:true,force:true});
});

test('malformed and oversized store files fail closed',async()=>{
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'nightlink-codex-'));const file=path.join(dir,'state.json');
 await fs.writeFile(file,'{');assert.deepEqual(await getStatus(file),{available:false,error:'malformed_state',stale:true});
 await fs.writeFile(file,'x'.repeat(1024*1024+1));assert.equal((await getStatus(file)).error,'state_file_too_large');
 assert.equal(sanitizeEvent({cursor:1,at:1,type:'status',summary:'freeform'}),false);await fs.rm(dir,{recursive:true,force:true});
});

test('application data location matches Nightlink user-data folder',()=>{
 assert.equal(dataFile({APPDATA:'C:/Users/test/AppData/Roaming'},'win32','C:/Users/test'),path.join('C:/Users/test/AppData/Roaming','Meshline','codex-bridge','state.json'));
});

test('trusted app publisher caps event retention and strips unapproved fields',async()=>{
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'nightlink-codex-'));const app=new EventEmitter();app.getPath=()=>dir;
 let publish;const ipcMain={on:(name,fn)=>{if(name==='codex-bridge:publish')publish=fn;}};
 const installed=install({app,ipcMain,trusted:()=>true});await new Promise(resolve=>setTimeout(resolve,20));
 for(let i=0;i<510;i++)await publish({sender:'trusted'}, {state:i%2?'normal':'insufficient-data',connected:!!(i%2),
  baselineHours:12,baselineTargetHours:24,packetRate:10,baselinePacketRate:9,alertCount:0,comparable:true,message:'never persist this'});
 const saved=JSON.parse(await fs.readFile(installed.file,'utf8'));assert.equal(saved.events.length,500);
 assert.equal(JSON.stringify(saved).includes('never persist'),false);assert.equal(saved.snapshot.message,undefined);
 app.emit('before-quit');const stopped=JSON.parse(await fs.readFile(installed.file,'utf8'));assert.equal(stopped.appRunning,false);
 assert.equal(stopped.events.at(-1).type,'app-stopped');await fs.rm(dir,{recursive:true,force:true});
});
