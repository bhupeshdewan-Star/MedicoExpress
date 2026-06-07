import assert from 'assert';
import { fileURLToPath } from 'url';

/**
 * GAMP 5 Category 4 Qualified Global SLO Enforcement Engine
 */
export class SloEnforcementEngine {
  constructor(options = {}) {
    this.incidentEngine = options.incidentEngine || null;
    this.autoscaler = options.autoscaler || null;
    this.auditStream = options.auditStream || null;

    // Load static thresholds matching slo_definitions.yml
    this.thresholds = {
      p95LatencyLimit: 200,   // ms
      eproLagLimit: 60,       // seconds
      telemetryDropLimit: 0.10 // percentage
    };
  }

  /**
   * Evaluates live metrics directly against hard SLO limits and triggers closed-loop responses
   */
  async evaluateSloBreaches(metrics) {
    const { p95LatencyMs, eproSyncDelayAvg, telemetryDropRate, errorRate } = metrics;
    const breaches = [];

    console.log(`[SLO ENFORCEMENT] Testing metrics. Latency: ${p95LatencyMs}ms, ePRO lag: ${eproSyncDelayAvg}s`);

    // 1. P95 Latency Breach Check
    if (p95LatencyMs > this.thresholds.p95LatencyLimit) {
      breaches.push({
        sloId: 'SLO-API-LATENCY',
        name: 'API Route P95 Response Latency',
        limit: this.thresholds.p95LatencyLimit,
        actual: p95LatencyMs,
        severity: 'CRITICAL'
      });
    }

    // 2. ePRO Sync Lag Check
    if (eproSyncDelayAvg > this.thresholds.eproLagLimit) {
      breaches.push({
        sloId: 'SLO-EPRO-LAG',
        name: 'ePRO Ingestion Synchronization Lag',
        limit: this.thresholds.eproLagLimit,
        actual: eproSyncDelayAvg,
        severity: 'WARNING'
      });
    }

    // 3. Telemetry Ingest Drop Rate Check
    if (telemetryDropRate > this.thresholds.telemetryDropLimit) {
      breaches.push({
        sloId: 'SLO-TELEM-DROP',
        name: 'Wearables Telemetry Package Drop Rate',
        limit: this.thresholds.telemetryDropLimit,
        actual: telemetryDropRate,
        severity: 'CRITICAL'
      });
    }

    // Trigger responses if any breaches occur
    if (breaches.length > 0) {
      console.warn(`[SLO BREACHED] Detected ${breaches.length} active SLO violations! Triggering mitigations...`);

      // Trigger Incident engine escalation
      if (this.incidentEngine) {
        const isCritical = breaches.some(b => b.severity === 'CRITICAL');
        const simulatedMetrics = {
          errorRate: isCritical ? 0.12 : 0.06,
          p95LatencyMs,
          queueBacklog: eproSyncDelayAvg > 60 ? 160 : 50,
          rbmFailureRate: 0,
          dbSlowQueriesCount: isCritical ? 12 : 0
        };
        await this.incidentEngine.evaluateMetrics(simulatedMetrics);
      }

      // Trigger Autoscaler adjustment
      if (this.autoscaler && (eproSyncDelayAvg > this.thresholds.eproLagLimit || telemetryDropRate > this.thresholds.telemetryDropLimit)) {
        this.autoscaler.evaluateScaling({
          cpuUsage: 80,
          activeTenants: [2],
          queueBacklogs: { telemetry: eproSyncDelayAvg > 60 ? 180 : 30 }
        });
      }

      // Log audit records
      if (this.auditStream) {
        for (const breach of breaches) {
          await this.auditStream.appendEvent('SLO_BREACH_ENFORCED', breach, {
            username: 'SLO_ENFORCEMENT_ENGINE',
            role: 'Observability System'
          });
        }
      }
    }

    return breaches;
  }
}

// Isolation test runner
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log('Testing SLO enforcement engine in isolation...');
  
  const mockScaler = {
    currentReplicas: 2,
    maxReplicas: 10,
    evaluateScaling(metrics) {
      this.currentReplicas = 4;
    }
  };

  const mockIncident = {
    evaluated: false,
    evaluateMetrics(metrics) {
      this.evaluated = true;
    }
  };

  const engine = new SloEnforcementEngine({
    autoscaler: mockScaler,
    incidentEngine: mockIncident
  });

  // Evaluate normal metrics - no breaches
  let breaches = await engine.evaluateSloBreaches({
    p95LatencyMs: 120,
    eproSyncDelayAvg: 40,
    telemetryDropRate: 0.05,
    errorRate: 0.0
  });
  assert.strictEqual(breaches.length, 0);

  // Evaluate breaching metrics
  breaches = await engine.evaluateSloBreaches({
    p95LatencyMs: 250, // breaches limit 200ms
    eproSyncDelayAvg: 75, // breaches limit 60s
    telemetryDropRate: 0.05,
    errorRate: 0.02
  });

  assert.strictEqual(breaches.length, 2);
  assert.strictEqual(mockIncident.evaluated, true);
  assert.strictEqual(mockScaler.currentReplicas, 4);

  console.log('Isolation validation successful.');
}
