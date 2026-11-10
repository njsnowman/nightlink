# Nightlink repository instructions

Follow RELEASE_PROCESS.md for every Nightlink release and downloadable candidate. Track changes and validation in GitHub before publication. Link release notes to the issue and changelog, and record the matching source commit and artifact checksum. Do not publish with unresolved release-blocking acceptance criteria. Separate simulated test results from physical-radio evidence.

Use factual, professional language in repository documentation, commits, issues, and release notes. Describe confirmed behavior and limitations without promotional language or unsupported claims.

## Required visual standard

The owner approved the rc.11 Radio Tools design and requires every page and menu to follow it, including future work. Read DESIGN_SYSTEM.md before changing interface presentation. Use nightlink-design.css tokens and the approved Radio Tools panel as the reference. Extend shared components rather than introducing a competing style. Preserve readable hierarchy, rounded quiet cards, visible controls, matching line icons, balanced spacing, keyboard focus, semantic status colors and compact layouts. Check main, detached DM and startup-lock documents as applicable.

## AI-assisted development attribution

Nightlink is developed with AI assistance (Grok and Codex).

- Every commit that contains code, tests, documentation, or configuration produced or substantially modified with AI help **must** include the corresponding `Co-authored-by` trailer(s):
  - `Co-authored-by: Grok <grok@x.ai>`
  - `Co-authored-by: Codex <noreply@openai.com>`
- The human author remains the primary Author of the commit.
- Prefer one logical change per commit so attribution stays accurate.
- Do not strip or rewrite these trailers during rebase or squash merges when the work was AI-assisted.
