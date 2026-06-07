import assert from 'assert';
import { fileURLToPath } from 'url';

/**
 * GAMP 5 Category 4 Qualified Multi-Trial Federation Layer
 */
export class TrialFederationLayer {
  constructor() {
    this.trials = {
      'study-oncology': {
        name: 'Phase III Oncology Trial',
        subjectCount: 200,
        deviations: [
          { type: 'WINDOW_BREACH', count: 12 },
          { type: 'PROCEDURE_SKIPPED', count: 4 }
        ],
        safetyEvents: [
          { type: 'Mild Nausea', count: 22 },
          { type: 'Severe Headache', count: 3 }
        ]
      },
      'study-diabetes': {
        name: 'Phase II Diabetes Trial',
        subjectCount: 180,
        deviations: [
          { type: 'WINDOW_BREACH', count: 18 },
          { type: 'MISSING_SIGNATURE', count: 2 }
        ],
        safetyEvents: [
          { type: 'Mild Nausea', count: 14 },
          { type: 'Hypoglycemia', count: 18 }
        ]
      },
      'study-rheumatology': {
        name: 'Phase II Rheumatology Study',
        subjectCount: 120,
        deviations: [
          { type: 'WINDOW_BREACH', count: 5 }
        ],
        safetyEvents: [
          { type: 'Mild Rash', count: 8 },
          { type: 'Severe Headache', count: 1 }
        ]
      }
    };
  }

  /**
   * Aggregates study deviation profiles on an anonymized metadata basis
   */
  aggregateDeviations() {
    const summary = {};
    for (const [id, study] of Object.entries(this.trials)) {
      const totalDevs = study.deviations.reduce((sum, item) => sum + item.count, 0);
      summary[id] = {
        name: study.name,
        totalDeviations: totalDevs,
        deviationRatePerSubject: Number((totalDevs / study.subjectCount).toFixed(3))
      };
    }
    return summary;
  }

  /**
   * Scans safety signals globally without leaking raw subject details
   */
  queryGlobalSafetySignals() {
    const globalSignals = {};
    for (const study of Object.values(this.trials)) {
      for (const event of study.safetyEvents) {
        if (!globalSignals[event.type]) {
          globalSignals[event.type] = 0;
        }
        globalSignals[event.type] += event.count;
      }
    }
    return globalSignals;
  }

  /**
   * Enforces privacy checks on clinical subject exports
   */
  exportSubjectClinicalDetails(studyId, subjectId) {
    // Strictly block cross-study subject data pulls
    throw new Error(`Privacy Breach: Subject-level clinical variables cannot be exported across study partitions (Attempted: ${studyId}/subject:${subjectId})`);
  }
}

// Isolation test runner
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log('Testing trial federation layer in isolation...');
  const federation = new TrialFederationLayer();

  // Validate anonymized deviation rates
  const devs = federation.aggregateDeviations();
  assert.strictEqual(devs['study-oncology'].totalDeviations, 16);
  assert.strictEqual(devs['study-oncology'].deviationRatePerSubject, 0.08);

  // Validate global safety signal accumulation
  const signals = federation.queryGlobalSafetySignals();
  assert.strictEqual(signals['Severe Headache'], 4);
  assert.strictEqual(signals['Mild Nausea'], 36);

  // Assert privacy-preserving guard blocks raw subject details pull
  assert.throws(() => {
    federation.exportSubjectClinicalDetails('study-oncology', 'SUB-045');
  }, /Privacy Breach/);

  console.log('Isolation validation successful.');
}
