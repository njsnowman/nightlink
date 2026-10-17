# Advanced feature validation progress
Tracked in [#43](https://github.com/njsnowman/nightlink/issues/43), draft [PR #44](https://github.com/njsnowman/nightlink/pull/44).

Nightlink 0.8.17 shipped the connection flow separately through #45 / PR #46. Advanced branch version is now 0.8.18-rc.1; no 0.8.18 download has been built or published.

## Additional evidence
- Real whisper.cpp v1.9.2 Windows CPU runtime with ggml-tiny.en model transcribed the upstream public jfk.wav sample successfully.
- voice-inference.native.test.cjs passed against advanced source with Electron 42.11.12: real inference through trusted IPC; expected sample phrases; simultaneous-call exclusion; idle recovery. The simulated microphone stream traversed the capture/downsampling/WAV/transcription/review pipeline. No radio message was sent.
- Fixed a concurrency race by reserving the transcription engine before asynchronous configuration lookup.
- A limited downtown Indianapolis OSM XML extract was rendered locally to 58 raster tiles over zooms 15–17. No standard OSM tile bulk download was performed.
- offline-streets.browser.test.cjs imported that attributed pack through the UI and confirmed offline street rendering in Overview, Network and message paths, attribution, persistence and missing-coverage status.

## Remaining limits
No physical microphone capture or new physical RF capture was performed. COM23 access was denied during a read-only availability check; the owning application was not interrupted. Physical RX capture/capability review remains a release gate for the advanced batch. Offline coverage is confined to installed packs; the validation extract is not a global basemap or a default user map. End-user pack provisioning still needs usability review.

Public test assets and private app profiles remain in separate cache directories. Neither radio messages nor the user's normal profile were uploaded. Model/runtime and map extract are not bundled into the application.
