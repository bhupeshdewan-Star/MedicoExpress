# Gate 3 Governance Report — ClinCommand OS™ Statistical Engine
## Document ID: GXP-GOV-003-V1.0
## Date: 2026-06-05

---

### 1. Fallback Policy Governance
The principal safeguard of the biostatistics engine is the **GxP Fallback Policy**:
- **Descriptive Statistics Only**: The native JavaScript engine is strictly permitted to run only basic arithmetic descriptive calculations (mean, median, SD, variance, min, max, count, CV).
- **Service Isolation**: If the Python calculation service becomes unreachable, all advanced inferential, regression, and survival analysis computations are blocked by the gateway. A controlled exception is thrown, preventing corrupted or non-standard calculations from being reported.

---

### 2. Audit Trail Integrity (`STATS_RUN`)
Every calculation request routed through the Node.js gateway generates a database logging record in `biostats_runs` and logs an immutable ledger entry in `audit_trail_logs`:
- **Event Code**: `STATS_RUN`
- **Fields Logged**: User ID, username, user role, action, target run resource, details (with the dataset SHA-256 hash), client IP address, and cryptographic signature chain.
- **Link Check**: The audit record links directly to the computed run, preserving an audit trail of who calculated what and when.

---

### 3. AI Traceability Mapping
When statistical tools are used during AI-assisted workflows (e.g., automated study reports compiled by LLM agents):
- A traceability record is written to the `ai_traceability` table mapping the calculation `run_id` to the model version, chunks used, and output hash.
- This links the clinical findings reported by the AI directly to the raw calculations and datasets, satisfying FDA requirements for algorithm transparency.

---

### 4. Separation of Duties
- **Biostatistician Role**: Regulated advanced runs must be initiated by authorized clinical roles (e.g., Biostatistician).
- **Quality Assurance**: Automated precision audits against GxP reference datasets are conducted by the QA auto-verification script, preventing statistical engine updates from going live without verification.

---

`© Dr. Bhupesh Dewan, Mumbai, India — All Rights Reserved`
