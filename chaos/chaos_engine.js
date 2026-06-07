import assert from 'assert';
import { fileURLToPath } from 'url';

/**
 * GAMP 5 Category 4 Qualified Chaos & Resilience Testing Engine
 */
export class ChaosEngine {
  constructor() {
    this.injections = {
      redisLatencyMs: 0,
      dbSlowdownMs: 0,
      apiDelayMs: 0,
      queueBacklogBuildup: 0
    };
  }

  /**
   * Inject simulated latency into Redis operations
   */
  injectRedisLatency(durationMs) {
    this.injections.redisLatencyMs = durationMs;
    console.log(`[CHAOS] Injected Redis latency: ${durationMs}ms`);
  }

  /**
   * Inject simulated slowdowns in SQL database query executions
   */
  injectDBSlowdown(durationMs) {
    this.injections.dbSlowdownMs = durationMs;
    console.log(`[CHAOS] Injected Database query slowdown: ${durationMs}ms`);
  }

  /**
   * Inject simulated API route response delays
   */
  injectApiDelay(durationMs) {
    this.injections.apiDelayMs = durationMs;
    console.log(`[CHAOS] Injected API delay: ${durationMs}ms`);
  }

  /**
   * Buildup queue depth backlog parameters
   */
  injectQueueBacklog(depth) {
    this.injections.queueBacklogBuildup = depth;
    console.log(`[CHAOS] Injected Queue backlog buildup: ${depth} messages`);
  }

  /**
   * Disables all active injections
   */
  clearInjections() {
    this.injections = {
      redisLatencyMs: 0,
      dbSlowdownMs: 0,
      apiDelayMs: 0,
      queueBacklogBuildup: 0
    };
    console.log('[CHAOS] All active fault injections cleared.');
  }

  /**
   * Executes a timed validation simulation sequence and returns validation telemetry
   */
  async runResilienceValidation(metricsCollector, incidentEngine, stateManager, activationController) {
    console.log('\n--- Starting Chaos Resilience Validation Run ---');
    const simulationReport = {
      timestamp: new Date().toISOString(),
      steps: []
    };

    // 1. Simulate DB slowdown and API delays (P1 scenario: slow response, backlog buildup)
    this.injectDBSlowdown(400);
    this.injectQueueBacklog(180);

    // Mock telemetry metrics reflecting the injected slowdown
    const p1Metrics = {
      errorRate: 0.06,
      p95LatencyMs: 650,
      queueBacklog: this.injections.queueBacklogBuildup,
      rbmFailureRate: 1,
      dbSlowQueriesCount: 2
    };

    // Record metrics in metrics collector
    for (let i = 0; i < 50; i++) {
      metricsCollector.recordLatency('/api/v1/rtsm/dispense', this.injections.dbSlowdownMs + 100);
    }
    metricsCollector.metrics.httpRequestsTotal = 50;
    metricsCollector.metrics.httpErrorsTotal = 3; // 6% error rate
    metricsCollector.metrics.eproSyncDelayAvg = 75; // above 60s SLO

    // Evaluate in Incident Engine
    let incident = await incidentEngine.evaluateMetrics(p1Metrics);
    
    // Assert Incident classification & response
    assert.strictEqual(incident.priority, 'P1', 'Chaos Engine Error: Expected P1 incident to be raised');
    assert.strictEqual(stateManager.state.status, 'SYSTEM_THROTTLED', 'Chaos Engine Error: Expected state to transition to SYSTEM_THROTTLED');
    assert.strictEqual(activationController.rolloutPercentage, 5, 'Chaos Engine Error: Expected traffic rollout to be throttled to 5%');

    simulationReport.steps.push({
      phase: 'P1_SLO_BREACH',
      metrics: { ...p1Metrics },
      incidentRaised: incident.id,
      systemState: stateManager.state.status,
      rolloutPercentage: activationController.rolloutPercentage
    });

    // 2. Simulate complete failure (P0 scenario: high errors + severe slowdowns)
    this.injectApiDelay(1200);
    this.injectDBSlowdown(1500);

    const p0Metrics = {
      errorRate: 0.15,
      p95LatencyMs: this.injections.apiDelayMs + 200,
      queueBacklog: 250,
      rbmFailureRate: 10,
      dbSlowQueriesCount: 15
    };

    // Update state manager and evaluate P0 metrics
    incident = await incidentEngine.evaluateMetrics(p0Metrics);
    
    // Verify emergency rollback auto-mitigation
    assert.strictEqual(incident.priority, 'P0', 'Chaos Engine Error: Expected P0 incident to be raised');
    assert.strictEqual(stateManager.state.status, 'SYSTEM_EMERGENCY_ROLLED_BACK', 'Chaos Engine Error: Expected state to transition to SYSTEM_EMERGENCY_ROLLED_BACK');
    assert.strictEqual(activationController.rolloutPercentage, 0, 'Chaos Engine Error: Expected traffic rollout to be set to 0%');

    simulationReport.steps.push({
      phase: 'P0_CRITICAL_OUTAGE',
      metrics: { ...p0Metrics },
      incidentRaised: incident.id,
      systemState: stateManager.state.status,
      rolloutPercentage: activationController.rolloutPercentage
    });

    // Clean up chaos injections
    this.clearInjections();
    console.log('--- Chaos Resilience Validation Run Completed Successfully ---\n');

    return simulationReport;
  }
}

// Isolation runner verification check
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log('Testing chaos engine in isolation...');
  const chaos = new ChaosEngine();
  chaos.injectRedisLatency(150);
  assert.strictEqual(chaos.injections.redisLatencyMs, 150);
  chaos.clearInjections();
  assert.strictEqual(chaos.injections.redisLatencyMs, 0);
  console.log('Isolation validation successful.');
}
