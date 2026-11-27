/* Style state for former CSS :has() selectors (#207). Stylesheet :has() rules anchored on page ancestors made Chromium
   restyle the whole document on every DOM insertion (about 50 ms with long chat histories). The generated table in
   has-state-rules.js lists each condition; this keeps the matching class on each element. Mutation observer callbacks
   run before the next paint, so classes are current when the page renders. */
(function(root){
 'use strict';
 const rules=(root.NightlinkHasRules||[]).map(([cls,anchor,arg])=>({cls,sel:anchor+':has('+arg+')'}));
 const doc=root.document;let observer=null;
 function update(){
  for(const {cls,sel} of rules){
   let want;try{want=new Set(doc.querySelectorAll(sel));}catch{continue;}
   for(const e of [...doc.getElementsByClassName(cls)])if(!want.has(e))e.classList.remove(cls);
   for(const e of want)if(!e.classList.contains(cls))e.classList.add(cls);
  }
  observer?.takeRecords();
 }
 observer=new MutationObserver(update);
 observer.observe(doc.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['hidden','class','id','type','data-setting','role']});
 update();if(doc.readyState==='loading')doc.addEventListener('DOMContentLoaded',update,{once:true});
 root.NightlinkHasState={update,rules};
})(window);
