import { query } from '../config/db.js';
import { logAudit } from '../middleware/audit.js';

/**
 * Forms Design - Registers a new eCRF layout and validation rules
 */
export async function createFormDefinition(studyId, formName, formVersion, formLayout, validationRules, tenantId = 1) {
  const sql = `
    INSERT INTO study_form_definitions (study_id, form_name, form_version, form_layout, validation_rules, tenant_id)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `;
  const res = await query(sql, [
    studyId,
    formName,
    formVersion,
    typeof formLayout === 'string' ? formLayout : JSON.stringify(formLayout),
    typeof validationRules === 'string' ? validationRules : JSON.stringify(validationRules),
    tenantId
  ]);
  return res.rows[0];
}

export async function getFormDefinitions(studyId, tenantId = 1) {
  const res = await query('SELECT * FROM study_form_definitions WHERE study_id = $1 AND tenant_id = $2', [studyId, tenantId]);
  return res.rows;
}

export async function updateFormDefinitionStatus(formId, status, tenantId = 1) {
  const res = await query(
    'UPDATE study_form_definitions SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND tenant_id = $3 RETURNING *',
    [status, formId, tenantId]
  );
  return res.rows[0];
}

/**
 * Lock Verification Helper - Evaluates locks hierarchically
 */
export async function checkLockStatus(studyId, siteId, subjectId, visitId, tenantId = 1) {
  // Query all active locks for this study context
  const sql = `
    SELECT lock_level, is_frozen, is_locked, site_id, subject_id, visit_id
    FROM study_data_locks
    WHERE study_id = $1 AND tenant_id = $2
  `;
  const res = await query(sql, [studyId, tenantId]);
  
  let isFrozen = false;
  let isLocked = false;

  for (const lock of res.rows) {
    let match = false;
    if (lock.lock_level === 'STUDY') {
      match = true;
    } else if (lock.lock_level === 'SITE' && siteId && lock.site_id === siteId) {
      match = true;
    } else if (lock.lock_level === 'SUBJECT' && subjectId && lock.subject_id === subjectId) {
      match = true;
    } else if (lock.lock_level === 'VISIT' && visitId && lock.visit_id === visitId) {
      match = true;
    }

    if (match) {
      if (lock.is_locked) isLocked = true;
      if (lock.is_frozen) isFrozen = true;
    }
  }

  return { isFrozen, isLocked };
}

/**
 * Initializes a new Form Submission
 */
