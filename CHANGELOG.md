# Changelog

## 0.8.15 — 2026-10-16

- Add USB serial companion connections alongside Bluetooth, explicit connection selection, bounded serial parsing and disconnect/reconnect handling. Tracked in [#37](https://github.com/njsnowman/nightlink/issues/37).

- Add the OKI Mesh CoreScope online view as the default Overview and Network map, with a radio-map switch, remote-content isolation and offline guidance. Tracked in [#35](https://github.com/njsnowman/nightlink/issues/35).

- Finish advert actions with an explicit result and Done button; clear the busy cursor on success and error. Physical M1 testing confirmed command acceptance for local and flood adverts.

- Add manual local/flood adverts and signed contact sharing/import by link and QR image. Imports require radio contact readback; exports omit local contact-card data. Tracked in [#33](https://github.com/njsnowman/nightlink/issues/33).

## 0.8.14 — 2026-10-16

- Consolidate sidebar navigation, bound channel/recent-chat shortcuts, add searchable conversation browsing and fit the application frame within the window with contained panel scrolling. Tracked in [#30](https://github.com/njsnowman/nightlink/issues/30).

## 0.8.13 — 2026-10-16

- Add weekly local backup reminders with snooze and distinguish confirmed desktop saves from browser export starts. Tracked in [#27](https://github.com/njsnowman/nightlink/issues/27).

## 0.8.12 — 2026-10-16

- Preserve per-radio conversation drafts and DM reading anchors, add DM navigation to newest messages, and keep active mention selection during background renders. Tracked in [#24](https://github.com/njsnowman/nightlink/issues/24).

## 0.8.11 — 2026-10-16

- Add Radio Health with session connection uptime, successful reconnections, synchronization activity and separate local-history and radio-queue counts. Tracked in [#21](https://github.com/njsnowman/nightlink/issues/21).

## 0.8.10 — 2026-10-16

- Clarify message delivery states and add guarded retry confirmation in main and DM windows. Radio acceptance of a channel broadcast does not imply recipient acknowledgement. Tracked in [#18](https://github.com/njsnowman/nightlink/issues/18).

## 0.8.9 — 2026-10-16

- Add per-user Windows installer and optional update checks with signed-in GitHub fallback for private releases. Retain the portable build and existing user-data location. Tracked in [#15](https://github.com/njsnowman/nightlink/issues/15).

## 0.8.8 — 2026-10-16

- Add local backup export and restore preview, message deduplication, contact/preference preservation, and interrupted-restore recovery. Tracked in [#12](https://github.com/njsnowman/nightlink/issues/12).

Contact storage upgrades to IndexedDB version 2. Older Nightlink versions requesting version 1 may not open upgraded contact cards.

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

