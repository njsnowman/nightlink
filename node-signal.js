/* Nodes table: SNR shown as four bars plus the value, and last advert as a relative age (exact time in the tooltip).
   Display only; uses the SNR and advert time the radio already reported. */
(function(root){
 'use strict';
 // Bars from reported SNR in dB. LoRa decodes below 0 dB, so thresholds are -10/-5/0/5.
 const bars=snr=>snr==null||!Number.isFinite(Number(snr))?0:snr>=5?4:snr>=0?3:snr>=-5?2:snr>=-10?1:0;
 function age(seconds,now=Date.now()/1000){if(!seconds)return 'Unknown';const d=Math.max(0,Math.round(now-seconds));
  if(d<60)return 'just now';if(d<3600)return Math.floor(d/60)+'m ago';if(d<86400)return Math.floor(d/3600)+'h ago';return Math.floor(d/86400)+'d ago';}
 const core={bars,age};
 if(typeof module==='object'&&module.exports){module.exports=core;return;}
 root.NightlinkNodeSignal=core;const doc=root.document;
 function decorate(all){const L=typeof live==='object'?live:null;if(!L)return;const contacts=L.contacts.slice(0,all?L.contacts.length:4);const table=doc.querySelector('#node-table')?.closest('table');
  if(table){table.classList.toggle('node-signal-on',!!all);const th=table.querySelectorAll('th')[2];if(th)th.textContent='LAST SNR';}
  doc.querySelectorAll('#node-table tr').forEach((row,i)=>{const n=contacts[i];if(!n)return;const sig=row.querySelector('td.signal'),heard=row.children[3];
   if(sig&&!sig.querySelector('.node-bars')){const b=bars(n.snr),w=doc.createElement('span');w.className='node-bars';w.dataset.level=String(b);w.setAttribute('aria-hidden','true');
    for(let k=1;k<=4;k++){const s=doc.createElement('span');s.className='node-bar'+(k<=b?' on':'');s.textContent='▂▄▆█'[k-1];w.append(s);}
    sig.prepend(w,' ');sig.setAttribute('aria-label',n.snr==null?'Signal unavailable':'SNR '+n.snr+' dB, '+b+' of 4 bars');}
   if(heard&&n.lastAdvert){heard.textContent=age(n.lastAdvert);heard.title=new Date(n.lastAdvert*1000).toLocaleString();heard.classList.add('node-heard');}});}
 doc.addEventListener('DOMContentLoaded',()=>{if(typeof renderNodes!=='function')return;const prev=renderNodes;renderNodes=function(all){const r=prev.apply(this,arguments);decorate(all);return r;};});
})(typeof window==='object'?window:globalThis);
