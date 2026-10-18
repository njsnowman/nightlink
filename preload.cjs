const {contextBridge,ipcRenderer}=require('electron');
const lockedDocument=location.pathname.endsWith('/security-lock.html');
if(process.isMainFrame)contextBridge.exposeInMainWorld('nightlinkSecurity',Object.fromEntries((lockedDocument?['info','unlock','quit']:['info','begin','confirm','cancel','disable']).map(name=>[name,async(...args)=>{const result=await ipcRenderer.invoke('security:'+name,...args);if(result?.error)throw Error(result.error);return result?.value;}])));
if(!lockedDocument){
if(process.isMainFrame)contextBridge.exposeInMainWorld('nightlinkLinks',{preview:url=>ipcRenderer.invoke('links:preview',url),open:url=>ipcRenderer.invoke('links:open',url)});
const subscribe=(channel,listener)=>{const handler=(_event,value)=>listener(value);ipcRenderer.on(channel,handler);return()=>ipcRenderer.removeListener(channel,handler);};
contextBridge.exposeInMainWorld('meshlineUpdates',{info:()=>ipcRenderer.invoke('updates:info'),check:()=>ipcRenderer.invoke('updates:check'),open:download=>ipcRenderer.invoke('updates:open',download===true)});
contextBridge.exposeInMainWorld('meshlineBackup',{reload:()=>ipcRenderer.send('backup:reload'),save:text=>ipcRenderer.invoke('backup:save',text)});
contextBridge.exposeInMainWorld('meshlineLayout',{focusWindow:()=>ipcRenderer.send('layout:focus'),setCompact:compact=>ipcRenderer.send('layout:compact',compact===true)});
contextBridge.exposeInMainWorld('meshlineMaps',{attribution:()=>ipcRenderer.send('maps:attribution')});
contextBridge.exposeInMainWorld('meshlineDM',{
 ownerDialog:open=>ipcRenderer.send('dm:owner-dialog',open),update:(data,open)=>ipcRenderer.send('dm:publish',{data,open}),clear:()=>ipcRenderer.send('dm:clear'),
 onDraft:listener=>subscribe('dm:owner-draft',listener),onRead:listener=>subscribe('dm:owner-read',listener),onAction:listener=>subscribe('dm:owner-action',listener),onReply:listener=>subscribe('dm:owner-reply',listener),onContact:listener=>subscribe('dm:owner-contact',listener),onClosed:listener=>subscribe('dm:closed',listener)
});
contextBridge.exposeInMainWorld('meshlineBluetooth',{
 onDevices:listener=>subscribe('ble:devices',listener),
 onPairing:listener=>subscribe('ble:pairing',listener),
 onScanEnded:listener=>subscribe('ble:scan-ended',listener),
 select:id=>ipcRenderer.send('ble:select',id),
 pairingResponse:response=>ipcRenderer.send('ble:pairing-response',response)
});

contextBridge.exposeInMainWorld('meshlineSerial',{onPorts:listener=>subscribe('usb:ports',listener),onEnded:listener=>subscribe('usb:ended',listener),select:id=>ipcRenderer.send('usb:select',id)});

if(process.isMainFrame)contextBridge.exposeInMainWorld('meshlineDesktop',{state:data=>ipcRenderer.send('desktop:state',data),notify:data=>ipcRenderer.send('desktop:notice',data),quit:()=>ipcRenderer.send('desktop:quit'),readyToQuit:()=>ipcRenderer.send('desktop:quit-ready'),onOpen:listener=>subscribe('desktop:open',listener),onQuit:listener=>subscribe('desktop:quit-request',listener)});

if(process.isMainFrame)contextBridge.exposeInMainWorld("nightlinkVoice",{status:()=>ipcRenderer.invoke("voice:status"),configure:()=>ipcRenderer.invoke("voice:configure"),transcribe:data=>ipcRenderer.invoke("voice:transcribe",Array.from(data))});

if(process.isMainFrame)contextBridge.exposeInMainWorld("nightlinkOfflineMaps",{open:()=>ipcRenderer.invoke("offline-maps:open")});

if(process.isMainFrame)contextBridge.exposeInMainWorld('nightlinkStartup',{info:()=>ipcRenderer.invoke('startup:info'),setEnabled:value=>ipcRenderer.invoke('startup:enabled',value),remember:kind=>ipcRenderer.invoke('startup:remember',kind),attempt:()=>ipcRenderer.invoke('startup:attempt'),cancel:()=>ipcRenderer.invoke('startup:cancel')});

if(process.isMainFrame)contextBridge.exposeInMainWorld('nightlinkCoreScope',{check:()=>ipcRenderer.invoke('corescope:health')});

if(process.isMainFrame)contextBridge.exposeInMainWorld('nightlinkMeshMapper',{check:region=>ipcRenderer.invoke('meshmapper:health',region),open:region=>ipcRenderer.invoke('meshmapper:open',region)});


}
