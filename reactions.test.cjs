const test=require('node:test'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {parse,hash,plan}=require('./reactions.js');
const original={id:'original',kind:'channel',conversation:'channel:one',sender:'N0PAR T1000-E',text:'Hello mesh 👋',timestamp:1700000000};
test('recognizes Shaun-style and legacy channel reaction envelopes, not arbitrary hash tails',()=>{
 assert.deepEqual(parse('@[N0PAR T1000-E]👍\nebj002mf'),{targetSender:'N0PAR T1000-E',emoji:'👍',hash:'ebj002mf'});
 assert.equal(parse('👍@[N0PAR T1000-E]\nEBJOO2MF').hash,'ebj002mf');
 assert.equal(parse('@[Alice]👩🏽‍💻\r\nebj002mf').emoji,'👩🏽‍💻');
 assert.equal(parse('@[Alice]🇺🇸\nebj002mf').emoji,'🇺🇸');
 assert.equal(parse('@[Alice]1️⃣\nebj002mf').emoji,'1️⃣');
 for(const text of ['@[Alice]👍 hello\nebj002mf','@[Alice]👍👍\nebj002mf','@[Alice]thanks\nebj002mf','@[Alice]7\nebj002mf','Hello\nebj002mf','@[Alice]👍\nebj002mu','@[Alice]👍\nebj002mf\n','@[]👍\nebj002mf','@[Alice]👍\n<script>'])assert.equal(parse(text),null,text);
 assert.equal(parse('👍\nebj002mf'),null);assert.equal(parse('@[Alice]👍\nebj002mf',true),null);assert.equal(parse('👍\nebj002mf',true).emoji,'👍');
});
test('hash uses exact UTF-8 text, unsigned sender timestamp little endian and first forty digest bits',async()=>{
 const stamp=Buffer.alloc(4);stamp.writeUInt32LE(original.timestamp);const bytes=crypto.createHash('sha256').update(Buffer.concat([Buffer.from(original.text),stamp])).digest().subarray(0,5);assert.equal(bytes.toString('hex'),'c8b81b55d7');
 const alphabet='0123456789abcdefghjkmnpqrstvwxyz',binary=[...bytes].map(n=>n.toString(2).padStart(8,'0')).join('');let expected='';for(let i=0;i<40;i+=5)expected+=alphabet[parseInt(binary.slice(i,i+5),2)];assert.equal(await hash(original.text,original.timestamp),expected);
 assert.notEqual(await hash(original.text+' ',original.timestamp),expected);assert.notEqual(await hash(original.text,original.timestamp+1),expected);assert.equal(await hash(original.text,-1),null);assert.equal(await hash(original.text,2**32),null);
});
test('out-of-order/history reactions match within conversation and exact target sender, without mutating records',async()=>{
 const h=await hash(original.text,original.timestamp),r={id:'reaction',kind:'channel',conversation:original.conversation,sender:'Shaun',text:'@[N0PAR T1000-E]👍\n'+h,timestamp:1700000030};const data=[r,original],saved=JSON.stringify(data),p=await plan(data);assert.equal(p.targets.get(r.id),original.id);assert.equal(p.reactions.get(original.id)[0].sender,'Shaun');assert.equal(JSON.stringify(data),saved);
 for(const wrong of [{...original,conversation:'channel:two'},{...original,sender:'Other sender'}])assert.equal((await plan([r,wrong])).targets.size,0);
 const collision={...original,id:'ambiguous'};assert.equal((await plan([r,original,collision])).targets.size,0);
 assert.equal((await plan([r])).parsed.size,1);assert.equal((await plan([r])).targets.size,0);
});
test('deduplicates retransmitted reactions per sender/emoji and retains different senders',async()=>{
 const h=await hash(original.text,original.timestamp),r={id:'r1',kind:'channel',conversation:original.conversation,sender:'Shaun',text:'@[N0PAR T1000-E]👍\n'+h,timestamp:1700000030};const p=await plan([original,r,{...r,id:'r2'},{...r,id:'r3',sender:'Alex'}]);assert.equal(p.reactions.get(original.id).length,2);assert.equal(p.targets.size,3);
});
test('DM matches without a mention and channel own messages use the original radio name',async()=>{
 const h=await hash(original.text,original.timestamp),r={id:'dm-r',direct:true,text:'👍\n'+h,timestamp:1700000030};const p=await plan([{...original,direct:true,kind:'direct',conversation:undefined},r],{peerName:'Shaun',conversation:'direct:peer'});assert.equal(p.targets.get('dm-r'),original.id);
 const own={...original,own:true,sender:'You'},c={id:'channel-r',kind:'channel',conversation:original.conversation,sender:'Shaun',text:'@[Receiver]👍\n'+h,timestamp:1700000030};assert.equal((await plan([own,c],{selfName:'Receiver'})).targets.get(c.id),own.id);
});
