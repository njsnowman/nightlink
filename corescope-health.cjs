const HEALTH_URL='https://map.okimesh.org/api/health';
const MESHMAPPER_URL='https://cvg.meshmapper.net/embed.php';
async function probe(fetcher,{timeout=6000,source='corescope'}={}){
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),timeout);
 try{
  const meshmapper=source==='meshmapper';
  const response=await fetcher(meshmapper?MESHMAPPER_URL:HEALTH_URL,{signal:controller.signal,cache:'no-store',credentials:'omit',redirect:'error'});
  if(!response.ok||!response.headers.get('content-type')?.includes(meshmapper?'text/html':'application/json'))return false;
  const reader=response.body.getReader();let length=0,chunks=[];
  for(;;){const {done,value}=await reader.read();if(done)break;length+=value.length;if(length>131072){await reader.cancel();return false;}chunks.push(Buffer.from(value));}
  const body=Buffer.concat(chunks).toString('utf8');
  return meshmapper?body.includes('MeshMapper'):JSON.parse(body).status==='ok';
 }catch{return false;}finally{clearTimeout(timer);}
}
function install({win,ipcMain,net}){
 for(const source of ['corescope','meshmapper']){
 let pending=null,last=null,checked=0;
 ipcMain.handle(source+':health',e=>{
  if(e.sender!==win.webContents||e.senderFrame!==win.webContents.mainFrame)return false;
  if(pending)return pending;
  if(last!==null&&Date.now()-checked<5000)return last;
  pending=probe((...args)=>net.fetch(...args),{source}).then(value=>{last=value;checked=Date.now();return value;}).finally(()=>pending=null);
  return pending;
 });
 }
}
module.exports={probe,install,HEALTH_URL,MESHMAPPER_URL};
