import { query } from '../config/db.js';

export async function routePrompt(skillType, inputPrompt, userId) {
  const startTime = Date.now();
  let selectedModel = 'Simulator';
  let responseText = '';
  let inputTokens = Math.floor(inputPrompt.length / 4);
  let outputTokens = 0;
  let costUsd = 0;

  try {
    // 1. Fetch active routing rule for this skill type
    const rulesRes = await query(
      `SELECT * FROM ai_routing_rules WHERE skill_type = $1 AND is_active = TRUE LIMIT 1`,
      [skillType]
    );
    const rule = rulesRes.rows[0];

    // If a rule is found, use its preferred model
    if (rule) {
      selectedModel = rule.preferred_model;
    }

    // 2. Execute LLM call based on model configuration
    try {
      responseText = await executeModelCall(selectedModel, inputPrompt);
    } catch (err) {
      console.warn(`Model ${selectedModel} execution failed, trying fallback...`, err.message);
      // Fallback model execution
      if (rule && rule.fallback_model) {
        selectedModel = rule.fallback_model;
        responseText = await executeModelCall(selectedModel, inputPrompt);
      } else {
        selectedModel = 'Simulator';
        responseText = await executeModelCall(selectedModel, inputPrompt);
      }
    }

    outputTokens = Math.floor(responseText.length / 4);

    // 3. Compute cost estimate based on benchmarks
    const benchmarksRes = await query(
      `SELECT avg_cost_per_1k_tokens FROM ai_model_benchmarks WHERE model_name = $1 LIMIT 1`,
      [selectedModel]
    );
    const benchmark = benchmarksRes.rows[0];
    const rate = benchmark ? benchmark.avg_cost_per_1k_tokens : 0.0015; // default rate
    costUsd = ((inputTokens + outputTokens) / 1000) * rate;

    const latencyMs = Date.now() - startTime;

    // 4. Log usage metrics in analytics warehouse and audit vault
    await query(
      `INSERT INTO ai_cost_tracking (user_id, model_name, input_tokens, output_tokens, cost_usd)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [userId, selectedModel, inputTokens, outputTokens, costUsd]
    );

    // Update benchmarking metrics
    await query(
      `UPDATE ai_model_benchmarks 
       SET avg_latency_ms = (avg_latency_ms + $1) / 2, 
           last_evaluated = CURRENT_TIMESTAMP
       WHERE model_name = $2`,
      [latencyMs, selectedModel]
    );

    return {
      model: selectedModel,
      text: responseText,
      latencyMs,
      costUsd,
      inputTokens,
      outputTokens
    };
  } catch (err) {
    console.error('LLM Routing failed:', err.message);
    // Absolute fallback
    return {
      model: 'Simulator',
      text: `[System Fallback Response] Failed to complete execution: ${err.message}`,
      latencyMs: Date.now() - startTime,
      costUsd: 0,
      inputTokens,
      outputTokens: 0
    };
  }
}

async function executeModelCall(model, prompt) {
  // Check if it's Ollama or LM Studio
  if (model.toLowerCase().includes('ollama') || model.toLowerCase().includes('lmstudio')) {
    const urlSetting = await query(`SELECT setting_value FROM system_settings WHERE setting_key = 'ollama_url'`);
    const baseUrl = urlSetting.rows[0]?.setting_value || 'http://localhost:11434';

    const response = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: "llama3",
        messages: [{ role: "user", content: prompt }],
        stream: false
      })
    });
    if (!response.ok) throw new Error('Local model connection failed');
    const data = await response.json();
    return data.message.content;
  }

  // Simulator fallbacks
  const promptLower = prompt.toLowerCase();
  if (promptLower.includes('sop') || promptLower.includes('guideline')) {
    return `**[AI Guidance Copilot]**\nBased on your prompt, I reviewed the active standard protocols.\n\n* **Compliance Check:** Ensure versioning, 21 CFR Part 11 signatures, and active training are met.\n* **Recommendation:** Review SOP-MA-001 and SOP-REG-001 for approvals workflow layouts.`;
  }
  if (promptLower.includes('swot') || promptLower.includes('appraisal')) {
    return `### SWOT Analysis Matrix
| Strengths | Weaknesses |
|---|---|
| Strong clinical trial phase 3 results | Narrow indication profile |

| Opportunities | Threats |
|---|---|
| Rapid market expansion in Cardiology | Impending patent expiration of Cardiozen (2028) |`;
  }

  return `[Simulated Model ${model} response for: "${prompt.substring(0, 40)}..."]\nProcessed parameter tokens successfully. Context matches GxP criteria.`;
}
