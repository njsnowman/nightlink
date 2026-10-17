# M1 advert acceptance and completion-state correction

Tracking: [#33](https://github.com/njsnowman/nightlink/issues/33), [PR #34](https://github.com/njsnowman/nightlink/pull/34).

Physical test on the user’s M1 through the installed 0.8.15-rc.1 client:

- Bluetooth connected and synchronization finished (350 contacts, two channels).
- One explicitly confirmed local advert returned “Radio accepted the advert for transmission.”
- After more than ten seconds, one explicitly confirmed flood advert returned the same acceptance result.
- The app remained Bluetooth connected after both tests. No chat messages were sent.
- The completed Send advert button stayed disabled and inherited the global cursor:wait rule. This reproduced a misleading busy cursor after successful command completion. It did not establish an indefinitely pending radio command in this session.

Correction: show a sending label/status only while pending; finish with an enabled Done button, remove aria-busy, and display a larger success/error result. Do not retry or send a second advert from Done.

Validation: seven protocol/QR tests passed; isolated browser checks passed success and rejection completion, enabled Done, cleared busy state and existing QR/preview/window checks. Packaged native test passed against corrected candidate application files using simulated transport. Corrected UI has not been retested on physical hardware; the physical evidence above validates acceptance in rc.1. Reception by another radio and repeater forwarding were not observed.
