# Activity Governance Package Standard

**Document status:** Proposed for owner review  
**Version:** 0.1  
**Purpose:** Define the complete governed package required before any ClinCommand OS activity can be implemented or executed.

## 1. Core Principle

Every granular activity in ClinCommand OS must have its own governed Activity Governance Package (AGP).

An activity may be small or large. It must not inherit a generic SOP or generic skill merely because it belongs to the same department. Shared controls may be referenced, but the activity-specific procedure, expertise, outputs, risks, and validation requirements must remain explicit.

Examples of separate activities:

- Product Appraisal
- Product Monograph Preparation
- CME Slide Preparation
- Product Training Slide Preparation
- Literature Review
- Medical Information Response
- KOL Brief Preparation
- Protocol Preparation
- Bioequivalence Statistical Analysis
- CTD Module Preparation

## 2. Package Contents

No activity is implementation-ready until the following package is available:

| Component | Purpose | Approval requirement |
|---|---|---|
| Activity Definition | Defines business purpose, scope, boundaries, and owner | Business owner |
| Business SOP | Defines how qualified personnel perform, review, approve, revise, distribute, and archive the activity | SOP governance process |
| Human Skill Specification | Defines knowledge, judgment, methods, standards, and competency evidence required | Domain expert and training owner |
| AI Capability Specification | Defines bounded AI assistance, inputs, outputs, tools, restrictions, and evaluation | AI governance and domain owner |
| Input Contract | Defines mandatory and conditional source materials and intake fields | Domain owner |
| Output Architecture | Defines required sections, records, derivative outputs, and controlled formats | Domain owner |
| Evidence and Source Policy | Defines permitted sources, hierarchy, currency, and traceability | Domain and quality |
| Control and Validation Checklist | Defines critical, major, and minor checks | Quality and domain owner |
| Workflow and Approval Matrix | Defines roles, independence, states, transitions, and escalation | Domain and quality |
| Template Set | Defines controlled document, slide, form, or data templates | Domain owner |
| Revision and Distribution Rules | Defines triggers, recipients, effective dates, and supersession | SOP governance |
| Training and Assessment Package | Defines qualification, assessment, certification, and retraining | Training owner |
| User Manual Module | Explains how to perform the activity in ClinCommand OS | Product and domain owner |
| Traceability and Audit Contract | Defines objects, events, relationships, signatures, and records | Architecture and quality |
| Validation Evidence | Demonstrates the implemented activity behaves as intended | Validation owner |

## 3. Source Precedence

When defining an activity, ClinCommand OS follows this precedence:

1. Owner-supplied approved SOP and approved skill specification.
2. Owner-supplied draft SOP and skill specification.
3. Applicable regulatory, professional, scientific, and company standards.
4. ClinCommand-proposed draft package created for owner review.

ClinCommand must not silently replace an owner-supplied SOP or skill with an internally generated version.

## 4. Activity Package Lifecycle

```text
IDENTIFIED
-> SOURCE_MATERIAL_REQUESTED
-> SOURCE_MATERIAL_RECEIVED
-> GAP_ASSESSED
-> DRAFT_PACKAGE_PREPARED
-> OWNER_REVIEW
-> REVISED
-> APPROVED
-> IMPLEMENTATION_READY
-> IMPLEMENTED
-> VALIDATED
-> EFFECTIVE
-> SUPERSEDED | RETIRED
```

## 5. Implementation Gate

An activity must not be implemented as an effective enterprise workflow until:

- its business SOP and human skill specification are approved;
- the AI capability specification is reviewed and bounded;
- mandatory inputs, outputs, evidence rules, and controls are explicit;
- workflow roles, approvals, revision triggers, and distribution rules are defined;
- the user manual module and validation approach are ready;
- traceability and audit requirements are mapped.

Draft prototypes may be built only when visibly marked as non-effective and non-production.

## 6. Business SOP Minimum Structure

Every business SOP should address, where applicable:

1. Document control
2. Purpose
3. Scope
4. Definitions
5. Responsibilities
6. Policy
7. General principles
8. Required inputs and prerequisites
9. Detailed procedure and output structure
10. Evidence and referencing requirements
11. Review and approval
12. Revision triggers
13. Distribution and use restrictions
14. Exceptions and deviations
15. Records and retention
16. Forms, templates, checklists, and annexures

## 7. Human Skill Specification Minimum Structure

Every human skill specification should address, where applicable:

1. Skill purpose and positioning
2. Intended activity and deliverables
3. Required domain knowledge
4. Required source literacy
5. Detailed methodology
6. Content or analysis architecture
7. Scientific and technical standards
8. Regulatory and compliance boundaries
9. Evidence hierarchy and source validation
10. Red flags and escalation judgment
11. Quality and approval checklist
12. Visual, writing, statistical, or operational standards
13. Required proficiency levels
14. Assessment and certification method
15. Retraining triggers

## 8. AI Capability Specification Minimum Structure

The AI capability must state:

- which parts of the activity AI may assist with;
- mandatory source inputs before AI can act;
- which tools, models, repositories, and jurisdictions are allowed;
- expected structured outputs;
- prohibited actions and claims;
- confidence, citation, and uncertainty requirements;
- required human review;
- test cases and performance thresholds;
- drift and change-control rules.

## 9. Relationship to Enterprise Architecture

The enterprise kernel does not define the professional content of every activity. It provides the shared mechanisms that enforce each approved package:

- repository consultation;
- version resolution;
- competency verification;
- AI capability enforcement;
- workflow execution;
- evidence provenance;
- validation and approvals;
- revision monitoring;
- controlled distribution;
- audit and traceability.

