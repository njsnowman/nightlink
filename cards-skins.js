/* Cards skins (owner request, 0.8.31): Standard, Tactical, Red light, Radio panel and School / District.
   Presentation only; no radio commands. Loaded in the head of index.html, dm.html and security-lock.html after
   terminal.js, so the root attribute is set before first paint in every document. The Terminal interface ignores it. */
(function(root){
 'use strict';
 const KEY='nightlink.cards-skin',SKINS=['standard','tactical','red','radio','school'];
 const NAME_KEY='nightlink.school-name',COLOR_KEY='nightlink.school-color',DEFAULT_COLOR='#1f4e9c';
 const PLAIN_KEY='nightlink.school-plain',SIMPLE_KEY='nightlink.school-simple',PIN_KEY='nightlink.school-pin',UNLOCK_KEY='nightlink.school-unlocked';
 // School / District plain wording: radio terms shown to non-technical staff. Only exact labels are replaced.
 const SIGNAL_WORDS={LINK:'Connected',RX:'Receiving',TX:'Sending',ACK:'Confirmed',FAULT:'Problem'};
 function plainWord(kind,text){const t=String(text||'').trim();if(kind==='signal')return SIGNAL_WORDS[t.toUpperCase()]||null;
  if(kind==='route'){const m=t.match(/^(\d+)\s+hops?$/i);if(m)return m[1]==='0'?'Direct':'via '+m[1]+(m[1]==='1'?' relay':' relays');if(/^direct$/i.test(t))return 'Direct';return null;}
  if(kind==='delivery')return {'Broadcast accepted by radio':'Sent','Received':'Received'}[t]||null;
  if(kind==='note')return /^Broadcast\b/.test(t)?'Sent to everyone on this channel':null;return null;}
 const LABELS={standard:'Standard (default)',tactical:'Tactical',red:'Red light (night vision)',radio:'Radio panel',school:'School / District'};
 const valid=v=>SKINS.includes(v)?v:'standard';
 const hex=v=>/^#[0-9a-f]{6}$/i.test(v||'')?v.toLowerCase():null;
 // WCAG 2 relative luminance and contrast ratio, used to refuse district colours that make white text unreadable.
 function luminance(color){const c=hex(color);if(!c)return null;return [1,3,5].map(i=>parseInt(c.slice(i,i+2),16)/255).map(v=>v<=.03928?v/12.92:((v+.055)/1.055)**2.4).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);}
 function contrast(a,b){const x=luminance(a),y=luminance(b);if(x==null||y==null)return 0;return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
 const usableColor=c=>!!hex(c)&&contrast(c,'#ffffff')>=4.5;
 function read(storage,key,fallback){try{return storage?.getItem(key)??fallback;}catch{return fallback;}}
 const core={KEY,SKINS,LABELS,NAME_KEY,COLOR_KEY,DEFAULT_COLOR,PLAIN_KEY,SIMPLE_KEY,PIN_KEY,valid,hex,luminance,contrast,usableColor,plainWord};
 if(typeof module==='object'&&module.exports){module.exports=core;return;}
 const doc=root.document,html=doc.documentElement;
 const skin=()=>valid(read(root.localStorage,KEY,'standard'));
 const schoolColor=()=>{const c=hex(read(root.localStorage,COLOR_KEY,''));return c&&usableColor(c)?c:DEFAULT_COLOR;};
 const schoolName=()=>String(read(root.localStorage,NAME_KEY,'')||'').slice(0,40);
 const flag=(key,def)=>read(root.localStorage,key,def)==='on';
 function apply(){const s=skin();html.dataset.cardsSkin=s;html.dataset.schoolPlain=s==='school'&&flag(PLAIN_KEY,'on')?'on':'off';html.dataset.schoolSimple=s==='school'&&flag(SIMPLE_KEY,'off')?'on':'off';
  if(s==='school')html.style.setProperty('--nl-school',schoolColor());else html.style.removeProperty('--nl-school');
  if(doc.body){banner();plain();}return s;}

 // Plain wording: replace exact radio labels in the rendered page; the original text is kept for switching back.
 const PLAIN=[['.chat-signal-cell','signal'],['#chat-log .message-route','route'],['.delivery-badge','delivery'],['.outgoing-route-note','note']];
 function textNode(el){return [...el.childNodes].reverse().find(n=>n.nodeType===3&&n.nodeValue.trim())||null;}
 function plain(){const on=html.dataset.schoolPlain==='on';
  for(const [sel,kind] of PLAIN)for(const el of doc.querySelectorAll(sel)){const node=textNode(el);if(!node)continue;const text=node.nodeValue.trim();
   if(on){if(el.dataset.plainShown===text)continue;const word=plainWord(kind,text);if(!word||word===text)continue;el.dataset.plainOriginal=text;el.dataset.plainShown=word;node.nodeValue=node.nodeValue.replace(text,word);el.title=el.title||text;}
   else if(el.dataset.plainOriginal&&el.dataset.plainShown===text){node.nodeValue=node.nodeValue.replace(text,el.dataset.plainOriginal);delete el.dataset.plainOriginal;delete el.dataset.plainShown;}}}
 let plainQueued=false;const plainSoon=()=>{if(plainQueued)return;plainQueued=true;requestAnimationFrame(()=>{plainQueued=false;if(html.dataset.schoolPlain==='on')plain();});};
 // Admin PIN: locks the look settings for this browser profile until unlocked. A deterrent on shared PCs only:
 // it does not encrypt or protect saved data. Stored as a salted SHA-256 hash.
 async function digest(salt,pin){const bytes=new TextEncoder().encode(salt+':'+pin),hash=await root.crypto.subtle.digest('SHA-256',bytes);return [...new Uint8Array(hash)].map(b=>b.toString(16).padStart(2,'0')).join('');}
 const pinRecord=()=>{const v=read(root.localStorage,PIN_KEY,'');return /^[0-9a-f]{32}:[0-9a-f]{64}$/.test(v)?v:'';};
 const unlocked=()=>!pinRecord()||read(root.sessionStorage,UNLOCK_KEY,'')===pinRecord().slice(0,32);
 async function setPin(pin){const salt=[...root.crypto.getRandomValues(new Uint8Array(16))].map(b=>b.toString(16).padStart(2,'0')).join('');save(PIN_KEY,salt+':'+await digest(salt,pin));try{root.sessionStorage.setItem(UNLOCK_KEY,salt);}catch{}}
 async function checkPin(pin){const rec=pinRecord();if(!rec)return true;const [salt,hash]=rec.split(':');if(await digest(salt,pin)!==hash)return false;try{root.sessionStorage.setItem(UNLOCK_KEY,salt);}catch{}return true;}
 const LOCKED=['#interface-mode','#cards-glass','#cards-skin','#school-name','#school-color','#school-plain','#school-simple'];
 function lockControls(){const lock=!unlocked();for(const sel of LOCKED){const c=doc.querySelector(sel);if(!c)continue;if(lock){c.disabled=true;c.dataset.pinLocked='yes';}else if(c.dataset.pinLocked){delete c.dataset.pinLocked;c.disabled=sel==='#cards-glass'&&skin()!=='standard';}}
  const note=doc.querySelector('#school-pin-state');if(note)note.textContent=pinRecord()?(lock?'Locked: enter the admin PIN to change the look.':'Unlocked for this session.'):'No admin PIN set.';}
 // District name above the sidebar menu (School skin only).
 function banner(){const side=doc.querySelector('#workspace-sidebar');if(!side)return;let b=side.querySelector('.school-banner');const name=skin()==='school'?schoolName().trim():'';
  if(!name){b?.remove();return;}if(!b){b=doc.createElement('div');b.className='school-banner';b.setAttribute('role','note');side.prepend(b);}b.textContent=name;}
 function save(key,value){try{if(value)root.localStorage.setItem(key,value);else root.localStorage.removeItem(key);}catch{}}
 function field(id,title,control,help){const l=doc.createElement('label');l.className='accent-setting interface-setting';l.id=id+'-setting';l.append(title,control);const h=doc.createElement('small');h.textContent=help;l.append(h);return l;}
 // Settings > Interface: Skin, plus district name and colour when School / District is chosen. Cards only.
 function settings(){if(root.NightlinkInterface?.isTerminal?.())return;const anchor=doc.querySelector('#cards-glass-setting')||doc.querySelector('#interface-mode')?.closest('label');if(!anchor||doc.querySelector('#cards-skin'))return;
  const sel=doc.createElement('select');sel.id='cards-skin';sel.setAttribute('aria-label','Skin');for(const v of SKINS){const o=doc.createElement('option');o.value=v;o.textContent=LABELS[v];sel.append(o);}sel.value=skin();
  const skinField=field('cards-skin','Skin',sel,'Changes the look of the Cards interface. Glass applies to the Standard skin only. Red light keeps everything red on black to protect night vision.');
  const name=doc.createElement('input');name.type='text';name.id='school-name';name.maxLength=40;name.placeholder='e.g. Lincoln County Schools';name.value=schoolName();name.setAttribute('aria-label','District name');
  const color=doc.createElement('input');color.type='color';color.id='school-color';color.value=schoolColor();color.setAttribute('aria-label','District colour');
  const nameField=field('school-name','District name',name,'Shown at the top of the sidebar. Up to 40 characters.');
  const colorField=field('school-color','District colour',color,'Used for the sidebar, buttons and your messages. Colours too light for white text are refused.');
  const note=doc.createElement('small');note.className='school-color-note';note.setAttribute('role','status');note.setAttribute('aria-live','polite');colorField.append(note);
  let sync=()=>{const school=sel.value==='school';nameField.hidden=!school;colorField.hidden=!school;const glass=doc.querySelector('#cards-glass');if(glass){glass.disabled=sel.value!=='standard';glass.title=glass.disabled?'Glass applies to the Standard skin only.':'';}};
  sel.onchange=()=>{save(KEY,sel.value);apply();sync();};
  name.oninput=()=>{save(NAME_KEY,name.value.slice(0,40).trim());banner();};
  color.oninput=()=>{const c=hex(color.value),ratio=contrast(c,'#ffffff');if(usableColor(c)){save(COLOR_KEY,c);note.textContent='';apply();}else note.textContent='Not used: white text on this colour has '+ratio.toFixed(1)+':1 contrast (needs 4.5:1). Choose a darker colour.';};
  const toggle=(id,title,key,def,help)=>{const box=doc.createElement('input');box.type='checkbox';box.id=id;box.checked=flag(key,def);box.onchange=()=>{save(key,box.checked?'on':'off');apply();if(!box.checked&&key===PLAIN_KEY&&typeof root.renderMessages==='function')try{root.renderMessages();}catch{}};const f=field(id,title,box,help);f.classList.add('setting-toggle');return f;};
  const plainField=toggle('school-plain','Plain wording',PLAIN_KEY,'on','Shows "Sent", "via 3 relays" and "Connected" in place of radio terms such as BROADCAST, hops and LINK. Hover a label for the radio term.');
  const simpleField=toggle('school-simple','Simple menu',SIMPLE_KEY,'off','Hides Radio, Diagnostics, Contact Book and Operations from the sidebar for staff who only send and read messages.');
  const pin=doc.createElement('input');pin.type='password';pin.id='school-pin';pin.inputMode='numeric';pin.autocomplete='off';pin.maxLength=12;pin.placeholder='4–12 digits';pin.setAttribute('aria-label','Admin PIN');
  const pinField=field('school-pin','Admin PIN',pin,'Locks Interface, Glass, Skin and the School settings on this computer. It stops casual changes on shared PCs; it does not protect saved messages.');
  const row=doc.createElement('span');row.className='school-pin-actions';const mk=(t,fn)=>{const b=doc.createElement('button');b.type='button';b.textContent=t;b.onclick=fn;row.append(b);return b;};
  const state=doc.createElement('small');state.id='school-pin-state';state.setAttribute('role','status');state.setAttribute('aria-live','polite');
  const good=()=>/^\d{4,12}$/.test(pin.value);
  mk('Set PIN',async()=>{if(!unlocked()){state.textContent='Unlock first to change the PIN.';return;}if(!good()){state.textContent='Use 4 to 12 digits.';return;}await setPin(pin.value);pin.value='';lockControls();state.textContent='Admin PIN set. Settings stay unlocked until Nightlink restarts.';});
  mk('Unlock',async()=>{if(await checkPin(pin.value)){pin.value='';lockControls();}else state.textContent='Wrong PIN.';});
  mk('Remove PIN',async()=>{if(!unlocked()&&!(await checkPin(pin.value))){state.textContent='Enter the current PIN to remove it.';return;}save(PIN_KEY,'');try{root.sessionStorage.removeItem(UNLOCK_KEY);}catch{}pin.value='';lockControls();});
  pinField.append(row,state);
  const schoolOnly=[nameField,colorField,plainField,simpleField];
  anchor.after(skinField,nameField,colorField,plainField,simpleField,pinField);
  const resync=sync;sync=()=>{resync();for(const f of schoolOnly)f.hidden=sel.value!=='school';lockControls();};sync();}
 apply();
 root.NightlinkCardsSkins={...core,apply,current:skin,refresh:()=>{apply();settings();}};
 root.addEventListener('storage',e=>{if(e.key===KEY||e.key===NAME_KEY||e.key===COLOR_KEY||e.key===null)apply();});
 doc.addEventListener('DOMContentLoaded',()=>{apply();
  if(typeof root.view==='function'){const prev=root.view;root.view=function(name){const r=prev.apply(this,arguments);if(name==='Settings')setTimeout(()=>{try{settings();}catch(e){console.warn('cards skins',e);}},0);return r;};}
  root.addEventListener('nightlink-interface',()=>{apply();});
  new MutationObserver(plainSoon).observe(doc.body,{childList:true,subtree:true,characterData:true});plain();});
})(typeof window==='object'?window:globalThis);
