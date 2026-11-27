/* Nodes table: SNR shown as four bars plus the value, and last advert as a relative age (exact time in the tooltip).
   Display only; uses the SNR and advert time the radio already reported. */
(function(root){
 'use strict';
 // Bars from reported SNR in dB. LoRa decodes below 0 dB, so thresholds are -10/-5/0/5.
 const bars=snr=>snr==null||!Number.isFinite(Number(snr))?0:snr>=5?4:snr>=0?3:snr>=-5?2:snr>=-10?1:0;
 function age(seconds,now=Date.now()/1000){if(!seconds)return 'Unknown';const d=Math.max(0,Math.round(now-seconds));
  if(d<60)return 'just now';if(d<3600)return Math.floor(d/60)+'m ago';if(d<86400)return Math.floor(d/3600)+'h ago';return Math.floor(d/86400)+'d ago';}
 // Latest SNR the companion measured from each node, from stored messages: the last hop of an observed path when it
 // resolves to exactly one contact, or the sender of a zero-hop (direct) packet. Ambiguous path hashes are skipped.
 function heard(messages,contacts,resolve,sender){const out=new Map();
  for(let i=messages.length-1;i>=0;i--){const m=messages[i],r=m.observedRoute;if(m.own||!r||!Number.isFinite(r.snr))continue;let key=null;
   if(r.direct||!r.path?.length){const c=sender?.(m);key=c?.key||null;}
   else{const hop=resolve?.([r.path[r.path.length-1]],contacts)?.[0];if(hop?.candidates?.length===1)key=hop.candidates[0].key;}
   if(key&&!out.has(key))out.set(key,{snr:r.snr,at:m.timestamp});}
  return out;}
 // Merge zero-hop advert readings (exact public key) with message-derived readings; the newest wins per node.
 function merge(fromMessages,adverts){const out=new Map(fromMessages);for(const [key,v] of adverts||[]){const cur=out.get(key);if(!cur||v.at>=cur.at)out.set(key,{...v,source:'advert'});}return out;}
 const core={bars,age,heard,merge};
 if(typeof module==='object'&&module.exports){module.exports=core;return;}
 root.NightlinkNodeSignal=core;const doc=root.document;
 function decorate(all){const L=typeof live==='object'?live:null;if(!L)return;const table=doc.querySelector('#node-table')?.closest('table');
  // The column shows on the Nodes page; Overview keeps its compact favourites list.
  if(table){table.classList.toggle('node-signal-on',!!all||(typeof current==='string'&&current==='Nodes'));const th=table.querySelectorAll('th')[2];if(th)th.textContent='LAST SNR';}
  const seen=merge(heard(L.messages||[],L.contacts,root.MeshlineRoutes?.resolvePath,typeof messageContact==='function'?m=>{try{return messageContact(m);}catch{return null;}}:null),root.NightlinkHeardAdverts);
  // Rows are matched by their contact index (data-node), not position: other modules remove, hide and filter rows.
  doc.querySelectorAll('#node-table tr').forEach(row=>{const idx=row.querySelector('[data-node]')?.dataset.node;const n0=idx==null?null:L.contacts[Number(idx)];if(!n0)return;const h=seen.get(n0.key),n=h?{...n0,snr:h.snr}:n0;const sig=row.querySelector('td.signal'),heard=row.children[3];
   if(sig&&!sig.querySelector('.node-bars')){if(h)sig.textContent=h.snr+' dB';const b=bars(n.snr),w=doc.createElement('span');w.className='node-bars';w.dataset.level=String(b);w.setAttribute('aria-hidden','true');
    for(let k=1;k<=4;k++){const s=doc.createElement('span');s.className='node-bar'+(k<=b?' on':'');s.textContent='▂▄▆█'[k-1];w.append(s);}
    sig.prepend(w,' ');sig.setAttribute('aria-label',n.snr==null?'Signal unavailable':'SNR '+n.snr+' dB, '+b+' of 4 bars');if(h)sig.title='Heard directly by your radio '+age(h.at)+(h.source==='advert'?' (advert)':row.children[1]?.textContent==='Repeater'?' (final hop of a message)':' (direct packet)');}
   if(heard&&n.lastAdvert){heard.textContent=age(n.lastAdvert);heard.title=new Date(n.lastAdvert*1000).toLocaleString();heard.classList.add('node-heard');}});}
 doc.addEventListener('DOMContentLoaded',()=>{if(typeof renderNodes!=='function')return;const prev=renderNodes;renderNodes=function(all){const r=prev.apply(this,arguments);decorate(all);return r;};});
})(typeof window==='object'?window:globalThis);
