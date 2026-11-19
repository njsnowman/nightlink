/* Local common-grid site/height experiments. No network, storage or radio calls. */
(function(root){
'use strict';
const A=root.NightlinkLocalPlanning||(typeof require==='function'?require('./local-planning.js'):null),RF=root.NightlinkRF||(typeof require==='function'?require('./rf-planning.js'):null),P=root.NightlinkMeshProject||(typeof require==='function'?require('./mesh-project.js'):null);
const abort=signal=>{if(signal?.aborted)throw Object.assign(Error('Comparison cancelled'),{name:'AbortError'});};
const pause=()=>new Promise(resolve=>setTimeout(resolve,0));
function signature(plan,input){const s=A.settings(input,plan);return JSON.stringify([A.signature(plan,s),s.comparison]);}
function combine(before,candidate){return before.map((b,i)=>{const c=candidate[i];if(!c||c.id!==b.id)throw Error('Comparison grids differ');return {...b,state:b.state==='covered'||c.state==='covered'?'covered':b.state==='unknown'||c.state==='unknown'?'unknown':'gap'};});}
function backhaul(plan,model,id){
 const paths=plan.project.transmitterIds.map(sourceId=>{const path=plan.rf.paths.slice().reverse().find(p=>p.aId===id&&p.bId===sourceId||p.bId===id&&p.aId===sourceId);if(!path)return {sourceId,state:'unknown',reason:'No saved endpoint path'};const r=model.link(path.id);return {sourceId,pathId:path.id,...r,reserve:r.state==='modeled'?Math.min(r.reserveAB,r.reserveBA):null,reason:r.state!=='modeled'?r.message:r.reserveAB>=0&&r.reserveBA>=0?'Both directions meet the entered budget':r.engine!=='free-space'&&r.minRay<0?'Sampled terrain blocks the direct ray':r.engine!=='free-space'&&r.minFresnel<0?'Sampled terrain intrudes into the Fresnel zone':'Link budget below the entered margin'};});
 const known=paths.filter(p=>p.reserve!=null).sort((a,b)=>b.reserve-a.reserve),best=known[0]||null,state=best?.reserve>=0?'meets-budget':paths.length&&known.length===paths.length?'below-budget':'unknown';return {state,best,paths,reason:state==='unknown'?'Backhaul unresolved: save a sampled path to an existing transmitter':best.reason};
}
async function run(plan,input={}, {signal,onProgress=()=>{},yieldTask=pause}={}){
 const s=A.settings(input,plan),options=s.comparison;
 if(!options.siteIds.length)throw Error('Choose at least one proposed location');
 if(!plan.project.transmitterIds.length||!plan.project.area)throw Error('Select an existing transmitter and a study area first');
 abort(signal);const baselineModel=A.model(plan,s),before=baselineModel.grid(),baselineUnknown=before.filter(c=>c.state==='unknown').length,baselineCovered=before.filter(c=>c.state==='covered').length,total=before.length,rows=[];
 const totalJobs=options.siteIds.length*options.heightsM.length;
 for(const siteId of options.siteIds){const site=plan.sites.find(p=>p.id===siteId);if(site?.lat==null||site.lon==null)throw Error('Enter coordinates for '+(site?.name||'the proposed location'));const original=s.profiles[siteId]||plan.rf.profiles.find(p=>p.siteId===siteId)||P.equipment(plan.project,siteId);
  for(const heightM of options.heightsM){await yieldTask();abort(signal);const settings={...s,profiles:{...s.profiles,[siteId]:{...original,heightM}}},candidatePlan={...plan,project:{...plan.project,transmitterIds:[siteId]},rf:{...plan.rf,paths:plan.rf.paths.map(p=>({...p,heightA:null,heightB:null}))}},model=A.model(candidatePlan,settings),candidate=model.grid(),cells=combine(before,candidate),unknown=cells.filter(c=>c.state==='unknown').length,candidateUnknown=candidate.filter(c=>c.state==='unknown').length,covered=cells.filter(c=>c.state==='covered').length,added=cells.filter((c,i)=>before[i].state==='gap'&&c.state==='covered').length,bh=backhaul(plan,model,siteId),complete=baselineUnknown===0&&candidateUnknown===0,percent=100*covered/total;
   const targets=plan.sites.filter(p=>plan.project.targetIds.includes(p.id)&&p.lat!=null).map(p=>{const b=baselineModel.sample(p),c=model.sample(p);return {id:p.id,name:p.name,state:b.state==='covered'||c.state==='covered'?'covered':b.state==='unknown'||c.state==='unknown'?'unknown':'gap'};});
   const meetsGoal=complete&&bh.state==='meets-budget'&&percent>=options.goalPercent&&added>0&&targets.every(t=>t.state==='covered');
   rows.push({key:siteId+':'+heightM,siteId,name:site.name,lat:site.lat,lon:site.lon,heightM,covered,total,percent,unknown,candidateUnknown,added:baselineUnknown?null:added,gainPoints:baselineUnknown?null:100*added/total,complete,backhaul:bh,targets,meetsGoal,cells,reason:!complete?'Coverage unresolved: stored radial terrain does not cover every comparison sample':bh.state!=='meets-budget'?bh.reason:added===0?'No additional confirmed gap samples meet the budget':targets.some(t=>t.state!=='covered')?'Selected destination service remains below budget or unknown':percent<options.goalPercent?'Combined potential is below the entered coverage goal':'Meets the sampled goal and reciprocal backhaul; check access and test on site'});
   onProgress({completed:rows.length,total:totalJobs,siteId,heightM});abort(signal);
  }
 }
 const shortlist=options.siteIds.map(id=>rows.filter(r=>r.siteId===id&&r.meetsGoal).sort((a,b)=>a.heightM-b.heightM)[0]).filter(Boolean).sort((a,b)=>a.heightM-b.heightM||b.added-a.added||b.backhaul.best.reserve-a.backhaul.best.reserve||a.name.localeCompare(b.name));
 return {signature:signature(plan,s),createdAt:Date.now(),engine:s.engine,options,baseline:{covered:baselineCovered,total,unknown:baselineUnknown,percent:100*baselineCovered/total},rows,shortlist:shortlist.map(r=>r.key),method:'Common-grid potential from stored radial traces; separate reciprocal saved-path backhaul. Lowest tested height only, not an exhaustive minimum or verified service.'};
}
root.NightlinkSiteComparison={signature,combine,backhaul,run};if(typeof module!=='undefined')module.exports=root.NightlinkSiteComparison;
})(globalThis);
