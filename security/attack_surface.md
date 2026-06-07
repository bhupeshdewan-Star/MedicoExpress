# Attack Surface Analysis – ClinCommand OS™

This report catalogs the platform's exposed access points and security borders.

---

## 1. Network Interface Borders
* **Exposed Ports:** `TCP/5000` (Express API Server), `TCP/5173` (Vite UI client).
* **Mitigation:**
  * ALB (Application Load Balancer) maps HTTPS (port 443) and proxies traffic to private port 5000.
  * Ports 5432 (Postgres) and 6379 (Redis) are strictly isolated in a database subnet, unreachable from public routes.

## 2. API Entry Gateways
* **Gateway Enpoints:** Authentication, SCIM provisioning, document generation, and validation runners.
* **Mitigation:**
  * Intercept all inputs using Zod sanitizer parser.
  * Require valid JWT tokens on all requests (except login).
  * Rate-limit API usage to 120 reqs/minute.

## 3. Identity & Directory Syncer Gates
* **Gateways:** Federated SSO login endpoints and `/api/scim/v2` Provisioning.
* **Mitigation:**
  * SCIM endpoints validate client authorization tokens.
  * SSO routes verify SAML XML signatures and OIDC identity claims.

## 4. Database Persistence Surfaces
* **Surfaces:** Direct queries against shared multi-tenant database tables.
* **Mitigation:**
  * Execute all SQL statements inside transactions carrying tenant scopes.
  * Enable RLS on all business-critical tables, blocking access to records outside the tenant ID.
