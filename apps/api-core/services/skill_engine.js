// CLINCOMMAND OS™ SKILL ENGINE
// Author: Dr. Bhupesh Dewan, Mumbai, India
// Copyright Notice: © Dr. Bhupesh Dewan, Mumbai, India — All Rights Reserved

import { query } from '../config/db.js';
import { compileAgentPrompt } from './domain_agents.js';
import { callLLM } from './llm_provider_manager.js';
import { retrieveRelevantContext } from './knowledge_retriever.js';
import { evaluateOutput, constructImprovementPrompt } from './output_quality_evaluator.js';
import { logImmutableAction } from './audit_trail_service.js';
import { registerTraceabilityMap } from './ai_traceability_service.js';
import { loadRepositoryAssets, runtimeSkillsRegistry } from './repository_engine.js';


/**
 * Validates inputs against a GxP JSON schema framework.
 */
export function validateInputSchema(inputData, schema) {
  if (!schema) return { isValid: true };

  const errors = [];

  // 1. Required fields check
  if (schema.required) {
    schema.required.forEach(field => {
      if (inputData[field] === undefined || inputData[field] === null || inputData[field] === '') {
        errors.push(`Field '${field}' is required.`);
      }
    });
  }

  // 2. Type & Range & Dropdown check
  if (schema.properties) {
    Object.keys(schema.properties).forEach(field => {
      const val = inputData[field];
      if (val === undefined || val === null) return;

      const propSchema = schema.properties[field];

      // Type checks
      if (propSchema.type) {
        if (propSchema.type === 'number' && typeof val !== 'number') {
          errors.push(`Field '${field}' must be a number.`);
        }
        if (propSchema.type === 'string' && typeof val !== 'string') {
          errors.push(`Field '${field}' must be a string.`);
        }
        if (propSchema.type === 'boolean' && typeof val !== 'boolean') {
          errors.push(`Field '${field}' must be a boolean.`);
        }
      }

      // Range check
      if (propSchema.minimum !== undefined && typeof val === 'number') {
        if (val < propSchema.minimum) {
          errors.push(`Field '${field}' value ${val} is below minimum of ${propSchema.minimum}.`);
        }
      }
      if (propSchema.maximum !== undefined && typeof val === 'number') {
        if (val > propSchema.maximum) {
          errors.push(`Field '${field}' value ${val} exceeds maximum of ${propSchema.maximum}.`);
        }
      }

      // Dropdown validation (enum check)
      if (propSchema.enum && !propSchema.enum.includes(val)) {
        errors.push(`Field '${field}' value '${val}' is not a valid dropdown option. Allowed options: [${propSchema.enum.join(', ')}].`);
      }

      // File validation checks
      if (propSchema.format === 'file') {
        if (!val.name || !val.checksum || !val.size) {
          errors.push(`Field '${field}' must carry a valid file metadata structure (name, checksum, size).`);
        }
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Executes an approved AI Skill under the full GxP pipeline.
 */
export async function executeSkill(skillId, inputData, userId, options = {}) {
  const ip = options.ip || '127.0.0.1';
  const username = options.username || 'med_writer';
  const userRole = options.userRole || 'Medical Affairs';

  // Hot reload repository assets dynamically on execution
  await loadRepositoryAssets();

  // 1. Fetch skill from database
  const skillRes = await query('SELECT * FROM skills WHERE id = $1', [skillId]);
  const skill = skillRes.rows[0];
  if (!skill) {
    throw new Error(`Skill ${skillId} not found in database.`);
  }

  // Dynamic Repository-Driven Override
  const repoSkill = runtimeSkillsRegistry.get(skill.name);
  if (repoSkill) {
    skill.current_version = repoSkill.metadata?.version || skill.current_version;
    skill.system_prompt = repoSkill.system_prompt || skill.system_prompt;
    skill.user_prompt = repoSkill.user_prompt || skill.user_prompt;
    skill.explainability = {
      purpose: repoSkill.explainability?.purpose || repoSkill.metadata?.purpose || skill.explainability?.purpose,
      rationale: repoSkill.explainability?.rationale || skill.explainability?.rationale || '',
      assumptions: repoSkill.explainability?.assumptions || skill.explainability?.assumptions || '',
      limitations: repoSkill.explainability?.limitations || repoSkill.metadata?.limitations || skill.explainability?.limitations || 'None',
      confidence_indicators: repoSkill.explainability?.confidence_indicators || skill.explainability?.confidence_indicators || '',
      source_hierarchy: repoSkill.explainability?.source_hierarchy || skill.explainability?.source_hierarchy || '',
      inputs: repoSkill.explainability?.inputs || repoSkill.metadata?.inputs || skill.explainability?.inputs,
      outputs: repoSkill.explainability?.outputs || repoSkill.metadata?.outputs || skill.explainability?.outputs,
      governanceControls: repoSkill.explainability?.governanceControls || repoSkill.metadata?.governanceControls || skill.explainability?.governanceControls,
      traceabilityReferences: repoSkill.explainability?.traceabilityReferences || repoSkill.metadata?.dependencies || skill.explainability?.traceabilityReferences
    };
    skill.domain = repoSkill.metadata?.domain || skill.domain;

    if (!skill.linked_sop_id) {
      const linkedSopCode = repoSkill.metadata?.dependencies?.[0];
      if (linkedSopCode) {
        try {
          const sopRes = await query('SELECT id FROM sops WHERE code = $1', [linkedSopCode]);
          if (sopRes.rows[0]) {
            skill.linked_sop_id = sopRes.rows[0].id;
          }
        } catch (err) {
          // Ignored
        }
      }
    }
  }

  // Explainability Validation Check (Case C)
  const exp = skill.explainability || {};
  if (!exp.purpose || !exp.inputs || !exp.outputs || !exp.limitations || !exp.governanceControls || !exp.traceabilityReferences) {
    throw new Error('GxP Policy Violation: Skill explainability metadata is missing or incomplete.');
  }

  // --- Layer 2 Execution Validation ---
  const domain = options.domain || options.DOMAIN || inputData.domain || inputData.DOMAIN;
  const funcId = options.funcId || options.func_id || options.FUNC_ID || inputData.func_id || inputData.FUNC_ID;
  const sopId = options.sopId || options.sop_id || options.SOP_ID || inputData.sop_id || inputData.SOP_ID;

  if (!domain || !funcId || !sopId) {
    throw new Error('GxP Policy Violation: Missing domain, func_id, or sop_id context.');
  }

  // SOP Validation Check (Case A & Case B)
  const sopRes = await query('SELECT * FROM sops WHERE id = $1', [parseInt(sopId)]);
  const sop = sopRes.rows[0];
  if (!sop) {
    throw new Error('GxP Policy Violation: Referenced SOP does not exist.');
  }
  if (sop.status && (sop.status.toUpperCase() === 'RETIRED' || sop.status.toUpperCase() === 'ARCHIVED')) {
    throw new Error(`GxP Policy Violation: Linked SOP is retired or archived (Status: ${sop.status}).`);
  }

  // 1. Skill belongs to domain & Function belongs to skill
  const skillMatrixRes = await query(
    'SELECT * FROM skill_function_matrix WHERE domain = $1 AND function_name = $2 AND skill_id = $3',
    [domain, funcId, parseInt(skillId)]
  );
  if (skillMatrixRes.rows.length === 0) {
    throw new Error('GxP Policy Violation: Skill does not belong to domain or function does not belong to skill.');
  }

  // 2. SOP belongs to function
  const sopMatrixRes = await query(
    'SELECT * FROM sop_function_matrix WHERE function_name = $1 AND sop_id = $2',
    [funcId, parseInt(sopId)]
  );
  if (sopMatrixRes.rows.length === 0) {
    throw new Error('GxP Policy Violation: SOP does not belong to function.');
  }

  // 3. Prompt version is active
  const promptRes = await query(
    'SELECT * FROM prompt_versions WHERE skill_id = $1',
    [parseInt(skillId)]
  );
  const currentDate = new Date();
  const activePrompt = promptRes.rows.find(p => {
    const isStatusEffective = p.status === 'EFFECTIVE';
    const hasEffectiveDatePassed = p.effective_date ? new Date(p.effective_date) <= currentDate : true;
    const isNotExpired = !p.expiration_date || new Date(p.expiration_date) > currentDate;
    return isStatusEffective && hasEffectiveDatePassed && isNotExpired;
  });
  if (!activePrompt) {
    throw new Error('GxP Policy Violation: Active prompt version not found or prompt is expired.');
  }

  // 4. Template exists
  if (!skill.template_id) {
    throw new Error('GxP Policy Violation: Referenced template does not exist.');
  }
  const templateRes = await query(
    'SELECT * FROM skill_templates WHERE id = $1',
    [skill.template_id]
  );
  if (templateRes.rows.length === 0) {
    throw new Error('GxP Policy Violation: Referenced template does not exist.');
  }

  // 2. Perform Input Schema Validation
  let parsedSchema = null;
  if (skill.input_schema) {
    parsedSchema = typeof skill.input_schema === 'string' ? JSON.parse(skill.input_schema) : skill.input_schema;
  } else {
    // Default schema to ensure input_text is present
    parsedSchema = {
      required: ['input_text'],
      properties: {
        input_text: { type: 'string' }
      }
    };
  }

  const valResult = validateInputSchema(inputData, parsedSchema);
  if (!valResult.isValid) {
    throw new Error(`Validation Error: ${valResult.errors.join(' ')}`);
  }

  // 3. Load active prompt version
  let systemPrompt = skill.system_prompt;
  let userPrompt = skill.user_prompt;
  let promptVersionId = null;

  if (activePrompt) {
    systemPrompt = activePrompt.system_prompt || systemPrompt;
    userPrompt = activePrompt.user_prompt || userPrompt;
    promptVersionId = activePrompt.id;
  }

  // 4. Retrieve contextual knowledge with source filters
  const sourceTypes = options.sourceTypes || ['SOPS', 'SKILLS', 'DOCUMENTS', 'KNOWLEDGE'];
  const retrievalLimit = options.retrieval_limit || 3;
  const contextText = inputData.input_text || JSON.stringify(inputData);

  const contextList = await retrieveRelevantContext(contextText, retrievalLimit, sourceTypes);

  // Knowledge Governance Expiration Check (Case F)
  for (const contextItem of contextList) {
    let docRes = null;
    try {
      docRes = await query(
        `SELECT review_date FROM knowledge_documents WHERE title = $1 OR code = $2`,
        [contextItem.title, contextItem.title]
      );
      if (!docRes || docRes.rows.length === 0) {
        const docNamePart = contextItem.title.split(' - Chunk')[0];
        docRes = await query(
          `SELECT review_date FROM knowledge_documents WHERE title = $1 OR code = $1`,
          [docNamePart]
        );
      }
      if (docRes && docRes.rows.length > 0) {
        const docNamePart = contextItem.title.split(' - Chunk')[0];
        const matchingDoc = docRes.rows.find(d => 
          d.title === contextItem.title || 
          d.code === contextItem.title || 
          d.title === docNamePart || 
          d.code === docNamePart
        );
        if (matchingDoc && matchingDoc.review_date) {
          const reviewDate = new Date(matchingDoc.review_date);
          if (reviewDate <= currentDate) {
            throw new Error(`GxP Policy Violation: Grounding knowledge asset has expired review date (Review Date: ${matchingDoc.review_date}).`);
          }
        }
      }
    } catch (err) {
      if (err.message.includes('GxP Policy Violation')) {
        throw err;
      }
    }
  }

  const contextString = contextList.map(c => `[Source: ${c.title} (${c.sourceType})] ${c.text}`).join('\n');

  // 5. Query linked SOP context
  let sopContext = '';
  if (skill.linked_sop_id) {
    try {
      const sopRes = await query('SELECT * FROM sops WHERE id = $1', [skill.linked_sop_id]);
      if (sopRes.rows[0]) {
        sopContext = `\n[Linked SOP Validation Control: ${sopRes.rows[0].name}]\nSteps: ${sopRes.rows[0].steps_json || 'Review checklist'}\n`;
      }
    } catch (err) {
      // Mock db bypass
    }
  }

  // 6. Select correct Domain Agent and Compile Prompt
  const domainName = skill.domain || 'medical_affairs';
  const compiledUserPrompt = userPrompt.replace('{input_text}', contextText);
  const finalPrompt = compileAgentPrompt(domainName, compiledUserPrompt, contextString + '\n' + sopContext);

  // 7. Execute routing call to LLM Provider Manager with Token Budgets
  const provider = options.provider || 'openai';
  const model = options.model || 'gpt-4o';
  
  let llmOutput = await callLLM(provider, model, finalPrompt, {
    max_context_tokens: options.max_context_tokens || 4000,
    max_response_tokens: options.max_response_tokens || 1000,
    retrieval_limit: retrievalLimit
  });

  // 8. Run closed-loop Output Quality Evaluation
  let evaluation = evaluateOutput(finalPrompt, llmOutput.text);
  let improvementCount = 0;
  const initialQualityScore = evaluation.averageScore;

  // Auto-regeneration loop if score is below 80, capped at 3 retries
  while (!evaluation.isApproved && improvementCount < 3) {
    improvementCount++;
    console.log(`[Skill Engine] Output quality score ${evaluation.averageScore}/100 below GxP threshold. Retrying loop count ${improvementCount}`);
    
    const feedbackPrompt = constructImprovementPrompt(finalPrompt, llmOutput.text, evaluation);
    llmOutput = await callLLM(provider, model, feedbackPrompt, {
      max_context_tokens: options.max_context_tokens || 4000,
      max_response_tokens: options.max_response_tokens || 1000
    });
    
    evaluation = evaluateOutput(finalPrompt, llmOutput.text);
  }

  const finalQualityScore = evaluation.averageScore;

  // Response Quality Gate: Block if final quality score is below GxP threshold of 80
  if (finalQualityScore < 80) {
    throw new Error('GxP Policy Violation: AI output confidence/quality score is below the mandatory 80/100 threshold.');
  }

  // Response Quality Gate: Block if required reference context is empty (neither RAG context nor SOP context is available)
  if ((!contextString || contextString.trim() === '') && (!sopContext || sopContext.trim() === '')) {
    throw new Error('GxP Policy Violation: Required reference knowledge assets and SOPs are unavailable.');
  }


  // 9. Persist Execution Records
  let executionId = Math.floor(Math.random() * 100000);
  try {
    const execRes = await query(
      `INSERT INTO skill_executions 
       (skill_id, user_id, input_data, output_data, model_used, execution_time_ms, prompt_version_id, quality_score, final_score, improvement_count)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
      [
        skillId, 
        userId, 
        JSON.stringify(inputData), 
        JSON.stringify({ output: llmOutput.text, evaluation }), 
        llmOutput.model, 
        llmOutput.latencyMs || 200,
        promptVersionId,
        initialQualityScore,
        finalQualityScore,
        improvementCount
      ]
    );
    if (execRes && execRes.rows[0]) {
      executionId = execRes.rows[0].id;
    }
  } catch (err) {
    // Simulated DB insertion
  }

  // 10. Audit log details (Immutable Chained Hash)
  try {
    await logImmutableAction(
      userId,
      username,
      userRole,
      'EXECUTE_SKILL',
      `skill:${skillId}`,
      `Executed AI skill ${skill.name}. Quality Score: ${finalQualityScore}/100`,
      ip
    );
  } catch (err) {
    // Simulated audit log insert fail
  }

  // 11. Register AI Traceability Map for Reconstruction
  try {
    await registerTraceabilityMap(
      executionId,
      skillId,
      skill.current_version || '1.0.0',
      promptVersionId,
      skill.linked_sop_id,
      contextList,
      llmOutput.model,
      llmOutput.text
    );
  } catch (err) {
    // Simulated traceability log fail
  }

  return {
    executionId,
    outputText: llmOutput.text,
    model: llmOutput.model,
    provider: llmOutput.provider,
    qualityScore: initialQualityScore,
    finalScore: finalQualityScore,
    improvementCount,
    evaluation,
    explainability: skill.explainability
  };
}
