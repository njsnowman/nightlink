# Radio Health validation

Tracking: https://github.com/njsnowman/nightlink/issues/21

Radio Health is available from Your radio and Settings. It reports current Bluetooth connection duration, successful reconnections across this app session, current synchronization stage, last successful full sync for the selected radio, frames returned by completed queue fetches and current local-history size. Switching radio identity resets that radio's sync/fetch evidence. Restarting the app resets all session health evidence.

Queue frames are not unique recovered messages: duplicates and command responses may be included. Interrupted fetches are excluded from completed-fetch totals. Last full-sync count excludes subsequent periodic queue checks. An empty queue does not establish recovery of messages never received or no longer retained by the radio. Local-history size is separate from storage write status; existing history-write failures are surfaced with an export action. No error reported does not prove the storage medium is healthy.

Refresh, reconnect and export reuse existing actions. The panel introduces no transport commands, automatic retry policy changes or additional radio polling. Its one-second display timer reads in-memory state only while the panel is open.

Validation on 2026-10-16:
- Full Node suite: 80 passed (three health model tests).
- health.browser.test.cjs passed offline controls, event-driven sync stage/queue updates, local/fetched distinction, successful sync evidence, error display, reconnection count, storage warning, Settings access and 760px width.
- smoke.test.cjs passed the existing fake-GATT connection, messaging, history and reconnect flow.
- Compact panel screenshot inspected; the dialog scrolls to lower metrics and actions.

All radio events in validation were simulated. No physical-radio or packaged Windows verification is claimed for this change. No release has been published.
