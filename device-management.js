/* Independent MeshCore management implementation. See docs/device-management.md. */
(function(root){
'use strict';
const encoder=new TextEncoder();
const fields={
 name:{label:'Advertised name',command:'name',kind:'text',max:31},
 txPower:{label:'TX power · dBm',command:'tx',kind:'number',min:-9,max:22},
 lat:{label:'Latitude',command:'lat',kind:'number',min:-90,max:90},
 lon:{label:'Longitude',command:'lon',kind:'number',min:-180,max:180},
 owner:{label:'Owner information',command:'owner.info',kind:'text',max:100,remote:true},
 rxGain:{label:'Boosted RX gain',command:'radio.rxgain',kind:'switch',remote:true},
 pathHash:{label:'Path hash bytes (0=1, 1=2, 2=3)',command:'path.hash.mode',kind:'number',min:0,max:2,remote:true},
 txDelay:{label:'Flood TX delay factor',command:'txdelay',kind:'number',min:0,max:2,remote:true},
 directDelay:{label:'Direct TX delay factor',command:'direct.txdelay',kind:'number',min:0,max:2,remote:true},
 repeat:{label:'Forward packets',command:'repeat',kind:'switch',remote:true},
 advert:{label:'Zero-hop adverts · minutes (0 disables)',command:'advert.interval',kind:'number',min:0,max:240,remote:true},
 floodAdvert:{label:'Flood adverts · hours (0 disables)',command:'flood.advert.interval',kind:'number',min:0,max:168,remote:true},
 frequency:{label:'Frequency · MHz',kind:'number',min:150,max:2500,rf:true},
 bandwidth:{label:'Bandwidth · kHz',kind:'number',min:7,max:500,rf:true},
 sf:{label:'Spreading factor',kind:'number',min:5,max:12,rf:true},
 cr:{label:'Coding rate denominator · 4/x',kind:'number',min:5,max:8,rf:true}
};
function validate(key,value,maxPower){const f=fields[key];if(!Object.hasOwn(fields,key))throw Error('Unknown setting.');if(f.kind==='text'){value=String(value).trim();if(!value||/[\x00-\x1f\x7f]/.test(value)||encoder.encode(value).length>f.max)throw Error(f.label+': enter 1–'+f.max+' UTF-8 bytes without control characters.');return value;}if(f.kind==='switch'){if(!['on','off'].includes(value))throw Error('Choose on or off.');return value;}if(String(value).trim()==='')throw Error(f.label+' is required.');value=Number(value);const max=key==='txPower'?Math.min(f.max,maxPower??f.max):f.max;if(!Number.isFinite(value)||value<f.min||value>max)throw Error(f.label+': expected '+f.min+' to '+max+'.');if(['sf','cr','txPower','advert','floodAdvert','pathHash'].includes(key)&&!Number.isInteger(value))throw Error(f.label+' must be a whole number.');if(key==='advert'&&value!==0&&(value<60||value%2))throw Error('Zero-hop interval must be 0 or an even number from 60–240.');if(key==='floodAdvert'&&value!==0&&value<3)throw Error('Flood interval must be 0 or 3–168 hours.');return value;}
function parse(key,text){const s=String(text).trim();if(key==='owner'&&s==='>')return '';if(!s.startsWith('> '))throw Error('Unsupported or unexpected setting reply.');if(['advert','floodAdvert'].includes(key)){const n=Number(s.slice(2));if(Number.isInteger(n)&&n>=0&&n<=fields[key].max)return n;}if(key==='owner'&&s==='>')return '';return validate(key,s.slice(2));}
function frame(code,size){const b=new Uint8Array(size);b[0]=code;return b;}
function localFrames(before,after){const out=[];if(after.name!==undefined){out.push({keys:['name'],bytes:Uint8Array.of(8,...encoder.encode(after.name))});}if(after.lat!==undefined||after.lon!==undefined){const b=frame(14,9),v=new DataView(b.buffer);v.setInt32(1,Math.round((after.lat??before.lat)*1e6),true);v.setInt32(5,Math.round((after.lon??before.lon)*1e6),true);out.push({keys:['lat','lon'],bytes:b});}if(after.txPower!==undefined)out.push({keys:['txPower'],bytes:Uint8Array.of(12,after.txPower&255)});const rf=['frequency','bandwidth','sf','cr'];if(rf.some(k=>after[k]!==undefined)){if(before.protocol>=9&&typeof before.repeatEnabled!=='boolean')throw Error('Repeat state is unknown; RF changes are blocked. Inspect a complete device reply first.');const b=frame(11,before.protocol>=9?12:11),v=new DataView(b.buffer),merged={...before,...after};v.setUint32(1,Math.round(merged.frequency*1000),true);v.setUint32(5,Math.round(merged.bandwidth*1000),true);b[9]=merged.sf;b[10]=merged.cr;if(b.length===12)b[11]=Number(before.repeatEnabled);out.push({keys:rf,bytes:b});}return out;}
function same(key,a,b){return typeof a==='number'&&typeof b==='number'?Math.abs(a-b)<(['lat','lon'].includes(key)?0.000002:0.001):a===b;}
class Manager{
 constructor(radio,terminal,{blocked=()=>false,direct=null}={}){this.radio=radio;this.terminal=terminal;this.direct=direct;this.blocked=blocked;this.busy=false;this.snapshots=new Map();this.epoch=0;this.reset=()=>{this.epoch++;this.snapshots.clear();};for(const name of ['identity','disconnected'])radio.addEventListener(name,this.reset);}
 dispose(){this.cancelled=true;this.snapshots.clear();for(const name of ['identity','disconnected'])this.radio.removeEventListener(name,this.reset);}
 guard(token){if(this.cancelled)throw Error('Device workspace closed. Inspect again before continuing.');if(token.target==='@usb'){if(!this.direct?.connected||token.generation!==this.direct.epoch||(this.direct.key&&token.owner!==this.direct.key))throw Error('Direct USB session changed. Inspect again.');return;}const r=this.radio;if(token.epoch!==this.epoch||token.generation!==r.generation||token.owner!==r.identity?.key||!r.ready||r.syncing||r.ble.state!=='connected')throw Error('Device session changed. Inspect again.');if(this.blocked())throw Error('Finish the active message or contact operation first.');if(token.target)this.terminal.target(token.target);}
 token(target){if(target==='@usb')return{target,generation:this.direct?.epoch,owner:this.direct?.key||'direct-usb',epoch:this.epoch};return{epoch:this.epoch,generation:this.radio.generation,owner:this.radio.identity?.key,target};}
 async operation(work){if(this.busy)throw Error('A device operation is already running.');this.busy=true;try{return await work();}finally{this.busy=false;}}
 async command(target,value,token){const options={guard:()=>this.guard(token),readOnly:/^get (?:name|tx|lat|lon|radio)$/.test(value)};return target==='@usb'?this.direct.run(value,options):this.terminal.run(target,value,options);}
 async localRead(token){return this.radio.radioTool(async request=>{this.guard(token);const info=await request([22,14],13,()=>this.guard(token));this.guard(token);const self=await request([1,0,0,0,0,0,0,0,...encoder.encode('Nightlink')],5,()=>this.guard(token));this.guard(token);const value=root.MeshlineProtocol.identity(self,info);if(value.key!==token.owner)throw Error('Unexpected companion identity.');return value;});}
 async inspect(target='',onProgress=()=>{},{advanced=true}={}){return this.operation(async()=>{const token=this.token(target);this.guard(token);this.snapshots.delete(target);let values={},unsupported=[];if(!target){values=await this.localRead(token);for(const key of Object.keys(fields)){if(fields[key].remote)continue;try{validate(key,values[key],values.maxTxPower);}catch{delete values[key];unsupported.push(key);}}}else{if(target==='@usb'){const reply=String(await this.command(target,'get public.key',token)).trim();if(!/^> [a-f0-9]{64}$/i.test(reply))throw Error('USB device did not return a MeshCore public key. Check repeater / room firmware.');this.direct.key=reply.slice(2).toLowerCase();token.owner=this.direct.key;values.publicKey=this.direct.key;}if(target!=='@usb'&&this.terminal.sessions.get(target)!==token.generation)throw Error('Log in before inspecting this remote device.');const readable=Object.entries(fields).filter(([,f])=>f.command&&(advanced||!f.remote));let completed=0;for(const [key,f] of readable){this.guard(token);onProgress({key,label:f.label,completed,total:readable.length+1,values:{...values}});try{values[key]=parse(key,await this.command(target,'get '+f.command,token));}catch(error){this.guard(token);if(!/Unsupported|unexpected|expected|must|enter|Choose/.test(error.message))throw Error('Reading '+f.label+' failed after '+completed+' of '+(readable.length+1)+' settings: '+error.message);unsupported.push(key);}completed++;}onProgress({key:'radio',label:'Radio parameters',completed,total:readable.length+1,values:{...values}});try{const reply=await this.command(target,'get radio',token);if(!String(reply).startsWith('> '))throw Error('Unsupported radio reply.');const parts=String(reply).slice(2).split(',');if(parts.length!==4)throw Error('Unexpected radio reply.');const parsed={};['frequency','bandwidth','sf','cr'].forEach((key,i)=>parsed[key]=validate(key,parts[i]));Object.assign(values,parsed);}catch(error){this.guard(token);if(!/Unsupported|Unexpected|expected/.test(error.message))throw error;unsupported.push('frequency','bandwidth','sf','cr');}}this.guard(token);const snapshot={token,values,unsupported,inspectedAt:new Date().toISOString()};this.snapshots.set(target,snapshot);return snapshot;});}
 async inspectExtra(target,key){return this.operation(async()=>{
  const base=this.snapshots.get(target),field=fields[key];
  if(!target||!base)throw Error('Inspect core settings first.');
  if(!Object.hasOwn(fields,key)||!field.remote||!field.command)throw Error('Select an optional infrastructure setting.');
  this.guard(base.token);
  if(target!=='@usb'&&this.terminal.sessions.get(target)!==base.token.generation)throw Error('Log in before reading optional settings.');
  let value;try{value=parse(key,await this.command(target,'get '+field.command,base.token));}catch(error){this.guard(base.token);throw Error('Optional '+field.label+' read failed. Core settings remain available. '+error.message);}
  this.guard(base.token);
  const snapshot={...base,values:{...base.values,[key]:value},unsupported:base.unsupported.filter(k=>k!==key),inspectedAt:new Date().toISOString()};
  this.snapshots.set(target,snapshot);return snapshot;
 });}
 plan(target,changes){const snap=this.snapshots.get(target);if(!snap)throw Error('Inspect this device first.');this.guard(snap.token);if(target&&target!=='@usb'&&(this.terminal.sessions.get(target)!==snap.token.generation||!this.terminal.permissions?.get(target)?.admin))throw Error('An administrator login reported by the device is required to change settings.');const after={};for(const [key,value]of Object.entries(changes)){const f=fields[key];if(!Object.hasOwn(fields,key)||(!target&&f.remote)||(target&&!f.command&&!f.rf)||snap.values[key]===undefined)throw Error('Setting is unavailable for this device: '+key);if(same(key,typeof snap.values[key]==='number'?Number(value):value,snap.values[key]))continue;const checked=validate(key,value,snap.values.maxTxPower);if(!same(key,checked,snap.values[key]))after[key]=checked;}if(!Object.keys(after).length)throw Error('No settings changed.');const plan={token:{...snap.token},before:{...snap.values},after,inspectedAt:snap.inspectedAt};if(!target)localFrames(plan.before,after);return plan;}
 async preflight(plan){
  const keys=new Set(Object.keys(plan.after));
  if([...keys].some(k=>fields[k].rf))for(const k of ['frequency','bandwidth','sf','cr'])keys.add(k);
  if(!plan.token.target&&([...keys].includes('lat')||[...keys].includes('lon'))){keys.add('lat');keys.add('lon');}
  let current;
  if(!plan.token.target){current=await this.localRead(plan.token);if([...keys].some(k=>fields[k].rf)&&current.repeatEnabled!==plan.before.repeatEnabled)throw Error('Repeat state changed since inspection. Inspect again.');}
  else{
   current={};
   for(const key of keys){if(fields[key].rf)continue;current[key]=parse(key,await this.command(plan.token.target,'get '+fields[key].command,plan.token));}
   if([...keys].some(k=>fields[k].rf)){
    const raw=String(await this.command(plan.token.target,'get radio',plan.token));if(!raw.startsWith('> '))throw Error('Unexpected RF reply during review check.');
    const parts=raw.slice(2).split(',');if(parts.length!==4)throw Error('Unexpected RF reply during review check.');
    ['frequency','bandwidth','sf','cr'].forEach((key,i)=>current[key]=validate(key,parts[i]));
   }
  }
  this.guard(plan.token);
  for(const key of keys)if(!same(key,current[key],plan.before[key]))throw Error('Setting changed since inspection: '+fields[key].label+'. Inspect and review again. No settings were written.');
 }
 async apply(plan,onProgress=()=>{}){
  return this.operation(async()=>{
   this.guard(plan.token);
   if(this.snapshots.get(plan.token.target)?.inspectedAt!==plan.inspectedAt)throw Error('Inspection changed; review again.');
   const checked=this.plan(plan.token.target,plan.after),results=[];
   this.snapshots.delete(plan.token.target);
   await this.preflight(checked);
   const rfKeys=['frequency','bandwidth','sf','cr'];
   const steps=plan.token.target?[...Object.keys(checked.after).filter(k=>!fields[k].rf).map(k=>({keys:[k]})),...(Object.keys(checked.after).some(k=>fields[k].rf)?[{keys:rfKeys,rf:true}]:[])]:localFrames(checked.before,checked.after);
   for(const step of steps){
    const result={keys:step.keys,status:'not sent'};results.push(result);
    try{
     this.guard(plan.token);
     if(plan.token.target){
      if(plan.token.target!=='@usb'&&(!this.terminal.permissions?.get(plan.token.target)?.admin||this.terminal.sessions.get(plan.token.target)!==plan.token.generation))throw Error('Administrator session expired.');
      const key=step.keys[0],merged={...checked.before,...checked.after};
      const command=step.rf?'set radio '+step.keys.map(k=>merged[k]).join(','):'set '+fields[key].command+' '+checked.after[key];
      result.status='sent / unverified';
      const response=await this.command(plan.token.target,command,plan.token);this.guard(plan.token);
      if(!/^ok\b/i.test(String(response)))throw Error('Device did not acknowledge the setting.');
      if(step.rf){
       const raw=await this.command(plan.token.target,'get radio',plan.token);this.guard(plan.token);
       if(!String(raw).startsWith('> '))throw Error('Unexpected RF readback.');
       const parts=String(raw).slice(2).split(',');
       if(parts.length!==4||step.keys.some((k,i)=>!same(k,validate(k,parts[i]),merged[k])))throw Error('RF readback differs.');
       result.rebootRequired=true;
      }else{
       const value=parse(key,await this.command(plan.token.target,'get '+fields[key].command,plan.token));this.guard(plan.token);
       if(!same(key,value,checked.after[key]))throw Error('Readback differs from requested value.');
      }
     }else{
      await this.radio.radioTool(async request=>{this.guard(plan.token);result.status='sent / unverified';await request(step.bytes,0,()=>this.guard(plan.token));});
      const read=await this.localRead(plan.token);
      for(const key of step.keys){const expected=checked.after[key]??checked.before[key];if(!same(key,read[key],expected))throw Error('Readback differs for '+key+'.');}
      this.radio.identity={...this.radio.identity,...read};
     }
     result.status='verified';onProgress({...result});
    }catch(error){result.error=error.message;onProgress({...result});return{complete:false,results,message:'Stopped. Earlier changes may remain applied. Inspect again before continuing.'};}
   }
   return{complete:true,results,message:'All requested settings read back successfully.'+(results.some(r=>r.rebootRequired)?' Radio parameters are saved; reboot the device separately to activate them.':'')};
  });
 }

 export(target){const s=this.snapshots.get(target);if(!s)throw Error('Inspect first.');this.guard(s.token);const values={};for(const key of Object.keys(fields))if(s.values[key]!==undefined)values[key]=s.values[key];return{format:'nightlink-device-settings',version:1,target:target||s.token.owner,inspectedAt:s.inspectedAt,settings:values};}
}
root.NightlinkDevices={Manager,fields,validate,parse,localFrames,same};if(typeof module!=='undefined')module.exports=root.NightlinkDevices;
})(globalThis);
