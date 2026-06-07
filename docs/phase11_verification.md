# ClinCommand OS™ – Phase 11 Validation & Verification Checklist

This checklist defines the Installation Verification (IQ), Operational Verification (OQ), and Performance Verification (PQ) steps to validate the Clinical Development Cloud implementation.

---

## 1. Environment & Pre-requisites Verification

- [ ] Connect to the target PostgreSQL server instance.
- [ ] Verify node packages are loaded (`npm install`).
- [ ] Confirm no SQLite dependencies remain in the repository.

---

## 2. Installation Verification (IQ)

### Database Schema Application
Apply the database migrations using the following schema runner commands:
```bash
# Apply schema
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f db/schema_v11.sql
```
- [ ] Confirm 19 clinical tables are successfully generated.
- [ ] Verify foreign keys, primary keys, and indexes are created.
- [ ] Check Row-Level Security (RLS) policies are active for each table:
  ```sql
  SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
  ```

### Database Schema Rollback
Verify that the rollback script cleans the environment successfully:
```bash
# Rollback schema
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f db/schema_v11_rollback.sql
```
- [ ] Confirm all 19 clinical tables, indexes, and RLS policies are dropped cleanly.
- [ ] Re-apply `db/schema_v11.sql` to prepare the database for testing.

---

## 3. Operational Verification (OQ)

Run the automated validation test runner to verify service calculations and compliance gates:
```bash
npm.cmd run test
```
Confirm the following outcomes:
- [ ] Test 6: Clinical Study Status State Machine: PASS
- [ ] Test 7: Subject Enrollment & Progression State Flow: PASS
- [ ] Test 8: eTMF Binders Completeness Audits: PASS
- [ ] Test 9: RBM Engine Risk index calculations: PASS
- [ ] Test 10: Monitoring Visits Dual e-signatures check: PASS
- [ ] Test 11: Site Activations checklist check: PASS

---

## 4. Performance Verification (PQ)

### Compilation & Linting
Validate that the client is production-ready and passes all strict compilation/linting gates:
```bash
# Compile and build production packages
npm.cmd run build

# Enforce clean coding standards
npm.cmd run lint
```
- [ ] Verify Vite + TypeScript production build succeeds with no errors.
- [ ] Confirm linter completes with zero code errors.

### Manual UI Flow Audits
Deploy locally (`npm.cmd run dev` or equivalent) and verify the following visual screens:
- [ ] **Studies Portfolio** (Select study, inspect active protocols, compare version amendments).
- [ ] **Site Activation** (Complete activation checklists, view site performance scoring, assign staff).
- [ ] **Subject Registry** (Register patient, enroll patient, check off scheduled visits, log protocol deviations).
- [ ] **Site Monitoring** (Schedule monitoring visit, add finding checklist, verify dual e-signatures).
- [ ] **eTMF Repository** (Navigate collapsible DIA reference folder tree, check completeness check audits).
- [ ] **RBM Center** (Verify configurable weights sliders and site risk profile heatmaps).
- [ ] **Clinical Intelligence** (Assess linear enrollment forecasts, velocity, and composite health gauges).
