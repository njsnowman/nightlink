// Window events can arrive while Electron is tearing down their WebContents.
function available(window){return !!window&&!window.isDestroyed()&&!!window.webContents&&!window.webContents.isDestroyed();}
function send(window,...args){if(!available(window))return false;window.webContents.send(...args);return true;}
module.exports={available,send};
