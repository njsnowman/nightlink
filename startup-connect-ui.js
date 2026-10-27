/* Optional Windows startup connection; the main process selects only the saved device. */
(function(){
 const bridge=window.nightlinkStartup;
 if(!bridge)return;
 let config={enabled:false,last:null},running=false,generation=0,timer=null,wake=null,internalSwitch=false;
 let recoveryEnabled=null,waiting=false,lastError='';
 const cancel=document.createElement('button');cancel.id='startup-connect-cancel';cancel.textContent='Cancel';cancel.hidden=true;
 const retry=document.createElement('button');retry.id='startup-connect-retry';retry.textContent='Retry';retry.hidden=true;
 $('#connection').after(cancel,retry);
 function status(text){setBleStatus(text);updateSyncStatus(text);$('#connection').textContent=text;$('#connection').title=text;}
 function finish(){running=false;waiting=false;cancel.hidden=true;$('#connection').classList.remove('startup-active');if(recoveryEnabled!==null){recovery.enabled=recoveryEnabled;recoveryEnabled=null;}}
 function stop(disconnect=true){generation++;clearTimeout(timer);timer=null;wake?.();wake=null;bridge.cancel().catch(()=>{});const active=running;finish();retry.hidden=true;if(active&&disconnect)ble.disconnect('manual');if(active)updateRadioState();}
 cancel.onclick=()=>stop();
 retry.onclick=()=>start();
 function delay(ms){return new Promise(resolve=>{wake=resolve;timer=setTimeout(()=>{timer=null;wake=null;resolve();},ms);});}
 window.nightlinkConnectLast=async kind=>{
  if(!running)throw new Error('Startup connection cancelled.');
  internalSwitch=true;
  try{ble.select(kind);refreshTransportChoice();await ble.connect(false);}finally{internalSwitch=false;}
 };
 async function start(){
  if(running||ble.busy||ble.state==='connected')return;
  config=await bridge.info();if(!config?.enabled||!config.last)return;
  const token=++generation;running=true;waiting=false;retry.hidden=true;cancel.hidden=false;$('#connection').classList.add('startup-active');
  recoveryEnabled=recovery.enabled;recovery.enabled=false;recovery.pause();
  for(let attempt=0;attempt<3&&token===generation;attempt++){
   if(attempt){waiting=true;status('Waiting to retry '+config.last.name+' · '+(attempt+1)+'/3');await delay(attempt===1?5000:15000);waiting=false;}
   if(token!==generation)return;
   status('Connecting to '+config.last.name+' · '+(attempt+1)+'/3');
   try{
    const connected=await bridge.attempt();
    if(token!==generation)return;
    if(connected&&ble.state==='connected')return; // Keep Cancel available until synchronization finishes.
    lastError='The saved radio could not be connected.';
   }catch(error){lastError=error.message||'Radio unavailable';}
   if(token!==generation)return;
   if(/serial number|pair|PIN|synchroniz/i.test(lastError))break;
  }
  if(token!==generation)return;finish();retry.hidden=false;
  status('Radio unavailable · Retry');$('#connection').title=lastError;toast(lastError);
 }
 // Manual selections take ownership and cancel the remaining startup attempts.
 document.addEventListener('click',e=>{if(e.target.closest('#ble-connect,#ble-reconnect,#retry-connection,#transport-bluetooth,#transport-usb'))stop();},true);
 ble.addEventListener('interruption',e=>{if(running&&(e.detail.reason==='manual'||(!internalSwitch&&e.detail.reason==='switch')))stop(false);});
 ble.addEventListener('state',()=>{if(running&&waiting)queueMicrotask(()=>{if(running&&waiting)status('Waiting to retry '+config.last.name);});});
 radioSession.addEventListener('sync',async e=>{
  if(e.detail.state==='ready'){
   const wasStarting=running;finish();retry.hidden=true;await bridge.remember(ble.kind);config=await bridge.info();
   if(wasStarting){if(bleSheet.open)bleSheet.close();view('Overview');}
  }else if(e.detail.state==='error'&&running){lastError='Synchronization failed. Retry manually.';stop(false);retry.hidden=false;status(lastError);}
 });
 const settingsView=view;view=function(name){settingsView(name);if(name!=='Settings')return;
  const group=document.createElement('div');group.className='startup-connection-settings';
  const label=document.createElement('label'),input=document.createElement('input');input.type='checkbox';input.id='startup-auto-connect';input.checked=config.enabled;
  label.append(document.createTextNode('Automatically connect to my last radio on startup'),input);
  const help=document.createElement('p');help.textContent=config.last?'Last radio: '+config.last.name+' · '+(config.last.kind==='usb'?'USB':'Bluetooth'):'Connect and synchronize a radio once to remember it. USB requires a unique device serial number.';
  input.onchange=async()=>{input.disabled=true;try{config=await bridge.setEnabled(input.checked);if(!config.enabled)stop();}catch(error){input.checked=config.enabled;toast(error.message);}finally{input.disabled=false;}};
  group.append(label,help);$('.settings-grid').prepend(group);
 };
 window.addEventListener('beforeunload',()=>stop(false));
 bridge.info().then(value=>{if(value)config=value;if(current==='Settings')view('Settings');if(config.enabled&&config.last)start();}).catch(()=>toast('Startup connection preference could not be loaded.'));
})();
