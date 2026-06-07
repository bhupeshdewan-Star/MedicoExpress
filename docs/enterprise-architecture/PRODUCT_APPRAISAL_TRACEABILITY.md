# Product Appraisal Workflow and Traceability Model

**Document status:** Proposed  
**Version:** 0.1

## 1. Workflow Definition

| Step | State | Responsible actor | Gate or output |
|---|---|---|---|
| 1 | Requested | Requester | Complete intake request |
| 2 | Eligibility Confirmed | Accountable Medical Owner | Intended use, owner, SOP, workflow, skills resolved |
| 3 | Research In Progress | Evidence contributors and approved agents | Registered evidence package |
| 4 | Draft In Progress | Medical contributor and approved agents | Complete draft revisions |
| 5 | Validation Pending | Validation services and assigned validators | Findings and validation decision |
| 6 | Medical Review | Independent Medical Reviewer | Review decision and comments |
| 7 | Approved or Revision Required or Rejected | Medical Approver | Accountable human decision |
| 8 | Released | Release service after approval | Immutable versions and release manifest |
| 9 | Superseded or Archived | Accountable Medical Owner | Lifecycle decision |

## 2. Required Registered Objects

- organization and tenant;
- requester, accountable owner, contributors, reviewer, approver;
- product, indication, jurisdiction, comparators;
- Product Appraisal activity and appraisal record;
- workflow definition version and workflow execution;
- SOP version and template version;
- skill definitions and competency evidence;
- evidence plan, sources, claims, and citations;
- agent definitions and executions;
- draft and release versions;
- validation findings and decisions;
- review decision, approval, and release manifest.

## 3. Required Relationships

```text
Product Appraisal GOVERNED_BY SOP Version
Product Appraisal EXECUTED_THROUGH Workflow Version
Product Appraisal RELATED_TO_PRODUCT Product
Product Appraisal RELATED_TO_INDICATION Indication
Product Appraisal REQUIRES_SKILL Skill Definitions
Workflow Execution EXECUTED_BY Human Contributors
Agent Execution GENERATED Artifact Revision
Claim SUPPORTED_BY_EVIDENCE Source
Release Version REVIEWED_BY Medical Reviewer
Release Version APPROVED_BY Medical Approver
Release Version DERIVED_FROM Draft Revision
Release Version SATISFIES Validation Decision
Release Version REPRESENTED_BY Release Manifest
```

## 4. Expected Event Journey

```text
workflow.execution.requested
registry.object.registered
governance.sop.resolved
governance.skill.verified
workflow.execution.started
workflow.task.assigned
ai.execution.requested
ai.delegation.created
ai.output.generated
registry.object.version.created
workflow.validation.requested
workflow.validation.failed | workflow.validation.passed
workflow.approval.requested
workflow.revision_required | workflow.rejected | workflow.approved
registry.object.version.created
registry.object.state.changed
workflow.execution.completed
```

The event catalogue should add any events above that are not yet canonical before implementation.

## 5. Example Traceability Summary

```json
{
  "appraisal": "PA-000001",
  "product": "PRODUCT-000042",
  "indication": "INDICATION-000009",
  "intendedUse": "internal_medical_strategy",
  "workflowVersion": "WF-MA-PA-001@1.0",
  "sopVersion": "SOP-MA-PA-001@1.0",
  "templateVersion": "TMPL-MA-PA-001@1.0",
  "skillsVerified": [
    "SK-MA-PA-001",
    "SK-MA-EA-001",
    "SK-MA-SCI-001",
    "SK-GOV-SOP-001",
    "SK-GOV-AI-001",
    "SK-TA-0007"
  ],
  "sourceCount": 28,
  "claimCount": 46,
  "unsupportedClaimCount": 0,
  "agentExecutionCount": 6,
  "criticalFindingsOpen": 0,
  "approvedBy": "USER-000031",
  "releaseVersion": "PA-000001@1.0",
  "releaseManifestHash": "sha256"
}
```

## 6. Architecture-Proof Acceptance Tests

1. Block request when intended use is prohibited.
2. Block execution when no effective SOP resolves.
3. Block execution when a required skill cannot be fulfilled.
4. Permit approved agents only within their capability and source scope.
5. Record every AI delegation and generated revision.
6. Block review when a critical validation finding is open.
7. Block approval by the primary author, AI agent, or unqualified human.
8. Prevent modification of the approved release version.
9. Create a new revision when released content changes.
10. Reconstruct the full traceability summary without reading free-text audit descriptions.

