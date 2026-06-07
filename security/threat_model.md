# STRIDE Threat Model – ClinCommand OS™

This report evaluates system security using the STRIDE threat classification model.

---

## 1. Spoofing Identity
* **Threat:** An attacker spoofing user accounts or hijacking active sessions.
* **Mitigation:** Expose strict SAML 2.0 and OIDC configurations. JWT access keys must be short-lived, and rotation families must disable reuse.
* **Control:** `ssoService.js`, Token rotation families check inside `server.js`.

## 2. Tampering with Data
* **Threat:** Altering regulatory clinical data or modifying audit trail rows.
* **Mitigation:** Implement PostgreSQL custom rules (`DO INSTEAD NOTHING`) on the `audit_logs` and `esignatures` tables. Log data in sequential cryptographic Merkle chains.
* **Control:** RLS + custom database rules, `merkleService.js`.

## 3. Repudiation
* **Threat:** A user claiming they did not execute a document signature or regulatory print.
* **Mitigation:** Bind electronic signatures to 21 CFR Part 11 compliant gate parameters. Store SHA-256 data hashes linked to the signer's identity and reason.
* **Control:** `esignatures` database checks.

## 4. Information Disclosure
* **Threat:** Cross-tenant leakage where one pharmaceutical tenant accesses another tenant's documents.
* **Mitigation:** Enforce database-level Row-Level Security (RLS) on all user and business tables. Wrap client connection pools inside an `AsyncLocalStorage` scope.
* **Control:** `db.js` custom transaction wrappers.

## 5. Denial of Service
* **Threat:** Flooding system endpoints (API abuse) to exhaust database or LLM resources.
* **Mitigation:** Implement sliding window API rate limiting using Redis, falling back to secure in-memory buckets if Redis is offline.
* **Control:** `rateLimiter.js`.

## 6. Elevation of Privilege
* **Threat:** A standard `Viewer` user executing SOP modifications or accessing compliance validation runs.
* **Mitigation:** Enforce role validations using a strict permissions engine checking user scopes before route executions.
* **Control:** `permissionService.js` and `requireRole` middleware in `auth.js`.
