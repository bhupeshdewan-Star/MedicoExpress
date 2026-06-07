import { query } from '../config/db.js';
import { logAudit } from '../middleware/audit.js';
import { getStorageAdapter } from '../lib/storageAdapter.js';

/**
 * Initializes default DIA reference model folders for a new study.
 * @param {number} studyId Study ID
 * @param {number} tenantId Tenant ID
 */
export async function initializeEtmfFolderStructure(studyId, tenantId) {
  // 1. Root folder
  const rootRes = await query(
    `INSERT INTO etmf_folders (study_id, parent_id, name, tenant_id)
     VALUES ($1, NULL, 'Trial Master File', $2)
     RETURNING id`,
    [studyId, tenantId || 1]
  );
  const rootId = rootRes.rows[0].id;

  // 2. DIA Core Levels
  const levels = ['01. Trial Level', '02. Country Level', '03. Site Level'];
  for (const level of levels) {
    const levelRes = await query(
      `INSERT INTO etmf_folders (study_id, parent_id, name, tenant_id)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [studyId, rootId, level, tenantId || 1]
    );
    const levelId = levelRes.rows[0].id;

    // Seed default subfolders for each level
    if (level.includes('Trial')) {
      await query(`INSERT INTO etmf_folders (study_id, parent_id, name, tenant_id) VALUES ($1, $2, 'Protocol & Amendments', $3), ($1, $2, 'Investigator Brochure', $3)`, [studyId, levelId, tenantId || 1]);
    } else if (level.includes('Country')) {
      await query(`INSERT INTO etmf_folders (study_id, parent_id, name, tenant_id) VALUES ($1, $2, 'Regulatory Authority Approvals', $3), ($1, $2, 'Sample Labels', $3)`, [studyId, levelId, tenantId || 1]);
    } else if (level.includes('Site')) {
      await query(`INSERT INTO etmf_folders (study_id, parent_id, name, tenant_id) VALUES ($1, $2, 'IRB Approvals', $3), ($1, $2, 'Informed Consent Forms', $3), ($1, $2, 'Site Staff CVs', $3)`, [studyId, levelId, tenantId || 1]);
    }
  }
}

/**
 * Registers and uploads an eTMF document.
 * @param {Object} docData Document metadata (study_id, folder_id, site_id, title, doc_type, filename, content, tenant_id)
 * @param {Object} user User context
 */
export async function uploadEtmfDocument(docData, user) {
  const { study_id, folder_id, site_id, title, doc_type, filename, content, tenant_id } = docData;

  if (!study_id || !title || !doc_type || !filename || !content) {
    throw new Error('Study ID, Title, Doc Type, Filename, and Content are required.');
  }

  // Upload using active storage adapter
  const adapter = getStorageAdapter();
  const uploadResult = await adapter.upload(filename, content);

  // Insert into DB
  const sql = `
    INSERT INTO etmf_documents (study_id, folder_id, site_id, title, doc_type, status, file_url, file_size, file_hash, tenant_id)
    VALUES ($1, $2, $3, $4, $5, 'APPROVED', $6, $7, $8, $9)
    RETURNING *
  `;
  const result = await query(sql, [
    study_id,
    folder_id || null,
    site_id || null,
    title,
    doc_type,
    uploadResult.fileUrl,
    uploadResult.fileSize,
    uploadResult.fileHash,
    tenant_id || 1
  ]);
  const document = result.rows[0];

  if (user) {
    await logAudit(
      user.id,
      user.username,
      user.role,
      'UPLOAD_ETMF_DOCUMENT',
      `etmf_documents/${document.id}`,
      `Uploaded eTMF document ${title} (Type: ${doc_type}, Size: ${uploadResult.fileSize}B)`,
      user.ipAddress || '127.0.0.1'
    );
  }

  return document;
}

/**
 * Gets eTMF folders for a study.
 */
export async function getEtmfFolders(studyId) {
  const result = await query('SELECT * FROM etmf_folders WHERE study_id = $1 ORDER BY id ASC', [studyId]);
  return result.rows;
}

/**
 * Gets documents under a study, folder, or site.
 */
export async function getEtmfDocuments(studyId, folderId, siteId) {
  let sql = 'SELECT * FROM etmf_documents WHERE study_id = $1';
  const params = [studyId];

  if (folderId) {
    params.push(folderId);
    sql += ` AND folder_id = $${params.length}`;
  }
  if (siteId) {
    params.push(siteId);
    sql += ` AND site_id = $${params.length}`;
  }

  sql += ' ORDER BY id DESC';
  const result = await query(sql, params);
  return result.rows;
}

/**
 * Computes eTMF completeness score for a study/site.
 * Mandated document types per site: 'PROTOCOL', 'ICF', 'IRB_APPROVAL'.
 * Returns completeness metrics list.
 */
export async function runEtmfCompletenessCheck(studyId) {
  // Fetch active sites
  const siteRes = await query('SELECT id, site_number, name FROM study_sites WHERE study_id = $1', [studyId]);
  const sites = siteRes.rows;

  const checkList = [];
  const requiredTypes = ['PROTOCOL', 'ICF', 'IRB_APPROVAL'];

  for (const site of sites) {
    const missing = [];
    const present = [];

    for (const docType of requiredTypes) {
      // For PROTOCOL, check study-level or site-level. For ICF and IRB_APPROVAL, check site-level.
      let checkSql = '';
      let checkParams = [];
      if (docType === 'PROTOCOL') {
        checkSql = "SELECT 1 FROM etmf_documents WHERE study_id = $1 AND doc_type = $2 AND status = 'APPROVED'";
        checkParams = [studyId, docType];
      } else {
        checkSql = "SELECT 1 FROM etmf_documents WHERE study_id = $1 AND site_id = $2 AND doc_type = $3 AND status = 'APPROVED'";
        checkParams = [studyId, site.id, docType];
      }

      const checkRes = await query(checkSql, checkParams);
      if (checkRes.rows.length > 0) {
        present.push(docType);
      } else {
        missing.push(docType);
      }
    }

    const totalRequired = requiredTypes.length;
    const completenessPercent = Math.round((present.length / totalRequired) * 100);

    checkList.push({
      siteId: site.id,
      siteNumber: site.site_number,
      siteName: site.name,
      completenessPercent,
      presentDocuments: present,
      missingDocuments: missing,
      isCompliant: missing.length === 0
    });
  }

  return checkList;
}
