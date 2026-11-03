/* Keep the connection, internet, RF and inbox indicators together in one toolbar group. */
(()=>{
 const header=document.querySelector('.header-actions');if(!header)return;
 const group=document.createElement('div');group.className='header-status-group';group.setAttribute('role','group');group.setAttribute('aria-label','Connection and system status');
 header.prepend(group);
 const internet=document.createElement('div');internet.id='internet-status';internet.className='internet-status';internet.dataset.state='checking';internet.setAttribute('role','status');internet.setAttribute('aria-live','polite');
 internet.title='Checking internet connection';internet.setAttribute('aria-label',internet.title);
 internet.innerHTML='<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="7.25"></circle><path d="M2.9 10h14.2M10 2.8c2 2 3 4.4 3 7.2s-1 5.2-3 7.2c-2-2-3-4.4-3-7.2s1-5.2 3-7.2"></path></svg><span class="internet-status-label">Internet</span><i aria-hidden="true"></i>';
 group.append(internet);
 const statuses=['connection','propagation-indicator','open-activity-inbox'];
 for(const id of statuses){const item=document.getElementById(id);if(item)group.append(item);}
 function paint(value){const state=value===true?'online':value===false?'offline':'unavailable';const label=state==='online'?'Internet connected':state==='offline'?'No internet connection':state==='unavailable'?'Internet status unavailable':'Checking internet connection';internet.dataset.state=state;internet.title=label;internet.setAttribute('aria-label',label);}
 async function update(){if(!window.meshlineInternet?.status){paint(null);return;}try{paint(await window.meshlineInternet.status());}catch{paint(null);}}
 window.addEventListener('offline',()=>paint(false));window.addEventListener('online',update);update();setInterval(update,30000);
})();
