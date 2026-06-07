# MedicoExpress: Architecture Assessment & Implementation Plan
## Executive Summary

**Date:** June 7, 2026  
**Assessment Scope:** Evaluate ClinCommand OS architecture framework for MedicoExpress Medical Affairs Digital Command Center  
**Conclusion:** The framework is **highly appropriate** for an enterprise pharmaceutical app. MedicoExpress has solid microservice infrastructure but **critically lacks** the SOP/skill-driven orchestration layer needed for compliant, auditable multi-agent workflows.

---

## 1. ARCHITECTURE ALIGNMENT ASSESSMENT

**Current State:**
- MedicoExpress has production-grade microservices (api-core, biostats-service, storage, mobile-epro, web, logs)
- Docker + GCP + CI/CD pipelines in place
- ADRs documented for architectural decisions
- **Gap:** No SOP management, skill catalog, compliance gates, or subagent orchestration

**ClinCommand OS Blueprint Alignment: 75% Infrastructure, 0% Orchestration**

MedicoExpress is strong on the data and API layer but missing the governance layer. To reach 100% alignment, you need:

1. **Domain Activity Inventory** (200+ workflows: 50 Medico-Marketing, 50 Regulatory, 110+ Clinical Research)
2. **Subagent Orchestration Engine** (7 specialist roles, workflow state machine, decision logging)
3. **SOP Management Service** (version control, approval gates, source binding, audit trail)
4. **Skill Registry** (147+ pharma/biostat/regulatory skills, training framework, execution engine)
5. **Quality Gates Service** (10 compliance checks: on-label, substantiation, fair-balance, etc.)
6. **Compliance & Audit Framework** (immutable logs, regulatory-ready trails, escalation routing)

---

## 2. CRITICAL GAPS

| Gap | Impact | Priority | Effort |
|-----|--------|----------|--------|
| **SOP Management Service** | No version-controlled, approved procedures → compliance risk | CRITICAL | 70 PD |
| **Skill Catalog & Registry** | No machine-readable expertise → agents improvise | CRITICAL | 80 PD |
| **Orchestration Engine** | No workflow coordinator; no role-based dispatch | CRITICAL | 160 PD |
| **Source Authority Framework** | No approved sources → regulatory exposure | CRITICAL | 50 PD |
| **Quality Gate Validation** | No automated compliance checks | HIGH | 90 PD |
| **Audit Trail Service** | No decision tracking → audit failures | HIGH | 70 PD |
| **Compliance Rule Engine** | UCPMP/ABPI/FDA rules not encoded | HIGH | 60 PD |
| **Memory & Learning Loop** | No agent improvement mechanism | MEDIUM | 50 PD |

**Total Effort:** ~580 person-days of new development across 7 microservices

---

## 3. PROPOSED ARCHITECTURE

### 3.1 SOP Management Service
**Purpose:** Version-controlled, auditable source of truth for how agents perform regulated tasks

**Structure:**
- Markdown-based SOPs stored in Git (audit-friendly)
- MongoDB metadata index for fast discovery
- Semantic versioning (major = regulatory change, minor = improvement, patch = typo)
- Mandatory approval gate (domain lead + compliance officer)
- 200+ SOPs across 3 domains

**Example SOP Metadata:**
```json
{
  "sop_id": "MED_MARK_001",
  "version": "1.2.0",
  "domain": "MedicoMarketing",
  "task_type": "product-launch-campaign-brief",
  "linked_skills": ["pharma:product-appraisal", "pharma:hcp-monograph"],
  "approval_status": "approved",
  "quality_gates": [
    "content-completeness",
    "source-traceability",
    "compliance-check",
    "on-label-check"
  ]
}
```

### 3.2 Skill Registry
**Purpose:** Reusable, LLM-executable pharma/biostat/regulatory expertise

**Structure:**
- 147+ skills across 3 domains
- Each skill is a Markdown file with YAML frontmatter
- Catalog index (JSON) for discovery and training tracking
- Declares prerequisites, execution model (sync/async), quality gates
- Includes 3 reference skills from your Downloads (product appraisal, HCP monograph, training manual)

**Skill Inventory Breakdown:**
- Pharma: 45 skills (product appraisal, monograph, compliance checks, content creation)
- Regulatory: 52 skills (dossier assembly, pathway mapping, safety tracking, correspondence)
- Biostat: 50+ skills (endpoint analysis, statistical calculations, trial analytics)

### 3.3 Subagent Orchestration Engine
**Purpose:** Coordinate 7 specialist roles across 3 domains in standardized workflows

