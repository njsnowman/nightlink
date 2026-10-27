# Nightlink

Windows desktop client for MeshCore companion radios over Bluetooth LE or USB serial. Built with Electron and a local HTML/CSS/JavaScript interface.

## Features

- Channel and direct messaging with local history.
- Direct-message ACK tracking, bounded retries, flood fallback, cancellation, and delivery details.
- Contact nicknames, photos, notes, local favorites and independent full-key comparison records.
- Direct-message windows and configurable notification sound.
- Channel mention autocomplete using the MeshCore @[name] convention.
- Street maps with advertised node locations and observed message paths.
- Compact layout, connection diagnostics, and retained-message synchronization.
- Passive RF trend summaries with sample counts and last-link limitations.
- Private Radio map points with local notes and backup merge support.
- An #echo-only chat/CoreScope split, automatic local-map fallback and configurable MeshMapper region/PC centering.
- Default dark black surfaces, an alternative console scheme and four independent display accents.
- Optional startup password/authenticator lock with recovery codes; existing history remains unencrypted.
- Bounded webpage/image previews and session-only radio CLI tools.
- Radio workbench: Trace Path, offline geometric Line of Sight, RX Log, Noise Floor, Discover Nodes and CLI.
- Copy public ID, exact-name mention highlighting/chime, and animated located message paths.

Stable **0.8.23** is available: [Windows installer](https://github.com/njsnowman/nightlink/releases/download/v0.8.23/Nightlink-Setup-0.8.23.exe), [portable build](https://github.com/njsnowman/nightlink/releases/download/v0.8.23/Nightlink-Portable-0.8.23.exe), and [release notes and checksums](releases/0.8.23.md). Both executables are unsigned. See the [documentation index](DOCUMENTATION.md), [user guide](USER_GUIDE.md) and [local client tools](LOCAL_CLIENT_TOOLS.md).

## Development

Install Node.js and dependencies with `npm install` or the checked-in pnpm lockfile. Run `npm start` for Electron, `npm run preview` for the local browser preview, and `npm run dist` to build the Windows Setup and Portable executables. Browser preview uses http://127.0.0.1:4173 in Edge or Chrome.

Run `npm test` for protocol, transport, delivery, and recovery tests. `smoke.test.cjs` provides browser integration coverage with a simulated GATT radio; its Playwright and fixture paths currently require adjustment outside the original development environment. Tests do not transmit over RF.

## Bluetooth connection

Use MeshCore BLE companion firmware and enable Windows Bluetooth. Connect one client to the radio at a time. Nightlink synchronizes channels, retrieves retained messages, and refreshes contacts and telemetry. Transport failures during initial synchronization pause automatic reconnect and identify the failed command. Unexpected link loss after synchronization uses bounded reconnect backoff.

## USB connection

Connect the radio with a data-capable USB cable. In Connect radio, choose USB cable, then Choose USB port and select the radio’s COM port. Nightlink uses 115200 baud and MeshCore companion framing. The radio must expose the USB companion protocol; a charge-only cable or unrelated serial console cannot connect. Close other serial applications first. No firmware flashing is performed.

Only one radio connection is active at a time. Disconnect or select the other connection type to switch. USB and Bluetooth use the radio’s public identity for the same local history. The selected USB port is remembered for reconnects during this app session. Unexpected link loss uses bounded retries; synchronization failures pause retries.

## Message delivery and recovery

A radio accepting a channel message does not confirm recipient delivery. Direct messages track the recipient radio's ACK; missing ACKs remain unconfirmed. Default DM budgets are four direct attempts followed by one flood fallback, or two flood attempts without a saved route. Settings provide bounded overrides. Flood fallback clears the recipient's saved route so a replacement can be learned. Pending sends are not replayed after restart or reconnect.

After reconnecting, Nightlink retrieves messages received and retained by the powered companion radio. Its finite queue can overflow, may be cleared by a reboot, and can be consumed by another connected client such as the phone app. That app’s local archive is not automatically shared with Nightlink. Broadcasts missed while out of coverage cannot be recovered from channel history. See [retry implementation notes](SEND_RETRIES.md).

## Storage and external services

Contact cards, favorites, and message history are stored on the local computer. History retains up to 3,000 messages per radio and is not encrypted at rest. Channel secrets and Bluetooth PINs are not written to local history. Map tiles use OpenStreetMap; uncached tiles require internet. Unknown locations and unresolved route hops remain identified as unknown.

## Validation and releases

The Bluetooth reconnect regression is documented in [issue #1](https://github.com/njsnowman/nightlink/issues/1). The user reported more than four hours of continuous connection and successful retained-message recovery on the tested radio. Automated and simulated checks are recorded separately from this physical evidence. DM retry/flood behavior has not received additional physical two-radio verification.

Every Nightlink release must have a linked tracking issue, changelog entry, validation record, source commit, and artifact checksum before publication. See [release process](RELEASE_PROCESS.md), [changelog](CHANGELOG.md), and [field test procedure](FIELD_TEST.md).

## References

- [MeshCore firmware and companion protocol](https://github.com/meshcore-dev/MeshCore)
- [Electron device access](https://www.electronjs.org/docs/latest/tutorial/devices)
- Leaflet is distributed under its [BSD license](vendor/LEAFLET-LICENSE).

## Local backup and restore

Open Settings → Data & updates → Backup and restore to save a local JSON backup. On Windows, choose a destination in the Save dialog. Backups contain private messages and contact information and are not encrypted.

Disconnect the radio before choosing a backup to restore. Review the counts before confirming. Existing contact cards and preferences are kept, favorites are combined, and duplicate messages are skipped. Messages beyond the per-radio retention limit are reported and skipped without removing current history. The app reloads when finished. If a restore is interrupted, use Recover previous data at startup or Recover interrupted restore in Settings.

This feature upgrades contact storage to version 2; older Nightlink versions may not open upgraded contact cards. Backup and restore is available starting in 0.8.8.

## Windows installer and update checks

Build with npm run dist to produce Nightlink-Setup-<version>.exe and Nightlink-Portable-<version>.exe. The installer is per user with a Start menu shortcut and optional desktop shortcut. It keeps the existing %APPDATA%/Meshline data location and retains local data on normal uninstall. Close Nightlink before installing an update.

Settings → Data & updates → Nightlink updates shows the running version, offers manual checks and optional checks while the app is open. The public GitHub stable feed requires no account or embedded credentials. Download opens the matching Setup or Portable asset in your browser; Nightlink does not install updates automatically. Export a backup and quit cleanly before upgrading. See [update behavior](UPDATES.md).

Installer and update controls are available starting in 0.8.9.

## Screenshots

[Download five Nightlink 0.8.22 screenshots](https://github.com/njsnowman/nightlink/releases/download/v0.8.22/Nightlink-Screenshots-0.8.22.zip): Overview, Messages, Network, Radio Tools and Message Path. These are actual application captures with labeled demonstration data and the ice-blue display accent, without private messages or contact details.
