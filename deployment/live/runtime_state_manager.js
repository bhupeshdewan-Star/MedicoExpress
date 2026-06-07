import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import assert from 'assert';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const snapshotPath = path.resolve(__dirname, './state_snapshot.json');

/**
 * Runtime System State Manager (GAMP 5 Category 4 Qualified)
 */
export class RuntimeStateManager {
  constructor() {
    this.state = {
      status: 'SYSTEM_STABLE', // SYSTEM_STABLE, SYSTEM_DEGRADED, SYSTEM_THROTTLED, SYSTEM_EMERGENCY_ROLLED_BACK
      activeTenantLoad: { 2: 150, 1: 0 }, // tenant_id -> active requests count
      healthScores: {
        apiCore: 100,
        rbmAi: 100,
        eproSync: 100,
        wearables: 100
      },
      queueDepths: {
        epro: 12,
        telemetry: 45,
        ocr: 0
      },
      lastTransitionTime: new Date().toISOString()
    };
    this.loadSnapshot();
  }

  /**
   * Loads the state snapshot from disk if available
   */
  loadSnapshot() {
    try {
      if (fs.existsSync(snapshotPath)) {
        const raw = fs.readFileSync(snapshotPath, 'utf8');
        this.state = { ...this.state, ...JSON.parse(raw) };
      }
    } catch (err) {
      console.warn('Could not read state snapshot, running with default state:', err.message);
    }
  }

  /**
   * Persists the state snapshot to disk
   */
  saveSnapshot() {
    try {
      fs.mkdirSync(path.dirname(snapshotPath), { recursive: true });
      fs.writeFileSync(snapshotPath, JSON.stringify(this.state, null, 2));
    } catch (err) {
      console.error('Failed to write state snapshot:', err.message);
    }
  }

  /**
   * Transitions system state status and updates history
   */
  transitionTo(newStatus) {
    const validStatuses = ['SYSTEM_STABLE', 'SYSTEM_DEGRADED', 'SYSTEM_THROTTLED', 'SYSTEM_EMERGENCY_ROLLED_BACK'];
    if (!validStatuses.includes(newStatus)) {
      throw new Error(`Invalid status transition target: ${newStatus}`);
    }

    const prev = this.state.status;
    this.state.status = newStatus;
    this.state.lastTransitionTime = new Date().toISOString();
    this.saveSnapshot();

    console.log(`[State Transition] ${prev} ===> ${newStatus} at ${this.state.lastTransitionTime}`);
    return this.state;
  }

  /**
   * Updates health score metrics
   */
  updateHealth(service, score) {
    if (this.state.healthScores[service] !== undefined) {
      this.state.healthScores[service] = Math.max(0, Math.min(100, score));
      this.evaluateStateConstraints();
    }
  }

  /**
   * Updates queue backlog depths
   */
  updateQueue(queue, depth) {
    if (this.state.queueDepths[queue] !== undefined) {
      this.state.queueDepths[queue] = Math.max(0, depth);
      this.evaluateStateConstraints();
    }
  }

  /**
   * Updates request load metrics per tenant
   */
  updateLoad(tenantId, requestCount) {
    this.state.activeTenantLoad[Number(tenantId)] = Math.max(0, requestCount);
    this.evaluateStateConstraints();
  }

  /**
   * Rule engine determining auto-transitions based on metrics threshold
   */
  evaluateStateConstraints() {
    const minHealth = Math.min(...Object.values(this.state.healthScores));
    const maxQueue = Math.max(...Object.values(this.state.queueDepths));

    if (minHealth < 50) {
      if (this.state.status !== 'SYSTEM_EMERGENCY_ROLLED_BACK') {
        this.transitionTo('SYSTEM_DEGRADED');
      }
    } else if (maxQueue > 200 || minHealth < 80) {
      this.transitionTo('SYSTEM_THROTTLED');
    } else if (minHealth >= 90 && maxQueue < 50 && this.state.status === 'SYSTEM_THROTTLED') {
      this.transitionTo('SYSTEM_STABLE');
    }
  }

  /**
   * Retrieves active system metrics dashboard mapping values
   */
  getSnapshot() {
    return { ...this.state };
  }
}

// Validation run check
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log('Validating state manager in isolation...');
  const manager = new RuntimeStateManager();
  assert.strictEqual(manager.state.status, 'SYSTEM_STABLE');
  manager.updateHealth('apiCore', 40);
  assert.strictEqual(manager.state.status, 'SYSTEM_DEGRADED');
  manager.transitionTo('SYSTEM_STABLE');
  console.log('Isolation validation successful.');
}
