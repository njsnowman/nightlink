/* Observe existing events only; timing does not issue radio or network requests. */
(function(){
 const timings=window.NightlinkPerformance;if(!timings)return;
 let connecting=false,syncStage=null;
 function stage(next,outcome='complete'){if(syncStage)timings.end(syncStage,outcome);syncStage=next;if(next)timings.begin(next);}
 ble.addEventListener('state',e=>{
  const state=e.detail.state;
  if(['scanning','connecting','initializing'].includes(state)&&!connecting){connecting=true;timings.begin('connection');}
  if(state==='connected'){timings.end('connection');connecting=false;}
  if(state==='disconnected'&&connecting){timings.end('connection','disconnected');connecting=false;}
 });
 radioSession.addEventListener('sync',e=>{
  const state=e.detail.state;
  if(state==='syncing'){timings.begin('sync');stage('channels');}
  else if(['ready','error','disconnected'].includes(state)){const outcome=state==='ready'?'complete':state==='error'?'failed':'disconnected';stage(null,outcome);timings.end('sync',outcome);}
 });
 radioSession.addEventListener('sync-progress',e=>{
  const text=e.detail.stage||'';
  const next=/Loading channel /.test(text)?'channels':/queued messages|Recovering queued/.test(text)?'queue':/Loading contacts/.test(text)?'contacts':/Loading telemetry/.test(text)?'telemetry':null;
  if(next&&next!==syncStage)stage(next);
 });
 document.addEventListener('DOMContentLoaded',()=>{timings.end('app-script');timings.begin('workspace-first-frame');requestAnimationFrame(()=>requestAnimationFrame(()=>timings.end('workspace-first-frame')));},{once:true});
})();
