/* Text-mode windows for the terminal interface (#131): window title bars and key hints for Radio, Settings and every
   dialog (Device Center, Propagation Monitor, Help, Message path), plus the ANSI path view in the Message path dialog.
   Presentation only. Rendering reads stored state and never issues radio commands. */
(function(){
 'use strict';
 if(typeof view!=='function'||!window.NightlinkInterface)return;
 const doc=document;
 const el=(tag,cls,text)=>{const n=doc.createElement(tag);if(cls)n.className=cls;if(text!=null)n.textContent=text;return n;};
 const on=()=>NightlinkInterface.isTerminal();

 // Page windows: a title bar replaces the card page heading; the key line names the shortcuts that work there.
 const PAGES={
  Radio:{title:'RADIO',sub:'status · tools · counters',keys:[['Tab','Next control'],['F9','Main menu'],['Esc','Back']]},
  Settings:{title:'SETTINGS',sub:'interface · sounds · lock · data',keys:[['Tab','Next control'],['F1','Help'],['Esc','Back']]},
  Nodes:{title:'NODES',sub:'who is on the mesh · saved contacts',keys:[['Tab','Next control'],['F2','Chat'],['Esc','Back']]},
  'Network map':{title:'MAP',sub:'ANSI node map · street map',keys:[['Tab','Next control'],['F2','Chat'],['Esc','Back']]},
  Activity:{title:'ACTIVITY',sub:'local event log · newest first',keys:[['Tab','Next control'],['F9','Main menu'],['Esc','Back']]},
  'Direct Messages':{title:'DIRECT',sub:'private conversations',keys:[['Tab','Next control'],['F2','Chat'],['Esc','Back']]},
  Search:{title:'SEARCH',sub:'stored messages and contacts',keys:[['Tab','Next control'],['F2','Chat'],['Esc','Back']]}
 };
 function keyLine(keys){const p=el('p','term-window-keys');for(const [k,label] of keys){const s=el('span','term-window-key');s.append(el('span','term-fkey',k),' '+label);p.append(s);}return p;}
 function pageWindow(){
  const content=doc.querySelector('main .content');if(!content)return;
  const help=current==='Settings'&&window.NightlinkSettings?.current?.()==='help';
  const page=on()?(help?{title:'HELP',sub:'guide · shortcuts · about',keys:[['Tab','Next control'],['F9','Main menu'],['Esc','Back']]}:PAGES[current]):null;
  doc.body.classList.toggle('term-window-page',!!page);
  // Help lives inside Settings; the menu bar marks the item the operator chose.
  if(!help){const h=doc.querySelector('#term-menubar [data-term-view=Help]');if(h){h.classList.remove('active');if(h.getAttribute('aria-current'))h.removeAttribute('aria-current');}}
  if(on()&&current==='Settings')for(const b of doc.querySelectorAll('#term-menubar [data-term-view]')){const active=b.dataset.termView===(help?'Help':'Settings');b.classList.toggle('active',active);if(active)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');}
  let bar=doc.querySelector('#term-page-title');
  if(!page){bar?.remove();doc.querySelector('#term-page-keys')?.remove();return;}
  if(!bar){bar=el('div','term-window-title');bar.id='term-page-title';}
  bar.replaceChildren(el('span','term-window-box','[■]'),el('h1','term-window-name',page.title),el('span','term-window-sub',page.sub));
  bar.dataset.page=current;
  if(bar.parentNode!==content||content.firstChild!==bar)content.prepend(bar);
  doc.querySelector('#term-page-keys')?.remove();const keys=keyLine(page.keys);keys.id='term-page-keys';content.append(keys);
 }

 // Dialog windows: the single shared #dialog takes a window name from its title and a key line at the bottom.
 const dialog=doc.querySelector('#dialog');
 function dialogWindow(){
  if(!dialog)return;
  const open=dialog.open&&on();
  dialog.classList.toggle('term-window',open);
  dialog.querySelector('.term-window-keys')?.remove();
  if(!open){delete dialog.dataset.termWindow;return;}
  dialog.dataset.termWindow=(doc.querySelector('#dialog-title')?.textContent||'').trim();
  const keys=keyLine([['Esc','Close'],['Tab','Next control'],['Enter','Select']]);dialog.append(keys);
 }
 if(dialog){
  new MutationObserver(dialogWindow).observe(dialog,{attributes:true,attributeFilter:['open']});
  const title=doc.querySelector('#dialog-title');if(title)new MutationObserver(dialogWindow).observe(title,{childList:true,characterData:true,subtree:true});
 }

 // ANSI path view. The diagram uses only stored evidence: resolved hops by name, unresolved hops by hash,
 // hop-count-only paths as a counted gap. Nothing is inferred from the current network.
 const CELLS_W=56,CELLS_H=12;
 function located(p){return p&&Number.isFinite(p.lat)&&Number.isFinite(p.lon)&&Math.abs(p.lat)<=85&&Math.abs(p.lon)<=180;}
 function pathModel(m){
  const stops=typeof routeStops==='function'?routeStops(m):[];
  const sender=m.own?(live.identity?.name||'You'):(m.sender||m.target?.name||'Sender');
  const id=live.identity,receiver={name:m.own?'recipient':(id?.name||'Your radio'),lat:id?.lat,lon:id?.lon,receiver:true,located:!m.own&&!!id?.located&&located(id)};
  let state='resolved';
  if(m.own)state='outgoing';else if(!m.observedRoute)state=m.pathLength===0?'direct':'count';else if(m.observedRoute.direct||!stops.length)state='direct';
  return {sender,stops,receiver,state,hops:m.pathLength};
 }
 function pathLine(model){
  const line=el('p','term-path-line');
  const node=(text,cls)=>line.append(el('span',cls,text));
  const arrow=()=>node(' ──► ','term-path-arrow');
  node(model.sender,'term-path-end');
  if(model.state==='outgoing'){arrow();node('outgoing path not reported','term-pending');return line;}
  if(model.state==='count'){arrow();node('░ '+(window.MeshlineRoutes?MeshlineRoutes.hopSummary(model.hops):model.hops+' hops')+', repeaters not identified ░','term-pending');}
  for(const s of model.stops){arrow();node('['+s.index+'] '+(s.name==='Unknown repeater'||s.name==='Unresolved repeater'?s.hash:s.name),s.located?'term-ok':s.candidates?.length>1?'term-pending':'term-bad');}
  arrow();node('RX '+model.receiver.name,'term-path-end');
  return line;
 }
 function pathGrid(model){
  const points=[...model.stops.filter(s=>s.located).map(s=>({...s,label:String(s.index%10)})),...(model.receiver.located?[{...model.receiver,label:'R'}]:[])];
  if(!points.length)return null;
  const lats=points.map(p=>p.lat),lons=points.map(p=>p.lon),pad=1e-3;
  const minLat=Math.min(...lats)-pad,maxLat=Math.max(...lats)+pad,minLon=Math.min(...lons)-pad,maxLon=Math.max(...lons)+pad;
  const cell=p=>[Math.round((p.lon-minLon)/(maxLon-minLon)*(CELLS_W-1)),Math.round((maxLat-p.lat)/(maxLat-minLat)*(CELLS_H-1))];
  const grid=Array.from({length:CELLS_H},()=>Array.from({length:CELLS_W},()=>({ch:'·',cls:'term-path-ground'})));
  // Connect only consecutive known hops, as the street map does; an unknown hop is never bridged.
  for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],ai=a.receiver?model.stops.length+1:a.index,bi=b.receiver?model.stops.length+1:b.index;if(bi!==ai+1)continue;
   const [x0,y0]=cell(a),[x1,y1]=cell(b),n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0));
   for(let k=1;k<n;k++){const x=Math.round(x0+(x1-x0)*k/n),y=Math.round(y0+(y1-y0)*k/n);grid[y][x]={ch:'█',cls:'term-path-beam'};}}
  for(const p of points){const [x,y]=cell(p);grid[y][x]={ch:p.label,cls:p.receiver?'term-path-rx':'term-path-hop'};}
  const pre=el('pre','term-path-grid');pre.setAttribute('role','img');
  pre.setAttribute('aria-label','Text map of '+points.length+' located point'+(points.length===1?'':'s')+': '+points.map(p=>(p.receiver?'RX ':p.index+' ')+p.name).join(', '));
  for(const row of grid){for(const c of row)pre.append(el('span',c.cls,c.ch));pre.append('\n');}
  return pre;
 }
 // ANSI node map (Network map page): saved contacts with advertised locations and your radio. Positions only;
 // no links are drawn because adverts do not report which nodes hear each other.
 const MAP_W=72,MAP_H=16;
 function nodeMap(){
  const content=doc.querySelector('main .content');doc.querySelector('#term-node-map')?.remove();
  if(!content||!on()||current!=='Network map')return;
  const id=live.identity,mark=c=>c.type===2?['r','term-path-beam']:c.type===3?['m','term-pending']:['c','term-ok'];
  const points=live.contacts.filter(c=>c.located!==false&&located(c)).map(c=>{const [ch,cls]=mark(c);return {lat:c.lat,lon:c.lon,ch,cls,name:typeof cardName==='function'?cardName(c.key,c.name):c.name};});
  if(id&&id.located&&located(id))points.push({lat:id.lat,lon:id.lon,ch:'@',cls:'term-path-rx',name:(id.name||'Your radio')+' (you)'});
  const box=el('section','term-frame term-node-map');box.id='term-node-map';box.setAttribute('aria-label','ANSI node map');
  box.append(el('h2','term-frame-title','node map · '+points.length+' located of '+(live.contacts.length+(id?1:0))));
  if(!points.length){box.append(el('p','term-dim','No saved contacts or radio with advertised locations. The street map below stays available.'));}
  else{
   const lats=points.map(p=>p.lat),lons=points.map(p=>p.lon),pad=1e-3,minLat=Math.min(...lats)-pad,maxLat=Math.max(...lats)+pad,minLon=Math.min(...lons)-pad,maxLon=Math.max(...lons)+pad;
   const grid=Array.from({length:MAP_H},()=>Array.from({length:MAP_W},()=>({ch:'·',cls:'term-path-ground',n:0})));
   for(const p of points){const x=Math.round((p.lon-minLon)/(maxLon-minLon)*(MAP_W-1)),y=Math.round((maxLat-p.lat)/(maxLat-minLat)*(MAP_H-1)),g=grid[y][x];
    if(g.ch==='@')continue;g.n++;Object.assign(g,p.ch==='@'?{ch:'@',cls:p.cls}:g.n>1?{ch:String(Math.min(g.n,9)),cls:'term-path-hop'}:{ch:p.ch,cls:p.cls});}
   const pre=el('pre','term-path-grid');pre.setAttribute('role','img');
   pre.setAttribute('aria-label','Text map of '+points.length+' located node'+(points.length===1?'':'s')+': '+points.map(p=>p.name).join(', '));
   for(const row of grid){for(const c of row)pre.append(el('span',c.cls,c.ch));pre.append('\n');}
   box.append(pre,el('p','term-path-legend','@ = your radio · r = repeater · c = companion · m = room server · digit = nodes sharing a cell · north up'));
  }
  const title=doc.querySelector('#term-page-title');if(title)title.after(box);else content.prepend(box);
 }
 if(typeof radioSession==='object')for(const type of ['contacts','identity'])radioSession.addEventListener(type,()=>{if(current==='Network map')nodeMap();});

 function pathView(m){
  const host=doc.querySelector('.message-path-workspace');if(!host||!on())return;
  host.querySelector('.term-path')?.remove();
  const model=pathModel(m),box=el('section','term-frame term-path');box.setAttribute('aria-label','ANSI path view');
  box.append(el('h3','term-frame-title','path · sender → receiver'),pathLine(model));
  const grid=pathGrid(model);
  if(grid)box.append(grid,el('p','term-path-legend','digits = located repeaters in order · R = your radio · █ = known segment'));
  else box.append(el('p','term-dim term-path-legend','No located points for this message. The text map needs advertised locations.'));
  host.prepend(box);
 }
 if(typeof showMessageRoute==='function'){const previous=showMessageRoute;showMessageRoute=function(m){const r=previous.apply(this,arguments);try{pathView(m);}catch{}return r;};}

 const previousView=view;view=function(){previousView.apply(this,arguments);pageWindow();nodeMap();};
 // Settings categories (including Help) switch without a view change.
 doc.addEventListener('click',()=>{if(current==='Settings')setTimeout(pageWindow,0);});
 if(window.NightlinkSettings?.open){const open=NightlinkSettings.open;NightlinkSettings.open=function(){const r=open.apply(this,arguments);pageWindow();return r;};}
 window.addEventListener('nightlink-interface',()=>{pageWindow();dialogWindow();nodeMap();});
 window.NightlinkTerminalWindows={pageWindow,dialogWindow,pathModel,pathLine,pathGrid,nodeMap,pages:Object.keys(PAGES)};
 pageWindow();
})();
