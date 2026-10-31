# RF Propagation Monitor - detection model

Status: core module only (`propagation.js`). No user interface, settings panel or persistence wiring is included yet. All validation is synthetic; no physical-radio evidence exists for this feature.

## Purpose and limits

The monitor watches receive activity the radio already reports and flags reception that is unusual compared with that radio's own history. It reports a "Possible RF opening" or a "Strong RF anomaly". It never states that atmospheric propagation caused an observation. Packet anomalies can also come from antenna changes, new nodes, repeater changes, busy local traffic or configuration changes.

The monitor is passive. It never transmits, probes, starts discovery or changes radio settings, and it makes no network requests. Data stays in the local profile.

## Inputs

| Source | Normalizer | Fields used | Notes |
| --- | --- | --- | --- |
| RX-log push `0x88` | `normalize.rxLog(frame, at)` | SNR, RSSI, route type, path hash count, payload type | Parsed by the existing `NightlinkEvidence.packet()` in `diagnostics.js`. Requires RX logging on the firmware; Nightlink does not enable it (DIAGNOSTICS.md). |
| Decoded messages `0x10/0x11` (and legacy `0x07/0x08`) | `normalize.message(m, at)` | SNR (modern frames only), raw path length, DM sender prefix | Message text is hashed in memory for duplicate detection only and is never stored. |
| Advert push `0x8a` | `normalize.advert(contact, at)` | Full public key, self-reported location | The frame's path length describes the stored route to the contact, not this reception, so the relation is always `unknown`. |

Missing SNR or RSSI is `null`, never 0.

## Routing assumptions

- Path byte: low 6 bits are the hop count, top 2 bits are the hash size minus one (`routes.js`, `diagnostics.js` `packet()`).
- RX-log route type `header & 3`: 0 scoped flood, 1 flood, 2 direct, 3 scoped direct (`diagnostics.js`).
- A reception is classed `direct` only for a flood or scoped-flood packet with zero path hashes. Assumption, not confirmed in this repository: repeaters append their hash to a flood packet's path, so zero hashes means no repeater forwarded it. Direct-routed packets (route 2 or 3) are always `unknown`, because their path is the remaining route and the last transmitter may be a repeater.
- Message path length `255` (0xFF) is `unknown`, never direct. Labels for 0xFF disagree elsewhere in the code (`routes.js` "Direct - hop count unavailable", `contacts-ui.js` "Flood / unknown"), so the monitor treats it as no evidence.
- Path hashes and 6-byte DM prefixes are not unique. They are never used as identities. Message stations are labeled `prefix`; only full public keys are labeled `key`.
- Assumption, not parsed elsewhere in this repository: an Advert payload begins with the 32-byte originator public key. A key extracted this way is used for distance only when it matches a known contact location.

## Distance

Distance is computed only when all of these hold: the observation is an RX-log reception classed `direct`; the originator's full key is known; the radio's own location and the station's location pass `validLocation()` (`radio.js`). The calculation reuses `NightlinkWorkbench.geometry()` (`radio-workbench.js`). Station locations are self-reported in adverts and may be wrong. Otherwise the distance is unknown.

A direct distance is unusual when it exceeds the larger of `unusualDistanceKm` (default 80 km) and `distanceFactor` (1.5) times the 95th percentile of this radio's verified direct distances in the baseline (needs at least 5 samples).

## Baseline

- Per radio public key. Switching radios never mixes data.
- Hourly buckets for the configured period (14, 30 or 60 days; default 30), plus coverage time per bucket. Only buckets with at least 50% connected coverage count. Time while Nightlink was closed or disconnected is no coverage, never silence.
- Per bucket: packets, RX-log packets, distinct stations (capped), stations first seen, SNR sums per station and packet type (capped).
- At least 24 covered baseline hours are required before scoring (`insufficient-data` until then).
- `noteConfig()` takes radio parameters, antenna and logging mode. A change after data exists marks the baseline not comparable and returns a warning; `resetBaseline()` starts learning again. Alert history is kept.

## Evidence and scoring

The evaluation window is the last 30 minutes. Weights are starting hypotheses, not validated thresholds, and are configurable.

