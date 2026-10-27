/* Consolidated destinations; retain existing conversation and radio behavior. */
(function(){
 const directNav=sidebarNav.querySelector('[data-view="Direct Messages"]');
 const searchNav=sidebarNav.querySelector('[data-view="Search"]');
 directNav.hidden=true;searchNav.hidden=true;
 moreGroup.querySelector('summary').firstChild.textContent='Tools';
 sidebarState.recent=false;
 const savedChannels=renderChannels;
 renderChannels=function(){savedChannels();const recent=$('#channels [data-sidebar-group="recent"]');if(recent)recent.hidden=true;const channels=$('#channels [data-sidebar-group="channels"]');if(channels){channels.querySelector('summary').firstChild.textContent='Conversations';const add=channels.querySelector('#sidebar-add-channel');if(add)add.onclick=showAddChannel;}};
 // Start with a quiet sidebar; retain the user's explicit expansion choice thereafter.
 try{if(!localStorage.getItem('nightlink.navigation.v2')){sidebarState.channels=false;localStorage.setItem('nightlink.navigation.v2','1');}}catch{sidebarState.channels=false;}
 const tools=$('.conversation-tools');tools.replaceChildren();
 function button(label,run){const b=document.createElement('button');b.type='button';b.textContent=label;b.onclick=run;return b;}
 function openChannels(){if(live.selected?.kind!=='channel'){const c=live.channels[0];if(c)selectConversation({kind:'channel',...c});else{live.selected=null;view('Messages');renderMessages();}}else view('Messages');}
 function messageMenu(){const menu=document.createElement('details');menu.className='message-more';const summary=document.createElement('summary');summary.textContent='More';summary.setAttribute('aria-label','More message actions');menu.append(summary);const actions=document.createElement('div');actions.className='message-more-actions';for(const [label,run]of [['Search messages',()=>view('Search')],['Browse conversations',showConversationBrowser],['Add channel',showAddChannel]])actions.append(button(label,()=>{menu.open=false;run();}));menu.append(actions);menu.addEventListener('keydown',e=>{if(e.key==='Escape'){menu.open=false;summary.focus();}});return menu;}
 function tabs(){const bar=document.createElement('div');bar.className='workspace-message-tabs';bar.setAttribute('aria-label','Message views');for(const [label,destination]of [['Channels','Messages'],['Direct messages','Direct Messages']]){const b=button(label,()=>{if(destination==='Messages')openChannels();else view(destination);});b.setAttribute('aria-pressed',String(current===destination));bar.append(b);}bar.append(messageMenu());return bar;}
 function channelPicker(){const select=document.createElement('select');select.setAttribute('aria-label','Choose channel');const prompt=document.createElement('option');prompt.value='';prompt.textContent=live.channels.length?'Choose channel':'No channels loaded';select.append(prompt);for(const c of live.channels){const option=document.createElement('option');option.value=String(c.slot);option.textContent='# '+c.name.replace(/^#\s*/,'');option.selected=live.selected?.kind==='channel'&&live.selected.slot===c.slot;select.append(option);}select.onchange=()=>{const c=live.channels.find(c=>String(c.slot)===select.value);if(c)selectConversation({kind:'channel',...c});};return select;}
 let toolsSignature='';
 function refresh(){
  const signature=JSON.stringify([current,live.selected?.kind,live.selected?.slot,live.channels.map(c=>[c.slot,c.name])]);
  if(signature!==toolsSignature){toolsSignature=signature;tools.replaceChildren();
   if(current==='Messages'){tools.append(tabs(),channelPicker());}
   else if(current==='Overview'){tools.append(channelPicker(),button('All messages',()=>view('Messages')),button('Add channel',showAddChannel));}
  }
  if(current==='Direct Messages'){const panel=$('.dm-inbox');if(panel&&!panel.querySelector('.workspace-message-tabs'))panel.querySelector('.panel-heading').after(tabs());}
  const messaging=['Messages','Direct Messages','Search'].includes(current);
  sidebarNav.querySelector('[data-view="Messages"]').classList.toggle('active',messaging);
  // Message updates must not close Tools while the user is choosing an action.
  moreGroup.querySelector('summary').classList.toggle('active',['Activity','Diagnostics'].includes(current));
  if(current==='Direct Messages')$('#crumb').textContent='Messages / Direct messages';
  if(current==='Nodes')$('#crumb').textContent='Contacts';
  sidebarNav.querySelector('[data-view="Messages"]').setAttribute('aria-label','Messages — channels and direct messages');
 }
 const previousView=view;view=function(name){previousView(name);moreGroup.open=['Activity','Diagnostics'].includes(name);refresh();};
 const previousMessages=renderMessages;renderMessages=function(){previousMessages();refresh();};
 const previousInbox=renderDMInbox;renderDMInbox=function(){previousInbox();refresh();};
 const previousUnread=refreshUnreadBadges;refreshUnreadBadges=function(){previousUnread();const nav=sidebarNav.querySelector('[data-view="Messages"]');nav.querySelector('b')?.remove();const count=ensureAttention().unread(live.messages).length;if(count)nav.append(unreadBadge(count));moreGroup.querySelector('.sidebar-unread')?.remove();};
 const messagesNav=sidebarNav.querySelector('[data-view="Messages"]');messagesNav.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();openChannels();});
 document.addEventListener('click',e=>{document.querySelectorAll('.message-more[open]').forEach(menu=>{if(!menu.contains(e.target))menu.open=false;});});
 renderChannels();refresh();refreshUnreadBadges();
})();
