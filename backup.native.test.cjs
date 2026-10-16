// Packaged Windows regression check. Uses synthetic data and an isolated userData path.
const { _electron }=require('C:/Users/ryank/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs/promises'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict');
(async()=>{const asar=process.argv[2],runtime=process.argv[3];if(!asar||!runtime)throw Error('Usage: node backup.native.test.cjs <packaged app.asar> <matching electron.exe>');
const fixture=await fs.mkdtemp(path.join(os.tmpdir(),'nightlink-backup-native-'));
await fs.writeFile(path.join(fixture,'package.json'),JSON.stringify({name:'nightlink-backup-test',version:'0.0.0',main:'main.cjs'}));
await fs.writeFile(path.join(fixture,'main.cjs'),"const {app}=require('electron');const path=require('node:path');const asar="+JSON.stringify(path.resolve(asar))+";const setPath=app.setPath.bind(app);app.setPath=(name,value)=>setPath(name,name==='userData'?path.join(__dirname,'profile'):value);app.setAppPath(asar);require(path.join(asar,'desktop.cjs'));");
const radio='ab'.repeat(32),target={kind:'channel',slot:0,id:'01'.repeat(12),name:'test'},historyKey='meshline.history.'+radio;
const data={format:'nightlink-backup',version:1,createdAt:new Date().toISOString(),storage:{'meshline.profile':JSON.stringify({identity:{key:radio,name:'Test',frequency:906.875,txPower:22},contacts:[],channels:[{slot:0,id:target.id,name:'test'}]}),[historyKey]:JSON.stringify([{id:'native-restored',text:'Synthetic restore test',target,conversation:'channel:0:'+target.id,own:false,sender:'Peer',timestamp:1,status:'Received'}])},cards:[]};
const input=path.join(fixture,'restore.json');await fs.writeFile(input,JSON.stringify(data));
const app=await _electron.launch({executablePath:runtime,args:[fixture,'--meshline-test'],timeout:15000});
try{const page=await app.firstWindow();page.setDefaultTimeout(10000);await page.waitForFunction(()=>typeof previewBackupFile==='function');await page.locator('.settings').click();await page.locator('#backup-import').setInputFiles(input);
await Promise.all([page.waitForEvent('domcontentloaded'),page.locator('#backup-confirm-restore').click()]);
await page.waitForFunction(()=>typeof live!=='undefined'&&live.messages.length===1);
assert.equal(await page.evaluate(()=>live.messages[0].id),'native-restored');assert.equal(await page.evaluate(()=>ble.state),'disconnected');
await page.locator('.settings').click();const output=path.join(fixture,'export.json');
await app.evaluate(({dialog},filePath)=>{dialog.showSaveDialog=async()=>({canceled:false,filePath});},output);
await page.locator('#backup-export').click();await page.waitForFunction(()=>!backupBusy&&document.querySelector('#backup-last-export').textContent.startsWith('Last backup saved'));
const exported=JSON.parse(await fs.readFile(output,'utf8'));assert.equal(JSON.parse(exported.storage[historyKey])[0].id,'native-restored');
const timestamp=await page.evaluate(()=>maintenanceRead('last-export'));
await app.evaluate(({dialog})=>{dialog.showSaveDialog=async()=>({canceled:true});});await page.locator('#backup-export').click();await page.waitForFunction(()=>!backupBusy);assert.deepEqual(await page.evaluate(()=>maintenanceRead('last-export')),timestamp);
await page.reload();await page.waitForFunction(()=>typeof live!=='undefined'&&live.messages.length===1);
console.log('PASS: packaged native restore reload, saved history, native Save file and cancellation; isolated synthetic profile');
}finally{await app.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
