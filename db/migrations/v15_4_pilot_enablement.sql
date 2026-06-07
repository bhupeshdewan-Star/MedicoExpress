-- Phase 15.4 Controlled Pilot Deployment - Pilot Enablement Migration
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS is_pilot BOOLEAN DEFAULT FALSE;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS environment VARCHAR(50) DEFAULT 'production';

-- Enable NovaBio Clinical Research as pilot tenant in the pilot environment
UPDATE tenants 
SET is_pilot = TRUE, environment = 'pilot'
WHERE name = 'NovaBio Clinical Research';
