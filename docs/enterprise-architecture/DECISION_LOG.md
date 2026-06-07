# Architecture Decision Log

**Document status:** Accepted  
**Purpose:** Persistent record of decisions that materially shape ClinCommand OS.

## Decision Template

```text
Decision ID:
Date:
Status: Proposed | Accepted | Superseded | Retired
Decision:
Context:
Options considered:
Consequences:
Validation/security impact:
Owner:
Related specifications:
```

## Decisions

### EA-001: Rebuild Around a New Enterprise Architecture

- **Date:** 2026-06-06
- **Status:** Accepted
- **Decision:** Build the enterprise platform against a new authoritative architecture. Treat the existing implementation as a source of candidate assets, lessons, and requirements rather than the architectural foundation.
- **Consequences:** Existing modules require explicit assessment before reuse. No wholesale migration is assumed.
- **Owner:** Dr. Bhupesh Dewan

### EA-002: Architecture Documentation Precedes UI Redesign

- **Date:** 2026-06-06
- **Status:** Accepted
- **Decision:** Establish the enterprise domain, object registry, event model, workflow model, AI governance, security, and validation approach before fixing the enterprise UI.
- **Consequences:** UI work during the architecture sprint is limited to information-architecture sketches where necessary.
- **Owner:** Dr. Bhupesh Dewan

### EA-003: Use a Modular Monolith for the Initial Enterprise Kernel

- **Date:** 2026-06-06
- **Status:** Accepted
- **Decision:** Implement explicit domain modules in one deployable enterprise kernel with a durable event bus. Extract services only when justified by measured needs.
- **Consequences:** Module contracts and events must be clear from the beginning. Distributed-system complexity is deferred.
- **Owner:** Architecture team

### EA-004: Every Regulated Activity Is SOP- and Skill-Gated

- **Date:** 2026-06-06
- **Status:** Accepted
- **Decision:** A regulated workflow cannot begin execution until it resolves an effective SOP and validates required user, reviewer, and agent capabilities.
- **Consequences:** SOP and skill repositories are kernel dependencies, not optional domain features.
- **Owner:** Dr. Bhupesh Dewan

### EA-005: AI Is Governed and Cannot Self-Approve

- **Date:** 2026-06-06
- **Status:** Accepted
- **Decision:** AI agents may assist, analyze, draft, recommend, and validate within approved scopes, but cannot provide final approval for regulated outputs.
- **Consequences:** Human approval, provenance, and execution trace are mandatory for controlled outputs.
- **Owner:** Dr. Bhupesh Dewan

### EA-006: Product Appraisal Is Owned by Medical Affairs by Default

- **Date:** 2026-06-06
- **Status:** Accepted
- **Decision:** Product Appraisal is a Medical Affairs activity by default. Other domains may contribute through configured workflow roles, but commercial context does not transfer scientific accountability.
- **Consequences:** Existing Commercial and Commercial Excellence classifications require mapping during migration.
- **Owner:** Architecture team

### EA-007: Controlled Product Appraisal Record Includes Structured and Rendered Releases

- **Date:** 2026-06-06
- **Status:** Accepted
- **Decision:** The approved controlled record consists of immutable structured appraisal data and an immutable rendered artifact connected by a release manifest and integrity hashes.
- **Consequences:** Existing in-place section updates cannot be used for approved records.
- **Owner:** Architecture team

### EA-008: Separate Human Skills from AI Capabilities

- **Date:** 2026-06-06
- **Status:** Accepted
- **Decision:** Human competency requirements and AI agent capabilities are modeled separately. AI capabilities cannot satisfy human performer, reviewer, or approver competency requirements.
- **Consequences:** Existing skill registries that combine human and AI concepts require redesign.
- **Owner:** Architecture team

### EA-009: Every Granular Activity Requires Its Own Governance Package

- **Date:** 2026-06-06
- **Status:** Accepted
- **Decision:** Every granular Medical Department activity requires its own business SOP, human skill specification, AI capability definition, controls, workflow, templates, training, user-manual module, and validation package.
- **Consequences:** Generic domain-level SOPs or skills cannot silently govern distinct activities with different purposes, audiences, risks, or outputs.
- **Owner:** Dr. Bhupesh Dewan

### EA-010: Owner-Supplied SOPs and Skills Take Precedence

- **Date:** 2026-06-06
- **Status:** Accepted
- **Decision:** Owner-supplied SOPs and skill specifications are consulted first. ClinCommand may perform gap assessments and propose drafts, but proposed content must be reviewed before implementation or finalization.
- **Consequences:** The platform requires a source-package register and explicit draft-review lifecycle.
- **Owner:** Dr. Bhupesh Dewan

### EA-011: Every Activity Requires Two Real-Output Qualification Runs

- **Date:** 2026-06-06
- **Status:** Accepted
- **Decision:** Before internal architecture approval, every activity must produce and validate at least two representative real outputs.
- **Consequences:** Activity approval requires output artifacts, pass/fail evidence, findings, and documented package revisions rather than specification review alone.
- **Owner:** Dr. Bhupesh Dewan

### EA-012: Complex Activities Use Parallel Specialist Agents

- **Date:** 2026-06-06
- **Status:** Accepted
- **Decision:** Complex activities must use multiple bounded specialist agents in parallel where dependencies permit. Specialist evidence packages are synthesized only after provenance and conflict checks.
- **Consequences:** One general-purpose bot cannot independently research, draft, validate, and approve a complex regulated activity.
- **Owner:** Dr. Bhupesh Dewan

### EA-013: Agents Must Consult Controlled Repository Packages Before Planning

- **Date:** 2026-06-06
- **Status:** Accepted
- **Decision:** Owner-supplied and approved SOPs, skills, controls, and templates are stored in the controlled repository. Agents must resolve, verify, consult, and record these packages before creating an execution plan.
- **Consequences:** Missing or ineffective mandatory packages block planning and execution.
- **Owner:** Dr. Bhupesh Dewan
