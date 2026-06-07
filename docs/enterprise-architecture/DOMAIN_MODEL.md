# Enterprise Domain Model

**Document status:** Draft  
**Version:** 0.1  
**Purpose:** Establish the shared language and domain boundaries of ClinCommand OS.

## 1. Domain Map

### Enterprise Kernel

Owns concepts required by every domain:

- organization, tenant, business unit, team, person, role;
- identity, authorization, policy, purpose of use;
- universal object identity, version, lifecycle, relationship;
- event, task, workflow, decision, approval;
- audit evidence and provenance.

### Governance and Quality

Owns:

- SOP, policy, controlled document, template;
- skill, competency, certification, training;
- deviation, finding, CAPA, audit, inspection;
- validation requirement, test evidence, release decision.

### Knowledge and Evidence

Owns:

- source, literature record, guideline, evidence package;
- claim, citation, data set, analysis, knowledge asset;
- knowledge approval, effective period, supersession.

### AI and Automation

Owns:

- agent definition, agent capability, tool permission;
- model registration, prompt/configuration version;
- execution, delegation, memory record, evaluation;
- automated action, recommendation, remediation.

### Medical Affairs and Medical Communications

Owns:

- medical inquiry, response, product appraisal;
- scientific narrative, KOL engagement, congress activity;
- publication plan, medical content, training material.

### Research and Development

Owns:

- product candidate, indication, preclinical study;
- clinical study, protocol, site, investigator, subject;
- monitoring activity, study risk, operational milestone;
- statistical analysis, bioequivalence, RWE study.

### Safety and Pharmacovigilance

Owns:

- safety case, adverse event, signal, aggregate report;
- safety assessment, risk-management activity.

### Regulatory

Owns:

- authority, jurisdiction, obligation, guideline;
- submission, dossier, CTD component, commitment;
- authority question, response, labeling, variation.

### Platform Reliability

Owns:

- service, integration, incident, drift observation;
- remediation proposal, approved remediation, reliability evidence.

## 2. Core Definitions

| Term | Definition |
|---|---|
| Activity | A purposeful unit of organizational work governed by a workflow and, when regulated, an effective SOP |
| Artifact | A versioned output created or used by an activity |
| Approval | An accountable human decision authorizing a defined state transition |
| Evidence | Traceable information supporting a claim, decision, analysis, or output |
| SOP | An approved, effective, version-controlled procedure governing defined activities |
| Skill | A defined capability with proficiency and evidence requirements |
| Agent | A governed AI or automation actor permitted to perform bounded capabilities |
| Workflow | A versioned definition of states, tasks, gates, rules, and transitions |
| Execution | A single run of a workflow, agent, analysis, or controlled activity |
| Event | An immutable record that a material fact or state change occurred |
| Digital Twin | The current connected representation of organizational objects, relationships, status, obligations, evidence, and events |

## 3. Universal Relationship Types

Initial relationships include:

- `OWNED_BY`
- `PART_OF`
- `GOVERNED_BY`
- `REQUIRES_SKILL`
- `REQUIRES_REVIEW_BY`
- `EXECUTED_BY`
- `REVIEWED_BY`
- `APPROVED_BY`
- `SUPPORTED_BY_EVIDENCE`
- `DERIVED_FROM`
- `SUPERSEDES`
- `IMPACTS`
- `SATISFIES`
- `VIOLATES`
- `GENERATED_BY`
- `USES_MODEL`
- `USES_TOOL`
- `RELATED_TO_PRODUCT`
- `RELATED_TO_STUDY`
- `RELATED_TO_SUBMISSION`
- `RESULTED_IN`

Relationships are typed, attributable, effective-dated, and independently auditable.

## 4. Product Appraisal Thin-Slice Mapping

| Concern | Domain object |
|---|---|
| Request | Activity Request |
| Governed work | Product Appraisal Activity + Workflow Version |
| Procedure | Effective Product Appraisal SOP |
| Competency | Required Skill Definitions + User Skill Evidence |
| Inputs | Product, Indication, Evidence Package, Competitors |
| AI work | Agent Executions and Delegations |
| Output | Versioned Product Appraisal Artifact |
| Validation | Validation Findings and Validation Decision |
| Release | Human Approval |
| Traceability | Relationships + Events + Audit Evidence |

## 5. Open Domain Questions

- Should Product Appraisal belong to Medical Affairs, Medical Communications, or a configurable domain selected per tenant?
- Which objects require strict regulated-record controls in the first release?
- Which relationship types need semantic constraints beyond access control?
- Which external terminologies should be adopted for products, indications, safety, trials, and regulatory objects?

