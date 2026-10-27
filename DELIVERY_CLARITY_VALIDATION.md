# Delivery state and retry validation

> Evidence record: dated results below retain their original scope. For current downloads, release status and remaining limitations, use the [documentation index](DOCUMENTATION.md) and [0.8.22 release record](releases/0.8.22.md).


Tracking: https://github.com/njsnowman/nightlink/issues/18

Outgoing messages display structured queued, sending, retrying, awaiting ACK and final states. Channel acceptance is labelled Broadcast accepted by radio; it does not imply receipt by another node. Direct messages become acknowledged only when recipient ACK evidence is present. Legacy saved statuses remain supported.

Unconfirmed, interrupted and cancelled messages offer Retry message in the main conversation, floating DM and native DM window. Retry requires confirmation that another transmission may duplicate a previously received message. It creates a separate outgoing message, preserving the original attempt record. Controls are disabled offline or while sending; confirmation rechecks the radio identity, connection and delivery state. No reconnect/restart replay is introduced.

Validation uses simulated radios and native-window bridge fixtures, with no Bluetooth or RF transmission. delivery.test.cjs covers retry budgets, ACK timing, cancellation, disconnect, phase transitions and legacy presentation. delivery.browser.test.cjs covers failed send, no transmission before retry confirmation, acknowledged retry, offline blocking, channel acceptance, floating/native retry controls and a 760px viewport. Existing smoke.test.cjs validates the broader fake-GATT messaging flow.

No release or packaged binary is produced by this change. Physical recipient delivery still requires a second radio or reachable peer.

Results (2026-10-16): full Node suite 77/77 passed; delivery.browser.test.cjs passed; smoke.test.cjs passed after updating assertions for the new labels. Compact screenshot inspected. Native renderer actions were simulated; packaged native IPC was not re-exercised for this change.
