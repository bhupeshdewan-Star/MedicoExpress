import assert from 'assert';
import { fileURLToPath } from 'url';

/**
 * GAMP 5 Category 4 Qualified Federated AI Safety Monitor
 */
export class FederatedSafetyMonitor {
  constructor(trialFederation) {
    this.trialFederation = trialFederation;
    this.alerts = [];
  }

  /**
   * Scans cross-trial safety metadata to detect unexpected adverse event correlations
   */
  evaluateCrossTrialSafety() {
    if (!this.trialFederation) return [];

    const signals = this.trialFederation.queryGlobalSafetySignals();
    const correlationAlerts = [];

    // Analyze counts - if a safety event occurs more than 3 times globally, raise a correlation check
    for (const [eventType, count] of Object.entries(signals)) {
      if (count >= 4) {
        const alert = {
          id: `SFY-${Date.now()}-${eventType.replace(/\s+/g, '-').toUpperCase()}`,
          title: `Systemic Safety Correlation: ${eventType}`,
          details: `Adverse event "${eventType}" was observed ${count} times across federated study cohorts. Correlation flag active.`,
          severity: count > 10 ? 'HIGH' : 'MEDIUM',
          timestamp: new Date().toISOString()
        };
        correlationAlerts.push(alert);
        this.alerts.push(alert);
        console.warn(`[SAFETY SIGNAL WARNING] Systemic correlation detected! Event: ${eventType} | Instances: ${count}`);
      }
    }

    return correlationAlerts;
  }
}

// Isolation test runner
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log('Testing federated safety monitor in isolation...');
  
  // Custom mock federation layer
  const mockFederation = {
    queryGlobalSafetySignals() {
      return {
        'Severe Headache': 4,
        'Mild Nausea': 36,
        'Dry Mouth': 1
      };
    }
  };

  const monitor = new FederatedSafetyMonitor(mockFederation);
  const alerts = monitor.evaluateCrossTrialSafety();

  assert.strictEqual(alerts.length, 2);
  assert.strictEqual(alerts[0].severity, 'MEDIUM'); // Severe Headache = 4
  assert.strictEqual(alerts[1].severity, 'HIGH');   // Mild Nausea = 36

  console.log('Isolation validation successful.');
}
