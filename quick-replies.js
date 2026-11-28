/* Quick replies: a row of short phrases above the message box (Cards chat, Terminal chat and DM windows).
   Clicking one puts the phrase in the message box; nothing is sent until you press Enter or Send.
   The list is editable in Settings (up to 8 phrases of up to 60 characters). No radio commands. */
(function(root){
 'use strict';
 const KEY='nightlink.quick-replies',SHOW_KEY='nightlink.quick-replies-show',MAX=8,LEN=60;
 const DEFAULTS=['Copy','On my way','Standing by','All clear','Need assistance','Arrived','Back shortly'];
 // Clean a user list: trimmed, one line each, no duplicates, at most MAX phrases of LEN characters.
 function clean(list){const out=[];for(const raw of Array.isArray(list)?list:[]){const t=String(raw??'').replace(/\s+/g,' ').trim().slice(0,LEN);if(t&&!out.includes(t))out.push(t);if(out.length>=MAX)break;}return out;}
 function parse(text){return clean(String(text??'').split(/\r?\n/));}
 // New text for the box: the phrase alone when empty, otherwise appended after a space, cut to the field limit.
 function insert(current,phrase,max=133){const c=String(current??'');const next=c.trim()?c.replace(/\s*$/,' ')+phrase:phrase;return next.slice(0,max);}
 const core={KEY,SHOW_KEY,MAX,LEN,DEFAULTS,clean,parse,insert};
 if(typeof module==='object'&&module.exports){module.exports=core;return;}
 const doc=root.document;
 function read(){try{const v=root.localStorage.getItem(KEY);if(v==null)return DEFAULTS.slice();const l=clean(JSON.parse(v));return l;}catch{return DEFAULTS.slice();}}
 const shown=()=>{try{return root.localStorage.getItem(SHOW_KEY)!=='off';}catch{return true;}};
 const TARGETS=[['#chat-form','#message-input'],['#mrc-form','#mrc-input'],['#dm-reply','#dm-text']];
 function bar(input){const b=doc.createElement('div');b.className='quick-replies';b.setAttribute('role','toolbar');b.setAttribute('aria-label','Quick replies');
  for(const phrase of read()){const btn=doc.createElement('button');btn.type='button';btn.className='quick-reply';btn.textContent=phrase;btn.title='Put "'+phrase+'" in the message box';
   btn.onclick=()=>{const field=typeof input==='function'?input():input;if(!field)return;const max=Number(field.maxLength)>0?Number(field.maxLength):133;field.value=insert(field.value,phrase,max);field.dispatchEvent(new Event('input',{bubbles:true}));field.focus();try{field.setSelectionRange(field.value.length,field.value.length);}catch{}};b.append(btn);}
  b.dataset.signature=read().join('\n');return b;}
 function mount(){const on=shown(),sig=read().join('\n');
  for(const [formSel,inputSel] of TARGETS){const form=doc.querySelector(formSel);if(!form)continue;const prev=form.previousElementSibling?.classList?.contains('quick-replies')?form.previousElementSibling:null;
   if(!on||!read().length){prev?.remove();continue;}if(prev&&prev.dataset.signature===sig)continue;
   // Adding the row shortens the chat log; keep a log that was at its newest message pinned there.
   const logs=[...doc.querySelectorAll('#mrc-log,#chat-log,#dm-log')].map(l=>[l,l.scrollHeight-l.scrollTop-l.clientHeight<4]);
   prev?.remove();form.before(bar(()=>form.querySelector(inputSel)||doc.querySelector(inputSel)));
   for(const [l,atEnd] of logs)if(atEnd)l.scrollTop=l.scrollHeight;}}
 function settings(){if(doc.querySelector('#quick-replies-setting'))return;const grid=doc.querySelector('.settings-grid');if(!grid)return;
  const l=doc.createElement('label');l.className='accent-setting interface-setting';l.id='quick-replies-setting';l.append('Quick replies');
  const show=doc.createElement('input');show.type='checkbox';show.id='quick-replies-show';show.checked=shown();show.setAttribute('aria-label','Show quick replies above the message box');
  const area=doc.createElement('textarea');area.id='quick-replies-text';area.rows=5;area.setAttribute('aria-label','Quick reply phrases, one per line');area.value=read().join('\n');
  const help=doc.createElement('small');help.textContent='One phrase per line, up to '+MAX+' phrases of '+LEN+' characters. Clicking a phrase puts it in the message box; it is not sent until you press Enter or Send.';
  const row=doc.createElement('span');row.className='quick-replies-show';row.append(show,' Show above the message box');
  show.onchange=()=>{try{root.localStorage.setItem(SHOW_KEY,show.checked?'on':'off');}catch{}mount();};
  area.onchange=()=>{const list=parse(area.value);try{root.localStorage.setItem(KEY,JSON.stringify(list));}catch{}area.value=list.join('\n');mount();};
  l.append(row,area,help);grid.append(l);}
 let queued=false;const soon=()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;try{mount();}catch(e){console.warn('quick replies',e);}});};
 root.NightlinkQuickReplies={...core,read,mount};
 doc.addEventListener('DOMContentLoaded',()=>{
  if(typeof root.view==='function'||typeof view==='function'){const prev=view;view=function(name){const r=prev.apply(this,arguments);if(name==='Settings')setTimeout(()=>{try{settings();}catch(e){console.warn('quick replies',e);}},0);soon();return r;};}
  new MutationObserver(soon).observe(doc.body,{childList:true,subtree:true});root.addEventListener('storage',e=>{if(e.key===KEY||e.key===SHOW_KEY)soon();});mount();});
})(typeof window==='object'?window:globalThis);
