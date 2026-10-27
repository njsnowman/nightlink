/* Session evidence only; navigation starts no command or polling loop. */
(function(){
 let radioKey=live.identity?.key||null,syncing=false,added=0,lastAdded=null,known=new Set(live.messages.map(m=>m.id)),recoveryState='';
 const panel=document.createElement('section');panel.id='radio-status-panel';panel.className='panel';panel.hidden=true;
 panel.innerHTML='<div class="radio-status-main"><div><span class="radio-status-eyebrow">CONNECTION & SYNC</span><h2 id="radio-status-title"></h2><p id="radio-status-detail" role="status" aria-live="polite"></p></div><div class="radio-status-actions"><button id="radio-status-refresh" type="button">Refresh</button><button id="radio-status-reconnect" type="button">Reconnect</button><button id="radio-status-diagnostics" type="button">Diagnostics</button><button id="radio-status-details" type="button">Details</button></div></div><dl class="radio-status-metrics"><div><dt>Last full sync · this session</dt><dd id="radio-status-last"></dd></div><div><dt>New messages · last full sync</dt><dd id="radio-status-added"></dd></div><div><dt>Queue frames · last full sync</dt><dd id="radio-status-frames"></dd></div></dl><p id="radio-status-error"></p>';
 const find=id=>panel.querySelector('#radio-status-'+id);
 function paint(){const h=radioHealth.snapshot(),state=ble.state,busy=live.sending||radioSession.configuring||live.sync==='syncing'||['scanning','connecting','initializing'].includes(state);let title,detail;
  if(live.storageError){title='History needs attention';detail='A local history write failed. Back up or export your messages before continuing.';}
  else if(live.sync==='error'||['sync-failed','exhausted','failed'].includes(recoveryState)){title='Synchronization stopped';detail='Check radio power and the USB cable or Bluetooth range. '+(state==='connected'?'Select Refresh to try synchronization again.':'Select Reconnect when the radio is available.');}
  else if(['waiting','retrying'].includes(recoveryState)){title='Reconnecting';detail=lastProgress||'Waiting to reconnect to the remembered radio.';}
  else if(live.sync==='syncing'){title='Synchronizing';detail=h.stage==='Ready'?'Checking queued messages and radio data…':h.stage;}
  else if(state==='connected'&&live.sync==='ready'){title='Ready'+(h.error?' · notice':'');detail=ble.label+' connected · current radio queue checked'+(lastAdded===null?'':'; '+lastAdded+' new message'+(lastAdded===1?'':'s')+' received in the last full sync')+'.';}
  else if(['scanning','connecting','initializing'].includes(state)){title=state==='scanning'?'Finding radio':state==='connecting'?'Connecting':'Verifying radio';detail=ble.label+' · '+h.stage;}
  else{title='Offline';detail='Saved messages remain available. Reconnect to check the radio’s retained queue.';}
  find('title').textContent=title;find('detail').textContent=detail;find('last').textContent=h.lastSyncAt===null?'Not completed':new Date(h.lastSyncAt).toLocaleString();find('added').textContent=lastAdded===null?'—':String(lastAdded);find('frames').textContent=h.lastSyncFetched===null?'—':String(h.lastSyncFetched);
  find('error').textContent=h.error?'Latest notice: '+String(h.error).slice(0,500):'Queue frames may include duplicates or command replies. Another client may already have collected messages from the radio.';
  find('refresh').disabled=state!=='connected'||busy;find('reconnect').disabled=state!=='disconnected'||busy;
 }
 find('refresh').onclick=()=>{if(ble.state==='connected'&&!live.sending&&!radioSession.configuring&&live.sync!=='syncing')refreshRadio();else{paint();toast('Wait for the current radio operation, or reconnect if disconnected.');}};
 find('reconnect').onclick=()=>{if(ble.state==='disconnected'&&!live.sending&&!radioSession.configuring&&live.sync!=='syncing')retryButton.click();else paint();};
 find('diagnostics').onclick=()=>view('Diagnostics');find('details').onclick=showRadioHealth;
 const navigate=view;view=function(name){navigate(name);panel.hidden=name!=='Radio';if(name==='Radio'){alternate.prepend(panel);paint();}};
 radioSession.addEventListener('identity',e=>{if(e.detail.key!==radioKey){radioKey=e.detail.key;lastAdded=null;}added=0;syncing=false;known=new Set(live.messages.map(m=>m.id));recoveryState='';paint();});
 radioSession.addEventListener('sync',e=>{if(e.detail.state==='syncing'){syncing=true;added=0;known=new Set(live.messages.map(m=>m.id));recoveryState='';}if(e.detail.state==='ready'){if(syncing)lastAdded=added;syncing=false;recoveryState='';}if(['error','disconnected'].includes(e.detail.state))syncing=false;paint();});
 radioSession.addEventListener('message',()=>{if(syncing)for(const m of live.messages)if(!m.own&&!known.has(m.id))added++;known=new Set(live.messages.map(m=>m.id));paint();});
 radioSession.addEventListener('contacts',()=>{known=new Set(live.messages.map(m=>m.id));paint();});
 for(const event of ['catchup','sync-progress','command-error','warning'])radioSession.addEventListener(event,paint);
 ble.addEventListener('state',()=>{if(ble.state==='connected')recoveryState='';paint();});recovery.addEventListener('recovery',e=>{recoveryState=e.detail.state;paint();});
 const tool=radioSession.radioTool;radioSession.radioTool=async function(...args){try{const pending=tool.apply(this,args);paint();return await pending;}finally{paint();}};
 const messages=renderMessages;renderMessages=function(...args){const result=messages.apply(this,args);if(current==='Radio')paint();return result;};
 // Existing duplicated recovery controls remain available to their original handlers.
 radioPanel.classList.add('radio-status-consolidated');
 if(current==='Radio'){alternate.prepend(panel);panel.hidden=false;paint();}
})();
