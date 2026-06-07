// CLINCOMMAND OS™ REPOSITORY ENGINE
// Author: Dr. Bhupesh Dewan, Mumbai, India
// Copyright Notice: © Dr. Bhupesh Dewan, Mumbai, India — All Rights Reserved

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { query, testDb, isSimulated } from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../..');

const skillsRepoDir = path.join(projectRoot, 'db/repository/skills');
const sopsRepoDir = path.join(projectRoot, 'db/repository/sops');

// In-memory runtime registries
export const runtimeSkillsRegistry = new Map();
export const runtimeSopsRegistry = new Map();

function functionNameForSopCode(sopCode) {
  return `FUNC_${sopCode.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}`;
}

/**
 * Loads all skills and SOPs from repository directories.
 * Syncs them dynamically with the database or simulated testDb state.
 */
export async function loadRepositoryAssets() {
  console.log('[Repository Engine] Dynamically scanning repository assets...');

  // Ensure directories exist
  if (!fs.existsSync(skillsRepoDir)) {
    fs.mkdirSync(skillsRepoDir, { recursive: true });
  }
  if (!fs.existsSync(sopsRepoDir)) {
    fs.mkdirSync(sopsRepoDir, { recursive: true });
  }

  // 1. Load SOPs first (dependencies for skills)
  const sopFiles = fs.readdirSync(sopsRepoDir).filter(f => f.endsWith('.json'));
  runtimeSopsRegistry.clear();

  for (const file of sopFiles) {
    try {
      const filePath = path.join(sopsRepoDir, file);
      const rawData = fs.readFileSync(filePath, 'utf8');
      const sopData = JSON.parse(rawData);

      if (!sopData.code || !sopData.title) {
        console.warn(`[Repository Engine] Skipping invalid SOP file ${file}: Missing code or title.`);
        continue;
      }

      runtimeSopsRegistry.set(sopData.code, sopData);

      // Sync with DB / testDb
      if (process.env.NODE_ENV === 'test' || isSimulated) {
        // Find existing SOP or add new
        let existingSop = testDb.sops.find(s => s.code === sopData.code);
        if (!existingSop) {
          existingSop = { id: testDb.sops.length + 1, code: sopData.code };
          testDb.sops.push(existingSop);
        }
        
        // Update values
        existingSop.name = sopData.title;
        existingSop.version = sopData.version || '1.0.0';
        existingSop.content = sopData.content || '';
        existingSop.status = sopData.status || 'APPROVED';
        existingSop.effective_date = sopData.effective_date || '2026-01-01';
        existingSop.review_date = sopData.review_date || '2027-06-01';
        existingSop.workflow_json = { steps: sopData.steps || [] };
        existingSop.explainability = sopData.explainability || {
          purpose: sopData.title,
          inputs: [],
          outputs: [],
          limitations: 'None',
          governanceControls: 'Audit required',
          traceabilityReferences: [sopData.code]
        };

        // Ensure function matrix mapping is present
        const funcName = functionNameForSopCode(sopData.code);
        let matrixEntry = testDb.sopFunctionMatrix.find(m => m.sop_id === existingSop.id && m.function_name === funcName);
        if (!matrixEntry) {
          testDb.sopFunctionMatrix.push({
            id: testDb.sopFunctionMatrix.length + 1,
            function_name: funcName,
            sop_id: existingSop.id
          });
        }
      } else {
        const sopRes = await query(
          `INSERT INTO sops (code, title, version, content, status)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (code) DO UPDATE
           SET title = $2, version = $3, content = $4, status = $5
           RETURNING id`,
          [sopData.code, sopData.title, sopData.version || '1.0.0', sopData.content || '', sopData.status || 'APPROVED']
        );

        const sopId = sopRes.rows[0]?.id;
        if (sopId) {
          const funcName = functionNameForSopCode(sopData.code);
          await query('DELETE FROM sop_function_matrix WHERE sop_id = $1 AND function_name = $2', [sopId, funcName]);
          await query(
            'INSERT INTO sop_function_matrix (function_name, sop_id) VALUES ($1, $2)',
            [funcName, sopId]
          );
        }
      }
    } catch (err) {
      console.error(`[Repository Engine] Error loading SOP file ${file}:`, err.message);
    }
  }

  // 2. Load Skills
  const skillFiles = fs.readdirSync(skillsRepoDir).filter(f => f.endsWith('.json'));
  runtimeSkillsRegistry.clear();

  for (const file of skillFiles) {
    try {
      const filePath = path.join(skillsRepoDir, file);
      const rawData = fs.readFileSync(filePath, 'utf8');
      const skillData = JSON.parse(rawData);

      const skillName = skillData.metadata?.name;
      if (!skillName) {
        console.warn(`[Repository Engine] Skipping invalid skill file ${file}: Missing metadata.name.`);
        continue;
      }

      runtimeSkillsRegistry.set(skillName, skillData);

      // Sync with DB / testDb
      if (process.env.NODE_ENV === 'test' || isSimulated) {
        let existingSkill = testDb.skills.find(s => s.name === skillName);
        if (!existingSkill) {
          existingSkill = { id: testDb.skills.length + 1, name: skillName };
          testDb.skills.push(existingSkill);
        }

        existingSkill.description = skillData.metadata.purpose;
        existingSkill.category_id = 1;
        existingSkill.current_version = skillData.metadata.version || '1.0.0';
        existingSkill.is_published = true;
        existingSkill.system_prompt = skillData.system_prompt;
        existingSkill.user_prompt = skillData.user_prompt;
        existingSkill.template_id = 1; // standard template
        existingSkill.explainability = skillData.explainability || {
          purpose: skillData.metadata.purpose,
          inputs: skillData.metadata.inputs || [],
          outputs: skillData.metadata.outputs || [],
          limitations: skillData.metadata.limitations || 'None',
          governanceControls: skillData.metadata.governanceControls || 'Audit required',
          traceabilityReferences: skillData.metadata.dependencies || []
        };
        existingSkill.domain = skillData.metadata.domain || 'medical_affairs';

        // Register prompt_versions record
        let pVersion = testDb.promptVersions.find(p => p.skill_id === existingSkill.id);
        if (!pVersion) {
          pVersion = { id: testDb.promptVersions.length + 1, skill_id: existingSkill.id };
          testDb.promptVersions.push(pVersion);
        }
        pVersion.version = skillData.metadata.version || '1.0.0';
        pVersion.system_prompt = skillData.system_prompt;
        pVersion.user_prompt = skillData.user_prompt;
        pVersion.status = 'EFFECTIVE';
        pVersion.effective_date = '2026-01-01';
        pVersion.expiration_date = null;

        // Ensure template exists
        let template = testDb.skillTemplates.find(t => t.id === existingSkill.template_id);
        if (!template) {
          template = {
            id: existingSkill.template_id,
            name: 'TEMPLATE_STANDARD',
            description: 'Standard clinical template',
            prompt_template: '',
            input_schema: {},
            output_schema: {},
            explainability: { purpose: 'Standard execution template' }
          };
          testDb.skillTemplates.push(template);
        }

        // Register in skill_function_matrix & sop_function_matrix
        const linkedSopCode = skillData.metadata.dependencies?.[0] || 'SOP-MA-001';
        const funcName = functionNameForSopCode(linkedSopCode);
        
        let skillMatrixEntry = testDb.skillFunctionMatrix.find(m => m.skill_id === existingSkill.id);
        if (!skillMatrixEntry) {
          skillMatrixEntry = {
            id: testDb.skillFunctionMatrix.length + 1,
            skill_id: existingSkill.id
          };
          testDb.skillFunctionMatrix.push(skillMatrixEntry);
        }
        skillMatrixEntry.domain = skillData.metadata.domain || 'medical_affairs';
        skillMatrixEntry.function_name = funcName;

        let sop = testDb.sops.find(s => s.code === linkedSopCode);
        if (sop) {
          existingSkill.linked_sop_id = sop.id;
          let sopMatrixEntry = testDb.sopFunctionMatrix.find(m => m.sop_id === sop.id && m.function_name === funcName);
          if (!sopMatrixEntry) {
            testDb.sopFunctionMatrix.push({
              id: testDb.sopFunctionMatrix.length + 1,
              function_name: funcName,
              sop_id: sop.id
            });
          }
        } else {
          existingSkill.linked_sop_id = 1;
        }
      } else {
        const templateRes = await query(
          `INSERT INTO skill_templates (name, description, prompt_template, input_schema, output_schema, created_by)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (name) DO UPDATE
           SET description = $2, prompt_template = $3, input_schema = $4, output_schema = $5
           RETURNING id`,
          [
            `TEMPLATE_${skillName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}`,
            skillData.metadata.purpose || 'Repository skill execution template',
            skillData.user_prompt || '{input_text}',
            JSON.stringify({ required: ['input_text'], properties: { input_text: { type: 'string' } } }),
            JSON.stringify({ type: 'object' }),
            1
          ]
        );
        const templateId = templateRes.rows[0]?.id || null;

        const skillRes = await query(
          `INSERT INTO skills (name, description, template_id, current_version, is_published, system_prompt, user_prompt)
           VALUES ($1, $2, $3, $4, true, $5, $6)
           ON CONFLICT (name) DO UPDATE
           SET description = $2, template_id = $3, current_version = $4, system_prompt = $5, user_prompt = $6
           RETURNING id`,
          [skillName, skillData.metadata.purpose, templateId, skillData.metadata.version || '1.0.0', skillData.system_prompt, skillData.user_prompt]
        );
        const skillId = skillRes.rows[0]?.id;

        if (skillId) {
          await query('DELETE FROM prompt_versions WHERE skill_id = $1', [skillId]);
          await query(
            `INSERT INTO prompt_versions (skill_id, version, system_prompt, user_prompt, status, created_by, effective_date)
             VALUES ($1, $2, $3, $4, 'EFFECTIVE', $5, $6)`,
            [skillId, skillData.metadata.version || '1.0.0', skillData.system_prompt, skillData.user_prompt, 1, skillData.metadata.effectiveDate || '2026-01-01']
          );

          await query('DELETE FROM skill_function_matrix WHERE skill_id = $1', [skillId]);
          await query(
            'INSERT INTO skill_function_matrix (domain, function_name, skill_id) VALUES ($1, $2, $3)',
            [skillData.metadata.domain || 'medical_affairs', funcName, skillId]
          );

          const linkedSopRes = await query('SELECT id FROM sops WHERE code = $1', [linkedSopCode]);
          const linkedSopId = linkedSopRes.rows[0]?.id;
          if (linkedSopId) {
            await query('DELETE FROM sop_function_matrix WHERE sop_id = $1 AND function_name = $2', [linkedSopId, funcName]);
            await query(
              'INSERT INTO sop_function_matrix (function_name, sop_id) VALUES ($1, $2)',
              [funcName, linkedSopId]
            );
          }
        }
      }
    } catch (err) {
      console.error(`[Repository Engine] Error loading Skill file ${file}:`, err.message);
    }
  }

  console.log(`[Repository Engine] Successfully loaded ${runtimeSopsRegistry.size} SOPs and ${runtimeSkillsRegistry.size} Skills.`);
}
