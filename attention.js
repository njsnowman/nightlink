/* Persistent local read state follows message order rather than radio timestamps. */
(function(root){
class NightlinkAttention {
 constructor(storage,key,messages=[]){
  this.storage=storage;this.key=key;this.data={read:[],positions:{},muted:[]};
  try{const saved=JSON.parse(storage.getItem(key)||'null');if(saved&&Array.isArray(saved.read)&&Array.isArray(saved.muted)&&saved.positions&&typeof saved.positions==='object')this.data=saved;else this.data.read=messages.map(m=>m.id);}catch{this.data.read=messages.map(m=>m.id);}
  this.read=new Set(this.data.read);this.muted=new Set(this.data.muted);this.save(messages);
 }
 save(messages){if(messages){const ids=new Set(messages.map(m=>m.id));this.read=new Set([...this.read].filter(id=>ids.has(id)));const conversations=new Set(messages.map(m=>m.conversation));for(const id of Object.keys(this.data.positions))if(!conversations.has(id))delete this.data.positions[id];}this.data.read=[...this.read];this.data.muted=[...this.muted];try{this.storage.setItem(this.key,JSON.stringify(this.data));return true;}catch{return false;}}
 unread(messages,id){return messages.filter(m=>!m.own&&(!id||m.conversation===id)&&!this.read.has(m.id));}
 mark(messages,id,through){const rows=messages.filter(m=>m.conversation===id);const end=through==null?rows.length-1:rows.findIndex(m=>m.id===through);for(let i=0;i<=end;i++)this.read.add(rows[i].id);this.save(messages);}
 position(id,value){if(value===undefined)return this.data.positions[id];this.data.positions[id]=value;this.save();}
 mute(id,value){if(value)this.muted.add(id);else this.muted.delete(id);this.save();}
 isMention(text,name){if(!name)return false;const needle=name.toLocaleLowerCase();return [...text.matchAll(/@\[([^\]]+)\]|@([\p{L}\p{N}_-]+)/gu)].some(m=>(m[1]||m[2]).toLocaleLowerCase()===needle);}
}
if(typeof module!=='undefined')module.exports=NightlinkAttention;else root.NightlinkAttention=NightlinkAttention;
})(globalThis);
