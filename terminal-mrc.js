/* MRC (Mesh Relay Chat): terminal presentation of the Messages view for channels and direct messages.
   Reads live state (live-ui.js), sends through sendUIMessage (delivery-ui.js) and opens paths with
   showMessageRoute (route-map.js). It never issues radio commands to render. Text is written with
   textContent; message colour codes are rendered by NightlinkAnsiText. */
(function(){
 'use strict';
 if(typeof view!=='function'||!window.NightlinkInterface)return;
 const doc=document,MAX_ROWS=300,LIMIT=133;
 const state={window:null,local:new Map(),sendError:'',replyWindow:null,readingOwner:null,readingWin:null,readSessions:new Map(),restoring:false,find:{open:false,query:'',activeId:null}};
 const terminal=()=>NightlinkInterface.isTerminal();
 const el=(tag,cls,text)=>{const n=doc.createElement(tag);if(cls)n.className=cls;if(text!=null)n.textContent=text;return n;};
 const draftStore=()=>typeof drafts!=='undefined'?drafts:(state.drafts||(state.drafts=new NightlinkDrafts(localStorage,()=>toast('Draft storage unavailable. Keep this window open or copy your text.'))));
 function syncCardDraft(value){if(typeof composerDraftOwner!=='undefined'&&composerDraftOwner===state.draftOwner&&composerDraftId===state.draftId){const input=doc.querySelector('#message-input');if(input){input.value=value;if(typeof updateByteCount==='function')updateByteCount();}}}
 function saveTerminalDraft(){const input=state.form?.querySelector('#mrc-input');if(!input||!state.draftId||input.value===state.lastSavedDraft)return;draftStore().set(state.draftOwner,state.draftId,input.value);state.lastSavedDraft=input.value;syncCardDraft(input.value);}
 function restoreTerminalDraft(win){const owner=live.identity?.key,id=win.kind==='status'?null:win.id,input=state.form.querySelector('#mrc-input');if(state.draftOwner!==owner||state.draftId!==id){saveTerminalDraft();state.draftOwner=owner;state.draftId=id;state.lastSavedDraft=id?draftStore().get(owner,id):'';input.value=state.lastSavedDraft;}else if(id){const saved=draftStore().get(owner,id);if(saved!==state.lastSavedDraft&&input.value===state.lastSavedDraft){input.value=saved;state.lastSavedDraft=saved;}}}
 const findScope=win=>(live.identity?.key||'local')+'|'+win.id;
 function findText(m){const text=String(m.text||'');return window.NightlinkAnsiText?.strip?NightlinkAnsiText.strip(text):text;}
 function findMatches(win){const query=state.find.query.trim().toLocaleLowerCase();return query?live.messages.filter(m=>m.conversation===win.id&&findText(m).toLocaleLowerCase().includes(query)):[];}
 function refreshFind(win){if(!state.find.form)return;const matches=findMatches(win),index=matches.findIndex(m=>m.id===state.find.activeId);state.find.status.textContent=!state.find.query.trim()?'Find text':!matches.length?'No matches':index<0?matches.length+' matches':(index+1)+' / '+matches.length;state.find.previous.disabled=state.find.next.disabled=!matches.length;}
 function navigateFind(direction=0){if(!state.find.open)return;const win=activeWindow(windows()),matches=findMatches(win);if(!matches.length){state.find.activeId=null;render();return;}const index=matches.findIndex(m=>m.id===state.find.activeId),next=direction===0?(index>=0?index:0):index<0?(direction>0?0:matches.length-1):(index+direction+matches.length)%matches.length;state.find.activeId=matches[next].id;jumpMessage(state.find.activeId,{select:false,focus:false});}
 function closeFind(){clearTimeout(state.find.timer);state.find.open=false;state.find.query='';state.find.activeId=null;if(state.find.input)state.find.input.value='';render();const target=state.find.returnTo==='composer'?state.form?.querySelector('#mrc-input'):doc.querySelector('#mrc-log');target?.focus({preventScroll:true});}
 function openFind(){const win=activeWindow(windows());if(state.find.scope!==findScope(win)){state.find.query='';state.find.activeId=null;if(state.find.input)state.find.input.value='';}state.find.scope=findScope(win);if(!state.find.open)state.find.returnTo=doc.activeElement?.id==='mrc-input'?'composer':'log';state.find.open=true;state.selectedMessage=null;render();state.find.input.focus();state.find.input.select();}
 function findForm(){if(state.find.form)return state.find.form;const form=el('form','mrc-find'),label=el('label',null,'Find'),input=el('input'),status=el('span','mrc-find-status'),previous=el('button',null,'↑'),next=el('button',null,'↓'),close=el('button',null,'×');input.type='search';input.id='mrc-find-input';input.placeholder='Find in this chat';input.setAttribute('aria-label','Search current chat');label.htmlFor=input.id;status.setAttribute('role','status');status.setAttribute('aria-live','polite');for(const [button,name,action]of [[previous,'Previous chat match',()=>navigateFind(-1)],[next,'Next chat match',()=>navigateFind(1)],[close,'Close chat search',closeFind]]){button.type='button';button.setAttribute('aria-label',name);button.onclick=action;}input.oninput=()=>{state.find.query=input.value;state.find.activeId=null;clearTimeout(state.find.timer);state.find.timer=setTimeout(()=>navigateFind(0),120);};input.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();clearTimeout(state.find.timer);navigateFind(e.shiftKey?-1:1);}};form.onsubmit=e=>e.preventDefault();form.append(label,input,status,previous,next,close);Object.assign(state.find,{form,input,status,previous,next});return form;}
 function readingSession(id){
  const owner=live.identity?.key||'local';if(state.readingOwner!==owner){state.readSessions.clear();state.readingOwner=owner;state.readingWin=null;}
  if(!state.readSessions.has(id)){let position;try{position=ensureAttention().position(id);}catch{}state.readSessions.set(id,{position:position||{bottom:true,manual:false},boundary:position?.boundary||null,focus:null});}
  return state.readSessions.get(id);
 }
 function latestVisible(log,id){const last=live.messages.filter(m=>m.conversation===id).at(-1);return log.scrollHeight-log.scrollTop-log.clientHeight<24&&(!last||log.querySelector('[data-message-id="'+CSS.escape(last.id)+'"]'));}
 function captureReading(log=doc.querySelector('#mrc-log'),persist=true,beforeRender=false){
  if(!log?.isConnected||!log.clientHeight||state.restoring||!state.readingWin||state.readingOwner!==(live.identity?.key||'local'))return;
  const session=readingSession(state.readingWin),rect=log.getBoundingClientRect(),anchor=[...log.querySelectorAll('[data-message-id]')].find(row=>row.getBoundingClientRect().bottom>rect.top+1),bottom=beforeRender?log.scrollHeight-log.scrollTop-log.clientHeight<24&&log.dataset.tailWindow==='true'&&((!doc.hidden&&doc.hasFocus())||!!latestVisible(log,state.readingWin)):!!latestVisible(log,state.readingWin);
  session.position={anchor:anchor?.dataset.messageId,offset:anchor?anchor.getBoundingClientRect().top-rect.top:0,bottom,manual:!bottom,boundary:session.boundary};
  if(persist)try{ensureAttention().position(state.readingWin,session.position);}catch{}
 }
 function updateJump(log,win){const button=log.parentElement?.querySelector('.mrc-jump-latest');if(!button)return;const count=unread(win.id);button.hidden=!!latestVisible(log,win.id);button.textContent='Jump to latest'+(count?' · '+count+' new':'')+' ↓';}
 function jumpLatest(win){const session=readingSession(win.id);session.focus=null;session.boundary=null;session.position={bottom:true,manual:false};try{ensureAttention().position(win.id,session.position);}catch{}state.restoring=true;render();state.restoring=false;}
 // This panel stays connected during message renders so incoming chat cannot reload the live map.
 function mapPanel(){
  if(state.mapPanel)return state.mapPanel;
  const panel=el('details','mrc-map');panel.open=!matchMedia('(max-width:1100px)').matches;
  const title=el('summary','mrc-map-title','OKI MESH · CORESCOPE'),holder=el('div','mrc-map-holder'),status=el('p','mrc-map-status','External map');
  const accent=el('span',null,'░▒▓ ');accent.setAttribute('aria-hidden','true');title.prepend(accent);
  status.setAttribute('role','status');panel.append(title,holder,status);
  Object.assign(state,{mapPanel:panel,mapHolder:holder,mapStatus:status});panel.addEventListener('toggle',syncMap);
  return panel;
 }
 function stopMap(){clearTimeout(state.mapTimer);state.mapTimer=null;state.mapFrame?.remove();state.mapFrame=null;state.mapURL='';state.mapHolder?.classList.remove('ready');}
 function syncMap(){
  if(!state.mapPanel?.isConnected||!terminal()||current!=='Messages'){stopMap();return;}
  let reason='';
  if(!state.mapPanel.open)reason='Map collapsed';
  else if(window.NightlinkMapProviders?.enabled('corescope')===false)reason='CoreScope hidden in Settings';
  else if(!navigator.onLine)reason='Offline · external map unavailable';
  else if(!window.nightlinkCoreScope?.chatMapSupported)reason='Map-only view requires the desktop app';
  if(reason){stopMap();state.mapStatus.textContent=reason;return;}
  const viewport=NightlinkCoreScopeLocation.viewport();
  const params=new URLSearchParams({lat:viewport.lat.toFixed(6),lon:viewport.lon.toFixed(6),zoom:'7',nightlinkChatMap:'1'});
  const url='https://map.okimesh.org/#/live?'+params;
  if(state.mapFrame&&state.mapURL===url)return;
  stopMap();const frame=el('iframe');frame.title='OKI Mesh CoreScope live map';frame.setAttribute('sandbox','allow-scripts allow-same-origin');frame.referrerPolicy='no-referrer';
  frame.setAttribute('aria-hidden','true');frame.tabIndex=-1;
  state.mapStatus.textContent='Opening external live map…';state.mapURL=url;state.mapFrame=frame;
  frame.onerror=()=>{if(state.mapFrame===frame){stopMap();state.mapStatus.textContent='CoreScope unavailable · collapse and reopen to retry';}};
  frame.src=url;state.mapHolder.append(frame);
  state.mapTimer=setTimeout(()=>{if(state.mapFrame===frame){stopMap();state.mapStatus.textContent='CoreScope unavailable · collapse and reopen to retry';}},120000);
 }
 window.addEventListener('message',event=>{
  if(event.origin!=='https://map.okimesh.org'||event.source!==state.mapFrame?.contentWindow||event.data?.type!=='nightlink-corescope-map-ready')return;
  clearTimeout(state.mapTimer);state.mapHolder.classList.add('ready');state.mapFrame.removeAttribute('aria-hidden');state.mapFrame.tabIndex=0;
  state.mapStatus.textContent='External feed · page loaded';
 });
 for(const name of ['online','offline','nightlink-map-providers-changed'])window.addEventListener(name,syncMap);
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
 // Per-nick colors, as in IRC clients: a stable hash of the name picks one of eight VGA colors that meet 4.5:1 on black.
 const NICK_COLORS=8;
 function nickColor(name){let h=0;for(const ch of String(name))h=(h*31+ch.codePointAt(0))>>>0;return 'mrc-nc-'+(h%NICK_COLORS);}
 function nick(name,cls){const s=el('span','mrc-nick-wrap');s.append(el('span','mrc-nick-bracket','<'),el('span','mrc-nick '+cls+(cls==='mrc-nick-peer'?' '+nickColor(name):''),name),el('span','mrc-nick-bracket','>'),' ');return s;}
 function isMention(m){if(m.own||!live.identity?.name)return false;const n=live.identity.name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');return new RegExp('(^|[^\\w])@?\\[?'+n+'\\]?($|[^\\w])','i').test(String(m.text||''));}
 function jumpMessage(id,{select=true,focus=true}={}){
  const win=activeWindow(windows()),m=live.messages.find(m=>m.id===id&&m.conversation===win.id);if(!m){toast('Original message is no longer stored in this conversation.');return;}
  const session=readingSession(win.id);session.focus=id;session.position={anchor:id,offset:8,bottom:false,manual:true};if(select)state.selectedMessage=id;state.restoring=true;render();state.restoring=false;
  const log=doc.querySelector('#mrc-log'),row=log?.querySelector('[data-message-id="'+CSS.escape(id)+'"]');if(row){log.scrollTop+=row.getBoundingClientRect().top-log.getBoundingClientRect().top-8;if(focus)row.querySelector('.mrc-text')?.focus({preventScroll:true});captureReading(log);updateJump(log,win);}
 }
 function actionsFor(m){const tools=el('div','mrc-message-actions');tools.setAttribute('role','toolbar');tools.setAttribute('aria-label','Selected message actions');
  const dismiss=()=>{state.selectedMessage=null;tools.remove();state.form?.querySelector('#mrc-input')?.focus();};
  for(const [label,action] of [['Reply',()=>beginReply(m,m.own?own():m.sender||m.target?.name||'Mesh')],['Copy',async()=>{try{await navigator.clipboard.writeText(String(m.text||''));toast('Message copied');}catch{toast('Clipboard unavailable. Select the message text to copy.');}}],['Path',()=>showMessageRoute(m)],['×',dismiss]]){const b=el('button',null,label);b.type='button';if(label==='×')b.setAttribute('aria-label','Dismiss message actions');b.onclick=e=>{e.stopPropagation();action();};tools.append(b);}tools.onkeydown=e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();dismiss();}};return tools;
 }
 function selectMessage(m){state.selectedMessage=m.id;doc.querySelectorAll('.mrc-message-actions').forEach(e=>e.remove());const row=doc.querySelector('#mrc-log [data-message-id="'+CSS.escape(m.id)+'"]');if(row)row.append(actionsFor(m));}
 function beginReply(m,name){
  const input=state.form?.querySelector('#mrc-input');if(!input)return;selectMessage(m);
  const draft=input.value;if(state.form.querySelector('.message-reply-context')&&state.replyPrefix&&draft.startsWith(state.replyPrefix))input.value=draft.slice(state.replyPrefix.length);
  const note=NightlinkMessageActions.reply(input,m,m.own?'You':name,live.selected?.kind==='channel');
  if(note){state.form.querySelector('.message-reply-context')?.remove();note.setAttribute('role','status');state.form.prepend(note);state.replyWindow=m.conversation||conversationId(live.selected);state.replySource={id:m.id,conversation:state.replyWindow,name:String(m.own?own():name).slice(0,80),text:String(m.text||'').slice(0,133)};state.replyPrefix=!m.own&&live.selected?.kind==='channel'?'@['+String(name).replace(/[\[\]\r\n]/g,'').trim()+'] ':null;
   const preview=note.querySelector('span'),link=el('button','mrc-reply-source',preview.textContent);link.type='button';link.setAttribute('aria-label','Jump to original message from '+name);link.onclick=()=>jumpMessage(m.id);preview.replaceWith(link);
   const close=note.querySelector('[aria-label="Dismiss reply context"]'),prior=close.onclick;close.onclick=e=>{state.replySource=null;state.replyPrefix=null;prior(e);};
  }else{input.value=draft;updateCount();}
 }
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
  if(window.NightlinkMessageActions)NightlinkMessageActions.bind(body,()=>beginReply(m,name),'Reply to '+name);
  body.addEventListener('focus',()=>{if(body.matches(':focus-visible'))selectMessage(m);});
  if(m.localReply?.id&&m.localReply.conversation===m.conversation){const quote=el('button','mrc-reply-quote','↳ '+String(m.localReply.name||'Message')+': '+String(m.localReply.text||'').slice(0,100));quote.type='button';quote.setAttribute('aria-label','Jump to original message from '+String(m.localReply.name||'sender'));quote.onclick=()=>jumpMessage(m.localReply.id);line.append(quote);}
  line.append(body);
  // Mentions of your own name (as @name, [name] or the plain word) highlight the line, as IRC clients do.
  if(isMention(m))line.classList.add('mrc-mention');
  if(state.find.open&&state.find.query.trim()&&findText(m).toLocaleLowerCase().includes(state.find.query.trim().toLocaleLowerCase()))line.classList.add(m.id===state.find.activeId?'mrc-find-current':'mrc-find-match');
  if(state.selectedMessage===m.id)line.append(actionsFor(m));
  const frag=doc.createDocumentFragment();frag.append(line);
  const detail=deliveryText(m);
  if(detail){
   const row=el('div','mrc-line mrc-delivery-row');row.append(el('span','mrc-time',stamp(m.timestamp)));
   const b=el('button','mrc-delivery '+deliveryClass(m),'└─ '+(m.own&&m.phase!=='acknowledged'&&deliveryClass(m)==='mrc-pending'?'… ':deliveryClass(m)==='mrc-ok'&&m.own?'✓ ':'')+detail);
   if(!m.own&&m.pathLength!=null&&window.MeshlineRoutes){
    const hops=MeshlineRoutes.hopSummary(m.pathLength);
    b.replaceChildren('└─ ',el('span','mrc-hop',hops),m.snr!=null?' · SNR '+m.snr:'');
   }
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
   line.append(el('span',c.type===2?'mrc-nick-repeater':'mrc-nick-peer '+nickColor(display(c.key,c.name)),display(c.key,c.name)),el('span','mrc-dim',' ['+c.key.slice(0,8)+'@'+hops+']'),' has joined');
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
   li.append(el('span',c.type===2?'mrc-nick-repeater':'mrc-node-name '+nickColor(display(c.key,c.name)),(c.type===2?'+':' ')+display(c.key,c.name)));
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
  saveTerminalDraft();
  if(!state.restoring)captureReading(doc.querySelector('#mrc-log'),true,true);
  host.classList.toggle('mrc-active',on);
  doc.body.classList.toggle('term-mrc',on);
  let root=doc.querySelector('#mrc');
  if(!on){state.find.open=false;clearTimeout(state.find.timer);stopMap();root?.remove();return;}
  const focused=doc.activeElement===state.form?.querySelector('#mrc-input'),findFocused=doc.activeElement===state.find.input,findSelection=findFocused?[state.find.input.selectionStart,state.find.input.selectionEnd]:null,focusedAction=doc.activeElement?.closest('.mrc-message-actions')?doc.activeElement.textContent:null,log=doc.querySelector('#mrc-log'),atEnd=!log||log.scrollHeight-log.scrollTop-log.clientHeight<24,keepTop=log?.scrollTop;
  const list=windows(),win=activeWindow(list),index=list.indexOf(win)+1,changed=state.readingWin!==win.id,session=readingSession(win.id);
  if(changed)state.selectedMessage=null;
  if(state.find.scope&&state.find.scope!==findScope(win)){state.find.open=false;state.find.query='';state.find.activeId=null;clearTimeout(state.find.timer);if(state.find.input)state.find.input.value='';}
  state.readingWin=win.id;
  if(!session.boundary&&(changed||session.position.manual||doc.hidden||!doc.hasFocus())){try{session.boundary=ensureAttention().unread(live.messages,win.id)[0]?.id||null;}catch{}}
  if(!root){root=el('section');root.id='mrc';root.className='mrc';root.setAttribute('aria-label','Mesh Relay Chat');}
  for(const child of [...root.children])if(child!==state.mapPanel)child.remove();
  if(!state.mapPanel?.isConnected)root.append(mapPanel());
  // Topic bar
  const topic=el('div','mrc-topic');topic.append(el('strong',null,'MRC'),el('span','mrc-topic-dim',' Mesh Relay Chat'),' │ ');
  const target=win.target;
  if(win.kind==='status')topic.append(el('strong',null,'(status)'),': '+(live.identity?live.identity.name+' · '+live.channels.length+' channels · '+live.contacts.length+' contacts':'connect a radio to load channels'));
  else{topic.append(el('strong',null,win.label),': '+(target.kind==='channel'?'channel slot '+target.slot:'direct message'));if(live.identity?.frequency)topic.append(' │ '+live.identity.frequency.toFixed(3)+' MHz');}
  const sizeLabel=el('label','mrc-text-size','Chat text '),sizeSelect=el('select');
  sizeSelect.id='mrc-text-size';sizeSelect.dataset.chatTextSize='';sizeSelect.setAttribute('aria-label','Chat text size');
  for(const value of NightlinkInterface.CHAT_SIZES){const option=el('option',null,value[0].toUpperCase()+value.slice(1));option.value=value;sizeSelect.append(option);}
  sizeSelect.value=NightlinkInterface.chatSize();
  sizeSelect.onchange=()=>NightlinkInterface.setChatSize(sizeSelect.value);
  sizeLabel.append(sizeSelect);
  const heading=el('div','mrc-heading');heading.append(topic,sizeLabel);root.append(heading);
  const findButton=el('button','mrc-find-toggle','Find');findButton.type='button';findButton.title='Find in this chat (Ctrl+F)';findButton.setAttribute('aria-label','Find in current chat');findButton.onclick=openFind;heading.append(findButton);if(state.find.open){heading.append(findForm());refreshFind(win);}
  const mentions=live.messages.filter(m=>m.conversation===win.id&&isMention(m));if(mentions.length){const nav=el('div','mrc-mention-nav'),label=el('span',null,'Mentions '+mentions.length);nav.setAttribute('role','group');nav.setAttribute('aria-label','Mention navigation');nav.append(label);for(const [name,direction,glyph]of [['Previous mention',-1,'↑'],['Next mention',1,'↓']]){const b=el('button',null,glyph);b.type='button';b.setAttribute('aria-label',name);b.onclick=()=>{const index=mentions.findIndex(m=>m.id===session.mentionId),next=index<0?(direction>0?0:mentions.length-1):(index+direction+mentions.length)%mentions.length;session.mentionId=mentions[next].id;jumpMessage(session.mentionId);const current=doc.querySelector('.mrc-mention-nav span');if(current)current.textContent='Mentions '+(next+1)+'/'+mentions.length;};nav.append(b);}heading.append(nav);}
  // Window list
  const body=el('div','mrc-body'),side=el('div','mrc-windows');side.setAttribute('role','navigation');side.setAttribute('aria-label','Windows');
  side.append(el('div','mrc-pane-title','windows'));side.lastChild.setAttribute('data-box','');
  const ol=el('ol','mrc-window-list');
  list.forEach((w,i)=>{const li=el('li'),b=el('button','mrc-window'+(w===win?' active':''));b.type='button';b.dataset.mrcWindow=w.id;const n=w.kind==='status'?0:unread(w.id);
   b.append(el('span','mrc-window-num',String(i+1)),' ',el('span','mrc-window-name '+(w.kind==='direct'?'mrc-dm':''),w.label));if(n)b.append(el('span','mrc-unread',String(n)));
   if(w===win)b.setAttribute('aria-current','true');b.setAttribute('aria-label',(i+1)+' '+w.label+(n?', '+n+' unread':''));b.onclick=()=>switchTo(w);li.append(b);ol.append(li);});
  side.append(ol,el('p','mrc-dim mrc-legend','alt+1..9 switch'),el('p','mrc-dim mrc-legend','/help for commands'));
  // Scrollback
  const scroll=el('div','mrc-log');scroll.id='mrc-log';scroll.setAttribute('role','log');scroll.setAttribute('aria-label','Scrollback '+win.label);scroll.tabIndex=0;
  if(win.kind==='status')statusLines(scroll);
  else{
   const all=live.messages.filter(m=>m.conversation===win.id),focus=session.focus||(session.position.manual?session.position.anchor:changed?session.boundary:null);
   const focusIndex=focus?all.findIndex(m=>m.id===focus):-1,start=focusIndex>=0?Math.max(0,Math.min(all.length-MAX_ROWS,focusIndex-30)):Math.max(0,all.length-MAX_ROWS),rows=all.slice(start,start+MAX_ROWS);scroll.dataset.tailWindow=String(!all.length||rows.at(-1)?.id===all.at(-1)?.id);
   if(!rows.length){const line=el('div','mrc-line');line.append(el('span','mrc-time',stamp(nowSeconds())),el('span','mrc-dim','-!- No messages in '+win.label+' yet.'));scroll.append(line);
    // Decorative antenna for an empty window; the line above carries the meaning.
    const art=el('pre','mrc-empty-art');art.setAttribute('aria-hidden','true');
    for(const [t,c] of [['      ((( · )))\n','mrc-empty-wave'],['     ((   |   ))\n','mrc-empty-wave'],['          |\n',null],['         /|\\\n',null],['        / | \\\n',null],['       /  |  \\\n',null],['  ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄  listening on '+win.label+'\n','mrc-empty-ground']])art.append(el('span',c,t));
    scroll.append(art);}
   // Session banner, as an IRC client prints on join. Counts come from stored data only.
   const banner=(text,cls)=>{const line=el('div','mrc-line mrc-banner');line.append(el('span','mrc-time',stamp(rows[0]?.timestamp??nowSeconds())),el('span','mrc-banner-star','*** '),el('span',cls||null,text));scroll.append(line);};
   banner('Now talking in '+win.label,'mrc-banner-strong');
   if(target.kind==='channel')banner('Topic: channel slot '+target.slot+(live.identity?.frequency?' · '+live.identity.frequency.toFixed(3)+' MHz':'')+' · 133-byte messages');
   else banner('Direct messages with '+win.label.slice(1)+'');
   banner(rows.length+' stored message'+(rows.length===1?'':'s')+' · '+live.contacts.length+' nodes known');
   let day='',previous=null;
   for(const m of rows){const d=new Date(m.timestamp*1000).toDateString();if(day&&d!==day){const line=el('div','mrc-line');line.append(el('span','mrc-time',stamp(m.timestamp)),el('span','mrc-daychange','─── Day changed to '+d+' ───'));scroll.append(line);}const sameDay=day===d;day=d;if(m.id===session.boundary){const divider=el('div','mrc-new-messages','── New messages ──');divider.setAttribute('role','separator');divider.setAttribute('aria-label','New messages');scroll.append(divider);}const fragment=messageLine(m);if(previous&&sameDay&&m.id!==session.boundary&&!m.localReply&&!isMention(m)&&!!m.own===!!previous.own&&(m.own||String(m.sender||m.target?.name)===String(previous.sender||previous.target?.name))&&Number.isFinite(m.timestamp)&&m.timestamp>=previous.timestamp&&m.timestamp-previous.timestamp<=120&&!String(m.text).startsWith('* ')&&!String(previous.text).startsWith('* '))fragment.querySelector('[data-message-id]')?.classList.add('mrc-continuation');scroll.append(fragment);previous=m;}
  }
  for(const l of state.local.get(win.id)||[]){const line=el('div','mrc-line');line.append(el('span','mrc-time',stamp(l.t)),el('span',l.cls,l.text));scroll.append(line);}
  body.append(side,scroll);root.append(body);
  if(win.kind!=='status'){const jump=el('button','mrc-jump-latest','Jump to latest ↓');jump.type='button';jump.hidden=true;jump.onclick=()=>jumpLatest(win);body.append(jump);scroll.addEventListener('scroll',()=>{if(state.restoring||!scroll.isConnected)return;cancelAnimationFrame(state.readFrame);state.readFrame=requestAnimationFrame(()=>{if(!scroll.isConnected)return;captureReading(scroll,false);markRead(win,scroll);updateJump(scroll,win);clearTimeout(state.positionTimer);state.positionTimer=setTimeout(()=>{if(scroll.isConnected&&state.readingWin===win.id)captureReading(scroll);},180);});},{passive:true});}
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
   input.addEventListener('input',()=>{updateCount();saveTerminalDraft();});
   // Tab completes the word before the cursor against saved contact names, then channel names (#), cycling on repeat.
   let cycle=null;input.addEventListener('input',()=>{cycle=null;});
   input.addEventListener('keydown',e=>{if(e.key!=='Tab'||e.shiftKey||e.altKey||e.ctrlKey){if(e.key!=='Tab')cycle=null;return;}
    const pos=input.selectionStart??input.value.length,before=input.value.slice(0,pos),m=/(\S*)$/.exec(before),word=m[1];
    if(!cycle){if(!word)return;const lower=word.replace(/^[@#]/,'').toLowerCase(),names=word.startsWith('#')?live.channels.map(c=>'#'+c.name):[...new Set(live.contacts.map(c=>display(c.key,c.name)))];
     const options=names.filter(n=>n.replace(/^#/,'').toLowerCase().startsWith(lower)).sort((a,b)=>a.localeCompare(b));if(!options.length)return;cycle={start:pos-word.length,options,i:-1,atStart:pos-word.length===0&&!word.startsWith('#')};}
    e.preventDefault();cycle.i=(cycle.i+1)%cycle.options.length;const pick=cycle.options[cycle.i]+(cycle.atStart?': ':' ');
    const after=input.value.slice(pos);input.value=input.value.slice(0,cycle.start)+pick+after;const caret=cycle.start+pick.length;input.setSelectionRange(caret,caret);updateCount();saveTerminalDraft();});
   form.append(prompt,input);
   form.onsubmit=e=>{e.preventDefault();const list=windows();submit(input.value,activeWindow(list),input);};
   if(window.NightlinkTextArtUI?.attach)NightlinkTextArtUI.attach(form,input,null);
   state.form=form;
  }
  const form=state.form,field2=form.querySelector('#mrc-input');
  restoreTerminalDraft(win);
  if(state.replyWindow&&state.replyWindow!==win.id){form.querySelector('.message-reply-context')?.remove();state.replyWindow=null;state.replySource=null;}
  form.querySelector('.mrc-prompt').textContent='['+win.label+'] ';
  field2.setAttribute('aria-label','Message or command for '+win.label);
  const configured=win.kind!=='status'&&(target.kind==='channel'?live.channels.some(c=>c.slot===target.slot&&c.id===target.id):live.contacts.some(c=>c.key===target.key));
  field2.placeholder=win.kind==='status'?'/join #channel · /msg name text · /help':live.sync!=='ready'?'offline · reconnect to send':configured?'':'not configured on this radio';
  state.count=count;updateCount();
  root.append(form);
  if(!root.isConnected)host.prepend(root);
  syncMap();
  if(focused&&doc.activeElement!==field2)field2.focus();
  if(findFocused&&state.find.open){state.find.input.focus({preventScroll:true});if(findSelection[0]!=null)try{state.find.input.setSelectionRange(...findSelection);}catch{}}
  if(focusedAction)[...root.querySelectorAll('.mrc-message-actions button')].find(b=>b.textContent===focusedAction)?.focus({preventScroll:true});
  const sl=doc.querySelector('#mrc-log');state.restoring=true;
  const anchorId=session.position.manual?session.position.anchor:changed&&session.boundary?session.boundary:session.position.anchor,anchor=anchorId&&sl.querySelector('[data-message-id="'+CSS.escape(anchorId)+'"]');
  if((session.position.manual||changed&&session.boundary)&&anchor){sl.scrollTop+=anchor.getBoundingClientRect().top-sl.getBoundingClientRect().top-(session.position.manual?session.position.offset||0:24);}
  else if(session.position.bottom||atEnd)sl.scrollTop=sl.scrollHeight;else sl.scrollTop=keepTop||0;
  state.restoring=false;captureReading(sl);updateJump(sl,win);
  markRead(win,sl);
 }
 function updateCount(){const input=state.form?.querySelector('#mrc-input'),count=state.count;if(!input||!count)return;const v=input.value,n=v.startsWith('/')?bytes(commandPayload(v)||''):bytes(v);count.textContent=String(n);count.classList.toggle('mrc-over',n>LIMIT);}
 function markRead(win,log){
  if(win.kind==='status'||typeof ensureAttention!=='function'||doc.hidden||!doc.hasFocus()||doc.querySelector('dialog[open]'))return;
  const rect=log.getBoundingClientRect(),last=[...log.querySelectorAll('[data-message-id]')].filter(row=>row.getBoundingClientRect().top<rect.bottom&&row.getBoundingClientRect().bottom<=rect.bottom+2).at(-1);
  if(!last||!unread(win.id))return;
  try{ensureAttention().mark(live.messages,win.id,last.dataset.messageId);}catch{}
  if(typeof refreshUnreadBadges==='function')refreshUnreadBadges();
  const active=doc.querySelector('.mrc-window[aria-current="true"]'),badge=active?.querySelector('.mrc-unread'),count=unread(win.id);if(badge){if(count)badge.textContent=count;else badge.remove();}if(active)active.setAttribute('aria-label',active.getAttribute('aria-label').replace(/, \d+ unread$/,'')+(count?', '+count+' unread':''));
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
 const HELP=['Commands:','/join #channel   switch to a radio channel window','/msg <name> <text>   send a direct message to a saved contact','/query <name>   open a direct message window','/me <text>   send "* '+'<your name> <text>"','/whois <name>   show a saved contact: type, route, signal, last advert','Tab   complete a nick or #channel','/help   show this help','Keys: alt+1..9 switch window · F9 main menu · F1 help'];
 async function submit(value,win,input){
  const text=value.trim();if(!text)return;
  const send=async(target,body)=>{if(bytes(body)>LIMIT){localLine(win.id,'-!- Message is '+bytes(body)+' bytes; the limit is '+LIMIT+'.','mrc-error');render();return;}const owner=live.identity?.key,id=conversationId(target),reply=state.replyWindow===id?state.replySource:null,before=new Set(live.messages.map(m=>m.id));await sendUIMessage({...target},body,()=>{if(draftStore().get(owner,id).trim()===body.trim())draftStore().clearIf(owner,id,body);const i=state.form?.querySelector('#mrc-input');if(state.draftOwner===owner&&state.draftId===id&&i?.value.trim()===body.trim()){i.value='';state.lastSavedDraft='';syncCardDraft('');state.form.querySelector('.message-reply-context')?.remove();state.replyWindow=null;state.replySource=null;}});if(reply&&owner===live.identity?.key){const sent=live.messages.find(m=>!before.has(m.id)&&m.own&&m.conversation===id&&m.text===body.trim());if(sent){sent.localReply={...reply};saveHistory();}}if(owner===live.identity?.key&&state.readingWin===id&&live.messages.some(m=>!before.has(m.id)&&m.own&&m.conversation===id&&m.text===body.trim())){const session=readingSession(id);session.focus=null;session.boundary=null;session.position={bottom:true,manual:false};state.restoring=true;try{render();}finally{state.restoring=false;}}};
  if(!text.startsWith('/')){
   if(win.kind==='status'){localLine(win.id,'-!- (status) is not a chat window. Use /join #channel or /msg <name> <text>.','mrc-error');input.value='';render();return;}
   await send(win.target,text);render();return;
  }
  const [,cmd,rest='']=/^\/(\w*)\s*(.*)$/s.exec(text)||[];
  input.value='';
  saveTerminalDraft();
  if(cmd==='help'){for(const h of HELP)localLine(win.id,'-!- '+h,'mrc-info');render();return;}
  if(cmd==='join'){const name=rest.trim().replace(/^#/,'').toLowerCase(),c=live.channels.find(c=>c.name.toLowerCase()===name);if(!c){localLine(win.id,'-!- No channel #'+name+' on this radio. Channels are configured on the radio.','mrc-error');render();return;}state.window=null;selectConversation({kind:'channel',...c});return;}
  if(cmd==='msg'||cmd==='query'){const r=resolveContact(rest.trim());if(!r){localLine(win.id,'-!- No unique saved contact matches "'+rest.trim().split(/\s+/)[0]+'".','mrc-error');render();return;}
   const target={kind:'direct',key:r.contact.key,name:r.contact.name};state.window=null;selectConversation(target);
   if(cmd==='msg'&&r.text){await send(target,r.text);render();}return;}
  if(cmd==='whois'){const r=resolveContact(rest.trim());if(!r){localLine(win.id,'-!- No unique saved contact matches "'+rest.trim().split(/\s+/)[0]+'".','mrc-error');render();return;}
   const c=r.contact,type=c.type===2?'repeater':c.type===3?'room server':c.type===4?'sensor':'companion',route=c.pathLength==null||c.pathLength===255?'flood':window.MeshlineRoutes?MeshlineRoutes.contactRoute(c.pathLength):String(c.pathLength);
   const ago=Number.isFinite(c.lastAdvert)?Math.max(0,Math.round((nowSeconds()-c.lastAdvert)/60))+' min ago':'not heard';
   for(const l of ['-!- '+display(c.key,c.name)+' ['+c.key.slice(0,12)+']','-!-   type    '+type,'-!-   route   '+route,'-!-   signal  '+(c.snr==null?'not reported':'SNR '+c.snr+' dB'),'-!-   advert  '+ago,'-!-   location '+(c.located&&Number.isFinite(c.lat)?c.lat.toFixed(4)+', '+c.lon.toFixed(4):'not advertised'),'-!- End of /whois'])localLine(win.id,l,'mrc-info');
   render();return;}
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
 doc.addEventListener('keydown',e=>{if(!terminal()||current!=='Messages'||doc.querySelector('dialog[open]'))return;if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='f'){e.preventDefault();e.stopPropagation();openFind();}else if(e.key==='Escape'&&state.find.open){e.preventDefault();e.stopPropagation();closeFind();}},true);
 function resumeReading(){if(!terminal()||current!=='Messages'||doc.hidden||!doc.hasFocus()||doc.querySelector('dialog[open]'))return;const win=activeWindow(windows()),session=readingSession(win.id);if(win.kind!=='status'&&unread(win.id)&&!session.position.manual){try{session.boundary=session.boundary||ensureAttention().unread(live.messages,win.id)[0]?.id;}catch{}if(session.boundary){session.focus=session.boundary;session.position={anchor:session.boundary,offset:24,manual:true,bottom:false};state.restoring=true;render();state.restoring=false;return;}}const log=doc.querySelector('#mrc-log');if(log){markRead(win,log);updateJump(log,win);}}
 window.addEventListener('focus',resumeReading);window.addEventListener('blur',()=>{saveTerminalDraft();captureReading();});window.addEventListener('beforeunload',()=>{saveTerminalDraft();captureReading();});doc.addEventListener('visibilitychange',()=>{if(doc.hidden){saveTerminalDraft();captureReading();}else resumeReading();});
 window.NightlinkMRC={render,windows,jumpTo:jumpMessage,submit:value=>{const list=windows();return submit(value,activeWindow(list),doc.querySelector('#mrc-input')||{value:''});},switchTo:n=>switchTo(windows()[n-1])};
})();
