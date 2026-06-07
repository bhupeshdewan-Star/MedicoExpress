-- ========================================================
-- CLINCOMMAND OS™ DATABASE SCHEMA MIGRATION - PHASE 11
-- ========================================================

-- 1. Studies Table
CREATE TABLE IF NOT EXISTS studies (
  id SERIAL PRIMARY KEY,
  protocol_number VARCHAR(100) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  phase VARCHAR(50) NOT NULL, -- 'Phase I', 'Phase II', 'Phase III', 'Phase IV'
  status VARCHAR(50) DEFAULT 'PLANNING', -- 'PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'TERMINATED'
  sponsor VARCHAR(255) DEFAULT 'ClinCommand LifeSciences',
  therapeutic_area VARCHAR(100) DEFAULT 'Oncology',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  tenant_id INT NOT NULL DEFAULT 1
);

-- 2. Study Protocols Table
CREATE TABLE IF NOT EXISTS study_protocols (
  id SERIAL PRIMARY KEY,
  study_id INT REFERENCES studies(id) ON DELETE CASCADE,
  version VARCHAR(50) NOT NULL,
  objectives TEXT,
  endpoints TEXT,
  inclusion_criteria TEXT,
  exclusion_criteria TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  tenant_id INT NOT NULL DEFAULT 1
);

-- 3. Study Versions Table
CREATE TABLE IF NOT EXISTS study_versions (
  id SERIAL PRIMARY KEY,
  study_id INT REFERENCES studies(id) ON DELETE CASCADE,
  version_tag VARCHAR(50) NOT NULL,
  amendment_details TEXT,
  released_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(50) DEFAULT 'DRAFT', -- 'DRAFT', 'ACTIVE', 'SUPERSEDED'
  tenant_id INT NOT NULL DEFAULT 1
);

-- 4. Study Sites Table
CREATE TABLE IF NOT EXISTS study_sites (
  id SERIAL PRIMARY KEY,
  study_id INT REFERENCES studies(id) ON DELETE CASCADE,
  site_number VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  country VARCHAR(100) NOT NULL,
  status VARCHAR(50) DEFAULT 'INITIATING', -- 'INITIATING', 'ACTIVE', 'CLOSED'
  target_enrollment INT DEFAULT 0,
  actual_enrollment INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  tenant_id INT NOT NULL DEFAULT 1
);

-- 5. Investigators Table
CREATE TABLE IF NOT EXISTS investigators (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  specialty VARCHAR(255),
  tenant_id INT NOT NULL DEFAULT 1
);

-- 6. Site Staff Table
CREATE TABLE IF NOT EXISTS site_staff (
  id SERIAL PRIMARY KEY,
  site_id INT REFERENCES study_sites(id) ON DELETE CASCADE,
  investigator_id INT REFERENCES investigators(id) ON DELETE SET NULL,
  role VARCHAR(100) NOT NULL, -- 'PI', 'SUB_I', 'COORDINATOR'
  tenant_id INT NOT NULL DEFAULT 1
);

-- 7. Study Subjects Table
CREATE TABLE IF NOT EXISTS study_subjects (
  id SERIAL PRIMARY KEY,
  study_id INT REFERENCES studies(id) ON DELETE CASCADE,
  site_id INT REFERENCES study_sites(id) ON DELETE CASCADE,
  subject_number VARCHAR(100) NOT NULL,
  enrollment_date TIMESTAMP WITH TIME ZONE,
  status VARCHAR(50) DEFAULT 'SCREENING', -- 'SCREENING', 'ENROLLED', 'ONGOING', 'COMPLETED', 'WITHDRAWN'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  tenant_id INT NOT NULL DEFAULT 1
);

-- 8. Subject Visits Table
CREATE TABLE IF NOT EXISTS subject_visits (
  id SERIAL PRIMARY KEY,
  subject_id INT REFERENCES study_subjects(id) ON DELETE CASCADE,
  visit_name VARCHAR(100) NOT NULL,
  scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
  actual_date TIMESTAMP WITH TIME ZONE,
  status VARCHAR(50) DEFAULT 'SCHEDULED', -- 'SCHEDULED', 'COMPLETED', 'MISSED'
  tenant_id INT NOT NULL DEFAULT 1
);

