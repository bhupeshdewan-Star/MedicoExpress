-- ==========================================
-- CLINCOMMAND OS™ MASTER DATABASE SCHEMA DDL
-- ==========================================

-- Standard Enums
CREATE TYPE user_role AS ENUM (
  'Admin', 
  'Head of Medical Affairs', 
  'Medical Manager', 
  'Regulatory Manager', 
  'Clinical Research Manager', 
  'Medical Writer', 
  'Medical Advisor', 
  'Training Manager', 
  'Viewer'
);

CREATE TYPE workflow_status AS ENUM (
  'Draft', 
  'Under Review', 
  'Approved', 
  'Completed',
  'Archived'
);

-- 1. Users Table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role user_role NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. User Preferences Table
CREATE TABLE user_preferences (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  theme VARCHAR(20) DEFAULT 'light',
  email_notifications BOOLEAN DEFAULT TRUE,
  dashboard_layout JSONB,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. System Settings Table
CREATE TABLE system_settings (
  id SERIAL PRIMARY KEY,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Categories Table
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT
);

-- 5. Tags Table
CREATE TABLE tags (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL
);

-- 6. SOP Templates Registry (For creating customized templates)
CREATE TABLE sop_templates (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  structure_json JSONB NOT NULL, -- Defines custom form field headings and checklist sections
  created_by INT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. SOP Metadata Fields Schema (Dynamic schema-driven forms)
CREATE TABLE metadata_fields (
  id SERIAL PRIMARY KEY,
  template_id INT REFERENCES sop_templates(id) ON DELETE CASCADE,
  field_name VARCHAR(100) NOT NULL,
  field_type VARCHAR(50) NOT NULL, -- 'text', 'date', 'number', 'select'
  is_required BOOLEAN DEFAULT FALSE,
  options JSONB -- Options if type is 'select'
);

-- 8. SOPs Table
CREATE TABLE sops (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  category_id INT REFERENCES categories(id) ON DELETE SET NULL,
  template_id INT REFERENCES sop_templates(id) ON DELETE SET NULL,
  version VARCHAR(20) NOT NULL DEFAULT '1.0.0',
  content TEXT NOT NULL, -- Standard Markdown body
  dynamic_metadata JSONB, -- Dynamic key-value values matching metadata_fields
  status workflow_status NOT NULL DEFAULT 'Draft',
  effective_date DATE,
  superseded_sop_code VARCHAR(50),
  creator_id INT REFERENCES users(id) ON DELETE SET NULL,
  reviewer_id INT REFERENCES users(id) ON DELETE SET NULL,
  approver_id INT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. SOPs Tags Mapping
CREATE TABLE sops_tags (
  sop_id INT REFERENCES sops(id) ON DELETE CASCADE,
  tag_id INT REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (sop_id, tag_id)
);

-- 10. Projects Table
CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  module_type VARCHAR(100) NOT NULL, -- 'medico-marketing', 'regulatory', 'clinical'
  submodule_type VARCHAR(100) NOT NULL, -- 'appraisal', 'monograph', etc.
  status workflow_status NOT NULL DEFAULT 'Draft',
  created_by INT REFERENCES users(id) ON DELETE SET NULL,
  assigned_to INT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Documents Table (Version Controlled Master Output Entry)
CREATE TABLE documents (
  id SERIAL PRIMARY KEY,
  project_id INT REFERENCES projects(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  file_type VARCHAR(50) NOT NULL, -- 'pdf', 'docx', 'pptx', 'xlsx', 'md'
  current_version VARCHAR(20) NOT NULL DEFAULT '1.0.0',
  content TEXT NOT NULL, -- Serialized content
  created_by INT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. Document Version History (Immutable History log)
CREATE TABLE document_versions (
  id SERIAL PRIMARY KEY,
  document_id INT REFERENCES documents(id) ON DELETE CASCADE,
  version VARCHAR(20) NOT NULL,
  content TEXT NOT NULL,
  change_summary TEXT NOT NULL,
  created_by INT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. Workflow Designer Config Table (Admin-defined workflow paths)
CREATE TABLE workflow_designs (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  module_type VARCHAR(100) NOT NULL, -- 'sops', 'appraisal'
  steps_config JSONB NOT NULL, -- Array of approval steps, roles required, parallel/sequence flags
  created_by INT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 14. Workflow Instances
CREATE TABLE workflow_instances (
  id SERIAL PRIMARY KEY,
  project_id INT REFERENCES projects(id) ON DELETE CASCADE,
  sop_id INT REFERENCES sops(id) ON DELETE CASCADE,
  design_id INT REFERENCES workflow_designs(id) ON DELETE SET NULL,
  current_step_index INT DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 15. Workflow Steps Progress
CREATE TABLE workflow_steps (
  id SERIAL PRIMARY KEY,
  workflow_instance_id INT REFERENCES workflow_instances(id) ON DELETE CASCADE,
  step_name VARCHAR(100) NOT NULL,
  assignee_role user_role NOT NULL,
  assignee_id INT REFERENCES users(id) ON DELETE RESTRICT,
  is_approved BOOLEAN DEFAULT FALSE,
  comments TEXT,
  signed_at TIMESTAMP WITH TIME ZONE
);

-- 16. Electronic Signatures Table (21 CFR Part 11 Compliant)
CREATE TABLE esignatures (
  id SERIAL PRIMARY KEY,
  document_id INT REFERENCES documents(id) ON DELETE CASCADE,
  sop_id INT REFERENCES sops(id) ON DELETE CASCADE,
  user_id INT REFERENCES users(id) ON DELETE RESTRICT,
  signer_role VARCHAR(100) NOT NULL,
  signed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  sign_purpose VARCHAR(255) NOT NULL, -- 'AUTHORSHIP', 'REVIEW', 'APPROVAL'
  sha256_checksum CHAR(64) NOT NULL
);

-- 17. Tasks Table
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  assigned_to INT REFERENCES users(id) ON DELETE SET NULL,
  project_id INT REFERENCES projects(id) ON DELETE CASCADE,
  due_date DATE,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 18. Approvals Dispatch Table
CREATE TABLE approvals (
  id SERIAL PRIMARY KEY,
  document_id INT REFERENCES documents(id) ON DELETE CASCADE,
  sop_id INT REFERENCES sops(id) ON DELETE CASCADE,
  requested_by INT REFERENCES users(id) ON DELETE SET NULL,
  assigned_approver_id INT REFERENCES users(id) ON DELETE RESTRICT,
  is_resolved BOOLEAN DEFAULT FALSE,
  resolution_status VARCHAR(50), -- 'APPROVED', 'REJECTED'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 19. Comments Table
CREATE TABLE comments (
  id SERIAL PRIMARY KEY,
  document_id INT REFERENCES documents(id) ON DELETE CASCADE,
  sop_id INT REFERENCES sops(id) ON DELETE CASCADE,
  user_id INT REFERENCES users(id) ON DELETE SET NULL,
  comment_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 20. Attachments Table
CREATE TABLE attachments (
  id SERIAL PRIMARY KEY,
  document_id INT REFERENCES documents(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size INT NOT NULL,
  uploaded_by INT REFERENCES users(id) ON DELETE SET NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 21. Notifications Table
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  recipient_id INT REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 22. AI Conversations Table
CREATE TABLE ai_conversations (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 23. AI Messages Table
CREATE TABLE ai_messages (
  id SERIAL PRIMARY KEY,
  conversation_id INT REFERENCES ai_conversations(id) ON DELETE CASCADE,
  sender VARCHAR(50) NOT NULL, -- 'USER', 'AI'
  message_text TEXT NOT NULL,
  model_used VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 24. AI Prompts Library
CREATE TABLE ai_prompts (
  id SERIAL PRIMARY KEY,
  prompt_key VARCHAR(100) UNIQUE NOT NULL,
  prompt_template TEXT NOT NULL,
  description TEXT
);

-- 25. RAG Retrieval Sources Library
CREATE TABLE rag_sources (
  id SERIAL PRIMARY KEY,
  file_name VARCHAR(255) UNIQUE NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  chunk_count INT NOT NULL,
  status VARCHAR(50) DEFAULT 'INDEXED',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 26. Document Exports Log
CREATE TABLE document_exports (
  id SERIAL PRIMARY KEY,
  document_id INT REFERENCES documents(id) ON DELETE SET NULL,
  user_id INT REFERENCES users(id) ON DELETE SET NULL,
  file_type VARCHAR(20) NOT NULL,
  checksum CHAR(64) NOT NULL,
  exported_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 27. Print Logs (Compliance requirement)
CREATE TABLE print_logs (
  id SERIAL PRIMARY KEY,
  document_id INT REFERENCES documents(id) ON DELETE SET NULL,
  user_id INT REFERENCES users(id) ON DELETE SET NULL,
  checksum CHAR(64) NOT NULL,
  printed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 28. Email Logs
CREATE TABLE email_logs (
  id SERIAL PRIMARY KEY,
  sender_id INT REFERENCES users(id) ON DELETE SET NULL,
  recipient_email VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  attachment_paths TEXT,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 29. Immutable Audit Logs Table
CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE SET NULL,
  username VARCHAR(100) NOT NULL,
  user_role VARCHAR(100) NOT NULL,
  action_type VARCHAR(100) NOT NULL, -- 'CREATE', 'EDIT', 'READ', 'PRINT', 'EMAIL', 'ESIGN'
  target_resource VARCHAR(255) NOT NULL, -- e.g., 'document:12', 'sop:SOP-MA-001'
  details TEXT NOT NULL,
  ip_address VARCHAR(45) NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 30. Audit Retention Rules Table
CREATE TABLE audit_retention_rules (
  id SERIAL PRIMARY KEY,
  data_type VARCHAR(100) UNIQUE NOT NULL,
  retention_years INT NOT NULL,
  description TEXT
);

-- Immutable Rule triggers for 21 CFR Part 11
CREATE RULE block_audit_delete AS ON DELETE TO audit_logs DO INSTEAD NOTHING;
CREATE RULE block_audit_update AS ON UPDATE TO audit_logs DO INSTEAD NOTHING;
CREATE RULE block_esign_delete AS ON DELETE TO esignatures DO INSTEAD NOTHING;
CREATE RULE block_esign_update AS ON UPDATE TO esignatures DO INSTEAD NOTHING;

-- Index Optimization
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_sops_code ON sops(code);
CREATE INDEX idx_documents_project ON documents(project_id);
CREATE INDEX idx_esignatures_hash ON esignatures(sha256_checksum);
