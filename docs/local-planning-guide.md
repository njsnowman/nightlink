# Nightlink local planning tools

Open a saved idea or project in Operations, then choose **Local planning tools**. The workspace starts with a snapshot. Your original project and its field records are retained separately.

1. Choose the tool you need. Optional **Study name, model and notes** contains the calculation choice. Terrain-aware Bullington uses stored sampled geometry. Free-space deliberately omits terrain, foliage and obstacles.
2. Enter/import assumptions. Heights are feet; displayed distances are miles. Changing an input clears the preview.
3. Choose **Run local preview**. This uses stored data; it does not request new terrain or send radio commands. Grey/unknown means unresolved.
4. Choose **Save local study** to create an independent local version. **Export study bundle** includes its source snapshot, settings and imported measurements. Keep that JSON file with your backups. These studies and local presets are separate from normal project backups.

## Inspect

Click a position on the map to inspect the existing transmitters. The weaker-direction reserve includes the required margin. Terrain mode uses the nearest stored radial bearing and outer-range trace, not a measured signal at the clicked point. Missing terrain remains unknown. Select a saved path and choose **Explain selected path** for its local budget.

## Find a site

Start with a project whose existing-transmitter coverage is complete/current. Draw a boundary and optional exclusions, or import WGS84 GeoJSON polygons. Choose **Screen allowed positions**. Cached-only is selected initially. Clearing it allows the existing terrain service to receive requested coordinates; **Cancel screening** stops the job without saving a site.

Screening is a coarse bounded grid, not an exhaustive optimum. It uses the original saved project's radio assumptions, not local antenna/obstacle variants. Read reciprocal backhaul reserve and representative gap-path results. **Keep candidate** explicitly copies a proposed location into the unchanged current source project. Then complete its normal coverage/backhaul and site-access checks. Nothing becomes an installed site or measured coverage through screening. Screening results are transient and must be rerun after reopening.

## Terrain and 3D

Declare whether stored radial data is bare ground or surface/unknown. For a saved path, enter terrain source/date and vertical datum before importing a CSV:

```csv
distance_ft,elevation_ft,obstruction_ft
0,650,0
1640,680,30
3280,660,0
```

Distances must cover the actual saved endpoint-to-endpoint path; the example values must be replaced with your own sourced geometry. Optional obstruction height is above the supplied elevation. Choose ground/surface to match the imported data.

Draw an obstacle, then expand its entry to enter height, reference and provenance. Ground-relative objects require declared bare-ground data. Surface data may already contain buildings/canopy. An optional entered dB loss is applied once per intersected path, not per sample. Obstacles are tested only at stored samples, so narrow features may be missed.

**Open connected 3D inspection** displays the same sampled path geometry used by the local study. Unsampled objects are not inferred. Vertical exaggeration changes appearance only. In free-space mode the displayed terrain geometry is omitted from that mode's budget.

Obstacle GeoJSON accepts one Polygon per feature, with properties such as:

```json
{"kind":"obstacle","name":"Canopy what-if","height_ft":30,"reference":"surface","loss_db":0,"source":"Entered assumption","obstacle_type":"trees"}
```

GeoJSON coordinates are `[longitude, latitude]`. Boundary features use `kind: "boundary"`; excluded polygons use `kind: "exclusion"`. Boundary holes become exclusions. Obstacle holes and crossing/touching polygon edges are rejected.

## Route

Draw a route or import GPX tracks/routes or GeoJSON LineString/MultiLineString. GPX track segments remain separate. Set sample spacing in feet and run the preview. Read covered, below-budget and unknown lengths in miles. Export the classified route as GeoJSON if useful.

An edge meets the sampled budget only when both ends do. Unknown endpoints produce unknown edges. This is a prediction sampled along a route, not verified continuous service or simulated packet routing. The tool limits routes to 310.69 mi and 1,200 calculation samples; shorten the route or increase spacing if necessary.

## Antennas and presets

Choose the site before editing. Enter aim in true degrees, positive-down downtilt, horizontal/vertical half-power beamwidth, maximum off-axis loss and any explicit polarization allowance. Half of the HPBW is the idealized three-dB offset. These are parametric approximations, not manufacturer/measured patterns.

Equipment changes affect the local study only. Save a named radio/environment preset when useful. Select it and **Review and apply preset** before applying it to the selected study site. Presets contain equipment/pattern/environment assumptions, not coordinates. Presets stay local; export your individual studies for transfer.

## Field calibration

Download the measurement template. Required columns:

```csv
path_id,direction,lat,lon,frequency_mhz,rx_height_ft,rssi_dbm,at,direct_confirmed,setup_confirmed,source
```

Find each saved path ID in an exported study bundle under `project.rf.paths` (match its name), then use that ID, `ab` (A transmits/B receives) or `ba`, receiving endpoint coordinates, frequency, receiving antenna height, measured RSSI, an ISO date/time and your observation source. Enter literal `true` for both confirmation fields only when this is a direct endpoint test and its actual equipment/setup matches the displayed study. Forwarded packet RSSI does not establish that.

Import captures the current input signature as your setup attestation. Changed inputs, wrong frequency/height, coordinates beyond 328 ft of the receiver, unconfirmed rows and unresolved predictions are excluded. Bias is measured minus predicted; negative means the model was optimistic. MAE and RMSE summarize matched point residuals. These results are separate from original project field records and do not establish area coverage or a confidence probability.

## Limits and backups

The workspace supports 100 saved local study versions and 100 presets. File size/geometry/sample limits are enforced. An exported bundle can reopen its original source snapshot even when the current source project has changed. **Use latest project snapshot** explicitly selects newer source data; observations remain historical unless their inputs match. Copying a candidate requires matching current source identity, revision and inputs.

No CloudRF integration, new ITM/P.1812 solver, physical-radio validation or automatic radio configuration is included.
