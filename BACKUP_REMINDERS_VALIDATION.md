# Local backup status and reminders

> Evidence record: dated results below retain their original scope. For current downloads, release status and remaining limitations, use the [documentation index](DOCUMENTATION.md) and [0.8.22 release record](releases/0.8.22.md).


Tracking: https://github.com/njsnowman/nightlink/issues/27

Settings separates the last confirmed desktop save from a browser export starting. Confirmed save metadata is recorded only after the native save bridge reports success, using completion time. Cancelled or failed saves do not record success. A browser export does not overwrite separate confirmed-save evidence; earlier confirmed records are preserved when exporting through a browser. Save evidence cannot establish that the file still exists or is readable.

Weekly in-app reminders default on, are configurable in Settings, require local history/contact/draft data and are suppressed during interrupted restore recovery. The app checks after 30 seconds and every six hours while open; at most one notice is shown per app session. Snooze records a seven-day deadline on this computer. Confirmed saves younger than seven days suppress reminders; unconfirmed browser exports do not. Preferences are included in backups, while save evidence and snooze metadata remain local. No export, file selection or radio operation occurs automatically.

Validation on 2026-10-16:
- Full Node suite: 87 passed, including weekly timing, invalid/future timestamps, empty-data, preference, snooze, restore-pending and separate confirmed evidence cases.
- backup-reminders.browser.test.cjs passed empty-data suppression, snooze, preference persistence, cancelled/failed/successful native-save results, subsequent browser export, restore-pending suppression, metadata unavailability and 760px width. Native save outcomes were mocked; no real save dialog/file was used for these checks.
- Existing backup.browser.test.cjs passed migration, backup/restore round trip, repeated merge, invalid files, interrupted recovery, quota rollback and compact layout.
- Reminder screenshot inspected in an isolated browser profile.

No packaged Windows build or physical-radio test is claimed. No new release published.
