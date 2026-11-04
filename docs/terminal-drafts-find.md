# Terminal draft protection and current-chat find

Tracks [#148](https://github.com/njsnowman/nightlink/issues/148). Draft protection was implemented first, then scoped search.

## Drafts

Terminal Chat reuses the existing NightlinkDrafts store shared with Cards and direct-message snapshots. Draft text is scoped by companion identity and conversation, saved on edit and before leaving, and restored after conversation/radio changes or restart. Switching interfaces keeps the shared draft consistent. No draft is automatically sent.

An accepted send clears only the submitted text. Edits made while a send is pending, and drafts in another selected conversation/radio, are preserved. Failed or unaccepted sends retain the draft. Storage failures keep text in memory and show the existing draft-storage warning. Reply text/mentions are stored as text; transient composer reply navigation context is not reconstructed after restart.

## Current-chat search

Use Ctrl+F (or Find in the topic row). A single optional row searches visible message text in the selected conversation's stored history, including messages outside the latest 300 rendered rows. Matching is literal and case-insensitive, including ANSI-formatted text. Enter/Shift+Enter or the arrows navigate matches; the current match is outlined and other visible matching messages are underlined. Escape closes search and returns focus. The query does not send text or modify the draft. Conversation/radio changes close the scoped search. Global Ctrl+K history search remains available.

The live map panel/iframe stays connected. Search input, caret and count survive incoming renders. The existing Clear Message colors, catch-up, reply/grouping/navigation and installer design are retained.

## Validation

Synthetic browser checks cover reload, channel/DM/radio isolation, Cards synchronization, actual shared send-wrapper acceptance with simulated radio transport, failed sends, in-flight edits, conversation changes and storage errors. Search checks cover keyboard, empty/no matches, literal/Unicode/ANSI text, older bounded history, next/previous, incoming focus/count, Escape, draft retention, compact layout and map iframe/request stability. No live radio, real sends or installed upgrade is implied.
