# Nightlink startup sound

`startup-modem.wav` is the original sound synthesized for Nightlink. The owner selected a modem-to-laser version on 2026-11-03 and on 2026-11-27 asked for the modem dial-up only. It plays a dial tone, touch-tone dialling, ringback, the answer tone and modem handshake chatter, then fades out. It is not a recording of a real connection and contains no third-party sample audio.

Format: mono, 44,100 Hz, 16-bit PCM WAV, 2.4 seconds. Peak normalized to 0.72.

Regenerate from the repository root with `node art/audio/make-startup-sound.cjs`. The seeded synthesis is deterministic. WAV SHA-256: `2aa3bc51b85967f58d8d1b877cad14962fffd88ec18990bcd634f130ba4faead` (pending owner listening approval).

The terminal startup controller waits for the media `ended` event before dismissing its loading screen. Existing explicit sound-off and quiet-hours preferences are respected. Simulated browser media events verify lifecycle/error behavior; native playback timing is validated separately with output muted and an isolated profile. Speaker output quality remains an owner acceptance check.
