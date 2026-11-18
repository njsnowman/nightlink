/* Retained modal-editor fixtures explicitly expand the alternate editing route. */
module.exports=async page=>{await page.addInitScript(()=>{const expand=()=>document.querySelectorAll('.task-legacy-editors').forEach(d=>{if(!d.open)d.open=true;});window.addEventListener('DOMContentLoaded',()=>{expand();new MutationObserver(expand).observe(document.body,{childList:true,subtree:true});});});};
