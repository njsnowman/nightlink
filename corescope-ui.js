/* Remote sources are isolated from local radio contacts and private overlays. */
(function(){
 let mode='corescope',overviewMode='corescope',frame=null,timer=null,stopHealth=null,locationSignature='',retryTimer=null,retryEpoch=0;
 let pcPosition=null,pcPending=null,pcAttempted=false;
 function locatePC(){if(pcPending)return pcPending;pcAttempted=true;pcPending=Promise.resolve().then(()=>window.nightlinkMeshMapper?.location?.()).then(p=>{pcPosition=p&&Number.isFinite(p.lat)&&Number.isFinite(p.lon)&&Math.abs(p.lat)<=85&&Math.abs(p.lon)<=180?p:null;}).catch(()=>{pcPosition=null;}).finally(()=>{pcPending=null;if(current==='Network map'&&effective()==='meshmapper')show();});return pcPending;}
 const pcLabel=()=>pcPending?'Locating PC…':pcPosition?'PC location · Windows estimate':region()+' region center · PC location unavailable; enable Windows Location and Recenter';
 const region=()=>NightlinkMeshMapperRegion.get();
 const failed={corescope:false,meshmapper:false};
 try{const saved=localStorage.getItem('nightlink.network-map');if(['corescope','radio','meshmapper'].includes(saved))mode=saved;}catch{}
 const wanted=()=>current==='Overview'?overviewMode:mode;
 const effective=()=>{const source=wanted();return source!=='radio'&&navigator.onLine&&!failed[source]?source:'radio';};
 const context=()=>current==='Network map'?'network':undefined;
 const bar=document.createElement('section');bar.className='network-source-bar';
 bar.innerHTML='<div class="network-source-switch" role="group" aria-label="Map source"><button id="network-corescope">CoreScope</button><button id="network-radio">Radio map</button><button id="network-meshmapper">MeshMapper CVG</button></div><span id="network-source-note"></span><button id="network-meshmapper-region">Region: CVG</button><button id="network-open-meshmapper" hidden>Open full map ↗</button><button id="network-center">Recenter</button><button id="network-reload">Reload CoreScope</button>';
 const pane=document.createElement('section');pane.className='corescope-pane';pane.id='corescope-pane';
 const holder=document.createElement('div');holder.className='corescope-frame-holder';
 const status=document.createElement('p');status.id='corescope-status';status.setAttribute('role','status');pane.append(holder,status);
 function remoteURL(source){
  if(source==='corescope')return NightlinkCoreScopeLocation.url(context());
  const p=pcPosition;
  return NightlinkMeshMapperRegion.base(region())+'embed.php?geofence=0&zoom=12&cov_grid=1&fail_grid=1'+(p?'&lat='+p.lat.toFixed(6)+'&lon='+p.lon.toFixed(6):'');
 }
 function stop(){clearTimeout(retryTimer);retryTimer=null;retryEpoch++;stopHealth?.();stopHealth=null;clearTimeout(timer);timer=null;frame?.remove();frame=null;holder.replaceChildren();}
 function scheduleRecovery(source){
  const epoch=retryEpoch;
  retryTimer=setTimeout(async()=>{
   retryTimer=null;if(epoch!==retryEpoch||!navigator.onLine||!['Overview','Network map'].includes(current)||wanted()!==source)return;
   let healthy=false;try{const bridge=source==='meshmapper'?window.nightlinkMeshMapper:window.nightlinkCoreScope;healthy=!!(bridge&&await bridge.check(region()));}catch{}
   if(epoch!==retryEpoch||!navigator.onLine||!['Overview','Network map'].includes(current)||wanted()!==source)return;
   if(healthy){failed[source]=false;show();}else scheduleRecovery(source);
  },30000);
 }
 function start(){
  stop();const source=effective();if(source==='radio')return;
  const label=source==='meshmapper'?'MeshMapper '+region():'OKI Mesh CoreScope';
  let loaded=false,healthWarning=false;
  const paintStatus=()=>{if(frame!==active)return;status.textContent=healthWarning?label+' health check delayed or unavailable · keeping page open; live feed not verified':loaded?(source==='meshmapper'?'MeshMapper '+region()+' page loaded · '+pcLabel():'CoreScope page loaded · live packets supplied by CoreScope · '+NightlinkCoreScopeLocation.viewport(context()).source):'Opening '+label+' · allowing time for service startup';};
  status.textContent='Opening '+label+' · allowing time for service startup';
  const active=document.createElement('iframe');frame=active;active.id=source==='meshmapper'?'meshmapper-frame':'corescope-frame';active.title=source==='meshmapper'?'MeshMapper '+region()+' coverage map':'OKI Mesh CoreScope live map';
  active.setAttribute('sandbox','allow-scripts allow-same-origin');active.referrerPolicy='no-referrer';active.setAttribute('allow','fullscreen');active.allowFullscreen=true;
  const unavailable=()=>{if(frame!==active)return;failed[source]=true;show();scheduleRecovery(source);};
  active.onload=()=>{if(frame!==active)return;loaded=true;clearTimeout(timer);paintStatus();};
  active.onerror=unavailable;locationSignature=NightlinkCoreScopeLocation.signature(context());active.src=remoteURL(source);holder.append(active);
  stopHealth=NightlinkCoreScopeAvailability.watch(source==='corescope'?()=>{if(frame!==active)return;healthWarning=true;paintStatus();}:unavailable,source,region(),()=>{if(frame!==active)return;healthWarning=false;paintStatus();});timer=setTimeout(unavailable,120000);
 }
 function show(){
  if(!['Overview','Network map'].includes(current))return;
  const active=effective(),overview=current==='Overview',host=overview?mapPanel:$('#alternate');
  mapPanel.classList.remove('corescope-pending');
  if(!overview)host.classList.add('network-source-view');
  if(overview)host.querySelector('.panel-heading').after(bar);else host.prepend(bar);
  mapPanel.classList.toggle('overview-corescope',overview&&active!=='radio');
  for(const source of ['corescope','radio','meshmapper'])bar.querySelector('#network-'+source).setAttribute('aria-pressed',String(active===source));
  bar.querySelector('#network-meshmapper').hidden=overview;bar.querySelector('#network-meshmapper').textContent='MeshMapper '+region();bar.querySelector('#network-meshmapper-region').hidden=overview;bar.querySelector('#network-meshmapper-region').textContent='Region: '+region();bar.querySelector('#network-open-meshmapper').hidden=active!=='meshmapper';
  const remote=wanted(),label=remote==='meshmapper'?'MeshMapper '+region():'CoreScope';
  bar.querySelector('#network-source-note').textContent=active==='meshmapper'?pcLabel()+' · green coverage / red dropped packets':active==='corescope'?'CoreScope · external live feed':!navigator.onLine?'Offline radio map · downloaded street tiles':failed[remote]?label+' unavailable · local radio map · retrying automatically':'Local radio map · '+(MeshlineStreetMaps.radioView()?'radio-reported location':'saved or regional location');
  const reload=bar.querySelector('#network-reload');reload.hidden=remote==='radio';reload.textContent='Reload '+label;
  mapPanel.querySelector('.live').textContent=active==='meshmapper'?'MESHMAPPER':active==='corescope'?'OKI MESH':live.sync==='ready'?'RADIO':'OFFLINE';
  if(active==='meshmapper'&&!pcAttempted)locatePC();
  if(active!=='radio'){mapPanel.hidden=!overview;host.append(pane);start();}
  else{stop();pane.remove();mapPanel.hidden=false;if(!overview)host.append(mapPanel);centerNetworkStreetMap();requestAnimationFrame(()=>networkStreetMap?.invalidateSize());}
 }
 function choose(source){failed[source]=false;if(current==='Overview'){overviewMode=source;show();return;}mode=source;if(source==='meshmapper')locatePC();try{localStorage.setItem('nightlink.network-map',mode);}catch{}show();}
 for(const source of ['corescope','radio','meshmapper'])bar.querySelector('#network-'+source).onclick=()=>choose(source);
 bar.querySelector('#network-open-meshmapper').onclick=()=>window.nightlinkMeshMapper?.open(region());
 bar.querySelector('#network-meshmapper-region').onclick=()=>showMeshMapperRegion();
 window.addEventListener('nightlink-meshmapper-region',()=>{failed.meshmapper=false;show();});
 bar.querySelector('#network-center').onclick=()=>{if(effective()==='meshmapper'){locatePC();return;}if(effective()!=='radio')start();else centerNetworkStreetMap();};
 bar.querySelector('#network-reload').onclick=()=>{failed[wanted()]=false;show();};
 radioSession.addEventListener('identity',()=>{if(frame&&effective()!=='meshmapper'&&locationSignature!==NightlinkCoreScopeLocation.signature(context()))start();});
 window.addEventListener('offline',show);window.addEventListener('online',()=>{failed.corescope=failed.meshmapper=false;show();});
 const sourceRenderMap=renderMap;renderMap=function(){sourceRenderMap();if(current==='Overview'&&effective()!=='radio')mapPanel.querySelector('.live').textContent='OKI MESH';};
 const sourceView=view;view=function(name){stop();bar.remove();pane.remove();mapPanel.hidden=false;mapPanel.classList.remove('overview-corescope');$('#alternate').classList.remove('network-source-view');sourceView(name);if(name==='Overview'){overviewMode='corescope';failed.corescope=false;}if(name==='Network map'&&wanted()==='meshmapper')locatePC();if(['Overview','Network map'].includes(name))show();};
 if(['Overview','Network map'].includes(current))show();
})();
