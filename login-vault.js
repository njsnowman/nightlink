/* Decorative transition only; native authentication controls workspace access. */
window.playLoginVault=function(){
 const root=document.querySelector('#login-vault'),card=document.querySelector('.security-lock-card');if(!root)return Promise.resolve();
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;if(reduced)return Promise.resolve();
 return new Promise(resolve=>{
 const vault=root.querySelector('.nlv-window'),label=root.querySelector('.nlv-status-text'),skip=root.querySelector('#vault-skip'),timers=[];let done=false;const priorInert=card.inert;
 const finish=()=>{if(done)return;done=true;timers.forEach(clearTimeout);skip.removeEventListener('click',finish);root.removeEventListener('keydown',escape);root.hidden=true;card.inert=priorInert;resolve();};
 const escape=e=>{if(e.key==='Escape'){e.preventDefault();finish();}};
 const step=(n,text)=>{root.querySelectorAll('[data-step]').forEach(e=>e.classList.toggle('is-active',Number(e.dataset.step)===n));label.textContent=text;};
 card.inert=true;root.hidden=false;skip.addEventListener('click',finish);root.addEventListener('keydown',escape);skip.focus();vault.classList.add('is-playing');step(1,'Releasing locking ring');
 timers.push(setTimeout(()=>step(2,'Retracting security bolts'),816));timers.push(setTimeout(()=>{step(3,'Opening workspace');vault.classList.add('is-revealing');},1368));
 timers.push(setTimeout(()=>{vault.classList.remove('is-playing');vault.classList.add('is-open','is-revealing');step(3,'Workspace ready');},2400));timers.push(setTimeout(finish,2550));
 });
};
