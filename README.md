# Nightlink — Beyond the grid.

A Windows desktop MeshCore client with Bluetooth LE, a black glass interface, and a compact layout. Original UI inspired by MeshCore Open's feature structure; no upstream application code or assets included.

## Run

Browser preview: run `node server.cjs`, then open http://127.0.0.1:4173 in Microsoft Edge or Chrome. Desktop: `npm install`, then `npm start`. Build a portable Windows executable: `npm run dist`.

## Connect

Choose **Connect radio → Find Bluetooth radio**. Use MeshCore BLE companion firmware and enable Windows Bluetooth. Disconnect another client using the radio. Desktop mode includes a device picker and PIN handling; a supported browser provides its native picker. After an app update, refresh and reconnect to load the new sync layer.

## Implemented

- BLE discovery, PIN pairing, companion handshake, disconnect, manual reconnect and controlled automatic recovery.
- Radio identity, firmware/model, frequency and TX power.
- Battery voltage and firmware-supported uptime/RSSI/SNR/packet statistics; polling every 30 seconds.
- Full contact list and configured channel slots, including slots after gaps.
- Channel and direct text messages with UTF-8 byte limits, serialized commands and visible send failures.
- Channel acceptance is labeled as accepted by the radio, not delivered. Direct-message recipient ACKs are matched by firmware tag and missing ACKs remain unconfirmed.
- Incoming message queue synchronization on connection, message-waiting pushes, and polling; duplicate detection.
- Offline radio profile and local message history scoped to radio public key and channel key fingerprint. Channel secrets and Bluetooth PINs are not persisted. The most recent 3,000 messages are saved in local browser/app storage; history is not encrypted at rest. Export history from the radio panel.
- Geographic coordinate plot using actual advertised locations. Unknown locations remain unplotted. No inferred routing lines or sample geography.
- Accent, reduced-motion and opt-in desktop notification preferences.

## Channels, contacts and routes (v0.2)

Use **+** beside Your channels to add a hashtag channel, create a private channel, or join with a 32-character hexadecimal key. A free slot is verified before writing; slot 0 and existing channels are preserved. Private channel creation displays the generated key once for sharing. Writes are read back from the radio before success is reported.

Use **Add contact** in Known nodes to enter a full 64-character MeshCore public key, radio name and node type. Existing identities are not overwritten. Select a node to edit its contact card: nickname, photo and notes are stored in IndexedDB on this computer, keyed by public key. Photos are resized to square JPEG avatars. These personal details are never transmitted to the mesh and survive radio resynchronization and app restarts.

Incoming messages show reported hop counts. **Route details / View repeaters** shows the observed path when a matching raw RX packet was captured. The raw channel packet is checked with the channel MAC and decrypted in memory, then matched to channel, sender text, timestamp and hop count. Channel keys used for this remain in memory only and are cleared on disconnect. Repeater names are matched by public-key prefixes; collisions and unknown IDs remain explicit. Older queued messages without matching raw captures have no repeater list. Outgoing broadcasts do not report a receiving route. Direct-route message frames do not supply a known inbound hop count.

## Contact clicks and direct message windows (v0.3)

Click a contact name/photo in Known nodes, a map node, or the direct-message sidebar to open its editable card. Use **Message contact** to open the conversation. Clicking the name at the top of a direct conversation also opens the card.

New incoming DMs open a separate native conversation window in the Windows app, or a floating non-modal panel in the browser preview. Windows are reused per sender; duplicate packets do not trigger another popup. Reply from the popup, open the sender's card, minimize or close it. Replies use the connected radio and existing delivery/ACK status tracking. Switching radio identities closes the previous radio's DM windows; disconnect disables replies while retaining the conversation.

A bundled two-note chime plays for incoming DMs. **Settings → Direct message sound** mutes/unmutes it. Browser autoplay rules may require the **Enable DM sound** button if the page has not received a user interaction. The native app uses an explicit media autoplay policy in its DM windows. The app must remain running and connected to receive messages; fully exiting it stops reception.

## Obsidian glass & compact mode (v0.4)

Black layered glass panels, cool silver accents, reflective borders, blurred surfaces, and matching contact-card/DM styling. All assets and fonts work offline. Windows 11 22H2+ also supports the app's native acrylic background material; the CSS glass theme remains available elsewhere.

