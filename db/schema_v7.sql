-- ========================================================
-- CLINCOMMAND OS™ DATABASE SCHEMA MIGRATION - PHASE 7
-- ========================================================

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Ensure missing tenant columns exist on core tables
ALTER TABLE users ADD COLUMN IF NOT EXISTS tenant_id INT;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS tenant_id INT;
ALTER TABLE esignatures ADD COLUMN IF NOT EXISTS tenant_id INT;

-- 1. Refresh Tokens Table
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) UNIQUE NOT NULL,
  token_family VARCHAR(100) NOT NULL,
  device_info TEXT,
  ip_address VARCHAR(45),
  is_revoked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  tenant_id INT
);

-- 2. Intake Forms Table
CREATE TABLE IF NOT EXISTS intake_forms (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  welcome_text TEXT,
  fields JSONB NOT NULL,
  validation_rules JSONB,
  sop_mappings JSONB,
  workflow_mappings JSONB,
  tenant_id INT
);

-- 3. Intake Sessions Table
CREATE TABLE IF NOT EXISTS intake_sessions (
  id VARCHAR(100) PRIMARY KEY,
  tenant_id INT,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  domain VARCHAR(100) NOT NULL,
  current_step INT DEFAULT 1,
  form_data JSONB NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Audit Vault Merkle Blocks
CREATE TABLE IF NOT EXISTS audit_vault_merkle_blocks (
  id SERIAL PRIMARY KEY,
  block_index INT UNIQUE NOT NULL,
  merkle_root CHAR(64) NOT NULL,
  previous_block_hash CHAR(64) NOT NULL,
  block_hash CHAR(64) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Audit Vault Merkle Leaves
CREATE TABLE IF NOT EXISTS audit_vault_merkle_leaves (
  id SERIAL PRIMARY KEY,
  block_index INT REFERENCES audit_vault_merkle_blocks(block_index) ON DELETE CASCADE,
  leaf_index INT NOT NULL,
  audit_log_id INT REFERENCES audit_logs(id) ON DELETE CASCADE,
  data_hash CHAR(64) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Compliance Validations Table
CREATE TABLE IF NOT EXISTS compliance_validations (
  id SERIAL PRIMARY KEY,
  test_suite VARCHAR(50) NOT NULL, -- 'IQ', 'OQ', 'PQ'
  test_name VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL, -- 'PASSED', 'FAILED'
  executed_by INT REFERENCES users(id) ON DELETE SET NULL,
  execution_log TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  tenant_id INT
);

-- 7. Tenant Feature Flags Table
CREATE TABLE IF NOT EXISTS tenant_feature_flags (
  id SERIAL PRIMARY KEY,
  tenant_id INT REFERENCES tenants(id) ON DELETE CASCADE,
  flag_key VARCHAR(100) NOT NULL,
  flag_value BOOLEAN DEFAULT FALSE,
  UNIQUE(tenant_id, flag_key)
);

-- 8. Alter reference_library to add pgvector column
ALTER TABLE reference_library ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- 9. Index Optimization
CREATE INDEX IF NOT EXISTS idx_users_tenant ON users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_sops_tenant ON sops(tenant_id);
CREATE INDEX IF NOT EXISTS idx_skills_tenant ON skills(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant ON audit_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_esignatures_tenant ON esignatures(tenant_id);
CREATE INDEX IF NOT EXISTS idx_intake_sessions_tenant ON intake_sessions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_workflow_instances_tenant ON workflow_instances(tenant_id);
CREATE INDEX IF NOT EXISTS idx_workflow_definitions_tenant ON workflow_definitions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_tenant ON refresh_tokens(tenant_id);
CREATE INDEX IF NOT EXISTS idx_intake_forms_tenant ON intake_forms(tenant_id);

CREATE INDEX IF NOT EXISTS idx_sops_status ON sops(status);
CREATE INDEX IF NOT EXISTS idx_sops_created ON sops(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_esignatures_created ON esignatures(signed_at);
CREATE INDEX IF NOT EXISTS idx_intake_sessions_created ON intake_sessions(created_at);

-- pgvector HNSW semantic search index
CREATE INDEX IF NOT EXISTS idx_reference_library_embedding ON reference_library USING hnsw (embedding vector_cosine_ops);

-- 10. Enable Row-Level Security (RLS) on business tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sops ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE esignatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE intake_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE intake_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE refresh_tokens ENABLE ROW LEVEL SECURITY;

-- 11. Create Tenant Isolation Policies (supporting dual app connection pool session settings)
CREATE POLICY tenant_isolation_tenants ON tenants FOR ALL
  USING (id = NULLIF(current_setting('app.current_tenant_id', true), '')::integer OR current_setting('app.current_tenant_id', true) = '');

CREATE POLICY tenant_isolation_users ON users FOR ALL
  USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::integer OR current_setting('app.current_tenant_id', true) = '');

CREATE POLICY tenant_isolation_sops ON sops FOR ALL
  USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::integer OR current_setting('app.current_tenant_id', true) = '');

CREATE POLICY tenant_isolation_skills ON skills FOR ALL
  USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::integer OR current_setting('app.current_tenant_id', true) = '');

CREATE POLICY tenant_isolation_audit ON audit_logs FOR ALL
  USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::integer OR current_setting('app.current_tenant_id', true) = '');

CREATE POLICY tenant_isolation_esign ON esignatures FOR ALL
  USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::integer OR current_setting('app.current_tenant_id', true) = '');

CREATE POLICY tenant_isolation_intake_forms ON intake_forms FOR ALL
  USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::integer OR current_setting('app.current_tenant_id', true) = '');

CREATE POLICY tenant_isolation_intake_sessions ON intake_sessions FOR ALL
  USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::integer OR current_setting('app.current_tenant_id', true) = '');

CREATE POLICY tenant_isolation_wf_inst ON workflow_instances FOR ALL
  USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::integer OR current_setting('app.current_tenant_id', true) = '');

CREATE POLICY tenant_isolation_wf_def ON workflow_definitions FOR ALL
  USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::integer OR current_setting('app.current_tenant_id', true) = '');

CREATE POLICY tenant_isolation_refresh ON refresh_tokens FOR ALL
  USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::integer OR current_setting('app.current_tenant_id', true) = '');
