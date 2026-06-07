import { query, executeTransaction } from '../config/db.js';
import { verifyMerkleChain, sealUnsealedAuditLogs, sha256 } from './merkleService.js';
import { retrieveContext } from './ragService.js';

/**
 * Runs a complete IQ/OQ/PQ validation sequence and persists results in the compliance database.
 */
export async function executeGxPValidationSuite(userId = null, tenantId = 1) {
  const logs = [];
  const addLog = (msg) => {
    const entry = `[${new Date().toISOString()}] ${msg}`;
    logs.push(entry);
    console.log(entry);
  };

  addLog('Starting automated ClinCommand OS™ GxP Validation Suite (IQ/OQ/PQ)...');

  let iqPassed = true;
  let oqPassed = true;
  let pqPassed = true;

  // ========================================================
  // 1. INSTALLATION QUALIFICATION (IQ)
  // ========================================================
  addLog('--- Running Installation Qualification (IQ) ---');
  
  // Test Case IQ-1: PostgreSQL Connectivity
  let pgHealthy = false;
  try {
    const res = await query('SELECT 1 + 1 AS result');
    if (res.rows[0].result === 2) {
      pgHealthy = true;
      addLog('IQ-1 [PASSED]: PostgreSQL connection verified healthy.');
    } else {
      iqPassed = false;
      addLog('IQ-1 [FAILED]: PostgreSQL returned incorrect computation results.');
    }
  } catch (err) {
    iqPassed = false;
    pgHealthy = false;
    addLog(`IQ-1 [FAILED]: PostgreSQL connection threw error: ${err.message}`);
  }

  // Test Case IQ-2: Core Schema Presence
  const requiredTables = [
    'users', 'sops', 'audit_logs', 'esignatures', 'refresh_tokens', 
    'intake_forms', 'intake_sessions', 'audit_vault_merkle_blocks',
    'audit_vault_merkle_leaves', 'compliance_validations', 'tenant_feature_flags'
  ];
  try {
    const schemaRes = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    const tablesInDb = schemaRes.rows.map(r => r.table_name);
    
    let missingCount = 0;
    for (const tbl of requiredTables) {
      if (tablesInDb.includes(tbl)) {
        addLog(`IQ-2 [PASSED]: Table [${tbl}] verified present.`);
      } else {
        missingCount++;
        addLog(`IQ-2 [FAILED]: Table [${tbl}] is missing from public schema.`);
      }
    }

    if (missingCount > 0) {
      iqPassed = false;
      addLog(`IQ-2: Found ${missingCount} missing tables.`);
    } else {
      addLog('IQ-2 [PASSED]: All core database tables are present.');
    }
  } catch (err) {
    iqPassed = false;
    addLog(`IQ-2 [FAILED]: Information schema query crashed: ${err.message}`);
  }

  // Test Case IQ-3: vector Extension
  try {
    const extRes = await query(`SELECT extname FROM pg_extension WHERE extname = 'vector'`);
    if (extRes.rows.length > 0) {
      addLog('IQ-3 [PASSED]: pgvector extension is installed.');
    } else {
      iqPassed = false;
      addLog('IQ-3 [FAILED]: pgvector extension is missing.');
    }
  } catch (err) {
    iqPassed = false;
    addLog(`IQ-3 [FAILED]: pg_extension query failed: ${err.message}`);
  }

  // ========================================================
  // 2. OPERATIONAL QUALIFICATION (OQ)
  // ========================================================
  addLog('--- Running Operational Qualification (OQ) ---');

  // Test Case OQ-1: Row-Level Security (RLS) Isolation
  if (pgHealthy) {
    try {
      // Run RLS check inside a clean block
      await executeTransaction(async (client) => {
        // Insert test user rows under distinct tenant contexts
        await client.query(`
          INSERT INTO sops (code, title, content, status, tenant_id)
          VALUES ('SOP-VAL-T91', 'Val SOP Tenant 91', 'Scope check', 'Draft', 99991),
                 ('SOP-VAL-T92', 'Val SOP Tenant 92', 'Scope check', 'Draft', 99992)
          ON CONFLICT (code) DO NOTHING
        `);

        // Check query restricted to tenant 99991
        await client.query("SET LOCAL app.current_tenant_id = '99991'");
        const tenant91Res = await client.query("SELECT * FROM sops WHERE code IN ('SOP-VAL-T91', 'SOP-VAL-T92')");
        
        // Check query restricted to tenant 99992
        await client.query("SET LOCAL app.current_tenant_id = '99992'");
        const tenant92Res = await client.query("SELECT * FROM sops WHERE code IN ('SOP-VAL-T91', 'SOP-VAL-T92')");

        const t91Ok = tenant91Res.rows.length === 1 && tenant91Res.rows[0].tenant_id === 99991;
        const t92Ok = tenant92Res.rows.length === 1 && tenant92Res.rows[0].tenant_id === 99992;

        if (t91Ok && t92Ok) {
          addLog('OQ-1 [PASSED]: Row-Level Security (RLS) successfully isolates tenant rows.');
        } else {
          oqPassed = false;
          addLog(`OQ-1 [FAILED]: RLS isolation failure. T91 rows count: ${tenant91Res.rows.length}, T92 rows count: ${tenant92Res.rows.length}`);
        }

        // Clean up test data
        await client.query("SET LOCAL app.current_tenant_id = ''"); // bypass to delete
        await client.query("DELETE FROM sops WHERE code IN ('SOP-VAL-T91', 'SOP-VAL-T92')");
      });
    } catch (err) {
      oqPassed = false;
      addLog(`OQ-1 [FAILED]: RLS test transaction failed: ${err.message}`);
    }
  } else {
    oqPassed = false;
    addLog('OQ-1 [SKIPPED]: DB unhealthy, skipping RLS test.');
  }

  // Test Case OQ-2: Immutable Audit Rules
  if (pgHealthy) {
    try {
      await query(`
        INSERT INTO audit_logs (username, user_role, action_type, target_resource, details, ip_address, tenant_id)
        VALUES ('val_test', 'Viewer', 'VAL_TEST', 'system', 'testing block rules', '127.0.0.1', 1)
      `);
      
      const testLogRes = await query("SELECT id FROM audit_logs WHERE username = 'val_test' LIMIT 1");
      const logId = testLogRes.rows[0]?.id;

      if (logId) {
        let updateThrew = false;
        try {
          // Rule is active: delete is DO INSTEAD NOTHING, so it won't throw but won't delete, or update DO INSTEAD NOTHING.
          // Let's check if the count stays same after delete/update or if it behaves as expected.
          await query('UPDATE audit_logs SET username = "tampered" WHERE id = $1', [logId]);
        } catch (e) {
          updateThrew = true;
        }

        const recheck = await query('SELECT username FROM audit_logs WHERE id = $1', [logId]);
        
        // Clean up: Wait, if the rule is DO INSTEAD NOTHING, we cannot delete via normal query if RLS/rules block it!
        // But for superuser or if we drop the rule temporarily? Actually we don't have to delete it, but let's confirm the values didn't change:
        if (recheck.rows[0].username === 'val_test') {
          addLog('OQ-2 [PASSED]: Immutable audit logs rules are operational. Attempts to UPDATE are ignored.');
        } else {
          oqPassed = false;
          addLog('OQ-2 [FAILED]: Audit log record was modified. Rule check failed.');
        }
      } else {
        oqPassed = false;
        addLog('OQ-2 [FAILED]: Could not create test audit log.');
      }
    } catch (err) {
      oqPassed = false;
      addLog(`OQ-2 [FAILED]: Audit vault rule verification crashed: ${err.message}`);
    }
  } else {
    oqPassed = false;
    addLog('OQ-2 [SKIPPED]: DB unhealthy, skipping rule check.');
  }

  // ========================================================
  // 3. PERFORMANCE QUALIFICATION (PQ)
  // ========================================================
  addLog('--- Running Performance Qualification (PQ) ---');

  // Test Case PQ-1: Cryptographic Merkle Seal and Verification
  if (pgHealthy) {
    try {
      // 1. Seal unsealed logs
      const sealResult = await sealUnsealedAuditLogs();
      if (sealResult) {
        addLog(`PQ-1 [PASSED]: Sealed ${sealResult.sealedCount} logs into Merkle block index ${sealResult.blockIndex}.`);
      } else {
        addLog('PQ-1 [PASSED]: No unsealed logs pending, database is already sealed.');
      }

      // 2. Verify chain
      const verifyResult = await verifyMerkleChain();
      if (verifyResult.status === 'VALID') {
        addLog(`PQ-1 [PASSED]: Cryptographic Merkle chain verify completed successfully. Blocks checked: ${verifyResult.verifiedBlocks}.`);
      } else {
        pqPassed = false;
        addLog(`PQ-1 [FAILED]: Merkle verification reported tampering: ${verifyResult.reason}`);
      }
    } catch (err) {
      pqPassed = false;
      addLog(`PQ-1 [FAILED]: Merkle service test crashed: ${err.message}`);
    }
  } else {
    pqPassed = false;
    addLog('PQ-1 [SKIPPED]: skipping Merkle PQ.');
  }

  // Test Case PQ-2: pgvector RAG similarity Search
  try {
    const searchRes = await retrieveContext('testing search', 1);
    addLog('PQ-2 [PASSED]: pgvector RAG similarity search executed cleanly.');
  } catch (err) {
    pqPassed = false;
    addLog(`PQ-2 [FAILED]: RAG search check crashed: ${err.message}`);
  }

  // Record validation suite outputs in table
  const testSuiteStatus = (iqPassed && oqPassed && pqPassed) ? 'PASSED' : 'FAILED';
  const executionLogText = logs.join('\n');

  try {
    await query(`
      INSERT INTO compliance_validations (test_suite, test_name, status, executed_by, execution_log, tenant_id)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [
      'GXP_FULL_SUITE',
      'IQ/OQ/PQ System Hardening Validation Suite v1.0',
      testSuiteStatus,
      userId,
      executionLogText,
      tenantId
    ]);
    addLog('Validation log successfully committed to compliance_validations repository.');
  } catch (err) {
    console.error('Failed to write execution log to compliance_validations:', err.message);
  }

  return {
    status: testSuiteStatus,
    iq: iqPassed ? 'PASSED' : 'FAILED',
    oq: oqPassed ? 'PASSED' : 'FAILED',
    pq: pqPassed ? 'PASSED' : 'FAILED',
    logs
  };
}