-- 9. Enrollment Logs Table
CREATE TABLE IF NOT EXISTS enrollment_logs (
  id SERIAL PRIMARY KEY,
  study_id INT REFERENCES studies(id) ON DELETE CASCADE,
  site_id INT REFERENCES study_sites(id) ON DELETE CASCADE,
  date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  action VARCHAR(100) NOT NULL, -- 'SCREENED', 'ENROLLED', 'COMPLETED', 'WITHDRAWN'
  tenant_id INT NOT NULL DEFAULT 1
);

-- 10. Monitoring Visits Table
CREATE TABLE IF NOT EXISTS monitoring_visits (
  id SERIAL PRIMARY KEY,
  site_id INT REFERENCES study_sites(id) ON DELETE CASCADE,
  visit_date TIMESTAMP WITH TIME ZONE NOT NULL,
  monitor_id INT REFERENCES users(id) ON DELETE SET NULL,
  visit_type VARCHAR(50) NOT NULL, -- 'SQV', 'SIV', 'IMV', 'COV'
  status VARCHAR(50) DEFAULT 'SCHEDULED', -- 'SCHEDULED', 'IN_PROGRESS', 'REPORT_PENDING', 'PENDING_SIGNATURE', 'APPROVED'
  report_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  tenant_id INT NOT NULL DEFAULT 1
);

-- Signatures helper table for Monitoring Visit eSignatures
CREATE TABLE IF NOT EXISTS monitoring_visit_signatures (
  id SERIAL PRIMARY KEY,
  visit_id INT REFERENCES monitoring_visits(id) ON DELETE CASCADE,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL, -- 'MONITOR', 'PI'
  signature_hash VARCHAR(255) NOT NULL,
  signed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  tenant_id INT NOT NULL DEFAULT 1
);

