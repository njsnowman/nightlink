# Compact CoreScope map in terminal chat

The MRC chat page places the OKI Mesh CoreScope live map in a compact right-hand frame instead of the node listing. The channel/window list remains on the left. The map uses a double blue frame with a cyan ANSI-shaded title. There is no provider chooser, CoreScope navigation, settings panel, packet listing or duplicated node list in chat. Map-provider attribution remains visible.

Desktop map content is approximately 280 x 190px. At widths up to 1100px the panel moves above scrollback with a 140px map height. Fresh compact windows start with it collapsed. Collapsing unloads the iframe; reopening retries a failed load. The existing CoreScope visibility preference and offline state are respected. Leaving terminal Messages unloads the iframe. Routine message renders retain the existing frame and do not reconnect the external feed.

## Map-only adapter

CoreScope's deployed `#/live` route does not use the `embed=1` chrome suppression available on its regular map route. The desktop adapter applies presentation rules only to a direct child iframe at `https://map.okimesh.org/#/live` with the explicit `nightlinkChatMap=1` marker. It exposes no remote IPC or Node capabilities and makes no radio requests. Other CoreScope embeds retain their existing presentation.

The iframe stays hidden and outside keyboard navigation until the map-only document signals readiness. Missing map initialization times out after 120 seconds with an unavailable message. Browser previews without the desktop adapter display an explanatory status rather than the full CoreScope UI. This integration depends on the upstream live-map DOM; changes there require revalidation.

## Validation — 2026-11-03

- Unit suite: 378 passed, 0 failed, 1 skipped (Python art regeneration unavailable).
- Terminal browser checks and 19-screen terminal accessibility audit passed, including Cards, detached DM and startup lock coverage.
- `corescope-chat.browser.test.cjs` passed against a synthetic remote service: map-only content, attribution retained, no map reload during chat renders, provider preference, offline/online transitions, navigation cleanup, collapse/reopen and compact startup/fit.
- Exact-origin/route marker unit regression passed. New tests are included in the standard unit/browser commands, and the adapter is included in package/required-asset manifests.
- An isolated Electron 42.11.12 test with a file host and real OKI Mesh service reported a 300 x 210px map, zero visible menus, packet feeds or extra map controls, and one visible attribution. This verifies external-service presentation; it is not physical-radio evidence or a guarantee of live packet freshness.
- Placement preview combines the real external map with synthetic chat. No production profile or physical radio was used.

The feature is saved in source for owner placement review. It is not included in the previously delivered rc.13 installer; a new candidate needs its own version, package validation and provenance record.
