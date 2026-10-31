/* Overview presentation only. Split preference stays local; no radio operations. */
(function(root){
 const key='nightlink.overview-layout.v1';
 function preference(value){return typeof value==='number'&&Number.isFinite(value)&&value>=40&&value<=75?value:60;}
 function limits(width){if(!Number.isFinite(width)||width<=0)return{min:40,max:75};const min=Math.max(40,Math.min(60,300/width*100)),max=Math.max(min,Math.min(75,100-250/width*100));return{min,max};}
 function constrain(value,width){const range=limits(width);return Math.max(range.min,Math.min(range.max,preference(value)));}
 const api={preference,limits,constrain,key};root.NightlinkCompactWorkspace=api;if(typeof module!=='undefined')module.exports=api;
 if(typeof document==='undefined')return;
 const grid=document.querySelector('#overview>.dashboard-grid');if(!grid)return;
 let preferred=60,frame=0;try{preferred=preference(JSON.parse(localStorage.getItem(key)||'null')?.messages);}catch{}
 const divider=document.createElement('div');divider.id='overview-splitter';divider.className='overview-splitter';divider.tabIndex=0;divider.setAttribute('role','separator');divider.setAttribute('aria-orientation','vertical');divider.setAttribute('aria-label','Resize Overview messages and map');divider.setAttribute('aria-description','Use Left and Right arrow keys to resize, Home and End for the limits, or Enter to restore the balanced split.');divider.title='Drag to resize messages and map. Use arrow keys; Enter or double-click restores the balanced split.';grid.append(divider);
 function width(){return Math.max(0,grid.getBoundingClientRect().width-18);}
 function invalidateMap(){if(typeof networkStreetMap!=='undefined')networkStreetMap?.invalidateSize();}
 function stopResize(){divider.classList.remove('is-resizing');grid.classList.remove('overview-resizing');}
 function apply(){const wide=innerWidth>1000,currentOverview=typeof current==='undefined'||current==='Overview';divider.hidden=!wide||!currentOverview;divider.tabIndex=divider.hidden?-1:0;if(divider.hidden){stopResize();return;}const available=width(),range=limits(available),actual=constrain(preferred,available);grid.style.setProperty('--overview-message-share',String(actual/100));divider.setAttribute('aria-valuemin',String(Math.round(range.min)));divider.setAttribute('aria-valuemax',String(Math.round(range.max)));divider.setAttribute('aria-valuenow',String(Math.round(actual)));divider.setAttribute('aria-valuetext',Math.round(actual)+'% messages, '+Math.round(100-actual)+'% map');invalidateMap();}
 function schedule(){if(frame)return;frame=requestAnimationFrame(()=>{frame=0;apply();});}
 function change(value){preferred=preference(value);try{localStorage.setItem(key,JSON.stringify({messages:preferred}));}catch{}apply();}
 divider.onkeydown=e=>{const range=limits(width()),step=e.shiftKey?10:2,value=Number(divider.getAttribute('aria-valuenow'))||preferred;if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();change(Math.max(range.min,Math.min(range.max,value+(e.key==='ArrowRight'?step:-step))));}else if(e.key==='Home'||e.key==='End'){e.preventDefault();change(e.key==='Home'?range.min:range.max);}else if(e.key==='Enter'){e.preventDefault();change(60);}};
 divider.ondblclick=()=>change(60);
 divider.onpointerdown=e=>{if(e.button!==0)return;e.preventDefault();divider.focus();divider.setPointerCapture(e.pointerId);divider.classList.add('is-resizing');grid.classList.add('overview-resizing');};
 divider.onpointermove=e=>{if(!divider.hasPointerCapture(e.pointerId))return;const available=width();if(!available)return;const range=limits(available),next=(e.clientX-grid.getBoundingClientRect().left-9)/available*100;change(Math.max(range.min,Math.min(range.max,next)));};
 divider.onpointerup=e=>{if(divider.hasPointerCapture(e.pointerId))divider.releasePointerCapture(e.pointerId);};divider.onlostpointercapture=stopResize;divider.onpointercancel=stopResize;window.addEventListener('blur',stopResize);
 new ResizeObserver(schedule).observe(grid);window.addEventListener('resize',schedule);
 if(typeof view==='function'){const previous=view;view=function(...args){const result=previous.apply(this,args);apply();return result;};}
 apply();
})(globalThis);
