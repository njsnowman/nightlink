# Direct-message retry research

Nightlink 0.8.0 implements automatic direct-message RF retries with ACK tracking, cancellation, and delivery details. Defaults are four direct attempts and one flood fallback, or two flood attempts without a known path. Settings can change these limits.

Sources reviewed October 14, 2026:
- MeshCore FAQ: https://github.com/meshcore-dev/MeshCore/blob/main/docs/faq.md (section 5.3 describes saved-route retries followed by a final flood fallback; official mobile source is not public).
- Companion firmware: https://github.com/meshcore-dev/MeshCore/blob/main/examples/companion_radio/MyMesh.cpp
- Maintained Python client: https://github.com/meshcore-dev/meshcore_py/blob/main/src/meshcore/commands/messaging.py
- mc-webui: https://github.com/MarekWo/mc-webui/blob/main/docs/dm-retry-logic.md

## Radio commands

SEND_TXT_MSG is command 2: text type, one-byte attempt number, original timestamp (little endian), 6-byte public-key prefix, and UTF-8 text. Reuse timestamp/text/destination for a logical message; increment attempt for RF retries. SENT (6) returns actual direct/flood mode, expected ACK tag, and estimated timeout in milliseconds. Reset path uses command 13 followed by the full 32-byte recipient key; wait for OK before resending. This modifies the contact route on the radio. A learned replacement path should be retained rather than overwritten by the stale route.

## Implemented Nightlink policy

Use clear attempt numbers rather than countdown fractions: Direct attempt 1/4 through 4/4, then one flood fallback. These are configurable Nightlink defaults, not a claim about every official app version. With no known route, use a separate capped flood budget (two total attempts by default). Use max(radio timeout * 1.2, configured minimum wait); no rapid fire retries. Keep a single history bubble, preserve original timestamp, listen for ACKs before sending, accept late ACKs for any earlier attempt, stop immediately on ACK, cancel or radio disconnect/identity change. Never replay pending sends automatically after restart/reconnect. Serialize route reset and resend against other radio mutations. Refresh contact after route changes.

mc-webui defaults to an initial send plus three direct retries and one flood fallback, with separate no-path flood settings. The Python client defaults to max_attempts=3, flood_after=2 and max_flood_attempts=2; the total attempt cap also applies, so this is not five attempts. These policies vary by client.

Channel messages already use flood and have no recipient delivery ACK. Keep channel status Accepted by radio; do not infer failure from missing repeats or apply DM route-reset logic. Optional repeat detection would be RF observation, not proof of recipient delivery.

## Regression and physical verification

Test first-attempt success, retries with one unchanged timestamp and increasing attempt bytes, ACK before SENT registration, late ACK from earlier attempt, no ACK exhaustion, flood reset failure, route update, cancellation, disconnect and identity change. Verify all send entry points (main composer and native/floating DM windows) use the same delivery controller. Physical two-radio verification is pending because no second peer is currently available.


## Delivery feedback in 0.8.24

An animated awaiting-ACK badge indicates active waiting, not delivery progress. The send-completion sound is once per outgoing message: recipient ACK for DMs, radio acceptance for channels. Failed/unconfirmed attempts do not play it. Sound preferences and quiet hours apply; reduced motion suppresses rotation. These UI changes do not increase retry counts or imply remote reception.
