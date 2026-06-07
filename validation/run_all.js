import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('========================================================');
// CLINCOMMAND OS™ ENTERPRISE GAMP 5 VALIDATION SUITE RUNNER
console.log('========================================================\n');

try {
  console.log('Running Installation Qualification (IQ)...');
  execSync('node validation/IQ/iq_verification.js', { stdio: 'inherit' });

  console.log('\nRunning Operational Qualification (OQ)...');
  execSync('node validation/OQ/oq_verification.js', { stdio: 'inherit' });

  console.log('\nRunning Performance Qualification (PQ)...');
  execSync('node validation/PQ/pq_verification.js', { stdio: 'inherit' });

  console.log('\n========================================================');
  console.log('GAMP 5 COMPLIANCE STATUS: VALIDATED (PASS)');
  console.log('========================================================');
} catch (err) {
  console.error('\n========================================================');
  console.error('GAMP 5 COMPLIANCE STATUS: VALIDATION FAILED (FAIL)');
  console.error('Reason:', err.message);
  console.error('========================================================');
  process.exit(1);
}
