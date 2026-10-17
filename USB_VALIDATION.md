# USB companion validation

Tracked in [#37](https://github.com/njsnowman/nightlink/issues/37).

USB uses the shared MeshCore protocol session and per-radio identity/history. Web Serial opens only an explicitly selected port at 115200 baud. Outbound framing is 0x3c, uint16 little-endian payload length, command bytes. Incoming frames use 0x3e; parsing handles fragmented/coalesced reads, skips malformed headers and bounds accepted frame length to 512 bytes. No external serial library or driver installer is bundled.

Desktop serial permission requires the exact main local document. The chooser accepts only a currently listed port ID from that window’s main frame. Embedded CoreScope cannot select a port or access native bridges. Port changes update the chooser, and cancellation/timeouts release its callback. Only one transport is selected; late events from inactive transports are ignored.

Unit coverage: framing, malformed lengths, handshake, response matching, overlapping requests, firmware error codes, command timeout, read-end/unplug, cancellation before port selection, early-response/write failure, transport switching, main-frame permission checks and shared channel messaging over USB. Existing Bluetooth and protocol suites remain in the test command.

Physical source validation with user-authorized Heltec V4.3 OLED on COM23, USB VID 303A / PID 1001, firmware v1.17.1-d929643:

- Read-only .NET serial probe returned MeshCore self-info.
- Nightlink source app in isolated Electron profile selected COM23, completed identity/contacts/channels synchronization (284 contacts, one channel, zero queued messages), read telemetry, disconnected and reconnected using the remembered port.
- No firmware, frequency, power, channel or contact configuration changed. No mesh message or advert was transmitted during this USB test.

The physical test covers this device/firmware/cable combination. Automated stream-end tests simulate unplug; physical unplug and USB over-the-air messaging have not been tested. The packaged application repeated the same synchronization, telemetry, disconnect and reconnect test successfully in isolated profile nightlink-navigation-native-KDrdHX. Release artifact evidence is recorded separately before shipment.

Protocol references: https://github.com/meshcore-dev/meshcore.js/blob/master/src/connection/serial_connection.js and https://github.com/meshcore-dev/meshcore.js/blob/master/src/connection/web_serial_connection.js. Electron selection/permissions: https://www.electronjs.org/docs/latest/api/session#event-select-serial-port.
