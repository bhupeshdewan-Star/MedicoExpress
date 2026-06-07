# Live Delivery Board

**Document status:** Active  
**Last updated:** 2026-06-06

This is the operational source of truth for the enterprise rebuild. Update it daily.

## Current Objective

Establish the enterprise architecture baseline and prove one end-to-end SOP- and skill-governed Product Appraisal workflow by 2026-06-12.

## In Progress

| Item | Owner | Due | Evidence of completion |
|---|---|---|---|
| Define Universal Object Registry contract | Architecture team | Day 3 | Accepted `UNIVERSAL_OBJECT_REGISTRY.md` |
| Convert Product Appraisal specification into executable kernel contracts | Architecture and engineering | Day 3 | Schemas, module boundaries, and executable acceptance tests |
| Reframe kernel around per-activity governance packages | Architecture team | Day 3 | Accepted Activity Governance Package standard and source register |
| Complete Batch 1 source-led activity package assessments | Product and architecture | Day 3 | Review-ready Product Appraisal, Product Monograph, CME Slide, and Product Training Slide packages |
| Qualify Product Appraisal using two real Word outputs | Product, medical reviewer, and architecture | Day 3 | Trelagliptin and Empagliflozin appraisals plus qualification report |

## Next

| Item | Target |
|---|---|
| Complete event catalogue and canonical event envelope | Day 3 |
| Define AI governance and agent execution envelope | Day 4 |
| Define security, validation, and audit baseline | Day 4 |
| Assess existing kernel-relevant assets | Day 5 |
| Implement or scaffold thin slice | Day 6 |
| Conduct architecture review and plan next cycle | Day 7 |

## Completed

| Item | Completed |
|---|---|
| Establish living architecture memory | 2026-06-06 |
| Accept project constitution | 2026-06-06 |
| Accept one-week architecture-first delivery plan | 2026-06-06 |
| Record initial architecture decisions | 2026-06-06 |
| Define initial enterprise domain and bounded contexts | 2026-06-06 |
| Define Product Appraisal ownership, lifecycle, SOP, controls, and traceability | 2026-06-06 |
| Assess existing Product Appraisal assets | 2026-06-06 |
| Review owner-supplied Product Appraisal, Product Monograph, CME Slide, and Product Training Slide sources | 2026-06-06 |
| Correct Product Appraisal positioning as one Medico-Marketing activity | 2026-06-06 |
| Establish source-first Activity Governance Package approach | 2026-06-06 |
| Generate two real Product Appraisal Word outputs | 2026-06-06 |
| Run Product Appraisal automated content and structural validation | 2026-06-06 |
| Ingest supplied SOP and skill originals into controlled repository with hashes | 2026-06-06 |
| Establish multi-agent orchestration and pre-planning repository consultation rules | 2026-06-06 |
| Conduct first parallel specialist-agent architecture review | 2026-06-06 |
| Verify Product Appraisal and Product Monograph source packages; confirm missing CME skill and Training Slides SOP gates | 2026-06-06 |
| Generate and structurally qualify Trelagliptin and Seratrodast scientific Product Monograph drafts | 2026-06-06 |
| Rebuild and requalify Trelagliptin and Seratrodast as expanded HCP scientific Product Monographs | 2026-06-06 |

## Risks and Assumptions

| ID | Type | Description | Response | Status |
|---|---|---|---|---|
| R-001 | Risk | Existing implementation may contain unvalidated or overly broad compliance claims | Treat claims as evidence candidates; validate independently | Open |
| R-002 | Risk | One week may encourage excessive scope | Enforce the architecture-baseline and thin-slice guardrail | Controlled |
| R-003 | Risk | Universal model may become too generic to be useful | Prove every contract against Product Appraisal and later against a clinical workflow | Open |
| A-001 | Assumption | Product Appraisal is suitable as the first cross-cutting thin slice | Confirmed by complete cross-domain traceability mapping | Closed |
| R-004 | Risk | Existing identifiers and domains conflict with the new canonical model | Maintain explicit migration mapping; do not reuse identifiers silently | Open |
| R-005 | Risk | Generic SOPs or skills may flatten materially different activities | Require a separate approved Activity Governance Package for every granular activity | Controlled |
| R-006 | Risk | Product Appraisal Word outputs have not received page-by-page visual QA | Keep qualification conditional until visual review is recorded | Open |
| R-007 | Risk | Product-opportunity scores may change materially after India-specific regulatory, patent, commercial, CMC, API, and supply diligence | Present scores as preliminary and require cross-functional review | Open |
| R-008 | Risk | Legacy activity execution routes can bypass or weaken repository consultation and SOP/skill gates | Replace with one guarded orchestration entry point before production use | Open |
| R-009 | Risk | Product Monograph outputs lack current authoritative India package inserts and rendered page-by-page visual QA | Block prescribing, promotional, and external use until labels and required human/visual reviews are complete | Open |
| R-010 | Risk | Expanded Product Monographs cannot complete visual render QA because LibreOffice is unavailable | Keep qualification conditional and perform page-by-page rendered review before approval | Open |

## Decisions Needed

| ID | Question | Needed by | Status |
|---|---|---|---|
| Q-001 | Which organization or tenant will be represented in the first thin slice? | Day 3 | Open |
| Q-002 | Which Product Appraisal SOP will govern the proof? | Day 3 | Resolved: proposed `SOP-MA-PA-001` |
| Q-003 | Which AI model providers may be approved for the proof? | Day 4 | Open |
