const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path'),os=require('node:os');
const {createStore}=require('./security-store.cjs'),{Security}=require('./security-core.cjs');
test('Windows initializes async provider before reading and uses it for every write',async()=>{
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'nightlink-store-')),file=path.join(dir,'security.bin'),events=[];
 const safeStorage={isAsyncEncryptionAvailable:async()=>{events.push('ready');return true;},encryptStringAsync:async text=>{events.push('encrypt');return Buffer.from(text);},decryptStringAsync:async b=>{events.push('decrypt');return{result:b.toString()};},isEncryptionAvailable:()=>{throw Error('No Windows sync fallback');},encryptString:()=>{throw Error('No Windows sync fallback');},decryptString:()=>{throw Error('No Windows sync fallback');}};
 const first=await createStore({file,safeStorage,platform:'win32'});assert.equal(await first.read(),null);const data={version:1,enabled:false,attempts:0,nextAt:0};await first.write(data);const second=await createStore({file,safeStorage,platform:'win32'});assert.deepEqual(await second.read(),data);assert.deepEqual(events,['ready','encrypt','ready','decrypt']);
});
test('missing async Windows provider prevents enrollment without replacing a legacy file',async()=>{
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'nightlink-store-unavailable-')),file=path.join(dir,'security.bin'),bytes=Buffer.from('legacy');await fs.writeFile(file,bytes);
 const store=await createStore({file,platform:'win32',safeStorage:{isEncryptionAvailable:()=>true}});assert.equal(store.available(),false);await assert.rejects(store.read(),/unavailable/);await assert.rejects(store.write({}),/unavailable/);assert.deepEqual(await fs.readFile(file),bytes);
});
test('unreadable ciphertext stays byte-identical and startup fails closed',async()=>{
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'nightlink-store-corrupt-')),file=path.join(dir,'security.bin'),bytes=Buffer.from('unreadable');await fs.writeFile(file,bytes);
 const store=await createStore({file,platform:'win32',safeStorage:{isAsyncEncryptionAvailable:async()=>true,encryptStringAsync:async()=>{throw Error('must not write');},decryptStringAsync:async()=>{throw Error('cannot decrypt');}}});const security=new Security(store);assert.equal((await security.load()).broken,true);assert.equal(security.unlocked,false);assert.deepEqual(await fs.readFile(file),bytes);
});
test('failed protected write retains the original settings file',async()=>{
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'nightlink-store-write-')),file=path.join(dir,'security.bin');await fs.writeFile(file,'previous');const store=await createStore({file,platform:'win32',safeStorage:{isAsyncEncryptionAvailable:async()=>true,encryptStringAsync:async()=>{throw Error('provider failed');},decryptStringAsync:async()=>({result:'{}'})}});await assert.rejects(store.write({}),/provider failed/);assert.equal(await fs.readFile(file,'utf8'),'previous');
});
