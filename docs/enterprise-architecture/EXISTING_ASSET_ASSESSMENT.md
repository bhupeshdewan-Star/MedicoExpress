# Existing Asset Assessment: Product Appraisal Thin Slice

**Document status:** Superseded by source-led activity assessment  
**Assessment date:** 2026-06-06  
**Purpose:** Historical assessment of repository implementation assets. It does not assess or supersede the owner's external SOP and skill source files.

## Correction Notice

This assessment was prepared before the owner supplied the detailed Product Appraisal SOP and skill specification. It was therefore incomplete as an activity-package assessment.

The supplied files are now the primary professional source material:

- `Expanded Auro _SOP_Product_Appraisal.docx`
- `pharma_product_appraisal_skill_template.md`

## Alignment Note

The repository now also contains the owner-supplied meta-prompt for product monograph and appraisal work. It should be treated as a live refinement layer for the skill/SOP package, not as a replacement for the approved source documents. There is no separate repository-managed "SOP Builder" skill file in the current tree; that capability is still represented conceptually through the source package, control repository, and orchestration scripts.

Current source status and next actions are maintained in `SOURCE_ACTIVITY_PACKAGE_REGISTER.md`.

## Classification Vocabulary

- **Reuse:** Suitable with minimal change after validation.
- **Adapt:** Useful concept or implementation requiring material change.
- **Replace:** Conflicts with the new architecture or control requirements.
- **Retire:** Redundant, misleading, or unsafe to retain.

## Assessment

| Existing asset | Classification | Reason |
|---|---|---|
| `db/repository/skills/pharmaceutical_product_appraisal.json` | Adapt | Useful output concepts and source discipline; needs capability separation, stronger evidence rules, and removal of ambiguous "commercial" conclusions |
| `db/repository/sops/sop_product_appraisal.json` | Replace | Too brief for controlled execution and lacks intake, evidence, roles, skills, validation, exceptions, maintenance, and release controls |
| `apps/api-core/services/activity_orchestrator.js` | Adapt | Useful activity profile and drafting fallback; currently combines orchestration, prompts, embedded molecule knowledge, and document generation |
| `apps/api-core/services/skill_engine.js` | Adapt | Contains useful gating concepts; mixes human skill, AI skill, prompt, SOP, template, and runtime concerns |
| `apps/api-core/services/sop_engine.js` | Replace for enterprise kernel | Markdown parsing and local in-memory runs are insufficient for version-pinned, distributed, auditable workflow execution |
| `apps/api-core/services/approval_workflow_engine.js` | Replace for enterprise kernel | Generic asset lifecycle is useful conceptually, but approvals are role-based, domain fallback is unsafe, and state model is not activity-specific |
| Existing Product Appraisal database tables | Replace through migration | Useful section concept, but approved content can be overwritten and relationships, evidence, decisions, releases, and immutable versions are absent |
| Existing Product Appraisal APIs | Replace behind new contracts | Useful behavioral reference; endpoints allow direct operations without complete SOP, skill, evidence, workflow, and approval gates |
| Existing product, indication, trial, competitor, and publication data concepts | Adapt | Useful candidate domain data; require UOR registration, provenance, versioning, and relationship rules |
| Existing audit, e-signature, traceability, and repository services | Assess in Day 5 | Potentially reusable, but require independent contract and validation assessment |
| Existing UI Product Appraisal workspace | Defer | Useful workflow-discovery reference; enterprise UI will follow architecture and contracts |

## Key Findings

1. Product Appraisal is inconsistently classified across Medical Affairs, Commercial, and Commercial Excellence.
2. SOP identifiers conflict across `SOP-MA-001`, `SOP-MA-101`, `SOP-MKT-042`, and `SOP-COMM-001`.
3. Existing approval logic checks roles but does not prove current competency or reviewer independence.
4. Existing sections are updated in place, which is incompatible with immutable approved releases.
5. Evidence provenance, claim-level support, event journeys, and structured decision records are incomplete.
6. Existing agent and skill concepts are useful but conflate human competencies with AI capabilities.

## Decision

The new proof will use:

- `medical_affairs` as the default owning domain;
- `SOP-MA-PA-001` as the proposed canonical SOP code;
- `WF-MA-PA-001` as the workflow definition;
- `TMPL-MA-PA-001` as the controlled template;
- separate human skill definitions and AI capability definitions;
- immutable structured and rendered release versions.

Existing identifiers remain historical references and require an explicit mapping plan before migration.
