-- ========================================================
-- CLINCOMMAND OS™ DATABASE SCHEMA MIGRATION ROLLBACK - PHASE 11
-- ========================================================

-- Drop Indexes
DROP INDEX IF EXISTS idx_etmf_documents_folder;
DROP INDEX IF EXISTS idx_etmf_documents_study;
DROP INDEX IF EXISTS idx_etmf_folders_study;
DROP INDEX IF EXISTS idx_protocol_deviations_study;
DROP INDEX IF EXISTS idx_monitoring_visits_site;
DROP INDEX IF EXISTS idx_subject_visits_subject;
DROP INDEX IF EXISTS idx_study_subjects_site;
DROP INDEX IF EXISTS idx_study_subjects_study;
DROP INDEX IF EXISTS idx_site_staff_site;
DROP INDEX IF EXISTS idx_study_sites_study;
DROP INDEX IF EXISTS idx_studies_protocol;

-- Drop RLS Policies (Safe drop via dropping tables, but explicit drop policies is also clean)
DROP POLICY IF EXISTS tenant_isolation_studies ON studies;
DROP POLICY IF EXISTS tenant_isolation_study_protocols ON study_protocols;
DROP POLICY IF EXISTS tenant_isolation_study_versions ON study_versions;
DROP POLICY IF EXISTS tenant_isolation_study_sites ON study_sites;
DROP POLICY IF EXISTS tenant_isolation_investigators ON investigators;
DROP POLICY IF EXISTS tenant_isolation_site_staff ON site_staff;
DROP POLICY IF EXISTS tenant_isolation_study_subjects ON study_subjects;
DROP POLICY IF EXISTS tenant_isolation_subject_visits ON subject_visits;
DROP POLICY IF EXISTS tenant_isolation_enrollment_logs ON enrollment_logs;
DROP POLICY IF EXISTS tenant_isolation_monitoring_visits ON monitoring_visits;
DROP POLICY IF EXISTS tenant_isolation_monitoring_visit_sigs ON monitoring_visit_signatures;
DROP POLICY IF EXISTS tenant_isolation_monitoring_findings ON monitoring_findings;
DROP POLICY IF EXISTS tenant_isolation_protocol_deviations ON protocol_deviations;
DROP POLICY IF EXISTS tenant_isolation_trial_risk_assess ON trial_risk_assessments;
DROP POLICY IF EXISTS tenant_isolation_trial_milestones ON trial_milestones;
DROP POLICY IF EXISTS tenant_isolation_site_act_chk ON site_activation_checklists;
DROP POLICY IF EXISTS tenant_isolation_etmf_folders ON etmf_folders;
DROP POLICY IF EXISTS tenant_isolation_etmf_documents ON etmf_documents;
DROP POLICY IF EXISTS tenant_isolation_etmf_training_recs ON etmf_training_records;
DROP POLICY IF EXISTS tenant_isolation_study_dashboards ON study_dashboards;

-- Drop Tables in dependency-safe order (children first)
DROP TABLE IF EXISTS study_dashboards CASCADE;
DROP TABLE IF EXISTS etmf_training_records CASCADE;
DROP TABLE IF EXISTS etmf_documents CASCADE;
DROP TABLE IF EXISTS etmf_folders CASCADE;
DROP TABLE IF EXISTS site_activation_checklists CASCADE;
DROP TABLE IF EXISTS trial_milestones CASCADE;
DROP TABLE IF EXISTS trial_risk_assessments CASCADE;
DROP TABLE IF EXISTS protocol_deviations CASCADE;
DROP TABLE IF EXISTS monitoring_findings CASCADE;
DROP TABLE IF EXISTS monitoring_visit_signatures CASCADE;
DROP TABLE IF EXISTS monitoring_visits CASCADE;
DROP TABLE IF EXISTS enrollment_logs CASCADE;
DROP TABLE IF EXISTS subject_visits CASCADE;
DROP TABLE IF EXISTS study_subjects CASCADE;
DROP TABLE IF EXISTS site_staff CASCADE;
DROP TABLE IF EXISTS investigators CASCADE;
DROP TABLE IF EXISTS study_sites CASCADE;
DROP TABLE IF EXISTS study_versions CASCADE;
DROP TABLE IF EXISTS study_protocols CASCADE;
DROP TABLE IF EXISTS studies CASCADE;
