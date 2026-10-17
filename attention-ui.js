/* Conversation attention and notification controls; scoped to the current companion identity. */
let attention,attentionOwner,readingConversation=null,readingBoundary=null,attentionFrame=0,restoringReading=false,pendingReadingJump=null;
const chatReadingLog=$('#chat-log');
const chatIsVisible=()=>['Overview','Messages'].includes(current)&&!document.hidden&&document.hasFocus();
const atReadingEnd=el=>el.scrollHeight-el.clientHeight-el.scrollTop<36;
function ensureAttention(){
 const owner=live.identity?.key||'local';
 if(owner!==attentionOwner){attentionOwner=owner;dmReadingBoundaries.clear();attention=new NightlinkAttention(localStorage,'nightlink.attention.'+owner,live.messages);readingConversation=null;readingBoundary=null;}
 return attention;
}
function migrateAttentionMessage(previousId,previousConversation,message){const state=ensureAttention();if(state.read.delete(previousId))state.read.add(message.id);const position=state.position(previousConversation);if(position){if(position.anchor===previousId)position.anchor=message.id;state.position(message.conversation,position);}state.save();}
function conversationRows(id){return live.messages.filter(m=>m.conversation===id);}
function captureReading(){
 if(!readingConversation||!chatReadingLog.getClientRects().length||restoringReading)return;
 const rect=chatReadingLog.getBoundingClientRect(),rows=[...chatReadingLog.querySelectorAll('.message')];
 const anchor=rows.find(row=>row.getBoundingClientRect().bottom>rect.top);
 ensureAttention().position(readingConversation,{anchor:anchor?.dataset.messageId,offset:anchor?anchor.getBoundingClientRect().top-rect.top:0,bottom:atReadingEnd(chatReadingLog)});
}
function markVisibleReading(){
 if(!chatIsVisible()||restoringReading||pendingReadingJump||!readingConversation)return;
 const rect=chatReadingLog.getBoundingClientRect(),rows=[...chatReadingLog.querySelectorAll('.message')];
 const visible=rows.filter(row=>row.getBoundingClientRect().top<rect.bottom&&row.getBoundingClientRect().bottom<=rect.bottom+2);
 const last=visible.at(-1);if(last)ensureAttention().mark(live.messages,readingConversation,last.dataset.messageId);
 refreshUnreadBadges();
}
function unreadBadge(count){const b=document.createElement('b');b.className='unread-badge';b.textContent=count>99?'99+':count;b.setAttribute('aria-label',count+' unread messages');return b;}
function refreshUnreadBadges(){
 const state=ensureAttention();
 document.querySelectorAll('.unread-badge').forEach(b=>b.remove());
 for(const button of document.querySelectorAll('[data-live-channel],[data-live-direct],[data-live-history],.dm-inbox-contact')){
  let id;if(button.dataset.liveChannel!=null){const c=live.channels.find(c=>c.slot===Number(button.dataset.liveChannel));if(c)id=conversationId({kind:'channel',...c});}
  else if(button.dataset.liveDirect)id='direct:'+button.dataset.liveDirect;
  else if(button.dataset.liveHistory)id=live.messages[Number(button.dataset.liveHistory)]?.conversation;
  else id=button.dataset.conversation;
  if(!id)continue;const n=state.unread(live.messages,id).length;
  if(n)button.append(unreadBadge(n));
  button.classList.toggle('conversation-muted',state.muted.has(id));button.title=state.muted.has(id)?'Muted · alerts disabled':'';
 }
 for(const [name,kind] of [['Messages','channel:'],['Direct Messages','direct:']]){
  const nav=$('nav [data-view="'+name+'"]');nav.querySelector('b')?.remove();
  const n=state.unread(live.messages).filter(m=>m.conversation.startsWith(kind)).length;if(n)nav.append(unreadBadge(n));
 }
}
const attentionChannels=renderChannels;renderChannels=function(){attentionChannels();refreshUnreadBadges();};
const attentionInbox=renderDMInbox;renderDMInbox=function(){attentionInbox();if(current==='Direct Messages'){refreshUnreadBadges();}};
const jumpNewest=document.createElement('button');jumpNewest.id='jump-newest';jumpNewest.className='reading-jump';jumpNewest.hidden=true;jumpNewest.textContent='Jump to latest ↓';chatReadingLog.after(jumpNewest);
jumpNewest.onclick=()=>{chatReadingLog.scrollTop=chatReadingLog.scrollHeight;captureReading();markVisibleReading();jumpNewest.hidden=true;};
const muteChannel=document.createElement('button');muteChannel.id='mute-channel';muteChannel.className='channel-mute';muteChannel.hidden=true;$('.chat-channel').append(muteChannel);
muteChannel.onclick=()=>{if(live.selected?.kind!=='channel')return;const id=conversationId(live.selected),state=ensureAttention();state.mute(id,!state.muted.has(id));renderMessages();renderChannels();};
const attentionMessages=renderMessages;
renderMessages=function(){
 const state=ensureAttention(),next=live.selected?conversationId(live.selected):null;if(live.selected){state.data.selected=live.selected;state.save();}
 const changed=next!==readingConversation;captureReading();
 if(changed){readingConversation=next;readingBoundary=next?state.unread(live.messages,next)[0]?.id:null;}
 const position=next?state.position(next):null;if(!readingBoundary&&next&&(!chatIsVisible()||(position&&!position.bottom)))readingBoundary=state.unread(live.messages,next)[0]?.id;
 attentionMessages();
 const rows=next?conversationRows(next):[];
 chatReadingLog.querySelectorAll('.message').forEach((row,i)=>{row.dataset.messageId=rows[i].id;});
 if(readingBoundary){const row=[...chatReadingLog.querySelectorAll('.message')].find(r=>r.dataset.messageId===readingBoundary);if(row){const divider=document.createElement('div');divider.className='new-messages-divider';divider.textContent='New messages';divider.setAttribute('role','separator');row.before(divider);}}
 muteChannel.hidden=live.selected?.kind!=='channel';
 const muted=next&&state.muted.has(next);muteChannel.textContent=muted?'Muted · Unmute':'Mute channel';muteChannel.setAttribute('aria-pressed',String(!!muted));
 cancelAnimationFrame(attentionFrame);restoringReading=true;
 function restorePosition(){
  if(position&&!position.bottom){const anchor=[...chatReadingLog.querySelectorAll('.message')].find(row=>row.dataset.messageId===position.anchor);if(anchor)chatReadingLog.scrollTop+=anchor.getBoundingClientRect().top-chatReadingLog.getBoundingClientRect().top-position.offset;else chatReadingLog.scrollTop=0;}
  else if(changed&&readingBoundary){const divider=chatReadingLog.querySelector('.new-messages-divider');if(divider)chatReadingLog.scrollTop+=divider.getBoundingClientRect().top-chatReadingLog.getBoundingClientRect().top;}
  else chatReadingLog.scrollTop=chatReadingLog.scrollHeight;
 }
 restorePosition();attentionFrame=requestAnimationFrame(()=>{restorePosition();restoringReading=false;markVisibleReading();captureReading();jumpNewest.hidden=atReadingEnd(chatReadingLog)||!next;const count=next?state.unread(live.messages,next).length:0;jumpNewest.textContent=count?'New messages ('+count+') ↓':'Jump to latest ↓';});
 refreshUnreadBadges();
};
chatReadingLog.addEventListener('scroll',()=>{if(restoringReading)return;captureReading();markVisibleReading();jumpNewest.hidden=atReadingEnd(chatReadingLog);},{passive:true});
new ResizeObserver(()=>{if(ensureAttention().position(readingConversation)?.bottom)chatReadingLog.scrollTop=chatReadingLog.scrollHeight;}).observe(chatReadingLog);
const attentionView=view;view=function(name){captureReading();attentionView(name);if(['Overview','Messages'].includes(name))renderMessages();if(name==='Settings')renderAttentionSettings();ensureAttention().data.view=name;ensureAttention().save();refreshUnreadBadges();};
function renderAttentionSettings(){
 $('#enable-dm-sound')?.setAttribute('hidden','');
 const grid=$('.settings-grid');const existing=[...grid.querySelectorAll('label')].find(l=>l.textContent.trim()==='Direct message sound');if(existing)existing.remove();
 for(const [id,title,key]of [['dm-alert-sound','Direct message sound','dm-sound'],['mention-alert-sound','Mention sound','nightlink.mention-sound']]){
  const label=document.createElement('label'),input=document.createElement('input');label.textContent=title;input.id=id;input.type='checkbox';input.checked=localStorage.getItem(key)!=='false';
  input.onchange=()=>{localStorage.setItem(key,String(input.checked));updateDMs();};label.append(input);grid.prepend(label);
 }
 const explanation=document.createElement('p');explanation.className='attention-help';explanation.textContent='Mute individual channels from the conversation header. Muted channels keep unread counts but suppress notifications and mention sounds. Recovered messages do not play alerts.';grid.append(explanation);
}
const mentionAudio=new Audio('dm.wav');mentionAudio.preload='auto';
function soundMention(){if(typeof quietHoursActive==='function'&&quietHoursActive())return;if(localStorage.getItem('nightlink.mention-sound')==='false')return;mentionAudio.currentTime=0;mentionAudio.play().catch(()=>toast('Mention received · interact with Nightlink to enable sound.'));}
const attentionAlerts=document.createElement('div');attentionAlerts.id='conversation-alerts';attentionAlerts.setAttribute('aria-live','polite');document.body.append(attentionAlerts);
function navigateAttention(target){if(target.kind==='direct')openDM(target.key);else selectConversation({...target});}
function showConversationAlert(m,mention){
 if(typeof quietHoursActive==='function'&&quietHoursActive())return;
 const button=document.createElement('button');button.className='conversation-alert';
 const title=m.target.kind==='channel'?(mention?'Mention in ':'Message in ')+m.target.name:'DM from '+cardName(m.target.key,m.sender);button.textContent=title+' · '+m.text;
 button.onclick=()=>{navigateAttention(m.target);button.remove();};button.setAttribute('aria-label','Open '+(m.target.name||m.sender)+' conversation');attentionAlerts.append(button);
 while(attentionAlerts.children.length>3)attentionAlerts.firstChild.remove();setTimeout(()=>button.remove(),12000);
 if(window.meshlineDesktop){if(localStorage.getItem('notifications')==='true')window.meshlineDesktop.notify({radio:live.identity?.key,conversation:m.conversation,title:'Nightlink · '+title,body:m.text});return;}
 if(localStorage.getItem('notifications')==='true'&&'Notification'in window&&Notification.permission==='granted'&&(!document.hasFocus()||document.hidden)){
  const notice=new Notification('Nightlink · '+title,{body:m.text,tag:m.conversation,silent:true});
  notice.onclick=()=>{window.meshlineLayout?.focusWindow();window.focus();navigateAttention(m.target);notice.close();};
 }
}
let attentionSeen=new Set(live.messages.map(m=>m.id));
function handleIncomingAttention(){
 const state=ensureAttention();
 for(const m of live.messages){if(attentionSeen.has(m.id))continue;attentionSeen.add(m.id);if(m.own)continue;
  if(live.sync!=='ready'||state.muted.has(m.conversation))continue;
  if(m.target?.kind==='direct'){if(!(typeof quietHoursActive==='function'&&quietHoursActive()))openDM(m.target.key,true);showConversationAlert(m,false);}
  else if(state.isMention(m.text,live.identity?.name)){soundMention();showConversationAlert(m,true);}else if(!chatIsVisible()||m.conversation!==readingConversation)showConversationAlert(m,false);
 }
 state.save(live.messages);refreshUnreadBadges();
}
radioSession.addEventListener('message',handleIncomingAttention);
radioSession.addEventListener('identity',()=>{ensureAttention();attentionSeen=new Set(live.messages.map(m=>m.id));renderMessages();refreshUnreadBadges();});
radioSession.addEventListener('contacts',()=>{attentionSeen=new Set(live.messages.map(m=>m.id));refreshUnreadBadges();});
window.addEventListener('focus',markVisibleReading);document.addEventListener('visibilitychange',()=>{if(!document.hidden)markVisibleReading();});
window.addEventListener('beforeunload',captureReading);
/* Floating and native DMs report reading only while focused, never simply on arrival. */
function markDMRead(key,through){const state=ensureAttention();state.mark(live.messages,'direct:'+key,through);refreshUnreadBadges();}
const dmReadingBoundaries=new Map();
function decoratePopupReading(key){
 const popup=dmPopups.get(key);if(!(popup instanceof HTMLElement))return;
 const thread=popup.querySelector('.dm-thread');const messages=live.messages.filter(m=>m.conversation==='direct:'+key).slice(-120);
 thread.querySelectorAll('.dm-bubble').forEach((row,i)=>row.dataset.messageId=messages[i]?.id);
 const state=ensureAttention(),pos=state.position('direct:'+key);if(!dmReadingBoundaries.has(key))dmReadingBoundaries.set(key,state.unread(live.messages,'direct:'+key)[0]?.id);const boundary=dmReadingBoundaries.get(key);const boundaryRow=[...thread.children].find(r=>r.dataset.messageId===boundary);if(boundaryRow){const divider=document.createElement('div');divider.className='new-messages-divider';divider.textContent='New messages';boundaryRow.before(divider);}
 if(pos&&!pos.bottom){const row=[...thread.children].find(r=>r.dataset.messageId===pos.anchor);if(row)thread.scrollTop+=row.getBoundingClientRect().top-thread.getBoundingClientRect().top-pos.offset;}
 if(!pos&&boundaryRow)thread.scrollTop+=boundaryRow.getBoundingClientRect().top-thread.getBoundingClientRect().top;
 const read=()=>{if(document.hidden||!document.hasFocus()||popup.classList.contains('minimized')||!popup.contains(document.activeElement))return;
  const rect=thread.getBoundingClientRect(),rows=[...thread.querySelectorAll('.dm-bubble')],visible=rows.filter(r=>r.getBoundingClientRect().bottom<=rect.bottom+2);
  if(visible.length)markDMRead(key,visible.at(-1).dataset.messageId);
  const anchor=rows.find(r=>r.getBoundingClientRect().bottom>rect.top);state.position('direct:'+key,{anchor:anchor?.dataset.messageId,offset:anchor?anchor.getBoundingClientRect().top-rect.top:0,bottom:atReadingEnd(thread)});
 };
 thread.onscroll=read;popup.onfocusin=()=>requestAnimationFrame(read);popup.onclick=e=>{if(!e.target.closest('button,input'))popup.querySelector('input').focus();read();};
}
const attentionPopupUpdate=updatePopup;updatePopup=function(key,options={}){const popup=dmPopups.get(key);if(popup instanceof HTMLElement){const thread=popup.querySelector('.dm-thread'),rect=thread.getBoundingClientRect(),anchor=[...thread.querySelectorAll('.dm-bubble')].find(r=>r.getBoundingClientRect().bottom>rect.top);if(anchor&&thread.getClientRects().length&&!popup.classList.contains('minimized'))ensureAttention().position('direct:'+key,{anchor:anchor.dataset.messageId,offset:anchor.getBoundingClientRect().top-rect.top,bottom:atReadingEnd(thread)});}attentionPopupUpdate(key,options);decoratePopupReading(key);const updated=dmPopups.get(key);if(updated instanceof HTMLElement){const thread=updated.querySelector('.dm-thread');let jump=updated.querySelector('.dm-reading-jump');if(!jump){jump=document.createElement('button');jump.className='reading-jump dm-reading-jump';jump.textContent='New messages ↓';thread.after(jump);jump.onclick=()=>{thread.scrollTop=thread.scrollHeight;thread.dispatchEvent(new Event('scroll'));};thread.addEventListener('scroll',()=>jump.hidden=atReadingEnd(thread));}jump.hidden=atReadingEnd(thread);}};
window.meshlineDM?.onRead(data=>{if(data.radio!==live.identity?.key)return;const messages=live.messages.filter(m=>m.conversation==='direct:'+data.key);if(messages.some(m=>m.id===data.through))markDMRead(data.key,data.through);if(data.position)ensureAttention().position('direct:'+data.key,data.position);});
ensureAttention();const savedAttentionView=attention.data.view,savedAttentionTarget=attention.data.selected;if(savedAttentionTarget&&['channel','direct'].includes(savedAttentionTarget.kind))live.selected=savedAttentionTarget;if(['Overview','Messages','Direct Messages','Nodes','Activity','Network map','Settings','Search'].includes(savedAttentionView))view(savedAttentionView);else renderMessages();refreshUnreadBadges();
