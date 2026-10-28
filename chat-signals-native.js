(()=>{
 const signals=NightlinkChatSignals,activity=new signals.Activity();const rail=signals.mount(document.querySelector('.dm-heading'));let latest=null;
 function paint(){if(!latest)return;signals.paint(rail,activity.get('direct:'+latest.key,(latest.radioConnected??latest.connected)?'ready':'offline'));}
 window.updateNativeChatSignals=data=>{latest=data;activity.update({owner:data.radio+':'+data.key,ready:data.radioConnected??data.connected,messages:data.messages.map(m=>({...m,conversation:'direct:'+data.key}))});paint();};
 setInterval(paint,500);
})();
