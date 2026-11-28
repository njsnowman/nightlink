/* Cards skins (owner request, 0.8.31): Standard, Tactical, Red light, Radio panel and School / District.
   Presentation only; no radio commands. Loaded in the head of index.html, dm.html and security-lock.html after
   terminal.js, so the root attribute is set before first paint in every document. The Terminal interface ignores it. */
(function(root){
 'use strict';
 const KEY='nightlink.cards-skin',SKINS=['standard','tactical','red','radio','school'];
 const NAME_KEY='nightlink.school-name',COLOR_KEY='nightlink.school-color',DEFAULT_COLOR='#1f4e9c';
 const LABELS={standard:'Standard (default)',tactical:'Tactical',red:'Red light (night vision)',radio:'Radio panel',school:'School / District'};
 const valid=v=>SKINS.includes(v)?v:'standard';
 const hex=v=>/^#[0-9a-f]{6}$/i.test(v||'')?v.toLowerCase():null;
 // WCAG 2 relative luminance and contrast ratio, used to refuse district colours that make white text unreadable.
 function luminance(color){const c=hex(color);if(!c)return null;return [1,3,5].map(i=>parseInt(c.slice(i,i+2),16)/255).map(v=>v<=.03928?v/12.92:((v+.055)/1.055)**2.4).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);}
 function contrast(a,b){const x=luminance(a),y=luminance(b);if(x==null||y==null)return 0;return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
 const usableColor=c=>!!hex(c)&&contrast(c,'#ffffff')>=4.5;
 function read(storage,key,fallback){try{return storage?.getItem(key)??fallback;}catch{return fallback;}}
 const core={KEY,SKINS,LABELS,NAME_KEY,COLOR_KEY,DEFAULT_COLOR,valid,hex,luminance,contrast,usableColor};
 if(typeof module==='object'&&module.exports){module.exports=core;return;}
 const doc=root.document,html=doc.documentElement;
 const skin=()=>valid(read(root.localStorage,KEY,'standard'));
 const schoolColor=()=>{const c=hex(read(root.localStorage,COLOR_KEY,''));return c&&usableColor(c)?c:DEFAULT_COLOR;};
 const schoolName=()=>String(read(root.localStorage,NAME_KEY,'')||'').slice(0,40);
 function apply(){const s=skin();html.dataset.cardsSkin=s;
  if(s==='school')html.style.setProperty('--nl-school',schoolColor());else html.style.removeProperty('--nl-school');
  if(doc.body)banner();return s;}
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
  const sync=()=>{const school=sel.value==='school';nameField.hidden=!school;colorField.hidden=!school;const glass=doc.querySelector('#cards-glass');if(glass){glass.disabled=sel.value!=='standard';glass.title=glass.disabled?'Glass applies to the Standard skin only.':'';}};
  sel.onchange=()=>{save(KEY,sel.value);apply();sync();};
  name.oninput=()=>{save(NAME_KEY,name.value.slice(0,40).trim());banner();};
  color.oninput=()=>{const c=hex(color.value),ratio=contrast(c,'#ffffff');if(usableColor(c)){save(COLOR_KEY,c);note.textContent='';apply();}else note.textContent='Not used: white text on this colour has '+ratio.toFixed(1)+':1 contrast (needs 4.5:1). Choose a darker colour.';};
  anchor.after(skinField,nameField,colorField);sync();}
 apply();
 root.NightlinkCardsSkins={...core,apply,current:skin,refresh:()=>{apply();settings();}};
 root.addEventListener('storage',e=>{if(e.key===KEY||e.key===NAME_KEY||e.key===COLOR_KEY||e.key===null)apply();});
 doc.addEventListener('DOMContentLoaded',()=>{apply();
  if(typeof root.view==='function'){const prev=root.view;root.view=function(name){const r=prev.apply(this,arguments);if(name==='Settings')setTimeout(()=>{try{settings();}catch(e){console.warn('cards skins',e);}},0);return r;};}
  root.addEventListener('nightlink-interface',()=>{apply();});});
})(typeof window==='object'?window:globalThis);
