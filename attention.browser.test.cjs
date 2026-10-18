
const {chromium}=require('C:/Users/ryank/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
 try{
 const page=await browser.newPage({viewport:{width:1500,height:1000}}),errors=[];page.setDefaultTimeout(6000);
 page.on('pageerror',e=>{errors.push(e.stack);console.log(e.stack);});
 await page.route('**/*',async route=>{const u=new URL(route.request().url());if(u.origin!=='http://127.0.0.1:4173')return route.abort();const file=u.pathname==='/'?'index.html':decodeURIComponent(u.pathname.slice(1));try{await route.fulfill({body:await require('node:fs/promises').readFile(require('node:path').join(__dirname,file)),contentType:file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/html'});}catch{await route.fulfill({status:404,body:''});}});
 const channelPicker=page.getByRole('combobox',{name:'Choose channel',exact:true});
 async function chooseChannel(slot){await page.locator('nav > [data-view="Messages"]').click();await channelPicker.selectOption(String(slot));}
 await page.addInitScript(()=>{
  if(location.origin!=='http://127.0.0.1:4173')return;
  window.soundEvents=0;HTMLMediaElement.prototype.play=function(){if(!this.muted)window.soundEvents++;return Promise.resolve();};
  window.notices=[];window.Notification=class{static permission='granted';static requestPermission=async()=>'granted';constructor(title,options){this.title=title;this.options=options;window.notices.push(this);}close(){}};
  if(!localStorage.getItem('meshline.profile'))localStorage.setItem('meshline.profile',JSON.stringify({identity:{key:'cd'.repeat(32),name:'Snow Man',model:'Test radio',frequency:906.875,txPower:22,version:'test'},contacts:[{key:'ab'.repeat(32),name:'Jordan',type:1,pathLength:255}],channels:[{slot:0,id:'01'.repeat(12),name:'general'},{slot:1,id:'02'.repeat(12),name:'field-ops'}]}));
 });
 await page.goto('http://127.0.0.1:4173');await page.bringToFront();
 await page.evaluate(()=>{live.sync='ready';view('Nodes');window.injectChannel=(slot,text,timestamp)=>radioSession.dispatchEvent(new CustomEvent('message',{detail:{kind:'channel',slot,text:'Jordan: '+text,timestamp,pathLength:0,textType:0}}));});
 await page.evaluate(()=>{injectChannel(0,'Background one',1);injectChannel(0,'Background two',2);});
 assert.equal(await page.locator('[data-live-channel="0"] .unread-badge').textContent(),'2');
 await page.reload();
 assert.equal(await page.locator('[data-live-channel="0"] .unread-badge').textContent(),'2');
 await chooseChannel(0);
 await page.waitForFunction(()=>attention.unread(live.messages,conversationId(live.selected)).length===0);
 await page.locator('#mute-channel').click();assert.equal(await page.locator('#mute-channel').getAttribute('aria-pressed'),'true');
 await page.locator('nav [data-view="Nodes"]').click();
 const sounds=await page.evaluate(()=>window.soundEvents);
 await page.evaluate(()=>{live.sync='ready';radioSession.dispatchEvent(new CustomEvent('message',{detail:{kind:'channel',slot:0,text:'Jordan: hi @[Snow Man]',timestamp:3,pathLength:0}}));});
 assert.equal(await page.locator('[data-live-channel="0"] .unread-badge').textContent(),'1');
 assert.equal(await page.locator('.conversation-alert').count(),0);assert.equal(await page.evaluate(()=>window.soundEvents),sounds);
 await page.reload();await chooseChannel(0);
 assert.equal(await page.locator('#mute-channel').getAttribute('aria-pressed'),'true');await page.locator('#mute-channel').click();
 await page.locator('.settings').click();await page.locator('#mention-alert-sound').uncheck();assert.equal(await page.locator('#dm-alert-sound').isChecked(),true);
 await page.reload();await page.locator('.settings').click();assert.equal(await page.locator('#mention-alert-sound').isChecked(),false);
 await page.locator('#mention-alert-sound').check();await page.locator('nav [data-view="Nodes"]').click();
 await page.evaluate(()=>{live.sync='ready';radioSession.dispatchEvent(new CustomEvent('message',{detail:{kind:'channel',slot:1,text:'Jordan: hey @[Snow Man]',timestamp:4,pathLength:0}}));});
 await page.locator('.conversation-alert').click();assert.equal(await page.evaluate(()=>live.selected.slot),1);
 assert.ok(await page.evaluate(()=>window.soundEvents)>0);
 // Desktop notification action navigates to the matching channel.
 await page.evaluate(()=>{localStorage.setItem('notifications','true');window.realHasFocus=document.hasFocus.bind(document);document.hasFocus=()=>false;view('Nodes');radioSession.dispatchEvent(new CustomEvent('message',{detail:{kind:'channel',slot:0,text:'Jordan: notification @[Snow Man]',timestamp:5,pathLength:0}}));});
 assert.equal(await page.evaluate(()=>window.notices.length),1);await page.evaluate(()=>{window.notices[0].onclick();document.hasFocus=window.realHasFocus;});assert.equal(await page.evaluate(()=>live.selected.slot),0);await chooseChannel(1);
 // Main channel views follow latest through arrivals and reload.
 await page.evaluate(()=>{for(let i=0;i<45;i++){const target={kind:'channel',...live.channels[1]};live.messages.push({id:'long-'+i,conversation:conversationId(target),target,kind:'channel',sender:'Jordan',text:'Reading test '+i,timestamp:10+i,own:false,status:'Received'});}renderMessages();});
 await page.waitForTimeout(100);if(await page.locator('#jump-newest').isVisible())await page.locator('#jump-newest').click();
 await page.evaluate(()=>{const log=document.querySelector('#chat-log');log.scrollTop=100;log.dispatchEvent(new Event('scroll'));});
 const before=await page.evaluate(()=>attention.position(conversationId(live.selected)));
 await page.evaluate(()=>radioSession.dispatchEvent(new CustomEvent('message',{detail:{kind:'channel',slot:1,text:'Jordan: New while reading',timestamp:90,pathLength:0}})));
 await page.waitForTimeout(100);
 assert.equal(await page.evaluate(()=>attention.position(conversationId(live.selected)).bottom),true);
 assert.equal(await page.locator('#jump-newest').isVisible(),false);
 await page.evaluate(()=>saveHistory());await page.reload();await chooseChannel(1);
 await page.waitForTimeout(100);assert.equal(await page.evaluate(()=>attention.position(conversationId(live.selected)).bottom),true);
 await page.waitForFunction(()=>attention.unread(live.messages,conversationId(live.selected)).length===0);
 // Recovered messages count as unread without sound or popup storms.
 await page.locator('nav [data-view="Nodes"]').click();const beforeCatchup=await page.evaluate(()=>window.soundEvents);
 await page.evaluate(()=>{live.sync='syncing';radioSession.dispatchEvent(new CustomEvent('message',{detail:{kind:'direct',prefix:'abababababab',text:'Recovered DM',timestamp:100,textType:0}}));});
 assert.equal(await page.locator('nav > [data-view="Messages"] .unread-badge').textContent(),'1');
 assert.equal(await page.locator('.dm-floating').count(),0);assert.equal(await page.evaluate(()=>window.soundEvents),beforeCatchup);
 await page.evaluate(()=>{live.sync='ready';radioSession.dispatchEvent(new CustomEvent('message',{detail:{kind:'direct',prefix:'abababababab',text:'Live DM',timestamp:101,textType:0}}));});
 await page.locator('.dm-floating').waitFor();assert.equal(await page.locator('nav > [data-view="Messages"] .unread-badge').textContent(),'2');
 await page.locator('.dm-floating input').click();await page.waitForFunction(()=>attention.unread(live.messages,'direct:'+'ab'.repeat(32)).length===0);
 await page.locator('.dm-floating .dm-close').click();
 await page.locator('nav > [data-view="Messages"]').click();await page.locator('.conversation-tools').getByRole('button',{name:'Direct messages',exact:true}).click();
 await page.screenshot({path:'C:/Users/ryank/.cache/nightlink-attention-inbox.png'});
 await page.locator('.settings').click();await page.screenshot({path:'C:/Users/ryank/.cache/nightlink-attention-settings.png'});
 assert.equal(errors.length,0,errors.join('\n'));
 console.log('PASS: unread persistence, latest-message following, mute persistence, independent sounds, mention navigation, silent catchup and focused DM reading');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
