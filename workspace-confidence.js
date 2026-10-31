/* Local presentation models. No radio commands, persistence or automatic retries. */
(function(root){
 function connection({transport,sync,health={},label='Radio',storageError=false,recovery=''}){
  const last=health.lastSyncAt==null?null:health.lastSyncAt;let state,title,detail;
  if(storageError){state='error';title='History needs attention';detail='Local history could not be saved. Export a backup from Radio.';}
  else if(sync==='error'||['sync-failed','exhausted','failed'].includes(recovery)){state='error';title='Sync stopped';detail='Synchronization did not finish. Open Radio for details.';}
  else if(['waiting','retrying'].includes(recovery)){state='connecting';title='Reconnecting';detail='Waiting to reconnect to the remembered radio.';}
  else if(sync==='syncing'){state='syncing';title=/queue|queued|recover/i.test(health.stage||'')?'Catching up':'Synchronizing';detail=health.stage||'Reading radio data';}
  else if(transport==='connected'&&sync==='ready'){state='ready';title='Ready · '+label;detail='Full synchronization completed; the radio reported its pending queue empty.';}
  else if(transport==='connected'){state='connected';title='Connected · checking';detail='The radio link is connected; full synchronization is not complete.';}
  else if(['scanning','connecting','initializing'].includes(transport)){state='connecting';title=transport==='scanning'?'Finding radio':transport==='initializing'?'Verifying radio':'Connecting';detail=health.stage||'Establishing the local radio link.';}
  else{state='offline';title='Connect radio';detail='Offline. Saved messages remain available.';}
  return {state,title,detail,lastSyncAt:last};
 }
 function inbox(messages,{read=new Set(),muted=new Set(),isMention=()=>false}={}){
  const result=[],seen=new Set();for(let index=messages.length-1;index>=0;index--){const m=messages[index];if(seen.has(m.id))continue;seen.add(m.id);const direct=m.target?.kind==='direct'||m.conversation?.startsWith('direct:');const mention=!m.own&&isMention(m.text||'');const phase=root.deliveryPresentation?.(m)?.phase||m.phase;const needsAttention=!!m.own&&!m.pending&&!m.ack&&['not-sent','unconfirmed','interrupted','cancelled'].includes(phase);if(needsAttention)result.push({message:m,kind:'send',mention:false,muted:false});else if(!m.own&&!read.has(m.id)&&(direct||mention))result.push({message:m,kind:direct?'dm':'mention',mention,muted:muted.has(m.conversation)});}
  return result;
 }
 function outbox(messages){const result=[],seen=new Set();for(let i=messages.length-1;i>=0;i--){const m=messages[i];if(seen.has(m.id))continue;seen.add(m.id);if(!m.own||m.ack)continue;const phase=root.deliveryPresentation?.(m)?.phase||m.phase;if(m.pending||['not-sent','unconfirmed','interrupted','cancelled'].includes(phase))result.push({message:m,kind:'send',mention:false,muted:false});}return result;}
 root.NightlinkWorkspaceConfidence={connection,inbox,outbox};if(typeof module!=='undefined')module.exports=root.NightlinkWorkspaceConfidence;
})(globalThis);