**The 7 Roles:**
1. **Planner** → Intake, task decomposition, SOP selection, skill identification
2. **Source Resolver** → Data fetching, source hierarchy validation, fallback handling
3. **Builder** → Artifact generation, skill invocation, progress tracking
4. **QA** → Output validation, structure checks, completeness verification
5. **Compliance** → Regulatory review, policy enforcement, risk flagging
6. **Verifier** → Final approval, artifact release, authority logging
7. **Memory** → Learning capture, SOP/skill improvement recommendations

**Operating Standard (6-Phase Workflow):**
```
1. INTAKE          → Planner maps task to SOP, verifies prerequisites
2. SOURCE RES.     → Fetch data from approved hierarchy
3. ROLE SEPARATION → Dispatch work to Builder, QA, Compliance
4. TWO-PASS DEL.   → Draft artifact → Validate → Rework until passing
5. VALIDATION      → Run all quality gates; gate failures trigger escalation
6. LEARNING LOOP   → Memory captures decisions, recommends improvements
```

### 3.4 Quality Gates (10 Compliance Checkpoints)
**Mandatory gates before artifact release:**

1. **Content Completeness** → All required sections present with minimum word counts
2. **Source Traceability** → Every claim traceable to approved source with full citation
3. **Structure Validation** → JSONSchema/MarkdownSchema compliance
4. **Artifact Integrity** → Checksum, encoding, round-trip serialization tests
5. **Compliance Check** → UCPMP 2024, ABPI 2024, FDA guidance rules
6. **On-Label Verification** → Claims within approved indication, dosage, population
7. **Substantiation Check** → Efficacy/safety claims backed by published evidence
8. **Fair-Balance Check** → Benefits and risks discussed proportionally
9. **Promotional-Risk Check** → Language not misleadingly emphatic
10. **Audit Integrity** → Approval chain complete, no policy violations

**Critical Design:** Compliance role has **veto power**. Artifacts cannot progress to Verifier if Compliance rejects them.

---

## 4. IMPLEMENTATION ROADMAP

### Phase Breakdown (12 phases, 90 weeks, ~36 FTE)

| Phase | Duration | Focus | FTE | Deliverable |
|-------|----------|-------|-----|-------------|
| 1 | Wks 1-4 | Strategy & Alignment | 2.5 | ADRs, domain inventory, stakeholder sign-off |
| 2 | Wks 5-8 | Data Models | 2 | MongoDB schemas, version control |
| 3 | Wks 9-12 | API Contracts | 2.5 | OpenAPI specs, RBAC, logging standards |
| 4 | Wks 13-20 | SOP Management | 3 | CRUD, versioning, approval workflow, 200+ SOPs |
| 5 | Wks 21-28 | Skill Registry | 3.5 | Catalog, training, skill execution, 147+ skills |
| 6 | Wks 29-36 | Quality Gates | 3.5 | 10 gate implementations, compliance rules |
| 7 | Wks 37-44 | Orchestration Foundation | 3.5 | Task intake, subagent factory, state machine |
| 8 | Wks 45-52 | Role Behaviors | 4.5 | 7 specialist roles fully implemented |
| 9 | Wks 53-60 | Integration & Two-Pass | 3 | Event bus, end-to-end workflows, performance |
| 10 | Wks 61-68 | Compliance & Audit | 3.5 | Rule engines, audit trail, export |
| 11 | Wks 69-76 | UI/UX & Dashboards | 2.5 | Admin portal, user dashboards, audit views |
| 12 | Wks 77-90 | Training & Go-Live | 2 | User training, pilot, optimization |

**Parallelization Opportunities:**
- Phases 2 & 3 can overlap (2 weeks)
- Phases 4, 5, 6 can overlap (2-week intervals)
- Phases 10 & 11 can overlap (3-4 weeks)

**Compressed Timeline:** ~60 weeks with parallel phases + 50+ FTE team

---

## 5. KEY DECISIONS REQUIRING STAKEHOLDER SIGN-OFF

Before Phase 1 begins, secure explicit approval on these 10 decisions:

### A. SOP Storage Strategy
**Choice:** Markdown in Git (audit-friendly) + MongoDB index (fast discovery) vs. pure JSON in MongoDB

**Recommendation:** Hybrid (Git + MongoDB)
- Git provides full audit trail, human-readable diffs
- MongoDB index enables fast queries for agent discovery
- **Sign-off Required:** Compliance Officer, DevOps Lead

### B. Skill Execution Model
**Choice:** Synchronous in-process vs. asynchronous queue

