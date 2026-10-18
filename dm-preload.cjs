const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('dmWindow',{
 onFocus:listener=>ipcRenderer.on('dm:focus',listener),onUpdate:listener=>{ipcRenderer.on('dm:update',(_event,data)=>listener(data));ipcRenderer.send('dm:ready');},
 draft:text=>ipcRenderer.send('dm:draft',text),read:(through,position)=>ipcRenderer.send('dm:read',{through,position}),action:(id,action)=>ipcRenderer.send('dm:action',{id,action}),reply:text=>ipcRenderer.send('dm:reply',text),
 contact:()=>ipcRenderer.send('dm:contact')
});

if(process.isMainFrame)contextBridge.exposeInMainWorld('nightlinkLinks',{preview:url=>ipcRenderer.invoke('links:preview',url),open:url=>ipcRenderer.invoke('links:open',url)});
