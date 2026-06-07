import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logPath = path.resolve(__dirname, '../logs/telemetry.json');

// Ensure logs directory exists
if (!fs.existsSync(path.dirname(logPath))) {
  fs.mkdirSync(path.dirname(logPath), { recursive: true });
}

/**
 * Enterprise OpenTelemetry baseline simulator.
 * Tracks traces for APIs, DB requests, Redis checks, AI usages, and billing metrics.
 */
class TelemetryTracker {
  constructor() {
    this.enabled = true;
    console.log('Observability Baseline: OpenTelemetry SDK Initialized.');
  }

  /**
   * Records a trace transaction span to local file database
   */
  recordSpan(spanName, attributes = {}, durationMs = 0) {
    const spanRecord = {
      timestamp: new Date().toISOString(),
      span: spanName,
      duration_ms: durationMs,
      attributes: {
        ...attributes,
        environment: process.env.NODE_ENV || 'production'
      }
    };

    if (process.env.DEBUG_TELEMETRY === 'true') {
      console.log(`[OTEL TRACE] ${spanName} completed in ${durationMs}ms`, attributes);
    }

    try {
      // Append trace records to local telemetry file database
      fs.appendFileSync(logPath, JSON.stringify(spanRecord) + '\n');
    } catch (err) {
      console.warn('Telemetry Tracker failed to write span record:', err.message);
    }
  }

  /**
   * Middleware hook to record HTTP API Request Telemetry traces
   */
  apiTraceMiddleware() {
    return (req, res, next) => {
      const start = Date.now();
      res.on('finish', () => {
        const duration = Date.now() - start;
        this.recordSpan('HTTP_API_REQUEST', {
          method: req.method,
          path: req.baseUrl + req.path,
          status: res.statusCode,
          ip: req.ip || req.socket.remoteAddress,
          user_id: req.user ? req.user.id : null,
          tenant_id: req.user ? req.user.tenant_id : null
        }, duration);
      });
      next();
    };
  }
}

export const telemetry = new TelemetryTracker();
