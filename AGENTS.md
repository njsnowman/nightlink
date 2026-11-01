# Nightlink repository instructions

Follow RELEASE_PROCESS.md for every Nightlink release and downloadable candidate. Track changes and validation in GitHub before publication. Link release notes to the issue and changelog, and record the matching source commit and artifact checksum. Do not publish with unresolved release-blocking acceptance criteria. Separate simulated test results from physical-radio evidence.

Use factual, professional language in repository documentation, commits, issues, and release notes. Describe confirmed behavior and limitations without promotional language or unsupported claims.

## Non-negotiable offline-first engineering requirement

**Connected when possible. Independent by design.** Read and follow [docs/OFFLINE_FIRST_ENGINEERING.md](docs/OFFLINE_FIRST_ENGINEERING.md) for every change that affects startup, transport, messaging, persistence, network access, or optional integrations. NightLink must start and support core local MeshCore BLE/USB radio and messaging workflows without internet, cloud authentication, external APIs, CoreScope, MQTT, or the owner's homelab. Online enhancements must remain optional and fail gracefully. Include offline test evidence (and distinguish simulated from hardware tests) in relevant pull requests.

## Required visual standard

The owner approved the rc.11 Radio Tools design and requires every page and menu to follow it, including future work. Read DESIGN_SYSTEM.md before changing interface presentation. Use nightlink-design.css tokens and the approved Radio Tools panel as the reference. Extend shared components rather than introducing a competing style. Preserve readable hierarchy, rounded quiet cards, visible controls, matching line icons, balanced spacing, keyboard focus, semantic status colors and compact layouts. Check main, detached DM and startup-lock documents as applicable.
