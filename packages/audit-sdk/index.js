import crypto from 'crypto';

export function sha256(text) {
  return crypto.createHash('sha256').update(text).digest('hex');
}

export function logAudit(client, user, actionType, targetResource, details, ipAddress, tenantId) {
  const queryText = `
    INSERT INTO audit_logs (user_id, username, user_role, action_type, target_resource, details, ip_address, tenant_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
  `;
  const params = [
    user.id,
    user.username,
    user.role,
    actionType,
    targetResource,
    details,
    ipAddress || '0.0.0.0',
    tenantId || 1
  ];
  console.log(`[GxP Audit SDK] Logging ${actionType} on ${targetResource} for ${user.username}`);
  return client.query(queryText, params);
}
