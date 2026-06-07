# ClinCommand OS™ – Phase 11 Clinical REST API Reference Guide

All clinical endpoints require a valid JWT Access Token passed in the `Authorization` header as `Bearer <token>` and scope queries by the tenant bound to the token session.

---

## 1. Study Portfolio & Protocols

### Fetch Study List
* **Endpoint:** `GET /api/v1/studies`
* **Response Envelope:** `{ success: true, data: Study[] }`

### Create a Study
* **Endpoint:** `POST /api/v1/studies`
* **Request Payload:**
  ```json
  {
    "protocol_number": "CC-2026-ONC-002",
    "title": "Phase III Trial of Remimazolam in GxP Sedation",
    "phase": "Phase III",
    "sponsor": "ClinCommand Labs",
    "therapeutic_area": "Oncology"
  }
  ```
* **Response Envelope:** `{ success: true, data: Study }`

### Update Study Status
* **Endpoint:** `PATCH /api/v1/studies/:id/status`
* **Request Payload:** `{ "status": "ACTIVE" }`
* **Transitions Allowed:** `Draft → Active → On Hold → Completed → Terminated`

### Compare Protocols
* **Endpoint:** `GET /api/v1/studies/:id/protocols/compare?v1=1.0&v2=2.0`
* **Response Envelope:**
  ```json
  {
    "success": true,
    "data": {
      "has_amendment": true,
      "diff": {
        "objectives": "Original: ... | Target: ...",
        "endpoints": "Original: ... | Target: ...",
        "inclusion_criteria": "Original: ... | Target: ...",
        "exclusion_criteria": "Original: ... | Target: ..."
      }
    }
  }
  ```

---

## 2. Investigator Sites Management

### Fetch Sites
* **Endpoint:** `GET /api/v1/sites?study_id=1`
* **Response Envelope:** `{ success: true, data: Site[] }`

### Complete Checklist Requirement
* **Endpoint:** `PATCH /api/v1/sites/checklist/:itemId`
* **Request Payload:** `{ "is_completed": true }`
* **Impact:** Once all checklist items for a site are completed, the site status is permitted to advance to `ACTIVE`.

### Assign Roster
* **Endpoint:** `POST /api/v1/sites/:id/staff`
* **Request Payload:** `{ "investigator_id": 1, "role": "PI" }`

---

## 3. Subjects & Visits Matrix

### Screen Subject
* **Endpoint:** `POST /api/v1/subjects`
* **Request Payload:** `{ "study_id": 1, "site_id": 1, "subject_number": "SUB-101-003" }`

### Transition Status & Enroll
* **Endpoint:** `PATCH /api/v1/subjects/:id/status`
* **Request Payload:** `{ "status": "ENROLLED" }`
* **System Action:** Generates expected visits schedule rows according to the study protocol.

### Complete Visit
* **Endpoint:** `PATCH /api/v1/subjects/visits/:visitId`
* **Request Payload:** `{ "actual_date": "2026-06-03T18:00:00Z" }`

### RTSM Randomization Allocation (STUB)
* **Endpoint:** `POST /api/v1/subjects/randomization`
* **Response Envelope:** Returns `501 Not Implemented`.

---

## 4. Site Monitoring & Findings

### Schedule Monitoring Visit
* **Endpoint:** `POST /api/v1/monitoring`
* **Request Payload:**
  ```json
  {
    "site_id": 1,
    "visit_date": "2026-06-10T09:00:00Z",
    "visit_type": "IMV"
  }
  ```

### Capture Electronic Signature
* **Endpoint:** `POST /api/v1/monitoring/:id/sign`
* **Request Payload:**
  ```json
  {
    "role": "MONITOR",
    "password": "user-login-password",
    "purpose": "I attest to the verification of this site audit log."
  }
  ```
* **Enforcement:** Transitions to `APPROVED` require both `MONITOR` and `PI` roles signatures.

### Resolve Finding
* **Endpoint:** `PATCH /api/v1/monitoring/findings/:findingId/resolve`
* **Request Payload:** `{ "resolution_details": "CAPA-001 executed. Training re-run complete." }`

---

## 5. Electronic TMF (eTMF)

### Fetch Folders Structure
* **Endpoint:** `GET /api/v1/etmf/folders?study_id=1`
* **Response Envelope:** `{ success: true, data: EtmfFolder[] }`

### Register Document Metadata
* **Endpoint:** `POST /api/v1/etmf/documents`
* **Request Payload:**
  ```json
  {
    "study_id": 1,
    "folder_id": 2,
    "title": "Investigator Brochure v4",
    "doc_type": "PROTOCOL",
    "file_size": 204850,
    "file_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
  }
  ```

### Run Completeness Compliance Auditor
* **Endpoint:** `GET /api/v1/etmf/completeness?study_id=1`
* **Response Envelope:**
  ```json
  {
    "success": true,
    "data": [
      {
        "site_id": 1,
        "site_name": "Boston Oncology Research Center",
        "completeness_score": 67,
        "missing_mandatory": ["IRB_APPROVAL"],
        "is_compliant": false
      }
    ]
  }
  ```

---

## 6. Risk-Based Monitoring (RBM)

### RBM Scores Heatmap
* **Endpoint:** `GET /api/v1/rbm/heatmap?study_id=1`
* **Response Envelope:**
  ```json
  {
    "success": true,
    "data": [
      {
        "site_id": 1,
        "site_name": "Boston Oncology Research Center",
        "risk_score": 10,
        "risk_tier": "Low"
      }
    ]
  }
  ```

---

## 7. Clinical Analytics

### Enrollment Forecasting
* **Endpoint:** `GET /api/v1/clinical-analytics?study_id=1`
* **Response Envelope:**
  ```json
  {
    "success": true,
    "data": {
      "forecast": {
        "target_date": "2026-12-31T00:00:00.000Z",
        "projected_completion_date": "2026-09-15T12:00:00.000Z",
        "velocity_per_day": 0.05,
        "is_on_track": true
      },
      "kpis": {
        "enrolled": 3,
        "target": 25,
        "open_findings": 0,
        "etmf_completeness_percent": 100
      }
    }
  }
  ```
