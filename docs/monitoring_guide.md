# ClinCommand OS™ – Site Monitoring & eSignature Guide

This guide details the procedure for planning, conducting, and approving site monitoring visits, logging audit findings, and completing FDA 21 CFR Part 11 compliant electronic signatures.

---

## 1. Monitoring Visit Lifecycle

Site monitoring visits verify that clinical trials conform to GxP and ICH E6 regulations. The monitoring report transitions through the following state machine:

```
Scheduled ──> In Progress ──> Report Pending ──> Pending Signature ──> Approved
```

### Action Steps:
1. Navigate to the **Monitoring Center**.
2. Click **Schedule Monitoring Visit**. Select Site, Visit Date, and Visit Type (`SQV`, `SIV`, `IMV`, `COV`).
3. On the scheduled date, click **Start Visit** (`In Progress`).
4. Conduct the site audit. Log any compliance findings (see Section 2).
5. Click **Submit Report** once the site audit completes (`Report Pending` / `Pending Signature`).

---

## 2. Audit Findings & CAPA Resolution

If a deviation from protocol or GxP standards is observed, it must be logged:
1. Inside the active monitoring visit detail, go to the **Findings** tab.
2. Click **Add Finding** and fill out:
   - **Description:** Clear explanation of the observation.
   - **Severity:** Select `Critical`, `Major`, `Minor`, or `Observation`.
3. The system automatically registers the finding in `OPEN` status.

### Resolution Steps:
1. When the site completes corrective actions, select the open finding.
2. Click **Resolve Finding**.
3. Input **Resolution & CAPA Details** explaining the corrective and preventive actions.
4. Click **Submit Resolution**. The status transitions to `RESOLVED`.

> [!WARNING]
   **Escalation Rule:** If a `Critical` severity finding remains unresolved at a site for more than 14 days, the system triggers a critical indicator, flagging the site risk tier as `High`.

---

## 3. FDA 21 CFR Part 11 Dual E-Signatures

To approve a monitoring report, GxP rules require formal sign-off. ClinCommand OS enforces a **double-signature gate** (Monitor signature + Principal Investigator signature) before a report can transition to `APPROVED` status.

### Signing the Report (Monitor):
1. Navigate to the pending monitoring report and select **Sign Report**.
2. Pick **Monitor** as the signing role.
3. Provide your login password (re-verification is mandatory).
4. Enter your signature attestation purpose (e.g. *"I attest to the completeness and accuracy of this site audit."*).
5. Click **Apply Signature**. The status transitions to `SignedByMonitor` (or `Pending PI Signature`).

### Signing the Report (Principal Investigator):
1. The PI logs in, opens the report, and selects **Sign Report**.
2. Pick **Principal Investigator** as the signing role.
3. Provide password and purpose.
4. Click **Apply Signature**.

### Approval Verification:
* The system computes a cryptographic SHA-256 integrity checksum of the report content and binds it with the signer's identity and signing timestamps.
* Once both signatures are recorded, the system unlocks the transition to `APPROVED`.
