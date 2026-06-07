-- ========================================================
-- CLINCOMMAND OS™ DATABASE SCHEMA MIGRATION - PHASE 12
-- ========================================================

-- 1. Create SaaS Billing Subscriptions Table
CREATE TABLE IF NOT EXISTS billing_subscriptions (
  id SERIAL PRIMARY KEY,
  tenant_id INT UNIQUE NOT NULL,
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  plan_tier VARCHAR(50) DEFAULT 'Starter',
  status VARCHAR(50) DEFAULT 'active',
  current_period_end TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create SaaS Billing Invoices Table
CREATE TABLE IF NOT EXISTS billing_invoices (
  id SERIAL PRIMARY KEY,
  tenant_id INT NOT NULL,
  invoice_number VARCHAR(100) UNIQUE NOT NULL,
  amount_cents INT NOT NULL,
  status VARCHAR(50) NOT NULL,
  billing_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Partitioning: Audit Logs Table
-- Rename existing audit_logs
ALTER TABLE audit_logs RENAME TO audit_logs_old;

-- Drop dependent rules/indexes on audit_logs_old to avoid collisions
DROP RULE IF EXISTS block_audit_delete ON audit_logs_old;
DROP RULE IF EXISTS block_audit_update ON audit_logs_old;
DROP INDEX IF EXISTS idx_audit_logs_timestamp;
DROP INDEX IF EXISTS idx_audit_logs_user;

-- Create partitioned table
CREATE TABLE audit_logs (
  id SERIAL,
  user_id INT,
  username VARCHAR(100) NOT NULL,
  user_role VARCHAR(100) NOT NULL,
  action_type VARCHAR(100) NOT NULL,
  target_resource VARCHAR(255) NOT NULL,
  details TEXT NOT NULL,
  ip_address VARCHAR(45) NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  tenant_id INT NOT NULL DEFAULT 1,
  PRIMARY KEY (id, timestamp)
) PARTITION BY RANGE (timestamp);

-- Create Partitions
CREATE TABLE audit_logs_y2025 PARTITION OF audit_logs FOR VALUES FROM ('2025-01-01 00:00:00+00') TO ('2026-01-01 00:00:00+00');
CREATE TABLE audit_logs_y2026 PARTITION OF audit_logs FOR VALUES FROM ('2026-01-01 00:00:00+00') TO ('2027-01-01 00:00:00+00');
CREATE TABLE audit_logs_y2027 PARTITION OF audit_logs FOR VALUES FROM ('2027-01-01 00:00:00+00') TO ('2028-01-01 00:00:00+00');
CREATE TABLE audit_logs_default PARTITION OF audit_logs DEFAULT;

-- Recreate rules for 21 CFR Part 11 Compliance
CREATE RULE block_audit_delete AS ON DELETE TO audit_logs DO INSTEAD NOTHING;
CREATE RULE block_audit_update AS ON UPDATE TO audit_logs DO INSTEAD NOTHING;

-- Recreate Indexes
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);

-- Migrate existing data
INSERT INTO audit_logs (id, user_id, username, user_role, action_type, target_resource, details, ip_address, timestamp, tenant_id)
SELECT id, user_id, username, user_role, action_type, target_resource, details, ip_address, timestamp, tenant_id FROM audit_logs_old;

-- Update serial sequence
SELECT setval(pg_get_serial_sequence('audit_logs', 'id'), coalesce(max(id), 1)) FROM audit_logs;

-- Drop old table
DROP TABLE audit_logs_old;


-- 4. Partitioning: Subject Visits (Visit Records)
-- Rename existing
ALTER TABLE subject_visits RENAME TO subject_visits_old;
DROP INDEX IF EXISTS idx_subject_visits_subject;

-- Create partitioned table
CREATE TABLE subject_visits (
  id SERIAL,
  subject_id INT NOT NULL,
  visit_name VARCHAR(100) NOT NULL,
  scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
  actual_date TIMESTAMP WITH TIME ZONE,
  status VARCHAR(50) DEFAULT 'SCHEDULED',
  tenant_id INT NOT NULL DEFAULT 1,
  PRIMARY KEY (id, scheduled_date)
) PARTITION BY RANGE (scheduled_date);

-- Create Partitions
CREATE TABLE subject_visits_y2025 PARTITION OF subject_visits FOR VALUES FROM ('2025-01-01 00:00:00+00') TO ('2026-01-01 00:00:00+00');
CREATE TABLE subject_visits_y2026 PARTITION OF subject_visits FOR VALUES FROM ('2026-01-01 00:00:00+00') TO ('2027-01-01 00:00:00+00');
CREATE TABLE subject_visits_y2027 PARTITION OF subject_visits FOR VALUES FROM ('2027-01-01 00:00:00+00') TO ('2028-01-01 00:00:00+00');
CREATE TABLE subject_visits_default PARTITION OF subject_visits DEFAULT;

-- Recreate Index
CREATE INDEX idx_subject_visits_subject ON subject_visits(subject_id);

-- Migrate existing data
INSERT INTO subject_visits (id, subject_id, visit_name, scheduled_date, actual_date, status, tenant_id)
SELECT id, subject_id, visit_name, scheduled_date, actual_date, status, tenant_id FROM subject_visits_old;

-- Update serial sequence
SELECT setval(pg_get_serial_sequence('subject_visits', 'id'), coalesce(max(id), 1)) FROM subject_visits;

-- Drop old table
DROP TABLE subject_visits_old;


-- 5. Partitioning: Monitoring Findings (Monitoring Reports/Findings)
-- Rename existing
ALTER TABLE monitoring_findings RENAME TO monitoring_findings_old;

-- Create partitioned table
CREATE TABLE monitoring_findings (
  id SERIAL,
  visit_id INT NOT NULL,
  description TEXT NOT NULL,
  severity VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'OPEN',
  resolution_details TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  tenant_id INT NOT NULL DEFAULT 1,
  PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

-- Create Partitions
CREATE TABLE monitoring_findings_y2025 PARTITION OF monitoring_findings FOR VALUES FROM ('2025-01-01 00:00:00+00') TO ('2026-01-01 00:00:00+00');
CREATE TABLE monitoring_findings_y2026 PARTITION OF monitoring_findings FOR VALUES FROM ('2026-01-01 00:00:00+00') TO ('2027-01-01 00:00:00+00');
CREATE TABLE monitoring_findings_y2027 PARTITION OF monitoring_findings FOR VALUES FROM ('2027-01-01 00:00:00+00') TO ('2028-01-01 00:00:00+00');
CREATE TABLE monitoring_findings_default PARTITION OF monitoring_findings DEFAULT;

-- Migrate existing data
INSERT INTO monitoring_findings (id, visit_id, description, severity, status, resolution_details, resolved_at, created_at, tenant_id)
SELECT id, visit_id, description, severity, status, resolution_details, resolved_at, created_at, tenant_id FROM monitoring_findings_old;

-- Update serial sequence
SELECT setval(pg_get_serial_sequence('monitoring_findings', 'id'), coalesce(max(id), 1)) FROM monitoring_findings;

-- Drop old table
DROP TABLE monitoring_findings_old;


-- 6. Partitioning: Event Logs Table
CREATE TABLE IF NOT EXISTS event_logs (
  id SERIAL,
  event_type VARCHAR(100) NOT NULL,
  event_source VARCHAR(100) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  tenant_id INT NOT NULL DEFAULT 1,
  PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

-- Create Partitions
CREATE TABLE event_logs_y2025 PARTITION OF event_logs FOR VALUES FROM ('2025-01-01 00:00:00+00') TO ('2026-01-01 00:00:00+00');
CREATE TABLE event_logs_y2026 PARTITION OF event_logs FOR VALUES FROM ('2026-01-01 00:00:00+00') TO ('2027-01-01 00:00:00+00');
CREATE TABLE event_logs_y2027 PARTITION OF event_logs FOR VALUES FROM ('2027-01-01 00:00:00+00') TO ('2028-01-01 00:00:00+00');
CREATE TABLE event_logs_default PARTITION OF event_logs DEFAULT;
