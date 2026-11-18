const fs=require('node:fs/promises');
const fsSync=require('node:fs');
const path=require('node:path');

const STATES=new Set(['disabled','unavailable','insufficient-data','normal','possible-opening','strong-anomaly']);
const MAX_EVENTS=500;
const finite=(v,min=0,max=1e9)=>typeof v==='number'&&Number.isFinite(v)&&v>=min&&v<=max?v:null;

function install({app,ipcMain,trusted}){
 const directory=path.join(app.getPath('userData'),'codex-bridge');
 const file=path.join(directory,'state.json');
 let state={schema:1,appRunning:true,updatedAt:null,snapshot:null,events:[],nextCursor:1};
 let ready=fs.readFile(file,'utf8').then(raw=>{try{const parsed=JSON.parse(raw);if(parsed?.schema===1&&Array.isArray(parsed.events)){
   state={schema:1,appRunning:parsed.appRunning===true,updatedAt:finite(parsed.updatedAt),snapshot:sanitize(parsed.snapshot),events:parsed.events.filter(validEvent).slice(-MAX_EVENTS),nextCursor:Math.max(1,finite(parsed.nextCursor,1,Number.MAX_SAFE_INTEGER)||1)};
  }}catch{};state.appRunning=true;return persist();}).catch(()=>persist());
 function sanitize(input){
  if(!input||typeof input!=='object'||!STATES.has(input.state))return null;
  const observations=Array.isArray(input.observations)?input.observations.slice(0,50).flatMap(row=>{
   if(!row||typeof row!=='object'||!finite(row.at,0,Number.MAX_SAFE_INTEGER))return[];
   const source=['message','rxlog','advert'].includes(row.source)?row.source:null;
   const relation=['direct','forwarded','unknown'].includes(row.relation)?row.relation:'unknown';
   return[{at:row.at,source,relation,hops:finite(row.hops,0,255),snr:finite(row.snr,-100,100),rssi:finite(row.rssi,-200,100),flagCount:finite(row.flagCount,0,8)}];
  }):[];
  return {state:input.state,connected:input.connected===true,rxLogObserved:input.rxLogObserved===true,
   baselineHours:finite(input.baselineHours,0,100000),baselineTargetHours:finite(input.baselineTargetHours,1,1000),
   packetRate:finite(input.packetRate,0,1e7),baselinePacketRate:finite(input.baselinePacketRate,0,1e7),
   activeAlert:input.activeAlert==='possible-opening'||input.activeAlert==='strong-anomaly'?input.activeAlert:null,observations,
   alertCount:finite(input.alertCount,0,1000000),comparable:typeof input.comparable==='boolean'?input.comparable:null};
 }
 function validEvent(e){return e&&typeof e==='object'&&Number.isSafeInteger(e.cursor)&&e.cursor>0&&finite(e.at,0,Number.MAX_SAFE_INTEGER)!==null&&['status','alert','cleared','app-started','app-stopped'].includes(e.type)&&
  (e.type!=='status'||STATES.has(e.state)&&typeof e.connected==='boolean')&&(e.type!=='alert'||e.level==='possible-opening'||e.level==='strong-anomaly');}
 async function persist(){await fs.mkdir(directory,{recursive:true});const temp=file+'.tmp';await fs.writeFile(temp,JSON.stringify(state),{encoding:'utf8',mode:0o600});await fs.rename(temp,file);}
 function addEvent(type,fields={}){state.events.push({cursor:state.nextCursor++,at:Date.now(),type,...fields});if(state.events.length>MAX_EVENTS)state.events.splice(0,state.events.length-MAX_EVENTS);}
 function changeSnapshot(next){const before=state.snapshot;state.snapshot=next;state.updatedAt=Date.now();
  if(!before||before.state!==next.state||before.connected!==next.connected)addEvent('status',{state:next.state,connected:next.connected});
  if(next.activeAlert&&next.activeAlert!==before?.activeAlert)addEvent('alert',{level:next.activeAlert});
  if(before?.activeAlert&&!next.activeAlert)addEvent('cleared');
 }
 ipcMain.on('codex-bridge:publish',async(e,input)=>{if(!trusted(e))return;const next=sanitize(input);if(!next)return;await ready;changeSnapshot(next);await persist().catch(()=>{});});
 addEvent('app-started');
 ready=ready.then(persist).catch(()=>{});
 app.on('before-quit',()=>{state.appRunning=false;state.updatedAt=Date.now();addEvent('app-stopped');try{fsSync.mkdirSync(directory,{recursive:true});const tmp=file+'.tmp';fsSync.writeFileSync(tmp,JSON.stringify(state),{encoding:'utf8',mode:0o600});fsSync.renameSync(tmp,file);}catch{}});
 return {file};
}

module.exports={install};
