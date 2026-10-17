/* One active radio link; shared protocol/history identity across transports. */
(function(root){
 class MeshlineTransport extends EventTarget{
  constructor(bluetooth,usb){super();this.links={bluetooth,usb};this.kind='bluetooth';for(const [kind,link]of Object.entries(this.links))for(const type of ['state','identity','packet','interruption','setup-progress','warning'])link.addEventListener(type,e=>{if(kind===this.kind)this.dispatchEvent(new CustomEvent(type,{detail:type==='packet'?e.detail:{...e.detail,transport:kind}}));});}
  get active(){return this.links[this.kind];}
  get state(){return this.active.state;}set state(value){this.active.state=value;}
  get busy(){return this.active.busy;}
  get device(){return this.active.device;}
  get label(){return this.kind==='usb'?'USB':'Bluetooth';}
  select(kind){if(!this.links[kind])throw new Error('Unknown connection type.');if(kind===this.kind)return;if(this.busy)throw new Error('Cancel the current connection attempt first.');this.disconnect('switch');this.kind=kind;this.dispatchEvent(new CustomEvent('state',{detail:{state:this.state,name:this.device?.name,transport:kind}}));}
  connect(reuse=false){return this.active.connect(reuse);}
  command(...args){return this.active.command(...args);}
  disconnect(reason='manual'){return this.active.disconnect(reason);}
 }
 root.MeshlineTransport=MeshlineTransport;if(typeof module!=='undefined')module.exports={MeshlineTransport};
})(globalThis);
