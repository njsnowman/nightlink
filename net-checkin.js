/* Net check-in: a roll-call helper for scheduled nets on a channel. Start a net, and each person who posts on that
   channel afterwards is marked checked in; you can also mark people by hand. Copy or download the log when done.
   Nothing is transmitted by this tool: "Put call in message box" only fills the box. Opens from Ctrl+P, the Terminal
   More menu and the Cards Tools menu. State survives a restart until the net is ended. */
(function(root){
 'use strict';
 const KEY='nightlink.net-session';
 const norm=s=>String(s??'').trim().toLowerCase();
 const hhmm=t=>{const d=new Date(t*1000);return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');};
 // Match channel messages since the start to roster entries (by contact key when known, else by name).
 // Returns {checked: Map(id -> time), others: Map(name -> time)}; manual marks win and keep their time.
 function tally(session,messages,keyOf){const checked=new Map(),others=new Map();if(!session)return {checked,others};
  for(const [id,t] of Object.entries(session.manual||{}))if(t)checked.set(id,t);
  const byKey=new Map(),byName=new Map();for(const r of session.roster||[]){if(r.key)byKey.set(r.key,r.id);byName.set(norm(r.name),r.id);}
  for(const m of messages||[]){if(m.own||m.kind!=='channel'||m.slot!==session.slot&&m.target?.slot!==session.slot||!(m.timestamp>=session.start))continue;if(session.end&&m.timestamp>session.end)continue;
   const key=keyOf?.(m)||null,id=(key&&byKey.get(key))||byName.get(norm(m.sender));
   if(id){if(!checked.has(id)&&!(id in (session.manual||{})))checked.set(id,m.timestamp);}else if(m.sender&&!others.has(m.sender))others.set(m.sender,m.timestamp);}
  for(const [id,t] of Object.entries(session.manual||{}))if(!t)checked.delete(id);
  return {checked,others};}
 function summary(session,result,now=Date.now()/1000){const roster=session.roster||[],n=roster.filter(r=>result.checked.has(r.id)).length;
  const lines=['Net check-in · #'+session.channel+' · '+new Date(session.start*1000).toLocaleString()+(session.end?' to '+hhmm(session.end):''),
   n+' of '+roster.length+' checked in'+(result.others.size?' · '+result.others.size+' others heard':'')+' · '+Math.max(0,Math.round(((session.end||now)-session.start)/60))+' min',''];
  for(const r of roster)lines.push((result.checked.has(r.id)?'[x] '+hhmm(result.checked.get(r.id)):'[ ]      ')+'  '+r.name);
  if(result.others.size){lines.push('','Others heard:');for(const [name,t] of result.others)lines.push('[+] '+hhmm(t)+'  '+name);}
  return lines.join('\n');}
 function csv(session,result){const q=v=>'"'+String(v??'').replace(/"/g,'""')+'"',rows=[['name','status','time']];
  for(const r of session.roster||[])rows.push([r.name,result.checked.has(r.id)?'checked in':'not heard',result.checked.has(r.id)?new Date(result.checked.get(r.id)*1000).toISOString():'']);
  for(const [name,t] of result.others)rows.push([name,'other',new Date(t*1000).toISOString()]);return rows.map(r=>r.map(q).join(',')).join('\r\n')+'\r\n';}
 const core={KEY,tally,summary,csv};
 if(typeof module==='object'&&module.exports){module.exports=core;return;}
 const doc=root.document;let dialog=null,tick=null;
 const L=()=>{try{return typeof live==='object'?live:null;}catch{return null;}};
 const load=()=>{try{const s=JSON.parse(root.localStorage.getItem(KEY)||'null');return s&&Number.isFinite(s.start)?s:null;}catch{return null;}};
 const save=s=>{try{if(s)root.localStorage.setItem(KEY,JSON.stringify(s));else root.localStorage.removeItem(KEY);}catch{}};
 const keyOf=m=>{try{return typeof messageContact==='function'?messageContact(m)?.key||null:null;}catch{return null;}};
 const name=n=>typeof cardName==='function'?cardName(n.key,n.name):n.name;
 function favs(){try{if(typeof favoriteKeys==='object'&&favoriteKeys)return favoriteKeys;}catch{}try{return new Set(JSON.parse(root.localStorage.getItem('nightlink.favorites')||'[]'));}catch{return new Set();}}
 const el=(tag,cls,text)=>{const e=doc.createElement(tag);if(cls)e.className=cls;if(text!=null)e.textContent=text;return e;};
 const btn=(text,fn,cls)=>{const b=el('button',cls,text);b.type='button';b.onclick=fn;return b;};
 function download(nameText,body,type){const url=URL.createObjectURL(new Blob([body],{type}));const a=el('a');a.href=url;a.download=nameText;doc.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
 function render(){if(!dialog)return;const body=dialog.querySelector('.net-body');body.replaceChildren();const data=L(),s=load();
  if(!s){const channels=data?.channels||[];if(!channels.length){body.append(el('p','net-note','Connect and synchronize a radio to choose a channel.'));return;}
   const ch=el('select');ch.id='net-channel';ch.setAttribute('aria-label','Channel');for(const c of channels){const o=el('option',null,'#'+c.name);o.value=String(c.slot);ch.append(o);}
   if(data.selected?.kind==='channel')ch.value=String(data.selected.slot);
   const who=el('select');who.id='net-roster';who.setAttribute('aria-label','Roll call');for(const [v,t] of [['favorites','Favourite contacts (★)'],['all','All saved contacts'],['open','Anyone who checks in']]){const o=el('option',null,t);o.value=v;who.append(o);}
   const l1=el('label','net-field','Channel');l1.append(ch);const l2=el('label','net-field','Roll call');l2.append(who);
   body.append(el('p','net-note','Everyone who posts on the channel after you start is marked as checked in. You can also mark people by hand. Nothing is sent by this tool.'),l1,l2,
    btn('Start net',()=>{const c=channels.find(x=>String(x.slot)===ch.value),fav=favs();const list=(data.contacts||[]).filter(n=>who.value==='all'||(who.value==='favorites'&&fav.has(n.key)));
     save({channel:c.name,slot:c.slot,start:Math.floor(Date.now()/1000),roster:who.value==='open'?[]:list.map(n=>({id:n.key,key:n.key,name:name(n)})),manual:{}});render();},'net-primary'));return;}
  const result=tally(s,data?.messages,keyOf),done=s.roster.filter(r=>result.checked.has(r.id)).length;
  const head=el('p','net-status');head.setAttribute('role','status');head.setAttribute('aria-live','polite');
  head.textContent='#'+s.channel+' · started '+hhmm(s.start)+(s.end?' · ended '+hhmm(s.end):'')+' · '+(s.roster.length?done+' of '+s.roster.length+' checked in':result.others.size+' checked in');
  const list=el('ul','net-list');list.setAttribute('aria-label','Roll call');
  for(const r of s.roster){const li=el('li','net-row'+(result.checked.has(r.id)?' net-in':''));const t=result.checked.get(r.id);
   li.append(el('span','net-mark',t?'✓':'·'),el('span','net-name',r.name),el('span','net-time',t?hhmm(t):'waiting'));
   if(!s.end)li.append(btn(t?'Undo':'Mark',()=>{const cur=load();cur.manual={...cur.manual,[r.id]:t?0:Math.floor(Date.now()/1000)};save(cur);render();},'net-toggle'));list.append(li);}
  for(const [n,t] of result.others){const li=el('li','net-row net-other');li.append(el('span','net-mark','+'),el('span','net-name',n),el('span','net-time',hhmm(t)));list.append(li);}
  if(!list.children.length)list.append(el('li','net-row net-empty','Waiting for the first check-in on #'+s.channel+'.'));
  const text=summary(s,result),actions=el('div','net-actions');
  if(!s.end){actions.append(btn('Put call in message box',()=>{const box=doc.querySelector('#mrc-input')||doc.querySelector('#message-input');if(!box)return;box.value='Net check-in open on #'+s.channel+'. Please reply with your name or call sign.';box.dispatchEvent(new Event('input',{bubbles:true}));dialog.close();box.focus();}),
   btn('End net',()=>{const cur=load();cur.end=Math.floor(Date.now()/1000);save(cur);render();}));}
  actions.append(btn('Copy log',async()=>{try{await root.navigator.clipboard.writeText(text);if(typeof toast==='function')toast('Net log copied');}catch{}}),
   btn('Download CSV',()=>download('net-'+s.channel+'-'+new Date(s.start*1000).toISOString().slice(0,10)+'.csv',csv(s,result),'text/csv')));
  if(s.end)actions.append(btn('New net',()=>{save(null);render();},'net-primary'));
  body.append(head,list,actions);}
 function open(){if(!dialog){dialog=el('dialog','feedback-dialog net-dialog');dialog.id='net-dialog';dialog.setAttribute('aria-labelledby','net-title');const h=el('h2',null,'Net check-in');h.id='net-title';
   const close=btn('Close',()=>dialog.close(),'net-close');dialog.append(h,el('div','net-body'),close);dialog.addEventListener('close',()=>{clearInterval(tick);tick=null;});doc.body.append(dialog);}
  render();if(!dialog.open)dialog.showModal();clearInterval(tick);tick=setInterval(render,5000);}
 root.NightlinkNet={...core,open,state:load};
 doc.addEventListener('DOMContentLoaded',()=>{
  if(Array.isArray(root.NightlinkMoreMenu)){const m=root.NightlinkMoreMenu,i=m.findIndex(([l])=>l==='Setup guide');m.splice(i<0?m.length:i,0,['Net check-in','N',open]);}
  const tools=doc.querySelector('#workspace-sidebar nav details.sidebar-group');if(tools&&!tools.querySelector('#open-net-checkin')){const b=btn('Net check-in',open,'nl-menu-action');b.id='open-net-checkin';tools.append(b);}
  try{if(typeof radioSession==='object')radioSession.addEventListener('message',()=>{if(dialog?.open)setTimeout(render,50);});}catch{}});
})(typeof window==='object'?window:globalThis);
