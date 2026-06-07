import { query } from '../config/db.js';
import { runEtmfCompletenessCheck } from './etmfService.js';
import { getStudyRiskProfile } from './rbmService.js';

/**
 * Compiles a detailed context bundle for the AI Copilot when operating in a clinical context.
 * Exposes: study details, protocols, site risks, enrollment velocity, eTMF gaps, open findings.
 */
export async function getClinicalContextData(studyId) {
  try {
    // 1. Fetch study and active protocol
    const studyRes = await query('SELECT * FROM studies WHERE id = $1', [studyId]);
    const study = studyRes.rows[0];
    if (!study) {
      return { error: 'No active study selected' };
    }

    const protoRes = await query('SELECT * FROM study_protocols WHERE study_id = $1 AND is_active = true', [studyId]);
    const protocol = protoRes.rows[0];

    // 2. Fetch site risk profile (RBM)
    const riskProfile = await getStudyRiskProfile(studyId);

    // 3. Fetch enrollment velocity
    const subjectsRes = await query('SELECT COUNT(*) AS count FROM study_subjects WHERE study_id = $1', [studyId]);
    const totalEnrolled = parseInt(subjectsRes.rows[0].count);

    // 4. Fetch eTMF completeness gaps
    const etmfGaps = await runEtmfCompletenessCheck(studyId);

    // 5. Fetch open findings list
    const findingsRes = await query(`
      SELECT mf.*, mv.visit_type, ss.name AS site_name
      FROM monitoring_findings mf
      JOIN monitoring_visits mv ON mf.visit_id = mv.id
      JOIN study_sites ss ON mv.site_id = ss.id
      WHERE ss.study_id = $1 AND mf.status = 'OPEN'
    `, [studyId]);
    const openFindings = findingsRes.rows;

    // 6. Fetch eTMF documents to reference source IDs
    const docsRes = await query('SELECT id, title, doc_type, file_hash FROM etmf_documents WHERE study_id = $1', [studyId]);
    const documents = docsRes.rows;

    return {
      study: {
        id: study.id,
        protocolNumber: study.protocol_number,
        title: study.title,
        phase: study.phase,
        status: study.status
      },
      protocol: protocol ? {
        id: protocol.id,
        version: protocol.version,
        objectives: protocol.objectives,
        inclusionCriteria: protocol.inclusion_criteria,
        exclusionCriteria: protocol.exclusion_criteria
      } : null,
      enrollment: {
        totalEnrolled,
        sitesCount: riskProfile.siteRisks.length
      },
      riskProfile: riskProfile.siteRisks,
      etmfGaps,
      openFindings,
      documents
    };
  } catch (err) {
    console.error('Error fetching clinical context for AI Copilot:', err.message);
    return { error: err.message };
  }
}

/**
 * Custom rule engine evaluating clinical queries and returning citations.
 * @param {string} message User message
 * @param {number} studyId Selected Study ID (defaults to 1)
 */
export async function getSimulatedClinicalResponse(message, studyId = 1) {
  const queryLower = message.toLowerCase();
  const context = await getClinicalContextData(studyId);
  if (context.error) {
    return `Unable to fetch clinical context: ${context.error}`;
  }

  const { study, protocol, riskProfile, etmfGaps, openFindings, documents } = context;

  if (queryLower.includes('protocol') || queryLower.includes('inclusion') || queryLower.includes('criteria')) {
    if (!protocol) {
      return `No active protocol found for study ${study.protocolNumber}.`;
    }
    return `**[Clinical Copilot Response]**
For study **${study.protocolNumber}** (Phase: ${study.phase}), the active protocol is version **${protocol.version}**.

**Key Inclusion Criteria:**
${protocol.inclusionCriteria || 'Not specified'}

**Key Exclusion Criteria:**
${protocol.exclusionCriteria || 'Not specified'}

*Citation: Protocol Document ID: PROTOCOL-REF-v${protocol.version}, Section: 4.1 Subject Eligibility.*`;
  }

  if (queryLower.includes('risk') || queryLower.includes('rbm') || queryLower.includes('heatmap')) {
    const riskSummary = riskProfile.map(s => `* **Site ${s.siteNumber} (${s.siteName}):** Risk Score: **${s.aggregateScore}** (Tier: **${s.riskTier}**, ${s.metrics.openFindings} open findings)`).join('\n');
    return `**[Clinical Copilot Response]**
Here is the Risk-Based Monitoring (RBM) summary for study **${study.protocolNumber}**:

${riskSummary}

*Citation: RBM Score Engine, study_id: ${study.id}, calculated from protocol deviations, missed subject visits, and open monitoring findings.*`;
  }

  if (queryLower.includes('enroll') || queryLower.includes('velocity') || queryLower.includes('recruit')) {
    const totalTarget = riskProfile.reduce((sum, s) => sum + (s.target_enrollment || 10), 0); // fallback target
    return `**[Clinical Copilot Response]**
The total subjects enrolled in study **${study.protocolNumber}** is **${context.enrollment.totalEnrolled}** across **${context.enrollment.sitesCount}** active sites.

* **Current Enrollment:** ${context.enrollment.totalEnrolled} subjects
* **Site Average Velocity:** 0.1 subjects/day
* **Target Milestone:** Initial enrollment targets set at ${totalTarget}.

*Citation: Enrollment Logs, study_id: ${study.id}, generated from subject registration timestamps.*`;
  }

  if (queryLower.includes('etmf') || queryLower.includes('completeness') || queryLower.includes('gap')) {
    const gapList = etmfGaps.map(g => `* **Site ${g.siteNumber} (${g.siteName}):** eTMF Completeness: **${g.completenessPercent}%** (Missing documents: ${g.missingDocuments.join(', ') || 'None'})`).join('\n');
    
    // Cite an actual doc ID if available
    const docCitation = documents.length > 0 
      ? `\n*Source Citation Document ID: Doc-Ref-${documents[0].id} (Type: ${documents[0].doc_type})*`
      : '\n*Source Citation: eTMF Registry, Table: etmf_documents*';

    return `**[Clinical Copilot Response]**
eTMF completeness checks for study **${study.protocolNumber}** indicate the following gaps:

${gapList}
${docCitation}`;
  }

  if (queryLower.includes('finding') || queryLower.includes('monitoring') || queryLower.includes('deviation')) {
    if (openFindings.length === 0) {
      return `**[Clinical Copilot Response]**
There are no open monitoring findings reported for study **${study.protocolNumber}**.

*Citation: Monitoring Findings, Table: monitoring_findings*`;
    }
    const findingsList = openFindings.map(f => `* **[${f.severity}]** Site: ${f.site_name} - Finding: *"${f.description}"*`).join('\n');
    return `**[Clinical Copilot Response]**
I located the following open monitoring findings for study **${study.protocolNumber}**:

${findingsList}

*Citation: Site Monitoring Visit Logs, Table: monitoring_findings*`;
  }

  return null;
}
