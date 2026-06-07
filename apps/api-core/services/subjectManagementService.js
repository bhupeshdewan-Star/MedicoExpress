import { query } from '../config/db.js';
import { logAudit } from '../middleware/audit.js';

/**
 * Valid enrollment state progressions.
 */
const SUBJECT_STATE_PROGRESSION = {
  'SCREENING': ['ENROLLED', 'WITHDRAWN'],
  'ENROLLED': ['ONGOING', 'WITHDRAWN'],
  'ONGOING': ['COMPLETED', 'WITHDRAWN'],
  'COMPLETED': [],
  'WITHDRAWN': []
};

/**
 * Registers and screens a subject.
 * @param {Object} subjectData Subject registration fields
 * @param {Object} user User context
 */
export async function registerSubject(subjectData, user) {
  const { study_id, site_id, subject_number, tenant_id } = subjectData;

  if (!study_id || !site_id || !subject_number) {
    throw new Error('Study ID, Site ID, and Subject Number are required.');
  }

  // Create subject record
  const sql = `
    INSERT INTO study_subjects (study_id, site_id, subject_number, status, tenant_id)
    VALUES ($1, $2, $3, 'SCREENING', $4)
    RETURNING *
  `;
  const result = await query(sql, [study_id, site_id, subject_number, tenant_id || 1]);
  const newSubject = result.rows[0];

  // Log to enrollment logs
  await query(
    `INSERT INTO enrollment_logs (study_id, site_id, action, tenant_id)
     VALUES ($1, $2, 'SCREENED', $3)`,
    [study_id, site_id, tenant_id || 1]
  );

  // Generate initial Screening visit record
  await query(
    `INSERT INTO subject_visits (subject_id, visit_name, scheduled_date, tenant_id)
     VALUES ($1, 'Screening', CURRENT_TIMESTAMP, $2)`,
    [newSubject.id, tenant_id || 1]
  );

  if (user) {
    await logAudit(
      user.id,
      user.username,
      user.role,
      'REGISTER_SUBJECT',
      `study_subjects/${newSubject.id}`,
      `Registered subject ${subject_number} in screening`,
      user.ipAddress || '127.0.0.1'
    );
  }

  return newSubject;
}

/**
 * Transitions subject status.
 * If status changes to ENROLLED, it updates the enrollment date, actual site count, and generates the visit schedule matrix.
 */
