/* Read observed channel routes from authenticated raw RX logs. Keys remain in memory. */
(function(root){
 const hex=d=>Array.from(d,b=>b.toString(16).padStart(2,'0')).join('');
 function parseRaw(d){if(d.length<5||d[0]!==0x88)return null;const raw=d.slice(3),header=raw[0],route=header&3;if((header>>6)!==0||((header>>2)&15)!==5)return null;let at=(route===0||route===3)?5:1;if(at>=raw.length)return null;const encoded=raw[at++],size=(encoded>>6)+1,count=encoded&63;if(size>3||count*size>64||at+count*size+19>raw.length)return null;const path=[];for(let i=0;i<count;i++)path.push(hex(raw.slice(at+i*size,at+(i+1)*size)));at+=count*size;const payload=raw.slice(at);if((payload.length-3)%16)return null;return{path,routeType:route,direct:route===2||route===3,channelHash:payload[0],mac:payload.slice(1,3),cipher:payload.slice(3),snr:new DataView(d.buffer,d.byteOffset,d.byteLength).getInt8(1)/4,rssi:new DataView(d.buffer,d.byteOffset,d.byteLength).getInt8(2)};}
 async function decodeRoute(raw,secret){
  // MeshCore uses zero-padded AES-128 ECB and HMAC-SHA256 with a 32-byte zero-extended key.
  const extended=new Uint8Array(32);extended.set(secret);const hkey=await crypto.subtle.importKey('raw',extended,{name:'HMAC',hash:'SHA-256'},false,['sign']);const mac=new Uint8Array(await crypto.subtle.sign('HMAC',hkey,raw.cipher));if(mac[0]!==raw.mac[0]||mac[1]!==raw.mac[1])return null;
  // WebCrypto provides CBC rather than ECB. Append a valid CBC padding block, decrypt,
  // then undo CBC's previous-ciphertext XOR for each original block to recover ECB.
  const key=await crypto.subtle.importKey('raw',secret,'AES-CBC',false,['encrypt','decrypt']);const tail=new Uint8Array(await crypto.subtle.encrypt({name:'AES-CBC',iv:raw.cipher.slice(-16)},key,new Uint8Array()));const padded=new Uint8Array(raw.cipher.length+16);padded.set(raw.cipher);padded.set(tail,raw.cipher.length);const plain=new Uint8Array(await crypto.subtle.decrypt({name:'AES-CBC',iv:new Uint8Array(16)},key,padded));for(let at=16;at<plain.length;at++)plain[at]^=raw.cipher[at-16];if(plain.length<5||(plain[4]>>2)!==0)return null;return{...raw,timestamp:new DataView(plain.buffer).getUint32(0,true),text:new TextDecoder().decode(plain.slice(5)).split('\0')[0]};
 }
 function hopSummary(encoded){if(encoded==null)return'Route unknown';if(encoded===255)return'Direct · hop count unavailable';const size=(encoded>>6)+1,count=encoded&63;if(size>3||count*size>64)return'Invalid route data';return count===0?'0 hops · direct reception':count+' hop'+(count===1?'':'s');}
 function resolvePath(path,contacts){return path.map(hash=>({hash,candidates:contacts.filter(c=>c.type===2&&c.key.startsWith(hash)).map(c=>({key:c.key,name:c.name}))}));}
 root.MeshlineRoutes={parseRaw,decodeRoute,hopSummary,resolvePath};if(typeof module!=='undefined')module.exports=root.MeshlineRoutes;
})(globalThis);
