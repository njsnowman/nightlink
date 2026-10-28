# Changelog

## Unreleased

- Add Contact card > More > Remove from radio with confirmation, full-key targeting and verified contact-list readback. Retain saved messages and personal contact details. [#102](https://github.com/njsnowman/nightlink/issues/102).

- Add active/unconfirmed Outbox review, intentional reading-position memory in main and detached chats, a resizable Overview split and a local support report with allowlisted operational metadata. [#101](https://github.com/njsnowman/nightlink/issues/101).

- Keep RX activity independent of outgoing TX/ACK state so fast #echo replies remain visible during active sends and repeated screen refreshes. Burst replies extend the receive indication. [#100](https://github.com/njsnowman/nightlink/issues/100).

- Distinguish transport connection, queue catch-up and completed synchronization in the existing radio control; show the last successful full-sync time for this session. Add an activity inbox for unread DMs, mentions and sends needing review, with source-message navigation and protection against marking chats read behind a dialog. [#99](https://github.com/njsnowman/nightlink/issues/99).

- Add Signal Rail activity indicators to channel chats and DM windows, with distinct receive, sending, awaiting ACK, recipient confirmation, radio acceptance and error states. Respect reduced motion and suppress saved-history activity flashes. [#97](https://github.com/njsnowman/nightlink/issues/97).

## 0.8.24 � 2026-10-27

- Animate awaiting-ACK badges with reduced-motion support; add a once-per-message completion sound with mute/quiet-hours controls. Restore native DM presentation for hidden windows and retain explicit open/focus intent during startup. [#96](https://github.com/njsnowman/nightlink/issues/96).

- Reconcile exact-key contact removal notifications and rejected DM recipients with the current radio list. Preserve history/cards and drafts; distinguish an unaccepted send from a missing ACK, and show missing-contact availability separately from Bluetooth connection. [#95](https://github.com/njsnowman/nightlink/issues/95).

- Recognize received MeshCore One emoji reactions in channels and DMs. Match retained originals by exact message text/timestamp and conversation; display deduplicated reaction chips or an explicit unmatched notice instead of a raw hash line. Preserve stored wire text and ordinary messages. [#94](https://github.com/njsnowman/nightlink/issues/94).

## 0.8.23 — 2026-10-27

- Refresh documentation for the public 0.8.22 release, current radio tools, update behavior and validation limits. Expand bundled Help source; published 0.8.22 binaries remain unchanged. Package as 0.8.23 under [#93](https://github.com/njsnowman/nightlink/issues/93). [#92](https://github.com/njsnowman/nightlink/issues/92).

## 0.8.22 — 2026-10-27

- Distinguish absent, unrelated and invalid trace response frames after a companion-accepted timeout. Retain counters only, without packet contents or automatic retries. This does not establish a physical trace fix. [#89](https://github.com/njsnowman/nightlink/issues/89).

- Add Copy public ID to Radio status and shared-contact export. Copy the full public key with a selectable fallback when clipboard access is unavailable. [#91](https://github.com/njsnowman/nightlink/issues/91).

- Add a bundled two-tone mention chime and Notifications test control. Animate consecutive located message hops with replay and reduced-motion support; unknown location gaps remain unconnected. [#90](https://github.com/njsnowman/nightlink/issues/90).

- Emphasize exact radio-name mentions with a contrasting border and Mentioned you badge in channels, Overview and detached DMs; match case-insensitive bracketed and simple mention forms without prefix/substring matches. Notification and read rules remain unchanged. [#90](https://github.com/njsnowman/nightlink/issues/90).

- Consolidate Radio connection/sync status, session-specific completion time, distinct new-message/queue-frame counts and guarded Refresh/Reconnect/Diagnostics controls. Keep storage errors and recovery notices explicit. [#91](https://github.com/njsnowman/nightlink/issues/91).

- Distinguish outgoing messages with an accent edge, tinted body and You badge across channel chats, Overview and detached DMs. Redesign message paths with larger numbered hop cards and explicit evidence/location gaps. [#90](https://github.com/njsnowman/nightlink/issues/90).
- Make repeater-name selection and visual forwarding routes primary; place raw hashes under Advanced. Show companion queue acceptance separately from returned trace and use a bounded firmware-based reply deadline. [#89](https://github.com/njsnowman/nightlink/issues/89).

- Omit the originating companion from generated trace forwarding routes; companions with repetition disabled must receive the completed trace rather than forward it. [#89](https://github.com/njsnowman/nightlink/issues/89).

- Add a consolidated Radio workbench with manual trace, offline geometric planning, RX observations, noise-floor reads, discovery and CLI. Physical Heltec USB checks confirmed synchronization, noise/battery reads, discovery, RX observations and one returned direct repeater trace. Earlier trace timeouts remain unexplained; multihop performance is unverified. [#89](https://github.com/njsnowman/nightlink/issues/89).

- Use the asynchronous Windows protected-storage provider for startup-lock reads and atomic writes. Add real Windows process-restart coverage for enrollment, recovery replay protection, disabling and readable legacy ciphertext. Unreadable existing settings remain locked and unchanged; this does not recover a lost encryption key. [#87](https://github.com/njsnowman/nightlink/issues/87)

- Add About purpose statement explaining MeshCore-based off-grid core messaging without an internet connection, cloud account or online service; distinguish optional internet features. [#86](https://github.com/njsnowman/nightlink/issues/86)

- Add bundled Help & About with 19 searchable task guides, eight application screenshots using fictional demonstration data, installed version, support links and bundled library notices. Keep guide scrolling within its content pane and provide a Tools shortcut. [#85](https://github.com/njsnowman/nightlink/issues/85)

- Support installed candidate versions when comparing with approved stable releases; retain stable-only feed selection and restricted download URLs. Hide stale update banners after failed checks. [#84](https://github.com/njsnowman/nightlink/issues/84)

- Simplify Messages navigation with Channels and Direct Messages as primary destinations, secondary Search/Browse/Add channel actions under More, and channels-first sidebar entry. Preserve explicit direct-conversation actions. [#83](https://github.com/njsnowman/nightlink/issues/83)

- Add manual direct-range node discovery under Contacts and Radio Tools, with type filters, tagged responses, signal readings, bounded scan/cooldown and explicit contact addition. Add local saved-contact filtering by name, nickname, key and type. Discovery identities are not automatically trusted or saved; no background scans. [#82](https://github.com/njsnowman/nightlink/issues/82)

- Simplify radio loading to a compact status card and one motion-aware ring; remove visible terminal, counters and phase tracker. Preserve transport choice, cancel/retry, error details and automatic Overview entry. [#81](https://github.com/njsnowman/nightlink/issues/81)

- Replace legacy cyan installer branding with Switchboard black/amber artwork, custom welcome/options/completion pages and matching native-page colors. Preserve per-user setup, optional shortcut and retained app data. Installer visual/lifecycle acceptance remains separate from compilation. [#80](https://github.com/njsnowman/nightlink/issues/80)

- Separate message interactions: body selects a reply with local context and channel sender mention, hop badge opens route details/map, and sender opens contact/DM actions. Preserve drafts and nested link/mention actions; detached-DM route requests are checked against that window’s message snapshot. Reply context is local, not protocol threading. [#79](https://github.com/njsnowman/nightlink/issues/79)

- Restore explicit MeshMapper recentering when Windows returns unchanged coordinates; coalesce repeated clicks and ignore late location completion after navigation. [#78](https://github.com/njsnowman/nightlink/issues/78)

- Bound mounted conversation rows to 120 with archive paging and search navigation; retain unchanged detached-DM content and suppress duplicate snapshots. Reuse unchanged map frames, pause hidden health probes, retain unchanged signal/chart controls, and add session phase timings in Radio Health. Timings distinguish page loading from live feed readiness. [#78](https://github.com/njsnowman/nightlink/issues/78)

- Keep a loaded CoreScope page open during health-only failures, warn without claiming a live feed, and allow up to 120 seconds for initial page loading. Offline and frame-error fallback remain available. [#77](https://github.com/njsnowman/nightlink/issues/77)

- Retry the selected remote map automatically after transient fallback; require consecutive failed health checks and allow a bounded longer initial embed load. [#77](https://github.com/njsnowman/nightlink/issues/77)

- Group existing Settings controls by task and align contact cards, map selectors and messaging controls with Switchboard. Preserve providers and radio behavior. [#76](https://github.com/njsnowman/nightlink/issues/76)

- Implement the Switchboard interface with amber defaults, compact channel navigation, flat message rows, and a passive signal summary. Preserve saved accents and radio behavior. Tracking: [#75](https://github.com/njsnowman/nightlink/issues/75).

Release scope and validation gates: [#74](https://github.com/njsnowman/nightlink/issues/74), [release readiness](RELEASE_READINESS.md). Stable 0.8.22 was published under the owner-approved exception recorded in release readiness. Installer lifecycle/multiple-DPI checks and production lock re-enrollment remain unverified; neither is represented as passed.

- Consolidate navigation under Overview, Messages, Network, Contacts and Radio; group secondary tools and unify top-right actions. Start maximized on Overview while preserving session compact controls. [#55](https://github.com/njsnowman/nightlink/issues/55), [#57](https://github.com/njsnowman/nightlink/issues/57), [#64](https://github.com/njsnowman/nightlink/issues/64)
- Apply Signal Bridge icons and installer artwork; default workspace and detached DMs to Dark black, retain Blue-black console and four independent accents. [#63](https://github.com/njsnowman/nightlink/issues/63), [#73](https://github.com/njsnowman/nightlink/issues/73)
- Open Overview directly with CoreScope loading, independent of Network selection. CoreScope/Radio map default to radio-centered zoom9. MeshMapper uses Windows PC location at zoom12 with green/red coverage layers, saved region and labeled fallback. Preserve automatic local-map fallback and the echo-only split. [#58](https://github.com/njsnowman/nightlink/issues/58), [#62](https://github.com/njsnowman/nightlink/issues/62), [#68](https://github.com/njsnowman/nightlink/issues/68), [#71](https://github.com/njsnowman/nightlink/issues/71), [#72](https://github.com/njsnowman/nightlink/issues/72)
- Add bounded image/Giphy and webpage previews in channel/Overview/DM messages, with preview opt-out and native URL/fetch limits. [#60](https://github.com/njsnowman/nightlink/issues/60), [#66](https://github.com/njsnowman/nightlink/issues/66)
- Add opt-in startup password/authenticator lock, recovery codes and post-login vault transition. This does not encrypt existing message history. [#65](https://github.com/njsnowman/nightlink/issues/65), [#69](https://github.com/njsnowman/nightlink/issues/69), [#70](https://github.com/njsnowman/nightlink/issues/70)
- Add bounded opt-in startup connection to the last synchronized device, session-only radio CLI and restored Add channel actions. [#56](https://github.com/njsnowman/nightlink/issues/56), [#61](https://github.com/njsnowman/nightlink/issues/61)
- Include identity comparisons, passive RF trends, private map points and queue-notification catch-up changes; physical nonempty M1 backlog recovery was verified in the recorded M1 test; queues remain finite and can be consumed by another client. [#54](https://github.com/njsnowman/nightlink/issues/54), [#49](https://github.com/njsnowman/nightlink/issues/49)
- Complete packaged web-asset serving in development preview, include validated MeshMapper region/webpage-preview choices in backup exports, and add isolated payload-upgrade checks for history, cards, drafts, preferences and security state. [#74](https://github.com/njsnowman/nightlink/issues/74)


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

