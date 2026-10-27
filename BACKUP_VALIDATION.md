# Backup and restore validation

> Evidence record: dated results below retain their original scope. For current downloads, release status and remaining limitations, use the [documentation index](DOCUMENTATION.md) and [0.8.22 release record](releases/0.8.22.md).


Tracking: https://github.com/njsnowman/nightlink/issues/12
Status: included in release preparation for 0.8.8.

## Behavior

Settings includes a versioned local backup export, file validation and restore preview. Backups include all retained radio histories, the cached radio/contact/channel profile, custom contact cards and photos, favorites, sender links, reading/mute state and supported preferences. No Bluetooth pairing credentials or channel secrets are exported.

Windows uses a native Save dialog and records the backup time only after the file has been written. Browser exports record when the download started; they do not claim the user completed the download.

Restore merges missing messages with ID and semantic duplicate checks. Existing contact cards and preferences take precedence, and favorites are combined. Existing messages are never removed to make room: incoming overflow beyond 3,000 messages per radio is reported and skipped. Restored pending messages are inert unconfirmed history and are not resent.

Restore requires a disconnected radio. New cards and a rollback journal are staged atomically in IndexedDB. If local-storage writes fail, the old values and cards are recovered. An interrupted restore offers recovery after restart. The view reloads after a successful restore.

## Validation — 2026-10-16

- Full Node suite: 68 passed, including nine backup validation/merge tests.
- Existing GATT, attention and search browser integrations: passed.
- Backup browser integration: passed existing contact DB migration, export and restore into a clean profile, both radio histories, JPEG photo/notes/preferences, repeated restore preview, invalid-file rejection, existing-data precedence, interrupted recovery across restart, simulated quota failure with staged-card rollback, pending-send guard and compact layouts.
- Windows package built. Packaged app assets ran with an isolated history copy under matching Electron 42.11.12. Native Save produced a valid backup file containing both histories; cancelling Save preserved the last successful timestamp. The Save dialog response was stubbed to a local test path; original user storage was not changed.\n- Packaged restore regression: backup.native.test.cjs checks automatic desktop reload, restored history, native Save and cancellation in a clean synthetic profile. Desktop reload uses a trusted IPC request because renderer navigation is restricted.

## Limits

Backup files are unencrypted JSON and contain private local information. Files are limited to 50 MB. Backups contain retained history only, not messages the radio never delivered or history already discarded by retention. Other radio histories appear when their corresponding companion is selected. Existing customizations win as whole contact cards; restore does not overwrite individual fields.

Contact storage migrates from IndexedDB version 1 to 2 to add the recovery journal. Older Nightlink versions that request version 1 may not open upgraded contact storage; this migration must be called out before releasing this change. Multiple open old clients can block the upgrade; close them and restart.

No new physical-radio testing is claimed; restore issues no radio commands.
