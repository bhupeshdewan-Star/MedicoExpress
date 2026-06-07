# Knowledge Asset Registry — ClinCommand OS™
## Document ID: GXP-KAR-004-V1.0
## Copyright: © Dr. Bhupesh Dewan, Mumbai, India — All Rights Reserved

This registry defines the metadata, lifecycle statuses, and integrity checksums for all clinical and regulatory knowledge assets.

---

### 1. Knowledge Asset Mappings

| Asset ID | Title / Knowledge Source | Owner | Reviewer | Effective Date | Review Date | Status | Checksum (SHA-256) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **KA-MA-001** | Advisory Board Planning SOP Reference | Medical Affairs | QA Lead | 2026-06-01 | 2027-06-01 | `APPROVED` | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` |
| **KA-REG-001** | FDA eCTD Submission Guideline v1.2 | Regulatory | QA Lead | 2026-06-01 | 2027-06-01 | `APPROVED` | `a5f8b9e2f4c6e9a8b7d6c5e4f3a2b1c0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4` |
| **KA-CLIN-001** | ICH GCP E6(R2) Operational Manual | Clinical | QA Lead | 2026-06-01 | 2027-06-01 | `APPROVED` | `f8b9e2f4c6e9a8b7d6c5e4f3a2b1c0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4a5` |
| **KA-BIO-001** | CDISC SDTM Statistical Formatting Guide | Biostatistics | QA Lead | 2026-06-01 | 2027-06-01 | `APPROVED` | `b9e2f4c6e9a8b7d6c5e4f3a2b1c0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4a5f8` |
| **KA-WR-001** | CSR Structural Guidelines v2.0 | Medical Writing | QA Lead | 2026-06-01 | 2027-06-01 | `APPROVED` | `e2f4c6e9a8b7d6c5e4f3a2b1c0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4a5f8b9` |
| **KA-PV-001** | CIOMS I Adverse Event Narrative Guide | PV | QA Lead | 2026-06-01 | 2027-06-01 | `APPROVED` | `4c6e9a8b7d6c5e4f3a2b1c0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4a5f8b9e2f` |
| **KA-HEOR-001** | ISPOR Guidelines for Cost Models | HEOR | QA Lead | 2026-06-01 | 2027-06-01 | `APPROVED` | `6e9a8b7d6c5e4f3a2b1c0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4a5f8b9e2f4c` |
| **KA-COMM-001** | SWOT Appraisal Matrix Template Guide | Commercial | QA Lead | 2026-06-01 | 2027-06-01 | `APPROVED` | `9a8b7d6c5e4f3a2b1c0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4a5f8b9e2f4c6e` |
| **KA-QA-001** | FDA 21 CFR Part 11 Compliance Manual | QA | QA Lead | 2026-06-01 | 2027-06-01 | `APPROVED` | `8b7d6c5e4f3a2b1c0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4a5f8b9e2f4c6e9a` |

---

### 2. Knowledge Governance Control
All assets are audited against `knowledge_governance.js` checks during RAG vector indexing:
1. **Status check**: Only assets in `APPROVED` status are eligible for prompt context injection.
2. **Review date check**: If the `review_date` is in the past, the system automatically flags the asset as `EXPIRED` and excludes it from retrieval pipelines.
3. **Checksum verification**: The system re-computes the file hash and flags an alert if a discrepancy against the registry hash is found.

---

`© Dr. Bhupesh Dewan, Mumbai, India — All Rights Reserved`