Use **Compact** in the top bar or **Ctrl+Shift+C** to switch density. The setting persists across restarts. In the Windows app it resizes to 920×740 (subject to available display space), then restores the previous window bounds when expanded. You can resize down to 760×560. Channels, contact cards, radio actions, and Settings remain available in compact mode. The compact preference can also be changed in Settings.

## Recovery and message hop maps (v0.5)

After an unexpected Bluetooth drop or transport timeout, reconnect uses the same remembered device with delays of 1, 2, 4, 8, 16 and 30 seconds. It stops after six attempts. Deliberate Disconnect pauses automatic retry. Toggle recovery in Settings or use Retry connection now. Setup stages have deadlines; cancelled attempts cannot mark the radio connected. A full application restart still requires Bluetooth selection.

The radio panel shows sync stage, last successful sync time, and an exportable diagnostic log. Logs contain state transitions and packet codes/lengths, not payloads, keys, PINs, notes, photos or message text. Messages are never automatically resent.

Click a channel message body (or its route-details button) for a numbered hop map. Only repeaters with a unique known identity prefix and a shared location are plotted. Lines join consecutive located hops; missing hops remain gaps. Channel messages do not identify the sender's geographic location, and outgoing broadcasts do not report recipients' paths. Route details require a matching captured raw packet. Locations are from the latest stored advertisements, not historical GPS samples at message time.

All map views now load visible OpenStreetMap street tiles automatically, revealing the viewed area to that service. Tile failures leave the hop overlay intact. No bulk/offline tile download is provided. Leaflet 1.9.4 is bundled locally under its included BSD-2-Clause license.

See [FIELD_TEST.md](FIELD_TEST.md) for the two-radio verification checklist. Physical messaging and repeater-path verification remain pending.

## Default street maps (v0.6)

The Live mesh panel, expanded Network map, and Message path always initialize with street tiles. No extra Load map action is required, including when no radio or hop coordinates are available. The initial view uses your saved viewport, or a world street-map view if no location is known; it fits to radio/contact coordinates when they arrive. The network map keeps its viewport when switching views or changing compact density.

Street tiles load automatically from OpenStreetMap and can use the browser's normal HTTP cache. Internet access is required for uncached tiles. Loading and failure panels show clear status and a Retry street map control instead of an unexplained empty panel. Offline overlays remain available; complete offline street maps are not bundled. There is no prefetching or bulk tile download. Dark street styling matches the black-glass theme.

## Validation

`node --test bluetooth.test.cjs radio.test.cjs routes.test.cjs recovery.test.cjs delivery.test.cjs` exercises transport and protocol behavior. `smoke.test.cjs` tests the UI against a fake GATT radio using the development machine's bundled Playwright and Microsoft Edge; its runtime paths are machine-specific. Tests never transmit over RF. A user confirmed basic Bluetooth connection with physical hardware. New synchronization and messaging need field verification with that radio and another peer.

## Current limits

Radio frequency and power settings are read-only. USB/TCP transports, repeater administration, bulk offline tile caching, and message attachments are not implemented. Street maps load automatically; uncached tiles require internet. A timestamp or recent advertisement does not establish that a contact is currently online. Timeouts disconnect the transport to avoid matching late responses to later commands. Direct messages have bounded automatic retries with a final flood fallback, cancellation, and delivery details. Retries stop on connection changes and are never replayed after reconnect or restart. Channel broadcasts do not use recipient ACK retries.

Protocol references: [MeshCore companion protocol](https://github.com/meshcore-dev/MeshCore/blob/main/docs/companion_protocol.md), [companion firmware](https://github.com/meshcore-dev/MeshCore/blob/main/examples/companion_radio/MyMesh.cpp), [Electron device access](https://www.electronjs.org/docs/latest/tutorial/devices).

## Nightlink 0.8.0

Compact contact popups show name/photo and Send message, with editing and radio details in a secondary menu. Overview shows local favorite nodes and follows incoming messages. Direct messages default to four saved-route attempts and one flood fallback (two flood attempts when no route exists), with configurable budgets. The original timestamp is preserved while the protocol attempt byte increases. ACKs from any attempt confirm one logical message; missing ACKs remain unconfirmed. Main and separate DM windows expose Delivery details and Cancel attempts. See SEND_RETRIES.md for protocol research and FIELD_TEST.md for pending physical checks.
