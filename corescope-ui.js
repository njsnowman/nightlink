/* Remote sources are isolated from local radio contacts and private overlays. */
(function(){
 let mode='corescope',frame=null,timer=null,stopHealth=null,locationSignature='';
 const failed={corescope:false,meshmapper:false};
 try{const saved=localStorage.getItem('nightlink.network-map');if(['corescope','radio','meshmapper'].includes(saved))mode=saved;}catch{}
 const wanted=()=>mode==='meshmapper'&&current!=='Network map'?'corescope':mode;
 const effective=()=>{const source=wanted();return source!=='radio'&&navigator.onLine&&!failed[source]?source:'radio';};
 const context=()=>current==='Network map'?'network':undefined;
 const bar=document.createElement('section');bar.className='network-source-bar';
 bar.innerHTML='<div class="network-source-switch" role="group" aria-label="Map source"><button id="network-corescope">CoreScope</button><button id="network-radio">Radio map</button><button id="network-meshmapper">MeshMapper CVG</button></div><span id="network-source-note"></span><button id="network-open-meshmapper" hidden>Open full map ↗</button><button id="network-center">Recenter</button><button id="network-reload">Reload CoreScope</button>';
 const pane=document.createElement('section');pane.className='corescope-pane';pane.id='corescope-pane';
 const holder=document.createElement('div');holder.className='corescope-frame-holder';
 const status=document.createElement('p');status.id='corescope-status';status.setAttribute('role','status');pane.append(holder,status);
 function remoteURL(source){
  if(source==='corescope')return NightlinkCoreScopeLocation.url(context());
  const p=MeshlineStreetMaps.radioView();
  return 'https://cvg.meshmapper.net/embed.php?geofence=0'+(p?'&lat='+p.center[0].toFixed(6)+'&lon='+p.center[1].toFixed(6)+'&zoom='+p.zoom:'');
 }
 function stop(){stopHealth?.();stopHealth=null;clearTimeout(timer);timer=null;frame?.remove();frame=null;holder.replaceChildren();}
 function start(){
  stop();const source=effective();if(source==='radio')return;
  const label=source==='meshmapper'?'MeshMapper CVG':'OKI Mesh CoreScope';
  status.textContent='Opening '+label+' · internet service';
  const active=document.createElement('iframe');frame=active;active.id=source==='meshmapper'?'meshmapper-frame':'corescope-frame';active.title=source==='meshmapper'?'MeshMapper CVG coverage map':'OKI Mesh CoreScope live map';
  active.setAttribute('sandbox','allow-scripts allow-same-origin');active.referrerPolicy='no-referrer';active.setAttribute('allow','fullscreen');active.allowFullscreen=true;
  const unavailable=()=>{if(frame!==active)return;failed[source]=true;show();};
  active.onload=()=>{if(frame!==active)return;clearTimeout(timer);status.textContent=source==='meshmapper'?'MeshMapper CVG · read-only regional coverage · '+(MeshlineStreetMaps.radioView()?'Radio-reported location':'CVG region center'):'OKI Mesh observer data · '+NightlinkCoreScopeLocation.viewport(context()).source;};
  active.onerror=unavailable;locationSignature=NightlinkCoreScopeLocation.signature(context());active.src=remoteURL(source);holder.append(active);
  stopHealth=NightlinkCoreScopeAvailability.watch(unavailable,source);timer=setTimeout(unavailable,15000);
 }
 function show(){
  if(!['Overview','Network map'].includes(current))return;
  const active=effective(),overview=current==='Overview',host=overview?mapPanel:$('#alternate');
  if(!overview)host.classList.add('network-source-view');
  if(overview)host.querySelector('.panel-heading').after(bar);else host.prepend(bar);
  mapPanel.classList.toggle('overview-corescope',overview&&active!=='radio');
  for(const source of ['corescope','radio','meshmapper'])bar.querySelector('#network-'+source).setAttribute('aria-pressed',String(active===source));
  bar.querySelector('#network-meshmapper').hidden=overview;bar.querySelector('#network-open-meshmapper').hidden=active!=='meshmapper';
  const remote=wanted(),label=remote==='meshmapper'?'MeshMapper CVG':'CoreScope';
  bar.querySelector('#network-source-note').textContent=active==='meshmapper'?'CVG · regional coverage map':active==='corescope'?'OKI Mesh · online observer data':!navigator.onLine?'Offline radio map · downloaded street tiles':failed[remote]?label+' unavailable · local radio map':'Local radio map · '+(MeshlineStreetMaps.radioView()?'radio-reported location':'saved or regional location');
  const reload=bar.querySelector('#network-reload');reload.hidden=remote==='radio';reload.textContent='Reload '+label;
  mapPanel.querySelector('.live').textContent=active==='meshmapper'?'MESHMAPPER':active==='corescope'?'OKI MESH':live.sync==='ready'?'RADIO':'OFFLINE';
  if(active!=='radio'){mapPanel.hidden=!overview;host.append(pane);start();}
  else{stop();pane.remove();mapPanel.hidden=false;if(!overview)host.append(mapPanel);centerNetworkStreetMap();requestAnimationFrame(()=>networkStreetMap?.invalidateSize());}
 }
 function choose(source){failed[source]=false;mode=source;try{localStorage.setItem('nightlink.network-map',mode);}catch{}show();}
 for(const source of ['corescope','radio','meshmapper'])bar.querySelector('#network-'+source).onclick=()=>choose(source);
 bar.querySelector('#network-open-meshmapper').onclick=()=>window.nightlinkMeshMapper?.open();
 bar.querySelector('#network-center').onclick=()=>{if(effective()!=='radio')start();else centerNetworkStreetMap();};
 bar.querySelector('#network-reload').onclick=()=>{failed[wanted()]=false;show();};
 radioSession.addEventListener('identity',()=>{if(frame&&locationSignature!==NightlinkCoreScopeLocation.signature(context()))start();});
 window.addEventListener('offline',show);window.addEventListener('online',()=>{failed.corescope=failed.meshmapper=false;show();});
 const sourceRenderMap=renderMap;renderMap=function(){sourceRenderMap();if(current==='Overview'&&effective()!=='radio')mapPanel.querySelector('.live').textContent='OKI MESH';};
 const sourceView=view;view=function(name){stop();bar.remove();pane.remove();mapPanel.hidden=false;mapPanel.classList.remove('overview-corescope');$('#alternate').classList.remove('network-source-view');sourceView(name);if(['Overview','Network map'].includes(name))show();};
 if(['Overview','Network map'].includes(current))show();
})();
