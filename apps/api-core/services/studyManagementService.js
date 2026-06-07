import { query } from '../config/db.js';
import { logAudit } from '../middleware/audit.js';
import { initializeEtmfFolderStructure } from './etmfService.js';

/**
 * Valid transitions for study status state machine.
 */
const VALID_TRANSITIONS = {
  'PLANNING': ['ACTIVE', 'TERMINATED'],
  'ACTIVE': ['ON_HOLD', 'COMPLETED', 'TERMINATED'],
  'ON_HOLD': ['ACTIVE', 'TERMINATED'],
  'COMPLETED': [],
  'TERMINATED': []
};

/**
 * Creates a new clinical study.
 * @param {Object} studyData Data for the study (protocol_number, title, phase, sponsor, therapeutic_area, tenant_id)
 * @param {Object} user User context (id, username, role, ipAddress)
 * @returns {Promise<Object>} Created study
 */
export async function createStudy(studyData, user) {
  const { protocol_number, title, phase, sponsor, therapeutic_area, tenant_id } = studyData;

  if (!protocol_number || !title || !phase) {
    throw new Error('Protocol number, title, and phase are required.');
  }

  const sql = `
    INSERT INTO studies (protocol_number, title, phase, sponsor, therapeutic_area, tenant_id)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `;
  const result = await query(sql, [protocol_number, title, phase, sponsor || 'ClinCommand LifeSciences', therapeutic_area || 'Oncology', tenant_id || 1]);
  const newStudy = result.rows[0];

  // Initialize standard eTMF folder hierarchy for the new study
  try {
    await initializeEtmfFolderStructure(newStudy.id, tenant_id || 1);
  } catch (etmfErr) {
    console.error('Failed to initialize eTMF structure for study:', etmfErr.message);
  }

  if (user) {
    await logAudit(
      user.id,
      user.username,
      user.role,
      'CREATE_STUDY',
      `studies/${newStudy.id}`,
      `Created study ${protocol_number}`,
      user.ipAddress || '127.0.0.1'
    );
  }

  return newStudy;
}

/**
 * Retrieves all studies in current tenant.
 * @returns {Promise<Array>} List of studies
 */
export async function getStudies() {
  const result = await query('SELECT * FROM studies ORDER BY id DESC');
  return result.rows;
}

/**
 * Retrieves study detail by ID.
 * @param {number} id Study ID
 * @returns {Promise<Object>} Study object
 */
export async function getStudyById(id) {
  const result = await query('SELECT * FROM studies WHERE id = $1', [id]);
  return result.rows[0];
}

/**
 * Updates the status of a study enforcing valid state machine transitions.
 * @param {number} id Study ID
 * @param {string} newStatus Target status
 * @param {Object} user User context
 * @returns {Promise<Object>} Updated study
 */
export async function updateStudyStatus(id, newStatus, user) {
  const study = await getStudyById(id);
  if (!study) {
    throw new Error('Study not found.');
  }

  const currentStatus = study.status;
  const allowed = VALID_TRANSITIONS[currentStatus] || [];
  if (currentStatus !== newStatus && !allowed.includes(newStatus)) {
    throw new Error(`Invalid status transition from ${currentStatus} to ${newStatus}.`);
  }

  const sql = `
    UPDATE studies
    SET status = $1, updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
    RETURNING *
  `;
  const result = await query(sql, [newStatus, id]);
  const updatedStudy = result.rows[0];

  if (user) {
    await logAudit(
      user.id,
      user.username,
      user.role,
      'UPDATE_STUDY_STATUS',
      `studies/${id}`,
      `Updated status from ${currentStatus} to ${newStatus}`,
      user.ipAddress || '127.0.0.1'
    );
  }

  return updatedStudy;
}

/**
 * Creates a study protocol version.
 * @param {Object} protocolData Protocol fields
 * @param {Object} user User context
 */
export async function createProtocol(protocolData, user) {
  const { study_id, version, objectives, endpoints, inclusion_criteria, exclusion_criteria, is_active, tenant_id } = protocolData;

  if (is_active) {
    // Mark previous protocols as inactive
    await query('UPDATE study_protocols SET is_active = false WHERE study_id = $1', [study_id]);
  }

  const sql = `
    INSERT INTO study_protocols (study_id, version, objectives, endpoints, inclusion_criteria, exclusion_criteria, is_active, tenant_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
  `;
  const result = await query(sql, [
    study_id,
    version,
    objectives,
    endpoints,
    inclusion_criteria,
    exclusion_criteria,
    is_active !== undefined ? is_active : true,
    tenant_id || 1
  ]);
  const newProtocol = result.rows[0];

  // Log study version tag
  await query(
    `INSERT INTO study_versions (study_id, version_tag, amendment_details, tenant_id)
     VALUES ($1, $2, $3, $4)`,
    [study_id, version, `Protocol updated to version ${version}`, tenant_id || 1]
  );

  if (user) {
    await logAudit(
      user.id,
      user.username,
      user.role,
      'CREATE_PROTOCOL_VERSION',
      `study_protocols/${newProtocol.id}`,
      `Registered protocol version ${version} for study ${study_id}`,
      user.ipAddress || '127.0.0.1'
    );
  }

  return newProtocol;
}

/**
 * Gets all protocols for a study.
 * @param {number} studyId Study ID
 */
export async function getProtocolsByStudy(studyId) {
  const result = await query('SELECT * FROM study_protocols WHERE study_id = $1 ORDER BY id DESC', [studyId]);
  return result.rows;
}

/**
 * Compares two protocol versions and returns a detailed JSON diff mapping changes.
 * @param {number} studyId Study ID
 * @param {string} v1 First version code
 * @param {string} v2 Second version code
 */
export async function compareProtocolVersions(studyId, v1, v2) {
  const res1 = await query('SELECT * FROM study_protocols WHERE study_id = $1 AND version = $2', [studyId, v1]);
  const res2 = await query('SELECT * FROM study_protocols WHERE study_id = $1 AND version = $2', [studyId, v2]);

  const p1 = res1.rows[0];
  const p2 = res2.rows[0];

  if (!p1 || !p2) {
    throw new Error('One or both protocol versions not found.');
  }

  const diff = {};
  const fields = ['objectives', 'endpoints', 'inclusion_criteria', 'exclusion_criteria'];
  fields.forEach(field => {
    if (p1[field] !== p2[field]) {
      diff[field] = {
        oldValue: p1[field],
        newValue: p2[field]
      };
    }
  });

  return {
    studyId,
    versionComparison: { v1, v2 },
    hasChanges: Object.keys(diff).length > 0,
    changes: diff
  };
}
