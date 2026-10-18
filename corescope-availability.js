/* Remote service reachability is checked by the Windows main process. */
window.NightlinkCoreScopeAvailability={
 watch(onFailure,source='corescope'){
  let active=true,busy=false;
  async function check(){
   const bridge=source==='meshmapper'?window.nightlinkMeshMapper:window.nightlinkCoreScope;
   if(!active||busy||!bridge)return;
   busy=true;
   try{if(!await bridge.check()&&active)onFailure();}
   catch{if(active)onFailure();}finally{busy=false;}
  }
  check();const timer=setInterval(check,30000);
  return()=>{active=false;clearInterval(timer);};
 }
};
