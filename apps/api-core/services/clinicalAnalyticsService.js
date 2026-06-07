import { query } from '../config/db.js';
import { runEtmfCompletenessCheck } from './etmfService.js';

/**
 * Calculates clinical analytics metrics, health indices, and linear enrollment forecasts.
 * @param {number} studyId Study ID
 */
export async function getClinicalAnalytics(studyId) {
  // 1. Fetch study enrollment parameters
  const studyRes = await query('SELECT * FROM studies WHERE id = $1', [studyId]);
  const study = studyRes.rows[0];
  if (!study) {
    throw new Error('Study not found.');
  }

  // 2. Aggregate actual and target enrollments across sites
  const sitesRes = await query('SELECT SUM(target_enrollment) AS target, SUM(actual_enrollment) AS actual FROM study_sites WHERE study_id = $1', [studyId]);
  const targetEnrollment = parseInt(sitesRes.rows[0].target) || 0;
  const currentEnrollment = parseInt(sitesRes.rows[0].actual) || 0;

  // 3. Compute Enrollment Velocity (subjects per day)
  const firstEnrollmentRes = await query('SELECT MIN(date) AS start_date FROM enrollment_logs WHERE study_id = $1 AND action = \'ENROLLED\'', [studyId]);
  const firstEnrollmentDate = firstEnrollmentRes.rows[0]?.start_date;

  let velocityPerDay = 0.1; // default fallback (1 subject every 10 days)
  if (firstEnrollmentDate) {
    const daysActive = Math.max(1, Math.round((Date.now() - new Date(firstEnrollmentDate).getTime()) / (1000 * 60 * 60 * 24)));
    velocityPerDay = currentEnrollment / daysActive;
    if (velocityPerDay === 0) velocityPerDay = 0.1; // safety minimum
  }

  // 4. Enrollment Forecast projection
  const remainingSubjects = Math.max(0, targetEnrollment - currentEnrollment);
  const projectedDaysToTarget = Math.round(remainingSubjects / velocityPerDay);
  const projectedCompletionDate = new Date(Date.now() + projectedDaysToTarget * 24 * 60 * 60 * 1000);

  // 5. Open Findings Count
  const openFindingsRes = await query(`
    SELECT COUNT(*) AS count
    FROM monitoring_findings mf
    JOIN monitoring_visits mv ON mf.visit_id = mv.id
    WHERE mv.site_id IN (SELECT id FROM study_sites WHERE study_id = $1)
      AND mf.status = 'OPEN'
  `, [studyId]);
  const openFindings = parseInt(openFindingsRes.rows[0].count) || 0;

  // 6. eTMF Completeness score
  let etmfCompleteness = 0;
  try {
    const etmfChecks = await runEtmfCompletenessCheck(studyId);
    if (etmfChecks.length > 0) {
      const sum = etmfChecks.reduce((s, c) => s + c.completenessPercent, 0);
      etmfCompleteness = Math.round(sum / etmfChecks.length);
    }
  } catch (etmfErr) {
    console.error('Completeness checker failed in analytics:', etmfErr.message);
  }

  // 7. Milestone Adherence
  const milestoneRes = await query('SELECT status FROM trial_milestones WHERE study_id = $1', [studyId]);
  const milestones = milestoneRes.rows;
  let milestoneAdherence = 100;
  if (milestones.length > 0) {
    const achieved = milestones.filter(m => m.status === 'ACHIEVED').length;
    milestoneAdherence = Math.round((achieved / milestones.length) * 100);
  }

  // 8. Composite Study Health Index
  // Components: Enrollment target ratio (25%), open findings impact (25%), eTMF (25%), milestones (25%)
  const enrollmentRatio = targetEnrollment > 0 ? (currentEnrollment / targetEnrollment) : 1;
  const enrollmentHealth = Math.min(100, Math.round(enrollmentRatio * 100));
  const findingsHealth = Math.max(0, 100 - openFindings * 10);
  
  const studyHealthIndex = Math.round(
    (enrollmentHealth * 0.25) + 
    (findingsHealth * 0.25) + 
    (etmfCompleteness * 0.25) + 
    (milestoneAdherence * 0.25)
  );

  // 9. Actual vs Target enrollment timeline mapping (mock series for charts)
  const actualSeries = [
    { date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], count: Math.max(0, currentEnrollment - 2) },
    { date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], count: Math.max(0, currentEnrollment - 1) },
    { date: new Date().toISOString().split('T')[0], count: currentEnrollment }
  ];
  const targetSeries = [
    { date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], count: Math.round(targetEnrollment * 0.2) },
    { date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], count: Math.round(targetEnrollment * 0.4) },
    { date: new Date().toISOString().split('T')[0], count: Math.round(targetEnrollment * 0.6) },
    { date: projectedCompletionDate.toISOString().split('T')[0], count: targetEnrollment }
  ];

  const payload = {
    studyId,
    protocolNumber: study.protocol_number,
    metrics: {
      targetEnrollment,
      currentEnrollment,
      openFindings,
      etmfCompleteness,
      milestoneAdherence
    },
    velocity: {
      subjectsPerDay: parseFloat(velocityPerDay.toFixed(2)),
      subjectsPerWeek: parseFloat((velocityPerDay * 7).toFixed(2))
    },
    forecast: {
      projectedDaysToTarget,
      projectedCompletionDate: projectedCompletionDate.toISOString().split('T')[0],
      isOverdue: projectedCompletionDate.getTime() > Date.now() + 180 * 24 * 60 * 60 * 1000
    },
    studyHealthIndex,
    chartData: {
      actualSeries,
      targetSeries
    }
  };

  // Cache results to DB dashboard
  await query(
    `INSERT INTO study_dashboards (study_id, metrics_summary, tenant_id)
     VALUES ($1, $2, $3)
     ON CONFLICT DO NOTHING`, // Or updates
    [studyId, JSON.stringify(payload), study.tenant_id]
  );

  return payload;
}
