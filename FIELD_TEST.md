# Meshline: two-radio field test

Status: pending physical verification. Automated tests use simulated radios; they do not transmit over RF.

## Setup

1. Connect radio A to Meshline over Bluetooth. Connect radio B to another MeshCore client.
2. Confirm matching frequency, bandwidth, spreading factor and coding rate on the radios. Use the same channel key on both devices.
3. Wait for Meshline's radio panel to show a successful sync time. Add radio B's public key to A's contacts if needed.

## Messaging

1. Send `CHANNEL A1` from Meshline. Verify B receives exactly one copy. Meshline should report acceptance by the radio; channel broadcasts do not have a recipient delivery acknowledgement.
2. Send `CHANNEL B1` from B. Verify Meshline displays it once, including its reported hop count. Click the message body to inspect the hop map.
3. Send `DM A1` to B. Verify B receives it, and compare Meshline's recipient ACK status. An absent ACK must remain unconfirmed.
4. Send `DM B1` from B. Verify a separate DM window appears and the chime sounds. Reply from that window and verify receipt on B.
5. Minimize and close the DM window, then send new DMs. Check the window reopens without duplicate copies of a repeated packet. Test the sound mute setting.

## Repeater path

1. Repeat the channel test through known repeaters.
2. Verify the captured path's hop order against the known network. Numbered map points should match repeaters whose public-key prefixes are unique and whose contacts have locations.
3. A repeater with no location, an unknown ID, or a prefix collision must remain an explicit gap. No line should pretend that a missing hop was a direct link.
4. Open Network map and a message path with internet available. Verify street tiles appear automatically, even without known hop locations, with OpenStreetMap attribution. Without internet, the hop overlay should remain usable.

## Recovery

1. Power off A or disable Bluetooth while connected. Verify Meshline disables sending and displays its reconnect status.
2. Restore the radio/Bluetooth. Verify Meshline reconnects to the same remembered device, resynchronizes, and shows a new successful sync time.
3. Verify no failed or unconfirmed message is automatically resent.
4. Use **Disconnect radio** deliberately. Wait at least 30 seconds: it should stay disconnected until you reconnect manually.
5. With the radio unavailable, retries should back off and stop after six attempts. Verify **Retry connection now** works once the radio is available.
6. Restart Meshline. Verify local history and contact cards persist. Bluetooth selection remains a user action after a full restart.

## Report

Export **Diagnostic log** from the radio panel after a failure. Record the test step, both firmware versions, approximate time, and what each side displayed. Diagnostic logs include state transitions, packet types/lengths and errors; they do not include packet payloads, channel keys, PINs, message text, contact notes or photos. Keep screenshots separate if needed.
