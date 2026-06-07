# Workflow and SOP Execution Model

**Document status:** Draft  
**Version:** 0.1

## 1. Core Rule

Every regulated activity executes through a versioned workflow that resolves an effective SOP, validates required skills, applies policy, records evidence, and requires the prescribed human decisions.

## 2. Execution Stages

```text
Request
-> Classify intended use and risk
-> Resolve workflow version
-> Resolve effective SOP version
-> Resolve skill and reviewer requirements
-> Evaluate user and agent permissions
-> Create execution record
-> Perform bounded tasks
-> Validate output and evidence
-> Human review and decision
-> Release or reject
-> Archive and monitor downstream impact
```

## 3. Mandatory Pre-Execution Gates

The workflow must block before work begins when:

- no effective SOP is mapped;
- the SOP is expired, retired, or not effective;
- required user or reviewer skills cannot be satisfied;
- an agent lacks the required approved capability;
- the intended use is prohibited;
- mandatory source data is missing;
- authorization or purpose-of-use checks fail.

An authorized exception process may exist, but it must create a deviation record and cannot silently bypass a gate.

## 4. Workflow Definition Contract

Every workflow definition contains:

- workflow ID and version;
- activity type and intended uses;
- risk class;
- eligible triggers;
- required SOP resolution rules;
- required requester, contributor, reviewer, and approver skills;
- allowed agents, tools, and models;
- tasks, states, transitions, and time limits;
- validation rules;
- decision and e-signature requirements;
- expected artifacts;
- events emitted;
- exception and escalation rules;
- retention and archival rules.

## 5. SOP Resolution

SOP resolution uses:

- tenant and organization;
- domain and activity type;
- jurisdiction and geography;
- product, study, or submission context;
- intended use and risk class;
- effective date.

The resolved SOP version is pinned to the execution. A later SOP update triggers impact assessment but does not rewrite historical execution.

## 6. Skill Resolution

Skill checks distinguish:

- skill definition;
- required proficiency;
- evidence of competency;
- certification status and expiry;
- independence or conflict-of-interest requirements;
- whether the skill is required to perform, review, or approve.

Agents have capabilities, not human competencies. Agent capabilities are separately approved and cannot satisfy mandatory human-accountability requirements.

## 7. Product Appraisal Workflow Baseline

1. User submits purpose, product, indication, audience, geography, and due date.
2. System classifies risk and resolves the Product Appraisal workflow.
3. System pins the effective Product Appraisal SOP.
4. System verifies requester and medical reviewer requirements.
5. Orchestrator delegates bounded research, evidence, competitor, and drafting tasks.
6. Validation checks citations, claims, balance, recency, SOP conformance, and prohibited content.
7. Qualified medical reviewer requests revision, rejects, or approves.
8. Approval creates a locked release version and downstream monitoring obligation.

## 8. Acceptance Criteria

- Normal execution cannot proceed without SOP and skill gates.
- Every transition is authorized and emits an event.
- Historical executions retain their original workflow and SOP versions.
- AI work is fully traceable and cannot satisfy final human approval.
- Deviations and exceptions are explicit records.
