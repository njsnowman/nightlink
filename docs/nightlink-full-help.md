# Nightlink full help handbook

Offline app help and Operations guide, rc.41. Maps: miles. Heights: feet. Predictions and observations remain separate.

## Start here: try a location

For occasional volunteer work: compare a hill or rooftop with an existing site and keep the idea when it is useful.

### What to do

1. Open Operations and choose Try a location. Choose a saved or cached contact location, enter coordinates, or use Place existing site on the map.
2. Use Place proposed pin for the possible repeater. Enter both antenna heights in feet, the frequency and the local preview radius in miles. Optional radio details let you change power, gain, losses and ground assumptions.
3. Choose Run preview when ready. This explicitly requests terrain coordinates, or uses cached terrain only if selected. Cancel stops the preview without saving an idea.
4. Read the direct-path explanation and local predicted area results. Unknown coverage is unresolved, not a confirmed gap; predictions are not measured radio service.
5. Keep this idea saves an independent project without changing the source project. Export a simple site note to share. Neither action requires a team, dates, assignments or an installation record.
6. Return whenever you have time. A field test is optional. Use Detailed planner only for a larger study, multiple sites, repeater-gap searches or formal installation records.



### What the result means



- Inputs are drafted locally; Keep explicitly saves a restorable project. Back up saved plans for transfer to another computer. Drafts are not included in project backups.
- Saved and radio contact locations are snapshots, not live tracking. Opening or keeping an idea never configures or transmits to a radio.
- The heatmap shows the proposed site alone around its pin. Existing-site and combined results remain unresolved when a required source model is outside the supported radius.

## Optional: detailed mesh project

For a larger study, Operations separates a proposed source design from observations, approved baselines and recorded installations.

### What to do

1. Choose New project for the optional detailed planner, or open Detailed planner from a location idea. Describe the people or places you want served. Open the project to resume its first unfinished step.
2. Follow Project, Sites, Radio, Terrain & LOS, Coverage, Repeater gaps, then Review & export. A saved requirement unlocks the next step; clicking a checkbox does not manufacture completion.
3. Save inline forms explicitly. Use the required-work card to see what is missing, and Back to correct earlier inputs. The summary reflects saved inputs, not pending draft values.
4. After source planning, use Engineering studio for network alternatives and save a scenario. Deployment workspace freezes an explicitly approved scenario for installation and acceptance.
5. Use Field survey for direct observations and Verify & refine to compare evidence and plan follow-up work. Keep a complete project backup before major changes.



### What the result means



- Opening a page never configures a radio or retrieves elevation. Terrain calculations require an explicit calculation action.
- Planning readiness is not structural, electrical, regulatory or physical-radio acceptance. The application does not certify a site.

## Step 1: define the project

Set a shared area so coverage and candidate comparisons use the same study grid.

### What to do

1. Enter the project name and purpose in Project basics. Enter center latitude and longitude from a known location.
2. Enter the study radius in miles and the desired modeled coverage percentage. The supported radius is about 0.31 to 15.53 mi (canonical 0.5–25 km).
3. Save Project basics. Continue becomes available once the study area is saved. Change the area later if the service objective changes, then rebuild affected models.



### What the result means



- The area defines samples to assess; it does not claim the mesh serves everything inside its circle.
- A changed area invalidates dependent source coverage. Old records are retained but cannot count as current models.

## Step 2: plot sites and assign roles

A site is a saved location. Its role determines how the source study uses it.

### What to do

1. Choose New site / project-wide in Selected site, enter a name and known latitude/longitude, and save.
2. Assign Existing transmitter to radios already providing the baseline, Service target to a place needing service, or Proposed repeater candidate to a possible addition. A candidate cannot also be an existing transmitter.
3. At least one existing transmitter is required. Every selected role needs coordinates. The source combined study supports up to three transmitters and eight candidates.
4. Use completion Edit links or map rings to select a location. Only the right panel changes; selection does not recenter the map. Add access and power notes without treating them as a site inspection.



### What the result means



- A plotted location is a planning record, not an observed radio or an installed asset.
- Maps and horizontal distances are in miles; coordinates remain latitude/longitude.

## Step 3: set up radios and antennas

Common radio settings describe the study; individual profiles retain actual source-site assumptions.

### What to do

1. Open Project frequency and defaults. Enter frequency in MHz, antenna and receiver heights in feet, transmit power in dBm, antenna gain in dBi, losses in dB and receiver sensitivity in dBm. Save the defaults.
2. Fill missing site profiles from saved defaults only when those assumptions are appropriate. This fills missing selected profiles and preserves existing profiles.
3. Select each site and review its inline Radio form. Save its antenna AGL and RF values. AGL is height above ground, not ground elevation above sea level.
4. Leave ground elevation blank to use the terrain endpoint. If entering ground elevation, declare its datum and ensure it matches the supplied terrain reference.
5. Use Additional editing options for full editors, photographs and advanced propagation assumptions. Existing source equipment is never silently replaced by a changed default.



### What the result means



- Transmit power, antenna gain and receiver sensitivity are different quantities; keep their units unchanged.
- Changing source profiles can make predictions stale. It does not change hardware or rewrite a frozen deployment.

## Step 4: terrain profiles and line of sight

LOS and link budget answer different questions and must be reviewed together.

### What to do

1. For multiple existing transmitters, calculate the required transmitter paths. One existing transmitter has no inter-transmitter path requirement.
2. For direct service-target or custom paths, select two to eight located/profiled sites and calculate selected terrain paths. At most 28 unique pairs are prepared per batch, within the saved-path limit.
3. Inspect a path below the map. Review the sampled ground surface, antenna ray, required Fresnel zone and reciprocal terrain-aware reserve.
4. Use the explanation card to see why a path is unresolved, obstructed, Fresnel-constrained or below budget. Correct source inputs before rerunning affected calculations.



### What the result means



- Negative ray clearance means the supplied terrain samples intersect the modeled antenna ray.
- Positive ray clearance alone does not prove useful RF service. Fresnel constraints, budget, omitted clutter and real conditions can still matter.
- An obstructed or below-budget path counts as assessed work; a failed goal must not be hidden by inventing a passing result.

## Step 5: understand existing coverage

The baseline combines current source-transmitter predictions on one common study area.

### What to do

1. Generate existing-transmitter heatmaps explicitly. Wait for completion and save; cancellation, provider failure or revision conflict saves no partial model output.
2. Read the source verdict and total sampled coverage against the entered goal. Unknown positions need current inputs/models; they are not confirmed uncovered positions.
3. Use the map legend to show all samples, strong reserve, smaller positive reserve, below-budget gaps or unknown areas. A filter changes only the display, not the stored data or totals.
4. Inspect service-target results and model/source metadata. Regenerate after changing relevant area, equipment, location, receiver or propagation assumptions.



