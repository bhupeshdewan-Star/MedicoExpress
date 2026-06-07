# Prompt Registry — ClinCommand OS™
## Document ID: GXP-PR-004-V1.0
## Copyright: © Dr. Bhupesh Dewan, Mumbai, India — All Rights Reserved

This registry defines the versions, ownership, and metadata for all prompt families, integrating with the `prompt_versions` table.

---

### 1. Prompt Registry Matrix

| Prompt ID | Prompt Family | Version | Owner | Reviewer | Effective Date | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **PR-MA-001** | `PromptFamilyMedAffairs` | `1.0.0` | Dr. Bhupesh Dewan | QA Director | 2026-06-05 | `EFFECTIVE` |
| **PR-REG-001** | `PromptFamilyRegulatory` | `1.0.0` | Dr. Bhupesh Dewan | QA Director | 2026-06-05 | `EFFECTIVE` |
| **PR-CLIN-001** | `PromptFamilyClinical` | `1.0.0` | Dr. Bhupesh Dewan | QA Director | 2026-06-05 | `EFFECTIVE` |
| **PR-BIO-001** | `PromptFamilyBiostats` | `1.0.0` | Dr. Bhupesh Dewan | QA Director | 2026-06-05 | `EFFECTIVE` |
| **PR-WR-001** | `PromptFamilyWriting` | `1.0.0` | Dr. Bhupesh Dewan | QA Director | 2026-06-05 | `EFFECTIVE` |
| **PR-PV-001** | `PromptFamilyPV` | `1.0.0` | Dr. Bhupesh Dewan | QA Director | 2026-06-05 | `EFFECTIVE` |
| **PR-HEOR-001** | `PromptFamilyHEOR` | `1.0.0` | Dr. Bhupesh Dewan | QA Director | 2026-06-05 | `EFFECTIVE` |
| **PR-COMM-001** | `PromptFamilyCommercial` | `1.0.0` | Dr. Bhupesh Dewan | QA Director | 2026-06-05 | `EFFECTIVE` |
| **PR-QA-001** | `PromptFamilyQA` | `1.0.0` | Dr. Bhupesh Dewan | QA Director | 2026-06-05 | `EFFECTIVE` |

---

### 2. Database Integration Model

All prompt details map to the `prompt_versions` PostgreSQL schema:
```sql
CREATE TABLE IF NOT EXISTS prompt_versions (
    id SERIAL PRIMARY KEY,
    skill_id INTEGER NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    version VARCHAR(50) NOT NULL,
    system_prompt TEXT NOT NULL,
    user_prompt TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'REVIEW', 'APPROVED', 'EFFECTIVE', 'RETIRED')),
    created_by INTEGER NOT NULL,
    effective_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Governance Lifecycle Flow:
1. **Creation**: Prompts are drafted and entered as `DRAFT` state under the author's user ID.
2. **Review**: QA reviews and transitions status to `REVIEW`.
3. **Approval & Activation**: Upon approval, the status is set to `EFFECTIVE` and `effective_date` timestamp is logged. The active LLM Router only calls prompts tagged `EFFECTIVE` for the respective `skill_id`.

---

`© Dr. Bhupesh Dewan, Mumbai, India — All Rights Reserved`
