-- ========================================================
-- CLINCOMMAND OS™ DATABASE SCHEMA MIGRATION - PHASE 8
-- ========================================================

-- 1. Identity & SSO Tables
CREATE TABLE IF NOT EXISTS identity_providers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  provider_type VARCHAR(50) NOT NULL, -- 'SAML', 'OIDC'
  entry_point_url TEXT NOT NULL,
  issuer_url TEXT,
  cert_public_key TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  tenant_id INT NOT NULL
);

CREATE TABLE IF NOT EXISTS sso_configurations (
  id SERIAL PRIMARY KEY,
  provider_id INT REFERENCES identity_providers(id) ON DELETE CASCADE,
  client_id VARCHAR(255) NOT NULL,
  client_secret_hash VARCHAR(255),
  metadata_url TEXT,
  tenant_id INT NOT NULL
);

CREATE TABLE IF NOT EXISTS sso_sessions (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  provider_id INT REFERENCES identity_providers(id) ON DELETE CASCADE,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  tenant_id INT NOT NULL
);

CREATE TABLE IF NOT EXISTS user_mfa_devices (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  mfa_type VARCHAR(50) DEFAULT 'TOTP',
  secret_key VARCHAR(255) NOT NULL,
  recovery_codes TEXT NOT NULL, -- comma-separated double-hashed codes
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  tenant_id INT NOT NULL
);

-- 2. Permissions & RBAC Tables
CREATE TABLE IF NOT EXISTS permissions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT
);

CREATE TABLE IF NOT EXISTS role_permissions (
  role_id INT NOT NULL, -- mapped to role IDs if applicable, or custom roles mapping
  role_name VARCHAR(100) NOT NULL,
  permission_id INT REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_name, permission_id)
);

CREATE TABLE IF NOT EXISTS user_permissions (
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  permission_id INT REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, permission_id)
);

-- 3. AI Governance & Registry Tables
CREATE TABLE IF NOT EXISTS prompt_registry (
  id SERIAL PRIMARY KEY,
  prompt_key VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  tenant_id INT NOT NULL
);

CREATE TABLE IF NOT EXISTS prompt_versions (
  id SERIAL PRIMARY KEY,
  prompt_id INT REFERENCES prompt_registry(id) ON DELETE CASCADE,
  version_tag VARCHAR(50) NOT NULL,
  prompt_template TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'Draft', -- 'Draft', 'Review', 'Approved', 'Retired'
  created_by INT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  approved_by INT REFERENCES users(id) ON DELETE SET NULL,
  approved_at TIMESTAMP WITH TIME ZONE,
  tenant_id INT NOT NULL
);

CREATE TABLE IF NOT EXISTS model_registry (
  id SERIAL PRIMARY KEY,
  provider_name VARCHAR(100) NOT NULL, -- 'OpenAI', 'Anthropic', 'Gemini', 'Ollama'
  model_name VARCHAR(100) UNIQUE NOT NULL,
  cost_per_1k_input NUMERIC(8, 5) DEFAULT 0,
  cost_per_1k_output NUMERIC(8, 5) DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  tenant_id INT NOT NULL
);

