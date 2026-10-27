# Received emoji reactions

Tracking: [#94](https://github.com/njsnowman/nightlink/issues/94).

Nightlink recognizes received MeshCore One reaction text in channel and direct messages. The current channel format is a bracketed sender mention followed by one emoji, a newline and an eight-character Crockford Base32 target hash. The earlier emoji-before-mention format is also accepted. Direct reactions omit the mention.

The target hash uses the original message's exact UTF-8 text plus its original unsigned 32-bit little-endian timestamp, SHA-256, the first five digest bytes and Crockford Base32. Matching is confined to the same stored conversation and, for channels, the exact original sender name. Multiple matching originals remain unresolved. Display names and short content hashes are not authentication.

Matched reactions appear as grouped chips under the original message. Duplicate sender/emoji/target reactions are combined. When the original is absent, ambiguous or outside the current page, a separate reaction notice remains; Reaction details exposes the unchanged wire text. Retained messages are interpreted when displayed, including reactions received before their originals. No existing history is rewritten or deleted, and no radio commands or new reaction sends are added.

Only strict recognized envelopes are reformatted. Ordinary chat, multiple emoji, emoji followed by prose, invalid hashes and unrelated multiline messages remain ordinary text. Other clients' reaction protocols are not covered by this implementation. A renamed local radio can prevent resolving older reactions to its own messages because the original advertised name is not retained on every outgoing record.

## Validation

Parser/hash tests cover the reported Shaun-style envelope, legacy order, Unicode graphemes, exact text/timestamp hashing, conversation/sender isolation, ambiguity, out-of-order records, deduplication and DMs. Browser acceptance uses the actual workspace and detached-DM documents with fictional data, blocked external access and no radio commands. The reported screenshot identifies the format; it is not physical over-the-air validation of this change.

Primary references reviewed 2026-10-27: [MeshCore One interoperability guide](https://github.com/Avi0n/MeshCoreOne/blob/main/docs/Reactions.md) and [reaction parser/hash implementation](https://github.com/Avi0n/MeshCoreOne/blob/main/MC1Services/Sources/MC1Services/Services/ReactionParser.swift). The implementation is receive/display only and keeps original text available for inspection.
