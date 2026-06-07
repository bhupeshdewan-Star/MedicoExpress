import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import assert from 'assert';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultLogPath = path.resolve(__dirname, '../logs/live_audit_chain.jsonl');

/**
 * GAMP 5 Category 4 / Part 11 Compliant Chained Cryptographic Audit Stream
 */
export class LiveAuditStream {
  constructor(logFilePath = defaultLogPath) {
    this.logFilePath = logFilePath;
    this.lastHash = '0000000000000000000000000000000000000000000000000000000000000000';
    this.initializeLogFile();
  }

  /**
   * Sets up log directories and reads the last hash in the chain
   */
  initializeLogFile() {
    try {
      fs.mkdirSync(path.dirname(this.logFilePath), { recursive: true });
      if (fs.existsSync(this.logFilePath)) {
        const fileContent = fs.readFileSync(this.logFilePath, 'utf8').trim();
        if (fileContent) {
          const lines = fileContent.split('\n');
          const lastLine = lines[lines.length - 1];
          if (lastLine) {
            const entry = JSON.parse(lastLine);
            if (entry.hash) {
              this.lastHash = entry.hash;
            }
          }
        }
      }
    } catch (err) {
      console.warn('Could not read existing audit stream. Initializing chain at genesis.', err.message);
    }
  }

  /**
   * Appends a new event block to the SHA-256 integrity chain
   */
  async appendEvent(eventType, details, userCtx = {}) {
    const entry = {
      timestamp: new Date().toISOString(),
      eventType,
      details,
      user: {
        userId: userCtx.id || 0,
        username: userCtx.username || 'SYSTEM',
        role: userCtx.role || 'System Process'
      },
      previousHash: this.lastHash,
      hash: ''
    };

    // Calculate current block hash
    const inputStr = entry.timestamp + 
                     entry.eventType + 
                     JSON.stringify(entry.details) + 
                     JSON.stringify(entry.user) + 
                     entry.previousHash;
                     
    entry.hash = crypto.createHash('sha256').update(inputStr).digest('hex');

    // Append to file
    fs.appendFileSync(this.logFilePath, JSON.stringify(entry) + '\n');
    this.lastHash = entry.hash;
    
    console.log(`[AUDIT LEDGER] Logged & Chained: ${eventType} | Hash: ${entry.hash.substring(0, 12)}...`);
    return entry;
  }

  /**
   * Cryptographically verifies the integrity of the whole chained audit trail
   */
  verifyChain() {
    if (!fs.existsSync(this.logFilePath)) {
      return { verified: true, count: 0 };
    }

    try {
      const fileContent = fs.readFileSync(this.logFilePath, 'utf8').trim();
      if (!fileContent) {
        return { verified: true, count: 0 };
      }

      const lines = fileContent.split('\n');
      let expectedPrevHash = '0000000000000000000000000000000000000000000000000000000000000000';

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (!line) continue;

        const entry = JSON.parse(line);
        
        // 1. Verify previous hash link matches
        if (entry.previousHash !== expectedPrevHash) {
          throw new Error(`Integrity Failure: Link broken at line ${i + 1}. Expected previous hash ${expectedPrevHash}, found ${entry.previousHash}`);
        }

        // 2. Re-compute hash and verify matching output
        const inputStr = entry.timestamp + 
                         entry.eventType + 
                         JSON.stringify(entry.details) + 
                         JSON.stringify(entry.user) + 
                         entry.previousHash;
                         
        const computedHash = crypto.createHash('sha256').update(inputStr).digest('hex');
        if (computedHash !== entry.hash) {
          throw new Error(`Integrity Failure: Data alteration detected at line ${i + 1}. Expected hash ${computedHash}, found ${entry.hash}`);
        }

        expectedPrevHash = entry.hash;
      }

      return { verified: true, count: lines.length };
    } catch (err) {
      console.error('[AUDIT BREACH] Audit Ledger Chain Validation Failure!', err.message);
      return { verified: false, error: err.message };
    }
  }
}

// Isolation test runner
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log('Testing live audit stream in isolation...');
  const testLog = path.resolve(__dirname, '../logs/test_audit_chain.jsonl');
  
  // Clean old test files
  if (fs.existsSync(testLog)) fs.unlinkSync(testLog);

  const auditor = new LiveAuditStream(testLog);
  
  await auditor.appendEvent('SYSTEM_STARTUP', { version: '15.5.0' }, { username: 'test_admin', role: 'Administrator' });
  await auditor.appendEvent('FEATURE_FLAG_TOGGLE', { flag: 'rbm_ai', value: false }, { username: 'test_admin', role: 'Administrator' });

  const result = auditor.verifyChain();
  console.log(`Verify Chain result: verified=${result.verified}, count=${result.count}`);
  assert.strictEqual(result.verified, true);
  assert.strictEqual(result.count, 2);

  // Attempt tampering simulation
  const content = fs.readFileSync(testLog, 'utf8');
  const tamperedContent = content.replace('SYSTEM_STARTUP', 'SYSTEM_COMPROMISED');
  fs.writeFileSync(testLog, tamperedContent);

  const resultTampered = auditor.verifyChain();
  console.log(`Verify Tampered Chain result: verified=${resultTampered.verified}, error=${resultTampered.error}`);
  assert.strictEqual(resultTampered.verified, false);

  // Cleanup
  if (fs.existsSync(testLog)) fs.unlinkSync(testLog);
  console.log('Isolation validation successful.');
}
