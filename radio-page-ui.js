/* Main Radio landing page. Reuse existing controls and keep workspaces authoritative. */
(()=>{
 function build(){
 const q=s=>document.querySelector(s),root=document.createElement('section');root.id='radio-page-hub';root.className='nl-radio-hub';
 const status=q('#radio-status-panel'),workbench=q('#radio-workbench');if(!status||!workbench)return;
 const identity=document.createElement('div');identity.className='nl-radio-identity';identity.append(NightlinkDesign.icon('Radio',true));const nameBox=document.createElement('div');nameBox.className='nl-radio-name';const eyebrow=document.createElement('span');eyebrow.className='nl-radio-eyebrow';eyebrow.textContent='YOUR RADIO';const name=document.createElement('h2'),model=document.createElement('p');nameBox.append(eyebrow,name,model);identity.append(nameBox);const state=q('#radio-status-title');state.classList.add('nl-radio-state');identity.append(state);status.prepend(identity);
 const facts=document.createElement('dl');facts.className='nl-radio-facts';const factValues={};for(const [key,label]of [['frequency','Frequency'],['txPower','TX power'],['version','Firmware']]){const row=document.createElement('div'),dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label;row.append(dt,dd);facts.append(row);factValues[key]=dd;}identity.after(facts);
 const evidence=document.createElement('details');evidence.className='nl-radio-sync-evidence';const summary=document.createElement('summary');summary.textContent='Connection & synchronization details';evidence.append(summary,status.querySelector('.radio-status-metrics'),q('#radio-status-error'));status.append(evidence);
 const groups=document.createElement('div');groups.className='nl-radio-groups';root.append(status,groups);
 function card(button,title,description,iconText){button.type='button';button.classList.add('nl-radio-action');button.setAttribute('aria-label',title);const copy=document.createElement('span');copy.className='nl-radio-action-copy';const strong=document.createElement('strong'),hint=document.createElement('span');strong.textContent=title;hint.textContent=description;copy.append(strong,hint);const arrow=document.createElement('span');arrow.className='nl-radio-action-arrow';arrow.setAttribute('aria-hidden','true');arrow.textContent='›';button.replaceChildren(NightlinkDesign.icon(iconText),copy,arrow);return button;}
 function action(id,title,description,iconText,run){const b=document.createElement('button');b.id=id;b.onclick=run;return card(b,title,description,iconText);}
 function openTool(label){const tab=[...workbench.querySelectorAll('.radio-workbench-tabs button')].find(b=>b.textContent===label);if(tab){tab.click();workbench.scrollIntoView({block:'start'});}}
 const entries=[
 ['Device & setup','Configure your connected hardware.',[
 action('radio-page-device-center','Device Center','Inspect and configure companions, repeaters and rooms.','Device',()=>showDeviceCenter()),
 card(q('#radio-tools-open'),'Radio Tools','Adverts, signed contacts and channel setup.','Radio'),
 action('radio-page-cli','Command terminal','Open a local or authenticated remote command line.','Terminal',()=>showRadioTerminal())]],
 ['Routes & discovery','Explore how your mesh connects.',[
 action('radio-page-trace','Trace a route','Choose a repeater and review a manual trace.','Route',()=>openTool('Trace Path')),
 action('radio-page-los','Plan line of sight','Compare terrain-free distance and geometry offline.','Map',()=>openTool('Line of Sight')),
 action('radio-page-discover','Find nearby nodes','Open discovery and choose when to start a scan.','Discover',()=>showNodeDiscovery())]],
 ['Observe & diagnose','Understand your radio activity.',[
 action('radio-page-rx','Receive log','Inspect packets already arriving at your radio.','Terminal',()=>openTool('RX Log')),
 action('radio-page-noise','Noise measurement','Open the noise tool; read a sample when ready.','Settings',()=>openTool('Noise Floor')),
 action('radio-page-diagnostics','Diagnostics & health','Review saved connection and radio evidence.','Settings',()=>view('Diagnostics')),
 action('radio-page-propagation','Propagation Monitor','Passively compare reception with this radio’s history.','Radio',()=>showPropagationMonitor())]]];
 for(const [title,subtitle,buttons]of entries){const group=document.createElement('section');group.className='nl-radio-group';const heading=document.createElement('h3'),note=document.createElement('p'),list=document.createElement('div');heading.textContent=title;note.textContent=subtitle;list.className='nl-radio-action-list';list.append(...buttons);group.append(heading,note,list);groups.append(group);}
 const more=document.createElement('details');more.className='nl-radio-more';const moreTitle=document.createElement('summary');moreTitle.textContent='Data & device details';const exports=document.createElement('div');exports.className='nl-radio-exports';for(const [id,title,description]of [['export-history','Export message history','Save this radio’s retained messages.'],['export-diagnostics','Export diagnostic log','Save local connection and command evidence.']]){const b=q('#'+id);if(b)exports.append(card(b,title,description,'Export'));}more.append(moreTitle,exports);root.append(more);
 const tabs=workbench.querySelector('.radio-workbench-tabs');tabs.addEventListener('click',e=>{if(e.target.closest('button'))workbench.scrollIntoView({block:'start'});});
 const back=document.createElement('button');back.type='button';back.className='nl-radio-back';back.textContent='Back to radio tools';back.onclick=()=>root.scrollIntoView({block:'start'});workbench.querySelector('.panel-heading').append(back);
 function update(){const data=live.identity||radioSession.identity||{},ready=live.sync==='ready'&&ble.state==='connected';name.textContent=data.name||'Connect your radio';model.textContent=[data.model||'MeshCore companion',ready?ble.label+' connected':ble.state==='connected'?'Synchronization in progress':'Saved device details · offline'].filter(Boolean).join(' · ');factValues.frequency.textContent=Number.isFinite(data.frequency)?data.frequency+' MHz':'—';factValues.txPower.textContent=Number.isFinite(data.txPower)?data.txPower+' dBm':'—';factValues.version.textContent=data.version||'Not reported';state.dataset.ready=String(ready);state.dataset.error=String(live.sync==='error'||!!live.storageError);}
 for(const event of ['identity','identity-updated','sync','stats','contacts','disconnected'])radioSession.addEventListener(event,update);ble.addEventListener('state',update);
 return{mount(){root.prepend(status);more.append(radioPanel);radioPanel.hidden=false;alternate.prepend(root);update();}};
 }
 let pageUI=null;const previous=view;view=function(page){const result=previous(page);alternate.classList.toggle('nl-radio-page',page==='Radio');if(page==='Radio'){if(!pageUI)pageUI=build();pageUI?.mount();}return result;};
 if(current==='Radio'){pageUI=build();pageUI?.mount();alternate.classList.add('nl-radio-page');}
})();
/* BBS / IRC workspace is an opt-in presentation of existing Messages and RF state. */
(()=>{
 const alternate=document.getElementById('alternate'),conversation=document.querySelector('.conversation');if(!alternate||!conversation)return;
 const make=(tag,cls,text)=>{const node=document.createElement(tag);if(cls)node.className=cls;if(text!=null)node.textContent=text;return node;};
 const shell=make('section','bbs-irc-shell');shell.setAttribute('aria-label','BBS and IRC workspace');
 const masthead=make('div','bbs-masthead'),mastArt=make('div','bbs-ansi-art');mastArt.setAttribute('role','img');mastArt.setAttribute('aria-label','Original ANSI-style radio mast and NIGHTLINK block-letter wordmark');
 const towerArt=document.createElement('pre'),wordArt=document.createElement('pre');towerArt.className='bbs-ansi-tower';wordArt.className='bbs-ansi-wordmark';towerArt.setAttribute('aria-hidden','true');wordArt.setAttribute('aria-hidden','true');
 const towerLines=[['       ░░░       ','dim'],['      ░▒█▒░      ','olive'],['   ░▒▓█████▓▒░   ','khaki'],[' ░▒▓██▀     ▀██▓▒░','green'],['      ▀███▀      ','olive'],['        ██        ','khaki'],['    ▄▄▄███▄▄▄    ','green'],['        ██        ','khaki'],['       ▄███▄       ','olive'],['      ▟█████▙      ','khaki'],['      ▀█████▀      ','green']];
 for(const [line,color]of towerLines){const span=make('span','ansi-'+color,line);towerArt.append(span,document.createTextNode('\n'));}
 const glyphs={N:['█   █','██  █','█ █ █','█  ██','█   █'],I:['█████','  █  ','  █  ','  █  ','█████'],G:[' ████','█    ','█ ███','█   █',' ████'],H:['█   █','█   █','█████','█   █','█   █'],T:['█████','  █  ','  █  ','  █  ','  █  '],L:['█    ','█    ','█    ','█    ','█████'],K:['█  █ ','█ █  ','██   ','█ █  ','█  █ ']};
 const word='NIGHTLINK',ink=['green','khaki','olive','green','khaki','olive','green','khaki','olive'];
 for(let row=0;row<5;row++){for(let i=0;i<word.length;i++){wordArt.append(make('span','ansi-'+ink[i],glyphs[word[i]][row]));if(i<word.length-1)wordArt.append(document.createTextNode(' '));}if(row<4)wordArt.append(document.createTextNode('\n'));}
 mastArt.append(towerArt,wordArt);const mastCopy=make('div','bbs-masthead-copy');mastCopy.append(make('span','bbs-kicker','FIELD BBS // MESH RADIO'),make('strong','bbs-title','BBS / IRC'),make('span','bbs-subtitle','CHANNEL ACCESS · LOCAL FIRST'));
 masthead.append(mastArt,mastCopy);
 const mastState=make('span','bbs-masthead-state','RADIO LINK · OFFLINE');mastState.setAttribute('role','status');masthead.append(mastState);
 const grid=make('div','bbs-workspace-grid'),channels=make('nav','bbs-channel-rail');channels.setAttribute('aria-label','Radio channels');
 const channelHeader=make('div','bbs-rail-heading');channelHeader.append(make('span',null,'CHANNEL DIRECTORY'),make('span','bbs-rail-count','0'));channels.append(channelHeader);
 const channelList=make('div','bbs-channel-list'),channelNote=make('p','bbs-rail-note','Connect a radio to load its configured channels.');channels.append(channelList,channelNote);
 const status=make('section','bbs-status-rail');status.setAttribute('aria-label','Radio and RF monitor status');
 const linkCard=make('section','bbs-rail-card bbs-link-card');linkCard.append(make('span','bbs-kicker','RADIO LINK'));
 const linkValue=make('strong','bbs-link-value','Offline');linkCard.append(linkValue,make('p','bbs-card-detail','Saved messages stay on this computer.'));status.append(linkCard);
 const countCard=make('section','bbs-rail-card bbs-count-card');countCard.append(make('span','bbs-kicker','LOCAL DIRECTORY'));
 const counts=make('div','bbs-count-grid'),channelCount=make('strong',null,'0'),contactCount=make('strong',null,'0');
 for(const [label,value]of [['CHANNELS',channelCount],['CONTACTS',contactCount]]){const item=make('div','bbs-count-item');item.append(make('span',null,label),value);counts.append(item);}countCard.append(counts);status.append(countCard);
 const rfCard=make('section','bbs-rail-card bbs-rf-card');rfCard.append(make('span','bbs-kicker','RF MONITOR'));
 const rfState=make('strong','bbs-rf-state','Monitoring unavailable');rfCard.append(rfState);
 const rfChart=document.createElementNS('http://www.w3.org/2000/svg','svg');rfChart.classList.add('bbs-rf-chart');rfChart.setAttribute('viewBox','0 0 280 88');rfChart.setAttribute('role','img');rfChart.setAttribute('aria-label','Received packets per monitored hour');rfCard.append(rfChart);
 const rfEmpty=make('p','bbs-rf-empty','No monitored hours yet.');rfCard.append(rfEmpty,make('p','bbs-card-detail','Received packets per covered hour. Gaps mean no coverage.'));
 const openMonitor=make('button','bbs-open-monitor','Open full RF monitor');openMonitor.type='button';openMonitor.onclick=()=>window.showPropagationMonitor?.();rfCard.append(openMonitor);status.append(rfCard);
 grid.append(channels,conversation,status);shell.append(masthead,grid);
 const setState=(node,value)=>{node.dataset.state=value;};
 function paintChannels(){const list=Array.isArray(live?.channels)?live.channels:[],selected=live?.selected;channelHeader.lastElementChild.textContent=String(list.length);channelList.replaceChildren();
  if(!list.length){channelNote.hidden=false;return;}channelNote.hidden=true;
  for(const channel of list){const button=make('button','bbs-channel-button');button.type='button';const name=String(channel.name||'').replace(/^#\s*/,'');button.append(make('span','bbs-channel-hash','#'),make('span','bbs-channel-name',name||'Channel '+channel.slot));
   button.setAttribute('aria-pressed',String(selected?.kind==='channel'&&selected.slot===channel.slot&&selected.id===channel.id));button.onclick=()=>selectConversation({kind:'channel',...channel});channelList.append(button);}}
 function paintMonitor(){const monitor=window.NightlinkPropagationUI?.monitor;let snapshot=null;try{snapshot=monitor?.summary?.(Date.now())||null;}catch{}
  const stateName=snapshot?.state||'unavailable',label=window.NightlinkPropagation?.labels?.[stateName]||'Monitoring unavailable';rfState.textContent=label;setState(rfCard,stateName);rfChart.replaceChildren();
  const trend=Array.isArray(snapshot?.trend)?snapshot.trend.slice(-24):[],covered=trend.some(point=>Number.isFinite(point.packets));rfChart.setAttribute('aria-label','Received packets per monitored hour, last '+trend.length+' hours. Gaps mark hours without monitoring coverage.');
  if(covered){const max=Math.max(1,...trend.map(point=>Number.isFinite(point.packets)?point.packets:0)),width=280/Math.max(1,trend.length);
   trend.forEach((point,index)=>{const rect=document.createElementNS(rfChart.namespaceURI,'rect');rect.setAttribute('x',String(index*width+1));rect.setAttribute('width',String(Math.max(1,width-2)));rect.setAttribute('rx','2');
    if(Number.isFinite(point.packets)){const height=Math.max(2,point.packets/max*68);rect.setAttribute('y',String(78-height));rect.setAttribute('height',String(height));rect.setAttribute('class','bbs-rf-bar');}
    else{rect.setAttribute('y','76');rect.setAttribute('height','4');rect.setAttribute('class','bbs-rf-gap');}rfChart.append(rect);});}
  rfChart.hidden=!covered;rfEmpty.hidden=covered;}
 function paint(){if(document.documentElement.dataset.theme!=='bbs-camo'||current!=='Messages')return;const ready=live?.sync==='ready';mastState.textContent=ready?'RADIO LINK · READY':'RADIO LINK · OFFLINE';setState(shell,ready?'ready':'offline');
  linkValue.textContent=ready?'Ready · Bluetooth':'Offline';setState(linkCard,ready?'ready':'offline');linkCard.querySelector('.bbs-card-detail').textContent=ready?'Radio synchronized.':'Saved messages stay on this computer.';
  channelCount.textContent=String(live?.channels?.length||0);contactCount.textContent=String(live?.contacts?.length||0);paintChannels();paintMonitor();}
 function layout(name=current){const enabled=document.documentElement.dataset.theme==='bbs-camo'&&name==='Messages';alternate.classList.toggle('bbs-irc-active',enabled);
  if(enabled){grid.replaceChildren(channels,conversation,status);alternate.replaceChildren(shell);paint();}
  else if(shell.parentElement===alternate)alternate.replaceChildren(conversation);}
 const oldView=view;view=function(name){const result=oldView(name);layout(name);return result;};
 const oldRender=renderMessages;renderMessages=function(...args){const result=oldRender.apply(this,args);paint();return result;};
 window.addEventListener('nightlink-theme',()=>{if(current==='Messages')view('Messages');});
 for(const eventName of ['sync','channels','contacts','identity','message','disconnected'])radioSession.addEventListener(eventName,paint);ble.addEventListener('state',paint);document.addEventListener('visibilitychange',paint);setInterval(paint,5000);layout();
})();
