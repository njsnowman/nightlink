/* Terminal extras (0.8.30): optional blinking command cursor and full-name tooltips on shortened names.
   Presentation only; the blink is a class toggled from script because terminal.css carries no animations. */
(function(root){
 'use strict';
 const doc=root.document;
 const reduced=()=>root.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
 let timer=null;
 function motion(){clearInterval(timer);timer=null;const on=doc.documentElement.dataset.termMotion==='on'&&doc.documentElement.dataset.interface==='terminal'&&!reduced();
  doc.querySelector('#bbs-command')?.classList.remove('term-blink-off');if(!on)return;timer=setInterval(()=>{const i=doc.querySelector('#bbs-command');if(i&&doc.activeElement!==i)i.classList.toggle('term-blink-off');},530);}
 // Shortened names (ellipsis) show the full text on hover.
 function titles(scope=doc){for(const e of scope.querySelectorAll('.bbs-caller .term-name, .mrc-window-list button, .mrc-window-list a, .term-status-node')){const t=e.textContent.trim();if(t&&e.title!==t&&!e.title)e.title=t;}}
 doc.addEventListener('DOMContentLoaded',()=>{motion();titles();let pending=null;new MutationObserver(()=>{if(pending)return;pending=setTimeout(()=>{pending=null;titles();},500);}).observe(doc.body,{childList:true,subtree:true});
  new MutationObserver(motion).observe(doc.documentElement,{attributes:true,attributeFilter:['data-term-motion','data-interface']});});
 root.NightlinkTerminalExtras={motion,titles};
})(typeof window==='object'?window:globalThis);
