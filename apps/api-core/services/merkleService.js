import crypto from 'crypto';
import { query, executeTransaction } from '../config/db.js';

/**
 * Computes the SHA-256 hash of a string input.
 */
export function sha256(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Builds a Merkle Tree from leaf hashes and returns the root and levels.
 */
export function buildMerkleTree(leaves) {
  if (leaves.length === 0) {
    return { root: sha256(''), levels: [[]] };
  }

  let level = [...leaves];
  const levels = [level];

  while (level.length > 1) {
    const nextLevel = [];
    for (let i = 0; i < level.length; i += 2) {
      if (i + 1 < level.length) {
        nextLevel.push(sha256(level[i] + level[i + 1]));
      } else {
        nextLevel.push(level[i]); // Carry over odd leaf
      }
    }
    level = nextLevel;
    levels.push(level);
  }

  return {
    root: level[0],
    levels
  };
}

/**
 * Converts a database audit log record to a deterministic string payload for hashing.
 */
export function serializeAuditLog(log) {
  return `${log.id}:${log.username}:${log.action_type}:${log.target_resource}:${log.details}:${new Date(log.timestamp).toISOString()}`;
}

/**
 * Seals any unsealed audit logs into a new cryptographic Merkle block.
 */
export async function sealUnsealedAuditLogs() {
  return await executeTransaction(async (client) => {
    // 1. Fetch unsealed logs: logs that are not yet referenced in audit_vault_merkle_leaves
    const unsealedRes = await client.query(`
      SELECT * FROM audit_logs
      WHERE id NOT IN (SELECT audit_log_id FROM audit_vault_merkle_leaves)
      ORDER BY id ASC
    `);

    const logs = unsealedRes.rows;
    if (logs.length === 0) {
      return null; // Nothing to seal
    }

    // 2. Map logs to hashes (leaves)
    const leafHashes = logs.map(log => sha256(serializeAuditLog(log)));
    const { root: merkleRoot } = buildMerkleTree(leafHashes);

    // 3. Get latest block index and hash
    const latestBlockRes = await client.query(`
      SELECT block_index, block_hash FROM audit_vault_merkle_blocks
      ORDER BY block_index DESC LIMIT 1
    `);

    const latestBlock = latestBlockRes.rows[0];
    const nextIndex = latestBlock ? latestBlock.block_index + 1 : 0;
    const previousHash = latestBlock ? latestBlock.block_hash : '0000000000000000000000000000000000000000000000000000000000000000';

    // 4. Compute block hash: sha256(index + merkle_root + previous_hash)
    const blockHashInput = `${nextIndex}:${merkleRoot}:${previousHash}`;
    const blockHash = sha256(blockHashInput);

    // 5. Insert block
    await client.query(`
      INSERT INTO audit_vault_merkle_blocks (block_index, merkle_root, previous_block_hash, block_hash)
      VALUES ($1, $2, $3, $4)
    `, [nextIndex, merkleRoot, previousHash, blockHash]);

    // 6. Insert leaves
    for (let i = 0; i < logs.length; i++) {
      await client.query(`
        INSERT INTO audit_vault_merkle_leaves (block_index, leaf_index, audit_log_id, data_hash)
        VALUES ($1, $2, $3, $4)
      `, [nextIndex, i, logs[i].id, leafHashes[i]]);
    }

    return {
      blockIndex: nextIndex,
      merkleRoot,
      blockHash,
      sealedCount: logs.length
    };
  });
}

/**
 * Validates the entire database Merkle chain, verification checks, and alerts on tamper detection.
 */
export async function verifyMerkleChain() {
  try {
    const blocksRes = await query('SELECT * FROM audit_vault_merkle_blocks ORDER BY block_index ASC');
    const blocks = blocksRes.rows;

    if (blocks.length === 0) {
      return { status: 'VALID', reason: 'Database Merkle Vault is empty (genesis stage).' };
    }

    let expectedPrevHash = '0000000000000000000000000000000000000000000000000000000000000000';

    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i];

      // 1. Verify index sequence
      if (block.block_index !== i) {
        return {
          status: 'TAMPERED',
          reason: `Block index sequence gap detected. Expected block index ${i}, found ${block.block_index}.`
        };
      }

      // 2. Verify previous block link hash
      if (block.previous_block_hash !== expectedPrevHash) {
        return {
          status: 'TAMPERED',
          reason: `Chain broken at block ${i}. Stored previous hash does not match actual preceding hash.`
        };
      }

      // 3. Re-verify Merkle Root of leaves
      const leavesRes = await query(`
        SELECT l.*, al.username, al.action_type, al.target_resource, al.details, al.timestamp
        FROM audit_vault_merkle_leaves l
        LEFT JOIN audit_logs al ON l.audit_log_id = al.id
        WHERE l.block_index = $1
        ORDER BY l.leaf_index ASC
      `, [block.block_index]);

      const leaves = leavesRes.rows;
      if (leaves.length === 0) {
        return {
          status: 'TAMPERED',
          reason: `Block ${i} contains no leaf nodes.`
        };
      }

      const computedLeafHashes = [];
      for (const leaf of leaves) {
        if (!leaf.username) {
          return {
            status: 'TAMPERED',
            reason: `Audit log record ID ${leaf.audit_log_id} referenced in block ${i} leaf index ${leaf.leaf_index} is missing (deleted from database).`
          };
        }

        // Recompute serialize and hash to detect audit changes
        const recomputedHash = sha256(serializeAuditLog({
          id: leaf.audit_log_id,
          username: leaf.username,
          action_type: leaf.action_type,
          target_resource: leaf.target_resource,
          details: leaf.details,
          timestamp: leaf.timestamp
        }));

        if (recomputedHash !== leaf.data_hash) {
          return {
            status: 'TAMPERED',
            reason: `Data integrity breach detected on audit log record ID ${leaf.audit_log_id}. Database values modified after cryptographic seal.`
          };
        }

        computedLeafHashes.push(leaf.data_hash);
      }

      const { root: computedRoot } = buildMerkleTree(computedLeafHashes);
      if (computedRoot !== block.merkle_root) {
        return {
          status: 'TAMPERED',
          reason: `Merkle Root verification failed for block ${i}. Stored root: ${block.merkle_root}, computed root: ${computedRoot}.`
        };
      }

      // 4. Verify block hash consistency
      const expectedBlockHash = sha256(`${block.block_index}:${block.merkle_root}:${block.previous_block_hash}`);
      if (block.block_hash !== expectedBlockHash) {
        return {
          status: 'TAMPERED',
          reason: `Block hash verification failed for block ${i}. Stored hash: ${block.block_hash}, computed hash: ${expectedBlockHash}.`
        };
      }

      expectedPrevHash = block.block_hash;
    }

    return {
      status: 'VALID',
      verifiedBlocks: blocks.length,
      verifiedRecords: await query('SELECT COUNT(*) AS count FROM audit_vault_merkle_leaves').then(r => parseInt(r.rows[0].count))
    };
  } catch (err) {
    return {
      status: 'TAMPERED',
      reason: `Chain validation query crash: ${err.message}`
    };
  }
}
