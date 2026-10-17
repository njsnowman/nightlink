# Local voice desk

Windows desktop dictation uses an explicitly selected local whisper.cpp `whisper-cli.exe` and compatible GGML model. Obtain a trusted Windows build from https://github.com/ggml-org/whisper.cpp and its compatible model; retain the runtime's required DLLs alongside its executable. Select both files under Diagnostics → Voice. These dependencies are optional and not bundled. No cloud transcription or browser speech-recognition service is used.

Dictate captures up to 60 seconds from the microphone, converts it to 16 kHz mono PCM WAV, and runs the configured process without a shell. The runtime receives only the temporary WAV and model paths. Temporary audio/transcript files are removed when transcription finishes or fails. Process timeout: three minutes. The review dialog never sends a radio message. Use in original conversation inserts edited text into the original radio/conversation only; the normal Send action remains necessary. The reviewed text must fit the 133 UTF-8 byte composer limit.

Optional incoming-DM reading uses only system voices reported as local. It respects quiet hours, muted conversations and the DM sound switch, and excludes messages recovered during synchronization. Voice preferences are off by default. This is speech-to-text messaging, not voice audio over LoRa. Browser preview has no transcription bridge.

Recording shows elapsed time and a Cancel recording control. Cancelling stops the stream and discards buffered audio without inference. Microphone startup is serialized; setup failures stop any acquired stream. The original radio/conversation is captured when Dictate is clicked, before permission/setup waits.
