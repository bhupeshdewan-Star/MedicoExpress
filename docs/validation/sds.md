# System Design Specification (SDS)

## 1. Tenant Context Context-Injector (SDS-001)
* **Design:** Utilizes `AsyncLocalStorage` inside `db.js`.
* **Execution:**
  * Interceptors extract the tenant ID from the authenticated JWT.
  * The middleware executes the query inside the context of `tenantStorage.run(tenantId, callback)`.
  * The query wrapper sets `app.current_tenant_id` at the session level before executing queries.
* **Maps to:** `FRS-001`

## 2. Session Rotation Store Schema (SDS-002)
* **Design:** Schema maps a table structure `refresh_tokens`.
* **Fields:** `id`, `user_id`, `token_hash`, `token_family`, `is_revoked`, `expires_at`, `tenant_id`.
* **Crypto:** Double hashing is done via a SHA-256 utility function.
* **Maps to:** `FRS-002`

## 3. Cryptographic Merkle Block Hashing (SDS-003)
* **Design:** Schema maps two vault tables: `audit_vault_merkle_blocks` and `audit_vault_merkle_leaves`.
* **Service:** `merkleService.js` constructs leaves from audit rows, groups them by block index, hashes them using SHA-256, and links them to the previous block hash.
* **Maps to:** `FRS-003`

## 4. Federated Identity & SCIM Router (SDS-004)
* **Design:** Express routing mapping OIDC configs and SCIM schemas.
* **Endpoints:** Expose SCIM endpoints under `/api/scim/v2/` mapped in `server.js` and managed in `scimService.js`.
* **Maps to:** `FRS-004`

## 5. Automated Validation Engine (SDS-005)
* **Design:** Code service `validationService.js` mapping tests.
* **Checks:**
  * IQ: PostgreSQL connection test & Schema verification test.
  * OQ: Cross-tenant RLS isolation query test.
  * PQ: Merkle chain scans & pgvector cosine similarity tests.
* **Maps to:** `FRS-005`
