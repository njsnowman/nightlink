const fs=require('node:fs/promises'),path=require('node:path'),crypto=require('node:crypto'),{Security}=require('./security-core.cjs');
async function install({app,win,ipcMain,safeStorage}){
 const file=path.join(app.getPath('userData'),'security-settings.bin');
 const available=()=>process.platform==='win32'&&safeStorage.isEncryptionAvailable();
 const read=async()=>{try{const bytes=await fs.readFile(file);if(bytes.length>65536||!available())throw Error('Unavailable protected settings');return JSON.parse(safeStorage.decryptString(bytes));}catch(error){if(error.code==='ENOENT')return null;throw error;}};
 const write=async config=>{if(!available())throw Error('Windows credential encryption is unavailable.');const bytes=safeStorage.encryptString(JSON.stringify(config)),temp=file+'.'+crypto.randomUUID()+'.tmp';await fs.mkdir(path.dirname(file),{recursive:true});try{await fs.writeFile(temp,bytes,{flag:'wx',mode:0o600});await fs.rename(temp,file);}finally{await fs.unlink(temp).catch(()=>{});}};
 const security=new Security({read,write,available});await security.load();
 const trusted=e=>e.sender===win.webContents&&e.senderFrame===win.webContents.mainFrame;
 const handle=(name,fn)=>ipcMain.handle('security:'+name,async(e,...args)=>{if(!trusted(e))return{error:'Access denied.'};try{return{value:await fn(...args)};}catch(error){return{error:error.message};}});
 handle('info',()=>security.info());handle('begin',value=>security.begin(value));handle('cancel',()=>{security.requireOpen();security.clearPending();return true;});handle('confirm',(code,saved)=>security.confirm(code,saved));
 handle('disable',async(value,code)=>{security.requireOpen();return security.authenticate(value,code,{disable:true});});
 let enterTimer=null,entryPending=false;const enter=()=>{if(!entryPending||!security.unlocked)return false;entryPending=false;clearTimeout(enterTimer);if(!win.isDestroyed())win.loadFile('index.html');return true;};
 handle('enter',()=>enter());
 handle('unlock',async(value,code)=>{if(security.unlocked)throw Error('Nightlink is already unlocked.');const result=await security.authenticate(value,code);entryPending=true;enterTimer=setTimeout(enter,4000);return result;});
 handle('quit',()=>{app.quit();return true;});app.on('will-quit',()=>{clearTimeout(enterTimer);security.clearPending();});
 return security;
}
module.exports={install};