**Recommendation:** Tiered (fast skills in-process, long-running async)
- Each skill declares `execution_model: "sync" | "async"`
- Builder handles both transparently
- **Sign-off Required:** Architects, Product Lead

### C. Quality Gate Ordering
**Choice:** Run gates in parallel (fast) vs. sequential (deterministic)

**Recommendation:** Hybrid (fast gates first, then expensive gates in parallel)
- Structure/integrity gates run first sequentially
- Compliance/traceability gates run in parallel if fast gates pass
- Max time: ~45 seconds
- **Sign-off Required:** Architects, QA Lead

### D. Compliance Role Authority
**Choice:** Compliance has veto power vs. advisory-only

**Recommendation:** **Veto power with escalation path**
- Compliance failure = artifact cannot progress
- Escalation to human compliance officer for novel issues
- All veto decisions logged for audit
- **Sign-off Required:** Compliance Officer, VP Medical Affairs

### E. Source Authority Enforcement
**Choice:** Prevent bad sources at generation time vs. catch at gate time

**Recommendation:** Two-phase
1. Builder preferentially uses approved sources (Source Resolver provides)
2. Gate catches unapproved cites, flags for refactor
3. Escalate if no approved alternative exists
- **Sign-off Required:** Compliance, Medical Affairs

### F. Escalation Workflows
**Choice:** Flat vs. hierarchical escalation for gate failures

**Recommendation:** Role-based routing (route to expertise that can fix issue)
- Off-label → Compliance Officer + Medical Officer (parallel)
- Unsubstantiated claim → Source Resolver (find evidence)
- Fair-balance issue → Medical Writer + Compliance (collaborate)
- 24h SLA for simple rework, 2-day for novel
- **Sign-off Required:** Compliance, Operations

### G. Domain Scope (200+ SOPs)
**Choice:** Which therapeutic areas to launch with; how to divide 200 SOPs

**Recommendation:** Initial 3-domain split (Medico-Marketing 50, Regulatory 50, Clinical Research 110+)
- Then add therapeutic area breakdown (Oncology, Cardiology, Immunology, etc.)
- **Sign-off Required:** VP Medical Affairs, VP Regulatory, VP Clinical Dev

### H. Subagent Scale
**Choice:** Single central orchestrator vs. federated domain-specific agents

**Recommendation:** Single orchestrator with domain-specialized role behavior
- Unified task routing, easy cross-domain coordination
- Domain knowledge encoded in role behavior trees and skill selection
- **Sign-off Required:** Architects, Domain Leads

### I. Two-Pass Iteration Limits
**Choice:** Unlimited rework cycles vs. hard limit (e.g., 3 cycles)

**Recommendation:** Tiered escalation
- Cycles 1-2: Automatic rework by Builder
- Cycle 3: Human builder guidance
- Cycle 4+: Escalate to domain expert
- Max time: 24 hours before forced escalation
- **Sign-off Required:** Operations, QA Lead

### J. Learning Loop Frequency
**Choice:** Daily vs. weekly vs. monthly vs. quarterly updates

**Recommendation:** Multi-tiered
- Daily: Automated anomaly detection (spike in gate failures)
- Weekly: Trend analysis (common rework reasons)
- Monthly: SOP effectiveness review (avg task completion time)
- Quarterly: Formal revision cycle (propose → pilot → deploy)
- **Sign-off Required:** Medical Affairs, Process Improvement Lead

---

## 6. CRITICAL FILES TO CREATE

### New Microservices (7):
1. `/services/sop-management/` — SOP CRUD, versioning, approval
2. `/services/skill-management/` — Skill registry, catalog, training
3. `/services/orchestration-engine/` — Task intake, subagent dispatch, workflow state
4. `/services/quality-gates/` — 10 compliance validators, audit logging
5. `/services/compliance-engine/` — UCPMP/ABPI/FDA rule engine
6. `/services/audit-trail/` — Immutable decision logging, export
7. `/services/memory-service/` — Learning capture, SOP improvement recommendations

### Critical Configuration Files:
1. `/docs/domain-inventory/DOMAIN_ACTIVITIES.json` — All 200+ SOPs with metadata
2. `/data/skill-registry/catalog.json` — All 147+ skills with cross-references
3. `/config/compliance-rules/` — UCPMP 2024, ABPI 2024, FDA rules (YAML/JSON)
4. `/docs/architecture/OPERATING_STANDARD.md` — Formal 6-phase workflow spec
5. `/docs/governance/ESCALATION_ROUTES.json` — Routing logic for gate failures

---

## 7. EFFORT & BUDGET ESTIMATE

