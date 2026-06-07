import crypto from 'crypto';

/**
 * Tenant-Aware Feature Flag Control Engine (GAMP 5 Category 4 Qualified)
 */
export class FeatureFlagEngine {
  constructor(options = {}) {
    // Dynamic flags store (can be overridden per environment or tenant)
    this.flags = new Map([
      ['wearables_telemetry', { enabled: true, rollout: 100, killSwitch: false }],
      ['rsdv_ocr', { enabled: true, rollout: 100, killSwitch: false }],
      ['rbm_ai', { enabled: true, rollout: 100, killSwitch: false }],
      ['dct_virtual_visits', { enabled: true, rollout: 100, killSwitch: false }],
      ['epro_sync', { enabled: true, rollout: 100, killSwitch: false }]
    ]);

    // Local overrides for specific tenants: tenantId -> Map(flagName -> boolean)
    this.tenantOverrides = new Map();

    // Set configuration from environment variables if present
    this.initializeFromEnv();
    
    // Audit logging callback hook
    this.auditLogger = options.auditLogger || null;
  }

  /**
   * Initializes flag configurations from system environment variables
   */
  initializeFromEnv() {
    for (const flag of this.flags.keys()) {
      const envEnabled = process.env[`FLAG_${flag.toUpperCase()}_ENABLED`];
      const envRollout = process.env[`FLAG_${flag.toUpperCase()}_ROLLOUT`];
      const envKill = process.env[`FLAG_${flag.toUpperCase()}_KILL_SWITCH`];

      const config = this.flags.get(flag);
      if (envEnabled !== undefined) config.enabled = envEnabled === 'true';
      if (envRollout !== undefined) config.rollout = parseInt(envRollout, 10);
      if (envKill !== undefined) config.killSwitch = envKill === 'true';
    }
  }

  /**
   * Evaluates if a feature flag is enabled for a given tenant context.
   * Employs deterministic hashing for tenant rollout ratios.
   */
  isEnabled(flagName, tenantId = 1) {
    const config = this.flags.get(flagName);
    
    // If flag is unregistered, default to disabled
    if (!config) return false;

    // 1. Check global kill-switch override (takes highest precedence)
    if (config.killSwitch) return false;

    // 2. Check tenant-specific override settings
    const overrides = this.tenantOverrides.get(Number(tenantId));
    if (overrides && overrides.has(flagName)) {
      return overrides.get(flagName);
    }

    // 3. Verify base enablement
    if (!config.enabled) return false;

    // 4. Evaluate gradual rollout percentage using deterministic hashing
    if (config.rollout < 100) {
      if (config.rollout <= 0) return false;
      
      // Hash tenantId + flagName to yield a value between 0 and 99
      const hashInput = `${flagName}_tenant_${tenantId}`;
      const hash = crypto.createHash('sha1').update(hashInput).digest('hex');
      const hashVal = parseInt(hash.substring(0, 8), 16) % 100;
      
      return hashVal < config.rollout;
    }

    return true;
  }

  /**
   * Mutates the state of a feature flag and records an audit log event.
   */
  async updateFlag(flagName, settings, userCtx = {}) {
    const config = this.flags.get(flagName) || { enabled: false, rollout: 100, killSwitch: false };
    
    const oldSettings = { ...config };
    if (settings.enabled !== undefined) config.enabled = !!settings.enabled;
    if (settings.rollout !== undefined) config.rollout = Math.max(0, Math.min(100, settings.rollout));
    if (settings.killSwitch !== undefined) config.killSwitch = !!settings.killSwitch;
    
    this.flags.set(flagName, config);

    // Trigger audit logger hook if registered
    if (this.auditLogger) {
      await this.auditLogger({
        userId: userCtx.id || 0,
        username: userCtx.username || 'SYSTEM',
        role: userCtx.role || 'System Process',
        actionType: 'UPDATE_FEATURE_FLAG',
        targetResource: `feature-flags/${flagName}`,
        details: `Updated flag ${flagName}: enabled=${config.enabled}, rollout=${config.rollout}%, killSwitch=${config.killSwitch} (Was: enabled=${oldSettings.enabled}, rollout=${oldSettings.rollout}%)`,
        ipAddress: userCtx.ipAddress || '127.0.0.1'
      });
    }

    return config;
  }

  /**
   * Registers a tenant override setting.
   */
  async setTenantOverride(tenantId, flagName, value, userCtx = {}) {
    const tId = Number(tenantId);
    if (!this.tenantOverrides.has(tId)) {
      this.tenantOverrides.set(tId, new Map());
    }
    this.tenantOverrides.get(tId).set(flagName, !!value);

    if (this.auditLogger) {
      await this.auditLogger({
        userId: userCtx.id || 0,
        username: userCtx.username || 'SYSTEM',
        role: userCtx.role || 'System Process',
        actionType: 'SET_FLAG_OVERRIDE',
        targetResource: `feature-flags/${flagName}/tenant/${tId}`,
        details: `Set feature override for tenant ${tId}: ${flagName}=${value}`,
        ipAddress: userCtx.ipAddress || '127.0.0.1'
      });
    }
  }

  /**
   * Resets all overridden settings
   */
  clearOverrides() {
    this.tenantOverrides.clear();
  }
}
