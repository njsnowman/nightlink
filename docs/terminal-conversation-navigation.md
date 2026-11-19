# Terminal conversation navigation

Tracks [#146](https://github.com/njsnowman/nightlink/issues/146). The owner requested all enhancements, prioritizing catch-up first.

- Catch-up: a thin New messages boundary, persisted reading anchor/offset per conversation and radio identity, and Jump to latest with an unread count when earlier history is displayed. Incoming renders preserve the anchor; background windows do not mark arrivals read. Scrolling work is frame-batched and position saves are debounced, with immediate capture on blur/exit.
- Reply navigation: composer context and locally created outgoing reply quotes jump to the stored source. Bounded rendering can show the source outside the latest 300 rows. `localReply` metadata stays in local history; radio payloads remain ordinary text/mentions. Other radios do not receive a new thread protocol. Deleted sources show an unavailable message instead of inferring a match.
- Selected-message actions: Reply, Copy and Path appear only for the selected message or keyboard-focused body; dismissal returns focus to the composer. Action keyboard focus survives incoming renders. Text selection retains its existing copy/reply guard.
- Grouping: consecutive messages from the same sender within two minutes share a visible sender heading. Every timestamp and hop/delivery row remains. Day changes, sender changes, unread boundaries, mentions and reply quotes start separate presentation where appropriate.
- Mentions: previous/next buttons appear only when the conversation contains mentions. They wrap through stored matches and reach older bounded-history windows.

The Clear Message palette and the connected CoreScope map panel/iframe are retained. Cards, detached DM and startup-lock presentation remain supported without applying terminal-only grouping/navigation to other documents.

Synthetic browser evidence: catch-up/anchor/count/conversation restore and background-read guards; stable map iframe/request count; initial unread history beyond 300 rows; grouping/timestamps; selected Copy/Path/focus; mention navigation; local reply metadata persistence and text-only send fixture; old-source navigation; narrow layout. Terminal reply, main-interface and windows suites pass. Accessibility audit passes 19 main/DM/lock screens. No physical radio, real sends or installed upgrade tested.
