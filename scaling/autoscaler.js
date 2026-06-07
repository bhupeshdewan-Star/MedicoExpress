import assert from 'assert';
import { fileURLToPath } from 'url';

/**
 * GAMP 5 Category 4 Qualified Auto-Scaling & Resource Optimization Engine
 */
export class AutoScaler {
  constructor(options = {}) {
    this.currentReplicas = 2;
    this.minReplicas = 2;
    this.maxReplicas = 10;
    
    // Configurable scaling triggers
    this.stdCpuThreshold = 70; // 70% CPU usage threshold
    this.novaBioCpuThreshold = 50; // Priority boost CPU usage threshold for NovaBio
    this.queueScaleThreshold = 100; // Queue depth trigger threshold

    // Rolling averages for predictive smoothing (avoiding thrashing)
    this.loadHistory = [];
    this.maxHistorySize = 5;

    this.flagEngine = options.flagEngine || null;
  }

  /**
   * Calculates the target replica count based on system metrics
   */
  evaluateScaling(metrics) {
    const { cpuUsage, queueBacklogs = {}, activeTenants = [] } = metrics;

    // 1. Predictive smoothing: record current CPU load and average it
    this.loadHistory.push(cpuUsage);
    if (this.loadHistory.length > this.maxHistorySize) {
      this.loadHistory.shift();
    }
    const smoothCpu = this.loadHistory.reduce((sum, val) => sum + val, 0) / this.loadHistory.length;

    // 2. Tenant Priority Boost Check
    // If NovaBio (tenant_id = 2) is active, lower the CPU threshold for faster scaling
    const isNovaBioActive = activeTenants.includes(2);
    const targetCpuThreshold = isNovaBioActive ? this.novaBioCpuThreshold : this.stdCpuThreshold;

    let targetReplicas = this.currentReplicas;
    let scalingReason = 'Load within nominal bounds';

    // 3. Evaluate CPU threshold
    if (smoothCpu > targetCpuThreshold) {
      targetReplicas = Math.ceil(this.currentReplicas * 1.5);
      scalingReason = `Average CPU ${smoothCpu.toFixed(1)}% breached threshold of ${targetCpuThreshold}% (NovaBio Priority Boost: ${isNovaBioActive})`;
    }

    // 4. Feature-aware queue scaling evaluation
    // If telemetry queue is backlogged, scale up unless "wearables_telemetry" feature is globally killed
    const telemetryQueueDepth = queueBacklogs.telemetry || 0;
    const isTelemetryEnabled = this.flagEngine ? this.flagEngine.isEnabled('wearables_telemetry', 2) : true;

    if (telemetryQueueDepth > this.queueScaleThreshold) {
      if (isTelemetryEnabled) {
        // Suppress scaling if queue isn't active, otherwise scale up
        const targetFromQueue = Math.ceil(telemetryQueueDepth / 50);
        if (targetFromQueue > targetReplicas) {
          targetReplicas = targetFromQueue;
          scalingReason = `Telemetry queue depth (${telemetryQueueDepth}) requires expanded pool`;
        }
      } else {
        scalingReason += ' | Telemetry queue scaling SUPPRESSED due to feature-flag kill-switch';
      }
    }

    // Enforce limits
    targetReplicas = Math.max(this.minReplicas, Math.min(this.maxReplicas, targetReplicas));

    const previousReplicas = this.currentReplicas;
    this.currentReplicas = targetReplicas;

    if (previousReplicas !== this.currentReplicas) {
      console.log(`[AUTOSCALER] Scaling event: Replicas changed from ${previousReplicas} to ${this.currentReplicas}. Reason: ${scalingReason}`);
    }

    return {
      previousReplicas,
      currentReplicas: this.currentReplicas,
      scalingReason
    };
  }
}

// Isolation tests
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log('Testing auto-scaler in isolation...');
  const scaler = new AutoScaler();

  // Test smoothing and basic evaluation
  scaler.evaluateScaling({ cpuUsage: 30, activeTenants: [1], queueBacklogs: { telemetry: 10 } });
  assert.strictEqual(scaler.currentReplicas, 2);

  // Test NovaBio priority boost (lowers threshold from 70% to 50%)
  scaler.evaluateScaling({ cpuUsage: 55, activeTenants: [2], queueBacklogs: { telemetry: 10 } });
  scaler.evaluateScaling({ cpuUsage: 55, activeTenants: [2], queueBacklogs: { telemetry: 10 } });
  scaler.evaluateScaling({ cpuUsage: 55, activeTenants: [2], queueBacklogs: { telemetry: 10 } });
  scaler.evaluateScaling({ cpuUsage: 55, activeTenants: [2], queueBacklogs: { telemetry: 10 } });
  scaler.evaluateScaling({ cpuUsage: 55, activeTenants: [2], queueBacklogs: { telemetry: 10 } });
  assert.ok(scaler.currentReplicas > 2, 'Should scale up due to NovaBio priority boost');

  console.log('Auto-scaler isolation validation successful.');
}
