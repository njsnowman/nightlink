const $=s=>document.querySelector(s);
let current='Overview',zoom=1;const activity=[];
function toast(text){$('#toast').textContent=text;$('#toast').classList.add('visible');clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),3500);}
function modal(title,body){$('#dialog-title').textContent=title;$('#dialog-body').innerHTML=body;$('#dialog').showModal();}
$('#close-dialog').onclick=()=>$('#dialog').close();
const overview=$('#overview'),alternate=$('#alternate'),mapPanel=$('.map-panel'),chatPanel=$('.conversation'),nodePanel=$('.nodes-panel'),radioPanel=$('.radio-panel');
const homes=new Map([mapPanel,chatPanel,nodePanel,radioPanel].map(el=>{const marker=document.createComment('panel home');el.before(marker);return[el,marker];}));
function restore(){for(const [el,marker]of homes)marker.after(el);nodePanel.hidden=true;radioPanel.hidden=true;}
function renderNodes(){}
function inspectNode(){}
function view(name){restore();current=name;$('#crumb').textContent=name;$('#title').textContent=({Overview:'Network overview.',Messages:'Your conversations.',Nodes:'The people. The relays.',Activity:'Every signal tells a story.','Network map':'See the whole mesh.',Radio:'Your radio.',Settings:'Make it yours.'})[name]||name;
 document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('active',b.dataset.view===name));overview.hidden=name!=='Overview';alternate.hidden=name==='Overview';alternate.replaceChildren();
 if(name==='Network map')alternate.append(mapPanel);if(name==='Messages')alternate.append(chatPanel);if(name==='Radio'){radioPanel.hidden=false;alternate.append(radioPanel);}if(name==='Nodes'){nodePanel.hidden=false;renderNodes(true);alternate.append(nodePanel);}else renderNodes();
 if(name==='Activity'){const p=document.createElement('div');p.className='panel';for(const text of activity){const row=document.createElement('div');row.className='activity-row';row.textContent=text;p.append(row);}alternate.append(p);}
 if(name==='Settings'){alternate.innerHTML='<div class="panel"><div class="panel-heading"><h2>Workspace preferences</h2></div><div class="settings-grid"><label>Desktop notifications <input id="notifications" type="checkbox"></label><label>Reduced motion <input id="reduced-motion" type="checkbox"></label><p>Radio preferences</p></div></div>';for(const id of ['notifications','reduced-motion'])$('#'+id).checked=localStorage.getItem(id)==='true';}
}
document.addEventListener('click',e=>{const nav=e.target.closest('[data-view]');if(nav)view(nav.dataset.view);const target=e.target.closest('[data-node]');if(target)inspectNode(Number(target.dataset.node));});
document.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.matches('[data-node]')){e.preventDefault();inspectNode(Number(e.target.dataset.node));}});
function setZoom(v){zoom=Math.max(1,Math.min(2.5,v));const w=800/zoom,h=440/zoom;$('#mesh-map').setAttribute('viewBox',[(800-w)/2,(440-h)/2,w,h].join(' '));}
$('#zoom-in').onclick=()=>setZoom(zoom+.25);$('#zoom-out').onclick=()=>setZoom(zoom-.25);$('#recenter').onclick=()=>setZoom(1);
function clock(){ $('#clock').textContent=new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})+' LOCAL';}clock();setInterval(clock,1000);

