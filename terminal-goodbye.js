/* Sign-off screen: when the desktop shell asks the app to quit, the terminal interface shows the logo and NO CARRIER
   while the existing quit work (disconnect, save) runs. It adds no delay: quit timing is unchanged. Terminal only. */
(function(root){
 'use strict';
 const doc=root.document;
 function goodbye(){
  if(!root.NightlinkInterface?.isTerminal()||doc.querySelector('#term-goodbye'))return null;
  const screen=doc.createElement('div');screen.id='term-goodbye';screen.setAttribute('role','status');screen.setAttribute('aria-label','Closing Nightlink');
  const logo=doc.createElement('div');logo.className='goodbye-logo';if(root.NightlinkTerminalLogo)logo.append(NightlinkTerminalLogo.logo(doc,'Nightlink'));
  const line=(text,cls)=>{const p=doc.createElement('p');p.className=cls;p.textContent=text;return p;};
  screen.append(logo,line('NO CARRIER','goodbye-carrier'),line('Saving local state · closing Nightlink','goodbye-note'));
  doc.body.append(screen);return screen;
 }
 root.NightlinkGoodbye={show:goodbye};
 root.meshlineDesktop?.onQuit?.(()=>{goodbye();});
})(typeof window==='object'?window:globalThis);
