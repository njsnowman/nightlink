/* Offline Operations handbook. Shared data powers the menu and full-document exports. */
(function(root){
'use strict';const topic=(id,title,summary,steps,items=[],stage=null)=>({id,title,group:'Operations',summary,sections:[{title:'What to do',steps},{title:'What the result means',items}].filter(s=>s.steps?.length||s.items?.length||s.text),stage}),topics=[
topic('ops-volunteer','Start here: try a location','For occasional volunteer work: compare a hill or rooftop with an existing site and keep the idea when it is useful.',[
'Open Operations and choose Try a location. Choose a saved or cached contact location, enter coordinates, or use Place existing site on the map.',
'Use Place proposed pin for the possible repeater. Enter both antenna heights in feet, the frequency and the local preview radius in miles. Optional radio details let you change power, gain, losses and ground assumptions.',
'Choose Run preview when ready. This explicitly requests terrain coordinates, or uses cached terrain only if selected. Cancel stops the preview without saving an idea.',
'The completed preview opens its result summary. Read Will this link likely work, What might this location add and What should I do next. Technical source details stay expandable. Use Adjust antenna height or Try another pin, then run again; editing inputs does not perform a calculation. Read the direct-path explanation and local predicted area results. Unknown coverage is unresolved, not a confirmed gap; predictions are not measured radio service.',
'Keep this idea saves an independent project without changing the source project. Export a simple site note to share. Neither action requires a team, dates, assignments or an installation record.',
'Return whenever you have time. A field test is optional. Use Detailed planner only for a larger study, multiple sites, repeater-gap searches or formal installation records.'
],['Inputs are drafted locally; Keep explicitly saves a restorable project. Back up saved plans for transfer to another computer. Drafts are not included in project backups.','Saved and radio contact locations are snapshots, not live tracking. Opening or keeping an idea never configures or transmits to a radio.','The heatmap shows the proposed site alone around its pin. Existing-site and combined results remain unresolved when a required source model is outside the supported radius.']),
topic('ops-start','Optional: detailed mesh project','For a larger study, Operations separates a proposed source design from observations, approved baselines and recorded installations.',[
'Choose New project for the optional detailed planner, or open Detailed planner from a location idea. Describe the people or places you want served. Open the project to resume its first unfinished step.',
'Follow Project, Sites, Radio, Terrain & LOS, Coverage, Repeater gaps, then Review & export. A saved requirement unlocks the next step; clicking a checkbox does not manufacture completion.',
'Save inline forms explicitly. Use the required-work card to see what is missing, and Back to correct earlier inputs. The summary reflects saved inputs, not pending draft values.',
'After source planning, use Engineering studio for network alternatives and save a scenario. Deployment workspace freezes an explicitly approved scenario for installation and acceptance.',
'Use Field survey for direct observations and Verify & refine to compare evidence and plan follow-up work. Keep a complete project backup before major changes.'
],['Opening a page never configures a radio or retrieves elevation. Terrain calculations require an explicit calculation action.','Planning readiness is not structural, electrical, regulatory or physical-radio acceptance. The application does not certify a site.']),
topic('ops-step-0','Step 1: define the project','Set a shared area so coverage and candidate comparisons use the same study grid.',[
'Enter the project name and purpose in Project basics. Enter center latitude and longitude from a known location.',
'Enter the study radius in miles and the desired modeled coverage percentage. The supported radius is about 0.31 to 15.53 mi (canonical 0.5–25 km).',
'Save Project basics. Continue becomes available once the study area is saved. Change the area later if the service objective changes, then rebuild affected models.'
],['The area defines samples to assess; it does not claim the mesh serves everything inside its circle.','A changed area invalidates dependent source coverage. Old records are retained but cannot count as current models.'],0),
topic('ops-step-1','Step 2: plot sites and assign roles','A site is a saved location. Its role determines how the source study uses it.',[
'Choose New site / project-wide in Selected site, enter a name and known latitude/longitude, and save.',
'Assign Existing transmitter to radios already providing the baseline, Service target to a place needing service, or Proposed repeater candidate to a possible addition. A candidate cannot also be an existing transmitter.',
'At least one existing transmitter is required. Every selected role needs coordinates. The source combined study supports up to three transmitters and eight candidates.',
'Use completion Edit links or map rings to select a location. Only the right panel changes; selection does not recenter the map. Add access and power notes without treating them as a site inspection.'
],['A plotted location is a planning record, not an observed radio or an installed asset.','Maps and horizontal distances are in miles; coordinates remain latitude/longitude.'],1),
topic('ops-step-2','Step 3: set up radios and antennas','Common radio settings describe the study; individual profiles retain actual source-site assumptions.',[
'Open Project frequency and defaults. Enter frequency in MHz, antenna and receiver heights in feet, transmit power in dBm, antenna gain in dBi, losses in dB and receiver sensitivity in dBm. Save the defaults.',
'Fill missing site profiles from saved defaults only when those assumptions are appropriate. This fills missing selected profiles and preserves existing profiles.',
'Select each site and review its inline Radio form. Save its antenna AGL and RF values. AGL is height above ground, not ground elevation above sea level.',
'Leave ground elevation blank to use the terrain endpoint. If entering ground elevation, declare its datum and ensure it matches the supplied terrain reference.',
'Use Additional editing options for full editors, photographs and advanced propagation assumptions. Existing source equipment is never silently replaced by a changed default.'
],['Transmit power, antenna gain and receiver sensitivity are different quantities; keep their units unchanged.','Changing source profiles can make predictions stale. It does not change hardware or rewrite a frozen deployment.'],2),
topic('ops-step-3','Step 4: terrain profiles and line of sight','LOS and link budget answer different questions and must be reviewed together.',[
'For multiple existing transmitters, calculate the required transmitter paths. One existing transmitter has no inter-transmitter path requirement.',
'For direct service-target or custom paths, select two to eight located/profiled sites and calculate selected terrain paths. At most 28 unique pairs are prepared per batch, within the saved-path limit.',
'Inspect a path below the map. Review the sampled ground surface, antenna ray, required Fresnel zone and reciprocal terrain-aware reserve.',
'Use the explanation card to see why a path is unresolved, obstructed, Fresnel-constrained or below budget. Correct source inputs before rerunning affected calculations.'
],['Negative ray clearance means the supplied terrain samples intersect the modeled antenna ray.','Positive ray clearance alone does not prove useful RF service. Fresnel constraints, budget, omitted clutter and real conditions can still matter.','An obstructed or below-budget path counts as assessed work; a failed goal must not be hidden by inventing a passing result.'],3),
topic('ops-step-4','Step 5: understand existing coverage','The baseline combines current source-transmitter predictions on one common study area.',[
'Generate existing-transmitter heatmaps explicitly. Wait for completion and save; cancellation, provider failure or revision conflict saves no partial model output.',
'Read the source verdict and total sampled coverage against the entered goal. Unknown positions need current inputs/models; they are not confirmed uncovered positions.',
'Use the map legend to show all samples, strong reserve, smaller positive reserve, below-budget gaps or unknown areas. A filter changes only the display, not the stored data or totals.',
'Inspect service-target results and model/source metadata. Regenerate after changing relevant area, equipment, location, receiver or propagation assumptions.'
],['Green reserve is at least 10 dB; yellow is 0–10 dB; red is below the entered budget; grey is unknown. Colors describe the model, not observed service.','The model resamples radial estimates. It is not a measured heatmap and does not resolve every obstruction between supplied surface samples.'],4),
topic('ops-step-5','Step 6: assess optional repeater proposals','Candidates are proposed study locations, not automatically approved installation sites.',[
'Review evaluated gap clusters only after current complete baseline coverage exists. Unknown cells do not become gap proposals.',
'Save a study candidate or plot a known candidate location and assign its role. Review its coordinates, access and RF profile.',
'Evaluate each selected candidate to prepare its area coverage and sampled backhaul. Compare newly covered samples, selected targets and worst-direction reserve.',
'Use before/after previews and two-site comparison to understand tradeoffs. A candidate with a below-budget backhaul remains a review item even if it adds modeled area.',
'Adding a candidate is optional. If none is selected there is no candidate-assessment requirement. Promotion into the source transmitter list is separate from freezing a deployment baseline.'
],['Gap-cluster points do not establish terrain suitability, available towers, permissions, power or real connectivity.','The nearby-terrain tool is a bounded screening calculation, not a proof that a location is optimal.'],5),
topic('ops-step-6','Step 7: review and export','Keep assumptions, unresolved work and evidence scope visible before sharing a plan.',[
'Read the plain-language review summary, saved assumptions and unresolved checks. A missing goal remains visible even when the calculations themselves are complete.',
'Export a complete project backup for restoration. Use the project HTML report, GeoJSON, CSV and installation packets for derived review material.',
'If source inputs change, return to the first unfinished step and regenerate affected models. Keep prior reports labeled as historical.',
'Use Engineering studio and Deployment workspace when ready to select, approve and install a design. Record actual conditions and field acceptance separately.'
],['Derived reports and map files do not replace a restorable complete project backup.','Mark plan reviewed is a local planning status; it is not field acceptance or certification.'],6),
topic('ops-drafts','Saving, local drafts and locked Continue','The application distinguishes saved project data from unfinished interface edits.',[
'Inline edits are retained locally per project, step and site. Switch sites or restart and return to the same form to recover them.',
'Save or Reset unsaved forms in the current step before Continue. The unsaved-edits list links back to those forms. Reset uses the current saved values.',
'If the same source fields changed since a draft was made, review the warning. The older draft cannot overwrite them; Reset before entering the intended current values.',
'For a revision conflict, keep the form and review the latest project. No partial write is committed. Save the intended correction after resolving the conflict.',
'Save drafts before exporting, transferring or clearing application data. Interface drafts are not included in project backups.'
],['A ready saved step can become stale after earlier edits. Rebuilding is required for dependent calculations, while old records remain retained.']),
topic('ops-map','Map selection, legend and comparisons','The source map is a view over saved planning data, not a radio route monitor.',[
'Use Selected site, completion Edit links, or a map ring to choose a location. Enter/Space activates focused source-site rings. Site inputs are revealed inside the task panel without panning the map.',
'Use the legend filters to isolate a modeled state, then All samples to restore the complete view. Read the displayed filter label before interpreting a screenshot.',
'Expand Compare two sites and choose two different saved locations. Compare entered AGL, direct sampled LOS/budget when present, and site-only common-area predictions.',
'An entered installation estimate is shown only when recorded. It excludes unentered equipment, mast, power, labor, permits and other costs; unknown does not mean zero.'
],['Comparisons do not apply a saved equipment scenario to the source plan. Frozen approval and recorded installation stay independent.','No direct path result is inferred from a nearby marker, a coverage overlap or a hop count.']),
topic('ops-data','Terrain provider, offline cache and cancellation','Explicit calculations may need external elevations; the maps and help can be viewed without running them.',[
'Open Terrain source, model and download settings to inspect the provider and sampling detail.',
'Use cached terrain only to prevent elevation HTTP. Missing cached coordinates remain a visible error; no substitute values are invented.',
'Use force refresh only when a new retrieval is intended. Preview, Balanced and Detailed sampling increase the number of required points.',
'Cancel an unwanted calculation. Stored source models remain unchanged; completed terrain batches can remain cached for a later explicit retry.',
'For HTTP/quota errors, retain the saved plan and retry when the provider is available, or use cached data. Avoid repeatedly forcing downloads.'
],['The bundled elevation workflow uses Open-Meteo/Copernicus surface data and shared provider quotas. Source/datum/resolution metadata are recorded with calculations.','The RF suite uses free-space plus Bullington diffraction over supplied geometry. It is not ITM/Longley–Rice, measured coverage or a simulation of actual routed mesh traffic.']),
topic('ops-engineering','Engineering studio and saved designs','Use bounded alternatives to study networks beyond one candidate.',[
'Open Other tools and project overview, then Engineering studio. Select study sites and declare gateways/service anchors.',
'Enter goals, mast/equipment alternatives, optional entered costs and budgets. Prepare current source models or use the explicit full-study workflow.',
'Compare designs, inspect isolated/unresolved backhaul and simulate site/link/shared-power failures. A proposed RF graph is not actual mesh routing.',
'Validate assumptions and save a named immutable scenario. If source inputs change, its saved context becomes historical.',
'Export installation packets and compare alternatives. Promote a current saved scenario through an explicit named approval in Deployment workspace.'
],['The search is bounded; a reported best tested option is not proof of the global optimum.','Missing cost or terrain remains unresolved rather than a favorable zero.']),
topic('ops-full','Run full study: prepare multiple analyses in one action','This optional workflow collects required inputs before an explicit multi-analysis run.',[
'Open Engineering studio and choose the full-study setup. Enter the area, source radio assumptions, study sites, gateways and objectives.',
'Review missing-input checks and offline/refresh choices. Start the run only after the form is valid.',
'The run prepares required source terrain/coverage and network analyses with progress and cancellation. Inspect the report for assumptions, unresolved data and bounded-search limits.',
'Save/export the completed study and retain a full project backup. A canceled or failed run does not save partial study models.'
],['Full study does not install equipment, configure a radio or create observed field outcomes. It does not remove the need for field acceptance.']),
topic('ops-survey','Field survey: record direct observations','Reported field points are evidence at a declared location and setup, not area-wide coverage.',[
'Open Field survey. Choose a direct path, target or other point and explicitly obtain device location, choose a map point or enter manual coordinates.',
'Record time, observer, frequency, receiving position/height, heard/intermittent/not-heard outcome and measured values when available.',
'Confirm actual position and direct setup. Forwarded packet RSSI is not a direct endpoint measurement.',
'Review model-versus-observation state and retained snapshots. Changed source setup can make an older comparison stale without deleting the observation.',
'Export survey data/report for review; retain a complete project backup to preserve restorable history.'
],['A device location request can be denied or unavailable. Use an explicit manual/map fallback and keep its provenance.','Do not record synthetic or inferred outcomes as physical-radio evidence.']),
topic('ops-verify','Verify & refine and change checkpoints','Prioritize missing evidence and evaluate explained improvements without overwriting history.',[
'Open Verify & refine to inspect the field-test queue and associated source predictions.',
'Use the point evidence map to distinguish model rings from observation centers. Unknown/stale context remains visible.',
'Evaluate mast what-if options before changing equipment. Reported improvements depend on supplied geometry and assumptions; they are not guaranteed field gains.',
'Record per-site deployment reviews with named evidence. Saved context changes make a review historical.',
'Capture a project checkpoint before a meaningful change. Compare current versus prior settings/fingerprints and modeled results where the result bases are comparable.'
],['Checkpoints are compact history, not complete restore points. Use a full project backup for restoration.','Associated input changes are not proof of an isolated physical RF cause.']),
topic('ops-deploy','Deployment: approve, install, test and hand over','A deployment freezes a design and retains independent execution records.',[
'Approve baseline: choose a current saved engineering scenario, name the approver and explicitly confirm the freeze. Later source edits do not rewrite it.',
'Site work orders: record owners, access, equipment/quantities, dates and tasks. Complete work requires an owner and checked tasks.',
'As-built records: enter actual coordinates, equipment, frequency, AGL/ground reference, gear and evidence notes. Confirm the actual installation; approved values are only a starting point for review.',
'Field acceptance: review criteria and record direct test outcomes, observer, actual setup/location, attempts/successes and required measurements. Missing, failed or changed-context results remain incomplete/stale.',
'Punch list: resolve underlying generated issues and provide evidence for manual resolutions. Review installation differences.',
'Handover: explicitly record the operator after required work/tests and punch items are satisfied. Later deployment-context changes mark older handovers historical.'
],['Installation entry is available before acceptance testing because test setup depends on the actual installation. The workspace is not a claim that hardware has been installed.','A source site can be removed while its approved/installed history remains inspectable. Do not replace a historical deployment merely to hide a failed test.']),
topic('ops-overview','Command Center and change impact','Use the overview to coordinate saved source planning and a selected deployment.',[
'Open Command center. Select the intended deployment explicitly when there are several. Source plan only is a separate context.',
'Use Overview for prioritized attention, Selected site for source/approved/installed comparisons and Change impact for missing/stale models and historical records.',
'Recalculate affected source models explicitly. Eligible raw terrain and current models can be reused; changing source models does not renew field observations, scenarios, installations or handovers.',
'Use the linked existing editor to address the underlying item. Guided source shortcuts still enforce required saved prerequisites.'
],['Removing a saved deployment selection does not silently switch to another deployment.','A current installed handover can remain current even when the independent source plan changes.']),
topic('ops-backup','Backups, reports and sharing','Choose the export that matches your purpose and save unfinished work first.',[
'Use a complete Operations/project backup for restoration and transfer. The current format is 8 and imports support earlier formats 1–8.',
'Use HTML reports for offline reading/printing, GeoJSON for geographic review and CSV for derived sample tables. Individual deployment JSON is a reference export; restore through the complete project backup.',
'Save interface drafts before export. Checkpoints and downloaded reports do not contain every raw model/history needed to restore a project.',
'Review names, coordinates, notes and evidence before sharing files. Keep a separate backup before deleting local projects or old deployment records.'
],['Canonical model/backup data retain SI units internally. User-facing map distances use miles and heights/elevations use feet.','Opening a report does not contact the radio or prove the displayed outcomes were physically measured.']),
topic('ops-trouble','Troubleshooting: locked steps and missing results','Use saved requirements and error details to locate the actual missing work.',[
'Continue locked: inspect required items and unsaved-forms links. Save or Reset pending edits, assign an existing transmitter and fill missing selected coordinates/profiles.',
'Coverage became unknown: compare area, source location/RF profile, mobile receiver and propagation assumptions. Recalculate affected models; a marker on the map alone is not a current prediction.',
'Terrain stale: endpoint geometry changed. Retrieve/import current endpoint terrain or use a matching cache; keep historical snapshots separate.',
'Datum/ground mismatch: review the declared ground reference and terrain endpoint. Leave ground blank to use the supplied terrain endpoint when appropriate; do not change a value just to obtain a green result.',
'No site-only comparison: prepare current coverage for that site. No direct LOS comparison: calculate the intended pair explicitly.',
'Conflict/stale draft: retain the intended edit, review the new saved source and use Reset before entering current values. A failed save does not overwrite stored records.',
'Blank basemap: the external street-map feed may be unavailable. Plotted source data, scale and offline help remain useful; do not infer that the radio or model has failed.'
],['For a bug report, include version, exact steps, saved error and a minimal synthetic example where possible. Keep physical-radio evidence separate from simulated tests.']),
topic('ops-glossary','RF glossary in plain language','Use the terms to interpret inputs and results without changing their meaning.',[],[
'AGL: antenna height above ground. MSL/ground elevation: height of the ground surface relative to a named reference datum. They are not interchangeable.',
'Datum: the vertical reference used by an elevation source. Matching numeric heights with different reference systems can still describe different surfaces.',
'LOS (line of sight): whether the modeled antenna ray clears supplied terrain samples. It says nothing by itself about available radio margin or unsampled obstructions.',
'Fresnel zone: a region around the direct ray relevant to propagation. Required-fraction clearance can be constrained even when the central ray is clear.',
'dBm: power relative to one milliwatt. dBi: antenna gain relative to an isotropic reference. dB: a relative gain/loss or margin, not a power unit by itself.',
'Receiver sensitivity: the entered receive threshold. Required margin: extra budget reserved above that threshold. Reserve: remaining modeled allowance after the entered requirement; negative is below budget.',
'Backhaul: the studied RF connection between a proposed addition and the source network. A modeled connection is not an observed forwarding route.',
'Unknown: missing, stale or incompatible inputs prevent a current result. Gap: evaluated below-budget area samples. Unknown is never a confirmed gap.',
'Scenario: a saved modeled design. Frozen baseline: an explicitly approved snapshot for a deployment. As-built: a manually recorded actual installation. Observation: a declared point test with setup/location provenance.'
]),
topic('ops-contact-book','Offline Contact Book and planning locations','Keep selected mesh identities and personal notes independently of the radio.',[
'Open Contact Book from the main navigation. Save selected radio contacts or create a new personal entry; unsaved radio contacts are not automatically added.',
'Enter personal name, alternate display name, call sign, address, notes and optional photograph. Link full mesh identities explicitly. Personal labels do not rename advertised senders in chat.',
'Use Map for known stored locations and their source/time. Addresses are not automatically geocoded, and a previous location does not prove present occupancy.',
'Use Activity for prospective observations while the app is open. Channel-name matching is explicitly unverified; a matching display name is not proof of identity. Loading old history does not manufacture observations.',
'Export book for its separate backup, including personal data and activity. Workspace/project backups do not include this independent database. Deleting a radio contact does not delete a saved book entry.',
'When copying a known location into Operations, review the planning snapshot and its age. A copied point is not a terrain calculation or a confirmed installation.'
],['Adding an identity back to a radio is an explicit radio-write action; viewing or exporting the book does not issue that action.','Only saved identities receive prospective book activity. This is not an always-on presence detector or a complete transmission history.']),
topic('ops-example','Worked example: assess a proposed repeater','This fictional sequence illustrates the workflow without claiming actual RF performance.',[
'Create a project for an existing base and a neighborhood needing service. Save a 1.24 mi study radius using known center coordinates.',
'Plot the existing base and service target, assign their roles and enter the intended source radio frequency and antenna/receiver heights in feet.',
'Generate baseline coverage and inspect the result. If grey areas remain, resolve missing/stale inputs before treating red samples as modeled gaps.',
'Save a candidate at a plausible known location and explicitly evaluate its coverage and backhaul. Compare the base and candidate using the same study area; unknown entered costs stay unknown.',
'If the candidate helps the model but its backhaul is below budget, inspect the path and assumptions rather than promoting a favorable coverage percentage as a proven design.',
'Save an evaluated design scenario, approve a deployment only after review, then record actual installation and direct field acceptance separately.'
],['The example radius is a presentation example, not a recommendation for a real project. No terrain, cost, height or reception result is guaranteed by following it.'])
];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),allTopics=(core=root.NightlinkGuide?.topics||[])=>topics.concat(core.map(t=>({...t,id:'app-'+t.id,group:'Nightlink / '+t.group,stage:null})));
function html(core){const rows=allTopics(core);return '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Nightlink full help handbook</title><style>body{max-width:960px;margin:32px auto;padding:0 20px;font:16px/1.6 system-ui;color:#17212b;background:#fff}h1,h2,h3{line-height:1.25}section{border-top:1px solid #aaa;padding-top:18px;margin-top:32px}a{color:#0645ad}li{margin:8px 0}nav{columns:2;column-gap:28px}@media(max-width:650px){nav{columns:1}}@media print{body{margin:0;max-width:none}section{break-inside:auto}h2,h3{break-after:avoid}a{color:inherit}}</style><h1>Nightlink full help handbook</h1><p>Offline app help and Operations guide · rc.44. Predictions, operator-entered observations and recorded installations remain separate. Map distances are miles; heights are feet.</p><nav aria-label="Contents"><ol>'+rows.map(t=>'<li><a href="#'+esc(t.id)+'">'+esc(t.title)+'</a></li>').join('')+'</ol></nav>'+rows.map(t=>'<section id="'+esc(t.id)+'"><p>'+esc(t.group)+'</p><h2>'+esc(t.title)+'</h2><p>'+esc(t.summary)+'</p>'+t.sections.map(s=>'<h3>'+esc(s.title)+'</h3>'+(s.text?'<p>'+esc(s.text)+'</p>':'')+['steps','items'].map(k=>s[k]?.length?'<'+(k==='steps'?'ol':'ul')+'>'+s[k].map(x=>'<li>'+esc(x)+'</li>').join('')+'</'+(k==='steps'?'ol':'ul')+'>':'').join('')).join('')+'</section>').join('')+'</html>';}
function markdown(core){return '# Nightlink full help handbook\n\nOffline app help and Operations guide, rc.44. Maps: miles. Heights: feet. Predictions and observations remain separate.\n\n'+allTopics(core).map(t=>'## '+t.title+'\n\n'+t.summary+'\n\n'+t.sections.map(s=>'### '+s.title+'\n\n'+(s.text?s.text+'\n\n':'')+(s.steps||[]).map((x,i)=>(i+1)+'. '+x).join('\n')+'\n\n'+(s.items||[]).map(x=>'- '+x).join('\n')+'\n').join('\n')).join('\n');}
root.NightlinkOperationsHelpData={topics,allTopics,html,markdown,esc};if(typeof module!=='undefined')module.exports=root.NightlinkOperationsHelpData;
})(globalThis);
