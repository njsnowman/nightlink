/* Shared presentation preference. No radio settings are changed. */
(function(){
 const colors={'ice-blue':'#8cbfff',amber:'#ffb547',emerald:'#42d6a4',violet:'#a78bfa'},key='nightlink.accent';
 function valid(value){return Object.hasOwn(colors,value)?value:'ice-blue';}
 function saved(){try{return valid(localStorage.getItem(key));}catch{return 'ice-blue';}}
 function apply(value){value=valid(value);document.documentElement.dataset.accent=value;document.documentElement.style.setProperty('--accent',colors[value]);return value;}
 function set(value){value=apply(value);try{localStorage.setItem(key,value);}catch{}window.dispatchEvent(new CustomEvent('nightlink-accent',{detail:value}));}
 window.NightlinkAccent={apply,set,current:()=>valid(document.documentElement.dataset.accent)};apply(saved());
 window.addEventListener('storage',e=>{if(e.key===key){apply(e.newValue);window.dispatchEvent(new CustomEvent('nightlink-accent',{detail:valid(e.newValue)}));}});
 document.addEventListener('DOMContentLoaded',()=>{
  if(typeof view!=='function')return;
  const previous=view;view=function(name){previous(name);if(name!=='Settings')return;
   const label=document.createElement('label');label.className='accent-setting';label.append(document.createTextNode('Display accent'));
   const select=document.createElement('select');select.id='display-accent';select.setAttribute('aria-label','Display accent');
   for(const [value,title] of [['ice-blue','Ice blue (default)'],['amber','Amber'],['emerald','Emerald'],['violet','Violet']]){const option=document.createElement('option');option.value=value;option.textContent=title;select.append(option);}select.value=NightlinkAccent.current();select.onchange=()=>set(select.value);label.append(select);
   const hint=document.createElement('small');hint.textContent='Applies to the workspace and direct messages. Status colors keep their meaning.';label.append(hint);document.querySelector('.settings-grid')?.prepend(label);
  };
  window.addEventListener('nightlink-accent',()=>{const select=document.querySelector('#display-accent');if(select)select.value=NightlinkAccent.current();if(typeof updateDMs==='function')updateDMs();});
 });
})();
