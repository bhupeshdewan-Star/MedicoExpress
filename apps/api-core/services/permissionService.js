import { query } from '../config/db.js';

// Pre-defined role-to-permission mapping dictionary for enterprise defaults
const defaultRolePermissions = {
  'Admin': [
    'VIEW_SOP', 'EDIT_SOP', 'APPROVE_SOP', 'VIEW_AUDITS', 
    'MANAGE_USERS', 'MANAGE_TENANT', 'RUN_VALIDATIONS', 'SIGN_DOCUMENTS'
  ],
  'Head of Medical Affairs': [
    'VIEW_SOP', 'EDIT_SOP', 'APPROVE_SOP', 'SIGN_DOCUMENTS', 'RUN_VALIDATIONS'
  ],
  'Quality Assurance': [
    'VIEW_SOP', 'VIEW_AUDITS', 'RUN_VALIDATIONS', 'SIGN_DOCUMENTS'
  ],
  'Medical Manager': [
    'VIEW_SOP', 'EDIT_SOP', 'SIGN_DOCUMENTS'
  ],
  'Regulatory Manager': [
    'VIEW_SOP', 'EDIT_SOP', 'SIGN_DOCUMENTS'
  ],
  'Clinical Research Manager': [
    'VIEW_SOP', 'EDIT_SOP', 'SIGN_DOCUMENTS'
  ],
  'Medical Writer': [
    'VIEW_SOP', 'EDIT_SOP'
  ],
  'Medical Advisor': [
    'VIEW_SOP', 'SIGN_DOCUMENTS'
  ],
  'Training Manager': [
    'VIEW_SOP'
  ],
  'Viewer': [
    'VIEW_SOP'
  ]
};

/**
 * Checks if a user has a specific granular permission
 */
export async function hasPermission(userId, userRole, requiredPermission, tenantId) {
  // 1. Check user-specific permissions override in database
  const userOverride = await query(
    `SELECT 1 FROM user_permissions up
     JOIN permissions p ON up.permission_id = p.id
     WHERE up.user_id = $1 AND p.name = $2`,
    [userId, requiredPermission]
  );
  if (userOverride.rows.length > 0) {
    return true;
  }

  // 2. Check role-specific permissions override in database
  const roleOverride = await query(
    `SELECT 1 FROM role_permissions rp
     JOIN permissions p ON rp.permission_id = p.id
     WHERE rp.role_name = $1 AND p.name = $2`,
    [userRole, requiredPermission]
  );
  if (roleOverride.rows.length > 0) {
    return true;
  }

  // 3. Fallback to hardcoded role mapping dictionary defaults
  const permissions = defaultRolePermissions[userRole] || [];
  return permissions.includes(requiredPermission);
}

/**
 * Lists all active permissions mapped to a role
 */
export async function getPermissionsForRole(roleName) {
  return defaultRolePermissions[roleName] || [];
}
