# Radio workbench validation

Tracking: [#89](https://github.com/njsnowman/nightlink/issues/89). Source-only change; no downloadable candidate or release published for this scope.

## Behavior

- Radio page exposes six tools without additional sidebar destinations. Opening tabs performs no radio request.
- Trace sends companion command 36 through the existing serialized radio-tool guard. Cryptographic random tag, matching acceptance and push response, bounded timeout, disconnect handling, listener cleanup, no retry. UI supports explicit one-byte paths only. Saved one-byte repeater routes can populate outbound/return hashes. Hash collisions remain possible; names are not verified by trace results.
- Line of Sight is an offline geometric planner: distance, bearing, geometric horizon and midpoint first-Fresnel radius. Antenna heights are above ground, not altitude above sea level. No terrain/building/vegetation profile or refraction model is included. It must not be used as confirmed terrain clearance or expected reception.
- RX Log displays the latest 100 bounded per-radio RX observations, automatically updating on firmware RX-log events. Raw payload is not displayed in this tool.
- Noise Floor reads radio statistics subtype 1 manually and shows the signed reported dBm value. Requires protocol 8+. No new polling loop or over-the-air probe is started; values reset on identity/disconnection.
- Discovery and CLI open existing guarded implementations. Their existing confirmation, cooldown and firmware constraints remain.

## Automated evidence

2026-10-26: full repository test suite passed (192 tests before the added timeout regression). Focused suite also covers timeout/no-retry. Browser integration passed six tools, no automatic radio requests, offline calculation, disconnected action gate, no page overflow at 760×560, 920×700 and 1440×950. Visual screenshot inspected at 1440×950 with a disconnected synthetic profile. Compact workbench content scrolls inside its pane; the application frame does not scroll.

Protocol reference: [MeshCore companion MyMesh.cpp](https://github.com/meshcore-dev/MeshCore/blob/main/examples/companion_radio/MyMesh.cpp), command 36 / push 0x89 and statistics command 56. Trace support is deliberately restricted to flag 0 / one-byte hashes; other encodings are rejected.

## Physical evidence and release limits

No radio was connected, no discovery or trace transmitted, and no physical noise-floor read was performed for this change. Actual trace round-trip, firmware-specific RX-log availability and signed noise-floor read still require hardware acceptance. Existing release holds remain in effect; this document does not approve publication.