export async function createFormSubmission(subjectId, formDefinitionId, visitId, enteredBy, tenantId = 1) {
  const sql = `
    INSERT INTO subject_form_submissions (subject_id, form_definition_id, visit_id, entered_by, tenant_id)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;
  const res = await query(sql, [subjectId, formDefinitionId, visitId, enteredBy, tenantId]);
  return res.rows[0];
}

/**
 * Updates Data Points inside a submission, executing reasons-for-change logs and validation rules
 */
export async function updateFormSubmission(submissionId, dataPoints, reasonForChange, user, tenantId = 1) {
  // 1. Resolve Submission Context and check locks
  const subRes = await query('SELECT sfs.*, ss.study_id, ss.site_id FROM subject_form_submissions sfs JOIN study_subjects ss ON sfs.subject_id = ss.id WHERE sfs.id = $1 AND sfs.tenant_id = $2', [submissionId, tenantId]);
  const submission = subRes.rows[0];
  if (!submission) {
    throw new Error('Submission record not found.');
  }

  const { isFrozen, isLocked } = await checkLockStatus(
    submission.study_id,
    submission.site_id,
    submission.subject_id,
    submission.visit_id,
    tenantId
  );

  if (isLocked) {
    throw new Error('403 Forbidden: Record is locked under the database locking hierarchy.');
  }
  
  const monitorRoles = ['CRA Monitor', 'Monitor', 'Head of Medical Affairs', 'Admin'];
  if (isFrozen && !monitorRoles.includes(user.role)) {
    throw new Error('403 Forbidden: Record is frozen. Site coordinators cannot edit frozen records.');
  }

  const results = [];
  
  // 2. Loop and process each field edit
  for (const dp of dataPoints) {
    const { fieldKey, fieldValue } = dp;
    
    // Check if value already exists
    const existRes = await query(
      'SELECT id, field_value FROM subject_form_data_points WHERE submission_id = $1 AND field_key = $2 AND tenant_id = $3',
      [submissionId, fieldKey, tenantId]
    );
    const existing = existRes.rows[0];
    
    let dpId;
    if (existing) {
      if (existing.field_value === fieldValue) {
        dpId = existing.id;
        results.push(existing);
        continue; // No edit
      }

      // Value modified, enforce reason for change
      if (!reasonForChange || reasonForChange.trim() === '') {
        throw new Error(`Data Change Management: Reason for change is mandatory to modify field ${fieldKey}.`);
      }

      // Update data point
      const updRes = await query(
        'UPDATE subject_form_data_points SET field_value = $1, created_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
        [fieldValue, existing.id]
      );
      dpId = existing.id;
      results.push(updRes.rows[0]);

      // Write edit history
      await query(
        `INSERT INTO subject_data_point_history (data_point_id, old_value, new_value, change_reason, user_id, tenant_id)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [dpId, existing.field_value, fieldValue, reasonForChange, user.id, tenantId]
      );
    } else {
      // New insert
      const insRes = await query(
        `INSERT INTO subject_form_data_points (submission_id, field_key, field_value, tenant_id)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [submissionId, fieldKey, fieldValue, tenantId]
      );
      dpId = insRes.rows[0].id;
      results.push(insRes.rows[0]);
    }
  }

  // 3. Load validation rules and run dynamic edit checks
  const formDefRes = await query('SELECT validation_rules FROM study_form_definitions WHERE id = $1', [submission.form_definition_id]);
  const formDef = formDefRes.rows[0];
  
  if (formDef && formDef.validation_rules) {
    const rules = typeof formDef.validation_rules === 'string' ? JSON.parse(formDef.validation_rules) : formDef.validation_rules;
    
    // Simple mock rules parser
    // rules example: [ { type: "range", field: "systolic", min: 90, max: 140, message: "Systolic out of range" } ]
    for (const rule of (rules.checks || [])) {
      const matchPoint = results.find(r => r.field_key === rule.field);
      if (matchPoint) {
        const val = parseFloat(matchPoint.field_value);
        if (!isNaN(val)) {
          if ((rule.min !== undefined && val < rule.min) || (rule.max !== undefined && val > rule.max)) {
            // Rule violated, auto-raise query
            await raiseQuery(submissionId, rule.field, rule.message, 1, tenantId); // System User ID is 1
          }
        }
      }
    }
  }

  // 4. Update submission status to COMPLETED if not under query
  const queryCheck = await query("SELECT id FROM subject_data_queries WHERE submission_id = $1 AND status = 'OPEN'", [submissionId]);
  const targetStatus = queryCheck.rows.length > 0 ? 'UNDER_QUERY' : 'COMPLETED';

  await query('UPDATE subject_form_submissions SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [targetStatus, submissionId]);

  return { submissionId, status: targetStatus, dataPoints: results };
}

export async function getFormSubmission(submissionId, tenantId = 1) {
  const subRes = await query('SELECT * FROM subject_form_submissions WHERE id = $1 AND tenant_id = $2', [submissionId, tenantId]);
  const dataRes = await query('SELECT * FROM subject_form_data_points WHERE submission_id = $1 AND tenant_id = $2', [submissionId, tenantId]);
  return {
    ...subRes.rows[0],
    dataPoints: dataRes.rows
  };
}

/**
 * Queries Workflow Manager
 */
export async function raiseQuery(submissionId, fieldKey, queryText, raisedBy, tenantId = 1) {
  // Check if open query already exists for this submission variable
  const checkRes = await query(
    "SELECT id FROM subject_data_queries WHERE submission_id = $1 AND field_key = $2 AND status = 'OPEN' AND tenant_id = $3",
    [submissionId, fieldKey, tenantId]
  );
  if (checkRes.rows.length > 0) {
    return checkRes.rows[0];
  }

  const sql = `
    INSERT INTO subject_data_queries (submission_id, field_key, query_text, status, raised_by, tenant_id)
    VALUES ($1, $2, $3, 'OPEN', $4, $5)
    RETURNING *
  `;
  const res = await query(sql, [submissionId, fieldKey, queryText, raisedBy, tenantId]);
  
  // Set submission status to UNDER_QUERY
  await query("UPDATE subject_form_submissions SET status = 'UNDER_QUERY' WHERE id = $1", [submissionId]);

  return res.rows[0];
}

export async function resolveQuery(queryId, resolutionText, resolvedBy, tenantId = 1) {
  const sql = `
    UPDATE subject_data_queries
    SET status = 'ANSWERED', resolution_text = $1, resolved_by = $2, resolved_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
    WHERE id = $3 AND tenant_id = $4
    RETURNING *
  `;
  const res = await query(sql, [resolutionText, resolvedBy, queryId, tenantId]);
  return res.rows[0];
}

export async function closeQuery(queryId, closedBy, tenantId = 1) {
  const sql = `
    UPDATE subject_data_queries
    SET status = 'CLOSED', closed_by = $1, closed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
    WHERE id = $2 AND tenant_id = $3
    RETURNING *
  `;
  const res = await query(sql, [closedBy, queryId, tenantId]);
  const queryRecord = res.rows[0];

  // If no other open queries exist for this submission, restore COMPLETED status
  const openCheck = await query("SELECT id FROM subject_data_queries WHERE submission_id = $1 AND status = 'OPEN'", [queryRecord.submission_id]);
  if (openCheck.rows.length === 0) {
    await query("UPDATE subject_form_submissions SET status = 'COMPLETED' WHERE id = $1", [queryRecord.submission_id]);
  }

  return queryRecord;
}

/**
 * Threaded query comments
 */
export async function addQueryComment(queryId, commentText, userId, userRole, tenantId = 1) {
  const sql = `
    INSERT INTO subject_query_comments (query_id, comment_text, user_id, user_role, tenant_id)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;
  const res = await query(sql, [queryId, commentText, userId, userRole, tenantId]);
  return res.rows[0];
}

export async function getQueryComments(queryId, tenantId = 1) {
  const sql = `
    SELECT qc.*, u.username
    FROM subject_query_comments qc
    JOIN users u ON qc.user_id = u.id
    WHERE qc.query_id = $1 AND qc.tenant_id = $2
    ORDER BY qc.created_at ASC
  `;
  const res = await query(sql, [queryId, tenantId]);
  return res.rows;
}

/**
 * Lock Management Workspace
 */
export async function applyDataLock(lockLevel, studyId, siteId, subjectId, visitId, isFrozen, isLocked, reason, userId, tenantId = 1) {
  const sql = `
    INSERT INTO study_data_locks (lock_level, study_id, site_id, subject_id, visit_id, is_frozen, is_locked, lock_reason, locked_by, tenant_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *
  `;
  const res = await query(sql, [
    lockLevel,
    studyId,
    siteId || null,
    subjectId || null,
    visitId || null,
    isFrozen,
    isLocked,
    reason,
    userId,
    tenantId
  ]);
  return res.rows[0];
}

export async function releaseDataLock(lockId, tenantId = 1) {
  const res = await query('DELETE FROM study_data_locks WHERE id = $1 AND tenant_id = $2 RETURNING *', [lockId, tenantId]);
  return res.rows[0];
}

export async function getLocks(studyId, tenantId = 1) {
  const res = await query('SELECT * FROM study_data_locks WHERE study_id = $1 AND tenant_id = $2', [studyId, tenantId]);
  return res.rows;
}

/**
 * Dynamic Multi-Step Review Workflow States
 */
export async function updateReviewWorkflowState(submissionId, nextStatus, user, tenantId = 1) {
  // Validate role requirements for status transitions
  // DATA_MANAGER_REVIEW, MEDICAL_REVIEW, SAFETY_REVIEW, SDV_VERIFIED, LOCKED
  const role = user.role;
  if (nextStatus === 'DATA_MANAGER_REVIEW' && !['Data Manager', 'Admin'].includes(role)) {
    throw new Error('403 Forbidden: Only Data Managers can trigger Data Management Review.');
  }
  if (nextStatus === 'MEDICAL_REVIEW' && !['Medical Monitor', 'Medical Advisor', 'Admin'].includes(role)) {
    throw new Error('403 Forbidden: Only Medical Monitors can trigger Medical Review.');
  }
  if (nextStatus === 'SAFETY_REVIEW' && !['Safety Reviewer', 'Safety Scientist', 'Admin'].includes(role)) {
    throw new Error('403 Forbidden: Only Safety Officers can trigger Safety Review.');
  }
  if (nextStatus === 'SDV_VERIFIED' && !['CRA Monitor', 'Monitor', 'Admin'].includes(role)) {
    throw new Error('403 Forbidden: Only CRAs can execute Source Data Verification sign-offs.');
  }
  if (nextStatus === 'LOCKED' && !['Sponsor Admin', 'Admin'].includes(role)) {
    throw new Error('403 Forbidden: Only Administrators can lock submission records.');
  }

  const sql = `
    UPDATE subject_form_submissions
    SET status = $1, sdv_by = CASE WHEN $1 = 'SDV_VERIFIED' THEN $2 ELSE sdv_by END,
                     sdv_at = CASE WHEN $1 = 'SDV_VERIFIED' THEN CURRENT_TIMESTAMP ELSE sdv_at END,
                     locked_by = CASE WHEN $1 = 'LOCKED' THEN $2 ELSE locked_by END,
                     locked_at = CASE WHEN $1 = 'LOCKED' THEN CURRENT_TIMESTAMP ELSE locked_at END,
                     updated_at = CURRENT_TIMESTAMP
    WHERE id = $3 AND tenant_id = $4
    RETURNING *
  `;
  const res = await query(sql, [nextStatus, user.id, submissionId, tenantId]);
  const updated = res.rows[0];
  
  if (!updated) {
    throw new Error('Form submission not found or access denied.');
  }

  await logAudit(
    user.id,
    user.username,
    user.role,
    'WORKFLOW_STATUS_TRANSITION',
    `submissions/${submissionId}`,
    `Transitioned form submission ${submissionId} status state to ${nextStatus}`,
    tenantId
  );

  return updated;
}

export async function getSubmissionHistory(dataPointId, tenantId = 1) {
  const sql = `
    SELECT h.*, u.username
    FROM subject_data_point_history h
    LEFT JOIN users u ON h.user_id = u.id
    WHERE h.data_point_id = $1 AND h.tenant_id = $2
    ORDER BY h.created_at DESC
  `;
  const res = await query(sql, [dataPointId, tenantId]);
  return res.rows;
}
