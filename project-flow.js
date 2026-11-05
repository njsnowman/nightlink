/* Saved-data gates for the ordered source-planning workflow. No completion flags or side effects. */
(function(root){
'use strict';
const dep=(n,p)=>root[n]||(typeof require==='function'?require(p):null),P=dep('NightlinkMeshProject','./mesh-project.js'),RF=dep('NightlinkRF','./rf-planning.js'),S=dep('NightlinkRFSuite','./rf-suite.js');
function derive(plan){const p=plan.project,selected=[...new Set([...p.transmitterIds,...p.targetIds,...p.candidateIds])],sites=new Map(plan.sites.map(s=>[s.id,s])),profiles=new Set(plan.rf.profiles.map(p=>p.siteId)),check=(label,ok,siteId)=>({label,ok:!!ok,...(siteId?{siteId}:{})}),requirements=[];
requirements.push([check('Save the study center and radius.',p.area)]);
requirements.push([check('Select at least one existing transmitter in Select site roles.',p.transmitterIds.length),...selected.map(id=>check((sites.get(id)?.name||id)+': save latitude and longitude.',sites.get(id)?.lat!=null&&sites.get(id)?.lon!=null,id))]);
requirements.push(selected.length?selected.map(id=>check((sites.get(id)?.name||id)+': enter or apply its radio and antenna profile.',profiles.has(id),id)):[check('Select sites in step 2 before entering equipment.',false)]);
const pairs=p.transmitterIds.flatMap((a,i)=>p.transmitterIds.slice(i+1).map(b=>[a,b])),paths=pairs.map(([a,b])=>{const valid=plan.rf.paths.some(path=>{if(!P.pathMatches(path,p)||!path.terrain||!([path.aId,path.bId].includes(a)&&[path.aId,path.bId].includes(b)))return false;const sa=sites.get(path.aId),sb=sites.get(path.bId);return sa?.lat!=null&&sb?.lat!=null&&RF.distance(path.terrain.a,sa)<=.1&&RF.distance(path.terrain.b,sb)<=.1&&S.predict(path,plan.sites,plan.rf.profiles).state==='sampled';});return check((sites.get(a)?.name||a)+' to '+(sites.get(b)?.name||b)+': calculate current terrain / LOS.',valid);});
requirements.push(paths.length?paths:[check('One existing transmitter: no inter-transmitter path is required. Direct service-target paths are optional.',p.transmitterIds.length===1)]);
const model=P.combined(plan);requirements.push([check('Calculate current existing-transmitter heatmaps with no unknown area samples.',model.state==='modeled'&&model.total>0&&model.unknown===0)]);
const candidates=P.candidateResults(plan);requirements.push(candidates.length?candidates.map(c=>check(c.site.name+': calculate current coverage and sampled backhaul (a below-budget result is still assessed).',c.state!=='unresolved'&&c.after?.unknown===0)):[check('No repeater candidate selected. Adding a candidate is optional.',true)]);
requirements.push([check('All required source inputs and calculations are current.',requirements.every(rows=>rows.every(c=>c.ok)))]);
let prior=true;const steps=requirements.map((checks,index)=>{const complete=checks.every(c=>c.ok),unlocked=prior;prior=prior&&complete;return {index,checks,complete,unlocked,missing:checks.filter(c=>!c.ok).map(c=>c.label)};}),first=steps.find(s=>!s.complete)?.index??6;
return {steps,first,ready:steps.slice(0,6).every(s=>s.complete),pairs,model};
}
function allowed(plan,index){const g=derive(plan);return Number.isInteger(index)&&index>=0&&index<g.steps.length&&g.steps[index].unlocked;}
root.NightlinkProjectFlow={derive,allowed};if(typeof module!=='undefined')module.exports=root.NightlinkProjectFlow;
})(globalThis);
