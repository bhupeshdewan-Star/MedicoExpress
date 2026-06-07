# Repository and Multi-Agent Orchestration Integration Plan

**Document status:** Proposed  
**Version:** 0.1  
**Purpose:** Connect controlled SOP/skill resolution to every activity-planning and multi-agent execution path.

## 1. Required Enterprise Entry Point

Every activity request must enter through one guarded orchestration service:

```text
Request
-> Resolve activity and intended use
-> Resolve controlled effective activity package
-> Verify status, dates, hashes, permissions, and completeness
-> Create consultation receipt
-> Build multi-agent plan from consulted package
-> Execute bounded parallel tasks
-> Validate, synthesize, and route for human decision
```

No API, Copilot route, fallback generator, agent, or background task may bypass this entry point.

## 2. Existing Implementation Findings

Useful existing components:

- `repository_engine.js` loads SOPs before skills and creates mappings.
- `skill_engine.js` contains useful domain, function, SOP, prompt, template, audit, and traceability checks.
- `startup_registry_validator.js` contains registry validation concepts.
- `knowledge_governance.js` contains knowledge eligibility concepts.
- `ai_traceability_service.js` can support pinned execution traceability.
- `resolve_activity_package.py` verifies owner-source package presence and hashes and creates consultation receipts.

Critical gaps to remove in the enterprise kernel:

- `activity_orchestrator.js` does not currently require package resolution before planning.
- Retrieval failure may be swallowed and fallback drafting may continue.
- General activity and Copilot routes can call activity execution without the stronger SOP/skill gate.
- The Product Appraisal route returns before stronger skill validation, leaving validation code unreachable.
- Repository loading defaults missing SOP and prompt status to approved/effective.
- Current skill execution does not require a pinned effective SOP version with effective-date checks.
- Knowledge retrieval is not consistently filtered through governance eligibility.
- Current repository, RAG, and controlled-source ingestion paths are not unified.

## 3. New Required Services

### Effective Activity Package Resolver

Responsibilities:

- resolve exact activity, tenant, jurisdiction, purpose, and date;
- require approved effective SOP and skill versions for production;
- permit owner-supplied non-effective sources only for visibly marked draft planning;
- verify hashes and access;
- create consultation receipt;
- pin package versions to execution.

### Governed Multi-Agent Orchestrator

Responsibilities:

- create plan only after consultation receipt exists;
- delegate independent specialist work in parallel;
- enforce source, capability, jurisdiction, and tool boundaries;
- collect structured specialist evidence packages;
- preserve conflicts and gaps;
- route to independent controls and validation agents;
- block human review readiness when critical streams fail.

### Governed Retrieval Service

Responsibilities:

- retrieve only eligible controlled-asset versions;
- apply tenant, domain, purpose, jurisdiction, classification, and capability filters;
- return asset IDs, versions, locators, and hashes;
- distinguish retrieved, agent-supplied, cited, and excluded sources.

## 4. Required Code Changes Before Production Use

1. Add a single guarded activity execution entry point.
2. Require package resolution as its first operation.
3. Remove or block direct unguarded activity execution routes.
4. Prohibit fallback drafting when mandatory repository resolution fails.
5. Make skill execution consume a resolved pinned package, not caller-supplied identifiers.
6. Require effective status and effective-date eligibility.
7. Connect all retrieval to controlled knowledge eligibility.
8. Persist consultation receipt ID and package hashes in AI traceability.
9. Add orchestration, specialist-package, conflict, validation, and human-decision events.

## 5. Acceptance Tests

- Missing SOP blocks planning.
- Missing skill blocks planning.
- Owner-supplied source package permits draft planning only.
- Non-effective package blocks production execution.
- Hash mismatch blocks planning and emits an integrity event.
- No plan can be created before consultation receipt.
- At least three independent specialist agents execute concurrently for Product Appraisal.
- Specialist failure is dispositioned before synthesis.
- Conflicting evidence is preserved and blocks approval when critical.
- Direct legacy activity routes cannot bypass the guarded entry point.

