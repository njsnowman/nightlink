/* Reminders describe save evidence, never file availability or remote backup. */
(function(root){const WEEK=7*24*60*60*1000;
function backupReminder({last,confirmed,now=Date.now(),enabled=true,snoozeUntil=0,hasData=false,pending=false}){const evidence=confirmed?.confirmed===true?confirmed:last?.confirmed===true?last:null,at=evidence?Date.parse(evidence.at):NaN,valid=Number.isFinite(at)&&at<=now;return{at:valid?at:null,due:!!(enabled&&hasData&&!pending&&!(Number.isFinite(snoozeUntil)&&snoozeUntil>now)&&(!valid||now-at>=WEEK))};}
const api={WEEK,backupReminder};root.NightlinkBackupReminders=api;if(typeof module!=='undefined')module.exports=api;})(globalThis);
