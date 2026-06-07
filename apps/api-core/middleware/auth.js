import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { query, tenantStorage } from '../config/db.js';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'clincommand-secret-key-100-percent-secure-gxp-audit';

/**
 * Validates JWT access token, queries user state, checks tenant status, and sets the RLS context.
 */
export function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    jwt.verify(token, JWT_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(403).json({ error: "Forbidden: Session expired or invalid token" });
      }
      
      try {
        // Enforce DB query verification of active status
        const userRes = await query('SELECT * FROM users WHERE id = $1', [decoded.id]);
        if (userRes.rows.length === 0) {
          return res.status(403).json({ error: "Forbidden: Account not found" });
        }

        const user = userRes.rows[0];
        if (!user.is_active) {
          return res.status(403).json({ error: "Forbidden: User account is inactive" });
        }

        // EPIC 7: SaaS Tenant Controls - Check if tenant is SUSPENDED
        const tenantId = user.tenant_id || 1;
        const tenantRes = await query('SELECT status FROM tenants WHERE id = $1', [tenantId]);
        const tenant = tenantRes.rows[0];

        if (tenant && tenant.status === 'SUSPENDED') {
          return res.status(403).json({ error: "Forbidden: Tenant account has been SUSPENDED" });
        }

        // Attach verified details to request
        req.user = {
          id: user.id,
          username: user.username,
          role: user.role,
          tenant_id: tenantId
        };

        // Run the remainder of the route within the AsyncLocalStorage tenant context
        tenantStorage.run(tenantId, () => {
          next();
        });
      } catch (dbErr) {
        console.error('Auth Middleware Database Check Error:', dbErr.message);
        return res.status(500).json({ error: "Internal session authentication validation error" });
      }
    });
  } else {
    res.status(401).json({ error: "Unauthorized: Missing auth token" });
  }
}

/**
 * Enforces specific user roles on the route.
 */
export function requireRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized: Missing authentication context" });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: `Forbidden: Access restricted to [${allowedRoles.join(', ')}] roles` });
    }
    next();
  };
}
