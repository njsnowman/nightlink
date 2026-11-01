# NightLink Offline-First Engineering Policy

> **Connected when possible. Independent by design.**

## Non-negotiable product contract

NightLink is a portable desktop client for a locally connected MeshCore companion radio. Its core operations **MUST** work in an internet-disconnected environment. Internet connectivity may add capabilities, but it **MUST NOT** be required for launching NightLink, connecting to a compatible local radio, or using essential messaging functionality.

Supported radio connection methods (such as Bluetooth LE and USB serial) are local device interfaces, not cloud dependencies. Functionality can still require a powered, compatible, reachable radio and RF mesh peers for over-the-air delivery; "offline" does not mean messages can be delivered without a radio or RF path.

## Required offline functionality

- Start, render, navigate, and shut down without internet access or cloud authentication.
- Discover and connect to supported local MeshCore radios via BLE or USB serial without consulting a remote server.
- Compose, send, receive, and display channel and direct messages through the locally connected radio, subject to radio and RF conditions.
- Maintain local message history, contacts, channel configuration, favorites, and user preferences without external services.
- Perform supported local radio configuration, diagnostics, and telemetry collection without cloud availability.
- Keep the UI responsive if DNS, cloud hosts, hosted maps, MQTT, CoreScope, or update endpoints cannot be reached.
- Preserve unsent or pending messages and user state in accordance with existing delivery semantics; never report an acknowledgement or delivery that the radio/mesh has not confirmed.

## Optional online enhancements

Internet-backed maps, CoreScope, MQTT, software updates, remote lookups, diagnostics uploads, and future integrations **MAY** be offered as opt-in or optional enhancements. Such features **MUST**:
1. Clearly indicate when they are unavailable.
2. Fail with bounded timeouts and no infinite retry loops.
3. Never block startup, local radio connections, messaging, or access to locally stored data.
4. Avoid silently routing private radio messages or contact data to an online service.
5. Respect user preferences and degrade gracefully when connectivity drops mid-session.
6. Resume when connectivity returns without requiring a restart, where technically feasible.

There must be no mandatory cloud login, license handshake, remote configuration fetch, online telemetry gate, or external API availability check on the critical startup / radio / messaging path.

## Architecture and code review requirements

- Treat network I/O as a **separate optional boundary** from local radio transport, state management, message persistence, and the UI.
- Do not introduce third-party service dependencies for an essential operation unless an equivalent fully local path remains functional.
- Provide local defaults and bundled assets needed to launch and operate core UI; external fonts, scripts, styles, maps, or CDN assets must not be necessary for the core experience.
- Use explicit timeouts and cancellation for optional online requests. A network failure must not crash the application, corrupt local state, or prevent offline operation.
- Preserve established safety, security, validation, and radio delivery semantics when adding fallback behavior.
- If a proposed feature fundamentally needs the internet, mark it as **online-only/optional** and keep it isolated from core workflows.

## Required acceptance tests for relevant changes

Run or document these checks for any change touching startup, transport, messaging, local persistence, integrations, or networking:

1. **Air-gapped startup:** With internet/network access disabled, start NightLink; verify UI, navigation, local data, and preferences load.
2. **Local radio:** With internet disabled and a compatible BLE or USB radio attached, connect, read radio state, and exercise local radio tools as supported.
3. **Messaging:** With internet disabled and a suitable mesh peer/test setup, send and receive a channel message and a DM; verify status/ACK behavior honestly reflects radio evidence.
4. **Offline restart:** Restart while still offline; verify locally persisted history, contacts, and settings.
5. **Online service unavailable:** Simulate unreachable CoreScope, MQTT, maps, DNS, and update services; verify no essential workflow blocks or hangs.
6. **Connectivity transition:** Disable internet during an active session and restore it later; verify local messaging keeps working throughout.
7. **Failure safety:** Check errors, timeouts, queue state, and absence of silent data uploads or false delivery claims.

Automated mocks are useful but **must not** be reported as proof of physical-radio RF behavior. Record what was simulated versus tested on real hardware. If hardware is unavailable, state the remaining manual verification requirement clearly.

## Pull request checklist

- [ ] Core behavior remains usable without internet.
- [ ] All new online calls are optional, bounded, and non-blocking.
- [ ] Local message, contact, and preference data remain available offline.
- [ ] No new mandatory cloud, homelab, CoreScope, or MQTT dependency.
- [ ] Offline and connectivity-transition tests are covered or explicitly marked unverified.
- [ ] User-facing errors distinguish internet service failure from radio or RF delivery failure.

This policy applies to both human and AI-assisted contributions, including work prepared with Claude or Codex. If an implementation conflicts with this policy, revise the implementation rather than weakening offline functionality.