### What the result means



- Green reserve is at least 10 dB; yellow is 0–10 dB; red is below the entered budget; grey is unknown. Colors describe the model, not observed service.
- The model resamples radial estimates. It is not a measured heatmap and does not resolve every obstruction between supplied surface samples.

## Step 6: assess optional repeater proposals

Candidates are proposed study locations, not automatically approved installation sites.

### What to do

1. Review evaluated gap clusters only after current complete baseline coverage exists. Unknown cells do not become gap proposals.
2. Save a study candidate or plot a known candidate location and assign its role. Review its coordinates, access and RF profile.
3. Evaluate each selected candidate to prepare its area coverage and sampled backhaul. Compare newly covered samples, selected targets and worst-direction reserve.
4. Use before/after previews and two-site comparison to understand tradeoffs. A candidate with a below-budget backhaul remains a review item even if it adds modeled area.
5. Adding a candidate is optional. If none is selected there is no candidate-assessment requirement. Promotion into the source transmitter list is separate from freezing a deployment baseline.



### What the result means



- Gap-cluster points do not establish terrain suitability, available towers, permissions, power or real connectivity.
- The nearby-terrain tool is a bounded screening calculation, not a proof that a location is optimal.

## Step 7: review and export

Keep assumptions, unresolved work and evidence scope visible before sharing a plan.

### What to do

1. Read the plain-language review summary, saved assumptions and unresolved checks. A missing goal remains visible even when the calculations themselves are complete.
2. Export a complete project backup for restoration. Use the project HTML report, GeoJSON, CSV and installation packets for derived review material.
3. If source inputs change, return to the first unfinished step and regenerate affected models. Keep prior reports labeled as historical.
4. Use Engineering studio and Deployment workspace when ready to select, approve and install a design. Record actual conditions and field acceptance separately.



### What the result means



- Derived reports and map files do not replace a restorable complete project backup.
- Mark plan reviewed is a local planning status; it is not field acceptance or certification.

## Saving, local drafts and locked Continue

The application distinguishes saved project data from unfinished interface edits.

### What to do

1. Inline edits are retained locally per project, step and site. Switch sites or restart and return to the same form to recover them.
2. Save or Reset unsaved forms in the current step before Continue. The unsaved-edits list links back to those forms. Reset uses the current saved values.
3. If the same source fields changed since a draft was made, review the warning. The older draft cannot overwrite them; Reset before entering the intended current values.
4. For a revision conflict, keep the form and review the latest project. No partial write is committed. Save the intended correction after resolving the conflict.
5. Save drafts before exporting, transferring or clearing application data. Interface drafts are not included in project backups.



### What the result means



- A ready saved step can become stale after earlier edits. Rebuilding is required for dependent calculations, while old records remain retained.

## Map selection, legend and comparisons

The source map is a view over saved planning data, not a radio route monitor.

### What to do

1. Use Selected site, completion Edit links, or a map ring to choose a location. Enter/Space activates focused source-site rings. Site inputs are revealed inside the task panel without panning the map.
2. Use the legend filters to isolate a modeled state, then All samples to restore the complete view. Read the displayed filter label before interpreting a screenshot.
3. Expand Compare two sites and choose two different saved locations. Compare entered AGL, direct sampled LOS/budget when present, and site-only common-area predictions.
4. An entered installation estimate is shown only when recorded. It excludes unentered equipment, mast, power, labor, permits and other costs; unknown does not mean zero.



### What the result means



- Comparisons do not apply a saved equipment scenario to the source plan. Frozen approval and recorded installation stay independent.
- No direct path result is inferred from a nearby marker, a coverage overlap or a hop count.

## Terrain provider, offline cache and cancellation

Explicit calculations may need external elevations; the maps and help can be viewed without running them.

### What to do

1. Open Terrain source, model and download settings to inspect the provider and sampling detail.
2. Use cached terrain only to prevent elevation HTTP. Missing cached coordinates remain a visible error; no substitute values are invented.
3. Use force refresh only when a new retrieval is intended. Preview, Balanced and Detailed sampling increase the number of required points.
4. Cancel an unwanted calculation. Stored source models remain unchanged; completed terrain batches can remain cached for a later explicit retry.
5. For HTTP/quota errors, retain the saved plan and retry when the provider is available, or use cached data. Avoid repeatedly forcing downloads.



### What the result means



- The bundled elevation workflow uses Open-Meteo/Copernicus surface data and shared provider quotas. Source/datum/resolution metadata are recorded with calculations.
- The RF suite uses free-space plus Bullington diffraction over supplied geometry. It is not ITM/Longley–Rice, measured coverage or a simulation of actual routed mesh traffic.

## Engineering studio and saved designs

Use bounded alternatives to study networks beyond one candidate.

### What to do

1. Open Other tools and project overview, then Engineering studio. Select study sites and declare gateways/service anchors.
2. Enter goals, mast/equipment alternatives, optional entered costs and budgets. Prepare current source models or use the explicit full-study workflow.
3. Compare designs, inspect isolated/unresolved backhaul and simulate site/link/shared-power failures. A proposed RF graph is not actual mesh routing.
4. Validate assumptions and save a named immutable scenario. If source inputs change, its saved context becomes historical.
5. Export installation packets and compare alternatives. Promote a current saved scenario through an explicit named approval in Deployment workspace.



### What the result means



- The search is bounded; a reported best tested option is not proof of the global optimum.
- Missing cost or terrain remains unresolved rather than a favorable zero.

## Run full study: prepare multiple analyses in one action

This optional workflow collects required inputs before an explicit multi-analysis run.

### What to do

1. Open Engineering studio and choose the full-study setup. Enter the area, source radio assumptions, study sites, gateways and objectives.
2. Review missing-input checks and offline/refresh choices. Start the run only after the form is valid.
3. The run prepares required source terrain/coverage and network analyses with progress and cancellation. Inspect the report for assumptions, unresolved data and bounded-search limits.
4. Save/export the completed study and retain a full project backup. A canceled or failed run does not save partial study models.



### What the result means



- Full study does not install equipment, configure a radio or create observed field outcomes. It does not remove the need for field acceptance.

## Field survey: record direct observations

Reported field points are evidence at a declared location and setup, not area-wide coverage.

### What to do

1. Open Field survey. Choose a direct path, target or other point and explicitly obtain device location, choose a map point or enter manual coordinates.
2. Record time, observer, frequency, receiving position/height, heard/intermittent/not-heard outcome and measured values when available.
3. Confirm actual position and direct setup. Forwarded packet RSSI is not a direct endpoint measurement.
4. Review model-versus-observation state and retained snapshots. Changed source setup can make an older comparison stale without deleting the observation.
5. Export survey data/report for review; retain a complete project backup to preserve restorable history.



