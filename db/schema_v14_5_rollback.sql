-- ========================================================
-- CLINCOMMAND OS™ DATABASE ROLLBACK SCRIPT - PHASE 14.5
-- ========================================================

DROP TABLE IF EXISTS subject_data_point_history CASCADE;
DROP TABLE IF EXISTS medical_coding_terms CASCADE;
DROP TABLE IF EXISTS study_data_locks CASCADE;
DROP TABLE IF EXISTS subject_query_comments CASCADE;
DROP TABLE IF EXISTS subject_data_queries CASCADE;
DROP TABLE IF EXISTS subject_form_data_points CASCADE;
DROP TABLE IF EXISTS subject_form_submissions CASCADE;
DROP TABLE IF EXISTS study_form_definitions CASCADE;
