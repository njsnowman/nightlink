/* Command palette (Ctrl+P): type to jump to a page, channel, contact or action. Both interfaces.
   Navigation only: it calls the same functions as the menus and sends nothing to the radio. */
(function(root){
 'use strict';
 // Ranking: prefix of label > word prefix > substring > in-order letters. Lower is better; null hides the item.
 function score(label,query){
  const l=String(label).toLocaleLowerCase(),q=String(query).trim().toLocaleLowerCase();
  if(!q)return 0;if(l.startsWith(q))return 1;if(l.split(/[\s#=·:/-]+/).some(w=>w.startsWith(q)))return 2;if(l.includes(q))return 3;
  let i=0;for(const c of l)if(c===q[i])i++;return i===q.length?4:null;
 }
 function filter(items,query,limit=40){return items.map((item,index)=>({item,index,s:score(item.label+' '+(item.keywords||''),query)})).filter(x=>x.s!=null).sort((a,b)=>a.s-b.s||a.index-b.index).slice(0,limit).map(x=>x.item);}
 const core={score,filter};
 if(typeof module==='object'&&module.exports){module.exports=core;return;}
 const doc=root.document;root.NightlinkPalette=core;
 const PAGES=[['Overview','Nightlink home'],['Messages','chat'],['Nodes','contacts'],['Network map','map'],['Activity','log'],['Radio','companion'],['Search','find messages'],['Settings','preferences']];
 function items(){
  const out=[];const has=f=>typeof root[f]==='function'||typeof globalThis[f]==='function';const call=(f,...a)=>()=>(root[f]||globalThis[f])(...a);
  for(const [name,kw] of PAGES)out.push({group:'Page',label:name,keywords:kw,run:()=>view(name)});
  const L=typeof live==='object'?live:{channels:[],contacts:[]};
  for(const c of L.channels||[])out.push({group:'Channel',label:'#'+c.name,keywords:'channel slot '+c.slot,run:()=>selectConversation({kind:'channel',...c})});
  for(const n of L.contacts||[]){const name=typeof cardName==='function'?cardName(n.key,n.name):n.name;out.push({group:'Contact',label:name,keywords:n.name+' '+n.key.slice(0,12),run:()=>openContactCard(n)});}
  out.push({group:'Action',label:'Search messages',keywords:'find ctrl+k',run:()=>{view('Search');doc.querySelector('#history-query')?.focus();}});
  if(has('showAddChannel'))out.push({group:'Action',label:'Add or remove a channel',keywords:'join part',run:call('showAddChannel')});
  if(has('showDeviceCenter'))out.push({group:'Action',label:'Device Center',keywords:'firmware serial',run:call('showDeviceCenter')});
  const clickIf=(sel,label,kw)=>{if(doc.querySelector(sel))out.push({group:'Action',label,keywords:kw,run:()=>doc.querySelector(sel)?.click()});};
  out.push({group:'Action',label:'Radio connection',keywords:'connect bluetooth usb serial pair',run:()=>{if(typeof showBluetooth==='function')showBluetooth();else doc.querySelector('#connection')?.click();}});
  clickIf('#focus-mode-toggle','Focus mode (hide menus)','ctrl+b sidebar');clickIf('#compact-toggle','Compact or expand layout','density');clickIf('#open-activity-inbox','Activity inbox','alerts notifications');
  if(root.NightlinkFeedback){out.push({group:'Action',label:'Report a bug',keywords:'issue problem github feedback',run:()=>root.NightlinkFeedback.open('bug')});out.push({group:'Action',label:'Request a feature',keywords:'idea suggestion github feedback',run:()=>root.NightlinkFeedback.open('feature')});}
  if(root.NightlinkFirstRun)out.push({group:'Action',label:'Setup guide',keywords:'first run welcome connect radio getting started',run:()=>root.NightlinkFirstRun.open(0)});
  if(doc.querySelector('#open-help'))out.push({group:'Action',label:'Help',keywords:'guide handbook f1',run:()=>doc.querySelector('#open-help').click()});
  if(root.NightlinkInterface?.set)out.push({group:'Action',label:'Switch interface ('+(root.NightlinkInterface.isTerminal()?'Cards':'Terminal')+')',keywords:'theme cards terminal',run:()=>root.NightlinkInterface.set(root.NightlinkInterface.isTerminal()?'cards':'terminal')});
  return out;
 }
 let dialog,input,list,shown=[],active=0,opener=null;
 function build(){
  dialog=doc.createElement('dialog');dialog.id='cmd-palette';dialog.className='cmd-palette';dialog.setAttribute('aria-label','Go to');
  const title=doc.createElement('div');title.className='cmd-palette-title';title.textContent='Go to';
  input=doc.createElement('input');input.type='text';input.id='cmd-palette-input';input.autocomplete='off';input.spellcheck=false;input.placeholder='Page, #channel, contact or action';
  input.setAttribute('role','combobox');input.setAttribute('aria-expanded','true');input.setAttribute('aria-controls','cmd-palette-list');input.setAttribute('aria-autocomplete','list');
  list=doc.createElement('ul');list.id='cmd-palette-list';list.setAttribute('role','listbox');list.setAttribute('aria-label','Results');
  const hint=doc.createElement('p');hint.className='cmd-palette-hint';hint.textContent='↑↓ choose · Enter open · Esc close';
  dialog.append(title,input,list,hint);doc.body.append(dialog);
  input.addEventListener('input',()=>{active=0;paint();});
  input.addEventListener('keydown',e=>{if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();if(shown.length){active=(active+(e.key==='ArrowDown'?1:-1)+shown.length)%shown.length;paint(false);}}else if(e.key==='Enter'){e.preventDefault();choose(shown[active]);}});
  dialog.addEventListener('close',()=>{const o=opener;opener=null;if(o?.isConnected&&!dialog.dataset.ran)o.focus();delete dialog.dataset.ran;});
  dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
 }
 function paint(rebuild=true){
  if(rebuild){shown=filter(items(),input.value);list.replaceChildren();
   shown.forEach((item,i)=>{const li=doc.createElement('li');li.id='cmd-opt-'+i;li.setAttribute('role','option');li.className='cmd-palette-item';
    const g=doc.createElement('span');g.className='cmd-palette-group';g.textContent=item.group;const t=doc.createElement('span');t.className='cmd-palette-label';t.textContent=item.label;li.append(t,g);
    li.addEventListener('mousedown',e=>{e.preventDefault();choose(item);});li.addEventListener('mousemove',()=>{if(active!==i){active=i;paint(false);}});list.append(li);});
   if(!shown.length){const li=doc.createElement('li');li.className='cmd-palette-empty';li.textContent='No matches';list.append(li);}}
  list.querySelectorAll('[role=option]').forEach((li,i)=>{const on=i===active;li.setAttribute('aria-selected',String(on));li.classList.toggle('active',on);if(on)li.scrollIntoView({block:'nearest'});});
  if(shown.length)input.setAttribute('aria-activedescendant','cmd-opt-'+active);else input.removeAttribute('aria-activedescendant');
 }
 function open(){if(!dialog)build();if(dialog.open)return;if(doc.querySelector('dialog[open]'))return;opener=doc.activeElement;input.value='';active=0;paint();dialog.showModal();input.focus();}
 function choose(item){if(!item)return;dialog.dataset.ran='1';dialog.close();try{item.run();}catch(e){console.warn('Palette action failed',e);}}
 root.NightlinkPalette={...core,open,items};
 doc.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&!e.shiftKey&&!e.altKey&&e.key.toLowerCase()==='p'){e.preventDefault();open();}});
})(typeof window==='object'?window:globalThis);
