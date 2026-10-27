# Drafts and reading continuity

> Evidence record: dated results below retain their original scope. For current downloads, release status and remaining limitations, use the [documentation index](DOCUMENTATION.md) and [0.8.22 release record](releases/0.8.22.md).


Tracking: https://github.com/njsnowman/nightlink/issues/24

Drafts are local inert text, scoped by companion identity and conversation, and included in local JSON backups. Main channel/DM composers and floating/native DM replies share the relevant draft. Native draft messages are accepted only from a registered child window and bounded to 4096 characters; radio/contact identity is taken from the main-process window record. Drafts are never transmitted on reopen or reconnect.

Draft storage failures retain in-memory text and show a warning; persistence across app exit is not guaranteed after a storage failure. Unconfirmed/failed/cancelled sends retain drafts. A recipient-acknowledged DM or radio-accepted channel broadcast clears only the matching submitted text, preserving a newer draft. Radio acceptance is not recipient confirmation.

Main reading-position behavior is retained. Floating DM updates capture the current anchor before rebuilding messages; minimized windows do not overwrite the position. Native DMs capture local reading anchors before applying updates, even when unfocused. Newest-message controls let readers return to the bottom; readers already at the bottom continue following arrivals.

Active mention selection no longer closes on every background render. It closes on conversation/radio changes, blur or explicit selection/cancellation. Selection dispatches an input event to persist the resulting mention in the draft. Delayed blur handling checks current focus before closing the picker.

Validation on 2026-10-16:
- Final full Node suite: 84 passed, including draft persistence, storage failure and backup validation.
- drafts.browser.test.cjs passed per-conversation/reload restoration, active mention selection across five background renders, persisted mention text, failed/accepted sending, shared floating DM draft, reading-anchor preservation and jump to latest.
- drafts.native.test.cjs passed against the source directory in an isolated Electron profile: native draft IPC, main/native shared draft, reopen restoration and reading continuity. No production profile or Bluetooth connection was used.
- Existing smoke.test.cjs, attention.browser.test.cjs and backup.browser.test.cjs passed.

No packaged Windows build or physical-radio validation is claimed for this change. No new release has been published.
