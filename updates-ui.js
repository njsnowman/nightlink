let updateInfo=null,updateState=null,updateBusy=false,updateInterval=null,updateStartup=null;
const updateBanner=document.createElement('button');updateBanner.id='update-available';updateBanner.className='update-banner';updateBanner.hidden=true;updateBanner.onclick=()=>window.meshlineUpdates?.open(true);document.body.append(updateBanner);
function paintUpdateStatus(){
 const status=$('#update-status'),check=$('#check-updates'),download=$('#download-update'),version=$('#installed-version');if(!status)return;
 version.textContent=updateInfo?'Installed version '+updateInfo.version+' · '+(updateInfo.mode==='portable'?'Portable':'Windows app'):'Web preview';
 check.hidden=!window.meshlineUpdates;check.disabled=updateBusy;
 download.hidden=updateState?.status!=='available';
 if(updateBusy)status.textContent='Checking GitHub releases…';
 else if(!window.meshlineUpdates)status.textContent='Version checks are available in the Windows app. Open GitHub releases to check downloads.';
 else if(!updateState)status.textContent='Checks use public GitHub releases without credentials. Local candidates are not offered by the stable feed.';
 else status.textContent=({available:'Nightlink '+updateState.latest+' is available.',current:'You have the latest available release.',ahead:'This build is newer than the latest published release.'})[updateState.status]||updateState.message;
 const last=$('#update-last-check');last.textContent=updateState?.checkedAt?'Last attempt: '+new Date(updateState.checkedAt).toLocaleString():'Not checked this session';
}
async function checkNightlinkUpdates(){
 if(updateBusy||!window.meshlineUpdates)return;updateBusy=true;paintUpdateStatus();
 try{updateState=await window.meshlineUpdates.check();if(updateState?.status==='available'){updateBanner.textContent='Nightlink '+updateState.latest+' available · Open download ↗';updateBanner.hidden=false;}else updateBanner.hidden=true;}
 catch{updateState={status:'error',message:'Update check failed. Open GitHub releases to check manually.'};updateBanner.hidden=true;}
 finally{updateBusy=false;paintUpdateStatus();}
}
function scheduleUpdateChecks(){
 clearInterval(updateInterval);clearTimeout(updateStartup);
 if(window.meshlineUpdates&&localStorage.getItem('nightlink.update-checks')==='true'){
  updateStartup=setTimeout(checkNightlinkUpdates,30000);updateInterval=setInterval(checkNightlinkUpdates,6*60*60*1000);
 }
}
function renderUpdateSettings(){
 const panel=document.createElement('section');panel.className='update-settings';panel.innerHTML='<h3>Nightlink updates</h3><p id="installed-version"></p><p id="update-status" role="status"></p><small id="update-last-check"></small><div class="update-actions"><button id="check-updates" type="button">Check for updates</button><button id="download-update" type="button" hidden>Open download ↗</button><button id="open-update-releases" type="button">Open GitHub releases ↗</button></div><label class="update-auto"><input id="automatic-update-checks" type="checkbox"> Check for updates while Nightlink is open</label><p>Checks run about every six hours when enabled. Updates are never installed automatically. Close Nightlink before running an installer; your radio connection is left alone. Local candidates and prereleases are not offered by the stable feed.</p>';$('.settings-grid').append(panel);
 $('#check-updates').onclick=checkNightlinkUpdates;$('#download-update').onclick=()=>window.meshlineUpdates?.open(true);
 $('#open-update-releases').onclick=()=>{if(window.meshlineUpdates)window.meshlineUpdates.open(false);else window.open('https://github.com/njsnowman/nightlink/releases/latest','_blank','noopener,noreferrer');};
 const toggle=$('#automatic-update-checks');toggle.disabled=!window.meshlineUpdates;toggle.checked=localStorage.getItem('nightlink.update-checks')==='true';toggle.onchange=()=>{localStorage.setItem('nightlink.update-checks',String(toggle.checked));scheduleUpdateChecks();if(toggle.checked)checkNightlinkUpdates();};paintUpdateStatus();
}
const updatesView=view;view=function(name){updatesView(name);if(name==='Settings')renderUpdateSettings();};
if(window.meshlineUpdates)window.meshlineUpdates.info().then(info=>{updateInfo=info;paintUpdateStatus();}).catch(()=>{});
scheduleUpdateChecks();if(current==='Settings')renderUpdateSettings();
