# Nightlink GitHub reconciliation audit — 2026-10-28

Read-only inventory: 86 issues (41 open), 20 PRs (3 open), 20 public release records, 21 branches, 190 issue/PR conversation comments and 13 workflow runs. Snapshot files remain local. Scope verifies repository metadata, current source/CI and installed feature provenance; historical executable payloads were not all redownloaded or retested.

## Confirmed regression

PR #106 and PR #98 independently branch from main 9ad2ca280149102a7fde841e04ebcdc0aecea529. The installed 0.8.25 archive has the new layout stylesheet but omits 17 rc.5 assets. Six key installed code/style files match #106's current source. Missing assets include the four Echo command buttons, single/bulk contact deletion, Signal Rail, activity inbox/Outbox, connection readiness, support export, adjustable workspace and destroyed-window guard. This is missing source integration, not a hidden-button CSS setting.

PR #106 also changes delivery and draft behavior; its description's presentation-only claim and not-yet-tested status are outdated. Latest CI passed unit and package jobs, but its test log contains 218 tests and does not include #98's feature suites or a rendered UI test. Earlier two Echo assertion revisions failed before the latest success. The CI candidate is an Actions artifact, not a public stable 0.8.25 release. Latest public stable remains v0.8.24.

## Reconciliation

The combined branch retains both complete histories, all 193 explicit app assets, UI spacing/compact Echo controls, DM acceptance/draft corrections and current features. Required-feature asset tests, complete-suite retention checks, real renderer send/draft checks and a cross-screen compact screenshot matrix now gate packaging. Artifact names derive from package version; package verification emits source commit, checksums and an asset manifest. Candidate version is 0.8.26-rc.1 to distinguish it from the installed 0.8.25 UI-only build.

PR #50 is a historical open draft whose queue-boundary recovery scope has subsequent implementation and physical evidence under closed #49. It should be reconciled with current source before closure; it was not merged by this audit. Many open feature issues #51–#91 have implementation/validation comments already shipped in #52 and stable releases. Open status alone does not mean the feature is missing. Hardware, production-lock, installer/DPI and external-service limitations remain distinct. No issues are auto-closed from textual claims alone.

## Every issue

