import { query } from '../config/db.js';

/**
 * Calculates Risk-Based Monitoring metrics and tier alerts for all active study sites.
 * Weight parameters can be overridden per call or fallback to defaults.
 * Score = w1 * min(deviations*10, 100) + w2 * min(missed_visits*25, 100) + w3 * min(open_findings*20, 100)
 */
export async function getStudyRiskProfile(studyId, weights = { w1: 0.4, w2: 0.3, w3: 0.3 }) {
  const { w1, w2, w3 } = weights;

  // Verify weights sum to approximately 1
  if (Math.abs((w1 + w2 + w3) - 1.0) > 0.01) {
    throw new Error('Risk scoring weights must sum to 1.0.');
  }

  // Get all sites for study
  const siteRes = await query('SELECT id, name, site_number FROM study_sites WHERE study_id = $1', [studyId]);
  const sites = siteRes.rows;

  const siteRiskReports = [];

  for (const site of sites) {
    // 1. Fetch count of deviations
    const devRes = await query('SELECT COUNT(*) AS count FROM protocol_deviations WHERE site_id = $1', [site.id]);
    const deviations = parseInt(devRes.rows[0].count);

    // 2. Fetch count of missed visits
    const visitRes = await query(`
      SELECT COUNT(*) AS count 
      FROM subject_visits sv
      JOIN study_subjects ss ON sv.subject_id = ss.id
      WHERE ss.site_id = $1 AND sv.status = 'MISSED'
    `, [site.id]);
    const missedVisits = parseInt(visitRes.rows[0].count);

    // 3. Fetch count of open findings
    const findingsRes = await query(`
      SELECT COUNT(*) AS count
      FROM monitoring_findings mf
      JOIN monitoring_visits mv ON mf.visit_id = mv.id
      WHERE mv.site_id = $1 AND mf.status = 'OPEN'
    `, [site.id]);
    const openFindings = parseInt(findingsRes.rows[0].count);

    // Calculate sub-scores (0-100 scale)
    const deviationScore = Math.min(deviations * 10, 100);
    const missedVisitScore = Math.min(missedVisits * 25, 100);
    const findingsScore = Math.min(openFindings * 20, 100);

    // Compute aggregate risk score
    const aggregateScore = Math.round((w1 * deviationScore) + (w2 * missedVisitScore) + (w3 * findingsScore));

    // Risk classification tier
    let riskTier = 'Low';
    if (aggregateScore >= 70) {
      riskTier = 'High';
    } else if (aggregateScore >= 40) {
      riskTier = 'Medium';
    }

    siteRiskReports.push({
      siteId: site.id,
      siteNumber: site.site_number,
      siteName: site.name,
      metrics: {
        deviations,
        missedVisits,
        openFindings
      },
      scores: {
        deviationScore,
        missedVisitScore,
        findingsScore
      },
      aggregateScore,
      riskTier,
      needsEscalation: riskTier === 'High' || openFindings > 3
    });
  }

  // Aggregate stats at study level
  const totalScore = siteRiskReports.reduce((sum, s) => sum + s.aggregateScore, 0);
  const avgStudyScore = sites.length > 0 ? Math.round(totalScore / sites.length) : 0;
  
  let studyRiskTier = 'Low';
  if (avgStudyScore >= 70) {
    studyRiskTier = 'High';
  } else if (avgStudyScore >= 40) {
    studyRiskTier = 'Medium';
  }

  return {
    studyId,
    weights,
    averageStudyScore: avgStudyScore,
    studyRiskTier,
    siteRisks: siteRiskReports
  };
}

/**
 * Endpoint helper for heatmap queries.
 */
export async function getRbmHeatmap(studyId, w1 = 0.4, w2 = 0.3, w3 = 0.3) {
  const profile = await getStudyRiskProfile(studyId, { w1, w2, w3 });
  return profile.siteRisks.map(site => ({
    siteId: site.siteId,
    siteNumber: site.siteNumber,
    siteName: site.siteName,
    value: site.aggregateScore,
    tier: site.riskTier,
    deviations: site.metrics.deviations,
    missedVisits: site.metrics.missedVisits,
    openFindings: site.metrics.openFindings
  }));
}
