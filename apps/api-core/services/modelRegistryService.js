import { query } from '../config/db.js';

/**
 * Enterprise Multi-Model Registry & Spend Analytics Service.
 */

/**
 * Logs a request's model usage performance metrics
 */
export async function logModelExecution(modelName, inputTokens, outputTokens, latencyMs, tenantId, userId = null) {
  // Approximate pricing calculations per 1k tokens
  let costPerInput = 0.0015;  // Default $0.0015 / 1k input tokens
  let costPerOutput = 0.002;  // Default $0.0020 / 1k output tokens

  // Retrieve exact pricing configurations if registered
  const modelRes = await query('SELECT cost_per_1k_input, cost_per_1k_output FROM model_registry WHERE model_name = $1', [modelName]);
  if (modelRes.rows.length > 0) {
    costPerInput = parseFloat(modelRes.rows[0].cost_per_1k_input);
    costPerOutput = parseFloat(modelRes.rows[0].cost_per_1k_output);
  }

  const calculatedCost = ((inputTokens / 1000) * costPerInput) + ((outputTokens / 1000) * costPerOutput);

  await query(
    `INSERT INTO ai_model_metrics (tenant_id, user_id, model_name, prompt_tokens, completion_tokens, latency_ms, calculated_cost)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [tenantId, userId, modelName, inputTokens, outputTokens, latencyMs, calculatedCost]
  );

  return calculatedCost;
}

/**
 * Gathers aggregate spent statistics across workspaces, users, and tenants
 */
export async function getBillingMetricsSummary(tenantId) {
  const totalCostRes = await query('SELECT COALESCE(SUM(calculated_cost), 0) AS total FROM ai_model_metrics');
  const avgLatencyRes = await query('SELECT COALESCE(AVG(latency_ms), 0) AS avg_latency FROM ai_model_metrics');
  
  const userBreakdownRes = await query(
    `SELECT u.username, COALESCE(SUM(m.calculated_cost), 0) AS cost, COUNT(m.id) AS requests
     FROM ai_model_metrics m
     LEFT JOIN users u ON m.user_id = u.id
     GROUP BY u.username`
  );

  const modelBreakdownRes = await query(
    `SELECT model_name, COALESCE(SUM(calculated_cost), 0) AS cost, COUNT(id) AS requests, COALESCE(AVG(latency_ms), 0) AS latency
     FROM ai_model_metrics
     GROUP BY model_name`
  );

  return {
    totalSpend: parseFloat(totalCostRes.rows[0].total),
    averageLatencyMs: Math.round(parseFloat(avgLatencyRes.rows[0].avg_latency)),
    usersSpendBreakdown: userBreakdownRes.rows.map(r => ({
      username: r.username || 'System',
      spend: parseFloat(r.cost),
      requests: parseInt(r.requests)
    })),
    modelsSpendBreakdown: modelBreakdownRes.rows.map(r => ({
      model: r.model_name,
      spend: parseFloat(r.cost),
      requests: parseInt(r.requests),
      avgLatencyMs: Math.round(parseFloat(r.latency))
    }))
  };
}
