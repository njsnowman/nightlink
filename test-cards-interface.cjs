/* Browser test setup for checks written against the rc.11 card interface.
   Terminal is the default interface (#131); these suites select Cards explicitly on every new page,
   unless the page already stored a choice. Wraps the Playwright module passed in and returns it. */
module.exports=function cardsInterface(playwright){
 const script=()=>{try{if(!localStorage.getItem('nightlink.interface'))localStorage.setItem('nightlink.interface','cards');}catch{}};
 const patchContext=async context=>{await context.addInitScript(script);return context;};
 const patchBrowser=browser=>{
  const newContext=browser.newContext.bind(browser),newPage=browser.newPage.bind(browser);
  browser.newContext=async(...args)=>await patchContext(await newContext(...args));
  browser.newPage=async(...args)=>{const page=await newPage(...args);await page.context().addInitScript(script);return page;};
  return browser;
 };
 const chromium=playwright.chromium,launch=chromium.launch.bind(chromium),persistent=chromium.launchPersistentContext?.bind(chromium);
 const wrapped=Object.create(chromium);
 wrapped.launch=async(...args)=>patchBrowser(await launch(...args));
 if(persistent)wrapped.launchPersistentContext=async(...args)=>patchContext(await persistent(...args));
 return {...playwright,chromium:wrapped};
};
