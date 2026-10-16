const {contextBridge,ipcRenderer}=require('electron');
const subscribe=(channel,listener)=>{const handler=(_event,value)=>listener(value);ipcRenderer.on(channel,handler);return()=>ipcRenderer.removeListener(channel,handler);};
contextBridge.exposeInMainWorld('meshlineUpdates',{info:()=>ipcRenderer.invoke('updates:info'),check:()=>ipcRenderer.invoke('updates:check'),open:download=>ipcRenderer.invoke('updates:open',download===true)});
contextBridge.exposeInMainWorld('meshlineBackup',{reload:()=>ipcRenderer.send('backup:reload'),save:text=>ipcRenderer.invoke('backup:save',text)});
contextBridge.exposeInMainWorld('meshlineLayout',{focusWindow:()=>ipcRenderer.send('layout:focus'),setCompact:compact=>ipcRenderer.send('layout:compact',compact===true)});
contextBridge.exposeInMainWorld('meshlineMaps',{attribution:()=>ipcRenderer.send('maps:attribution')});
contextBridge.exposeInMainWorld('meshlineDM',{
 update:(data,open)=>ipcRenderer.send('dm:publish',{data,open}),clear:()=>ipcRenderer.send('dm:clear'),
 onDraft:listener=>subscribe('dm:owner-draft',listener),onRead:listener=>subscribe('dm:owner-read',listener),onAction:listener=>subscribe('dm:owner-action',listener),onReply:listener=>subscribe('dm:owner-reply',listener),onContact:listener=>subscribe('dm:owner-contact',listener),onClosed:listener=>subscribe('dm:closed',listener)
});
contextBridge.exposeInMainWorld('meshlineBluetooth',{
 onDevices:listener=>subscribe('ble:devices',listener),
 onPairing:listener=>subscribe('ble:pairing',listener),
 onScanEnded:listener=>subscribe('ble:scan-ended',listener),
 select:id=>ipcRenderer.send('ble:select',id),
 pairingResponse:response=>ipcRenderer.send('ble:pairing-response',response)
});
