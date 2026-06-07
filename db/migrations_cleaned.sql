-- ========================================================
-- CLINCOMMAND OS™ DATABASE MIGRATIONS - PHASES 2 TO 6
-- ========================================================

-- 1. Multi-Tenant foundation
CREATE TABLE IF NOT EXISTS tenants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(100) UNIQUE NOT NULL,
  domain VARCHAR(255) UNIQUE,
  status VARCHAR(50) DEFAULT 'ACTIVE',
  created_at TEXTTIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tenant_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INT  ,
  setting_key VARCHAR(100) NOT NULL,
  setting_value TEXT NOT NULL,
  UNIQUE(tenant_id, setting_key)
);

CREATE TABLE IF NOT EXISTS tenant_workspaces (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INT  ,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TEXTTIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tenant_id, name)
);

-- 2. Organizations & Hierarchies
CREATE TABLE IF NOT EXISTS organizations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INT  ,
  name VARCHAR(100) NOT NULL,
  created_at TEXTTIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS departments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  org_id INT  ,
  name VARCHAR(100) NOT NULL,
  parent_dept_id INT  
);

CREATE TABLE IF NOT EXISTS business_units (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  dept_id INT  ,
  name VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS teams (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  unit_id INT  ,
  name VARCHAR(100) NOT NULL
);

-- 3. Granular RBAC permissions
CREATE TABLE IF NOT EXISTS roles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  parent_role_id INT  ,
  role_scope VARCHAR(50) NOT NULL DEFAULT 'GLOBAL'
);

CREATE TABLE IF NOT EXISTS permissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT
);

CREATE TABLE IF NOT EXISTS role_permissions (
  role_id INT  ,
  permission_id INT  ,
  PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS user_roles (
  user_id INT  ,
  role_id INT  ,
  PRIMARY KEY (user_id, role_id)
);

-- 4. Knowledge Repository Master Content Layer
CREATE TABLE IF NOT EXISTS knowledge_collections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  parent_id INT  ,
  created_at TEXTTIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS knowledge_documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  collection_id INT  ,
  current_version VARCHAR(20) NOT NULL DEFAULT '1.0.0',
  content TEXT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'Draft',
  created_by INT  ,
  created_at TEXTTIME DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXTTIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS knowledge_document_versions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  document_id INT  ,
  version VARCHAR(20) NOT NULL,
  content TEXT NOT NULL,
  change_summary TEXT NOT NULL,
  created_by INT  ,
  created_at TEXTTIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS knowledge_tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS knowledge_document_tags (
  document_id INT  ,
  tag_id INT  ,
  PRIMARY KEY (document_id, tag_id)
);

CREATE TABLE IF NOT EXISTS knowledge_relationships (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source_doc_id INT  ,
  target_doc_id INT  ,
  relationship_type VARCHAR(100) NOT NULL,
  created_at TEXTTIME DEFAULT CURRENT_TIMESTAMP
);

-- 5. Product Knowledge Foundation
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(100) UNIQUE NOT NULL,
  generic_name VARCHAR(255) NOT NULL,
  therapeutic_class VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TEXTTIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS product_indications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INT  ,
  indication_name VARCHAR(255) NOT NULL,
  description TEXT,
  approval_date TEXT
);

CREATE TABLE IF NOT EXISTS product_trials (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INT  ,
  nct_id VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  phase VARCHAR(50) NOT NULL,
  status VARCHAR(100) NOT NULL,
  results_summary TEXT
);

CREATE TABLE IF NOT EXISTS product_competitors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INT  ,
  competitor_name VARCHAR(100) NOT NULL,
  competitor_product_name VARCHAR(100) NOT NULL,
  comparison_notes TEXT
);

CREATE TABLE IF NOT EXISTS product_swot (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INT  ,
  swot_type VARCHAR(20) NOT NULL,
  factor TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS product_publications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INT  ,
  pubmed_id VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  authors TEXT,
  journal VARCHAR(255),
  publication_date TEXT,
  abstract TEXT
);

