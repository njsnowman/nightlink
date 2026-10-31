/* Presentation only: never sends, retries, polls or changes delivery state. */
(function(root){
 const labels={offline:'Radio disconnected',syncing:'Synchronizing radio',standby:'Ready · standing by',receive:'Incoming message',queued:'Queued · waiting for radio',sending:'Sending to radio',retrying:'Retrying transmission',awaiting:'Awaiting recipient ACK',acknowledged:'Recipient acknowledged',broadcast:'Broadcast accepted by radio',unconfirmed:'No recipient ACK · delivery unconfirmed',error:'Send error · delivery unconfirmed','not-sent':'Not sent · radio rejected request',cancelled:'Cancelled · delivery unconfirmed',interrupted:'Interrupted · delivery unconfirmed'};
 function stateFor(message){if(message.ack)return 'acknowledged';const phase=message.phase||'';if(phase==='unconfirmed'&&/rejected|Failed.*(?:GATT|write|request|radio|transport)/i.test(message.status||''))return 'error';return Object.hasOwn(labels,phase)?phase:'standby';}
 class Activity{
  constructor(){this.owner=null;this.initialized=false;this.seen=new Set();this.events=new Map();this.receives=new Map();}
  receive(conversation,id,now=Date.now()){this.receives.set(conversation,{id,until:now+2600});}
  update({owner,ready,messages,now=Date.now()}){
   if(owner!==this.owner){this.owner=owner;this.initialized=false;this.seen.clear();this.events.clear();this.receives.clear();this.signatures=new Map();}
   if(!ready)this.receives.clear();
   for(const m of messages){const signature=[m.phase,m.status,!!m.ack,!!m.pending].join('|'),old=this.seen.has(m.id);if(!old&&this.initialized&&ready&&!m.own)this.receive(m.conversation,m.id,now);
    if(m.own&&((m.pending&&ready)||(old&&this.signatures?.get(m.id)!==signature&&this.initialized))){this.events.set(m.conversation,{state:stateFor(m),id:m.id,until:m.pending?Infinity:now+6000});}
    this.seen.add(m.id);if(!this.signatures)this.signatures=new Map();this.signatures.set(m.id,signature);
   }
   this.initialized=true;
  }
  snapshot(conversation,connection,now=Date.now()){if(connection!=='ready')return{state:connection==='syncing'?'syncing':'offline',receiving:false};const e=this.events.get(conversation),receiving=(this.receives.get(conversation)?.until||0)>now;return{state:e&&e.until>now?e.state:receiving?'receive':'standby',receiving};}
  get(conversation,connection,now=Date.now()){return this.snapshot(conversation,connection,now).state;}
 }
 function mount(anchor){const rail=document.createElement('div');rail.className='chat-signal-rail';rail.setAttribute('aria-label','Chat activity');for(const name of ['LINK','RX','TX','ACK','FAULT']){const cell=document.createElement('span');cell.className='chat-signal-cell';cell.dataset.signal=name.toLowerCase();const led=document.createElement('i');led.setAttribute('aria-hidden','true');cell.append(led,document.createTextNode(name));rail.append(cell);}const label=document.createElement('span');label.className='chat-signal-label';label.setAttribute('role','status');rail.append(label);anchor.after(rail);return rail;}
 function paint(rail,status){const {state,receiving}=typeof status==='string'?{state:status,receiving:status==='receive'}:status;if(rail.dataset.state===state&&rail.dataset.receiving===String(receiving))return;rail.dataset.state=state;rail.dataset.receiving=String(receiving);rail.querySelector('.chat-signal-label').textContent=(labels[state]||labels.standby)+(receiving&&state!=='receive'?' · receiving':'');}
 root.NightlinkChatSignals={Activity,stateFor,mount,paint,labels};if(typeof module!=='undefined')module.exports=root.NightlinkChatSignals;
})(globalThis);
