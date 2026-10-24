/* Session-only phase durations. Never record identities, message text, URLs or coordinates. */
(function(root){
 const phases=new Set(['app-script','workspace-first-frame','saved-history','connection','sync','channels','queue','contacts','telemetry','corescope-page','meshmapper-page','echo-map-page']);
 const outcomes=new Set(['complete','loaded','failed','cancelled','disconnected']);
 class NightlinkTimings{
  constructor(now=()=>performance.now(),limit=80){this.now=now;this.limit=limit;this.sequence=0;this.pending=new Map();this.rows=[];}
  begin(name){if(!phases.has(name))return null;const token=++this.sequence;this.pending.set(name,{token,start:this.now()});return token;}
  end(name,outcome='complete',token){const started=this.pending.get(name);if(!started||(token!==undefined&&started.token!==token))return false;this.pending.delete(name);this.rows.push({phase:name,outcome:outcomes.has(outcome)?outcome:'complete',durationMs:Math.max(0,Math.round(this.now()-started.start))});if(this.rows.length>this.limit)this.rows.splice(0,this.rows.length-this.limit);return true;}
  snapshot(){return{completed:this.rows.map(row=>({...row})),pending:[...this.pending].map(([phase,value])=>({phase,elapsedMs:Math.max(0,Math.round(this.now()-value.start))}))};}
 }
 if(typeof module!=='undefined')module.exports={NightlinkTimings};
 if(root.document){root.NightlinkPerformance=new NightlinkTimings();root.NightlinkPerformance.begin('app-script');}
})(globalThis);
