const fs=require('node:fs/promises');
const path=require('node:path');
const os=require('node:os');
const MAX_FILE_BYTES=1024*1024,MAX_EVENTS=500,STALE_AFTER_MS=120000;
const STATES=new Set(['disabled','unavailable','insufficient-data','normal','possible-opening','strong-anomaly']);
function dataFile(env=process.env,platform=process.platform,home=os.homedir()){
 const base=platform==='win32'?env.APPDATA||path.join(home,'AppData','Roaming'):
  platform==='darwin'?path.join(home,'Library','Application Support'):env.XDG_CONFIG_HOME||path.join(home,'.config');
 return path.join(base,'Meshline','codex-bridge','state.json');
}
function finite(value,min=0,max=1e9){return typeof value==='number'&&Number.isFinite(value)&&value>=min&&value<=max;}
function sanitizeEvent(e){return !!e&&typeof e==='object'&&Number.isSafeInteger(e.cursor)&&e.cursor>0&&finite(e.at,0,Number.MAX_SAFE_INTEGER)&&['status','alert','cleared','app-started','app-stopped'].includes(e.type)&&
 (e.type!=='status'||STATES.has(e.state)&&typeof e.connected==='boolean')&&(e.type!=='alert'||e.level==='possible-opening'||e.level==='strong-anomaly');}
function sanitizeState(raw,now=Date.now()){
 if(!raw||raw.schema!==1)return null;
 const s=raw.snapshot;
 const observations=Array.isArray(s?.observations)?s.observations.slice(0,50).flatMap(row=>row&&typeof row==='object'&&finite(row.at,0,Number.MAX_SAFE_INTEGER)?[{at:row.at,
  source:['message','rxlog','advert'].includes(row.source)?row.source:null,relation:['direct','forwarded','unknown'].includes(row.relation)?row.relation:'unknown',
  hops:finite(row.hops,0,255)?row.hops:null,snr:finite(row.snr,-100,100)?row.snr:null,rssi:finite(row.rssi,-200,100)?row.rssi:null,flagCount:finite(row.flagCount,0,8)?row.flagCount:null}]:[]):[];
 const snapshot=s&&STATES.has(s.state)?{state:s.state,connected:s.connected===true,rxLogObserved:s.rxLogObserved===true,observations,
  baselineHours:finite(s.baselineHours,0,100000)?s.baselineHours:null,baselineTargetHours:finite(s.baselineTargetHours,1,1000)?s.baselineTargetHours:null,
  packetRate:finite(s.packetRate,0,1e7)?s.packetRate:null,baselinePacketRate:finite(s.baselinePacketRate,0,1e7)?s.baselinePacketRate:null,
  activeAlert:s.activeAlert==='possible-opening'||s.activeAlert==='strong-anomaly'?s.activeAlert:null,
  alertCount:finite(s.alertCount,0,1000000)?s.alertCount:null,comparable:typeof s.comparable==='boolean'?s.comparable:null}:null;
 const updatedAt=finite(raw.updatedAt,0,Number.MAX_SAFE_INTEGER)?raw.updatedAt:null;
 return {appRunning:raw.appRunning===true,updatedAt,ageMs:updatedAt==null?null:Math.max(0,now-updatedAt),stale:updatedAt==null||now-updatedAt>STALE_AFTER_MS,
  snapshot,latestCursor:Array.isArray(raw.events)?raw.events.filter(sanitizeEvent).reduce((m,e)=>Math.max(m,e.cursor),0):0};
}
async function readFileSafe(file=dataFile()){
 let text;try{const stat=await fs.stat(file);if(stat.size>MAX_FILE_BYTES)return {error:'state_file_too_large'};text=await fs.readFile(file,'utf8');}
 catch(error){return {error:error.code==='ENOENT'?'nightlink_not_running_or_no_status':'state_unavailable'};}
 try{const data=JSON.parse(text);return data&&typeof data==='object'?{data}:{error:'malformed_state'};}catch{return {error:'malformed_state'};}
}
async function getStatus(file=dataFile(),now=Date.now()){
 const read=await readFileSafe(file);if(read.error)return {available:false,error:read.error,stale:true};
 const status=sanitizeState(read.data,now);return status?{available:true,...status}:{available:false,error:'malformed_state',stale:true};
}
async function getEvents({file=dataFile(),since=0,limit=100}={}){
 if(!Number.isSafeInteger(since)||since<0)throw Error('since must be a non-negative integer cursor');
 if(!Number.isInteger(limit)||limit<1||limit>100)throw Error('limit must be an integer from 1 to 100');
 const read=await readFileSafe(file);if(read.error)return {available:false,error:read.error,events:[],nextCursor:since};
 const rows=Array.isArray(read.data.events)?read.data.events.filter(sanitizeEvent):[];
 const events=rows.filter(e=>e.cursor>since).slice(0,limit).map(e=>{const safe={cursor:e.cursor,at:e.at,type:e.type};
  if(e.type==='status'){safe.state=e.state;safe.connected=e.connected;safe.summary=`RF monitor ${e.state}; radio ${e.connected?'connected':'disconnected'}.`;}
  else if(e.type==='alert'){safe.level=e.level;safe.summary=`RF monitor alert: ${e.level}.`;}
  else safe.summary=e.type==='cleared'?'RF monitor alert cleared.':e.type==='app-started'?'Nightlink started.':'Nightlink is shutting down.';
  return safe;});
 return {available:true,events,nextCursor:events.length?events.at(-1).cursor:since,latestCursor:rows.at(-1)?.cursor||0,stale:(await getStatus(file)).stale};
}
module.exports={dataFile,sanitizeEvent,sanitizeState,readFileSafe,getStatus,getEvents,STALE_AFTER_MS,MAX_EVENTS,MAX_FILE_BYTES};
