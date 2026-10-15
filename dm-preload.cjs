const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('dmWindow',{
 onFocus:listener=>ipcRenderer.on('dm:focus',listener),onUpdate:listener=>{ipcRenderer.on('dm:update',(_event,data)=>listener(data));ipcRenderer.send('dm:ready');},
 read:(through,position)=>ipcRenderer.send('dm:read',{through,position}),action:(id,action)=>ipcRenderer.send('dm:action',{id,action}),reply:text=>ipcRenderer.send('dm:reply',text),
 contact:()=>ipcRenderer.send('dm:contact')
});
