const URL='https://connectivitycheck.gstatic.com/generate_204';
const CACHE_MS=15000,TIMEOUT_MS=4500;
async function probe(fetcher,{timeout=TIMEOUT_MS}={}){
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),timeout);
 try{const response=await fetcher(URL,{method:'GET',signal:controller.signal,cache:'no-store',credentials:'omit',redirect:'error'});return response.status===204;}
 catch{return false;}finally{clearTimeout(timer);}
}
function install({ipcMain,net,trusted}){
 let pending=null,last=null,checkedAt=0;
 ipcMain.handle('internet:status',async event=>{
  if(!trusted(event))return null;
  if(pending)return pending;
  if(last!==null&&Date.now()-checkedAt<CACHE_MS)return last;
  pending=probe((...args)=>net.fetch(...args)).then(value=>{last=value;checkedAt=Date.now();return value;}).finally(()=>pending=null);
  return pending;
 });
}
module.exports={URL,probe,install};
