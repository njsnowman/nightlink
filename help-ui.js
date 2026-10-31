/* Offline help is static content; opening a guide never issues radio commands. */
(function(){
 let selected='start',query='',mode='guide';
 const topics=NightlinkGuide.topics;
 const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};
 function button(text,run){const n=el('button','',text);n.type='button';n.onclick=run;return n;}
 async function external(url){try{if(window.nightlinkLinks){const ok=await nightlinkLinks.open(url);if(ok===false)throw Error();}else{toast('Open this address in your browser: '+url);}}catch{toast('Could not open the browser. Address: '+url);}}
 function enlarge(src,title){
  modal(title,'');const dialog=$('#dialog');dialog.classList.add('help-image-dialog');const image=el('img');image.src=src;image.alt=title;$('#dialog-body').append(image,el('p','help-caption',NightlinkGuide.screenshotNote));
  dialog.addEventListener('close',()=>dialog.classList.remove('help-image-dialog'),{once:true});
 }
 window.renderNightlinkHelpSettings=function(grid){
  if(grid.querySelector('.help-center'))return;
  const center=el('section','help-center');center.setAttribute('aria-label','Nightlink Help and About');
  const head=el('div','help-heading');head.append(el('span','eyebrow','NIGHTLINK / FIELD GUIDE'),el('h3','','Help & About'),el('p','','Practical instructions, illustrated with the current interface. Available offline.'));
  const tabs=el('div','help-mode');tabs.setAttribute('role','group');tabs.setAttribute('aria-label','Help section');
  const guide=button('How to',()=>{mode='guide';draw();}),about=button('About Nightlink',()=>{mode='about';draw();});guide.id='help-guide-tab';about.id='help-about-tab';tabs.append(guide,about);head.append(tabs);
  const body=el('div','help-body');center.append(head,body);grid.append(center);
  function draw(){
   guide.setAttribute('aria-pressed',String(mode==='guide'));about.setAttribute('aria-pressed',String(mode==='about'));body.replaceChildren();
   if(mode==='about'){renderAbout(body);return;}
   const toolbar=el('div','help-toolbar'),label=el('label','','Find a topic'),search=el('input');search.type='search';search.id='help-search';search.placeholder='Search Bluetooth, replies, maps…';search.value=query;label.htmlFor=search.id;
   const count=el('span','help-count');count.id='help-search-count';count.setAttribute('role','status');toolbar.append(label,search,count);
   const layout=el('div','help-layout'),nav=el('nav','help-topics');nav.setAttribute('aria-label','Guide topics');const mobile=el('select','help-topic-picker');mobile.setAttribute('aria-label','Choose help topic');
   const article=el('article','help-article');article.id='help-article';article.tabIndex=0;article.setAttribute('aria-label','Selected help topic');layout.append(nav,article);body.append(toolbar,mobile,layout);
   function choose(id,focus=false){if(query.trim()&&!JSON.stringify(topics.find(t=>t.id===id)).toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())){query='';search.value='';}selected=id;list();if(focus)article.focus();}
   function list(){
    const q=query.trim().toLocaleLowerCase(),matches=topics.filter(t=>JSON.stringify(t).toLocaleLowerCase().includes(q));
    count.textContent=matches.length+' of '+topics.length+' topics';nav.replaceChildren();mobile.replaceChildren();
    if(!matches.some(t=>t.id===selected)&&matches.length)selected=matches[0].id;
    let last='';for(const t of matches){if(last!==t.group){nav.append(el('h4','',t.group));last=t.group;}const b=button(t.title,()=>choose(t.id,true));b.dataset.helpTopic=t.id;b.setAttribute('aria-current',String(t.id===selected));nav.append(b);const o=el('option','',t.title);o.value=t.id;o.selected=t.id===selected;mobile.append(o);}
    mobile.disabled=!matches.length;article.replaceChildren();article.scrollTop=0;
    if(!matches.length){article.append(el('h4','','No matching topics'),el('p','','Try “Bluetooth”, “backup”, “channel” or “updates”.'),button('Clear search',()=>{query='';search.value='';list();search.focus();}));return;}
    const t=matches.find(t=>t.id===selected);article.append(el('div','eyebrow',t.group),el('h4','help-topic-title',t.title),el('p','help-lead',t.summary));
    if(t.image){const figure=el('figure','help-figure'),src='help-assets/'+t.image+'.png',zoom=button('',()=>enlarge(src,t.title+' — interface example'));zoom.className='help-screenshot';zoom.setAttribute('aria-label','Enlarge screenshot: '+t.title);const img=el('img');img.src=src;img.alt='Nightlink '+t.title+' interface with demonstration data';img.loading='lazy';zoom.append(img);figure.append(zoom,el('figcaption','help-caption','Select image to enlarge. '+NightlinkGuide.screenshotNote));article.append(figure);}
    for(const section of t.sections){const s=el('section','help-instructions');s.append(el('h5','',section.title));if(section.text)s.append(el('p','',section.text));for(const [key,tag]of [['steps','ol'],['items','ul']])if(section[key]){const list=el(tag);for(const item of section[key])list.append(el('li','',item));s.append(list);}article.append(s);}
    const footer=el('div','help-related');footer.append(button('Troubleshooting',()=>choose('troubleshooting',true)),button('About & support',()=>{mode='about';draw();about.focus();}));article.append(footer);
   }
   search.oninput=()=>{query=search.value;list();};mobile.onchange=()=>choose(mobile.value,true);list();
  }
  draw();
 };
 function renderAbout(body){
  const page=el('article','help-about');page.tabIndex=0;page.setAttribute('aria-label','About Nightlink');const brand=el('div','help-brand'),icon=el('img');icon.src='icon.svg';icon.alt='Nightlink';brand.append(icon,el('h4','','Nightlink'));page.append(brand,el('p','help-lead','Off-grid communication. Powered by MeshCore.'));
  const purpose=el('section','help-purpose');purpose.append(el('h5','','Our purpose'),el('p','','Nightlink is built to work hand in hand with MeshCore, bringing off-grid radio communication to your Windows desktop. Core messaging connects directly to your MeshCore companion over Bluetooth or USB, with no internet connection, cloud account or online service required. MeshCore carries the messages; Nightlink gives you a clear, capable workspace to send, receive and keep them on your computer.'),el('p','help-caption','Optional online maps, web previews and update checks use the internet when available. They are not required for core MeshCore radio messaging.'));page.append(purpose);
  const version=el('p','help-version','Development preview · installed version is shown in the Windows app.');version.id='help-installed-version';page.append(version);
  if(window.meshlineUpdates)meshlineUpdates.info().then(info=>{if(info&&version.isConnected)version.textContent='Version '+info.version+' · '+(info.mode==='portable'?'Portable':'Windows installation')+(/-/.test(info.version)?' · Release candidate':'');}).catch(()=>{version.textContent='Version unavailable. Use Settings > Data & updates to check the installed build.';});
  const facts=[['Built for','Bluetooth and USB companion connections, channel conversations, direct messages, local contact cards and map views.'],['Local data','Message history, personal card details and preferences are stored on this computer. Exported backups are unencrypted.'],['Network services','CoreScope, MeshMapper, online tiles, URL previews and GitHub update checks depend on internet access and their service providers.'],['Independent project','Nightlink is an independent client. MeshCore firmware and the external map services are maintained by their respective projects.'],['Guide illustrations',NightlinkGuide.screenshotNote],['Release status','Published releases provide stable downloads, checksums and version-specific validation limits. Windows downloads are unsigned; verify them against the published checksums. The stable updater does not distribute local candidates or GitHub prereleases.']];
  const dl=el('dl','help-about-facts');for(const [name,text]of facts){const row=el('div');row.append(el('dt','',name),el('dd','',text));dl.append(row);}page.append(dl);
  const links=el('div','help-support');links.append(el('h5','','Project & support'));for(const [label,url]of [['Source repository','https://github.com/njsnowman/nightlink'],['Report an issue','https://github.com/njsnowman/nightlink/issues'],['Published releases','https://github.com/njsnowman/nightlink/releases'],['MeshCore documentation','https://docs.meshcore.io/']]){const row=el('div');row.append(button(label+' ↗',()=>external(url)),el('small','',url));links.append(row);}page.append(links,el('p','help-caption','Before reporting: include your version, radio model/firmware, transport and exact steps. Review diagnostics and screenshots for private information. Do not attach message backups or authenticator secrets.'));
  const licenses=el('section','help-licenses');licenses.append(el('h5','','Included library notices'));for(const [name,text]of Object.entries(window.NightlinkHelpLicenses||{})){const details=el('details'),summary=el('summary','',name);details.append(summary,el('pre','',text));licenses.append(details);}page.append(licenses);body.append(page);
 }
 function shortcut(){const b=button('Help & About',()=>NightlinkSettings.open('help'));b.id='open-help';moreGroup.append(b);}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',shortcut,{once:true});else shortcut();
})();
