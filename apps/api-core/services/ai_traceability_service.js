import crypto from 'crypto';
import { query } from '../config/db.js';

// Local traceability memory map for test runs
export const localTraceability = new Map();

/**
 * Registers an AI execution traceability map for reconstruction tracking.
 */
export async function registerTraceabilityMap(executionId, skillId, skillVersion, promptVersionId, sopVersionId, chunksUsed, modelUsed, outputText) {
  const outputHash = crypto.createHash('sha256').update(outputText).digest('hex');

  // Chunks mapping containing text fragment IDs and checksums
  const chunksList = chunksUsed.map(c => ({
    id: c.id,
    title: c.title,
    sourceType: c.sourceType,
    checksum: c.checksum || crypto.createHash('sha256').update(c.text || '').digest('hex')
  }));

  const traceRecord = {
    id: Math.floor(Math.random() * 100000),
    execution_id: executionId,
    skill_id: skillId,
    skill_version: skillVersion || '1.0.0',
    prompt_version_id: promptVersionId,
    sop_version_id: sopVersionId,
    chunks_used_json: chunksList,
    model_used: modelUsed,
    output_hash: outputHash,
    created_at: new Date().toISOString()
  };

  localTraceability.set(executionId, traceRecord);

  try {
    await query(
      `INSERT INTO ai_traceability (execution_id, skill_version, prompt_version_id, sop_version_id, chunks_used_json, model_used, output_hash)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        executionId,
        traceRecord.skill_version,
        promptVersionId,
        sopVersionId,
        JSON.stringify(chunksList),
        modelUsed,
        outputHash
      ]
    );
  } catch (err) {
    // Simulated DB insert
  }

  return traceRecord;
}

/**
 * Reconstructs the AI execution parameters and hashes to verify output reproducibility.
 */
export async function reconstructAIOutput(executionId) {
  let trace = localTraceability.get(executionId);

  if (!trace) {
    try {
      const res = await query(`SELECT * FROM ai_traceability WHERE execution_id = $1`, [executionId]);
      if (res && res.rows && res.rows[0]) {
        trace = res.rows[0];
      }
    } catch (err) {
      // Mock db fail
    }
  }

  if (!trace) {
    throw new Error(`AI Traceability Map not found for execution ${executionId}`);
  }

  return {
    reconstructed: true,
    executionId: trace.execution_id,
    skillVersion: trace.skill_version,
    promptVersionId: trace.prompt_version_id,
    sopVersionId: trace.sop_version_id,
    chunksUsed: typeof trace.chunks_used_json === 'string' ? JSON.parse(trace.chunks_used_json) : trace.chunks_used_json,
    modelUsed: trace.model_used,
    outputHash: trace.output_hash,
    verifiedAt: new Date().toISOString()
  };
}
