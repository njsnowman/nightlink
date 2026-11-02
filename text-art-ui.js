/* Text art picker for the main and detached DM composers. Inserts at the caret; sends nothing. */
(function(){
'use strict';
const art=window.NightlinkTextArt;if(!art)return;
const icon='<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="5" width="17" height="14" rx="2.5"/><path d="M7 10h2M11 10h6M7 14h4M13 14h4"/></svg>';
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
function attach(form,input,before){
  if(!form||!input||form.querySelector('.text-art-toggle'))return;
  const button=document.createElement('button');button.type='button';button.className='text-art-toggle';button.setAttribute('aria-label','Insert text art');button.setAttribute('aria-haspopup','dialog');button.setAttribute('aria-expanded','false');button.title='Text art';button.innerHTML=icon;
  const pop=document.createElement('div');pop.className='text-art-popover';pop.hidden=true;pop.setAttribute('role','dialog');pop.setAttribute('aria-label','Text art');
  form.classList.add('text-art-host');form.insertBefore(button,before||null);form.appendChild(pop);
  let caret=null;
  const items=()=>[...pop.querySelectorAll('.text-art-item')];
  function remaining(){const [s,e]=caret,v=input.value;return art.LIMIT-art.byteLength(v.slice(0,s)+v.slice(e));}
  function render(){const left=remaining();pop.innerHTML='<div class="text-art-heading"><strong>Text art</strong><span class="text-art-left">'+Math.max(0,left)+' of '+art.LIMIT+' bytes available</span></div>'+art.GROUPS.map(g=>'<section class="text-art-group"><h3>'+esc(g.name)+'</h3><div class="text-art-grid">'+g.items.map(t=>{const b=art.byteLength(t);return '<button type="button" class="text-art-item" data-art="'+esc(t)+'" title="'+esc(t)+'"'+(b>left?' disabled':'')+' aria-label="'+esc(t)+', '+b+' bytes"><span class="text-art-sample">'+esc(t)+'</span><small>'+b+' B</small></button>';}).join('')+'</div></section>').join('');}
  function open(){caret=[input.selectionStart??input.value.length,input.selectionEnd??input.value.length];render();pop.hidden=false;button.setAttribute('aria-expanded','true');(items().find(b=>!b.disabled)||button).focus();}
  function close(focus=true){if(pop.hidden)return;pop.hidden=true;button.setAttribute('aria-expanded','false');if(focus)input.focus();}
  function insert(text){const [s,e]=caret,next=input.value.slice(0,s)+text+input.value.slice(e);if(!art.fits(next)){if(typeof toast==='function')toast('Text art exceeds the 133-byte message limit.');return;}input.value=next;close();const at=s+text.length;input.setSelectionRange(at,at);input.dispatchEvent(new Event('input',{bubbles:true}));}
  button.addEventListener('click',()=>pop.hidden?open():close());
  pop.addEventListener('click',e=>{const b=e.target.closest('.text-art-item');if(b&&!b.disabled)insert(b.dataset.art);});
  pop.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();close();return;}const list=items().filter(b=>!b.disabled),i=list.indexOf(document.activeElement);if(i<0)return;const step={ArrowRight:1,ArrowLeft:-1,ArrowDown:3,ArrowUp:-3,Home:-i,End:list.length-1-i}[e.key];if(step===undefined)return;e.preventDefault();list[Math.max(0,Math.min(list.length-1,i+step))].focus();});
  document.addEventListener('pointerdown',e=>{if(!pop.hidden&&!pop.contains(e.target)&&!button.contains(e.target))close(false);});
}
function init(){const main=document.querySelector('#chat-form'),dm=document.querySelector('#dm-reply');if(main)attach(main,main.querySelector('#message-input'),main.querySelector('button:not(.text-art-toggle)'));if(dm)attach(dm,dm.querySelector('#dm-text'),dm.querySelector('#dm-send'));}
window.NightlinkTextArtUI={init,attach};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
