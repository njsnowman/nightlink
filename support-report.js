/* Allowlisted local support summary. Never serialize input objects wholesale. */
(function(root){
 const phases=new Set(['app-script','workspace-first-frame','saved-history','connection','sync','channels','queue','contacts','telemetry','corescope-page','meshmapper-page','echo-map-page']);
 const outcomes=new Set(['complete','loaded','failed','cancelled','disconnected']);
 const events=new Set(['connection','sync','recovery','command-error','error','bluetooth-setup']);
 const states=new Set(['disconnected','scanning','connecting','initializing','connected','syncing','ready','error','waiting','retrying','failed','sync-failed','exhausted','paused','disabled','idle']);
 const MAX_DURATION=7*86400000;
 function numeric(value,max=10000000){return typeof value==='number'&&Number.isFinite(value)&&value>=0?Math.min(max,Math.round(value)):null;}
 function choice(value,allowed,fallback='unknown'){return allowed.has(value)?value:fallback;}
 function category(value){const text=typeof value==='string'?value:'';if(!text)return'none';if(/(?:gatt|operation).*(?:already|in progress)/i.test(text))return'gatt-busy';if(/disconnect|not connected|connection.*changed/i.test(text))return'disconnected';if(/timed? ?out|timeout/i.test(text))return'timeout';if(/reject|radio error|error code|code \d|not found.*radio/i.test(text))return'radio-rejected';if(/permission|denied|not allowed/i.test(text))return'permission';if(/unsupported|not supported/i.test(text))return'unsupported';return'other';}
 function age(value,now){const at=typeof value==='number'?value:typeof value==='string'?Date.parse(value):NaN;return Number.isFinite(at)&&at<=now?numeric(now-at,MAX_DURATION):null;}
 function build(input={},now=Date.now()){
  now=typeof now==='number'&&Number.isFinite(now)&&now>=0&&now<=8640000000000000?now:Date.now();
  const health=input.health||{},timings=input.timings||{};
  const report={format:'nightlink-support-report',schemaVersion:1,app:'Nightlink',appVersion:typeof input.appVersion==='string'&&/^\d{1,3}\.\d{1,3}\.\d{1,3}(?:-(?:rc|beta|alpha)\.\d{1,3})?$/.test(input.appVersion)?input.appVersion:'unknown',createdAt:new Date(now).toISOString(),scope:'current-radio-summary-and-app-session-events',transport:choice(input.transport,new Set(['bluetooth','usb'])),connection:choice(input.connection,states),synchronization:choice(input.sync,new Set(['disconnected','syncing','ready','error'])),protocol:numeric(input.protocol,65535),historyWriteError:input.storageError===true,session:{connected:health.connected===true,syncing:health.syncing===true,uptimeMs:numeric(health.uptimeMs,MAX_DURATION),reconnects:numeric(health.reconnects,100000),lastFullSyncAgeMs:age(health.lastSyncAt,now),lastFullSyncQueueFrames:numeric(health.lastSyncFetched),queueFramesFetched:numeric(health.fetched),savedMessageCount:numeric(input.savedMessageCount),latestErrorCategory:category(health.error)},timings:{completed:[],pending:[]},events:[]};
  for(const row of (Array.isArray(timings.completed)?timings.completed:[]).slice(-80)){if(!row||!phases.has(row.phase))continue;report.timings.completed.push({phase:row.phase,outcome:choice(row.outcome,outcomes),durationMs:numeric(row.durationMs,MAX_DURATION)});}
  for(const row of (Array.isArray(timings.pending)?timings.pending:[]).slice(-12)){if(!row||!phases.has(row.phase))continue;report.timings.pending.push({phase:row.phase,elapsedMs:numeric(row.elapsedMs,MAX_DURATION)});}
  for(const row of (Array.isArray(input.events)?input.events:[]).slice(-1500)){if(!row||!events.has(row.type))continue;const event={type:row.type,ageMs:age(row.at,now)};if(row.type==='command-error'){event.command=Number.isInteger(row.command)&&row.command>=0&&row.command<=255?row.command:null;event.errorCategory=category(row.message);}else if(row.type==='error')event.errorCategory=category(row.message);else{event.state=choice(row.state,states);if(row.type==='recovery'){event.attempt=numeric(row.attempt,1000);event.delayMs=numeric(row.delay,600000);}if(row.type==='connection')event.transport=choice(row.transport,new Set(['bluetooth','usb']));}report.events.push(event);}
  report.events=report.events.slice(-100);return report;
 }
 root.NightlinkSupportReport={build,category};if(typeof module!=='undefined')module.exports=root.NightlinkSupportReport;
})(globalThis);
