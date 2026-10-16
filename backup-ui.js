/* Backups stay local. Cards and the recovery journal commit in one IndexedDB transaction. */
let backupBusy=false,restoreRecoveryPending=false;
function backupStorage(){const storage=Object.create(null);for(const key of Object.keys(localStorage))if(NightlinkBackup.allowed(key))storage[key]=localStorage.getItem(key);return storage;}
function maintenanceRead(key){return new Promise((resolve,reject)=>{const r=cardDB.transaction('maintenance').objectStore('maintenance').get(key);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}
function maintenanceWrite(key,value){return new Promise((resolve,reject)=>{const tx=cardDB.transaction('maintenance','readwrite');if(value===undefined)tx.objectStore('maintenance').delete(key);else tx.objectStore('maintenance').put(value,key);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||new Error('Storage transaction cancelled.'));});}
function restoreDisconnected(){if(ble.state!=='disconnected'||live.sending)throw new Error('Disconnect your radio and finish pending sends before restoring.');}
async function rollbackRestore(){
 restoreDisconnected();const journal=await maintenanceRead('restore-journal');if(!journal)return;
 for(const key of Object.keys(journal.previous))localStorage.removeItem(key);
 for(const [key,value]of Object.entries(journal.previous))if(value!==null)localStorage.setItem(key,value);
 await new Promise((resolve,reject)=>{const tx=cardDB.transaction(['cards','maintenance'],'readwrite');for(const key of journal.addedCardKeys)tx.objectStore('cards').delete(key);tx.objectStore('maintenance').delete('restore-journal');tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||new Error('Recovery transaction cancelled.'));});
 restoreRecoveryPending=false;
}
async function applyBackup(backup){
 restoreDisconnected();await cardsReady;if(await maintenanceRead('restore-journal'))throw new Error('Recover the interrupted restore before importing another file.');
 const plan=NightlinkBackup.plan(backupStorage(),[...contactCards.values()],backup),previous=Object.create(null);
 for(const key of Object.keys(plan.writes))previous[key]=localStorage.getItem(key);
 const journal={previous,addedCardKeys:plan.cards.map(c=>c.key),createdAt:new Date().toISOString()};
 await new Promise((resolve,reject)=>{const tx=cardDB.transaction(['cards','maintenance'],'readwrite');tx.objectStore('maintenance').put(journal,'restore-journal');for(const card of plan.cards)tx.objectStore('cards').add(card);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||new Error('Could not stage restore.'));});
 try{for(const [key,value]of Object.entries(plan.writes))localStorage.setItem(key,value);await maintenanceWrite('last-restore',{at:new Date().toISOString(),summary:plan.summary});await maintenanceWrite('restore-journal',undefined);}
 catch(error){try{await rollbackRestore();}catch{restoreRecoveryPending=true;throw new Error('Restore stopped. Your previous data is retained in the recovery record. Use Recover interrupted restore after freeing storage.');}throw new Error('Restore failed; previous data was restored. '+error.message);}
 return plan.summary;
}
async function exportBackup(){
 if(backupBusy)return;backupBusy=true;
 try{await cardsReady;if(await maintenanceRead('restore-journal'))throw new Error('Recover the interrupted restore before exporting.');
 const storage=backupStorage();if(historyKey())storage[historyKey()]=JSON.stringify(live.messages.slice(-3000));
 const data=NightlinkBackup.validate({format:'nightlink-backup',version:1,createdAt:new Date().toISOString(),storage,cards:[...contactCards.values()]});
 const text=JSON.stringify(data);if(new TextEncoder().encode(text).length>NightlinkBackup.MAX_BYTES)throw new Error('Backup exceeds 50 MB. Export message history separately or reduce saved photos.');
 if(window.meshlineBackup){const result=await window.meshlineBackup.save(text);if(result.cancelled)return;if(!result.saved)throw new Error('Backup was not saved.');try{await maintenanceWrite('last-export',{at:data.createdAt,confirmed:true});await refreshBackupMetadata();}catch{toast('Backup saved, but its timestamp could not be recorded.');return;}toast('Backup saved.');return;}
 const url=URL.createObjectURL(new Blob([text],{type:'application/json'})),link=document.createElement('a');link.href=url;link.download='nightlink-backup-'+new Date().toISOString().replace(/[:.]/g,'-')+'.json';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
 try{await maintenanceWrite('last-export',data.createdAt);await refreshBackupMetadata();}catch{toast('Backup export started, but its timestamp could not be recorded.');return;}toast('Backup export started. Keep the downloaded file somewhere private.');
 }catch(error){toast('Backup could not be exported: '+error.message);}finally{backupBusy=false;}
}
async function previewBackupFile(file){
 if(!file||backupBusy)return;backupBusy=true;
 try{restoreDisconnected();await cardsReady;if(await maintenanceRead('restore-journal'))throw new Error('Recover the interrupted restore first.');if(file.size>NightlinkBackup.MAX_BYTES)throw new Error('Choose a Nightlink backup smaller than 50 MB.');
 const backup=NightlinkBackup.parse(await file.text()),plan=NightlinkBackup.plan(backupStorage(),[...contactCards.values()],backup),s=plan.summary;
 modal('Preview restore','<p id="backup-preview-date"></p><div id="backup-preview-counts" class="backup-counts"></div><p>Existing contact cards and preferences are kept. Favorites are combined. Duplicate messages are skipped. Existing messages are never removed to make space; incoming messages beyond 3,000 per radio are skipped.</p><p>This restores local data only. It does not configure the radio or resend messages. Other radio histories become available when that radio is selected. Nightlink will restart its view when complete.</p><button id="backup-confirm-restore" class="primary">Restore and reload</button><button id="backup-cancel-restore" class="radio-manage">Cancel</button><p id="backup-restore-error" role="status"></p>');
 $('#backup-preview-date').textContent='Backup created '+new Date(backup.createdAt).toLocaleString();
 for(const [label,value]of [['Messages to add',s.added],['Duplicate messages',s.duplicates],['Skipped at history limit',s.capacitySkipped],['Contact cards to add',s.cardsAdded],['Existing cards kept',s.cardsKept],['Radio histories',s.radios],['Preferences to add',s.preferencesAdded]]){const row=document.createElement('div');row.textContent=label;const number=document.createElement('strong');number.textContent=value;row.append(number);$('#backup-preview-counts').append(row);}
 $('#backup-cancel-restore').onclick=()=>$('#dialog').close();
 $('#backup-confirm-restore').onclick=async()=>{const button=$('#backup-confirm-restore');button.disabled=true;backupBusy=true;try{await applyBackup(backup);location.reload();}catch(error){$('#backup-restore-error').textContent=error.message;button.disabled=false;await refreshBackupMetadata();}finally{backupBusy=false;}};
 }catch(error){toast('Restore could not be prepared: '+error.message);}finally{backupBusy=false;}
}
async function recoverBackupJournal(){
 try{await cardsReady;await rollbackRestore();location.reload();}catch(error){toast('Recovery could not complete: '+error.message);}
}
async function refreshBackupMetadata(){
 await cardsReady;const last=await maintenanceRead('last-export'),pending=await maintenanceRead('restore-journal');restoreRecoveryPending=!!pending;
 const label=$('#backup-last-export');if(label)label.textContent=last?(last.confirmed?'Last backup saved: ':'Last export started: ')+new Date(last.at||last).toLocaleString():'No backup exported yet';
 const recover=$('#backup-recover');if(recover)recover.hidden=!pending;
 for(const id of ['backup-export','backup-import']){const button=$('#'+id);if(button)button.disabled=!!pending;}
}
function renderBackupSettings(){
 const section=document.createElement('section');section.className='backup-settings';section.innerHTML='<h3>Backup and restore</h3><p>Save messages for all local radio histories, cached contacts, nicknames, photos, notes, favorites, channel mute settings and preferences.</p><p id="backup-last-export" role="status">Reading backup status…</p><div class="backup-actions"><button id="backup-export" type="button">Export backup</button><label class="backup-import-label">Preview a restore<input id="backup-import" type="file" accept=".json,application/json"></label><button id="backup-recover" type="button" hidden>Recover interrupted restore</button></div><p class="backup-help">Backup files are unencrypted and contain private messages and contact information. Keep them private. Verify that the export finished downloading. Restore requires a disconnected radio.</p>';$('.settings-grid').append(section);
 $('#backup-export').onclick=exportBackup;$('#backup-import').onchange=e=>{const file=e.target.files[0];e.target.value='';previewBackupFile(file);};$('#backup-recover').onclick=recoverBackupJournal;
 refreshBackupMetadata().catch(error=>{if($('#backup-last-export'))$('#backup-last-export').textContent='Storage unavailable: '+error.message;if($('#backup-export'))$('#backup-export').disabled=true;if($('#backup-import'))$('#backup-import').disabled=true;});
}
const backupView=view;view=function(name){backupView(name);if(name==='Settings')renderBackupSettings();};
cardsReady.then(async()=>{const journal=await maintenanceRead('restore-journal');if(journal){restoreRecoveryPending=true;modal('Interrupted restore','<p>A restore did not finish. Your previous data is retained locally. Disconnect your radio, then recover the previous data before attempting another restore.</p><button id="backup-startup-recover" class="primary">Recover previous data</button>');$('#backup-startup-recover').onclick=recoverBackupJournal;}}).catch(()=>{});
if(current==='Settings')renderBackupSettings();