### What the result means



- A device location request can be denied or unavailable. Use an explicit manual/map fallback and keep its provenance.
- Do not record synthetic or inferred outcomes as physical-radio evidence.

## Verify & refine and change checkpoints

Prioritize missing evidence and evaluate explained improvements without overwriting history.

### What to do

1. Open Verify & refine to inspect the field-test queue and associated source predictions.
2. Use the point evidence map to distinguish model rings from observation centers. Unknown/stale context remains visible.
3. Evaluate mast what-if options before changing equipment. Reported improvements depend on supplied geometry and assumptions; they are not guaranteed field gains.
4. Record per-site deployment reviews with named evidence. Saved context changes make a review historical.
5. Capture a project checkpoint before a meaningful change. Compare current versus prior settings/fingerprints and modeled results where the result bases are comparable.



### What the result means



- Checkpoints are compact history, not complete restore points. Use a full project backup for restoration.
- Associated input changes are not proof of an isolated physical RF cause.

## Deployment: approve, install, test and hand over

A deployment freezes a design and retains independent execution records.

### What to do

1. Approve baseline: choose a current saved engineering scenario, name the approver and explicitly confirm the freeze. Later source edits do not rewrite it.
2. Site work orders: record owners, access, equipment/quantities, dates and tasks. Complete work requires an owner and checked tasks.
3. As-built records: enter actual coordinates, equipment, frequency, AGL/ground reference, gear and evidence notes. Confirm the actual installation; approved values are only a starting point for review.
4. Field acceptance: review criteria and record direct test outcomes, observer, actual setup/location, attempts/successes and required measurements. Missing, failed or changed-context results remain incomplete/stale.
5. Punch list: resolve underlying generated issues and provide evidence for manual resolutions. Review installation differences.
6. Handover: explicitly record the operator after required work/tests and punch items are satisfied. Later deployment-context changes mark older handovers historical.



### What the result means



- Installation entry is available before acceptance testing because test setup depends on the actual installation. The workspace is not a claim that hardware has been installed.
- A source site can be removed while its approved/installed history remains inspectable. Do not replace a historical deployment merely to hide a failed test.

## Command Center and change impact

Use the overview to coordinate saved source planning and a selected deployment.

### What to do

1. Open Command center. Select the intended deployment explicitly when there are several. Source plan only is a separate context.
2. Use Overview for prioritized attention, Selected site for source/approved/installed comparisons and Change impact for missing/stale models and historical records.
3. Recalculate affected source models explicitly. Eligible raw terrain and current models can be reused; changing source models does not renew field observations, scenarios, installations or handovers.
4. Use the linked existing editor to address the underlying item. Guided source shortcuts still enforce required saved prerequisites.



### What the result means



- Removing a saved deployment selection does not silently switch to another deployment.
- A current installed handover can remain current even when the independent source plan changes.

## Backups, reports and sharing

Choose the export that matches your purpose and save unfinished work first.

### What to do

1. Use a complete Operations/project backup for restoration and transfer. The current format is 8 and imports support earlier formats 1–8.
2. Use HTML reports for offline reading/printing, GeoJSON for geographic review and CSV for derived sample tables. Individual deployment JSON is a reference export; restore through the complete project backup.
3. Save interface drafts before export. Checkpoints and downloaded reports do not contain every raw model/history needed to restore a project.
4. Review names, coordinates, notes and evidence before sharing files. Keep a separate backup before deleting local projects or old deployment records.



### What the result means



- Canonical model/backup data retain SI units internally. User-facing map distances use miles and heights/elevations use feet.
- Opening a report does not contact the radio or prove the displayed outcomes were physically measured.

## Troubleshooting: locked steps and missing results

Use saved requirements and error details to locate the actual missing work.

### What to do

1. Continue locked: inspect required items and unsaved-forms links. Save or Reset pending edits, assign an existing transmitter and fill missing selected coordinates/profiles.
2. Coverage became unknown: compare area, source location/RF profile, mobile receiver and propagation assumptions. Recalculate affected models; a marker on the map alone is not a current prediction.
3. Terrain stale: endpoint geometry changed. Retrieve/import current endpoint terrain or use a matching cache; keep historical snapshots separate.
4. Datum/ground mismatch: review the declared ground reference and terrain endpoint. Leave ground blank to use the supplied terrain endpoint when appropriate; do not change a value just to obtain a green result.
5. No site-only comparison: prepare current coverage for that site. No direct LOS comparison: calculate the intended pair explicitly.
6. Conflict/stale draft: retain the intended edit, review the new saved source and use Reset before entering current values. A failed save does not overwrite stored records.
7. Blank basemap: the external street-map feed may be unavailable. Plotted source data, scale and offline help remain useful; do not infer that the radio or model has failed.



### What the result means



- For a bug report, include version, exact steps, saved error and a minimal synthetic example where possible. Keep physical-radio evidence separate from simulated tests.

## RF glossary in plain language

Use the terms to interpret inputs and results without changing their meaning.

### What the result means



- AGL: antenna height above ground. MSL/ground elevation: height of the ground surface relative to a named reference datum. They are not interchangeable.
- Datum: the vertical reference used by an elevation source. Matching numeric heights with different reference systems can still describe different surfaces.
- LOS (line of sight): whether the modeled antenna ray clears supplied terrain samples. It says nothing by itself about available radio margin or unsampled obstructions.
- Fresnel zone: a region around the direct ray relevant to propagation. Required-fraction clearance can be constrained even when the central ray is clear.
- dBm: power relative to one milliwatt. dBi: antenna gain relative to an isotropic reference. dB: a relative gain/loss or margin, not a power unit by itself.
- Receiver sensitivity: the entered receive threshold. Required margin: extra budget reserved above that threshold. Reserve: remaining modeled allowance after the entered requirement; negative is below budget.
- Backhaul: the studied RF connection between a proposed addition and the source network. A modeled connection is not an observed forwarding route.
- Unknown: missing, stale or incompatible inputs prevent a current result. Gap: evaluated below-budget area samples. Unknown is never a confirmed gap.
- Scenario: a saved modeled design. Frozen baseline: an explicitly approved snapshot for a deployment. As-built: a manually recorded actual installation. Observation: a declared point test with setup/location provenance.

## Offline Contact Book and planning locations

Keep selected mesh identities and personal notes independently of the radio.

### What to do

