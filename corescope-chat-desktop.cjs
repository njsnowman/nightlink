/* Presentation-only adapter for the explicitly marked CoreScope chat iframe.
   No IPC, application data, radio commands or remote Node privileges are added. */
function isChatMap(url){try{const u=new URL(url);return u.origin==='https://map.okimesh.org'&&u.pathname==='/'&&u.hash.split('?')[0]==='#/live'&&new URLSearchParams(u.hash.split('?')[1]).get('nightlinkChatMap')==='1';}catch{return false;}}
const CSS=`
html,body,#app,.live-page{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;min-height:0!important;max-height:none!important;margin:0!important;padding:0!important;overflow:hidden!important}
body>:not(#app),#app>:not(.live-page),.live-page>:not(#liveMap){display:none!important}
#liveMap{position:absolute!important;inset:0!important;width:100%!important;height:100%!important}
#liveMap .leaflet-control:not(.leaflet-control-attribution),#liveMap .leaflet-popup-pane{display:none!important}
.leaflet-control-attribution{font-size:9px!important}
.nightlink-map-credit{position:absolute!important;right:0!important;bottom:0!important;z-index:10000!important;color:#000!important;background:#fff!important;font:10px/14px sans-serif!important;padding:0 3px!important;pointer-events:none!important}
`;
function prepare(css){
 if(window.__nightlinkChatMap)return;window.__nightlinkChatMap=true;
 const style=document.createElement('style');style.textContent=css;document.head.append(style);
 let ready=false;
 function check(){
  const map=document.querySelector('#liveMap.leaflet-container');
  if(ready||!map)return;ready=true;observer.disconnect();
  // The upstream live route disables Leaflet's attribution control. Keep its selected provider credit visible.
  if(!map.querySelector('.leaflet-control-attribution')){
   const theme=document.documentElement.getAttribute('data-theme'),dark=theme==='dark'||(theme!=='light'&&matchMedia('(prefers-color-scheme: dark)').matches);
   const id=dark?window.MC_getDarkTileProvider?.():window.MC_getLightTileProvider?.();
   const attribution=window.MC_TILE_PROVIDERS?.[id]?.attribution||'© OpenStreetMap © CARTO';
   const credit=document.createElement('div');credit.className='nightlink-map-credit';credit.setAttribute('aria-label','Map attribution');credit.textContent=new DOMParser().parseFromString(attribution,'text/html').body.textContent;map.append(credit);
  }
  // ResizeObserver/window resize paths in CoreScope update Leaflet's dimensions.
  window.dispatchEvent(new Event('resize'));
  parent.postMessage({type:'nightlink-corescope-map-ready'},'*');
 }
 const observer=new MutationObserver(check);observer.observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});check();
}
const SCRIPT='('+prepare.toString()+')('+JSON.stringify(CSS)+')';
function install(win,{onError=()=>{}}={}){
 win.webContents.on('frame-created',(_event,{frame})=>{
  frame.on('dom-ready',()=>{
   if(frame.parent!==win.webContents.mainFrame||!isChatMap(frame.url))return;
   frame.executeJavaScript(SCRIPT).catch(onError);
  });
 });
}
module.exports={isChatMap,CSS,SCRIPT,install};
