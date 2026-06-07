-- ========================================================
-- CLINCOMMAND OS™ DATABASE SCHEMA MIGRATION - PHASE 15.1
-- ========================================================

-- ========================================================
-- 1. DCT PLATFORM TABLES
-- ========================================================

CREATE TABLE IF NOT EXISTS dct_virtual_visits (
  id SERIAL PRIMARY KEY,
  subject_id INT NOT NULL REFERENCES study_subjects(id) ON DELETE CASCADE,
  visit_id INT NOT NULL REFERENCES subject_visits(id) ON DELETE CASCADE,
  scheduled_start TIMESTAMP WITH TIME ZONE NOT NULL,
  scheduled_end TIMESTAMP WITH TIME ZONE NOT NULL,
  video_room_id VARCHAR(100) UNIQUE NOT NULL,
  visit_status VARCHAR(50) NOT NULL DEFAULT 'SCHEDULED' CHECK (visit_status IN ('SCHEDULED', 'PATIENT_CHECKED_IN', 'IN_PROGRESS', 'COMPLETED', 'MISSED')),
  recording_url VARCHAR(255) DEFAULT NULL,
  investigator_notes TEXT DEFAULT NULL,
  tenant_id INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS dct_visit_events (
  id SERIAL PRIMARY KEY,
  visit_id INT NOT NULL REFERENCES dct_virtual_visits(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('ROOM_CREATED', 'PATIENT_JOINED', 'INVESTIGATOR_JOINED', 'STREAM_ERROR', 'VISIT_COMPLETED')),
  event_details JSONB DEFAULT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS subject_econsent_signatures (
  id SERIAL PRIMARY KEY,
  subject_id INT NOT NULL REFERENCES study_subjects(id) ON DELETE CASCADE,
  consent_version VARCHAR(50) NOT NULL,
  consent_pdf_url VARCHAR(255) NOT NULL,
  consent_pdf_hash CHAR(64) NOT NULL, -- SHA-256 Checksum
  printed_signee_name VARCHAR(100) NOT NULL,
  signature_meaning VARCHAR(100) NOT NULL DEFAULT 'I agree to participate',
  ip_address VARCHAR(45) NOT NULL,
  signed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  tenant_id INT NOT NULL DEFAULT 1
);

-- ========================================================
-- 2. ePRO/eCOA PLATFORM TABLES
-- ========================================================

CREATE TABLE IF NOT EXISTS epro_questionnaires (
  id SERIAL PRIMARY KEY,
  template_key VARCHAR(50) UNIQUE NOT NULL,
  version VARCHAR(20) NOT NULL,
  questions JSONB NOT NULL,
  is_active BOOLEAN DEFAULT TRUE NOT NULL
);

CREATE TABLE IF NOT EXISTS epro_question_versions (
  id SERIAL PRIMARY KEY,
  questionnaire_id INT REFERENCES epro_questionnaires(id) ON DELETE CASCADE,
  version_code VARCHAR(20) NOT NULL,
  schema_definition JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS epro_responses (
  id SERIAL PRIMARY KEY,
  subject_id INT NOT NULL REFERENCES study_subjects(id) ON DELETE CASCADE,
  visit_id INT NOT NULL REFERENCES subject_visits(id) ON DELETE CASCADE,
  questionnaire_id INT REFERENCES epro_questionnaires(id) ON DELETE CASCADE,
  responses JSONB NOT NULL,
  submission_device_info VARCHAR(255) NOT NULL,
  device_signature CHAR(64) NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  tenant_id INT NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS epro_subject_schedules (
  id SERIAL PRIMARY KEY,
  subject_id INT NOT NULL REFERENCES study_subjects(id) ON DELETE CASCADE,
  questionnaire_id INT REFERENCES epro_questionnaires(id) ON DELETE CASCADE,
  trigger_time TIME NOT NULL,
  recurrence VARCHAR(50) NOT NULL DEFAULT 'DAILY',
  tenant_id INT NOT NULL DEFAULT 1
);

-- ========================================================
-- 3. RBM AI RISK SCORING TABLES
-- ========================================================

CREATE TABLE IF NOT EXISTS study_risk_scores (
  id SERIAL PRIMARY KEY,
  study_id INT NOT NULL REFERENCES studies(id) ON DELETE CASCADE,
  overall_score NUMERIC(5,2) NOT NULL,
  feature_contributions JSONB NOT NULL,
  evaluated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS site_risk_scores (
  id SERIAL PRIMARY KEY,
  site_id INT NOT NULL REFERENCES study_sites(id) ON DELETE CASCADE,
  overall_score NUMERIC(5,2) NOT NULL,
  feature_contributions JSONB NOT NULL,
  evaluated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS subject_risk_scores (
  id SERIAL PRIMARY KEY,
  subject_id INT NOT NULL REFERENCES study_subjects(id) ON DELETE CASCADE,
  overall_score NUMERIC(5,2) NOT NULL,
  feature_contributions JSONB NOT NULL,
  evaluated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ai_alerts (
  id SERIAL PRIMARY KEY,
  alert_type VARCHAR(50) NOT NULL CHECK (alert_type IN ('SAFETY_SIGNAL', 'PROTOCOL_DEVIATION', 'RETENTION_RISK')),
  target_id INT NOT NULL,
  score_percentage NUMERIC(5,2) NOT NULL,
  alert_status VARCHAR(50) NOT NULL DEFAULT 'PENDING_REVIEW' CHECK (alert_status IN ('PENDING_REVIEW', 'APPROVED', 'REJECTED')),
  review_notes TEXT DEFAULT NULL,
  reviewer_id INT REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  tenant_id INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ========================================================
-- 4. REMOTE SDV (rSDV) TABLES
-- ========================================================

CREATE TABLE IF NOT EXISTS source_documents (
  id SERIAL PRIMARY KEY,
  subject_id INT NOT NULL REFERENCES study_subjects(id) ON DELETE CASCADE,
  document_name VARCHAR(255) NOT NULL,
  document_url VARCHAR(255) NOT NULL,
  document_hash CHAR(64) NOT NULL,
  redacted_url VARCHAR(255) DEFAULT NULL,
  ingest_status VARCHAR(50) NOT NULL DEFAULT 'INGESTED' CHECK (ingest_status IN ('INGESTED', 'REDACTED', 'OCR_COMPLETED', 'VERIFIED')),
  tenant_id INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS source_document_reviews (
  id SERIAL PRIMARY KEY,
  document_id INT REFERENCES source_documents(id) ON DELETE CASCADE,
  reviewer_id INT REFERENCES users(id) ON DELETE RESTRICT,
  review_notes TEXT DEFAULT NULL,
  review_status VARCHAR(50) NOT NULL DEFAULT 'PENDING' CHECK (review_status IN ('PENDING', 'VERIFIED', 'DISCREPANCY_FOUND')),
  signed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  tenant_id INT NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS verification_tasks (
  id SERIAL PRIMARY KEY,
  document_id INT REFERENCES source_documents(id) ON DELETE CASCADE,
  field_key VARCHAR(100) NOT NULL,
  ecrf_value VARCHAR(255) NOT NULL,
  source_value VARCHAR(255) NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE NOT NULL,
  tenant_id INT NOT NULL DEFAULT 1
);

-- ========================================================
-- 5. WEARABLES & DEVICES DATA TABLES
-- ========================================================

CREATE TABLE subject_wearable_telemetry (
  id BIGSERIAL,
  subject_id INT NOT NULL REFERENCES study_subjects(id) ON DELETE CASCADE,
  source_provider VARCHAR(50) NOT NULL CHECK (source_provider IN ('FITBIT', 'APPLE_HEALTH', 'GARMIN')),
  metric_type VARCHAR(50) NOT NULL CHECK (metric_type IN ('HEART_RATE_BPM', 'STEPS', 'GLUCOSE_MG_DL', 'SYS_BP', 'DIA_BP')),
  metric_value NUMERIC(10,2) NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL,
  tenant_id INT NOT NULL DEFAULT 1,
  PRIMARY KEY (id, recorded_at)
) PARTITION BY RANGE (recorded_at);

CREATE TABLE IF NOT EXISTS telemetry_ingestion_jobs (
  id SERIAL PRIMARY KEY,
  device_serial VARCHAR(100) NOT NULL,
  records_count INT NOT NULL,
  job_status VARCHAR(50) NOT NULL CHECK (job_status IN ('IN_PROGRESS', 'SUCCESS', 'FAILED')),
  error_logs TEXT DEFAULT NULL,
  finished_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Example partition tables
CREATE TABLE IF NOT EXISTS subject_wearable_telemetry_y2026m06 PARTITION OF subject_wearable_telemetry
  FOR VALUES FROM ('2026-06-01 00:00:00+00') TO ('2026-07-01 00:00:00+00');
CREATE TABLE IF NOT EXISTS subject_wearable_telemetry_y2026m07 PARTITION OF subject_wearable_telemetry
  FOR VALUES FROM ('2026-07-01 00:00:00+00') TO ('2026-08-01 00:00:00+00');
CREATE TABLE IF NOT EXISTS subject_wearable_telemetry_default PARTITION OF subject_wearable_telemetry DEFAULT;

-- ========================================================
-- 6. INDEXES, CONSTRAINTS & RLS POLICIES
-- ========================================================

CREATE INDEX IF NOT EXISTS idx_dct_visits ON dct_virtual_visits (subject_id, visit_status, tenant_id);
CREATE INDEX IF NOT EXISTS idx_epro_resp ON epro_responses (subject_id, questionnaire_id, tenant_id);
CREATE INDEX IF NOT EXISTS idx_ai_alerts ON ai_alerts (alert_status, tenant_id);
CREATE INDEX IF NOT EXISTS idx_sdv_tasks ON verification_tasks (document_id, is_verified, tenant_id);

ALTER TABLE dct_virtual_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE subject_econsent_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE epro_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE source_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE subject_wearable_telemetry ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS dct_visits_isolation ON dct_virtual_visits;
DROP POLICY IF EXISTS econsent_isolation ON subject_econsent_signatures;
DROP POLICY IF EXISTS epro_resp_isolation ON epro_responses;
DROP POLICY IF EXISTS ai_alerts_isolation ON ai_alerts;
DROP POLICY IF EXISTS sdv_docs_isolation ON source_documents;
DROP POLICY IF EXISTS telemetry_isolation ON subject_wearable_telemetry;

CREATE POLICY dct_visits_isolation ON dct_virtual_visits FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::integer OR current_setting('app.current_tenant_id', true) = '');
CREATE POLICY econsent_isolation ON subject_econsent_signatures FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::integer OR current_setting('app.current_tenant_id', true) = '');
CREATE POLICY epro_resp_isolation ON epro_responses FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::integer OR current_setting('app.current_tenant_id', true) = '');
CREATE POLICY ai_alerts_isolation ON ai_alerts FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::integer OR current_setting('app.current_tenant_id', true) = '');
CREATE POLICY sdv_docs_isolation ON source_documents FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::integer OR current_setting('app.current_tenant_id', true) = '');
CREATE POLICY telemetry_isolation ON subject_wearable_telemetry FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::integer OR current_setting('app.current_tenant_id', true) = '');
