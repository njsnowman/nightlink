/* OS-protected settings. Windows uses the persistent asynchronous key provider. */
const fs=require('node:fs/promises'),path=require('node:path'),crypto=require('node:crypto');
async function createStore({file,safeStorage,platform=process.platform,io=fs}){
 const asyncAPI=typeof safeStorage.isAsyncEncryptionAvailable==='function'&&typeof safeStorage.encryptStringAsync==='function'&&typeof safeStorage.decryptStringAsync==='function';
 let ready=false;
 try{ready=platform==='win32'?asyncAPI&&await safeStorage.isAsyncEncryptionAvailable():asyncAPI?await safeStorage.isAsyncEncryptionAvailable():safeStorage.isEncryptionAvailable();}catch{}
 const available=()=>ready===true;
 async function read(){
  let bytes;try{bytes=await io.readFile(file);}catch(error){if(error.code==='ENOENT')return null;throw error;}
  if(bytes.length>65536||!available())throw Error('Protected security storage is unavailable.');
  const plaintext=asyncAPI?(await safeStorage.decryptStringAsync(bytes))?.result:safeStorage.decryptString(bytes);
  if(typeof plaintext!=='string')throw Error('Invalid protected security response.');
  return JSON.parse(plaintext);
 }
 async function write(config){
  if(!available())throw Error('Protected security storage is unavailable.');
  const text=JSON.stringify(config),bytes=asyncAPI?await safeStorage.encryptStringAsync(text):safeStorage.encryptString(text);
  if(!Buffer.isBuffer(bytes)||!bytes.length||bytes.length>65536)throw Error('Invalid protected security output.');
  const temp=file+'.'+crypto.randomUUID()+'.tmp';await io.mkdir(path.dirname(file),{recursive:true});
  try{await io.writeFile(temp,bytes,{flag:'wx',mode:0o600});await io.rename(temp,file);}finally{await io.unlink(temp).catch(()=>{});}
 }
 return{read,write,available};
}
module.exports={createStore};
