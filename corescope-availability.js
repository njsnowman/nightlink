/* Remote service reachability is checked by the Windows main process. */
window.NightlinkCoreScopeAvailability={
 watch(onFailure,source='corescope',region='CVG'){
  let active=true,busy=false,failures=0;
  async function check(){
   const bridge=source==='meshmapper'?window.nightlinkMeshMapper:window.nightlinkCoreScope;
   if(!active||busy||!bridge)return;
   busy=true;
   try{const healthy=await bridge.check(region);if(!active)return;failures=healthy?0:failures+1;if(failures>=2)onFailure();}
   catch{if(active&&++failures>=2)onFailure();}finally{busy=false;}
  }
  check();const timer=setInterval(check,30000);
  return()=>{active=false;clearInterval(timer);};
 }
};
