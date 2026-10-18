# Reconnect catch-up investigation

Tracked in [#49](https://github.com/njsnowman/nightlink/issues/49). A user reported that a manual refresh recovered M1 messages after reconnect did not display them. This confirms retained data was available, but does not establish the initial failure.

A deterministic simulated regression reproduced a lost messages-waiting notification at an empty-queue response boundary: before the fix zero messages were fetched and one remained queued. The fix latches the notification and rechecks the queue. The regression now passes; requests remain serialized. A separate identity-event reconnect test recovers retained messages without manual refresh. Empty queue completions are now logged as well as nonempty ones.

Bluetooth/radio/recovery tests passed (38 tests before the additional identity reconnect test); the two targeted reconnect/boundary tests passed after it was added. No physical M1 reconnect test has been performed for this patch, and the exact cause of the reported incident remains unconfirmed. No new downloadable release is approved by this record.
