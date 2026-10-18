/* Shared message presentation. Hop labels come from received metadata, never inferred. */
(function(root){
 function time(timestamp){return new Date(timestamp*1000).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});}
 function main(row,m){
  const sender=row.querySelector('.sender'),route=[...row.querySelectorAll('.message-route')].find(b=>!b.classList.contains('retry-delivery')&&/hops?|Route details|View repeaters|Direct/i.test(b.textContent));
  if(route){route.title=route.textContent;route.textContent=MeshlineRoutes.hopSummary(m.pathLength);route.classList.add('signal-hop');route.setAttribute('aria-label','View message path · '+route.textContent);sender.append(route);}
  else if(m.own){const tag=document.createElement('span');tag.className='signal-hop signal-hop-own';tag.textContent=m.target?.kind==='channel'?'Broadcast':'Outgoing';sender.append(tag);}
  NightlinkMessageMedia.attach(row,m.text);
  row.querySelector('p').title=m.status+(m.snr==null?'':' · '+m.snr+' dB');
 }
 function direct(row,m,data,openContact){
  const old=row.querySelector('.dm-message-person'),image=old?.querySelector('.avatar,.contact-avatar')?.cloneNode(true)||document.createElement('span');
  image.removeAttribute('id');image.classList.add('avatar');if(m.own)image.textContent='You';else if(!image.textContent&&!image.querySelector('img'))image.textContent=data.name.slice(0,2).toUpperCase();
  old?.remove();const content=document.createElement('div');content.className='signal-message-content';while(row.firstChild)content.append(row.firstChild);
  const header=document.createElement('div');header.className='sender';const name=document.createElement(m.own?'span':'button');name.textContent=m.own?'You':data.name;
  if(!m.own){name.className='dm-message-person';name.onclick=openContact;name.setAttribute('aria-label','Open contact card for '+data.name);}
  const stamp=document.createElement('time');stamp.dateTime=new Date(m.timestamp*1000).toISOString();stamp.textContent=time(m.timestamp);
  const hop=document.createElement('span');hop.className='signal-hop';hop.textContent=m.own?'Outgoing':m.hopLabel||'Route unknown';header.append(name,stamp,hop);content.prepend(header);
  const meta=content.querySelector('small');if(meta&&!m.own)meta.textContent=m.status||'';else if(meta?.firstChild?.nodeType===Node.TEXT_NODE)meta.firstChild.remove();content.querySelector('p').title=m.status||'';
  const avatar=document.createElement(m.own?'span':'button');avatar.className='signal-message-avatar';avatar.append(image);if(!m.own){avatar.setAttribute('aria-label','Open contact card for '+data.name);avatar.onclick=openContact;}
  row.append(avatar,content);NightlinkMessageMedia.attach(row,m.text);
 }
 root.NightlinkMessageLayout={main,direct};
})(globalThis);
