-- ========================================================
-- CLINCOMMAND OS™ DATABASE ROLLBACK SCHEMA - PHASE 8
-- ========================================================

-- Drop Policies
DROP POLICY IF EXISTS tenant_isolation_id_prov ON identity_providers;
DROP POLICY IF EXISTS tenant_isolation_sso_config ON sso_configurations;
DROP POLICY IF EXISTS tenant_isolation_sso_sess ON sso_sessions;
DROP POLICY IF EXISTS tenant_isolation_mfa ON user_mfa_devices;
DROP POLICY IF EXISTS tenant_isolation_prompt_reg ON prompt_registry;
DROP POLICY IF EXISTS tenant_isolation_prompt_vers ON prompt_versions;
DROP POLICY IF EXISTS tenant_isolation_model_reg ON model_registry;
DROP POLICY IF EXISTS tenant_isolation_ai_metrics ON ai_model_metrics;
DROP POLICY IF EXISTS tenant_isolation_val_proj ON validation_projects;
DROP POLICY IF EXISTS tenant_isolation_val_docs ON validation_documents;
DROP POLICY IF EXISTS tenant_isolation_val_trace ON validation_trace_requirements;
DROP POLICY IF EXISTS tenant_isolation_sub ON billing_subscriptions;
DROP POLICY IF EXISTS tenant_isolation_inv ON billing_invoices;

-- Drop Tables
DROP TABLE IF EXISTS billing_invoices CASCADE;
DROP TABLE IF EXISTS billing_subscriptions CASCADE;
DROP TABLE IF EXISTS validation_trace_requirements CASCADE;
DROP TABLE IF EXISTS validation_documents CASCADE;
DROP TABLE IF EXISTS validation_projects CASCADE;
DROP TABLE IF EXISTS ai_model_metrics CASCADE;
DROP TABLE IF EXISTS model_registry CASCADE;
DROP TABLE IF EXISTS prompt_versions CASCADE;
DROP TABLE IF EXISTS prompt_registry CASCADE;
DROP TABLE IF EXISTS user_permissions CASCADE;
DROP TABLE IF EXISTS role_permissions CASCADE;
DROP TABLE IF EXISTS permissions CASCADE;
DROP TABLE IF EXISTS user_mfa_devices CASCADE;
DROP TABLE IF EXISTS sso_sessions CASCADE;
DROP TABLE IF EXISTS sso_configurations CASCADE;
DROP TABLE IF EXISTS identity_providers CASCADE;
