# Nightlink release process

This process applies to Nightlink releases and downloadable release candidates.

1. Open or update a GitHub tracking issue before release preparation. Record the reported problem, affected version, intended behavior, and acceptance criteria.
2. Add an Unreleased changelog entry linked to the issue. Use factual descriptions of final behavior; distinguish confirmed causes from hypotheses.
3. Run relevant automated tests and browser integration checks. Record the commands, outcomes, and limitations in a release record under releases/.
4. Build and check the packaged Windows executable. Record the source commit, artifact name, SHA-256, and package version. Any source change after validation requires appropriate revalidation and a new matching build.
5. Record physical-radio validation separately from simulations. Keep unresolved release-blocking connection defects visible and open. Do not claim a hardware fix from simulated evidence alone.
6. Review the release record before publishing a tag or GitHub release. Do not publish a release with unresolved blocking acceptance criteria. Local diagnostic candidates must be marked as candidates and linked to the open issue.
7. Publish approved release scope and artifacts, verify the uploaded checksum, and link the release from its tracking issue. Archive the release record with the final tag and artifact URLs.

Documentation, commit messages, issues, and release notes should use concise technical language. State the problem, resulting behavior, evidence, and known limitations. Omit promotional claims and unsupported assertions.
