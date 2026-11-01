# Local Codex bridge

Issue: [#128](https://github.com/njsnowman/nightlink/issues/128)

Nightlink exposes a local read-only MCP server through the `nightlink-live` plugin. The app writes `codex-bridge/state.json` below its normal user-data directory. The MCP server reads this file when Codex calls it; it does not open a network port or issue radio commands.

## Available tools

- `nightlink_status`: latest RF monitor state, connected/RX-log flags, baseline hours, packet rate, alert count, the latest 50 sanitized receive observations (time, source category, route category, hops, signal values and flag count), and freshness.
- `nightlink_events`: bounded generic status, alert, clear, and app lifecycle events, paged with a numeric cursor.

The bridge deliberately excludes message contents, contact names and keys, station identifiers, packet payloads, public keys, exact location, radio configuration, and secrets. Observation entries contain only allowlisted aggregate radio metadata, without sender or station identifiers. It does not enable receive logging. A status is stale after two minutes without an app update; stale or missing data is reported explicitly. Event retention is capped at 500 entries.

## Enable in Codex

1. Open this trusted local repository in Codex and restart/refresh the desktop app.
2. Open the Plugins Directory, select **Nightlink local tools**, and install **Nightlink Live**.
3. Open a new local Codex task in this repository. The repo `.codex/config.toml` enables the plugin for this project.
4. Keep Nightlink running and connected if fresh radio-monitor status is needed. Historical app events remain available after shutdown; status will be marked stale.

Codex’s local marketplace plugin install is a one-time user action. A running Nightlink instance writes updates, while Codex reads them when a turn invokes the tools. The four-hour Nightlink improvement automation is a separate scheduled process; it is not a continuous agent process and does not train model weights.

## Validation

Run `node --test codex-bridge.test.cjs` and `node plugins/nightlink-live/server.cjs` with MCP JSON-RPC requests over stdin. The Windows package includes `codex-bridge-desktop.cjs`; the plugin MCP process is launched by Codex from its installed local plugin copy.
