# ClinCommand OS™ – Test Automation Framework Structure

This folder contains the automated test suites categorized by validation scope:

## Directory Structure

* `tests/unit/`: Direct testing of standalone services (SSO authentication, SCIM prov schemas, token rotators, permission calculators).
* `tests/integration/`: Component interactions, database transactions, RLS scope validation, and REST API routing configurations.
* `tests/security/`: MFA TOTP token verification, session hijacking defenses, token family rotation replay limits, and XSS/SQLi scans.
* `tests/compliance/`: Merkle block chain verification checkers, e-signature immutable triggers, and validation report checks.
* `tests/performance/`: API latency benchmarks, RAG query speeds, and load test scripts (`k6` or `Artillery`).

---

## Code Coverage Targets
To satisfy Phase 8.1 baseline governance, the test suites must verify:
* **Backend Coverage:** > 85%
* **Frontend Coverage:** > 80%

---

## Execution Command
To run all active unit and validation tests:
```bash
npm run test
```
