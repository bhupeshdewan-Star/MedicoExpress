import { query } from '../config/db.js';
import { logAudit } from '../middleware/audit.js';

/**
 * Bulk insert supply kits into study depot inventory
 */
export async function addSupplyKits(studyId, kits, tenantId = 1, user = null) {
  const insertedKits = [];

  for (const kit of kits) {
    const { kitNumber, treatmentArm, expirationDate, siteId } = kit;
    const sql = `
      INSERT INTO study_supply_kits (study_id, site_id, kit_number, treatment_arm, status, is_blinded, expiration_date, tenant_id)
      VALUES ($1, $2, $3, $4, 'AVAILABLE', true, $5, $6)
      ON CONFLICT (kit_number) DO UPDATE SET
        site_id = EXCLUDED.site_id,
        expiration_date = EXCLUDED.expiration_date,
        status = 'AVAILABLE'
      RETURNING *
    `;
    const res = await query(sql, [
      studyId,
      siteId || null, // null siteId means in global depot stock
      kitNumber,
      treatmentArm,
      expirationDate,
      tenantId
    ]);
    insertedKits.push(res.rows[0]);
  }

  if (user) {
    await logAudit(
      user.id,
      user.username,
      user.role,
      'ADD_SUPPLY_KITS',
      `studies/${studyId}/inventory`,
      `Added ${kits.length} supply kits to study inventory.`,
      user.ipAddress || '127.0.0.1'
    );
  }

  return insertedKits;
}

/**
 * Dispatches a list of kits to a specific site inventory
 */
export async function shipKitsToSite(kitIds, siteId, user = null) {
  if (!kitIds || kitIds.length === 0) {
    throw new Error('List of kit IDs to ship is empty.');
  }

  const updatedKits = [];
  const tenantId = user?.tenant_id || 1;

  for (const id of kitIds) {
    const sql = `
      UPDATE study_supply_kits
      SET site_id = $1, status = 'AVAILABLE', updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND status = 'AVAILABLE'
      RETURNING *
    `;
    const res = await query(sql, [siteId, id]);
    if (res.rows.length > 0) {
      updatedKits.push(res.rows[0]);
      
      // Log event
      await query(
        `INSERT INTO event_logs (event_type, event_source, message, tenant_id)
         VALUES ($1, $2, $3, $4)`,
        ['KIT_SHIPPED', 'supply-service', `Shipped kit ID ${id} to site ID ${siteId}`, tenantId]
      );
    }
  }

  if (user && updatedKits.length > 0) {
    await logAudit(
      user.id,
      user.username,
      user.role,
      'SHIP_SUPPLY_KITS',
      `sites/${siteId}/inventory`,
      `Shipped ${updatedKits.length} kits to site ID ${siteId}`,
      user.ipAddress || '127.0.0.1'
    );
  }

  return updatedKits;
}

/**
 * Places a kit in quarantine for safety/temperature deviation audits
 */
export async function quarantineKit(kitId, reason, user = null) {
  const sql = `
    UPDATE study_supply_kits
    SET status = 'QUARANTINED', updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING *
  `;
  const res = await query(sql, [kitId]);
  const kit = res.rows[0];

  if (!kit) {
    throw new Error('Supply kit not found.');
  }

  const tenantId = user?.tenant_id || 1;
  await query(
    `INSERT INTO event_logs (event_type, event_source, message, tenant_id)
     VALUES ($1, $2, $3, $4)`,
    ['KIT_QUARANTINED', 'supply-service', `Quarantined kit ID ${kitId}. Reason: ${reason}`, tenantId]
  );

  if (user) {
    await logAudit(
      user.id,
      user.username,
      user.role,
      'QUARANTINE_KIT',
      `kits/${kitId}`,
      `Quarantined kit ID ${kitId}. Reason: ${reason}`,
      user.ipAddress || '127.0.0.1'
    );
  }

  return kit;
}

/**
 * Releases a kit from quarantine back into active stock
 */
export async function releaseKit(kitId, user = null) {
  const sql = `
    UPDATE study_supply_kits
    SET status = 'AVAILABLE', updated_at = CURRENT_TIMESTAMP
    WHERE id = $1 AND status = 'QUARANTINED'
    RETURNING *
  `;
  const res = await query(sql, [kitId]);
  const kit = res.rows[0];

  if (!kit) {
    throw new Error('Quarantined supply kit not found or not in quarantine.');
  }

  const tenantId = user?.tenant_id || 1;
  await query(
    `INSERT INTO event_logs (event_type, event_source, message, tenant_id)
     VALUES ($1, $2, $3, $4)`,
    ['KIT_RELEASED', 'supply-service', `Released kit ID ${kitId} back to active stock.`, tenantId]
  );

  if (user) {
    await logAudit(
      user.id,
      user.username,
      user.role,
      'RELEASE_KIT_QUARANTINE',
      `kits/${kitId}`,
      `Released kit ID ${kitId} from quarantine to AVAILABLE.`,
      user.ipAddress || '127.0.0.1'
    );
  }

  return kit;
}

/**
 * Returns inventory details filtering by depot vs. site locations
 */
export async function getInventorySummary(studyId) {
  // Depot kits (site_id is null)
  const depotRes = await query(
    `SELECT COUNT(*) AS count, status 
     FROM study_supply_kits 
     WHERE study_id = $1 AND site_id IS NULL 
     GROUP BY status`,
    [studyId]
  );
  
  // Site-specific kits
  const siteRes = await query(
    `SELECT ss.name, ss.site_number, COUNT(sk.id) AS count, sk.status 
     FROM study_supply_kits sk
     JOIN study_sites ss ON sk.site_id = ss.id
     WHERE sk.study_id = $1
     GROUP BY ss.name, ss.site_number, sk.status`,
    [studyId]
  );

  // Expiring kits soon (within 60 days)
  const expiringRes = await query(
    `SELECT * FROM study_supply_kits 
     WHERE study_id = $1 
       AND status = 'AVAILABLE' 
       AND expiration_date < CURRENT_TIMESTAMP + INTERVAL '60 days'
     ORDER BY expiration_date ASC`,
    [studyId]
  );

  return {
    depotStock: depotRes.rows,
    siteStocks: siteRes.rows,
    expiringSoon: expiringRes.rows
  };
}

/**
 * Runs stock reconciliation reports confirming dispensation rates
 */
export async function reconcileStock(studyId) {
  const totalKits = await query('SELECT COUNT(*) AS count FROM study_supply_kits WHERE study_id = $1', [studyId]);
  const activeKits = await query("SELECT COUNT(*) AS count FROM study_supply_kits WHERE study_id = $1 AND status = 'AVAILABLE'", [studyId]);
  const dispensedKits = await query("SELECT COUNT(*) AS count FROM study_supply_kits WHERE study_id = $1 AND status = 'DISPENSED'", [studyId]);
  const quarantinedKits = await query("SELECT COUNT(*) AS count FROM study_supply_kits WHERE study_id = $1 AND status = 'QUARANTINED'", [studyId]);

  return {
    studyId,
    reconciledAt: new Date().toISOString(),
    total: parseInt(totalKits.rows[0].count, 10),
    available: parseInt(activeKits.rows[0].count, 10),
    dispensed: parseInt(dispensedKits.rows[0].count, 10),
    quarantined: parseInt(quarantinedKits.rows[0].count, 10)
  };
}
