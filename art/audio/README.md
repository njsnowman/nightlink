# Nightlink startup sound

`startup-modem-laser.wav` is the original sound synthesized for Nightlink and selected by the owner on 2026-11-03. It progresses from a dial tone and modem chatter through an energy buildup to a laser shot. It is not a recording of a real connection and contains no third-party sample audio.

Format: mono, 44,100 Hz, 16-bit PCM WAV, 6.1 seconds.

Regenerate from the repository root with `node art/audio/make-startup-sound.cjs`. The seeded synthesis is deterministic. Approved WAV SHA-256: `a273e583bc3a4be31cc33619fe35ae30c31827aea5bb13e1362fc85c33833ce0`.

The terminal startup controller waits for the media `ended` event before dismissing its loading screen. Existing explicit sound-off and quiet-hours preferences are respected. Simulated browser media events verify lifecycle/error behavior; native playback timing is validated separately with output muted and an isolated profile. Speaker output quality remains an owner acceptance check.
