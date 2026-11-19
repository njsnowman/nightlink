# RF Planning workspace

Tracks [#155](https://github.com/njsnowman/nightlink/issues/155). Open Operations → an operation → RF Planning. Primary app only; Queen City Con is unchanged. The previously stopped live-operations-console work is not included.

Current terrain retrieval, diffraction coverage, candidate ranking, height optimization, field comparison and site packets are documented in [RF suite](rf-suite.md).

## Layout and workflow

The workspace keeps the map central, with a compact collapsible site directory, one path/scenario selector and a collapsed path-analysis panel. Detailed site equipment and path assumptions open in shared editor dialogs. At compact widths the directory stacks above the map and the result summary uses two columns. Terminal uses the approved VGA palette/frames; Cards uses the shared quiet surfaces and bordered controls.

1. Add sites using existing site forms or Place site on map. Map placement proposes coordinates and requires an explicit save. Unknown coordinates remain unknown.
2. Enter each site's RF assumptions: antenna height above ground, optional ground elevation in the terrain's vertical datum, transmit power, antenna gain, feedline/connector loss and receiver sensitivity. Default values are editable assumptions, not radio telemetry. Optional photos are locally resized to JPEG and kept out of the main map view.
3. Create a two-site path. Record frequency, effective Earth radius factor k, required margin, additional assumed path loss and the selected first-Fresnel-radius fraction. Path distance and initial true bearing use a spherical Earth approximation. The dashed map line represents a proposed link, not an observed radio route.
4. Review both directions of the free-space budget. Enter a sourced terrain profile for sampled clearance analysis. Antenna-height sliders update the plot without replacing the map; Save height scenario adds a named comparison. Comparisons use current entered equipment profiles and each scenario's saved height overrides/path assumptions.
5. Optionally display the free-space-only link-budget radius. Its map display is capped at 200 km. It ignores terrain, clutter, antenna patterns and diffraction; it is not a terrain-coverage model or predicted service area.
6. Record manual field observations separately: time, heard/not-heard/intermittent, optional measured RSSI/SNR, location, observer and conditions. These do not arise automatically from estimates or simulated data. Located observations appear as distinct outcome markers. No radio is contacted or configured by these actions.
7. Export an operation JSON backup to retain the full samples and RF records.

## Terrain input

Terrain may come from an explicit local CSV import or the separately described RF suite download/cache action. Missing data is never filled with invented ground levels. Export blank sample grid produces 101 distance positions with empty elevation cells, which must be filled with sourced data before import.

CSV header must be `distance_m,elevation_m` or `distance_m,elevation_m,obstruction_m`. Supply 3–1,001 numeric samples, increasing in distance, starting at zero and ending at the selected path distance within 0.5% or 5 m. Source and vertical datum are required. Input must use metres and a consistent declared datum for terrain and entered endpoint ground elevations. Blank obstruction heights remain explicitly unknown; they are treated as zero only for the displayed sampled calculation. Maximum CSV size 2 MB.

The imported profile is bound to ordered endpoint coordinates and its import time. Moving an endpoint more than 0.1 m, reversing the binding or changing the matched distance prevents clearance results until terrain is re-imported. Changing the path's site assignments in its editor clears the old terrain. Height changes do not change ground coordinates and can reuse the profile.

Clearance statements apply only at supplied samples, including endpoints. Maximum sample spacing, source, datum and obstruction completeness are displayed. Terrain between samples, buildings, foliage and weather are not verified. A sparse profile cannot establish a clear real-world LOS. The graph uses independent vertical and horizontal scales; it is not an antenna-angle drawing. Ground overrides must be in the same vertical datum as the terrain; otherwise the calculated geometry can be wrong.

## Methods and limits

Free-space attenuation uses `20 log10(4πdf/c)`, with distance in metres, frequency in Hz and c = 299,792,458 m/s. This is the wavelength form in [ITU-R P.525-5](https://www.itu.int/rec/R-REC-P.525-5-202411-I/en). Both directions include each end's entered power, gains/losses and the opposite receiver's sensitivity. Reserve is margin above sensitivity minus the entered required margin. Additional loss is a manual assumption; this base free-space view does not derive diffraction/clutter loss. The RF suite adds its separately labeled Bullington diffraction estimate.

First Fresnel radius uses `sqrt(λ d1 d2 / (d1+d2))`, following the geometric approximation in [ITU-R P.526-16, Annex 1 §2.1](https://www.itu.int/dms_pubrec/itu-r/rec/p/R-REC-P.526-16-202511-I!!PDF-E.pdf). Sample elevation is adjusted by the parabolic effective-Earth bulge `d1*d2/(2*k*R)`, R = 6,371,008.8 m. The selected fraction (default 0.6) is subtracted below the antenna ray when checking sampled clearance. Default k = 4/3 is an editable planning assumption, not measured atmospheric refraction. These are geometry/free-space estimates, not an implementation of the full diffraction models in P.526 or a Longley–Rice coverage model.

Workspace analysis is bounded to paths 1 m–200 km. Paths shorter than ten wavelengths are withheld by a conservative short-path check; this does not establish an antenna-specific far-field boundary for longer paths. Elevations are bounded to −500…10,000 m; heights 0…500 m; frequency 1…6,000 MHz; k 0.5…3. These limits are input guards, not equipment capability or regulatory authorization.

## Persistence and compatibility

RF records are part of their operation and share revision checks, atomic validation and separate planner backups. Per operation: up to 100 RF profiles, 50 path/scenario records and 500 field tests. Site JPEG data URLs are limited to 250,000 characters. Existing planner limits (100 operations, 40 MB total; 50 MB backup) still apply. Storage failures and stale editor saves remain errors with entered text retained.

Planner IndexedDB upgrades from versions 1/2/3 to version 4 while retaining existing operations. Old planner builds cannot open that newer database, preventing them from silently discarding RF fields. New planner exports use backup format version 4; this build accepts versions 1–4. Older builds reject new backups. Keep a pre-upgrade export when an older app must remain usable.

Removing an operation site removes its RF profile and dependent path scenarios; recorded tests remain with detached path IDs and their historical path names. Removing a path likewise retains tests. Duplicating an operation remaps RF site/path IDs and retains planning inputs but resets field-test execution records. No results are automatically promoted to measured evidence. Planning records/exports are unencrypted local data.

Validation uses synthetic terrain and sites, including unknown/stale terrain, curvature/Fresnel calculations, reciprocal budgets, CSV rejection, dateline wrapping, photo/report escaping, storage migration/downgrade protection, persistence and compact/enlarged terminal/Cards layouts. Synthetic tests are not physical-radio or field-survey evidence.
