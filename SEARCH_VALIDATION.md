# Saved-message search validation

> Evidence record: dated results below retain their original scope. For current downloads, release status and remaining limitations, use the [documentation index](DOCUMENTATION.md) and [0.8.22 release record](releases/0.8.22.md).


Tracking: https://github.com/njsnowman/nightlink/issues/8
Status: implemented in source and local preview; no release published for this change.

## Scope

Search retained channel and DM message text offline with combined contact, channel, inclusive local-date and mentions-of-me filters. Results are ordered newest first and rendered 50 at a time. Selecting a result opens the full conversation at the matching message with a visible highlight. Search is available from navigation, the header and Ctrl+K.

## Validation — 2026-10-15

- Full Node suite: 59 passed, including five search matching/filter/date tests.
- Existing simulated GATT and unread/notification browser integrations: passed.
- Search browser integration: passed literal matching/highlighting, safe message text rendering, pagination, combined filters, invalid-date feedback, channel/DM result navigation, reading-position retention, offline history, keyboard access and 920/760 px layouts without horizontal overflow.
- Windows package built successfully; search screen, input and filters initialized without renderer errors.

## Limits

Search covers the current companion radio history retained on this computer (up to the existing 3,000-message history limit). It does not request messages from the radio or recover missing history. Contact matching uses stored direct identity or the existing channel-sender association; channel names alone do not establish a verified radio identity. Tests use synthetic messages and simulated GATT; no additional physical-radio evidence is claimed.
