// CLINCOMMAND OS™ GATE 3 UAT VERIFICATION TEST SUITE
// Author: Dr. Bhupesh Dewan, Mumbai, India
// Copyright Notice: © Dr. Bhupesh Dewan, Mumbai, India — All Rights Reserved

process.env.NODE_ENV = 'test';

import crypto from 'crypto';
import assert from 'assert';
import { executeStatisticalAnalysis, localBiostatsRuns, executeDescriptiveFallback, validateMethod } from '../../apps/api-core/services/biostats_gateway.js';
import { compareAgainstReference, generateValidationRecord, validateTolerance } from '../../apps/api-core/services/stat_validation_service.js';
import { getDataset, listDatasets } from '../../apps/api-core/services/validation_dataset_registry.js';
import { localAuditChain } from '../../apps/api-core/services/audit_trail_service.js';

const testStats = {
  total: 0,
  passed: 0,
  failed: 0,
  scenarios: []
};

function logAssert(description, condition) {
  testStats.total++;
  if (condition) {
    testStats.passed++;
    console.log(`[PASS] Assertion ${testStats.total}: ${description}`);
    testStats.scenarios.push({ description, status: 'PASS' });
  } else {
    testStats.failed++;
    console.error(`[FAIL] Assertion ${testStats.total}: ${description}`);
    testStats.scenarios.push({ description, status: 'FAIL' });
  }
}

