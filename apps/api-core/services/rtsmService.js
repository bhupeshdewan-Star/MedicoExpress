import crypto from 'crypto';
import { query } from '../config/db.js';
import { logAudit } from '../middleware/audit.js';

/**
 * Configure Randomization settings for a Clinical Study.
 */
export async function configureRandomization(studyId, configData, user = null) {
  const { blockSizes, stratificationFactors, randomizationRatio, tenantId } = configData;

  const sql = `
    INSERT INTO study_randomization_configs (study_id, block_sizes, stratification_factors, randomization_ratio, tenant_id)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (study_id) DO UPDATE SET
      block_sizes = EXCLUDED.block_sizes,
      stratification_factors = EXCLUDED.stratification_factors,
      randomization_ratio = EXCLUDED.randomization_ratio,
      created_at = CURRENT_TIMESTAMP
    RETURNING *
  `;
  const res = await query(sql, [
    studyId, 
    blockSizes || '{4, 6}', 
    stratificationFactors || '{}', 
    randomizationRatio || '1:1', 
    tenantId || 1
  ]);

  if (user) {
    await logAudit(
      user.id,
      user.username,
      user.role,
      'CONFIGURE_RTSM_RANDOMIZATION',
      `studies/${studyId}/rtsm-config`,
      `Configured randomization settings for study ID ${studyId}: blocks=${JSON.stringify(blockSizes)}, ratio=${randomizationRatio}`,
      user.ipAddress || '127.0.0.1'
    );
  }

  return res.rows[0];
}

/**
 * Executes a deterministic stratified block randomization for a subject.
 * Seed is generated based on study configuration and logged for auditable reproducibility.
 */
export async function executeRandomization(subjectId, tenantId = 1, user = null) {
  // 1. Load subject info
  const subjectRes = await query('SELECT * FROM study_subjects WHERE id = $1', [subjectId]);
  const subject = subjectRes.rows[0];
  if (!subject) {
    throw new Error('Subject record not found.');
  }

  // Check if subject is already randomized
  const checkRes = await query('SELECT * FROM subject_randomizations WHERE subject_id = $1', [subjectId]);
  if (checkRes.rows.length > 0) {
    return checkRes.rows[0];
  }

  // 2. Load study randomization configuration
  const configRes = await query('SELECT * FROM study_randomization_configs WHERE study_id = $1 AND is_active = true', [subject.study_id]);
  const config = configRes.rows[0];
  if (!config) {
    throw new Error('No active randomization configuration found for this study.');
  }

  // 3. Resolve stratification variables (e.g. site_id)
  // Simple stratification cell string: e.g. "site:1"
  const stratCell = `site:${subject.site_id}`;

  // 4. Load all previously randomized subjects in this stratification cell
  const prevRes = await query(`
    SELECT sr.* 
    FROM subject_randomizations sr
    JOIN study_subjects ss ON sr.subject_id = ss.id
    WHERE ss.study_id = $1 AND ss.site_id = $2
    ORDER BY sr.randomized_at ASC
  `, [subject.study_id, subject.site_id]);
  const prevRandomizations = prevRes.rows;

  // Calculate allocation ratio weights (e.g., "1:1" -> [1, 1], "2:1" -> [2, 1])
  const ratioParts = config.randomization_ratio.split(':').map(Number);
  const totalRatioWeight = ratioParts.reduce((sum, r) => sum + r, 0);

  // Pick block size from configured block_sizes (e.g., config.block_sizes[0])
  const allowedBlocks = config.block_sizes;
  // Select block size dynamically (variable block sizes fallback if multiple exists)
  const blockSizeIndex = prevRandomizations.length % allowedBlocks.length;
  const currentBlockSize = allowedBlocks[blockSizeIndex] || 4;

  // Make sure block size is compatible with ratios (e.g. divisible by total ratio weight)
  let adjustedBlockSize = currentBlockSize;
  if (adjustedBlockSize % totalRatioWeight !== 0) {
    adjustedBlockSize = Math.ceil(currentBlockSize / totalRatioWeight) * totalRatioWeight;
  }

  // Construct block template (e.g., for ratio 1:1, block size 4 -> 2 ACTIVE, 2 PLACEBO)
  const armNames = ratioParts.length === 2 ? ['ACTIVE', 'PLACEBO'] : ['ACTIVE', 'PLACEBO', 'LOW_DOSE']; // standard arms fallback
  const blockArms = [];
  for (let i = 0; i < armNames.length; i++) {
    const shareCount = (ratioParts[i] / totalRatioWeight) * adjustedBlockSize;
    for (let k = 0; k < shareCount; k++) {
      blockArms.push(armNames[i]);
    }
  }

  // Deterministic seed hashing using: cell_name + study_id + count + secret_key
  const blockIndex = Math.floor(prevRandomizations.length / adjustedBlockSize);
  const cellSeed = `${stratCell}-study:${subject.study_id}-block:${blockIndex}-seed_key_clin`;
  const seedHash = crypto.createHash('sha256').update(cellSeed).digest('hex');

  // Pseudo-random index shuffling based on the seed value
  // Simple deterministic LCG or sorting based on hash byte values
  const shuffledArms = blockArms
    .map((arm, index) => {
      const charVal = parseInt(seedHash.substring(index * 2, index * 2 + 2), 16) || 0;
      return { arm, randomWeight: charVal };
    })
    .sort((a, b) => a.randomWeight - b.randomWeight)
    .map(item => item.arm);

  // Identify index of current subject in this block
  const subjectIndexInBlock = prevRandomizations.length % adjustedBlockSize;
  const assignedArm = shuffledArms[subjectIndexInBlock] || armNames[0];

  // 5. Generate randomization number (e.g. Rand-SubjectNum)
  const randomSuffix = crypto.randomInt(1000, 9999);
  const randomizationNumber = `R-${subject.subject_number}-${randomSuffix}`;

  // 6. Record randomization assignment in database
  const insertSql = `
    INSERT INTO subject_randomizations (subject_id, randomization_number, treatment_arm, tenant_id)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `;
  const result = await query(insertSql, [subjectId, randomizationNumber, assignedArm, tenantId]);
  const newRand = result.rows[0];

  // Update subject status to ENROLLED/ONGOING
  await query("UPDATE study_subjects SET status = 'ENROLLED', updated_at = CURRENT_TIMESTAMP WHERE id = $1", [subjectId]);

  // Record audit trail event
  if (user) {
    await logAudit(
      user.id,
      user.username,
      user.role,
      'RANDOMIZE_SUBJECT',
      `subjects/${subjectId}/randomize`,
      `Randomized subject ID ${subjectId} (number: ${randomizationNumber}) using block size ${adjustedBlockSize}. Seed validation hash: ${seedHash.substring(0, 16)}`,
      user.ipAddress || '127.0.0.1'
    );
  }

  // Create event log entry
  await query(
    `INSERT INTO event_logs (event_type, event_source, message, tenant_id)
     VALUES ($1, $2, $3, $4)`,
    ['SUBJECT_RANDOMIZED', 'rtsm-service', `Randomized subject ID ${subjectId} to arm ${assignedArm}`, tenantId]
  );

  return newRand;
}

