import { query } from '../config/db.js';

/**
 * Enterprise Validation Traceability & Requirements Mapping Engine (GxP Compliance).
 */

/**
 * Commits a traceability requirement record map to database
 */
export async function registerTraceRequirement(projectId, urs, frs, sds, testCase, tenantId) {
  await query(
    `INSERT INTO validation_trace_requirements (project_id, urs_code, frs_code, sds_code, test_case_id, status, tenant_id)
     VALUES ($1, $2, $3, $4, $5, 'TRACED', $6)`,
    [projectId, urs, frs, sds, testCase, tenantId]
  );
  return true;
}

/**
 * Resolves full traceability mapping chain lists for graph mapping visualizer
 */
export async function getProjectTraceabilityMap(projectId, tenantId) {
  const result = await query(
    `SELECT * FROM validation_trace_requirements 
     WHERE project_id = $1`,
    [projectId]
  );

  // Map database entries to nodes and links formatting
  const nodes = [];
  const links = [];
  const addedNodes = new Set();

  const addNode = (id, label, type) => {
    if (!addedNodes.has(id)) {
      addedNodes.add(id);
      nodes.push({ id, label, type });
    }
  };

  const addLink = (source, target) => {
    links.push({ source, target });
  };

  // Populate dynamic nodes and links mapping GxP validation loops
  result.rows.forEach(row => {
    const ursId = `URS-${row.urs_code}`;
    const frsId = `FRS-${row.frs_code}`;
    const sdsId = `SDS-${row.sds_code}`;
    const testId = `TEST-${row.test_case_id}`;

    addNode(ursId, ursId, 'URS');
    addNode(frsId, frsId, 'FRS');
    addNode(sdsId, sdsId, 'SDS');
    addNode(testId, testId, 'TEST');

    addLink(ursId, frsId);
    addLink(frsId, sdsId);
    addLink(sdsId, testId);
  });

  return { nodes, links };
}
