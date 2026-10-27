# Startup connection

Tracked in [#56](https://github.com/njsnowman/nightlink/issues/56).

In Settings, enable **Automatically connect to my last radio on startup**. Connect and synchronize a radio once to save its device identity. The preference defaults off and enabling it does not interrupt the current session. The next launch tries that device up to three times, with waits of five and fifteen seconds between failures. Cancel is available beside the top-right connection control. Manual connection selection, Disconnect or disabling the option cancels startup retries. Synchronization failure requires a manual retry. Successful synchronization opens Overview. Existing reconnect-after-loss remains a separate preference.

Bluetooth discovery matches the saved device ID, not its displayed name. USB matches hardware serial, vendor and product across COM reassignment. USB devices lacking a hardware serial require manual selection. New pairing can require Windows/PIN interaction. No PIN or radio key is stored by this feature. The device descriptor and opt-in flag are stored in startup-connection.json in the app profile; exports do not include this machine-specific setting.

## Message history limitation

MeshCore companion synchronization consumes queued messages. A phone app that already read them retains its own local history; switching clients does not copy that archive. Startup connection drains the remaining radio queue using the existing synchronization path. It cannot recover messages already consumed by another client or overwritten by a full queue. The official iPhone app lists SQLite database export in its release notes, but its export schema has not been validated for Nightlink import.

## Validation

Startup desktop, serial and recovery tests passed (23 tests). Browser startup scenarios passed for success, exhaustion, cancellation, sync-error pause and default-off Settings. Packaged bridge checks use synthetic discovery and synchronization, verify exact saved selection and preference persistence. Packaged navigation remains bounded at 760x528 and larger. No physical startup-radio test is claimed.
