const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('dmWindow',{
 onUpdate:listener=>{ipcRenderer.on('dm:update',(_event,data)=>listener(data));ipcRenderer.send('dm:ready');},
 reply:text=>ipcRenderer.send('dm:reply',text),
 contact:()=>ipcRenderer.send('dm:contact')
});
