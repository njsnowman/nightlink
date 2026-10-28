/* Explicit preview and confirmation; never starts from contact discovery. */
(()=>{
 let running=false;
 const unavailable=()=>running||live.sync!=='ready'||ble.state!=='connected'||live.sending||radioSession.configuring;
 function mount(holder,id){if(!holder||document.getElementById(id))return;const button=document.createElement('button');button.id=id;button.type='button';button.className='radio-manage contact-delete-action';button.textContent='Remove all except favorites';button.disabled=unavailable();button.onclick=preview;holder.append(button);}
 function refresh(){for(const id of ['bulk-contact-remove','tools-bulk-contact-remove']){const b=document.getElementById(id);if(b)b.disabled=unavailable();}}
 function preview(){
  if(unavailable()){toast('Connect and finish radio operations before removing contacts.');return;}
  const owner=live.identity?.key,generation=radioSession.generation,plan=NightlinkBulkContactRemoval.plan(live.contacts,favoriteKeys,owner);
  modal('Remove all except favorites','<section id="bulk-contact-panel"><p id="bulk-contact-summary"></p><p>Favorites are the contacts you starred in Nightlink on this computer. All contact types are included. Saved messages, nicknames, photos, notes and favorites stay on this computer.</p><p id="bulk-contact-warning"></p><details><summary>Review contacts to remove</summary><ul id="bulk-contact-targets"></ul></details><details><summary>Favorites to keep</summary><ul id="bulk-contact-kept"></ul></details><label class="bulk-contact-ack"><input type="checkbox" id="bulk-contact-ack"> I understand these contacts will be removed from the connected radio.</label><p id="bulk-contact-progress" role="status" aria-live="polite"></p><div class="delete-contact-actions"><button type="button" id="bulk-contact-cancel">Cancel</button><button type="button" id="bulk-contact-confirm" class="contact-delete-action">Remove non-favorites</button></div></section>');
  const panel=document.getElementById('bulk-contact-panel'),confirm=panel.querySelector('#bulk-contact-confirm'),cancel=panel.querySelector('#bulk-contact-cancel'),ack=panel.querySelector('#bulk-contact-ack'),status=panel.querySelector('#bulk-contact-progress');
  panel.querySelector('#bulk-contact-summary').textContent=plan.remove.length+' contacts to remove; '+plan.keep.length+' favorites to keep.';
  panel.querySelector('#bulk-contact-warning').textContent=plan.keep.length?'Contacts discovered after this preview are left alone. Large lists may take a while to verify.':'No favorites are saved for the loaded contacts. This will remove every contact shown below. Star any contacts you want to keep before proceeding.';
  for(const [id,list] of [['bulk-contact-targets',plan.remove],['bulk-contact-kept',plan.keep]]){const ul=panel.querySelector('#'+id);for(const c of list){const li=document.createElement('li');li.textContent=cardName(c.key,c.name)+' · '+c.key.slice(0,12);li.title=c.key;ul.append(li);}if(!list.length){const li=document.createElement('li');li.textContent='None';ul.append(li);}}
  confirm.disabled=true;ack.onchange=()=>confirm.disabled=!ack.checked||!plan.remove.length||unavailable();
  let stop=false;cancel.onclick=()=>document.getElementById('dialog').close();
  confirm.onclick=async()=>{
   if(!ack.checked||!plan.remove.length||unavailable())return;
   if(owner!==live.identity?.key||generation!==radioSession.generation){status.textContent='Radio connection changed. Close this preview and start again.';confirm.disabled=true;return;}
   running=true;refresh();confirm.disabled=true;ack.disabled=true;cancel.textContent='Stop after current contact';cancel.onclick=()=>{stop=true;cancel.disabled=true;status.textContent='Stopping after the current contact is verified…';};
   const dialog=document.getElementById('dialog'),closed=()=>{stop=true;};dialog.addEventListener('close',closed);
   const guard=()=>{if(stop||!panel.isConnected||!dialog.open){const e=Error('Stopped at your request.');e.code='BULK_CONTACT_STOP';throw e;}if(owner!==live.identity?.key||generation!==radioSession.generation||live.sync!=='ready'||ble.state!=='connected'||live.sending)throw Error('Radio or sending state changed. Refresh before starting a new preview.');};
   status.textContent='Removing contacts one at a time and verifying each radio update…';
   try{const result=await NightlinkBulkContactRemoval.run({keys:plan.remove.map(c=>c.key),guard,protectedKey:key=>favoriteKeys.has(key),present:key=>live.contacts.some(c=>c.key===key),remove:(key,options)=>radioSession.removeContact(key,options),progress:r=>{if(panel.isConnected)status.textContent=r.removed+' verified removals; '+r.skipped+' skipped; '+r.total+' originally selected.';}});
    const summary=result.removed+' contacts removed and verified; '+result.skipped+' skipped. '+(result.state==='complete'?'Finished.':result.state==='stopped'?'Stopped.':'Stopped after an error. '+result.error+' The last operation may be unverified; refresh contacts before retrying.');
    if(panel.isConnected&&dialog.open){status.textContent=summary;cancel.disabled=false;cancel.textContent='Done';cancel.onclick=()=>dialog.close();}else toast(summary);
   }finally{running=false;dialog.removeEventListener('close',closed);refresh();}
  };
 }
 const nodes=renderNodes;renderNodes=function(...args){const result=nodes.apply(this,args);mount(document.querySelector('.nodes-panel .panel-heading'),'bulk-contact-remove');refresh();return result;};
 const tools=showRadioTools;showRadioTools=function(...args){const result=tools.apply(this,args);mount(document.querySelector('.radio-tools .tools-actions'),'tools-bulk-contact-remove');return result;};toolsButton.onclick=showRadioTools;
 for(const name of ['sync','contacts','identity'])radioSession.addEventListener(name,refresh);ble.addEventListener('state',refresh);window.addEventListener('nightlink-delivery',refresh);
 window.NightlinkBulkContactRemovalUI={preview,get running(){return running;}};mount(document.querySelector('.nodes-panel .panel-heading'),'bulk-contact-remove');
})();
