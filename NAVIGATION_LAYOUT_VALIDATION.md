# Consolidated navigation and fixed-window layout

Tracking: https://github.com/njsnowman/nightlink/issues/30

Four primary items remain: Overview, Messages, Network and Contacts. More contains Direct Messages, Search and Activity. Channels and Recent chats use collapsible groups, showing at most three channel shortcuts and two contacts with recent DM history. The full companion contact directory no longer appears in the sidebar. All channels, companion contacts and unconfigured saved conversations remain available in searchable Browse conversations, with progressive loading. Contacts open their contact card; channel/history items open the conversation. Existing unread counts remain available, including an aggregate DM count on More.

The app shell has no outer horizontal or vertical scrolling. Overview uses four bounded panels; Messages and Network fill the content area. Long messages, contacts, settings and radio-tool content scroll within their panels. This is not a promise to display unlimited content simultaneously without internal scrolling. The composer and Settings action remain within the viewport. Sidebar expansion state is stored locally; narrow-height layouts close other groups when one is expanded.

Validation uses a synthetic directory of 350 contacts and 20 channels, with no radio connection. navigation.browser.test.cjs checks bounded shortcuts, search-to-contact-card access, eight views at 1500x950, 1100x740, 920x740 and 760x600 in standard/compact modes, no document overflow, dashboard bounds, composer access, Settings access and large text. Existing attention/browser tests verify unread counts, anchors, mute, mentions and focused DM reading. Existing smoke test navigation was updated to use Browse conversations and expand Recent chats.

No packaged Windows or physical-radio validation is claimed. No release has been published.

Final results on 2026-10-16: 87 Node tests passed. navigation.browser.test.cjs, attention.browser.test.cjs and smoke.test.cjs passed. Standard and 760x600 screenshots inspected.
