# RF Propagation Monitor - validation record

Unreleased feature on branch feature/propagation-ui (core: propagation.js; interface: propagation-ui.js, propagation.css). Not part of 0.8.26. Model and limitations: [docs/propagation-monitor.md](../docs/propagation-monitor.md).

## Scope

- Passive monitor of existing receive events: 0x88 RX-log frames through the existing diagnostics parser, decoded companion messages, and 0x8a adverts through the existing contact parser.
- Header indicator beside the connection control; Propagation Monitor panel in Radio > Observe & diagnose; settings in Settings > Notifications (routed by switchboard-settings.js).
- Per-radio state persisted in IndexedDB database `nightlink-propagation`; settings in localStorage key `nightlink.propagation.settings`. Neither is added to the backup allowlist, so neither is exported or imported by backups.
- Strong-anomaly alerts may play the existing mention sound and send a desktop notice through the existing `desktop:notice` path, which now accepts the conversation id `propagation`. Both are off by default and respect quiet hours.
- The monitor never sends radio commands, enables RX logging, probes or uses the network.

## Automated evidence (synthetic only)

- `npm test`: 319 tests passed, including 21 propagation core tests and a tray test for the `propagation` notice route.
- `npm run -s test:browser`: 13 suites passed, including the new `propagation.browser.test.cjs`. It covers unavailable, learning, normal, possible opening and strong anomaly states, real 0x88 and message events through the input path, panel evidence, the two-step baseline reset, settings defaults and persistence, reduced motion (body class and media query), 760x560 layout, restart with historical events, disconnect, disabling, and confirms no radio command is sent.
- `radio-page.browser.test.cjs` now expects ten Radio page cards.
- Run in a Linux container with Chromium; not yet run on Windows CI for this branch.

Pre-existing failures, unchanged by this feature and outside `test:browser`: `diagnostics.browser.test.cjs` (`7 !== 6`) and `header-controls.browser.test.cjs` (expects a 3px control radius; the design standard is 9px). Both fail identically on the core commit 7e0f434. The header test's visible-button count was updated from 4 to 5 for the new indicator.

## Physical evidence

None. No physical radio, RX-log stream or propagation event has been observed with this feature. Thresholds and weights are untested hypotheses.

## Screenshots

Captured from the application page with synthetic observations injected only into an isolated test page (`PROPAGATION_SCREENSHOTS=docs/images/propagation node propagation.browser.test.cjs`). They contain demonstration data only: radio "Field Radio · DEMO", synthetic station keys, no real names, locations or map tiles.

| File | View |
| --- | --- |
| docs/images/propagation/01-header-normal.png | Header, normal state (subdued icon) |
| docs/images/propagation/02-header-possible-opening.png | Header, amber Possible RF Opening |
| docs/images/propagation/03-header-strong-anomaly.png | Header, red Strong RF Anomaly |
| docs/images/propagation/04-panel-possible-opening.png | Panel, possible opening |
| docs/images/propagation/05-panel-strong-anomaly.png | Panel, strong anomaly |
| docs/images/propagation/06-settings.png | Settings section |
| docs/images/propagation/07-compact.png | Panel at 760x560 |

## Known limitations

- Without firmware RX logging, only decoded messages and adverts are observed; SNR, RSSI and distance evidence may be unavailable.
- Assumptions not confirmed from repository source: advert payloads begin with the 32-byte originator key; a flood packet with zero path hashes was heard directly from its originator; the meaning of path length 0xFF (treated as unknown).
- Advert locations are self-reported. Path prefixes are not unique and are never used as identities.
- An antenna change is not detected automatically; radio parameter changes raise a baseline comparability warning.
- In-app Help (user-guide.js) is unchanged; the topic count is fixed at 21.

## Follow-up - October 31, 2026

Unusual direct receptions now read Unknown, not 0, when no observation in the window had a measurable distance (commit ebd82ad, with a unit assertion). Screenshots were regenerated with `PROPAGATION_SCREENSHOTS=docs/images/propagation node propagation.browser.test.cjs` and reduced to a 256-colour palette. Candidate version 0.8.27-rc.1.

## 0.8.27-rc.1 Windows CI build

GitHub Actions [run 41170654150](https://github.com/njsnowman/nightlink/actions/runs/41170654150) for #120: test job (unit and test:browser suites) and Windows package job passed on windows-latest. verify-package matched all 204 packaged files to source; required assets include propagation.js, propagation-ui.js and propagation.css. Packaged source ad41e11cb3b53078153180c609f1b6fa04875c62 is the synthetic merge of head fbcb9031b7c3f548f0ef5d100a188ffdb1a491ab into main 93f5277d251730c77c4c9933e2b2f2c6b2e8b320.

| Artifact | Bytes | SHA-256 |
| --- | ---: | --- |
| Nightlink-Setup-0.8.27-rc.1.exe | 103171707 | a00b5991352bb17a6fbd38701e74be22cc51ca9fb10fa7571db15a74a43384e4 |
| Nightlink-Portable-0.8.27-rc.1.exe | 102927837 | fb0202fa4e5920da9b043013250fd8ebea66f61774d330f5ad72cfc0aa102565 |

CI artifact `nightlink-0.8.27-rc.1-windows-candidate` ID 13030997234, expires November 14, 2026. Unsigned. Prerelease candidate for physical evaluation only; no physical radio evidence exists for the monitor.

