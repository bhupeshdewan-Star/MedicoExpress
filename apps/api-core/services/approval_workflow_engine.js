import { query } from '../config/db.js';
import { logImmutableAction } from './audit_trail_service.js';

// Local asset states mapping to represent PostgreSQL table records in mock mode
export const localWorkflowStates = new Map();

export const ALLOWED_TRANSITIONS = {
  'DRAFT': ['REVIEW'],
  'REVIEW': ['APPROVED', 'DRAFT'],
  'APPROVED': ['EFFECTIVE', 'DRAFT'],
  'EFFECTIVE': ['SUPERSEDED', 'RETIRED'],
  'SUPERSEDED': ['RETIRED'],
  'RETIRED': []
};

/**
 * Transitions the GxP state of a system asset (SKILL, SOP, REPORT, KNOWLEDGE).
 */
export async function transitionAssetState(entityType, entityId, targetState, userId, userRole, username) {
  const normalizedType = String(entityType).toUpperCase();
  const normalizedTarget = String(targetState).toUpperCase();

  // 1. Fetch current status of asset
  let currentStatus = 'DRAFT';
  const key = `${normalizedType}:${entityId}`;
  
  if (localWorkflowStates.has(key)) {
    currentStatus = localWorkflowStates.get(key);
  } else {
    try {
      const dbQuery = `SELECT status FROM approval_workflows WHERE entity_type = $1 AND entity_id = $2 LIMIT 1`;
      const res = await query(dbQuery, [normalizedType, entityId]);
      if (res && res.rows && res.rows[0]) {
        currentStatus = res.rows[0].status;
      }
    } catch (err) {
      // Mock db bypass
    }
  }

  // --- Layer 3 Workflow Authorization ---
  let domain = null;
  if (normalizedType === 'SOP') {
    const domainRes = await query(
      `SELECT DISTINCT sf.domain 
       FROM sop_function_matrix sopf
       JOIN skill_function_matrix sf ON sopf.function_name = sf.function_name
       WHERE sopf.sop_id = $1`,
      [parseInt(entityId)]
    );
    domain = domainRes.rows[0]?.domain;
  } else if (normalizedType === 'SKILL') {
    const domainRes = await query(
      `SELECT DISTINCT domain FROM skill_function_matrix WHERE skill_id = $1`,
      [parseInt(entityId)]
    );
    domain = domainRes.rows[0]?.domain;
  }

  // Fallback to medical_affairs if not resolved
  if (!domain) {
    domain = 'medical_affairs';
  }

  // Load dynamic domain-role-workflow mapping from knowledge document 'KA-GOV-001'
  let allowedRoles = [];
  try {
    const govRes = await query("SELECT content FROM knowledge_documents WHERE code = 'KA-GOV-001' LIMIT 1");
    if (govRes.rows.length > 0) {
      const config = JSON.parse(govRes.rows[0].content);
      allowedRoles = config.roles?.[domain] || [];
    }
  } catch (err) {
    // ignore
  }

  // Fallbacks if mapping doc is not loaded yet
  if (allowedRoles.length === 0) {
    if (domain === 'medical_affairs') {
      allowedRoles = ['Head of Medical Affairs', 'Medical Manager', 'Medical Advisor', 'Admin'];
    } else if (domain === 'regulatory_affairs') {
      allowedRoles = ['Regulatory Manager', 'Admin'];
    } else if (domain === 'clinical_research') {
      allowedRoles = ['Clinical Research Manager', 'Admin'];
    } else {
      allowedRoles = ['Admin'];
    }
  }

  // 1. Role belongs to domain
  if (!allowedRoles.includes(userRole)) {
    throw new Error('GxP Policy Violation');
  }

  // 2. Workflow belongs to domain
  const instanceRes = await query('SELECT * FROM workflow_instances WHERE sop_id = $1 LIMIT 1', [parseInt(entityId)]);
  if (instanceRes.rows.length > 0) {
    const instance = instanceRes.rows[0];
    const designRes = await query('SELECT * FROM workflow_designs WHERE id = $1 LIMIT 1', [instance.design_id]);
    if (designRes.rows.length > 0) {
      const design = designRes.rows[0];
      if (design.module_type !== domain) {
        throw new Error('GxP Policy Violation');
      }
    }
  }

  // 3. Approval route belongs to SOP
  const allowed = ALLOWED_TRANSITIONS[currentStatus] || [];
  if (!allowed.includes(normalizedTarget)) {
    throw new Error('GxP Policy Violation');
  }

  // 4. User authorized for transition
  if (normalizedTarget === 'APPROVED' || normalizedTarget === 'EFFECTIVE') {
    const highAuthorityRoles = ['Head of Medical Affairs', 'Regulatory Manager', 'Clinical Research Manager', 'Admin'];
    if (!highAuthorityRoles.includes(userRole)) {
      throw new Error('GxP Policy Violation');
    }
  }

  // 4. Record transition
  localWorkflowStates.set(key, normalizedTarget);

  try {
    await query(
      `INSERT INTO approval_workflows (entity_type, entity_id, status, submitted_by)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (entity_type, entity_id) DO UPDATE SET status = EXCLUDED.status, last_transition = CURRENT_TIMESTAMP`,
      [normalizedType, entityId, normalizedTarget, userId]
    );
  } catch (err) {
    // Simulated DB insert/update
  }

  // 5. Create immutable audit event
  const details = `Transitioned ${normalizedType} asset ${entityId} status from ${currentStatus} to ${normalizedTarget}`;
  await logImmutableAction(userId, username, userRole, 'TRANSITION_STATUS', `${normalizedType.toLowerCase()}:${entityId}`, details, '127.0.0.1');

  return {
    entityType: normalizedType,
    entityId,
    previousStatus: currentStatus,
    newStatus: normalizedTarget
  };
}
