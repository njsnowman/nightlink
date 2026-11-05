# RF terrain, coverage and deployment tools

Tracks [#157](https://github.com/njsnowman/nightlink/issues/157). Open Operations → an operation → RF Planning. The map stays above six collapsed tool sections. Both Terminal and Cards retain compact/enlarged layouts. These actions do not configure a radio or transmit.

## Terrain and offline use

Select a path and choose Download path terrain. Only requested coordinates are sent to the fixed Open-Meteo elevation endpoint; contacts, notes and keys are not sent. No terrain HTTP request occurs simply by opening this workspace. Use cached path terrain makes no network request. Refresh bypasses existing values. Cancel stops the job; completed batches remain cached but incomplete results are not saved to the operation. Errors retain the saved plan. Navigation/interface changes cancel pending jobs; background radio synchronization does not replace the workspace.

The provider documents Copernicus GLO-90, approximately 90 m resolution, 2021 release. This is a digital surface model (may include structures/vegetation), referenced to EGM2008 orthometric heights. It is not a survey of bare ground. Source resolution differs from requested sample spacing. Each saved profile records source, datum, provider, documented dataset release and fetch time. Manual ground overrides must declare a matching datum; the app does not transform vertical datums. Blank ground elevation uses the endpoint terrain sample.

The public endpoint is intended for non-commercial use under its terms. Point-weighted reservations are shared transactionally between windows: 550 coordinates/minute, 4,500/hour and 9,000/day, below documented public limits. Up to 100 coordinates/request; other applications using the same public IP can still cause provider rejection. Brief quota waits show progress; long waits fail with a retry message. No paid service or account is configured. Cached points are capped at 50,000 and evict oldest entries. Clearing terrain cache does not reset quota reservations or remove saved operation profiles/grids. Cache data is unencrypted local storage.

## Candidate comparison

Choose non-overlapping candidate and destination sets. Prepare comparison terrain creates or refreshes baseline paths with shared frequency, k, margin, additional loss and Fresnel fraction. Height-override scenarios remain separate. At most 40 pairs/job and 50 total paths/scenarios per operation. Missing coordinates/equipment/terrain or mismatched datums remain unresolved. Only candidates with valid results for every destination receive a rank: budget-positive destinations, then sampled-clear destinations, then worst reciprocal reserve. This ordering is a planning aid, not verified repeater performance.

## Terrain-aware coverage

Build terrain coverage snapshots an origin, reference receiver equipment, antenna heights, frequency and loss assumptions. Choose coarse, balanced or detailed radial sampling, radius 0.5–50 km. Each radial uses intermediate terrain samples, with a maximum of 4,097 source positions and 12 saved estimates/operation. The layer colors represent predictions at cell outer-center positions, interpolated across each wedge: at least 10 dB reserve, 0–10 dB reserve, below budget or unresolved. An accessible sample table provides the numeric results. Radial/angular spacing and source resolution remain visible. Moving the origin invalidates its layer; later equipment edits do not silently change saved coverage assumptions.

The implemented model adds the Bullington diffraction component from ITU-R P.526-16 Annex 1 §4.5.1 (equations 49–57) to free-space attenuation. This is not full delta-Bullington, Longley–Rice/ITM or a complete P.1812 implementation. Effective-Earth curvature uses the entered k. Predictions cover 30–6,000 MHz and base-path distance guards. Both directions include entered transmitter power, antenna gains, feedline loss, receiver sensitivity, required margin and additional assumed loss. Detailed antenna patterns, weather, fading, multipath and independent clutter/foliage attenuation are not modeled. Colored polygons do not establish service throughout the filled area.

## Heights and measurements

Antenna-height optimization finds the sampled geometric minimum for raising A, B or both equally, within the entered height limit. Practical mast heights show comparable modeled outcomes; a selected minimum can become a saved scenario. This does not assess structural feasibility or guarantee unsampled clearance.

Record endpoint field test can capture a model snapshot only when the operator confirms a direct endpoint test with matching frequency/equipment. If test coordinates are entered they must be within 100 m of the selected receiver. A forwarded mesh RSSI is not a direct-path measurement. The immutable snapshot retains direction, equipment, endpoint coordinates/heights, source/datum, frequency, k, losses, model version and an assumptions fingerprint (not a security signature). Later edits do not rewrite it. Numeric comparisons require measured RSSI; unmatched/older tests remain visible without invented predictions. Residual is measured minus modeled; bias, MAE, RMSE and a scatter chart describe only those entered tests. No automatic calibration is applied.

## Deployment packets and backups

Export a site or all sites as self-contained printable HTML: saved coordinates/location provenance, true initial bearings, RF equipment, site photos, modeled paths/profiles, manual tests, access/power notes, assigned operators, planned/fallback channels, assigned tasks and equipment. Save edits first. Reports escape user text, have no script or remote image dependency, and include terrain attribution. JSON backups retain the full grids and snapshots; printed HTML is not a replacement for a backup.

Planner database version 4 retains earlier operations and prevents older builds from writing an incompatible schema. Export format 4 accepts import versions 1–4; older builds reject new backups. Export before upgrading if an older app must remain usable. Removing sites drops their coverage/path inputs but retains historical tests and prediction snapshots. Duplicating operations resets execution tests/predictions and remaps planned coverage IDs. Queen City Con remains unchanged.

## References and evidence

- [Open-Meteo elevation documentation](https://open-meteo.com/en/docs/elevation-api) and [terms](https://open-meteo.com/en/terms).
- [Copernicus DEM description and vertical reference](https://dataspace.copernicus.eu/explore-data/data-collections/copernicus-contributing-missions/collections-description/COP-DEM); Copernicus DEM attribution, DOI [10.5270/ESA-c5d3d65](https://doi.org/10.5270/ESA-c5d3d65).
- [ITU-R P.526](https://www.itu.int/rec/R-REC-P.526) and [ITU-R P.525](https://www.itu.int/rec/R-REC-P.525).

Automated model/UI fixtures use synthetic terrain and measurements. A successful elevation API response verifies retrieval only, not terrain accuracy or RF coverage. No physical-radio or surveyed-path evidence is claimed by these tests.

The primary [project workflow](project-planner.md) shares these models/cache and adds an area snapshot to project-generated estimates. Individual tools remain available under Team & advanced tools.
