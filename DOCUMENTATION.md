# Nightlink documentation

Updated 2026-10-31. Public stable release: **0.8.26** (published 2026-10-31). Tracking: [#104](https://github.com/njsnowman/nightlink/issues/104), [#109](https://github.com/njsnowman/nightlink/issues/109).

## Start here

- [Downloads, screenshots and checksums](https://github.com/njsnowman/nightlink/releases/tag/v0.8.24)
- [Illustrated user guide](USER_GUIDE.md)
- [0.8.24 release record and validation limits](releases/0.8.24.md)
- [0.8.26 release record](releases/0.8.26.md), [readiness](releases/0.8.26-readiness.md), [physical acceptance](releases/0.8.26-hardware-acceptance.md) and [release notes](releases/0.8.26-github-release.md)
- [Install or upgrade](README.md#install-or-upgrade)
- [Changelog](CHANGELOG.md)

## Operating guides

- Messaging: [received emoji reactions](REACTIONS.md).
- Connection: [startup connection](STARTUP_CONNECTION.md), [Windows tray](WINDOWS_TRAY.md), [message retries](SEND_RETRIES.md).
- Device configuration: [Device Center](docs/device-management.md) for companions, authenticated repeaters/rooms and direct USB text-CLI setup.
- Contacts: Contact card > More > Remove from radio and Remove all except favorites (see [Radio Tools](RADIO_TOOLS.md#contact-maintenance)).
- Maps: [CoreScope and MeshMapper](CORESCOPE_MAP.md), including map visibility settings and the Overview and #echo splits, [offline maps](OFFLINE_MAPS.md), [local tools and private points](LOCAL_CLIENT_TOOLS.md).
- Radio: [tools and adverts](RADIO_TOOLS.md), [CLI](RADIO_CLI.md), [node discovery](NODE_DISCOVERY.md), [diagnostics](DIAGNOSTICS.md), [field test procedure](FIELD_TEST.md).
- Privacy and display: [optional app lock](SECURITY.md), [link previews](LINK_PREVIEWS.md), [login transition](LOGIN_TRANSITION.md), [branding](BRANDING.md), [local voice](LOCAL_VOICE.md).
- Interface: [design system](DESIGN_SYSTEM.md).
- Distribution: [updates](UPDATES.md), [installer design](INSTALLER_DESIGN.md), [release process](RELEASE_PROCESS.md), [readiness history](RELEASE_READINESS.md) (historical; current gates are in the 0.8.26 readiness record).

## Evidence records

Validation documents retain dated results and their original scope. They do not establish blanket hardware compatibility. See the current release record before interpreting older pending or unpublished statements.

- [Attention](ATTENTION_VALIDATION.md), [backup](BACKUP_VALIDATION.md), [backup reminders](BACKUP_REMINDERS_VALIDATION.md), [delivery clarity](DELIVERY_CLARITY_VALIDATION.md), [draft continuity](DRAFTS_CONTINUITY_VALIDATION.md).
- [Installer and updates](INSTALLER_UPDATES_VALIDATION.md), [navigation](NAVIGATION_LAYOUT_VALIDATION.md), [radio health](RADIO_HEALTH_VALIDATION.md), [reconnect catch-up](RECONNECT_CATCHUP_VALIDATION.md), [search](SEARCH_VALIDATION.md), [USB](USB_VALIDATION.md).
- Historical [advanced validation](ADVANCED_VALIDATION_PROGRESS.md), [0.8.9 notes](RELEASE_0.8.9.md), and versioned records under `releases/`.

## Current boundaries

Core Bluetooth/USB messaging needs no internet or cloud account. CoreScope, MeshMapper, uncached online tiles, URL previews and update checks require internet. Imported offline maps cover only their supplied areas and zoom levels.

The radio has a finite pending queue, not a shared permanent archive. Another client can consume messages before Nightlink connects. The optional startup lock does not encrypt history or exported backups. Update checks open downloads; they do not install silently. The 0.8.24 and 0.8.26 executables are unsigned.

A returned direct repeater trace was physically confirmed on the recorded Heltec USB setup. Earlier timeouts remain unexplained; multihop reliability is unverified. For 0.8.26, owner-reported rc.17 checks cover V4 single and bulk contact removal, one DM with recipient ACK, and a Windows Sandbox clean install, 0.8.24 upgrade and display scaling. Direct USB setup, remote RF changes and other device roles, normal-profile optional-lock enrollment, hidden-window DM presentation, the completion sound and reaction interoperability remain unverified and are disclosed.

## Documentation delivery

Repository documentation may describe features after the latest published release. Bundled Help is packaged with each executable and reflects its version. Guide and release screenshots use labeled fictional data.
