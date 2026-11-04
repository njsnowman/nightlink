/* Dedicated Queen City Con variant. Block-data branding; explicit channel-only public display. */
(function(root){
 'use strict';
 const CREDIT='By: Nightlink / Sysop SN0WMAN',SITE='https://queencitycon.org/';
 if(typeof module==='object'&&module.exports){module.exports={CREDIT,SITE};return;}
 const doc=root.document;
 const el=(tag,cls,text)=>{const n=doc.createElement(tag);n.className=cls;if(text)n.textContent=text;return n;};
 function logo(d=doc){const wrap=d.createElement('div');wrap.className='qcc-brand';
  if(root.NightlinkTerminalLogo?.pixelArt&&root.QueenCityLogoArt)wrap.append(root.NightlinkTerminalLogo.pixelArt(d,root.QueenCityLogoArt,'QUEEN CITY CON ASCII logo'));
  const credit=d.createElement('p');credit.className='qcc-credit';credit.textContent=CREDIT;
  const website=d.createElement('p');website.className='qcc-website';website.textContent='queencitycon.org';wrap.append(credit,website);return wrap;
 }
 let presenting=false,pinned=null;
 const api={logo,CREDIT,SITE,presenting:()=>presenting,publicWindow:()=>presenting?pinned:null};root.NightlinkEventBrand=api;
 doc.addEventListener('DOMContentLoaded',()=>{
  if(typeof view!=='function'||!root.NightlinkMRC)return;
  doc.body.classList.add('qcc-showcase');
  function stop(){const target=pinned?.target;presenting=false;pinned=null;if(target)live.selected={...target};doc.body.classList.remove('qcc-on-air');if(doc.fullscreenElement)doc.exitFullscreen?.().catch(()=>{});root.NightlinkMRC.render();decorate();}
  function start(){
   if(current!=='Messages'||live.selected?.kind!=='channel')return;
   pinned={id:conversationId(live.selected),label:'#'+live.selected.name,kind:'channel',target:{...live.selected}};presenting=true;
   // Close private conversation windows before displaying the public channel.
   if(typeof dmPopups==='object'){for(const p of dmPopups.values())if(p instanceof HTMLElement)p.remove();dmPopups.clear();}
   if(typeof dmPublishedSnapshots==='object')dmPublishedSnapshots.clear();root.meshlineDM?.clear();
   doc.body.classList.add('qcc-on-air');root.NightlinkMRC.render();decorate();
   doc.documentElement.requestFullscreen?.().catch(()=>{});
  }
  function decorate(){
   const mrc=doc.querySelector('#mrc');if(!mrc){if(presenting)stop();return;}
   mrc.classList.add('qcc-chat');
   if(!mrc.querySelector('.qcc-masthead')){
    const mast=el('div','qcc-masthead');mast.append(logo());
    const words=el('div','qcc-display-label');words.append(el('strong','','QUEEN CITY CON'),el('span','','MESH CHAT DISPLAY'));mast.append(words);mrc.prepend(mast);
   }
   const heading=mrc.querySelector('.mrc-heading');
   if(heading&&!heading.querySelector('.qcc-display-button')){
    const button=el('button','qcc-display-button',presenting?'Exit big-screen display':'Start big-screen display');button.type='button';button.onclick=()=>presenting?stop():start();heading.append(button);
   }
   const button=heading?.querySelector('.qcc-display-button');if(button){button.textContent=presenting?'Exit big-screen display':'Start big-screen display';button.disabled=!presenting&&live.selected?.kind!=='channel';button.title=button.disabled?'Choose a radio channel to display':'';}
   if(presenting){const log=mrc.querySelector('.mrc-log');if(log)log.scrollTop=log.scrollHeight;}
  }
  const priorView=view;view=function(name){if(presenting&&name!=='Messages')stop();const result=priorView.apply(this,arguments);decorate();return result;};
  const priorRender=renderMessages;renderMessages=function(){const result=priorRender.apply(this,arguments);decorate();return result;};
  const priorSelect=selectConversation;selectConversation=function(target){if(presenting)return;return priorSelect.apply(this,arguments);};
  if(typeof quietHoursActive==='function'){const quiet=quietHoursActive;quietHoursActive=function(){return presenting||quiet();};}
  doc.addEventListener('keydown',e=>{if(!presenting)return;e.preventDefault();e.stopImmediatePropagation();if(e.key==='Escape')stop();},true);
  doc.addEventListener('fullscreenchange',()=>{if(presenting&&!doc.fullscreenElement)stop();});
  root.addEventListener('nightlink-interface',()=>{if(!root.NightlinkInterface?.isTerminal())stop();decorate();});
  function launch(){if(!root.NightlinkInterface.isTerminal())root.NightlinkInterface.set?.('terminal');view('Messages');if(live.selected?.kind==='channel')start();else if(typeof toast==='function')toast('Select a public channel in WINDOWS, then choose Start big-screen display.');}
  Object.assign(api,{start,stop,decorate,launch});decorate();
 });
})(typeof window==='object'?window:globalThis);
