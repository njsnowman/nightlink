/* Release checks do not download, install, quit, or touch Bluetooth. */
const RELEASES='https://github.com/njsnowman/nightlink/releases/latest';
const API='https://api.github.com/repos/njsnowman/nightlink/releases/latest';
function version(value){const m=/^v?(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.exec(value||'');if(!m)return null;const parts=m.slice(1).map(Number);return parts.every(Number.isSafeInteger)?parts:null;}
function compare(a,b){a=version(a);b=version(b);if(!a||!b)throw Error('Unsupported version.');for(let i=0;i<3;i++)if(a[i]!==b[i])return a[i]>b[i]?1:-1;return 0;}
function releaseURL(tag){return 'https://github.com/njsnowman/nightlink/releases/tag/'+tag;}
function selectRelease(data,installed,mode='portable'){
 if(!version(installed)||!data||data.draft||data.prerelease||!/^v\d+\.\d+\.\d+$/.test(data.tag_name)||!version(data.tag_name)||data.html_url!==releaseURL(data.tag_name)||!Array.isArray(data.assets))throw Error('GitHub returned unsupported release information.');
 const v=data.tag_name.slice(1),names=mode==='installer'?['Nightlink-Setup-'+v+'.exe']:['Nightlink-Portable-'+v+'.exe','Nightlink.'+v+'.exe','Nightlink '+v+'.exe'];
 const asset=names.map(name=>data.assets.find(a=>a.name===name&&a.state==='uploaded'&&Number.isFinite(a.size)&&a.size>0&&a.browser_download_url==='https://github.com/njsnowman/nightlink/releases/download/'+data.tag_name+'/'+encodeURIComponent(name))).find(Boolean);
 const diff=compare(data.tag_name,installed);
 return{status:diff>0?'available':diff===0?'current':'ahead',installed,latest:v,url:data.html_url,download:asset?.browser_download_url||null,digest:/^sha256:[a-f0-9]{64}$/.test(asset?.digest)?asset.digest:null};
}
async function check(installed,mode,fetcher=fetch){
 try{
  const response=await fetcher(API,{headers:{Accept:'application/vnd.github+json','User-Agent':'Nightlink/'+installed},redirect:'error',signal:AbortSignal.timeout(10000)});
  if([401,403,404].includes(response.status))return{status:'unavailable',installed,message:'GitHub could not provide release information. This private repository may require access in your signed-in browser. Rate limits can also prevent checks.',url:RELEASES};
  if(!response.ok)throw Error('GitHub returned HTTP '+response.status+'.');
  const reader=response.body?.getReader();let text='';
  if(reader){const decoder=new TextDecoder();let size=0;try{while(true){const {value,done}=await reader.read();if(done)break;size+=value.byteLength;if(size>1024*1024)throw Error('Release response was too large.');text+=decoder.decode(value,{stream:true});}text+=decoder.decode();}finally{reader.releaseLock();}}
  else{text=await response.text();if(Buffer.byteLength(text)>1024*1024)throw Error('Release response was too large.');}
  return selectRelease(JSON.parse(text),installed,mode);
 }catch(error){return{status:'error',installed,message:'Update check failed. Check your internet connection or open GitHub releases.',url:RELEASES};}
}
module.exports={RELEASES,API,version,compare,selectRelease,check};
