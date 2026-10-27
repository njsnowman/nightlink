/* Companion trace frames follow MyMesh.cpp; calculations require no network services. */
(function(root){
 const bytes=s=>Uint8Array.from(s.match(/../g)||[],x=>parseInt(x,16));
 function route(value){const s=typeof value==='string'?value.trim().replace(/\s+/g,'').toLowerCase():'';if(!/^(?:[a-f0-9]{2}){1,32}$/.test(s))throw Error('Enter 1–32 one-byte path hashes, in outbound and return order.');return bytes(s);}
 function traceFrame(input,tag){const path=route(input),d=new Uint8Array(10+path.length);d[0]=36;new DataView(d.buffer).setUint32(1,tag,true);d.set(path,10);return d;}
 function traceReply(d,tag){if(!(d instanceof Uint8Array)||d[0]!==0x89||d[1]!==0||d.length<13)return null;const v=new DataView(d.buffer,d.byteOffset,d.byteLength);if(v.getUint32(4,true)!==tag||v.getUint32(8,true)!==0)return null;const n=d[2];if(d[3]!==0||n>64||d.length!==13+2*n)return null;return{path:Array.from(d.slice(12,12+n),x=>x.toString(16).padStart(2,'0')),snr:Array.from(d.slice(12+n),x=>(x>127?x-256:x)/4)};}
 function traceWait(estimate,override){if(override!==undefined){if(!Number.isFinite(override)||override<=0||override>120000)throw Error('Invalid trace reply timeout.');return override;}return Math.max(30000,Math.min(120000,(Number.isFinite(estimate)?Math.max(0,estimate):0)+5000));}
 async function trace(radio,input,{timeout,onProgress}={}){
  traceWait(0,timeout);const tag=crypto.getRandomValues(new Uint32Array(1))[0],frame=traceFrame(input,tag),details={accepted:false};
  const progress=detail=>{try{if(typeof onProgress==='function')onProgress(detail);}catch{}};
  return radio.radioTool(async(request,guard)=>{let timer,receive,disconnect,settled=false,resolveResult,rejectResult;const result=new Promise((resolve,reject)=>{resolveResult=resolve;rejectResult=reject;});result.catch(()=>{});
   const finish=(error,value)=>{if(settled)return;settled=true;error?rejectResult(error):resolveResult(value);};
   receive=e=>{const reply=traceReply(e.detail,tag);if(reply){try{guard();finish(null,reply);}catch(error){finish(error);}}};disconnect=()=>finish(Error('Radio disconnected; trace stopped.'));
   radio.ble.addEventListener('packet',receive);radio.addEventListener('disconnected',disconnect);
   try{progress({state:'queued'});const started=Date.now(),accepted=await request(frame,6);if(!(accepted instanceof Uint8Array)||accepted.length!==10||accepted[0]!==6||accepted[1]!==0||new DataView(accepted.buffer,accepted.byteOffset,accepted.byteLength).getUint32(2,true)!==tag)throw Error('Unexpected trace acceptance.');guard();
    const estimatedTimeoutMs=new DataView(accepted.buffer,accepted.byteOffset,accepted.byteLength).getUint32(6,true),replyTimeoutMs=traceWait(estimatedTimeoutMs,timeout);Object.assign(details,{accepted:true,estimatedTimeoutMs,replyTimeoutMs,acceptanceDelayMs:Date.now()-started});progress({state:'accepted',...details});
    if(!settled)timer=setTimeout(()=>finish(Error('No matching trace reply before timeout. No automatic retry.')),replyTimeoutMs);const reply=await result;progress({state:'received',...details});return reply;
   }catch(error){error.traceDetails={...details};progress({state:'failed',...details,message:error.message});throw error;}finally{clearTimeout(timer);radio.ble.removeEventListener('packet',receive);radio.removeEventListener('disconnected',disconnect);}
  });
 }

 function geometry(a,b,h1,h2,mhz){for(const p of [a,b])if(!Number.isFinite(p.lat)||!Number.isFinite(p.lon)||Math.abs(p.lat)>90||Math.abs(p.lon)>180)throw Error('Enter valid coordinates for both endpoints.');if(![h1,h2,mhz].every(Number.isFinite)||h1<0||h2<0||h1>10000||h2>10000||mhz<=0||mhz>100000)throw Error('Enter valid heights and frequency.');const rad=x=>x*Math.PI/180,p1=rad(a.lat),p2=rad(b.lat),dl=rad(b.lon-a.lon),dp=p2-p1,h=Math.sin(dp/2)**2+Math.cos(p1)*Math.cos(p2)*Math.sin(dl/2)**2,km=6371*2*Math.asin(Math.sqrt(Math.min(1,h))),bearing=(Math.atan2(Math.sin(dl)*Math.cos(p2),Math.cos(p1)*Math.sin(p2)-Math.sin(p1)*Math.cos(p2)*Math.cos(dl))*180/Math.PI+360)%360;return{km,bearing,horizonKm:3.57*(Math.sqrt(h1)+Math.sqrt(h2)),fresnelMidpointM:Math.sqrt((299.792458/mhz)*(km*1000)/4)};}
 root.NightlinkWorkbench={route,traceFrame,traceReply,traceWait,trace,geometry};if(typeof module!=='undefined')module.exports=root.NightlinkWorkbench;
})(globalThis);