1. Open Contact Book from the main navigation. Save selected radio contacts or create a new personal entry; unsaved radio contacts are not automatically added.
2. Enter personal name, alternate display name, call sign, address, notes and optional photograph. Link full mesh identities explicitly. Personal labels do not rename advertised senders in chat.
3. Use Map for known stored locations and their source/time. Addresses are not automatically geocoded, and a previous location does not prove present occupancy.
4. Use Activity for prospective observations while the app is open. Channel-name matching is explicitly unverified; a matching display name is not proof of identity. Loading old history does not manufacture observations.
5. Export book for its separate backup, including personal data and activity. Workspace/project backups do not include this independent database. Deleting a radio contact does not delete a saved book entry.
6. When copying a known location into Operations, review the planning snapshot and its age. A copied point is not a terrain calculation or a confirmed installation.



### What the result means



- Adding an identity back to a radio is an explicit radio-write action; viewing or exporting the book does not issue that action.
- Only saved identities receive prospective book activity. This is not an always-on presence detector or a complete transmission history.

## Worked example: assess a proposed repeater

This fictional sequence illustrates the workflow without claiming actual RF performance.

### What to do

1. Create a project for an existing base and a neighborhood needing service. Save a 1.24 mi study radius using known center coordinates.
2. Plot the existing base and service target, assign their roles and enter the intended source radio frequency and antenna/receiver heights in feet.
3. Generate baseline coverage and inspect the result. If grey areas remain, resolve missing/stale inputs before treating red samples as modeled gaps.
4. Save a candidate at a plausible known location and explicitly evaluate its coverage and backhaul. Compare the base and candidate using the same study area; unknown entered costs stay unknown.
5. If the candidate helps the model but its backhaul is below budget, inspect the path and assumptions rather than promoting a favorable coverage percentage as a proven design.
6. Save an evaluated design scenario, approve a deployment only after review, then record actual installation and direct field acceptance separately.



### What the result means



- The example radius is a presentation example, not a recommendation for a real project. No terrain, cost, height or reception result is guaranteed by following it.

## Radio workbench and message paths

Six radio tools, public identity and path evidence.

### Trace Path

Open Radio, select a repeater by name and review the forwarding sequence before sending. Advanced accepts one-byte hashes. Omit your own companion from forwarding hops. Queue acceptance is separate from a returned trace. The reply deadline is bounded to 30–120 seconds; there is no automatic retry.





### Other tools



- Line of Sight calculates offline geometry from coordinates, antenna heights and frequency. It does not check terrain, buildings or actual coverage.
- RX Log shows passive firmware observations. RSSI/SNR describe the final received link, not every repeater.
- Noise Floor explicitly reads the companion statistic on protocol 8+; it does not send a mesh test packet.
- Discover Nodes requires Search nearby to transmit a zero-hop request. The scan lasts seven seconds with a sixty-second cooldown; results are not automatically saved or trusted.
- CLI targets the companion or an authorized remote node. General local commands require protocol 14+; older firmware supports limited reads. Remote administration requires compatible firmware and login.

### Copy public ID

Open Radio and select Copy public ID, or use shared-contact export. Copy the full 64-character public key; selectable text is available if clipboard access fails. Compare full keys through a trusted channel. Never share private keys, channel secrets or authenticator setup material.





### Message paths

Select the hops badge to open numbered repeater cards and the map. Consecutive located hops animate in order; Replay path repeats the presentation. Reduced motion suppresses animation. Unknown locations remain gaps. This illustrates stored route evidence, not live packet tracking.





### Chat indicator lights

The Signal Rail above channel chats and DM windows shows LINK, RX, TX, ACK and FAULT. LINK means your local radio is ready, not that a peer is online. RX briefly lights for a new incoming message and remains independent of TX/ACK, so echo replies can light RX while sending is still finishing. Each new reply extends the indication. TX pulses while queued, sending or retrying. ACK pulses amber while awaiting a direct-message acknowledgment, turns green after a recipient acknowledgment, and remains amber when delivery is unconfirmed. A channel broadcast lights TX green only after acceptance by your own radio. Explicit radio rejection lights FAULT red. Saved history and synchronization do not replay receive flashes. Transient feedback returns to standby; reduced motion keeps the indicators steady.





### Sending feedback

Awaiting recipient ACK shows a rotating indicator while a DM attempt is active. It stops when the attempt completes; it does not indicate delivery progress. Settings > Notifications > Sent message sound controls the short completion cue. DMs sound only after a recipient ACK; channel broadcasts sound after acceptance by your own radio, which does not confirm reception. Direct-message sound off also silences DM completion, and quiet hours silence all completion cues. Reduced motion disables the rotating indicator.





### Mention alerts

Exact mentions of your current radio name receive a Mentioned you badge. Simple @name and bracketed @[multi word name] forms are supported. Settings > Notifications includes mention sound and Test mention sound. Muted conversations, quiet hours, your own messages, duplicates and recovered history do not trigger a new alert.





### Validation scope

A returned direct trace through one repeater was physically confirmed on the recorded Heltec USB setup. Earlier timeouts remain unexplained and multihop reliability is unverified. Consult the release notes for installer and optional-lock validation limitations.





## Start here

Connect a radio, choose a channel and send your first message.

### Connection confidence

The top-right radio button distinguishes Connected (link established), Catching up (reading the retained queue), Synchronizing (loading radio data) and Ready (full synchronization completed). Its second line shows the last successful full synchronization in this app session. After an error or disconnection, Last sync describes earlier success, not the current connection. A completed queue check cannot recover messages already collected by another client or no longer retained by the radio.





### Activity inbox

Select Inbox in the top toolbar for unread direct messages, exact mentions of your current radio name and outgoing messages needing review. Filter by All, DMs, Mentions or Outbox. Outbox lists active and unconfirmed outgoing messages. A mentioned DM appears once in All and is available in both relevant filters. Muted conversations are included and labeled. Opening the list does not mark messages read or retry sends; selecting an entry opens the original saved message. Existing delivery controls remain the only way to retry. The inbox follows the connected radio identity.





### Your first session

1. Install Nightlink using the Windows Setup download. The portable build runs without installing; keep using the same Windows profile to retain local data.
2. Power on a MeshCore companion radio. For Bluetooth, disconnect phone apps or other clients using that radio. For USB, use a data-capable cable and USB companion firmware.
3. Select Connect radio in the top-right corner. Choose Bluetooth or USB, then choose your radio.
4. Allow synchronization to finish. The connection window closes automatically and opens Overview.
5. Open Messages. Channels comes first, followed by Direct messages. Choose a channel, type a short message and select Send.



### Know the five main destinations



- Overview: recent channel messages, connection summary and live mesh map, separated by a resizable divider.
- Messages: channels, direct conversations and message search.
- Network: CoreScope, your Radio map and the configured MeshMapper region.
- Contacts: saved radio contacts, personal contact cards and nearby discovery.
- Radio: your companion details and grouped cards for Device & setup (Device Center, Radio Tools, Command terminal), Routes & discovery and Observe & diagnose.

