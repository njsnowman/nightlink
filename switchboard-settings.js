/* Group existing settings controls without recreating their state or handlers. */
(function(){
 const categories=[['appearance','Appearance','Color, text size and workspace layout'],['connection','Connection','Startup connection, recovery and delivery'],['notifications','Notifications','Sounds, quiet hours and background mode'],['security','Security','Optional password and authenticator app lock'],['data','Data & updates','Backups, maps, previews and application updates'],['help','Help & About','Illustrated guides, version and support']];
 let selected='appearance';
 function category(node){
  if(node.matches('.help-center'))return 'help';
  if(node.matches('.security-panel'))return 'security';
  if(node.matches('.startup-connection-settings,.delivery-settings,.health-settings')||node.querySelector('#auto-reconnect'))return 'connection';
  if(node.matches('.desktop-settings,.attention-help,.propagation-settings')||node.querySelector('#notifications,#dm-alert-sound,#mention-alert-sound,#sent-message-sound'))return 'notifications';
  if(node.matches('.accent-setting')||node.querySelector('#compact-setting,#text-size-setting,#reduced-motion'))return 'appearance';
  return 'data';
 }
 function activate(key,focus=false){
  const grid=document.querySelector('.settings-grid.switchboard-settings');if(!grid)return;
  if(!categories.some(([id])=>id===key))key='appearance';selected=key;
  for(const tab of grid.querySelectorAll('[role=tab]')){const active=tab.dataset.category===key;tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1;if(active&&focus)tab.focus();}
  for(const panel of grid.querySelectorAll('.switchboard-settings-page'))panel.hidden=panel.dataset.category!==key;
 }
 function group(){
  const grid=document.querySelector('.settings-grid');if(!grid||grid.classList.contains('switchboard-settings'))return;
  window.renderNightlinkHelpSettings?.(grid);
  const controls=[...grid.children];grid.classList.add('switchboard-settings');grid.closest('.panel')?.classList.add('switchboard-settings-shell');
  const nav=document.createElement('div');nav.className='switchboard-settings-nav';nav.setAttribute('role','tablist');nav.setAttribute('aria-label','Settings categories');nav.setAttribute('aria-orientation','vertical');
  const pages=document.createElement('div');pages.className='switchboard-settings-pages';
  const groups=new Map();
  for(const [key,label,description]of categories){
   const button=document.createElement('button');button.type='button';button.id='settings-tab-'+key;button.dataset.category=key;button.setAttribute('role','tab');button.setAttribute('aria-controls','settings-page-'+key);button.textContent=label;button.onclick=()=>activate(key);nav.append(button);
   const panel=document.createElement('section');panel.className='switchboard-settings-page';panel.id='settings-page-'+key;panel.dataset.category=key;panel.setAttribute('role','tabpanel');panel.setAttribute('aria-labelledby',button.id);panel.tabIndex=0;
   const heading=document.createElement('h3');heading.className='switchboard-settings-title';heading.textContent=label;const hint=document.createElement('p');hint.className='switchboard-settings-description';hint.textContent=description;panel.append(heading,hint);pages.append(panel);groups.set(key,panel);
  }
  nav.onkeydown=event=>{if(!['ArrowDown','ArrowUp','Home','End'].includes(event.key))return;event.preventDefault();const index=categories.findIndex(([key])=>key===selected),next=event.key==='Home'?0:event.key==='End'?categories.length-1:(index+(event.key==='ArrowDown'?1:-1)+categories.length)%categories.length;activate(categories[next][0],true);};
  for(const control of controls)groups.get(category(control)).append(control);
  grid.append(nav,pages);activate(selected);
 }
 window.NightlinkSettings={open(value){const match=categories.find(([key,label])=>key===value||label===value);if(typeof current==='undefined'||current!=='Settings')view('Settings');group();activate(match?.[0]||'appearance');},current:()=>selected};
 function install(){const previous=view;view=function(name){previous(name);if(name==='Settings')group();};if(typeof current!=='undefined'&&current==='Settings')group();}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
})();
