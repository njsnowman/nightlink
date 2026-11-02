/* Terminal display scheme: selection, token application, contrast, persistence. Synthetic pages only; no radio activity. */
const {chromium}=require('./test-cards-interface.cjs')(require(process.env.NIGHTLINK_PLAYWRIGHT||'playwright')),fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict');
const shots=process.env.NIGHTLINK_SCREENSHOTS;
function contrast(a,b){const lum=c=>{const v=c.match(/[\d.]+/g).slice(0,3).map(Number).map(x=>{x/=255;return x<=.03928?x/12.92:((x+.055)/1.055)**2.4;});return .2126*v[0]+.7152*v[1]+.0722*v[2];};const [x,y]=[lum(a),lum(b)].sort((p,q)=>q-p);return (x+.05)/(y+.05);}
(async()=>{const browser=await chromium.launch({headless:true,...(process.env.NIGHTLINK_BROWSER?{executablePath:process.env.NIGHTLINK_BROWSER}:{})});try{
 const context=await browser.newContext({viewport:{width:1320,height:860}}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await context.route('**/*',async route=>{const u=new URL(route.request().url());if(u.origin!=='http://127.0.0.1:4173')return route.abort();const file=u.pathname==='/'?'index.html':u.pathname.slice(1);try{await route.fulfill({body:await fs.readFile(path.join(__dirname,file)),contentType:file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/html'});}catch{await route.fulfill({status:404,body:''});}});
 await page.goto('http://127.0.0.1:4173');await page.waitForFunction(()=>typeof view==='function');
 await page.evaluate(()=>view('Settings'));
 const options=await page.$$eval('#display-scheme option',o=>o.map(x=>x.value));assert.deepEqual(options,['black','console','terminal']);
 await page.selectOption('#display-scheme','terminal');
 const read=()=>page.evaluate(()=>{const root=getComputedStyle(document.documentElement),body=getComputedStyle(document.body),panel=document.querySelector('.settings-grid,.panel'),h=document.querySelector('.page-heading h1,.panel-heading h2');return{scheme:document.documentElement.dataset.scheme,stored:localStorage.getItem('nightlink.display-scheme'),bg:root.getPropertyValue('--bg').trim(),text:root.getPropertyValue('--text').trim(),font:body.fontFamily,bodyBg:body.backgroundColor,bodyColor:body.color,panelBg:panel&&getComputedStyle(panel).backgroundColor,heading:h&&getComputedStyle(h).color,muted:(()=>{const d=document.createElement('span');d.style.color='var(--muted)';document.body.append(d);const c=getComputedStyle(d).color;d.remove();return c;})(),radius:root.getPropertyValue('--nl-radius-card').trim()};});
 let s=await read();
 assert.equal(s.scheme,'terminal');assert.equal(s.stored,'terminal');assert.equal(s.bg,'#030607');assert.equal(s.text,'#d7f4ea');assert.match(s.font,/Cascadia Mono/);assert.equal(s.radius,'14px');
 for(const [fg,bg] of [[s.bodyColor,s.bodyBg],[s.bodyColor,s.panelBg],[s.muted,s.panelBg],[s.heading,s.panelBg]])assert.ok(contrast(fg,bg)>=4.5,`contrast ${fg} on ${bg} = ${contrast(fg,bg).toFixed(2)}`);
 if(shots)await page.screenshot({path:path.join(shots,'terminal-settings.png')});
 await page.reload();await page.waitForFunction(()=>typeof view==='function');
 s=await read();assert.equal(s.scheme,'terminal','scheme persists after reload');
 await page.evaluate(()=>view('Settings'));assert.equal(await page.inputValue('#display-scheme'),'terminal');
 if(shots)for(const name of ['Overview','Messages','Radio']){await page.evaluate(n=>view(n),name);await page.waitForTimeout(150);await page.screenshot({path:path.join(shots,`terminal-${name.toLowerCase()}.png`)});}
 // Startup lock reads the same stored preference.
 const lock=await context.newPage();await lock.goto('http://127.0.0.1:4173/security-lock.html');
 const l=await lock.evaluate(()=>({scheme:document.documentElement.dataset.scheme,font:getComputedStyle(document.body).fontFamily}));assert.equal(l.scheme,'terminal');assert.match(l.font,/Cascadia Mono/);
 if(shots)await lock.screenshot({path:path.join(shots,'terminal-lock.png')});
 // Detached DM applies the scheme from its snapshot.
 const dm=await context.newPage();await dm.addInitScript(()=>{window.dmWindow={onUpdate:fn=>window.__dmUpdate=fn,contact(){},reply(){},action(){},read(){},draft(){},onFocus(){}};});await dm.goto('http://127.0.0.1:4173/dm.html');
 assert.equal(await dm.evaluate(()=>document.documentElement.dataset.scheme),'terminal');
 // Unknown values still fall back to the default.
 assert.equal(await page.evaluate(()=>NightlinkScheme.apply('bogus')),'black');
 assert.deepEqual(errors,[]);console.log('terminal scheme browser checks passed');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1);});