### Resize Overview

1. Drag the divider between messages and the map, or focus it and use the Left and Right arrow keys.
2. Home and End move to the limits. Enter or a double-click restores the balanced split.



### Before going offline

Connect once, confirm your channels and contacts, export a backup and import an offline map for your area. Internet maps, image links, page previews and update checks require internet access. The radio link itself does not require internet.





## Connect with Bluetooth

Find your companion radio and understand synchronization.

### Connect

1. Keep the radio powered on and close to the PC. Close other apps connected to it, including the phone client.
2. Select Connect radio, then Bluetooth and Find Bluetooth radio.
3. Choose the correct device. Complete any Windows pairing prompt shown by the device.
4. Wait while Nightlink reads identity, retained queued messages, channels and contacts. When ready, it enters Overview automatically.



### If connection fails

Check power, Bluetooth availability and distance. Confirm another client has not reconnected. Retry manually after an error. If the radio is connected but synchronization stopped, use Radio Health to review the current activity and latest error before refreshing.





### Important distinction

Connected describes the transport. Synchronization can still be working or fail afterward. Check the current status rather than assuming every message is loaded as soon as Bluetooth connects.





## Connect with USB

Use the correct cable, serial port and companion firmware.

### Connect

1. Use a USB data cable, not a charging-only cable. Connect the radio directly to the PC when troubleshooting.
2. Confirm the device runs MeshCore USB companion firmware. A board being visible as a serial port alone does not establish protocol compatibility.
3. Close serial terminals and other applications using its port.
4. Select Connect radio, choose USB, then select the matching device or COM port. Wait for synchronization and automatic Overview entry.



### Radio did not respond

Check the cable and firmware variant first, then Windows device/port availability. Do not flash firmware merely to test an uncertain port. A Bluetooth companion build may expose USB for other purposes without acting as a USB companion.





### Switch transports

Finish active sends and disconnect the current transport before choosing another radio or transport. A radio’s local history is associated with its public identity, not its display name.





## Reconnect & missing history

Understand what the radio can and cannot return after a gap.

### Automatic connection

1. Connect and synchronize your radio successfully once.
2. Open Settings > Connection and enable the startup connection option if you want Nightlink to try the remembered radio.
3. Keep the radio powered on and available. Windows permissions and exclusive access still apply; reconnect is not guaranteed when another client owns the radio.



### Messages after reconnecting

Nightlink drains messages that the companion still retains in its pending queue. It also loads history previously saved by Nightlink on this computer. A completed sync means the current pending queue reported empty; it does not mean the radio has a permanent archive of every message.





### If the phone already read them

Another client can consume pending messages. Messages visible in the iPhone app may now exist only in that app’s local history. Refresh cannot reconstruct messages no longer retained by the companion. Keep a backup of each app’s history; do not assume all clients share an archive.





### Check a suspected gap

1. Open Radio > Radio Health. Compare the last successful synchronization, queue frames fetched, locally saved count and latest error.
2. When connected and idle, select Refresh radio data. Avoid repeatedly refreshing during an active synchronization.
3. Confirm the selected channel and the correct radio identity. Search stored history if the conversation contains older messages.
4. Export the diagnostic log for support. Describe whether another client connected and whether the radio restarted.



## Channels & message actions

Read, reply, inspect hops and open a sender’s contact card.

### Navigate Messages

1. Select Messages in the sidebar. It opens Channels.
2. Choose your channel using the channel controls. Direct messages is the second primary destination.
3. Use More for Search messages, Browse conversations or Add channel. Less-used actions stay out of the main tab row.



### Three click targets



- Message body: prepares a reply. Channel replies can insert the sender mention. Review the composer and select Send yourself.
- Hops badge: opens available route information and the message path map. Missing repeater identities or locations cannot be reconstructed; a hop count is not a complete geographic trace.
- Sender name or avatar: opens the contact card, including Send message for a direct conversation.

### Latest messages and older history

Opening a conversation shows the latest messages unless you deliberately scrolled into older history there; Nightlink then returns to that reading position, in the main window and detached DM windows. Incoming messages follow the bottom while you are reading the latest. Select Jump to latest ↓ to return. Large histories use bounded rows and paging rather than mounting every saved message.





### Received reactions

Supported MeshCore One reactions appear as emoji chips beneath a uniquely matched original message. A reaction whose original is missing or outside the current page appears as a separate notice; Reaction details shows its original wire text. Ordinary messages are preserved. Nightlink does not send reactions through this feature.





### Reply context

The reply preview is local context, not a new MeshCore threading protocol. Check the actual text and byte count before sending. Clicking a message does not transmit by itself.





## Add a channel

Create or join a channel and verify it on the companion.

### Create or join

1. Connect and finish synchronization.
2. Open Messages > Channels > More > Add channel. Add channel is also available in Radio Tools.
3. Enter the channel details requested by the form. Use the exact agreed hashtag name or shared channel key for your group.
4. Submit Add channel to radio. Nightlink chooses an available slot and reads back the configuration to verify it.
5. Select the new channel from the channel controls. Other participants must use matching channel settings.



### A name alone is not delivery proof

Channel messages are broadcasts. Radio acceptance confirms that the companion accepted the send, not that every member received it. Channel configuration and available slots depend on companion firmware.





### Keep shared keys private

Anyone with the group’s shared channel material may be able to participate. Do not post private channel keys in public support issues or screenshots.





## Direct messages & alerts

Start a DM from a sender or saved contact and manage notifications.

### Start a direct conversation

1. Click the sender name/avatar in a channel, or select a saved companion in Contacts.
2. Select Send message on the contact card. A resolved saved companion opens directly.
3. If Nightlink cannot uniquely identify the sender, choose or import the correct public-key contact first. A channel display name alone is not authenticated identity.
4. Write your message in the DM window and select Send. A desktop DM opens its own window; it should not also replace the underlying channel view.



### Incoming alerts

Configure desktop notifications, DM sounds, mention sounds and quiet hours under Settings > Notifications. Windows notification permissions and system volume also apply. Quiet hours can suppress sound, notifications and automatic DM windows while messages and unread counts continue updating.





### Delivery states

Acknowledged by recipient means the recipient radio returned an acknowledgement; it does not prove a person read the message. Failed or unconfirmed means no qualifying confirmation was recorded. The message may still have arrived if the return acknowledgement was lost.





### Contact missing on the radio

A connected Bluetooth/USB link does not guarantee that a previously saved contact still exists in the companion. If the radio removes or replaces that entry, Nightlink keeps your messages, notes and draft but disables sending to it. Import the shared contact again before retrying. A send rejected before radio acceptance is labeled Not sent; earlier accepted attempts without an ACK remain unconfirmed. At capacity, firmware may replace an old non-favorite contact according to its configured policy.





