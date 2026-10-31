/* Explicit removal from the connected radio; local history and personal cards stay. */
(()=>{
 let revision=0;
 const busy=()=>window.NightlinkBulkContactRemovalUI?.running||live.sync!=='ready'||ble.state!=='connected'||live.sending||radioSession.configuring;
 function showDelete(contact){
  const owner=live.identity?.key,generation=radioSession.generation,key=contact.key;
  modal('Remove contact from radio','<section id="delete-contact-panel"><p>Remove <strong id="delete-contact-name"></strong> from the connected radio?</p><p>Saved messages, nicknames, photos, notes and favorites stay on this computer. You may need to import the contact again before sending a DM.</p><p id="delete-contact-feedback" role="status"></p><div class="delete-contact-actions"><button type="button" id="delete-contact-cancel">Back to contact</button><button type="button" id="delete-contact-confirm" class="contact-delete-action">Remove from radio</button></div></section>');
  const panel=document.querySelector('#delete-contact-panel'),confirm=panel.querySelector('#delete-contact-confirm'),cancel=panel.querySelector('#delete-contact-cancel'),feedback=panel.querySelector('#delete-contact-feedback');panel.querySelector('#delete-contact-name').textContent=cardName(key,contact.name);
  const sameRadio=()=>owner===live.identity?.key&&generation===radioSession.generation;
  confirm.disabled=busy()||!sameRadio();feedback.textContent=confirm.disabled?'Reconnect this radio and finish the current operation before removing a contact.':'';
  cancel.onclick=()=>{if(sameRadio())openContactCard(contact);else document.querySelector('#dialog').close();};
  confirm.onclick=async()=>{
   if(busy()||!sameRadio()){feedback.textContent='The radio or connection changed. Reopen the contact and try again.';confirm.disabled=true;return;}
   if(!live.contacts.some(c=>c.key===key)){feedback.textContent='This contact is no longer saved on the connected radio.';confirm.disabled=true;return;}
   confirm.disabled=true;cancel.disabled=true;feedback.textContent='Removing contact and verifying the radio contact list…';
   try{await radioSession.removeContact(key);if(!sameRadio())return;if(panel.isConnected)document.querySelector('#dialog').close();toast('Contact removed from radio. Saved messages and personal details kept.');}
   catch(error){if(panel.isConnected){feedback.textContent=error.message||'Contact removal could not be verified. Refresh the radio data before trying again.';cancel.disabled=false;confirm.disabled=busy()||!sameRadio();}}
  };
 }
 const previous=openContactCard;openContactCard=async function(contact){const token=++revision,owner=live.identity?.key,generation=radioSession.generation;await previous(contact);if(token!==revision||owner!==live.identity?.key)return;const resolved=resolveContactDM(contact)||contact,key=resolved?.key,menu=document.querySelector('#contact-actions');if(!menu||resolved.localSender||!/^[a-f0-9]{64}$/i.test(key||'')||!live.contacts.some(c=>c.key===key))return;const button=document.createElement('button');button.type='button';button.id='contact-delete';button.className='contact-delete-action';button.textContent='Remove from radio';button.disabled=busy();button.title=button.disabled?'Connect and finish radio operations before removing a contact':'Remove this contact from the radio; keep local messages and personal details';button.onclick=()=>{if(owner!==live.identity?.key||generation!==radioSession.generation){document.querySelector('#dialog').close();toast('Radio connection changed. Reopen the contact before removing it.');return;}showDelete(resolved);};menu.append(button);};
 function refresh(){const button=document.querySelector('#contact-delete');if(button)button.disabled=busy();}
 for(const name of ['sync','contacts','identity'])radioSession.addEventListener(name,refresh);ble.addEventListener('state',refresh);window.addEventListener('nightlink-delivery',refresh);
})();
