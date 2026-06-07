-- ========================================================
-- CLINCOMMAND OS™ DATABASE MIGRATIONS - PHASES 2 TO 6
-- ========================================================

-- 1. Multi-Tenant foundation
CREATE TABLE IF NOT EXISTS tenants (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  domain VARCHAR(255) UNIQUE,
  status VARCHAR(50) DEFAULT 'ACTIVE',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tenant_settings (
  id SERIAL PRIMARY KEY,
  tenant_id INT REFERENCES tenants(id) ON DELETE CASCADE,
  setting_key VARCHAR(100) NOT NULL,
  setting_value TEXT NOT NULL,
  UNIQUE(tenant_id, setting_key)
);

CREATE TABLE IF NOT EXISTS tenant_workspaces (
  id SERIAL PRIMARY KEY,
  tenant_id INT REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tenant_id, name)
);

-- 2. Organizations & Hierarchies
CREATE TABLE IF NOT EXISTS organizations (
  id SERIAL PRIMARY KEY,
  tenant_id INT REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS departments (
  id SERIAL PRIMARY KEY,
  org_id INT REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  parent_dept_id INT REFERENCES departments(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS business_units (
  id SERIAL PRIMARY KEY,
  dept_id INT REFERENCES departments(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS teams (
  id SERIAL PRIMARY KEY,
  unit_id INT REFERENCES business_units(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL
);

-- 3. Granular RBAC permissions
CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  parent_role_id INT REFERENCES roles(id) ON DELETE SET NULL,
  role_scope VARCHAR(50) NOT NULL DEFAULT 'GLOBAL'
);

CREATE TABLE IF NOT EXISTS permissions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT
);

CREATE TABLE IF NOT EXISTS role_permissions (
  role_id INT REFERENCES roles(id) ON DELETE CASCADE,
  permission_id INT REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS user_roles (
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  role_id INT REFERENCES roles(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, role_id)
);

-- 4. Knowledge Repository Master Content Layer
CREATE TABLE IF NOT EXISTS knowledge_collections (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  parent_id INT REFERENCES knowledge_collections(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS knowledge_documents (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  collection_id INT REFERENCES knowledge_collections(id) ON DELETE SET NULL,
  current_version VARCHAR(20) NOT NULL DEFAULT '1.0.0',
  content TEXT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'Draft',
  created_by INT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS knowledge_document_versions (
  id SERIAL PRIMARY KEY,
  document_id INT REFERENCES knowledge_documents(id) ON DELETE CASCADE,
  version VARCHAR(20) NOT NULL,
  content TEXT NOT NULL,
  change_summary TEXT NOT NULL,
  created_by INT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS knowledge_tags (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS knowledge_document_tags (
  document_id INT REFERENCES knowledge_documents(id) ON DELETE CASCADE,
  tag_id INT REFERENCES knowledge_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (document_id, tag_id)
);

CREATE TABLE IF NOT EXISTS knowledge_relationships (
  id SERIAL PRIMARY KEY,
  source_doc_id INT REFERENCES knowledge_documents(id) ON DELETE CASCADE,
  target_doc_id INT REFERENCES knowledge_documents(id) ON DELETE CASCADE,
  relationship_type VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Product Knowledge Foundation
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  generic_name VARCHAR(255) NOT NULL,
  therapeutic_class VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS product_indications (
  id SERIAL PRIMARY KEY,
  product_id INT REFERENCES products(id) ON DELETE CASCADE,
  indication_name VARCHAR(255) NOT NULL,
  description TEXT,
  approval_date DATE
);

CREATE TABLE IF NOT EXISTS product_trials (
  id SERIAL PRIMARY KEY,
  product_id INT REFERENCES products(id) ON DELETE CASCADE,
  nct_id VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  phase VARCHAR(50) NOT NULL,
  status VARCHAR(100) NOT NULL,
  results_summary TEXT
);

CREATE TABLE IF NOT EXISTS product_competitors (
  id SERIAL PRIMARY KEY,
  product_id INT REFERENCES products(id) ON DELETE CASCADE,
  competitor_name VARCHAR(100) NOT NULL,
  competitor_product_name VARCHAR(100) NOT NULL,
  comparison_notes TEXT
);

CREATE TABLE IF NOT EXISTS product_swot (
  id SERIAL PRIMARY KEY,
  product_id INT REFERENCES products(id) ON DELETE CASCADE,
  swot_type VARCHAR(20) NOT NULL,
  factor TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS product_publications (
  id SERIAL PRIMARY KEY,
  product_id INT REFERENCES products(id) ON DELETE CASCADE,
  pubmed_id VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  authors TEXT,
  journal VARCHAR(255),
  publication_date DATE,
  abstract TEXT
);

-- 6. Skills Registry Foundations
CREATE TABLE IF NOT EXISTS skill_categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT
);

CREATE TABLE IF NOT EXISTS skill_templates (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  prompt_template TEXT NOT NULL,
  input_schema JSONB NOT NULL,
  output_schema JSONB NOT NULL,
  created_by INT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS skills (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  category_id INT REFERENCES skill_categories(id) ON DELETE SET NULL,
  template_id INT REFERENCES skill_templates(id) ON DELETE SET NULL,
  current_version VARCHAR(20) NOT NULL DEFAULT '1.0.0',
  is_published BOOLEAN DEFAULT FALSE,
  system_prompt TEXT,
  user_prompt TEXT,
  validation_rules JSONB DEFAULT '{}',
  execution_policy JSONB DEFAULT '{}',
  created_by INT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS skill_versions (
  id SERIAL PRIMARY KEY,
  skill_id INT REFERENCES skills(id) ON DELETE CASCADE,
  version VARCHAR(20) NOT NULL,
  prompt_template TEXT NOT NULL,
  input_schema JSONB NOT NULL,
  output_schema JSONB NOT NULL,
  change_summary TEXT,
  created_by INT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS skill_workflows (
  id SERIAL PRIMARY KEY,
  skill_id INT REFERENCES skills(id) ON DELETE CASCADE,
  steps_config JSONB NOT NULL,
  created_by INT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS skill_executions (
  id SERIAL PRIMARY KEY,
  skill_id INT REFERENCES skills(id) ON DELETE CASCADE,
  user_id INT REFERENCES users(id) ON DELETE SET NULL,
  input_data JSONB NOT NULL,
  output_data JSONB NOT NULL,
  model_used VARCHAR(100) NOT NULL,
  execution_time_ms INT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS skill_feedback (
  id SERIAL PRIMARY KEY,
  execution_id INT REFERENCES skill_executions(id) ON DELETE CASCADE,
  user_id INT REFERENCES users(id) ON DELETE SET NULL,
  rating INT CHECK (rating BETWEEN 1 AND 5),
  comments TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Polymorphic Generic Workflows
CREATE TABLE IF NOT EXISTS workflow_definitions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_by INT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS workflow_stages (
  id SERIAL PRIMARY KEY,
  definition_id INT REFERENCES workflow_definitions(id) ON DELETE CASCADE,
  stage_name VARCHAR(100) NOT NULL,
  stage_order INT NOT NULL,
  role_requirement VARCHAR(100) NOT NULL,
  is_parallel BOOLEAN DEFAULT FALSE,
  required_approvers_count INT DEFAULT 1,
  sla_hours INT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS workflow_instances (
  id SERIAL PRIMARY KEY,
  definition_id INT REFERENCES workflow_definitions(id) ON DELETE RESTRICT,
  resource_type VARCHAR(100) NOT NULL,
  resource_id INT NOT NULL,
  current_stage_id INT REFERENCES workflow_stages(id) ON DELETE SET NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'IN_PROGRESS',
  started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS workflow_tasks (
  id SERIAL PRIMARY KEY,
  instance_id INT REFERENCES workflow_instances(id) ON DELETE CASCADE,
  stage_id INT REFERENCES workflow_stages(id) ON DELETE RESTRICT,
  assigned_role VARCHAR(100) NOT NULL,
  assigned_user_id INT REFERENCES users(id) ON DELETE SET NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  due_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  action_status VARCHAR(50) DEFAULT 'PENDING'
);

CREATE TABLE IF NOT EXISTS workflow_history (
  id SERIAL PRIMARY KEY,
  instance_id INT REFERENCES workflow_instances(id) ON DELETE CASCADE,
  stage_name VARCHAR(100) NOT NULL,
  action_by INT REFERENCES users(id) ON DELETE SET NULL,
  action_type VARCHAR(100) NOT NULL,
  comments TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Global Search Index
CREATE TABLE IF NOT EXISTS search_index (
  id SERIAL PRIMARY KEY,
  entity_type VARCHAR(100) NOT NULL,
  entity_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  searchable_content TEXT NOT NULL,
  tags VARCHAR(255),
  status VARCHAR(50),
  search_vector TSVECTOR
);

-- 9. Product Appraisals Sections Registry
CREATE TABLE IF NOT EXISTS product_appraisal_templates (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  structure_json JSONB NOT NULL,
  created_by INT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS product_appraisals (
  id SERIAL PRIMARY KEY,
  product_id INT REFERENCES products(id) ON DELETE CASCADE,
  template_id INT REFERENCES product_appraisal_templates(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  current_version VARCHAR(20) NOT NULL DEFAULT '1.0.0',
  status VARCHAR(50) NOT NULL DEFAULT 'Draft',
  created_by INT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS product_appraisal_sections (
  id SERIAL PRIMARY KEY,
  appraisal_id INT REFERENCES product_appraisals(id) ON DELETE CASCADE,
  section_key VARCHAR(100) NOT NULL,
  version VARCHAR(20) NOT NULL DEFAULT '1.0.0',
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'Draft',
  updated_by INT REFERENCES users(id) ON DELETE SET NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(appraisal_id, section_key)
);

CREATE TABLE IF NOT EXISTS product_appraisal_comments (
  id SERIAL PRIMARY KEY,
  appraisal_id INT REFERENCES product_appraisals(id) ON DELETE CASCADE,
  user_id INT REFERENCES users(id) ON DELETE SET NULL,
  comment_text TEXT NOT NULL,
  section_key VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Asynchronous Exporter Job Queues
CREATE TABLE IF NOT EXISTS document_export_jobs (
  id SERIAL PRIMARY KEY,
  resource_type VARCHAR(100) NOT NULL,
  resource_id INT NOT NULL,
  file_type VARCHAR(20) NOT NULL,
  status VARCHAR(50) DEFAULT 'QUEUED',
  error_message TEXT,
  sha256_hash CHAR(64),
  filepath VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS document_export_templates (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  file_type VARCHAR(20) NOT NULL,
  layout_config JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS document_exports (
  id SERIAL PRIMARY KEY,
  job_id INT REFERENCES document_export_jobs(id) ON DELETE CASCADE,
  resource_type VARCHAR(100) NOT NULL,
  resource_id INT NOT NULL,
  file_type VARCHAR(20) NOT NULL,
  exported_by INT REFERENCES users(id) ON DELETE SET NULL,
  sha256_hash CHAR(64) NOT NULL,
  exported_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS document_export_logs (
  id SERIAL PRIMARY KEY,
  export_id INT REFERENCES document_exports(id) ON DELETE CASCADE,
  action_type VARCHAR(100) NOT NULL,
  performed_by INT REFERENCES users(id) ON DELETE SET NULL,
  ip_address VARCHAR(45) NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Human in the Loop Review Queue
CREATE TABLE IF NOT EXISTS ai_review_queue (
  id SERIAL PRIMARY KEY,
  entity_type VARCHAR(100) NOT NULL,
  entity_id INT NOT NULL,
  prompt_version_id INT,
  model_used VARCHAR(100) NOT NULL,
  raw_output TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'PENDING',
  reviewer_id INT REFERENCES users(id) ON DELETE SET NULL,
  review_comments TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TIMESTAMP WITH TIME ZONE
);

-- 12. Reference Library
CREATE TABLE IF NOT EXISTS reference_library (
  id SERIAL PRIMARY KEY,
  source_type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  external_id VARCHAR(100) UNIQUE,
  authors TEXT,
  journal_or_publisher VARCHAR(255),
  publication_date DATE,
  content_abstract TEXT,
  full_text_url VARCHAR(500),
  metadata_json JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reference_tags (
  id SERIAL PRIMARY KEY,
  reference_id INT REFERENCES reference_library(id) ON DELETE CASCADE,
  tag_name VARCHAR(100) NOT NULL,
  UNIQUE(reference_id, tag_name)
);

CREATE TABLE IF NOT EXISTS reference_relationships (
  id SERIAL PRIMARY KEY,
  source_ref_id INT REFERENCES reference_library(id) ON DELETE CASCADE,
  target_ref_id INT REFERENCES reference_library(id) ON DELETE CASCADE,
  relationship_type VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. Learning Academy
CREATE TABLE IF NOT EXISTS training_courses (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  code VARCHAR(50) UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS training_modules (
  id SERIAL PRIMARY KEY,
  course_id INT REFERENCES training_courses(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  module_order INT NOT NULL
);

CREATE TABLE IF NOT EXISTS training_assessments (
  id SERIAL PRIMARY KEY,
  module_id INT REFERENCES training_modules(id) ON DELETE CASCADE,
  question_json JSONB NOT NULL,
  passing_score INT DEFAULT 80
);

CREATE TABLE IF NOT EXISTS training_attempts (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  assessment_id INT REFERENCES training_assessments(id) ON DELETE CASCADE,
  score INT NOT NULL,
  is_passed BOOLEAN DEFAULT FALSE,
  attempted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS training_certificates (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  course_id INT REFERENCES training_courses(id) ON DELETE CASCADE,
  certificate_number VARCHAR(100) UNIQUE NOT NULL,
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 14. Background Job Queue
CREATE TABLE IF NOT EXISTS job_queue (
  id SERIAL PRIMARY KEY,
  job_type VARCHAR(100) NOT NULL,
  payload_json JSONB NOT NULL,
  status VARCHAR(50) DEFAULT 'QUEUED',
  attempts INT DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS job_history (
  id SERIAL PRIMARY KEY,
  job_id INT REFERENCES job_queue(id) ON DELETE CASCADE,
  job_type VARCHAR(100) NOT NULL,
  status VARCHAR(50) NOT NULL,
  details TEXT,
  duration_ms INT,
  executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 15. Configurations settings
CREATE TABLE IF NOT EXISTS system_configuration (
  id SERIAL PRIMARY KEY,
  config_key VARCHAR(100) UNIQUE NOT NULL,
  config_value TEXT NOT NULL,
  config_group VARCHAR(100) NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 16. Cryptographic Audit Vault
CREATE TABLE IF NOT EXISTS audit_vault (
  id SERIAL PRIMARY KEY,
  tenant_id INT,
  user_id INT REFERENCES users(id) ON DELETE SET NULL,
  username VARCHAR(100) NOT NULL,
  action_type VARCHAR(100) NOT NULL,
  target_resource VARCHAR(255) NOT NULL,
  payload TEXT NOT NULL,
  previous_vault_hash CHAR(64),
  vault_hash CHAR(64) NOT NULL,
  digital_signature TEXT,
  ip_address VARCHAR(45) NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 17. Document managementFolders
CREATE TABLE IF NOT EXISTS document_folders (
  id SERIAL PRIMARY KEY,
  tenant_id INT,
  name VARCHAR(100) NOT NULL,
  parent_folder_id INT REFERENCES document_folders(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 18. Offline change journal
CREATE TABLE IF NOT EXISTS offline_change_journal (
  id SERIAL PRIMARY KEY,
  entity_type VARCHAR(100) NOT NULL,
  entity_id INT NOT NULL,
  operation_type VARCHAR(20) NOT NULL,
  payload_json TEXT NOT NULL,
  last_modified_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  is_synced BOOLEAN DEFAULT FALSE
);

-- 19. Knowledge graph networks
CREATE TABLE IF NOT EXISTS knowledge_entities (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  entity_type VARCHAR(100) NOT NULL,
  metadata_json JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS knowledge_entity_relationships (
  id SERIAL PRIMARY KEY,
  source_entity_id INT REFERENCES knowledge_entities(id) ON DELETE CASCADE,
  target_entity_id INT REFERENCES knowledge_entities(id) ON DELETE CASCADE,
  relationship_type VARCHAR(100) NOT NULL,
  strength REAL DEFAULT 1.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS knowledge_entity_mentions (
  id SERIAL PRIMARY KEY,
  entity_id INT REFERENCES knowledge_entities(id) ON DELETE CASCADE,
  source_type VARCHAR(100) NOT NULL,
  source_id INT NOT NULL,
  context_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 20. Evidence and Providences citation
CREATE TABLE IF NOT EXISTS evidence_sources (
  id SERIAL PRIMARY KEY,
  source_type VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  provenance_url VARCHAR(500),
  publisher_or_journal VARCHAR(255),
  publication_date DATE,
  verification_checksum CHAR(64) NOT NULL
);

CREATE TABLE IF NOT EXISTS evidence_links (
  id SERIAL PRIMARY KEY,
  source_id INT REFERENCES evidence_sources(id) ON DELETE CASCADE,
  target_type VARCHAR(100) NOT NULL,
  target_id INT NOT NULL,
  provenance_quote TEXT NOT NULL,
  confidence_score REAL DEFAULT 1.0
);

CREATE TABLE IF NOT EXISTS citation_registry (
  id SERIAL PRIMARY KEY,
  entity_type VARCHAR(100) NOT NULL,
  entity_id INT NOT NULL,
  citation_style VARCHAR(50) DEFAULT 'AMA',
  formatted_citation TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 21. Multi LLM router benchmark checks
CREATE TABLE IF NOT EXISTS ai_routing_rules (
  id SERIAL PRIMARY KEY,
  skill_type VARCHAR(100) NOT NULL,
  preferred_model VARCHAR(100) NOT NULL,
  fallback_model VARCHAR(100),
  max_cost_limit REAL,
  max_latency_ms INT,
  compliance_policy_id INT,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS ai_model_benchmarks (
  id SERIAL PRIMARY KEY,
  model_name VARCHAR(100) NOT NULL,
  provider VARCHAR(50) NOT NULL,
  avg_latency_ms INT,
  avg_cost_per_1k_tokens REAL,
  quality_score REAL,
  last_evaluated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ai_cost_tracking (
  id SERIAL PRIMARY KEY,
  execution_id INT,
  user_id INT REFERENCES users(id) ON DELETE SET NULL,
  model_name VARCHAR(100) NOT NULL,
  input_tokens INT,
  output_tokens INT,
  cost_usd REAL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 22. Agent Framework Memory
CREATE TABLE IF NOT EXISTS agent_registry (
  id SERIAL PRIMARY KEY,
  agent_name VARCHAR(100) UNIQUE NOT NULL,
  agent_role VARCHAR(100) NOT NULL,
  system_prompt TEXT NOT NULL,
  skills_list JSONB NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS agent_tasks (
  id SERIAL PRIMARY KEY,
  agent_id INT REFERENCES agent_registry(id) ON DELETE CASCADE,
  task_title VARCHAR(255) NOT NULL,
  task_description TEXT,
  assigned_by INT REFERENCES users(id) ON DELETE SET NULL,
  status VARCHAR(50) DEFAULT 'PENDING',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS agent_runs (
  id SERIAL PRIMARY KEY,
  task_id INT REFERENCES agent_tasks(id) ON DELETE CASCADE,
  model_used VARCHAR(100) NOT NULL,
  run_log TEXT NOT NULL,
  status VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS agent_memory (
  id SERIAL PRIMARY KEY,
  agent_id INT REFERENCES agent_registry(id) ON DELETE CASCADE,
  memory_key VARCHAR(100) NOT NULL,
  memory_value TEXT NOT NULL,
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 23. Regulatory updates tracking
CREATE TABLE IF NOT EXISTS regulatory_updates (
  id SERIAL PRIMARY KEY,
  source_authority VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  summary TEXT,
  publish_date DATE,
  guideline_url VARCHAR(500),
  raw_content_path VARCHAR(500),
  ingested_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS health_authority_notices (
  id SERIAL PRIMARY KEY,
  regulatory_update_id INT REFERENCES regulatory_updates(id) ON DELETE CASCADE,
  notice_type VARCHAR(100) NOT NULL,
  impact_level VARCHAR(50) NOT NULL,
  alert_sent_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS guideline_library (
  id SERIAL PRIMARY KEY,
  code VARCHAR(100) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  scope TEXT,
  version VARCHAR(20) NOT NULL DEFAULT '1.0.0',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 24. Product market and KOL tracking
CREATE TABLE IF NOT EXISTS product_market_data (
  id SERIAL PRIMARY KEY,
  product_id INT REFERENCES products(id) ON DELETE CASCADE,
  market_share_percentage REAL,
  sales_revenue_usd REAL,
  territory VARCHAR(100) NOT NULL,
  quarter VARCHAR(20) NOT NULL
);

CREATE TABLE IF NOT EXISTS product_competitor_tracking (
  id SERIAL PRIMARY KEY,
  product_id INT REFERENCES products(id) ON DELETE CASCADE,
  competitor_product_id INT REFERENCES products(id) ON DELETE SET NULL,
  market_threat_level VARCHAR(50) NOT NULL,
  latest_news TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS product_kol_tracking (
  id SERIAL PRIMARY KEY,
  product_id INT REFERENCES products(id) ON DELETE CASCADE,
  kol_name VARCHAR(100) NOT NULL,
  activity_type VARCHAR(100) NOT NULL,
  activity_details TEXT,
  activity_date DATE
);

-- 25. Executive Analytics snaps
CREATE TABLE IF NOT EXISTS analytics_snapshots (
  id SERIAL PRIMARY KEY,
  snapshot_date DATE NOT NULL,
  metrics_json JSONB NOT NULL,
  department VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS kpi_registry (
  id SERIAL PRIMARY KEY,
  kpi_name VARCHAR(100) UNIQUE NOT NULL,
  kpi_target REAL NOT NULL,
  kpi_actual REAL,
  unit VARCHAR(50) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 26. Security events
CREATE TABLE IF NOT EXISTS security_events (
  id SERIAL PRIMARY KEY,
  event_type VARCHAR(100) NOT NULL,
  user_id INT REFERENCES users(id) ON DELETE SET NULL,
  ip_address VARCHAR(45) NOT NULL,
  details TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS data_access_logs (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE SET NULL,
  accessed_table VARCHAR(100) NOT NULL,
  accessed_record_id INT NOT NULL,
  action_type VARCHAR(50) NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS retention_policies (
  id SERIAL PRIMARY KEY,
  table_name VARCHAR(100) UNIQUE NOT NULL,
  retention_years INT NOT NULL,
  description TEXT
);

-- 27. Compliance Management Framework (CAPAs, IQ/OQ/PQ)
CREATE TABLE IF NOT EXISTS compliance_validations (
  id SERIAL PRIMARY KEY,
  tenant_id INT,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'PENDING',
  execution_log TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS compliance_change_controls (
  id SERIAL PRIMARY KEY,
  tenant_id INT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  change_reason TEXT,
  risk_level VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'Draft',
  workflow_instance_id INT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS compliance_capas (
  id SERIAL PRIMARY KEY,
  tenant_id INT,
  title VARCHAR(255) NOT NULL,
  root_cause TEXT,
  corrective_action TEXT,
  preventive_action TEXT,
  status VARCHAR(50) DEFAULT 'OPEN',
  target_completion_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS compliance_deviations (
  id SERIAL PRIMARY KEY,
  tenant_id INT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  containment_actions TEXT,
  severity_level VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'OPEN',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS compliance_vendor_qualifications (
  id SERIAL PRIMARY KEY,
  tenant_id INT,
  vendor_name VARCHAR(100) NOT NULL,
  services_scope TEXT,
  risk_rating VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'QUALIFIED',
  renewal_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 28. Notification Center Setup
CREATE TABLE IF NOT EXISTS notification_preferences (
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  channel VARCHAR(20) NOT NULL,
  is_enabled BOOLEAN DEFAULT TRUE,
  PRIMARY KEY (user_id, channel)
);

CREATE TABLE IF NOT EXISTS operational_metrics (
  id SERIAL PRIMARY KEY,
  metric_name VARCHAR(100) NOT NULL,
  metric_value REAL NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 29. Stars Warehouse Models (Analytics fact/dim tables)
CREATE TABLE IF NOT EXISTS dim_users (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  tenant_id INT NOT NULL,
  username VARCHAR(100) NOT NULL,
  role VARCHAR(100) NOT NULL,
  department VARCHAR(100),
  valid_from TIMESTAMP WITH TIME ZONE NOT NULL,
  valid_to TIMESTAMP WITH TIME ZONE,
  is_current BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS dim_products (
  id SERIAL PRIMARY KEY,
  product_id INT NOT NULL,
  tenant_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  therapeutic_class VARCHAR(255),
  valid_from TIMESTAMP WITH TIME ZONE NOT NULL,
  valid_to TIMESTAMP WITH TIME ZONE,
  is_current BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS dim_departments (
  id SERIAL PRIMARY KEY,
  dept_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  valid_from TIMESTAMP WITH TIME ZONE NOT NULL,
  valid_to TIMESTAMP WITH TIME ZONE,
  is_current BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS dim_time (
  id SERIAL PRIMARY KEY,
  db_date DATE UNIQUE NOT NULL,
  day INT NOT NULL,
  month INT NOT NULL,
  quarter INT NOT NULL,
  year INT NOT NULL,
  is_weekend BOOLEAN NOT NULL
);

CREATE TABLE IF NOT EXISTS fact_ai_usage (
  id SERIAL PRIMARY KEY,
  time_key INT REFERENCES dim_time(id),
  user_key INT REFERENCES dim_users(id),
  product_key INT REFERENCES dim_products(id),
  model_used VARCHAR(100) NOT NULL,
  input_tokens INT,
  output_tokens INT,
  cost_usd REAL,
  latency_ms INT
);

CREATE TABLE IF NOT EXISTS fact_workflows (
  id SERIAL PRIMARY KEY,
  time_key INT REFERENCES dim_time(id),
  user_key INT REFERENCES dim_users(id),
  department_key INT REFERENCES dim_departments(id),
  resource_type VARCHAR(100) NOT NULL,
  instance_id INT NOT NULL,
  stage_order INT NOT NULL,
  duration_seconds INT,
  is_completed BOOLEAN NOT NULL
);

CREATE TABLE IF NOT EXISTS fact_documents (
  id SERIAL PRIMARY KEY,
  time_key INT REFERENCES dim_time(id),
  user_key INT REFERENCES dim_users(id),
  document_id INT NOT NULL,
  file_type VARCHAR(50) NOT NULL,
  version VARCHAR(20) NOT NULL,
  file_size_bytes INT
);

CREATE TABLE IF NOT EXISTS fact_searches (
  id SERIAL PRIMARY KEY,
  time_key INT REFERENCES dim_time(id),
  user_key INT REFERENCES dim_users(id),
  query_length INT,
  click_count INT,
  avg_relevance_score REAL
);

CREATE TABLE IF NOT EXISTS fact_exports (
  id SERIAL PRIMARY KEY,
  time_key INT REFERENCES dim_time(id),
  user_key INT REFERENCES dim_users(id),
  job_id INT NOT NULL,
  file_type VARCHAR(20) NOT NULL,
  sha256_hash CHAR(64) NOT NULL
);

-- 30. AI Governance Benchmarking
CREATE TABLE IF NOT EXISTS ai_model_versions (
  id SERIAL PRIMARY KEY,
  model_id INT REFERENCES ai_model_registry(id) ON DELETE CASCADE,
  version VARCHAR(20) NOT NULL,
  weights_checksum VARCHAR(255),
  release_notes TEXT,
  status VARCHAR(50) DEFAULT 'ACTIVE',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ai_evaluation_datasets (
  id SERIAL PRIMARY KEY,
  dataset_name VARCHAR(100) UNIQUE NOT NULL,
  test_cases_json JSONB NOT NULL,
  expected_output_schema JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ai_bias_registry (
  id SERIAL PRIMARY KEY,
  evaluation_log_id INT REFERENCES ai_evaluation_logs(id) ON DELETE CASCADE,
  detected_bias_type VARCHAR(100) NOT NULL,
  skew_score REAL NOT NULL,
  mitigation_strategy TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ai_model_approvals (
  id SERIAL PRIMARY KEY,
  model_version_id INT REFERENCES ai_model_versions(id) ON DELETE CASCADE,
  approved_by INT REFERENCES users(id) ON DELETE SET NULL,
  approved_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  remarks TEXT
);

-- 31. Observability Spans & performance metrics
CREATE TABLE IF NOT EXISTS system_health (
  id SERIAL PRIMARY KEY,
  node_id VARCHAR(100) NOT NULL,
  status VARCHAR(50) NOT NULL,
  memory_used_bytes BIGINT,
  cpu_percentage REAL,
  disk_free_bytes BIGINT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS trace_logs (
  id SERIAL PRIMARY KEY,
  trace_id VARCHAR(100) NOT NULL,
  span_id VARCHAR(100) NOT NULL,
  parent_span_id VARCHAR(100),
  service_name VARCHAR(100) NOT NULL,
  operation_name VARCHAR(100) NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  attributes_json JSONB
);

CREATE TABLE IF NOT EXISTS error_registry (
  id SERIAL PRIMARY KEY,
  error_code VARCHAR(100) NOT NULL,
  message TEXT NOT NULL,
  stack_trace TEXT,
  severity VARCHAR(50) NOT NULL,
  user_id INT REFERENCES users(id) ON DELETE SET NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 32. Enterprise Integration Connectors Design
CREATE TABLE IF NOT EXISTS connector_registry (
  id SERIAL PRIMARY KEY,
  connector_name VARCHAR(100) NOT NULL,
  provider_type VARCHAR(50) NOT NULL,
  config_json JSONB NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS connector_sync_logs (
  id SERIAL PRIMARY KEY,
  connector_id INT REFERENCES connector_registry(id) ON DELETE CASCADE,
  sync_type VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL,
  records_synced INT DEFAULT 0,
  error_log TEXT,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Alter tables for tenant bindings
ALTER TABLE workflow_definitions ADD COLUMN tenant_id INT;
ALTER TABLE workflow_instances ADD COLUMN tenant_id INT;
ALTER TABLE search_index ADD COLUMN tenant_id INT;
ALTER TABLE sops ADD COLUMN tenant_id INT;
ALTER TABLE skills ADD COLUMN tenant_id INT;
ALTER TABLE knowledge_documents ADD COLUMN tenant_id INT;
ALTER TABLE product_appraisals ADD COLUMN tenant_id INT;
