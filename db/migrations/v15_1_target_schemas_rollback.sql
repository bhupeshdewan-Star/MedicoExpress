-- ========================================================
-- CLINCOMMAND OS™ DATABASE SCHEMA MIGRATION ROLLBACK - 15.1
-- ========================================================

DROP TABLE IF EXISTS subject_wearable_telemetry_y2026m06 CASCADE;
DROP TABLE IF EXISTS subject_wearable_telemetry_y2026m07 CASCADE;
DROP TABLE IF EXISTS subject_wearable_telemetry_default CASCADE;
DROP TABLE IF EXISTS subject_wearable_telemetry CASCADE;
DROP TABLE IF EXISTS telemetry_ingestion_jobs CASCADE;
DROP TABLE IF EXISTS verification_tasks CASCADE;
DROP TABLE IF EXISTS source_document_reviews CASCADE;
DROP TABLE IF EXISTS source_documents CASCADE;
DROP TABLE IF EXISTS ai_alerts CASCADE;
DROP TABLE IF EXISTS subject_risk_scores CASCADE;
DROP TABLE IF EXISTS site_risk_scores CASCADE;
DROP TABLE IF EXISTS study_risk_scores CASCADE;
DROP TABLE IF EXISTS epro_subject_schedules CASCADE;
DROP TABLE IF EXISTS epro_responses CASCADE;
DROP TABLE IF EXISTS epro_question_versions CASCADE;
DROP TABLE IF EXISTS epro_questionnaires CASCADE;
DROP TABLE IF EXISTS subject_econsent_signatures CASCADE;
DROP TABLE IF EXISTS dct_visit_events CASCADE;
DROP TABLE IF EXISTS dct_virtual_visits CASCADE;
