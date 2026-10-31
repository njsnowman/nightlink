# Nightlink updates

Open Settings > Data & updates > Check for updates. Enable Check for updates while Nightlink is open to check after approximately 30 seconds and every six hours thereafter.

The Windows client reads the public GitHub latest-release API (`https://api.github.com/repos/njsnowman/nightlink/releases/latest`) without credentials. Drafts and prereleases are rejected. The release tag must have the form `vX.Y.Z` and its page must be the canonical GitHub tag URL. Installer clients select `Nightlink-Setup-<version>.exe`; portable clients select `Nightlink-Portable-<version>.exe`. An asset must be fully uploaded at its canonical download URL. A missing matching artifact falls back to the release page. Offline, unavailable or malformed responses do not report that the app is current. The app does not read SHA256SUMS.txt or verify downloaded bytes; compare the checksum manually before running a download (see [Install or upgrade](README.md#install-or-upgrade)). A check result is kept in memory for 60 seconds. No repository file is edited to publish an update; the feed follows the latest published GitHub release.

An available update opens its GitHub download in the browser. Nightlink does not download or install executables automatically, restart itself, or disconnect a radio during a check. Quit Nightlink cleanly before running an installer. Existing installed clients retain the update behavior in their installed version.

Installed candidate versions are compared against stable versions in rc.33 and later: a stable release of the same version is newer than its candidate, while a candidate with a higher base version is ahead of an older stable release. Candidates are not offered by the stable update feed. Local candidate files do not become remote updates until an approved release is published.

Repository visibility was changed to public at the owner's request on 2026-10-25. The public feed and full downloads of both v0.8.19 Windows artifacts were verified without authentication, including matching GitHub SHA-256 digests. This confirms distribution and download access, not successful installation on every client. No new stable release was published as part of this verification.

On 2026-10-27, stable 0.8.22 was published. Uploaded sizes/digests and anonymous download access were verified. Isolated native checks confirmed an older 0.8.19 client sees the update and the 0.8.22 client reports current. These checks did not execute an installer. See [the release record](releases/0.8.22.md) for source, SHA-256 values and outstanding installer/lock limitations.

All future publication follows [RELEASE_PROCESS.md](RELEASE_PROCESS.md). Update-check validation is tracked in [#84](https://github.com/njsnowman/nightlink/issues/84).

Stable 0.8.23 was published on 2026-10-27. Public download availability, uploaded digests and live installer/Portable update selection from 0.8.22 were verified; 0.8.23 reports current. See [0.8.23 release record](releases/0.8.23.md).


Stable 0.8.24 was published on 2026-10-27 under the release-specific owner-approved exception. Anonymous download HEAD checks returned HTTP 200 with matching sizes for Setup, Portable and checksums; GitHub artifact digests match local SHA-256 values. The live updater offers the matching Setup/Portable download to 0.8.23 and reports 0.8.24 current. No installer was executed and no production profile/radio was accessed by these checks. See [0.8.24 release record](releases/0.8.24.md) for source, tests and unverified acceptance.

Stable 0.8.26 is prepared and its publication was authorized by the owner on 2026-10-31. As of this entry no v0.8.26 GitHub release exists, so the update feed still offers 0.8.24. After publication, uploaded sizes/digests, anonymous download access and Setup/Portable selection from 0.8.24 will be verified and recorded here. See the [0.8.26 release record](releases/0.8.26.md) for source, SHA-256 values and disclosed limitations.
