import { query } from '../config/db.js';
import { logAudit } from '../middleware/audit.js';

// Standard MedDRA mock dictionary terms
const MEDDRA_DICT = {
  'headache': { code: '10019211', term: 'Headache', version: 'v26.0' },
  'severe headache': { code: '10019211', term: 'Headache', version: 'v26.0' },
  'nausea': { code: '10028813', term: 'Nausea', version: 'v26.0' },
  'mild nausea': { code: '10028813', term: 'Nausea', version: 'v26.0' },
  'rash': { code: '10037844', term: 'Rash', version: 'v26.0' },
  'abdominal pain': { code: '10000057', term: 'Abdominal pain', version: 'v26.0' }
};

// Standard WHODrug mock dictionary terms
const WHODRUG_DICT = {
  'aspirin': { code: '00012301001', term: 'ASPIRIN', version: 'B3 Q3 2025' },
  'tylenol': { code: '00045601001', term: 'PARACETAMOL', version: 'B3 Q3 2025' },
  'paracetamol': { code: '00045601001', term: 'PARACETAMOL', version: 'B3 Q3 2025' },
  'advil': { code: '00078901001', term: 'IBUPROFEN', version: 'B3 Q3 2025' },
  'ibuprofen': { code: '00078901001', term: 'IBUPROFEN', version: 'B3 Q3 2025' }
};

export async function lookupMedDRA(text) {
  const cleanText = text.toLowerCase().trim();
  return MEDDRA_DICT[cleanText] || { code: '10099999', term: 'Uncoded Event (System Fallback)', version: 'v26.0' };
}

export async function lookupWHODrug(text) {
  const cleanText = text.toLowerCase().trim();
  return WHODRUG_DICT[cleanText] || { code: '00099901001', term: 'UNCODED SUBSTANCE', version: 'B3 Q3 2025' };
}

export async function assignCoding(dataPointId, dictionaryType, code, termText, version, user, tenantId = 1) {
  const checkRes = await query('SELECT id FROM medical_coding_terms WHERE data_point_id = $1 AND tenant_id = $2', [dataPointId, tenantId]);
  let res;
  
  if (checkRes.rows.length > 0) {
    res = await query(
      `UPDATE medical_coding_terms 
       SET dictionary_type = $1, code = $2, term_text = $3, dictionary_version = $4, coded_by = $5
       WHERE data_point_id = $6 AND tenant_id = $7
       RETURNING *`,
      [dictionaryType, code, termText, version, user.id, dataPointId, tenantId]
    );
  } else {
    res = await query(
      `INSERT INTO medical_coding_terms (data_point_id, dictionary_type, code, term_text, dictionary_version, coded_by, tenant_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [dataPointId, dictionaryType, code, termText, version, user.id, tenantId]
    );
  }
  
  await logAudit(
    user.id,
    user.username,
    user.role,
    'ASSIGN_MEDICAL_CODING',
    `data_points/${dataPointId}`,
    `Coded data point ${dataPointId} to ${dictionaryType} term: "${termText}" (code: ${code})`,
    tenantId
  );
  
  return res.rows[0];
}

export async function getCodingForDataPoint(dataPointId, tenantId = 1) {
  const res = await query('SELECT * FROM medical_coding_terms WHERE data_point_id = $1 AND tenant_id = $2', [dataPointId, tenantId]);
  return res.rows[0] || null;
}
