/* Shared appearance preferences. These are visual only; no radio settings change. */
(function(){
 const colors={'ice-blue':'#8cbfff',amber:'#ffbe55',emerald:'#42d6a4',violet:'#a78bfa'},
  fieldColors={'ice-blue':'#aab8a6',amber:'#c6b982',emerald:'#adbf78',violet:'#b3a98d'},
  accentKey='nightlink.accent',themeKey='nightlink.display-theme';
 function validAccent(value){return Object.hasOwn(colors,value)?value:'amber';}
 function validTheme(value){return value==='bbs-camo'?'bbs-camo':'standard';}
 function savedAccent(){try{return validAccent(localStorage.getItem(accentKey));}catch{return 'amber';}}
 function savedTheme(){try{return validTheme(localStorage.getItem(themeKey));}catch{return 'standard';}}
 function applyAccent(value){value=validAccent(value);document.documentElement.dataset.accent=value;document.documentElement.style.setProperty('--accent',document.documentElement.dataset.theme==='bbs-camo'?fieldColors[value]:colors[value]);return value;}
 function setAccent(value){value=applyAccent(value);try{localStorage.setItem(accentKey,value);}catch{}window.dispatchEvent(new CustomEvent('nightlink-accent',{detail:value}));}
 function applyTheme(value){value=validTheme(value);document.documentElement.dataset.theme=value;applyAccent(savedAccent());return value;}
 function setTheme(value){value=applyTheme(value);try{localStorage.setItem(themeKey,value);}catch{}window.dispatchEvent(new CustomEvent('nightlink-theme',{detail:value}));}
 window.NightlinkAccent={apply:applyAccent,set:setAccent,current:()=>validAccent(document.documentElement.dataset.accent)};
 window.NightlinkTheme={apply:applyTheme,set:setTheme,current:()=>validTheme(document.documentElement.dataset.theme)};
 applyTheme(savedTheme());
 window.addEventListener('storage',e=>{
  if(e.key===accentKey){applyAccent(e.newValue);window.dispatchEvent(new CustomEvent('nightlink-accent',{detail:validAccent(e.newValue)}));}
  if(e.key===themeKey){applyTheme(e.newValue);window.dispatchEvent(new CustomEvent('nightlink-theme',{detail:validTheme(e.newValue)}));}
 });
 document.addEventListener('DOMContentLoaded',()=>{
  if(typeof view!=='function')return;
  const previous=view;view=function(name){previous(name);if(name!=='Settings')return;
   const accentLabel=document.createElement('label');accentLabel.className='accent-setting';accentLabel.append(document.createTextNode('Display accent'));
   const accentSelect=document.createElement('select');accentSelect.id='display-accent';accentSelect.setAttribute('aria-label','Display accent');
   for(const [value,title] of [['ice-blue','Ice blue'],['amber','Amber'],['emerald','Emerald'],['violet','Violet']]){const option=document.createElement('option');option.value=value;option.textContent=title;accentSelect.append(option);}accentSelect.value=NightlinkAccent.current();accentSelect.onchange=()=>setAccent(accentSelect.value);accentLabel.append(accentSelect);
   const accentHint=document.createElement('small');accentHint.textContent='Adjusts the interface accent while preserving semantic status colors.';accentLabel.append(accentHint);
   const themeLabel=document.createElement('label');themeLabel.className='accent-setting';themeLabel.append(document.createTextNode('Display theme'));
   const themeSelect=document.createElement('select');themeSelect.id='display-theme';themeSelect.setAttribute('aria-label','Display theme');
   for(const [value,title] of [['standard','Nightlink standard'],['bbs-camo','BBS / IRC · Field camo']]){const option=document.createElement('option');option.value=value;option.textContent=title;themeSelect.append(option);}themeSelect.value=NightlinkTheme.current();themeSelect.onchange=()=>setTheme(themeSelect.value);themeLabel.append(themeSelect);
   const themeHint=document.createElement('small');themeHint.textContent='Changes the visual palette only. Radio and message behavior are unchanged.';themeLabel.append(themeHint);
   const grid=document.querySelector('.settings-grid');grid?.prepend(accentLabel);grid?.prepend(themeLabel);
  };
  window.addEventListener('nightlink-accent',()=>{const select=document.querySelector('#display-accent');if(select)select.value=NightlinkAccent.current();if(typeof updateDMs==='function')updateDMs();});
  window.addEventListener('nightlink-theme',()=>{const select=document.querySelector('#display-theme');if(select)select.value=NightlinkTheme.current();if(typeof updateDMs==='function')updateDMs();});
 });
})();