export async function updateSubjectStatus(subjectId, newStatus, user) {
  const checkRes = await query('SELECT * FROM study_subjects WHERE id = $1', [subjectId]);
  const subject = checkRes.rows[0];
  if (!subject) {
    throw new Error('Subject not found.');
  }

  const currentStatus = subject.status;
  const allowed = SUBJECT_STATE_PROGRESSION[currentStatus] || [];
  if (currentStatus !== newStatus && !allowed.includes(newStatus)) {
    throw new Error(`Invalid subject status transition from ${currentStatus} to ${newStatus}.`);
  }

  let sql = '';
  let params = [];
  if (newStatus === 'ENROLLED') {
    sql = `
      UPDATE study_subjects
      SET status = $1, enrollment_date = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;
    params = [newStatus, subjectId];

    // Trigger log entry
    await query(
      `INSERT INTO enrollment_logs (study_id, site_id, action, tenant_id)
       VALUES ($1, $2, 'ENROLLED', $3)`,
      [subject.study_id, subject.site_id, subject.tenant_id]
    );

    // Increment actual enrollment count on site
    await query(
      `UPDATE study_sites
       SET actual_enrollment = actual_enrollment + 1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [subject.site_id]
    );

    // Generate longitudinal visit schedule matrix
    await generateVisitMatrix(subjectId, subject.tenant_id);
  } else {
    sql = `
      UPDATE study_subjects
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;
    params = [newStatus, subjectId];

    if (newStatus === 'WITHDRAWN' || newStatus === 'COMPLETED') {
      await query(
        `INSERT INTO enrollment_logs (study_id, site_id, action, tenant_id)
         VALUES ($1, $2, $3, $4)`,
        [subject.study_id, subject.site_id, newStatus, subject.tenant_id]
      );
    }
  }

  const result = await query(sql, params);
  const updatedSubject = result.rows[0];

  if (user) {
    await logAudit(
      user.id,
      user.username,
      user.role,
      'UPDATE_SUBJECT_STATUS',
      `study_subjects/${subjectId}`,
      `Updated subject status from ${currentStatus} to ${newStatus}`,
      user.ipAddress || '127.0.0.1'
    );
  }

  return updatedSubject;
}

/**
 * Automatically creates scheduled visits based on default protocol gaps.
 */
async function generateVisitMatrix(subjectId, tenantId) {
  const visits = [
    { name: 'Baseline', daysFromStart: 7 },
    { name: 'Week 4', daysFromStart: 28 },
    { name: 'Week 12', daysFromStart: 84 },
    { name: 'End of Study', daysFromStart: 180 }
  ];

  for (const visit of visits) {
    await query(
      `INSERT INTO subject_visits (subject_id, visit_name, scheduled_date, tenant_id)
       VALUES ($1, $2, CURRENT_TIMESTAMP + INTERVAL '${visit.daysFromStart} days', $3)`,
      [subjectId, visit.name, tenantId]
    );
  }
}

/**
 * Gets subjects, supporting filtering by study or site.
 */
export async function getSubjects(filters = {}) {
  let sql = `
    SELECT sub.*, st.name AS site_name, std.protocol_number
    FROM study_subjects sub
    JOIN study_sites st ON sub.site_id = st.id
    JOIN studies std ON sub.study_id = std.id
  `;
  const conditions = [];
  const params = [];

  if (filters.study_id) {
    params.push(filters.study_id);
    conditions.push(`sub.study_id = $${params.length}`);
  }
  if (filters.site_id) {
    params.push(filters.site_id);
    conditions.push(`sub.site_id = $${params.length}`);
  }

  if (conditions.length > 0) {
    sql += ` WHERE ${conditions.join(' AND ')}`;
  }
  sql += ` ORDER BY sub.id DESC`;

  const result = await query(sql, params);
  return result.rows;
}

/**
 * Gets visit schedule for a subject.
 */
export async function getSubjectVisits(subjectId) {
  const result = await query('SELECT * FROM subject_visits WHERE subject_id = $1 ORDER BY scheduled_date ASC', [subjectId]);
  return result.rows;
}

/**
 * Log visit completion.
 */
export async function completeVisit(visitId, actualDate, user) {
  const checkRes = await query('SELECT * FROM subject_visits WHERE id = $1', [visitId]);
  const visit = checkRes.rows[0];
  if (!visit) {
    throw new Error('Visit record not found.');
  }

  const sql = `
    UPDATE subject_visits
    SET status = 'COMPLETED', actual_date = $1
    WHERE id = $2
    RETURNING *
  `;
  const result = await query(sql, [actualDate || new Date(), visitId]);
  const updatedVisit = result.rows[0];

  if (user) {
    await logAudit(
      user.id,
      user.username,
      user.role,
      'COMPLETE_SUBJECT_VISIT',
      `subject_visits/${visitId}`,
      `Completed visit '${visit.visit_name}' on ${actualDate}`,
      user.ipAddress || '127.0.0.1'
    );
  }

  return updatedVisit;
}

/**
 * Registers a protocol deviation.
 * @param {Object} deviationData Deviation parameters
 * @param {Object} user User context
 */
export async function logProtocolDeviation(deviationData, user) {
  const { study_id, site_id, subject_id, deviation_type, description, severity, tenant_id } = deviationData;

  if (!study_id || !site_id || !deviation_type || !description || !severity) {
    throw new Error('Study ID, Site ID, Deviation Type, Description, and Severity are required.');
  }

  const sql = `
    INSERT INTO protocol_deviations (study_id, site_id, subject_id, deviation_type, description, severity, tenant_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `;
  const result = await query(sql, [study_id, site_id, subject_id || null, deviation_type, description, severity, tenant_id || 1]);
  const deviation = result.rows[0];

  if (user) {
    await logAudit(
      user.id,
      user.username,
      user.role,
      'LOG_PROTOCOL_DEVIATION',
      `protocol_deviations/${deviation.id}`,
      `Log ${severity} deviation: ${deviation_type}`,
      user.ipAddress || '127.0.0.1'
    );
  }

  return deviation;
}

/**
 * Gets deviations logs.
 */
export async function getProtocolDeviations(studyId) {
  let sql = 'SELECT * FROM protocol_deviations';
  const params = [];
  if (studyId) {
    sql += ' WHERE study_id = $1';
    params.push(studyId);
  }
  sql += ' ORDER BY id DESC';
  const result = await query(sql, params);
  return result.rows;
}
