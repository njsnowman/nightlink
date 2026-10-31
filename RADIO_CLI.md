# Radio CLI Terminal

Open Radio → Command terminal, or Radio Tools → CLI Terminal. The terminal shares Nightlink's existing Bluetooth/USB request queue; it does not open a second connection or run Windows shell commands.

## Connected companion

/info, /contacts and /channels display the currently loaded radio data (channel keys are excluded). /battery and /clock query the radio. /help explains the current target; /clear clears output/history. Other local firmware commands use companion command 66 and response 29, supported in protocol 14+. Older companions show an explicit capability limit rather than probing unsupported commands. Firmware may disable local CLI even when the protocol is recent enough.

## Repeater or room

Choose a saved repeater/room and log in with its password. Login uses command 26 and a matching 0x85/0x86 notification. Remote commands use command 2, text type 1. Responses are direct text-type-1 messages from the selected key prefix. A colliding prefix is rejected. One terminal operation is allowed at a time. The protocol has no per-command response ID: a received CLI response from that node during the pending operation is treated as its reply, not as cryptographic proof of which command produced it. Long output may span several replies; the operation completes on the first matching response, and subsequent CLI output from the selected authenticated node is displayed while the terminal remains open.

Before each remote command, Nightlink reads the companion clock and sends a strictly increasing timestamp, waiting briefly when needed, because firmware rejects repeated timestamps. The reply deadline starts after the companion accepts the command and follows the companion's route estimate.

The companion's initial send acceptance ("Accepted by companion · awaiting remote reply (not a delivery acknowledgement).") is displayed separately from a remote reply. A timeout does not prove a command failed. Terminal commands are never automatically retried. Only Device Center inspection and preflight retry the five core reads (`get name`, `get tx`, `get lat`, `get lon`, `get radio`); see [Device Center](docs/device-management.md).

After a remote reply timeout, the target is quarantined: the terminal shows "Reconnect the companion after the previous uncertain reply." Disconnect and reconnect the companion, then log in again. This prevents a late reply from being shown as the answer to a new command. Logout clears the companion's local connection tracking using command 29; it is not a claim that all server-side authorization state was revoked. A reconnect or identity change invalidates terminal login state.

## Interaction and retention

Arrow Up/Down recalls up to 50 commands during this open terminal. Potentially mutating commands require a second Confirm command click. Firmware enforces actual command availability and permissions. Password input clears immediately when login starts. Commands containing password/secret/private-key/PIN indicators are excluded from history and echoed as a hidden sensitive command. This heuristic is not a general secret detector; avoid putting credentials in ordinary command text. Output is bounded to 48,000 characters in memory and is not written to history backups or diagnostic logs by this module. Closing clears input/history; disconnect clears the open transcript. Remote output is rendered as text, never HTML. The terminal does not support unattended scripts, persistent credentials or automatic configuration replay.

## Channel access

Add channel is available from Messages → More, the Overview toolbar, + Add channel in the conversations sidebar, and Radio Tools. These actions open the existing hashtag/create-private/join-private form. The radio verifies a free slot and reads back channel writes before treating creation as complete.

## Protocol sources

- https://github.com/meshcore-dev/MeshCore/blob/main/examples/companion_radio/MyMesh.cpp
- https://github.com/meshcore-dev/meshcore-cli

Protocol/UI validation uses synthetic radios unless a release record explicitly identifies physical evidence.
