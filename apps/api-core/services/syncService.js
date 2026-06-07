import { query } from '../config/db.js';

export async function processSyncPayload(tenantId, userId, changes) {
  const results = {
    synced: [],
    failed: [],
    conflicts: []
  };

  for (const change of changes) {
    const { entity_type, entity_id, operation_type, payload_json, last_modified_at } = change;
    let payload = typeof payload_json === 'string' ? JSON.parse(payload_json) : payload_json;

    try {
      // 1. Conflict Resolution check for UPDATE operations
      if (operation_type === 'UPDATE') {
        const serverCheck = await getRecordLastModified(entity_type, entity_id);
        if (serverCheck) {
          const serverModified = new Date(serverCheck.updated_at || serverCheck.created_at);
          const clientModified = new Date(last_modified_at);

          // If server version is newer, register a conflict (Server Wins or Client Wins resolution)
          if (serverModified > clientModified) {
            results.conflicts.push({
              entity_type,
              entity_id,
              server_data: serverCheck,
              client_data: payload,
              reason: 'Server version is newer than client offline changes.'
            });
            continue; // Skip applying this change, let client resolve
          }
        }
      }

      // 2. Apply change based on entity and operation type
      await applyChange(entity_type, entity_id, operation_type, payload, tenantId, userId);
      
      // 3. Mark in change journal
      await query(
        `INSERT INTO offline_change_journal (entity_type, entity_id, operation_type, payload_json, last_modified_at, is_synced)
         VALUES ($1, $2, $3, $4, $5, TRUE)`,
        [entity_type, entity_id, JSON.stringify(payload), last_modified_at, new Date().toISOString()]
      );

      results.synced.push({ entity_type, entity_id });
    } catch (err) {
      console.error(`Sync failed for ${entity_type}:${entity_id}`, err.message);
      results.failed.push({ entity_type, entity_id, error: err.message });
    }
  }

  return results;
}

async function getRecordLastModified(entityType, entityId) {
  const tableMap = {
    'sop': 'sops',
    'skill': 'skills',
    'appraisal': 'product_appraisals',
    'knowledge': 'knowledge_documents',
    'audit': 'audit_logs',
    'notification': 'notifications'
  };

  const tableName = tableMap[entityType.toLowerCase()];
  if (!tableName) return null;

  try {
    const res = await query(`SELECT * FROM ${tableName} WHERE id = $1`, [entityId]);
    return res.rows[0] || null;
  } catch (err) {
    return null;
  }
}

async function applyChange(entityType, entityId, operationType, payload, tenantId, userId) {
  const type = entityType.toLowerCase();

  if (type === 'sop') {
    if (operationType === 'CREATE') {
      await query(
        `INSERT INTO sops (code, title, category_id, template_id, version, content, dynamic_metadata, status, tenant_id, creator_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [payload.code, payload.title, payload.category_id, payload.template_id, payload.version || '1.0.0', payload.content, JSON.stringify(payload.dynamic_metadata || {}), payload.status || 'Draft', tenantId, userId]
      );
    } else if (operationType === 'UPDATE') {
      await query(
        `UPDATE sops SET title = $1, content = $2, version = $3, status = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5`,
        [payload.title, payload.content, payload.version, payload.status, entityId]
      );
    } else if (operationType === 'DELETE') {
      await query(`DELETE FROM sops WHERE id = $1`, [entityId]);
    }
  } else if (type === 'skill') {
    if (operationType === 'CREATE') {
      await query(
        `INSERT INTO skills (name, description, category_id, template_id, current_version, is_published, system_prompt, user_prompt, validation_rules, execution_policy, tenant_id, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [payload.name, payload.description, payload.category_id, payload.template_id, payload.current_version || '1.0.0', payload.is_published || false, payload.system_prompt, payload.user_prompt, JSON.stringify(payload.validation_rules || {}), JSON.stringify(payload.execution_policy || {}), tenantId, userId]
      );
    } else if (operationType === 'UPDATE') {
      await query(
        `UPDATE skills SET name = $1, description = $2, is_published = $3, system_prompt = $4, user_prompt = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6`,
        [payload.name, payload.description, payload.is_published, payload.system_prompt, payload.user_prompt, entityId]
      );
    }
  } else if (type === 'appraisal') {
    if (operationType === 'CREATE') {
      await query(
        `INSERT INTO product_appraisals (product_id, template_id, title, code, current_version, status, tenant_id, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [payload.product_id, payload.template_id, payload.title, payload.code, payload.current_version || '1.0.0', payload.status || 'Draft', tenantId, userId]
      );
    } else if (operationType === 'UPDATE') {
      await query(
        `UPDATE product_appraisals SET title = $1, status = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3`,
        [payload.title, payload.status, entityId]
      );
    }
  } else if (type === 'knowledge') {
    if (operationType === 'CREATE') {
      await query(
        `INSERT INTO knowledge_documents (code, title, collection_id, current_version, content, status, tenant_id, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [payload.code, payload.title, payload.collection_id, payload.current_version || '1.0.0', payload.content, payload.status || 'Draft', tenantId, userId]
      );
    } else if (operationType === 'UPDATE') {
      await query(
        `UPDATE knowledge_documents SET title = $1, content = $2, status = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4`,
        [payload.title, payload.content, payload.status, entityId]
      );
    }
  } else if (type === 'audit') {
    if (operationType === 'CREATE') {
      await query(
        `INSERT INTO audit_logs (user_id, username, user_role, action_type, target_resource, details, ip_address, timestamp)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [userId, payload.username, payload.user_role, payload.action_type, payload.target_resource, payload.details, payload.ip_address || '127.0.0.1', payload.timestamp || new Date().toISOString()]
      );
    }
  } else if (type === 'notification') {
    if (operationType === 'CREATE') {
      await query(
        `INSERT INTO notifications (recipient_id, title, message, is_read, created_at)
         VALUES ($1, $2, $3, $4, $5)`,
        [payload.recipient_id, payload.title, payload.message, payload.is_read || false, payload.created_at || new Date().toISOString()]
      );
    } else if (operationType === 'UPDATE') {
      await query(`UPDATE notifications SET is_read = $1 WHERE id = $2`, [payload.is_read, entityId]);
    }
  }
}
