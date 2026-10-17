/* Remote observer data stays separate from local radio contacts. */
(function(){
 const URL='https://map.okimesh.org/#/live';
 let mode='corescope';
 try{if(localStorage.getItem('nightlink.network-map')==='radio')mode='radio';}catch{}
 let frame=null,timer=null,serviceFailed=false;
 const effective=()=>mode==='corescope'&&navigator.onLine&&!serviceFailed?'corescope':'radio';
 const bar=document.createElement('section');
 bar.className='network-source-bar';
 bar.innerHTML='<div class="network-source-switch" role="group" aria-label="Map source"><button id="network-corescope">CoreScope</button><button id="network-radio">Radio map</button></div><span id="network-source-note"></span><button id="network-reload">Reload CoreScope</button>';
 const pane=document.createElement('section');pane.className='corescope-pane';pane.id='corescope-pane';
 const holder=document.createElement('div');holder.className='corescope-frame-holder';
 const status=document.createElement('p');status.id='corescope-status';status.setAttribute('role','status');
 pane.append(holder,status);
 function stop(){clearTimeout(timer);timer=null;if(frame){frame.remove();frame=null;}holder.replaceChildren();}
 function start(){
  stop();
  if(!navigator.onLine){status.textContent='CoreScope needs an internet connection. Choose Radio map to view saved or connected-radio contacts.';return;}
  status.textContent='Opening OKI Mesh CoreScope… Internet service · observer data.';
  frame=document.createElement('iframe');frame.title='OKI Mesh CoreScope live map';frame.id='corescope-frame';
  frame.setAttribute('sandbox','allow-scripts allow-same-origin');
  frame.referrerPolicy='no-referrer';frame.setAttribute('allow','fullscreen');frame.allowFullscreen=true;
  frame.onload=()=>{clearTimeout(timer);status.textContent='OKI Mesh observer data · If the map is unavailable, reload or choose Radio map.';};
  frame.onerror=()=>{serviceFailed=true;show();};
  frame.src=URL;holder.append(frame);
  timer=setTimeout(()=>{serviceFailed=true;show();},15000);
 }
 function show(){
  if(!['Overview','Network map'].includes(current))return;
  const active=effective();const overview=current==='Overview';const host=overview?mapPanel:$('#alternate');if(!overview)host.classList.add('network-source-view');if(overview)host.querySelector('.panel-heading').after(bar);else host.prepend(bar);mapPanel.classList.toggle('overview-corescope',overview&&active==='corescope');
  bar.querySelector('#network-corescope').setAttribute('aria-pressed',String(active==='corescope'));
  bar.querySelector('#network-radio').setAttribute('aria-pressed',String(active==='radio'));
  bar.querySelector('#network-source-note').textContent=active==='corescope'?'OKI Mesh · online observer data':navigator.onLine?'Local radio map · offline pack fallback':'Offline radio map · downloaded street tiles';
  bar.querySelector('#network-reload').hidden=mode!=='corescope';mapPanel.querySelector('.live').textContent=active==='corescope'?'OKI MESH':live.sync==='ready'?'RADIO':'OFFLINE';
  if(active==='corescope'){mapPanel.hidden=!overview;host.append(pane);start();}
  else{stop();pane.remove();mapPanel.hidden=false;if(!overview)host.append(mapPanel);requestAnimationFrame(()=>networkStreetMap?.invalidateSize());}
 }
 function choose(next){serviceFailed=false;mode=next;try{localStorage.setItem('nightlink.network-map',mode);}catch{}show();}
 bar.querySelector('#network-corescope').onclick=()=>choose('corescope');
 bar.querySelector('#network-radio').onclick=()=>choose('radio');
 bar.querySelector('#network-reload').onclick=()=>{serviceFailed=false;show();};
 window.addEventListener('offline',show);
 window.addEventListener('online',()=>{serviceFailed=false;show();});
 const sourceRenderMap=renderMap;renderMap=function(){sourceRenderMap();if(current==='Overview'&&effective()==='corescope')mapPanel.querySelector('.live').textContent='OKI MESH';};
 const sourceView=view;
 view=function(name){stop();bar.remove();pane.remove();mapPanel.hidden=false;mapPanel.classList.remove('overview-corescope');$('#alternate').classList.remove('network-source-view');sourceView(name);if(['Overview','Network map'].includes(name))show();};
 if(['Overview','Network map'].includes(current))show();
})();
