/**
 * ClinCommand OS™ Startup Registry Validator (Hardened)
 * Author: Dr. Bhupesh Dewan, Mumbai, India
 * Copyright: © Dr. Bhupesh Dewan, Mumbai, India — All Rights Reserved
 */

import { query } from '../config/db.js';
import { loadRepositoryAssets } from './repository_engine.js';

/**
 * Executes a full database validation of all runtime registries.
 * Throws an error to block application startup if validation fails.
 */
export async function validateStartupRegistries() {
  console.log('[Startup Validation] Running hardened registry validation checks...');
  await loadRepositoryAssets();

  const skillsRes = await query('SELECT * FROM skills');
  const sopsRes = await query('SELECT * FROM sops');
  const skillTemplatesRes = await query('SELECT * FROM skill_templates');
  const promptVersionsRes = await query('SELECT * FROM prompt_versions');
  const knowledgeDocsRes = await query('SELECT * FROM knowledge_documents');
  const knowledgeCollsRes = await query('SELECT * FROM knowledge_collections');
  const skillMatrixRes = await query('SELECT * FROM skill_function_matrix');
  const sopMatrixRes = await query('SELECT * FROM sop_function_matrix');

  const skills = skillsRes.rows;
  const sops = sopsRes.rows;
  const templates = skillTemplatesRes.rows;
  const prompts = promptVersionsRes.rows;
  const knowDocs = knowledgeDocsRes.rows;
  const knowColls = knowledgeCollsRes.rows;
  const skillMatrix = skillMatrixRes.rows;
  const sopMatrix = sopMatrixRes.rows;

  const errors = [];
  const currentDate = new Date();
  const activeSkillIds = new Set(skillMatrix.map(sm => sm.skill_id).filter(id => id !== null && id !== undefined));

  // ==========================================
  // VALIDATION A: Function Registry Integrity
  // ==========================================
  const seenSkillFuncs = new Set();
  const seenSopFuncs = new Set();

  // 1. Check uniqueness and validity in skill_function_matrix
  for (const sm of skillMatrix) {
    if (!sm.function_name) {
      errors.push(`Function Registry Error: Empty FUNC_ID in skill_function_matrix.`);
      continue;
    }
    if (seenSkillFuncs.has(sm.function_name)) {
      errors.push(`Function Registry Error: Duplicate FUNC_ID '${sm.function_name}' in skill_function_matrix.`);
    }
    seenSkillFuncs.add(sm.function_name);

    if (!sm.skill_id) {
      errors.push(`Function Registry Error: Function '${sm.function_name}' lacks a valid SKILL_ID.`);
    }
  }

  // 2. Check uniqueness and validity in sop_function_matrix
  for (const som of sopMatrix) {
    if (!som.function_name) {
      errors.push(`Function Registry Error: Empty FUNC_ID in sop_function_matrix.`);
      continue;
    }
    if (seenSopFuncs.has(som.function_name)) {
      errors.push(`Function Registry Error: Duplicate FUNC_ID '${som.function_name}' in sop_function_matrix.`);
    }
    seenSopFuncs.add(som.function_name);

    if (!som.sop_id) {
      errors.push(`Function Registry Error: Function '${som.function_name}' has null or missing SOP_ID.`);
    }
  }

  // 3. Orphan Mappings checks (every function must map to exactly one skill and one SOP)
  for (const funcName of seenSkillFuncs) {
    if (!seenSopFuncs.has(funcName)) {
      errors.push(`Function Registry Error: Function '${funcName}' is mapped in skill_function_matrix but lacks a corresponding SOP mapping in sop_function_matrix.`);
    }
  }
  for (const funcName of seenSopFuncs) {
    if (!seenSkillFuncs.has(funcName)) {
      errors.push(`Function Registry Error: Function '${funcName}' is mapped in sop_function_matrix but lacks a corresponding mapping in skill_function_matrix.`);
    }
  }

  // ==========================================
  // VALIDATION B: Skill Registry Integrity
  // ==========================================
  // Check unique skill names/codes
  const seenSkillCodes = new Set();
  for (const skill of skills) {
    if (seenSkillCodes.has(skill.name)) {
      errors.push(`Skill Registry Error: Duplicate skill code/name '${skill.name}'.`);
    }
    seenSkillCodes.add(skill.name);
  }

  // Validate mapped skill existence and active status
  for (const sm of skillMatrix) {
    if (!sm.skill_id) continue;
    const skill = skills.find(s => s.id === sm.skill_id);
    if (!skill) {
      errors.push(`Skill Registry Error: Mapped Skill ID ${sm.skill_id} for function '${sm.function_name}' was not found in skills table.`);
      continue;
    }
    // Check inactive skill mapped to active function
    if (skill.is_published === false) {
      errors.push(`Skill Registry Error: Inactive skill '${skill.name}' (ID ${skill.id}) is mapped to active function '${sm.function_name}'.`);
    }
  }

  // ==========================================
  // VALIDATION C: SOP Registry Integrity
  // ==========================================
  // Check unique SOP codes
  const seenSopCodes = new Set();
  for (const sop of sops) {
    if (seenSopCodes.has(sop.code)) {
      errors.push(`SOP Registry Error: Duplicate SOP code '${sop.code}'.`);
    }
    seenSopCodes.add(sop.code);
  }

  // Validate mapped SOP existence and active status
  for (const som of sopMatrix) {
    if (!som.sop_id) continue;
    const sop = sops.find(s => s.id === som.sop_id);
    if (!sop) {
      errors.push(`SOP Registry Error: Mapped SOP ID ${som.sop_id} for function '${som.function_name}' was not found in sops table.`);
      continue;
    }
    // Check inactive SOP mapped to active function
    const isInactive = sop.status === 'Draft' || sop.status === 'DRAFT' || sop.status === 'Retired' || sop.status === 'RETIRED' || !sop.status;
    if (isInactive) {
      errors.push(`SOP Registry Error: Inactive/Draft SOP '${sop.code}' (ID ${sop.id}) is mapped to active function '${som.function_name}'.`);
    }
  }

  // ==========================================
  // VALIDATION D: Template Registry Integrity
  // ==========================================
  // Check unique template names
  const seenTemplateNames = new Set();
  for (const temp of templates) {
    if (seenTemplateNames.has(temp.name)) {
      errors.push(`Template Registry Error: Duplicate template identifier '${temp.name}'.`);
    }
    seenTemplateNames.add(temp.name);
  }

  // Verify referenced templates exist
  for (const skill of skills) {
    const isActive = activeSkillIds.has(skill.id);
    if (isActive && !skill.template_id) {
      errors.push(`Template Registry Error: Active skill '${skill.name}' is missing a referenced TEMPLATE_ID.`);
      continue;
    }
    if (skill.template_id) {
      const tempExists = templates.some(t => t.id === skill.template_id);
      if (!tempExists) {
        errors.push(`Template Registry Error: Skill '${skill.name}' references Template ID ${skill.template_id} which does not exist in skill_templates.`);
      }
    }
  }

  // Verify no orphan template references (every template must be referenced by at least one active skill)
  for (const temp of templates) {
    const isReferenced = skills.some(s => s.template_id === temp.id);
    if (!isReferenced) {
      errors.push(`Template Registry Error: Orphan template '${temp.name}' (ID ${temp.id}) is not referenced by any active skill.`);
    }
  }

  // ==========================================
  // VALIDATION E: Prompt Governance Integrity
  // ==========================================
  // Check active prompt versions for active skills (skills mapped to functions)

  for (const skillId of activeSkillIds) {
    const skill = skills.find(s => s.id === skillId);
    if (!skill) continue;

    const skillPrompts = prompts.filter(p => p.skill_id === skillId);

    // Filter active EFFECTIVE prompts
    const activeEffectivePrompts = skillPrompts.filter(p => {
      const isStatusEffective = p.status === 'EFFECTIVE';
      const isEffectiveDatePassed = p.effective_date ? new Date(p.effective_date) <= currentDate : true;
      const isNotExpired = !p.expiration_date || new Date(p.expiration_date) > currentDate;
      return isStatusEffective && isEffectiveDatePassed && isNotExpired;
    });

    if (activeEffectivePrompts.length === 0) {
      errors.push(`Prompt Registry Error: Mapped Skill '${skill.name}' (ID ${skill.id}) has no APPROVED or EFFECTIVE system prompt version.`);
    } else if (activeEffectivePrompts.length > 1) {
      errors.push(`Prompt Registry Error: Mapped Skill '${skill.name}' (ID ${skill.id}) has duplicate active prompt versions (${activeEffectivePrompts.length} found).`);
    }

    // Verify no expired prompts serving production execution (status = EFFECTIVE but expired)
    const expiredPrompts = skillPrompts.filter(p => {
      const isStatusEffective = p.status === 'EFFECTIVE';
      const isExpired = p.expiration_date && new Date(p.expiration_date) <= currentDate;
      return isStatusEffective && isExpired;
    });

    if (expiredPrompts.length > 0) {
      errors.push(`Prompt Registry Error: Skill '${skill.name}' has expired prompt versions in production state.`);
    }
  }

  // ==========================================
  // VALIDATION F: Knowledge Registry Integrity
  // ==========================================
  if (knowDocs.length === 0) {
    errors.push('Knowledge Registry Error: No active knowledge documents are registered.');
  }

  for (const doc of knowDocs) {
    // 1. APPROVED status check
    if (doc.status !== 'APPROVED' && doc.status !== 'Approved' && doc.status !== 'EFFECTIVE') {
      errors.push(`Knowledge Registry Error: Document '${doc.code}' has invalid status '${doc.status}'.`);
    }

    // 2. Checksum validation (must exist and be exactly 64-char hex string)
    const isValidChecksum = doc.checksum && typeof doc.checksum === 'string' && /^[a-fA-F0-9]{64}$/.test(doc.checksum);
    if (!isValidChecksum) {
      errors.push(`Knowledge Registry Error: Document '${doc.code}' is missing a valid SHA-256 checksum.`);
    }

    // 3. Review date validation (must exist, be valid and in the future)
    const isValidReviewDate = doc.review_date && !isNaN(Date.parse(doc.review_date)) && new Date(doc.review_date) > currentDate;
    if (!isValidReviewDate) {
      errors.push(`Knowledge Registry Error: Document '${doc.code}' has an expired review date (${doc.review_date}).`);
    }

    // 4. Collection integrity & reference checks (must reference collection and collection must exist)
    if (doc.collection_id === null || doc.collection_id === undefined) {
      errors.push(`Knowledge Registry Error: Document '${doc.code}' is an orphan (lacks a collection reference).`);
    } else {
      const collExists = knowColls.some(c => c.id === doc.collection_id);
      if (!collExists) {
        errors.push(`Knowledge Registry Error: Document '${doc.code}' references collection ID ${doc.collection_id} which does not exist in knowledge_collections.`);
      }
    }
  }

  // ==========================================
  // Final Evaluation
  // ==========================================
  if (errors.length > 0) {
    console.error(`[Startup Validation] FAILED with ${errors.length} errors:`);
    errors.forEach(err => console.error(`  - ${err}`));
    throw new Error(`Startup Registry Validation Failed: ${errors.join(' | ')}`);
  }

  console.log('[Startup Validation] PASSED. All registries are consistent.');
  return {
    status: 'PASS',
    attributions: '© Dr. Bhupesh Dewan, Mumbai, India — All Rights Reserved'
  };
}
