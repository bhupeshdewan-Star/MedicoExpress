-- Phase 15.4 Controlled Pilot Deployment - Pilot Enablement Rollback
ALTER TABLE tenants DROP COLUMN IF EXISTS is_pilot;
ALTER TABLE tenants DROP COLUMN IF EXISTS environment;
