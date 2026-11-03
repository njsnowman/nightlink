# Nightlink repository instructions

Follow RELEASE_PROCESS.md for every Nightlink release and downloadable candidate. Track changes and validation in GitHub before publication. Link release notes to the issue and changelog, and record the matching source commit and artifact checksum. Do not publish with unresolved release-blocking acceptance criteria. Separate simulated test results from physical-radio evidence.

Use factual, professional language in repository documentation, commits, issues, and release notes. Describe confirmed behavior and limitations without promotional language or unsupported claims.

## Required visual standard

The owner approved the terminal interface (issue #131) as the default standard for every page and menu, including future work. It supersedes the rc.11 card standard as the default; the rc.11 card design remains available as the alternate interface (Settings > Interface: Cards). Read DESIGN_SYSTEM.md before changing interface presentation. In terminal mode use the terminal.css tokens and components: VGA 16-color palette, monospace type, bordered frames with titles on the border, blue title and status bars, bracketed hotkeys, visible keyboard focus, semantic status colors and text contrast of at least 4.5:1. In cards mode use nightlink-design.css tokens and the approved Radio Tools panel as the reference. Extend shared components rather than introducing a competing style. Check main, detached DM and startup-lock documents in both interfaces as applicable.
