/* A local, reviewable export. This path never uploads, probes or changes a radio. */
(()=>{
 let opening=false;
 async function preview(){
  if(opening)return;opening=true;try{let info=null;
  try{info=await window.meshlineUpdates?.info();}catch{}
  const report=NightlinkSupportReport.build({appVersion:info?.version,transport:ble.kind,connection:ble.state,sync:live.sync,protocol:live.identity?.protocol,storageError:live.storageError,savedMessageCount:live.messages.length,health:radioHealth.snapshot(),timings:window.NightlinkPerformance?.snapshot(),events:typeof diagnostics==='undefined'?[]:diagnostics});
  const text=JSON.stringify(report,null,2);
  modal('Support report','<section id="support-report-preview" class="diagnostics-workspace"><p>This local report includes app version, connection status, synchronization counters, command numbers, error categories and timing measurements. It excludes message text, names, keys, channel secrets, locations, raw frames and free-form error details.</p><details><summary>Review report contents</summary><pre id="support-report-content"></pre></details><button type="button" id="save-support-report" class="primary">Save support report</button><p id="support-report-status" role="status">Nothing has been uploaded.</p></section>');
  const content=document.querySelector('#support-report-content');content.textContent=text;content.style.maxHeight='40vh';content.style.overflow='auto';content.tabIndex=0;content.setAttribute('aria-label','Support report JSON');
  document.querySelector('#save-support-report').onclick=()=>{
   const status=document.querySelector('#support-report-status');let url;
   try{url=URL.createObjectURL(new Blob([text],{type:'application/json'}));const link=document.createElement('a');link.href=url;link.download='nightlink-support-'+report.createdAt.replace(/[:.]/g,'-')+'.json';document.body.append(link);link.click();link.remove();status.textContent='Local export started. Check that the file finished saving before sharing it.';}
   catch{status.textContent='The report could not be exported. Try again.';}
   finally{if(url)setTimeout(()=>URL.revokeObjectURL(url),1000);}
  };
  }catch{toast('Support report could not be prepared. Try again.');}finally{opening=false;}
 }
 function attach(holder,id){if(!holder||holder.querySelector('[data-support-report]'))return;const button=document.createElement('button');button.id=id;button.type='button';button.dataset.supportReport='true';button.className='radio-manage';button.textContent='Support report';button.onclick=preview;holder.append(button);}
 // Older controls may hold the pre-wrapper showRadioHealth callback.
 const dialogBody=document.querySelector('#dialog-body');if(dialogBody)new MutationObserver(()=>attach(document.querySelector('#radio-health .health-actions'),'health-support-report')).observe(dialogBody,{childList:true});
 const health=showRadioHealth;showRadioHealth=function(...args){const result=health.apply(this,args);attach(document.querySelector('#radio-health .health-actions'),'health-support-report');return result;};
 const diagnosticsBody=renderDiagnosticsBody;renderDiagnosticsBody=function(...args){const result=diagnosticsBody.apply(this,args);attach(document.querySelector('#diagnostics-body .diagnostics-actions'),'diagnostics-support-report');return result;};
 if(current==='Diagnostics')attach(document.querySelector('#diagnostics-body .diagnostics-actions'),'diagnostics-support-report');
 window.NightlinkSupportReportUI={preview};
})();
