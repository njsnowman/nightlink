
const test=require('node:test'),assert=require('node:assert/strict'),U=require('./updates.cjs');
const tag='v0.8.9',base={tag_name:tag,html_url:'https://github.com/njsnowman/nightlink/releases/tag/'+tag,draft:false,prerelease:false,assets:[]};
const asset=name=>({name,state:'uploaded',size:100,browser_download_url:'https://github.com/njsnowman/nightlink/releases/download/'+tag+'/'+encodeURIComponent(name)});
test('numeric stable version comparison and invalid versions',()=>{assert.equal(U.compare('0.8.10','0.8.9'),1);assert.equal(U.compare('v0.8.8','0.8.8'),0);assert.equal(U.version('0.8.9-rc1'),null);assert.throws(()=>U.compare('oops','0.8.8'));});
test('choose the matching installer or portable asset from the same release',()=>{const r={...base,assets:[asset('Nightlink-Setup-0.8.9.exe'),asset('Nightlink-Portable-0.8.9.exe')]};assert.ok(U.selectRelease(r,'0.8.8','installer').download.includes('-Setup-'));assert.ok(U.selectRelease(r,'0.8.8','portable').download.includes('-Portable-'));assert.equal(U.selectRelease(r,'0.8.9').status,'current');assert.equal(U.selectRelease(r,'0.9.0').status,'ahead');});
test('foreign URLs, drafts and malformed releases are rejected',()=>{assert.throws(()=>U.selectRelease({...base,html_url:'https://example.com'},'0.8.8'));assert.throws(()=>U.selectRelease({...base,prerelease:true},'0.8.8'));const bad=asset('Nightlink-Setup-0.8.9.exe');bad.browser_download_url='https://example.com/malware.exe';assert.equal(U.selectRelease({...base,assets:[bad]},'0.8.8','installer').download,null);});
test('missing appropriate asset uses release page rather than another build type',()=>{const r=U.selectRelease({...base,assets:[asset('Nightlink-Portable-0.8.9.exe')]},'0.8.8','installer');assert.equal(r.status,'available');assert.equal(r.download,null);assert.equal(r.url,base.html_url);});
test('private repository and rate limits never report up to date',async()=>{for(const status of [401,403,404])assert.equal((await U.check('0.8.8','portable',async()=>({status,ok:false}))).status,'unavailable');});
test('offline errors and malformed bodies fail without executable URLs',async()=>{assert.equal((await U.check('0.8.8','portable',async()=>{throw Error('offline');})).status,'error');const result=await U.check('0.8.8','portable',async()=>({status:200,ok:true,text:async()=>'{'}));assert.equal(result.status,'error');assert.equal(result.download,undefined);});
test('fetch is restricted to fixed API, bounded timeout, no credentials and no redirects',async()=>{const result=await U.check('0.8.8','portable',async(url,options)=>{assert.equal(url,U.API);assert.equal(options.redirect,'error');assert.equal(options.headers.Authorization,undefined);assert.ok(options.signal);return{status:200,ok:true,text:async()=>JSON.stringify({...base,assets:[asset('Nightlink-Portable-0.8.9.exe')]})};});assert.equal(result.status,'available');});

test('installed candidates compare against approved stable releases without accepting prerelease feeds',()=>{
 assert.equal(U.compare('0.8.22','0.8.22-rc.32'),1);
 assert.equal(U.compare('0.8.22-rc.32','0.8.19'),1);
 assert.equal(U.compare('0.8.22-rc.10','0.8.22-rc.9'),1);
 assert.equal(U.compare('0.8.22-rc.32+build.1','0.8.22-rc.32'),0);
 assert.equal(U.compare('0.8.22-alpha','0.8.22-alpha.1'),-1);
 assert.equal(U.compare('0.8.22-1','0.8.22-alpha'),-1);
 for(const bad of ['0.8.22-rc.01','0.8.22-','0.8.22+','0.8.22/evil'])assert.throws(()=>U.compare(bad,'0.8.22'));
 assert.equal(U.selectRelease(base,'0.8.22-rc.32','installer').status,'ahead');
 const next={...base,tag_name:'v0.8.22',html_url:'https://github.com/njsnowman/nightlink/releases/tag/v0.8.22'};
 assert.equal(U.selectRelease(next,'0.8.22-rc.32','installer').status,'available');
 assert.throws(()=>U.selectRelease({...next,tag_name:'v0.8.22-rc.33'},'0.8.22-rc.32'));
});

