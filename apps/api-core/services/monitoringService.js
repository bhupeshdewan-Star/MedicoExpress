import { query } from '../config/db.js';
import { logAudit } from '../middleware/audit.js';
import crypto from 'crypto';

/**
 * Valid transitions for monitoring visit lifecycle.
 */
const VISIT_LIFECYCLE_TRANSITIONS = {
  'SCHEDULED': ['IN_PROGRESS'],
  'IN_PROGRESS': ['REPORT_PENDING'],
  'REPORT_PENDING': ['PENDING_SIGNATURE'],
  'PENDING_SIGNATURE': ['APPROVED'],
  'APPROVED': []
};

/**
 * Creates a scheduled monitoring visit.
 */
export async function scheduleMonitoringVisit(visitData, user) {
  const { site_id, visit_date, monitor_id, visit_type, tenant_id } = visitData;

  if (!site_id || !visit_date || !visit_type) {
    throw new Error('Site ID, Visit date, and Visit type are required.');
  }

  const sql = `
    INSERT INTO monitoring_visits (site_id, visit_date, monitor_id, visit_type, status, tenant_id)
    VALUES ($1, $2, $3, $4, 'SCHEDULED', $5)
    RETURNING *
  `;
  const result = await query(sql, [site_id, visit_date, monitor_id || null, visit_type, tenant_id || 1]);
  const newVisit = result.rows[0];

  if (user) {
    await logAudit(
      user.id,
      user.username,
      user.role,
      'SCHEDULE_MONITORING_VISIT',
      `monitoring_visits/${newVisit.id}`,
      `Scheduled ${visit_type} visit on ${visit_date}`,
      user.ipAddress || '127.0.0.1'
    );
  }

  return newVisit;
}

/**
 * Updates monitoring visit status.
 */
export async function updateVisitStatus(visitId, newStatus, user) {
  const visitRes = await query('SELECT * FROM monitoring_visits WHERE id = $1', [visitId]);
  const visit = visitRes.rows[0];
  if (!visit) {
    throw new Error('Monitoring visit not found.');
  }

  const currentStatus = visit.status;
  const allowed = VISIT_LIFECYCLE_TRANSITIONS[currentStatus] || [];
  if (currentStatus !== newStatus && !allowed.includes(newStatus)) {
    throw new Error(`Invalid monitoring visit status transition from ${currentStatus} to ${newStatus}.`);
  }

  // Double signatures check before advancing to APPROVED
  if (newStatus === 'APPROVED') {
    const sigRes = await query('SELECT role FROM monitoring_visit_signatures WHERE visit_id = $1', [visitId]);
    const signedRoles = sigRes.rows.map(r => r.role);
    const hasMonitor = signedRoles.includes('MONITOR');
    const hasPI = signedRoles.includes('PI');
    if (!hasMonitor || !hasPI) {
      throw new Error('Dual signatures (Monitor + Principal Investigator) are required before approving report.');
    }
  }

  const sql = `
    UPDATE monitoring_visits
    SET status = $1, updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
    RETURNING *
  `;
  const result = await query(sql, [newStatus, visitId]);
  const updatedVisit = result.rows[0];

  if (user) {
    await logAudit(
      user.id,
      user.username,
      user.role,
      'UPDATE_VISIT_STATUS',
      `monitoring_visits/${visitId}`,
      `Transitioned visit status from ${currentStatus} to ${newStatus}`,
      user.ipAddress || '127.0.0.1'
    );
  }

  return updatedVisit;
}

/**
 * Collects a Part 11 compliant e-signature on a monitoring report.
 * @param {number} visitId Monitoring Visit ID
 * @param {string} signatureRole User role relative to this signature ('MONITOR' or 'PI')
 * @param {Object} credentials User credentials verify map
 * @param {Object} user User context
 */
