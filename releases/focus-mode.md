# Focus Mode validation

Tracked by [issue #216](https://github.com/njsnowman/nightlink/issues/216) and the [Unreleased changelog](../CHANGELOG.md#unreleased). Based on 0.8.28 main at `c9fc454`.

## Browser validation

Playwright Chromium served the repository renderer locally.

| Command | Coverage |
| --- | --- |
| `node focus-mode.browser.test.cjs` | Cards and Terminal collapse and restore navigation, reclaim workspace space, persist across refresh, and work at 1320 × 860 and 760 × 560. Keyboard coverage includes Ctrl+B, focus transfer, visible focus, Enter, Space, and protection for the composer. Fixtures verify the active conversation, draft, scroll position, unread count, simulated radio state, and Leaflet resize. |
| `node compact-workspace.browser.test.cjs` | Overview resizing, Compact layouts, and Cards navigation. |
| `node planning-maps.browser.test.cjs` | Planning map source lifecycle and layout in both interfaces. |
| `node startup-first-paint.browser.test.cjs` | Startup rendering and chat handoff in both interfaces. |
| `node header-controls.browser.test.cjs` | Header control layout across widths, text sizes, accents, and simulated connection states. |
| `node terminal-drafts.browser.test.cjs` | Draft continuity across conversations, interface switching, and send outcomes. |
| `node shared-design.browser.test.cjs` | Shared layouts, dialogs, detached direct messages, and the startup lock. |
| `node terminal-audit.browser.test.cjs` | Accessibility audit passed across 146 screens. |

The browser fixtures use synthetic radio data. Physical radio behavior was not tested. The package file and required-assets list include the Focus Mode script and stylesheet. No Windows candidate was built or published.