CREATE TABLE IF NOT EXISTS ai_model_metrics (
  id SERIAL PRIMARY KEY,
  tenant_id INT NOT NULL,
  user_id INT REFERENCES users(id) ON DELETE SET NULL,
  model_name VARCHAR(100) NOT NULL,
  prompt_tokens INT DEFAULT 0,
  completion_tokens INT DEFAULT 0,
  latency_ms INT DEFAULT 0,
  calculated_cost NUMERIC(10, 6) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Validation Documentation & Traceability Tables
CREATE TABLE IF NOT EXISTS validation_projects (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'INITIATED', -- 'INITIATED', 'IN_PROGRESS', 'COMPLETED'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  tenant_id INT NOT NULL
);

CREATE TABLE IF NOT EXISTS validation_documents (
  id SERIAL PRIMARY KEY,
  project_id INT REFERENCES validation_projects(id) ON DELETE CASCADE,
  doc_type VARCHAR(50) NOT NULL, -- 'VAL_PLAN', 'URS', 'FRS', 'SDS', 'RTM', 'IQ', 'OQ', 'PQ'
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  version VARCHAR(20) DEFAULT '1.0.0',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  tenant_id INT NOT NULL
);

CREATE TABLE IF NOT EXISTS validation_trace_requirements (
  id SERIAL PRIMARY KEY,
  project_id INT REFERENCES validation_projects(id) ON DELETE CASCADE,
  urs_code VARCHAR(50) NOT NULL,
  frs_code VARCHAR(50) NOT NULL,
  sds_code VARCHAR(50) NOT NULL,
  test_case_id VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'TRACED',
  tenant_id INT NOT NULL
);

-- 5. Stripe Commercial Billing Tables
CREATE TABLE IF NOT EXISTS billing_subscriptions (
  id SERIAL PRIMARY KEY,
  tenant_id INT UNIQUE NOT NULL,
  stripe_customer_id VARCHAR(255) NOT NULL,
  stripe_subscription_id VARCHAR(255) NOT NULL,
  plan_tier VARCHAR(50) DEFAULT 'Starter', -- 'Starter', 'Professional', 'Enterprise', 'Validated Enterprise'
  status VARCHAR(50) NOT NULL, -- 'active', 'suspended', 'past_due'
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS billing_invoices (
  id SERIAL PRIMARY KEY,
  tenant_id INT NOT NULL,
  invoice_number VARCHAR(100) UNIQUE NOT NULL,
  amount_cents INT NOT NULL,
  status VARCHAR(50) NOT NULL, -- 'paid', 'open', 'uncollectible'
  billing_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS on new tables
ALTER TABLE identity_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sso_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE sso_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_mfa_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_model_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE validation_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE validation_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE validation_trace_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_invoices ENABLE ROW LEVEL SECURITY;

-- Apply Tenant Isolation RLS Policies
CREATE POLICY tenant_isolation_id_prov ON identity_providers FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::integer OR current_setting('app.current_tenant_id', true) = '');
CREATE POLICY tenant_isolation_sso_config ON sso_configurations FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::integer OR current_setting('app.current_tenant_id', true) = '');
CREATE POLICY tenant_isolation_sso_sess ON sso_sessions FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::integer OR current_setting('app.current_tenant_id', true) = '');
CREATE POLICY tenant_isolation_mfa ON user_mfa_devices FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::integer OR current_setting('app.current_tenant_id', true) = '');
CREATE POLICY tenant_isolation_prompt_reg ON prompt_registry FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::integer OR current_setting('app.current_tenant_id', true) = '');
CREATE POLICY tenant_isolation_prompt_vers ON prompt_versions FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::integer OR current_setting('app.current_tenant_id', true) = '');
CREATE POLICY tenant_isolation_model_reg ON model_registry FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::integer OR current_setting('app.current_tenant_id', true) = '');
CREATE POLICY tenant_isolation_ai_metrics ON ai_model_metrics FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::integer OR current_setting('app.current_tenant_id', true) = '');
CREATE POLICY tenant_isolation_val_proj ON validation_projects FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::integer OR current_setting('app.current_tenant_id', true) = '');
CREATE POLICY tenant_isolation_val_docs ON validation_documents FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::integer OR current_setting('app.current_tenant_id', true) = '');
CREATE POLICY tenant_isolation_val_trace ON validation_trace_requirements FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::integer OR current_setting('app.current_tenant_id', true) = '');
CREATE POLICY tenant_isolation_sub ON billing_subscriptions FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::integer OR current_setting('app.current_tenant_id', true) = '');
CREATE POLICY tenant_isolation_inv ON billing_invoices FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::integer OR current_setting('app.current_tenant_id', true) = '');
