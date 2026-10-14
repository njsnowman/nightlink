const {contextBridge,ipcRenderer}=require('electron');
const subscribe=(channel,listener)=>{const handler=(_event,value)=>listener(value);ipcRenderer.on(channel,handler);return()=>ipcRenderer.removeListener(channel,handler);};
contextBridge.exposeInMainWorld('meshlineLayout',{setCompact:compact=>ipcRenderer.send('layout:compact',compact===true)});
contextBridge.exposeInMainWorld('meshlineMaps',{attribution:()=>ipcRenderer.send('maps:attribution')});
contextBridge.exposeInMainWorld('meshlineDM',{
 update:(data,open)=>ipcRenderer.send('dm:publish',{data,open}),clear:()=>ipcRenderer.send('dm:clear'),
 onReply:listener=>subscribe('dm:owner-reply',listener),onContact:listener=>subscribe('dm:owner-contact',listener),onClosed:listener=>subscribe('dm:closed',listener)
});
contextBridge.exposeInMainWorld('meshlineBluetooth',{
 onDevices:listener=>subscribe('ble:devices',listener),
 onPairing:listener=>subscribe('ble:pairing',listener),
 onScanEnded:listener=>subscribe('ble:scan-ended',listener),
 select:id=>ipcRenderer.send('ble:select',id),
 pairingResponse:response=>ipcRenderer.send('ble:pairing-response',response)
});
