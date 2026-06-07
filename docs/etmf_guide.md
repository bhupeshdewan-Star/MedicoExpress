# ClinCommand OS™ – Electronic Trial Master File (eTMF) User Guide

This guide explains how to navigate the DIA-inspired folder structures, register trial documents with SHA-256 integrity protection, and run automated completeness check audits.

---

## 1. eTMF DIA Reference Folder Model

ClinCommand OS automatically initializes folder structures structured after the DIA Reference Model when a study is created:

* **01. Trial Level:** Binders holding global files (Core Protocol, Global Informed Consent Forms, FDA Form 1572 templates, core investigator brochures).
* **02. Country Level:** Binders for country-specific files (Regional regulatory approvals, translational ICFs, local health authority approvals).
* **03. Site Level:** Binders scoped to specific clinics (Local IRB approval, signed PI CVs, delegation logs, executed contracts).

Use the collapsible tree structure in the **eTMF Center** page to navigate folders.

---

## 2. Registering Documents & Integrity Hashes

As specified by the architecture design, physical documents are stored in a mock local directory for local sandboxes, while the database records key metadata:
1. Select the destination folder (e.g. *03. Site Level → Boston Oncology Center*).
2. Click **Upload Document**.
3. Fill out the metadata panel:
   - **Document Title:** e.g. `Boston IRB Approval Letter v1.0`
   - **Document Type:** Select `PROTOCOL`, `ICF`, `IRB_APPROVAL`, `CV`, or `OTHER`.
   - **File Size:** File size in bytes.
   - **SHA-256 File Hash:** The unique hash of the file.
4. Click **Register File**.

> [!IMPORTANT]
   The system registers the document in `DRAFT` status. The record carries an immutable cryptographic timestamp and hash. If the file content is modified, the hash verification check flags an integrity warning.

---

## 3. Completeness Auditor & Compliance Alerts

The eTMF Compliance Engine audits site compliance by verifying that required artifacts are uploaded:
1. Select the study inside the **eTMF Center**.
2. Click **Run Completeness Check**.
3. The engine evaluates every active site against mandatory requirements:
   - **Protocol**
   - **Informed Consent Form (ICF)**
   - **IRB Approval**
4. Review the results scorecard:
   - **Completeness Score:** Percentage of required files present.
   - **Missing Documents:** Bulleted list highlighting missing mandatory folders.
   - **Alerts:** Any site lacking one or more of these files is flagged with a red **Compliance Alert**, signifying non-inspection readiness.