### Retry with context

Open Delivery details to inspect recorded attempts before retrying. The open Message delivery dialog updates as attempts, recipient ACK or an unconfirmed result arrive. Cancel remaining attempts stops further automatic attempts; an attempt already sent can still arrive. A retry can produce duplicates if the first message arrived without its acknowledgement. Retry and route behavior depend on the existing radio path and firmware.





## Mentions, images & links

Mention a person and understand internet-dependent previews.

### Mention a user

1. In a channel composer, type @ and begin the person’s name.
2. Choose the intended suggestion and review the inserted mention.
3. Send when the text is correct. Matching names alone do not verify a person’s public identity.



### Image and page previews

Supported HTTPS image links can show an image, and supported page links can show a small page preview. These load through internet services; the image/page content is not sent as an image over the LoRa mesh. The message carries the URL text.





### When previews do not appear

Check internet access and Settings > Data & updates for preview preferences. A site may block preview fetching or supply no useful image. The original URL remains the reliable way to open the page. External sites can receive network requests when previews load.





### Message size

The composer counts encoded bytes, not just visible characters. Emoji and non-English characters can use multiple bytes. Long links can consume much of a short radio message.





## Contact cards & identity

Save a local nickname, photo and notes without changing the radio name.

### Personalize a card

1. Open Contacts and search by name, nickname or public key. Filter by node type when useful.
2. Select a contact to open its card. Use the Contact options menu (⋯), then Edit contact.
3. Enter a nickname, choose a JPG/PNG/WebP photo and add notes. Photos must be smaller than 10 MB; Nightlink crops them for the local card.
4. Save the contact card. The nickname/photo can appear beside messages resolved to that contact. These details stay on this computer.



### Relevant card details

The card can show last received message, last advert, stored outbound route and saved message count. An old advert is not evidence that a radio is currently reachable. Radio identity and personal editing are in the secondary options menu.





### Compare a public key

Use the contact’s Compare public key action and compare it with the person through a separate trusted channel. The local record means you compared that key; it does not authenticate every channel message carrying the same name.





### Remove a contact from the radio

1. Connect and finish synchronization.
2. Open the contact card, select the Contact options menu (⋯), then Remove from radio.
3. Read the confirmation and select Remove from radio, or Back to contact to keep it.
4. Nightlink sends the removal and confirms with an exact-key lookup that the contact is gone. Saved messages, nicknames, photos, notes and favorites stay on this computer. Import the contact again before sending it a DM.



### Remove all except favorites

1. Mark the contacts you want to keep as Nightlink favorites.
2. Open Contacts, or Radio > Radio Tools, and select Remove all except favorites.
3. Review contacts to remove and Favorites to keep. Tick the acknowledgement, then select Remove non-favorites.
4. Contacts are removed one at a time and each removal is verified. Stop after current contact ends the run safely. Contacts discovered after the preview are left alone.



### Share and import contacts

Radio Tools can export a signed contact advert as a link/QR and import supported adverts. The shared advert may include location according to the radio data. Local nicknames, contact photos and notes are not included.





## Discover nearby nodes

Run a manual direct-range scan and review signal readings.

### Search nearby

1. Connect a companion using protocol 8 or later and let synchronization finish.
2. Open Contacts > Discover nodes, or Radio > Radio Tools > Discover nodes.
3. Choose a node-type filter and select Search nearby. A request is sent only when you start the scan.
4. Review replies during the seven-second listening period. Stop ends listening. Wait for the sixty-second cooldown before another scan.
5. Open an existing contact or choose Add contact for a new full public key. Review and submit the add form explicitly.



### What the results mean

Discovery is direct-range and is not forwarded by repeaters. Only responding, compatible radios appear; an empty result is not proof that no mesh exists. Local RX SNR/RSSI describe reception of a response, and remote SNR is the value reported by that node.





### Identity limits

Discovery replies do not provide a verified person’s name or location. Exact saved keys can use your existing card name; unknown keys remain identified by type/key. Results are not automatically trusted or added.





## CoreScope, Radio map & MeshMapper

Choose a map provider and understand live data, centering and fallback.

### Choose the right view



- CoreScope: internet-hosted live mesh observations. Page load and live packet availability are different states.
- Radio map: local contact locations and supported local points; street tiles require online access or an installed offline pack.
- MeshMapper: regional internet coverage map. Region is a saved local preference rather than your radio configuration.

### Location and zoom

Use Recenter and allow Windows location access when prompted. Radio-advertised location and PC location can differ. Without usable coordinates, the app uses its fallback view. Embedded providers control which layers, markers and data are available.





### MeshMapper region

1. Open Settings > Data & updates and find the MeshMapper region preference.
2. Enter the supported region code for the intended map, such as CVG or IND, and save.
3. Return to Network and select MeshMapper. If the provider has no map for that code, use an existing supported region.



### Offline or stalled live packets

Remote maps require internet and their own service availability. Nightlink can fall back to the local Radio map when remote access fails. A loaded CoreScope page saying waiting for packets does not prove the embedded feed is live. Reload the provider and compare the full provider site if needed; do not repeatedly reconnect Bluetooth to fix an internet map.





### Map visibility

Open Settings > Data & updates > Map visibility and turn Show CoreScope or Show MeshMapper on or off. Hidden providers are unloaded and stay hidden after restart. The local Radio map stays available, including in #echo.





### The #echo workspace

Selecting #echo shows Chat, Map and Split buttons and the command conversation beside CoreScope. In Split, drag the divider or use the Left and Right arrow keys, Home and End. The !test, !spam, !echo and !yolo buttons send that command to #echo immediately and keep your composer draft; they are available only when the radio is ready and not busy. Seeing a burst depends on a receiver reporting that traffic to the provider; a visible map alone does not confirm your message was observed.





## Prepare offline maps

Install coverage before losing internet access.

### Install a permitted map pack

1. Open Tools > Diagnostics, choose Maps, then Import offline map pack.
2. Choose a supported raster MBTiles or Nightlink JSON map pack from a provider that permits offline storage.
3. Allow validation/import to complete. Use Show downloaded area to inspect its bounds and zoom range.
4. Test the Radio map in the intended area before leaving internet coverage.



### Coverage has limits

A rectangular coverage outline can contain gaps. Imported tiles only cover their included area and zoom levels. Outside coverage, Nightlink reports missing coverage instead of inventing streets. CoreScope and MeshMapper do not become offline services when the local map takes over.





### Keep map and message backups separate

A normal Nightlink history/preferences backup does not replace the source offline tile pack. Keep the original permitted map file so you can reinstall its coverage on another computer.





## Read a message path

Use readable repeater cards, a street map and explicit path evidence.

