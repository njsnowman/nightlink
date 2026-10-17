# Windows tray and notifications

Tracked in [#40](https://github.com/njsnowman/nightlink/issues/40).

Closing the main Windows window hides it to the tray by default. The renderer continues running with background throttling disabled, preserving its Bluetooth or USB session. The tray icon carries a combined unread DM/channel-mention badge (up to 99), with separate counts and connection status in the tooltip and menu. Opening Nightlink again restores the existing instance.

Settings provides a close-to-tray switch, DM and mention sound controls, Desktop notifications, local quiet hours, and Quit. Quiet hours suppress sounds, native notifications and automatic DM windows while preserving messages and unread counts. Equal start/end times mean all day. Individual channel mute continues suppressing alerts. Recovered synchronization messages do not trigger alerts.

Native notifications are silent because existing DM/mention sound controls determine audio. Clicking a notification restores its conversation only while the same companion identity is active. Notification delivery still depends on Windows settings. The remote CoreScope frame has no desktop bridge.

Quit requests renderer-side recovery cancellation and transport disconnection, then exits after acknowledgement or a three-second fallback. A missing tray falls back to quitting when closing the window. The installer and portable distributions use the same behavior; the application does not register automatic Windows startup.

Validation uses unit tests and isolated Electron profiles. Native tray creation, hide/show, renderer state preservation, quiet DM suppression, settings persistence and process exit are exercised. Notification click routing uses a mock native notification; physical radio operation while hidden and Windows toast delivery are not claimed from those checks.