| Category | Max points | Rule |
| --- | ---: | --- |
| Unusual verified direct distance | 40 | 20 per distinct station, capped at 2 |
| Multiple unusual stations | 25 | Needs at least 2 new or rarely received stations; scales with the excess over the baseline's expected new-station rate |
| Comparable SNR change | 20 | Mean change for the same station and packet type versus baseline; needs 3 comparable pairs with 3 baseline samples each; 3 dB gives 0, 12 dB gives full |
| Sustained anomaly | 15 | Consecutive evaluations at or above the possible threshold; full at 3 |

Unavailable evidence scores no points. Retransmissions of one packet (same payload type and payload within 2 minutes) count once, so one packet cannot raise more than one station's credit.

Sensitivity thresholds (possible / strong): low 55 / 80, medium 40 / 70, high 30 / 55.

Packet rate and unique-station rate are reported for context and do not score.

## States and events

States: `disabled`, `unavailable` (not connected), `insufficient-data`, `normal`, `possible-opening`, `strong-anomaly`.

- Hysteresis: a level is entered at its threshold and left only below the threshold minus 10 points. Returning to normal also requires 20 minutes below that band.
- One event window per anomaly. An alert is emitted when an event opens and once more if it escalates to strong.
- Cooldown: no new alert for 30 minutes after an event ends, except an escalation beyond the previous event's peak level.
- Disconnecting, switching radios or disabling the monitor ends the active event with a reason, marked stale. Events restored after a restart that had not ended are marked stale.

## Public API

`NightlinkPropagation.createMonitor(options)` returns:

- `connect(radioKey, at)`, `disconnect(at)`
- `observe(observation)` takes a normalized observation and returns `true` if accepted
- `evaluate(at)` returns `{state, label, score, parts, confidence, evidence, activeEvent, comparable, warning, lastQualifying, connected, rxLogObserved}`
- `summary(at)` returns the `evaluate()` result plus `recent`, `flagged`, `events` and `trend` (null where there was no coverage)
- `setOwnLocation({lat, lon})`, `setContacts(list)`, `noteConfig(cfg)`, `resetBaseline()`, `clearHistory()`, `configure({enabled, sensitivity, baselineDays, ...})`
- `serialize()`, `restore(json)`
- `on(listener)` receives `alert`, `cleared`, `baseline-warning` and `baseline-reset` events

## Known limitations and false positives

- With RX logging off, only message and advert evidence exists: no RSSI, no per-packet route type and no direct-distance evidence.
- Antenna, location or radio parameter changes change reception; record them with `noteConfig()` and reset the baseline.
- New nodes joining the mesh, a new repeater or a repeater outage can produce new-station evidence unrelated to propagation.
- Busy local traffic raises packet counts; counts do not score for this reason.
- Advert locations are self-reported and may be wrong or stale.
- Prefix collisions: different stations can share a DM prefix.
- The 0xFF path length and direct-routed packets carry no distance evidence.
- Thresholds are untested on real data; tune them after field observation.

## Interface

- propagation-ui.js feeds the monitor from existing events only: `ble` 0x88 frames (parsed by `NightlinkEvidence.packet` inside `normalize.rxLog`), `radioSession` message events, and 0x8a frames parsed by `MeshlineProtocol.contact`. It connects on `identity` (same radio keeps its state), disconnects on `disconnected`, and passes radio parameters to `noteConfig` on `identity` and `identity-updated`.
- State is saved per radio to IndexedDB `nightlink-propagation` (debounced, and on unload). Settings are in localStorage `nightlink.propagation.settings`. Neither is in the backup allowlist.
- The header indicator sits beside the connection control. Normal, learning and unavailable states show a subdued icon only; alert states show "Possible RF Opening" or "Strong RF Anomaly". Animations are removed by the Reduced motion setting, the system preference, or the Alert animations setting.
- The panel opens from Radio > Observe & diagnose or the indicator. Settings are in Settings > Notifications.
- Strong-anomaly alerts can play the existing mention sound and send a desktop notice (conversation id `propagation`) through the existing quiet-hours policy. Both default to off.
