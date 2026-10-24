# Windows installer design

Tracked in [#80](https://github.com/njsnowman/nightlink/issues/80), retaining installer lifecycle gate [#63](https://github.com/njsnowman/nightlink/issues/63).

The Switchboard installer uses near-black surfaces, amber stage labels/rules, warm white text, Segoe UI headings and restrained Consolas labels. Welcome, workspace options and completion are custom nsDialogs pages. Directory and file-progress pages retain native NSIS behavior and receive the matching palette; uninstaller artwork and wording are updated. Footer buttons remain native Windows controls for keyboard navigation and accessibility, so their rendering follows Windows rather than the application CSS.

Setup remains per-user without elevation. The desktop shortcut is optional, Start menu registration remains standard, automatic launch is disabled, and application data retention is unchanged. No new radio commands, settings changes or profile migration are introduced.

`installer.nsh` contains the page declarations, theme and shortcut callbacks. `generate-installer-art.py` creates uncompressed RGB24 header/sidebar assets using Pillow (authoring only). The source-derived PNG references in `installer-assets/switchboard-installer-*.png` illustrate custom-page labels and coordinates; they are design references, not screenshots or installation evidence.

Validation: `node --test installer-design.test.cjs` checks artwork formats, custom-page bounds/non-overlap and critical install configuration. Successful NSIS compilation is recorded separately from real installer navigation, DPI/keyboard checks and install/upgrade/uninstall lifecycle acceptance. Those require an isolated Windows validation environment; do not infer a lifecycle pass from a design reference or a compiled executable.
