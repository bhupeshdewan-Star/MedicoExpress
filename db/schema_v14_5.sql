-- ========================================================
-- CLINCOMMAND OS™ DATABASE SCHEMA MIGRATION - PHASE 14.5
-- ========================================================

-- 1. Table: study_form_definitions (Sponsor eCRF template designs)
CREATE TABLE IF NOT EXISTS study_form_definitions (
  id SERIAL PRIMARY KEY,
  study_id INT NOT NULL REFERENCES studies(id) ON DELETE CASCADE,
  form_name VARCHAR(100) NOT NULL,
  form_version VARCHAR(20) NOT NULL,
  status VARCHAR(50) DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'ACTIVE', 'RETIRED')),
  form_layout JSONB NOT NULL,
  validation_rules JSONB NOT NULL,
  tenant_id INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(study_id, form_name, form_version)
);

CREATE INDEX IF NOT EXISTS idx_form_defs_study_tenant ON study_form_definitions(study_id, tenant_id);
CREATE INDEX IF NOT EXISTS idx_form_defs_layout_ops ON study_form_definitions USING gin (form_layout jsonb_path_ops);

-- 2. Table: subject_form_submissions (Subject Case book submissions)
CREATE TABLE IF NOT EXISTS subject_form_submissions (
  id SERIAL PRIMARY KEY,
  subject_id INT NOT NULL REFERENCES study_subjects(id) ON DELETE CASCADE,
  form_definition_id INT NOT NULL REFERENCES study_form_definitions(id) ON DELETE RESTRICT,
  visit_id INT NOT NULL REFERENCES subject_visits(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'INITIAL' CHECK (status IN ('INITIAL', 'IN_PROGRESS', 'COMPLETED', 'UNDER_QUERY', 'DATA_MANAGER_REVIEW', 'MEDICAL_REVIEW', 'SAFETY_REVIEW', 'SDV_VERIFIED', 'LOCKED')),
  entered_by INT REFERENCES users(id) ON DELETE SET NULL,
  sdv_by INT REFERENCES users(id) ON DELETE SET NULL,
  sdv_at TIMESTAMP WITH TIME ZONE,
  locked_by INT REFERENCES users(id) ON DELETE SET NULL,
  locked_at TIMESTAMP WITH TIME ZONE,
  tenant_id INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_submissions_subject_visit ON subject_form_submissions(subject_id, visit_id, tenant_id);

-- 3. Table: subject_form_data_points (Dynamic variables storage - Hash Partitioned by tenant_id)
CREATE TABLE subject_form_data_points (
  id BIGSERIAL,
  submission_id INT NOT NULL REFERENCES subject_form_submissions(id) ON DELETE CASCADE,
  field_key VARCHAR(100) NOT NULL,
  field_value TEXT,
  is_blinded BOOLEAN DEFAULT FALSE,
  tenant_id INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id, tenant_id)
) PARTITION BY HASH (tenant_id);

-- Hash partition buckets allocation
CREATE TABLE subject_form_data_points_0 PARTITION OF subject_form_data_points FOR VALUES WITH (modulus 4, remainder 0);
CREATE TABLE subject_form_data_points_1 PARTITION OF subject_form_data_points FOR VALUES WITH (modulus 4, remainder 1);
CREATE TABLE subject_form_data_points_2 PARTITION OF subject_form_data_points FOR VALUES WITH (modulus 4, remainder 2);
CREATE TABLE subject_form_data_points_3 PARTITION OF subject_form_data_points FOR VALUES WITH (modulus 4, remainder 3);

CREATE INDEX idx_data_points_submission_key ON subject_form_data_points(submission_id, field_key);

-- 4. Table: subject_data_queries (Clinical queries workflow)
CREATE TABLE IF NOT EXISTS subject_data_queries (
  id SERIAL PRIMARY KEY,
  submission_id INT NOT NULL REFERENCES subject_form_submissions(id) ON DELETE CASCADE,
  field_key VARCHAR(100) NOT NULL,
  query_text TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'ANSWERED', 'RESOLVED', 'CLOSED')),
  raised_by INT REFERENCES users(id) ON DELETE SET NULL,
  raised_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  resolved_by INT REFERENCES users(id) ON DELETE SET NULL,
  resolution_text TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  closed_by INT REFERENCES users(id) ON DELETE SET NULL,
  closed_at TIMESTAMP WITH TIME ZONE,
  tenant_id INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_queries_lookup ON subject_data_queries(submission_id, field_key, status, tenant_id);

