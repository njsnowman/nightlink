/* Fixed #echo command shortcuts; only explicit clicks send messages. */
(()=>{
 const commands=['!test','!spam','!echo','!yolo'],form=document.getElementById('chat-form');
 const bar=document.createElement('div');bar.id='echo-command-shortcuts';bar.className='echo-command-shortcuts';bar.setAttribute('role','group');bar.setAttribute('aria-label','Send echo channel commands');bar.hidden=true;
 const isEcho=()=>live.selected?.kind==='channel'&&String(live.selected.name||'').trim().replace(/^#/,'').toLowerCase()==='echo';
 const ready=()=>isEcho()&&['Overview','Messages'].includes(current)&&!!live.identity?.key&&live.sync==='ready'&&ble.state==='connected'&&!live.sending&&!radioSession.configuring&&!window.NightlinkBulkContactRemovalUI?.running&&live.channels.some(c=>c.slot===live.selected.slot&&c.id===live.selected.id);
 for(const command of commands){const button=document.createElement('button');button.type='button';button.dataset.echoCommand=command;button.textContent=command;button.title='Send '+command+' to #echo';button.setAttribute('aria-label','Send '+command+' to echo channel');button.onclick=async()=>{if(!ready())return;const target={...live.selected};await sendUIMessage(target,command,()=>{},{preserveDraft:true});paint();};bar.append(button);}
 form.before(bar);
 function paint(){bar.hidden=!isEcho()||!['Overview','Messages'].includes(current);for(const button of bar.children)button.disabled=!ready();}
 const render=renderMessages;renderMessages=function(...args){const result=render.apply(this,args);paint();return result;};
 const previousView=view;view=function(...args){const result=previousView.apply(this,args);paint();return result;};
 for(const name of ['sync','channels','identity'])radioSession.addEventListener(name,paint);ble.addEventListener('state',paint);window.addEventListener('nightlink-delivery',paint);paint();
})();
