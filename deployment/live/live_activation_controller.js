import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import assert from 'assert';

import { RollbackController } from '../rollback/rollback_controller.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Controlled Live Traffic Activation Controller (GAMP 5 Category 4 Qualified)
 */
export class LiveActivationController {
  constructor(options = {}) {
    this.rolloutPercentage = 0; // 0, 1, 5, 25, 50, 100
    this.activeTenantId = 2; // Strict constraint: NovaBio Clinical Research only
    this.errorThreshold = 0.05; // Auto-pause rollback triggers if error rate > 5%
    this.latencyThresholdMs = 500; // Auto-pause if P95 latency > 500ms
    
    this.rollbackController = options.rollbackController || null;
    this.serviceWeights = {
      api: 100,
      edc: 100,
      rbm: 100,
      epro: 100
    };
  }

  /**
   * Evaluates if a request is eligible to route to pilot infrastructure
   */
  shouldRouteToPilot(tenantId, serviceName) {
    // 1. Strict tenant isolation check (Only tenant 2 allowed for live pilot)
    if (Number(tenantId) !== this.activeTenantId) {
      return false;
    }

    // 2. Rollout gating check based on random hashing for tenant distribution
    if (this.rolloutPercentage === 0) return false;
    if (this.rolloutPercentage === 100) return true;

    // Simulate simple deterministic hash check
    const seed = `${tenantId}_${serviceName}_pilot`;
    let sum = 0;
    for (let i = 0; i < seed.length; i++) {
      sum = (sum * 31) + seed.charCodeAt(i);
      sum = sum & sum; // Convert to 32bit integer
    }
    const hashVal = Math.abs(sum) % 100;
    return hashVal < this.rolloutPercentage;
  }

  /**
   * Sets rollout percentage progressively
   */
  setRollout(pct, userCtx = {}) {
    const validPcts = [0, 1, 5, 25, 50, 100];
    if (!validPcts.includes(pct)) {
      throw new Error(`Invalid gradual rollout percentage requested: ${pct}%`);
    }

    const prev = this.rolloutPercentage;
    this.rolloutPercentage = pct;
    console.log(`[Rollout Control] Shifted traffic percentage from ${prev}% to ${pct}% for pilot tenant`);
    return this.rolloutPercentage;
  }

  /**
   * Monitors live telemetry signals and triggers safety overrides if limits breached
   */
  async evaluateHealthSignals(telemetryMetrics, userCtx = {}) {
    const { errorRate, p95LatencyMs, queueBacklog } = telemetryMetrics;

    console.log(`[Health Monitoring] Error Rate: ${(errorRate * 100).toFixed(1)}%, Latency: ${p95LatencyMs}ms`);

    // Gating trigger logic
    if (errorRate > this.errorThreshold || p95LatencyMs > this.latencyThresholdMs) {
      console.warn(`[SAFETY TRIGGER] Performance breach detected! Error Rate: ${errorRate}, Latency: ${p95LatencyMs}ms. Initiating auto-rollback...`);
      
      // Stop traffic rollout instantly
      this.rolloutPercentage = 0;

      if (this.rollbackController) {
        await this.rollbackController.executeRollback('v15.4.0-stable', {
          id: 0,
          username: 'SAFETY_SYSTEM_AUTOMATION',
          role: 'Audit System Agent',
          details: 'Automatic roll-back due to error/latency threshold violation'
        });
      }
      return { status: 'ROLLBACK_TRIGGERED', details: 'Breach of health gates' };
    }

    return { status: 'HEALTHY' };
  }

  /**
   * Updates weight mappings for dynamic request routing
   */
  updateServiceWeight(service, weight) {
    if (this.serviceWeights[service] !== undefined) {
      this.serviceWeights[service] = Math.max(0, Math.min(100, weight));
    }
  }
}

// Isolation test runner
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log('Validating activation controller in isolation...');
  const controller = new LiveActivationController();
  
  // Verify strict tenant isolation constraint
  assert.strictEqual(controller.shouldRouteToPilot(1, 'api'), false, 'Non-pilot tenants must never route to pilot');
  assert.strictEqual(controller.shouldRouteToPilot(2, 'api'), false, 'Rollout is at 0% default');
  
  controller.setRollout(100);
  assert.strictEqual(controller.shouldRouteToPilot(2, 'api'), true, 'Rollout active for pilot tenant');
  
  console.log('Isolation validation successful.');
}
