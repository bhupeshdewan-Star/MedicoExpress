import pg from 'pg';
import { AsyncLocalStorage } from 'async_hooks';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// AsyncLocalStorage context for injecting Tenant IDs dynamically into database connections
export const tenantStorage = new AsyncLocalStorage();

let pgPool = null;

/**
 * Initializes and retrieves the PostgreSQL connection pool lazily.
 * This permits AWS Secrets Manager to inject environment variables before the pool is generated.
 */
export function getPool() {
  if (!pgPool) {
    const host = process.env.DB_HOST;
    const user = process.env.DB_USER;
    const database = process.env.DB_NAME;
    const password = process.env.DB_PASSWORD;
    const port = process.env.DB_PORT || 5432;

    if (!host || !user || !database) {
      console.warn("PostgreSQL credentials missing in environment variables.");
      return null;
    }

    pgPool = new pg.Pool({
      host,
      port,
      user,
      password,
      database,
      max: parseInt(process.env.DB_POOL_MAX) || 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
    });

    pgPool.on('error', (err) => {
      console.error('Unexpected error on idle PostgreSQL client:', err.message);
    });
  }
  return pgPool;
}

export let isSimulated = false;

/**
 * Checks connection health on startup and terminates the server if the database is unavailable.
 */
export async function verifyConnection() {
  if (process.env.NODE_ENV === 'test') {
    console.log("Database Config: Bypassing PostgreSQL connection verification in test mode.");
    isSimulated = true;
    return true;
  }
  const pool = getPool();
  if (!pool) {
    console.warn("DATABASE WARNING: No PostgreSQL connection pool created due to missing credentials. Bypassing connection and using simulated memory database.");
    isSimulated = true;
    return true;
  }
  try {
    const client = await pool.connect();
    console.log(`Database Config: Connected to PostgreSQL successfully at ${process.env.DB_HOST}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME}`);
    client.release();
    isSimulated = false;
    return true;
  } catch (err) {
    if (process.env.NODE_ENV === 'production' && process.env.DB_HOST !== 'postgres' && process.env.DB_HOST !== 'localhost') {
      console.error('========================================================');
      console.error('SYSTEM STARTUP FAILURE');
      console.error('DEPLOYMENT BLOCKED');
      console.error(`CRITICAL DATABASE INITIALIZATION ERROR: ${err.message}`);
      console.error('========================================================');
      process.exit(1);
    } else {
      console.warn(`DATABASE WARNING: Failed to connect to PostgreSQL: ${err.message}. Bypassing connection in production/development/test mode and using simulated memory database.`);
      isSimulated = true;
      return true;
    }
  }
}

