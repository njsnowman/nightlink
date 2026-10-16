# Nightlink

Windows desktop client for MeshCore companion radios over Bluetooth LE. Built with Electron and a local HTML/CSS/JavaScript interface.

## Features

- Channel and direct messaging with local history.
- Direct-message ACK tracking, bounded retries, flood fallback, cancellation, and delivery details.
- Contact nicknames, photos, notes, and local favorites.
- Direct-message windows and configurable notification sound.
- Channel mention autocomplete using the MeshCore @[name] convention.
- Street maps with advertised node locations and observed message paths.
- Compact layout, connection diagnostics, and retained-message synchronization.

## Development

Install Node.js and dependencies with `npm install` or the checked-in pnpm lockfile. Run `npm start` for Electron, `npm run preview` for the local browser preview, and `npm run dist` to build a Windows portable executable. Browser preview uses http://127.0.0.1:4173 in Edge or Chrome.

Run `npm test` for protocol, transport, delivery, and recovery tests. `smoke.test.cjs` provides browser integration coverage with a simulated GATT radio; its Playwright and fixture paths currently require adjustment outside the original development environment. Tests do not transmit over RF.

## Bluetooth connection

Use MeshCore BLE companion firmware and enable Windows Bluetooth. Connect one client to the radio at a time. Nightlink synchronizes channels, retrieves retained messages, and refreshes contacts and telemetry. Transport failures during initial synchronization pause automatic reconnect and identify the failed command. Unexpected link loss after synchronization uses bounded reconnect backoff.

## Message delivery and recovery

A radio accepting a channel message does not confirm recipient delivery. Direct messages track the recipient radio's ACK; missing ACKs remain unconfirmed. Default DM budgets are four direct attempts followed by one flood fallback, or two flood attempts without a saved route. Settings provide bounded overrides. Flood fallback clears the recipient's saved route so a replacement can be learned. Pending sends are not replayed after restart or reconnect.

After reconnecting, Nightlink retrieves messages received and retained by the powered companion radio. Its finite queue can overflow and may be cleared by a reboot. Broadcasts missed while out of coverage cannot be recovered from channel history. See [retry implementation notes](SEND_RETRIES.md).

## Storage and external services

Contact cards, favorites, and message history are stored on the local computer. History retains up to 3,000 messages per radio and is not encrypted at rest. Channel secrets and Bluetooth PINs are not written to local history. Map tiles use OpenStreetMap; uncached tiles require internet. Unknown locations and unresolved route hops remain identified as unknown.

## Validation and releases

The Bluetooth reconnect regression is documented in [issue #1](https://github.com/njsnowman/nightlink/issues/1). The user reported more than four hours of continuous connection and successful retained-message recovery on the tested radio. Automated and simulated checks are recorded separately from this physical evidence. DM retry/flood behavior has not received additional physical two-radio verification.

Every Nightlink release must have a linked tracking issue, changelog entry, validation record, source commit, and artifact checksum before publication. See [release process](RELEASE_PROCESS.md), [changelog](CHANGELOG.md), and [field test procedure](FIELD_TEST.md).

## References

- [MeshCore firmware and companion protocol](https://github.com/meshcore-dev/MeshCore)
- [Electron device access](https://www.electronjs.org/docs/latest/tutorial/devices)
- Leaflet is distributed under its [BSD license](vendor/LEAFLET-LICENSE).

## Local backup and restore (unreleased)

Open Settings → Backup and restore to save a local JSON backup. On Windows, choose a destination in the Save dialog. Backups contain private messages and contact information and are not encrypted.

Disconnect the radio before choosing a backup to restore. Review the counts before confirming. Existing contact cards and preferences are kept, favorites are combined, and duplicate messages are skipped. Messages beyond the per-radio retention limit are reported and skipped without removing current history. The app reloads when finished. If a restore is interrupted, use Recover previous data at startup or Recover interrupted restore in Settings.

This feature upgrades contact storage to version 2; older Nightlink versions may not open upgraded contact cards. The published 0.8.7 download does not include backup/restore yet.
