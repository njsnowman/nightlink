/* MeshCore companion USB: '<' + uint16 LE length + command; '>' responses. */
(function(root){
 const MAX_FRAME=512;
 class SerialFrames{
  constructor(receive){this.receive=receive;this.buffer=[];}
  feed(bytes){for(const byte of bytes){this.buffer.push(byte);while(this.buffer.length>=3){if(this.buffer[0]!==62){this.buffer.shift();continue;}const length=this.buffer[1]+256*this.buffer[2];if(!length||length>MAX_FRAME){this.buffer.shift();continue;}if(this.buffer.length<length+3)break;const frame=Uint8Array.from(this.buffer.splice(0,length+3).slice(3));this.receive(frame);}}}
  reset(){this.buffer=[];}
 }
 class MeshlineUSB extends EventTarget{
  constructor(serial,{setupTimeout=12000}={}){super();this.serial=serial;this.setupTimeout=setupTimeout;this.state='disconnected';this.busy=false;this.device=null;this.port=null;this.reader=null;this.writer=null;this.pending=null;this.epoch=0;this.closing=Promise.resolve();this.frames=new SerialFrames(data=>this.receive(data));}
  emit(type,detail){this.dispatchEvent(new CustomEvent(type,{detail}));}
  setState(state){this.state=state;this.emit('state',{state,name:this.device?.name||'USB companion',transport:'usb'});}
  limit(work,ms,message){let timer;return Promise.race([work,new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error(message)),ms);})]).finally(()=>clearTimeout(timer));}
  receive(data){const p=this.pending;if(p&&!p.response&&((Array.isArray(p.type)?p.type.includes(data[0]):p.type===data[0])||data[0]===1)){p.response=data;if(data[0]===1)p.error=Object.assign(new Error('Radio rejected request (code '+(data[1]??'unknown')+').'),{radioCode:data[1]});}this.emit('packet',data);this.finish(p);}
  finish(p){if(!p||this.pending!==p||!p.response||!p.written)return;this.pending=null;clearTimeout(p.timer);if(p.error)p.reject(p.error);else p.resolve(p.response);}
  command(bytes,type,timeout=7000){if(this.pending)return Promise.reject(new Error('A radio request is already in progress.'));if(!this.writer)return Promise.reject(new Error('USB radio is disconnected.'));if(!bytes.length||bytes.length>MAX_FRAME)return Promise.reject(new Error('Invalid USB command length.'));const writer=this.writer,epoch=this.epoch;return new Promise((resolve,reject)=>{const p={type,resolve,reject,written:false,response:null,timer:setTimeout(()=>{if(this.pending===p){this.pending=null;reject(new Error('USB radio did not respond. Check USB companion firmware and the data cable.'));this.disconnect('transport-error');}},timeout)};this.pending=p;const frame=Uint8Array.from([60,bytes.length&255,bytes.length>>8,...bytes]);Promise.resolve().then(()=>{if(epoch!==this.epoch||this.pending!==p)throw new Error('USB request cancelled.');return writer.write(frame);}).then(()=>{p.written=true;this.finish(p);}).catch(error=>{if(this.pending===p){this.pending=null;clearTimeout(p.timer);reject(error);this.disconnect('transport-error');}});});}
  async connect(reuse=false){
   if(this.busy||this.state==='connected')throw new Error('Disconnect the current radio before connecting again.');
   if(!this.serial)throw new Error('USB serial is unavailable. Use the Windows app or Chrome / Edge on localhost.');
   this.busy=true;const epoch=++this.epoch;const check=()=>{if(epoch!==this.epoch)throw new Error('USB connection cancelled.');};let port;
   try{
    if(!reuse||!this.port){this.setState('scanning');port=await this.serial.requestPort({});}else port=this.port;check();
    await this.limit(this.closing,4000,'Previous USB port is still closing. Retry in a moment.');check();this.port=port;this.device={name:'USB companion'};
    this.setState('connecting');const opening=port.open({baudRate:115200,flowControl:'none'});opening.then(()=>{if(epoch!==this.epoch)port.close().catch(()=>{});},()=>{});
    await this.limit(opening,this.setupTimeout,'USB port did not open. Close other serial applications and retry.');check();
    this.reader=port.readable.getReader();this.writer=port.writable.getWriter();this.frames.reset();this.reading=this.readLoop(this.reader,epoch);this.setState('initializing');
    const self=await this.command([1,0,0,0,0,0,0,0,...new TextEncoder().encode('Nightlink')],5);check();if(self.length<52)throw new Error('Incomplete MeshCore USB identity.');
    const info=await this.command([22,3],13);check();if(info.length<2)throw new Error('Incomplete MeshCore device information.');
    const name=new TextDecoder().decode(self.slice(58)).split('\0')[0].trim()||'USB companion';this.device={name};this.setState('connected');this.emit('identity',{name,transport:'usb',txPower:self[2],frequency:new DataView(self.buffer,self.byteOffset,self.byteLength).getUint32(48,true)/1000,selfInfo:self,deviceInfo:info});
   }catch(error){if(epoch===this.epoch)this.disconnect('sync-failed');throw error;}finally{this.busy=false;}
  }
  async readLoop(reader,epoch){try{while(epoch===this.epoch){const {value,done}=await reader.read();if(done)break;if(value)this.frames.feed(value);}}catch(error){if(epoch===this.epoch)this.emit('warning',error.message);}finally{try{reader.releaseLock();}catch{}if(epoch===this.epoch)this.disconnect('link-loss');}}
  disconnect(reason='manual'){
   this.epoch++;const p=this.pending;this.pending=null;if(p){clearTimeout(p.timer);p.reject(new Error('USB disconnected.'));}
   const reader=this.reader,writer=this.writer,port=this.port;this.reader=null;this.writer=null;this.frames.reset();
   this.closing=this.closing.catch(()=>{}).then(async()=>{try{if(reader)await reader.cancel();}catch{}try{reader?.releaseLock();}catch{}try{if(writer)await writer.abort();}catch{}try{writer?.releaseLock();}catch{}try{if(port?.readable||port?.writable)await port.close();}catch{}});
   this.setState('disconnected');this.emit('interruption',{reason});return this.closing;
  }
 }
 root.MeshlineUSB=MeshlineUSB;root.MeshlineSerialFrames=SerialFrames;if(typeof module!=='undefined')module.exports={MeshlineUSB,SerialFrames};
})(globalThis);
