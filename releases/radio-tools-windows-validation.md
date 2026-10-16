# Radio Tools Windows validation — 2026-10-16

Tracking: [#33](https://github.com/njsnowman/nightlink/issues/33); [PR #34](https://github.com/njsnowman/nightlink/pull/34).

Application source: 6fd789b989dd2f1eab598acaecb7336da48f5c68. Package version: 0.8.14, local development validation only; not an updated public 0.8.14 release. Built with electron-builder 26.15.3, Electron 42.11.12, Windows x64, unpacked directory target. No tag or release assets published.

Artifact hashes (SHA-256):

- Nightlink.exe: `99c6f8f4eba201b407aa8fcccfc0a534148c6d90d7e79e98e6457491104353b4`
- resources/app.asar: `bb5c68504db8857695e4d25bd13d87186899f580707857fe9cae1d57dedc6e94`

Checks passed:

- 94 Node unit tests, including seven advert/contact/QR cases.
- radio-tools.browser.test.cjs: confirmation before command, QR image decode and preview, invalidation, malformed input and window bounds.
- radio-tools.native.test.cjs against packaged app.asar: explicitly confirmed flood frame [7,1], QR export and application frame bounds at actual Electron content sizes 760×528 and 1100×740.
- navigation.native.test.cjs against packaged app.asar: seven views, compact and standard modes, large directory/contact-card access and fixed application frame at four actual Electron content sizes.

Native tests used a separate fixture profile with simulated transport. The production profile and physical radio were not used. Firmware acceptance, actual RF transmission/reception, cross-app QR compatibility and physical-radio import/signature behavior remain unverified. This record does not claim over-the-air validation or publish an update.
