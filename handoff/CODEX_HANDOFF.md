# Handoff - October 31, 2026

State of Nightlink work at the end of the Claude Code session, for continuation in another tool. Follow AGENTS.md and RELEASE_PROCESS.md.

## Published

- v0.8.26 is the public release (tag on main 93f5277). Record: releases/0.8.26.md.

## Open pull requests

- #120 (draft, branch claude/brave-allen-2y6ox8): 0.8.27-rc.3 with the passive RF Propagation Monitor, its review fixes, USB error messages (#116), 0xFF route-label consistency, map refresh on identity-updated, portable tests (55 browser suites in CI), CI actions v7. CI green. Candidate build: CI run 41244711712, Setup SHA-256 f1a3635d535bc9302047ac345375df5088c4c3ca3e81b0b22436529ad873e14b, Portable ed151d81be2c55635e8c1fd7bf1023afac5d738e5d6fb9ae0c7082cc8d885169 (artifact expires 2026-11-14). Record: releases/propagation-monitor-validation.md. Keep draft until physical acceptance.
- #121 (owner's README SVG banner): awaiting owner review/merge.

## Owner physical test pending (rc.3)

Plan: releases/0.8.27-propagation-acceptance-plan.md. Also check the V4 over USB shows "USB radio did not respond and sent no data..." (#116). Record results in a hardware acceptance record, separate from simulated results.

## Staged rc.4 work (not on any branch)

handoff/rc4-staging.mbox holds 6 commits made on top of dcd5105, held back so the rc.3 build stays valid:

1. In-app Help topic "RF Propagation Monitor" (22 topics) and help-assets/propagation.png, packaged.
2. Radio Health "Radio counters" (packets sent/received, raw airtime/uptime) and radio-counters.browser.test.cjs in test:browser; acceptance-plan passive step uses Packets sent.
3. Update download checks: SHA256SUMS.txt fetched from the same release and compared with the GitHub asset digest; expected SHA-256 shown with copy/PowerShell command; mismatch warns and opens the release page. Live redirect host confirmed: release-assets.githubusercontent.com.

Apply after rc.3 testing:

```bash
git checkout claude/brave-allen-2y6ox8 && git am handoff/rc4-staging.mbox
```

Then set version 0.8.27-rc.4, run `npm test` and `npm run test:browser`, push, record the CI build checksums. Locally all passed: 339 unit tests, 56 browser suites.

## Owner decisions pending

- #87: offer a confirmed "reset unreadable lock settings" path or not (no plaintext fallback either way).
- Delete stale draft release "0.8.22-rc.35 - validation hold".

## Open issues

#63 (uninstall, signing), #65 (depends on #87), #82 (physical discovery test), #86 (superseded rc.35), #87, #88, #94, #96, #109, #116. 36 others were closed on 2026-10-31 with evidence comments.

## Known limits

- Propagation Monitor: simulated only; unconfirmed firmware assumptions (advert key offset, zero-hop flood semantics, 0xFF on messages); thresholds untested.
- Executables unsigned.