### Open the path

1. Select the hop badge beside a message. Selecting message text instead opens reply context.
2. Read the reception count and whether a matching route packet was captured. A hop count alone cannot identify repeaters.
3. Use the large numbered cards to review forwarding order. Select a located hop to center its stored position on the map.
4. Scroll the repeater pane if the route is long. Escape closes the path window.



### Interpret gaps and signals

Unknown repeaters, ambiguous short hashes and missing advertised coordinates remain explicit. Lines are not drawn across missing hops. Reception SNR/RSSI describes the message at your radio, not individual repeater links. Outgoing messages do not report the receiving path. Positions use latest stored advertisements, not verified live locations.





### Offline street maps

The dialog uses the same street-map and permitted offline tile-pack support as Radio map. Import regional offline coverage before disconnecting from the internet; missing tile coverage cannot be invented. A displayed message path is retained evidence, not a new trace request.





## Radio workbench, adverts & CLI

Trace routes, plan offline geometry, inspect reception and administer nodes.

### Radio workbench

Open Radio for Trace Path, Line of Sight, RX Log, Noise Floor, Discover Nodes and CLI. The grouped cards on the Radio page (Trace a route, Plan line of sight, Find nearby nodes, Receive log, Noise measurement) open the same tools. Selecting a tool does not transmit. At compact window sizes the workbench takes the available width; its content scrolls inside the pane.





### Device Center

1. Open Radio > Device Center, or Radio Tools > Device Center. Opening it sends nothing.
2. Choose the Device: Connected companion, a saved repeater or room (then enter its Password and select Log in), or Direct USB setup.
3. Select Inspect settings. Optional infrastructure settings are read only when you select Read selected setting.
4. Edit values, then Review staged changes. Check the full target key and every change before Apply reviewed changes.
5. Nightlink reads each setting back after writing it. Export inspected settings saves a file; Stage settings file fills the form and warns when the file came from a different or unidentified device.



### Device Center limits

Remote repeater/room changes require an administrator login reported by the device. Radio parameter changes can separate a radio from the network and usually need a separate reboot to take effect. Direct USB setup, remote RF changes and roles other than the tested companion and repeater are not yet verified on hardware.





### Trace Path

1. Choose a repeater by name and review its visual outbound/return route. Open Advanced only to enter a custom one-byte hash sequence.
2. Review the route, including the return relays but omitting your companion hash, then select Send trace.
3. Wait for a matching tagged reply. Acceptance means queued by the companion, not confirmed RF transmission. The reply deadline begins after acceptance and uses the firmware estimate, bounded to 30–120 seconds. There is no automatic retry.
4. Results show SNR for reported hops. Hashes may collide and do not verify a repeater identity. This tool currently supports one-byte hashes only.



### Line of Sight offline

Enter both endpoint coordinates, antenna heights above ground and frequency. Calculate distance, bearing, geometric horizon and midpoint first-Fresnel radius without internet access. These are geometric estimates only: terrain elevation, buildings, trees, elevation differences and atmospheric refraction are not checked. A calculated path is not confirmed reception or terrain clearance.





### RX Log and Noise Floor

RX Log updates from firmware-reported receptions and displays the latest 100 retained observations without packet payloads. Empty observations do not prove a failed link. Noise Floor reads the radio statistics subtype manually over Bluetooth or USB and requires companion protocol 8+. It is a reported noise measurement, not an estimate from message RSSI.





### Discover Nodes

1. Select Discover Nodes, then Open node discovery.
2. Select Search nearby when ready to send a direct-range search.
3. Review responding public identities before adding contacts. A zero-hop search is not forwarded by repeaters; no responses do not prove that the network is empty.



### Advertise your radio

1. Open Radio > Radio Tools.
2. Choose Local advert for direct nearby reception, or Flood advert for possible repeater forwarding within configured scope.
3. Review the information that will be advertised, then confirm Send advert.
4. Radio acceptance means the companion accepted the command. It does not confirm reception elsewhere. Manual adverts have a ten-second limit and no automatic retry.



### CLI Terminal

1. Open Radio > Command terminal, Radio Tools > CLI Terminal, or the workbench CLI tab > Open CLI terminal.
2. Choose the intended target. Remote administrative access requires a compatible node and its permissions/login.
3. Read the terminal’s command help and inspect read-only information first.
4. Review any setting-changing command before sending. The node firmware determines accepted commands and permissions.



### Not a general PC shell

The CLI administers supported radio/node functions. It is not a Windows terminal, and companion transports do not implement every repeater command locally. Do not assume a command from a different firmware or device is supported.





## Radio Health & diagnostics

Inspect sync evidence and collect a useful support report.

### Mentions of your radio

Messages with an exact mention of your current radio name have a contrasting border and Mentioned you label in channels, Overview and direct messages. Multi-word names use bracketed mention syntax. Matching is case-insensitive and does not match a longer similar name. Visual emphasis applies to retained messages too; mute, sound, notification and read settings do not change.





### Radio status panel

Open Radio to see connection/synchronization activity, last successful full sync in this app session, new incoming messages added during that sync and fetched queue frames. Frames may be duplicates or command replies; zero new messages means none were added, not that no traffic occurred while disconnected. Refresh and Reconnect are enabled only when appropriate; Diagnostics opens retained local evidence. Details opens the full Radio Health view. A history write failure is shown separately from successful queue checking.





### Inspect the session

1. Open Radio > Radio Health, or Settings > Connection > Open Radio Health.
2. Read current activity, uptime, reconnections, last successful synchronization and latest error.
3. Compare queue frames fetched with locally saved messages. Counts can include duplicates or command responses.
4. Use Refresh radio data when connected and idle, or Reconnect radio when disconnected.



### Support report

Select Support report in Radio Health or Diagnostics, review report contents, then Save support report. It is a local file with app version, connection status, counters, error categories and timings; it excludes message text, names, keys and channel secrets. Nothing is uploaded.





### Export a diagnostic log

Use Export diagnostic log in the Radio controls. Include your Nightlink version, radio model/firmware, Bluetooth or USB, the time the problem occurred and exact error text in a support report. Check any exported file before posting it publicly; do not include message backups, passwords or keys.





### Performance and evidence

Session timing records distinguish connection, queue recovery, contacts and telemetry. Map timings measure page load, not a live feed. Replay/diagnostic observations describe data Nightlink actually recorded; they do not prove unseen radio traffic or hardware behavior.





## RF Propagation Monitor

Passively compare reception with this radio’s history and see unusual reception.

### What it does

The monitor observes receive events already arriving at the connected radio and compares them with that radio’s own history. It runs on this computer only. It never transmits, never changes radio settings and does not need the internet. Alerts mean reception is unusual; they do not confirm a propagation event.





