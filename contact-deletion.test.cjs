const {test}=require('node:test'),assert=require('node:assert/strict');
const {MeshlineRadio}=require('./radio.js');
const key='ab'.repeat(32),other='ac'.repeat(32),owner='cd'.repeat(32);
function frame(type,size){const d=new Uint8Array(size);d[0]=type;return d;}
function contact(key){const d=frame(3,148);d.set(Buffer.from(key,'hex'),1);d[33]=1;d[35]=255;return d;}
function fixture(mode='success'){
 const writes=[],ble=new EventTarget();ble.state='connected';ble.disconnect=()=>{ble.state='disconnected';};
 const r=new MeshlineRadio(ble);r.ready=true;r.identity={key:owner};r.contacts=[{key},{key:other}];
 ble.command=async bytes=>{writes.push([...bytes]);if(bytes[0]===15){if(mode==='reject'){const e=Error('refused');e.radioCode=1;throw e;}if(mode==='switch')r.identity={key:'ef'.repeat(32)};return frame(0,mode==='bad-ack'?2:1);}assert.equal(bytes[0],4);
 const start=frame(2,5);new DataView(start.buffer).setUint32(1,mode==='count'?2:1,true);r.packet(start);r.packet(contact(mode==='still-present'?key:other));if(mode==='duplicate')r.packet(contact(other));if(mode==='malformed')r.packet(frame(3,12));return frame(4,5);};return{r,ble,writes};
}
test('removes exact full key only after accepted command and complete contact-list readback',async()=>{const {r,writes}=fixture();let removed;r.addEventListener('contact-removed',e=>removed=e.detail);assert.deepEqual(await r.removeContact(key),{key,removed:true});assert.deepEqual(writes,[[15,...Buffer.from(key,'hex')],[4]]);assert.deepEqual(r.contacts.map(c=>c.key),[other]);assert.deepEqual(removed,{key});assert.equal(r.configuring,false);assert.equal(r._contactRemovalReadback==null,true);});
for(const mode of ['reject','bad-ack','switch','count','still-present','duplicate','malformed'])test('unverified removal retains cached contacts: '+mode,async()=>{const {r}=fixture(mode);const before=JSON.stringify(r.contacts);await assert.rejects(r.removeContact(key));assert.equal(JSON.stringify(r.contacts),before);assert.equal(r.configuring,false);assert.equal(r._contactRemovalReadback==null,true);});
test('invalid, missing, own and unavailable contacts never write',async()=>{for(const kind of ['invalid','missing','own','offline','syncing','configuring','not-ready']){const {r,ble,writes}=fixture();let target=key;if(kind==='invalid')target='abc';if(kind==='missing')target='ff'.repeat(32);if(kind==='own')target=owner;if(kind==='offline')ble.state='disconnected';if(kind==='syncing')r.syncing=true;if(kind==='configuring')r.configuring=true;if(kind==='not-ready')r.ready=false;await assert.rejects(r.removeContact(target));assert.deepEqual(writes,[],kind);}});
test('queued removal rechecks connection generation before writing',async()=>{const {r,writes}=fixture();let resume;r.tail=new Promise(resolve=>resume=resolve);const pending=r.removeContact(key);r.generation++;resume();await assert.rejects(pending,/changed/);assert.deepEqual(writes,[]);});
