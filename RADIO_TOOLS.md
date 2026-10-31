# Radio Tools

Tracked in [#33](https://github.com/njsnowman/nightlink/issues/33).

Open Radio from the main sidebar. The Radio page shows the connected radio's identity and grouped action cards, with expandable data and device details. Radio Tools opens a grouped tool panel:

- Device & setup: Device Center, CLI Terminal, Add channel.
- Contacts & discovery: Discover nodes, Share my contact, Import contact.
- Broadcast: Local advert, Flood advert.

The workbench also provides Trace Path, Line of Sight, RX Log, Noise Floor, Discover Nodes and CLI. See the [user guide](USER_GUIDE.md#radio-workbench) for operating steps. Selecting a tool does not transmit.

Device Center configures the connected companion, authenticated remote repeaters and rooms, and direct USB text-CLI devices. Changes are staged, reviewed and read back. See [Device Center](docs/device-management.md).

## Contact maintenance

To remove one contact from the radio, open its contact card and choose More > Remove from radio, then confirm. To remove every contact except your Nightlink favorites, choose Remove all except favorites in Radio Tools or Nodes. Review the preview, tick the acknowledgement and choose Remove non-favorites. Stop after current contact ends the run after the contact in progress. Each removal is verified by an exact-key lookup on the radio. Saved messages, nicknames, photos, notes and favorites stay on this computer. Tracked in [#102](https://github.com/njsnowman/nightlink/issues/102) and [#104](https://github.com/njsnowman/nightlink/issues/104).

 Local adverts use companion command 7 with scope 0; flood adverts use scope 1. Both require explicit confirmation and a synchronized connection. Nightlink prevents overlapping configuration operations and limits adverts to one per ten seconds for each radio during the app session. Acceptance means queued by the radio, not received by another station. Location inclusion follows radio firmware settings.

Share my contact exports command 17 without a public key; Share contact in a contact card’s options supplies its full public key. Export does not transmit. Share links and QR images contain the exported signed advert; local photos, nicknames and notes are excluded. Stored contact adverts can contain location. If firmware has no stored advert, export may fail.

Import accepts meshcore:// hexadecimal adverts pasted into the field or decoded from a PNG, JPEG or WebP QR image. Preview is structural parsing, not local signature verification. Command 18 passes the advert into firmware processing. Nightlink checks command 30 readback before confirming a contact; existing identities are not overwritten. Signature rejection, contact capacity, unsupported firmware or readback delays can prevent confirmation. Refresh before retrying an accepted but unconfirmed import.

Protocol references: [companion command handling](https://github.com/meshcore-dev/MeshCore/blob/main/examples/companion_radio/MyMesh.cpp), [packet framing](https://github.com/meshcore-dev/MeshCore/blob/main/src/Packet.h), [advert data](https://github.com/meshcore-dev/MeshCore/blob/main/src/helpers/AdvertDataHelpers.cpp), [contact import loopback](https://github.com/meshcore-dev/MeshCore/blob/main/src/helpers/BaseChatMesh.cpp).

Validation: automated protocol tests cover scope frames, cooldown, duplicate actions, generation changes, identity matching, readback and QR roundtrip. Isolated browser tests cover confirmation, QR-image decoding/preview, invalidation, malformed input and window bounds. No physical-radio or over-the-air compatibility test has been performed for this change.

## Current workbench evidence

The 0.8.22 record separately documents physical Heltec USB synchronization, noise/battery reads, discovery, RX observations and a matching returned direct repeater trace. Earlier trace timeouts remain unexplained; multihop reliability is unverified. The original advert/import validation statement above describes that change, not the later workbench test. See [0.8.22 validation](releases/0.8.22.md).
