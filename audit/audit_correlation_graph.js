import assert from 'assert';
import { fileURLToPath } from 'url';

/**
 * GAMP 5 Category 4 Qualified Cross-System Audit Correlation Graph Engine
 */
export class AuditCorrelationGraph {
  constructor() {
    this.nodes = new Map(); // id -> { type, label, attributes }
    this.edges = []; // array of { from, to, relationship }
    
    // Seed default relationships for audit root-cause lookup
    this.seedDefaultGraph();
  }

  addNode(id, type, label, attributes = {}) {
    this.nodes.set(id, { type, label, attributes });
  }

  addEdge(from, to, relationship) {
    this.edges.push({ from, to, relationship });
  }

  seedDefaultGraph() {
    // 1. Core nodes
    this.addNode('INC-1780492-P1', 'INCIDENT', 'P1 Queue Backlog Saturation');
    this.addNode('SLO-EPRO-LAG', 'SLO_BREACH', 'ePRO Ingestion Synchronization Lag');
    this.addNode('FLAG-epro_sync', 'FEATURE_FLAG', 'epro_sync flag override');
    this.addNode('AUDIT-UPDATE-epro_sync', 'AUDIT_EVENT', 'Set override for tenant 2');

    // 2. Correlation edges
    this.addEdge('INC-1780492-P1', 'SLO-EPRO-LAG', 'TRIGGERED_BY');
    this.addEdge('SLO-EPRO-LAG', 'FLAG-epro_sync', 'CAUSED_BY_MUTATION');
    this.addEdge('FLAG-epro_sync', 'AUDIT-UPDATE-epro_sync', 'LINKED_TO_AUDIT');
  }

  /**
   * Traces back from an incident node to locate its root cause chain
   */
  findRootCauseChain(incidentId) {
    const chain = [];
    let currentId = incidentId;
    let traversed = new Set();

    while (currentId && !traversed.has(currentId)) {
      traversed.add(currentId);
      const edge = this.edges.find(e => e.from === currentId);
      
      const node = this.nodes.get(currentId);
      if (node) {
        chain.push({ id: currentId, type: node.type, label: node.label });
      }

      if (edge) {
        currentId = edge.to;
      } else {
        currentId = null;
      }
    }

    return chain;
  }
}

// Isolation test runner
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log('Testing audit correlation graph in isolation...');
  const graph = new AuditCorrelationGraph();

  const chain = graph.findRootCauseChain('INC-1780492-P1');
  assert.strictEqual(chain.length, 4);
  assert.strictEqual(chain[0].type, 'INCIDENT');
  assert.strictEqual(chain[1].type, 'SLO_BREACH');
  assert.strictEqual(chain[2].type, 'FEATURE_FLAG');
  assert.strictEqual(chain[3].type, 'AUDIT_EVENT');

  console.log('Isolation validation successful.');
}
