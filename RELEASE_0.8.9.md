Nightlink 0.8.9 adds a per-user Windows installer and optional update checks.

> Evidence record: dated results below retain their original scope. For current downloads, release status and remaining limitations, use the [documentation index](DOCUMENTATION.md) and [0.8.22 release record](releases/0.8.22.md).


- Installer: Start menu shortcut, optional desktop shortcut, and retained local data on normal uninstall.
- Portable: available separately for users who prefer to run without installation.
- Settings: running version, manual release check, and opt-in update notices. Downloads require an explicit action; updates are never installed automatically.

Compatibility

Windows x64. Close Nightlink before installing. The existing %APPDATA%/Meshline data location is retained. Back up your data in Settings before changing installations. Contact storage remains version 2, introduced in 0.8.8; earlier clients using version 1 may not open upgraded contact cards.

This repository is private. Anonymous update checks cannot currently discover its releases. Use Open GitHub releases in a signed-in browser. No credentials are embedded in the app.

Validation

75 Node tests passed. Browser/native update checks and existing browser integrations passed during feature validation. Installer and portable builds were validated; a separately identified installer completed silent installation, same-version reinstall and uninstall with test data retained. Desktop-checkbox interaction and a version-increment upgrade were not exercised. No new physical-radio validation is claimed.

Tracked in #17; implementation #16 and #15.
