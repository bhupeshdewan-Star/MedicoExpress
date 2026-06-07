import assert from 'assert';
import { fileURLToPath } from 'url';

/**
 * GAMP 5 Category 4 Qualified Evolutionary Upgrade Controller
 */
export class EvolutionController {
  constructor() {
    this.targetVersion = 'v15.7.0';
    this.readinessScore = 0;
  }

  /**
   * Evaluates if system performance and validation tests allow an upgrade
   */
  evaluateUpgradeReadiness(metrics, testSuiteFailuresCount) {
    if (testSuiteFailuresCount > 0) {
      this.readinessScore = 0;
      return { score: 0, status: 'BLOCKED', reason: `${testSuiteFailuresCount} test suite failures reported. All regressions must be resolved.` };
    }

    const { errorRate, p95LatencyMs } = metrics;
    let score = 100;

    // Deductions for unstable metrics
    if (errorRate > 0.01) score -= 30;
    if (p95LatencyMs > 180) score -= 20;

    this.readinessScore = Math.max(0, score);
    const status = this.readinessScore >= 80 ? 'READY' : 'WARNING_DEGRADED';

    return {
      score: this.readinessScore,
      status,
      reason: status === 'READY' ? 'All performance metrics and regressions validated. Upgrade path is clear.' : 'System performance is too degraded for zero-downtime evolutionary upgrade.'
    };
  }

  /**
   * Generates a rollback-safe upgrade orchestration sequence plan
   */
  generateUpgradePlan() {
    return {
      targetVersion: this.targetVersion,
      upgradeReadinessScore: this.readinessScore,
      executionSteps: [
        { step: 1, action: 'Perform cross_phase_verifier.js baseline check' },
        { step: 2, action: 'Provision Phase 15.7 sidecar containers (evolutionary rollback-safe routing)' },
        { step: 3, action: 'Run live continuous validation loops' },
        { step: 4, action: 'Switch traffic rollout progressively (1% -> 5% -> 25% -> 100%)' }
      ],
      recommendedMaintenanceWindow: '02:00 - 04:00 UTC (Low traffic hours)'
    };
  }
}

// Isolation test runner
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log('Testing evolution controller in isolation...');
  const controller = new EvolutionController();

  // Test failure case
  let readiness = controller.evaluateUpgradeReadiness({ errorRate: 0.0, p95LatencyMs: 90 }, 3);
  assert.strictEqual(readiness.score, 0);
  assert.strictEqual(readiness.status, 'BLOCKED');

  // Test healthy case
  readiness = controller.evaluateUpgradeReadiness({ errorRate: 0.0, p95LatencyMs: 90 }, 0);
  assert.strictEqual(readiness.score, 100);
  assert.strictEqual(readiness.status, 'READY');

  const plan = controller.generateUpgradePlan();
  assert.strictEqual(plan.targetVersion, 'v15.7.0');
  assert.strictEqual(plan.executionSteps.length, 4);

  console.log('Isolation validation successful.');
}
