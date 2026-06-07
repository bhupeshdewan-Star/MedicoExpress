import { query, tenantStorage } from '../config/db.js';

/**
 * Custom Domain & Subdomain Tenant Router Middleware.
 * Resolves active tenant context based on HTTP hostname and sets AsyncLocalStorage bounds.
 */
export async function domainRoutingMiddleware(req, res, next) {
  const host = req.headers.host || req.hostname || '';
  const hostClean = host.split(':')[0].toLowerCase(); // Remove port

  try {
    let tenantId = 1; // Fallback default tenant ID

    // Developer testing overrides (HTTP header or URL query param)
    if (req.headers['x-tenant-id']) {
      tenantId = parseInt(req.headers['x-tenant-id'], 10);
    } else if (req.query.tenant_id) {
      tenantId = parseInt(req.query.tenant_id, 10);
    } else if (req.user && req.user.tenant_id) {
      // Resolve from authenticated JWT payload
      tenantId = req.user.tenant_id;
    } else if (hostClean !== 'localhost' && hostClean !== '127.0.0.1' && hostClean !== 'localhost.localdomain') {
      // 1. Resolve subdomains (e.g. boston.clincommand.com -> name ILIKE 'boston')
      const subdomain = hostClean.split('.')[0];
      
      // 2. Query matching domains or subdomain names
      const tenantQuery = `
        SELECT id FROM tenants 
        WHERE LOWER(domain) = $1 
           OR LOWER(name) = $2
        LIMIT 1
      `;
      const tenantRes = await query(tenantQuery, [hostClean, subdomain]);
      
      if (tenantRes.rows.length > 0) {
        tenantId = tenantRes.rows[0].id;
      }
    }

    // Check suspension status before routing request
    const tenantStatusRes = await query('SELECT status FROM tenants WHERE id = $1', [tenantId]);
    if (tenantStatusRes.rows.length > 0 && tenantStatusRes.rows[0].status === 'SUSPENDED') {
      // Bypass check only if visiting system public endpoints (like login or status)
      const publicPaths = ['/api/auth/login', '/api/v1/auth/login', '/api/v1/status', '/api/v1/health'];
      if (!publicPaths.includes(req.path)) {
        return res.status(403).json({
          success: false,
          errors: ['Forbidden: This tenant environment has been SUSPENDED. Please contact customer success.']
        });
      }
    }

    // Bind thread execution loop to AsyncLocalStorage store
    tenantStorage.run(tenantId, () => {
      req.tenantId = tenantId;
      next();
    });
  } catch (err) {
    console.error('Multi-Tenant Subdomain Routing Failure:', err.message);
    // Bind to fallback safety context
    tenantStorage.run(1, () => {
      req.tenantId = 1;
      next();
    });
  }
}
