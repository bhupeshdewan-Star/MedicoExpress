import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { query } from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function createExportJob(resourceType, resourceId, fileType, userId, ipAddress) {
  // Create queue item
  const res = await query(
    `INSERT INTO document_export_jobs (resource_type, resource_id, file_type, status)
     VALUES ($1, $2, $3, 'QUEUED')
     RETURNING id`,
    [resourceType, resourceId, fileType]
  );
  
  const jobId = res.rows[0].id;
  
  // Start job in background
  processJob(jobId, resourceType, resourceId, fileType, userId, ipAddress).catch(err => {
    console.error(`Background export job #${jobId} failed:`, err.message);
  });

  return jobId;
}

async function processJob(jobId, resourceType, resourceId, fileType, userId, ipAddress) {
  await query(`UPDATE document_export_jobs SET status = 'PROCESSING' WHERE id = $1`, [jobId]);

  try {
    // 1. Fetch resource content
    let content = 'Export Data';
    let title = 'Resource';
    
    if (resourceType.toLowerCase() === 'sop') {
      const res = await query(`SELECT title, content FROM sops WHERE id = $1`, [resourceId]);
      if (res.rows[0]) {
        title = res.rows[0].title;
        content = res.rows[0].content;
      }
    } else if (resourceType.toLowerCase() === 'appraisal') {
      const res = await query(`SELECT title FROM product_appraisals WHERE id = $1`, [resourceId]);
      const secRes = await query(`SELECT content FROM product_appraisal_sections WHERE appraisal_id = $1`, [resourceId]);
      if (res.rows[0]) {
        title = res.rows[0].title;
        content = secRes.rows.map(s => s.content).join('\n\n');
      }
    }

    // 2. Generate simulated file output and write to scratch/export directory
    const exportDir = path.resolve(__dirname, '../../db/exports');
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }

    const cleanTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const fileName = `${cleanTitle}_${jobId}.${fileType}`;
    const filePath = path.join(exportDir, fileName);

    const fileContent = `--- CLINCOMMAND OS™ CERTIFIED DOCUMENT EXPORT ---
Export Job ID: ${jobId}
Resource Type: ${resourceType}
Resource ID: ${resourceId}
File Format: ${fileType}
Timestamp: ${new Date().toISOString()}
--------------------------------------------------
Title: ${title}

${content}`;

    fs.writeFileSync(filePath, fileContent, 'utf8');

    // 3. Compute verification hash
    const checksum = crypto.createHash('sha256').update(fileContent).digest('hex');

    // 4. Update job status
    await query(
      `UPDATE document_export_jobs 
       SET status = 'COMPLETED', sha256_hash = $1, filepath = $2, completed_at = CURRENT_TIMESTAMP
       WHERE id = $3`,
      [checksum, filePath, jobId]
    );

    // 5. Register in document_exports for compliance audit
    const expRes = await query(
      `INSERT INTO document_exports (job_id, resource_type, resource_id, file_type, exported_by, sha256_hash)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [jobId, resourceType, resourceId, fileType, userId, checksum]
    );
    const exportId = expRes.rows[0].id;

    // Log action to audit vault and export logs
    await query(
      `INSERT INTO document_export_logs (export_id, action_type, performed_by, ip_address)
       VALUES ($1, 'DOWNLOAD_EXPORT', $2, $3)`,
      [exportId, userId, ipAddress]
    );

    // Log into analytics dim/fact exports warehouse
    const timeKeyRes = await query(`SELECT id FROM dim_time WHERE db_date = CURRENT_DATE LIMIT 1`);
    const timeKey = timeKeyRes.rows[0]?.id || null;
    
    const userKeyRes = await query(`SELECT id FROM dim_users WHERE user_id = $1 AND is_current = TRUE LIMIT 1`, [userId]);
    const userKey = userKeyRes.rows[0]?.id || null;

    if (timeKey && userKey) {
      await query(
        `INSERT INTO fact_exports (time_key, user_key, job_id, file_type, sha256_hash)
         VALUES ($1, $2, $3, $4, $5)`,
        [timeKey, userKey, jobId, fileType, checksum]
      );
    }

  } catch (err) {
    await query(
      `UPDATE document_export_jobs 
       SET status = 'FAILED', error_message = $1, completed_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [err.message, jobId]
    );
    throw err;
  }
}
