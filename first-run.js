/* First-run setup guide (owner request, 2026-11-27). Shown once on a new install: no radio profile saved and the
   guide not finished or skipped. It explains the steps and links to Help topics; connecting uses the normal
   radio connection dialog, so nothing here talks to the radio itself. Reopen with Ctrl+P > Setup guide. */
(function(root){
 'use strict';
 const KEY='nightlink.firstRun';
 const isNew=s=>{try{return !s.getItem(KEY)&&!s.getItem('meshline.profile');}catch{return false;}};
 const STEPS=[
  {title:'Welcome to Nightlink',text:['Nightlink is a desktop companion for a MeshCore radio. You chat on mesh channels, send direct messages and watch the network, all through your own radio.','You need a MeshCore companion radio (Bluetooth or USB) with companion firmware. Messages are stored on this computer.','This guide takes about two minutes. You can skip it now and reopen it later from Ctrl+P > Setup guide.'],help:[['Start here','Start here']]},
  {title:'Connect your radio',text:['Turn the radio on and keep it near this computer. For USB, plug it in with a data cable.','Choose Connect radio below. Pick Bluetooth or USB in the window that opens, then select your radio. Bluetooth may ask for the PIN shown on the radio.','When the radio has synchronized, this step shows it and you can continue.'],connect:true,help:[['Bluetooth help','Connect with Bluetooth'],['USB help','Connect with USB'],['Troubleshooting','Troubleshooting checklist']]},
  {title:'Your first messages',text:['After sync, your radio\'s channels appear in Chat. Public (slot 0) is shared by everyone nearby.','Type a message and press Enter to send it on the open channel. Replies, reactions and message paths are under each message.','To add a channel, use Add or remove a channel. Direct messages go to one contact.'],help:[['Channels help','Channels & message actions'],['Add a channel','Add or remove a channel'],['Direct messages','Direct messages & alerts']]},
  {title:'Find your way around',text:['Ctrl+P opens Go to: type any page, channel or contact. F1 opens Help at any time.','The bottom bar shows your radio, unread messages and battery. More in the top menu lists the extra tools.','Found a problem or have an idea? Use Report a bug or Request a feature. Both open a pre-filled GitHub issue.'],feedback:true,help:[['Full guide','Start here']]}
 ];
 const core={KEY,isNew,STEPS};
 if(typeof module==='object'&&module.exports){module.exports=core;return;}
 const doc=root.document;let dialog=null,step=0;
 function done(){try{root.localStorage.setItem(KEY,'done');}catch{}}
 function openHelp(title){dialog?.close();(doc.querySelector('#open-help')||doc.querySelector('[data-term-view=Help]'))?.click();
  let tries=0;const pick=()=>{const b=[...doc.querySelectorAll('.help-topics button')].find(x=>x.textContent.trim()===title);if(b){b.click();return;}if(++tries<20)setTimeout(pick,50);};pick();}
 const make=(tag,cls,text)=>{const e=doc.createElement(tag);if(cls)e.className=cls;if(text!=null)e.textContent=text;return e;};
 function radioText(){const s=typeof live==='object'?live.sync:'disconnected';return s==='ready'?['ok','Radio connected and synchronized'+(live.identity?.name?' · '+live.identity.name:'')]:s==='syncing'?['wait','Synchronizing…']:typeof ble==='object'&&ble.state==='connecting'?['wait','Connecting…']:['off','Not connected yet'];}
 function render(){const s=STEPS[step];dialog.replaceChildren();
  const bar=make('div','first-run-progress');bar.setAttribute('aria-label','Step '+(step+1)+' of '+STEPS.length);STEPS.forEach((_,i)=>bar.append(make('span',i<=step?'on':'','')));
  const h=make('h2','first-run-title',s.title);h.id='first-run-title';const body=make('div','first-run-body');for(const t of s.text)body.append(make('p','',t));
  if(s.connect){const row=make('div','first-run-connect');const b=make('button','primary','Connect radio');b.type='button';b.id='first-run-connect';b.onclick=()=>{if(typeof showBluetooth==='function')showBluetooth();else doc.querySelector('#connection')?.click();};
   const st=make('p','first-run-radio');st.setAttribute('role','status');const [state,text]=radioText();st.dataset.state=state;st.textContent=text;row.append(b,st);body.append(row);}
  if(s.feedback){const row=make('div','first-run-feedback');for(const [label,kind] of [['Report a bug','bug'],['Request a feature','feature']]){const b=make('button','',label);b.type='button';b.onclick=()=>{dialog.close();root.NightlinkFeedback?.open(kind);};row.append(b);}body.append(row);}
  const help=make('div','first-run-help');help.append(make('span','first-run-help-label','Help:'));for(const [label,topic] of s.help){const b=make('button','first-run-help-link',label+' →');b.type='button';b.onclick=()=>openHelp(topic);help.append(b);}
  const nav=make('div','first-run-nav');const skip=make('button','first-run-skip',step===STEPS.length-1?'Close':'Skip setup');skip.type='button';skip.onclick=()=>{done();dialog.close();};
  const back=make('button','','Back');back.type='button';back.disabled=step===0;back.onclick=()=>{step--;render();};
  const next=make('button','primary',step===STEPS.length-1?'Finish':'Next');next.type='button';next.id='first-run-next';next.onclick=()=>{if(step===STEPS.length-1){done();dialog.close();return;}step++;render();};
  nav.append(skip,back,next);dialog.append(bar,h,body,help,nav);dialog.setAttribute('aria-labelledby','first-run-title');next.focus();}
 function open(at=0){if(!dialog){dialog=make('dialog','first-run');dialog.id='first-run';doc.body.append(dialog);dialog.addEventListener('cancel',()=>done());}
  step=Math.max(0,Math.min(STEPS.length-1,at));render();if(!dialog.open)dialog.showModal();return dialog;}
 function refresh(){if(dialog?.open&&STEPS[step].connect){const st=dialog.querySelector('.first-run-radio');if(st){const [state,text]=radioText();st.dataset.state=state;st.textContent=text;}}}
 root.NightlinkFirstRun={...core,open};
 doc.addEventListener('DOMContentLoaded',()=>{
  if(typeof radioSession==='object')radioSession.addEventListener('sync',refresh);if(typeof ble==='object')ble.addEventListener('state',refresh);
  // Automated test browsers and returning users never see it automatically; the startup screen finishes first.
  if(root.navigator?.webdriver||!isNew(root.localStorage))return;
  const start=()=>{if(doc.querySelector('#term-boot-screen')||doc.querySelector('dialog[open]')){setTimeout(start,400);return;}open(0);};setTimeout(start,600);});
})(typeof window==='object'?window:globalThis);
