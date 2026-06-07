import { query } from '../config/db.js';

// Express middleware to automatically log GxP operations
export async function logAudit(userId, username, role, actionType, targetResource, details, ipAddress) {
  try {
    const sql = `
      INSERT INTO audit_logs (user_id, username, user_role, action_type, target_resource, details, ip_address)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `;
    await query(sql, [userId, username, role, actionType, targetResource, details, ipAddress]);
    console.log(`GxP Audit Logged: ${actionType} on ${targetResource} by ${username} (${role})`);
  } catch (err) {
    console.error('Audit Logging Failed:', err.message);
  }
}

// Request interceptor helper for logging active actions
export function auditTrailHandler(actionType, resourceExtractor) {
  return async (req, res, next) => {
    // Save original send to intercept response success
    const originalSend = res.send;
    res.send = function (body) {
      res.send = originalSend;
      if (res.statusCode >= 200 && res.statusCode < 300) {
        if (req.user) {
          const target = typeof resourceExtractor === 'function' ? resourceExtractor(req) : resourceExtractor;
          const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
          logAudit(
            req.user.id,
            req.user.username,
            req.user.role,
            actionType,
            target || req.originalUrl,
            JSON.stringify({ method: req.method, params: req.params, query: req.query }),
            ip
          );
        }
      }
      return res.send(body);
    };
    next();
  };
}