**Development Effort:**
- 12 phases, 90 weeks, ~36 FTE = **1,440 person-days**
- Parallelized timeline: ~60 weeks with 50+ person team

**Breakdown by Service:**
- Orchestration Engine: 160 person-days (most complex, workflow state, subagents)
- Quality Gates: 90 person-days (10 compliance checks, NLP, audit)
- SOP Management: 70 person-days (CRUD, versioning, approval)
- Skill Registry: 80 person-days (catalog, training, execution)
- Compliance Framework: 60 person-days (UCPMP/ABPI/FDA rules)
- Integration & Testing: 100 person-days (end-to-end, performance, stress)
- UI/UX: 70 person-days (dashboards, portals, audit views)
- Training & Go-Live: 60 person-days (pilot, documentation, ops)
- Data & Infrastructure: 50 person-days (MongoDB, event bus, logging)

**Cost (at $150/hour blended rate):**
- **Total:** ~$432,000 (1,440 PD × 8 hours/day × $150/hour)
- **Compressed (60 weeks):** $432,000 (same cost, faster delivery)

**ROI:** Ability to generate compliant, auditable medical content at scale; reduce regulatory risk; cut manual compliance review by 60-80%

---

## 8. RECOMMENDED NEXT STEPS

### Immediate (This Week):
1. **Review this assessment** with your team
2. **Validate the 10 key decisions** — provide feedback on recommendations
3. **Confirm domain scope** — therapeutic areas, therapeutic area priorities
4. **Identify SMEs** — who will write SOPs and define skills per domain

### Week 2-4 (Phase 1: Foundation):
1. Create formal Architecture Decision Records (ADRs)
2. Build domain activity inventory (200+ SOPs with metadata)
3. Generate stakeholder alignment document
4. Schedule Phase 1 kick-off meeting

### Week 5+ (Phase 2+: Development):
1. Begin data model design (MongoDB schemas)
2. Recruit development team (36 FTE commitment)
3. Set up CI/CD pipelines for new microservices
4. Begin SOP seeding (load 200+ SOPs into initial registry)

---

## 9. RISKS & MITIGATIONS

| Risk | Mitigation |
|------|-----------|
| **Scope creep** (200+ SOPs is massive) | Deliver in waves; start with top 50 high-impact SOPs; expand quarterly |
| **Compliance gate failures** delay release | Escalation SLA (24h for simple, 2-day for complex); human loop clear |
| **Integration complexity** (7 new services) | Event-driven architecture; clear API contracts; extensive integration testing |
| **Agent reliability** (subagents make errors) | Two-pass delivery; mandatory QA + Compliance gates; audit trail enables fixing |
| **Regulatory approval** (UCPMP/ABPI rules complex) | Engage legal/regulatory SMEs in Phase 1; rule engine tested with known cases |
| **Performance** (gate validation slow) | Parallel gate execution; caching; indexing strategy; load testing in Phase 9 |

---

## 10. SUCCESS METRICS

### Phase 1-6 (Infrastructure):
- All 7 microservices deployed and tested
- 200+ SOPs loaded with metadata
- 147+ skills cataloged and cross-indexed
- All 10 quality gates implemented and validated

### Phase 7-9 (Orchestration):
- End-to-end workflow (intake → release) latency < 5 minutes
- Two-pass delivery success rate > 85% (first pass + rework)
- Concurrent task throughput ≥ 10 tasks/minute
- Decision audit trail 100% complete (no missing logs)

### Phase 10-12 (Production):
- Artifact compliance gate pass rate > 95%
- Mean time to resolution (gate failure → fixed artifact) < 24 hours
- User adoption in pilot > 80%
- Regulatory audit findings ≤ 1 per quarter
- SOP/skill improvement cycle cadence monthly

---

## CONCLUSION

The ClinCommand OS architecture is **exactly right for MedicoExpress**. It transforms your app from a data pipeline into a **compliant multi-agent system** where:

✅ Every task is mapped to an SOP (no improvisation)  
✅ Every artifact passes compliance gates (regulatory-ready)  
✅ Every decision is logged (audit-proof)  
✅ Every agent is trained on skills (expert-grade outputs)  

**To proceed, you need to:**
1. Approve the 10 key decisions (or propose alternatives)
2. Commit 36 FTE for 60-90 weeks
3. Identify domain SMEs to build SOPs and skills
4. Engage compliance/legal for rule engine validation

Once decisions are locked, Phase 1 begins immediately. We recommend starting with Phase 1-3 in parallel while recruiting the full development team.

**Ready to proceed?** Schedule a decision-validation meeting to lock in architecture choices.