### Open it

1. Open Radio and select Propagation Monitor under Observe & diagnose, or select the compact indicator beside the connection control.
2. Read Current status, Evidence, Reception trend, Recent observations and Event history.
3. Unknown means the value could not be measured, for example a distance without verified coordinates.



### Learning and states



- Learning baseline: at least 24 connected hours are needed before detection starts. Time while Nightlink is closed or the radio is disconnected does not count as quiet reception.
- Normal: reception matches this radio’s recent history.
- Possible RF opening (amber): several receptions are unusual compared with this radio’s history.
- Strong RF anomaly (red): strong, sustained unusual reception.
- Monitoring unavailable or Monitoring disabled: no radio is connected, or the monitor is turned off.

### Evidence it uses



- New or rarely received stations.
- SNR change compared with the same station and route.
- Unusual direct receptions, only when both locations are verified.
- Unusual reception that lasts at least 20 minutes, not a single burst.

### Settings

Open Settings > Notifications > RF propagation monitor. Choose Enable monitoring, Alert sensitivity, Baseline period (14, 30 or 60 days), Show status indicator, Alert animations, Alert sound and Windows notification. Alert sound and Windows notification are off by default; Reduced motion settings always turn animations off. View recent alerts, Clear alert history, Reset baseline… and Clear monitor data… are also here.





### Limits



- Full signal readings need radio firmware that sends RX log data. Without it, monitoring is limited.
- Antenna changes and busy local traffic can cause false alerts. Reset the baseline after changing antennas.
- This feature is experimental. Thresholds have not yet been validated on real traffic.

## Back up & restore

Save local history, cards and preferences before changing PCs.

### Export

1. Open Settings > Data & updates > Backup and restore.
2. Select Export backup and choose a private location.
3. Confirm the file was saved. Keep another protected copy before reinstalling, clearing app data or moving to a new computer.



### Restore

1. Finish active sends and disconnect your radio.
2. Choose Preview a restore and select a Nightlink backup JSON file.
3. Review counts for new messages, duplicates, cards and skipped entries before confirming.
4. Select Restore and reload. Existing cards/preferences are kept, duplicate messages skipped, and incoming history is subject to the per-radio capacity limit.



### Sensitive local file

Backups are unencrypted and can include private messages, contact photos, notes and preferences. Treat the file as private. A restore changes local data only; it does not configure the radio or resend messages. Other radio histories appear when that radio is selected.





### Interrupted restore

If Nightlink offers Recover interrupted restore, use it before importing another file. Do not edit the app’s database files manually while it is running.





## Startup lock & privacy

Set up a password and authenticator without mistaking it for history encryption.

### Enable the optional lock

1. Open Settings > Security.
2. Start setup and choose the requested password.
3. Add the displayed authenticator QR code or setup key to your authenticator app.
4. Save the one-time recovery codes separately from this PC. Confirm with a fresh six-digit code to enable the startup lock.



### At the next launch

Use your password plus a fresh authenticator code, or a permitted one-time recovery code. Previously used authenticator codes can be rejected. Keep the PC clock accurate. Recovery codes do not remove the need for the password.





### What the lock protects

The startup lock controls entry to Nightlink. It is not full-disk encryption and does not make message databases or exported backups encrypted. MeshCore radio encryption and shared/private identities are separate from this local startup feature.





### Screenshots and public support

Hide private messages, channel material, contact notes, location and authenticator secrets before sharing screenshots. Nightlink’s guide screenshots use fictional demonstration data, not an actual radio session.





## Appearance, compact mode & tray

Adjust readability, accents, window size and background behavior.

### Make it readable

1. Open Settings > Appearance to choose the display scheme, accent and text size.
2. Use the header Compact/Expand control for the workspace density you prefer.
3. Enable reduced motion if you prefer minimal animation.



### One bounded workspace

Nightlink opens maximized. Long message histories, contact lists and this guide scroll inside their content panes. The application frame should remain within the window. Increasing text size or Windows scaling reduces how much content fits at once.





### Close versus Quit

Background/tray preferences are under Settings > Notifications. Closing a window can leave Nightlink running depending on those preferences. To release the radio, use the tray Quit Nightlink command or the explicit quit control and allow active sends to settle. Avoid ending the process while it is saving or sending.





## Install & check for updates

Download the matching Windows build and understand candidates.

### Check

1. Open Settings > Data & updates > Nightlink updates.
2. Select Check for updates. Enable the optional checks-while-open toggle for a check after about thirty seconds and every six hours.
3. When a newer stable version is offered, choose Open download. Setup installations select Setup; portable clients select Portable when available.
4. Export a backup, quit Nightlink cleanly and run the downloaded installer. Reopen and confirm the version in Help & About.



### Downloads are not automatic installation

The updater checks GitHub’s public stable feed and opens the download in your browser. It does not silently install or restart the app. An unavailable/offline check does not establish that your build is current.





### Candidate builds

An rc build is a release candidate. Local candidates and GitHub prereleases are not offered by the stable feed. A candidate with a higher base version may correctly say it is newer than the latest stable release. Candidate-version comparison is supported from rc.33.





### Installer choice

Use the Setup build for a normal Windows installation and shortcuts. Keep the same Windows user and local profile when upgrading. The portable download is a different distribution mode, not an assurance that local history travels inside the executable.





## Troubleshooting checklist

Find the right next step without repeatedly resetting everything.

### Bluetooth connects, then loops

Confirm exclusive access, power and signal range. Read Radio Health’s latest error and export the diagnostic log. Let the current operation settle before a manual retry; repeated overlapping GATT operations can worsen an interrupted setup.





### USB visible, no response

Check that the cable supports data, the chosen COM port is the radio and no other program owns it. Verify USB companion firmware compatibility. A charge indicator or Windows device listing alone does not prove the command protocol works.





### No older messages

Select the correct radio/channel and inspect Radio Health. Refresh only retrieves what the radio still has queued. A phone or other client may have already consumed it; that client’s local archive is not automatically shared with Nightlink.





### CoreScope says waiting for packets

Test internet access and compare the full provider site. A page can render without a working live data feed. Reload the map provider; use Radio map for locally available data if remote access fails. Bluetooth reconnection is not a remedy for the provider’s internet feed.





### No sound or popup

Review Settings > Notifications, quiet hours, the conversation’s mute setting, Windows notification permissions and system volume. Incoming messages can still be recorded while alerts are suppressed.





### DM identity cannot resolve

An advertised name is not a unique public key. Open the contact card and link/import the intended saved companion. Avoid choosing another person just because a display name is similar.





### Before reporting

Include the version from About, the exact action and error, radio firmware/model and whether another client was connected. Export diagnostics if useful. Review and remove private information before attaching any files.




