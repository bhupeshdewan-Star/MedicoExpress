-- ========================================================
-- CLINCOMMAND OS™ DATABASE SCHEMA MIGRATION - PHASE 13
-- ========================================================

-- 1. Randomization Configuration Table
CREATE TABLE IF NOT EXISTS study_randomization_configs (
  id SERIAL PRIMARY KEY,
  study_id INT UNIQUE NOT NULL REFERENCES studies(id) ON DELETE CASCADE,
  block_sizes INT[] NOT NULL DEFAULT '{4, 6}',
  stratification_factors VARCHAR(100)[] DEFAULT '{}',
  randomization_ratio VARCHAR(20) DEFAULT '1:1',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  tenant_id INT NOT NULL DEFAULT 1
);

-- 2. Supply Kits Inventory Table (Blinded Depot Stock)
CREATE TABLE IF NOT EXISTS study_supply_kits (
  id SERIAL PRIMARY KEY,
  study_id INT NOT NULL REFERENCES studies(id) ON DELETE CASCADE,
  site_id INT REFERENCES study_sites(id) ON DELETE SET NULL,
  kit_number VARCHAR(50) UNIQUE NOT NULL,
  treatment_arm VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'AVAILABLE', -- AVAILABLE, ASSIGNED, DISPENSED, QUARANTINED
  is_blinded BOOLEAN DEFAULT TRUE,
  expiration_date TIMESTAMP WITH TIME ZONE NOT NULL,
  tenant_id INT NOT NULL DEFAULT 1
);

-- 3. Randomization Execution Logs Table (Blinded Assignment mapping)
CREATE TABLE IF NOT EXISTS subject_randomizations (
  id SERIAL PRIMARY KEY,
  subject_id INT UNIQUE NOT NULL REFERENCES study_subjects(id) ON DELETE CASCADE,
  randomization_number VARCHAR(50) UNIQUE NOT NULL,
  treatment_arm VARCHAR(50) NOT NULL,
  randomized_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  tenant_id INT NOT NULL DEFAULT 1
);

-- 4. Dispensation Logs Table
CREATE TABLE IF NOT EXISTS subject_dispensations (
  id SERIAL PRIMARY KEY,
  subject_id INT NOT NULL REFERENCES study_subjects(id) ON DELETE CASCADE,
  visit_id INT NOT NULL REFERENCES subject_visits(id) ON DELETE CASCADE,
  kit_id INT UNIQUE NOT NULL REFERENCES study_supply_kits(id) ON DELETE CASCADE,
  dispensed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  dispensed_by INT REFERENCES users(id) ON DELETE SET NULL,
  tenant_id INT NOT NULL DEFAULT 1
);

-- Enable RLS
ALTER TABLE study_randomization_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_supply_kits ENABLE ROW LEVEL SECURITY;
ALTER TABLE subject_randomizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE subject_dispensations ENABLE ROW LEVEL SECURITY;

-- Create Tenant Isolation RLS Policies
DROP POLICY IF EXISTS tenant_isolation_rtsm_configs ON study_randomization_configs;
DROP POLICY IF EXISTS tenant_isolation_rtsm_kits ON study_supply_kits;
DROP POLICY IF EXISTS tenant_isolation_subject_rands ON subject_randomizations;
DROP POLICY IF EXISTS tenant_isolation_dispensations ON subject_dispensations;

CREATE POLICY tenant_isolation_rtsm_configs ON study_randomization_configs FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::integer OR current_setting('app.current_tenant_id', true) = '');
CREATE POLICY tenant_isolation_rtsm_kits ON study_supply_kits FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::integer OR current_setting('app.current_tenant_id', true) = '');
CREATE POLICY tenant_isolation_subject_rands ON subject_randomizations FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::integer OR current_setting('app.current_tenant_id', true) = '');
CREATE POLICY tenant_isolation_dispensations ON subject_dispensations FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::integer OR current_setting('app.current_tenant_id', true) = '');

-- Atomic Dispensation Function
CREATE OR REPLACE FUNCTION fn_dispense_kit(
  p_subject_id INT,
  p_visit_id INT,
  p_user_id INT,
  p_tenant_id INT
) RETURNS INT AS $$
DECLARE
  v_arm VARCHAR(50);
  v_kit_id INT;
  v_site_id INT;
BEGIN
  -- 1. Get treatment arm of subject
  SELECT treatment_arm INTO v_arm FROM subject_randomizations WHERE subject_id = p_subject_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Subject must be randomized before kit dispensation.';
  END IF;

  -- 2. Get site id of subject
  SELECT site_id INTO v_site_id FROM study_subjects WHERE id = p_subject_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Subject record not found.';
  END IF;

  -- 3. Find first available kit matching treatment arm at subject site
  SELECT id INTO v_kit_id 
  FROM study_supply_kits 
  WHERE site_id = v_site_id 
    AND treatment_arm = v_arm 
    AND status = 'AVAILABLE' 
    AND expiration_date > CURRENT_TIMESTAMP
  ORDER BY expiration_date ASC, id ASC
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No matching kits available at site inventory.';
  END IF;

  -- 4. Update kit status to ASSIGNED (or DISPENSED)
  UPDATE study_supply_kits SET status = 'DISPENSED' WHERE id = v_kit_id;

  -- 5. Insert dispensation record
  INSERT INTO subject_dispensations (subject_id, visit_id, kit_id, dispensed_by, tenant_id)
  VALUES (p_subject_id, p_visit_id, v_kit_id, p_user_id, p_tenant_id);

  -- 6. Insert transaction trace to event logs for audit compliance
  INSERT INTO event_logs (event_type, event_source, message, tenant_id)
  VALUES ('KIT_DISPENSED', 'rtsm-service', 'Dispensed kit ID ' || v_kit_id || ' to subject ID ' || p_subject_id, p_tenant_id);

  RETURN v_kit_id;
END;
$$ LANGUAGE plpgsql;
