/* Surface scheme is independent of the accent palette. */
(function(){
 const key='nightlink.display-scheme',valid=value=>value==='console'?'console':'black';
 function apply(value){value=valid(value);document.documentElement.dataset.scheme=value;return value;}
 function set(value){value=apply(value);try{localStorage.setItem(key,value);}catch{}window.dispatchEvent(new CustomEvent('nightlink-scheme',{detail:value}));}
 window.NightlinkScheme={apply,set,current:()=>valid(document.documentElement.dataset.scheme)};
 try{apply(localStorage.getItem(key));}catch{apply('black');}
 window.addEventListener('storage',e=>{if(e.key===key)apply(e.newValue);});
 document.addEventListener('DOMContentLoaded',()=>{if(typeof view!=='function')return;const previous=view;view=function(name){previous(name);if(name!=='Settings')return;const label=document.createElement('label');label.className='accent-setting';label.append('Color scheme');const select=document.createElement('select');select.id='display-scheme';select.setAttribute('aria-label','Color scheme');for(const [value,title] of [['black','Dark black (default)'],['console','Blue-black console']]){const option=document.createElement('option');option.value=value;option.textContent=title;select.append(option);}select.value=NightlinkScheme.current();select.onchange=()=>set(select.value);label.append(select);const hint=document.createElement('small');hint.textContent='Surface colors for the workspace and direct messages. Choose accent colors separately.';label.append(hint);document.querySelector('.settings-grid')?.prepend(label);};window.addEventListener('nightlink-scheme',()=>{const select=document.querySelector('#display-scheme');if(select)select.value=NightlinkScheme.current();if(typeof updateDMs==='function')updateDMs();});});
})();
