/* Derive presentation from retained text; no radio commands or storage edits. */
(function(root){
 const generations=new WeakMap();
 async function decorate(container,visible,messages,options={}){
  const generation=(generations.get(container)||0)+1;generations.set(container,generation);
  const rows=[...container.querySelectorAll('.message,.dm-bubble')],byId=new Map(visible.map((m,i)=>[m.id,rows[i]]));
  let result;try{result=await NightlinkReactions.plan(messages,options);}catch{return;}
  if(generations.get(container)!==generation||!container.isConnected||rows.some(row=>!container.contains(row)))return;
  const bottom=container.scrollHeight-container.clientHeight-container.scrollTop<40;
  for(const m of visible){const r=result.parsed.get(m.id),row=byId.get(m.id);if(!r||!row)continue;
   const target=byId.get(result.targets.get(m.id));if(target){row.hidden=true;continue;}
   const body=row.querySelector('p');if(!body)continue;body.replaceChildren();row.classList.add('reaction-notice');
   const text=document.createElement('span');text.textContent=r.emoji+' Reaction'+(r.targetSender?' to '+r.targetSender:'');body.append(text);
   const note=document.createElement('small');note.className='reaction-unmatched';note.textContent=result.targets.has(m.id)?'Original message is outside this view.':'Original message is unavailable or could not be matched uniquely.';body.append(note);
   const details=document.createElement('details'),summary=document.createElement('summary'),raw=document.createElement('code');details.className='reaction-wire-details';summary.textContent='Reaction details';raw.textContent=m.text;details.append(summary,raw);details.addEventListener('click',e=>e.stopPropagation());details.addEventListener('keydown',e=>e.stopPropagation());body.append(details);
  }
  for(const [id,reactions]of result.reactions){const row=byId.get(id);if(!row)continue;const group=document.createElement('div');group.className='message-reactions';group.setAttribute('aria-label','Message reactions');const grouped=new Map();for(const r of reactions){const names=grouped.get(r.emoji)||[];names.push(r.sender);grouped.set(r.emoji,names);}for(const [value,names]of grouped){const chip=document.createElement('span');chip.className='message-reaction-chip';chip.textContent=value+(names.length>1?' '+names.length:'');chip.title=names.join(', ')+' reacted '+value;chip.setAttribute('aria-label',chip.title);group.append(chip);}const body=row.querySelector('p');body?.after(group);}
  if(bottom)container.scrollTop=container.scrollHeight;
 }
 root.NightlinkReactionUI={decorate};
 if(typeof renderMessages==='function'&&typeof live!=='undefined'){
  const previous=renderMessages;renderMessages=function(){previous();const log=document.querySelector('#chat-log');decorate(log,renderedConversationRows(),live.messages,{selfName:live.identity?.name||''});};renderMessages();
 }
})(globalThis);
