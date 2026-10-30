# Device Center research and implementation

Research reviewed October 28-29, 2026. Tracking: [#109](https://github.com/njsnowman/nightlink/issues/109). This implementation is original Nightlink code and layout. Other clients were reviewed through their published documentation and feature descriptions; their implementation code and visual layouts were not used.

## Comparison and design decisions

| Primary source | Documented capabilities reviewed | Nightlink decision |
| --- | --- | --- |
| [Official USB configurator](https://github.com/meshcore-dev/config.meshcore.io) | Repeater, room and sensor setup; radio, routing, advertising, regions, ACLs, configuration files and CLI | Distinguish text setup USB from binary companion USB. Show settings only after explicit inspection. Configuration files stage edits rather than immediately restoring them. |
| [MeshCore One](https://github.com/Avi0n/MeshCoreOne) and its [release notes](https://github.com/Avi0n/MeshCoreOne/releases) | Remote authentication, device configuration, status, telemetry, neighbors and evolving routing capabilities | Keep the target key and observed permission visible. Treat unsupported settings as unavailable rather than assuming parity across firmware. |
| [Official companion app](https://apps.apple.com/us/app/meshcore/id6742354151) | Companion setup, radio settings and repeater networking controls, including path hashes and regions | Put companion and infrastructure management behind one Radio entry, while retaining distinct protocol and authentication rules. Do not silently select a regional RF preset. |
| [Meshcore-open management documentation](https://github.com/zjs81/meshcore-open/blob/dev/documentation/repeater-management.md) | Device status, telemetry, neighbors, CLI and authenticated remote configuration | Keep advanced commands available alongside structured configuration. Use explicit requests instead of background management traffic. |
| [Meshcore-gui](https://github.com/pe1hvh/meshcore-gui) | Desktop repeater administration, configuration history and optional scheduled reads | Use a short-lived inspected snapshot and a visible before/after review. No scheduled radio polling or durable management credential/history database is introduced. |
| [Official meshcore.js](https://github.com/meshcore-dev/meshcore.js) | Binary companion transport interoperability across BLE, serial and TCP | Retain Nightlink's existing serialization and session ownership, rather than introducing a competing client stack. |

The resulting workflow is **Inspect → Stage → Review → Apply → Verify**. A target is not a generic serial port or a display name: remote targets use the full saved public key and an unambiguous response prefix; companion operations retain the connected owner's public key and connection generation; direct setup retains its port epoch and reads the physical device's public key.

## Protocol evidence

Implementation references the official MeshCore source at commit [`81dbae592ffad40b4212bc0b37e82b38da08f4bc`](https://github.com/meshcore-dev/MeshCore/tree/81dbae592ffad40b4212bc0b37e82b38da08f4bc):

- [Companion protocol](https://github.com/meshcore-dev/MeshCore/blob/81dbae592ffad40b4212bc0b37e82b38da08f4bc/docs/companion_protocol.md) and [companion implementation](https://github.com/meshcore-dev/MeshCore/blob/81dbae592ffad40b4212bc0b37e82b38da08f4bc/examples/companion_radio/MyMesh.cpp): commands 1/22 inspect identity, 8 sets name, 12 sets signed TX power, 14 sets scaled coordinates, and 11 sets RF parameters. Command 11 includes the observed repeat-enabled byte on protocol 9+. An incomplete repeat observation blocks RF changes. RF writes run last and take effect immediately.
- [CommonRadioPrefs.cpp](https://github.com/meshcore-dev/MeshCore/blob/81dbae592ffad40b4212bc0b37e82b38da08f4bc/src/helpers/CommonRadioPrefs.cpp): RF values are read and written as frequency, bandwidth, SF and CR; infrastructure RF writes are saved pending reboot. Also defines power, RX gain, path hash and delay commands.
- [CommonCLI.cpp](https://github.com/meshcore-dev/MeshCore/blob/81dbae592ffad40b4212bc0b37e82b38da08f4bc/src/helpers/CommonCLI.cpp) and [CLI documentation](https://github.com/meshcore-dev/MeshCore/blob/81dbae592ffad40b4212bc0b37e82b38da08f4bc/docs/cli_commands.md): structured name, location, owner information, forwarding and advert interval commands; settings with rounding are validated before writing.
- [Repeater serial loop](https://github.com/meshcore-dev/MeshCore/blob/81dbae592ffad40b4212bc0b37e82b38da08f4bc/examples/simple_repeater/main.cpp): 115200-baud text commands terminate with CR; completed replies have a leading arrow marker. The separate direct setup transport ignores echo and unsolicited diagnostic lines and accepts only that response marker.

## Implemented paths

| Target | Connection and permission | Structured settings |
| --- | --- | --- |
| Connected companion | Existing BLE or binary USB session; physical companion access | Name, TX power bounded by reported board maximum, latitude/longitude, frequency, bandwidth, SF and CR |
| Saved repeater or room | Companion relays authenticated CLI messages; reported administrator permission required for structured writes | Name, TX power (conservative maximum 22 dBm), location, owner information, forwarding, RX gain, path-hash mode, flood/direct delay factors, local/flood advert intervals and RF parameters, where replies are supported |
| Direct repeater / room USB | Companion disconnected; text setup USB at 115200; physical access, without remote login | Supported CLI settings from the preceding row, plus an advanced command form with explicit confirmation for changes |

Remote companion contacts are not infrastructure management endpoints. Sensor and alternative-firmware management protocols are not assumed compatible. Companion firmware with protocol 14+ retains the existing advanced local CLI; older companions still have binary structured configuration.

## Failure and privacy behavior

- Opening the workspace, editing fields, importing settings and reviewing differences do not transmit. Inspection and preflight are explicit reads; remote inspection consumes mesh airtime, one command at a time.
- Apply first re-reads changed values and dependent RF/coordinate values. Drift cancels the batch before any write. Each subsequent write is followed by matching setting readback. An acknowledgment alone is not verification.
- Owner, generation, target and workspace lifetime are checked again at the queued command boundary. Closing or changing connections stops subsequent commands. Already transmitted commands cannot be recalled.
- Unknown delivery, timeout, write rejection or mismatched readback stops the batch. Earlier changes may remain applied. There is no automatic retry or rollback. A remote command timeout quarantines that target until companion reconnection, preventing a late reply being reused by an immediate new session.
- Remote CLI replies expose only a six-byte sender prefix, without a per-command correlation ID. Ambiguous saved prefixes are blocked; serialization and quarantine reduce ambiguity but cannot add authentication or correlation that firmware does not supply.
- Guest and legacy sessions may inspect supported fields, but legacy login success without an administrator flag does not authorize structured writes. Firmware remains responsible for enforcing permissions on advanced commands.
- Passwords stay in memory and password inputs clear on submit, target change, connection reset and close. Login ACL/firmware metadata clears on reset/logout. Sensitive advanced commands have hidden command history and hidden response output, including firmware replies that echo a new password. CLI replies are excluded from ordinary message persistence by the existing live message handler.
- Settings exports contain only the displayed schema and target identifier. No private key, password, PIN or channel key is queried or exported. Import requires a fresh snapshot, validates compatible fields, and still requires review/apply. This is a settings transfer file, not a complete radio backup.

## Compatibility limits and follow-up work

Real firmware can truncate names, round values, reject hardware settings or normalize other preferences during a save. A new default zero-hop interval below 60 minutes can be disabled by firmware when another preference is saved; the review calls this out and a fresh inspection is required after a batch. Readback verifies the requested settings, not every hidden firmware side effect. Location currently uses explicit configured coordinates rather than a GPS policy editor.

RF and path-hash changes can affect reachability and network compatibility. Infrastructure RF changes remain explicitly pending a separately requested reboot. Advanced commands can reboot, reset, change credentials or perform other firmware-supported actions, with the target shown and a confirmation step; there is no automatic destructive action. A reboot that drops USB before a response is reported as uncertain and requires reconnect/inspection.

Structured ACLs, hierarchical regions, room-user administration, firmware flashing/OTA, automatic recovery after an RF change, hardware-specific power limits above the conservative remote ceiling, scheduled fleet operations and telemetry history are follow-up capabilities. They are not claimed by this candidate. Protocol differences require separate work rather than sending guessed commands to unsupported roles.

Automated coverage uses synthetic transports. rc.8 additionally passed physical remote administrator login and all five core inspection queries through a protocol-13 Bluetooth companion on October 30, 2026. Physical configuration write/readback, direct USB infrastructure setup and other roles remain required before stable release. See releases/0.8.26-rc.8.md.

## Remote command timing (rc.5)

Physical testing with a protocol-13 companion confirmed administrator login, followed by a configuration-inspection timeout. Clock readings matched at the observation, so clock skew was not established as the cause. Source review and regression fixtures did establish that PC-based whole-second timestamps can repeat, and that the old deadline ignored the companion path estimate. Commands now query the companion RTC, pace strictly increasing timestamps before sending, and arm a bounded estimated reply budget only after acceptance. This follows the firmware replay constraints without changing the radio clock. Inspection progress identifies the current setting and failure count; the exact physical dropped command remains unproven until the updated candidate is tested.

## Core versus optional inspection (rc.7)

A physical trace showed six successful replies before an optional path-hash read received no reply. The missing response alone does not prove unsupported firmware versus radio loss. The client now loads core identity, power, location and RF parameters in five requests without probing optional capabilities. Additional infrastructure settings are queried one at a time by operator choice, preserving staged edits and the previous core snapshot if that optional request fails. Uncertain authentication still blocks writes.

## Bounded core read recovery (rc.8)

After the user restored the companion, a core name read succeeded but the TX read timed out. The client now permits up to three transmissions only for five exact read-only core queries. Recovery drains queued messages and holds serialization through a bounded duplicate-reply quiet interval. Writes, arbitrary CLI and optional probes remain single-attempt. The firmware has no per-command reply ID, so late-reply handling remains bounded best effort; preflight and setting readback remain mandatory. This does not alter the radio clock or any RF setting.