const H='a'.repeat(64),H2='b'.repeat(64),SUMS_URL='https://github.com/njsnowman/nightlink/releases/download/v0.8.9/SHA256SUMS.txt';
test('SHA256SUMS parsing accepts the published format and rejects malformed, duplicate, path and oversized input',()=>{
 const sums=U.parseSums(H+'  Nightlink-Setup-0.8.9.exe\n'+H2.toUpperCase()+' *Nightlink-Portable-0.8.9.exe\r\n\n');
 assert.equal(sums.get('Nightlink-Setup-0.8.9.exe'),H);assert.equal(sums.get('Nightlink-Portable-0.8.9.exe'),H2);
 for(const bad of ['zz  Nightlink-Setup-0.8.9.exe',H+'Nightlink.exe',H+'  ../evil.exe',H+'  dir\\evil.exe',H+'  a.exe\n'+H2+'  a.exe','','\n\n','x'.repeat(17000)])assert.throws(()=>U.parseSums(bad),bad.slice(0,20));
});
test('integrity requires the asset digest and SHA256SUMS to agree',()=>{
 const sums=new Map([['Nightlink-Setup-0.8.9.exe',H]]);
 assert.deepEqual(U.integrity('Nightlink-Setup-0.8.9.exe','sha256:'+H,sums),{verification:'consistent',sha256:H});
 assert.deepEqual(U.integrity('Nightlink-Setup-0.8.9.exe','sha256:'+H2,sums),{verification:'mismatch',sha256:null});
 assert.equal(U.integrity('Nightlink-Setup-0.8.9.exe',null,sums).verification,'incomplete');
 assert.equal(U.integrity('Nightlink-Setup-0.8.9.exe','sha256:'+H,null).verification,'incomplete');
 assert.equal(U.integrity('Nightlink-Setup-0.8.9.exe',null,null).verification,'missing');
 assert.equal(U.integrity('Nightlink-Setup-0.8.9.exe','md5:'+H,sums).verification,'incomplete');
});
const body=text=>({status:200,ok:true,headers:{get:()=>null},text:async()=>text});
test('checksum download follows only GitHub release storage redirects with bounded size',async()=>{
 const calls=[];const sums=await U.fetchSums(SUMS_URL,'0.8.8',async(url,options)=>{calls.push([url,options.redirect]);if(url===SUMS_URL)return{status:302,ok:false,headers:{get:k=>k==='location'?'https://release-assets.githubusercontent.com/x/SHA256SUMS.txt':null}};return body(H+'  Nightlink-Setup-0.8.9.exe\n');});
 assert.equal(sums.get('Nightlink-Setup-0.8.9.exe'),H);assert.deepEqual(calls.map(c=>c[1]),['manual','error']);
 await assert.rejects(U.fetchSums(SUMS_URL,'0.8.8',async()=>({status:302,ok:false,headers:{get:()=>'https://example.com/SHA256SUMS.txt'}})),/left GitHub/);
 await assert.rejects(U.fetchSums(SUMS_URL,'0.8.8',async()=>({status:302,ok:false,headers:{get:()=>'http://objects.githubusercontent.com/x'}})),/left GitHub/);
 await assert.rejects(U.fetchSums('https://example.com/SHA256SUMS.txt','0.8.8',async()=>body('')),/Unexpected/);
 await assert.rejects(U.fetchSums(SUMS_URL,'0.8.8',async()=>body('x'.repeat(17000))),/too large/);
 await assert.rejects(U.fetchSums(SUMS_URL,'0.8.8',async()=>({status:404,ok:false,headers:{get:()=>null}})),/HTTP 404/);
});
test('update check reports consistent, mismatched, incomplete and unavailable checksums',async()=>{
 const release=(digest,withSums=true)=>({...base,assets:[{...asset('Nightlink-Setup-0.8.9.exe'),digest},...(withSums?[asset('SHA256SUMS.txt')]:[])]});
 const run=(data,sumsText,sumsStatus=200)=>U.check('0.8.8','installer',async url=>url===U.API?body(JSON.stringify(data)):sumsStatus===200?body(sumsText):{status:sumsStatus,ok:false,headers:{get:()=>null}});
 const ok=await run(release('sha256:'+H),H+'  Nightlink-Setup-0.8.9.exe\n');assert.equal(ok.verification,'consistent');assert.equal(ok.sha256,H);assert.equal(ok.name,'Nightlink-Setup-0.8.9.exe');
 assert.equal((await run(release('sha256:'+H2),H+'  Nightlink-Setup-0.8.9.exe\n')).verification,'mismatch');
 assert.equal((await run(release('sha256:'+H,false),'')).verification,'incomplete');
 assert.equal((await run(release(undefined,false),'')).verification,'missing');
 const down=await run(release('sha256:'+H),'',500);assert.equal(down.verification,'unavailable');assert.equal(down.sha256,null);
 assert.equal((await run(release('sha256:'+H),'garbage')).verification,'unavailable');
 const current=await U.check('0.8.9','installer',async url=>{assert.equal(url,U.API);return body(JSON.stringify(release('sha256:'+H)));});assert.equal(current.status,'current');assert.equal(current.verification,undefined);
});
