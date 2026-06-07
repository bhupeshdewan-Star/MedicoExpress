# Security Control Matrix

This matrix maps security controls to international compliance standards.

---

## Controls Mapping Table

| Control ID | Security Control Implementation | ISO 27001 | SOC2 TSC | 21 CFR Part 11 | EU Annex 11 | GAMP 5 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **SEC-01** | Database Row-Level Security (RLS) | A.12.6.1 | CC6.1, CC6.3 | § 11.10(d) | Cl. 8.2 | Cat. 4 |
| **SEC-02** | Rotating Refresh Token Validation | A.9.4.2 | CC6.1, CC6.2 | § 11.10(g) | Cl. 14 | Cat. 4 |
| **SEC-03** | Cryptographic Merkle Audit Vaulting | A.12.4.1 | CC6.5 | § 11.10(e) | Cl. 9 | Cat. 4 |
| **SEC-04** | API Sliding Rate Limiter (Redis/Memory)| A.12.1.3 | CC7.1 | - | - | Cat. 3 |
| **SEC-05** | Zod Schema Input Sanitizer | A.14.2.1 | CC8.1 | § 11.10(k) | Cl. 4.4 | Cat. 4 |
| **SEC-06** | SCIM real-time de-provisioning | A.9.2.6 | CC6.3 | § 11.10(g) | Cl. 12 | Cat. 4 |
| **SEC-07** | Custom Security HTTP Headers (CSP/HSTS) | A.12.1.2 | CC7.1, CC7.2 | - | - | - |
| **SEC-08** | Multi-Factor Authentication (TOTP) | A.9.4.2 | CC6.1 | § 11.10(g) | Cl. 14 | Cat. 4 |

---

## Compliance References

* **FDA 21 CFR Part 11:** Electronic Records; Electronic Signatures validation rules.
* **EU Annex 11:** Rules Governing Medicinal Products in the European Union (Computerised Systems).
* **GAMP 5:** A Risk-Based Approach to Compliant GxP Computerized Systems.
