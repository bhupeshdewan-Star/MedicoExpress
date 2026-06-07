# Multi-Agent Activity Orchestration

**Document status:** Proposed for owner review  
**Version:** 0.1  
**Purpose:** Require parallel specialist-agent execution for complex ClinCommand OS activities.

This document should be read together with `CLINCOMMAND_OS_AGENT_TRAINING_STANDARD.md`, which defines the canonical subagent operating policy and the required task sequence.

## 1. Core Rule

Complex activities must be decomposed into independent specialist tasks and executed in parallel where dependencies permit.

The orchestrator must not ask one general-purpose bot to research, interpret, draft, validate, and approve an entire complex activity.

## 2. Mandatory Pre-Planning Gate

Before planning work, the orchestrator must:

1. resolve the granular activity;
2. resolve the approved effective Activity Governance Package;
3. consult its SOP, human skill specification, AI capability definitions, controls, templates, and source policy;
4. record package identifiers, versions, hashes, and consultation receipts;
5. derive the agent plan from those approved materials;
6. block execution if mandatory materials are unavailable or ineffective.

## 3. Product Appraisal Agent Team

| Specialist agent | Responsibility |
|---|---|
| Activity Package Resolver | Resolves and verifies effective SOP, skill, controls, workflow, and template |
| PubMed and Publications Agent | Searches, screens, extracts, and structures peer-reviewed evidence |
| Clinical Trial Registry Agent | Reviews registered, completed, ongoing, and terminated studies |
| FDA Intelligence Agent | Retrieves and structures FDA labels, reviews, safety updates, and decisions |
| EMA Intelligence Agent | Retrieves and structures EPARs, product information, and variations |
| CDSCO and India Regulatory Agent | Retrieves India approvals, notices, new-drug status, and applicable requirements |
| Other Authority Agent | Reviews PMDA, MHRA, TGA, and other relevant authorities |
| Preclinical and Translational Agent | Assesses pharmacology, toxicology, PK/PD, and translational evidence |
| Safety and PV Agent | Assesses known risks, signals, risk-management needs, and evidence gaps |
| Patent and Exclusivity Agent | Structures patent, exclusivity, litigation, and FTO questions |
| Competitor Intelligence Agent | Structures approved and pipeline competitors and differentiation |
| Pricing, Access, and Commercial Agent | Structures verified price, access, market, and forecast inputs |
| CMC, API, and Supply Agent | Structures manufacturability, API, DMF, supply, and readiness inputs |
| Evidence Appraisal Agent | Evaluates quality, consistency, limitations, and confidence |
| Scorecard Agent | Applies approved weights without overriding red flags |
| Medical Synthesis Agent | Produces the controlled draft from registered evidence packages |
| Citation and Provenance Validator | Verifies claim-to-source links and source integrity |
| SOP and Controls Validator | Verifies package and workflow conformance |
| Independent Quality Agent | Challenges omissions, unsupported claims, bias, and contradictions |

AI agents cannot provide final human approval.

## 4. Parallel Execution Pattern

```text
Activity Package Resolution
        |
        v
Approved Research Plan
        |
        +--> Publications / PubMed
        +--> Trial Registries
        +--> FDA
        +--> EMA
        +--> CDSCO / India
        +--> Other Authorities
        +--> Patent / Exclusivity
        +--> Safety / PV
        +--> Competitor
        +--> Pricing / Access
        +--> CMC / API / Supply
        |
        v
Evidence Normalization and Conflict Detection
        |
        +--> Evidence Appraisal
        +--> Scorecard
        +--> Red-Flag Review
        |
        v
Medical Synthesis
        |
        +--> Citation Validation
        +--> SOP / Control Validation
        +--> Independent Quality Challenge
        |
        v
Human Review and Approval
```

## 5. Structured Agent Handoff

Every agent returns a structured evidence package containing:

- agent and capability version;
- assigned question and boundaries;
- sources searched;
- sources included and excluded with reasons;
- extracted findings;
- jurisdiction and evidence dates;
- confidence and limitations;
- conflicts and unresolved questions;
- proposed claims or conclusions;
- prohibited-use warnings;
- provenance and integrity references.

Free-text summaries without structured evidence packages are insufficient for controlled synthesis.

## 6. Conflict Handling

- Conflicting sources are preserved and surfaced.
- Authority sources govern approved status and label interpretation within their jurisdiction.
- Later publication date does not automatically imply stronger evidence.
- Unresolved material conflicts trigger human review.
- The synthesis agent cannot silently select the most favorable source.

## 7. Speed and Safety Controls

- Independent searches execute concurrently.
- Agent tasks have explicit time, source, and tool limits.
- Duplicate-source detection prevents redundant work.
- Results are cached by source version and retrieval date.
- High-risk gaps block conclusions rather than delaying every independent task.
- Parallelism never bypasses SOP, evidence, validation, or human-approval controls.

## 8. Consultation Receipt

Every execution must store:

```json
{
  "activityId": "product_appraisal",
  "executionId": "uuid",
  "consultedPackages": [
    {
      "assetId": "uuid",
      "assetType": "sop",
      "version": "1.0",
      "sha256": "hash",
      "status": "EFFECTIVE",
      "consultedAt": "timestamp"
    }
  ],
  "planDerivedAfterConsultation": true
}
```

## 9. Acceptance Tests

1. Block planning when the effective SOP or skill cannot be resolved.
2. Prove the agent plan was created after repository consultation.
3. Execute at least three independent research agents concurrently.
4. Prevent agents from accessing unapproved source classes.
5. Preserve conflicting findings for review.
6. Reconstruct every material claim from specialist evidence packages.
7. Block synthesis when critical research streams fail without disposition.
8. Block final approval by any AI agent.
