/* MRC (Mesh Relay Chat): terminal presentation of the Messages view for channels and direct messages.
   Reads live state (live-ui.js), sends through sendUIMessage (delivery-ui.js) and opens paths with
   showMessageRoute (route-map.js). It never issues radio commands to render. Text is written with
   textContent; message colour codes are rendered by NightlinkAnsiText. */
(function(){
 'use strict';
 if(typeof view!=='function'||!window.NightlinkInterface)return;
 const doc=document,MAX_ROWS=300,LIMIT=133;
 const state={window:null,local:new Map(),sendError:''};
 const terminal=()=>NightlinkInterface.isTerminal();
 const el=(tag,cls,text)=>{const n=doc.createElement(tag);if(cls)n.className=cls;if(text!=null)n.textContent=text;return n;};
 const hhmm=t=>{const d=new Date((t||0)*1000);return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');};
 const stamp=t=>hhmm(t)+' ';
 const nowSeconds=()=>Math.floor(Date.now()/1000);
 const bytes=text=>new TextEncoder().encode(text).length;
 const display=(key,name)=>typeof cardName==='function'&&key?cardName(key,name):name||'Mesh';
 const own=()=>live.identity?.name||'you';
 function unread(id){try{return typeof ensureAttention==='function'?ensureAttention().unread(live.messages,id).length:0;}catch{return 0;}}

 // Windows: 1 (status), radio channels, then direct conversations with history or the open one.
 function windows(){
  const list=[{id:'status',label:'(status)',kind:'status'}];
  for(const c of live.channels)list.push({id:conversationId({kind:'channel',...c}),label:'#'+c.name,kind:'channel',target:{kind:'channel',...c}});
  const seen=new Set();
  const addDirect=(key,name)=>{const id='direct:'+key;if(seen.has(id))return;seen.add(id);list.push({id,label:'='+display(key,name),kind:'direct',target:{kind:'direct',key,name}});};
  if(live.selected?.kind==='direct')addDirect(live.selected.key,live.selected.name);
  for(const m of live.messages)if(m.target?.kind==='direct'&&live.contacts.some(c=>c.key===m.target.key))addDirect(m.target.key,live.contacts.find(c=>c.key===m.target.key).name);
  return list;
 }
 function activeWindow(list){
  if(state.window==='status')return list[0];
  const id=live.selected?conversationId(live.selected):null;
  return list.find(w=>w.id===id)||list[0];
 }
 function switchTo(w){
  if(!w)return;
  if(w.kind==='status'){state.window='status';render();}
  else{state.window=null;selectConversation(w.target);}
  doc.querySelector('#mrc-input')?.focus();
 }
 function localLine(id,text,cls='mrc-notice'){const list=state.local.get(id)||[];list.push({t:nowSeconds(),text,cls});list.splice(0,list.length-50);state.local.set(id,list);}

 function deliveryClass(m){if(!m.own)return 'mrc-recv';const s=String(m.status||'');if(/fail|unconfirmed|error|not /i.test(s))return 'mrc-bad';if(m.phase==='acknowledged'||m.phase==='broadcast'||/deliver|acknowledg|heard|confirm|accepted|sent/i.test(s))return 'mrc-ok';return 'mrc-pending';}
 function deliveryText(m){
  if(m.own)return m.status||'Unconfirmed';
  const parts=[];if(m.pathLength!=null&&window.MeshlineRoutes)parts.push(MeshlineRoutes.hopSummary(m.pathLength));if(m.snr!=null)parts.push('SNR '+m.snr);
  return parts.join(' · ');
 }
 function nick(name,cls){const s=el('span','mrc-nick-wrap');s.append('<',el('span','mrc-nick '+cls,name),'> ');return s;}
 function messageLine(m){
  const line=el('div','mrc-line'+(m.own?' mrc-own':''));line.dataset.messageId=m.id;
  line.append(el('span','mrc-time',stamp(m.timestamp)));
  const body=el('span','mrc-text'),name=m.own?own():(m.sender||m.target?.name||'Mesh'),text=String(m.text??'');
  if(text.startsWith('* '+name+' ')){body.classList.add('mrc-action');body.textContent=' '+text;}
  else{
   if(m.own)line.append(el('span','mrc-own-mark','>>> '));
   line.append(nick(name,m.own?'mrc-nick-own':'mrc-nick-peer'));
   if(window.NightlinkAnsiText?.hasCodes(text))NightlinkAnsiText.render(body,text);else body.textContent=text;
  }
  line.append(body);
  const frag=doc.createDocumentFragment();frag.append(line);
  const detail=deliveryText(m);
  if(detail){
   const row=el('div','mrc-line mrc-delivery-row');row.append(el('span','mrc-time',stamp(m.timestamp)));
   const b=el('button','mrc-delivery '+deliveryClass(m),'└─ '+(m.own&&m.phase!=='acknowledged'&&deliveryClass(m)==='mrc-pending'?'… ':deliveryClass(m)==='mrc-ok'&&m.own?'✓ ':'')+detail);
   b.type='button';b.setAttribute('aria-label','View message path on map: '+detail);b.title='View message path on map';
   b.onclick=()=>{if(typeof showMessageRoute==='function')showMessageRoute(m);};
   row.append(b);frag.append(row);
  }
  return frag;
 }
 function statusLines(log){
  const header=[[nowSeconds(),'-!- MRC: '+(live.sync==='ready'?'connected to mesh via '+(live.identity?.name||'radio')+' ('+(typeof ble==='object'&&ble.kind==='usb'?'USB':'BLE')+')':live.identity?'offline · showing local history for '+live.identity.name:'no radio connected'),'mrc-info']];
  // Adverts from contact data: name, key prefix and route as stored by the radio. No timeline is inferred beyond lastAdvert.
  const since=nowSeconds()-86400;
  const adverts=live.contacts.filter(c=>Number.isFinite(c.lastAdvert)&&c.lastAdvert>=since).sort((a,b)=>a.lastAdvert-b.lastAdvert).slice(-60);
  for(const [t,text,cls] of header){const line=el('div','mrc-line');line.append(el('span','mrc-time',stamp(t)),el('span',cls,text));log.append(line);}
  for(const c of adverts){
   const line=el('div','mrc-line mrc-advert');line.append(el('span','mrc-time',stamp(c.lastAdvert)),el('span','mrc-info','-!- '));
   const hops=c.pathLength==null||c.pathLength===255?'flood':window.MeshlineRoutes?MeshlineRoutes.contactRoute(c.pathLength):String(c.pathLength);
   line.append(el('span',c.type===2?'mrc-nick-repeater':'mrc-nick-peer',display(c.key,c.name)),el('span','mrc-dim',' ['+c.key.slice(0,8)+'@'+hops+']'),' has joined');
   if(c.snr!=null)line.append(el('span','mrc-dim',' (advert, SNR '+c.snr+')'));
   log.append(line);
  }
  if(!adverts.length){const line=el('div','mrc-line');line.append(el('span','mrc-time',stamp(nowSeconds())),el('span','mrc-dim','-!- No adverts heard in the last 24 hours.'));log.append(line);}
 }
 function nodeBar(snr){if(snr==null)return ['','mrc-dim'];return snr>=10?['▆','mrc-ok']:snr>=5?['▅','mrc-ok']:snr>=0?['▃','mrc-pending']:['▁','mrc-bad'];}
 function nodes(){
  const box=el('div','mrc-nodes');box.setAttribute('role','complementary');box.setAttribute('aria-label','Nodes');
  const head=el('div','mrc-pane-title');head.append(el('strong',null,'nodes'),' ',el('span','mrc-count',String(live.contacts.length)),el('span','mrc-dim',' snr'));box.append(head);
  const list=el('ul','mrc-node-list');
  if(live.identity){const li=el('li','mrc-node');li.append(el('span','mrc-nick-own','@'+own()),el('span','mrc-dim','you'));list.append(li);}
  const sorted=live.contacts.slice().sort((a,b)=>(b.type===2)-(a.type===2)||(b.snr??-99)-(a.snr??-99));
  for(const c of sorted.slice(0,40)){
   const li=el('li','mrc-node');const [bar,cls]=nodeBar(c.snr);
   li.append(el('span',c.type===2?'mrc-nick-repeater':'mrc-node-name',(c.type===2?'+':' ')+display(c.key,c.name)));
   const sig=el('span','mrc-node-snr '+cls);sig.append(el('span','mrc-bar',bar),' '+(c.snr==null?'—':String(Math.round(c.snr))));li.append(sig);list.append(li);
  }
  if(sorted.length>40)list.append(el('li','mrc-dim',(sorted.length-40)+' more…'));
  if(!sorted.length)list.append(el('li','mrc-dim','no contacts loaded'));
  box.append(list,el('p','mrc-dim mrc-legend','@ you  + repeater'));
  return box;
 }
 function rfLabel(){try{const s=window.NightlinkPropagationUI?.monitor?.summary?.();if(!s||s.state==='unavailable'||s.state==='disabled')return null;return {text:String(s.label||s.state).toUpperCase(),cls:s.state==='normal'?'mrc-ok':s.state==='insufficient-data'?'mrc-info':'mrc-pending'};}catch{return null;}}

 function render(){
  const host=doc.querySelector('#alternate');
  if(!host)return;
  const on=terminal()&&current==='Messages';
  host.classList.toggle('mrc-active',on);
  doc.body.classList.toggle('term-mrc',on);
  let root=doc.querySelector('#mrc');
  if(!on){root?.remove();return;}
  const focused=doc.activeElement===state.form?.querySelector('#mrc-input'),log=doc.querySelector('#mrc-log'),atEnd=!log||log.scrollHeight-log.scrollTop-log.clientHeight<24,keepTop=log?.scrollTop;
  const list=windows(),win=activeWindow(list),index=list.indexOf(win)+1;
  if(!root){root=el('section');root.id='mrc';root.className='mrc';root.setAttribute('aria-label','Mesh Relay Chat');}
  root.replaceChildren();
  // Topic bar
  const topic=el('div','mrc-topic');topic.append(el('strong',null,'MRC'),el('span','mrc-topic-dim',' Mesh Relay Chat'),' │ ');
  const target=win.target;
  if(win.kind==='status')topic.append(el('strong',null,'(status)'),': '+(live.identity?live.identity.name+' · '+live.channels.length+' channels · '+live.contacts.length+' contacts':'connect a radio to load channels'));
  else{topic.append(el('strong',null,win.label),': '+(target.kind==='channel'?'channel slot '+target.slot:'direct message'));if(live.identity?.frequency)topic.append(' │ '+live.identity.frequency.toFixed(3)+' MHz');}
  root.append(topic);
  // Window list
  const body=el('div','mrc-body'),side=el('div','mrc-windows');side.setAttribute('role','navigation');side.setAttribute('aria-label','Windows');
  side.append(el('div','mrc-pane-title','windows'));
  const ol=el('ol','mrc-window-list');
  list.forEach((w,i)=>{const li=el('li'),b=el('button','mrc-window'+(w===win?' active':''));b.type='button';b.dataset.mrcWindow=w.id;const n=w.kind==='status'?0:unread(w.id);
   b.append(el('span','mrc-window-num',String(i+1)),' ',el('span','mrc-window-name '+(w.kind==='direct'?'mrc-dm':''),w.label));if(n)b.append(el('span','mrc-unread',String(n)));
   if(w===win)b.setAttribute('aria-current','true');b.setAttribute('aria-label',(i+1)+' '+w.label+(n?', '+n+' unread':''));b.onclick=()=>switchTo(w);li.append(b);ol.append(li);});
  side.append(ol,el('p','mrc-dim mrc-legend','alt+1..9 switch'),el('p','mrc-dim mrc-legend','/help for commands'));
  // Scrollback
  const scroll=el('div','mrc-log');scroll.id='mrc-log';scroll.setAttribute('role','log');scroll.setAttribute('aria-label','Scrollback '+win.label);scroll.tabIndex=0;
  if(win.kind==='status')statusLines(scroll);
  else{
   const rows=live.messages.filter(m=>m.conversation===win.id).slice(-MAX_ROWS);
   if(!rows.length){const line=el('div','mrc-line');line.append(el('span','mrc-time',stamp(nowSeconds())),el('span','mrc-dim','-!- No messages in '+win.label+' yet.'));scroll.append(line);}
   let day='';
   for(const m of rows){const d=new Date(m.timestamp*1000).toDateString();if(day&&d!==day){const line=el('div','mrc-line');line.append(el('span','mrc-time',stamp(m.timestamp)),el('span','mrc-dim','-!- Day changed to '+d));scroll.append(line);}day=d;scroll.append(messageLine(m));}
  }
  for(const l of state.local.get(win.id)||[]){const line=el('div','mrc-line');line.append(el('span','mrc-time',stamp(l.t)),el('span',l.cls,l.text));scroll.append(line);}
  body.append(side,scroll,nodes());root.append(body);
  // Status bar
  const status=el('div','mrc-statusbar');status.setAttribute('role','status');
  const field=(...parts)=>{const s=el('span','mrc-field');s.append('[',...parts,']');status.append(s,' ');};
  field(el('strong',null,hhmm(nowSeconds())));field(el('strong',null,own()));field(String(index)+':',el('strong',null,win.label));
  const act=list.map((w,i)=>w.kind!=='status'&&w!==win&&unread(w.id)?String(i+1):null).filter(Boolean);field('Act: ',el('span','mrc-bar-pending',act.join(',')||'—'));
  const link=live.sync==='ready'?['ok','mrc-bar-ok']:live.sync==='syncing'?['sync','mrc-bar-pending']:['off','mrc-bar-bad'];field((typeof ble==='object'&&ble.kind==='usb'?'USB ':'BLE ')+'',el('span',link[1],link[0]));
  const rf=rfLabel();if(rf)field('RF ',el('span',rf.cls==='mrc-ok'?'mrc-bar-ok':'mrc-bar-pending',rf.text));
  const count=el('strong','mrc-bytes','0');field('bytes ',count,'/'+LIMIT);
  root.append(status);
  // Input line: one persistent form so drafts, focus and the text-art picker survive re-renders.
  if(!state.form){
   const form=el('form','mrc-input-line');form.id='mrc-form';form.autocomplete='off';
   const prompt=el('label','mrc-prompt');prompt.htmlFor='mrc-input';
   const input=el('input');input.id='mrc-input';input.type='text';input.spellcheck=false;
   input.addEventListener('input',()=>updateCount());
   form.append(prompt,input);
   form.onsubmit=e=>{e.preventDefault();const list=windows();submit(input.value,activeWindow(list),input);};
   if(window.NightlinkTextArtUI?.attach)NightlinkTextArtUI.attach(form,input,null);
   state.form=form;
  }
  const form=state.form,field2=form.querySelector('#mrc-input');
  form.querySelector('.mrc-prompt').textContent='['+win.label+'] ';
  field2.setAttribute('aria-label','Message or command for '+win.label);
  const configured=win.kind!=='status'&&(target.kind==='channel'?live.channels.some(c=>c.slot===target.slot&&c.id===target.id):live.contacts.some(c=>c.key===target.key));
  field2.placeholder=win.kind==='status'?'/join #channel · /msg name text · /help':live.sync!=='ready'?'offline · reconnect to send':configured?'':'not configured on this radio';
  state.count=count;updateCount();
  root.append(form);
  if(!root.isConnected)host.prepend(root);
  if(focused&&doc.activeElement!==field2)field2.focus();
  const sl=doc.querySelector('#mrc-log');if(atEnd)sl.scrollTop=sl.scrollHeight;else sl.scrollTop=keepTop;
  markRead(win,sl);
 }
 function updateCount(){const input=state.form?.querySelector('#mrc-input'),count=state.count;if(!input||!count)return;const v=input.value,n=v.startsWith('/')?bytes(commandPayload(v)||''):bytes(v);count.textContent=String(n);count.classList.toggle('mrc-over',n>LIMIT);}
 function markRead(win,log){
  if(win.kind==='status'||typeof ensureAttention!=='function'||doc.hidden)return;
  if(log.scrollHeight-log.scrollTop-log.clientHeight>24)return;
  const last=live.messages.filter(m=>m.conversation===win.id).at(-1);
  if(!last||!unread(win.id))return;
  try{ensureAttention().mark(live.messages,win.id,last.id);}catch{}
  if(typeof refreshUnreadBadges==='function')refreshUnreadBadges();
  queueMicrotask(render);
 }
 // Commands: payload text a command would send (for the byte counter), or null.
 function commandPayload(value){const m=/^\/(\w+)\s*(.*)$/s.exec(value);if(!m)return value;const [,cmd,rest]=m;if(cmd==='me')return '* '+own()+' '+rest;if(cmd==='msg'){const r=resolveContact(rest);return r?r.text:'';}return '';}
 function resolveContact(rest){
  const people=live.contacts.filter(c=>c.type===1),lower=rest.toLowerCase();
  // Longest matching name first, so names with spaces work: /msg Field Ops hello
  const names=people.map(c=>({c,n:display(c.key,c.name)})).concat(people.map(c=>({c,n:c.name}))).filter(x=>x.n).sort((a,b)=>b.n.length-a.n.length);
  for(const {c,n} of names)if(lower.startsWith(n.toLowerCase()+' ')||lower===n.toLowerCase())return {contact:c,text:rest.slice(n.length).trim()};
  const [word,...words]=rest.split(/\s+/),matches=people.filter(c=>c.name.toLowerCase().startsWith(word.toLowerCase())||c.key.startsWith(word.toLowerCase()));
  return matches.length===1?{contact:matches[0],text:words.join(' ')}:null;
 }
 const HELP=['Commands:','/join #channel   switch to a radio channel window','/msg <name> <text>   send a direct message to a saved contact','/query <name>   open a direct message window','/me <text>   send "* '+'<your name> <text>"','/help   show this help','Keys: alt+1..9 switch window · F9 main menu · F1 help'];
 async function submit(value,win,input){
  const text=value.trim();if(!text)return;
  const send=(target,body)=>{if(bytes(body)>LIMIT){localLine(win.id,'-!- Message is '+bytes(body)+' bytes; the limit is '+LIMIT+'.','mrc-error');render();return;}return sendUIMessage({...target},body,()=>{const i=doc.querySelector('#mrc-input');if(i)i.value='';});};
  if(!text.startsWith('/')){
   if(win.kind==='status'){localLine(win.id,'-!- (status) is not a chat window. Use /join #channel or /msg <name> <text>.','mrc-error');input.value='';render();return;}
   await send(win.target,text);render();return;
  }
  const [,cmd,rest='']=/^\/(\w*)\s*(.*)$/s.exec(text)||[];
  input.value='';
  if(cmd==='help'){for(const h of HELP)localLine(win.id,'-!- '+h,'mrc-info');render();return;}
  if(cmd==='join'){const name=rest.trim().replace(/^#/,'').toLowerCase(),c=live.channels.find(c=>c.name.toLowerCase()===name);if(!c){localLine(win.id,'-!- No channel #'+name+' on this radio. Channels are configured on the radio.','mrc-error');render();return;}state.window=null;selectConversation({kind:'channel',...c});return;}
  if(cmd==='msg'||cmd==='query'){const r=resolveContact(rest.trim());if(!r){localLine(win.id,'-!- No unique saved contact matches "'+rest.trim().split(/\s+/)[0]+'".','mrc-error');render();return;}
   const target={kind:'direct',key:r.contact.key,name:r.contact.name};state.window=null;selectConversation(target);
   if(cmd==='msg'&&r.text){await send(target,r.text);render();}return;}
  if(cmd==='me'){if(win.kind==='status'){localLine(win.id,'-!- /me needs a chat window.','mrc-error');render();return;}if(!rest.trim())return;await send(win.target,'* '+own()+' '+rest.trim());render();return;}
  localLine(win.id,'-!- Unknown command /'+cmd+'. Type /help.','mrc-error');render();
 }
 // Alt+1..9 switches windows while MRC is shown.
 doc.addEventListener('keydown',e=>{if(!terminal()||current!=='Messages'||!e.altKey||e.ctrlKey||e.metaKey)return;const n=Number(e.key);if(!(n>=1&&n<=9))return;const list=windows();if(!list[n-1])return;e.preventDefault();switchTo(list[n-1]);});
 const previousRender=renderMessages;renderMessages=function(){previousRender.apply(this,arguments);render();};
 const previousView=view;view=function(){previousView.apply(this,arguments);render();};
 const previousSelect=selectConversation;selectConversation=function(target){state.window=null;return previousSelect.apply(this,arguments);};
 radioSession.addEventListener('contacts',()=>{if(current==='Messages')render();});
 window.addEventListener('nightlink-interface',render);
 window.NightlinkMRC={render,windows,submit:value=>{const list=windows();return submit(value,activeWindow(list),doc.querySelector('#mrc-input')||{value:''});},switchTo:n=>switchTo(windows()[n-1])};
})();
