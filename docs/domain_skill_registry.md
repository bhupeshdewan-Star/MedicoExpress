# Domain Skill Registry — ClinCommand OS™
## Document ID: GXP-DSR-004-V1.0
## Copyright: © Dr. Bhupesh Dewan, Mumbai, India — All Rights Reserved

This registry defines the mappings of standardized clinical skills to their governing GxP components.

---

### 1. Skill Mapping Matrix

| Skill ID | Skill Name | Domain | SOP Mapped | Template Mapped | Prompt Family | Function Mapped |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **SK-MA-001** | Medical Inquiry Response | `medical_affairs` | `SOP-MA-001` | `TEMPLATE_MA_SCI_RESP` | `PromptFamilyMedAffairs` | `FUNC_MA_INQ` |
| **SK-MA-002** | KOL Mapping | `medical_affairs` | `SOP-MA-002` | `TEMPLATE_MA_KOL_MAP` | `PromptFamilyMedAffairs` | `FUNC_MA_KOL` |
| **SK-MA-003** | Advisory Board Planning | `medical_affairs` | `SOP-MA-002` | `TEMPLATE_MA_SCI_RESP` | `PromptFamilyMedAffairs` | `FUNC_MA_ADV` |
| **SK-REG-001** | eCTD Gap Analysis | `regulatory` | `SOP-REG-001` | `TEMPLATE_REG_SUB_MAT` | `PromptFamilyRegulatory` | `FUNC_REG_GAP` |
| **SK-REG-002** | Label Comparison | `regulatory` | `SOP-REG-002` | `TEMPLATE_REG_LBL_COMP` | `PromptFamilyRegulatory` | `FUNC_REG_LBL` |
| **SK-REG-003** | Authority Query Response | `regulatory` | `SOP-REG-003` | `TEMPLATE_REG_LBL_COMP` | `PromptFamilyRegulatory` | `FUNC_REG_QRY` |
| **SK-CLIN-001** | Protocol Review | `clinical` | `SOP-CLIN-001` | `TEMPLATE_CLIN_MON_ASS` | `PromptFamilyClinical` | `FUNC_CLIN_REV` |
| **SK-CLIN-002** | Monitoring Plan | `clinical` | `SOP-CLIN-002` | `TEMPLATE_CLIN_MON_ASS` | `PromptFamilyClinical` | `FUNC_CLIN_PLN` |
| **SK-CLIN-003** | Site Feasibility | `clinical` | `SOP-CLIN-003` | `TEMPLATE_CLIN_MON_ASS` | `PromptFamilyClinical` | `FUNC_CLIN_FEA` |
| **SK-BIO-001** | Welch's T-Test | `biostatistics` | `SOP-STAT-001` | `TEMPLATE_STAT_SAR` | `PromptFamilyBiostats` | `FUNC_BIO_TTEST` |
| **SK-BIO-002** | One-Way ANOVA | `biostatistics` | `SOP-STAT-001` | `TEMPLATE_STAT_SAR` | `PromptFamilyBiostats` | `FUNC_BIO_ANOVA` |
| **SK-BIO-003** | Kaplan-Meier Survival | `biostatistics` | `SOP-STAT-002` | `TEMPLATE_STAT_SAR` | `PromptFamilyBiostats` | `FUNC_BIO_KM` |
| **SK-BIO-004** | Sample Size Calculation | `biostatistics` | `SOP-STAT-003` | `TEMPLATE_STAT_SAR` | `PromptFamilyBiostats` | `FUNC_BIO_SIZE` |
| **SK-WR-001** | CSR Writing | `medical_writing` | `SOP-WR-001` | `TEMPLATE_WR_CSR` | `PromptFamilyWriting` | `FUNC_WR_CSR` |
| **SK-WR-002** | Protocol Authoring | `medical_writing` | `SOP-WR-002` | `TEMPLATE_WR_CSR` | `PromptFamilyWriting` | `FUNC_WR_PRO` |
| **SK-WR-003** | Manuscript Drafting | `medical_writing` | `SOP-WR-002` | `TEMPLATE_WR_CSR` | `PromptFamilyWriting` | `FUNC_WR_MSS` |
| **SK-PV-001** | SAE Narrative | `pv` | `SOP-PV-002` | `TEMPLATE_PV_SAF_NAR` | `PromptFamilyPV` | `FUNC_PV_SAE` |
| **SK-PV-002** | Signal Detection | `pv` | `SOP-PV-001` | `TEMPLATE_PV_SAF_NAR` | `PromptFamilyPV` | `FUNC_PV_SIG` |
| **SK-HEOR-001** | Budget Impact Model | `heor` | `SOP-HEOR-001` | `TEMPLATE_HEOR_ASS` | `PromptFamilyHEOR` | `FUNC_HEOR_BIM` |
| **SK-HEOR-002** | Cost Effectiveness Analysis | `heor` | `SOP-HEOR-001` | `TEMPLATE_HEOR_ASS` | `PromptFamilyHEOR` | `FUNC_HEOR_CEA` |
| **SK-COMM-001** | Product Appraisal | `commercial` | `SOP-COMM-001` | `TEMPLATE_COMM_APP` | `PromptFamilyCommercial` | `FUNC_COMM_APP` |
| **SK-COMM-002** | Competitor Analysis | `commercial` | `SOP-COMM-002` | `TEMPLATE_COMM_APP` | `PromptFamilyCommercial` | `FUNC_COMM_CMP` |
| **SK-COMM-003** | SWOT Analysis | `commercial` | `SOP-COMM-001` | `TEMPLATE_COMM_APP` | `PromptFamilyCommercial` | `FUNC_COMM_SWT` |
| **SK-QA-001** | CAPA | `qa` | `SOP-QA-002` | `TEMPLATE_QA_AUD_REP` | `PromptFamilyQA` | `FUNC_QA_CAPA` |
| **SK-QA-002** | Deviation Investigation | `qa` | `SOP-QA-001` | `TEMPLATE_QA_AUD_REP` | `PromptFamilyQA` | `FUNC_QA_DEV` |
| **SK-QA-003** | Audit Preparation | `qa` | `SOP-QA-002` | `TEMPLATE_QA_AUD_REP` | `PromptFamilyQA` | `FUNC_QA_PREP` |

---

`© Dr. Bhupesh Dewan, Mumbai, India — All Rights Reserved`