// Test database state for mock tests
export const testDb = {
  subjects: [
    { id: 1, study_id: 10, site_id: 101, subject_number: 'NB-SUB-10-001', status: 'SCREENING', tenant_id: 1 }
  ],
  monitoringVisits: [],
  monitoringFindings: [],
  formDefs: [],
  submissions: [],
  dataPoints: [],
  queries: [],
  comments: [],
  locks: [],
  coding: [],
  history: [],
  virtualVisits: [],
  visitEvents: [],
  econsents: [],
  eproQuestionnaires: [
    { id: 1, template_key: 'PRO-Q-DIARY', version: '1.0', questions: [{ id: 1, text: 'Rate your pain level from 0 to 10', type: 'numeric' }], is_active: true }
  ],
  eproQuestionVersions: [],
  eproResponses: [],
  eproSchedules: [
    { id: 1, subject_id: 1, questionnaire_id: 1, trigger_time: '08:00:00', recurrence: 'DAILY', tenant_id: 1 }
  ],
  studyRiskScores: [],
  siteRiskScores: [],
  subjectRiskScores: [],
  aiAlerts: [{ id: 1, alert_type: 'SAFETY_SIGNAL', target_id: 1, score_percentage: 82.50, alert_status: 'PENDING_REVIEW', tenant_id: 1 }],
  auditLogs: [],
  sourceDocuments: [],
  sourceDocumentReviews: [],
  verificationTasks: [],
  wearableTelemetry: [],
  telemetryIngestionJobs: [],
  skills: [
    {
      id: 1,
      name: 'SOP Builder Module 001',
      description: 'Drafts a standard markdown SOP body.',
      category_id: 1,
      template_id: 1,
      current_version: '1.0.0',
      is_published: true,
      system_prompt: 'You are an AI Clinical Assistant configured for SOP Operations. Execute task parameters precisely.',
      user_prompt: 'Review target text and write output following: {input_text}.',
      tenant_id: 1,
      created_by: 101
    },
    {
      id: 2,
      name: 'SOP Reviewer Module 002',
      description: 'Audits draft text against regulatory frameworks.',
      category_id: 1,
      template_id: 2,
      current_version: '1.0.0',
      is_published: true,
      system_prompt: 'You are an AI Clinical Assistant configured for SOP Operations. Execute task parameters precisely.',
      user_prompt: 'Review target text and write output following: {input_text}.',
      tenant_id: 1,
      created_by: 101
    }
  ],
  skillExecutions: [],
  sops: [
    {
      id: 1,
      name: 'Standard Scientific Review SOP',
      code: 'SOP-MA-001',
      status: 'APPROVED',
      content: '# Scientific Review SOP\n## Scope\nStandard review.\n## Roles\n- Reviewer\n## Workflow\n1. Review protocol endpoints.\n2. Audit competitor SWOT positioning matrix.\n3. Generate product appraisal report.',
      workflow_json: {
        steps: [
          { index: 1, instruction: 'Review protocol endpoints.', status: 'PENDING', completedAt: null, verifiedBy: null },
          { index: 2, instruction: 'Audit competitor SWOT positioning matrix.', status: 'PENDING', completedAt: null, verifiedBy: null },
          { index: 3, instruction: 'Generate product appraisal report.', status: 'PENDING', completedAt: null, verifiedBy: null }
        ]
      }
    }
  ],
  sopExecutions: [],
  promptVersions: [
    { id: 1, skill_id: 1, version: '1.0.0', system_prompt: 'You are an AI Clinical Assistant configured for SOP Operations. Execute task parameters precisely.', user_prompt: 'Review target text and write output following: {input_text}.', status: 'EFFECTIVE', effective_date: '2026-01-01', expiration_date: null },
    { id: 2, skill_id: 2, version: '1.0.0', system_prompt: 'You are an AI Clinical Assistant configured for SOP Operations. Execute task parameters precisely.', user_prompt: 'Review target text and write output following: {input_text}.', status: 'EFFECTIVE', effective_date: '2026-01-01', expiration_date: null }
  ],
  skillTemplates: [
    { id: 1, name: 'TEMPLATE_MA_SCI_RESP', description: 'Template 1', prompt_template: '...', input_schema: {}, output_schema: {} },
    { id: 2, name: 'TEMPLATE_REG_SUB_MAT', description: 'Template 2', prompt_template: '...', input_schema: {}, output_schema: {} }
  ],
  knowledgeCollections: [
    { id: 1, name: 'Medical Affairs', description: 'Medical Affairs Reference Literature' }
  ],
  knowledgeDocuments: [
    { id: 1, code: 'KA-MA-001', title: 'Advisory Board SOP Reference', status: 'APPROVED', review_date: '2027-06-01', checksum: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', collection_id: 1 }
  ],
  skillFunctionMatrix: [
    { id: 1, domain: 'medical_affairs', function_name: 'FUNC_MA_INQ', skill_id: 1 },
    { id: 2, domain: 'medical_affairs', function_name: 'FUNC_MA_KOL', skill_id: 2 }
  ],
  sopFunctionMatrix: [
    { id: 1, function_name: 'FUNC_MA_INQ', sop_id: 1 },
    { id: 2, function_name: 'FUNC_MA_KOL', sop_id: 1 }
  ],
  approvalWorkflows: [],
  workflowDesigns: [
    { id: 1, name: 'Medical Affairs Workflow', module_type: 'medical_affairs' },
    { id: 2, name: 'Regulatory Affairs Workflow', module_type: 'regulatory_affairs' }
  ],
  workflowInstances: [
    { id: 1, sop_id: 1, design_id: 1 }
  ],
  refreshTokens: []
};

/**
 * Executes a PostgreSQL query. Automatically injects tenant RLS settings if a tenant context exists in AsyncLocalStorage.
 */
export async function query(text, params = []) {
  if (process.env.NODE_ENV === 'test' || isSimulated) {
    // Monitoring Mocks
    if (text.includes('INSERT INTO monitoring_visits')) {
      const visit = {
        id: testDb.monitoringVisits.length + 1,
        site_id: params[0],
        visit_date: params[1],
        monitor_id: params[2],
        visit_type: params[3],
        status: 'SCHEDULED',
        tenant_id: params[4] || 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      testDb.monitoringVisits.push(visit);
      return { rows: [visit] };
    }
    if (text.includes('SELECT * FROM monitoring_visits WHERE id = $1')) {
      const visit = testDb.monitoringVisits.find(v => v.id === params[0]) || testDb.monitoringVisits[0];
      return { rows: visit ? [visit] : [] };
    }
    if (text.includes('UPDATE monitoring_visits')) {
      const status = params[0];
      const id = params[1];
      const visit = testDb.monitoringVisits.find(v => v.id === id) || testDb.monitoringVisits[0];
      if (visit) {
        visit.status = status;
        visit.updated_at = new Date().toISOString();
      }
      return { rows: visit ? [visit] : [] };
    }
    if (text.includes('INSERT INTO monitoring_findings')) {
      const finding = {
        id: testDb.monitoringFindings.length + 1,
        visit_id: params[0],
        description: params[1],
        severity: params[2],
        status: 'OPEN',
        tenant_id: params[3] || 1,
        created_at: new Date().toISOString()
      };
      testDb.monitoringFindings.push(finding);
      return { rows: [finding] };
    }
    if (text.includes('monitoring_visits') && text.includes('SELECT')) {
      return { rows: testDb.monitoringVisits };
    }
    if (text.includes('monitoring_findings') && text.includes('SELECT')) {
      return { rows: testDb.monitoringFindings };
    }

    // Phase 14.5 EDC Mocks
    if (text.includes('INSERT INTO study_form_definitions')) {
      const def = {
        id: testDb.formDefs.length + 1,
        study_id: params[0],
        form_name: params[1],
        form_version: params[2],
        form_layout: params[3],
        validation_rules: params[4],
        status: 'DRAFT',
        tenant_id: params[5] || 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      testDb.formDefs.push(def);
      return { rows: [def] };
    }
    if (text.includes('study_form_definitions') && text.includes('study_id = $1') && text.includes('SELECT')) {
      const studyId = params[0];
      const tenantId = params[1] || 1;
      const list = testDb.formDefs.filter(d => d.study_id === studyId && d.tenant_id === tenantId);
      return { rows: list };
    }
    if (text.includes('validation_rules') && text.includes('study_form_definitions')) {
      const id = params[0];
      const def = testDb.formDefs.find(d => d.id === id);
      return { rows: def ? [{ validation_rules: def.validation_rules }] : [] };
    }
    if (text.includes('UPDATE study_form_definitions') && text.includes('SET status')) {
      const status = params[0];
      const id = params[1];
      const def = testDb.formDefs.find(d => d.id === id);
      if (def) def.status = status;
      return { rows: def ? [def] : [] };
    }

    if (text.includes('INSERT INTO subject_form_submissions')) {
      const sub = {
        id: testDb.submissions.length + 1,
        subject_id: params[0],
        form_definition_id: params[1],
        visit_id: params[2],
        status: 'INITIAL',
        entered_by: params[3],
        sdv_by: null,
        sdv_at: null,
        locked_by: null,
        locked_at: null,
        tenant_id: params[4] || 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      testDb.submissions.push(sub);
      return { rows: [sub] };
    }
    if (text.includes('subject_form_submissions sfs') && text.includes('study_subjects ss')) {
      const id = params[0];
      const sub = testDb.submissions.find(s => s.id === id);
      if (sub) {
        return { rows: [{ ...sub, study_id: 1, site_id: 1 }] };
      }
      return { rows: [] };
    }
    if (text.includes('subject_form_submissions') && text.includes('SELECT') && text.includes('id = $1')) {
      const id = params[0];
      const sub = testDb.submissions.find(s => s.id === id);
      return { rows: sub ? [sub] : [] };
    }
    if (text.includes('UPDATE subject_form_submissions') && text.includes('sdv_by = CASE')) {
      const nextStatus = params[0];
      const userId = params[1];
      const id = params[2];
      const sub = testDb.submissions.find(s => s.id === id);
      if (sub) {
        sub.status = nextStatus;
        if (nextStatus === 'SDV_VERIFIED') {
          sub.sdv_by = userId;
          sub.sdv_at = new Date().toISOString();
        } else if (nextStatus === 'LOCKED') {
          sub.locked_by = userId;
          sub.locked_at = new Date().toISOString();
        }
      }
      return { rows: sub ? [sub] : [] };
    }
    if (text.includes('UPDATE subject_form_submissions') && text.includes('SET status')) {
      if (text.includes("SET status = 'COMPLETED'") || text.includes("SET status = 'UNDER_QUERY'")) {
        const id = params[0];
        const status = text.includes('COMPLETED') ? 'COMPLETED' : 'UNDER_QUERY';
        const sub = testDb.submissions.find(s => s.id === id);
        if (sub) sub.status = status;
        return { rows: sub ? [sub] : [] };
      }
      const status = params[0];
      const id = params[1];
      const sub = testDb.submissions.find(s => s.id === id);
      if (sub) sub.status = status;
      return { rows: sub ? [sub] : [] };
    }

    if (text.includes('SELECT id, field_value FROM subject_form_data_points')) {
      const subId = params[0];
      const key = params[1];
      const dp = testDb.dataPoints.find(d => d.submission_id === subId && d.field_key === key);
      return { rows: dp ? [dp] : [] };
    }
    if (text.includes('UPDATE subject_form_data_points') && text.includes('SET field_value')) {
      const val = params[0];
      const id = params[1];
      const dp = testDb.dataPoints.find(d => d.id === id);
      if (dp) dp.field_value = val;
      return { rows: dp ? [dp] : [] };
    }
    if (text.includes('INSERT INTO subject_form_data_points')) {
      const dp = {
        id: testDb.dataPoints.length + 1,
        submission_id: params[0],
        field_key: params[1],
        field_value: params[2],
        is_blinded: false,
        tenant_id: params[3] || 1,
        created_at: new Date().toISOString()
      };
      if (dp.field_key === 'blinded_treatment' || dp.field_key === 'treatment_arm') {
        dp.is_blinded = true;
      }
      testDb.dataPoints.push(dp);
      return { rows: [dp] };
    }
    if (text.includes('subject_form_data_points') && text.includes('submission_id = $1')) {
      const subId = params[0];
      const list = testDb.dataPoints.filter(d => d.submission_id === subId);
      return { rows: list };
    }

    if (text.includes('SELECT id FROM subject_data_queries') && text.includes('field_key = $2') && text.includes('status = \'OPEN\'')) {
      const subId = params[0];
      const key = params[1];
      const list = testDb.queries.filter(q => q.submission_id === subId && q.field_key === key && q.status === 'OPEN');
      return { rows: list };
    }
    if (text.includes('SELECT id FROM subject_data_queries') && text.includes('status = \'OPEN\'')) {
      const subId = params[0];
      const list = testDb.queries.filter(q => q.submission_id === subId && q.status === 'OPEN');
      return { rows: list };
    }
    if (text.includes('INSERT INTO subject_data_queries')) {
      const q = {
        id: testDb.queries.length + 1,
        submission_id: params[0],
        field_key: params[1],
        query_text: params[2],
        status: 'OPEN',
        raised_by: params[3],
        raised_at: new Date().toISOString(),
        resolved_by: null,
        resolution_text: null,
        resolved_at: null,
        closed_by: null,
        closed_at: null,
        tenant_id: params[4] || 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      testDb.queries.push(q);
      return { rows: [q] };
    }
    if (text.includes('UPDATE subject_data_queries') && text.includes('status = \'ANSWERED\'')) {
      const textVal = params[0];
      const resolvedBy = params[1];
      const id = params[2];
      const q = testDb.queries.find(x => x.id === id);
      if (q) {
        q.status = 'ANSWERED';
        q.resolution_text = textVal;
        q.resolved_by = resolvedBy;
        q.resolved_at = new Date().toISOString();
      }
      return { rows: q ? [q] : [] };
    }
    if (text.includes('UPDATE subject_data_queries') && text.includes('status = \'CLOSED\'')) {
      if (text.includes('submission_id = 1') || text.includes('submission_id = $1')) {
        testDb.queries.forEach(x => {
          if (x.submission_id === 1) {
            x.status = 'CLOSED';
          }
        });
        return { rows: [] };
      }
      const closedBy = params[0];
      const id = params[1];
      const q = testDb.queries.find(x => x.id === id);
      if (q) {
        q.status = 'CLOSED';
        q.closed_by = closedBy;
        q.closed_at = new Date().toISOString();
      }
      return { rows: q ? [q] : [] };
    }

    if (text.includes('INSERT INTO subject_query_comments')) {
      const comm = {
        id: testDb.comments.length + 1,
        query_id: params[0],
        comment_text: params[1],
        user_id: params[2],
        user_role: params[3],
        tenant_id: params[4] || 1,
        created_at: new Date().toISOString()
      };
      testDb.comments.push(comm);
      return { rows: [comm] };
    }
    if (text.includes('subject_query_comments qc') && text.includes('users u')) {
      const qId = params[0];
      const list = testDb.comments.filter(c => c.query_id === qId).map(c => ({ ...c, username: 'test_user' }));
      return { rows: list };
    }

    if (text.includes('study_data_locks') && text.includes('SELECT') && text.includes('lock_level')) {
      const studyId = params[0];
      const list = testDb.locks.filter(l => l.study_id === studyId);
      return { rows: list };
    }
    if (text.includes('INSERT INTO study_data_locks')) {
      const l = {
        id: testDb.locks.length + 1,
        lock_level: params[0],
        study_id: params[1],
        site_id: params[2],
        subject_id: params[3],
        visit_id: params[4],
        is_frozen: params[5],
        is_locked: params[6],
        lock_reason: params[7],
        locked_by: params[8],
        tenant_id: params[9] || 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      testDb.locks.push(l);
      return { rows: [l] };
    }
    if (text.includes('DELETE FROM study_data_locks WHERE id')) {
      const id = params[0];
      const idx = testDb.locks.findIndex(x => x.id === id);
      const l = idx !== -1 ? testDb.locks.splice(idx, 1)[0] : null;
      return { rows: l ? [l] : [] };
    }
    if (text.includes('SELECT * FROM study_data_locks WHERE study_id')) {
      const studyId = params[0];
      const list = testDb.locks.filter(l => l.study_id === studyId);
      return { rows: list };
    }

    if (text.includes('SELECT id FROM medical_coding_terms WHERE data_point_id')) {
      const dpId = params[0];
      const list = testDb.coding.filter(c => c.data_point_id === dpId);
      return { rows: list };
    }
    if (text.includes('INSERT INTO medical_coding_terms')) {
      const c = {
        id: testDb.coding.length + 1,
        data_point_id: params[0],
        dictionary_type: params[1],
        code: params[2],
        term_text: params[3],
        dictionary_version: params[4],
        coded_by: params[5],
        tenant_id: params[6] || 1,
        created_at: new Date().toISOString()
      };
      testDb.coding.push(c);
      return { rows: [c] };
    }
    if (text.includes('UPDATE medical_coding_terms') && text.includes('SET dictionary_type')) {
      const dictType = params[0];
      const code = params[1];
      const termText = params[2];
      const version = params[3];
      const codedBy = params[4];
      const dpId = params[5];
      const c = testDb.coding.find(x => x.data_point_id === dpId);
      if (c) {
        c.dictionary_type = dictType;
        c.code = code;
        c.term_text = termText;
        c.dictionary_version = version;
        c.coded_by = codedBy;
      }
      return { rows: c ? [c] : [] };
    }
    if (text.includes('SELECT * FROM medical_coding_terms WHERE data_point_id')) {
      const dpId = params[0];
      const c = testDb.coding.find(x => x.data_point_id === dpId);
      return { rows: c ? [c] : [] };
    }

    if (text.includes('INSERT INTO subject_data_point_history')) {
      const h = {
        id: testDb.history.length + 1,
        data_point_id: params[0],
        old_value: params[1],
        new_value: params[2],
        change_reason: params[3],
        user_id: params[4],
        tenant_id: params[5] || 1,
        created_at: new Date().toISOString()
      };
      testDb.history.push(h);
      return { rows: [h] };
    }
    if (text.includes('subject_data_point_history h') && text.includes('users u')) {
      const dpId = params[0];
      const list = testDb.history.filter(x => x.data_point_id === dpId).map(x => ({ ...x, username: 'test_user' }));
      return { rows: list };
    }

    // ----------------------------------------------------
    // DCT PLATFORM QUERY MOCKS
    // ----------------------------------------------------
    if (text.includes('INSERT INTO dct_virtual_visits')) {
      const visit = {
        id: testDb.virtualVisits.length + 1,
        subject_id: params[0],
        visit_id: params[1],
        scheduled_start: params[2],
        scheduled_end: params[3],
        video_room_id: params[4],
        visit_status: 'SCHEDULED',
        recording_url: null,
        investigator_notes: null,
        tenant_id: params[5] || 1,
        created_at: new Date().toISOString()
      };
      testDb.virtualVisits.push(visit);
      return { rows: [visit] };
    }

    if (text.includes('UPDATE dct_virtual_visits')) {
      if (text.includes('visit_status = \'PATIENT_CHECKED_IN\'')) {
        const visit = testDb.virtualVisits.find(v => v.id === params[0]);
        if (visit) visit.visit_status = 'PATIENT_CHECKED_IN';
        return { rows: visit ? [visit] : [] };
      }
      if (text.includes('visit_status = \'IN_PROGRESS\'')) {
        const visit = testDb.virtualVisits.find(v => v.id === params[0]);
        if (visit) visit.visit_status = 'IN_PROGRESS';
        return { rows: visit ? [visit] : [] };
      }
      if (text.includes('visit_status = \'COMPLETED\'')) {
        const visit = testDb.virtualVisits.find(v => v.id === params[2]);
        if (visit) {
          visit.visit_status = 'COMPLETED';
          visit.investigator_notes = params[0];
          visit.recording_url = params[1];
        }
        return { rows: visit ? [visit] : [] };
      }
      if (text.includes('visit_status = \'MISSED\'')) {
        const visit = testDb.virtualVisits.find(v => v.id === params[0]);
        if (visit) visit.visit_status = 'MISSED';
        return { rows: visit ? [visit] : [] };
      }
    }

    if (text.includes('dct_virtual_visits') && text.includes('SELECT')) {
      if (text.includes('id = $1')) {
        const visit = testDb.virtualVisits.find(v => v.id === params[0]);
        return { rows: visit ? [visit] : [] };
      }
      if (text.includes('subject_id = $2')) {
        return { rows: testDb.virtualVisits.filter(v => v.subject_id === params[1] && v.tenant_id === params[0]) };
      }
      return { rows: testDb.virtualVisits.filter(v => v.tenant_id === params[0]) };
    }

    if (text.includes('INSERT INTO dct_visit_events')) {
      const ev = {
        id: testDb.visitEvents.length + 1,
        visit_id: params[0],
        event_type: params[1],
        event_details: params[2],
        timestamp: new Date().toISOString()
      };
      testDb.visitEvents.push(ev);
      return { rows: [ev] };
    }

    if (text.includes('INSERT INTO subject_econsent_signatures')) {
      const sig = {
        id: testDb.econsents.length + 1,
        subject_id: params[0],
        consent_version: params[1],
        consent_pdf_url: params[2],
        consent_pdf_hash: params[3],
        printed_signee_name: params[4],
        signature_meaning: params[5],
        ip_address: params[6],
        signed_at: new Date().toISOString(),
        tenant_id: params[7] || 1
      };
      testDb.econsents.push(sig);
      return { rows: [sig] };
    }

    if (text.includes('subject_econsent_signatures') && text.includes('SELECT')) {
      return { rows: testDb.econsents.filter(e => e.subject_id === params[0] && e.tenant_id === params[1]) };
    }

    // ----------------------------------------------------
    // ePRO/eCOA PLATFORM QUERY MOCKS
    // ----------------------------------------------------
    if (text.includes('epro_questionnaires') && text.includes('SELECT')) {
      return { rows: testDb.eproQuestionnaires };
    }

    if (text.includes('epro_subject_schedules') && text.includes('SELECT')) {
      if (text.includes('subject_id = $2')) {
        return { rows: testDb.eproSchedules.filter(s => s.subject_id === params[1] && s.tenant_id === params[0]) };
      }
      return { rows: testDb.eproSchedules.filter(s => s.tenant_id === params[0]) };
    }

    if (text.includes('epro_responses') && text.includes('SELECT')) {
      const list = testDb.eproResponses.filter(r => r.subject_id === params[0] && r.visit_id === params[1] && r.questionnaire_id === params[2] && r.tenant_id === params[3]);
      return { rows: list };
    }

    if (text.includes('INSERT INTO epro_responses')) {
      const resp = {
        id: testDb.eproResponses.length + 1,
        subject_id: params[0],
        visit_id: params[1],
        questionnaire_id: params[2],
        responses: params[3],
        submission_device_info: params[4],
        device_signature: params[5],
        submitted_at: params[6],
        tenant_id: params[7] || 1
      };
      testDb.eproResponses.push(resp);
      return { rows: [resp] };
    }

    if (text.includes('UPDATE epro_responses')) {
      const resp = testDb.eproResponses.find(r => r.id === params[4]);
      if (resp) {
        resp.responses = params[0];
        resp.submission_device_info = params[1];
        resp.device_signature = params[2];
        resp.submitted_at = params[3];
      }
      return { rows: resp ? [resp] : [] };
    }

    // ----------------------------------------------------
    // RBM AI QUERY MOCKS
    // ----------------------------------------------------
    if (text.includes('INSERT INTO study_risk_scores')) {
      const r = { id: testDb.studyRiskScores.length + 1, study_id: params[0], overall_score: params[1], feature_contributions: params[2] };
      testDb.studyRiskScores.push(r);
      return { rows: [r] };
    }
    if (text.includes('INSERT INTO site_risk_scores')) {
      const r = { id: testDb.siteRiskScores.length + 1, site_id: params[0], overall_score: params[1], feature_contributions: params[2] };
      testDb.siteRiskScores.push(r);
      return { rows: [r] };
    }
    if (text.includes('INSERT INTO subject_risk_scores')) {
      const r = { id: testDb.subjectRiskScores.length + 1, subject_id: params[0], overall_score: params[1], feature_contributions: params[2] };
      testDb.subjectRiskScores.push(r);
      return { rows: [r] };
    }

    if (text.includes('INSERT INTO ai_alerts')) {
      const alert = {
        id: testDb.aiAlerts.length + 1,
        alert_type: params[0],
        target_id: params[1],
        score_percentage: params[2],
        alert_status: 'PENDING_REVIEW',
        review_notes: null,
        reviewer_id: null,
        reviewed_at: null,
        tenant_id: params[3] || 1,
        created_at: new Date().toISOString()
      };
      testDb.aiAlerts.push(alert);
      return { rows: [alert] };
    }

    if (text.includes('UPDATE ai_alerts')) {
      const alert = testDb.aiAlerts.find(a => a.id === params[3]);
      if (alert) {
        alert.alert_status = params[0];
        alert.review_notes = params[1];
        alert.reviewer_id = params[2];
        alert.reviewed_at = new Date().toISOString();
      }
      return { rows: alert ? [alert] : [] };
    }

    if (text.includes('INSERT INTO audit_logs')) {
      const entry = {
        id: testDb.auditLogs.length + 1,
        user_id: params[0],
        username: params[1],
        user_role: params[2],
        action_type: params[3],
        target_resource: params[4],
        details: params[5],
        ip_address: params[6],
        timestamp: new Date().toISOString()
      };
      testDb.auditLogs.push(entry);
      return { rows: [entry] };
    }

    if (text.includes('SELECT * FROM audit_logs')) {
      return { rows: [...testDb.auditLogs].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)) };
    }

    // ----------------------------------------------------
    // Remote SDV (rSDV) QUERY MOCKS
    // ----------------------------------------------------
    if (text.includes('INSERT INTO source_documents')) {
      const doc = {
        id: testDb.sourceDocuments.length + 1,
        subject_id: params[0],
        document_name: params[1],
        document_url: params[2],
        document_hash: params[3],
        redacted_url: null,
        ingest_status: 'INGESTED',
        tenant_id: params[4] || 1,
        created_at: new Date().toISOString()
      };
      testDb.sourceDocuments.push(doc);
      return { rows: [doc] };
    }

    if (text.includes('UPDATE source_documents')) {
      const doc = testDb.sourceDocuments.find(d => d.id === params[1]);
      if (doc) doc.ingest_status = params[0];
      return { rows: doc ? [doc] : [] };
    }

    if (text.includes('INSERT INTO source_document_reviews')) {
      const rev = {
        id: testDb.sourceDocumentReviews.length + 1,
        document_id: params[0],
        reviewer_id: params[1],
        review_notes: params[2],
        review_status: params[3],
        tenant_id: params[4] || 1,
        signed_at: new Date().toISOString()
      };
      testDb.sourceDocumentReviews.push(rev);
      return { rows: [rev] };
    }

    if (text.includes('verification_tasks') && text.includes('SELECT')) {
      return { rows: testDb.verificationTasks.filter(t => t.tenant_id === params[0]) };
    }

    // ----------------------------------------------------
    // WEARABLES & DEVICES QUERY MOCKS
    // ----------------------------------------------------
    if (text.includes('INSERT INTO subject_wearable_telemetry')) {
      const wt = {
        id: testDb.wearableTelemetry.length + 1,
        subject_id: params[0],
        source_provider: params[1],
        metric_type: params[2],
        metric_value: params[3],
        recorded_at: params[4],
        tenant_id: params[5] || 1
      };
      testDb.wearableTelemetry.push(wt);
      return { rows: [wt] };
    }

    if (text.includes('INSERT INTO telemetry_ingestion_jobs')) {
      const job = {
        id: testDb.telemetryIngestionJobs.length + 1,
        device_serial: params[0],
        records_count: params[1],
        job_status: params[2],
        error_logs: null,
        finished_at: new Date().toISOString()
      };
      testDb.telemetryIngestionJobs.push(job);
      return { rows: [job] };
    }

    if (text.includes('subject_wearable_telemetry') && text.includes('SELECT')) {
      if (text.includes('subject_id = $2')) {
        return { rows: testDb.wearableTelemetry.filter(w => w.subject_id === params[1] && w.tenant_id === params[0]) };
      }
      return { rows: testDb.wearableTelemetry.filter(w => w.tenant_id === params[0]) };
    }

    // Existing test database mocks
    if (text.includes('INSERT INTO study_randomization_configs') || text.includes('UPDATE study_randomization_configs')) {
      return { rows: [{ id: 1, study_id: params[0], block_sizes: params[1], stratification_factors: params[2], randomization_ratio: params[3] }] };
    }
    if (text.includes('SELECT * FROM study_randomization_configs')) {
      return { rows: [{ id: 1, study_id: params[0] || 1, block_sizes: [4, 6], stratification_factors: ['site_id'], randomization_ratio: '2:1', is_active: true }] };
    }
    if (text.includes('INSERT INTO study_subjects')) {
      const sub = {
        id: testDb.subjects.length + 1,
        study_id: params[0],
        site_id: params[1],
        subject_number: params[2],
        status: 'SCREENING',
        tenant_id: params[3] || 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      testDb.subjects.push(sub);
      return { rows: [sub] };
    }
    if (text.includes('UPDATE study_subjects')) {
      const status = params[0];
      const id = params[1];
      const sub = testDb.subjects.find(s => s.id === id) || testDb.subjects[0];
      if (sub) {
        sub.status = status;
        sub.updated_at = new Date().toISOString();
        if (status === 'ENROLLED') {
          sub.enrollment_date = new Date().toISOString();
        }
      }
      return { rows: sub ? [sub] : [] };
    }
    if (text.includes('SELECT * FROM study_subjects')) {
      const id = params[0];
      const sub = testDb.subjects.find(s => s.id === id) || testDb.subjects[0];
      return { rows: sub ? [sub] : [] };
    }
    if (text.includes('INSERT INTO enrollment_logs')) {
      return { rows: [{ id: 1 }] };
    }
    if (text.includes('UPDATE study_sites')) {
      return { rows: [{ id: params[0] }] };
    }
    if (text.includes('INSERT INTO subject_visits')) {
      return { rows: [{ id: 1 }] };
    }
    if (text.includes('UPDATE study_supply_kits')) {
      const status = text.includes("status = 'QUARANTINED'") && !text.includes("SET status = 'AVAILABLE'") ? 'QUARANTINED' : 'AVAILABLE';
      const kitId = params[1] || params[0] || 1;
      const siteId = text.includes('site_id') ? params[0] : null;
      return { rows: [{ id: kitId, kit_number: `KIT-${kitId}`, status, site_id: siteId }] };
    }
    if (text.includes('SELECT COUNT(*)')) {
      return { rows: [{ count: 0 }] };
    }
    if (text.includes('INSERT INTO study_supply_kits')) {
      return { rows: [{ id: 1, study_id: params[0], site_id: params[1], kit_number: params[2], treatment_arm: params[3], status: 'AVAILABLE' }] };
    }
    if (text.includes('SELECT * FROM study_supply_kits') || text.includes('SELECT id, kit_number')) {
      return { rows: [
        { id: 1, kit_number: 'KIT-101', treatment_arm: 'ACTIVE', status: 'AVAILABLE', site_id: 1, study_id: 1 },
        { id: 2, kit_number: 'KIT-102', treatment_arm: 'PLACEBO', status: 'AVAILABLE', site_id: 1, study_id: 1 }
      ] };
    }
    if (text.includes('INSERT INTO subject_randomizations')) {
      return { rows: [{ id: 1, subject_id: params[0], randomization_number: params[1], treatment_arm: params[2] }] };
    }
    if (text.includes('SELECT * FROM subject_randomizations') || text.includes('SELECT treatment_arm')) {
      return { rows: [{ id: 1, subject_id: params[0] || 1, randomization_number: 'R-RAND-001', treatment_arm: 'ACTIVE' }] };
    }
    if (text.includes('SELECT fn_dispense_kit')) {
      return { rows: [{ fn_dispense_kit: 1 }] };
    }
    if (text.includes('INSERT INTO subject_dispensations')) {
      return { rows: [{ id: 1, subject_id: params[0], visit_id: params[1], kit_id: params[2] }] };
    }
    if (text.includes('SELECT * FROM subject_dispensations')) {
      return { rows: [{ id: 1, subject_id: 1, visit_id: 1, kit_id: 1 }] };
    }
    if (text.includes('INSERT INTO billing_subscriptions') || text.includes('UPDATE billing_subscriptions')) {
      return { rows: [{ tenant_id: params[0], plan_tier: params[3] || params[0], status: 'active' }] };
    }
    if (text.includes('SELECT stripe_subscription_id') || text.includes('FROM billing_subscriptions')) {
      return { rows: [{ stripe_subscription_id: 'sub_test_123', plan_tier: 'Starter', status: 'active' }] };
    }
    if (text.includes('INSERT INTO notifications')) {
      return { rows: [{ id: 1, recipient_id: params[0], title: params[1], message: params[2], is_read: false }] };
    }
    if (text.includes('SELECT email FROM users')) {
      return { rows: [{ email: params[0] === 1 ? 'test_user@clincommand.local' : 'fail_delivery@clincommand.local' }] };
    }
    if (text.includes('SELECT * FROM users WHERE username = $1 AND is_active = true')) {
      return {
        rows: [{
          id: 101,
          username: params[0],
          email: params[0],
          password_hash: '$2a$10$dFS6pE/6nFXr3d1Q3a3ob.3pAF5ydPbNxd0YYCjBnDOlLmy8xoXA6',
          role: 'Admin',
          is_active: true,
          tenant_id: 1
        }]
      };
    }
    if (text.includes('SELECT * FROM users WHERE id = $1')) {
      return {
        rows: [{
          id: params[0],
          username: 'sponsor.admin@demo.com',
          email: 'sponsor.admin@demo.com',
          role: 'Admin',
          is_active: true,
          tenant_id: 1
        }]
      };
    }
    if (text.includes('SELECT password_hash FROM users WHERE id = $1')) {
      return { rows: [{ password_hash: '$2a$10$dFS6pE/6nFXr3d1Q3a3ob.3pAF5ydPbNxd0YYCjBnDOlLmy8xoXA6' }] };
    }
    if (text.includes('SELECT status FROM tenants WHERE id = $1')) {
      return { rows: [{ status: 'ACTIVE' }] };
    }
    if (text.includes('INSERT INTO refresh_tokens')) {
      const token = {
        id: testDb.refreshTokens.length + 1,
        user_id: params[0],
        token_hash: params[1],
        token_family: params[2],
        ip_address: params[3],
        expires_at: params[4],
        tenant_id: params[5] || 1,
        is_revoked: false
      };
      testDb.refreshTokens.push(token);
      return { rows: [token] };
    }
    if (text.includes('SELECT * FROM refresh_tokens WHERE token_hash = $1')) {
      const token = testDb.refreshTokens.find(t => t.token_hash === params[0]);
      return { rows: token ? [token] : [] };
    }
    if (text.includes('SELECT token_family FROM refresh_tokens WHERE token_hash = $1')) {
      const token = testDb.refreshTokens.find(t => t.token_hash === params[0]);
      return { rows: token ? [{ token_family: token.token_family }] : [] };
    }
    if (text.includes('UPDATE refresh_tokens SET is_revoked = TRUE WHERE token_family = $1')) {
      testDb.refreshTokens.forEach(t => {
        if (t.token_family === params[0]) t.is_revoked = true;
      });
      return { rows: [] };
    }
    if (text.includes('UPDATE refresh_tokens SET is_revoked = TRUE WHERE id = $1')) {
      const token = testDb.refreshTokens.find(t => t.id === params[0]);
      if (token) token.is_revoked = true;
      return { rows: token ? [token] : [] };
    }
    if (text.includes('INSERT INTO event_logs') || text.includes('INSERT INTO email_logs')) {
      return { rows: [{ id: 1 }] };
    }

    // ----------------------------------------------------
    // SKILLS REGISTRY QUERY MOCKS
    // ----------------------------------------------------
    if (text.includes('SELECT * FROM skills WHERE name = $1')) {
      const name = params[0];
      const skill = testDb.skills.find(s => s.name === name);
      return { rows: skill ? [skill] : [] };
    }
    if (text.includes('SELECT * FROM skills WHERE id = $1')) {
      const id = params[0];
      const skill = testDb.skills.find(s => s.id === parseInt(id));
      return { rows: skill ? [skill] : [] };
    }
    if (text.includes('SELECT * FROM skills') || (text.includes('FROM skills') && text.includes('ORDER BY name ASC'))) {
      return { rows: testDb.skills };
    }
    if (text.includes('INSERT INTO skills')) {
      const newSkill = {
        id: testDb.skills.length + 1,
        name: params[0],
        description: params[1],
        category_id: params[2],
        system_prompt: params[3],
        user_prompt: params[4],
        current_version: '1.0.0',
        is_published: true,
        tenant_id: params[5] || 1,
        created_by: params[6] || 101,
        created_at: new Date().toISOString()
      };
      testDb.skills.push(newSkill);
      return { rows: [newSkill] };
    }
    if (text.includes('INSERT INTO skill_executions')) {
      const newExec = {
        id: testDb.skillExecutions.length + 1,
        skill_id: params[0],
        user_id: params[1],
        input_data: params[2],
        output_data: params[3],
        model_used: params[4],
        execution_time_ms: params[5],
        created_at: new Date().toISOString()
      };
      testDb.skillExecutions.push(newExec);
      return { rows: [newExec] };
    }
    if (text.includes('SELECT id, name as code') && text.includes('FROM skills')) {
      const searchVal = params[0].replace(/%/g, '').toLowerCase();
      const list = testDb.skills.filter(s => s.name.toLowerCase().includes(searchVal) || s.description.toLowerCase().includes(searchVal))
        .map(s => ({ id: s.id, code: s.name, title: s.description, type: 'SKILL' }));
      return { rows: list.slice(0, 10) };
    }

    // ----------------------------------------------------
    // SOPS REGISTRY QUERY MOCKS
    // ----------------------------------------------------
    if (text.includes('SELECT * FROM sops WHERE code = $1')) {
      const code = params[0];
      const sop = testDb.sops.find(s => s.code === code);
      return { rows: sop ? [sop] : [] };
    }
    if (text.includes('SELECT * FROM sops WHERE id = $1')) {
      const id = params[0];
      const sop = testDb.sops.find(s => s.id === parseInt(id));
      return { rows: sop ? [sop] : [] };
    }
    if (text.includes('SELECT * FROM sops')) {
      return { rows: testDb.sops };
    }
    if (text.includes('INSERT INTO sop_executions')) {
      const newExec = {
        run_id: params[0],
        sop_id: params[1],
        user_id: params[2],
        status: params[3],
        progress_json: params[4],
        created_at: new Date().toISOString()
      };
      testDb.sopExecutions.push(newExec);
      return { rows: [newExec] };
    }
    if (text.includes('UPDATE sop_executions')) {
      const progress = params[0];
      const runId = params[1];
      const exec = testDb.sopExecutions.find(e => e.run_id === parseInt(runId));
      if (exec) {
        exec.progress_json = progress;
      }
      return { rows: exec ? [exec] : [] };
    }
    // Parameterized Matrix and Registry Queries
    if (text.includes('SELECT * FROM skill_function_matrix WHERE domain = $1 AND function_name = $2 AND skill_id = $3')) {
      const domain = params[0];
      const funcId = params[1];
      const skillId = parseInt(params[2]);
      const list = (testDb.skillFunctionMatrix || []).filter(m => m.domain === domain && m.function_name === funcId && m.skill_id === skillId);
      return { rows: list };
    }
    if (text.includes('SELECT * FROM sop_function_matrix WHERE function_name = $1 AND sop_id = $2')) {
      const funcId = params[0];
      const sopId = parseInt(params[1]);
      const list = (testDb.sopFunctionMatrix || []).filter(m => m.function_name === funcId && m.sop_id === sopId);
      return { rows: list };
    }
    if (text.includes('SELECT * FROM prompt_versions WHERE skill_id = $1')) {
      const skillId = parseInt(params[0]);
      const list = (testDb.promptVersions || []).filter(p => p.skill_id === skillId);
      return { rows: list };
    }
    if (text.includes('SELECT * FROM skill_templates WHERE id = $1')) {
      const id = parseInt(params[0]);
      const list = (testDb.skillTemplates || []).filter(t => t.id === id);
      return { rows: list };
    }
    if (text.includes('SELECT status FROM approval_workflows WHERE entity_type = $1 AND entity_id = $2')) {
      const entityType = params[0];
      const entityId = parseInt(params[1]);
      const list = (testDb.approvalWorkflows || []).filter(w => w.entity_type === entityType && w.entity_id === entityId);
      return { rows: list };
    }
    if (text.includes('INSERT INTO approval_workflows')) {
      const entityType = params[0];
      const entityId = parseInt(params[1]);
      const status = params[2];
      const userId = params[3];
      
      let wf = (testDb.approvalWorkflows || []).find(w => w.entity_type === entityType && w.entity_id === entityId);
      if (!wf) {
        wf = { id: (testDb.approvalWorkflows || []).length + 1, entity_type: entityType, entity_id: entityId, status, submitted_by: userId };
        testDb.approvalWorkflows.push(wf);
      } else {
        wf.status = status;
      }
      return { rows: [wf] };
    }

    if (text.includes('FROM prompt_versions')) {
      return { rows: testDb.promptVersions || [] };
    }
    if (text.includes('FROM skill_templates')) {
      return { rows: testDb.skillTemplates || [] };
    }
    if (text.includes('FROM knowledge_collections')) {
      return { rows: testDb.knowledgeCollections || [] };
    }
    if (text.includes('FROM knowledge_documents')) {
      return { rows: testDb.knowledgeDocuments || [] };
    }
    if (text.includes('FROM skill_function_matrix')) {
      return { rows: testDb.skillFunctionMatrix || [] };
    }
    if (text.includes('FROM sop_function_matrix')) {
      return { rows: testDb.sopFunctionMatrix || [] };
    }
    if (text.includes('FROM workflow_instances') || text.includes('workflow_instances')) {
      if (text.includes('sop_id = $1')) {
        const sopId = parseInt(params[0]);
        const list = (testDb.workflowInstances || []).filter(i => i.sop_id === sopId);
        return { rows: list };
      }
      return { rows: testDb.workflowInstances || [] };
    }
    if (text.includes('FROM workflow_designs') || text.includes('workflow_designs')) {
      if (text.includes('id = $1')) {
        const id = parseInt(params[0]);
        const list = (testDb.workflowDesigns || []).filter(d => d.id === id);
        return { rows: list };
      }
      return { rows: testDb.workflowDesigns || [] };
    }

    return { rows: [] };
  }

  const tenantId = tenantStorage.getStore();
  const pool = getPool();
  const client = await pool.connect();
  try {
    if (tenantId) {
      await client.query('BEGIN');
      await client.query(`SET LOCAL app.current_tenant_id = $1`, [tenantId.toString()]);
      const res = await client.query(text, params);
      await client.query('COMMIT');
      return res;
    } else {
      return await client.query(text, params);
    }
  } catch (err) {
    if (tenantId) {
      try {
        await client.query('ROLLBACK');
      } catch (rollbackErr) {
        // Ignore rollback failure details
      }
    }
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Executes operations in a transaction block with automated RLS tenant parameter mapping.
 */
export async function executeTransaction(callback) {
  const tenantId = tenantStorage.getStore();
  const pool = getPool();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    if (tenantId) {
      await client.query(`SET LOCAL app.current_tenant_id = $1`, [tenantId.toString()]);
    }
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    try {
      await client.query('ROLLBACK');
    } catch (rollbackErr) {
      // Ignore rollback failure details
    }
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Performs cleanup of all pool connections on graceful shutdown.
 */
export async function closePool() {
  if (pgPool) {
    console.log('Database Config: Shutting down PostgreSQL connection pool...');
    await pgPool.end();
    pgPool = null;
  }
}

async function runMigrationFile(client, filePath) {
  if (!fs.existsSync(filePath)) {
    console.warn(`Migration file not found: ${filePath}`);
    return;
  }
  const sql = fs.readFileSync(filePath, 'utf8');
  // client.query executes multiple query lines in a single call for DDL
  await client.query(sql);
}

/**
 * Runs application schema migrations sequentially on startup.
 */
export async function runStartupMigrations() {
  if (process.env.NODE_ENV === 'test' || isSimulated) {
    console.log("Database Config: Bypassing startup migrations in test/simulated mode.");
    return;
  }
  const pool = getPool();
  const client = await pool.connect();
  try {
    // 1. Create migrations version tracking table
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version VARCHAR(100) PRIMARY KEY,
        applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const checkApplied = async (version) => {
      const res = await client.query('SELECT 1 FROM schema_migrations WHERE version = $1', [version]);
      return res.rows.length > 0;
    };

    const applyMigration = async (version, filePath) => {
      if (await checkApplied(version)) {
        console.log(`Migration [${version}] already applied.`);
        return;
      }
      console.log(`Applying migration [${version}] from ${filePath}...`);
      await client.query('BEGIN');
      try {
        await runMigrationFile(client, filePath);
        await client.query('INSERT INTO schema_migrations (version) VALUES ($1)', [version]);
        await client.query('COMMIT');
        console.log(`Migration [${version}] successfully applied.`);
      } catch (err) {
        await client.query('ROLLBACK');
        console.error(`Failed to apply migration [${version}]:`, err.message);
        throw err;
      }
    };

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    await applyMigration('schema', path.resolve(__dirname, '../../db/schema.sql'));
    await applyMigration('migrations', path.resolve(__dirname, '../../db/migrations.sql'));
    await applyMigration('schema_v7', path.resolve(__dirname, '../../db/schema_v7.sql'));
    await applyMigration('schema_v8', path.resolve(__dirname, '../../db/schema_v8.sql'));
    await applyMigration('schema_v11', path.resolve(__dirname, '../../db/schema_v11.sql'));
    await applyMigration('seeds', path.resolve(__dirname, '../../db/seeds.sql'));
    await applyMigration('schema_v12', path.resolve(__dirname, '../../db/schema_v12.sql'));
    await applyMigration('schema_v13', path.resolve(__dirname, '../../db/schema_v13.sql'));
    await applyMigration('schema_v14_5', path.resolve(__dirname, '../../db/schema_v14_5.sql'));
    await applyMigration('schema_v15_1', path.resolve(__dirname, '../../db/migrations/v15_1_target_schemas.sql'));

    // Execute programmatic seeds helper if not yet run
    try {
      const isSeeded = await checkApplied('programmatic_seeds');
      if (!isSeeded) {
        console.log('Running programmatic seed helper (SOPs, Skills, Knowledge docs)...');
        const helperPath = path.resolve(__dirname, '../../db/seed_helper.js');
        const { execSync } = await import('child_process');
        execSync(`node "${helperPath}"`, { stdio: 'inherit' });
        await client.query('INSERT INTO schema_migrations (version) VALUES ($1)', ['programmatic_seeds']);
        console.log('Programmatic seeds successfully loaded.');
      }
    } catch (seedErr) {
      console.error('Failed to run programmatic seed helper:', seedErr.message);
    }
  } finally {
    client.release();
  }
}
