# Functional Requirements Specification (FRS)

## 1. Multi-Tenant Database Isolation (FRS-001)
* **Function:** Implement database-level Row-Level Security (RLS) on business tables.
* **Details:** Every SQL query executed within an client request must run inside a transaction block that sets `SET LOCAL app.current_tenant_id = X` using context mapping from `AsyncLocalStorage`.
* **Maps to:** `URS-001`

## 2. Refresh Token Rotation & Replay Attack Protection (FRS-002)
* **Function:** Manage user sessions via rotating JWTs and double-hashed refresh tokens.
* **Details:** Refreshing an expired access token must invalidate the old refresh token and issue a new one. Presenting a revoked refresh token must invalidate the entire token family UUID and log a security alert.
* **Maps to:** `URS-002`

## 3. SHA-256 Merkle Chain Audit (FRS-003)
* **Function:** Group audit log rows into blocks and seal them in a Merkle tree.
* **Details:** Calculate SHA-256 block hashes linked sequentially. The endpoint `/api/v1/compliance/audit/verify` must scan the chain and identify any tampered records.
* **Maps to:** `URS-003`

## 4. SSO Routing & SCIM v2 Provisioning (FRS-004)
* **Function:** Integrate OIDC/SAML configurations and expose SCIM endpoints.
* **Details:** Expose `/api/scim/v2/Users` and `/api/scim/v2/Groups` for automated creation, de-activation, and role mapping.
* **Maps to:** `URS-004`

## 5. Programmatic IQ/OQ/PQ Validation (FRS-005)
* **Function:** Run automated validation suites and persist outcomes.
* **Details:** The validation service executes connectivity checks (IQ), RLS isolation logic (OQ), and Merkle hash verification scans (PQ), and logs results to `compliance_validations`.
* **Maps to:** `URS-005`