| Issue | State | Latest recorded evidence |
| --- | --- | --- |
| [#1 Bluetooth connection cycles during initial synchronization ](https://github.com/njsnowman/nightlink/issues/1) | closed | [Latest comment](https://github.com/njsnowman/nightlink/issues/1#issuecomment-6201384936) |
| [#2 Improve text readability across desktop and compact layouts ](https://github.com/njsnowman/nightlink/issues/2) | closed | [Latest comment](https://github.com/njsnowman/nightlink/issues/2#issuecomment-6201548572) |
| [#3 Add connection progress window with terminal-style status display ](https://github.com/njsnowman/nightlink/issues/3) | closed | [Latest comment](https://github.com/njsnowman/nightlink/issues/3#issuecomment-6201549236) |
| [#4 Release 0.8.5 ](https://github.com/njsnowman/nightlink/issues/4) | closed | [Latest comment](https://github.com/njsnowman/nightlink/issues/4#issuecomment-6201488965) |
| [#5 Add persistent unread state and conversation notification controls ](https://github.com/njsnowman/nightlink/issues/5) | closed | [Latest comment](https://github.com/njsnowman/nightlink/issues/5#issuecomment-6201899690) |
| [#7 Release 0.8.6 ](https://github.com/njsnowman/nightlink/issues/7) | closed | [Latest comment](https://github.com/njsnowman/nightlink/issues/7#issuecomment-6201966983) |
| [#8 Search saved messages across channels and direct conversations ](https://github.com/njsnowman/nightlink/issues/8) | closed | [Latest comment](https://github.com/njsnowman/nightlink/issues/8#issuecomment-6202113956) |
| [#10 Investigate missing previously saved Windows message history after update ](https://github.com/njsnowman/nightlink/issues/10) | closed | [Latest comment](https://github.com/njsnowman/nightlink/issues/10#issuecomment-6203261471) |
| [#11 Release 0.8.7 ](https://github.com/njsnowman/nightlink/issues/11) | closed | [Latest comment](https://github.com/njsnowman/nightlink/issues/11#issuecomment-6203291220) |
| [#12 Add local backup and restore with preview and duplicate prevention ](https://github.com/njsnowman/nightlink/issues/12) | closed | [Latest comment](https://github.com/njsnowman/nightlink/issues/12#issuecomment-6217483888) |
| [#14 Release 0.8.8 ](https://github.com/njsnowman/nightlink/issues/14) | closed | [Latest comment](https://github.com/njsnowman/nightlink/issues/14#issuecomment-6217652972) |
| [#15 Add Windows installer and user-controlled update notifications ](https://github.com/njsnowman/nightlink/issues/15) | closed | [Latest comment](https://github.com/njsnowman/nightlink/issues/15#issuecomment-6219761792) |
| [#17 Release Nightlink 0.8.9 ](https://github.com/njsnowman/nightlink/issues/17) | closed | [Latest comment](https://github.com/njsnowman/nightlink/issues/17#issuecomment-6219856294) |
| [#18 Clarify message delivery states and add explicit retry actions ](https://github.com/njsnowman/nightlink/issues/18) | closed | [Latest comment](https://github.com/njsnowman/nightlink/issues/18#issuecomment-6225169989) |
| [#20 Release Nightlink 0.8.10 ](https://github.com/njsnowman/nightlink/issues/20) | closed | [Latest comment](https://github.com/njsnowman/nightlink/issues/20#issuecomment-6225400661) |
| [#21 Add radio health and synchronization visibility ](https://github.com/njsnowman/nightlink/issues/21) | closed | [Latest comment](https://github.com/njsnowman/nightlink/issues/21#issuecomment-6225500459) |
| [#23 Release Nightlink 0.8.11 ](https://github.com/njsnowman/nightlink/issues/23) | closed | [Latest comment](https://github.com/njsnowman/nightlink/issues/23#issuecomment-6225632868) |
| [#24 Preserve conversation drafts and reading position during messaging updates ](https://github.com/njsnowman/nightlink/issues/24) | closed | [Latest comment](https://github.com/njsnowman/nightlink/issues/24#issuecomment-6225789736) |
| [#26 Release Nightlink 0.8.12 ](https://github.com/njsnowman/nightlink/issues/26) | closed | [Latest comment](https://github.com/njsnowman/nightlink/issues/26#issuecomment-6225887275) |
| [#27 Add local backup status and weekly reminders ](https://github.com/njsnowman/nightlink/issues/27) | closed | [Latest comment](https://github.com/njsnowman/nightlink/issues/27#issuecomment-6226042576) |
| [#29 Release Nightlink 0.8.13 ](https://github.com/njsnowman/nightlink/issues/29) | closed | [Latest comment](https://github.com/njsnowman/nightlink/issues/29#issuecomment-6226206083) |
| [#30 Consolidate sidebar navigation and conversation lists ](https://github.com/njsnowman/nightlink/issues/30) | closed | [Latest comment](https://github.com/njsnowman/nightlink/issues/30#issuecomment-6226448064) |
| [#32 Release Nightlink 0.8.14 ](https://github.com/njsnowman/nightlink/issues/32) | closed | [Latest comment](https://github.com/njsnowman/nightlink/issues/32#issuecomment-6226493874) |
| [#33 Add radio adverts and contact sharing tools ](https://github.com/njsnowman/nightlink/issues/33) | closed | [Latest comment](https://github.com/njsnowman/nightlink/issues/33#issuecomment-6227806006) |
| [#35 Embed OKI Mesh CoreScope in Network map with radio map switch ](https://github.com/njsnowman/nightlink/issues/35) | closed | [Latest comment](https://github.com/njsnowman/nightlink/issues/35#issuecomment-6227806179) |
| [#37 Add USB serial companion connection alongside Bluetooth ](https://github.com/njsnowman/nightlink/issues/37) | closed | [Latest comment](https://github.com/njsnowman/nightlink/issues/37#issuecomment-6227806342) |
| [#39 Apply a tactical visual theme to the Windows installer ](https://github.com/njsnowman/nightlink/issues/39) | closed | [Latest comment](https://github.com/njsnowman/nightlink/issues/39#issuecomment-6227806488) |
| [#40 Add Windows tray lifecycle and conversation notifications ](https://github.com/njsnowman/nightlink/issues/40) | closed | [Latest comment](https://github.com/njsnowman/nightlink/issues/40#issuecomment-6228847374) |
| [#42 Validate two-hour physical USB tray stability on Heltec V4 ](https://github.com/njsnowman/nightlink/issues/42) | closed | [Latest comment](https://github.com/njsnowman/nightlink/issues/42#issuecomment-6468886663) |
| [#43 Add replay, offline map packs, local voice and diagnostics workspace ](https://github.com/njsnowman/nightlink/issues/43) | closed | [Latest comment](https://github.com/njsnowman/nightlink/issues/43#issuecomment-6230472111) |
| [#45 Consolidate radio connection control and enter Overview automatically ](https://github.com/njsnowman/nightlink/issues/45) | closed | [Latest comment](https://github.com/njsnowman/nightlink/issues/45#issuecomment-6230245009) |
| [#47 Open Overview and Messages at latest message and follow incoming traffic ](https://github.com/njsnowman/nightlink/issues/47) | closed | [Latest comment](https://github.com/njsnowman/nightlink/issues/47#issuecomment-6230311604) |
| [#49 M1 reconnect did not recover queued messages until manual refresh ](https://github.com/njsnowman/nightlink/issues/49) | closed | [Latest comment](https://github.com/njsnowman/nightlink/issues/49#issuecomment-6398965479) |
| [#51 Give Overview messages usable space and move radio controls to dedicated navigation ](https://github.com/njsnowman/nightlink/issues/51) | open | [Latest comment](https://github.com/njsnowman/nightlink/issues/51#issuecomment-6244928368) |
| [#53 Open channel-sender DMs directly and improve contact card summary ](https://github.com/njsnowman/nightlink/issues/53) | open | [Latest comment](https://github.com/njsnowman/nightlink/issues/53#issuecomment-6242809072) |
| [#54 Add verified identities, RF trends and private map annotations ](https://github.com/njsnowman/nightlink/issues/54) | open | [Latest comment](https://github.com/njsnowman/nightlink/issues/54#issuecomment-6245079899) |
| [#55 Consolidate navigation and verify compact message workflows ](https://github.com/njsnowman/nightlink/issues/55) | open | [Latest comment](https://github.com/njsnowman/nightlink/issues/55#issuecomment-6245405802) |
| [#56 Add optional startup connection to last synchronized radio ](https://github.com/njsnowman/nightlink/issues/56) | open | [Latest comment](https://github.com/njsnowman/nightlink/issues/56#issuecomment-6248816262) |
| [#57 Unify top-right toolbar controls and status presentation ](https://github.com/njsnowman/nightlink/issues/57) | open | [Latest comment](https://github.com/njsnowman/nightlink/issues/57#issuecomment-6248990295) |
| [#58 Widen Network CoreScope viewport and fall back when service is unreachable ](https://github.com/njsnowman/nightlink/issues/58) | open | [Latest comment](https://github.com/njsnowman/nightlink/issues/58#issuecomment-6249245828) |
| [#59 Center Radio map on radio location and add MeshMapper CVG source ](https://github.com/njsnowman/nightlink/issues/59) | open | [Latest comment](https://github.com/njsnowman/nightlink/issues/59#issuecomment-6249674365) |
| [#60 Display linked image and Giphy previews in conversations ](https://github.com/njsnowman/nightlink/issues/60) | open | [Latest comment](https://github.com/njsnowman/nightlink/issues/60#issuecomment-6249808794) |
| [#61 Add connection-sharing radio CLI terminal ](https://github.com/njsnowman/nightlink/issues/61) | open | [Latest comment](https://github.com/njsnowman/nightlink/issues/61#issuecomment-6249917289) |
| [#62 Save a configurable MeshMapper region locally ](https://github.com/njsnowman/nightlink/issues/62) | open | [Latest comment](https://github.com/njsnowman/nightlink/issues/62#issuecomment-6250025454) |
| [#63 Apply Signal Bridge identity and redesign Windows installer ](https://github.com/njsnowman/nightlink/issues/63) | open | [Latest comment](https://github.com/njsnowman/nightlink/issues/63#issuecomment-6468990409) |
| [#64 Always open the main workspace on Overview ](https://github.com/njsnowman/nightlink/issues/64) | open | [Latest comment](https://github.com/njsnowman/nightlink/issues/64#issuecomment-6252737867) |
| [#65 Add optional password and authenticator startup lock ](https://github.com/njsnowman/nightlink/issues/65) | open | [Latest comment](https://github.com/njsnowman/nightlink/issues/65#issuecomment-6252920700) |
| [#66 Add compact webpage preview cards to conversations ](https://github.com/njsnowman/nightlink/issues/66) | open | [Latest comment](https://github.com/njsnowman/nightlink/issues/66#issuecomment-6253951133) |
| [#67 Use a consistent regional default zoom across map views ](https://github.com/njsnowman/nightlink/issues/67) | open | [Latest comment](https://github.com/njsnowman/nightlink/issues/67#issuecomment-6254169530) |
| [#68 Separate MeshMapper PC centering, closer zoom and red coverage layer ](https://github.com/njsnowman/nightlink/issues/68) | open | [Latest comment](https://github.com/njsnowman/nightlink/issues/68#issuecomment-6254335613) |
| [#69 Add approved post-login vault transition ](https://github.com/njsnowman/nightlink/issues/69) | open | [Latest comment](https://github.com/njsnowman/nightlink/issues/69#issuecomment-6254684142) |
| [#70 Show FOR THE MESH in the vault reveal ](https://github.com/njsnowman/nightlink/issues/70) | open | [Latest comment](https://github.com/njsnowman/nightlink/issues/70#issuecomment-6254815794) |
| [#71 Default Overview Live mesh to CoreScope independently of Network selection ](https://github.com/njsnowman/nightlink/issues/71) | open | [Latest comment](https://github.com/njsnowman/nightlink/issues/71#issuecomment-6254995041) |
| [#72 Prevent local Radio map flash before Overview CoreScope initializes ](https://github.com/njsnowman/nightlink/issues/72) | open | [Latest comment](https://github.com/njsnowman/nightlink/issues/72#issuecomment-6256620156) |
| [#73 Add default dark black display scheme ](https://github.com/njsnowman/nightlink/issues/73) | open | [Latest comment](https://github.com/njsnowman/nightlink/issues/73#issuecomment-6267597300) |
| [#74 Consolidate Nightlink 0.8.22 release and verify upgrade preservation ](https://github.com/njsnowman/nightlink/issues/74) | closed | [Latest comment](https://github.com/njsnowman/nightlink/issues/74#issuecomment-6445495186) |
| [#75 Implement Switchboard desktop interface ](https://github.com/njsnowman/nightlink/issues/75) | open | [Latest comment](https://github.com/njsnowman/nightlink/issues/75#issuecomment-6331099719) |
| [#76 Unify Switchboard contact, map, messaging and Settings flows ](https://github.com/njsnowman/nightlink/issues/76) | open | [Latest comment](https://github.com/njsnowman/nightlink/issues/76#issuecomment-6343982739) |
| [#77 Recover embedded CoreScope after transient load or health failure ](https://github.com/njsnowman/nightlink/issues/77) | closed | [Latest comment](https://github.com/njsnowman/nightlink/issues/77#issuecomment-6398980372) |
| [#78 Improve workspace startup and rendering performance ](https://github.com/njsnowman/nightlink/issues/78) | open | [Latest comment](https://github.com/njsnowman/nightlink/issues/78#issuecomment-6385270056) |
| [#79 Prioritize distinct message reply, hop-path and sender contact actions ](https://github.com/njsnowman/nightlink/issues/79) | open | [Latest comment](https://github.com/njsnowman/nightlink/issues/79#issuecomment-6385476227) |
| [#80 Redesign Windows installer to match Switchboard styling ](https://github.com/njsnowman/nightlink/issues/80) | open | [Latest comment](https://github.com/njsnowman/nightlink/issues/80#issuecomment-6385696846) |
| [#81 Simplify radio connection loading presentation ](https://github.com/njsnowman/nightlink/issues/81) | open | [Latest comment](https://github.com/njsnowman/nightlink/issues/81#issuecomment-6386094225) |
| [#82 Add nearby node discovery and saved-contact search ](https://github.com/njsnowman/nightlink/issues/82) | open | [Latest comment](https://github.com/njsnowman/nightlink/issues/82#issuecomment-6430195216) |
| [#83 Simplify Messages navigation and validate Windows candidate ](https://github.com/njsnowman/nightlink/issues/83) | open | [Latest comment](https://github.com/njsnowman/nightlink/issues/83#issuecomment-6398045857) |
| [#84 Verify remote update distribution and candidate version handling ](https://github.com/njsnowman/nightlink/issues/84) | closed | [Latest comment](https://github.com/njsnowman/nightlink/issues/84#issuecomment-6468887221) |
| [#85 Add bundled illustrated Help and About section ](https://github.com/njsnowman/nightlink/issues/85) | open | [Latest comment](https://github.com/njsnowman/nightlink/issues/85#issuecomment-6398374285) |
| [#86 Prepare installer with About purpose statement and review publication gates ](https://github.com/njsnowman/nightlink/issues/86) | open | [Latest comment](https://github.com/njsnowman/nightlink/issues/86#issuecomment-6405821943) |
| [#87 Installed startup lock cannot open Windows-protected settings ](https://github.com/njsnowman/nightlink/issues/87) | open | [Latest comment](https://github.com/njsnowman/nightlink/issues/87#issuecomment-6445494614) |
| [#88 Track external CoreScope node-bootstrap latency ](https://github.com/njsnowman/nightlink/issues/88) | open | Issue body only |
| [#89 Add a consolidated Radio workbench for path, reception and administration tools ](https://github.com/njsnowman/nightlink/issues/89) | closed | [Latest comment](https://github.com/njsnowman/nightlink/issues/89#issuecomment-6444938013) |
| [#90 Improve outgoing-message distinction and redesign the message-path dialog ](https://github.com/njsnowman/nightlink/issues/90) | open | [Latest comment](https://github.com/njsnowman/nightlink/issues/90#issuecomment-6443002980) |
| [#91 Consolidate Radio synchronization status and recovery actions ](https://github.com/njsnowman/nightlink/issues/91) | open | [Latest comment](https://github.com/njsnowman/nightlink/issues/91#issuecomment-6443901377) |
| [#92 Refresh documentation for public Nightlink 0.8.22 ](https://github.com/njsnowman/nightlink/issues/92) | closed | [Latest comment](https://github.com/njsnowman/nightlink/issues/92#issuecomment-6445681306) |
| [#93 Prepare 0.8.23 documentation patch release ](https://github.com/njsnowman/nightlink/issues/93) | closed | [Latest comment](https://github.com/njsnowman/nightlink/issues/93#issuecomment-6445890902) |
| [#94 Render MeshCore One reactions instead of raw target hashes ](https://github.com/njsnowman/nightlink/issues/94) | open | [Latest comment](https://github.com/njsnowman/nightlink/issues/94#issuecomment-6446444861) |
| [#95 Reconcile radio contact eviction and explain rejected DM recipients ](https://github.com/njsnowman/nightlink/issues/95) | open | [Latest comment](https://github.com/njsnowman/nightlink/issues/95#issuecomment-6447384810) |
| [#96 Improve send feedback and restore hidden DM pop-ups ](https://github.com/njsnowman/nightlink/issues/96) | open | [Latest comment](https://github.com/njsnowman/nightlink/issues/96#issuecomment-6448304630) |
| [#97 Add Signal Rail chat activity indicators ](https://github.com/njsnowman/nightlink/issues/97) | closed | [Latest comment](https://github.com/njsnowman/nightlink/issues/97#issuecomment-6468887544) |
| [#99 Show connection readiness and consolidate unread activity ](https://github.com/njsnowman/nightlink/issues/99) | closed | [Latest comment](https://github.com/njsnowman/nightlink/issues/99#issuecomment-6468888027) |
| [#100 Keep RX activity visible during echo replies and active sends ](https://github.com/njsnowman/nightlink/issues/100) | closed | [Latest comment](https://github.com/njsnowman/nightlink/issues/100#issuecomment-6468888618) |
| [#101 Improve recovery, reading position, compact layout and support export ](https://github.com/njsnowman/nightlink/issues/101) | closed | [Latest comment](https://github.com/njsnowman/nightlink/issues/101#issuecomment-6468888978) |
| [#102 Add confirmed contact removal from the connected radio ](https://github.com/njsnowman/nightlink/issues/102) | open | Issue body only |
| [#103 Guard DM window events during WebContents teardown ](https://github.com/njsnowman/nightlink/issues/103) | closed | [Latest comment](https://github.com/njsnowman/nightlink/issues/103#issuecomment-6468889285) |
| [#104 Bulk remove radio contacts while preserving favorites ](https://github.com/njsnowman/nightlink/issues/104) | open | Issue body only |
| [#105 Add fixed command buttons for the echo channel ](https://github.com/njsnowman/nightlink/issues/105) | closed | [Latest comment](https://github.com/njsnowman/nightlink/issues/105#issuecomment-6468889702) |

## Every PR

| PR | State | Head |
| --- | --- | --- |
| [#106 UI: unify spacing and visual density across NightLink](https://github.com/njsnowman/nightlink/pull/106) | open / draft | ui/spacing-cleanup-foundation / 6fd4207f5b03 |
| [#98 Add chat delivery signals, recovery controls, contact cleanup and echo commands](https://github.com/njsnowman/nightlink/pull/98) | open / draft | codex/chat-signal-rail / 74eaf990a049 |
| [#52 Release Nightlink 0.8.22 with consolidated messaging and radio tools](https://github.com/njsnowman/nightlink/pull/52) | merged | codex/overview-radio-layout / 9fd4dbdcc406 |
| [#50 Preserve message-waiting notifications at queue completion](https://github.com/njsnowman/nightlink/pull/50) | open / draft | codex/reconnect-message-catchup / 9bca6e0c7720 |
| [#48 Follow latest messages automatically in Overview and Messages](https://github.com/njsnowman/nightlink/pull/48) | merged | codex/latest-message-scroll / 8be665a325c2 |
| [#46 Simplify radio connection controls and enter Overview automatically](https://github.com/njsnowman/nightlink/pull/46) | merged | codex/connection-flow / 9e4d4956703d |
| [#44 Add local diagnostics, offline map imports and voice tools](https://github.com/njsnowman/nightlink/pull/44) | merged | codex/diagnostics-offline-voice / 1ffe44b0a298 |
| [#41 Add Windows tray lifecycle and conversation notifications](https://github.com/njsnowman/nightlink/pull/41) | merged | codex/windows-tray / d6658d1a188c |
| [#38 Add USB companion connections and update Windows installer styling](https://github.com/njsnowman/nightlink/pull/38) | merged | codex/usb-connection / fff60617b14e |
| [#36 Embed CoreScope in Overview and Network maps](https://github.com/njsnowman/nightlink/pull/36) | merged | codex/corescope-map / f1c122e66284 |
| [#34 Add local and flood adverts with signed contact sharing](https://github.com/njsnowman/nightlink/pull/34) | merged | codex/radio-tools / 88e4f822fc27 |
| [#31 Consolidate navigation and fit the application to its window](https://github.com/njsnowman/nightlink/pull/31) | merged | codex/consolidated-navigation / a8b5d598e9f4 |
| [#28 Add local backup reminders and confirmed-save status](https://github.com/njsnowman/nightlink/pull/28) | merged | codex/backup-reminders / d9945d7eae6a |
| [#25 Preserve conversation drafts and reading continuity](https://github.com/njsnowman/nightlink/pull/25) | merged | codex/conversation-drafts / 01b3776d6701 |
| [#22 Add radio health and synchronization visibility](https://github.com/njsnowman/nightlink/pull/22) | merged | codex/radio-health / 50c5e24cc7b6 |
| [#19 Clarify message delivery states and add explicit retry actions](https://github.com/njsnowman/nightlink/pull/19) | merged | codex/message-delivery-clarity / 1be638fb5099 |
| [#16 Add Windows installer and optional update checks](https://github.com/njsnowman/nightlink/pull/16) | merged | codex/windows-installer-updates / 250ebd030a1e |
| [#13 Add local backup export and merge-based restore with recovery](https://github.com/njsnowman/nightlink/pull/13) | merged | codex/backup-restore / 2548a03cce2e |
| [#9 Add offline message search with filters and result navigation](https://github.com/njsnowman/nightlink/pull/9) | merged | codex/message-search / 5bcbd2b446df |
| [#6 Add unread counts, reading positions and notification controls](https://github.com/njsnowman/nightlink/pull/6) | merged | codex/unread-notifications / 7a46d0b34652 |

## Releases and tags

All 20 release tags exist in the fetched tag inventory. Metadata only; this audit does not revalidate all historical installer payloads.

| Release | Published | Assets |
| --- | --- | --- |
| [v0.8.24](https://github.com/njsnowman/nightlink/releases/tag/v0.8.24) | 2026-10-27T17:03:03Z | Nightlink-Portable-0.8.24.exe (103169017 bytes, digest recorded); Nightlink-Setup-0.8.24.exe (103412890 bytes, digest recorded); SHA256SUMS.txt (189 bytes, digest recorded) |
| [v0.8.23](https://github.com/njsnowman/nightlink/releases/tag/v0.8.23) | 2026-10-27T15:18:57Z | Nightlink-Portable-0.8.23.exe (103149424 bytes, digest recorded); Nightlink-Setup-0.8.23.exe (103393289 bytes, digest recorded); SHA256SUMS.txt (191 bytes, digest recorded) |
| [v0.8.22](https://github.com/njsnowman/nightlink/releases/tag/v0.8.22) | 2026-10-27T15:01:04Z | Nightlink-Portable-0.8.22.exe (103150224 bytes, digest recorded); Nightlink-Screenshots-0.8.22.zip (2337370 bytes, digest recorded); Nightlink-Setup-0.8.22.exe (103394089 bytes, digest recorded); SHA256SUMS.txt (291 bytes, digest recorded) |
| [v0.8.19](https://github.com/njsnowman/nightlink/releases/tag/v0.8.19) | 2026-10-17T06:03:04Z | Nightlink-Portable-0.8.19.exe (102527990 bytes, digest recorded); Nightlink-Setup-0.8.19.exe (102824753 bytes, digest recorded) |
| [v0.8.18](https://github.com/njsnowman/nightlink/releases/tag/v0.8.18) | 2026-10-17T05:43:17Z | Nightlink-Portable-0.8.18.exe (102517164 bytes, digest recorded); Nightlink-Setup-0.8.18.exe (102813924 bytes, digest recorded) |
| [v0.8.17](https://github.com/njsnowman/nightlink/releases/tag/v0.8.17) | 2026-10-17T05:35:10Z | Nightlink-Portable-0.8.17.exe (102516628 bytes, digest recorded); Nightlink-Setup-0.8.17.exe (102813451 bytes, digest recorded) |
| [v0.8.16](https://github.com/njsnowman/nightlink/releases/tag/v0.8.16) | 2026-10-17T02:44:00Z | Nightlink-Portable-0.8.16.exe (102802362 bytes, digest recorded); Nightlink-Setup-0.8.16.exe (106671502 bytes, digest recorded); SHA256SUMS-0.8.16.txt (189 bytes, digest recorded) |
| [v0.8.15](https://github.com/njsnowman/nightlink/releases/tag/v0.8.15) | 2026-10-17T01:12:40Z | Nightlink-Portable-0.8.15.exe (102800840 bytes, digest recorded); Nightlink-Setup-0.8.15.exe (106669994 bytes, digest recorded); SHA256SUMS-0.8.15.txt (189 bytes, digest recorded) |
| [v0.8.14](https://github.com/njsnowman/nightlink/releases/tag/v0.8.14) | 2026-10-16T23:18:24Z | Nightlink-Portable-0.8.14.exe (102746906 bytes, digest recorded); Nightlink-Setup-0.8.14.exe (103695672 bytes, digest recorded); SHA256SUMS-0.8.14.txt (189 bytes, digest recorded) |
| [v0.8.13](https://github.com/njsnowman/nightlink/releases/tag/v0.8.13) | 2026-10-16T22:52:59Z | Nightlink-Portable-0.8.13.exe (102743752 bytes, digest recorded); Nightlink-Setup-0.8.13.exe (103692518 bytes, digest recorded); SHA256SUMS-0.8.13.txt (189 bytes, digest recorded) |
| [v0.8.12](https://github.com/njsnowman/nightlink/releases/tag/v0.8.12) | 2026-10-16T22:27:43Z | Nightlink-Portable-0.8.12.exe (102742238 bytes, digest recorded); Nightlink-Setup-0.8.12.exe (103690990 bytes, digest recorded); SHA256SUMS-0.8.12.txt (189 bytes, digest recorded) |
| [v0.8.11](https://github.com/njsnowman/nightlink/releases/tag/v0.8.11) | 2026-10-16T22:07:59Z | Nightlink-Portable-0.8.11.exe (102742072 bytes, digest recorded); Nightlink-Setup-0.8.11.exe (103690838 bytes, digest recorded); SHA256SUMS-0.8.11.txt (189 bytes, digest recorded) |
| [v0.8.10](https://github.com/njsnowman/nightlink/releases/tag/v0.8.10) | 2026-10-16T21:53:06Z | Nightlink-Portable-0.8.10.exe (102738821 bytes, digest recorded); Nightlink-Setup-0.8.10.exe (103687587 bytes, digest recorded); SHA256SUMS-0.8.10.txt (189 bytes, digest recorded) |
| [v0.8.9](https://github.com/njsnowman/nightlink/releases/tag/v0.8.9) | 2026-10-16T16:21:36Z | Nightlink-Portable-0.8.9.exe (102739039 bytes, digest recorded); Nightlink-Setup-0.8.9.exe (103687799 bytes, digest recorded); SHA256SUMS.txt (187 bytes, digest recorded) |
| [v0.8.8](https://github.com/njsnowman/nightlink/releases/tag/v0.8.8) | 2026-10-16T14:29:08Z | Nightlink.0.8.8.exe (375532680 bytes, digest recorded) |
| [v0.8.7](https://github.com/njsnowman/nightlink/releases/tag/v0.8.7) | 2026-10-15T22:10:02Z | Nightlink.0.8.7.exe (375510598 bytes, digest recorded) |
| [v0.8.6](https://github.com/njsnowman/nightlink/releases/tag/v0.8.6) | 2026-10-15T20:49:58Z | Nightlink.0.8.6.exe (375496733 bytes, digest recorded) |
| [v0.8.5](https://github.com/njsnowman/nightlink/releases/tag/v0.8.5) | 2026-10-15T20:22:15Z | Nightlink.0.8.5.exe (375475567 bytes, digest recorded) |
| [v0.8.0](https://github.com/njsnowman/nightlink/releases/tag/v0.8.0) | 2026-10-14T17:36:00Z | Nightlink.0.8.0.exe (375433662 bytes, digest recorded) |
| [v0.7.1](https://github.com/njsnowman/nightlink/releases/tag/v0.7.1) | 2026-10-14T16:34:43Z | Nightlink.0.7.1.exe (375417402 bytes, digest recorded) |

## Branches

| Branch | SHA |
| --- | --- |
| codex/backup-reminders | d9945d7eae6a8d9bc0c53c77b141a69fc08df1b5 |
| codex/backup-restore | 2548a03cce2e1c81a85e49dec3d813836fe6eb90 |
| codex/chat-signal-rail | 74eaf990a049327d721d9ff386bcbd2b8f973f38 |
| codex/connection-flow | 9e4d4956703d55d9a339ab069db8a6a30717b0d2 |
| codex/consolidated-navigation | a8b5d598e9f4d1a95ece50ab95a3d8b4f4d9417e |
| codex/conversation-drafts | 01b3776d6701de5612f6227f8d76dcc59c8bcb03 |
| codex/corescope-map | f1c122e66284c99e116c6fefb78eb692cfdf9207 |
| codex/diagnostics-offline-voice | 1ffe44b0a29841ee05917029d230b4be7aec53a5 |
| codex/latest-message-scroll | 8be665a325c2bd7a1b7dde29641d03796e7e2a3c |
| codex/message-delivery-clarity | 1be638fb50997778831849861a41422fc6d0ce60 |
| codex/message-search | 5bcbd2b446dfdd364d151ffec603e5034f9182bb |
| codex/overview-radio-layout | 9fd4dbdcc406878cec0d3cf45a142027ce517bab |
| codex/radio-health | 50c5e24cc7b61d3f8cdbad2d428a0321eb0b0c7e |
| codex/radio-tools | 88e4f822fc2746c67c6013bb496bdf9f780235c7 |
| codex/reconnect-message-catchup | 9bca6e0c7720d8dd105d5c66a0d43ed572d790a4 |
| codex/unread-notifications | 7a46d0b346529134980f9996b0b92c70d0eb64a8 |
| codex/usb-connection | fff60617b14eb2f13fe2b41be53b0b95aa20eea6 |
| codex/windows-installer-updates | 250ebd030a1e31ecc6e503c45e8433b2d2776df7 |
| codex/windows-tray | d6658d1a188cdd0049a11e31009055c2f00e598a |
| main | 9ad2ca280149102a7fde841e04ebcdc0aecea529 |
| ui/spacing-cleanup-foundation | 6fd4207f5b03ad2f80ca23b625393e08a0198faf |

## Workflow runs

| Run | Branch | Revision | Result |
| --- | --- | --- | --- |
| [40722565023](https://github.com/njsnowman/nightlink/actions/runs/40722565023) | ui/spacing-cleanup-foundation | 6fd4207f5b03 | completed / success |
| [40722293821](https://github.com/njsnowman/nightlink/actions/runs/40722293821) | ui/spacing-cleanup-foundation | fdf4d66de5c9 | completed / failure |
| [40722239460](https://github.com/njsnowman/nightlink/actions/runs/40722239460) | ui/spacing-cleanup-foundation | a2aa7a6d346a | completed / failure |
| [40722176918](https://github.com/njsnowman/nightlink/actions/runs/40722176918) | ui/spacing-cleanup-foundation | 1f2dbaf5ce9b | completed / success |
| [40719187129](https://github.com/njsnowman/nightlink/actions/runs/40719187129) | ui/spacing-cleanup-foundation | 35f9789cc603 | completed / success |
| [40719133804](https://github.com/njsnowman/nightlink/actions/runs/40719133804) | ui/spacing-cleanup-foundation | 8ec14101eaed | completed / success |
| [40718672160](https://github.com/njsnowman/nightlink/actions/runs/40718672160) | ui/spacing-cleanup-foundation | 7b3fdd6c4373 | completed / success |
| [40718253938](https://github.com/njsnowman/nightlink/actions/runs/40718253938) | ui/spacing-cleanup-foundation | cd0ce94b0edc | completed / failure |
| [40717042451](https://github.com/njsnowman/nightlink/actions/runs/40717042451) | ui/spacing-cleanup-foundation | 2de5fea72cbd | completed / failure |
| [40716996155](https://github.com/njsnowman/nightlink/actions/runs/40716996155) | ui/spacing-cleanup-foundation | 456c11633125 | completed / failure |
| [40716963415](https://github.com/njsnowman/nightlink/actions/runs/40716963415) | ui/spacing-cleanup-foundation | 3fde527b7923 | completed / failure |
| [40700414346](https://github.com/njsnowman/nightlink/actions/runs/40700414346) | ui/spacing-cleanup-foundation | 08dffc0289ae | completed / failure |
| [40699734509](https://github.com/njsnowman/nightlink/actions/runs/40699734509) | ui/spacing-cleanup-foundation | ec45de48cf0b | completed / failure |

## Audit-created follow-up

Issue [#107](https://github.com/njsnowman/nightlink/issues/107) and combined draft PR [#108](https://github.com/njsnowman/nightlink/pull/108) were created after the initial inventory snapshot. Local combined validation passed 254 unit tests, cross-screen browser/send/draft tests and prior feature regressions. Final package verification matched all 193 explicit assets and both packaged renderer/native checks passed. Public stable v0.8.24 remains unchanged.
