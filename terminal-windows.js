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
  Operations:{title:'MESH SITE IDEAS',sub:'places · terrain · coverage · optional field notes',keys:[['Tab','Next control'],['F9','Main menu'],['Esc','Back']]},
  'Contact Book':{title:'CONTACT BOOK',sub:'offline contacts · locations · activity',keys:[['Tab','Next control'],['F9','Main menu'],['Esc','Back']]},
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
  const page=on()?(help?{title:'HELP',sub:'guide · shortcuts · about',keys:[['PgDn','Next topic'],['PgUp','Previous topic'],['Tab','Next control'],['Esc','Back']]}:PAGES[current]):null;
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
 const CELLS_W=96,CELLS_H=14;
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
 // Map frame shared by the path view and the node map: box-drawing border, north marker, and a distance scale
 // derived from the plotted bounds (great-circle width at the middle latitude). Decorative only; the pre is role=img.
 function kmWidth(minLat,maxLat,minLon,maxLon){const r=Math.PI/180,lat=(minLat+maxLat)/2*r,d=(maxLon-minLon)*r*Math.cos(lat);return Math.abs(d)*6371;}
 function lineChar(dx,dy){if(!dy)return '─';if(!dx)return '│';if(Math.abs(dx)>=2*Math.abs(dy))return '─';if(Math.abs(dy)>=2*Math.abs(dx))return '│';return dx*dy>0?'╲':'╱';}
 function framed(grid,km){
  const W=grid[0].length,pre=el('pre','term-path-grid');const put=(t,c)=>pre.append(el('span',c,t));
  const north='─ N ▲ ';put('┌'+north,'term-path-frame');put('─'.repeat(W-north.length)+'┐\n','term-path-frame');
  for(const row of grid){put('│','term-path-frame');for(const c of row)put(c.ch,c.cls);put('│\n','term-path-frame');}
  put('└'+'─'.repeat(W)+'┘\n','term-path-frame');
  if(Number.isFinite(km)&&km>0){const cells=Math.max(4,Math.round(W/4)),seg=km*cells/W,label=NightlinkUnits.miles(seg*1000,2);
   put(' ├'+'─'.repeat(cells-2)+'┤ ','term-path-scale');put(label+' mi','term-path-scale-label');}
  return pre;
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
   let px=x0,py=y0;for(let k=1;k<n;k++){const x=Math.round(x0+(x1-x0)*k/n),y=Math.round(y0+(y1-y0)*k/n);grid[y][x]={ch:lineChar(x-px||0,y-py||0)||'·',cls:'term-path-beam'};px=x;py=y;}}
  for(const p of points){const [x,y]=cell(p);grid[y][x]={ch:p.label,cls:p.receiver?'term-path-rx':'term-path-hop'};}
  const pre=framed(grid,kmWidth(minLat,maxLat,minLon,maxLon));pre.setAttribute('role','img');
  pre.setAttribute('aria-label','Text map of '+points.length+' located point'+(points.length===1?'':'s')+': '+points.map(p=>(p.receiver?'RX ':p.index+' ')+p.name).join(', '));
  return pre;
 }
 // ANSI node map (Network map page): saved contacts with advertised locations and your radio. Positions only;
 // no links are drawn because adverts do not report which nodes hear each other.
 const MAP_W=110,MAP_H=18;let nodeMapOpen=false;
 function nodeMap(){
  const content=doc.querySelector('main .content');doc.querySelector('#term-node-map')?.remove();
  if(!content||!on()||current!=='Network map')return;
  const id=live.identity,mark=c=>c.type===2?['r','term-path-beam']:c.type===3?['m','term-pending']:['c','term-ok'];
  const points=live.contacts.filter(c=>c.located!==false&&located(c)).map(c=>{const [ch,cls]=mark(c);return {lat:c.lat,lon:c.lon,ch,cls,name:typeof cardName==='function'?cardName(c.key,c.name):c.name};});
  if(id&&id.located&&located(id))points.push({lat:id.lat,lon:id.lon,ch:'@',cls:'term-path-rx',name:(id.name||'Your radio')+' (you)'});
  // Collapsed by default so the street map keeps its height; the choice is remembered for this session.
  const box=el('details','term-frame term-node-map');box.id='term-node-map';box.setAttribute('aria-label','ANSI node map');box.open=nodeMapOpen;
  box.addEventListener('toggle',()=>{nodeMapOpen=box.open;});
  const summary=el('summary','term-frame-title','node map · '+points.length+' located of '+(live.contacts.length+(id?1:0)));box.append(summary);
  if(!points.length){box.append(el('p','term-dim','No saved contacts or radio with advertised locations. The street map below stays available.'));}
  else{
   const lats=points.map(p=>p.lat),lons=points.map(p=>p.lon),pad=1e-3,minLat=Math.min(...lats)-pad,maxLat=Math.max(...lats)+pad,minLon=Math.min(...lons)-pad,maxLon=Math.max(...lons)+pad;
   const grid=Array.from({length:MAP_H},()=>Array.from({length:MAP_W},()=>({ch:'·',cls:'term-path-ground',n:0})));
   for(const p of points){const x=Math.round((p.lon-minLon)/(maxLon-minLon)*(MAP_W-1)),y=Math.round((maxLat-p.lat)/(maxLat-minLat)*(MAP_H-1)),g=grid[y][x];
    if(g.ch==='@')continue;g.n++;Object.assign(g,p.ch==='@'?{ch:'@',cls:p.cls}:g.n>1?{ch:String(Math.min(g.n,9)),cls:'term-path-hop'}:{ch:p.ch,cls:p.cls});}
   const pre=framed(grid,kmWidth(minLat,maxLat,minLon,maxLon));pre.setAttribute('role','img');
   pre.setAttribute('aria-label','Text map of '+points.length+' located node'+(points.length===1?'':'s')+': '+points.map(p=>p.name).join(', '));
   box.append(pre,el('p','term-path-legend','@ = your radio · r = repeater · c = companion · m = room server · digit = nodes sharing a cell'));
  }
  const title=doc.querySelector('#term-page-title');if(title)title.after(box);else content.prepend(box);
 }
 if(typeof radioSession==='object')for(const type of ['contacts','identity'])radioSession.addEventListener(type,()=>{if(current==='Network map')nodeMap();});

 // The path line stays visible; the character map is collapsed by default so the street map gets the space.
 let replayTimer=null;
 function pathView(m){
  const host=doc.querySelector('.message-path-workspace');if(!host||!on())return;
  host.querySelector('.term-path')?.remove();
  const model=pathModel(m),box=el('section','term-frame term-path');box.setAttribute('aria-label','ANSI path view');
  box.append(el('h3','term-frame-title','path · sender → receiver'),pathLine(model));
  const grid=pathGrid(model);
  if(grid){const more=el('details','term-path-more'),sum=el('summary',null,'text map');more.append(sum,grid,el('p','term-path-legend','digits = located repeaters in order · R = your radio · ─│╱╲ = known segment'));box.append(more);}
  host.prepend(box);
  // The terminal layout enlarges the map after Leaflet measured it; re-measure so tiles and bounds fill it.
  setTimeout(()=>{try{if(typeof messageMap==='object'&&messageMap){messageMap.invalidateSize();}}catch{}},60);
  autoReplay();
 }
 // Replays the known route segments every 6 s while the dialog is open, unless the operator prefers reduced motion.
 function autoReplay(){
  clearInterval(replayTimer);replayTimer=null;
  if(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)return;
  replayTimer=setInterval(()=>{const d=doc.querySelector('#dialog'),b=doc.querySelector('#replay-route');if(!d?.open||!b||!on()){clearInterval(replayTimer);replayTimer=null;return;}if(!b.disabled)b.click();},6000);
 }

 if(typeof showMessageRoute==='function'){const previous=showMessageRoute;showMessageRoute=function(m){const r=previous.apply(this,arguments);try{pathView(m);}catch{}return r;};}

 const previousView=view;view=function(){previousView.apply(this,arguments);pageWindow();nodeMap();emptyArt();settingsKeys();setTimeout(settingsKeys,0);};
 // Decorative ANSI art on empty pages (aria-hidden; each page already states that it is empty in text).
 const EMPTY_ART={
  Nodes:{when:()=>!live.contacts.length,lines:[['   .         .          .','term-art-dim'],['     \\       |        /','term-art-dim'],['  .---( o )---( o )---( o )---.','term-art-cyan'],['        \\_______|_______/','term-art-dim'],['           ( @ ) your radio','term-art-white'],['','',],['  no saved nodes yet · adverts appear here as they are heard','term-art-dim']]},
  'Direct Messages':{when:()=>!live.messages.some(m=>m.target?.kind==='direct'||m.kind==='direct'),lines:[['   ╔══════════════════╗','term-art-cyan'],['   ║ \\              / ║','term-art-cyan'],['   ║   \\  ·──·   /   ║','term-art-cyan'],['   ║     \\______/     ║','term-art-cyan'],['   ╚══════════════════╝','term-art-cyan'],['',''],['   no direct messages yet','term-art-dim']]}
 };
 function emptyArt(){
  doc.querySelector('#term-empty-art')?.remove();
  const spec=on()&&EMPTY_ART[current];if(!spec)return;let empty=false;try{empty=spec.when();}catch{}if(!empty)return;
  const pre=el('pre','term-empty-art');pre.id='term-empty-art';pre.setAttribute('aria-hidden','true');
  for(const [t,c] of spec.lines)pre.append(el('span',c||null,t+'\n'));
  const title=doc.querySelector('#term-page-title');if(title)title.after(pre);
 }
 if(typeof radioSession==='object')for(const type of ['contacts','sync'])radioSession.addEventListener(type,()=>{if(current in EMPTY_ART)emptyArt();});

 // Keyboard: "/" opens search (or the MRC command line on Messages); arrow keys move through the main menu and
 // through table rows on page windows. Inactive while a text field, select or dialog has focus.
 const typing=t=>t?.closest?.('input,textarea,select,[contenteditable=""],[contenteditable=true]');
 doc.addEventListener('keydown',e=>{
  if(!on()||e.defaultPrevented||e.ctrlKey||e.altKey||e.metaKey||typing(e.target)||doc.querySelector('dialog[open]'))return;
  if(e.key==='/'){e.preventDefault();if(current==='Messages'){const i=doc.querySelector('#mrc-input');if(i){i.focus();i.value='/';i.dispatchEvent(new Event('input'));}return;}doc.querySelector('#open-message-search')?.click();return;}
  if(!['ArrowDown','ArrowUp','ArrowLeft','ArrowRight'].includes(e.key))return;
  if(current==='Overview'){const items=[...doc.querySelectorAll('#bbs .bbs-item')];if(!items.length)return;const rows=Math.ceil(items.length/2);let i=items.indexOf(doc.activeElement);
   if(i<0)i=0;else if(e.key==='ArrowDown')i=Math.min(items.length-1,i+1);else if(e.key==='ArrowUp')i=Math.max(0,i-1);else if(e.key==='ArrowRight')i=Math.min(items.length-1,i+rows);else i=Math.max(0,i-rows);
   e.preventDefault();items[i].focus();return;}
  if((e.key==='ArrowDown'||e.key==='ArrowUp')&&doc.body.classList.contains('term-window-page')){
   const rows=[...doc.querySelectorAll('main .content tbody tr')].map(r=>r.querySelector('button,a[href],[tabindex]:not([tabindex="-1"])')).filter(Boolean);if(!rows.length)return;
   const at=rows.findIndex(b=>b.closest('tr')?.contains(doc.activeElement));const i=at<0?0:Math.max(0,Math.min(rows.length-1,at+(e.key==='ArrowDown'?1:-1)));e.preventDefault();rows[i].focus();}
 });

 // Settings as a DOS menu: hotkey letters on the category buttons; a letter opens its category when no field has focus.
 function settingsKeys(){if(!on()||current!=='Settings')return;const used=new Set();for(const b of doc.querySelectorAll('.switchboard-settings-nav button')){const label=(b.textContent||'').replace(/^\[.\]\s*/,'').trim();const k=[...label.toUpperCase()].find(c=>/[A-Z]/.test(c)&&!used.has(c));if(!k)continue;used.add(k);b.dataset.hotkey=k;b.setAttribute('aria-keyshortcuts',k);}}
 doc.addEventListener('keydown',e=>{if(!on()||current!=='Settings'||e.ctrlKey||e.altKey||e.metaKey||e.defaultPrevented||e.key.length!==1)return;if(e.target.closest?.('input,textarea,select,[contenteditable=""],[contenteditable=true]')||doc.querySelector('dialog[open]'))return;
  const b=doc.querySelector(`.switchboard-settings-nav button[data-hotkey="${CSS.escape(e.key.toUpperCase())}"]`);if(b){e.preventDefault();b.click();b.focus();}});
 // Help viewer: PgDn / PgUp move to the next or previous topic when no field has focus.
 doc.addEventListener('keydown',e=>{if(!on()||current!=='Settings'||window.NightlinkSettings?.current?.()!=='help'||!['PageDown','PageUp'].includes(e.key)||e.defaultPrevented)return;
  if(e.target.closest?.('input,textarea,select,[contenteditable=""],[contenteditable=true]')||doc.querySelector('dialog[open]'))return;
  const list=[...doc.querySelectorAll('.help-topics button')];if(!list.length)return;const i=list.findIndex(b=>b.getAttribute('aria-current')==='true');
  const next=list[Math.max(0,Math.min(list.length-1,i+(e.key==='PageDown'?1:-1)))];if(next&&next!==list[i]){e.preventDefault();next.click();next.focus();}});
 // Settings categories (including Help) switch without a view change.
 doc.addEventListener('click',()=>{if(current==='Settings')setTimeout(()=>{pageWindow();settingsKeys();},0);});
 if(window.NightlinkSettings?.open){const open=NightlinkSettings.open;NightlinkSettings.open=function(){const r=open.apply(this,arguments);pageWindow();settingsKeys();return r;};}
 window.addEventListener('nightlink-interface',()=>{pageWindow();dialogWindow();nodeMap();});
 window.NightlinkTerminalWindows={pageWindow,dialogWindow,pathModel,pathLine,pathGrid,nodeMap,pages:Object.keys(PAGES)};
 pageWindow();
})();
