/* Cards interface design pass (0.8.30, owner request). Presentation only: classes, small icons and derived labels on
   top of the existing pages. Nothing here sends to the radio or changes stored data. Terminal is unaffected. */
(function(root){
 'use strict';
 // Stable 0..7 colour slot from a name, matching the idea of terminal nick colours.
 function hue(name){let h=0;for(const ch of String(name||''))h=(h*31+ch.codePointAt(0))>>>0;return h%8;}
 const snrWord=snr=>snr==null||!Number.isFinite(Number(snr))?null:snr>=5?['good','ok']:snr>=0?['fair','warn']:['weak','bad'];
 // Activity entries are "HH:MM:SS · text"; classify for icons and filters.
 function classify(text){const t=String(text).toLowerCase();
  if(/fail|error|lost|denied|unavailable|could not|timed out/.test(t))return 'error';
  if(/connect|disconnect|bluetooth|\busb\b|serial|reconnect|\blink\b/.test(t))return 'link';
  if(/sync|channel|contact|advert|identity|radio/.test(t))return 'radio';
  if(/message|sent|received|ack|delivered|reply|reaction/.test(t))return 'message';
  return 'info';}
 function splitEntry(text){const m=/^(\d{1,2}:\d{2}(?::\d{2})?(?:\s?[AP]M)?)\s·\s(.*)$/i.exec(String(text));return m?{time:m[1],text:m[2]}:{time:'',text:String(text)};}
 // Messages per hour for the last `hours` hours, oldest first.
 function hourly(messages,now=Date.now()/1000,hours=12){const out=Array(hours).fill(0);for(const m of messages||[]){const ago=(now-(m.heardAt||m.timestamp||0))/3600;if(ago>=0&&ago<hours)out[hours-1-Math.floor(ago)]++;}return out;}
 const core={hue,snrWord,classify,splitEntry,hourly};
 if(typeof module==='object'&&module.exports){module.exports=core;return;}
 const doc=root.document,SVG='http://www.w3.org/2000/svg';
 const cards=()=>doc.documentElement.dataset.interface==='cards';
 const el=(tag,cls,text)=>{const e=doc.createElement(tag);if(cls)e.className=cls;if(text!=null)e.textContent=text;return e;};
 function icon(paths){const s=doc.createElementNS(SVG,'svg');s.setAttribute('viewBox','0 0 20 20');s.setAttribute('aria-hidden','true');for(const d of paths){const p=doc.createElementNS(SVG,'path');p.setAttribute('d',d);s.append(p);}return s;}
 const ICONS={book:['M5 3h9a2 2 0 0 1 2 2v12H6a2 2 0 0 1-2-2V4a1 1 0 0 1 1-1z','M7 7h6M7 10h6'],ops:['M3 16l4-9 3 5 2-3 5 7z','M13 4h4v4'],
  link:['M8 12l4-4','M6 14a3 3 0 0 1 0-4l2-2','M14 6a3 3 0 0 1 0 4l-2 2'],radio:['M10 17V9','M7 17h6','M6 6a5 5 0 0 1 8 0','M4 4a8 8 0 0 1 12 0'],
  message:['M3 4h14v9H8l-4 3v-3H3z'],error:['M10 3l8 14H2z','M10 8v4M10 14v.5'],info:['M10 3a7 7 0 1 1 0 14 7 7 0 0 1 0-14z','M10 9v5M10 6v.5']};
 // 3. Sidebar: Contact Book and Operations get icons and the same label structure as the other items.
 function sidebar(){for(const [view,key] of [['Contact Book','book'],['Operations','ops']]){const b=doc.querySelector(`nav > button[data-view="${view}"]`);if(!b||b.dataset.polished)continue;
  b.dataset.polished='1';const label=el('span',null,b.textContent.trim());b.replaceChildren(icon(ICONS[key]),label);b.setAttribute('aria-label',view);b.title=view;}}
 // 2. Settings: checkbox rows become a two-column toggle layout.
 function settings(){for(const l of doc.querySelectorAll('.settings-grid label.interface-setting, .settings-grid label.accent-setting')){if(l.dataset.polished)continue;const box=l.querySelector(':scope > input[type=checkbox]');if(!box)continue;
  l.dataset.polished='1';l.classList.add('setting-toggle');const text=[...l.childNodes].filter(n=>n.nodeType===3&&n.textContent.trim());if(text.length){const t=el('span','setting-title',text.map(n=>n.textContent.trim()).join(' '));text.forEach(n=>n.remove());box.after(t);}}}
 // 4 and 8. Activity: timeline with icons, time column and filter chips.
 let filter='all';
 function activityPage(){const list=doc.querySelector('#alternate > .panel.activity-host')||doc.querySelector('#alternate .activity-row')?.closest('.panel')||doc.querySelector('#alternate > .panel');
  if(typeof activity==='undefined'||!list)return;list.classList.add('activity-host');
  const wrap=el('div','activity-timeline');wrap.id='activity-timeline';const chips=el('div','activity-chips');chips.setAttribute('role','group');chips.setAttribute('aria-label','Filter activity');
  const kinds=[['all','All'],['link','Connection'],['radio','Radio'],['message','Messages'],['error','Problems']];
  for(const [k,label] of kinds){const b=el('button','activity-chip'+(filter===k?' on':''),label);b.type='button';b.setAttribute('aria-pressed',String(filter===k));b.onclick=()=>{filter=k;activityPage();};chips.append(b);}
  const ul=el('ol','activity-list');let shown=0;
  for(const entry of activity){const {time,text}=splitEntry(entry),kind=classify(text);if(filter!=='all'&&kind!==filter)continue;shown++;
   const li=el('li','activity-item activity-'+kind);const ic=el('span','activity-icon');ic.append(icon(ICONS[kind]));li.append(ic,el('time','activity-time',time||'—'),el('span','activity-text',text));ul.append(li);}
  if(!shown){const e=el('li','activity-empty',filter==='all'?'No activity yet. Connect a radio to start the log.':'No '+kinds.find(k=>k[0]===filter)[1].toLowerCase()+' events in this session.');ul.append(e);}
  const head=el('div','activity-head');head.append(el('h2',null,'Today'),el('small',null,activity.length+' event'+(activity.length===1?'':'s')+' this session'));
  wrap.append(head,chips,ul);list.replaceChildren(wrap);}
 // 6 and 11. Messages: coloured avatars, favourite badge, grouped consecutive messages from one sender.
 function messages(){const log=doc.querySelector('#chat-log');if(!log)return;let prev=null;
  const rows=[...log.querySelectorAll('.message')];
  for(const row of rows){const name=row.querySelector('.sender span')?.textContent||'',av=row.querySelector('.avatar');
   if(av){for(let i=0;i<8;i++)av.classList.remove('av-'+i);av.classList.add('av-'+hue(row.classList.contains('own')?'you':name));
    av.classList.toggle('av-fav',!!row.querySelector('.message-fav'));}
   const t=Number(row.dataset.messageTime)||0;const same=prev&&prev.name===name&&prev.own===row.classList.contains('own');row.classList.toggle('message-grouped',!!same);
   prev={name,own:row.classList.contains('own')};}}
 // 7. Stat tiles: SNR quality word and a 12-hour message sparkline.
 function stats(){const tiles=doc.querySelectorAll('.stats article');if(tiles.length<4||typeof live!=='object')return;
  const snr=live.stats?.snr,w=snrWord(snr),sig=tiles[2];sig.querySelector('.stat-quality')?.remove();if(w){const q=el('span','stat-quality stat-'+w[1],w[0]);sig.querySelector('strong')?.append(q);}
  const msg=tiles[1];msg.querySelector('.stat-spark')?.remove();const h=hourly(live.messages),max=Math.max(1,...h),s=doc.createElementNS(SVG,'svg');s.setAttribute('class','stat-spark');s.setAttribute('viewBox','0 0 48 14');s.setAttribute('role','img');
  s.setAttribute('aria-label','Messages per hour, last 12 hours: '+h.join(', '));h.forEach((v,i)=>{const r=doc.createElementNS(SVG,'rect');const height=v?Math.max(1.5,12*v/max):0.8;r.setAttribute('x',String(i*4));r.setAttribute('y',String(14-height));r.setAttribute('width','3');r.setAttribute('height',String(height));r.setAttribute('rx','0.6');s.append(r);});msg.append(s);}
 // 5. Overview map: a clear message instead of a blank frame when the internet is not available.
 function mapState(){const pane=doc.querySelector('.overview-corescope');if(!pane)return;const net=doc.querySelector('#internet-status')?.dataset.state;const offline=net==='offline'||net==='unavailable';
  let note=pane.querySelector('.map-offline');if(!offline){note?.remove();return;}if(note)return;
  note=el('div','map-offline');note.setAttribute('role','status');note.append(el('strong',null,'Live map needs the internet'),el('span',null,'CoreScope and MeshMapper load from the web. Your radio and chat keep working offline.'));
  const b=el('button',null,'Use Radio map');b.type='button';b.onclick=()=>{[...pane.querySelectorAll('button')].find(x=>/radio map/i.test(x.textContent))?.click();};note.append(b);pane.append(note);}
 // 12. Empty states: icon and a next step.
 function empty(){const p=doc.querySelector('#chat-log .empty-chat');if(p&&!p.dataset.polished){p.dataset.polished='1';p.classList.add('empty-state');const ic=el('span','empty-icon');ic.append(icon(ICONS.message));p.prepend(ic);
  if(typeof live==='object'&&live.sync!=='ready'){const b=el('button','primary','Connect radio');b.type='button';b.onclick=()=>{if(typeof showBluetooth==='function')showBluetooth();};p.append(b);}}}
 function all(){if(!cards())return;try{sidebar();settings();messages();stats();mapState();empty();}catch(e){console.warn('cards polish',e);}}
 root.NightlinkCardsPolish={...core,refresh:all};
 doc.addEventListener('DOMContentLoaded',()=>{
  const wrap=(name,after)=>{if(typeof root[name]!=='function'&&typeof globalThis[name]!=='function')return;const prev=globalThis[name];globalThis[name]=function(){const r=prev.apply(this,arguments);if(cards())try{after(...arguments);}catch(e){console.warn(e);}return r;};};
  wrap('view',name=>{all();if(name==='Activity')activityPage();});wrap('renderMessages',()=>{messages();empty();});wrap('renderStats',stats);
  if(typeof logLive==='function'){const prev=logLive;globalThis.logLive=function(){const r=prev.apply(this,arguments);if(cards()&&typeof current==='string'&&current==='Activity')activityPage();return r;};}
  const net=doc.querySelector('#internet-status');if(net)new MutationObserver(mapState).observe(net,{attributes:true,attributeFilter:['data-state']});
  root.addEventListener('nightlink-interface',all);all();});
})(typeof window==='object'?window:globalThis);