-- 5. Table: subject_query_comments (Query discussion comments)
CREATE TABLE IF NOT EXISTS subject_query_comments (
  id SERIAL PRIMARY KEY,
  query_id INT NOT NULL REFERENCES subject_data_queries(id) ON DELETE CASCADE,
  comment_text TEXT NOT NULL,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_role VARCHAR(50) NOT NULL,
  tenant_id INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_query_comments_thread ON subject_query_comments(query_id, created_at, tenant_id);

-- 6. Table: study_data_locks (Hierarchical freezes & locks)
CREATE TABLE IF NOT EXISTS study_data_locks (
  id SERIAL PRIMARY KEY,
  lock_level VARCHAR(50) NOT NULL CHECK (lock_level IN ('STUDY', 'SITE', 'SUBJECT', 'VISIT')),
  study_id INT NOT NULL REFERENCES studies(id) ON DELETE CASCADE,
  site_id INT REFERENCES study_sites(id) ON DELETE CASCADE,
  subject_id INT REFERENCES study_subjects(id) ON DELETE CASCADE,
  visit_id INT REFERENCES subject_visits(id) ON DELETE CASCADE,
  is_frozen BOOLEAN DEFAULT FALSE,
  is_locked BOOLEAN DEFAULT FALSE,
  locked_by INT REFERENCES users(id) ON DELETE SET NULL,
  locked_at TIMESTAMP WITH TIME ZONE,
  lock_reason TEXT,
  tenant_id INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_lock_fields CHECK (
    (lock_level = 'STUDY' AND site_id IS NULL AND subject_id IS NULL AND visit_id IS NULL) OR
    (lock_level = 'SITE' AND site_id IS NOT NULL AND subject_id IS NULL AND visit_id IS NULL) OR
    (lock_level = 'SUBJECT' AND site_id IS NULL AND subject_id IS NOT NULL AND visit_id IS NULL) OR
    (lock_level = 'VISIT' AND site_id IS NULL AND subject_id IS NULL AND visit_id IS NOT NULL)
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_study_lock_v14_5 ON study_data_locks(study_id, tenant_id) WHERE lock_level = 'STUDY';
CREATE UNIQUE INDEX IF NOT EXISTS uq_site_lock_v14_5 ON study_data_locks(site_id, tenant_id) WHERE lock_level = 'SITE';
CREATE UNIQUE INDEX IF NOT EXISTS uq_subject_lock_v14_5 ON study_data_locks(subject_id, tenant_id) WHERE lock_level = 'SUBJECT';
CREATE UNIQUE INDEX IF NOT EXISTS uq_visit_lock_v14_5 ON study_data_locks(visit_id, tenant_id) WHERE lock_level = 'VISIT';

-- 7. Table: medical_coding_terms (Dictionary annotations)
CREATE TABLE IF NOT EXISTS medical_coding_terms (
  id SERIAL PRIMARY KEY,
  data_point_id BIGINT NOT NULL,
  tenant_id INT NOT NULL DEFAULT 1,
  dictionary_type VARCHAR(50) NOT NULL CHECK (dictionary_type IN ('MedDRA', 'WHODrug')),
  code VARCHAR(50) NOT NULL,
  term_text TEXT NOT NULL,
  dictionary_version VARCHAR(20) NOT NULL,
  coded_by INT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (data_point_id, tenant_id) REFERENCES subject_form_data_points(id, tenant_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_medical_coding_data_point ON medical_coding_terms(data_point_id, tenant_id);

-- 8. Table: subject_data_point_history (Data history edits track - Range Partitioned by created_at)
CREATE TABLE subject_data_point_history (
  id BIGSERIAL,
  data_point_id BIGINT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  change_reason TEXT NOT NULL,
  user_id INT REFERENCES users(id) ON DELETE SET NULL,
  tenant_id INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

-- Range partition buckets
CREATE TABLE subject_data_point_history_y2026m06 PARTITION OF subject_data_point_history FOR VALUES FROM ('2026-06-01 00:00:00+00') TO ('2026-07-01 00:00:00+00');
CREATE TABLE subject_data_point_history_y2026m07 PARTITION OF subject_data_point_history FOR VALUES FROM ('2026-07-01 00:00:00+00') TO ('2026-08-01 00:00:00+00');
CREATE TABLE subject_data_point_history_default PARTITION OF subject_data_point_history DEFAULT;

CREATE INDEX idx_data_history_data_point ON subject_data_point_history(data_point_id);

-- Enable RLS
ALTER TABLE study_form_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subject_form_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subject_form_data_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE subject_data_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE subject_query_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_data_locks ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_coding_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE subject_data_point_history ENABLE ROW LEVEL SECURITY;

-- Tenant Isolation RLS Policies
DROP POLICY IF EXISTS tenant_isolation_form_definitions ON study_form_definitions;
DROP POLICY IF EXISTS tenant_isolation_submissions ON subject_form_submissions;
DROP POLICY IF EXISTS tenant_isolation_data_points ON subject_form_data_points;
DROP POLICY IF EXISTS tenant_isolation_queries ON subject_data_queries;
DROP POLICY IF EXISTS tenant_isolation_query_comments ON subject_query_comments;
DROP POLICY IF EXISTS tenant_isolation_locks ON study_data_locks;
DROP POLICY IF EXISTS tenant_isolation_coding_terms ON medical_coding_terms;
DROP POLICY IF EXISTS tenant_isolation_dp_history ON subject_data_point_history;

CREATE POLICY tenant_isolation_form_definitions ON study_form_definitions FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::integer OR current_setting('app.current_tenant_id', true) = '');
CREATE POLICY tenant_isolation_submissions ON subject_form_submissions FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::integer OR current_setting('app.current_tenant_id', true) = '');
CREATE POLICY tenant_isolation_data_points ON subject_form_data_points FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::integer OR current_setting('app.current_tenant_id', true) = '');
CREATE POLICY tenant_isolation_queries ON subject_data_queries FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::integer OR current_setting('app.current_tenant_id', true) = '');
CREATE POLICY tenant_isolation_query_comments ON subject_query_comments FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::integer OR current_setting('app.current_tenant_id', true) = '');
CREATE POLICY tenant_isolation_locks ON study_data_locks FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::integer OR current_setting('app.current_tenant_id', true) = '');
CREATE POLICY tenant_isolation_coding_terms ON medical_coding_terms FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::integer OR current_setting('app.current_tenant_id', true) = '');
CREATE POLICY tenant_isolation_dp_history ON subject_data_point_history FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::integer OR current_setting('app.current_tenant_id', true) = '');