-- 6. Skills Registry Foundations
CREATE TABLE IF NOT EXISTS skill_categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT
);

CREATE TABLE IF NOT EXISTS skill_templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  prompt_template TEXT NOT NULL,
  input_schema TEXT NOT NULL,
  output_schema TEXT NOT NULL,
  created_by INT  ,
  created_at TEXTTIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS skills (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  category_id INT  ,
  template_id INT  ,
  current_version VARCHAR(20) NOT NULL DEFAULT '1.0.0',
  is_published BOOLEAN DEFAULT FALSE,
  created_by INT  ,
  created_at TEXTTIME DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXTTIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS skill_versions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  skill_id INT  ,
  version VARCHAR(20) NOT NULL,
  prompt_template TEXT NOT NULL,
  input_schema TEXT NOT NULL,
  output_schema TEXT NOT NULL,
  change_summary TEXT,
  created_by INT  ,
  created_at TEXTTIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS skill_workflows (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  skill_id INT  ,
  steps_config TEXT NOT NULL,
  created_by INT  ,
  created_at TEXTTIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS skill_executions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  skill_id INT  ,
  user_id INT  ,
  input_data TEXT NOT NULL,
  output_data TEXT NOT NULL,
  model_used VARCHAR(100) NOT NULL,
  execution_time_ms INT,
  created_at TEXTTIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS skill_feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  execution_id INT  ,
  user_id INT  ,
  rating INT ,
  comments TEXT,
  created_at TEXTTIME DEFAULT CURRENT_TIMESTAMP
);

-- 7. Polymorphic Generic Workflows
CREATE TABLE IF NOT EXISTS workflow_definitions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_by INT  ,
  created_at TEXTTIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS workflow_stages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  definition_id INT  ,
  stage_name VARCHAR(100) NOT NULL,
  stage_order INT NOT NULL,
  role_requirement VARCHAR(100) NOT NULL,
  is_parallel BOOLEAN DEFAULT FALSE,
  required_approvers_count INT DEFAULT 1,
  sla_hours INT,
  created_at TEXTTIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS workflow_instances (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  definition_id INT  ,
  resource_type VARCHAR(100) NOT NULL,
  resource_id INT NOT NULL,
  current_stage_id INT  ,
  status VARCHAR(50) NOT NULL DEFAULT 'IN_PROGRESS',
  started_at TEXTTIME DEFAULT CURRENT_TIMESTAMP,
  completed_at TEXTTIME
);

CREATE TABLE IF NOT EXISTS workflow_tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  instance_id INT  ,
  stage_id INT  ,
  assigned_role VARCHAR(100) NOT NULL,
  assigned_user_id INT  ,
  is_completed BOOLEAN DEFAULT FALSE,
  due_date TEXTTIME,
  completed_at TEXTTIME,
  action_status VARCHAR(50) DEFAULT 'PENDING'
);

CREATE TABLE IF NOT EXISTS workflow_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  instance_id INT  ,
  stage_name VARCHAR(100) NOT NULL,
  action_by INT  ,
  action_type VARCHAR(100) NOT NULL,
  comments TEXT,
  timestamp TEXTTIME DEFAULT CURRENT_TIMESTAMP
);

-- 8. Global Search Index
CREATE TABLE IF NOT EXISTS search_index (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
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
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  structure_json TEXT NOT NULL,
  created_by INT  ,
  created_at TEXTTIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS product_appraisals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INT  ,
  template_id INT  ,
  title VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  current_version VARCHAR(20) NOT NULL DEFAULT '1.0.0',
  status VARCHAR(50) NOT NULL DEFAULT 'Draft',
  created_by INT  ,
  created_at TEXTTIME DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXTTIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS product_appraisal_sections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  appraisal_id INT  ,
  section_key VARCHAR(100) NOT NULL,
  version VARCHAR(20) NOT NULL DEFAULT '1.0.0',
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'Draft',
  updated_by INT  ,
  updated_at TEXTTIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(appraisal_id, section_key)
);

