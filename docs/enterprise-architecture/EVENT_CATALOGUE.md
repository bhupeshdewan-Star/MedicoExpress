# Enterprise Event Catalogue

**Document status:** Draft  
**Version:** 0.1

## 1. Event Principles

- Events state facts that already occurred.
- Published events are immutable.
- Events contain no secrets and minimize sensitive payload data.
- Consumers must tolerate duplicate delivery.
- Event schemas are versioned.
- Correlation and causation IDs connect a complete business journey.
- The audit ledger and event bus serve different purposes but share traceability identifiers.

## 2. Canonical Event Envelope

```json
{
  "eventId": "uuid",
  "eventType": "workflow.execution.started",
  "eventVersion": 1,
  "occurredAt": "2026-06-06T00:00:00Z",
  "tenantId": "uuid",
  "actor": {
    "actorType": "user",
    "actorId": "uuid"
  },
  "subjectObjectId": "uuid",
  "correlationId": "uuid",
  "causationId": "uuid",
  "classification": "internal",
  "payload": {},
  "schemaRef": "events://workflow.execution.started/v1"
}
```

## 3. Initial Event Families

### Registry and Relationships

- `registry.object.registered`
- `registry.object.version.created`
- `registry.object.state.changed`
- `registry.relationship.created`
- `registry.relationship.retired`

### SOP, Skill, and Governance

- `governance.sop.approved`
- `governance.sop.became_effective`
- `governance.sop.resolved`
- `governance.sop.superseded`
- `governance.skill.requirement.changed`
- `governance.skill.verified`
- `governance.skill.gap.detected`
- `governance.capa.opened`
- `governance.capa.overdue`

### Workflow

- `workflow.execution.requested`
- `workflow.execution.blocked`
- `workflow.execution.started`
- `workflow.task.assigned`
- `workflow.task.completed`
- `workflow.validation.failed`
- `workflow.validation.requested`
- `workflow.validation.passed`
- `workflow.approval.requested`
- `workflow.revision_required`
- `workflow.approved`
- `workflow.rejected`
- `workflow.execution.completed`

### AI

- `ai.execution.requested`
- `ai.execution.started`
- `ai.delegation.created`
- `ai.output.generated`
- `ai.output.validation_failed`
- `ai.output.accepted_for_review`
- `ai.execution.completed`
- `ai.governance.violation_detected`

### Regulatory Intelligence

- `regulatory.source.change_detected`
- `regulatory.change.classified`
- `regulatory.impact.assessment_requested`
- `regulatory.impact.confirmed`
- `regulatory.action.assigned`

### Platform Reliability

- `platform.drift.detected`
- `platform.incident.predicted`
- `platform.incident.opened`
- `platform.remediation.proposed`
- `platform.remediation.authorized`
- `platform.remediation.completed`

## 4. Product Appraisal Event Journey

```text
workflow.execution.requested
governance.skill.verified
workflow.execution.started
ai.execution.requested
ai.output.generated
workflow.approval.requested
workflow.approved
registry.object.state.changed
workflow.execution.completed
```

Blocked or failed branches must emit their own reason-bearing events.

## 5. Event Governance

Adding or materially changing an event requires:

- named producer and consumers;
- schema and compatibility review;
- data-classification review;
- retention decision;
- replay and idempotency behavior;
- traceability and validation impact assessment.
