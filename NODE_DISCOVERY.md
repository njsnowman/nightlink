# Nearby node discovery

Tracking [#82](https://github.com/njsnowman/nightlink/issues/82).

Contacts has two separate actions: saved-contact filtering (local, no radio traffic), and Discover nodes (one manual direct-range request). Radio Tools also exposes discovery alongside existing local/flood adverts and contact sharing/import. No new primary navigation item is added.

Discovery requires companion protocol8+. It sends command55 with control payload0x80, a type-filter bitmask and random little-endian32-bit tag. It listens seven seconds after radio command acceptance, correlates full-key0x90 responses by tag/type, and caps results at128. It allows at least60seconds between attempts per radio and never scans automatically or retries automatically. Existing serialized request/generation checks are reused; cancelling a queued scan prevents its write. Stopping after transmission only stops local listening and cannot recall the RF request.

Results show full public key, type, local RX SNR/RSSI and the responder's reported SNR. Names come only from an exact existing saved-key match. Responses do not establish authenticated identity or provide name/location. No contacts are automatically added or overwritten. Add contact opens the existing explicit form; the user reviews/submits it separately. Disconnect/identity changes clear results and cancel listening.

Primary references checked2026-10-24:
- [Companion firmware command and receive implementation](https://github.com/meshcore-dev/MeshCore/blob/main/examples/companion_radio/MyMesh.cpp): CMD_SEND_CONTROL_DATA and onControlDataRecv.
- [Control payload layout](https://github.com/meshcore-dev/MeshCore/blob/main/docs/payloads.md#control-data): DISCOVER_REQ/DISCOVER_RESP, full-key/prefix forms and type masks.
- [Zero-hop routing](https://github.com/meshcore-dev/MeshCore/blob/main/src/Mesh.cpp): sendZeroHop and control reception. Requests/replies are not forwarded through repeaters.

The older wiki example includes an extra reserved byte; the implementation follows the current firmware's command parser (subtype at command byte1). Physical-radio interoperability remains a separate acceptance item. Synthetic packet tests and successful command acceptance are not proof of RF delivery or a complete inventory of nearby nodes.