/**
 * Handles unblinding requests for emergency safety validation.
 * Action is highly audited and triggers notification alerts.
 */
export async function emergencyUnblind(subjectId, reason, user) {
  if (!user || !['Head of Medical Affairs', 'Admin', 'Medical Advisor'].includes(user.role)) {
    throw new Error('403 Forbidden: Insufficient clearance to request unblinding.');
  }

  const res = await query('SELECT * FROM subject_randomizations WHERE subject_id = $1', [subjectId]);
  const randomization = res.rows[0];
  if (!randomization) {
    throw new Error('Subject has not been randomized.');
  }

  // Log unblinding audit event
  await logAudit(
    user.id,
    user.username,
    user.role,
    'EMERGENCY_UNBLINDING',
    `subjects/${subjectId}/randomize`,
    `EMERGENCY UNBLINDING PERFORMED for subject ID ${subjectId}. Reason: ${reason}`,
    user.ipAddress || '127.0.0.1'
  );

  // Write safety trace to event_logs
  await query(
    `INSERT INTO event_logs (event_type, event_source, message, tenant_id)
     VALUES ($1, $2, $3, $4)`,
    ['UNBLIND_VISITED', 'rtsm-service', `Blinded treatment code accessed for subject ID ${subjectId} by user ${user.username}`, user.tenant_id || 1]
  );

  return {
    subjectId,
    randomizationNumber: randomization.randomization_number,
    treatmentArm: randomization.treatment_arm,
    unblindedBy: user.username,
    unblindedAt: new Date().toISOString()
  };
}

/**
 * Helper to get unblinded configuration statistics for dashboard analytics
 */
export async function getBlindedStats(studyId) {
  const res = await query(`
    SELECT treatment_arm, COUNT(*) as count 
    FROM subject_randomizations 
    WHERE subject_id IN (SELECT id FROM study_subjects WHERE study_id = $1)
    GROUP BY treatment_arm
  `, [studyId]);
  
  return res.rows.map(r => ({
    name: r.treatment_arm,
    value: parseInt(r.count, 10)
  }));
}
