# Windows installer and update checks

Tracking: https://github.com/njsnowman/nightlink/issues/15
Status: implemented and locally built; not published as a release.

## Installer behavior

Build both NSIS installer and portable targets. Names are Nightlink-Setup-<version>.exe and Nightlink-Portable-<version>.exe. Installation is per user with a destination chooser, Start menu shortcut and an optional desktop shortcut page (unchecked by default). The installer does not launch the app on completion.

The existing app ID and %APPDATA%/Meshline userData path are unchanged. Normal uninstall retains application data. The installer does not automatically install later updates.

## Update behavior

Settings shows the running version and build mode, supports a manual GitHub release check and provides optional checks every six hours while the app remains open. Automatic checks default off. Available releases produce a non-blocking in-app notice. Opening a download is an explicit user action; no update is executed and Bluetooth is untouched.

Version checks use a fixed GitHub API URL with no credentials, bounded response size and timeout, and no redirects. Only stable releases from the expected repository and matching installer/portable assets are accepted. Download actions use main-process validated URLs; the renderer cannot supply an arbitrary URL. Checks are coalesced and cached for one minute.

The repository is private. Anonymous API checks currently cannot discover its releases. Access/rate-limit and offline states never report "up to date"; the app offers Open GitHub releases in the user's signed-in browser. No credentials are embedded and repository visibility is unchanged. Automatic discovery requires an accessible release feed or a separately designed authentication approach.

## Validation — 2026-10-16

- Full Node suite: 75 passed, including seven version/release/access/URL checks.
- Browser integrations: existing GATT, attention, search and backup checks passed.
- updates.browser.test.cjs passed version display, default-off preference, private/offline states, available notice, explicit navigation, persistence and 920/760 px layouts.
- updates.native.test.cjs passed isolated packaged IPC/version checks, mocked private response, one-minute caching, matching installer download and release-page navigation. Network and shell navigation were mocked.
- Production installer and portable targets compiled successfully, including the custom shortcut page.
- A separately identified installer (app ID local.meshline.installer-validation; product/shortcut Nightlink Installer Test) installed silently to an explicit cache directory with exit 0 and a working Start menu shortcut. Same-version reinstall returned 0 and preserved a test-data sentinel. Silent uninstall returned 0, removed its executable and shortcut, and retained the sentinel. The sentinel was then cleaned up. Production user storage remained present.
- The test installer used the same wizard/custom-shortcut and data-retention settings with a separate package identity and uncompressed, non-differential payload. Actual desktop-checkbox interaction and a version-increment upgrade were not exercised. Production installer artifacts were not installed over the user's app.

No release has been published for this change. No new physical-radio test is claimed.

## References

- [electron-builder NSIS configuration](https://www.electron.build/nsis/)
- [GitHub release API and access requirements](https://docs.github.com/en/rest/releases/releases)