CREATE TABLE IF NOT EXISTS product_appraisal_comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  appraisal_id INT  ,
  user_id INT  ,
  comment_text TEXT NOT NULL,
  section_key VARCHAR(100) NOT NULL,
  created_at TEXTTIME DEFAULT CURRENT_TIMESTAMP
);

-- 10. Asynchronous Exporter Job Queues
CREATE TABLE IF NOT EXISTS document_export_jobs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  resource_type VARCHAR(100) NOT NULL,
  resource_id INT NOT NULL,
  file_type VARCHAR(20) NOT NULL,
  status VARCHAR(50) DEFAULT 'QUEUED',
  error_message TEXT,
  sha256_hash TEXT,
  filepath VARCHAR(500),
  created_at TEXTTIME DEFAULT CURRENT_TIMESTAMP,
  completed_at TEXTTIME
);

CREATE TABLE IF NOT EXISTS document_export_templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(100) UNIQUE NOT NULL,
  file_type VARCHAR(20) NOT NULL,
  layout_config TEXT NOT NULL,
  created_at TEXTTIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS document_exports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  job_id INT  ,
  resource_type VARCHAR(100) NOT NULL,
  resource_id INT NOT NULL,
  file_type VARCHAR(20) NOT NULL,
  exported_by INT  ,
  sha256_hash TEXT NOT NULL,
  exported_at TEXTTIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS document_export_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  export_id INT  ,
  action_type VARCHAR(100) NOT NULL,
  performed_by INT  ,
  ip_address VARCHAR(45) NOT NULL,
  timestamp TEXTTIME DEFAULT CURRENT_TIMESTAMP
);

-- 11. Human in the Loop Review Queue
CREATE TABLE IF NOT EXISTS ai_review_queue (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entity_type VARCHAR(100) NOT NULL,
  entity_id INT NOT NULL,
  prompt_version_id INT,
  model_used VARCHAR(100) NOT NULL,
  raw_output TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'PENDING',
  reviewer_id INT  ,
  review_comments TEXT,
  created_at TEXTTIME DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TEXTTIME
);

-- 12. Reference Library
CREATE TABLE IF NOT EXISTS reference_library (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source_type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  external_id VARCHAR(100) UNIQUE,
  authors TEXT,
  journal_or_publisher VARCHAR(255),
  publication_date TEXT,
  content_abstract TEXT,
  full_text_url VARCHAR(500),
  metadata_json TEXT,
  created_at TEXTTIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reference_tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reference_id INT  ,
  tag_name VARCHAR(100) NOT NULL,
  UNIQUE(reference_id, tag_name)
);

CREATE TABLE IF NOT EXISTS reference_relationships (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source_ref_id INT  ,
  target_ref_id INT  ,
  relationship_type VARCHAR(100) NOT NULL,
  created_at TEXTTIME DEFAULT CURRENT_TIMESTAMP
);

-- 13. Learning Academy
CREATE TABLE IF NOT EXISTS training_courses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  code VARCHAR(50) UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TEXTTIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS training_modules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  course_id INT  ,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  module_order INT NOT NULL
);

CREATE TABLE IF NOT EXISTS training_assessments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  module_id INT  ,
  question_json TEXT NOT NULL,
  passing_score INT DEFAULT 80
);

CREATE TABLE IF NOT EXISTS training_attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INT  ,
  assessment_id INT  ,
  score INT NOT NULL,
  is_passed BOOLEAN DEFAULT FALSE,
  attempted_at TEXTTIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS training_certificates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INT  ,
  course_id INT  ,
  certificate_number VARCHAR(100) UNIQUE NOT NULL,
  issued_at TEXTTIME DEFAULT CURRENT_TIMESTAMP
);

