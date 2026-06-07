import crypto from 'crypto';
import assert from 'assert';
import { fileURLToPath } from 'url';

/**
 * Enterprise Distributed Tracing Manager (GAMP 5 Category 4 Qualified)
 */
export class DistributedTracer {
  constructor() {
    this.tracesStore = new Map(); // traceId -> Array of Spans
  }

  /**
   * Generates a new cryptographically secure Trace ID (UUIDv4 format or similar)
   */
  generateTraceId() {
    return crypto.randomBytes(16).toString('hex');
  }

  /**
   * Generates a new Span ID
   */
  generateSpanId() {
    return crypto.randomBytes(8).toString('hex');
  }

  /**
   * Starts a new trace span link
   */
  startSpan(traceId, serviceName, operationName, parentSpanId = null) {
    const activeTraceId = traceId || this.generateTraceId();
    const spanId = this.generateSpanId();

    const span = {
      spanId,
      parentSpanId,
      serviceName,
      operationName,
      timestamp: new Date().toISOString(),
      durationMs: null
    };

    if (!this.tracesStore.has(activeTraceId)) {
      this.tracesStore.set(activeTraceId, []);
    }
    this.tracesStore.get(activeTraceId).push(span);

    return {
      traceId: activeTraceId,
      spanId,
      parentSpanId
    };
  }

  /**
   * Completes a trace span duration timing
   */
  finishSpan(traceId, spanId, durationOverride = null) {
    const spans = this.tracesStore.get(traceId);
    if (!spans) return;

    const span = spans.find(s => s.spanId === spanId);
    if (span) {
      if (durationOverride !== null) {
        span.durationMs = durationOverride;
      } else {
        const start = new Date(span.timestamp).getTime();
        span.durationMs = Date.now() - start;
      }
    }
  }

  /**
   * Generates a structured trace map for UI layout visualizations
   */
  getTraceMap(traceId) {
    const spans = this.tracesStore.get(traceId);
    if (!spans) return null;

    return {
      traceId,
      spanCount: spans.length,
      spans: [...spans]
    };
  }
}

// Standalone test check
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log('Testing distributed tracing module...');
  const tracer = new DistributedTracer();
  
  // Create a multi-hop trace
  const context1 = tracer.startSpan(null, 'api-core', 'POST /api/v1/epro/sync');
  assert.ok(context1.traceId, 'Trace ID must be generated');
  
  const context2 = tracer.startSpan(context1.traceId, 'epro-sync-service', 'Ingest Diary', context1.spanId);
  assert.strictEqual(context2.traceId, context1.traceId, 'Trace ID must propagate across hops');
  assert.strictEqual(context2.parentSpanId, context1.spanId, 'Parent span link must match');

  tracer.finishSpan(context1.traceId, context2.spanId, 45);
  tracer.finishSpan(context1.traceId, context1.spanId, 60);

  const map = tracer.getTraceMap(context1.traceId);
  assert.strictEqual(map.spanCount, 2, 'Trace map span count mismatch');
  assert.strictEqual(map.spans[1].durationMs, 45);
  console.log('Isolation validation successful.');
}
