import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import assert from 'assert';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../');

/**
 * GAMP 5 Category 4 Qualified Cross-Phase Global Compliance Ledger
 */
export class GlobalComplianceLedger {
  constructor() {
    this.sealPath = path.resolve(rootDir, 'deployment/release/release.seal');
    this.checksumsPath = path.resolve(rootDir, 'deployment/release/checksums.json');
    this.snapshotPath = path.resolve(rootDir, 'global_compliance_snapshot.json');
  }

  /**
   * Evaluates SHA-256 signatures of prior validation artifacts and chains them together
   */
  async generateComplianceSnapshot(liveAuditLogsPath = null) {
    console.log('[Compliance Ledger] Compiling global compliance snapshot across validation checkpoints...');

    const verificationSteps = [];
    let combinedInput = '';

    // 1. Hash of Phase 15.4 Release Seal
    if (fs.existsSync(this.sealPath)) {
      const sealContent = fs.readFileSync(this.sealPath);
      const sealHash = crypto.createHash('sha256').update(sealContent).digest('hex');
      verificationSteps.push({ name: 'release.seal', path: this.sealPath, sha256: sealHash, status: 'VERIFIED' });
      combinedInput += sealHash;
    } else {
      console.warn('Release seal not found, creating simulated genesis hash link...');
      const genHash = crypto.createHash('sha256').update('GENESIS_RELEASE_SEAL').digest('hex');
      verificationSteps.push({ name: 'release.seal', path: this.sealPath, sha256: genHash, status: 'MOCKED' });
      combinedInput += genHash;
    }

    // 2. Hash of Phase 15.4 Checksums Registry
    if (fs.existsSync(this.checksumsPath)) {
      const checksumsContent = fs.readFileSync(this.checksumsPath);
      const checksumsHash = crypto.createHash('sha256').update(checksumsContent).digest('hex');
      verificationSteps.push({ name: 'checksums.json', path: this.checksumsPath, sha256: checksumsHash, status: 'VERIFIED' });
      combinedInput += checksumsHash;
    } else {
      const genHash = crypto.createHash('sha256').update('GENESIS_CHECKSUMS').digest('hex');
      verificationSteps.push({ name: 'checksums.json', path: this.checksumsPath, sha256: genHash, status: 'MOCKED' });
      combinedInput += genHash;
    }

    // 3. Hash of Phase 15.5 Live Audit Stream (if provided)
    if (liveAuditLogsPath && fs.existsSync(liveAuditLogsPath)) {
      const logsContent = fs.readFileSync(liveAuditLogsPath);
      const logsHash = crypto.createHash('sha256').update(logsContent).digest('hex');
      verificationSteps.push({ name: 'live_audit_stream.jsonl', path: liveAuditLogsPath, sha256: logsHash, status: 'VERIFIED' });
      combinedInput += logsHash;
    } else {
      const genHash = crypto.createHash('sha256').update('GENESIS_AUDIT_STREAM').digest('hex');
      verificationSteps.push({ name: 'live_audit_stream.jsonl', path: liveAuditLogsPath || 'N/A', sha256: genHash, status: 'MOCKED' });
      combinedInput += genHash;
    }

    // Compute the final global signature stitching all verification links together
    const globalSignature = crypto.createHash('sha256').update(combinedInput).digest('hex');

    const snapshot = {
      snapshotId: `COMP-SNAP-${Date.now()}`,
      timestamp: new Date().toISOString(),
      globalSignature,
      verificationSteps
    };

    fs.writeFileSync(this.snapshotPath, JSON.stringify(snapshot, null, 2));
    console.log(`[Compliance Ledger] Global Compliance Snapshot generated. Signature: ${globalSignature.substring(0, 12)}...`);
    return snapshot;
  }
}

// Isolation test runner
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log('Testing compliance ledger in isolation...');
  const ledger = new GlobalComplianceLedger();
  
  const snap = await ledger.generateComplianceSnapshot();
  assert.ok(snap.globalSignature);
  assert.strictEqual(snap.verificationSteps.length, 3);
  
  if (fs.existsSync(ledger.snapshotPath)) fs.unlinkSync(ledger.snapshotPath);
  console.log('Isolation validation successful.');
}
