# Product Appraisal Thin-Slice Specification

**Document status:** Proposed  
**Version:** 0.2  
**Default owning domain:** Medical Affairs  
**Intended purpose:** Prove the ClinCommand OS enterprise kernel end to end

## 1. Definition

A Product Appraisal is one Medico-Marketing activity within the Medical Department. It is a controlled, evidence-based, decision-oriented assessment of a pharmaceutical product or candidate for a defined organizational objective.

It may support in-licensing, acquisition, internal portfolio prioritization, new brand planning, lifecycle management, strategic-fit assessment, and Go/No-Go decisions. Its cross-functional assessment may include scientific, preclinical, clinical, safety, regulatory, patent, pricing, market-access, supply, CMC, commercial, operational, HCP-value, and strategic-fit dimensions.

Product Appraisal is not the prime, sole, or umbrella activity of the Medical Department. It must not be used as the generic template for unrelated Medico-Marketing activities.

## 2. Ownership Decision

- Medical Affairs is the default accountable domain.
- A tenant may configure contributing domains such as Clinical Development, Regulatory, Safety, HEOR, Market Access, or Commercial.
- The accountable domain cannot be changed during an active execution without a recorded workflow change or deviation.
- Product Management Team and other cross-functional groups may use the appraisal for decision-making.
- Promotional outputs are not produced directly by this workflow. Approved appraisal content may later become an input to a separate governed content workflow.

## 3. Intended Uses

Permitted initial uses:

- in-licensing, acquisition, and portfolio assessment;
- Go/No-Go decision support;
- internal medical and product strategy;
- evidence-gap identification;
- product or indication assessment;
- medical launch readiness;
- scientific differentiation assessment;
- lifecycle and strategic-fit assessment;
- preparation for further controlled medical content development.

Prohibited initial uses:

- direct promotional release;
- autonomous go/no-go investment decision;
- replacement for regulatory, safety, statistical, or legal approval;
- unsupported comparative superiority claims;
- off-label field communication.

## 4. Required Intake

| Field | Requirement |
|---|---|
| Product or candidate | Mandatory registered object |
| Indication or assessment scope | Mandatory |
| Geography/jurisdiction | Mandatory |
| Intended use | Mandatory and from approved vocabulary |
| Audience | Mandatory |
| Decision or question to support | Mandatory |
| Appraisal date / evidence cut-off | Mandatory |
| Comparators | Required or explicitly marked not applicable |
| Known regulatory status | Required where applicable |
| Evidence package | Required before drafting conclusions |
| Requested due date | Mandatory |

## 5. Controlled Appraisal Sections

Every approved appraisal must contain:

1. Document control and intended use
2. Executive summary
3. Product identification, molecule, and target profile
4. Assessment objective, methodology, scoring rules, and evidence cut-off
5. Therapeutic gap, epidemiology, disease burden, and medical need
6. Preclinical evidence
7. Clinical pharmacology and clinical evidence
8. Safety, tolerability, risk management, and pharmacovigilance
9. Regulatory status, pathway, international approvals, and label context
10. Patent, exclusivity, and freedom-to-operate context
11. Competitor landscape and differentiation
12. Pricing, market access, health economics, and affordability
13. API economics, manufacturing, CMC, and supply-chain readiness
14. Commercial attractiveness and forecast scenarios
15. Strategic fit with company product mix
16. HCP value proposition, medical education, and KOL considerations
17. Evidence quality, digital-intelligence confidence, limitations, and uncertainty
18. Reputation, ethics, access, and stewardship considerations
19. Red flags and mandatory override assessment
20. Weighted scorecard and Go/No-Go decision framework
21. SWOT analysis
22. Recommendations, evidence gaps, and proposed actions
23. References, provenance, contributor, reviewer, and approval history

Sections may be marked not applicable only with a recorded rationale.

## 6. Domain Object

The Product Appraisal domain record contains:

```json
{
  "appraisalId": "uuid",
  "uorObjectId": "uuid",
  "productId": "uuid",
  "indicationId": "uuid",
  "jurisdictionIds": ["uuid"],
  "intendedUse": "internal_medical_strategy",
  "audience": "medical_affairs_leadership",
  "assessmentQuestion": "string",
  "evidenceCutoffDate": "date",
  "comparatorIds": ["uuid"],
  "workflowDefinitionVersionId": "uuid",
  "sopVersionId": "uuid",
  "templateVersionId": "uuid",
  "currentReleaseVersionId": "uuid",
  "lifecycleState": "requested",
  "accountableOwnerId": "uuid",
  "riskClass": "high"
}
```

## 7. Version and Controlled-Record Model

The controlled record consists of both:

- the structured appraisal data and section content; and
- the rendered, human-readable release artifact.

The two are linked by a release manifest containing their identifiers and hashes.

Rules:

- Working drafts may be edited through new draft revisions.
- An approved release version is immutable.
- Changes after approval create a new revision and repeat the applicable review.
- Rendered output is never the only source of truth.
- Structured data cannot silently change without invalidating the release manifest.

## 8. Lifecycle

```text
REQUESTED
-> ELIGIBILITY_CONFIRMED
-> RESEARCH_IN_PROGRESS
-> DRAFT_IN_PROGRESS
-> VALIDATION_PENDING
-> MEDICAL_REVIEW
-> REVISION_REQUIRED | REJECTED | APPROVED
-> RELEASED
-> SUPERSEDED | ARCHIVED
```

### Lifecycle Rules

- `REQUESTED -> ELIGIBILITY_CONFIRMED`: intake, intended use, owner, SOP, workflow, and skills resolve successfully.
- `ELIGIBILITY_CONFIRMED -> RESEARCH_IN_PROGRESS`: evidence plan and approved sources are confirmed.
- `RESEARCH_IN_PROGRESS -> DRAFT_IN_PROGRESS`: minimum evidence completeness threshold is met.
- `DRAFT_IN_PROGRESS -> VALIDATION_PENDING`: all mandatory sections are completed or justified as not applicable.
- `VALIDATION_PENDING -> MEDICAL_REVIEW`: no critical validation findings remain open.
- `MEDICAL_REVIEW -> APPROVED`: qualified independent human approver signs the defined approval meaning.
- `APPROVED -> RELEASED`: release manifest and immutable versions are created.
- `RELEASED -> SUPERSEDED`: a newer release becomes effective.

## 9. Escalation Triggers

Mandatory escalation occurs when:

- a requested use is promotional, external, or off-label;
- primary evidence conflicts materially;
- safety information is incomplete or indicates a new concern;
- the product or indication lacks a clear regulatory status;
- comparative claims lack direct or defensible evidence;
- evidence is materially outdated;
- AI or human contributors cannot resolve a material uncertainty;
- required reviewer independence cannot be satisfied.

## 10. Acceptance Criteria

- Ownership and intended use are explicit.
- Both structured and rendered controlled records are immutable after release.
- Every material conclusion links to evidence or is identified as an assumption.
- Weighted scores and red-flag overrides remain traceable to evidence and reviewer judgment.
- The appraisal cannot be approved by its primary author or any AI agent.
- The complete lifecycle is reconstructable from objects, relationships, events, decisions, and release hashes.
