/* Remote service reachability is checked by the Windows main process. */
window.NightlinkCoreScopeAvailability={
 watch(onFailure){
  let active=true,busy=false;
  async function check(){
   if(!active||busy||!window.nightlinkCoreScope)return;
   busy=true;
   try{if(!await window.nightlinkCoreScope.check()&&active)onFailure();}
   catch{if(active)onFailure();}finally{busy=false;}
  }
  check();const timer=setInterval(check,30000);
  return()=>{active=false;clearInterval(timer);};
 }
};
