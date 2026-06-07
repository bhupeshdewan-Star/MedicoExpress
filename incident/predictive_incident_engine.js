import assert from 'assert';
import { fileURLToPath } from 'url';

/**
 * GAMP 5 Category 4 Qualified Predictive Incident Prevention Engine
 */
export class PredictiveIncidentEngine {
  constructor(options = {}) {
    this.autoscaler = options.autoscaler || null;
    this.flagEngine = options.flagEngine || null;
    this.auditStream = options.auditStream || null;

    // Trend tracking arrays
    this.recentLatencies = [];
    this.recentErrors = [];
    this.recentBacklogs = [];
  }

  /**
   * Evaluates system trajectory to forecast outage probability
   */
  forecastOutageRisk(metrics) {
    const { errorRate, p95LatencyMs, queueBacklog } = metrics;

    this.recentLatencies.push(p95LatencyMs);
    if (this.recentLatencies.length > 10) this.recentLatencies.shift();

    this.recentErrors.push(errorRate);
    if (this.recentErrors.length > 10) this.recentErrors.shift();

    this.recentBacklogs.push(queueBacklog);
    if (this.recentBacklogs.length > 10) this.recentBacklogs.shift();

    let riskScore = 0; // 0 to 100

    // 1. Latency acceleration analysis
    if (this.recentLatencies.length >= 3) {
      const len = this.recentLatencies.length;
      const acceleration = this.recentLatencies[len - 1] - this.recentLatencies[len - 3];
      if (acceleration > 50) riskScore += 30; // Rapidly slowing down
      if (p95LatencyMs > 160) riskScore += 20; // Near threshold limit
    }

    // 2. Queue backlog accumulation rate
    if (this.recentBacklogs.length >= 3) {
      const len = this.recentBacklogs.length;
      const rate = this.recentBacklogs[len - 1] - this.recentBacklogs[len - 3];
      if (rate > 40) riskScore += 25; // Accumulating queue items fast
      if (queueBacklog > 120) riskScore += 15;
    }

    // 3. Error rate spikes
    if (errorRate > 0.03) {
      riskScore += 20;
    }

    let prediction = 'STABLE';
    if (riskScore >= 75) {
      prediction = 'SYSTEM_PRE_THROTTLE';
      this.executePreemptiveActions('SYSTEM_PRE_THROTTLE');
    } else if (riskScore >= 45) {
      prediction = 'INCIDENT_LIKELY';
      this.executePreemptiveActions('INCIDENT_LIKELY');
    }

    return {
      riskScore: Math.min(100, riskScore),
      prediction,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Executes preventive actions to avert P0 failures before they occur
   */
  async executePreemptiveActions(alertType) {
    console.log(`[PREDICTIVE PREVENTION] Triggered: ${alertType}`);

    if (alertType === 'SYSTEM_PRE_THROTTLE') {
      // Scale up preemptively
      if (this.autoscaler) {
        console.log('[PREDICTIVE] Preemptively requesting container scaling...');
        this.autoscaler.currentReplicas = Math.min(this.autoscaler.maxReplicas, this.autoscaler.currentReplicas + 1);
      }

      // Propose feature degradation (disable wearables telemetry to free up CPU/DB threads)
      if (this.flagEngine) {
        console.log('[PREDICTIVE] Preemptively disabling wearables telemetry to reduce load...');
        await this.flagEngine.updateFlag('wearables_telemetry', { enabled: false }, { username: 'PREDICTIVE_ENGINE' });
      }

      if (this.auditStream) {
        await this.auditStream.appendEvent('PREEMPTIVE_MITIGATION_APPLIED', {
          alertType,
          action: 'AUTOSCALE_UP_AND_TELEMETRY_DISABLE'
        }, { username: 'PREDICTIVE_ENGINE', role: 'Safety Engine' });
      }
    } 
    
    else if (alertType === 'INCIDENT_LIKELY') {
      if (this.autoscaler) {
        console.log('[PREDICTIVE] Outage likely. Informing scaling pool to prepare standby container...');
        this.autoscaler.currentReplicas = Math.min(this.autoscaler.maxReplicas, this.autoscaler.currentReplicas + 1);
      }
    }
  }
}

// Isolation test runner
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log('Testing predictive incident engine in isolation...');
  
  const mockScaler = {
    currentReplicas: 2,
    maxReplicas: 10
  };
  const mockFlags = {
    flags: new Map([['wearables_telemetry', { enabled: true }]]),
    async updateFlag(name, config) { this.flags.set(name, config); }
  };

  const engine = new PredictiveIncidentEngine({
    autoscaler: mockScaler,
    flagEngine: mockFlags
  });

  // Feed escalating telemetry variables
  engine.forecastOutageRisk({ errorRate: 0.01, p95LatencyMs: 80, queueBacklog: 10 });
  engine.forecastOutageRisk({ errorRate: 0.01, p95LatencyMs: 130, queueBacklog: 50 });
  const result = engine.forecastOutageRisk({ errorRate: 0.04, p95LatencyMs: 190, queueBacklog: 110 });

  assert.strictEqual(result.prediction, 'SYSTEM_PRE_THROTTLE');
  assert.strictEqual(mockScaler.currentReplicas, 3, 'Should scale up replicas preemptively');
  assert.strictEqual(mockFlags.flags.get('wearables_telemetry').enabled, false, 'Should disable wearables telemetry flag');

  console.log('Isolation validation successful.');
}
