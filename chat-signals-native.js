(()=>{
 const signals=NightlinkChatSignals,activity=new signals.Activity();const rail=signals.mount(document.querySelector('.dm-heading'));let latest=null,owner=null;const notified=new Set();
 function paint(){if(!latest)return;signals.paint(rail,activity.get('direct:'+latest.key,(latest.radioConnected??latest.connected)?'ready':'offline'));}
 window.updateNativeChatSignals=data=>{latest=data;const nextOwner=data.radio+':'+data.key,ready=data.radioConnected??data.connected;if(owner!==nextOwner){owner=nextOwner;notified.clear();}activity.update({owner:nextOwner,ready,messages:data.messages.map(m=>({...m,conversation:'direct:'+data.key}))});if(ready&&data.signalIncoming){const m=data.messages.findLast(m=>!m.own);if(m&&!notified.has(m.id)){notified.add(m.id);activity.events.set('direct:'+data.key,{state:'receive',until:Date.now()+2600});}}paint();};
 setInterval(paint,500);
})();
