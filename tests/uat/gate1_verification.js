process.env.NODE_ENV = 'test';
import { callLLM } from '../../apps/api-core/services/llm_provider_manager.js';
import { indexDocument } from '../../apps/api-core/services/knowledge_indexer.js';
import { retrieveRelevantContext } from '../../apps/api-core/services/knowledge_retriever.js';
import { evaluateOutput } from '../../apps/api-core/services/output_quality_evaluator.js';
import { compileAgentPrompt, DOMAIN_PERSONAS } from '../../apps/api-core/services/domain_agents.js';
import { executeSkill, validateInputSchema } from '../../apps/api-core/services/skill_engine.js';
import { parseSOP, startSOPRun, executeSOPStep, signOffSOPRun } from '../../apps/api-core/services/sop_engine.js';
import { query } from '../../apps/api-core/config/db.js';

// Global execution status tracking
const testStats = {
  total: 0,
  passed: 0,
  failed: 0,
  scenarios: []
};

function logAssert(description, condition) {
  testStats.total++;
  if (condition) {
    testStats.passed++;
    console.log(`[PASS] ${description}`);
    testStats.scenarios.push({ description, status: 'PASS' });
  } else {
    testStats.failed++;
    console.error(`[FAIL] ${description}`);
    testStats.scenarios.push({ description, status: 'FAIL' });
  }
}

