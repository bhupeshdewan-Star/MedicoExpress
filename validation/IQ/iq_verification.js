import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ValidationRunner } from '../../packages/validation-sdk/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');

async function runIQ() {
  const runner = new ValidationRunner('Installation Qualification (IQ)');

  // 1. Verify Monorepo Workspace Paths
  await runner.runTest('VAL-IQ-001', 'Verify core apps workspace directories exist', () => {
    const apps = ['api-core', 'web', 'mobile-epro'];
    apps.forEach(app => {
      const appPath = path.join(rootDir, 'apps', app);
      assert.ok(fs.existsSync(appPath), `Workspace app folder missing: ${app}`);
    });
  });

  await runner.runTest('VAL-IQ-002', 'Verify enterprise services skeletons exist', () => {
    const services = ['dct-service', 'epro-sync-service', 'rbm-ai-service', 'rsdv-service', 'wearables-gateway'];
    services.forEach(srv => {
      const srvPath = path.join(rootDir, 'services', srv);
      assert.ok(fs.existsSync(srvPath), `Service skeleton folder missing: ${srv}`);
    });
  });

  await runner.runTest('VAL-IQ-003', 'Verify reusable SDK packages exist', () => {
    const pkgs = ['shared-types', 'audit-sdk', 'auth-sdk', 'validation-sdk'];
    pkgs.forEach(pkg => {
      const pkgPath = path.join(rootDir, 'packages', pkg);
      assert.ok(fs.existsSync(pkgPath), `SDK package folder missing: ${pkg}`);
    });
  });

  // 2. Verify Schema Files and Migrations Setup
  await runner.runTest('VAL-IQ-004', 'Verify SQL migration and rollback files exist', () => {
    const migrationFile = path.join(rootDir, 'db/migrations/v15_1_target_schemas.sql');
    const rollbackFile = path.join(rootDir, 'db/migrations/v15_1_target_schemas_rollback.sql');
    assert.ok(fs.existsSync(migrationFile), 'Phase 15.1 migration schema file not found');
    assert.ok(fs.existsSync(rollbackFile), 'Phase 15.1 rollback schema file not found');
  });

  await runner.runTest('VAL-IQ-005', 'Verify schema definitions contain target tables', () => {
    const schemaSql = fs.readFileSync(path.join(rootDir, 'db/migrations/v15_1_target_schemas.sql'), 'utf8');
    const expectedTables = [
      'dct_virtual_visits',
      'dct_visit_events',
      'subject_econsent_signatures',
      'epro_questionnaires',
      'epro_question_versions',
      'epro_responses',
      'epro_subject_schedules',
      'study_risk_scores',
      'site_risk_scores',
      'subject_risk_scores',
      'ai_alerts',
      'source_documents',
      'source_document_reviews',
      'verification_tasks',
      'subject_wearable_telemetry',
      'telemetry_ingestion_jobs'
    ];
    expectedTables.forEach(table => {
      assert.ok(schemaSql.includes(table), `Table definition for ${table} missing in SQL schema`);
    });
  });

  runner.report();
}

runIQ().catch(err => {
  console.error('IQ Execution failed:', err);
  process.exit(1);
});
