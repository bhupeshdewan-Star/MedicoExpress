# Universal Object Registry Specification

**Document status:** Draft  
**Version:** 0.1

## 1. Purpose

The Universal Object Registry (UOR) provides stable identity, lifecycle, versioning, ownership, classification, and relationships for every significant object in ClinCommand OS.

It is not a single generic table containing all business data. Domain modules retain their specialized data models while registering shared identity and governance metadata in the UOR.

## 2. Canonical Object Envelope

Every registered object must expose:

```json
{
  "objectId": "uuid",
  "objectType": "product_appraisal",
  "tenantId": "uuid",
  "canonicalName": "Product X Appraisal",
  "domain": "medical_affairs",
  "lifecycleState": "draft",
  "version": 1,
  "ownerId": "uuid",
  "classification": "confidential",
  "regulatedRecord": true,
  "effectiveFrom": "2026-06-06T00:00:00Z",
  "effectiveTo": null,
  "createdAt": "2026-06-06T00:00:00Z",
  "createdBy": "uuid",
  "updatedAt": "2026-06-06T00:00:00Z",
  "updatedBy": "uuid",
  "metadataSchema": "medical.product-appraisal.v1",
  "domainRecordRef": "medical-affairs://product-appraisals/uuid"
}
```

## 3. Mandatory Behaviors

- Stable identity survives version changes.
- Regulated-record versions are immutable after approval.
- State transitions occur only through authorized commands.
- Every material transition emits an event.
- Every object has an accountable owner or owning role.
- Access is evaluated using tenant, role, purpose, domain, geography, classification, and object policy.
- Relationships are explicit records, not implicit text references.
- Deletion of regulated records is prohibited; retirement or archival is used instead.

## 4. Relationship Envelope

```json
{
  "relationshipId": "uuid",
  "relationshipType": "GOVERNED_BY",
  "sourceObjectId": "uuid",
  "targetObjectId": "uuid",
  "tenantId": "uuid",
  "effectiveFrom": "2026-06-06T00:00:00Z",
  "effectiveTo": null,
  "assertedBy": "uuid",
  "evidenceObjectId": "uuid",
  "status": "active"
}
```

## 5. Initial Object-Type Families

- `enterprise.*`: organization, team, person, role, policy
- `governance.*`: sop, skill, training, capa, audit, validation
- `knowledge.*`: source, evidence, claim, guideline, dataset
- `workflow.*`: definition, execution, task, decision, approval
- `ai.*`: agent, model, execution, memory, evaluation
- `medical.*`: inquiry, response, appraisal, content, engagement
- `research.*`: preclinical-study, clinical-study, protocol, site, analysis
- `safety.*`: case, event, signal, assessment
- `regulatory.*`: authority, obligation, submission, dossier, response
- `platform.*`: service, integration, incident, drift, remediation

## 6. Required Registry Operations

- register object;
- retrieve current object;
- retrieve version history;
- transition lifecycle state;
- create or retire relationship;
- find impact graph;
- query by owner, type, state, classification, or relationship;
- produce complete object history;
- verify object integrity.

## 7. Acceptance Criteria for First Proof

- A Product Appraisal has stable identity and multiple immutable versions.
- It links to product, indication, SOP, workflow, skills, evidence, agents, reviewers, and approval.
- Its complete history can be reconstructed from events and versions.
- An unauthorized actor cannot transition it to approved.

