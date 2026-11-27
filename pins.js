/* Pinned messages: up to five per conversation, stored locally per radio identity. Pins are references to stored
   messages; nothing is sent to the radio and other users do not see them. */
(function(root){
 'use strict';
 const MAX=5,key=owner=>'nightlink.pins.'+(owner||'local');
 function read(storage,owner){try{const o=JSON.parse(storage?.getItem(key(owner))||'{}');return o&&typeof o==='object'&&!Array.isArray(o)?o:{};}catch{return {};}}
 function write(storage,owner,all){try{storage?.setItem(key(owner),JSON.stringify(all));return true;}catch{return false;}}
 function list(storage,owner,conversation){const v=read(storage,owner)[conversation];return Array.isArray(v)?v.filter(x=>typeof x==='string'):[];}
 // Returns {ok, reason}. Newest pin first; pinning an existing id moves it to the front.
 function pin(storage,owner,conversation,id){if(!id)return {ok:false,reason:'none'};const all=read(storage,owner);const cur=list(storage,owner,conversation).filter(x=>x!==id);
  if(cur.length>=MAX)return {ok:false,reason:'full'};all[conversation]=[id,...cur];return {ok:write(storage,owner,all),reason:'pinned'};}
 function unpin(storage,owner,conversation,id){const all=read(storage,owner);const cur=list(storage,owner,conversation);const next=id?cur.filter(x=>x!==id):[];
  if(next.length)all[conversation]=next;else delete all[conversation];write(storage,owner,all);return cur.length-next.length;}
 const core={MAX,read,list,pin,unpin};
 if(typeof module==='object'&&module.exports){module.exports=core;return;}
 root.NightlinkPins=core;
})(typeof window==='object'?window:globalThis);
