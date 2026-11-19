let updateInfo=null,updateState=null,updateBusy=false,updateInterval=null,updateStartup=null;
const updateBanner=document.createElement('button');updateBanner.id='update-available';updateBanner.className='update-banner';updateBanner.hidden=true;updateBanner.onclick=()=>window.meshlineUpdates?.open(true);document.body.append(updateBanner);
function paintUpdateStatus(){
 const status=$('#update-status'),check=$('#check-updates'),download=$('#download-update'),version=$('#installed-version');if(!status)return;
 version.textContent=updateInfo?'Installed version '+updateInfo.version+' · '+(updateInfo.mode==='portable'?'Portable':'Windows app'):'Web preview';
 check.hidden=!window.meshlineUpdates;check.disabled=updateBusy;
 download.hidden=updateState?.status!=='available'||updateState.verification==='mismatch';
 if(updateBusy)status.textContent='Checking GitHub releases…';
 else if(!window.meshlineUpdates)status.textContent='Version checks are available in the Windows app. Open GitHub releases to check downloads.';
 else if(!updateState)status.textContent='Checks use public GitHub releases without credentials. Local candidates are not offered by the stable feed.';
 else status.textContent=({available:'Nightlink '+updateState.latest+' is available.',current:'You have the latest available release.',ahead:'This build is newer than the latest published release.'})[updateState.status]||updateState.message;
 paintUpdateIntegrity();
 const last=$('#update-last-check');last.textContent=updateState?.checkedAt?'Last attempt: '+new Date(updateState.checkedAt).toLocaleString():'Not checked this session';
}
// Nightlink opens downloads in the browser, so the user compares the file against the published checksum.
function updateHashCommand(name){return 'Get-FileHash -Algorithm SHA256 "$env:USERPROFILE\\Downloads\\'+name+'"';}
async function copyUpdateText(value,label){try{await navigator.clipboard.writeText(value);$('#update-integrity-copied').textContent=label+' copied.';}catch{$('#update-integrity-copied').textContent='Copy failed. Select the text instead.';}}
function paintUpdateIntegrity(){
 const box=$('#update-integrity');if(!box)return;const state=updateState;
 if(state?.status!=='available'||!state.name){box.hidden=true;return;}
 box.hidden=false;const note=$('#update-integrity-note'),details=$('#update-integrity-details');
 if(state.verification==='consistent'){
  box.removeAttribute('role');box.dataset.state='consistent';details.hidden=false;
  note.textContent='Before running '+state.name+', check that its SHA-256 matches the published value. Nightlink opens the download in your browser and cannot check the downloaded file itself.';
  $('#update-integrity-sha').textContent=state.sha256;$('#update-integrity-command').textContent=updateHashCommand(state.name);
 }else{
  box.setAttribute('role','alert');box.dataset.state=state.verification||'missing';details.hidden=true;
  note.textContent=state.verification==='mismatch'?'The published checksums for '+state.name+' disagree. Do not run this download. Open GitHub releases and report the problem.':'Nightlink could not confirm published checksums for '+state.name+'. Compare the download with SHA256SUMS.txt on the GitHub release page before running it.';
 }
}
async function checkNightlinkUpdates(){
 if(updateBusy||!window.meshlineUpdates)return;updateBusy=true;paintUpdateStatus();
 try{updateState=await window.meshlineUpdates.check();if(updateState?.status==='available'){updateBanner.textContent='Nightlink '+updateState.latest+' available · '+(updateState.verification==='consistent'?'Open download ↗':'Checksum warning · open release ↗');updateBanner.hidden=false;}else updateBanner.hidden=true;}
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
 const panel=document.createElement('section');panel.className='update-settings';panel.innerHTML='<h3>Nightlink updates</h3><p id="installed-version"></p><p id="update-status" role="status"></p><small id="update-last-check"></small><div id="update-integrity" hidden><p id="update-integrity-note"></p><div id="update-integrity-details"><p>Expected SHA-256: <code id="update-integrity-sha"></code></p><p>PowerShell: <code id="update-integrity-command"></code></p><div class="update-actions"><button id="copy-update-sha" type="button">Copy checksum</button><button id="copy-update-command" type="button">Copy command</button></div><small id="update-integrity-copied" role="status"></small></div></div><div class="update-actions"><button id="check-updates" type="button">Check for updates</button><button id="download-update" type="button" hidden>Open download ↗</button><button id="open-update-releases" type="button">Open GitHub releases ↗</button></div><label class="update-auto"><input id="automatic-update-checks" type="checkbox"> Check for updates while Nightlink is open</label><p>Checks run about every six hours when enabled. Updates are never installed automatically. Close Nightlink before running an installer; your radio connection is left alone. Local candidates and prereleases are not offered by the stable feed.</p>';$('.settings-grid').append(panel);
 $('#check-updates').onclick=checkNightlinkUpdates;$('#copy-update-sha').onclick=()=>updateState?.sha256&&copyUpdateText(updateState.sha256,'Checksum');$('#copy-update-command').onclick=()=>updateState?.name&&copyUpdateText(updateHashCommand(updateState.name),'Command');$('#download-update').onclick=()=>window.meshlineUpdates?.open(true);
 $('#open-update-releases').onclick=()=>{if(window.meshlineUpdates)window.meshlineUpdates.open(false);else window.open('https://github.com/njsnowman/nightlink/releases/latest','_blank','noopener,noreferrer');};
 const toggle=$('#automatic-update-checks');toggle.disabled=!window.meshlineUpdates;toggle.checked=localStorage.getItem('nightlink.update-checks')==='true';toggle.onchange=()=>{localStorage.setItem('nightlink.update-checks',String(toggle.checked));scheduleUpdateChecks();if(toggle.checked)checkNightlinkUpdates();};paintUpdateStatus();
}
const updatesView=view;view=function(name){updatesView(name);if(name==='Settings')renderUpdateSettings();};
if(window.meshlineUpdates)window.meshlineUpdates.info().then(info=>{updateInfo=info;paintUpdateStatus();}).catch(()=>{});
scheduleUpdateChecks();if(current==='Settings')renderUpdateSettings();
