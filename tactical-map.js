/* Tactical skin map overlay (Cards > Skin: Tactical, 0.8.31). Presentation only; no radio commands.
   On the Network street map: crosshair node markers, bearing and distance from your radio, a Maidenhead
   grid reference for each node and under the cursor, and a north arrow. Removed for every other skin. */
(function(root){
 'use strict';
 const R=6371.0088,rad=d=>d*Math.PI/180,deg=r=>r*180/Math.PI;
 const valid=(lat,lon)=>Number.isFinite(lat)&&Number.isFinite(lon)&&Math.abs(lat)<=90&&Math.abs(lon)<=180;
 // Great-circle distance in km and initial bearing in degrees true (0–359) from a to b.
 function distanceKm(a,b){const dLat=rad(b.lat-a.lat),dLon=rad(b.lon-a.lon),h=Math.sin(dLat/2)**2+Math.cos(rad(a.lat))*Math.cos(rad(b.lat))*Math.sin(dLon/2)**2;return 2*R*Math.asin(Math.min(1,Math.sqrt(h)));}
 function bearing(a,b){const y=Math.sin(rad(b.lon-a.lon))*Math.cos(rad(b.lat)),x=Math.cos(rad(a.lat))*Math.sin(rad(b.lat))-Math.sin(rad(a.lat))*Math.cos(rad(b.lat))*Math.cos(rad(b.lon-a.lon));return (Math.round(deg(Math.atan2(y,x)))+360)%360;}
 const POINTS=['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];
 const compass=b=>POINTS[Math.round(b/22.5)%16];
 // Maidenhead locator, 6 characters (about 5 km × 2.5 km).
 function maidenhead(lat,lon){if(!valid(lat,lon))return '';let x=Math.min(lon+180,359.999999),y=Math.min(lat+90,179.999999);const A=65,a=97;
  const f1=Math.floor(x/20),f2=Math.floor(y/10);x-=f1*20;y-=f2*10;const s1=Math.floor(x/2),s2=Math.floor(y);x-=s1*2;y-=s2;const t1=Math.floor(x*12),t2=Math.floor(y*24);
  return String.fromCharCode(A+f1,A+f2)+s1+s2+String.fromCharCode(a+t1,a+t2);}
 function rangeText(km){const mi=km*0.621371;return km<1?Math.round(km*1000)+' m / '+(mi*5280).toFixed(0)+' ft':km.toFixed(km<10?2:1)+' km / '+mi.toFixed(mi<10?2:1)+' mi';}
 function describe(self,p){if(!self||!valid(self.lat,self.lon)||!valid(p.lat,p.lon))return maidenhead(p.lat,p.lon);const b=bearing(self,p);return String(b).padStart(3,'0')+'° '+compass(b)+' · '+rangeText(distanceKm(self,p))+' · '+maidenhead(p.lat,p.lon);}
 const core={distanceKm,bearing,compass,maidenhead,rangeText,describe};
 if(typeof module==='object'&&module.exports){module.exports=core;return;}
 const doc=root.document;
 const active=()=>doc.documentElement.dataset.interface==='cards'&&doc.documentElement.dataset.cardsSkin==='tactical';
 let layer=null,overlay=null,readout=null,hooked=null;
 const map=()=>{try{return typeof networkStreetMap==='object'?networkStreetMap:null;}catch{return null;}};
 const data=()=>{try{return typeof live==='object'?live:null;}catch{return null;}};
 const self=()=>{const i=data()?.identity;return i?.located&&valid(i.lat,i.lon)?{lat:i.lat,lon:i.lon}:null;};
 const points=()=>(data()?.contacts||[]).filter(c=>c.located&&valid(c.lat,c.lon)&&(c.lat!==0||c.lon!==0));
 function el(tag,cls,text){const e=doc.createElement(tag);if(cls)e.className=cls;if(text!=null)e.textContent=text;return e;}
 function clear(){layer?.clearLayers();overlay?.remove();overlay=null;readout=null;const m=map();if(m&&hooked===m){m.off('mousemove',move);m.off('mouseout',out);hooked=null;}}
 function move(e){if(!readout)return;const p={lat:e.latlng.lat,lon:e.latlng.lng};readout.textContent='CURSOR '+describe(self(),p);}
 function out(){if(readout)readout.textContent=self()?'YOU '+maidenhead(self().lat,self().lon):'Grid · move the pointer over the map';}
 function draw(){const m=map();if(!active()||!m||typeof L!=='object'){clear();return;}
  if(!layer)layer=L.layerGroup();if(!m.hasLayer(layer))layer.addTo(m);layer.clearLayers();const me=self();
  const icon=(cls)=>L.divIcon({className:'tac-marker '+cls,iconSize:[26,26],iconAnchor:[13,13],html:''});
  if(me)L.marker([me.lat,me.lon],{icon:icon('tac-self'),interactive:false,keyboard:false}).addTo(layer);
  for(const p of points()){const name=typeof cardName==='function'?cardName(p.key,p.name):p.name;const label=el('span','tac-label');label.append(el('strong','',name),el('span','',describe(me,p)));
   L.marker([p.lat,p.lon],{icon:icon(p.type===2?'tac-repeater':'tac-node'),keyboard:false,title:name+' · '+describe(me,p)}).addTo(layer).bindTooltip(label,{direction:'right',offset:[14,0],className:'tac-tooltip'});}
  const box=m.getContainer();if(!overlay||!box.contains(overlay)){overlay=el('div','tac-overlay');overlay.setAttribute('aria-hidden','true');const rose=el('div','tac-north');rose.append(el('span','tac-north-arrow'),el('span','tac-north-label','N'));readout=el('div','tac-readout');overlay.append(rose,readout);box.append(overlay);}
  if(hooked!==m){m.on('mousemove',move);m.on('mouseout',out);hooked=m;}out();}
 root.NightlinkTacticalMap={...core,refresh:draw};
 doc.addEventListener('DOMContentLoaded',()=>{
  if(typeof root.renderMap==='function'||typeof renderMap==='function'){const prev=renderMap;renderMap=function(){const r=prev.apply(this,arguments);try{draw();}catch(e){console.warn('tactical map',e);}return r;};}
  new MutationObserver(()=>{try{draw();}catch{}}).observe(doc.documentElement,{attributes:true,attributeFilter:['data-cards-skin','data-interface']});
  try{draw();}catch{}});
})(typeof window==='object'?window:globalThis);
