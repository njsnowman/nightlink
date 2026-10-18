(function(root){
'use strict';
const validKey=key=>typeof key==='string'&&/^[a-f0-9]{64}$/i.test(key);
const normalizeName=value=>String(value||'').normalize('NFKC').trim().toLocaleLowerCase();
function fingerprint(key){if(!validKey(key))throw Error('A full 64-character public key is required.');return key.toUpperCase().match(/.{4}/g).join(' ');}
function payload(key){if(!validKey(key))throw Error('Invalid public key.');return 'nightlink:identity:v1:'+key.toLowerCase();}
function parse(value){const compact=String(value||'').trim().replace(/^nightlink:identity:v1:/,'').replace(/\s/g,'');if(!validKey(compact))throw Error('Use a full public key or a Nightlink identity QR code.');return compact.toLowerCase();}
function verified(card,key){return validKey(key)&&card?.identityVerification?.key===key.toLowerCase()&&Number.isFinite(card.identityVerification.comparedAt);}
function collisions(node,contacts,cards){if(!validKey(node.key))return [];const names=new Set([node.name,cards.get(node.key)?.nickname].map(normalizeName).filter(Boolean)),found=[];for(const [key,card]of cards){if(key===node.key||!verified(card,key))continue;const peer=contacts.find(c=>c.key===key);const aliases=[...(Array.isArray(card.identityVerification.names)?card.identityVerification.names:[]),card.nickname,peer?.name].filter(v=>typeof v==='string');if(aliases.some(name=>names.has(normalizeName(name))))found.push({key,name:card.nickname||peer?.name||card.identityVerification.names?.[0]||'Previously compared contact'});}return found;}
const api={validKey,fingerprint,payload,parse,verified,collisions};if(typeof module==='object'&&module.exports)module.exports=api;else root.NightlinkIdentities=api;
})(globalThis);
