# Nightlink updates

Open Settings > Data & updates > Check for updates. Enable Check for updates while Nightlink is open to check after approximately 30 seconds and every six hours thereafter.

The Windows client reads the public GitHub latest-release API without credentials. Stable releases only are selected. Installer clients select the Setup artifact; portable clients select the Portable artifact. A missing matching artifact falls back to the release page. Offline, unavailable or malformed responses do not report that the app is current.

An available update opens its GitHub download in the browser. Nightlink does not download or install executables automatically, restart itself, or disconnect a radio during a check. Quit Nightlink cleanly before running an installer. Existing installed clients retain the update behavior in their installed version.

Installed candidate versions are compared against stable versions in rc.33 and later: a stable release of the same version is newer than its candidate, while a candidate with a higher base version is ahead of an older stable release. Candidates are not offered by the stable update feed. Local candidate files do not become remote updates until an approved release is published.

Repository visibility was changed to public at the owner's request on 2026-10-25. The public feed and full downloads of both v0.8.19 Windows artifacts were verified without authentication, including matching GitHub SHA-256 digests. This confirms distribution and download access, not successful installation on every client. No new stable release was published as part of this verification.

All future publication follows [RELEASE_PROCESS.md](RELEASE_PROCESS.md). Update-check validation is tracked in [#84](https://github.com/njsnowman/nightlink/issues/84).
