/* Synthetic renderer; local assets only, no radio activity. Checks the ANSI logo on the connection dialog, Help > About and the sidebar brand in every display scheme. */
const {chromium}=require(process.env.NIGHTLINK_PLAYWRIGHT||'playwright'),fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict');
const serve=page=>page.route('**/*',async route=>{const u=new URL(route.request().url());if(u.hostname!=='127.0.0.1')return route.abort();const file=u.pathname==='/'?'index.html':u.pathname.slice(1);try{await route.fulfill({body:await fs.readFile(path.join(__dirname,file)),contentType:file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':file.endsWith('.svg')?'image/svg+xml':'text/html'});}catch{await route.fulfill({status:404,body:''});}});
const fits=sel=>{const box=document.querySelector(sel),art=box?.querySelector('.ansi-logo-art');if(!box||!art)return{missing:sel};const b=box.getBoundingClientRect(),a=art.getBoundingClientRect();return{visible:b.width>0&&b.height>0,artFits:art.scrollWidth<=art.clientWidth+1&&a.right<=b.right+0.5&&a.left>=b.left-0.5,boxOverflow:box.scrollWidth>box.clientWidth+1,label:box.getAttribute('aria-label'),hidden:art.getAttribute('aria-hidden'),inline:[...box.querySelectorAll('[style]')].length,text:art.textContent};};
(async()=>{const browser=await chromium.launch({headless:true,...(process.env.NIGHTLINK_BROWSER?{executablePath:process.env.NIGHTLINK_BROWSER}:{})});try{
 for(const scheme of ['black','console','terminal'])for(const size of [{width:760,height:560},{width:1320,height:860}]){
  const page=await browser.newPage({viewport:size}),errors=[];page.on('pageerror',e=>errors.push(e.message));await serve(page);
  await page.addInitScript(s=>{if(location.hostname==='127.0.0.1')localStorage.setItem('nightlink.display-scheme',s);},scheme);
  await page.goto('http://127.0.0.1:4173/');await page.waitForFunction(()=>typeof showBluetooth==='function'&&window.NightlinkLogo);
  const where=JSON.stringify({scheme,size});
  // Sidebar brand keeps the icon and the accessible name; the wordmark shows only in the labelled sidebar.
  const brand=await page.evaluate(()=>{const a=document.querySelector('aside .brand'),mark=a.querySelector('.ansi-logo-wordmark'),r=a.getBoundingClientRect(),m=mark.getBoundingClientRect();return{icon:!!a.querySelector('img.brand-icon'),hidden:mark.getAttribute('aria-hidden'),shown:m.width>0,inside:!m.width||(m.right<=document.querySelector('aside').getBoundingClientRect().right&&mark.scrollWidth<=mark.clientWidth+1),text:mark.textContent.split('\n')[0],label:a.getAttribute('aria-label'),width:r.width};});
  assert.equal(brand.icon,true,where);assert.equal(brand.hidden,'true');assert.equal(brand.label,'Nightlink');assert.equal(brand.text,'NIGHTLINK');assert.equal(brand.inside,true,where);assert.equal(brand.shown,size.width>850,where);
  assert.equal(await page.getByRole('link',{name:'Nightlink',exact:true}).count(),1);
  // Connection dialog: logo precedes the controls, which stay within the dialog without scrolling.
  await page.evaluate(()=>showBluetooth());
  const connect=await page.evaluate(fits,'.ble-sheet .ansi-logo');assert.equal(connect.visible,true,where);assert.equal(connect.artFits,true,where);assert.equal(connect.boxOverflow,false,where);assert.equal(connect.label,'Nightlink logo');assert.equal(connect.hidden,'true');assert.equal(connect.inline,0);assert.match(connect.text,/██/);
  const layout=await page.evaluate(()=>{const d=bleSheet,r=d.getBoundingClientRect(),logo=d.querySelector('.ansi-logo').getBoundingClientRect(),button=d.querySelector('#ble-connect').getBoundingClientRect();return{logoFirst:logo.bottom<=button.top,buttonInside:button.top>=r.top&&button.bottom<=r.bottom&&button.bottom<=innerHeight,dialogScroll:d.scrollHeight>d.clientHeight,pageScroll:document.documentElement.scrollWidth>innerWidth||document.documentElement.scrollHeight>innerHeight};});
  assert.deepEqual(layout,{logoFirst:true,buttonInside:true,dialogScroll:false,pageScroll:false},where);assert.equal(await page.locator('#ble-connect').isVisible(),true);
  await page.evaluate(()=>bleSheet.close());
  // Help > About leads with the logo.
  await page.evaluate(()=>NightlinkSettings.open('help'));await page.locator('#help-about-tab').click();await page.locator('.help-about .ansi-logo').waitFor();
  const about=await page.evaluate(fits,'.help-about .ansi-logo');assert.equal(about.visible,true,where);assert.equal(about.artFits,true,where);assert.equal(about.boxOverflow,false,where);assert.equal(about.inline,0);
  assert.equal(await page.evaluate(()=>document.querySelector('.help-about').firstElementChild.classList.contains('ansi-logo')),true);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,where);
  assert.deepEqual(errors,[],where);await page.close();
 }
 // Compact sidebar keeps the wordmark inside the narrower sidebar.
 const page=await browser.newPage({viewport:{width:1320,height:860}});await serve(page);await page.goto('http://127.0.0.1:4173/');await page.waitForFunction(()=>window.NightlinkLogo);await page.evaluate(()=>document.body.classList.add('compact'));
 const compact=await page.evaluate(()=>{const mark=document.querySelector('aside .brand .ansi-logo-wordmark'),m=mark.getBoundingClientRect(),aside=document.querySelector('aside').getBoundingClientRect();return m.width>0&&m.right<=aside.right&&mark.scrollWidth<=mark.clientWidth+1;});assert.equal(compact,true,'compact sidebar wordmark fits');
 console.log('PASS ANSI logo on connection dialog, Help > About and sidebar brand in black, console and terminal schemes at 760x560 and 1320x860; controls stay visible, no horizontal overflow. Simulated renderer only.');
}finally{await browser.close();}})().catch(error=>{console.error(error);process.exitCode=1;});