-- 11. Monitoring Findings Table
CREATE TABLE IF NOT EXISTS monitoring_findings (
  id SERIAL PRIMARY KEY,
  visit_id INT REFERENCES monitoring_visits(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  severity VARCHAR(50) NOT NULL, -- 'CRITICAL', 'MAJOR', 'MINOR', 'OBSERVATION'
  status VARCHAR(50) DEFAULT 'OPEN', -- 'OPEN', 'RESOLVED'
  resolution_details TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  tenant_id INT NOT NULL DEFAULT 1
);

-- 12. Protocol Deviations Table
CREATE TABLE IF NOT EXISTS protocol_deviations (
  id SERIAL PRIMARY KEY,
  study_id INT REFERENCES studies(id) ON DELETE CASCADE,
  site_id INT REFERENCES study_sites(id) ON DELETE CASCADE,
  subject_id INT REFERENCES study_subjects(id) ON DELETE SET NULL,
  deviation_type VARCHAR(100) NOT NULL, -- 'INCLUSION_EXCLUSION', 'VISIT_WINDOW', 'SAFETY', 'OTHER'
  description TEXT NOT NULL,
  reported_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  severity VARCHAR(50) NOT NULL, -- 'MINOR', 'MAJOR', 'CRITICAL'
  tenant_id INT NOT NULL DEFAULT 1
);

-- 13. Trial Risk Assessments Table
CREATE TABLE IF NOT EXISTS trial_risk_assessments (
  id SERIAL PRIMARY KEY,
  study_id INT REFERENCES studies(id) ON DELETE CASCADE,
  risk_category VARCHAR(100) NOT NULL,
  risk_score INT DEFAULT 0,
  mitigation_strategy TEXT,
  tenant_id INT NOT NULL DEFAULT 1
);

-- 14. Trial Milestones Table
CREATE TABLE IF NOT EXISTS trial_milestones (
  id SERIAL PRIMARY KEY,
  study_id INT REFERENCES studies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  planned_date TIMESTAMP WITH TIME ZONE NOT NULL,
  actual_date TIMESTAMP WITH TIME ZONE,
  status VARCHAR(50) DEFAULT 'PENDING', -- 'PENDING', 'ACHIEVED', 'MISSED'
  tenant_id INT NOT NULL DEFAULT 1
);

-- 15. Site Activation Checklists Table
CREATE TABLE IF NOT EXISTS site_activation_checklists (
  id SERIAL PRIMARY KEY,
  site_id INT REFERENCES study_sites(id) ON DELETE CASCADE,
  task_name VARCHAR(255) NOT NULL, -- 'IRB Approval', 'Contract Executed', 'Training Completed'
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  completed_by INT REFERENCES users(id) ON DELETE SET NULL,
  tenant_id INT NOT NULL DEFAULT 1
);

-- 16. eTMF Folders Table
CREATE TABLE IF NOT EXISTS etmf_folders (
  id SERIAL PRIMARY KEY,
  study_id INT REFERENCES studies(id) ON DELETE CASCADE,
  parent_id INT REFERENCES etmf_folders(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  tenant_id INT NOT NULL DEFAULT 1
);

-- 17. eTMF Documents Table
CREATE TABLE IF NOT EXISTS etmf_documents (
  id SERIAL PRIMARY KEY,
  study_id INT REFERENCES studies(id) ON DELETE CASCADE,
  folder_id INT REFERENCES etmf_folders(id) ON DELETE SET NULL,
  site_id INT REFERENCES study_sites(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  doc_type VARCHAR(100) NOT NULL, -- 'PROTOCOL', 'ICF', 'IRB_APPROVAL', 'CV', 'OTHER'
  status VARCHAR(50) DEFAULT 'DRAFT', -- 'DRAFT', 'UNDER_REVIEW', 'APPROVED', 'SUPERSEDED'
  file_url TEXT,
  file_size INT,
  file_hash VARCHAR(255),
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  tenant_id INT NOT NULL DEFAULT 1
);

-- 18. eTMF Training Records Table
CREATE TABLE IF NOT EXISTS etmf_training_records (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  document_id INT REFERENCES etmf_documents(id) ON DELETE CASCADE,
  signed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  tenant_id INT NOT NULL DEFAULT 1
);

-- 19. Study Dashboards Table
CREATE TABLE IF NOT EXISTS study_dashboards (
  id SERIAL PRIMARY KEY,
  study_id INT REFERENCES studies(id) ON DELETE CASCADE,
  metrics_summary TEXT, -- Stores JSON configuration cache
  tenant_id INT NOT NULL DEFAULT 1
);

-- Indexes for performance lookups on high volume fields
CREATE INDEX IF NOT EXISTS idx_studies_protocol ON studies(protocol_number);
CREATE INDEX IF NOT EXISTS idx_study_sites_study ON study_sites(study_id);
CREATE INDEX IF NOT EXISTS idx_site_staff_site ON site_staff(site_id);
CREATE INDEX IF NOT EXISTS idx_study_subjects_study ON study_subjects(study_id);
CREATE INDEX IF NOT EXISTS idx_study_subjects_site ON study_subjects(site_id);
CREATE INDEX IF NOT EXISTS idx_subject_visits_subject ON subject_visits(subject_id);
CREATE INDEX IF NOT EXISTS idx_monitoring_visits_site ON monitoring_visits(site_id);
CREATE INDEX IF NOT EXISTS idx_protocol_deviations_study ON protocol_deviations(study_id);
CREATE INDEX IF NOT EXISTS idx_etmf_folders_study ON etmf_folders(study_id);
CREATE INDEX IF NOT EXISTS idx_etmf_documents_study ON etmf_documents(study_id);
CREATE INDEX IF NOT EXISTS idx_etmf_documents_folder ON etmf_documents(folder_id);

-- Enable RLS on all clinical tables
ALTER TABLE studies ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE investigators ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE subject_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollment_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitoring_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitoring_visit_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitoring_findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE protocol_deviations ENABLE ROW LEVEL SECURITY;
ALTER TABLE trial_risk_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE trial_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_activation_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE etmf_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE etmf_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE etmf_training_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_dashboards ENABLE ROW LEVEL SECURITY;

-- Apply Tenant Isolation RLS Policies
CREATE POLICY tenant_isolation_studies ON studies FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::integer OR current_setting('app.current_tenant_id', true) = '');
CREATE POLICY tenant_isolation_study_protocols ON study_protocols FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::integer OR current_setting('app.current_tenant_id', true) = '');
CREATE POLICY tenant_isolation_study_versions ON study_versions FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::integer OR current_setting('app.current_tenant_id', true) = '');
CREATE POLICY tenant_isolation_study_sites ON study_sites FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::integer OR current_setting('app.current_tenant_id', true) = '');
CREATE POLICY tenant_isolation_investigators ON investigators FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::integer OR current_setting('app.current_tenant_id', true) = '');
CREATE POLICY tenant_isolation_site_staff ON site_staff FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::integer OR current_setting('app.current_tenant_id', true) = '');
CREATE POLICY tenant_isolation_study_subjects ON study_subjects FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::integer OR current_setting('app.current_tenant_id', true) = '');
CREATE POLICY tenant_isolation_subject_visits ON subject_visits FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::integer OR current_setting('app.current_tenant_id', true) = '');
CREATE POLICY tenant_isolation_enrollment_logs ON enrollment_logs FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::integer OR current_setting('app.current_tenant_id', true) = '');
CREATE POLICY tenant_isolation_monitoring_visits ON monitoring_visits FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::integer OR current_setting('app.current_tenant_id', true) = '');
CREATE POLICY tenant_isolation_monitoring_visit_sigs ON monitoring_visit_signatures FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::integer OR current_setting('app.current_tenant_id', true) = '');
CREATE POLICY tenant_isolation_monitoring_findings ON monitoring_findings FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::integer OR current_setting('app.current_tenant_id', true) = '');
CREATE POLICY tenant_isolation_protocol_deviations ON protocol_deviations FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::integer OR current_setting('app.current_tenant_id', true) = '');
CREATE POLICY tenant_isolation_trial_risk_assess ON trial_risk_assessments FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::integer OR current_setting('app.current_tenant_id', true) = '');
CREATE POLICY tenant_isolation_trial_milestones ON trial_milestones FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::integer OR current_setting('app.current_tenant_id', true) = '');
CREATE POLICY tenant_isolation_site_act_chk ON site_activation_checklists FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::integer OR current_setting('app.current_tenant_id', true) = '');
CREATE POLICY tenant_isolation_etmf_folders ON etmf_folders FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::integer OR current_setting('app.current_tenant_id', true) = '');
CREATE POLICY tenant_isolation_etmf_documents ON etmf_documents FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::integer OR current_setting('app.current_tenant_id', true) = '');
CREATE POLICY tenant_isolation_etmf_training_recs ON etmf_training_records FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::integer OR current_setting('app.current_tenant_id', true) = '');
CREATE POLICY tenant_isolation_study_dashboards ON study_dashboards FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::integer OR current_setting('app.current_tenant_id', true) = '');

