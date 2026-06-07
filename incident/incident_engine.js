import assert from 'assert';
import { fileURLToPath } from 'url';

/**
 * GAMP 5 Category 4 Compliant Incident Detection & Auto-Mitigation Engine
 */
export class IncidentEngine {
  constructor(options = {}) {
    this.stateManager = options.stateManager || null;
    this.activationController = options.activationController || null;
    this.flagEngine = options.flagEngine || null;
    this.incidents = [];
  }

  /**
   * Evaluates live metrics snapshots to detect and classify operational anomalies
   */
  async evaluateMetrics(metrics) {
    const { errorRate, p95LatencyMs, queueBacklog, rbmFailureRate, dbSlowQueriesCount } = metrics;
    let incidentRaised = null;

    // Detect and classify incidents into priority tiers
    if (errorRate > 0.10 || p95LatencyMs > 1000 || dbSlowQueriesCount > 10) {
      incidentRaised = {
        id: `INC-${Date.now()}-P0`,
        priority: 'P0',
        title: 'Critical System Outage or Latency Breach',
        details: `Error Rate: ${(errorRate * 100).toFixed(1)}%, P95 Latency: ${p95LatencyMs}ms, DB Slow Queries: ${dbSlowQueriesCount}`,
        timestamp: new Date().toISOString(),
        status: 'OPEN'
      };
      await this.executeAutoAction('P0', incidentRaised);
    } else if (errorRate > 0.05 || p95LatencyMs > 500 || queueBacklog > 150 || rbmFailureRate > 5) {
      incidentRaised = {
        id: `INC-${Date.now()}-P1`,
        priority: 'P1',
        title: 'System Degradation & Queue Backlog Saturation',
        details: `Error Rate: ${(errorRate * 100).toFixed(1)}%, Latency: ${p95LatencyMs}ms, Queue Backlog: ${queueBacklog}`,
        timestamp: new Date().toISOString(),
        status: 'OPEN'
      };
      await this.executeAutoAction('P1', incidentRaised);
    } else if (errorRate > 0.02 || p95LatencyMs > 300) {
      incidentRaised = {
        id: `INC-${Date.now()}-P2`,
        priority: 'P2',
        title: 'Minor SLA Drift Warnings',
        details: `Error Rate: ${(errorRate * 100).toFixed(1)}%, Latency: ${p95LatencyMs}ms`,
        timestamp: new Date().toISOString(),
        status: 'OPEN'
      };
      await this.executeAutoAction('P2', incidentRaised);
    }

    if (incidentRaised) {
      this.incidents.push(incidentRaised);
    }

    return incidentRaised;
  }

  /**
   * Executes automated closed-loop mitigation actions
   */
  async executeAutoAction(priority, incident) {
    console.log(`[INCIDENT DETECTED] Priority: ${priority} | ${incident.title}`);
    
    if (priority === 'P0') {
      // 1. Set runtime state to rolled back
      if (this.stateManager) {
        this.stateManager.transitionTo('SYSTEM_EMERGENCY_ROLLED_BACK');
      }

      // 2. Shut off all traffic rollout for NovaBio (rollout to 0%)
      if (this.activationController) {
        this.activationController.setRollout(0, { username: 'INCIDENT_ENGINE' });
      }

      // 3. Propagate global kill switch on feature flags
      if (this.flagEngine) {
        for (const flag of this.flagEngine.flags.keys()) {
          await this.flagEngine.updateFlag(flag, { enabled: false, killSwitch: true }, { username: 'INCIDENT_ENGINE' });
        }
      }
      incident.actionExecuted = 'EMERGENCY_ROLLBACK_AND_GLOBAL_KILL_SWITCH';
    } 
    
    else if (priority === 'P1') {
      // 1. Transition runtime state to throttled
      if (this.stateManager) {
        this.stateManager.transitionTo('SYSTEM_THROTTLED');
      }

      // 2. Throttle traffic rollout to safety limit (5%)
      if (this.activationController) {
        this.activationController.setRollout(5, { username: 'INCIDENT_ENGINE' });
      }

      // 3. Disable resource-intensive features (wearables telemetry) via flag override
      if (this.flagEngine) {
        await this.flagEngine.updateFlag('wearables_telemetry', { enabled: false }, { username: 'INCIDENT_ENGINE' });
      }
      incident.actionExecuted = 'TRAFFIC_THROTTLED_AND_TELEMETRY_DISABLED';
    } 
    
    else if (priority === 'P2') {
      incident.actionExecuted = 'METRICS_LOGGED_AND_ALERTS_DISPATCHED';
    }
  }

  getIncidents() {
    return [...this.incidents];
  }
}

// Isolation tests
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log('Testing incident engine in isolation...');
  const engine = new IncidentEngine();
  
  // Test P2
  let incident = await engine.evaluateMetrics({
    errorRate: 0.03,
    p95LatencyMs: 320,
    queueBacklog: 20,
    rbmFailureRate: 0,
    dbSlowQueriesCount: 0
  });
  assert.strictEqual(incident.priority, 'P2');

  // Test P1
  incident = await engine.evaluateMetrics({
    errorRate: 0.06,
    p95LatencyMs: 600,
    queueBacklog: 180,
    rbmFailureRate: 2,
    dbSlowQueriesCount: 0
  });
  assert.strictEqual(incident.priority, 'P1');

  // Test P0
  incident = await engine.evaluateMetrics({
    errorRate: 0.12,
    p95LatencyMs: 1200,
    queueBacklog: 50,
    rbmFailureRate: 0,
    dbSlowQueriesCount: 12
  });
  assert.strictEqual(incident.priority, 'P0');
  
  console.log('Incident Engine isolation verification successful.');
}
