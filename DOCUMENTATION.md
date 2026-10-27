# Nightlink documentation

Updated 2026-10-27 for public stable **0.8.22**. Tracking: [#92](https://github.com/njsnowman/nightlink/issues/92).

## Start here

- [Downloads, screenshots and checksums](https://github.com/njsnowman/nightlink/releases/tag/v0.8.22)
- [Illustrated user guide](USER_GUIDE.md)
- [Release record and validation limits](releases/0.8.22.md)
- [Changelog](CHANGELOG.md)

## Operating guides

- Connection: [startup connection](STARTUP_CONNECTION.md), [Windows tray](WINDOWS_TRAY.md), [message retries](SEND_RETRIES.md).
- Maps: [CoreScope and MeshMapper](CORESCOPE_MAP.md), [offline maps](OFFLINE_MAPS.md), [local tools and private points](LOCAL_CLIENT_TOOLS.md).
- Radio: [tools and adverts](RADIO_TOOLS.md), [CLI](RADIO_CLI.md), [node discovery](NODE_DISCOVERY.md), [diagnostics](DIAGNOSTICS.md), [field test procedure](FIELD_TEST.md).
- Privacy and display: [optional app lock](SECURITY.md), [link previews](LINK_PREVIEWS.md), [login transition](LOGIN_TRANSITION.md), [branding](BRANDING.md), [local voice](LOCAL_VOICE.md).
- Distribution: [updates](UPDATES.md), [installer design](INSTALLER_DESIGN.md), [release process](RELEASE_PROCESS.md), [readiness history](RELEASE_READINESS.md).

## Evidence records

Validation documents retain dated results and their original scope. They do not establish blanket hardware compatibility. See the current release record before interpreting older pending or unpublished statements.

- [Attention](ATTENTION_VALIDATION.md), [backup](BACKUP_VALIDATION.md), [backup reminders](BACKUP_REMINDERS_VALIDATION.md), [delivery clarity](DELIVERY_CLARITY_VALIDATION.md), [draft continuity](DRAFTS_CONTINUITY_VALIDATION.md).
- [Installer and updates](INSTALLER_UPDATES_VALIDATION.md), [navigation](NAVIGATION_LAYOUT_VALIDATION.md), [radio health](RADIO_HEALTH_VALIDATION.md), [reconnect catch-up](RECONNECT_CATCHUP_VALIDATION.md), [search](SEARCH_VALIDATION.md), [USB](USB_VALIDATION.md).
- Historical [advanced validation](ADVANCED_VALIDATION_PROGRESS.md), [0.8.9 notes](RELEASE_0.8.9.md), and versioned records under `releases/`.

## Current boundaries

Core Bluetooth/USB messaging needs no internet or cloud account. CoreScope, MeshMapper, uncached online tiles, URL previews and update checks require internet. Imported offline maps cover only their supplied areas and zoom levels.

The radio has a finite pending queue, not a shared permanent archive. Another client can consume messages before Nightlink connects. The optional startup lock does not encrypt history or exported backups. Update checks open downloads; they do not install silently. Both 0.8.22 executables are unsigned.

A returned direct repeater trace was physically confirmed on the recorded Heltec USB setup. Earlier timeouts remain unexplained; multihop reliability is unverified. Installer lifecycle/multiple-DPI and production lock re-enrollment checks remain outstanding under the documented owner-approved 0.8.22 publication exception.

## Documentation delivery

Repository documentation can be read now. Bundled Help source changes appear in the next packaged build; published 0.8.22 executables and checksums are unchanged. Guide and release screenshots use labeled fictional data.
