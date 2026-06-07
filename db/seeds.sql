-- ==========================================
-- CLINCOMMAND OS™ DATABASE SEED WORKBOOK
-- ==========================================

-- Standard password bcrypt hash for 'password123'
-- HASH: $2y$10$mB/sH.Nq17Q3eO64f.f01OiD/r8VigYx.U50XJm5/yZ9oQ.fXwS2O
-- For simplicity, we use this standard test hash:
INSERT INTO users (username, email, password_hash, role, is_active) VALUES
('admin', 'admin@clincommand.local', '$2a$10$Xm3h.0h5g1k68t4R3e9/UuXwJq8mX6Q72/WbV19Zg4Wl2uR.6Q6xO', 'Admin', true),
('head_medical', 'head.medical@clincommand.local', '$2a$10$Xm3h.0h5g1k68t4R3e9/UuXwJq8mX6Q72/WbV19Zg4Wl2uR.6Q6xO', 'Head of Medical Affairs', true),
('med_manager', 'medical.manager@clincommand.local', '$2a$10$Xm3h.0h5g1k68t4R3e9/UuXwJq8mX6Q72/WbV19Zg4Wl2uR.6Q6xO', 'Medical Manager', true),
('reg_manager', 'regulatory.manager@clincommand.local', '$2a$10$Xm3h.0h5g1k68t4R3e9/UuXwJq8mX6Q72/WbV19Zg4Wl2uR.6Q6xO', 'Regulatory Manager', true),
('clin_manager', 'clinical.manager@clincommand.local', '$2a$10$Xm3h.0h5g1k68t4R3e9/UuXwJq8mX6Q72/WbV19Zg4Wl2uR.6Q6xO', 'Clinical Research Manager', true),
('med_writer', 'medical.writer@clincommand.local', '$2a$10$Xm3h.0h5g1k68t4R3e9/UuXwJq8mX6Q72/WbV19Zg4Wl2uR.6Q6xO', 'Medical Writer', true),
('med_advisor', 'medical.advisor@clincommand.local', '$2a$10$Xm3h.0h5g1k68t4R3e9/UuXwJq8mX6Q72/WbV19Zg4Wl2uR.6Q6xO', 'Medical Advisor', true),
('train_manager', 'training.manager@clincommand.local', '$2a$10$Xm3h.0h5g1k68t4R3e9/UuXwJq8mX6Q72/WbV19Zg4Wl2uR.6Q6xO', 'Training Manager', true),
('viewer', 'viewer@clincommand.local', '$2a$10$Xm3h.0h5g1k68t4R3e9/UuXwJq8mX6Q72/WbV19Zg4Wl2uR.6Q6xO', 'Viewer', true);

-- Insert Default Categories
INSERT INTO categories (name, description) VALUES
('Medico-Marketing', 'SOPs and documentation covering marketing materials audits, speaker events, and monographs compiling.'),
('Regulatory Support', 'SOPs and reports for CTD registration dossiers, query responses, dissolution data, and labeling.'),
('Clinical Research', 'Study protocols, PK/PD parameters math validation, CRO checklists, and clinical monitoring logs.'),
('Knowledge Operations', 'SOPs mapping vector embedding indexing, search retention rules, and files archival procedures.'),
('Training & Certification', 'Educational syllabuses manuals, tests questions, and competency records for field MSLs.');

-- Insert System Settings
INSERT INTO system_settings (setting_key, setting_value) VALUES
('ollama_url', 'http://localhost:11434'),
('lm_studio_url', 'http://localhost:1234'),
('smtp_host', 'localhost'),
('smtp_port', '1025'),
('smtp_user', 'system@clincommand.local'),
('organization_name', 'ClinCommand On-Premise'),
('theme_default', 'light');

-- Insert Initial SOP Templates
INSERT INTO sop_templates (name, description, structure_json) VALUES
('Standard SOP Template', 'Standard department layout for operational procedures.', '{"fields": [{"name": "Department", "type": "text"}, {"name": "Effective Date", "type": "date"}]}'),
('Regulatory Submission Template', 'Dossier submission templates matching ICH M4 formatting guidelines.', '{"fields": [{"name": "Regulatory Agency", "type": "select", "options": ["CDSCO", "FDA", "EMA"]}, {"name": "Submission ID", "type": "text"}]}');

-- Insert Default Workflow Designs
INSERT INTO workflow_designs (name, module_type, steps_config) VALUES
('Standard SOP Approval Path', 'sops', '{"steps": [{"name": "Draft Review", "role": "Medical Manager"}, {"name": "Quality Audit", "role": "Medical Advisor"}, {"name": "Final Authorization", "role": "Head of Medical Affairs"}]}'),
('Appraisal Board Review', 'appraisal', '{"steps": [{"name": "Efficacy Review", "role": "Medical Advisor"}, {"name": "Sign-off Release", "role": "Head of Medical Affairs"}]}');

-- Insert Initial SOP Seeds
INSERT INTO sops (code, title, category_id, template_id, version, content, status, creator_id) VALUES
('SOP-MA-001', 'Product Appraisal Builder Protocol', 1, 1, '1.0.0', 
'# Standard Operating Procedure: Product Appraisal Builder Workflow
**SOP Code:** SOP-MA-001 | **Version:** 1.0.0

## 1. Objective
Establish a unified framework for the multi-criteria clinical and market appraisal of new therapeutic chemical candidates.

## 2. Process Steps
1. Gather core clinical trial publications for target molecule.
2. Draft SWOT quadrant analysis grid mapping efficacy parameters.
3. Perform target population sizing calculations.
4. Input details to Go/No-Go rating matrices.

## 3. Quality Review
Verify references match latest FDA publications.', 'Draft', 3),

('SOP-REG-001', 'CDSCO Submission Administrative Overview', 2, 2, '1.0.0',
'# Standard Operating Procedure: CDSCO Submission Module 1 prep
**SOP Code:** SOP-REG-001 | **Version:** 1.0.0

## 1. Objective
Ensure Module 1 administrative files are formatted to India CDSCO standards.

## 2. Process Steps
1. Check Form 40 requirements index.
2. Compile prescribing label and SmPC files.
3. Apply dynamic secure watermark: "RESTRICTED - FOR CDSCO SUBMISSION".', 'Draft', 4);

-- Insert Default AI Prompts
INSERT INTO ai_prompts (prompt_key, prompt_template, description) VALUES
('sop_search', 'You are the ClinCommand Compliance Officer. Review query using context:\nCONTEXT:\n{context}\nQUERY:\n{query}', 'Template for searching system SOPs');
