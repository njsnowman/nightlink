/* Search retained messages without requesting data from the radio. */
const searchState={query:'',channel:'',contact:'',from:'',to:'',mentions:false,limit:50};
let searchOwner=live.identity?.key,searchFocusId=null;
const searchNav=document.createElement('button');searchNav.dataset.view='Search';searchNav.innerHTML='⌕ <span>Search messages</span>';$('nav [data-view="Direct Messages"]').after(searchNav);
const searchShortcut=document.createElement('button');searchShortcut.id='open-message-search';searchShortcut.className='search-shortcut';searchShortcut.textContent='⌕ Search';searchShortcut.title='Search saved messages (Ctrl+K)';searchShortcut.onclick=()=>{view('Search');$('#history-query').focus();};$('.header-actions').prepend(searchShortcut);
function searchContactKey(m){if(m.own)return null;return messageContact(m)?.key;}
function appendSearchOption(select,value,label){const option=document.createElement('option');option.value=value;option.textContent=label;select.append(option);}
function highlightedSearchText(text,query){const fragment=document.createDocumentFragment(),needle=query.trim();if(!needle){fragment.append(document.createTextNode(text));return fragment;}const safe=needle.replace(/[.*+?^$()|[\]\\{}]/g,'\\$&'),expression=new RegExp(safe,'giu');let at=0,match;while((match=expression.exec(text))){fragment.append(document.createTextNode(text.slice(at,match.index)));const mark=document.createElement('mark');mark.textContent=match[0];fragment.append(mark);at=match.index+match[0].length;}fragment.append(document.createTextNode(text.slice(at)));return fragment;}
function openSearchMessage(message){
 const m=live.messages.find(m=>m.id===message.id);if(!m){toast('This message is no longer in saved history.');return;}
 messageWindow.focus=m.id;searchFocusId=m.id;pendingReadingJump=m.id;selectConversation({...m.target});
 requestAnimationFrame(()=>{
  pendingReadingJump=null;if(live.selected&&conversationId(live.selected)===m.conversation){
   const row=[...chatReadingLog.querySelectorAll('.message')].find(row=>row.dataset.messageId===m.id);if(!row)return;
   chatReadingLog.scrollTop+=row.getBoundingClientRect().top-chatReadingLog.getBoundingClientRect().top-chatReadingLog.clientHeight/2+Math.min(row.clientHeight,chatReadingLog.clientHeight)/2;
   row.classList.add('search-message-focus');row.tabIndex=-1;row.focus({preventScroll:true});captureReading();markVisibleReading();jumpNewest.hidden=atReadingEnd(chatReadingLog);
  }
 });
}
function renderSearchResults(){
 const holder=$('#history-results');if(!holder)return;
 const result=NightlinkSearch.search(live.messages,{...searchState,selfName:live.identity?.name},searchContactKey);
 holder.replaceChildren();$('#history-result-count').textContent=result.error?'Invalid date range':result.messages.length+' '+(result.messages.length===1?'message':'messages')+' found';
 if(result.error||!result.messages.length){const empty=document.createElement('p');empty.className='search-empty';empty.textContent=result.error||(live.messages.length?'No messages match these filters.':'No saved messages yet. Connect a radio to begin collecting history.');holder.append(empty);}
 for(const m of result.messages.slice(0,searchState.limit)){
  const button=document.createElement('button');button.type='button';button.className='history-result';button.dataset.messageId=m.id;
  const identity=document.createElement('div');identity.className='history-result-meta';const name=document.createElement('strong'),where=document.createElement('span'),time=document.createElement('time');
  name.textContent=m.own?'You':cardName(searchContactKey(m),m.sender||'Mesh');
  where.textContent=m.target.kind==='channel'?'# '+m.target.name:'DM · '+cardName(m.target.key,m.target.name||m.sender);
  time.textContent=Number.isFinite(m.timestamp)?new Date(m.timestamp*1000).toLocaleString():'Unknown date';
  identity.append(name,where,time);const text=document.createElement('p');text.append(highlightedSearchText(m.text,searchState.query));const action=document.createElement('small');action.textContent='Open in conversation ↗';button.append(identity,text,action);button.onclick=()=>openSearchMessage(m);holder.append(button);
 }
 const more=$('#history-more');more.hidden=result.messages.length<=searchState.limit;more.textContent='Show next '+Math.min(50,result.messages.length-searchState.limit);more.onclick=()=>{searchState.limit+=50;renderSearchResults();};
}
function renderMessageSearch(){
 $('#title').textContent='Search your messages.';$('#subtitle').textContent='Saved history on this computer · available offline';
 const panel=document.createElement('section');panel.className='panel history-search';panel.innerHTML='<div class="panel-heading"><h2>Message archive</h2><span class="search-local">LOCAL HISTORY</span></div><form id="history-search-form"><label class="history-query-label">Search message text<input type="search" id="history-query" placeholder="Find a message…" autocomplete="off"></label><div class="history-filters"><label>Contact<select id="history-contact"><option value="">All contacts</option></select></label><label>Channel<select id="history-channel"><option value="">Channels and DMs</option></select></label><label>From<input id="history-from" type="date"></label><label>Through<input id="history-to" type="date"></label><label class="history-mentions"><input id="history-mentions" type="checkbox"> Mentions of me</label><button id="history-clear" type="button">Clear filters</button></div></form><div class="history-results-heading"><span id="history-result-count" role="status"></span><small>Newest first · retained messages only</small></div><div id="history-results"></div><button id="history-more" type="button" hidden></button>';alternate.replaceChildren(panel);
 const contacts=new Map(live.contacts.filter(c=>c.type===1).map(c=>[c.key,cardName(c.key,c.name)]));
 for(const m of live.messages){if(m.target?.kind==='direct')contacts.set(m.target.key,cardName(m.target.key,m.target.name||m.sender));else{const key=searchContactKey(m);if(key&&!contacts.has(key))contacts.set(key,cardName(key,m.sender));}}
 for(const [key,name]of [...contacts].sort((a,b)=>a[1].localeCompare(b[1])))appendSearchOption($('#history-contact'),key,name);
 const channels=new Map(live.channels.map(c=>[conversationId({kind:'channel',...c}),c.name]));
 for(const m of live.messages)if(m.target?.kind==='channel')channels.set(m.conversation,m.target.name);
 for(const [id,name]of channels)appendSearchOption($('#history-channel'),id,'# '+name);
 for(const [field,id]of [['query','history-query'],['contact','history-contact'],['channel','history-channel'],['from','history-from'],['to','history-to'],['mentions','history-mentions']]){
  const input=$('#'+id);if(field==='mentions')input.checked=searchState[field];else input.value=searchState[field];
  input.addEventListener(field==='query'?'input':'change',()=>{searchState[field]=field==='mentions'?input.checked:input.value;searchState.limit=50;renderSearchResults();});
 }
 $('#history-mentions').disabled=!live.identity?.name;
 $('#history-search-form').onsubmit=e=>{e.preventDefault();renderSearchResults();$('#history-results .history-result')?.focus();};
 $('#history-clear').onclick=()=>{Object.assign(searchState,{query:'',contact:'',channel:'',from:'',to:'',mentions:false,limit:50});renderMessageSearch();$('#history-query').focus();};
 renderSearchResults();
}
const searchView=view;view=function(name){searchView(name);if(name==='Search')renderMessageSearch();};
const searchMessagesRender=renderMessages;renderMessages=function(){searchMessagesRender();if(searchFocusId){const row=[...chatReadingLog.querySelectorAll('.message')].find(r=>r.dataset.messageId===searchFocusId);if(row)row.classList.add('search-message-focus');}};
document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();view('Search');$('#history-query').focus();}});
radioSession.addEventListener('message',()=>{if(current==='Search')renderSearchResults();});
radioSession.addEventListener('identity',()=>{if(searchOwner!==live.identity?.key){searchOwner=live.identity?.key;Object.assign(searchState,{query:'',contact:'',channel:'',from:'',to:'',mentions:false,limit:50});searchFocusId=null;if(current==='Search')renderMessageSearch();}});
for(const event of ['contacts','channels'])radioSession.addEventListener(event,()=>{if(current==='Search')renderMessageSearch();});
const searchCardRefresh=refreshCards;refreshCards=function(){searchCardRefresh();if(current==='Search')renderMessageSearch();};
if(current==='Search')renderMessageSearch();
