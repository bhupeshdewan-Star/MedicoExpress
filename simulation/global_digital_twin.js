import fs from 'fs';
import path from 'path';
import assert from 'assert';
import { fileURLToPath } from 'url';

// Import sidecar elements
import { AutonomousOptimizer } from '../deployment/autonomous/autonomous_optimizer.js';
import { RegionOrchestrator } from '../deployment/global/region_orchestrator.js';
import { PredictiveIncidentEngine } from '../incident/predictive_incident_engine.js';
import { SloEnforcementEngine } from '../observability/slo_enforcement_engine.js';
import { LiveMetrics } from '../observability/live_metrics.js';
import { IncidentEngine } from '../incident/incident_engine.js';
import { RuntimeStateManager } from '../deployment/live/runtime_state_manager.js';
import { LiveActivationController } from '../deployment/live/live_activation_controller.js';
import { AutoScaler } from '../scaling/autoscaler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../');

async function runDigitalTwinSimulation() {
  console.log('========================================================');
  console.log('CLINCOMMAND OS™ — GLOBAL DIGITAL TWIN SIMULATION RUN');
  console.log('========================================================');

  // Initialize all operations controllers
  const stateManager = new RuntimeStateManager();
  const activationController = new LiveActivationController();
  const metricsCollector = new LiveMetrics();
  
  const incidentEngine = new IncidentEngine({
    stateManager,
    activationController
  });
  const autoscaler = new AutoScaler();
  const optimizer = new AutonomousOptimizer();
  const orchestrator = new RegionOrchestrator();
  const predictor = new PredictiveIncidentEngine({
    autoscaler,
    flagEngine: null
  });
  const sloEnforcer = new SloEnforcementEngine({
    incidentEngine,
    autoscaler
  });

  // Enable AUTO_APPLY optimization for the twin validation
  optimizer.setMode('AUTO_APPLY');

  const simulationEvents = [];

  // ----------------------------------------------------
  // Scenario 1: 10x Subject Scale Stress Test (Preemptive Scale Up)
  // ----------------------------------------------------
  console.log('\n[SCENARIO 1] Initiating 10x Subject Load Scaling stress test...');
  
  // Escalating load parameters
  const step0Metrics = { p95LatencyMs: 60, eproSyncDelayAvg: 10, telemetryDropRate: 0.0, errorRate: 0.0, queueBacklog: 50 };
  const step1Metrics = { p95LatencyMs: 110, eproSyncDelayAvg: 20, telemetryDropRate: 0.0, errorRate: 0.0, queueBacklog: 100 };
  const step2Metrics = { p95LatencyMs: 180, eproSyncDelayAvg: 45, telemetryDropRate: 0.01, errorRate: 0.02, queueBacklog: 160 };
  
  // Forecast outage risk using the predictive engine
  let riskForecast = predictor.forecastOutageRisk(step0Metrics);
  simulationEvents.push({ eventType: 'PREDICTIVE_RISK_CHECK', data: riskForecast });

  riskForecast = predictor.forecastOutageRisk(step1Metrics);
  simulationEvents.push({ eventType: 'PREDICTIVE_RISK_CHECK', data: riskForecast });

  riskForecast = predictor.forecastOutageRisk(step2Metrics);
  simulationEvents.push({ eventType: 'PREDICTIVE_RISK_CHECK', data: riskForecast });

  console.log(`- Predictive forecast outcome: ${riskForecast.prediction} (Risk Score: ${riskForecast.riskScore}%)`);
  assert.strictEqual(riskForecast.prediction, 'SYSTEM_PRE_THROTTLE', 'Scenario 1 Failure: Should predict pre-throttle state');
  assert.strictEqual(autoscaler.currentReplicas, 3, 'Scenario 1 Failure: Preemptive scale up did not adjust replicas');

  // ----------------------------------------------------
  // Scenario 2: Region Outage & Active-Passive Failover
  // ----------------------------------------------------
  console.log('\n[SCENARIO 2] Ingesting disaster-level outage in ap-south-1...');
  
  // Decay ap-south-1 metrics to trigger regional router failover
  orchestrator.updateRegionPerformance('ap-south-1', { errorRate: 0.20, avgLatencyMs: 800 });
  const activeRoute = orchestrator.getRouteForRequest(2); // NovaBio
  
  console.log(`- Disaster reroute destination: ${activeRoute}`);
  assert.strictEqual(activeRoute, 'us-east-1', 'Scenario 2 Failure: Active-passive failover failed to shift traffic');
  simulationEvents.push({ eventType: 'REGIONAL_FAILOVER_TRIGGERED', data: { from: 'ap-south-1', to: activeRoute } });

  // ----------------------------------------------------
  // Scenario 3: Real-Time SLO Enforcement & Mitigations
  // ----------------------------------------------------
  console.log('\n[SCENARIO 3] Enforcing hard SLO boundaries under load...');
  
  // Inject breach metrics (P95 latency = 280ms > 200ms target)
  const breachMetrics = {
    p95LatencyMs: 280,
    eproSyncDelayAvg: 85,
    telemetryDropRate: 0.15,
    errorRate: 0.12
  };

  const breaches = await sloEnforcer.evaluateSloBreaches(breachMetrics);
  assert.ok(breaches.length > 0, 'Scenario 3 Failure: Enforcer failed to catch breaches');
  console.log(`- Enforcer caught SLO breaches count: ${breaches.length}`);
  
  simulationEvents.push({ eventType: 'SLO_BREACHES_ENFORCED', data: breaches });

  console.log('\n========================================================');
  console.log('DIGITAL TWIN SIMULATION SUCCESSFULLY RUN & PASS');
  console.log('========================================================\n');
  
  // Save simulation log
  const logPath = path.resolve(rootDir, 'logs/digital_twin_run.json');
  fs.writeFileSync(logPath, JSON.stringify({ timestamp: new Date().toISOString(), events: simulationEvents }, null, 2));
}

runDigitalTwinSimulation().catch(err => {
  console.error('[CRITICAL] Digital Twin crashed:', err.message);
  process.exit(1);
});
