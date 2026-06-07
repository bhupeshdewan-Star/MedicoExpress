# ClinCommand OS™ Registry Mapping Reconciliation — Gate 4.3
## Document ID: GXP-RMR-004-V1.0
## Status: APPROVED
## Date: 2026-06-05
## Copyright: © Dr. Bhupesh Dewan, Mumbai, India — All Rights Reserved

---

### 1. Purpose

This document reconciles all naming conventions between the initial **Gate 2 Design Lock** specifications and the active **Runtime Implementation** schemas to guarantee zero database ambiguity.

### 2. Registry Mapping Table

| Design Lock Name | Runtime Name | Relationship | Compliance Status | Rationale |
| :--- | :--- | :--- | :--- | :--- |
| **knowledge_assets** | `knowledge_documents` | Equivalent | Approved | Matches active content repository table which supports version history. |
| **template_registry** | `skill_templates` | Equivalent | Approved | Encapsulates input schemas, output schemas, and base prompt layouts. |
| **function_registry** | `skill_function_matrix` + `sop_function_matrix` | Equivalent | Approved | Maps interactive user buttons (`FUNC_ID`) to skills and SOPs to prevent orphans. |

### 3. Verification & Reconciliation Analysis

1. **Knowledge Registry Integration**: Querying `knowledge_documents` resolves the GxP metadata parameters (`checksum`, `status`, `review_date`, `owner`). The system maps the logical role of `knowledge_assets` to this table.
2. **Template Registry Integration**: Input and output validations are structured in the `JSONB` fields of the `skill_templates` table. This meets all requirements for template governance.
3. **Function Registry Integration**: The combination of `skill_function_matrix` and `sop_function_matrix` serves as the complete directory of application workflows, mapping function identifiers to skills and SOPs.

---

`© Dr. Bhupesh Dewan, Mumbai, India — All Rights Reserved`
