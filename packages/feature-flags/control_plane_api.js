import express from 'express';

/**
 * Express Router for Feature Flag Live Control Plane API
 */
export function createFeatureFlagsRouter(flagEngine) {
  const router = express.Router();

  router.post('/toggle', async (req, res) => {
    const { flagName, enabled, tenantId } = req.body;
    const userCtx = req.user 
      ? { id: req.user.id, username: req.user.username, role: req.user.role, ipAddress: req.ip }
      : { id: 1, username: 'admin', role: 'Admin', ipAddress: req.ip };
    
    try {
      if (tenantId) {
        await flagEngine.setTenantOverride(tenantId, flagName, enabled, userCtx);
        res.json({ success: true, message: `Tenant override set: ${flagName} = ${enabled}` });
      } else {
        const flag = await flagEngine.updateFlag(flagName, { enabled }, userCtx);
        res.json({ success: true, data: flag });
      }
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  router.post('/rollback_all', async (req, res) => {
    const userCtx = req.user 
      ? { id: req.user.id, username: req.user.username, role: req.user.role, ipAddress: req.ip }
      : { id: 1, username: 'admin', role: 'Admin', ipAddress: req.ip };
      
    try {
      for (const flag of flagEngine.flags.keys()) {
        await flagEngine.updateFlag(flag, { enabled: false, killSwitch: true }, userCtx);
      }
      res.json({ success: true, message: 'Global kill switches enabled. All flags disabled.' });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  router.post('/gradual_rollout', async (req, res) => {
    const { flagName, rollout } = req.body;
    const userCtx = req.user 
      ? { id: req.user.id, username: req.user.username, role: req.user.role, ipAddress: req.ip }
      : { id: 1, username: 'admin', role: 'Admin', ipAddress: req.ip };
      
    try {
      const flag = await flagEngine.updateFlag(flagName, { rollout }, userCtx);
      res.json({ success: true, data: flag });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  router.get('/runtime_state', (req, res) => {
    const state = {};
    for (const [name, config] of flagEngine.flags.entries()) {
      state[name] = { ...config };
    }
    const overrides = {};
    for (const [tId, map] of flagEngine.tenantOverrides.entries()) {
      overrides[tId] = Object.fromEntries(map.entries());
    }
    res.json({ success: true, flags: state, overrides });
  });

  return router;
}
