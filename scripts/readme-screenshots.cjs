/* README screenshots: the real interface in an isolated browser with fictional "DEMO" data only.
   No radio or network access (all non-local requests are aborted). Run: node scripts/readme-screenshots.cjs */
const {chromium}=require(process.env.NIGHTLINK_PLAYWRIGHT||'playwright'),fs=require('node:fs/promises'),path=require('node:path');
const ROOT=path.join(__dirname,'..'),OUT=path.join(ROOT,'docs','images','readme');
const seed=()=>{const now=Math.floor(Date.now()/1000),key=c=>c.repeat(64);
 radioSession.request=async()=>{throw Error('README screenshots never access a radio');};ble.command=async()=>{throw Error('no radio');};
 live.identity={key:key('a'),name:'BASE · DEMO',frequency:910.525,bandwidth:250,spreadingFactor:11,codingRate:5,txPower:22,model:'Companion · DEMO',version:'Demonstration',protocol:8};
 live.sync='ready';live.battery={millivolts:4012};live.stats={snr:9,rssi:-98,uptime:9000,noise:-112};
 const pub={kind:'channel',slot:0,id:'d'.repeat(24),name:'Public'},ops={kind:'channel',slot:1,id:'e'.repeat(24),name:'field-ops'},net={kind:'channel',slot:2,id:'f'.repeat(24),name:'evening-net'};
 live.channels=[pub,ops,net].map(({kind,...c})=>c);live.selected={...pub};
 live.contacts=[['b','Ridge RPT · DEMO',2,7.5,120],['c','Valley RPT · DEMO',2,-3,900],['1','Alex · DEMO',1,4,300],['2','Sam · DEMO',1,-9,5400],['3','Harbor Room · DEMO',3,null,86400],['4','Mesa RPT · DEMO',2,1,2400]].map(([k,name,type,snr,ago])=>({key:key(k),name,type,snr,lastAdvert:now-ago,pathLength:type===2?1:2,located:false}));
 const msg=(id,target,sender,text,ago,extra={})=>({id,kind:target.kind,target,conversation:conversationId(target),sender,text,timestamp:now-ago,status:'Received',pathLength:2,snr:8.5,observedRoute:{path:['bb'],direct:false,snr:7.5,rssi:-96},...extra});
 live.messages=[
  msg('m1',pub,'Alex · DEMO','Good evening mesh. Radio check from the north side.',3600,{pathLength:3,snr:6.25}),
  msg('m2',pub,'You','Copy Alex, solid copy here via Ridge.',3500,{own:true,status:'Broadcast accepted by radio',pathLength:0}),
  msg('m3',pub,'Sam · DEMO','Heard you both. 5 hops out here, signal is fair.',3000,{pathLength:5,snr:-2.5}),
  msg('m4',pub,'Harbor Room · DEMO','Evening net starts at 20:00 on #evening-net.',2400,{pathLength:1,snr:11}),
  msg('m5',pub,'Alex · DEMO','@[BASE · DEMO] are you joining the net tonight?',600,{pathLength:3,snr:6.75}),
  msg('m6',ops,'Sam · DEMO','Ridge repeater battery swapped. Back on air.',1800,{pathLength:2,snr:3}),
  msg('m7',ops,'Alex · DEMO','Thanks Sam. Valley is next on the list.',1500,{pathLength:3,snr:5}),
  msg('m8',net,'Harbor Room · DEMO','Net control is open. Check in with your call and location.',300,{pathLength:1,snr:10})];
 try{localStorage.setItem('nightlink.pins.'+key('a'),JSON.stringify({[conversationId(pub)]:['m4']}));}catch{}
 window.NightlinkHeardAdverts=new Map([[key('c'),{snr:-3,at:now-200}],[key('4'),{snr:1,at:now-700}]]);
 try{const b=document.querySelector('#update-available');if(b)b.hidden=true;}catch{}
 ble.state='connected';radioSession.identity=live.identity;radioSession.contacts=live.contacts;radioSession.channels=live.channels;radioSession.ready=true;
 try{ble.dispatchEvent(new CustomEvent('state',{detail:{state:'connected',name:'BASE · DEMO',transport:'bluetooth'}}));}catch{}
 try{radioSession.dispatchEvent(new CustomEvent('sync',{detail:{state:'ready'}}));}catch{}
 try{renderStats();}catch{}try{updateRadioState();}catch{}renderChannels();};
(async()=>{await fs.mkdir(OUT,{recursive:true});const browser=await chromium.launch({headless:true,...(process.env.NIGHTLINK_BROWSER?{executablePath:process.env.NIGHTLINK_BROWSER}:{})});
 const shots=[];try{
 for(const mode of ['terminal','cards']){
  const page=await browser.newPage({viewport:{width:1360,height:860},deviceScaleFactor:1});
  await page.addInitScript(m=>{try{localStorage.setItem('nightlink.interface',m);localStorage.setItem('nightlink.term-nicks','sender');localStorage.setItem('nightlink.firstRun','done');}catch{}},mode);
  await page.route('**/*',async r=>{const u=new URL(r.request().url());if(u.origin!=='http://127.0.0.1:4173')return r.abort();const f=u.pathname==='/'?'index.html':decodeURIComponent(u.pathname.slice(1));try{await r.fulfill({body:await fs.readFile(path.join(ROOT,f)),contentType:f.endsWith('.js')?'text/javascript':f.endsWith('.css')?'text/css':f.endsWith('.svg')?'image/svg+xml':f.endsWith('.png')?'image/png':'text/html'});}catch{await r.fulfill({status:404,body:''});}});
  await page.goto('http://127.0.0.1:4173');await page.waitForFunction(()=>window.NightlinkPalette&&window.NightlinkMRC);await page.evaluate(seed);
  const shot=async(name,fn)=>{await page.evaluate(fn);await page.waitForTimeout(400);await page.evaluate(()=>document.querySelector('#toast')?.classList.remove('visible'));await page.waitForTimeout(250);const file=path.join(OUT,mode+'-'+name+'.png');await page.screenshot({path:file});shots.push(path.relative(ROOT,file));};
  const close=()=>page.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));
  if(mode==='terminal')await shot('overview',()=>view('Overview'));
  await shot('chat',()=>{view('Messages');renderMessages();});
  await shot('nodes',()=>{view('Nodes');renderNodes(true);});
  if(mode==='terminal'){
   await shot('split',()=>{view('Messages');renderMessages();NightlinkMRC.split();});await page.evaluate(()=>NightlinkMRC.split());await page.evaluate(()=>NightlinkMRC.split());
   await page.evaluate(()=>{view('Messages');renderMessages();});await page.keyboard.press('Control+p');await page.keyboard.type('ev');await page.evaluate(()=>document.querySelector('#toast')?.classList.remove('visible'));await page.waitForTimeout(400);await page.screenshot({path:path.join(OUT,'terminal-palette.png')});shots.push('docs/images/readme/terminal-palette.png');await page.keyboard.press('Escape');
   await shot('setup-guide',()=>NightlinkFirstRun.open(1));await close();
   await shot('more-menu',()=>{view('Radio');document.querySelector('#term-more').click();});await page.keyboard.press('Escape');
  }else{
   await shot('report-bug',()=>NightlinkFeedback.open('bug'));await close();
  }
  await page.close();}
 }finally{await browser.close();}console.log(shots.join('\n'));})().catch(e=>{console.error(e);process.exit(1);});
