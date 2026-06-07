# Controlled SOP and Skill Source Repository

**Document status:** Proposed for owner review  
**Version:** 0.1  
**Purpose:** Govern owner-supplied SOP and skill files from ingestion through agent consultation.

## 1. Repository Objects

| Object | Purpose |
|---|---|
| Source Package | Groups SOP, skill, templates, and related sources for one activity |
| Source Original | Immutable byte-for-byte owner-supplied file |
| Source Rendition | Searchable text extracted reproducibly from an original |
| Controlled Asset | Stable SOP or skill identity across revisions |
| Controlled Asset Version | Immutable governed revision with lifecycle and effective dates |
| Index Release | Reproducible searchable chunks from an approved rendition |
| Consultation Receipt | Evidence of exactly which assets an execution consulted |

## 2. Current Repository Layout

```text
controlled-repository/
  originals/                 immutable owner-supplied copies
  extracted/                 searchable text renditions
  manifests/                 source metadata and SHA-256 hashes
  consultation-receipts/     pre-planning resolution evidence
  approved-packages/         future approved effective activity packages
```

## 3. Integrity and Source Rules

- Originals are copied byte-for-byte and never overwritten.
- Every original and extracted rendition has a SHA-256 integrity hash.
- An identical filename with changed bytes creates a new version candidate.
- Extracted content never replaces the original.
- Owner-supplied sources take precedence over generated drafts.
- Stored owner sources are not automatically approved or effective.
- Effective production execution requires explicit human approval and effective status.

## 4. Lifecycle

```text
RECEIVED
-> QUARANTINED
-> EXTRACTED
-> METADATA_REVIEW
-> DRAFT
-> IN_REVIEW
-> APPROVED
-> EFFECTIVE
-> SUPERSEDED | RETIRED
```

## 5. Agent Retrieval Rules

Production retrieval must:

- resolve exact activity, tenant, jurisdiction, and intended use;
- retrieve only approved effective versions;
- verify original and rendition hashes;
- apply role, purpose, domain, classification, and agent-capability filters;
- return asset version, locator, and hashes with every chunk;
- exclude drafts, future-effective, superseded, retired, or invalid assets;
- fail closed when a mandatory effective SOP or skill cannot resolve.

Draft planning may consult owner-supplied source packages when clearly marked as non-effective and non-production.

## 6. Consultation Evidence

Every planning and execution run stores:

- execution ID;
- activity ID;
- exact SOP and skill asset IDs;
- versions, status, and hashes;
- consulted time;
- sources retrieved, sources supplied to agents, and sources cited;
- package-resolution result;
- plan-created-after-consultation confirmation.

## 7. Current Implementation

- `scripts/ingest_owner_activity_sources.py` ingests the six supplied sources.
- `controlled-repository/manifests/owner-supplied-activity-sources.json` records metadata and hashes.
- `scripts/resolve_activity_package.py` verifies package presence and integrity and creates consultation receipts.
- The owner-supplied meta-prompt for product monograph and appraisal has now been ingested into the controlled repository and is available as a cross-activity learning reference.

Current resolution tests:

- Product Appraisal: ready for draft planning; SOP and skill present.
- Product Monograph: ready for draft planning; SOP and skill present.
- CME Slides: draft skill proposal created; awaiting owner review and approval.
- Product Training Slides: blocked; SOP missing.
- Meta-prompt alignment: available for planning refinement, but not yet promoted to an effective standalone operating asset.

## 8. Acceptance Tests

1. Original-file tampering produces an integrity failure.
2. Missing SOP or skill blocks planning.
3. Supplied source status does not silently become effective status.
4. Every draft plan has a consultation receipt.
5. Every receipt identifies exact asset hashes.
6. A superseded package remains reconstructable for historical executions.
7. AI agents cannot approve, supersede, retire, or make a package effective.
