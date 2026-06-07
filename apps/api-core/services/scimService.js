import crypto from 'crypto';
import { query } from '../config/db.js';
import { logAudit } from '../middleware/audit.js';

/**
 * Enterprise SCIM 2.0 User & Group Provisioning Service.
 */

/**
 * SCIM v2/Users POST - Provision a user
 */
export async function scimCreateUser(payload, tenantId, ipAddress = '127.0.0.1') {
  const { userName, emails, active } = payload;
  const emailVal = emails && emails[0] ? emails[0].value : null;

  if (!userName || !emailVal) {
    throw new Error('SCIM Schema Error: Missing userName or email parameters');
  }

  // Ensure unique check
  const duplicateCheck = await query('SELECT 1 FROM users WHERE username = $1 OR email = $2', [userName, emailVal]);
  if (duplicateCheck.rows.length > 0) {
    throw new Error('Conflict: SCIM User username/email already exists');
  }

  const passwordHash = crypto.randomUUID(); // Lock password
  const defaultRole = 'Viewer';

  const userRes = await query(
    `INSERT INTO users (username, email, password_hash, role, is_active, tenant_id)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, username, email, role, is_active`,
    [userName, emailVal, passwordHash, defaultRole, active !== false, tenantId]
  );
  
  const newUser = userRes.rows[0];

  // Log SCIM provisioning transaction to the cryptographic audit vault
  await logAudit(
    null,
    'SCIM_PROVISIONER',
    'Admin',
    'SCIM_CREATE_USER',
    'scim/v2/Users',
    `SCIM User ${newUser.username} provisioned successfully. Role: ${newUser.role}`,
    ipAddress
  );

  return mapUserToSCIMResponse(newUser);
}

/**
 * SCIM v2/Users/{id} DELETE - De-provision user
 */
export async function scimDeleteUser(userId, tenantId, ipAddress = '127.0.0.1') {
  // GxP standard: De-provision means setting is_active = FALSE (never delete hard records)
  const checkRes = await query('SELECT username FROM users WHERE id = $1', [userId]);
  const user = checkRes.rows[0];

  if (!user) {
    throw new Error('Not Found: User target not found');
  }

  await query('UPDATE users SET is_active = FALSE WHERE id = $1', [userId]);

  await logAudit(
    null,
    'SCIM_PROVISIONER',
    'Admin',
    'SCIM_DEACTIVATE_USER',
    `scim/v2/Users/${userId}`,
    `SCIM User ${user.username} deactivated successfully.`,
    ipAddress
  );

  return true;
}

/**
 * SCIM v2/Users GET - List users
 */
export async function scimListUsers(tenantId) {
  const usersRes = await query('SELECT id, username, email, role, is_active FROM users');
  return {
    schemas: ["urn:ietf:params:scim:api:messages:2.0:ListResponse"],
    totalResults: usersRes.rows.length,
    Resources: usersRes.rows.map(mapUserToSCIMResponse)
  };
}

function mapUserToSCIMResponse(user) {
  return {
    schemas: ["urn:ietf:params:scim:schemas:core:2.0:User"],
    id: user.id.toString(),
    userName: user.username,
    emails: [{ value: user.email, primary: true }],
    active: user.is_active,
    meta: {
      resourceType: "User",
      created: new Date().toISOString()
    }
  };
}
