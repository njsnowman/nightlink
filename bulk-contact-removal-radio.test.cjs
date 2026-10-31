/* Bulk removal through the real radio queue against a simulated companion roster with advertisements arriving mid-run. Synthetic only. */
const {test}=require('node:test'),assert=require('node:assert/strict');
const {MeshlineRadio}=require(process.env.NIGHTLINK_RADIO||'./radio.js'),{plan,run}=require('./bulk-contact-removal.js');
const owner='dd'.repeat(32),hex=n=>n.toString(16).padStart(64,'0');
function frame(type,key){const d=new Uint8Array(148);d[0]=type;d.set(Buffer.from(key,'hex'),1);d[33]=1;d[35]=255;return d;}
function companion({contacts,advertEvery=1}){
 const ble=new EventTarget(),roster=new Set(contacts);let next=0x10000,removals=0;ble.state='connected';ble.disconnect=()=>{ble.state='disconnected';};
 const radio=new MeshlineRadio(ble);radio.ready=true;radio.identity={key:owner};radio.contacts=contacts.map(key=>({key}));
 // An advertisement from a new node is stored by the firmware and pushed as 0x8a.
 const advert=()=>{const key=hex(next++);roster.add(key);radio.packet(frame(0x8a,key));};
 ble.command=async bytes=>{
  const key=Buffer.from(bytes.slice(1,33)).toString('hex');
  if(bytes[0]===15){if(!roster.delete(key)){const e=Error('not found');e.radioCode=2;throw e;}if(++removals%advertEvery===0)advert();return Uint8Array.of(0);}
  if(bytes[0]===30){if(roster.has(key))return frame(3,key);const e=Error('not found');e.radioCode=2;throw e;}
  // Full-list read (used by the rc.16 verification). Assumed model, not confirmed against firmware: the count is sent first,
  // an advert lands mid-stream and the live iteration then includes the new contact.
  if(bytes[0]===4){const count=Uint8Array.of(2,0,0,0,0);new DataView(count.buffer).setUint32(1,roster.size,true);radio.packet(count);let i=0;for(const k of roster){radio.packet(frame(3,k));if(++i===1)advert();}return Uint8Array.of(4,0,0,0,0);}
  throw Error('unexpected command '+bytes[0]);
 };
 return{radio,roster};
}
test('bulk removal of 256 non-favorites completes while advertisements add contacts during every removal',async()=>{
 const contacts=Array.from({length:263},(_,i)=>hex(i+1)),favorites=new Set(contacts.slice(0,7));
 const {radio,roster}=companion({contacts}),{remove}=plan(radio.contacts,favorites,owner);
 assert.equal(remove.length,256);
 const result=await run({keys:remove.map(c=>c.key),guard:()=>{},protectedKey:k=>favorites.has(k),present:k=>radio.contacts.some(c=>c.key===k),remove:(k,o)=>radio.removeContact(k,o)});
 assert.equal(result.state,'complete',result.error);assert.equal(result.removed,256);
 for(const k of favorites)assert.ok(roster.has(k)&&radio.contacts.some(c=>c.key===k));
 for(const c of remove)assert.ok(!roster.has(c.key));
});
