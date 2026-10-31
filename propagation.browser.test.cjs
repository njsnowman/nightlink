/* Rendered RF Propagation Monitor checks. Synthetic observations are injected only into this isolated test page;
   no radio commands are sent. Set PROPAGATION_SCREENSHOTS to a directory to save the documentation screenshots. */
const {chromium}=require(process.env.NIGHTLINK_PLAYWRIGHT||'playwright'),fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict');
const shots=process.env.PROPAGATION_SCREENSHOTS;
(async()=>{const browser=await chromium.launch({headless:true,...(process.env.NIGHTLINK_BROWSER?{executablePath:process.env.NIGHTLINK_BROWSER}:{})});try{
 const context=await browser.newContext({viewport:{width:1320,height:860}}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',async route=>{const u=new URL(route.request().url());if(u.origin!=='http://127.0.0.1:4173')return route.abort();const file=u.pathname==='/'?'index.html':u.pathname.slice(1);try{await route.fulfill({body:await fs.readFile(path.join(__dirname,file)),contentType:file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':file.endsWith('.svg')?'image/svg+xml':file.endsWith('.png')?'image/png':'text/html'});}catch{await route.fulfill({status:404,body:''});}});
 const shot=async(name,target)=>{if(!shots)return;await fs.mkdir(shots,{recursive:true});await page.waitForTimeout(150);await(target?page.locator(target):page).screenshot({path:path.join(shots,name+'.png'),animations:'disabled'});};
 const load=async()=>{await page.goto('http://127.0.0.1:4173');await page.waitForFunction(()=>typeof showPropagationMonitor==='function'&&window.NightlinkPropagationUI);await page.evaluate(async()=>{await cardsReady;window.radioWrites=[];ble.command=async b=>{radioWrites.push([...b]);throw Error('Synthetic transport: commands blocked');};radioSession.request=async b=>{radioWrites.push([...b]);throw Error('Synthetic transport: commands blocked');};});};
 const level=()=>page.evaluate(()=>{NightlinkPropagationUI.refresh();return document.querySelector('#propagation-indicator').dataset.level;});
 const connect=()=>page.evaluate(()=>{const self=new Uint8Array(90),info=new Uint8Array(82);self[0]=5;self[1]=1;self[2]=20;self[3]=22;self.fill(0xab,4,36);const v=new DataView(self.buffer);v.setInt32(36,40100000,true);v.setInt32(40,-105200000,true);v.setUint32(48,906875,true);v.setUint32(52,250000,true);self[56]=11;self[57]=8;self.set(new TextEncoder().encode('Field Radio · DEMO'),58);info[0]=13;info[1]=14;info[80]=1;
  const id=MeshlineProtocol.identity(self,info);radioSession.identity=id;live.identity=id;ble.state='connected';live.sync='ready';
  live.contacts=Array.from({length:4},(_,i)=>({key:(i+1).toString(16).padStart(2,'0').repeat(32),name:['Ridge','Hilltop','Valley','Harbor'][i]+' · DEMO',type:2}));radioSession.contacts=live.contacts;
  radioSession.dispatchEvent(new CustomEvent('identity',{detail:id}));});
 await load();
 assert.equal(await level(),'unavailable','no radio means monitoring unavailable');
 assert.match(await page.locator('#propagation-indicator').getAttribute('aria-label'),/Monitoring unavailable/);
 await connect();
 assert.equal(await level(),'insufficient-data','a new radio starts by learning a baseline');
 // Real input path: one 0x88 RX-log advert frame through the existing parser, and one decoded message event.
 const observed=await page.evaluate(()=>{const key=new Uint8Array(32).fill(0xee),payload=new Uint8Array(110);payload.set(key,0);const frame=new Uint8Array([0x88,4*7,256-96,(4<<2)|1,0,...payload]);ble.dispatchEvent(new CustomEvent('packet',{detail:frame}));
  radioSession.dispatchEvent(new CustomEvent('message',{detail:{kind:'channel',slot:1,pathLength:2,textType:0,timestamp:1700000000,snr:6,text:'test'}}));
  const s=NightlinkPropagationUI.monitor.summary(Date.now());return {rx:s.rxLogObserved,recent:s.recent.map(r=>[r.source,r.station,r.snr,r.rssi,r.relation])};});
 assert.equal(observed.rx,true);assert.deepEqual(observed.recent.find(r=>r[0]==='rxlog'),['rxlog','ee'.repeat(32),7,-96,'direct']);assert.ok(observed.recent.some(r=>r[0]==='message'&&r[2]===6&&r[3]===null),'missing RSSI stays unknown');
 // Synthetic 30-hour baseline from ten regular stations, then a normal window.
 await page.evaluate(()=>{const m=NightlinkPropagationUI.monitor,now=Date.now(),key=live.identity.key,start=now-30*3600000;m.disconnect(start-1);m.restore('{"version":1,"radios":{}}');m.connect(key,start);
  const stable=Array.from({length:10},(_,i)=>(0x10+i).toString(16).repeat(32));let n=0;
  for(let t=start;t<=now-60000;t+=600000)for(const s of stable)m.observe({source:'rxlog',at:t,snr:-5+((n++)%3),rssi:-110,station:s,stationKind:'key',type:4,typeName:'Advert',relation:'forwarded',hops:2,path:[],dedup:'base:'+s+':'+t});
  window.stableStations=stable;});
 assert.equal(await level(),'normal');
 assert.match(await page.locator('#propagation-indicator').getAttribute('aria-label'),/Normal/);
 await shot('01-header-normal','header');
 // Unusual window: six never-seen stations and stronger SNR from regular stations.
 await page.evaluate(()=>{const m=NightlinkPropagationUI.monitor,now=Date.now();let n=0;
  for(let i=0;i<6;i++)m.observe({source:'rxlog',at:now-300000+i*1000,snr:4,rssi:-98,station:(0x30+i).toString(16).repeat(32),stationKind:'key',type:4,typeName:'Advert',relation:'forwarded',hops:3,path:[],dedup:'new:'+i});
  for(const s of stableStations)for(let k=0;k<12;k++)m.observe({source:'rxlog',at:now-240000+k*1000,snr:11,rssi:-92,station:s,stationKind:'key',type:4,typeName:'Advert',relation:'forwarded',hops:2,path:[],dedup:'boost:'+s+':'+k+':'+(n++)});});
 assert.equal(await level(),'possible-opening');
 assert.equal(await page.locator('#propagation-indicator .header-control-label').textContent(),'Possible RF Opening');
 assert.equal(await page.locator('#propagation-indicator').evaluate(b=>b.classList.contains('propagation-animate')),true);
 assert.match(await page.locator('.propagation-live').textContent(),/not a confirmed propagation event/);
 await shot('02-header-possible-opening','header');
 await page.locator('#propagation-indicator').click();await page.locator('#propagation-panel .propagation-status h3').waitFor();
 assert.equal(await page.locator('#propagation-panel .propagation-status h3').textContent(),'Possible RF opening');
 assert.match(await page.locator('#propagation-panel').textContent(),/do not confirm an atmospheric propagation event/);
 assert.ok(await page.locator('#propagation-panel .propagation-table tbody tr').count()>0);
 assert.ok(await page.locator('#propagation-panel .propagation-history li').count()>=1);
 assert.equal(await page.locator('#propagation-panel .propagation-evidence dd').filter({hasText:'dB'}).count(),1,'SNR change is shown when comparable');
 await page.setViewportSize({width:1320,height:1400});await shot('04-panel-possible-opening','#dialog');await page.setViewportSize({width:1320,height:860});
 // Two-step baseline reset confirmation is offered but not executed here.
 await page.locator('#propagation-reset-baseline').click();assert.equal(await page.locator('#propagation-reset-baseline').textContent(),'Confirm baseline reset');await page.locator('#propagation-panel button',{hasText:'Cancel'}).click();
 await page.evaluate(()=>document.querySelector('#dialog').close());
 // Settings persist; high sensitivity raises the same evidence to a strong anomaly.
 await page.evaluate(()=>{view('Settings');window.NightlinkSettings?.open?.('Notifications');});await page.locator('.propagation-settings').waitFor();
 assert.equal(await page.locator('.propagation-settings').evaluate(n=>!n.closest('[hidden]')&&n.getBoundingClientRect().height>0),true,'settings section visible in Notifications');
 assert.deepEqual(await page.evaluate(()=>[...document.querySelectorAll('.propagation-settings input[type=checkbox]')].map(i=>[i.id,i.checked])),[['propagation-enabled',true],['propagation-indicator-setting',true],['propagation-animations',true],['propagation-sound',false],['propagation-notify',false]],'nonintrusive defaults');
 assert.equal(await page.locator('#propagation-sensitivity').inputValue(),'medium');assert.equal(await page.locator('#propagation-baseline').inputValue(),'30');
 await page.locator('#propagation-sensitivity').selectOption('high');
 await page.setViewportSize({width:1320,height:1300});await page.evaluate(()=>{document.querySelector('#toast')?.classList.remove('visible');document.querySelector('.propagation-settings').scrollIntoView({block:'start'});});await shot('06-settings','.propagation-settings');await page.setViewportSize({width:1320,height:860});
 for(let i=0;i<3;i++)await level();
 assert.equal(await level(),'strong-anomaly');
 assert.equal(await page.locator('#propagation-indicator .header-control-label').textContent(),'Strong RF Anomaly');
 assert.equal(await page.locator('#propagation-indicator').evaluate(b=>b.classList.contains('propagation-flash')),true);
 await shot('03-header-strong-anomaly','header');
 await page.evaluate(()=>showPropagationMonitor());await page.locator('#propagation-panel .propagation-status h3').waitFor();
 assert.equal(await page.locator('#propagation-panel .propagation-status h3').textContent(),'Strong RF anomaly');
 await page.setViewportSize({width:1320,height:1400});await shot('05-panel-strong-anomaly','#dialog');await page.setViewportSize({width:1320,height:860});
 // Reduced motion removes alert animation.
 await page.evaluate(()=>document.body.classList.add('reduced-motion'));
 assert.equal(await page.locator('#propagation-indicator').evaluate(b=>getComputedStyle(b).animationName),'none');
 await page.evaluate(()=>document.body.classList.remove('reduced-motion'));await page.emulateMedia({reducedMotion:'reduce'});
 assert.equal(await page.locator('#propagation-indicator svg').evaluate(s=>getComputedStyle(s).animationName),'none');await page.emulateMedia({reducedMotion:'no-preference'});
 // Compact width keeps the panel inside the viewport.
 await page.setViewportSize({width:760,height:560});await page.waitForTimeout(100);
 assert.equal(await page.evaluate(()=>{const d=document.querySelector('#dialog');return d.scrollWidth<=d.clientWidth+1&&document.documentElement.scrollWidth<=innerWidth+1;}),true,'no horizontal overflow at 760x560');
 assert.equal(await page.locator('#propagation-indicator').isVisible(),true);
 await shot('07-compact');
 await page.evaluate(()=>document.querySelector('#dialog').close());await page.setViewportSize({width:1320,height:860});
 // Restart: settings and alert history persist; an alert window is not reported as active after restart.
 await page.evaluate(()=>window.dispatchEvent(new Event('beforeunload')));await page.waitForTimeout(300);
 await load();await connect();
 assert.equal(await page.evaluate(()=>NightlinkPropagationUI.prefs.sensitivity),'high');
 const history=await page.evaluate(()=>NightlinkPropagationUI.monitor.summary(Date.now()).events.map(e=>[e.peakLevel,e.active,e.stale]));
 assert.ok(history.length>=1&&history.every(e=>e[1]===false),'restored events are historical, not active: '+JSON.stringify(history));
 assert.notEqual(await level(),'strong-anomaly','no active alert from restored history alone');
 // Disconnect never leaves an active alert; disabling hides the indicator.
 await page.evaluate(()=>{ble.state='disconnected';radioSession.dispatchEvent(new Event('disconnected'));});assert.equal(await level(),'unavailable');
 await page.evaluate(()=>{view('Settings');window.NightlinkSettings?.open?.('Notifications');});await page.locator('#propagation-enabled').uncheck();assert.equal(await page.locator('#propagation-indicator').isHidden(),true);
 assert.deepEqual(await page.evaluate(()=>radioWrites),[],'the monitor never sends radio commands');
 assert.deepEqual(errors,[]);
 console.log('PASS propagation monitor: unavailable, learning, normal, possible opening, strong anomaly, real 0x88/message input, panel evidence, reset confirmation, settings persistence, reduced motion, compact width, restart history, disconnect and disable; no radio commands. Synthetic observations only.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1);});
