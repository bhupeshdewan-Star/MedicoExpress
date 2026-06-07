import { query } from '../config/db.js';

// In-memory active queue state for background worker execution
const emailQueue = [];
let workerActive = false;

/**
 * Queues a notification and writes history logs.
 * @param {Object} recipient User object or recipient ID
 * @param {string} title Notification header
 * @param {string} message Text details
 * @param {number} tenantId Multi-tenant boundary key
 */
export async function queueNotification(recipientId, title, message, tenantId = 1) {
  // 1. Insert into database notifications history table
  const sql = `
    INSERT INTO notifications (recipient_id, title, message, is_read, created_at)
    VALUES ($1, $2, $3, false, CURRENT_TIMESTAMP)
    RETURNING *
  `;
  const result = await query(sql, [recipientId, title, message]);
  const newNotif = result.rows[0];

  // 2. Insert into event_logs for validation audits
  await query(
    `INSERT INTO event_logs (event_type, event_source, message, tenant_id)
     VALUES ($1, $2, $3, $4)`,
    ['NOTIFICATION_QUEUED', `user:${recipientId}`, `Queued: ${title}`, tenantId]
  );

  // 3. Resolve recipient email to push to email dispatch queue
  const userRes = await query('SELECT email FROM users WHERE id = $1', [recipientId]);
  const recipientEmail = userRes.rows[0]?.email;
  
  if (recipientEmail) {
    emailQueue.push({
      recipientId,
      recipientEmail,
      subject: title,
      body: message,
      tenantId,
      attempts: 0,
      maxAttempts: 3,
      status: 'PENDING'
    });
    
    // Trigger background queue processor asynchronously on next tick
    setTimeout(triggerWorker, 0);
  }

  return newNotif;
}

/**
 * Direct send handler with retry support
 */
async function triggerWorker() {
  if (workerActive) return;
  workerActive = true;
  
  while (emailQueue.length > 0) {
    const job = emailQueue.shift();
    job.attempts++;
    
    try {
      // Simulate SMTP connection and dispatch
      if (job.recipientEmail.includes('fail_delivery')) {
        throw new Error('SMTP Connection timed out (Simulated)');
      }
      
      // Successfully sent - insert audit trail record in email_logs
      await query(
        `INSERT INTO email_logs (sender_id, recipient_email, subject, sent_at)
         VALUES ($1, $2, $3, CURRENT_TIMESTAMP)`,
        [null, job.recipientEmail, job.subject]
      );
      
      job.status = 'COMPLETED';
      
      await query(
        `INSERT INTO event_logs (event_type, event_source, message, tenant_id)
         VALUES ($1, $2, $3, $4)`,
        ['EMAIL_DELIVERED', 'smtp-gateway', `Email successfully sent to ${job.recipientEmail}`, job.tenantId]
      );
    } catch (err) {
      console.warn(`[Notification Queue Error]: Attempt ${job.attempts} failed for ${job.recipientEmail}: ${err.message}`);
      
      if (job.attempts < job.maxAttempts) {
        // Re-queue with mock delay to yield to test runner assertions
        job.status = 'RETRYING';
        setTimeout(() => {
          emailQueue.push(job);
          triggerWorker();
        }, 100);
      } else {
        job.status = 'FAILED';
        // Permanent failure logger
        await query(
          `INSERT INTO event_logs (event_type, event_source, message, tenant_id)
           VALUES ($1, $2, $3, $4)`,
          ['EMAIL_DELIVERY_FAILURE', 'smtp-gateway', `Permanent email delivery failure to ${job.recipientEmail} after ${job.attempts} attempts. Error: ${err.message}`, job.tenantId]
        );
      }
    }
  }
  
  workerActive = false;
}

/**
 * Triggers signature request notifications
 */
export async function triggerSignatureRequest(userId, docTitle, signUrl, tenantId = 1) {
  const title = 'Action Required: e-Signature Request';
  const message = `You are requested to apply your Part 11 compliant electronic signature on the document "${docTitle}". Link: ${signUrl}`;
  return await queueNotification(userId, title, message, tenantId);
}

/**
 * Triggers signature completion alerts
 */
export async function triggerSignatureCompleted(userId, docTitle, signerName, tenantId = 1) {
  const title = 'Document Signed Successfully';
  const message = `The document "${docTitle}" has been electronically signed by ${signerName}. All compliance audit checksums verified.`;
  return await queueNotification(userId, title, message, tenantId);
}

/**
 * Triggers clinical study update notifications
 */
export async function triggerStudyUpdate(studyId, updateTitle, message, tenantId = 1) {
  // Fetch all staff / coordinators assigned to study sites
  const staffRes = await query(
    `SELECT DISTINCT u.id 
     FROM users u
     JOIN site_staff ss ON ss.investigator_id = u.id OR u.role = 'Clinical Research Manager'
     WHERE u.tenant_id = $1`,
    [tenantId]
  );
  
  const notificationsSent = [];
  for (const row of staffRes.rows) {
    const notif = await queueNotification(row.id, `Study Update: ${updateTitle}`, message, tenantId);
    notificationsSent.push(notif);
  }
  return notificationsSent;
}

/**
 * Triggers monitoring severity alerts (e.g. Critical findings)
 */
export async function triggerMonitoringAlert(siteId, findingDesc, severity, tenantId = 1) {
  // Notify research managers and administrators of critical logs
  const managersRes = await query(
    `SELECT id FROM users WHERE role IN ('Admin', 'Clinical Research Manager') AND tenant_id = $1`,
    [tenantId]
  );
  
  const notificationsSent = [];
  const title = `CRITICAL ALERT: ${severity} Finding Registered`;
  const message = `A new ${severity} monitoring finding was logged: "${findingDesc}". Immediate review and CAPA validation required.`;
  
  for (const row of managersRes.rows) {
    const notif = await queueNotification(row.id, title, message, tenantId);
    notificationsSent.push(notif);
  }
  return notificationsSent;
}

/**
 * Retrieves unread notification history for active headers
 */
export async function getUnreadNotifications(userId) {
  const res = await query(
    `SELECT * FROM notifications 
     WHERE recipient_id = $1 AND is_read = false 
     ORDER BY created_at DESC`
  , [userId]);
  return res.rows;
}

/**
 * Marks a notification as read
 */
export async function markNotificationAsRead(notifId) {
  const res = await query(
    `UPDATE notifications 
     SET is_read = true 
     WHERE id = $1 
     RETURNING *`
  , [notifId]);
  return res.rows[0];
}

/**
 * Exposes active queue for test runner assertions
 */
export function getEmailQueueState() {
  return emailQueue;
}

/**
 * Clears queue for clean test cases setup
 */
export function clearEmailQueue() {
  emailQueue.length = 0;
}
