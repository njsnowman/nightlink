# Mesh Operations Planner

Tracks [#153](https://github.com/njsnowman/nightlink/issues/153). Primary app, based on rc.22. Queen City Con is unchanged.

Open **Mesh Planner [E]** from the terminal main menu or **Operations** in Cards navigation. The operation library supports search, lifecycle filters, blank/field-deployment/organized-net templates, complete-plan backups and validated imports. Templates seed editable preparation tasks and equipment requirements, without inventing operators or radio data.

RF Planning adds a map-centered engineering workbench; see [RF methods, terrain input and compatibility](rf-planning.md).

## Workspace

- Overview: scheduled period and time zone, planning completeness checks, manual check-in count, task and equipment progress, next actions, planned timeline and recent local changes.
- Team: manual operators or copied Contact Book/radio snapshots, call sign, full mesh key, role, site/channel assignments, notes and explicit manual assignment/check-in/check-out status.
- Communications: manual planned channels or copies of cached radio channels, purpose, fallback instructions and notes. Snapshots contain radio key, slot and channel ID, not encryption keys. Open matching chat requires the same currently loaded radio/channel identity and never sends a message.
- Sites & Map: bases, repeater candidates, staging areas and checkpoints, optional coordinates, proposed/deployed/retired state, access/power notes and source timestamp. Known locations can be copied from radio contacts or Contact Book. Manual coordinate edits change the source to manual. An expandable coordinate plot works without network access; the street map reuses the shared online/offline-pack layer. Deployment state is manual and does not verify RF coverage. No links or coverage predictions are inferred.
- Tasks & Kit: named owners, site assignments, deadlines, critical tasks, open/critical/overdue filters, explicit completion/reopening, required quantities and packed quantities.
- Journal: timestamped local notes, recorded phase changes, manual check-ins and plan edits, newest first. Up to 1,000 entries are retained. This is an editable local planning record, not a tamper-proof log or live presence detector.
- Briefing: saved outcomes, issues/lessons and next actions; self-contained HTML briefing with print styles; operation maintenance. The report exports saved records, so save after-action notes before downloading.

## Lifecycle and integrity

Phases are Draft, Reviewed, Active, Completed and Archived. Reviewed records a manual review, not confirmed network readiness or safety. Phase changes are explicit and journaled. Archived plans are hidden by the default Current filter and can be reopened and returned to another phase; archival does not lock editing.

Planning checks measure recorded schedule, operator roles, documented communications/fallbacks, sites, critical-task completion and packed equipment. They do not imply verified radio operation. Check-ins are manual and never inferred from an advertised name or a message. Planning and rendering issue no radio commands. No operation automatically starts, changes radio configuration, contacts an operator or transmits.

Copies retain planning snapshots after the original radio or Contact Book contact disappears. Source changes do not silently rewrite a plan. A roster operator copied from Contact Book uses the first saved mesh identity; the key can be edited in the operator form. Private address-book photos, addresses and personal notes are not copied into operation rosters.

Duplication creates new operation/child IDs and remaps assignments, while resetting schedule/deadlines, check-ins, task completion, packed counts, deployed site state, journal and after-action notes. Coordinates and planning instructions are retained. Removing an operator/site/channel clears dependent assignments in the same transaction; unrelated plan data remains.

Operation records use optimistic revisions. A stale editor cannot overwrite a newer save; its entered text remains visible with an error. Storage failures retain the editor and are not reported as successful saves. A cross-window update banner offers a reload without replacing an open form. Unsaved journal/report drafts survive navigation within the current window, but only saved records are guaranteed after restart and included in exports.

## Schedule, storage and backup

Schedules are stored as instants with an IANA time zone. Date/time form fields are interpreted in the entered zone, and report times use the plan's zone. End requires a start and cannot precede it. Nonexistent and ambiguous daylight-saving wall times are rejected; UTC can be used to disambiguate. Task deadlines use the operation's zone and may precede the operation for preparation work.

Planner storage is independent IndexedDB, `nightlink-operations`. Maximum 100 operations and 40 MB total; per operation: 200 operators, 64 channels, 100 sites, 500 tasks, 300 equipment lines and 1,000 journal entries. All record IDs and references are validated. Text and coordinate ranges and quantities are bounded.

Export plan or Back up all plans produces a separate JSON backup. Workspace and Contact Book backups do not include this database. Import previews new/existing counts, validates the entire file before an atomic merge, and skips existing operation IDs without overwriting them. Import does not duplicate executions or change radio data. Maximum backup file size 50 MB. Backup/briefing files contain unencrypted planning information and notes. Delete operation is a separate confirmed action; it does not delete contacts, radio data or other plans.

## Validation

Unit coverage includes templates, planning checks, reference cleanup, duplicate/reset semantics, IANA conversions and DST gaps/folds (including a half-hour fold), schema/range checks, backup normalization and journal retention. Browser coverage exercises the complete creation-to-briefing workflow, copied contacts/channels/locations, manual check-ins, task/kit completion, source deletion/reload, stale editor rejection, failed storage, archive/reopen, JSON backup merge/delete/restore, report escaping and compact/enlarged terminal/Cards layouts. Radio APIs are blocked in fixtures. Native packaged frontend evidence and artifact provenance are recorded in the candidate release record; no physical-radio evidence is claimed.
