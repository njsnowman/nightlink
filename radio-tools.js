/* Companion commands: 7 self advert, 17 export advert, 18 import advert. */
(function(root){
const hex=d=>Array.from(d,b=>b.toString(16).padStart(2,'0')).join('');
function parseAdvert(value){
 const source=typeof value==='string'?value.trim():'';
 if(!new RegExp('^meshcore://[a-f0-9]+$','i').test(source)||(source.length-11)%2!==0)throw new Error('Use a meshcore:// signed contact advert.');
 const raw=Uint8Array.from(source.slice(11).match(/../g)||[],x=>parseInt(x,16));
 if(raw.length<103||raw.length>171||(raw[0]>>6)!==0||((raw[0]>>2)&15)!==4)throw new Error('Unsupported or incomplete contact advert.');
 let at=[0,3].includes(raw[0]&3)?5:1;
 const path=raw[at++],size=(path>>6)+1,length=(path&63)*size;
 if(size>3||length>64)throw new Error('Invalid advert path.');at+=length;
 if(at+101>raw.length)throw new Error('Incomplete signed advert.');
 const key=hex(raw.slice(at,at+32));if(/^0+$/.test(key))throw new Error('Invalid public key.');
 at+=100;const flags=raw[at++],type=flags&15;
 if(![1,2,3,4].includes(type))throw new Error('Unsupported contact type.');
 let location=null;
 if(flags&16){if(at+8>raw.length)throw new Error('Incomplete location.');const v=new DataView(raw.buffer);const lat=v.getInt32(at,true)/1e6,lon=v.getInt32(at+4,true)/1e6;if(Math.abs(lat)>90||Math.abs(lon)>180)throw new Error('Invalid location.');location={lat,lon};at+=8;}
 if(flags&32)at+=2;if(flags&64)at+=2;if(at>raw.length)throw new Error('Incomplete advert data.');
 const name=(flags&128)?new TextDecoder('utf-8',{fatal:true}).decode(raw.slice(at)).replace(/\0/g,'').trim():key.slice(0,8);
 return {raw,key,type,name:name||key.slice(0,8),location,uri:'meshcore://'+hex(raw)};
}
function install(Radio,contact){
 Radio.prototype.radioTool=async function(work){
  if(!this.ready||this.syncing||this.ble.state!=='connected')throw new Error('Connect and finish synchronization first.');
  if(this.configuring)throw new Error('Another radio update is in progress.');
  this.configuring=true;const generation=this.generation,key=this.identity.key;
  const guard=()=>{if(generation!==this.generation||key!==this.identity?.key||!this.ready||this.syncing)throw new Error('Radio connection changed. Open Radio Tools again.');};
  const request=async(bytes,type,extraGuard=()=>{})=>{const check=()=>{guard();extraGuard();};const response=await this.request(bytes,type,8000,check);check();return response;};
  try{return await work(request,guard);}finally{this.configuring=false;}
 };
 Radio.prototype.sendAdvert=function(flood=false){return this.radioTool(async request=>{
  if(typeof flood!=='boolean')throw new Error('Choose local or flood scope.');
  this.advertTimes??=new Map();const key=this.identity.key,last=this.advertTimes.get(key);
  if(last!==undefined&&Date.now()-last<10000)throw new Error('Wait 10 seconds between adverts.');
  await request([7,flood?1:0],0);this.advertTimes.set(key,Date.now());return {accepted:true,flood};
 });};
 Radio.prototype.exportAdvert=function(key=null){return this.radioTool(async request=>{
  if(key!==null&&!/^[a-f0-9]{64}$/.test(key))throw new Error('Invalid public key.');
  const response=await request([17,...(key?key.match(/../g).map(x=>parseInt(x,16)):[])],11);
  const advert=parseAdvert('meshcore://'+hex(response.slice(1)));
  if(advert.key!==(key||this.identity.key))throw new Error('Radio returned a different identity.');return advert;
 });};
 Radio.prototype.importAdvert=function(uri){const advert=parseAdvert(uri);return this.radioTool(async(request,guard)=>{
  if(advert.key===this.identity.key)throw new Error('This is your own radio.');
  if(this.contacts.some(c=>c.key===advert.key))throw new Error('Contact already exists. Open its card instead.');
  const key=advert.key.match(/../g).map(x=>parseInt(x,16));
  try{await request([30,...key],3);throw new Error('Contact already exists on the radio. Refresh contacts.');}catch(error){if(error.radioCode!==2)throw error;}
  await request([18,...advert.raw],0);
  // Import is processed by firmware loopback after command acceptance.
  for(let attempt=0;attempt<5;attempt++){
   await new Promise(resolve=>setTimeout(resolve,200));guard();
   try{const added=contact(await request([30,...key],3));if(added.key!==advert.key)throw new Error('Unexpected contact identity.');if(!this.contacts.some(c=>c.key===added.key))this.contacts.push(added);this.emit('contacts',this.contacts.slice());return added;}catch(error){if(error.radioCode!==2)throw error;}
  }
  throw new Error('Radio accepted the import but the contact was not found. Refresh contacts before retrying; the signature or contact limit may have prevented import.');
 });};
}
root.NightlinkAdverts={parseAdvert,install};if(root.MeshlineRadio)install(root.MeshlineRadio,root.MeshlineProtocol.contact);
if(typeof module!=='undefined')module.exports={parseAdvert,install};
})(globalThis);