-- 14. Background Job Queue
CREATE TABLE IF NOT EXISTS job_queue (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  job_type VARCHAR(100) NOT NULL,
  payload_json TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'QUEUED',
  attempts INT DEFAULT 0,
  error_message TEXT,
  created_at TEXTTIME DEFAULT CURRENT_TIMESTAMP,
  processed_at TEXTTIME
);

CREATE TABLE IF NOT EXISTS job_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  job_id INT  ,
  job_type VARCHAR(100) NOT NULL,
  status VARCHAR(50) NOT NULL,
  details TEXT,
  duration_ms INT,
  executed_at TEXTTIME DEFAULT CURRENT_TIMESTAMP
);

-- 15. Configurations settings
CREATE TABLE IF NOT EXISTS system_configuration (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  config_key VARCHAR(100) UNIQUE NOT NULL,
  config_value TEXT NOT NULL,
  config_group VARCHAR(100) NOT NULL,
  description TEXT,
  updated_at TEXTTIME DEFAULT CURRENT_TIMESTAMP
);

-- 16. Cryptographic Audit Vault
CREATE TABLE IF NOT EXISTS audit_vault (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INT,
  user_id INT  ,
  username VARCHAR(100) NOT NULL,
  action_type VARCHAR(100) NOT NULL,
  target_resource VARCHAR(255) NOT NULL,
  payload TEXT NOT NULL,
  previous_vault_hash TEXT,
  vault_hash TEXT NOT NULL,
  digital_signature TEXT,
  ip_address VARCHAR(45) NOT NULL,
  timestamp TEXTTIME DEFAULT CURRENT_TIMESTAMP
);

-- 17. Document managementFolders
CREATE TABLE IF NOT EXISTS document_folders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INT,
  name VARCHAR(100) NOT NULL,
  parent_folder_id INT  ,
  created_at TEXTTIME DEFAULT CURRENT_TIMESTAMP
);

-- 18. Offline change journal
CREATE TABLE IF NOT EXISTS offline_change_journal (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entity_type VARCHAR(100) NOT NULL,
  entity_id INT NOT NULL,
  operation_type VARCHAR(20) NOT NULL,
  payload_json TEXT NOT NULL,
  last_modified_at TEXTTIME DEFAULT CURRENT_TIMESTAMP,
  is_synced BOOLEAN DEFAULT FALSE
);

-- 19. Knowledge graph networks
CREATE TABLE IF NOT EXISTS knowledge_entities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(255) NOT NULL,
  entity_type VARCHAR(100) NOT NULL,
  metadata_json TEXT,
  created_at TEXTTIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS knowledge_entity_relationships (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source_entity_id INT  ,
  target_entity_id INT  ,
  relationship_type VARCHAR(100) NOT NULL,
  strength REAL DEFAULT 1.0,
  created_at TEXTTIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS knowledge_entity_mentions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entity_id INT  ,
  source_type VARCHAR(100) NOT NULL,
  source_id INT NOT NULL,
  context_text TEXT,
  created_at TEXTTIME DEFAULT CURRENT_TIMESTAMP
);

-- 20. Evidence and Providences citation
CREATE TABLE IF NOT EXISTS evidence_sources (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source_type VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  provenance_url VARCHAR(500),
  publisher_or_journal VARCHAR(255),
  publication_date TEXT,
  verification_checksum TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS evidence_links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source_id INT  ,
  target_type VARCHAR(100) NOT NULL,
  target_id INT NOT NULL,
  provenance_quote TEXT NOT NULL,
  confidence_score REAL DEFAULT 1.0
);

CREATE TABLE IF NOT EXISTS citation_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entity_type VARCHAR(100) NOT NULL,
  entity_id INT NOT NULL,
  citation_style VARCHAR(50) DEFAULT 'AMA',
  formatted_citation TEXT NOT NULL,
  created_at TEXTTIME DEFAULT CURRENT_TIMESTAMP
);

