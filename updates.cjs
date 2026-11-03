/* Release checks do not download, install, quit, or touch Bluetooth. */
const RELEASES='https://github.com/njsnowman/nightlink/releases/latest';
const API='https://api.github.com/repos/njsnowman/nightlink/releases/latest';
function version(value){const m=/^v?(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.exec(value||'');if(!m)return null;const parts=m.slice(1).map(Number);return parts.every(Number.isSafeInteger)?parts:null;}
function installedVersion(value){
 if(typeof value!=='string'||value.length>128)return null;
 const m=/^v?((?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*))(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/.exec(value);
 if(!m)return null;const core=version(m[1]),pre=m[2]?.split('.')||[];
 if(!core||pre.some(x=>/^\d+$/.test(x)&&x.length>1&&x[0]==='0'))return null;
 return{core,pre};
}
function compare(a,b){
 a=installedVersion(a);b=installedVersion(b);if(!a||!b)throw Error('Unsupported version.');
 for(let i=0;i<3;i++)if(a.core[i]!==b.core[i])return a.core[i]>b.core[i]?1:-1;
 if(!a.pre.length||!b.pre.length)return a.pre.length?-1:b.pre.length?1:0;
 for(let i=0;i<Math.max(a.pre.length,b.pre.length);i++){
  if(a.pre[i]===undefined)return -1;if(b.pre[i]===undefined)return 1;
  const x=a.pre[i],y=b.pre[i];if(x===y)continue;
  const xn=/^\d+$/.test(x),yn=/^\d+$/.test(y);
  if(xn&&yn)return BigInt(x)>BigInt(y)?1:-1;if(xn!==yn)return xn?-1:1;return x>y?1:-1;
 }return 0;
}
function releaseURL(tag){return 'https://github.com/njsnowman/nightlink/releases/tag/'+tag;}
const SUMS='SHA256SUMS.txt',SUMS_LIMIT=16*1024,DOWNLOAD='https://github.com/njsnowman/nightlink/releases/download/';
// GitHub serves release assets through a redirect; only these storage hosts are followed.
const ASSET_HOSTS=new Set(['objects.githubusercontent.com','release-assets.githubusercontent.com']);
function assetURL(tag,name){return DOWNLOAD+tag+'/'+encodeURIComponent(name);}
function findAsset(data,name){return data.assets.find(a=>a&&a.name===name&&a.state==='uploaded'&&Number.isFinite(a.size)&&a.size>0&&a.browser_download_url===assetURL(data.tag_name,name));}
async function readCapped(response,limit,message){
 const reader=response.body?.getReader();let text='';
 if(reader){const decoder=new TextDecoder();let size=0;try{while(true){const {value,done}=await reader.read();if(done)break;size+=value.byteLength;if(size>limit)throw Error(message);text+=decoder.decode(value,{stream:true});}text+=decoder.decode();}finally{reader.releaseLock();}}
 else{text=await response.text();if(Buffer.byteLength(text)>limit)throw Error(message);}
 return text;
}
// SHA256SUMS.txt lines are "<64 hex>  <file name>" (verify-package.cjs); any other line rejects the file.
function parseSums(text){
 if(typeof text!=='string'||Buffer.byteLength(text)>SUMS_LIMIT)throw Error('Checksum file is too large.');
 const sums=new Map();
 for(const raw of text.split(/\r?\n/)){const line=raw.trim();if(!line)continue;const m=/^([a-fA-F0-9]{64}) [ *]?([^\s/\\](?:[^/\\]*[^\s/\\])?)$/.exec(line);if(!m||sums.has(m[2]))throw Error('Checksum file is malformed.');sums.set(m[2],m[1].toLowerCase());}
 if(!sums.size)throw Error('Checksum file is empty.');
 return sums;
}
// Both published sources must agree before a value is shown as the expected checksum.
function integrity(name,digest,sums){
 if(!name)return{verification:'no-asset',sha256:null};
 const fromDigest=typeof digest==='string'&&/^sha256:[a-f0-9]{64}$/.test(digest)?digest.slice(7):null,fromSums=sums instanceof Map?sums.get(name)||null:null;
 if(fromDigest&&fromSums)return fromDigest===fromSums?{verification:'consistent',sha256:fromDigest}:{verification:'mismatch',sha256:null};
 return{verification:fromDigest||fromSums?'incomplete':'missing',sha256:null};
}
async function fetchSums(url,installed,fetcher=fetch){
 if(typeof url!=='string'||!url.startsWith(DOWNLOAD)||!url.endsWith('/'+SUMS))throw Error('Unexpected checksum location.');
 const headers={Accept:'application/octet-stream','User-Agent':'Nightlink/'+installed};
 let response=await fetcher(url,{headers,redirect:'manual',signal:AbortSignal.timeout(10000)});
 if([301,302,303,307,308].includes(response.status)){
  const location=response.headers?.get?.('location');let next;try{next=new URL(location);}catch{throw Error('Checksum redirect is invalid.');}
  if(next.protocol!=='https:'||!ASSET_HOSTS.has(next.hostname))throw Error('Checksum redirect left GitHub release storage.');
  response=await fetcher(next.href,{headers,redirect:'error',signal:AbortSignal.timeout(10000)});
 }
 if(!response.ok)throw Error('Checksum file returned HTTP '+response.status+'.');
 return parseSums(await readCapped(response,SUMS_LIMIT,'Checksum file is too large.'));
}
function selectRelease(data,installed,mode='portable'){
 if(!installedVersion(installed)||!data||data.draft||data.prerelease||!/^v\d+\.\d+\.\d+$/.test(data.tag_name)||!version(data.tag_name)||data.html_url!==releaseURL(data.tag_name)||!Array.isArray(data.assets))throw Error('GitHub returned unsupported release information.');
 const v=data.tag_name.slice(1),names=mode==='installer'?['Nightlink-Setup-'+v+'.exe']:['Nightlink-Portable-'+v+'.exe','Nightlink.'+v+'.exe','Nightlink '+v+'.exe'];
 const asset=names.map(name=>findAsset(data,name)).find(Boolean),sums=findAsset(data,SUMS);
 const diff=compare(data.tag_name,installed);
 return{status:diff>0?'available':diff===0?'current':'ahead',installed,latest:v,url:data.html_url,download:asset?.browser_download_url||null,name:asset?.name||null,sumsUrl:sums?.browser_download_url||null,digest:/^sha256:[a-f0-9]{64}$/.test(asset?.digest)?asset.digest:null};
}
async function check(installed,mode,fetcher=fetch){
 try{
  const response=await fetcher(API,{headers:{Accept:'application/vnd.github+json','User-Agent':'Nightlink/'+installed},redirect:'error',signal:AbortSignal.timeout(10000)});
  if([401,403,404].includes(response.status))return{status:'unavailable',installed,message:'GitHub could not provide release information. This private repository may require access in your signed-in browser. Rate limits can also prevent checks.',url:RELEASES};
  if(!response.ok)throw Error('GitHub returned HTTP '+response.status+'.');
  const result=selectRelease(JSON.parse(await readCapped(response,1024*1024,'Release response was too large.')),installed,mode);
  if(result.status==='available'&&result.download){
   let sums=null,unavailable=false;
   if(result.sumsUrl){try{sums=await fetchSums(result.sumsUrl,installed,fetcher);}catch{unavailable=true;}}
   Object.assign(result,integrity(result.name,result.digest,sums));
   if(unavailable&&result.verification!=='mismatch')result.verification='unavailable';
  }
  return result;
 }catch(error){return{status:'error',installed,message:'Update check failed. Check your internet connection or open GitHub releases.',url:RELEASES};}
}
module.exports={RELEASES,API,SUMS,version,compare,selectRelease,parseSums,integrity,fetchSums,check};
