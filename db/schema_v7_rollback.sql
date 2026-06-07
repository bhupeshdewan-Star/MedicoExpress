-- ========================================================
-- CLINCOMMAND OS™ DATABASE ROLLBACK SCRIPT - PHASE 7
-- ========================================================

-- 1. Disable RLS policies
ALTER TABLE tenants DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE sops DISABLE ROW LEVEL SECURITY;
ALTER TABLE skills DISABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE esignatures DISABLE ROW LEVEL SECURITY;
ALTER TABLE intake_forms DISABLE ROW LEVEL SECURITY;
ALTER TABLE intake_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_instances DISABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_definitions DISABLE ROW LEVEL SECURITY;
ALTER TABLE refresh_tokens DISABLE ROW LEVEL SECURITY;

-- 2. Drop Policies
DROP POLICY IF EXISTS tenant_isolation_tenants ON tenants;
DROP POLICY IF EXISTS tenant_isolation_users ON users;
DROP POLICY IF EXISTS tenant_isolation_sops ON sops;
DROP POLICY IF EXISTS tenant_isolation_skills ON skills;
DROP POLICY IF EXISTS tenant_isolation_audit ON audit_logs;
DROP POLICY IF EXISTS tenant_isolation_esign ON esignatures;
DROP POLICY IF EXISTS tenant_isolation_intake_forms ON intake_forms;
DROP POLICY IF EXISTS tenant_isolation_intake_sessions ON intake_sessions;
DROP POLICY IF EXISTS tenant_isolation_wf_inst ON workflow_instances;
DROP POLICY IF EXISTS tenant_isolation_wf_def ON workflow_definitions;
DROP POLICY IF EXISTS tenant_isolation_refresh ON refresh_tokens;

-- 3. Drop Indexes
DROP INDEX IF EXISTS idx_users_tenant;
DROP INDEX IF EXISTS idx_sops_tenant;
DROP INDEX IF EXISTS idx_skills_tenant;
DROP INDEX IF EXISTS idx_audit_logs_tenant;
DROP INDEX IF EXISTS idx_esignatures_tenant;
DROP INDEX IF EXISTS idx_intake_sessions_tenant;
DROP INDEX IF EXISTS idx_workflow_instances_tenant;
DROP INDEX IF EXISTS idx_workflow_definitions_tenant;
DROP INDEX IF EXISTS idx_refresh_tokens_tenant;
DROP INDEX IF EXISTS idx_intake_forms_tenant;

DROP INDEX IF EXISTS idx_sops_status;
DROP INDEX IF EXISTS idx_sops_created;
DROP INDEX IF EXISTS idx_audit_logs_created;
DROP INDEX IF EXISTS idx_esignatures_created;
DROP INDEX IF EXISTS idx_intake_sessions_created;
DROP INDEX IF EXISTS idx_reference_library_embedding;

-- 4. Drop Tables
DROP TABLE IF EXISTS tenant_feature_flags CASCADE;
DROP TABLE IF EXISTS compliance_validations CASCADE;
DROP TABLE IF EXISTS audit_vault_merkle_leaves CASCADE;
DROP TABLE IF EXISTS audit_vault_merkle_blocks CASCADE;
DROP TABLE IF EXISTS intake_sessions CASCADE;
DROP TABLE IF EXISTS intake_forms CASCADE;
DROP TABLE IF EXISTS refresh_tokens CASCADE;

-- 5. Drop Columns
ALTER TABLE reference_library DROP COLUMN IF EXISTS embedding;
ALTER TABLE esignatures DROP COLUMN IF EXISTS tenant_id;
ALTER TABLE audit_logs DROP COLUMN IF EXISTS tenant_id;
ALTER TABLE users DROP COLUMN IF EXISTS tenant_id;

-- 6. Disable pgvector extension (optional/conditional)
-- DROP EXTENSION IF EXISTS vector;