export async function signMonitoringReport(visitId, signatureRole, credentials, user) {
  const visitRes = await query('SELECT * FROM monitoring_visits WHERE id = $1', [visitId]);
  const visit = visitRes.rows[0];
  if (!visit) {
    throw new Error('Monitoring visit not found.');
  }

  // Ensure current status is at least PENDING_SIGNATURE (or In Progress / Report Pending can be signed as well)
  if (visit.status !== 'PENDING_SIGNATURE') {
    // Force transition to PENDING_SIGNATURE if not already
    await query("UPDATE monitoring_visits SET status = 'PENDING_SIGNATURE' WHERE id = $1", [visitId]);
  }

  // Prevent duplicate signatures for the same role
  const checkDup = await query('SELECT 1 FROM monitoring_visit_signatures WHERE visit_id = $1 AND role = $2', [visitId, signatureRole]);
  if (checkDup.rows.length > 0) {
    throw new Error(`e-Signature for role ${signatureRole} has already been registered.`);
  }

  // Hash signature to secure it (Part 11 requirement)
  const signString = `${user.id}-${signatureRole}-${visitId}-${Date.now()}`;
  const signatureHash = crypto.createHash('sha256').update(signString).digest('hex');

  // Insert signature
  const sql = `
    INSERT INTO monitoring_visit_signatures (visit_id, user_id, role, signature_hash, tenant_id)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;
  const sigResult = await query(sql, [visitId, user.id, signatureRole, signatureHash, visit.tenant_id]);

  if (user) {
    await logAudit(
      user.id,
      user.username,
      user.role,
      'SIGN_MONITORING_REPORT',
      `monitoring_visits/${visitId}/signatures`,
      `Part 11 electronic signature applied as ${signatureRole}. Signature hash: ${signatureHash}`,
      user.ipAddress || '127.0.0.1'
    );
  }

  // Auto-promote to APPROVED if both are signed
  const sigRes = await query('SELECT role FROM monitoring_visit_signatures WHERE visit_id = $1', [visitId]);
  const signedRoles = sigRes.rows.map(r => r.role);
  if (signedRoles.includes('MONITOR') && signedRoles.includes('PI')) {
    await query("UPDATE monitoring_visits SET status = 'APPROVED', updated_at = CURRENT_TIMESTAMP WHERE id = $1", [visitId]);
    if (user) {
      await logAudit(
        user.id,
        user.username,
        user.role,
        'AUTO_APPROVE_VISIT',
        `monitoring_visits/${visitId}`,
        'Monitoring report approved automatically after final electronic signature.',
        user.ipAddress || '127.0.0.1'
      );
    }
  }

  return sigResult.rows[0];
}

/**
 * Gets monitoring visits.
 */
export async function getMonitoringVisits(siteId) {
  let sql = `
    SELECT mv.*, ss.name AS site_name, ss.site_number, u.username AS monitor_name
    FROM monitoring_visits mv
    JOIN study_sites ss ON mv.site_id = ss.id
    LEFT JOIN users u ON mv.monitor_id = u.id
  `;
  const params = [];
  if (siteId) {
    sql += ' WHERE mv.site_id = $1';
    params.push(siteId);
  }
  sql += ' ORDER BY mv.visit_date DESC';
  const result = await query(sql, params);
  return result.rows;
}

/**
 * Gets signatures for a monitoring visit.
 */
export async function getVisitSignatures(visitId) {
  const sql = `
    SELECT mvs.*, u.username, u.email
    FROM monitoring_visit_signatures mvs
    JOIN users u ON mvs.user_id = u.id
    WHERE mvs.visit_id = $1
  `;
  const result = await query(sql, [visitId]);
  return result.rows;
}

/**
 * Registers a monitoring finding.
 */
export async function addFinding(findingData, user) {
  const { visit_id, description, severity, tenant_id } = findingData;
  if (!visit_id || !description || !severity) {
    throw new Error('Visit ID, Description, and Severity are required.');
  }

  const sql = `
    INSERT INTO monitoring_findings (visit_id, description, severity, status, tenant_id)
    VALUES ($1, $2, $3, 'OPEN', $4)
    RETURNING *
  `;
  const result = await query(sql, [visit_id, description, severity, tenant_id || 1]);
  const newFinding = result.rows[0];

  if (user) {
    await logAudit(
      user.id,
      user.username,
      user.role,
      'ADD_MONITORING_FINDING',
      `monitoring_findings/${newFinding.id}`,
      `Logged finding: ${description}`,
      user.ipAddress || '127.0.0.1'
    );
  }

  return newFinding;
}

/**
 * Resolves a finding.
 */
export async function resolveFinding(findingId, resolutionDetails, user) {
  const sql = `
    UPDATE monitoring_findings
    SET status = 'RESOLVED', resolution_details = $1, resolved_at = CURRENT_TIMESTAMP
    WHERE id = $2
    RETURNING *
  `;
  const result = await query(sql, [resolutionDetails || 'Resolved', findingId]);
  const updated = result.rows[0];

  if (user) {
    await logAudit(
      user.id,
      user.username,
      user.role,
      'RESOLVE_MONITORING_FINDING',
      `monitoring_findings/${findingId}`,
      `Resolved finding. Details: ${resolutionDetails}`,
      user.ipAddress || '127.0.0.1'
    );
  }

  return updated;
}

/**
 * Gets findings lists.
 */
export async function getFindings(visitId) {
  let sql = 'SELECT * FROM monitoring_findings';
  const params = [];
  if (visitId) {
    sql += ' WHERE visit_id = $1';
    params.push(visitId);
  }
  sql += ' ORDER BY id DESC';
  const result = await query(sql, params);
  return result.rows;
}

/**
 * Checks if a site is active/flagged for escalation due to Critical findings open > 14 days.
 * Returns true if there is at least one critical finding unresolved that was created over 14 days ago.
 */
export async function checkSiteEscalation(siteId) {
  const sql = `
    SELECT COUNT(*) AS count
    FROM monitoring_findings mf
    JOIN monitoring_visits mv ON mf.visit_id = mv.id
    WHERE mv.site_id = $1
      AND mf.severity = 'CRITICAL'
      AND mf.status = 'OPEN'
      AND mf.created_at < CURRENT_TIMESTAMP - INTERVAL '14 days'
  `;
  const res = await query(sql, [siteId]);
  return parseInt(res.rows[0].count) > 0;
}
