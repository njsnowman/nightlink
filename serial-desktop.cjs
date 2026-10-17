// USB port selection is granted only to the local main frame.
function trustedRequest(win,contents,details={}){return contents===win.webContents&&details.isMainFrame===true&&typeof details.requestingUrl==='string'&&details.requestingUrl.split('#')[0]===win.webContents.getURL().split('#')[0]&&details.requestingUrl.startsWith('file:');}
function installSerial(win,ipcMain){
 const session=win.webContents.session;let callback=null,timer=null,ports=new Map();
 const trusted=e=>e.sender===win.webContents&&e.senderFrame===win.webContents.mainFrame;
 const publish=()=>{if(!win.isDestroyed())win.webContents.send('usb:ports',[...ports.values()].map(p=>({id:p.portId,name:p.displayName||p.portName||'Serial port',port:p.portName||''})));};
 function finish(id=''){clearTimeout(timer);timer=null;const next=callback;callback=null;ports.clear();if(next)next(id);}
 session.setPermissionCheckHandler((contents,permission,origin,details)=>{if(permission==='fullscreen')return contents===win.webContents;return ['serial','bluetooth','notifications','clipboard-sanitized-write'].includes(permission)&&trustedRequest(win,contents,details);});
 session.setPermissionRequestHandler((contents,permission,answer,details)=>{answer(permission==='fullscreen'?contents===win.webContents:['serial','bluetooth','notifications','clipboard-sanitized-write'].includes(permission)&&trustedRequest(win,contents,details));});
 session.on('select-serial-port',(event,list,contents,next)=>{event.preventDefault();if(contents!==win.webContents){next('');return;}finish();callback=next;ports=new Map(list.map(p=>[p.portId,p]));publish();timer=setTimeout(()=>{finish();if(!win.isDestroyed())win.webContents.send('usb:ended');},60000);});
 session.on('serial-port-added',(_event,port,contents)=>{if(callback&&contents===win.webContents){ports.set(port.portId,port);publish();}});
 session.on('serial-port-removed',(_event,port,contents)=>{if(callback&&contents===win.webContents){ports.delete(port.portId);publish();}});
 ipcMain.on('usb:select',(event,id)=>{if(!trusted(event)||!callback||typeof id!=='string'||(id!==''&&!ports.has(id)))return;finish(id);});
 win.on('closed',()=>{finish();ipcMain.removeAllListeners('usb:select');});
}
module.exports={installSerial,trustedRequest};
