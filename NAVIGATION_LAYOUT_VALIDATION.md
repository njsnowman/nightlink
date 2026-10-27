# Consolidated navigation and fixed-window layout

## Current navigation candidate — issue #55

Five primary destinations: Overview, Messages, Network, Contacts and Radio. Channels and Direct messages are contextual views under Messages. Search remains in the top bar with Ctrl+K. Tools contains Activity and Diagnostics. Sidebar conversations are bounded, optional and collapsed on first use; recent contacts do not repeat the directory. The Messages unread counter includes channels and direct messages. Incoming message rendering preserves the channel selector and manually expanded Tools menu.

Navigation browser tests use 350 synthetic contacts and 20 channels, plus focused synthetic DM/unread/channel-update scenarios. Compact and enlarged-text checks are isolated from production profiles. Packaged results and artifact identity are recorded in releases/0.8.22-rc.2.md. No physical-radio changes or validation are claimed for this UI scope.

## Historical layout validation


Tracking: https://github.com/njsnowman/nightlink/issues/30

Four primary items remain: Overview, Messages, Network and Contacts. More contains Direct Messages, Search and Activity. Channels and Recent chats use collapsible groups, showing at most three channel shortcuts and two contacts with recent DM history. The full companion contact directory no longer appears in the sidebar. All channels, companion contacts and unconfigured saved conversations remain available in searchable Browse conversations, with progressive loading. Contacts open their contact card; channel/history items open the conversation. Existing unread counts remain available, including an aggregate DM count on More.

The app shell has no outer horizontal or vertical scrolling. Overview uses four bounded panels; Messages and Network fill the content area. Long messages, contacts, settings and radio-tool content scroll within their panels. This is not a promise to display unlimited content simultaneously without internal scrolling. The composer and Settings action remain within the viewport. Sidebar expansion state is stored locally; narrow-height layouts close other groups when one is expanded.

Validation uses a synthetic directory of 350 contacts and 20 channels, with no radio connection. navigation.browser.test.cjs checks bounded shortcuts, search-to-contact-card access, eight views at 1500x950, 1100x740, 920x740 and 760x600 in standard/compact modes, no document overflow, dashboard bounds, composer access, Settings access and large text. Existing attention/browser tests verify unread counts, anchors, mute, mentions and focused DM reading. Existing smoke test navigation was updated to use Browse conversations and expand Recent chats.

No packaged Windows or physical-radio validation is claimed. No release has been published.

Final results on 2026-10-16: 87 Node tests passed. navigation.browser.test.cjs, attention.browser.test.cjs and smoke.test.cjs passed. Standard and 760x600 screenshots inspected.
