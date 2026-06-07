-- ========================================================
-- CLINCOMMAND OS™ DATABASE SCHEMA ROLLBACK - PHASE 13
-- ========================================================

-- Drop Policies (implicit in drop table, but clean for DDL catalog integrity)
DROP POLICY IF EXISTS tenant_isolation_rtsm_configs ON study_randomization_configs;
DROP POLICY IF EXISTS tenant_isolation_rtsm_kits ON study_supply_kits;
DROP POLICY IF EXISTS tenant_isolation_subject_rands ON subject_randomizations;
DROP POLICY IF EXISTS tenant_isolation_dispensations ON subject_dispensations;

-- Drop Tables
DROP TABLE IF EXISTS subject_dispensations;
DROP TABLE IF EXISTS subject_randomizations;
DROP TABLE IF EXISTS study_supply_kits;
DROP TABLE IF EXISTS study_randomization_configs;

-- Drop Function
DROP FUNCTION IF EXISTS fn_dispense_kit(INT, INT, INT, INT);
