const path=require('node:path'),{Security}=require('./security-core.cjs');
async function install({app,win,ipcMain,safeStorage}){
 const file=path.join(app.getPath('userData'),'security-settings.bin');
 const {read,write,available}=await require('./security-store.cjs').createStore({file,safeStorage});
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
