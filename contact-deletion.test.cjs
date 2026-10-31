const {test}=require('node:test'),assert=require('node:assert/strict');
const {MeshlineRadio}=require('./radio.js');
const key='ab'.repeat(32),other='ac'.repeat(32),owner='cd'.repeat(32);
function frame(type,size){const d=new Uint8Array(size);d[0]=type;return d;}
function contact(key){const d=frame(3,148);d.set(Buffer.from(key,'hex'),1);d[33]=1;d[35]=255;return d;}
function fixture(mode='success'){
 const writes=[],ble=new EventTarget();ble.state='connected';ble.disconnect=()=>{ble.state='disconnected';};
 const r=new MeshlineRadio(ble);r.ready=true;r.identity={key:owner};r.contacts=[{key},{key:other}];
 ble.command=async bytes=>{writes.push([...bytes]);if(bytes[0]===15){if(mode==='reject'){const e=Error('refused');e.radioCode=1;throw e;}if(mode==='switch')r.identity={key:'ef'.repeat(32)};return frame(0,mode==='bad-ack'?2:1);}assert.equal(bytes[0],30);
 if(mode==='busy-mesh'){const advert=contact('ee'.repeat(32));advert[0]=0x8a;r.packet(advert);}
 if(mode==='still-present')return contact(key);if(mode==='other-contact')return contact(other);if(mode==='malformed')return frame(3,12);
 const e=Error('not found');e.radioCode=mode==='lookup-error'?1:2;throw e;};return{r,ble,writes};
}
test('removes exact full key only after accepted command and exact-key not-found readback',async()=>{const {r,writes}=fixture();let removed;r.addEventListener('contact-removed',e=>removed=e.detail);assert.deepEqual(await r.removeContact(key),{key,removed:true});assert.deepEqual(writes,[[15,...Buffer.from(key,'hex')],[30,...Buffer.from(key,'hex')]]);assert.deepEqual(r.contacts.map(c=>c.key),[other]);assert.deepEqual(removed,{key});assert.equal(r.configuring,false);});
test('adverts adding other contacts during verification do not fail the removal',async()=>{const {r}=fixture('busy-mesh');assert.deepEqual(await r.removeContact(key),{key,removed:true});assert.deepEqual(r.contacts.map(c=>c.key).sort(),[other,'ee'.repeat(32)].sort());});
for(const mode of ['reject','bad-ack','switch','still-present','other-contact','lookup-error','malformed'])test('unverified removal retains cached contacts: '+mode,async()=>{const {r}=fixture(mode);const before=JSON.stringify(r.contacts);await assert.rejects(r.removeContact(key));assert.equal(JSON.stringify(r.contacts),before);assert.equal(r.configuring,false);});
test('invalid, missing, own and unavailable contacts never write',async()=>{for(const kind of ['invalid','missing','own','offline','syncing','configuring','not-ready']){const {r,ble,writes}=fixture();let target=key;if(kind==='invalid')target='abc';if(kind==='missing')target='ff'.repeat(32);if(kind==='own')target=owner;if(kind==='offline')ble.state='disconnected';if(kind==='syncing')r.syncing=true;if(kind==='configuring')r.configuring=true;if(kind==='not-ready')r.ready=false;await assert.rejects(r.removeContact(target));assert.deepEqual(writes,[],kind);}});
test('queued removal rechecks connection generation before writing',async()=>{const {r,writes}=fixture();let resume;r.tail=new Promise(resolve=>resume=resolve);const pending=r.removeContact(key);r.generation++;resume();await assert.rejects(pending,/changed/);assert.deepEqual(writes,[]);});
test('removal execution guard is rechecked after serialization before the command',async()=>{const {r,writes}=fixture();let resume,protectedNow=false;r.tail=new Promise(resolve=>resume=resolve);const pending=r.removeContact(key,{guard:()=>{if(protectedNow)throw Error('now favorite');}});protectedNow=true;resume();await assert.rejects(pending,/now favorite/);assert.deepEqual(writes,[]);assert.equal(r.configuring,false);});
