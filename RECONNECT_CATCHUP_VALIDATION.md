# Reconnect catch-up investigation

> Evidence record: dated results below retain their original scope. For current downloads, release status and remaining limitations, use the [documentation index](DOCUMENTATION.md) and [0.8.22 release record](releases/0.8.22.md).


Tracked in [#49](https://github.com/njsnowman/nightlink/issues/49). A user reported that a manual refresh recovered M1 messages after reconnect did not display them. This confirms retained data was available, but does not establish the initial failure.

A deterministic simulated regression reproduced a lost messages-waiting notification at an empty-queue response boundary: before the fix zero messages were fetched and one remained queued. The fix latches the notification and rechecks the queue. The regression now passes; requests remain serialized. A separate identity-event reconnect test recovers retained messages without manual refresh. Empty queue completions are now logged as well as nonempty ones.

Bluetooth/radio/recovery tests passed (38 tests before the additional identity reconnect test); the two targeted reconnect/boundary tests passed after it was added. No physical M1 reconnect test has been performed for this patch, and the exact cause of the reported incident remains unconfirmed. No new downloadable release is approved by this record.


## Installed M1 inspection — 2026-10-18

The installed application reached ready at 06:41:47 America/Indianapolis on an Elecrow ThinkNode-M1, firmware v1.16.0-07a3ca9, protocol 13. Exported diagnostic metadata covered 06:41:38–06:44:05. All six queue requests returned NO_MORE_MESSAGES (code 10): two initial passes and four periodic polls. No channel/direct message response, message-waiting push or command/error event was recorded. The user confirmed another client had connected since midnight. This is consistent with an already-consumed queue, not evidence of an unrequested retained backlog. It does not resolve the earlier manual-refresh incident or verify nonempty physical backlog recovery.

Normal app remained connected. No peer messages/adverts, configuration writes, profile changes or isolated radio drains were performed. Private diagnostic export remains outside the repository.