-- Seed initial records: one study, two sites, three subjects.
INSERT INTO studies (protocol_number, title, phase, status, sponsor, therapeutic_area, tenant_id)
VALUES ('CC-2026-ONC-001', 'Phase III Study of Remimazolam in Combination with Checkpoint Inhibitors', 'Phase III', 'ACTIVE', 'ClinCommand LifeSciences', 'Oncology', 1);

INSERT INTO study_protocols (study_id, version, objectives, endpoints, inclusion_criteria, exclusion_criteria, tenant_id)
VALUES (1, '1.0', 'Evaluate the safety and efficacy profile', 'Primary endpoint: Progression-Free Survival (PFS)', 'Inclusion: Adult patients aged >= 18 with confirmed Advanced Melanoma', 'Exclusion: Prior treatment with check-point blockades within 14 days', 1);

INSERT INTO study_sites (study_id, site_number, name, country, status, target_enrollment, actual_enrollment, tenant_id)
VALUES (1, 'US-101', 'Boston Oncology Research Center', 'United States', 'ACTIVE', 10, 2, 1),
       (1, 'IN-201', 'Tata Memorial Center, Mumbai', 'India', 'INITIATING', 15, 1, 1);

INSERT INTO investigators (first_name, last_name, email, specialty, tenant_id)
VALUES ('Sarah', 'Jenkins', 'sjenkins@bostononcology.org', 'Oncology', 1),
       ('Rajesh', 'Sharma', 'rsharma@tmc.gov.in', 'Immunotherapy', 1);

