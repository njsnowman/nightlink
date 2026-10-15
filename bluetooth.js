/* MeshCore companion BLE transport. No radio configuration is written. */
(function(root){
 const SERVICE='6e400001-b5a3-f393-e0a9-e50e24dcca9e',RX='6e400002-b5a3-f393-e0a9-e50e24dcca9e',TX='6e400003-b5a3-f393-e0a9-e50e24dcca9e';
 class MeshlineBLE extends EventTarget{
  constructor(bluetooth,{stageTimeout=12000,setupAttempts=3,retryDelay=350}={}){super();this.stageTimeout=stageTimeout;this.setupAttempts=setupAttempts;this.retryDelay=retryDelay;this.bluetooth=bluetooth;this.device=null;this.rx=null;this.tx=null;this.pending=null;this.busy=false;this.state='disconnected';this.connectEpoch=0;this.notification=e=>this.receive(e.target.value);this.lost=()=>{const recover=this.state==='connected';this.cleanup();this.setState('disconnected');if(recover)this.emit('interruption',{reason:'link-loss'});};}
  stage(promise){let timer;return Promise.race([promise,new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('Bluetooth setup timed out. Check radio availability.')),this.stageTimeout);})]).finally(()=>clearTimeout(timer));}
  emit(type,detail){this.dispatchEvent(new CustomEvent(type,{detail}));}
  setState(state){this.state=state;this.emit('state',{state,name:this.device?.name||'MeshCore radio'});}
  receive(value){const data=new Uint8Array(value.buffer,value.byteOffset,value.byteLength).slice();if(!data.length)return;this.emit('packet',data);const pending=this.pending;if(pending&&((Array.isArray(pending.type)?pending.type.includes(data[0]):data[0]===pending.type)||data[0]===1)){this.pending=null;clearTimeout(pending.timer);if(data[0]===1){const error=new Error('Radio rejected request (code '+(data[1]??'unknown')+').');error.radioCode=data[1];pending.reject(error);}else pending.resolve(data);}}
  command(bytes,type,timeout=7000){if(this.pending)return Promise.reject(new Error('A radio request is already in progress.'));if(!this.rx||!this.device?.gatt.connected)return Promise.reject(new Error('Bluetooth radio is disconnected.'));return new Promise((resolve,reject)=>{const pending={type,resolve,reject,timer:setTimeout(()=>{if(this.pending===pending){this.pending=null;reject(new Error('Radio did not respond. Check companion firmware and Bluetooth pairing.'));}},timeout)};this.pending=pending;this.rx.writeValueWithResponse(Uint8Array.from(bytes)).catch(error=>{if(this.pending===pending){this.pending=null;clearTimeout(pending.timer);reject(error);}});});}
  async connect(reuse=false){
   if(this.busy)throw new Error('A Bluetooth connection is already in progress.');
   if(!this.bluetooth)throw new Error('Bluetooth is unavailable here. Open Nightlink on Windows, or use Microsoft Edge / Chrome on localhost.');
   this.busy=true;const epoch=++this.connectEpoch;const assertActive=()=>{if(epoch!==this.connectEpoch)throw new Error('Connection attempt cancelled.');};
   try{
    if(!reuse||!this.device){this.setState('scanning');const next=await this.bluetooth.requestDevice({filters:[{services:[SERVICE]},{namePrefix:'MeshCore'},{namePrefix:'meshcore'},{namePrefix:'NRF52'}],optionalServices:[SERVICE]});assertActive();this.disconnect('switch');this.device=next;}
    let prepared=false;
    for(let attempt=1;attempt<=this.setupAttempts;attempt++){
     assertActive();this.setState('connecting');this.emit('setup-progress',{stage:'Connecting and discovering Bluetooth services',attempt,total:this.setupAttempts});
     this.device.removeEventListener('gattserverdisconnected',this.lost);this.device.addEventListener('gattserverdisconnected',this.lost);
     const assertConnected=()=>{assertActive();if(!this.device.gatt.connected)throw new Error('GATT disconnected during service discovery.');};
     try{const server=await this.stage(this.device.gatt.connect());assertConnected();const service=await this.stage(server.getPrimaryService(SERVICE));assertConnected();const rx=await this.stage(service.getCharacteristic(RX));assertConnected();const tx=await this.stage(service.getCharacteristic(TX));assertConnected();this.rx=rx;this.tx=tx;this.tx.addEventListener('characteristicvaluechanged',this.notification);await this.stage(this.tx.startNotifications());assertConnected();prepared=true;break;}
     catch(error){this.cleanup();this.device.removeEventListener('gattserverdisconnected',this.lost);this.device.gatt.disconnect();assertActive();const transient=error.name==='NetworkError'||/GATT.*disconnect|GATT Server is disconnected|Bluetooth disconnected/i.test(error.message);if(!transient)throw error;if(attempt===this.setupAttempts)throw new Error('Bluetooth link dropped during service discovery after '+attempt+' attempts. Close other MeshCore clients using this radio, keep it nearby, then retry.',{cause:error});this.emit('setup-progress',{stage:'Bluetooth link dropped during discovery; retrying',attempt,total:this.setupAttempts});await new Promise(resolve=>setTimeout(resolve,this.retryDelay*attempt));assertActive();}
    }
    if(!prepared)throw new Error('Bluetooth service discovery did not complete.');this.setState('initializing');
    const self=await this.command([1,0,0,0,0,0,0,0,...new TextEncoder().encode('Nightlink')],5);if(self.length<52)throw new Error('Radio returned incomplete MeshCore identity data.');
    const info=await this.command([0x16,3],0x0d);assertActive();this.setState('connected');this.emit('identity',{name:this.device.name||'MeshCore radio',txPower:self[2],frequency:new DataView(self.buffer,self.byteOffset,self.byteLength).getUint32(48,true)/1000,deviceInfo:info,selfInfo:self});
   }catch(error){this.cleanup();this.device?.removeEventListener('gattserverdisconnected',this.lost);if(this.device?.gatt)this.device.gatt.disconnect();this.setState('disconnected');throw error;}finally{this.busy=false;}
  }
  cleanup(){if(this.pending){clearTimeout(this.pending.timer);this.pending.reject(new Error('Bluetooth disconnected.'));this.pending=null;}if(this.tx)this.tx.removeEventListener('characteristicvaluechanged',this.notification);this.tx=null;this.rx=null;}
  disconnect(reason='manual'){if(reason!=='switch')this.connectEpoch++;this.cleanup();if(this.device){this.device.removeEventListener('gattserverdisconnected',this.lost);if(this.device.gatt)this.device.gatt.disconnect();}this.setState('disconnected');this.emit('interruption',{reason});}
 }
 root.MeshlineBLE=MeshlineBLE;
 if(typeof module!=='undefined')module.exports={MeshlineBLE,SERVICE,RX,TX};
})(globalThis);
