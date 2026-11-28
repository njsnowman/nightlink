/* Nodes SNR history: readings recorded per node across renders, sparkline beside LAST SNR with a 24 h summary tooltip,
   persisted per radio, in Terminal and Cards. Synthetic advert readings only; no radio commands. */
const {chromium}=require(process.env.NIGHTLINK_PLAYWRIGHT||'playwright'),fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict');
const serve=async r=>{const u=new URL(r.request().url());if(u.origin!=='http://127.0.0.1:4173')return r.abort();const f=u.pathname==='/'?'index.html':u.pathname.slice(1);try{await r.fulfill({body:await fs.readFile(path.join(__dirname,f)),contentType:f.endsWith('.js')?'text/javascript':f.endsWith('.css')?'text/css':'text/html'});}catch{await r.fulfill({status:404,body:''});}};
(async()=>{const browser=await chromium.launch({headless:true,...(process.env.NIGHTLINK_BROWSER?{executablePath:process.env.NIGHTLINK_BROWSER}:{})});try{
 for(const iface of ['terminal','cards']){const page=await browser.newPage({viewport:{width:1320,height:860}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(i=>{try{if(!sessionStorage.getItem('seeded')){localStorage.setItem('nightlink.interface',i);sessionStorage.setItem('seeded','1');}}catch{}},iface);await page.route('**/*',serve);await page.goto('http://127.0.0.1:4173');await page.waitForFunction(()=>window.NightlinkNodeHistory);
  const setup=()=>page.evaluate(()=>{live.identity={key:'cd'.repeat(32),name:'DEMO HQ',frequency:910.525,txPower:22};live.sync='ready';live.contacts=[{key:'ab'.repeat(32),name:'DEMO Ridge',type:2,lastAdvert:Math.floor(Date.now()/1000)},{key:'ac'.repeat(32),name:'DEMO Quiet',type:1}];live.messages=[];view('Nodes');});
  await setup();const now=Math.floor(Date.now()/1000);
  for(const [i,snr] of [[5,-12],[4,-4],[3,2],[2,6.5],[1,3]].entries?[[5,-12],[4,-4],[3,2],[2,6.5],[1,3]].entries():[])await page.evaluate(([at,snr])=>{(window.NightlinkHeardAdverts||=new Map()).set('ab'.repeat(32),{snr,at});renderNodes(true);},[now-snr[0]*600,snr[1]]);
  const row=page.locator('#node-table tr',{hasText:'DEMO Ridge'});await row.locator('svg.node-spark').waitFor();
  assert.equal(await row.locator('svg.node-spark rect').count(),5);assert.equal(await row.locator('svg.node-spark rect.weak').count(),1,'reading below -10 dB marked weak');
  assert.match(await row.locator('td.signal').getAttribute('title'),/Last 24 h: 5 readings, low -12 dB, average -0\.9 dB, high 6\.5 dB/);
  assert.equal(await page.locator('#node-table tr',{hasText:'DEMO Quiet'}).locator('svg.node-spark').count(),0,'no sparkline without readings');
  assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('nightlink.snr-history.'+'cd'.repeat(8)))['ab'.repeat(8)].length),5,'stored per radio');
  await page.reload();await page.waitForFunction(()=>window.NightlinkNodeHistory);await setup();await page.evaluate(()=>renderNodes(true));
  assert.equal(await page.locator('#node-table tr',{hasText:'DEMO Ridge'}).locator('svg.node-spark rect').count(),5,'history survives restart');
  if(process.env.NIGHTLINK_SCREENSHOTS)await page.screenshot({path:path.join(process.env.NIGHTLINK_SCREENSHOTS,'Nodes-SNR-history-'+iface+'.png')});
  assert.deepEqual(errors,[]);await page.close();}
 console.log('PASS Nodes SNR history: per-node readings, sparkline with weak marking and 24 h summary, no sparkline without data, per-radio persistence across restart, Terminal and Cards. Synthetic only.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
