# Changelog

## Unreleased

- Give MeshMapper a separate zoom12 and Windows PC-location center; enable green and red coverage layers, with labeled region fallback when location is unavailable. Start the main window maximized while retaining manual compact controls. [#68](https://github.com/njsnowman/nightlink/issues/68)

- Use regional zoom9 on initial display and Recenter across CoreScope, Radio map and MeshMapper. Preserve manual viewport adjustments and message-path route fitting. [#67](https://github.com/njsnowman/nightlink/issues/67)

- Show lazy compact webpage cards with site-provided thumbnails and metadata in channels and DMs, with a Settings opt-out. Native public-HTTPS fetches are bounded and do not execute website scripts or use signed-in cookies. [#66](https://github.com/njsnowman/nightlink/issues/66)

- Add an opt-in startup password and authenticator-code lock with verified enrollment, one-time recovery codes, replay prevention and persisted attempt limits. Credentials use password-derived encryption plus Windows DPAPI. Existing history is not encrypted by this feature. [#65](https://github.com/njsnowman/nightlink/issues/65)

- Always open the main workspace on Overview at startup while retaining the saved conversation and other preferences. [#64](https://github.com/njsnowman/nightlink/issues/64)

- Apply Signal Bridge branding to application and Windows icons, and revise installer artwork and wizard styling in true black and ice blue. Preserve existing install location, profile identity and update behavior. [#63](https://github.com/njsnowman/nightlink/issues/63)

- Save a three-letter MeshMapper region code locally, defaulting to CVG; apply it to map labels, embed, reachability checks and full-map link. Configure from Network or Settings. [#62](https://github.com/njsnowman/nightlink/issues/62)

- Add session-only CLI Terminal in Radio Tools for supported companion firmware and authenticated repeater/room commands. Restore visible Add channel actions in Messages, Overview and Conversations. [#61](https://github.com/njsnowman/nightlink/issues/61)

- Display bounded HTTPS image and Giphy previews in channel messages and direct conversations, retaining original text and a source link. Images load over the viewer’s Internet connection, not over the radio. [#60](https://github.com/njsnowman/nightlink/issues/60)

- Center Radio map on valid radio-reported coordinates at zoom12, preserve user panning across contact updates, and recenter on source entry or request. Add Network-only MeshMapper CVG coverage embed, fixed full-map link and local fallback on service/offline failure. Tracked in [#59](https://github.com/njsnowman/nightlink/issues/59).

- Open Network CoreScope centered on radio-reported coordinates at zoom9, two levels wider; keep Overview/echo zoom11 and regional fallback zoom9. Add bounded Windows service health checks and automatic local-map fallback for unavailable CoreScope, even when Windows reports online. Tracked in [#58](https://github.com/njsnowman/nightlink/issues/58).

- Standardize the top-right Search, layout, connection and startup action controls with one SVG icon family, matching dimensions and focus states. Fold radio status into the connection control and remove redundant badge/decoration. Tracked in [#57](https://github.com/njsnowman/nightlink/issues/57).

- Add an opt-in Windows startup connection to the last synchronized Bluetooth or uniquely identified USB radio. Limit startup attempts, expose Cancel/Retry, and pause on synchronization failure. USB devices without a hardware serial require manual selection. Tracked in [#56](https://github.com/njsnowman/nightlink/issues/56).

- Consolidate channel and direct-message navigation under Messages; retain five main destinations, one top-bar search and optional collapsed conversation shortcuts. Group secondary Activity and Diagnostics tools. Preserve combined unread counts and channel selector state across message updates. Tracked in [#55](https://github.com/njsnowman/nightlink/issues/55).


## 0.8.22-rc.1 — local candidate

- Add full public-key comparison records and identity QR display/import, with familiar-name/different-key warnings and explicit channel-name authentication limits.
- Add passive RF Trends with time buckets, SNR medians/ranges, observation counts and data-gap/last-link limitations.
- Add private local map points with editable coordinates/notes, safe rendering and backup merge support.
- Refine the angular Signal Console surfaces, focus states and compact dialogs across all accent palettes. Tracked in [#54](https://github.com/njsnowman/nightlink/issues/54).
- Integrate the queue-notification catch-up fix and prevent stopped/replaced queue fetches from reporting stale completion. Physical nonempty M1 backlog confirmation remains pending under [#49](https://github.com/njsnowman/nightlink/issues/49).

## 0.8.21-rc.8 — local candidate

- Center CoreScope on valid radio-reported coordinates at zoom 11, use a labeled regional fallback at zoom 9, and provide Recenter in Overview, Network and #echo. Reposition on radio identity/location changes without resetting on ordinary messages. Tracked in [#51](https://github.com/njsnowman/nightlink/issues/51).

## 0.8.21-rc.7 — local candidate

- Open an adjustable chat/CoreScope split only for the selected #echo channel, with Chat/Map/Split controls, regional observer map, and local street-map fallback offline. Observer activity remains separate from delivery status. Tracked in [#51](https://github.com/njsnowman/nightlink/issues/51).

## 0.8.21-rc.6 — local candidate

- Use ice blue as the default display accent, with persistent amber, emerald and violet options in Settings. Apply the selection to native DMs and use angular panel corner accents while preserving semantic status colors. Tracked in [#51](https://github.com/njsnowman/nightlink/issues/51).

## 0.8.21-rc.5 — local candidate

- Release native DM window ownership while a workspace dialog is open so contact cards, secondary menus and delivery details can appear in front. Restore normal ownership on dismissal. Tracked in [#53](https://github.com/njsnowman/nightlink/issues/53).

## 0.8.21-rc.4 — local candidate

- Open only the compact DM window from contact actions, preserving the main page and reusing the existing window for that person.
- Re-resolve channel sender identity when opening a contact card or starting a DM. Saved companion, prior link and unique name/nickname matches open the addressed DM directly. Replace the companion chooser with inline one-time full-key setup for unresolved senders.
- Present contact portrait, displayed/advertised name, node type, local received-message evidence, last advert, stored route and read-only notes; keep editing and full identity secondary. Track in [#53](https://github.com/njsnowman/nightlink/issues/53).
- Serve the new theme/message helper in browser preview and update integration checks for boxed hop/portrait placement.


## 0.8.21-rc.3 — local candidate

- Match Signal Console message anatomy across Overview, Messages and direct messages: circular contact image, name/time/hop label header and message bubble below. Keep contact-card and channel route actions; preserve delivery controls and use unknown/outgoing labels when no received hop count exists. Tracked in [#51](https://github.com/njsnowman/nightlink/issues/51).


## 0.8.21-rc.2 — local candidate

- Apply the approved cyan glass theme, original SVG navigation icons, readable message bubbles, compact icon rail and a connection-state signal indicator. Match native direct-message surfaces. Retain dedicated Radio tools, regional CoreScope start and no outer workspace scrolling. Tracked in [#51](https://github.com/njsnowman/nightlink/issues/51).
- Presentation changes only; no reconnect fix or physical-radio validation claim.


## 0.8.21-rc.1 — local candidate

- Move device status and maintenance controls to a main Radio page. Remove radio and contacts panels from Overview; prioritize messages beside a compact map, with expandable map preview at smaller widths.
- Start CoreScope over the Batesville–Cincinnati–Indianapolis region on Overview and Network. Tracked in [#51](https://github.com/njsnowman/nightlink/issues/51).
- This layout candidate does not include the pending reconnect patch in #50.


## 0.8.19 — 2026-10-17

- Add a compact Diagnostics workspace with per-radio recorded event replay, raw RX packet field inspection, passive placement comparisons and reception summaries. Evidence and map packs use separate IndexedDB storage.
- Import attributed raster MBTiles or JSON packs, show coverage and open the downloaded area. Fall back from CoreScope to local maps when offline or initial frame loading fails; coverage depends on the imported pack.
- Add optional local whisper.cpp dictation with transcript review and local-system-voice DM reading. Runtime and model are configured separately.
- Track implementation and validation in [#43](https://github.com/njsnowman/nightlink/issues/43). Validation is recorded in releases/0.8.19.md.

## 0.8.18 — 2026-10-17

- Open Overview and main Messages at the newest message and follow incoming messages without requiring Jump to latest. [#47](https://github.com/njsnowman/nightlink/issues/47)

## 0.8.17 — 2026-10-17

- Keep one top-right connection action with connected status, fit discovery controls above progress without scrolling, and enter Overview automatically after successful synchronization. [#45](https://github.com/njsnowman/nightlink/issues/45)

## 0.8.16 — 2026-10-16

- Keep the desktop radio session running when closing to the tray; add unread DM/mention counts, native conversation notifications, local quiet hours and explicit disconnect-on-quit. Tracked in [#40](https://github.com/njsnowman/nightlink/issues/40).

## 0.8.15 — 2026-10-16

- Add black technical artwork and cyan and ice blue accents to the Windows installer while preserving installation-folder and shortcut options. [#39](https://github.com/njsnowman/nightlink/issues/39)

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

