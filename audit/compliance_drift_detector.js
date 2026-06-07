import assert from 'assert';
import { fileURLToPath } from 'url';

/**
 * GAMP 5 Category 4 Qualified Adaptive Compliance Drift Detector
 */
export class ComplianceDriftDetector {
  constructor(options = {}) {
    this.auditStream = options.auditStream || null;
    this.alerts = [];

    // Validated default feature flags benchmark states
    this.validatedFlagsBenchmark = {
      wearables_telemetry: { enabled: true, killSwitch: false },
      rsdv_ocr: { enabled: true, killSwitch: false },
      rbm_ai: { enabled: true, killSwitch: false },
      dct_virtual_visits: { enabled: true, killSwitch: false },
      epro_sync: { enabled: true, killSwitch: false }
    };
  }

  /**
   * Evaluates current system parameters against GxP validated baselines
   */
  async evaluateComplianceDrift(currentFlags, sealCheckPassed) {
    const driftEvents = [];

    // 1. Critical Build Seal check
    if (!sealCheckPassed) {
      driftEvents.push({
        id: `DFT-${Date.now()}-CRIT`,
        type: 'COMPLIANCE_DRIFT_CRITICAL',
        component: 'release.seal',
        details: 'Sealed build integrity verification failed or release.seal is missing!'
      });
    }

    // 2. Feature flag mutations drift check
    if (currentFlags) {
      for (const [flagName, benchmark] of Object.entries(this.validatedFlagsBenchmark)) {
        const active = currentFlags[flagName];
        if (active) {
          if (active.enabled !== benchmark.enabled || active.killSwitch !== benchmark.killSwitch) {
            driftEvents.push({
              id: `DFT-${Date.now()}-WARN-${flagName}`,
              type: 'COMPLIANCE_DRIFT_WARNING',
              component: `feature-flags/${flagName}`,
              details: `Feature flag mutated from baseline. Current: enabled=${active.enabled}, killSwitch=${active.killSwitch}. Expected: enabled=${benchmark.enabled}, killSwitch=${benchmark.killSwitch}`
            });
          }
        }
      }
    }

    // Log drift events
    for (const drift of driftEvents) {
      this.alerts.push(drift);
      console.warn(`[DRIFT DETECTED] Severity: ${drift.type} | Component: ${drift.component} | Details: ${drift.details}`);

      if (this.auditStream) {
        await this.auditStream.appendEvent('COMPLIANCE_DRIFT_DETECTED', drift, {
          username: 'DRIFT_DETECTOR',
          role: 'Compliance monitor'
        });
      }
    }

    return driftEvents;
  }

  getAlerts() {
    return [...this.alerts];
  }
}

// Isolation test runner
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log('Testing compliance drift detector in isolation...');
  const detector = new ComplianceDriftDetector();

  // Test clean run - no drift
  let drift = await detector.evaluateComplianceDrift(detector.validatedFlagsBenchmark, true);
  assert.strictEqual(drift.length, 0);

  // Test seal failure (CRITICAL)
  drift = await detector.evaluateComplianceDrift(detector.validatedFlagsBenchmark, false);
  assert.strictEqual(drift.length, 1);
  assert.strictEqual(drift[0].type, 'COMPLIANCE_DRIFT_CRITICAL');

  // Test flag drift (WARNING)
  const driftedFlags = {
    ...detector.validatedFlagsBenchmark,
    wearables_telemetry: { enabled: false, killSwitch: true }
  };
  drift = await detector.evaluateComplianceDrift(driftedFlags, true);
  assert.strictEqual(drift.length, 1);
  assert.strictEqual(drift[0].type, 'COMPLIANCE_DRIFT_WARNING');

  console.log('Isolation validation successful.');
}
