// CLINCOMMAND OS™ GATE 6.3 — AI OPERATING MODEL & SKILL GOVERNANCE VALIDATION
// Author: Dr. Bhupesh Dewan, Mumbai, India
// Copyright Notice: © Dr. Bhupesh Dewan, Mumbai, India — All Rights Reserved

process.env.NODE_ENV = 'test';

import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadRepositoryAssets, runtimeSkillsRegistry, runtimeSopsRegistry } from '../../apps/api-core/services/repository_engine.js';
import { executeSkill } from '../../apps/api-core/services/skill_engine.js';
import { testDb } from '../../apps/api-core/config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

const testStats = {
  total: 0,
  passed: 0,
  failed: 0
};

function logAssert(description, condition) {
  testStats.total++;
  if (condition) {
    testStats.passed++;
    console.log(`[PASS] Assertion ${testStats.total}: ${description}`);
  } else {
    testStats.failed++;
    console.error(`[FAIL] Assertion ${testStats.total}: ${description}`);
  }
}

async function runValidation() {
  console.log('================================================================');
  console.log('CLINCOMMAND OS™ GATE 6.3 GOVERNANCE & AI MODEL VALIDATION SUITE');
  console.log('================================================================\n');

  // 1. Load Repository Assets
  await loadRepositoryAssets();

  // 2. Validate Dynamic Load Results
  logAssert('SOP registry loaded at least one SOP from files', runtimeSopsRegistry.size > 0);
  logAssert('Skill registry loaded at least one Skill from files', runtimeSkillsRegistry.size > 0);

  // Validate Pharmaceutical Product Appraisal Skill metadata
  const appraisalSkill = runtimeSkillsRegistry.get('Pharmaceutical Product Appraisal Skill');
  logAssert('Appraisal Skill exists in repository registry', !!appraisalSkill);
  if (appraisalSkill) {
    logAssert('Appraisal Skill has correct GxP version metadata', appraisalSkill.metadata.version === '1.0.0');
    logAssert('Appraisal Skill has correct owner attribution', appraisalSkill.metadata.owner === 'Dr. Bhupesh Dewan');
    logAssert('Appraisal Skill domain matches medical_affairs', appraisalSkill.metadata.domain === 'medical_affairs');
    logAssert('Appraisal Skill defines purpose in metadata', typeof appraisalSkill.metadata.purpose === 'string');
    logAssert('Appraisal Skill defines inputs checklist', Array.isArray(appraisalSkill.metadata.inputs));
    logAssert('Appraisal Skill defines outputs structure', Array.isArray(appraisalSkill.metadata.outputs));
    logAssert('Appraisal Skill contains explainability layer', typeof appraisalSkill.explainability === 'object');
    logAssert('Appraisal Skill explainability rationalizes source hierarchy', typeof appraisalSkill.explainability.source_hierarchy === 'string');
    logAssert('Appraisal Skill output framework requires executive summary', appraisalSkill.output_framework.sections.includes('executive_summary'));
    logAssert('Appraisal Skill output framework requires evidence tables', appraisalSkill.output_framework.sections.includes('evidence_tables'));
  }

  // Validate Pharmaceutical Product Training Slides Skill metadata
  const slidesSkill = runtimeSkillsRegistry.get('Pharmaceutical Product Training Slides Skill');
  logAssert('Training Slides Skill exists in repository registry', !!slidesSkill);
  if (slidesSkill) {
    logAssert('Training Slides Skill has correct GxP version metadata', slidesSkill.metadata.version === '1.0.0');
    logAssert('Training Slides Skill has correct owner attribution', slidesSkill.metadata.owner === 'Dr. Bhupesh Dewan');
    logAssert('Training Slides Skill domain matches medical_writing', slidesSkill.metadata.domain === 'medical_writing');
    logAssert('Training Slides Skill has speaker notes output mapped', slidesSkill.metadata.outputs.includes('speaker_notes'));
  }

  // Validate HCP Product Monograph Skill metadata
  const monographSkill = runtimeSkillsRegistry.get('HCP Product Monograph Skill');
  logAssert('Product Monograph Skill exists in repository registry', !!monographSkill);
  if (monographSkill) {
    logAssert('Product Monograph Skill has correct GxP version metadata', monographSkill.metadata.version === '1.0.0');
    logAssert('Product Monograph Skill has correct owner attribution', monographSkill.metadata.owner === 'Dr. Bhupesh Dewan');
    logAssert('Product Monograph Skill domain matches regulatory_affairs', monographSkill.metadata.domain === 'regulatory_affairs');
    logAssert('Product Monograph Skill has black box warning output mapped', monographSkill.metadata.outputs.includes('black_box_warnings'));
  }

  // Validate Dynamic SOPs
  const appraisalSop = runtimeSopsRegistry.get('SOP-MA-001');
  logAssert('Appraisal SOP exists in repository registry', !!appraisalSop);
  if (appraisalSop) {
    logAssert('Appraisal SOP status is APPROVED', appraisalSop.status === 'APPROVED');
    logAssert('Appraisal SOP has version metadata', appraisalSop.version === '1.0.0');
    logAssert('Appraisal SOP defines GxP workflow steps', Array.isArray(appraisalSop.steps));
    logAssert('Appraisal SOP contains explainability purpose', typeof appraisalSop.explainability.purpose === 'string');
  }

  // 3. Test Hot Reload capabilities
  console.log('\n--- Testing Repository Hot Reload (Zero Restart) ---');
  const tempSkillPath = path.join(projectRoot, 'db/repository/skills/temp_hot_reload_test.json');
  const tempSkillContent = {
    metadata: {
      name: "Temporary Reload Test Skill",
      version: "2.1.0",
      owner: "Tester",
      domain: "quality_assurance",
      purpose: "Verify immediate reflection of repository modifications."
    },
    system_prompt: "Verify reload.",
    user_prompt: "Input: {input_text}"
  };

  // Write temporary file
  fs.writeFileSync(tempSkillPath, JSON.stringify(tempSkillContent, null, 2), 'utf8');

  // Reload assets and check if present
  await loadRepositoryAssets();
  const tempSkillLoaded = runtimeSkillsRegistry.get('Temporary Reload Test Skill');
  logAssert('Hot reload registers new skill dynamically', !!tempSkillLoaded);
  if (tempSkillLoaded) {
    logAssert('Hot reload registers correct version metadata', tempSkillLoaded.metadata.version === '2.1.0');
  }

  // Delete temporary file
  fs.unlinkSync(tempSkillPath);

  // Reload assets and check if removed
  await loadRepositoryAssets();
  const tempSkillRemoved = !runtimeSkillsRegistry.has('Temporary Reload Test Skill');
  logAssert('Hot reload removes decommissioned skill dynamically', tempSkillRemoved);

  // 4. Test Response Quality Gates (Confidence & Reference checks)
  console.log('\n--- Testing Response Quality Gates & GxP Validation ---');
  
  // Find database ID for appraisal skill
  const appSkillDb = testDb.skills.find(s => s.name === 'Pharmaceutical Product Appraisal Skill');
  logAssert('Pharmaceutical Product Appraisal Skill is synced to the database state', !!appSkillDb);

  if (appSkillDb) {
    // Test execution with valid domain, func, and sop context
    try {
      const execResult = await executeSkill(appSkillDb.id, { input_text: 'Oncoblast monoclonal antibody safety trial results' }, 1, {
        domain: 'medical_affairs',
        func_id: 'FUNC_SOP_MA_001',
        sop_id: 1
      });
      logAssert('Orchestrator successfully executes registered skill with valid GxP inputs', !!execResult.outputText);
      logAssert('Orchestrator attaches explainability metadata to the output', typeof execResult.explainability === 'object');
      logAssert('Orchestrator explainability purpose matches repository definition', execResult.explainability.purpose === appraisalSkill.explainability.purpose);
    } catch (err) {
      logAssert('Orchestrator successfully executes registered skill with valid GxP inputs', false);
    }

    // Test Quality Gate: Block execution when domain context is mismatched
    try {
      await executeSkill(appSkillDb.id, { input_text: 'Oncoblast' }, 1, {
        domain: 'biostatistics', // Mismatch!
        func_id: 'FUNC_SOP_MA_001',
        sop_id: 1
      });
      logAssert('Orchestrator blocks execution when domain mismatch occurs', false);
    } catch (err) {
      logAssert('Orchestrator blocks execution when domain mismatch occurs', err.message.includes('GxP Policy Violation'));
    }

    // Test Quality Gate: Block execution when no applicable SOP exists
    try {
      await executeSkill(appSkillDb.id, { input_text: 'Oncoblast' }, 1, {
        domain: 'medical_affairs',
        func_id: 'FUNC_SOP_MA_001',
        sop_id: 9999 // Non-existent SOP ID
      });
      logAssert('Orchestrator blocks execution when no applicable SOP exists', false);
    } catch (err) {
      logAssert('Orchestrator blocks execution when no applicable SOP exists', err.message.includes('GxP Policy Violation'));
    }
  }

  console.log('\n================================================================');
  console.log('CLINCOMMAND OS™ GATE 6.3 GOVERNANCE VALIDATION SUMMARY');
  console.log(`Passed: ${testStats.passed} / Failed: ${testStats.failed} / Total: ${testStats.total}`);
  console.log('© Dr. Bhupesh Dewan, Mumbai, India — All Rights Reserved');
  console.log('================================================================');

  if (testStats.failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runValidation().catch(err => {
  console.error('Validation suite crashed:', err);
  process.exit(1);
});