-- 21. Multi LLM router benchmark checks
CREATE TABLE IF NOT EXISTS ai_routing_rules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  skill_type VARCHAR(100) NOT NULL,
  preferred_model VARCHAR(100) NOT NULL,
  fallback_model VARCHAR(100),
  max_cost_limit REAL,
  max_latency_ms INT,
  compliance_policy_id INT,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS ai_model_benchmarks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  model_name VARCHAR(100) NOT NULL,
  provider VARCHAR(50) NOT NULL,
  avg_latency_ms INT,
  avg_cost_per_1k_tokens REAL,
  quality_score REAL,
  last_evaluated TEXTTIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ai_cost_tracking (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  execution_id INT,
  user_id INT  ,
  model_name VARCHAR(100) NOT NULL,
  input_tokens INT,
  output_tokens INT,
  cost_usd REAL,
  timestamp TEXTTIME DEFAULT CURRENT_TIMESTAMP
);

-- 22. Agent Framework Memory
CREATE TABLE IF NOT EXISTS agent_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  agent_name VARCHAR(100) UNIQUE NOT NULL,
  agent_role VARCHAR(100) NOT NULL,
  system_prompt TEXT NOT NULL,
  skills_list TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TEXTTIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS agent_tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  agent_id INT  ,
  task_title VARCHAR(255) NOT NULL,
  task_description TEXT,
  assigned_by INT  ,
  status VARCHAR(50) DEFAULT 'PENDING',
  created_at TEXTTIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS agent_runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_id INT  ,
  model_used VARCHAR(100) NOT NULL,
  run_log TEXT NOT NULL,
  status VARCHAR(50) NOT NULL,
  created_at TEXTTIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS agent_memory (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  agent_id INT  ,
  memory_key VARCHAR(100) NOT NULL,
  memory_value TEXT NOT NULL,
  last_accessed TEXTTIME DEFAULT CURRENT_TIMESTAMP
);

-- 23. Regulatory updates tracking
CREATE TABLE IF NOT EXISTS regulatory_updates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source_authority VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  summary TEXT,
  publish_date TEXT,
  guideline_url VARCHAR(500),
  raw_content_path VARCHAR(500),
  ingested_at TEXTTIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS health_authority_notices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  regulatory_update_id INT  ,
  notice_type VARCHAR(100) NOT NULL,
  impact_level VARCHAR(50) NOT NULL,
  alert_sent_at TEXTTIME
);

CREATE TABLE IF NOT EXISTS guideline_library (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code VARCHAR(100) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  scope TEXT,
  version VARCHAR(20) NOT NULL DEFAULT '1.0.0',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TEXTTIME DEFAULT CURRENT_TIMESTAMP
);

-- 24. Product market and KOL tracking
CREATE TABLE IF NOT EXISTS product_market_data (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INT  ,
  market_share_percentage REAL,
  sales_revenue_usd REAL,
  territory VARCHAR(100) NOT NULL,
  quarter VARCHAR(20) NOT NULL
);

CREATE TABLE IF NOT EXISTS product_competitor_tracking (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INT  ,
  competitor_product_id INT  ,
  market_threat_level VARCHAR(50) NOT NULL,
  latest_news TEXT,
  updated_at TEXTTIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS product_kol_tracking (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INT  ,
  kol_name VARCHAR(100) NOT NULL,
  activity_type VARCHAR(100) NOT NULL,
  activity_details TEXT,
  activity_date TEXT
);

-- 25. Executive Analytics snaps
CREATE TABLE IF NOT EXISTS analytics_snapshots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  snapshot_date TEXT NOT NULL,
  metrics_json TEXT NOT NULL,
  department VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS kpi_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  kpi_name VARCHAR(100) UNIQUE NOT NULL,
  kpi_target REAL NOT NULL,
  kpi_actual REAL,
  unit VARCHAR(50) NOT NULL,
  updated_at TEXTTIME DEFAULT CURRENT_TIMESTAMP
);

