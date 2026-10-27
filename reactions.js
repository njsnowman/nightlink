/* Receive-only MeshCore One reaction interoperability. Stored wire text is unchanged. */
(function(root){
 const alphabet='0123456789abcdefghjkmnpqrstvwxyz',cache=new Map();
 function normalizeHash(value){if(!/^[0-9a-hjkmnp-tv-zilo]{8}$/i.test(value))return null;return value.toLowerCase().replace(/o/g,'0').replace(/[il]/g,'1');}
 function emoji(value){if(!value||typeof Intl.Segmenter!=='function')return false;const parts=[...new Intl.Segmenter(undefined,{granularity:'grapheme'}).segment(value)];return parts.length===1&&(/\p{Extended_Pictographic}|\p{Regional_Indicator}/u.test(value)||/^[#*0-9]\uFE0F?\u20E3$/u.test(value));}
 function parse(text,direct=false){
  if(typeof text!=='string'||text.length>512)return null;
  const lines=text.split(/\r?\n/);if(lines.length!==2)return null;const hash=normalizeHash(lines[1]);if(!hash)return null;
  if(direct)return emoji(lines[0])?{emoji:lines[0],hash,targetSender:null}:null;
  const match=/^@\[([^\[\]\r\n]+)\](.+)$/u.exec(lines[0])||/^(.+)@\[([^\[\]\r\n]+)\]$/u.exec(lines[0]);if(!match)return null;
  const mentionFirst=lines[0].startsWith('@['),targetSender=match[mentionFirst?1:2],value=match[mentionFirst?2:1];return emoji(value)?{emoji:value,hash,targetSender}:null;
 }
 async function hash(text,timestamp){
  if(typeof text!=='string'||!Number.isInteger(timestamp)||timestamp<0||timestamp>0xffffffff)return null;
  const key=JSON.stringify([text,timestamp]);if(cache.has(key))return cache.get(key);
  const bytes=new TextEncoder().encode(text),data=new Uint8Array(bytes.length+4);data.set(bytes);new DataView(data.buffer).setUint32(bytes.length,timestamp,true);
  const pending=root.crypto.subtle.digest('SHA-256',data).then(buffer=>{let bits=0n;for(const byte of new Uint8Array(buffer).slice(0,5))bits=(bits<<8n)|BigInt(byte);let result='';for(let shift=35n;shift>=0n;shift-=5n)result+=alphabet[Number((bits>>shift)&31n)];return result;}).catch(()=>null);
  cache.set(key,pending);if(cache.size>4000)cache.delete(cache.keys().next().value);return pending;
 }
 function direct(m){return m.kind==='direct'||m.kind==='contact'||m.direct===true||m.target?.kind==='direct'||m.target?.kind==='contact';}
 async function plan(messages,{selfName='',peerName='',conversation=''}={}){
  const reactions=new Map(),targets=new Map(),parsed=new Map(),index=new Map(),scope=m=>m.conversation||conversation;
  for(const m of messages){const r=parse(m.text,direct(m));if(r)parsed.set(m.id,r);}
  await Promise.all(messages.filter(m=>!parsed.has(m.id)).map(async m=>{const h=await hash(m.text,m.timestamp);if(!h)return;const key=JSON.stringify([scope(m),h]),list=index.get(key)||[];list.push(m);index.set(key,list);}));
  const seen=new Set();for(const m of messages){const r=parsed.get(m.id);if(!r)continue;const sender=m.own?selfName:(m.sender||peerName||'Unknown sender');const candidates=(index.get(JSON.stringify([scope(m),r.hash]))||[]).filter(t=>direct(m)===direct(t)&&(r.targetSender===null||(t.own?selfName:t.sender)===r.targetSender));
   // Short hashes and channel display names are not authenticated identities.
   if(candidates.length!==1)continue;const target=candidates[0],dedup=JSON.stringify([scope(m),r.hash,r.targetSender,sender,r.emoji]);targets.set(m.id,target.id);if(seen.has(dedup))continue;seen.add(dedup);const list=reactions.get(target.id)||[];list.push({emoji:r.emoji,sender,id:m.id});reactions.set(target.id,list);
  }
  return{parsed,targets,reactions};
 }
 root.NightlinkReactions={parse,hash,plan};if(typeof module!=='undefined')module.exports=root.NightlinkReactions;
})(globalThis);
