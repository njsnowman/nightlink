const {app,BrowserWindow,ipcMain,screen,nativeTheme,shell,dialog}=require('electron');
const path=require('node:path');
const nightlinkUpdates=require('./updates.cjs');
const fsBackup=require('node:fs/promises'),cryptoBackup=require('node:crypto');
app.setPath('userData',path.join(app.getPath('appData'),'Meshline'));
app.whenReady().then(()=>{
 nativeTheme.themeSource='dark';
 const win=new BrowserWindow({show:!app.commandLine.hasSwitch('meshline-test'),width:1320,height:900,minWidth:760,minHeight:560,backgroundMaterial:'acrylic',backgroundColor:'#080b11',autoHideMenuBar:true,webPreferences:{preload:path.join(__dirname,'preload.cjs'),backgroundThrottling:false,contextIsolation:true,nodeIntegration:false,sandbox:true}});
 let select=null,pair=null,devices=new Set(),scanTimer,pairTimer;
 const trusted=e=>e.sender===win.webContents&&e.senderFrame===win.webContents.mainFrame;

 let updateResult=null,updateCheck=null,updateCheckedAt=0;
 const updateMode=process.env.PORTABLE_EXECUTABLE_DIR?'portable':'installer';
 ipcMain.handle('updates:info',e=>{if(!trusted(e))return null;return{version:app.getVersion(),mode:updateMode,releases:nightlinkUpdates.RELEASES};});
 ipcMain.handle('updates:check',async e=>{
  if(!trusted(e))return null;if(updateCheck)return updateCheck;
  if(updateResult&&Date.now()-updateCheckedAt<60000)return{...updateResult,checkedAt:updateCheckedAt,cached:true};
  updateCheck=nightlinkUpdates.check(app.getVersion(),updateMode).then(result=>{updateResult=result;updateCheckedAt=Date.now();return{...result,checkedAt:updateCheckedAt};}).finally(()=>updateCheck=null);return updateCheck;
 });
 ipcMain.handle('updates:open',async(e,download)=>{
  if(!trusted(e))return false;
  const url=download===true&&updateResult?.status==='available'?(updateResult.download||updateResult.url):nightlinkUpdates.RELEASES;
  await shell.openExternal(url);return true;
 });
 ipcMain.on('layout:focus',e=>{if(!trusted(e))return;if(win.isMinimized())win.restore();win.show();win.focus();});
 ipcMain.on('backup:reload',e=>{if(trusted(e))win.webContents.reload();});
 ipcMain.handle('backup:save',async(e,text)=>{
  if(!trusted(e)||typeof text!=='string'||Buffer.byteLength(text,'utf8')>50*1024*1024)throw new Error('Invalid backup data.');
  const parsed=JSON.parse(text);if(parsed.format!=='nightlink-backup'||parsed.version!==1)throw new Error('Unsupported backup format.');
  const choice=await dialog.showSaveDialog(win,{title:'Save Nightlink backup',defaultPath:path.join(app.getPath('documents'),'nightlink-backup-'+new Date().toISOString().replace(/[:.]/g,'-')+'.json'),filters:[{name:'Nightlink backup',extensions:['json']}]});
  if(choice.canceled||!choice.filePath)return{saved:false,cancelled:true};
  const temporary=choice.filePath+'.'+cryptoBackup.randomUUID()+'.tmp';
  try{await fsBackup.writeFile(temporary,text,{encoding:'utf8',flag:'wx'});await fsBackup.rename(temporary,choice.filePath);return{saved:true};}catch(error){await fsBackup.unlink(temporary).catch(()=>{});throw new Error('Could not save backup: '+error.message);}
 });
 ipcMain.on('maps:attribution',e=>{if(trusted(e))shell.openExternal('https://www.openstreetmap.org/copyright');});
 let normalBounds=null,wasMaximized=false,compactWindow=false;
 ipcMain.on('layout:compact',(e,compact)=>{if(!trusted(e)||typeof compact!=='boolean'||compact===compactWindow)return;compactWindow=compact;if(compact){wasMaximized=win.isMaximized();normalBounds=win.getNormalBounds();if(wasMaximized)win.unmaximize();const area=screen.getDisplayMatching(win.getBounds()).workArea;const width=Math.min(920,area.width),height=Math.min(740,area.height);win.setBounds({width,height,x:Math.max(area.x,Math.min(normalBounds.x,area.x+area.width-width)),y:Math.max(area.y,Math.min(normalBounds.y,area.y+area.height-height))});}else if(normalBounds){win.setBounds(normalBounds);if(wasMaximized)win.maximize();normalBounds=null;}});
 const dmWindows=new Map();
 function clearDMs(){for(const record of dmWindows.values())record.window.close();dmWindows.clear();}
 ipcMain.on('dm:publish',(e,{data,open}={})=>{
  if(!trusted(e)||!data||!(/^[a-f0-9]{64}$/).test(data.radio)||!(/^[a-f0-9]{12,64}$/).test(data.key)||!Array.isArray(data.messages))return;
  const id=data.radio+'/'+data.key;let record=dmWindows.get(id);
  if(!record&&open){if(dmWindows.size>=8)dmWindows.values().next().value.window.close();const popup=new BrowserWindow({show:false,width:440,height:620,minWidth:340,minHeight:400,parent:win,backgroundMaterial:'acrylic',backgroundColor:'#080b11',autoHideMenuBar:true,title:String(data.name).slice(0,100)+' · Nightlink',icon:path.join(__dirname,'icon.ico'),webPreferences:{preload:path.join(__dirname,'dm-preload.cjs'),contextIsolation:true,nodeIntegration:false,sandbox:true,autoplayPolicy:'no-user-gesture-required'}});record={window:popup,data,ready:false};dmWindows.set(id,record);popup.webContents.setWindowOpenHandler(()=>({action:'deny'}));popup.webContents.on('will-navigate',event=>event.preventDefault());popup.on('focus',()=>popup.webContents.send('dm:focus'));popup.on('closed',()=>{dmWindows.delete(id);if(!win.isDestroyed())win.webContents.send('dm:closed',data.key);});popup.loadFile('dm.html');popup.once('ready-to-show',()=>{if(!app.commandLine.hasSwitch('meshline-test')){if(record.data.focus)popup.show();else popup.showInactive();}});}
  if(record){record.data={...data,sound:data.sound||(!record.ready&&record.data.sound)};if(record.ready){record.window.webContents.send('dm:update',record.data);record.data.sound=false;}if(open&&record.window.isMinimized())record.window.restore();if(open&&data.focus&&record.ready&&!app.commandLine.hasSwitch('meshline-test')){record.window.show();record.window.focus();}}
 });
 const childRecord=e=>[...dmWindows.values()].find(r=>r.window.webContents===e.sender&&e.senderFrame===r.window.webContents.mainFrame);
 ipcMain.on('dm:ready',e=>{const record=childRecord(e);if(record){record.ready=true;record.window.webContents.send('dm:update',record.data);record.data.sound=false;}});
 ipcMain.on('dm:action',(e,data)=>{const record=childRecord(e);if(!record||!data||!['cancel','details','sound'].includes(data.action)||(data.action!=='sound'&&!record.data.messages.some(m=>m.id===data.id&&m.own)))return;if(data.action==='details'){if(win.isMinimized())win.restore();if(!app.commandLine.hasSwitch('meshline-test'))win.show();}win.webContents.send('dm:owner-action',{radio:record.data.radio,key:record.data.key,...data});});
 ipcMain.on('dm:read',(e,data)=>{const record=childRecord(e);if(!record||!record.window.isFocused()||typeof data?.through!=='string'||!record.data.messages.some(m=>m.id===data.through))return;const p=data.position;const position=p&&typeof p.anchor==='string'&&Number.isFinite(p.offset)?{anchor:p.anchor,offset:Math.max(-10000,Math.min(10000,p.offset)),bottom:p.bottom===true}:null;win.webContents.send('dm:owner-read',{radio:record.data.radio,key:record.data.key,through:data.through,position});});
 ipcMain.on('dm:reply',(e,text)=>{const record=childRecord(e);if(record&&typeof text==='string'&&text.length<=1024)win.webContents.send('dm:owner-reply',{radio:record.data.radio,key:record.data.key,text});});
 ipcMain.on('dm:contact',e=>{const record=childRecord(e);if(record){if(win.isMinimized())win.restore();if(!app.commandLine.hasSwitch('meshline-test'))win.show();win.webContents.send('dm:owner-contact',{radio:record.data.radio,key:record.data.key});}});
 ipcMain.on('dm:clear',e=>{if(trusted(e))clearDMs();});
 win.on('close',clearDMs);
 function cancelScan(){clearTimeout(scanTimer);scanTimer=null;const cb=select;select=null;devices.clear();if(cb)cb('');}
 function cancelPair(){clearTimeout(pairTimer);const cb=pair;pair=null;if(cb)cb({confirmed:false});}
 win.webContents.on('select-bluetooth-device',(event,list,callback)=>{event.preventDefault();select=callback;devices=new Set(list.map(d=>d.deviceId));if(!scanTimer)scanTimer=setTimeout(()=>{cancelScan();if(!win.isDestroyed())win.webContents.send('ble:scan-ended');},60000);win.webContents.send('ble:devices',list.map(({deviceId,deviceName})=>({deviceId,deviceName})));});
 ipcMain.on('ble:select',(e,id)=>{if(!trusted(e)||!select)return;if(id!==''&&!devices.has(id))return;clearTimeout(scanTimer);scanTimer=null;const cb=select;select=null;devices.clear();cb(id);});
 win.webContents.session.setBluetoothPairingHandler((details,callback)=>{cancelPair();pair=callback;pairTimer=setTimeout(cancelPair,60000);win.webContents.send('ble:pairing',details);});
 ipcMain.on('ble:pairing-response',(e,response)=>{if(!trusted(e)||!pair)return;const cb=pair;pair=null;clearTimeout(pairTimer);cb({confirmed:response?.confirmed===true,pin:typeof response?.pin==='string'?response.pin.slice(0,16):undefined});});
 win.webContents.on('will-navigate',e=>e.preventDefault());
 win.on('closed',()=>{cancelScan();cancelPair();ipcMain.removeAllListeners('ble:select');ipcMain.removeAllListeners('ble:pairing-response');});
 win.loadFile('index.html');win.webContents.setWindowOpenHandler(()=>({action:'deny'}));
});
app.on('window-all-closed',()=>app.quit());
