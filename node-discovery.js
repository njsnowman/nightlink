/* Zero-hop discovery. Wire layout follows MeshCore MyMesh.cpp and docs/payloads.md. */
(function(root){
 const filters={all:30,companions:2,repeaters:4,rooms:8,sensors:16};
 function parse(frame,tag,filter=30){const d=Uint8Array.from(frame||[]);if(d.length!==42||d[0]!==0x8e||d[3]!==0||(d[4]&0xf0)!==0x90)return null;const v=new DataView(d.buffer),type=d[4]&15;if(![1,2,3,4].includes(type)||!(filter&(1<<type))||v.getUint32(6,true)!==tag)return null;const key=Array.from(d.slice(10),b=>b.toString(16).padStart(2,'0')).join('');if(/^0+$/.test(key))return null;return{key,type,localSNR:v.getInt8(1)/4,rssi:v.getInt8(2),remoteSNR:v.getInt8(5)/4};}
 class Discovery extends EventTarget{
  constructor(radio,{listenMs=7000,cooldownMs=60000,now=()=>Date.now(),random=()=>crypto.getRandomValues(new Uint32Array(1))[0]}={}){super();this.radio=radio;this.listenMs=listenMs;this.cooldownMs=cooldownMs;this.now=now;this.random=random;this.active=null;this.results=[];this.last=new Map();radio.ble.addEventListener('packet',e=>this.receive(e.detail));radio.addEventListener('disconnected',()=>this.reset('disconnected'));radio.addEventListener('identity',()=>this.reset('cancelled'));radio.addEventListener('sync',e=>{if(e.detail.state==='syncing')this.stop('cancelled');});}
  reset(state){this.results=[];const active=!!this.active;this.stop(state);if(!active)this.emit(state);}
  emit(state,extra={}){this.dispatchEvent(new CustomEvent('change',{detail:{state,results:this.results.map(r=>({...r})),...extra}}));}
  stop(state='cancelled'){const s=this.active;if(!s)return;clearTimeout(s.timer);this.active=null;this.emit(state);}
  receive(frame){const s=this.active;if(!s||s.generation!==this.radio.generation||s.key!==this.radio.identity?.key)return;const result=parse(frame,s.tag,s.filter);if(!result||result.key===s.key)return;const found=this.results.find(r=>r.key===result.key);if(found)Object.assign(found,result);else if(this.results.length<128)this.results.push(result);this.emit(s.accepted?'listening':'starting');}
  async scan(kind='all'){
   const r=this.radio;if(!Object.hasOwn(filters,kind))throw Error('Choose a supported node type.');if(this.active)throw Error('A node search is already running.');if(!r.ready||r.syncing||r.ble.state!=='connected')throw Error('Connect and finish synchronization first.');if(r.identity?.protocol<8||!Number.isInteger(r.identity?.protocol))throw Error('Node discovery requires companion protocol 8 or newer.');
   const key=r.identity.key,last=this.last.get(key),wait=last===undefined?0:this.cooldownMs-(this.now()-last);if(wait>0)throw Error('Wait '+Math.ceil(wait/1000)+' seconds before another search.');
   const tag=this.random()>>>0,filter=filters[kind],frame=new Uint8Array(7);frame.set([55,0x80,filter]);new DataView(frame.buffer).setUint32(3,tag,true);const s={tag,filter,key,generation:r.generation,accepted:false};this.active=s;this.results=[];this.emit('starting');
   try{await r.radioTool(async(_request,guard)=>{await r.request(frame,0,8000,()=>{guard();if(this.active!==s)throw Error('Node search cancelled.');this.last.set(key,this.now());});});this.last.set(key,this.now());if(this.active!==s){if(!this.active&&r.generation===s.generation&&r.identity?.key===s.key)this.emit('cancelled');return{cancelled:true};}s.accepted=true;this.emit('listening');s.timer=setTimeout(()=>{if(this.active===s)this.stop('complete');},this.listenMs);return{accepted:true};}catch(error){if(this.active===s){this.active=null;this.emit('error',{message:error.message});}throw error;}
  }
 }
 root.NightlinkDiscovery={Discovery,parse,filters};if(typeof module!=='undefined')module.exports=root.NightlinkDiscovery;
})(globalThis);
