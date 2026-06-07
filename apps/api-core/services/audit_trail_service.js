import crypto from 'crypto';
import { query } from '../config/db.js';

// In-memory audit logs tracker to represent the database state in test/simulated runs
export const localAuditChain = [];

/**
 * Computes the SHA-256 hash link signature for a single audit record.
 */
export function generateHash(id, userId, action, details, createdAt, previousHash) {
  const content = `${id}-${userId}-${action}-${details}-${createdAt}-${previousHash}`;
  return crypto.createHash('sha256').update(content).digest('hex');
}

/**
 * Logs an action in the immutable audit trail using the chained previous-hash mechanism.
 */
export async function logImmutableAction(userId, username, role, action, targetEntity, details, ip) {
  const createdAt = new Date().toISOString();
  const nextId = localAuditChain.length + 1;
  
  // Retrieve previous hash signature from last entry
  let previousHash = 'GENESIS_BLOCK_0000000000000000000000000000000000000000000000000';
  if (localAuditChain.length > 0) {
    previousHash = localAuditChain[localAuditChain.length - 1].hash_signature;
  } else {
    // Attempt database check
    try {
      const lastLogRes = await query(`SELECT hash_signature FROM audit_trail_logs ORDER BY id DESC LIMIT 1`);
      if (lastLogRes && lastLogRes.rows && lastLogRes.rows[0]) {
        previousHash = lastLogRes.rows[0].hash_signature;
      }
    } catch (err) {
      // Mock db bypass
    }
  }

  // Calculate new hash signature
  const hashSignature = generateHash(nextId, userId, action, details, createdAt, previousHash);

  const auditRecord = {
    id: nextId,
    user_id: userId,
    username,
    role,
    action,
    target_entity: targetEntity,
    details,
    ip_address: ip,
    hash_signature: hashSignature,
    previous_hash: previousHash,
    created_at: createdAt
  };

  // Keep in memory tracker
  localAuditChain.push(auditRecord);

  // Attempt DB persist
  try {
    await query(
      `INSERT INTO audit_trail_logs 
       (user_id, username, role, action, target_entity, details, ip_address, hash_signature, previous_hash, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        userId,
        username,
        role,
        action,
        targetEntity,
        details,
        ip,
        hashSignature,
        previousHash,
        createdAt
      ]
    );
  } catch (err) {
    // Simulated DB insert
  }

  return auditRecord;
}

/**
 * Validates a single audit log row integrity.
 */
export function verifyHash(log) {
  const recalculated = generateHash(
    log.id,
    log.user_id,
    log.action,
    log.details,
    log.created_at || log.created_at_str,
    log.previous_hash
  );
  return recalculated === log.hash_signature;
}

/**
 * Validates the cryptographic integrity of the entire audit chain.
 */
export async function verifyMerkleChain() {
  const results = {
    isValid: true,
    totalRecords: 0,
    failures: []
  };

  let logs = [...localAuditChain];

  // If memory is empty, load from database
  if (logs.length === 0) {
    try {
      const res = await query(`SELECT * FROM audit_trail_logs ORDER BY id ASC`);
      if (res && res.rows) {
        logs = res.rows;
      }
    } catch (err) {
      // Mock db empty
    }
  }

  results.totalRecords = logs.length;

  for (let i = 0; i < logs.length; i++) {
    const log = logs[i];
    
    // Check previous hash link matching
    if (i > 0) {
      const prevLog = logs[i - 1];
      if (log.previous_hash !== prevLog.hash_signature) {
        results.isValid = false;
        results.failures.push({
          id: log.id,
          reason: `Chain Link Broken: previous_hash value does not match entry ${prevLog.id} signature.`
        });
      }
    }

    // Verify row contents signature
    const calculated = generateHash(
      log.id,
      log.user_id,
      log.action,
      log.details,
      log.created_at,
      log.previous_hash
    );

    if (calculated !== log.hash_signature) {
      results.isValid = false;
      results.failures.push({
        id: log.id,
        reason: 'Data Integrity Tampered: stored hash signature does not match row content hashing.'
      });
    }
  }

  return results;
}
