-- ========================================================
-- CLINCOMMAND OS™ DATABASE ROLLBACK - PHASE 12
-- ========================================================

-- 1. Drop SaaS Billing Tables
DROP TABLE IF EXISTS billing_subscriptions;
DROP TABLE IF EXISTS billing_invoices;

-- 2. Rollback Event Logs
DROP TABLE IF EXISTS event_logs;

-- 3. Rollback Monitoring Findings Table
-- Keep existing data if possible, rename table
ALTER TABLE monitoring_findings RENAME TO monitoring_findings_part;
CREATE TABLE monitoring_findings (
  id SERIAL PRIMARY KEY,
  visit_id INT NOT NULL,
  description TEXT NOT NULL,
  severity VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'OPEN',
  resolution_details TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  tenant_id INT NOT NULL DEFAULT 1
);
INSERT INTO monitoring_findings (id, visit_id, description, severity, status, resolution_details, resolved_at, created_at, tenant_id)
SELECT id, visit_id, description, severity, status, resolution_details, resolved_at, created_at, tenant_id FROM monitoring_findings_part;
SELECT setval(pg_get_serial_sequence('monitoring_findings', 'id'), coalesce(max(id), 1)) FROM monitoring_findings;
DROP TABLE monitoring_findings_part;


-- 4. Rollback Subject Visits Table
ALTER TABLE subject_visits RENAME TO subject_visits_part;
CREATE TABLE subject_visits (
  id SERIAL PRIMARY KEY,
  subject_id INT NOT NULL,
  visit_name VARCHAR(100) NOT NULL,
  scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
  actual_date TIMESTAMP WITH TIME ZONE,
  status VARCHAR(50) DEFAULT 'SCHEDULED',
  tenant_id INT NOT NULL DEFAULT 1
);
CREATE INDEX idx_subject_visits_subject ON subject_visits(subject_id);
INSERT INTO subject_visits (id, subject_id, visit_name, scheduled_date, actual_date, status, tenant_id)
SELECT id, subject_id, visit_name, scheduled_date, actual_date, status, tenant_id FROM subject_visits_part;
SELECT setval(pg_get_serial_sequence('subject_visits', 'id'), coalesce(max(id), 1)) FROM subject_visits;
DROP TABLE subject_visits_part;


-- 5. Rollback Audit Logs Table
ALTER TABLE audit_logs RENAME TO audit_logs_part;
CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INT,
  username VARCHAR(100) NOT NULL,
  user_role VARCHAR(100) NOT NULL,
  action_type VARCHAR(100) NOT NULL,
  target_resource VARCHAR(255) NOT NULL,
  details TEXT NOT NULL,
  ip_address VARCHAR(45) NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  tenant_id INT NOT NULL DEFAULT 1
);
CREATE RULE block_audit_delete AS ON DELETE TO audit_logs DO INSTEAD NOTHING;
CREATE RULE block_audit_update AS ON UPDATE TO audit_logs DO INSTEAD NOTHING;
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
INSERT INTO audit_logs (id, user_id, username, user_role, action_type, target_resource, details, ip_address, timestamp, tenant_id)
SELECT id, user_id, username, user_role, action_type, target_resource, details, ip_address, timestamp, tenant_id FROM audit_logs_part;
SELECT setval(pg_get_serial_sequence('audit_logs', 'id'), coalesce(max(id), 1)) FROM audit_logs;
DROP TABLE audit_logs_part;
