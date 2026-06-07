// ClinCommand OS™ Validation Test Runner SDK
export class ValidationRunner {
  constructor(name) {
    this.name = name;
    this.passed = 0;
    this.failed = 0;
    console.log(`\n--- Starting GAMP Validation: ${name} ---`);
  }

  async runTest(caseId, description, testFn) {
    try {
      await testFn();
      console.log(`[PASS] ${caseId}: ${description}`);
      this.passed++;
    } catch (err) {
      console.error(`[FAIL] ${caseId}: ${description}`);
      console.error(`       Error: ${err.message}`);
      this.failed++;
    }
  }

  report() {
    console.log(`\nValidation complete for ${this.name}: ${this.passed} Passed | ${this.failed} Failed`);
    return this.failed === 0;
  }
}
