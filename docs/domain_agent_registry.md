# Domain Agent Registry — ClinCommand OS™
## Document ID: GXP-DAR-004-V1.0
## Copyright: © Dr. Bhupesh Dewan, Mumbai, India — All Rights Reserved

This registry defines the execution limits and permissions for all 9 domain agents.

---

### 1. Domain Agent Mappings

#### 1.1 Medical Affairs Agent (`AG-MA-001`)
- **Agent Name**: `MedicalAffairsAgent`
- **Domain**: `medical_affairs`
- **Prompt Family**: `PromptFamilyMedAffairs`
- **Allowed Skills**: `SK-MA-001` (Medical Inquiry Response), `SK-MA-002` (KOL Mapping), `SK-MA-003` (Advisory Board Planning).
- **Blocked Skills**: All others (e.g. `SK-BIO-001`, `SK-REG-001`).
- **Knowledge Sources**: PubMed, Advisory Board Archives, KOL Databases.

#### 1.2 Regulatory Agent (`AG-REG-001`)
- **Agent Name**: `RegulatoryAgent`
- **Domain**: `regulatory`
- **Prompt Family**: `PromptFamilyRegulatory`
- **Allowed Skills**: `SK-REG-001` (eCTD Gap Analysis), `SK-REG-002` (Label Comparison), `SK-REG-003` (Authority Query Response).
- **Blocked Skills**: All others.
- **Knowledge Sources**: FDA Guidelines, EMA Guidances, eCTD Module Rules.

#### 1.3 Clinical Agent (`AG-CLIN-001`)
- **Agent Name**: `ClinicalAgent`
- **Domain**: `clinical`
- **Prompt Family**: `PromptFamilyClinical`
- **Allowed Skills**: `SK-CLIN-001` (Protocol Review), `SK-CLIN-002` (Monitoring Plan), `SK-CLIN-003` (Site Feasibility).
- **Blocked Skills**: All others.
- **Knowledge Sources**: Clinical Protocols, ICH GCP Manuals.

#### 1.4 Biostatistics Agent (`AG-BIO-001`)
- **Agent Name**: `BiostatsAgent`
- **Domain**: `biostatistics`
- **Prompt Family**: `PromptFamilyBiostats`
- **Allowed Skills**: `SK-BIO-001` (Welch's T-Test), `SK-BIO-002` (One-Way ANOVA), `SK-BIO-003` (Kaplan-Meier Survival), `SK-BIO-004` (Sample Size Calculation).
- **Blocked Skills**: All others.
- **Knowledge Sources**: CDISC Standards, Statistical Reference Catalogs.

#### 1.5 Medical Writing Agent (`AG-WR-001`)
- **Agent Name**: `MedicalWriterAgent`
- **Domain**: `medical_writing`
- **Prompt Family**: `PromptFamilyWriting`
- **Allowed Skills**: `SK-WR-001` (CSR Writing), `SK-WR-002` (Protocol Authoring), `SK-WR-003` (Manuscript Drafting).
- **Blocked Skills**: All others.
- **Knowledge Sources**: CSR Guidelines, Writing Style Guides.

#### 1.6 Pharmacovigilance Agent (`AG-PV-001`)
- **Agent Name**: `PVAgent`
- **Domain**: `pv`
- **Prompt Family**: `PromptFamilyPV`
- **Allowed Skills**: `SK-PV-001` (SAE Narrative Writer), `SK-PV-002` (Signal Detection).
- **Blocked Skills**: All others.
- **Knowledge Sources**: MedDRA Dictionary, safety database reports.

#### 1.7 HEOR Agent (`AG-HEOR-001`)
- **Agent Name**: `HEORAgent`
- **Domain**: `heor`
- **Prompt Family**: `PromptFamilyHEOR`
- **Allowed Skills**: `SK-HEOR-001` (Budget Impact Model), `SK-HEOR-002` (Cost Effectiveness Analysis).
- **Blocked Skills**: All others.
- **Knowledge Sources**: Pharmacoeconomics guidelines, cost data models.

#### 1.8 Commercial Agent (`AG-COMM-001`)
- **Agent Name**: `CommercialAgent`
- **Domain**: `commercial`
- **Prompt Family**: `PromptFamilyCommercial`
- **Allowed Skills**: `SK-COMM-001` (Product Appraisal), `SK-COMM-002` (Competitor Analysis), `SK-COMM-003` (SWOT Compiler).
- **Blocked Skills**: All others.
- **Knowledge Sources**: Market Access briefs, competitor reports.

#### 1.9 QA Agent (`AG-QA-001`)
- **Agent Name**: `QAAgent`
- **Domain**: `qa`
- **Prompt Family**: `PromptFamilyQA`
- **Allowed Skills**: `SK-QA-001` (CAPA Management), `SK-QA-002` (Deviation Investigation), `SK-QA-003` (Audit Preparation).
- **Blocked Skills**: All others.
- **Knowledge Sources**: ALCOA+ standards, GAMP 5 manuals.

---

### 2. Execution Validation Rules

To prevent cross-domain skill invocation:
1. **Gateway Inception Check**: When a request lands at the API gateway, it extracts the target `SKILL_ID` and the active `domain`.
2. **Registry Match**: It checks this registry to ensure that `SKILL_ID` exists in the `Allowed Skills` list for the agent assigned to the `domain`.
3. **Execution Block**: If a user in the `clinical` workbench attempts to call a skill assigned to `medical_affairs` (e.g. `SK-MA-001`), the gateway rejects the request with code `403 Forbidden` and exception details:
   `"GxP Policy Violation: Cross-domain skill execution blocked. Skill is not allowed in this workbench."`

---

`© Dr. Bhupesh Dewan, Mumbai, India — All Rights Reserved`
