# Changelog

## Unreleased

- Add local backup export and restore preview, message deduplication, contact/preference preservation, and interrupted-restore recovery. Tracked in [#12](https://github.com/njsnowman/nightlink/issues/12).

## 0.8.7 — 2026-10-15

- Add local message search with contact, channel, date and mention filters, and navigation to matching messages. Tracked in [#8](https://github.com/njsnowman/nightlink/issues/8).

## 0.8.6 — 2026-10-15

- Add persistent unread counts, reading positions and new-message dividers for channels and direct messages. Add per-channel mute controls, independent DM and mention sounds, and conversation notification actions. Tracked in [#5](https://github.com/njsnowman/nightlink/issues/5).

## 0.8.5 — 2026-10-15

### Changed
- Add a terminal-style radio connection window with event-driven discovery, verification, synchronization, ready/error states, cancellation, queue counts, and reduced-motion support. [#3](https://github.com/njsnowman/nightlink/issues/3)
- Increase default message text to 16 px, raise secondary text sizes and contrast, and add persistent Standard/Large/Extra large text settings shared by DM windows. [#2](https://github.com/njsnowman/nightlink/issues/2)

### Fixed
- Retain the BLE command lock until both the GATT write and companion response complete. Prevent notifications arriving before write completion from starting overlapping writes during handshake or channel synchronization. [#1](https://github.com/njsnowman/nightlink/issues/1)
- Retry transient GATT disconnects during initial service discovery with fresh service and characteristic handles; stop after three attempts and honor cancellation. [#1](https://github.com/njsnowman/nightlink/issues/1)
- Pause automatic reconnect after an initial synchronization command failure, with the failed command shown for manual retry. [#1](https://github.com/njsnowman/nightlink/issues/1)
- Prevent errors from an obsolete synchronization attempt from overwriting a newer connection state.

### Validation
- User reported more than four hours of continuous Bluetooth connection and successful retained-message recovery after reconnect on the tested radio. [#1](https://github.com/njsnowman/nightlink/issues/1)
- DM retry/flood behavior remains simulation-tested; no new physical two-radio verification is claimed.

### Maintenance
- Require an issue, changelog, validation record, matching source commit, and artifact checksum before Nightlink release publication.
- Consolidate repository documentation around supported behavior and explicit limitations.

## 0.8.4 — 2026-10-15 (local build)
- Serialize background polling and retain reconnect backoff until the connection is stable.
- Retrieve queued messages before contact and telemetry refresh, with no 1,000-frame catch-up cutoff.
- Disable desktop background timer throttling and record command failures in diagnostics.
- Known issue: connection cycling during initial synchronization; see issue #1.

## 0.8.0 — 2026-10-14 (GitHub preview)
- Add bounded DM retries, flood fallback, cancellation, and delivery details.
- Add compact contact popups, local favorites, and Overview message scrolling improvements.

## 0.7.1 — 2026-10-14 (GitHub preview)
- Initial published Windows preview with Bluetooth messaging, contact cards, maps, and local history.
