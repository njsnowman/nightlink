# Documentation refresh — 2026-10-27

Tracking: [#92](https://github.com/njsnowman/nightlink/issues/92).

The root documentation was audited against current source, the public 0.8.22 record and recorded validation. The documentation index now separates operating guides from dated evidence. Historical release records and test results retain their original scope.

Corrected private-repository/unpublished status, Setup and Portable build instructions, navigation paths, field-test message click targets, current installer colors, discovery evidence and retry-policy wording. Updated the changelog's current release disposition without changing historical artifact provenance. Added a bundled Help topic covering the workbench, public ID, mention alerts and message paths; regenerated the Markdown user guide from the bundled topic source.

Validation:

- Offline browser Help acceptance passed: 21 topics, all bundled screenshots, search/no-results, enlarged-image dismissal, About/support/notices, Tools entry and bounded layouts from 760×560 through 1440×950. External requests were blocked and no radio commands were issued.
- Checked 101 local Markdown targets before adding this record: no missing files.
- Help UI JavaScript syntax and Git whitespace checks passed.

These are documentation/interface checks, not physical-radio or installer validation. Published 0.8.22 executable assets, source tag and checksums are unchanged. Updated bundled Help source will appear in a later packaged build. No additional release is published by this documentation change.