-- 26. Security events
CREATE TABLE IF NOT EXISTS security_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_type VARCHAR(100) NOT NULL,
  user_id INT  ,
  ip_address VARCHAR(45) NOT NULL,
  details TEXT,
  timestamp TEXTTIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS data_access_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INT  ,
  accessed_table VARCHAR(100) NOT NULL,
  accessed_record_id INT NOT NULL,
  action_type VARCHAR(50) NOT NULL,
  timestamp TEXTTIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS retention_policies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  table_name VARCHAR(100) UNIQUE NOT NULL,
  retention_years INT NOT NULL,
  description TEXT
);

-- 27. Compliance Management Framework (CAPAs, IQ/OQ/PQ)
CREATE TABLE IF NOT EXISTS compliance_validations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INT,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'PENDING',
  execution_log TEXT,
  created_at TEXTTIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS compliance_change_controls (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  change_reason TEXT,
  risk_level VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'Draft',
  workflow_instance_id INT,
  created_at TEXTTIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS compliance_capas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INT,
  title VARCHAR(255) NOT NULL,
  root_cause TEXT,
  corrective_action TEXT,
  preventive_action TEXT,
  status VARCHAR(50) DEFAULT 'OPEN',
  target_completion_date TEXT,
  created_at TEXTTIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS compliance_deviations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  containment_actions TEXT,
  severity_level VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'OPEN',
  created_at TEXTTIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS compliance_vendor_qualifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INT,
  vendor_name VARCHAR(100) NOT NULL,
  services_scope TEXT,
  risk_rating VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'QUALIFIED',
  renewal_date TEXT,
  created_at TEXTTIME DEFAULT CURRENT_TIMESTAMP
);

-- 28. Notification Center Setup
CREATE TABLE IF NOT EXISTS notification_preferences (
  user_id INT  ,
  channel VARCHAR(20) NOT NULL,
  is_enabled BOOLEAN DEFAULT TRUE,
  PRIMARY KEY (user_id, channel)
);

CREATE TABLE IF NOT EXISTS operational_metrics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  metric_name VARCHAR(100) NOT NULL,
  metric_value REAL NOT NULL,
  timestamp TEXTTIME DEFAULT CURRENT_TIMESTAMP
);

-- 29. Stars Warehouse Models (Analytics fact/dim tables)
CREATE TABLE IF NOT EXISTS dim_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INT NOT NULL,
  tenant_id INT NOT NULL,
  username VARCHAR(100) NOT NULL,
  role VARCHAR(100) NOT NULL,
  department VARCHAR(100),
  valid_from TEXTTIME NOT NULL,
  valid_to TEXTTIME,
  is_current BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS dim_products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INT NOT NULL,
  tenant_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  therapeutic_class VARCHAR(255),
  valid_from TEXTTIME NOT NULL,
  valid_to TEXTTIME,
  is_current BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS dim_departments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  dept_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  valid_from TEXTTIME NOT NULL,
  valid_to TEXTTIME,
  is_current BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS dim_time (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  db_date TEXT UNIQUE NOT NULL,
  day INT NOT NULL,
  month INT NOT NULL,
  quarter INT NOT NULL,
  year INT NOT NULL,
  is_weekend BOOLEAN NOT NULL
);

CREATE TABLE IF NOT EXISTS fact_ai_usage (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  time_key INT ,
  user_key INT ,
  product_key INT ,
  model_used VARCHAR(100) NOT NULL,
  input_tokens INT,
  output_tokens INT,
  cost_usd REAL,
  latency_ms INT
);

CREATE TABLE IF NOT EXISTS fact_workflows (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  time_key INT ,
  user_key INT ,
  department_key INT ,
  resource_type VARCHAR(100) NOT NULL,
  instance_id INT NOT NULL,
  stage_order INT NOT NULL,
  duration_seconds INT,
  is_completed BOOLEAN NOT NULL
);