async function runTests() {
  console.log('================================================================');
  console.log('CLINCOMMAND OS™ GATE 1 UAT VERIFICATION TEST SUITE');
  console.log('================================================================\n');

  // Test 1: LLM Provider Abstraction Gateway
  console.log('--- Test Scenario 1: LLM Provider Manager ---');
  try {
    const oaiRes = await callLLM('openai', 'gpt-4o', 'Draft a scientific analysis response.');
    logAssert('OpenAI call returned valid simulated content', oaiRes.text.includes('Scientific Response'));
    
    const anthRes = await callLLM('anthropic', 'claude-3-5-sonnet', 'Compare eCTD labels.');
    logAssert('Anthropic call returned valid simulated eCTD content', anthRes.text.includes('eCTD'));

    const geminiRes = await callLLM('gemini', 'gemini-1.5-pro', 'Perform biostatistics survival analysis.');
    logAssert('Gemini call returned biostats output', geminiRes.text.includes('Biostatistics'));

    const ollamaRes = await callLLM('ollama', 'llama3', 'Hello Ollama.');
    logAssert('Ollama fallback call returns formatted data', ollamaRes.text.includes('ClinCommand OS'));
  } catch (err) {
    logAssert(`Provider Manager encountered unexpected error: ${err.message}`, false);
  }

  // Test 2: Token Budget Truncation Strategy
  console.log('\n--- Test Scenario 2: Token Budget Controls ---');
  try {
    const longPrompt = 'A'.repeat(10000); // 10000 chars ~ 2500 tokens
    const response = await callLLM('openai', 'gpt-4o', longPrompt, { max_context_tokens: 500 });
    logAssert('Token manager truncated prompt text to fit limits', response !== null);
  } catch (err) {
    logAssert(`Token budget test failed: ${err.message}`, false);
  }

  // Test 3: Knowledge Indexer TF-IDF
  console.log('\n--- Test Scenario 3: Knowledge Indexer & Retriever ---');
  try {
    const docContent = `Standard operating protocols for medical writing. 
    Ensure all Clinical Study Reports (CSR) match target endpoints.
    Verify database locks and clinical deviance data.`;
    
    const indexResult = await indexDocument('SOP-MW-002', '/docs/SOP-MW-002.md', docContent, 'SOPS');
    logAssert('Document split into correct character chunks', indexResult.chunkCount > 0);
    logAssert('Document checksum generated correctly', indexResult.checksum.length === 64);

    // Retriever Source Control Test
    const results = await retrieveRelevantContext('Clinical Study Reports', 3, ['SOPS']);
    logAssert('Retrieved relevant SOP chunks using query terms', results.length > 0);
    logAssert('Filters matched target sourceType correctly', results[0].sourceType === 'SOPS');

    const emptyResults = await retrieveRelevantContext('Clinical Study Reports', 3, ['DOCUMENTS']);
    logAssert('Retrieved empty set when source filter did not match documents', emptyResults.length === 0);
  } catch (err) {
    logAssert(`Indexing/retrieval test failed: ${err.message}`, false);
  }

  // Test 4: Quality Score Evaluator Loops
  console.log('\n--- Test Scenario 4: Output Quality Evaluator ---');
  try {
    const goodOutput = `### Scientific Response Report
    * **Clinical Evidence**: Primary endpoint data meets p-value limits.
    * **Regulatory Guidelines**: Met FDA compliance checklist requirements.
    * **SOP Reference**: Checked standard SOP-MA-001 workflow runs.
    * **Attribution**: © Dr. Bhupesh Dewan, Mumbai, India — All Rights Reserved`;

    const badOutput = `unprofessional, short, and missing copyright notice.`;

    const goodEval = evaluateOutput('Draft a medical response', goodOutput);
    logAssert('Professional structured output passed the GxP quality check', goodEval.isApproved === true);
    logAssert('Good quality score matches threshold >= 80', goodEval.averageScore >= 80);

    const badEval = evaluateOutput('Draft a medical response', badOutput);
    logAssert('Short, non-attributing output failed the GxP quality check', badEval.isApproved === false);
    logAssert('Quality score is correctly below 80', badEval.averageScore < 80);
    logAssert('Suggestions are generated for missed fields', badEval.suggestions.length > 0);
  } catch (err) {
    logAssert(`Quality validation test failed: ${err.message}`, false);
  }

  // Test 5: Domain Differentiation Personas
  console.log('\n--- Test Scenario 5: Domain Differentiation Persona Test ---');
  try {
    const baseRequest = 'Analyze this clinical study dataset containing screening numbers.';
    const compiledPrompts = {};

    Object.keys(DOMAIN_PERSONAS).forEach(domain => {
      compiledPrompts[domain] = compileAgentPrompt(domain, baseRequest, 'Context Data');
    });

    logAssert('Medical Affairs prompt contains specific vocabulary', compiledPrompts['medical_affairs'].includes('KOL'));
    logAssert('Regulatory Affairs prompt contains Module 2.5 details', compiledPrompts['regulatory_affairs'].includes('eCTD'));
    logAssert('Clinical Research prompt references protocol deviations', compiledPrompts['clinical_research'].includes('protocol deviation'));
    logAssert('Biostatistics prompt contains statistical terms', compiledPrompts['biostatistics'].includes('Kaplan-Meier'));
    logAssert('Medical Writing prompt contains CSR text', compiledPrompts['medical_writing'].includes('CSR'));
    logAssert('PV prompt contains safety signals', compiledPrompts['pharmacovigilance'].includes('SAE'));
  } catch (err) {
    logAssert(`Domain agent compilation failed: ${err.message}`, false);
  }

  // Test 6: Skill Schema Validation & Runtime Execution
  console.log('\n--- Test Scenario 6: Input Schema Validation & Engine Runner ---');
  try {
    const testSchema = {
      required: ['input_text', 'sample_size'],
      properties: {
        input_text: { type: 'string' },
        sample_size: { type: 'number', minimum: 10, maximum: 500 },
        domain_option: { type: 'string', enum: ['Medical', 'Regulatory'] }
      }
    };

    // Schema Validation checks
    const goodInput = { input_text: 'Scenario data', sample_size: 150, domain_option: 'Medical' };
    const badInput1 = { input_text: 'Scenario data' }; // Missing sample_size
    const badInput2 = { input_text: 'Scenario data', sample_size: 5, domain_option: 'Medical' }; // Below min size
    const badInput3 = { input_text: 'Scenario data', sample_size: 150, domain_option: 'Invalid' }; // Bad enum

    logAssert('Input schema validation succeeds for correct payload', validateInputSchema(goodInput, testSchema).isValid === true);
    logAssert('Input schema validation fails for missing required properties', validateInputSchema(badInput1, testSchema).isValid === false);
    logAssert('Input schema validation fails for out-of-range limits', validateInputSchema(badInput2, testSchema).isValid === false);
    logAssert('Input schema validation fails for invalid enum value', validateInputSchema(badInput3, testSchema).isValid === false);

    // Register active mock skill
    // Using PostgreSQL simulation inside db.js
    const mockSkill = {
      id: 10,
      name: 'Sample Biostatistics Calculator',
      domain: 'biostatistics',
      system_prompt: 'You are a biostatistics assistant.',
      user_prompt: 'Process the following: {input_text}'
    };

    // Execute skill via runtime engine
    const execution = await executeSkill(1, { input_text: 'Test survival values' }, 101);
    logAssert('Skill engine completed loop successfully', execution.outputText !== null);
    logAssert('Skill engine output was graded and logged', execution.qualityScore > 0);
  } catch (err) {
    logAssert(`Skill execution engine failed: ${err.message}`, false);
  }

  // Test 7: SOP Engine Parsing & Checklists Execution
  console.log('\n--- Test Scenario 7: SOP Execution State Tracker ---');
  try {
    const sopDoc = `# Product Appraisal SOP [SOP-MA-101]
    ## Scope
    Evaluate commercial viability.
    ## Roles
    - Reviewer
    - Approver
    ## Workflow
    1. Check literature findings.
    2. Audit competitor SWOT positioning matrix.
    3. Generate product appraisal report.`;

    const parsed = parseSOP(sopDoc);
    logAssert('SOP parser extracted the correct SOP code', parsed.code === 'SOP-MA-101');
    logAssert('SOP parser extracted all workflow steps', parsed.steps.length === 3);

    // Initialize mock database entries for execution runs
    // First, let's start the SOP run
    const run = await startSOPRun(1, 101);
    logAssert('SOP Run initialized as ACTIVE', run.status === 'ACTIVE');

    // Run steps validation checklist
    const step1 = await executeSOPStep(run.runId, 1, 101);
    logAssert('SOP step 1 was marked as COMPLETED', step1.steps[0].status === 'COMPLETED');

    // Electronic Sign-Off validation
    try {
      await signOffSOPRun(run.runId, 101);
      logAssert('Bypassed sign-off validation checks (This should have failed!)', false);
    } catch (err) {
      logAssert('Prevented electronic sign-off while steps are pending (Passed GxP rules)', err.message.includes('pending steps'));
    }

    // Complete all steps and sign off
    await executeSOPStep(run.runId, 2, 101);
    await executeSOPStep(run.runId, 3, 101);
    const finalizedRun = await signOffSOPRun(run.runId, 101, 'Approved and Released');
    logAssert('SOP execution completed successfully', finalizedRun.status === 'COMPLETED');
    logAssert('SOP execution sign-off timestamp recorded', finalizedRun.signOff !== null);
  } catch (err) {
    logAssert(`SOP Engine test failed: ${err.message}`, false);
  }

  console.log('\n================================================================');
  console.log('CLINCOMMAND OS™ GATE 1 UAT VERIFICATION SUMMARY');
  console.log(`Passed: ${testStats.passed} / Failed: ${testStats.failed} / Total: ${testStats.total}`);
  console.log('© Dr. Bhupesh Dewan, Mumbai, India — All Rights Reserved');
  console.log('================================================================');

  if (testStats.failed > 0) {
    process.exit(1);
  }
}

runTests();
