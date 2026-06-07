import assert from 'assert';
import { fileURLToPath } from 'url';

/**
 * GAMP 5 Category 4 Qualified Self-Healing Cloud Orchestrator
 */
export class SelfHealingOrchestrator {
  constructor(options = {}) {
    this.mode = 'ADVISORY'; // ADVISORY, SUPERVISED_AUTO_ACTION
    this.auditStream = options.auditStream || null;
    
    this.healedIncidents = [];
    this.restartingServices = new Set();
  }

  setMode(newMode) {
    if (newMode !== 'ADVISORY' && newMode !== 'SUPERVISED_AUTO_ACTION') {
      throw new Error(`Invalid self-healing mode: ${newMode}`);
    }
    this.mode = newMode;
    console.log(`[SELF-HEALING] Control Mode updated to: ${this.mode}`);
  }

  /**
   * Processes active system incidents and coordinates automated service repairs
   */
  async processIncidentForHealing(incident, regionOrchestrator = null) {
    if (!incident) return { actionTaken: 'NONE', status: 'NO_ACTIVE_INCIDENT' };

    console.log(`[SELF-HEALING] Analyzing incident ${incident.id} (${incident.priority}) for recovery...`);
    let actionTaken = 'NONE';
    let details = '';

    if (incident.priority === 'P0') {
      if (this.mode === 'SUPERVISED_AUTO_ACTION') {
        actionTaken = 'REGIONAL_FAILOVER_AND_CONTAINER_REDEPLOYMENT';
        
        // 1. Shift traffic away if region orchestrator is present
        if (regionOrchestrator) {
          const newRoute = regionOrchestrator.getRouteForRequest(2); // NovaBio
          details = `Disaster route failover to ${newRoute}. `;
        }
        
        // 2. Mock redeployment trigger
        this.restartingServices.add('api-core-gateway');
        details += 'Triggered container redeployment on Kubernetes for api-core-gateway.';
      } else {
        actionTaken = 'ADVISORY_ALERT_RAISED';
        details = 'P0 Outage Detected. Recommendation: Trigger failover and restart API containers.';
      }
    } 
    
    else if (incident.priority === 'P1') {
      if (this.mode === 'SUPERVISED_AUTO_ACTION') {
        actionTaken = 'SERVICE_REGENERATION_RESTART';
        this.restartingServices.add('wearables-ingest-service');
        details = 'High queue backlog. Automatically triggered rolling restart of wearables-ingest-service container.';
      } else {
        actionTaken = 'ADVISORY_ALERT_RAISED';
        details = 'P1 Degradation warning. Suggest container restart of wearables-ingest-service.';
      }
    }

    const healRecord = {
      incidentId: incident.id,
      priority: incident.priority,
      actionTaken,
      details,
      timestamp: new Date().toISOString(),
      mode: this.mode
    };

    this.healedIncidents.push(healRecord);

    if (this.mode === 'SUPERVISED_AUTO_ACTION' && this.auditStream) {
      await this.auditStream.appendEvent('SELF_HEALING_ACTION_EXECUTED', healRecord, {
        username: 'SELF_HEALING_ORCHESTRATOR',
        role: 'Orchestration Manager'
      });
    }

    console.log(`[SELF-HEALING] Action: ${actionTaken} | Details: ${details}`);
    return healRecord;
  }
}

// Isolation test runner
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log('Testing self-healing orchestrator in isolation...');
  const orchestrator = new SelfHealingOrchestrator();

  // Test Advisory Mode (P1)
  let result = await orchestrator.processIncidentForHealing({ id: 'INC-01', priority: 'P1' });
  assert.strictEqual(result.actionTaken, 'ADVISORY_ALERT_RAISED');
  assert.ok(result.details.includes('Suggest container restart'));

  // Test Supervised Auto Action Mode (P1)
  orchestrator.setMode('SUPERVISED_AUTO_ACTION');
  result = await orchestrator.processIncidentForHealing({ id: 'INC-02', priority: 'P1' });
  assert.strictEqual(result.actionTaken, 'SERVICE_REGENERATION_RESTART');
  assert.ok(orchestrator.restartingServices.has('wearables-ingest-service'));

  console.log('Isolation validation successful.');
}
