/* RF Propagation Monitor: header indicator, Radio page panel and settings. Passive only: listens to existing receive
   events, never sends radio commands, enables RX logging or uses the network. See docs/propagation-monitor.md. */
(()=>{
 const P=NightlinkPropagation,SETTINGS='nightlink.propagation.settings';
 const fallback={enabled:true,sensitivity:'medium',baselineDays:30,indicator:true,animations:true,sound:false,notify:false};
 function load(){try{const v=JSON.parse(localStorage.getItem(SETTINGS)||'{}');return {...fallback,...(v&&typeof v==='object'?v:{})};}catch{return {...fallback};}}
 function save(){try{localStorage.setItem(SETTINGS,JSON.stringify(prefs));}catch{toast('Propagation settings could not be saved.');}}
 let prefs=load();
 if(!P.sensitivities.includes(prefs.sensitivity))prefs.sensitivity='medium';
 if(!P.baselineChoices.includes(prefs.baselineDays))prefs.baselineDays=30;
 const monitor=P.createMonitor({enabled:prefs.enabled!==false,sensitivity:prefs.sensitivity,baselineDays:prefs.baselineDays});

 // Bounded local persistence in its own IndexedDB store; not part of backups.
 let db=null,ready=false,saveTimer=null,saveDue=0,storageNote=null,dropped=0;const pending=[];
 const MAX_PENDING=500,SAVE_DELAY=2000,SAVE_MAX_WAIT=60000,EMPTY=JSON.stringify({version:1,radios:{}});
 const opened=new Promise(resolve=>{try{const r=indexedDB.open('nightlink-propagation',1);r.onupgradeneeded=()=>r.result.createObjectStore('state');r.onerror=()=>resolve();r.onsuccess=()=>{db=r.result;resolve();};}catch{resolve();}});
 // Report a storage problem once in the panel instead of repeating it on every write.
 function storageFailed(message){if(storageNote)return;storageNote=message;renderPanel();}
 function persist(){clearTimeout(saveTimer);saveTimer=null;saveDue=0;if(!db||!ready)return;
  try{const tx=db.transaction('state','readwrite');tx.onerror=tx.onabort=()=>storageFailed('Monitor history could not be saved on this computer. Monitoring continues for this session.');tx.objectStore('state').put(monitor.serialize(),'monitor');}
  catch{storageFailed('Monitor history could not be saved on this computer. Monitoring continues for this session.');}}
 // Debounce writes, but never postpone them longer than SAVE_MAX_WAIT under continuous traffic.
 function schedule(){const now=Date.now();if(!saveDue)saveDue=now+SAVE_MAX_WAIT;if(now>=saveDue)return persist();clearTimeout(saveTimer);saveTimer=setTimeout(persist,Math.min(SAVE_DELAY,saveDue-now));}
 function clearStored(){if(!db)return;try{db.transaction('state','readwrite').objectStore('state').delete('monitor');}catch{}}
 // Validate stored state on a scratch monitor first, so a damaged record cannot leave the live monitor half-restored.
 function restoreSafely(json){try{const probe=P.createMonitor({enabled:true});if(!probe.restore(json))throw Error('unreadable');const at=Date.now();
   for(const k of Object.keys(JSON.parse(probe.serialize()).radios)){probe.connect(k,at);probe.summary(at);probe.disconnect(at);}
   if(!monitor.restore(json))throw Error('unreadable');return true;}
  catch{monitor.restore(EMPTY);clearStored();storageNote='Stored monitor history was unreadable and has been cleared. Learning starts again.';return false;}}
 opened.then(()=>new Promise(resolve=>{if(!db)return resolve();try{const r=db.transaction('state').objectStore('state').get('monitor');r.onsuccess=()=>{try{if(r.result)restoreSafely(r.result);}finally{resolve();}};r.onerror=()=>resolve();}catch{resolve();}})).then(()=>{
  ready=true;const key=live.identity?.key||radioSession.identity?.key;if(key&&ble.state==='connected')attach(key);
  for(const run of pending.splice(0))run();refresh();});
 // Before storage is ready, keep the newest events and count any that had to be discarded.
 const whenReady=run=>{if(ready)return run();pending.push(run);if(pending.length>MAX_PENDING){pending.shift();dropped++;}};

 function attach(key){monitor.connect(key);const id=live.identity||radioSession.identity;if(id){monitor.setOwnLocation(id);noteConfig(id);}monitor.setContacts(live.contacts||[]);}
 function noteConfig(id){const warning=monitor.noteConfig({frequency:id.frequency,bandwidth:id.bandwidth,sf:id.sf,cr:id.cr,txPower:id.txPower});if(warning)schedule();}
 radioSession.addEventListener('identity',e=>whenReady(()=>{attach(e.detail.key);refresh();}));
 radioSession.addEventListener('identity-updated',e=>whenReady(()=>{if(e.detail?.key!==monitor.radio)return;monitor.setOwnLocation(e.detail);noteConfig(e.detail);refresh();}));
 radioSession.addEventListener('disconnected',()=>whenReady(()=>{monitor.disconnect();schedule();refresh();}));
 radioSession.addEventListener('contacts',()=>whenReady(()=>monitor.setContacts(live.contacts||[])));
 // Radio status traffic shows the link is alive; the core uses it for coverage when available.
 for(const name of ['sync','stats','battery'])radioSession.addEventListener(name,()=>whenReady(()=>{if(typeof monitor.heartbeat==='function'){monitor.heartbeat(Date.now());schedule();}}));
 radioSession.addEventListener('message',e=>{const at=Date.now(),m=e.detail;whenReady(()=>{if(monitor.observe(P.normalize.message(m,at)))changed();});});
 // Raw frames are parsed only by the existing parsers: NightlinkEvidence.packet (0x88) and MeshlineProtocol.contact (0x8a).
 ble.addEventListener('packet',e=>{const d=e.detail,at=Date.now();if(!d||!d.length)return;
  if(d[0]===0x88)whenReady(()=>{if(monitor.observe(P.normalize.rxLog(d,at)))changed();});
  else if(d[0]===0x8a){let c=null;try{c=MeshlineProtocol.contact(d);}catch{}if(c)whenReady(()=>{if(monitor.observe(P.normalize.advert(c,at)))changed();});}});
 let evalTimer=null;function changed(){schedule();if(!evalTimer)evalTimer=setTimeout(()=>{evalTimer=null;refresh();},5000);}
 setInterval(()=>{if(ready)refresh();},60000);
 window.addEventListener('beforeunload',persist);window.addEventListener('pagehide',persist);
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')persist();});

 // Alerts: only new or escalated events reach here; the core applies hysteresis and cooldown.
 monitor.on(e=>{schedule();if(e.type!=='alert'||e.detail.level!=='strong-anomaly')return;
  const quiet=typeof quietHoursActive==='function'&&quietHoursActive();
  if(prefs.sound&&!quiet){try{const a=new Audio('mention.wav');a.play().catch(()=>{});}catch{}}
  if(prefs.notify){const body='Unusual reception compared with this radio’s history. Open the Propagation Monitor for the evidence.';
   if(window.meshlineDesktop)window.meshlineDesktop.notify({radio:e.detail.radio,conversation:'propagation',title:'Nightlink · Strong RF anomaly',body});
   else if('Notification'in window&&Notification.permission==='granted'&&!quiet&&(document.hidden||!document.hasFocus()))new Notification('Nightlink · Strong RF anomaly',{body,tag:'propagation',silent:true});}});
 window.meshlineDesktop?.onOpen?.(data=>{if(data?.conversation==='propagation'&&data.radio===monitor.radio)showPropagationMonitor();});

 // Header indicator, next to the connection control.
 const svg='<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 11v7M7 18h6M10 8.5h.01M7 6a4 4 0 0 0 0 5M13 6a4 4 0 0 1 0 5M4.5 3.5a7.5 7.5 0 0 0 0 10M15.5 3.5a7.5 7.5 0 0 1 0 10"/></svg>';
 const indicator=document.createElement('button');indicator.type='button';indicator.id='propagation-indicator';indicator.className='header-control propagation-indicator';
 indicator.innerHTML=svg+'<span class="header-control-label"></span>';indicator.onclick=()=>showPropagationMonitor();
 const status=document.createElement('span');status.className='propagation-live';status.setAttribute('role','status');status.setAttribute('aria-live','polite');
 const header=document.querySelector('.header-actions'),connection=document.querySelector('#connection');
 if(connection&&connection.parentNode===header)header.insertBefore(indicator,connection);else header.prepend(indicator);indicator.after(status);
 const short={'possible-opening':'Possible RF Opening','strong-anomaly':'Strong RF Anomaly','insufficient-data':'Learning baseline',unavailable:'Monitor unavailable',normal:'RF normal',disabled:'Monitor off'};
 let last=null,lastLevel=null;
 function paint(st){
  indicator.hidden=!prefs.indicator||st.state==='disabled';
  indicator.dataset.level=st.state;indicator.classList.toggle('propagation-animate',prefs.animations!==false);
  indicator.querySelector('.header-control-label').textContent=short[st.state]||st.label;
  const detail=st.state==='unavailable'?'Connect a radio to monitor reception.':st.state==='insufficient-data'?'Collecting baseline; not enough history for reliable detection.':'Open the Propagation Monitor.';
  indicator.setAttribute('aria-label','RF propagation monitor: '+st.label+'. '+detail);indicator.title=st.label+' · '+detail;
  if(st.state!==lastLevel){if(st.state==='strong-anomaly'){indicator.classList.remove('propagation-flash');void indicator.offsetWidth;indicator.classList.add('propagation-flash');}
   if(lastLevel!==null&&['possible-opening','strong-anomaly'].includes(st.state))status.textContent=st.label+' detected. Unusual reception, not a confirmed propagation event.';
   else if(lastLevel!==null&&st.state==='normal'&&['possible-opening','strong-anomaly'].includes(lastLevel))status.textContent='Propagation monitor returned to normal.';}
  lastLevel=st.state;}
 function refresh(){if(!ready)return;try{last=monitor.summary(Date.now());}catch{storageFailed('Monitor data could not be evaluated. Use Clear monitor data in Settings to start again.');return;}paint(last);renderPanel();}

 // Panel.
 const fmt=(v,unit,digits=0)=>v==null||!Number.isFinite(v)?'Unknown':(digits?v.toFixed(digits):Math.round(v))+(unit||'');
 const time=t=>t?new Date(t).toLocaleString([],{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}):'None';
 const explain={normal:'Reception matches this radio’s recent history.','insufficient-data':'Collecting baseline. Detection starts after enough monitored hours.',unavailable:'No radio is connected. Monitoring resumes when one connects.',disabled:'Monitoring is turned off in Settings.','possible-opening':'Several receptions are unusual compared with this radio’s history.','strong-anomaly':'Strong, sustained unusual reception compared with this radio’s history.'};
 function el(tag,cls,text){const n=document.createElement(tag);if(cls)n.className=cls;if(text!=null)n.textContent=text;return n;}
 function stationName(row){if(!row.station)return 'Unknown';if(row.stationKind==='key'){const c=(live.contacts||[]).find(x=>x.key===row.station);return c?.name?c.name:row.station.slice(0,12)+'…';}return row.station+' (prefix)';}
 function chart(trend){const box=el('figure','propagation-chart');const ns='http://www.w3.org/2000/svg',s=document.createElementNS(ns,'svg');s.setAttribute('viewBox','0 0 480 96');s.setAttribute('role','img');
  const values=trend.map(b=>b.packets),max=Math.max(1,...values.filter(v=>v!=null)),w=480/Math.max(1,trend.length);
  s.setAttribute('aria-label','Received packets per monitored hour, last '+trend.length+' hours. Gaps mark hours without monitoring coverage.');
  trend.forEach((b,i)=>{if(b.packets==null){const g=document.createElementNS(ns,'rect');g.setAttribute('x',String(i*w+1));g.setAttribute('y','84');g.setAttribute('width',String(Math.max(1,w-2)));g.setAttribute('height','4');g.setAttribute('class','propagation-gap');s.append(g);return;}
   const h=Math.max(2,(b.packets/max)*78),r=document.createElementNS(ns,'rect');r.setAttribute('x',String(i*w+1));r.setAttribute('y',String(88-h));r.setAttribute('width',String(Math.max(1,w-2)));r.setAttribute('height',String(h));r.setAttribute('rx','2');r.setAttribute('class','propagation-bar');s.append(r);});
  box.append(s,el('figcaption',null,trend.length?'Packets per monitored hour, oldest to newest. Short grey marks are hours without coverage, not silence.':'No monitored hours yet.'));return box;}
 let panelRoot=null,confirmReset=false;
 // Rebuilds keep keyboard focus and scroll positions; a focused control without an id is never interrupted.
 function renderPanel(){if(!panelRoot||!panelRoot.isConnected||!last)return;const focused=panelRoot.contains(document.activeElement)?document.activeElement:null;if(focused&&!focused.id)return;
  const scrolls=[];for(let n=panelRoot;n;n=n.parentElement){if(n.scrollTop)scrolls.push([n,n.scrollTop]);if(n.tagName==='DIALOG')break;}const across=panelRoot.querySelector('.propagation-table-wrap')?.scrollLeft||0;
  build();
  for(const [n,top] of scrolls)n.scrollTop=top;const wrap=panelRoot.querySelector('.propagation-table-wrap');if(wrap)wrap.scrollLeft=across;
  if(focused){const again=document.getElementById(focused.id);if(again&&panelRoot.contains(again))again.focus({preventScroll:true});}}
 function build(){const st=last,root=panelRoot;root.replaceChildren();
  const head=el('section','propagation-status');head.dataset.level=st.state;head.append(el('p','propagation-eyebrow','CURRENT STATUS'),el('h3',null,st.label),el('p',null,explain[st.state]||''));
  if(st.lastQualifying)head.append(el('p','propagation-muted','Last qualifying event: '+time(st.lastQualifying)));root.append(head);
  root.append(el('p','propagation-note','Alerts mean reception is unusual for this radio. They do not confirm an atmospheric propagation event.'));
  if(st.connected&&!st.rxLogObserved)root.append(el('p','propagation-warning','RX logging off: monitoring limited. Nightlink does not enable RX logging. Only decoded messages and adverts are observed, so signal and distance evidence may be unavailable.'));
  if(st.warning){const w=el('div','propagation-warning');w.append(el('p',null,st.warning));root.append(w);}
  if(storageNote)root.append(el('p','propagation-warning',storageNote));
  if(dropped)root.append(el('p','propagation-muted',dropped+' early receive events were not analysed while monitor history was loading.'));
  const ev=st.evidence||{},grid=el('dl','propagation-evidence');
  for(const [label,value] of [['New stations',ev.newStations??null],['Unusual direct receptions',ev.unusualDirect??null],['SNR change vs baseline',ev.snrDelta==null?null:(ev.snrDelta>0?'+':'')+ev.snrDelta.toFixed(1)+' dB'],['Packets per hour',ev.packetRate==null?null:Math.round(ev.packetRate)],['Baseline packets per hour',ev.baselinePacketRate==null?null:Math.round(ev.baselinePacketRate)],['Unique stations',ev.uniqueStations??null],['Confidence',st.confidence?st.confidence[0].toUpperCase()+st.confidence.slice(1):null],['Baseline hours',ev.baselineHours==null?null:Math.floor(ev.baselineHours)]]){
   const row=el('div');row.append(el('dt',null,label),el('dd',null,value==null||value===''?'Unknown':String(value)));grid.append(row);}
  root.append(el('h4',null,'Evidence'),grid);
  root.append(el('h4',null,'Reception trend'),chart(st.trend||[]));
  root.append(el('h4',null,'Recent observations'));const rows=[...(st.flagged||[]).slice(0,10),...(st.recent||[]).filter(r=>!r.flags.length).slice(0,5)].slice(0,12);
  if(rows.length){const wrap=el('div','propagation-table-wrap'),table=el('table','propagation-table'),thead=el('thead'),tr=el('tr');for(const h of ['Time','Station','SNR','RSSI','Reception','Distance','Flagged because'])tr.append(el('th',null,h));thead.append(tr);table.append(thead);const body=el('tbody');
   for(const r of rows){const line=el('tr');for(const v of [new Date(r.at).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}),stationName(r),fmt(r.snr,' dB',1),fmt(r.rssi,' dBm'),r.relation==='direct'?'Direct':r.relation==='forwarded'?'Forwarded'+(r.hops!=null?' · '+r.hops+' hops':''):'Unknown',fmt(r.distanceKm,' km',1),r.flags.length?r.flags.join(', '):'—'])line.append(el('td',null,v));body.append(line);}
   table.append(body);wrap.append(table);root.append(wrap);}else root.append(el('p','propagation-muted','No observations yet.'));
  const history=el('section','propagation-history');history.id='propagation-history';history.append(el('h4',null,'Event history'));
  if(st.events&&st.events.length){const list=el('ul');for(const e of st.events.slice(0,20)){const item=el('li');item.dataset.level=e.peakLevel;item.append(el('strong',null,P.labels[e.peakLevel]||e.peakLevel),el('span',null,time(e.start)+' to '+(e.end?time(e.end):'now')+' · score '+e.peakScore+(e.active?' · active':e.stale?' · ended: '+(e.endReason||'not observed'):'')));
    const x=e.evidence||{};item.append(el('small',null,'Evidence: '+[x.unusualStations!=null&&x.unusualStations+' unusual stations',x.unusualDirect&&x.unusualDirect+' unusual direct receptions',x.snrDelta!=null&&'SNR '+(x.snrDelta>0?'+':'')+x.snrDelta.toFixed(1)+' dB'].filter(Boolean).join(' · ')||'not recorded'));list.append(item);}history.append(list);}
  else history.append(el('p','propagation-muted','No alert windows recorded.'));root.append(history);
  const actions=el('div','propagation-actions'),settings=el('button',null,'Monitor settings');settings.type='button';settings.id='propagation-open-settings';settings.onclick=()=>{document.querySelector('#dialog').close();view('Settings');window.NightlinkSettings?.open?.('Notifications');setTimeout(()=>document.querySelector('.propagation-settings')?.scrollIntoView({block:'start'}),50);};
  const reset=el('button',confirmReset?'propagation-danger':null,confirmReset?'Confirm baseline reset':'Reset baseline…');reset.type='button';reset.id='propagation-reset-baseline';
  reset.onclick=()=>{if(!confirmReset){confirmReset=true;renderPanel();return;}confirmReset=false;monitor.resetBaseline();persist();refresh();toast('Baseline reset. Learning starts again.');};
  actions.append(settings,reset);if(confirmReset){const cancel=el('button',null,'Cancel');cancel.type='button';cancel.id='propagation-reset-cancel';cancel.onclick=()=>{confirmReset=false;renderPanel();};actions.append(cancel);}root.append(actions);}
 window.showPropagationMonitor=function(section){modal('Propagation Monitor','');const body=document.querySelector('#dialog-body');panelRoot=el('div','propagation-panel');panelRoot.id='propagation-panel';body.append(panelRoot);confirmReset=false;
  if(ready)last=monitor.summary(Date.now());renderPanel();if(section==='history')setTimeout(()=>document.querySelector('#propagation-history')?.scrollIntoView({block:'start'}),0);};
 setInterval(()=>{if(panelRoot?.isConnected&&ready&&!confirmReset){last=monitor.summary(Date.now());renderPanel();}},5000);

 // Settings section, routed to Settings > Notifications by switchboard-settings.js.
 const previous=view;view=function(name){const result=previous(name);if(name!=='Settings')return result;const grid=document.querySelector('.settings-grid');if(!grid||grid.querySelector('.propagation-settings'))return result;
  const panel=el('section','propagation-settings');panel.innerHTML='<h3>RF propagation monitor</h3><p>Passively compares received packets with this radio’s history. Alerts mean reception is unusual; they do not confirm a propagation event. Nothing is transmitted.</p>'+
   '<label><span><strong>Enable monitoring</strong><small>Observe receive events already arriving at the radio.</small></span><input id="propagation-enabled" type="checkbox"></label>'+
   '<label><span><strong>Alert sensitivity</strong><small>Higher sensitivity alerts on weaker evidence.</small></span><select id="propagation-sensitivity"><option value="low">Low</option><option value="medium">Medium (recommended)</option><option value="high">High</option></select></label>'+
   '<label><span><strong>Baseline period</strong><small>History used for comparison.</small></span><select id="propagation-baseline"><option value="14">14 days</option><option value="30">30 days (recommended)</option><option value="60">60 days</option></select></label>'+
   '<label><span><strong>Show status indicator</strong><small>Compact indicator beside the connection control.</small></span><input id="propagation-indicator-setting" type="checkbox"></label>'+
   '<label><span><strong>Alert animations</strong><small>Reduced motion settings always turn these off.</small></span><input id="propagation-animations" type="checkbox"></label>'+
   '<label><span><strong>Alert sound</strong><small>Strong anomalies only; respects quiet hours.</small></span><input id="propagation-sound" type="checkbox"></label>'+
   '<label><span><strong>Windows notification</strong><small>Strong anomalies only; respects quiet hours and Windows settings.</small></span><input id="propagation-notify" type="checkbox"></label>'+
   '<div class="propagation-settings-actions"><button type="button" id="propagation-view-alerts">View recent alerts</button><button type="button" id="propagation-clear-history">Clear alert history</button><button type="button" id="propagation-settings-reset">Reset baseline…</button><button type="button" id="propagation-clear-data">Clear monitor data…</button></div><p class="propagation-settings-result" role="status"></p>';
  grid.append(panel);const q=s=>panel.querySelector(s),note=q('.propagation-settings-result');
  const bind=(id,key)=>{const input=q(id);input.checked=!!prefs[key];input.onchange=()=>{prefs[key]=input.checked;save();apply();note.textContent='Propagation settings saved.';};};
  bind('#propagation-enabled','enabled');bind('#propagation-indicator-setting','indicator');bind('#propagation-animations','animations');bind('#propagation-sound','sound');bind('#propagation-notify','notify');
  q('#propagation-sensitivity').value=prefs.sensitivity;q('#propagation-sensitivity').onchange=e=>{prefs.sensitivity=e.target.value;save();apply();note.textContent='Propagation settings saved.';};
  q('#propagation-baseline').value=String(prefs.baselineDays);q('#propagation-baseline').onchange=e=>{prefs.baselineDays=Number(e.target.value);save();apply();note.textContent='Propagation settings saved.';};
  q('#propagation-notify').addEventListener('change',e=>{if(e.target.checked&&!window.meshlineDesktop&&'Notification'in window&&Notification.permission==='default')Notification.requestPermission().catch(()=>{});});
  q('#propagation-view-alerts').onclick=()=>showPropagationMonitor('history');
  q('#propagation-clear-history').onclick=()=>{monitor.clearHistory();persist();refresh();note.textContent='Alert history cleared.';};
  const reset=q('#propagation-settings-reset');let armed=false;reset.onclick=()=>{if(!armed){armed=true;reset.textContent='Confirm baseline reset';note.textContent='Resetting discards the learned baseline for the connected radio.';return;}armed=false;reset.textContent='Reset baseline…';monitor.resetBaseline();persist();refresh();note.textContent='Baseline reset. Learning starts again.';};
  const wipe=q('#propagation-clear-data');let wipeArmed=false;wipe.onclick=()=>{if(!wipeArmed){wipeArmed=true;wipe.textContent='Confirm clear monitor data';note.textContent='Clearing removes stored baselines and alert history for every radio on this computer.';return;}
   wipeArmed=false;wipe.textContent='Clear monitor data…';monitor.restore(EMPTY);clearStored();storageNote=null;dropped=0;const key=live.identity?.key||radioSession.identity?.key;if(key&&ble.state==='connected')attach(key);persist();refresh();note.textContent='Monitor data cleared. Learning starts again.';};
  return result;};
 function apply(){try{monitor.configure({enabled:prefs.enabled!==false,sensitivity:prefs.sensitivity,baselineDays:prefs.baselineDays});}catch{}schedule();refresh();}

 window.NightlinkPropagationUI={monitor,refresh,get prefs(){return {...prefs};}};
 paint(monitor.evaluate(Date.now()));
})();
