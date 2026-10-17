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

## Independent reception follow-up

Following the user’s report that adverts were not visible in CoreScope, the public CoreScope API was queried for the M1’s public identity. It returned these ADVERT records on 2026-10-17 UTC (2026-10-16 America/Indiana/Indianapolis):

| First seen UTC | Local time | Packet hash | Observers | Observations | Route |
| --- | --- | --- | --- | --- | --- |
| 00:13:21 | 20:13:21 | 61745805c648fd53 | 1 | 1 | Direct / zero hop |
| 00:13:54 | 20:13:54 | a494881c35d82732 | 2 | 3 | Flood |
| 00:24:15 | 20:24:15 | 7ec603c3c5dd93d0 | 2 | 3 | Flood |

The first two records align with the earlier installed-client test sequence. The final record was a separately instrumented direct BLE diagnostic using [7,1]. It increased physical radio sent/flood-sent counters by one; queue remained zero and error flags zero. CoreScope decoded a valid advert signature and observed the packet between 00:24:15 and 00:24:20 UTC. The active CoreScope live feed also contained the M1 ADVERT entry at 20:24:15 when inspected.

Read-only checks found the radio clock aligned with the computer (zero whole-second lag), and default scope name empty. The hypothesized stale-clock cause was not reproduced. No radio settings were changed. This demonstrates independent receipt for the listed packets; it does not guarantee every user-initiated rc.2 advert is transmitted or received. The exact time of the user’s unobserved attempts was not established.

Evidence links: [local advert](https://map.okimesh.org/#/packets/61745805c648fd53), [earlier flood](https://map.okimesh.org/#/packets/a494881c35d82732), [timed diagnostic flood](https://map.okimesh.org/#/packets/7ec603c3c5dd93d0).
