# ClinCommand OS™ GxP RBAC Permissions Matrix

This document defines the View, Execute, Approve, and Admin permissions across the 9 system roles.

---

### Permissions Matrix Grid

| Role | View Rights | Execute Rights | Approve Rights | Admin Rights | GxP Separation Check |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`Administrator`** | All screens | None | None | System Settings | Cannot run clinical tasks |
| **`Medical Affairs`**| Medical workbench | Medical skills | None | None | No approval rights |
| **`Regulatory`** | Regulatory workbench | Regulatory skills | None | None | No approval rights |
| **`Clinical Operations`**| Clinical workbench | Clinical skills | None | None | No approval rights |
| **`Biostatistics`** | Biostats workbench | Stats calculations | None | None | No approval rights |
| **`Medical Writing`**| Writing workbench | Writing skills | None | None | No approval rights |
| **`QA`** | All screens, audits | QA skills, validations | SOP definitions | None | Independent audit review |
| **`Reviewer`** | All workbenches | Comments | Sign-off (Reviewer) | None | Cannot edit base files |
| **`Approver`** | All workbenches | None | Sign-off (Approver) | None | Independent approval |

---

`© Dr. Bhupesh Dewan, Mumbai, India — All Rights Reserved`
