/* Coverage layer for the local Radio map: colours each located node by how well your radio has heard it over the
   last 24 hours (average SNR from node-history.js). A Coverage button on the map turns it on and off; the choice is
   remembered. Only nodes with a shared location and at least one reading are drawn. Display only. */
(function(root){
 'use strict';
 const KEY='nightlink.coverage';
 // SNR bands in dB: strong ≥ 5, good ≥ 0, fair ≥ -5, weak ≥ -10, poor below.
 const BANDS=[[5,'strong','#2ea043'],[0,'good','#8bc34a'],[-5,'fair','#f2c744'],[-10,'weak','#f08c2e'],[-Infinity,'poor','#e5534b']];
 const band=snr=>BANDS.find(([min])=>snr>=min);
 const radius=count=>Math.min(16,8+Math.round(Math.log2(Math.max(1,count))*2));
 const core={KEY,BANDS,band,radius};
 if(typeof module==='object'&&module.exports){module.exports=core;return;}
 const doc=root.document;let layer=null,control=null,legend=null,owner=null;
 const L_=()=>{try{return typeof live==='object'?live:null;}catch{return null;}};
 const map=()=>{try{return typeof networkStreetMap==='object'?networkStreetMap:null;}catch{return null;}};
 const on=()=>{try{return root.localStorage.getItem(KEY)==='on';}catch{return false;}};
 function draw(){const m=map(),data=L_(),H=root.NightlinkNodeHistory;if(!m||typeof L!=='object')return;ensureControl(m);
  if(!layer)layer=L.layerGroup();layer.clearLayers();legend?.classList.toggle('coverage-hidden',!on());control?.setAttribute('aria-pressed',String(on()));
  if(!on()||!data||!H){if(m.hasLayer(layer))m.removeLayer(layer);return;}if(!m.hasLayer(layer))layer.addTo(m);const hist=H.history()||{};let drawn=0;
  for(const n of data.contacts||[]){if(!n.located||!Number.isFinite(n.lat)||!Number.isFinite(n.lon)||(n.lat===0&&n.lon===0))continue;const s=H.summary(hist[String(n.key).slice(0,16)]);if(!s)continue;
   const [,word,color]=band(s.avg),name=typeof cardName==='function'?cardName(n.key,n.name):n.name;
   L.circleMarker([n.lat,n.lon],{radius:radius(s.count),color,weight:2,fillColor:color,fillOpacity:.35,className:'coverage-dot coverage-'+word}).addTo(layer)
    .bindTooltip(name+' · '+word+' · average '+s.avg+' dB (low '+s.min+', high '+s.max+') · '+s.count+' readings in 24 h',{direction:'top'});drawn++;}
  if(legend)legend.querySelector('.coverage-count').textContent=drawn?drawn+' located nodes with readings':'No located nodes with readings yet';}
 function ensureControl(m){if(owner===m&&control?.isConnected)return;owner=m;
  const C=L.Control.extend({options:{position:'topleft'},onAdd(){const box=L.DomUtil.create('div','leaflet-bar coverage-control');const b=L.DomUtil.create('button','coverage-toggle',box);b.type='button';b.textContent='Coverage';b.title='Colour nodes by how well your radio heard them in the last 24 hours';
   L.DomEvent.disableClickPropagation(box);b.onclick=()=>{try{root.localStorage.setItem(KEY,on()?'off':'on');}catch{}draw();};control=b;return box;}});new C().addTo(m);
  const Lg=L.Control.extend({options:{position:'bottomright'},onAdd(){const box=L.DomUtil.create('div','coverage-legend');box.setAttribute('role','note');box.setAttribute('aria-label','Coverage legend');
   for(const [min,word,color] of BANDS){const row=L.DomUtil.create('span','coverage-band',box),dot=L.DomUtil.create('i','coverage-swatch coverage-'+word,row);row.append(' '+word+(Number.isFinite(min)?' ≥ '+min+' dB':''));}
   L.DomUtil.create('span','coverage-count',box);legend=box;return box;}});new Lg().addTo(m);}
 root.NightlinkCoverage={...core,refresh:draw};
 doc.addEventListener('DOMContentLoaded',()=>{if(typeof renderMap==='function'){const prev=renderMap;renderMap=function(){const r=prev.apply(this,arguments);try{draw();}catch(e){console.warn('coverage',e);}return r;};}
  try{draw();}catch{}});
})(typeof window==='object'?window:globalThis);
