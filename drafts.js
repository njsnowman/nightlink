/* Local drafts are inert text, scoped to radio and conversation. */
(function(root){class NightlinkDrafts{
 constructor(storage,onError=()=>{}){this.storage=storage;this.onError=onError;this.cache=new Map();}
 entries(owner){if(!/^[a-f0-9]{64}$/.test(owner||''))return {};if(!this.cache.has(owner)){let entries={};try{const data=JSON.parse(this.storage.getItem('nightlink.drafts.'+owner)||'{}');if(data&&typeof data==='object'&&!Array.isArray(data))for(const [key,value]of Object.entries(data))if(/^(channel|direct):/.test(key)&&key.length<=200&&typeof value==='string'&&value.length<=4096)entries[key]=value;}catch{this.onError();}this.cache.set(owner,entries);}return this.cache.get(owner);}
 get(owner,id){return this.entries(owner)[id]||'';}
 set(owner,id,text){if(!/^[a-f0-9]{64}$/.test(owner||'')||! /^(channel|direct):/.test(id||'')||id.length>200||typeof text!=='string'||text.length>4096)return false;const entries=this.entries(owner);if(text)entries[id]=text;else delete entries[id];try{this.storage.setItem('nightlink.drafts.'+owner,JSON.stringify(entries));return true;}catch{this.onError();return false;}}
 clearIf(owner,id,sent){if(this.get(owner,id).trim()!==sent.trim())return false;return this.set(owner,id,'');}
}root.NightlinkDrafts=NightlinkDrafts;if(typeof module!=='undefined')module.exports={NightlinkDrafts};})(globalThis);
