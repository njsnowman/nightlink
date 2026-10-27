/* One visual control family; original handlers and connection logic remain authoritative. */
(function(){
 const root=document.querySelector('.header-actions');
 const paths={search:'M14 14l4 4M16 9a7 7 0 1 1-14 0 7 7 0 0 1 14 0',layout:'M3 3h14v14H3zM8 3v14M8 8h9',radio:'M10 17V9M7 17h6M8 8a2 2 0 1 1 4 0M5 4a7 7 0 0 0 0 10M15 4a7 7 0 0 1 0 10',cancel:'M5 5l10 10M15 5 5 15',retry:'M16 7a7 7 0 1 0 1 6M16 2v5h-5'};
 function decorate(button,kind){
  if(!button)return;
  button.classList.add('header-control');
  if(button.querySelector(':scope > .header-control-label'))return;
  const label=button.textContent.trim().replace(/^[⌕⌁]\s*/,'');
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 20 20');svg.setAttribute('aria-hidden','true');
  const path=document.createElementNS(svg.namespaceURI,'path');path.setAttribute('d',paths[kind]);svg.append(path);
  const span=document.createElement('span');span.className='header-control-label';span.textContent=label;
  button.replaceChildren(svg,span);
  if(kind==='radio')button.title=label;
 }
 function refresh(){for(const [id,kind]of [['open-message-search','search'],['compact-toggle','layout'],['connection','radio'],['startup-connect-cancel','cancel'],['startup-connect-retry','retry']])decorate(document.getElementById(id),kind);}
 new MutationObserver(refresh).observe(root,{childList:true,subtree:true,characterData:true});refresh();
})();
