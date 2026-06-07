-- CLINCOMMAND OS™ PHASE 17 SCHEMA MIGRATIONS
-- Author: Dr. Bhupesh Dewan, Mumbai, India
-- Copyright Notice: © Dr. Bhupesh Dewan, Mumbai, India — All Rights Reserved

-- 1. Create prompt_versions table
CREATE TABLE IF NOT EXISTS prompt_versions (
    id SERIAL PRIMARY KEY,
    skill_id INTEGER NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    version VARCHAR(50) NOT NULL,
    system_prompt TEXT NOT NULL,
    user_prompt TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'REVIEW', 'APPROVED', 'EFFECTIVE', 'RETIRED')),
    created_by INTEGER NOT NULL,
    effective_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexing for prompt queries
CREATE INDEX IF NOT EXISTS idx_prompt_versions_skill_status ON prompt_versions(skill_id, status);

-- 2. Create audit_trail_logs table (Immutable Ledger)
CREATE TABLE IF NOT EXISTS audit_trail_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    username VARCHAR(100) NOT NULL,
    role VARCHAR(100) NOT NULL,
    action VARCHAR(100) NOT NULL,
    target_entity VARCHAR(255) NOT NULL,
    details TEXT NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    hash_signature VARCHAR(64) NOT NULL,
    previous_hash VARCHAR(64) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexing for audit trail search
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_action ON audit_trail_logs(user_id, action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_hash ON audit_trail_logs(hash_signature);

-- 3. Create electronic_signatures table (21 CFR Part 11 compliant)
CREATE TABLE IF NOT EXISTS electronic_signatures (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    username VARCHAR(100) NOT NULL,
    signature_meaning VARCHAR(100) NOT NULL CHECK (signature_meaning IN ('Author', 'Reviewer', 'Approver', 'Verification Complete', 'Effective Release')),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    run_id INTEGER,
    audit_link_id INTEGER REFERENCES audit_trail_logs(id)
);

CREATE INDEX IF NOT EXISTS idx_esign_run ON electronic_signatures(run_id);

-- 4. Create ai_traceability table (Traceability Reconstruction mapping)
CREATE TABLE IF NOT EXISTS ai_traceability (
    id SERIAL PRIMARY KEY,
    execution_id INTEGER UNIQUE NOT NULL REFERENCES skill_executions(id) ON DELETE CASCADE,
    skill_version VARCHAR(50) NOT NULL,
    prompt_version_id INTEGER REFERENCES prompt_versions(id),
    sop_version_id INTEGER,
    chunks_used_json JSONB NOT NULL,
    model_used VARCHAR(100) NOT NULL,
    output_hash VARCHAR(64) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ai_trace_exec ON ai_traceability(execution_id);
CREATE INDEX IF NOT EXISTS idx_ai_trace_hash ON ai_traceability(output_hash);

-- 5. Create approval_workflows table (Asset Lifecycle)
CREATE TABLE IF NOT EXISTS approval_workflows (
    id SERIAL PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN ('SKILL', 'SOP', 'REPORT', 'KNOWLEDGE')),
    entity_id INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'REVIEW', 'APPROVED', 'EFFECTIVE', 'SUPERSEDED', 'RETIRED')),
    submitted_by INTEGER NOT NULL,
    reviewed_by INTEGER,
    approved_by INTEGER,
    last_transition TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_appr_entity ON approval_workflows(entity_type, entity_id);

-- 6. Create skill_function_matrix and sop_function_matrix coverage tables
CREATE TABLE IF NOT EXISTS skill_function_matrix (
    id SERIAL PRIMARY KEY,
    domain VARCHAR(100) NOT NULL,
    function_name VARCHAR(255) NOT NULL,
    skill_id INTEGER REFERENCES skills(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS sop_function_matrix (
    id SERIAL PRIMARY KEY,
    function_name VARCHAR(255) NOT NULL,
    sop_id INTEGER REFERENCES sops(id) ON DELETE CASCADE
);

-- 7. Create biostats_runs table for calculations persistency
CREATE TABLE IF NOT EXISTS biostats_runs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    method_name VARCHAR(100) NOT NULL,
    dataset_hash VARCHAR(64) NOT NULL,
    input_parameters JSONB NOT NULL,
    output_tables JSONB NOT NULL,
    output_figures JSONB NOT NULL,
    audit_metadata JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Create validation_records table for automated GxP autovalidation runs
CREATE TABLE IF NOT EXISTS validation_records (
    id SERIAL PRIMARY KEY,
    gate_index INTEGER NOT NULL,
    verification_logs JSONB NOT NULL,
    certified_by VARCHAR(100) NOT NULL,
    certified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) NOT NULL
);

-- Indexing for biostats_runs and validation_records queries
CREATE INDEX IF NOT EXISTS idx_biostats_runs_user ON biostats_runs(user_id);
CREATE INDEX IF NOT EXISTS idx_biostats_runs_method ON biostats_runs(method_name);
CREATE INDEX IF NOT EXISTS idx_biostats_runs_hash ON biostats_runs(dataset_hash);
CREATE INDEX IF NOT EXISTS idx_validation_records_gate ON validation_records(gate_index);
CREATE INDEX IF NOT EXISTS idx_validation_records_status ON validation_records(status);

-- © Dr. Bhupesh Dewan, Mumbai, India — All Rights Reserved
