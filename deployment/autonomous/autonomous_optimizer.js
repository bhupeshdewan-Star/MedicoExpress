import assert from 'assert';
import { fileURLToPath } from 'url';

/**
 * GAMP 5 Category 4 Qualified Autonomous Optimization Engine (AI Ops Sidecar)
 */
export class AutonomousOptimizer {
  constructor(options = {}) {
    this.mode = 'RECOMMENDATION_ONLY'; // RECOMMENDATION_ONLY, AUTO_APPLY
    this.auditStream = options.auditStream || null;
    
    // Performance history tracking for trend analysis
    this.latencyHistory = [];
    this.backlogHistory = [];
    this.recommendations = [];
  }

  setMode(newMode) {
    if (newMode !== 'RECOMMENDATION_ONLY' && newMode !== 'AUTO_APPLY') {
      throw new Error(`Invalid optimization mode: ${newMode}`);
    }
    this.mode = newMode;
    console.log(`[OPTIMIZER] Mode changed to: ${this.mode}`);
  }

  /**
   * Evaluates performance trends and generates tuning adjustments
   */
  async evaluateSystem(metrics, stateManager, activationController, autoscaler, userCtx = {}) {
    const { errorRate, p95LatencyMs, queueBacklog } = metrics;
    
    // Record history
    this.latencyHistory.push(p95LatencyMs);
    if (this.latencyHistory.length > 5) this.latencyHistory.shift();

    this.backlogHistory.push(queueBacklog);
    if (this.backlogHistory.length > 5) this.backlogHistory.shift();

    // 1. Trend Analysis: Check if latency is trending upwards towards SLO boundary (200ms)
    let latencyTrend = 'STABLE';
    if (this.latencyHistory.length >= 3) {
      const last = this.latencyHistory[this.latencyHistory.length - 1];
      const prev = this.latencyHistory[this.latencyHistory.length - 3];
      if (last > prev + 20) latencyTrend = 'UPWARD';
    }

    const recommendations = [];

    // Rule A: Rollout Throttling Recommendations
    if (latencyTrend === 'UPWARD' && p95LatencyMs > 150) {
      const currentRollout = activationController ? activationController.rolloutPercentage : 100;
      if (currentRollout > 25) {
        recommendations.push({
          target: 'traffic_rollout',
          action: 'DECREASE_ROLLOUT',
          value: 25,
          reason: `P95 latency is trending UPWARD (${p95LatencyMs}ms) near 200ms SLO limit. Reducing rollout to 25% to stabilize load.`
        });
      }
    }

    // Rule B: Autoscaler tuning recommendations based on ePRO backlog queue depth
    if (queueBacklog > 100) {
      const lastBacklog = this.backlogHistory[this.backlogHistory.length - 1] || 0;
      const prevBacklog = this.backlogHistory[this.backlogHistory.length - 3] || 0;
      
      if (lastBacklog > prevBacklog) {
        recommendations.push({
          target: 'autoscaler',
          action: 'SCALE_UP_REPLICAS',
          value: (autoscaler ? autoscaler.currentReplicas : 2) + 2,
          reason: `Queue backlog is accumulating dynamically (${queueBacklog} items). Preemptively scaling cluster.`
        });
      }
    }

    // Apply recommendations if mode is AUTO_APPLY
    const appliedActions = [];
    for (const rec of recommendations) {
      this.recommendations.push({
        ...rec,
        timestamp: new Date().toISOString(),
        status: this.mode === 'AUTO_APPLY' ? 'APPLIED' : 'PROPOSED'
      });

      if (this.mode === 'AUTO_APPLY') {
        if (rec.target === 'traffic_rollout' && activationController) {
          activationController.setRollout(rec.value, { username: 'AUTONOMOUS_OPTIMIZER' });
          appliedActions.push(rec);
        }
        if (rec.target === 'autoscaler' && autoscaler) {
          autoscaler.currentReplicas = Math.min(autoscaler.maxReplicas, rec.value);
          appliedActions.push(rec);
        }

        // Log mutation to ledger
        if (this.auditStream) {
          await this.auditStream.appendEvent('AUTONOMOUS_TUNING_APPLIED', rec, {
            username: 'AUTONOMOUS_OPTIMIZER',
            role: 'Optimization Engine'
          });
        }
      }
    }

    return {
      recommendations,
      applied: this.mode === 'AUTO_APPLY',
      appliedActions
    };
  }

  getProposed() {
    return this.recommendations.filter(r => r.status === 'PROPOSED');
  }

  getApplied() {
    return this.recommendations.filter(r => r.status === 'APPLIED');
  }
}

// Isolation test runner
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log('Testing autonomous optimizer in isolation...');
  const optimizer = new AutonomousOptimizer();
  assert.strictEqual(optimizer.mode, 'RECOMMENDATION_ONLY');

  // Test custom mock modules
  const mockActivation = {
    rolloutPercentage: 100,
    setRollout(val) { this.rolloutPercentage = val; }
  };
  const mockAutoscaler = {
    currentReplicas: 2,
    maxReplicas: 10
  };

  // Push ascending latency values
  optimizer.evaluateSystem({ p95LatencyMs: 100, queueBacklog: 20 }, null, mockActivation, mockAutoscaler);
  optimizer.evaluateSystem({ p95LatencyMs: 130, queueBacklog: 20 }, null, mockActivation, mockAutoscaler);
  const result = await optimizer.evaluateSystem({ p95LatencyMs: 160, queueBacklog: 20 }, null, mockActivation, mockAutoscaler);

  assert.strictEqual(result.recommendations.length, 1);
  assert.strictEqual(result.recommendations[0].action, 'DECREASE_ROLLOUT');
  assert.strictEqual(mockActivation.rolloutPercentage, 100, 'Recommendation mode must not mutate state');

  // Switch to AUTO_APPLY and test again
  optimizer.setMode('AUTO_APPLY');
  optimizer.latencyHistory = [100, 130];
  const autoResult = await optimizer.evaluateSystem({ p95LatencyMs: 160, queueBacklog: 20 }, null, mockActivation, mockAutoscaler);
  assert.strictEqual(mockActivation.rolloutPercentage, 25, 'Auto-apply mode must mutate state');

  console.log('Isolation validation successful.');
}
