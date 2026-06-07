import { query, executeTransaction } from '../config/db.js';
import { logAudit } from '../middleware/audit.js';

/**
 * Provisions a new SaaS Tenant environment with default subscriptions and branding configurations.
 */
export async function createTenant(tenantData, user) {
  const { name, domain, plan_tier, is_pilot, environment } = tenantData;

  if (!name || !domain) {
    throw new Error('Tenant organization name and domain are required.');
  }

  return await executeTransaction(async (client) => {
    // 1. Insert into tenants
    const tenantSql = `
      INSERT INTO tenants (name, domain, status, is_pilot, environment, created_at)
      VALUES ($1, $2, 'ACTIVE', $3, $4, CURRENT_TIMESTAMP)
      RETURNING *
    `;
    const tenantRes = await client.query(tenantSql, [name, domain, !!is_pilot, environment || 'production']);
    const tenant = tenantRes.rows[0];

    // 2. Provision default subscription billing record
    const periodEnd = new Date();
    periodEnd.setDate(periodEnd.getDate() + 30);
    const subSql = `
      INSERT INTO billing_subscriptions (tenant_id, plan_tier, status, current_period_end)
      VALUES ($1, $2, 'active', $3)
    `;
    await client.query(subSql, [tenant.id, plan_tier || 'Starter', periodEnd.toISOString()]);

    // 3. Populate default theme/branding configurations
    const brandSettings = [
      { key: 'logo_url', val: '/assets/logo-default.svg' },
      { key: 'brand_color', val: '#0f766e' }, // Teal 700 default
      { key: 'theme_mode', val: 'dark' }
    ];

    for (const setting of brandSettings) {
      await client.query(
        `INSERT INTO tenant_settings (tenant_id, setting_key, setting_value)
         VALUES ($1, $2, $3)
         ON CONFLICT (tenant_id, setting_key) DO UPDATE SET setting_value = EXCLUDED.setting_value`,
        [tenant.id, setting.key, setting.val]
      );
    }

    // 4. Log creation audit event
    if (user) {
      const pilotTag = is_pilot ? '[PILOT_ENABLED]' : '[STANDARD]';
      await logAudit(
        user.id,
        user.username,
        user.role,
        'PROVISION_TENANT',
        `tenants/${tenant.id}`,
        `Provisioned ${pilotTag} tenant ${name} on domain ${domain} under ${environment || 'production'} with plan ${plan_tier || 'Starter'}`,
        user.ipAddress || '127.0.0.1'
      );
    }

    return tenant;
  });
}

/**
 * Toggles a tenant's lifecycle state (ACTIVE, SUSPENDED, DELETED)
 */
export async function updateTenantStatus(tenantId, newStatus, user) {
  const allowedStatuses = ['ACTIVE', 'SUSPENDED', 'DELETED', 'ARCHIVED'];
  if (!allowedStatuses.includes(newStatus.toUpperCase())) {
    throw new Error(`Invalid tenant status: ${newStatus}`);
  }

  const sql = `
    UPDATE tenants
    SET status = $1
    WHERE id = $2
    RETURNING *
  `;
  const result = await query(sql, [newStatus.toUpperCase(), tenantId]);
  const updatedTenant = result.rows[0];

  if (!updatedTenant) {
    throw new Error('Tenant not found.');
  }

  if (user) {
    await logAudit(
      user.id,
      user.username,
      user.role,
      'UPDATE_TENANT_STATUS',
      `tenants/${tenantId}`,
      `Updated status of tenant ID ${tenantId} to ${newStatus.toUpperCase()}`,
      user.ipAddress || '127.0.0.1'
    );
  }

  return updatedTenant;
}

/**
 * Configures brand parameters (colors, files logos)
 */
export async function configureBranding(tenantId, brandingData, user) {
  const { logo_url, brand_color, theme_mode } = brandingData;

  const updates = [];
  if (logo_url !== undefined) updates.push({ key: 'logo_url', val: logo_url });
  if (brand_color !== undefined) updates.push({ key: 'brand_color', val: brand_color });
  if (theme_mode !== undefined) updates.push({ key: 'theme_mode', val: theme_mode });

  for (const item of updates) {
    await query(
      `INSERT INTO tenant_settings (tenant_id, setting_key, setting_value)
       VALUES ($1, $2, $3)
       ON CONFLICT (tenant_id, setting_key) DO UPDATE SET setting_value = EXCLUDED.setting_value`,
      [tenantId, item.key, item.val]
    );
  }

  if (user) {
    await logAudit(
      user.id,
      user.username,
      user.role,
      'CONFIGURE_TENANT_BRANDING',
      `tenants/${tenantId}/settings`,
      `Updated brand settings for tenant ID ${tenantId}`,
      user.ipAddress || '127.0.0.1'
    );
  }

  return { success: true };
}

/**
 * Returns complete tenant config settings
 */
export async function getTenantConfig(tenantId) {
  const tenantRes = await query('SELECT * FROM tenants WHERE id = $1', [tenantId]);
  const settingsRes = await query('SELECT setting_key, setting_value FROM tenant_settings WHERE tenant_id = $1', [tenantId]);

  if (tenantRes.rows.length === 0) {
    throw new Error('Tenant not found.');
  }

  const settings = {};
  settingsRes.rows.forEach(r => {
    settings[r.setting_key] = r.setting_value;
  });

  return {
    ...tenantRes.rows[0],
    settings
  };
}

/**
 * Security: Validates active multi-tenant Row-Level Isolation checks
 */
export async function validateTenantIsolation(activeTenantId) {
  // Query studies table to confirm database context blocks other tenant entries
  const testQuery = await query('SELECT DISTINCT tenant_id FROM studies');
  const isolated = testQuery.rows.every(r => r.tenant_id === activeTenantId);
  return {
    isolated,
    scannedCount: testQuery.rows.length,
    activeTenantId
  };
}
