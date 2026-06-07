import assert from 'assert';
import { fileURLToPath } from 'url';

/**
 * GAMP 5 Category 4 Qualified Global Multi-Region Orchestrator
 */
export class RegionOrchestrator {
  constructor(options = {}) {
    this.auditStream = options.auditStream || null;
    
    // Region configuration details
    this.regions = {
      'ap-south-1': {
        name: 'Asia Pacific (Mumbai)',
        role: 'ACTIVE_PRIMARY', // ACTIVE_PRIMARY, PASSIVE_STANDBY, OFFLINE
        healthScore: 100,
        avgLatencyMs: 75,
        errorRate: 0.0
      },
      'us-east-1': {
        name: 'US East (N. Virginia)',
        role: 'PASSIVE_STANDBY',
        healthScore: 100,
        avgLatencyMs: 120,
        errorRate: 0.0
      },
      'eu-west-1': {
        name: 'Europe (Ireland)',
        role: 'PASSIVE_STANDBY',
        healthScore: 100,
        avgLatencyMs: 180,
        errorRate: 0.0
      }
    };
    
    // Primary routing bindings: tenantId -> primary region
    this.tenantRegions = {
      2: 'ap-south-1', // NovaBio primary
      1: 'us-east-1'  // Default tenant primary
    };
  }

  /**
   * Resolves the target routing endpoint based on latency, tenant assignment, and health
   */
  getRouteForRequest(tenantId, clientRegion = 'ap-south-1') {
    const primary = this.tenantRegions[Number(tenantId)] || 'us-east-1';
    const primaryMeta = this.regions[primary];

    // If primary region is healthy (healthScore > 60), use it
    if (primaryMeta && primaryMeta.healthScore > 60 && primaryMeta.role !== 'OFFLINE') {
      return primary;
    }

    // Failover scenario: Find the healthiest standby region
    console.warn(`[FAILOVER] Primary region ${primary} is unhealthy (Health: ${primaryMeta.healthScore}%). Locating standby node...`);
    
    let bestRegion = null;
    let maxHealth = -1;

    for (const [regionId, meta] of Object.entries(this.regions)) {
      if (regionId === primary) continue;
      if (meta.role === 'OFFLINE') continue;

      if (meta.healthScore > maxHealth) {
        maxHealth = meta.healthScore;
        bestRegion = regionId;
      }
    }

    if (bestRegion) {
      this.executeRegionalFailover(primary, bestRegion, tenantId);
      return bestRegion;
    }

    throw new Error('CRITICAL DISASTER: No healthy regional endpoints available for routing!');
  }

  /**
   * Promotes a standby region and updates roles
   */
  executeRegionalFailover(fromRegion, toRegion, tenantId) {
    if (this.regions[fromRegion].role === 'ACTIVE_PRIMARY') {
      this.regions[fromRegion].role = 'OFFLINE';
    }
    this.regions[toRegion].role = 'ACTIVE_PRIMARY';
    this.tenantRegions[Number(tenantId)] = toRegion;

    console.log(`[FAILOVER SUCCESS] Shifted tenant ${tenantId} routing from ${fromRegion} to ${toRegion}.`);
    
    if (this.auditStream) {
      this.auditStream.appendEvent('REGIONAL_FAILOVER_EXECUTED', {
        tenantId,
        fromRegion,
        toRegion,
        reason: `Automated failover due to health decay in ${fromRegion}`
      }, { username: 'REGION_ORCHESTRATOR', role: 'Global Router' });
    }
  }

  /**
   * Recalculates health indicators based on active regional performance telemetry
   */
  updateRegionPerformance(regionId, telemetry) {
    const meta = this.regions[regionId];
    if (!meta) return;

    const { errorRate, avgLatencyMs } = telemetry;
    meta.errorRate = errorRate;
    meta.avgLatencyMs = avgLatencyMs;

    // Health Score deduction rules
    let score = 100;
    score -= errorRate * 500; // 10% errors = -50 score
    
    if (avgLatencyMs > 500) {
      score -= Math.min(30, (avgLatencyMs - 500) / 10);
    }
    
    meta.healthScore = Math.max(0, Math.min(100, Math.round(score)));
    console.log(`[REGION HEALTH] ${regionId} Score: ${meta.healthScore}% (Latency: ${avgLatencyMs}ms, Errors: ${(errorRate * 100).toFixed(1)}%)`);
  }
}

// Isolation test runner
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log('Testing region orchestrator in isolation...');
  const orchestrator = new RegionOrchestrator();

  // Nominal case: NovaBio requests route to ap-south-1
  assert.strictEqual(orchestrator.getRouteForRequest(2), 'ap-south-1');

  // Decay health of ap-south-1 to trigger failover
  orchestrator.updateRegionPerformance('ap-south-1', { errorRate: 0.15, avgLatencyMs: 120 }); // Health drops to ~25%
  
  // Resolve route - should failover to us-east-1 (next healthiest)
  const target = orchestrator.getRouteForRequest(2);
  assert.strictEqual(target, 'us-east-1');
  assert.strictEqual(orchestrator.regions['ap-south-1'].role, 'OFFLINE');
  assert.strictEqual(orchestrator.regions['us-east-1'].role, 'ACTIVE_PRIMARY');

  console.log('Isolation validation successful.');
}
