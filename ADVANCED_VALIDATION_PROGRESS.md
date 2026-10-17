# Advanced feature validation progress
Tracked in [#43](https://github.com/njsnowman/nightlink/issues/43), draft [PR #44](https://github.com/njsnowman/nightlink/pull/44).

Nightlink 0.8.17 shipped the connection flow separately through #45 / PR #46. Advanced branch version is now 0.8.19-rc.1; no advanced 0.8.19 download has been built or published. The independent scrolling fix shipped as 0.8.18 through #47 / PR #48.

## Additional evidence
- Real whisper.cpp v1.9.2 Windows CPU runtime with ggml-tiny.en model transcribed the upstream public jfk.wav sample successfully.
- voice-inference.native.test.cjs passed against advanced source with Electron 42.11.12: real inference through trusted IPC; expected sample phrases; simultaneous-call exclusion; idle recovery. The simulated microphone stream traversed the capture/downsampling/WAV/transcription/review pipeline. No radio message was sent.
- Fixed a concurrency race by reserving the transcription engine before asynchronous configuration lookup.
- A limited downtown Indianapolis OSM XML extract was rendered locally to 58 raster tiles over zooms 15–17. No standard OSM tile bulk download was performed.
- offline-streets.browser.test.cjs imported that attributed pack through the UI and confirmed offline street rendering in Overview, Network and message paths, attribution, persistence and missing-coverage status.

## Remaining limits
No physical microphone capture or new physical RF capture was performed. COM23 access was denied during a read-only availability check; the owning application was not interrupted. Physical RX capture/capability review remains a release gate for the advanced batch. Offline coverage is confined to installed packs; the validation extract is not a global basemap or a default user map. End-user pack provisioning still needs usability review.

Public test assets and private app profiles remain in separate cache directories. Neither radio messages nor the user's normal profile were uploaded. Model/runtime and map extract are not bundled into the application.

## Current implementation follow-up

Added standard raster MBTiles import with required attribution, read-only SQLite access, TMS-to-XYZ conversion and input limits. Added explicit coverage summary and Show downloaded area. Packaged-runtime source integration passed with a 58-tile OSM-derived extract and a test-owned picker. Added recording duration, cancel/discard and serialized microphone startup/cleanup. Physical radio handoff is being prepared through normal Quit; no process kill or live-profile editing is used.

## Physical receive validation completed

The production 0.8.18 app was quit normally after checking that no send was active. Candidate source 87008d7733220d8f3fa480f7bca351b877d21b7a, packaged with Electron 42.11.12, synchronized with the Heltec V4.3 OLED on USB COM23 (firmware v1.17.1-d929643). Over 122 seconds it remained connected/ready with zero disconnects and captured one valid RX-log packet, one placement sample and one observed path group. This validates basic capture plumbing on this radio, not statistical placement accuracy or multi-hour endurance. No test messages, adverts or settings writes were initiated.

Normal Quit exited the test; read-only COM23 open/close with DTR/RTS disabled confirmed port release. A private validated backup was merged through the installed app's normal restore path; zero new messages were present, no capacity skips occurred, and all existing message IDs survived reload. The normal installed app was reopened and reconnected to USB, showing its 25 retained messages. No private backup or packet content was uploaded.
