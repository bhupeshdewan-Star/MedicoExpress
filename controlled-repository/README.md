# ClinCommand OS Controlled Activity Source Repository

This repository stores owner-supplied and approved source materials that govern ClinCommand OS activities.

## Structure

- `originals/`: immutable copies of owner-supplied source files.
- `extracted/`: searchable text derived from originals.
- `manifests/`: metadata, integrity hashes, approval state, and source lineage.
- `approved-packages/`: future approved executable activity packages.

## Mandatory Execution Rule

Before an agent plans or executes an activity, it must:

1. resolve the activity;
2. identify its approved effective SOP and skill package;
3. verify integrity hashes and effective status;
4. consult the resolved sources;
5. record a consultation receipt;
6. block execution when mandatory packages are missing, unapproved, superseded, expired, or unreadable.

Owner-supplied source materials are not automatically effective merely because they are stored here. Approval and effective-status decisions remain explicit.

Use `scripts/resolve_activity_package.py` to verify package presence and integrity and create a consultation receipt before draft planning.
