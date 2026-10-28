/* Shared conversation rail, also used in floating fallback DM windows. */
(()=>{
 const signals=NightlinkChatSignals,activity=new signals.Activity();let scheduled=false;
 function paint(){
  const anchor=document.querySelector('.chat-channel');if(anchor){const rail=anchor.nextElementSibling?.classList.contains('chat-signal-rail')?anchor.nextElementSibling:signals.mount(anchor);signals.paint(rail,activity.snapshot(live.selected?conversationId(live.selected):null,live.sync));}
  document.querySelectorAll('.dm-floating').forEach(p=>{const heading=p.querySelector('.dm-heading');const rail=heading.nextElementSibling?.classList.contains('chat-signal-rail')?heading.nextElementSibling:signals.mount(heading);signals.paint(rail,activity.snapshot('direct:'+p.dataset.dmKey,live.sync));});
 }
 function refresh(){activity.update({owner:live.identity?.key||null,ready:live.sync==='ready',messages:live.messages});paint();scheduled=false;}
 function schedule(){if(!scheduled){scheduled=true;queueMicrotask(refresh);}}
 const original=renderMessages;renderMessages=function(){original();refresh();};
 for(const name of ['message','ack','sync','identity'])radioSession.addEventListener(name,schedule);
 window.addEventListener('nightlink-delivery',schedule);
 // Expire transient visual feedback without touching the radio or rebuilding chats.
 setInterval(paint,500);refresh();
})();
