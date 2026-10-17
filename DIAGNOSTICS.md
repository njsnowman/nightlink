# Diagnostics workspace

Tracked in [#43](https://github.com/njsnowman/nightlink/issues/43).

More → Diagnostics contains Replay, Packets, Placement, History, Maps and Voice. It does not send probes or change firmware/radio settings. Connection actions remain in one top-right header control; successful synchronization dismisses the connection dialog and opens Overview. Background refreshes do not redirect a user when the connection dialog is closed.

Replay retains up to 2,000 events over seven days per radio in separate IndexedDB storage. It records local receipt times, connection/synchronization events, delivery attempts, available acknowledgements, local statistics and available raw RX logs. Playback advances recorded events locally and can open retained messages/path details. It does not reconstruct a complete topology, replay transmissions, or recover evidence from before installation. Private raw packets, contact prefixes and message references remain on this computer; do not publish the database. Diagnostic events are not part of existing message backups.

Packets decodes the raw RX envelope/header and available path prefixes, with original byte values. It does not decrypt arbitrary DMs or verify identity from a short path hash. Unsupported/truncated packets remain marked invalid. RX logging availability depends on connected firmware; Nightlink does not enable logging automatically.

Placement records passive samples under operator-provided spot names. Runs last only for this app/radio session and retain at most 2,000 packets each. Compare similar durations and conditions; different traffic mixes can affect results. It cannot determine whether a silent repeater could receive a transmission.

History plots recent last-link SNR samples and aggregates them by observed path prefixes with count, range, mean and last observation time. This is reception evidence at the local radio, not per-hop SNR, end-to-end reliability, or a claim of a unique repeater identity. Active tracing and per-hop historical analysis are not implemented in this candidate.

Offline maps and local voice setup are documented in OFFLINE_MAPS.md and LOCAL_VOICE.md. Imported map coverage and optional local voice dependencies need to be provisioned separately.