CREATE TABLE IF NOT EXISTS fact_documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  time_key INT ,
  user_key INT ,
  document_id INT NOT NULL,
  file_type VARCHAR(50) NOT NULL,
  version VARCHAR(20) NOT NULL,
  file_size_bytes INT
);

CREATE TABLE IF NOT EXISTS fact_searches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  time_key INT ,
  user_key INT ,
  query_length INT,
  click_count INT,
  avg_relevance_score REAL
);

CREATE TABLE IF NOT EXISTS fact_exports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  time_key INT ,
  user_key INT ,
  job_id INT NOT NULL,
  file_type VARCHAR(20) NOT NULL,
  sha256_hash TEXT NOT NULL
);

-- 30. AI Governance Benchmarking
CREATE TABLE IF NOT EXISTS ai_model_versions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  model_id INT  ,
  version VARCHAR(20) NOT NULL,
  weights_checksum VARCHAR(255),
  release_notes TEXT,
  status VARCHAR(50) DEFAULT 'ACTIVE',
  created_at TEXTTIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ai_evaluation_datasets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  dataset_name VARCHAR(100) UNIQUE NOT NULL,
  test_cases_json TEXT NOT NULL,
  expected_output_schema TEXT,
  created_at TEXTTIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ai_bias_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  evaluation_log_id INT  ,
  detected_bias_type VARCHAR(100) NOT NULL,
  skew_score REAL NOT NULL,
  mitigation_strategy TEXT,
  created_at TEXTTIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ai_model_approvals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  model_version_id INT  ,
  approved_by INT  ,
  approved_at TEXTTIME DEFAULT CURRENT_TIMESTAMP,
  remarks TEXT
);

-- 31. Observability Spans & performance metrics
CREATE TABLE IF NOT EXISTS system_health (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  node_id VARCHAR(100) NOT NULL,
  status VARCHAR(50) NOT NULL,
  memory_used_bytes BIGINT,
  cpu_percentage REAL,
  disk_free_bytes BIGINT,
  timestamp TEXTTIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS trace_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  trace_id VARCHAR(100) NOT NULL,
  span_id VARCHAR(100) NOT NULL,
  parent_span_id VARCHAR(100),
  service_name VARCHAR(100) NOT NULL,
  operation_name VARCHAR(100) NOT NULL,
  start_time TEXTTIME NOT NULL,
  end_time TEXTTIME,
  attributes_json TEXT
);

CREATE TABLE IF NOT EXISTS error_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  error_code VARCHAR(100) NOT NULL,
  message TEXT NOT NULL,
  stack_trace TEXT,
  severity VARCHAR(50) NOT NULL,
  user_id INT  ,
  timestamp TEXTTIME DEFAULT CURRENT_TIMESTAMP
);

-- 32. Enterprise Integration Connectors Design
CREATE TABLE IF NOT EXISTS connector_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  connector_name VARCHAR(100) NOT NULL,
  provider_type VARCHAR(50) NOT NULL,
  config_json TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TEXTTIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS connector_sync_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  connector_id INT  ,
  sync_type VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL,
  records_synced INT DEFAULT 0,
  error_log TEXT,
  started_at TEXTTIME NOT NULL,
  completed_at TEXTTIME
);

-- Alter tables for tenant bindings
ALTER TABLE workflow_definitions ADD COLUMN tenant_id INT;
ALTER TABLE workflow_instances ADD COLUMN tenant_id INT;
ALTER TABLE search_index ADD COLUMN tenant_id INT;
ALTER TABLE sops ADD COLUMN tenant_id INT;
ALTER TABLE skills ADD COLUMN tenant_id INT;
ALTER TABLE knowledge_documents ADD COLUMN tenant_id INT;
ALTER TABLE product_appraisals ADD COLUMN tenant_id INT;
