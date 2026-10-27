# Send feedback and DM presentation — source validation

Tracking: [#96](https://github.com/njsnowman/nightlink/issues/96), [changelog](../CHANGELOG.md).

Source changes only; no downloadable candidate, stable release, installer change or updater publication is recorded here.

- Shared awaiting-ACK badge has a rotating accent-colored indicator. App and operating-system reduced motion disable rotation; terminal delivery phases do not display the indicator. Native DM snapshots carry the app preference.
- Completion cues are session-only and deduplicated by message ID. Direct messages require a recipient ACK; channel messages require radio acceptance. Sent-message sound can be disabled in Notifications and is backed up. DM sound off also suppresses direct-message completion; quiet hours suppress all completion cues. Audio playback failure does not alter delivery state.
- Native DM presentation retains explicit open/focus intent during loading. Incoming events re-show existing hidden DM windows without requesting keyboard focus. Windows requested while the main window is hidden/minimized detach from that owner. Closing a workspace dialog does not reattach children to a hidden owner.

Validation on 2026-10-27:

- Full configured Node suite: 215 passed, zero failed.
- Isolated native integration passed: contact card Send message, one native window per peer, incoming event reopens an existing hidden DM with hidden owner, manual reopening, retained conversation contents, and duplicate late ACK events produce one completion cue. The test disables startup and network and blocks physical radio commands. A test synchronization error from accessing the child DOM before load was corrected to wait for the element; the rerun passed.
- Isolated rendered CSS preview passed: transform changes during active wait, OS/app reduced motion disables it, acknowledged phase removes it. Static screenshot visually reviewed.

These are synthetic UI/protocol checks. No message was sent through a physical radio during validation, and the installed production client remains unchanged. Physical arrival/foreground behavior and audible output on the user's speakers remain user acceptance items. Older contact/reaction work in the same source tree retains its separate tracking and validation.
