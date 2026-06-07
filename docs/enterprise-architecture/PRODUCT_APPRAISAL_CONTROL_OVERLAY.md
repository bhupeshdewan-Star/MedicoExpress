# Product Appraisal Enterprise Control Overlay

**Document status:** Draft control overlay - not a business SOP  
**Version:** 0.2  
**Business SOP source:** Owner-supplied `Expanded Auro _SOP_Product_Appraisal.docx`  
**Purpose:** Define enterprise-system controls that surround, but do not replace, the approved business SOP.

## Correction Notice

The prior version of this document was incorrectly framed as a proposed complete Product Appraisal SOP. It was deficient compared with the owner-supplied business SOP and skill specification.

This document is now only an enterprise control overlay. The business procedure, professional methodology, output architecture, and decision framework must be derived from and reconciled with the owner-supplied Product Appraisal SOP and skill.

## 1. Control Purpose

Define how ClinCommand OS enforces repository consultation, workflow execution, traceability, AI governance, validation, immutable release, and audit controls while qualified personnel follow the approved Product Appraisal business SOP.

## 2. Control Scope

This overlay applies to Product Appraisals performed within ClinCommand OS. It covers human and AI-assisted execution controls.

It does not define the professional content of an appraisal and does not authorize promotional release, regulatory submission, safety decision, or autonomous investment decision.

## 3. Enterprise Control Roles

| Role | Responsibility |
|---|---|
| Requester | Defines intended use, scope, audience, and decision need |
| Accountable Medical Owner | Accepts ownership and ensures appropriate contributors |
| Evidence Appraisal Contributor | Develops and documents the evidence assessment |
| Safety Contributor | Reviews material safety content when required |
| Regulatory Contributor | Reviews labeling and regulatory context when required |
| Medical Reviewer | Performs independent scientific review |
| Medical Approver | Makes final human approval decision |
| AI Orchestrator and Agents | Perform only approved bounded assistance |
| Quality or Validation Reviewer | Reviews process conformance when required by risk |

## 4. Enterprise Prerequisites

- effective approved Product Appraisal business SOP;
- approved Product Appraisal human skill specification;
- approved AI capability specifications;
- registered product or candidate and indication;
- intended use, audience, geography, and assessment question;
- evidence cut-off date;
- approved or validated evidence sources;
- known labeling and regulatory status;
- comparator scope;
- applicable workflow, SOP, template, and skill requirements.

## 5. Enterprise Control Procedure

### 5.1 Intake and Eligibility

1. Register the appraisal request.
2. Confirm permitted intended use and assign an accountable Medical Affairs owner.
3. Resolve and pin the effective workflow, SOP, and template versions.
4. Verify required contributor, reviewer, and approver skills.
5. Record any conflict of interest or independence constraint.
6. Block or escalate ineligible requests.

### 5.2 Evidence Planning

1. Define assessment questions and evidence cut-off date.
2. Create an evidence plan covering efficacy, safety, labeling, regulatory status, comparators, and relevant preclinical or pharmacology context.
3. Identify approved source types and search methods.
4. Record inclusion, exclusion, and evidence-quality rules.

### 5.3 Research and Drafting

1. Retrieve evidence through approved sources or ingest verified source documents.
2. Register each source and preserve provenance.
3. Extract material findings with source-level citations.
4. Distinguish fact, interpretation, assumption, and recommendation.
5. Draft all mandatory appraisal sections.
6. Record material conflicts, limitations, and missing evidence.

### 5.4 AI-Assisted Work

1. Use only approved agents, models, prompts, tools, and source permissions.
2. Record every AI execution and delegation.
3. Treat AI outputs as untrusted drafts until validated.
4. Do not allow AI to make or satisfy final approval.

### 5.5 Validation

1. Verify document completeness.
2. Verify source identity, citation accuracy, and claim support.
3. Verify scientific balance, safety context, and uncertainty disclosure.
4. Verify alignment with intended use, geography, and regulatory status.
5. Resolve all critical findings before medical review.

### 5.6 Medical Review and Approval

1. Assign a qualified reviewer independent from the primary author.
2. Document review findings and their resolution.
3. Require revision or reject when material issues remain.
4. Obtain final approval from an authorized, qualified human approver.
5. Record approval meaning and electronic signature where required.

### 5.7 Release and Maintenance

1. Create immutable structured and rendered release versions.
2. Create a release manifest containing version identifiers and hashes.
3. Link the release to all governing and supporting objects.
4. Monitor for source, label, safety, SOP, or regulatory changes that may affect the appraisal.
5. Supersede, revise, or archive the appraisal as required.

## 6. Exceptions and Deviations

No exception may bypass human approval, evidence provenance, or audit requirements. Other deviations require an authorized deviation record, rationale, risk assessment, and disposition.

## 7. Records

- request and intake;
- SOP, workflow, template, and skill resolutions;
- evidence plan and source records;
- AI execution records;
- draft revisions;
- validation findings;
- review comments and responses;
- decisions and approvals;
- structured and rendered releases;
- release manifest;
- events, relationships, and audit evidence.