INSERT INTO site_staff (site_id, investigator_id, role, tenant_id)
VALUES (1, 1, 'PI', 1),
       (2, 2, 'PI', 1);

INSERT INTO study_subjects (study_id, site_id, subject_number, enrollment_date, status, tenant_id)
VALUES (1, 1, 'SUB-101-001', CURRENT_TIMESTAMP - INTERVAL '10 days', 'ENROLLED', 1),
       (1, 1, 'SUB-101-002', CURRENT_TIMESTAMP - INTERVAL '5 days', 'ENROLLED', 1),
       (1, 2, 'SUB-201-001', CURRENT_TIMESTAMP - INTERVAL '2 days', 'ENROLLED', 1);

INSERT INTO subject_visits (subject_id, visit_name, scheduled_date, actual_date, status, tenant_id)
VALUES (1, 'Screening', CURRENT_TIMESTAMP - INTERVAL '10 days', CURRENT_TIMESTAMP - INTERVAL '10 days', 'COMPLETED', 1),
       (1, 'Baseline', CURRENT_TIMESTAMP - INTERVAL '3 days', CURRENT_TIMESTAMP - INTERVAL '3 days', 'COMPLETED', 1),
       (1, 'Week 4', CURRENT_TIMESTAMP + INTERVAL '25 days', NULL, 'SCHEDULED', 1),
       (2, 'Screening', CURRENT_TIMESTAMP - INTERVAL '5 days', CURRENT_TIMESTAMP - INTERVAL '5 days', 'COMPLETED', 1),
       (2, 'Baseline', CURRENT_TIMESTAMP + INTERVAL '2 days', NULL, 'SCHEDULED', 1),
       (3, 'Screening', CURRENT_TIMESTAMP - INTERVAL '2 days', CURRENT_TIMESTAMP - INTERVAL '2 days', 'COMPLETED', 1);

INSERT INTO enrollment_logs (study_id, site_id, date, action, tenant_id)
VALUES (1, 1, CURRENT_TIMESTAMP - INTERVAL '10 days', 'SCREENED', 1),
       (1, 1, CURRENT_TIMESTAMP - INTERVAL '10 days', 'ENROLLED', 1),
       (1, 1, CURRENT_TIMESTAMP - INTERVAL '5 days', 'SCREENED', 1),
       (1, 1, CURRENT_TIMESTAMP - INTERVAL '5 days', 'ENROLLED', 1),
       (1, 2, CURRENT_TIMESTAMP - INTERVAL '2 days', 'SCREENED', 1),
       (1, 2, CURRENT_TIMESTAMP - INTERVAL '2 days', 'ENROLLED', 1);

INSERT INTO site_activation_checklists (site_id, task_name, is_completed, completed_at, completed_by, tenant_id)
VALUES (1, 'IRB Approval', true, CURRENT_TIMESTAMP - INTERVAL '15 days', 5, 1),
       (1, 'Contract Executed', true, CURRENT_TIMESTAMP - INTERVAL '12 days', 5, 1),
       (1, 'Training Completed', true, CURRENT_TIMESTAMP - INTERVAL '10 days', 5, 1),
       (2, 'IRB Approval', true, CURRENT_TIMESTAMP - INTERVAL '5 days', 5, 1),
       (2, 'Contract Executed', false, NULL, NULL, 1),
       (2, 'Training Completed', false, NULL, NULL, 1);

-- Initial eTMF folder structures for Study 1
INSERT INTO etmf_folders (study_id, parent_id, name, tenant_id)
VALUES (1, NULL, 'Trial Master File', 1);

INSERT INTO etmf_folders (study_id, parent_id, name, tenant_id)
VALUES (1, 1, '01. Trial Level', 1),
       (1, 1, '02. Country Level', 1),
       (1, 1, '03. Site Level', 1);
