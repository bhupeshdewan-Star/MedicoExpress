# ClinCommand OS™ Domain Isolation Report — Gate 4.2
## Document ID: GXP-DIR-004-V1.0
## Status: APPROVED
## Date: 2026-06-05
## Copyright: © Dr. Bhupesh Dewan, Mumbai, India — All Rights Reserved

---

### 1. Executive Summary

This report documents the design and code-level mechanisms implemented to guarantee domain isolation in ClinCommand OS™. It verifies that cross-domain skill invocations (e.g. Medical Affairs executing PV skills, or Regulatory executing Biostatistics skills) are blocked at the gateway, execution, and workflow engine levels.

### 2. Code-Level Enforcement Architecture

Domain isolation is enforced at three sequential code barriers:

#### 2.1 Gateway Validation (`server.js`)
When a request is posted to `/api/skills/:id/execute`, the server:
1. Extracts the target `skillId` from the route params.
2. Extracts the active `domain` from the header `x-active-domain` or body.
3. Queries `skill_function_matrix` to verify if the target `skill_id` is mapped to that `domain`.
4. If the skill is not mapped to the domain, it aborts execution immediately:
   ```javascript
   res.status(403).json({
     error: "GxP Policy Violation: Cross-domain skill execution blocked. Skill is not allowed in this workbench."
   });
   ```

#### 2.2 Skill Engine Check (`skill_engine.js`)
Inside `executeSkill`, a second layer check runs before prompting the LLM:
* The engine queries the skill's registered domain in the database.
* It compares it against the executing `options.domain` or active user workbench session.
* If a mismatch is detected (e.g. execution of a HEOR skill in a QA workbench session), it throws a hard validation exception.

#### 2.3 Workflow Authorization (`approval_workflow_engine.js`)
Workflows are routed based on role-to-department mappings. The workflow engine verifies that:
* Task assignments (`workflow_tasks`) are matched only to roles active in the target domain.
* Commercial users cannot view or approve QA or deviation investigation workflows.
* Every transition is verified against the RBAC permissions table.

### 3. Isolation Matrix Verification

The following cross-domain scenarios are blocked:

* **Medical Affairs ➔ PV**: Attempts to trigger `SK-PV-001` (SAE Narrative) from the Medical Affairs workbench are blocked.
* **Regulatory ➔ Biostatistics**: Attempts to trigger `SK-BIO-001` (T-Test) from the Regulatory Affairs workbench are blocked.
* **Commercial ➔ QA**: Attempts to review CAPA or deviation logs (`SOP-QA-001`) from the Commercial workbench are blocked.

This domain isolation is verified by automated UAT assertions checking that invalid invocations throw a `403 Forbidden` response.

---

`© Dr. Bhupesh Dewan, Mumbai, India — All Rights Reserved`
