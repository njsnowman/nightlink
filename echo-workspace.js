/* #echo observer workspace. CoreScope activity is not a delivery acknowledgment. */
(function(){
 let locationSignature='';
 let shell=null,mapHost=null,status=null,frame=null,timer=null,failed=false,layout='split',lastTarget='',ratio=60,stopHealth=null;
 const isEcho=()=>current==='Messages'&&live.selected?.kind==='channel'&&String(live.selected.name||'').trim().replace(/^#/,'').toLowerCase()==='echo';
 function removeFrame(){stopHealth?.();stopHealth=null;clearTimeout(timer);timer=null;if(frame){frame.remove();frame=null;}}
 function restoreMap(){if(mapHost?.contains(mapPanel)){homes.get(mapPanel).after(mapPanel);mapPanel.hidden=true;}}
 function cleanup(){removeFrame();restoreMap();if(shell?.contains(chatPanel))alternate.append(chatPanel);shell?.remove();shell=null;mapHost=null;status=null;alternate.classList.remove('echo-active');}
 function setLayout(next){layout=next;shell.dataset.layout=next;const expand=shell.querySelector('#echo-expand');if(expand)expand.textContent=next==='map'?'Restore split':'Expand map';for(const b of shell.querySelectorAll('[data-echo-layout]'))b.setAttribute('aria-pressed',String(b.dataset.echoLayout===next));requestAnimationFrame(()=>{networkStreetMap?.invalidateSize();window.dispatchEvent(new Event('resize'));});}
 function localMap(){removeFrame();mapPanel.hidden=false;mapPanel.classList.remove('overview-corescope');mapHost.append(mapPanel);ensureNetworkStreetMap();renderMap();requestAnimationFrame(()=>networkStreetMap?.invalidateSize());status.textContent=navigator.onLine?'CoreScope unavailable · local radio map. Observer activity is unavailable.':'Offline · local radio map with downloaded street tiles where available. CoreScope activity is unavailable.';}
 function displayMap(){
  if(!shell)return;
  if(!navigator.onLine||failed){localMap();return;}
  restoreMap();if(frame?.isConnected)return;
  status.textContent='Loading CoreScope · observer activity is separate from radio delivery status.';
  frame=document.createElement('iframe');frame.id='echo-corescope-frame';frame.title='OKI Mesh CoreScope for echo testing';frame.setAttribute('sandbox','allow-scripts allow-same-origin');frame.referrerPolicy='no-referrer';frame.allowFullscreen=true;
  frame.onload=()=>{clearTimeout(timer);status.textContent=NightlinkCoreScopeLocation.viewport().source+' · Observer activity is not delivery acknowledgment. Use Local map or Reload if unavailable.';};
  frame.onerror=()=>{failed=true;displayMap();};locationSignature=NightlinkCoreScopeLocation.signature();frame.src=NightlinkCoreScopeLocation.url();mapHost.append(frame);stopHealth=NightlinkCoreScopeAvailability.watch(()=>{failed=true;displayMap();});timer=setTimeout(()=>{failed=true;displayMap();},15000);
 }
 function create(){
  shell=document.createElement('section');shell.id='echo-workspace';shell.className='echo-workspace';shell.style.setProperty('--echo-chat-share',ratio+'%');
  const tools=document.createElement('div');tools.className='echo-tools';tools.innerHTML='<strong>#echo test workspace</strong><div role="group" aria-label="Echo workspace layout"><button data-echo-layout="chat">Chat</button><button data-echo-layout="map">Map</button><button data-echo-layout="split">Split</button></div>';
  const grid=document.createElement('div');grid.className='echo-grid';const divider=document.createElement('div');divider.className='echo-divider';divider.tabIndex=0;divider.setAttribute('role','separator');divider.setAttribute('aria-label','Resize echo chat and map');divider.setAttribute('aria-orientation','vertical');divider.setAttribute('aria-valuemin','35');divider.setAttribute('aria-valuemax','75');
  function share(value){ratio=Math.max(35,Math.min(75,value));shell.style.setProperty('--echo-chat-share',ratio+'%');divider.setAttribute('aria-valuenow',String(Math.round(ratio)));networkStreetMap?.invalidateSize();}share(ratio);
  divider.onpointerdown=e=>{divider.setPointerCapture(e.pointerId);};divider.onpointermove=e=>{if(!divider.hasPointerCapture(e.pointerId))return;const rect=grid.getBoundingClientRect();share(100*(e.clientX-rect.left)/rect.width);};divider.onpointerup=e=>{if(divider.hasPointerCapture(e.pointerId))divider.releasePointerCapture(e.pointerId);};divider.onkeydown=e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();share(e.key==='Home'?35:e.key==='End'?75:ratio+(e.key==='ArrowRight'?5:-5));};
  const panel=document.createElement('section');panel.className='panel echo-map-panel';panel.innerHTML='<div class="panel-heading"><h2>CoreScope <span class="live">OBSERVER</span></h2><div><button id="echo-center">Recenter</button><button id="echo-local">Local map</button><button id="echo-reload">Reload</button><button id="echo-expand">Expand map</button></div></div>';
  mapHost=document.createElement('div');mapHost.className='echo-map-host';status=document.createElement('p');status.className='echo-map-status';status.setAttribute('role','status');panel.append(mapHost,status);grid.append(chatPanel,divider,panel);shell.append(tools,grid);alternate.append(shell);alternate.classList.add('echo-active');
  tools.querySelectorAll('[data-echo-layout]').forEach(b=>b.onclick=()=>setLayout(b.dataset.echoLayout));panel.querySelector('#echo-expand').onclick=()=>setLayout(layout==='map'?'split':'map');panel.querySelector('#echo-center').onclick=()=>{if(frame){removeFrame();displayMap();}else if(networkStreetMap){const p=NightlinkCoreScopeLocation.viewport();networkStreetMap.setView([p.lat,p.lon],p.zoom);}};panel.querySelector('#echo-local').onclick=()=>{failed=true;displayMap();};panel.querySelector('#echo-reload').onclick=()=>{failed=false;removeFrame();displayMap();};setLayout('split');displayMap();
 }
 function sync(){if(!isEcho()){if(shell)cleanup();return;}const target=conversationId(live.selected);if(lastTarget!==target){failed=false;lastTarget=target;}if(!shell)create();}
 const echoRender=renderMessages;renderMessages=function(){echoRender();sync();};
 const echoView=view;view=function(name){cleanup();echoView(name);sync();};
 radioSession.addEventListener('identity',()=>{if(shell&&frame&&locationSignature!==NightlinkCoreScopeLocation.signature()){removeFrame();displayMap();}});
 window.addEventListener('offline',()=>{if(shell)displayMap();});window.addEventListener('online',()=>{failed=false;if(shell)displayMap();});sync();
})();