async function runTests() {
  console.log('================================================================');
  console.log('CLINCOMMAND OS™ GATE 3 UAT VERIFICATION TEST SUITE');
  console.log('================================================================\n');

  const pythonUrl = process.env.BIOSTATS_SERVICE_URL || 'http://127.0.0.1:5005';

  // --- Test Scenario 1: Python Microservice Connectivity ---
  console.log('--- Test Scenario 1: Python Microservice Health Check ---');
  let pythonAvailable = false;
  try {
    const healthCheck = await fetch(`${pythonUrl}/api/stats/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ method: 'descriptive', data: { values: [1, 2, 3] } })
    });
    pythonAvailable = healthCheck.ok;
    logAssert('Python Flask statistical service is reachable on port 5005', pythonAvailable === true);
  } catch (err) {
    console.error('Python connectivity check failed:', err.message);
    logAssert('Python Flask statistical service is reachable on port 5005', false);
  }

  // --- Test Scenario 2: Dataset Hashing ---
  console.log('\n--- Test Scenario 2: Dataset Cryptographic Hashing ---');
  const datasetData = { values: [10, 20, 30, 40, 50] };
  const datasetString = JSON.stringify(datasetData);
  const hash = crypto.createHash('sha256').update(datasetString).digest('hex');
  logAssert('Dataset hash is a valid 64-character SHA-256 string', typeof hash === 'string' && hash.length === 64);
  
  const hash2 = crypto.createHash('sha256').update(datasetString).digest('hex');
  logAssert('Dataset hashing is deterministic and reproducible', hash === hash2);

  // --- Test Scenario 3: Descriptive Statistics NodeJS Fallback ---
  console.log('\n--- Test Scenario 3: NodeJS Native Descriptive Fallback Calculations ---');
  try {
    const fallbackResults = executeDescriptiveFallback([1.0, 2.0, 3.0, 4.0, 5.0]);
    const tables = fallbackResults.output_tables;

    logAssert('Descriptive fallback calculates correct Mean (3.0)', validateTolerance(tables.mean, 3.0, 0.0001));
    logAssert('Descriptive fallback calculates correct Median (3.0)', validateTolerance(tables.median, 3.0, 0.0001));
    logAssert('Descriptive fallback calculates correct Standard Deviation (1.5811)', validateTolerance(tables.std, 1.5811, 0.001));
    logAssert('Descriptive fallback calculates correct Variance (2.5)', validateTolerance(tables.variance, 2.5, 0.0001));
    logAssert('Descriptive fallback calculates correct Min (1.0)', validateTolerance(tables.min, 1.0, 0.0001));
    logAssert('Descriptive fallback calculates correct Max (5.0)', validateTolerance(tables.max, 5.0, 0.0001));
    logAssert('Descriptive fallback calculates correct Coefficient of Variation (0.5270)', validateTolerance(tables.cv, 0.5270, 0.001));
  } catch (err) {
    logAssert(`Descriptive fallback execution failed: ${err.message}`, false);
  }

  // --- Test Scenario 4: GxP Restrictive Fallback Blocking ---
  console.log('\n--- Test Scenario 4: GxP Restrictive Fallback Blocking ---');
  
  // Set invalid biostats URL to force service offline simulation
  process.env.BIOSTATS_SERVICE_URL = 'http://127.0.0.1:9999';

  // descriptive should still pass
  try {
    const res = await executeStatisticalAnalysis(1, 'sponsor1', 'Biostatistics', 'descriptive', { values: [1, 2, 3] });
    logAssert('Gateway allows Descriptive calculation even if Python service is offline', res !== null);
  } catch (err) {
    logAssert(`Gateway descriptive failed under offline simulation: ${err.message}`, false);
  }

  // Advanced calculations must fail when Python service is simulated offline
  const advancedMethods = ['t-test', 'anova', 'chi-square', 'kaplan-meier', 'logistic-regression'];
  for (const method of advancedMethods) {
    try {
      await executeStatisticalAnalysis(1, 'sponsor1', 'Biostatistics', method, { values: [1, 2, 3] });
      logAssert(`Gateway blocked offline advanced method ${method} (FAILED to block)`, false);
    } catch (err) {
      logAssert(`Gateway blocked offline advanced method ${method} (SUCCESS)`, err.message.includes('Advanced statistical methods unavailable. Validated Python engine not reachable.'));
    }
  }

  // Restore correct Python service URL for live tests
  process.env.BIOSTATS_SERVICE_URL = pythonUrl;

  // --- Test Scenario 5: Validated Calculations & Reference Comparison ---
  console.log('\n--- Test Scenario 5: Validated Calculations & Precision Verification ---');

  const validationMethods = ['t-test', 'anova', 'chi-square', 'kaplan-meier', 'logistic-regression'];
  for (const m of validationMethods) {
    try {
      console.log(`Verifying live GxP reference dataset: ${m}...`);
      const refDataset = getDataset(m);
      logAssert(`Reference dataset for ${m} is loaded from registry`, refDataset !== null);

      // Execute live comparison calculation via gateway
      const calcRun = await executeStatisticalAnalysis(1, 'sponsor1', 'Biostatistics', m, refDataset.data);
      logAssert(`Gateway returned computational results for ${m}`, calcRun !== null && calcRun.output_tables !== undefined);

      // Perform tolerance checks
      const compResults = compareAgainstReference(calcRun, refDataset);
      logAssert(`Precision verification checks passed for method ${m}`, compResults.isApproved === true);

      // Generate validation record
      const valRec = await generateValidationRecord(m, calcRun, refDataset, compResults.isApproved ? 'PASS' : 'FAIL');
      logAssert(`Validation record generated for method ${m}`, valRec !== null && valRec.status === 'PASS');
    } catch (err) {
      logAssert(`Validation run failed for ${m}: ${err.message}`, false);
    }
  }

  // --- Test Scenario 6: Database Logging, Audits & Traceability Trace ---
  console.log('\n--- Test Scenario 6: Database Audits & Traceability Logs ---');
  
  logAssert('Gateway persisted statistics runs in biostats_runs database queue', localBiostatsRuns.length >= 6);

  // Check audit trail record
  const lastAudit = localAuditChain[localAuditChain.length - 1];
  logAssert('Immutable audit record has correct STATS_RUN event code', lastAudit !== undefined && lastAudit.action === 'STATS_RUN');
  logAssert('Audit trail contains correct target entity string', lastAudit.target_entity.startsWith('biostats_run:'));

  // Method catalog verification
  const methodList = listDatasets();
  logAssert('Dataset registry has registered reference files', methodList.length >= 5);

  // Method name validations
  logAssert('Gateway validateMethod accepts "t-test"', validateMethod('t-test') === true);
  logAssert('Gateway validateMethod accepts "descriptive"', validateMethod('descriptive') === true);
  logAssert('Gateway validateMethod rejects "invalid-method"', validateMethod('invalid-method') === false);

  // GxP Copyright Notice assertion
  const descriptiveRun = localBiostatsRuns.find(r => r.method_name === 'DESCRIPTIVE');
  logAssert('Audit metadata contains correct Dr. Bhupesh Dewan copyright attribution', 
    descriptiveRun.audit_metadata.attributions === '© Dr. Bhupesh Dewan, Mumbai, India — All Rights Reserved');

  console.log('\n================================================================');
  console.log('CLINCOMMAND OS™ GATE 3 UAT VERIFICATION SUMMARY');
  console.log(`Passed: ${testStats.passed} / Failed: ${testStats.failed} / Total: ${testStats.total}`);
  console.log('© Dr. Bhupesh Dewan, Mumbai, India — All Rights Reserved');
  console.log('================================================================');

  if (testStats.failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch(err => {
  console.error('UAT verification suite crashed:', err);
  process.exit(1);
});
