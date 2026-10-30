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
 action('radio-page-diagnostics','Diagnostics & health','Review saved connection and radio evidence.','Settings',()=>view('Diagnostics'))]]];
 for(const [title,subtitle,buttons]of entries){const group=document.createElement('section');group.className='nl-radio-group';const heading=document.createElement('h3'),note=document.createElement('p'),list=document.createElement('div');heading.textContent=title;note.textContent=subtitle;list.className='nl-radio-action-list';list.append(...buttons);group.append(heading,note,list);groups.append(group);}
 const more=document.createElement('details');more.className='nl-radio-more';const moreTitle=document.createElement('summary');moreTitle.textContent='Data & device details';const exports=document.createElement('div');exports.className='nl-radio-exports';for(const [id,title,description]of [['export-history','Export message history','Save this radio’s retained messages.'],['export-diagnostics','Export diagnostic log','Save local connection and command evidence.']]){const b=q('#'+id);if(b)exports.append(card(b,title,description,'Export'));}more.append(moreTitle,exports);root.append(more);
 const tabs=workbench.querySelector('.radio-workbench-tabs');tabs.addEventListener('click',e=>{if(e.target.closest('button'))workbench.scrollIntoView({block:'start'});});
 const back=document.createElement('button');back.type='button';back.className='nl-radio-back';back.textContent='Back to radio tools';back.onclick=()=>root.scrollIntoView({block:'start'});workbench.querySelector('.panel-heading').append(back);
 function update(){const data=live.identity||radioSession.identity||{},ready=live.sync==='ready'&&ble.state==='connected';name.textContent=data.name||'Connect your radio';model.textContent=[data.model||'MeshCore companion',ready?ble.label+' connected':ble.state==='connected'?'Synchronization in progress':'Saved device details · offline'].filter(Boolean).join(' · ');factValues.frequency.textContent=Number.isFinite(data.frequency)?data.frequency+' MHz':'—';factValues.txPower.textContent=Number.isFinite(data.txPower)?data.txPower+' dBm':'—';factValues.version.textContent=data.version||'Not reported';state.dataset.ready=String(ready);state.dataset.error=String(live.sync==='error'||!!live.storageError);}
 for(const event of ['identity','sync','stats','contacts','disconnected'])radioSession.addEventListener(event,update);ble.addEventListener('state',update);
 return{mount(){root.prepend(status);more.append(radioPanel);radioPanel.hidden=false;alternate.prepend(root);update();}};
 }
 let pageUI=null;const previous=view;view=function(page){const result=previous(page);alternate.classList.toggle('nl-radio-page',page==='Radio');if(page==='Radio'){if(!pageUI)pageUI=build();pageUI?.mount();}return result;};
 if(current==='Radio'){pageUI=build();pageUI?.mount();alternate.classList.add('nl-radio-page');}
})();
