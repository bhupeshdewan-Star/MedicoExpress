import { query } from '../config/db.js';
import { logAudit } from '../middleware/audit.js';

/**
 * Creates a study site.
 * @param {Object} siteData Site data
 * @param {Object} user User context
 */
export async function createSite(siteData, user) {
  const { study_id, site_number, name, country, target_enrollment, tenant_id } = siteData;

  if (!study_id || !site_number || !name || !country) {
    throw new Error('Study ID, Site number, Name, and Country are required.');
  }

  const sql = `
    INSERT INTO study_sites (study_id, site_number, name, country, status, target_enrollment, tenant_id)
    VALUES ($1, $2, $3, $4, 'INITIATING', $5, $6)
    RETURNING *
  `;
  const result = await query(sql, [study_id, site_number, name, country, target_enrollment || 0, tenant_id || 1]);
  const newSite = result.rows[0];

  // Seed default startup activation checklist items for the new site
  const tasks = ['IRB Approval', 'Contract Executed', 'Training Completed'];
  for (const task of tasks) {
    await query(
      `INSERT INTO site_activation_checklists (site_id, task_name, is_completed, tenant_id)
       VALUES ($1, $2, false, $3)`,
      [newSite.id, task, tenant_id || 1]
    );
  }

  if (user) {
    await logAudit(
      user.id,
      user.username,
      user.role,
      'CREATE_SITE',
      `study_sites/${newSite.id}`,
      `Created site ${site_number} for study ${study_id}`,
      user.ipAddress || '127.0.0.1'
    );
  }

  return newSite;
}

/**
 * Gets all sites.
 */
export async function getSites() {
  const result = await query(`
    SELECT s.*, st.protocol_number 
    FROM study_sites s
    JOIN studies st ON s.study_id = st.id
    ORDER BY s.id DESC
  `);
  return result.rows;
}

/**
 * Gets sites filtered by study.
 */
export async function getSitesByStudy(studyId) {
  const result = await query('SELECT * FROM study_sites WHERE study_id = $1 ORDER BY id DESC', [studyId]);
  return result.rows;
}

/**
 * Gets checklist items for a site.
 */
export async function getSiteChecklist(siteId) {
  const result = await query('SELECT * FROM site_activation_checklists WHERE site_id = $1 ORDER BY id ASC', [siteId]);
  return result.rows;
}

/**
 * Completes a checklist task for a site and updates the completed timestamp.
 * If all tasks are completed, automatically transitions status to ACTIVE.
 * @param {number} checklistId Checklist item ID
 * @param {boolean} isCompleted Completion state
 * @param {Object} user User context
 */
export async function updateChecklistItem(checklistId, isCompleted, user) {
  const checkRes = await query('SELECT * FROM site_activation_checklists WHERE id = $1', [checklistId]);
  const item = checkRes.rows[0];
  if (!item) {
    throw new Error('Checklist item not found.');
  }

  const userId = user ? user.id : null;
  const completedAt = isCompleted ? 'CURRENT_TIMESTAMP' : 'NULL';
  
  const sql = `
    UPDATE site_activation_checklists
    SET is_completed = $1, completed_at = ${completedAt}, completed_by = $2
    WHERE id = $3
    RETURNING *
  `;
  const result = await query(sql, [isCompleted, userId, checklistId]);
  const updatedItem = result.rows[0];

  // Audit event
  if (user) {
    await logAudit(
      user.id,
      user.username,
      user.role,
      'UPDATE_SITE_CHECKLIST',
      `site_activation_checklists/${checklistId}`,
      `Task '${item.task_name}' set completed to ${isCompleted}`,
      user.ipAddress || '127.0.0.1'
    );
  }

  // Trigger site status activation check
  await verifyAndActivateSite(item.site_id, user);

  return updatedItem;
}

/**
 * Assesses whether all checklist items are complete and updates the status of study site.
 */
export async function verifyAndActivateSite(siteId, user) {
  const checklist = await getSiteChecklist(siteId);
  const allComplete = checklist.every(item => item.is_completed);

  if (allComplete) {
    const siteRes = await query('SELECT status FROM study_sites WHERE id = $1', [siteId]);
    const currentStatus = siteRes.rows[0]?.status;
    if (currentStatus !== 'ACTIVE') {
      await query(
        `UPDATE study_sites
         SET status = 'ACTIVE', updated_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [siteId]
      );
      if (user) {
        await logAudit(
          user.id,
          user.username,
          user.role,
          'ACTIVATE_SITE',
          `study_sites/${siteId}`,
          `Activated site ${siteId} as all checklists are completed`,
          user.ipAddress || '127.0.0.1'
        );
      }
    }
  } else {
    // If set to incomplete, demote status back to INITIATING
    await query(
      `UPDATE study_sites
       SET status = 'INITIATING', updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND status = 'ACTIVE'`,
      [siteId]
    );
  }
}

/**
 * Registers an investigator in the system.
 */
export async function createInvestigator(invData) {
  const { first_name, last_name, email, specialty, tenant_id } = invData;
  if (!first_name || !last_name || !email) {
    throw new Error('First name, last name, and email are required.');
  }
  const sql = `
    INSERT INTO investigators (first_name, last_name, email, specialty, tenant_id)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;
  const result = await query(sql, [first_name, last_name, email, specialty, tenant_id || 1]);
  return result.rows[0];
}

/**
 * Assigns staff (investigator) to a site.
 */
export async function assignSiteStaff(staffData, user) {
  const { site_id, investigator_id, role, tenant_id } = staffData;
  if (!site_id || !investigator_id || !role) {
    throw new Error('Site ID, Investigator ID, and Role are required.');
  }

  // Validate only one PI exists on this site
  if (role === 'PI') {
    const checkPI = await query('SELECT 1 FROM site_staff WHERE site_id = $1 AND role = $2', [site_id, 'PI']);
    if (checkPI.rows.length > 0) {
      throw new Error('Principal Investigator (PI) role is already assigned for this site.');
    }
  }

  const sql = `
    INSERT INTO site_staff (site_id, investigator_id, role, tenant_id)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `;
  const result = await query(sql, [site_id, investigator_id, role, tenant_id || 1]);
  const newStaff = result.rows[0];

  if (user) {
    await logAudit(
      user.id,
      user.username,
      user.role,
      'ASSIGN_SITE_STAFF',
      `site_staff/${newStaff.id}`,
      `Assigned investigator ${investigator_id} to site ${site_id} as ${role}`,
      user.ipAddress || '127.0.0.1'
    );
  }

  return newStaff;
}

/**
 * Gets staff records for a site.
 */
export async function getSiteStaff(siteId) {
  const sql = `
    SELECT ss.*, inv.first_name, inv.last_name, inv.email, inv.specialty
    FROM site_staff ss
    JOIN investigators inv ON ss.investigator_id = inv.id
    WHERE ss.site_id = $1
  `;
  const result = await query(sql, [siteId]);
  return result.rows;
}

/**
 * Computes performance rating for study sites.
 * Calculation: Performance Index = (actual_enrollment / target_enrollment) * 100
 */
export async function calculateSitePerformance(siteId) {
  const res = await query('SELECT target_enrollment, actual_enrollment FROM study_sites WHERE id = $1', [siteId]);
  const site = res.rows[0];
  if (!site) return 0;
  
  const target = site.target_enrollment;
  const actual = site.actual_enrollment;
  if (target === 0) return 0;

  return Math.round((actual / target) * 100);
}
