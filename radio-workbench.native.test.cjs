/* Isolated Electron acceptance. All radio responses below are synthetic. */
const {_electron}=require('C:/Users/ryank/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs/promises'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict');
(async()=>{
 if(!process.argv[2])throw Error('Usage: node radio-workbench.native.test.cjs <app.asar-or-source-directory> [electron.exe]');
 const source=path.resolve(process.argv[2]),runtime=process.argv[3]||'C:/Users/ryank/.cache/nightlink-diagnostic-runtime-42.11.12/electron.exe';
 const fixture=await fs.mkdtemp(path.join(os.tmpdir(),'nightlink-radio-workbench-'));
 await fs.writeFile(path.join(fixture,'package.json'),JSON.stringify({name:'nightlink-radio-workbench-validation',version:'0.0.0',main:'main.cjs'}));
 await fs.writeFile(path.join(fixture,'main.cjs'),"const {app,ipcMain,session}=require('electron'),path=require('node:path'),source="+JSON.stringify(source)+";const set=app.setPath.bind(app);app.setPath=(name,value)=>set(name,name==='userData'?path.join(__dirname,'profile'):value);const handle=ipcMain.handle.bind(ipcMain);ipcMain.handle=(name,fn)=>handle(name,name==='startup:info'?()=>({enabled:false,last:null}):fn);app.whenReady().then(()=>session.defaultSession.webRequest.onBeforeRequest({urls:['http://*/*','https://*/*']},(_details,callback)=>callback({cancel:true})));app.setAppPath(source);require(path.join(source,'desktop.cjs'));");
 const app=await _electron.launch({executablePath:runtime,args:[fixture,'--meshline-test'],timeout:20000});
 try{
  const page=await app.firstWindow(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.waitForFunction(()=>document.readyState==='complete'&&typeof NightlinkWorkbench!=='undefined'&&typeof showNodeDiscovery==='function'&&typeof showRadioTerminal==='function');
  assert.equal(path.resolve(await app.evaluate(({app})=>app.getPath('userData'))),path.join(fixture,'profile'));
  await page.evaluate(()=>{window.workbenchNativeWrites=[];radioSession.request=async frame=>{workbenchNativeWrites.push({kind:'unexpected-request',frame:[...frame]});throw Error('Physical radio access is disabled for this fixture.');};ble.command=async frame=>{workbenchNativeWrites.push({kind:'unexpected-transport',frame:[...frame]});throw Error('Physical radio access is disabled for this fixture.');};view('Radio');});
  const tab=name=>page.locator('.radio-workbench-tabs').getByRole('button',{name,exact:true});
  for(const name of ['Trace Path','Line of Sight','RX Log','Noise Floor','Discover Nodes','CLI']){await tab(name).click();assert.equal(await tab(name).getAttribute('aria-pressed'),'true');}
  assert.deepEqual(await page.evaluate(()=>workbenchNativeWrites),[]);
  await page.evaluate(()=>{const identity={key:'aa'.repeat(32),name:'Synthetic companion',protocol:14,model:'Synthetic fixture',version:'test',frequency:915,txPower:0,located:false};live.identity=identity;radioSession.identity=identity;live.sync='ready';radioSession.ready=true;ble.state='connected';radioSession.radioTool=async work=>work(async(frame,type)=>{workbenchNativeWrites.push({kind:'synthetic-noise',frame:[...frame],type});const reply=new Uint8Array(14);reply[0]=24;reply[1]=1;new DataView(reply.buffer).setInt16(2,-113,true);return reply;},()=>{});});
  await tab('Noise Floor').click();await page.getByRole('button',{name:'Read noise floor',exact:true}).click();
  await page.waitForFunction(()=>document.querySelector('#radio-workbench-body .workbench-result')?.textContent.includes('-113 dBm'));
  assert.deepEqual(await page.evaluate(()=>workbenchNativeWrites),[{kind:'synthetic-noise',frame:[56,1],type:24}]);
  await tab('Discover Nodes').click();await page.getByRole('button',{name:'Open node discovery',exact:true}).click();
  assert.equal(await page.locator('#dialog').evaluate(e=>e.open),true);assert.equal(await page.locator('#node-discovery').count(),1);await page.keyboard.press('Escape');
  await tab('CLI').click();await page.getByRole('button',{name:'Open CLI terminal',exact:true}).click();
  assert.equal(await page.locator('#dialog').evaluate(e=>e.open),true);assert.equal(await page.locator('#cli-command').count(),1);assert.match(await page.locator('#cli-output').innerText(),/\/info/);await page.keyboard.press('Escape');
  assert.deepEqual(await page.evaluate(()=>workbenchNativeWrites),[{kind:'synthetic-noise',frame:[56,1],type:24}]);
  await page.evaluate(()=>{live.sync='offline';radioSession.ready=false;ble.state='disconnected';});
  assert.deepEqual(errors,[]);
  console.log('PASS: exact Electron payload, isolated fresh profile, six Radio tools, no automatic radio commands, synthetic signed noise read [56,1], discovery and CLI opening without transmission. No physical-radio evidence.');
 }finally{await app.close();}
})().catch(error=>{console.error(error.message);process.exitCode=1;});
