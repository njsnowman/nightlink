/* Presentation only: consumes existing local evidence, never probes the radio. */
(function(){
 const trend=document.createElement('section');trend.className='switchboard-trend';
 const heading=document.createElement('h3');heading.textContent='Signal trend';
 const graph=document.createElementNS('http://www.w3.org/2000/svg','svg');graph.setAttribute('viewBox','0 0 480 70');graph.setAttribute('role','img');graph.setAttribute('aria-label','Observed last-link SNR over the last hour');
 const caption=document.createElement('small');trend.append(heading,graph,caption);document.querySelector('#overview .map-panel').append(trend);
 let trendSignature=null;
 function refreshTrend(){
  if(current!=='Overview'||document.hidden)return;
  const s=NightlinkRFTrends.summarize(evidenceStore?.rows||[],{bucketCount:30});
  const signature=JSON.stringify([s.count,s.min,s.max,s.buckets.map(b=>[b.count,b.median,b.min,b.max])]);
  if(signature===trendSignature)return;trendSignature=signature;graph.replaceChildren();
  caption.textContent=s.count?'Last hour · '+s.count+' passive samples · gaps mean no observations':'No signal observations yet · passive last-link SNR';graph.toggleAttribute('hidden',!s.count);if(!s.count)return;
  const low=Math.floor(s.min-2),high=Math.ceil(s.max+2),y=v=>58-(v-low)/(high-low)*48;
  function element(tag,attrs){const n=document.createElementNS(graph.namespaceURI,tag);for(const [k,v]of Object.entries(attrs))n.setAttribute(k,v);graph.append(n);return n;}
  for(const v of [low,high]){element('line',{x1:36,x2:475,y1:y(v),y2:y(v),class:'trend-grid'});element('text',{x:1,y:y(v)+4}).textContent=v+' dB';}
  s.buckets.forEach((b,i)=>{if(!b.count)return;const x=42+i*424/29;element('line',{x1:x,x2:x,y1:y(b.min),y2:y(b.max),class:'trend-range'});const dot=element('circle',{cx:x,cy:y(b.median),r:2.5,class:'trend-dot'}),title=document.createElementNS(graph.namespaceURI,'title');title.textContent=b.count+' samples · median '+b.median.toFixed(1)+' dB';dot.append(title);});
 }
 function channelTabs(){
  const destination=['Messages','Direct Messages','Search'].includes(current)?'Messages':current;
  for(const button of sidebarNav.querySelectorAll('button[data-view]'))button.classList.toggle('active',button.dataset.view===destination);

  if(!['Overview','Messages'].includes(current))return;
  const tools=document.querySelector('.conversation-tools'),picker=tools?.querySelector('select');if(!tools||!picker)return;
  const signature=JSON.stringify([live.channels.map(c=>[c.slot,c.id,c.name]),live.selected?.kind,live.selected?.slot]);
  const existing=tools.querySelector('.switchboard-channel-tabs');
  if(existing?.dataset.signature===signature)return;
  existing?.remove();picker.classList.toggle('switchboard-channel-picker',live.channels.length>0);if(!live.channels.length)return;
  const bar=document.createElement('div');bar.className='switchboard-channel-tabs';bar.setAttribute('aria-label','Channels');bar.dataset.signature=signature;
  for(const c of live.channels){const b=document.createElement('button');b.type='button';b.textContent='# '+c.name.replace(/^#\s*/,'');b.setAttribute('aria-pressed',String(live.selected?.kind==='channel'&&live.selected.slot===c.slot));b.onclick=()=>selectConversation({kind:'channel',...c});bar.append(b);}picker.before(bar);
 }
 const previousView=view;view=function(name){previousView(name);channelTabs();refreshTrend();};
 const previousMessages=renderMessages;renderMessages=function(){previousMessages();channelTabs();refreshTrend();};
 let scheduled=false;ble.addEventListener('packet',()=>{if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;refreshTrend();});});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshTrend();});
 channelTabs();refreshTrend();
})();
