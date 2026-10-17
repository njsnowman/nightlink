(function(root){
 function minutes(value){if(typeof value!=='string'||!/^([01]\d|2[0-3]):[0-5]\d$/.test(value))return null;const [h,m]=value.split(':').map(Number);return h*60+m;}
 function settings(value={}){if(!value||typeof value!=='object')value={};return{closeToTray:value.closeToTray!==false,quietEnabled:value.quietEnabled===true,start:minutes(value.start)==null?'22:00':value.start,end:minutes(value.end)==null?'08:00':value.end};}
 function quiet(value,date=new Date()){const p=settings(value);if(!p.quietEnabled)return false;const a=minutes(p.start),b=minutes(p.end),n=date.getHours()*60+date.getMinutes();return a===b|| (a<b?n>=a&&n<b:n>=a||n<b);}
 const api={settings,quiet};if(typeof module!=='undefined')module.exports=api;else root.NightlinkTrayPolicy=api;
})(globalThis);
