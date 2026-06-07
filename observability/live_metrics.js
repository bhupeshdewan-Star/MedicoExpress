import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import assert from 'assert';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Live Operations Telemetry Metrics Exporter (GAMP 5 Category 4 Qualified)
 */
export class LiveMetrics {
  constructor() {
    this.metrics = {
      httpRequestsTotal: 0,
      httpErrorsTotal: 0,
      rbmAttemptsTotal: 0,
      rbmFailuresTotal: 0,
      eproSyncDelayAvg: 0,
      telemetryIngestDelayAvg: 0,
      activeFlagsErrorCount: {},
      routeLatencies: {} // route -> array of latencies
    };
  }

  /**
   * Records a request duration for P95 latency calculations
   */
  recordLatency(route, durationMs) {
    if (!this.metrics.routeLatencies[route]) {
      this.metrics.routeLatencies[route] = [];
    }
    const latencies = this.metrics.routeLatencies[route];
    latencies.push(durationMs);
    // Maintain a rolling window of last 1000 requests
    if (latencies.length > 1000) latencies.shift();
  }

  /**
   * Calculates P95 latency for a specific route
   */
  getP95Latency(route) {
    const latencies = this.metrics.routeLatencies[route];
    if (!latencies || latencies.length === 0) return 0;
    
    const sorted = [...latencies].sort((a, b) => a - b);
    const index = Math.floor(sorted.length * 0.95);
    return sorted[index];
  }

  /**
   * Tracks feature flag usage error occurrences
   */
  incrementFlagError(flagName) {
    if (!this.metrics.activeFlagsErrorCount[flagName]) {
      this.metrics.activeFlagsErrorCount[flagName] = 0;
    }
    this.metrics.activeFlagsErrorCount[flagName]++;
  }

  /**
   * Dynamic Pilot Health Score calculation
   * Combines latency, error rates, queue lag, and RBM signature failures
   */
  calculatePilotHealthScore() {
    let score = 100;

    // 1. Deduct based on error rate
    const errorPct = this.metrics.httpRequestsTotal > 0
      ? (this.metrics.httpErrorsTotal / this.metrics.httpRequestsTotal) * 100
      : 0;
    score -= errorPct * 4;

    // 2. Deduct based on P95 latency breaches
    let totalLatency = 0;
    let routeCount = 0;
    for (const route of Object.keys(this.metrics.routeLatencies)) {
      const p95 = this.getP95Latency(route);
      totalLatency += p95;
      routeCount++;
    }
    const avgP95 = routeCount > 0 ? totalLatency / routeCount : 0;
    if (avgP95 > 200) {
      score -= Math.min(20, (avgP95 - 200) / 10);
    }

    // 3. Deduct based on ePRO and telemetry backlog latency
    if (this.metrics.eproSyncDelayAvg > 60) {
      score -= Math.min(15, (this.metrics.eproSyncDelayAvg - 60) / 5);
    }
    if (this.metrics.telemetryIngestDelayAvg > 10) {
      score -= Math.min(15, (this.metrics.telemetryIngestDelayAvg - 10) / 2);
    }

    // 4. Deduct based on RBM signature approval failures
    if (this.metrics.rbmAttemptsTotal > 0) {
      const failPct = (this.metrics.rbmFailuresTotal / this.metrics.rbmAttemptsTotal) * 100;
      if (failPct > 2) {
        score -= Math.min(10, (failPct - 2) * 2);
      }
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Generates Prometheus metrics exposition format
   */
  exportPrometheusMetrics() {
    const healthScore = this.calculatePilotHealthScore();
    let prometheusText = '';

    prometheusText += `# HELP clincommand_pilot_health_score Composite status of GxP validation indicators\n`;
    prometheusText += `# TYPE clincommand_pilot_health_score gauge\n`;
    prometheusText += `clincommand_pilot_health_score ${healthScore}\n\n`;

    prometheusText += `# HELP clincommand_http_requests_total Total HTTP requests received under pilot\n`;
    prometheusText += `# TYPE clincommand_http_requests_total counter\n`;
    prometheusText += `clincommand_http_requests_total ${this.metrics.httpRequestsTotal}\n\n`;

    prometheusText += `# HELP clincommand_epro_sync_delay_seconds Synchronization delay of mobile diaries\n`;
    prometheusText += `# TYPE clincommand_epro_sync_delay_seconds gauge\n`;
    prometheusText += `clincommand_epro_sync_delay_seconds ${this.metrics.eproSyncDelayAvg}\n`;

    return prometheusText;
  }
}

// Standalone test check
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log('Testing live metrics collection...');
  const monitor = new LiveMetrics();
  
  // Record sample values
  monitor.metrics.httpRequestsTotal = 100;
  monitor.metrics.httpErrorsTotal = 2; // 2% error rate
  
  // Record route durations
  for (let i = 0; i < 100; i++) {
    monitor.recordLatency('/api/v1/epro/sync', i + 50); // P95 latency is ~145ms
  }
  
  const score = monitor.calculatePilotHealthScore();
  console.log(`Computed Health Score: ${score}`);
  assert.ok(score >= 90, 'Initial score should be robust');

  const text = monitor.exportPrometheusMetrics();
  assert.ok(text.includes('clincommand_pilot_health_score'), 'Exporter output is missing the health score');
  console.log('Isolation validation successful.');
}
