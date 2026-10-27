# Unread state and notification controls

> Evidence record: dated results below retain their original scope. For current downloads, release status and remaining limitations, use the [documentation index](DOCUMENTATION.md) and [0.8.22 release record](releases/0.8.22.md).


Tracking: https://github.com/njsnowman/nightlink/issues/5

Status: implemented in source and local preview; not published as a release.

## Behavior

Unread state is stored per companion radio on this computer. Existing saved history is treated as read when upgrading; subsequently received and recovered messages are tracked individually. Reading a visible conversation marks messages through the visible reading position. New messages continue to scroll while reading at the bottom. Scrolling back preserves the message anchor; Jump to latest resumes following arrivals. Conversation selection and workspace view are restored after restart.

Muted channels keep history and unread counts while suppressing alerts and mention sounds. DM sound and mention sound preferences are independent. Desktop notifications require permission and the existing Desktop notifications preference; their clicks open the corresponding channel or DM. In-app alert buttons provide the same navigation. Recovered messages do not trigger sounds or popup storms.

Native DM windows report visible reading progress through validated IPC when focused. Automatically opened inactive windows do not mark messages read. Manual DM opens focus the conversation.

## Validation — 2026-10-15

- Full Node test suite: 54 passed, including five read-state regression tests.
- Existing simulated GATT browser integration: passed send, ACK, reconnect, retained history, contacts, mentions, DMs, compact layouts and maps.
- Conversation browser integration: passed unread persistence, read anchors across updates/reload, mute persistence, independent sound preferences, mention and desktop-notification navigation, silent recovery and focused floating-DM reading.
- Packaged Windows runtime: built successfully. Main-window notification/read bridges initialized; native DM rendered its new-message divider and reported the visible message and position on focus through IPC.

Browser notifications and radio messages were simulated. No new physical-radio or Windows notification-center delivery validation is claimed. Browser autoplay restrictions may require interaction before audio plays. Read preferences remain local to each application/browser profile.
