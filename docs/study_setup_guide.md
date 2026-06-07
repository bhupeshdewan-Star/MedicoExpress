# ClinCommand OS™ – Study Setup & Site Activation User Guide

This guide details the step-by-step procedure to set up a new clinical trial, manage protocol version amendments, and activate investigator sites within the Clinical Operations Cloud.

---

## 1. Creating a Clinical Study

To register a new study:
1. Navigate to the **Studies Center**.
2. Click **Add Study**.
3. Complete the required field parameters:
   - **Protocol Number:** A unique identifier (e.g. `CC-2026-ONC-001`).
   - **Study Title:** The official scientific title of the trial.
   - **Sponsor:** The life sciences sponsor company.
   - **Phase:** Select `Phase I`, `Phase II`, `Phase III`, or `Phase IV`.
   - **Therapeutic Area:** Select indication focus (e.g. `Oncology`, `Cardiology`).
4. Click **Submit**.

> [!NOTE]
   Newly generated studies default to `PLANNING` status. RLS policies restrict visibility to users mapped to the tenant context under which the study was registered.

---

## 2. Protocol Version Registration & Amendments

Every study must have an active protocol specification detailing objectives, endpoints, and patient eligibility:
1. Inside the study detail panel, click **Manage Protocols**.
2. Upload the initial version details (Version Tag: `1.0`).
3. Complete the scientific criteria blocks:
   - **Objectives:** Primary and secondary objectives.
   - **Endpoints:** Primary evaluation criteria (e.g. Progression-Free Survival).
   - **Inclusion Criteria:** Diagnostic, age, and wellness rules.
   - **Exclusion Criteria:** Pre-existing conditions or prior treatments.

### Amending a Protocol
When clinical amendments are required:
1. Click **Create Protocol Version** inside the study's protocol tab.
2. Provide a new version tag (e.g. `2.0`).
3. Modify the criteria text and provide **Amendment Details** summarizing changes.
4. Click **Register Version**.
5. Utilize the **Version Compare Tool** to view highlighted side-by-side differentials comparing version targets (e.g. Version 1.0 vs 2.0).

---

## 3. Registering Investigators & Site Rosters

Before setting up sites, investigators must be added:
1. Go to the **Sites Center** and select **Manage Investigators**.
2. Click **Create Investigator** and enter First Name, Last Name, Email, and Specialty.
3. Once the investigator profile is active:
   - Select a site.
   - Click **Assign Staff**.
   - Pick the investigator, define their role (`PI` for Principal Investigator, `SUB_I` for Sub-Investigator, or `COORDINATOR`), and submit.

---

## 4. Site Activation Checklist Workflow

To enroll subjects at a site, the site status must transition to `ACTIVE`. This transition is blocked by the **Activation Checklist**:
1. Select the site inside the **Site Management** dashboard.
2. Inspect the **Startup Checklist Progress**:
   - **IRB Approval**
   - **Contract Executed**
   - **Training Completed**
3. Review checklist tasks. Click **Complete Item** next to each requirement as evidence is gathered.
4. The system logs who checked off each item, the timestamp, and checks off completion.
5. Once **all** checklist items are marked complete, click **Activate Site**.
6. The site status transitions to `ACTIVE`, enabling subject screening and visits tracking.
