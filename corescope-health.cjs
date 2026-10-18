const {base}=require('./meshmapper-region.js');
const HEALTH_URL='https://map.okimesh.org/api/health';
const MESHMAPPER_URL='https://cvg.meshmapper.net/embed.php';
async function probe(fetcher,{timeout=6000,source='corescope',region='CVG'}={}){
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),timeout);
 try{
  const meshmapper=source==='meshmapper';
  const response=await fetcher(meshmapper?base(region)+'embed.php':HEALTH_URL,{signal:controller.signal,cache:'no-store',credentials:'omit',redirect:'error'});
  if(!response.ok||!response.headers.get('content-type')?.includes(meshmapper?'text/html':'application/json'))return false;
  const reader=response.body.getReader();let length=0,chunks=[];
  for(;;){const {done,value}=await reader.read();if(done)break;length+=value.length;if(length>131072){await reader.cancel();return false;}chunks.push(Buffer.from(value));}
  const body=Buffer.concat(chunks).toString('utf8');
  return meshmapper?body.includes('MeshMapper'):JSON.parse(body).status==='ok';
 }catch{return false;}finally{clearTimeout(timer);}
}
function install({win,ipcMain,net}){
 const entries=new Map();
 for(const source of ['corescope','meshmapper'])ipcMain.handle(source+':health',(e,region='CVG')=>{
  if(e.sender!==win.webContents||e.senderFrame!==win.webContents.mainFrame)return false;
  let url;try{url=source==='meshmapper'?base(region)+'embed.php':HEALTH_URL;}catch{return false;}
  let entry=entries.get(url);if(!entry){if(entries.size>=32)entries.delete(entries.keys().next().value);entry={pending:null,last:null,checked:0};entries.set(url,entry);}
  if(entry.pending)return entry.pending;
  if(entry.last!==null&&Date.now()-entry.checked<5000)return entry.last;
  entry.pending=probe((...args)=>net.fetch(...args),{source,region}).then(value=>{entry.last=value;entry.checked=Date.now();return value;}).finally(()=>entry.pending=null);
  return entry.pending;
 });
}
module.exports={probe,install,HEALTH_URL,MESHMAPPER_URL};
