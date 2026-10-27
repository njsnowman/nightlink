# Nightlink 0.8.22 release readiness

Tracking: [#74](https://github.com/njsnowman/nightlink/issues/74). This consolidates the candidate branch; it is not authorization to bypass RELEASE_PROCESS.md.

## Scope

The consolidated [changelog](CHANGELOG.md) describes final behavior rather than intermediate zoom/theme defaults. The candidate includes navigation/DM refinements, CoreScope/MeshMapper and local-map handling, preview cards, optional startup lock/vault, Windows startup connection, radio CLI, branding and black/console surface schemes.

## Acceptance matrix

| Area | Evidence | Status |
| --- | --- | --- |
| Protocol, transport, history, backup and safety logic | Full package unit suite | See latest candidate validation record for current count; earlier consolidated baseline passed 173 |
| Workspace, maps, lock and detached DMs | Browser and native isolated fixtures | Browser and packaged native checks passed |
| Stable 0.8.19 → consolidated history/cards/preferences | Actual old/new app.asar with one isolated profile | Payload upgrade; not installer evidence |
| Optional lock migration | rc.12 → consolidated DPAPI store and login | Payload upgrade; synthetic credentials |
| Profile identity/retention | appId local.meshline.desktop; name meshline; userData Meshline; deleteAppDataOnUninstall false | Source-reviewed |
| Physical M1 retained-message recovery | rc.35 nonempty queue/reconnect/offline persistence, no Refresh; two test messages merged into normal history after authorized lock recovery | **Passed: #49**; original historical incidents not fully attributed |
| Installer lifecycle and appearance | Exact final NSIS artifact; clean install, upgrade, uninstall retaining synthetic profile; welcome/directory/shortcut/progress/finish at multiple DPI | **Open: #63** |

Actual installer tests must use an isolated Windows account/VM. Payload replacement, artwork inspection and a successful build do not substitute for installer evidence. No production profile is used by regression fixtures. Physical evidence is recorded separately.

## Upgrade checks

Run consolidation-upgrade.native.test.cjs with stable0.8.19 app.asar, candidate app.asar and matching diagnostic Electron. It verifies exact retained channel/DM histories, profile/channels, nicknames/photos/notes, drafts and local preferences, black default and saved console choice.

Run consolidation-security-upgrade.native.test.cjs with rc.12 app.asar, candidate app.asar and matching runtime. It verifies DPAPI bytes survive payload replacement, lock precedes workspace bridges, recovery/TOTP login, disable/restart and corrupt-store fail-closed.

Neither test installs/uninstalls Nightlink or contacts a radio. New backup exports also carry validated scheme, region and webpage-preview choices. Security credentials and startup device state remain outside JSON message backups.

## Publication rule

Until remaining applicable installer/security/radio gates have recorded evidence, distribute only a clearly labeled local candidate. Do not create a stable tag or public GitHub release. Final candidate record must identify source commit, test commands/results, artifact sizes and SHA-256 checksums. Do not claim comprehensive hardware compatibility or actual installer-upgrade preservation from synthetic/payload tests. The workbench acceptance scope is tracked in #89; local lock reset does not establish new production enrollment/restart acceptance under #87.

## Consolidated candidate evidence

The upgrade fixture retained two exact messages (channel and DM), one full custom contact card including image/notes, two channels, two drafts and four saved preferences. A new black default and an explicit console override both survived restart. The security fixture retained identical protected-store bytes at first post-upgrade lock, then verified recovery/TOTP login, disable and corrupt-state rejection. These are small controlled synthetic datasets; they do not establish arbitrary real-world profile or installer compatibility. Final source/artifact checksums and detailed commands are in releases/0.8.22-rc.21.md.

## Acceptance follow-up

See [acceptance follow-up](releases/0.8.22-acceptance.md) for reverified rc.21 checksums and actual welcome/directory/shortcut-page inspection without installation. Full lifecycle, progress/finish and multiple-DPI evidence remain open. No production profile or radio was changed.

## rc.42 readiness follow-up (2026-10-27)

The unchanged [rc.42 Portable artifact](releases/0.8.22-rc.42.md) was rechecked: SHA-256 `4612587d67ff6b0d4db6fe31803f5186c0fa5b272e5d6c890bff5763478e9274`. Full current-source unit suite: 201 passed.

Both isolated cross-payload upgrade fixtures passed against the exact rc.42 app.asar: stable 0.8.19 history/cards/drafts/preferences and restart retention; rc.12 protected app-lock store, recovery/TOTP login, disable/restart and corrupt-state rejection. Synthetic data and credentials only. These tests do not establish production re-enrollment or actual installer lifecycle acceptance.

Remaining publication gates are unchanged: #63 requires a permitted isolated Windows installer environment (installer remains on user-requested hold; North Pole VM excluded); #89 lacks a successful physical returned trace; #87 production optional-lock re-enrollment/restart is not verified. No physical transmissions, firmware/settings changes, production-profile edits, installer publication or update-feed change occurred in this follow-up. Continue local diagnostic distribution only.

## rc.43 workbench and hardware follow-up (2026-10-27)

See [rc.43 record](releases/0.8.22-rc.43.md) for source/checksum and separate automated versus physical evidence. Full unit suite: 202 passed; exact-package workbench, interface/readability, offline Help and nine-process Windows protected-store checks passed with isolated synthetic data.

Heltec USB synchronization, noise/battery read, discovery (two repeaters) and valid RX observations passed; one trace was accepted and aggregate direct-TX counter increased, but no trace reply returned. Physical trace remains incomplete. Sixteen received messages were safely merged into normal history and verified after reload. User reaffirmed installer hold and exclusion of North Pole VM. No new firmware/radio configuration, installer publication or update-feed changes. A known-working trace target is requested before another RF attempt.
