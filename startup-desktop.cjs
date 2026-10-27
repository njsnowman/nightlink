// Only a previously selected device that completed synchronization is remembered.
const fs = require('node:fs');
const path = require('node:path');
function descriptor(kind, device) {
  if (kind === 'bluetooth') return {kind, id: device.deviceId, name: device.deviceName || 'Bluetooth radio'};
  return {kind, name: device.displayName || device.portName || 'USB radio', port: device.portName,
    serial: device.serialNumber || '', vendor: device.vendorId || '', product: device.productId || ''};
}
function matches(saved, device) {
  if (saved.kind === 'bluetooth') return device.deviceId === saved.id;
  if (!saved.serial) return false; // A COM number alone can be reassigned to another device.
  return device.serialNumber === saved.serial && (device.vendorId || '') === saved.vendor &&
    (device.productId || '') === saved.product;
}
function install({app, win, ipcMain}) {
  const filename = path.join(app.getPath('userData'), 'startup-connection.json');
  let settings = {enabled: false, last: null}, active = false, generation = 0;
  let pending = {}, cancelSelection = null;
  try {const stored=JSON.parse(fs.readFileSync(filename,'utf8'));settings.enabled=stored.enabled===true;
    if (['bluetooth','usb'].includes(stored.last?.kind)) settings.last=stored.last;} catch {}
  const trusted=e=>e.sender===win.webContents && e.senderFrame===win.webContents.mainFrame;
  function save(){const temp=filename+'.tmp';fs.writeFileSync(temp,JSON.stringify(settings));fs.renameSync(temp,filename);}
  function info(){return {enabled:settings.enabled,last:settings.last?{kind:settings.last.kind,name:settings.last.name}:null};}
  function cancel(){generation++;active=false;const stop=cancelSelection;cancelSelection=null;stop?.();}
  ipcMain.handle('startup:info',e=>trusted(e)?info():null);
  ipcMain.handle('startup:enabled',(e,value)=>{if(!trusted(e)||typeof value!=='boolean')return false;
    const previous=settings.enabled;settings.enabled=value;try{save();}catch{settings.enabled=previous;throw new Error('Could not save startup preference.');}
    if(!value)cancel();return info();});
  ipcMain.handle('startup:remember',(e,kind)=>{if(!trusted(e)||!pending[kind])return false;
    const previous=settings.last;settings.last=pending[kind];try{save();}catch{settings.last=previous;return false;}return true;});
  ipcMain.handle('startup:cancel',e=>{if(trusted(e))cancel();});
  ipcMain.handle('startup:attempt',async e=>{
    if(!trusted(e)||!settings.enabled||!settings.last||active)return false;
    if(settings.last.kind==='usb'&&!settings.last.serial)throw new Error('This USB device has no unique serial number. Choose its port manually.');
    active=true;const token=++generation;
    try {await win.webContents.executeJavaScript('window.nightlinkConnectLast('+JSON.stringify(settings.last.kind)+')',true);return token===generation;}
    finally {if(token===generation){active=false;cancelSelection=null;}}
  });
  win.on('closed',cancel);
  return {
    get active(){return active;},
    selected(kind,device){if(device)pending[kind]=descriptor(kind,device);},
    select(kind,list,finish){
      if(!active)return false;
      cancelSelection=()=>finish('');
      if(settings.last.kind!==kind){finish('');return true;}
      const found=list.filter(d=>matches(settings.last,d));
      if(found.length===1){pending[kind]=descriptor(kind,found[0]);cancelSelection=null;finish(kind==='bluetooth'?found[0].deviceId:found[0].portId);}
      return true;
    }
  };
}
module.exports={install,descriptor,matches};
