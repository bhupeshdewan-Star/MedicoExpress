import { query } from '../server/config/db.js';

async function seed() {
  console.log('Seed helper started: Programmatically compiling 75 SOPs, 75 AI Skills, and 200 Knowledge Documents...');

  try {
    // 1. Seed Tenant
    await query("INSERT INTO tenants (name, domain, status) VALUES ('Global Pharma Corp', 'globalpharma.com', 'ACTIVE') ON CONFLICT DO NOTHING");
    const tenantResult = await query("SELECT id FROM tenants LIMIT 1");
    const tenantId = tenantResult.rows[0]?.id || 1;
    console.log(`Using Tenant ID: ${tenantId}`);

    // 2. Seed Default Roles
    const rolesList = ['Admin', 'Head of Medical Affairs', 'Medical Manager', 'Regulatory Manager', 'Clinical Research Manager', 'Medical Advisor', 'Training Manager', 'Viewer'];
    for (const r of rolesList) {
      await query("INSERT INTO roles (name, description, role_scope) VALUES ($1, $2, 'GLOBAL') ON CONFLICT DO NOTHING", [r, `${r} Global Role`]);
    }

    // 3. Seed Default Category IDs in SQLite / Postgres
    const categoriesList = ['Medical Affairs Operations', 'Regulatory Support', 'Clinical Research', 'Knowledge Operations', 'Training & Certification', 'Pharmacovigilance', 'Quality Assurance', 'Medical Information'];
    for (const c of categoriesList) {
      await query("INSERT INTO categories (name, description) VALUES ($1, $2) ON CONFLICT DO NOTHING", [c, `${c} Division Category`]);
    }

    // 4. Seed Product Appraisal Templates
    await query(`
      INSERT INTO product_appraisal_templates (name, description, structure_json)
      VALUES ('Standard Appraisal Template', 'Template for clinical trial comparisons and SWOT analyses', '{"sections":["EXECUTIVE_SUMMARY", "SWOT", "CLINICAL_EVIDENCE", "COMPETITOR", "MARKET", "STRATEGY", "REFERENCES"]}')
      ON CONFLICT DO NOTHING
    `);

    // 5. Seed Products
    const productsList = [
      { name: 'Cardiozen', generic: 'Atenolol-Z', class: 'Cardiology', desc: 'Next-generation beta-blocker for hypertension management.' },
      { name: 'Neuromax', generic: 'Neurolin-X', class: 'Neurology', desc: 'Novel neuropathic pain modulator for diabetic neuropathy.' },
      { name: 'Oncoblast', generic: 'Tumoriz-B', class: 'Oncology', desc: 'Monoclonal antibody targeting HER2-positive breast cancer cells.' },
      { name: 'Immunogard', generic: 'Immunol-A', class: 'Immunology', desc: 'Biologic targeting autoimmune arthritis.' },
      { name: 'Pulmoshield', generic: 'Bronch-P', class: 'Pulmonology', desc: 'Inhaled corticosteroid combination for severe COPD.' }
    ];
    for (const p of productsList) {
      await query("INSERT INTO products (name, generic_name, therapeutic_class, description) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING", [p.name, p.generic, p.class, p.desc]);
    }

    // Retrieve product IDs mapping
    const productsResult = await query("SELECT id, name FROM products");
    const productsMap = {};
    productsResult.rows.forEach(row => {
      productsMap[row.name] = row.id;
    });

    // 6. Seed 75 Realistic SOPs
    const sopDomains = [
      { prefix: 'SOP-MA', catName: 'Medical Affairs Operations', count: 15 },
      { prefix: 'SOP-REG', catName: 'Regulatory Support', count: 15 },
      { prefix: 'SOP-CLIN', catName: 'Clinical Research', count: 15 },
      { prefix: 'SOP-PV', catName: 'Pharmacovigilance', count: 10 },
      { prefix: 'SOP-QUAL', catName: 'Quality Assurance', count: 10 },
      { prefix: 'SOP-MI', catName: 'Medical Information', count: 10 }
    ];

    let totalSops = 0;
    for (const domain of sopDomains) {
      const catResult = await query("SELECT id FROM categories WHERE name = $1", [domain.catName]);
      const catId = catResult.rows[0]?.id || 1;

      for (let i = 1; i <= domain.count; i++) {
        const idx = String(i).padStart(3, '0');
        const code = `${domain.prefix}-${idx}`;
        const title = `${domain.catName} Protocol Item ${idx}`;
        const purpose = `Establish compliance benchmarks and workflow steps for ${title}.`;
        const scope = `Applies globally to all MSLs, regulatory managers, and operations planners in Global Pharma Corp.`;
        const responsibilities = `- Preparer: Medical Writer\n- Reviewer: Medical Advisor\n- Approver: Head of Medical Affairs`;
        const procedure = `1. Receive request details.\n2. Execute structured compliance evaluation checks.\n3. Validate against local RAG guidance registries.\n4. Route to the generic workflow designer engine.`;
        const qualityChecklist = `- [ ] Reference links validated against PubMed.\n- [ ] Version history logged.\n- [ ] E-signature verification code generated.`;

        const markdownContent = `# Standard Operating Procedure: ${title}
**SOP Code:** ${code} | **Version:** 1.0.0

## 1. Purpose
${purpose}

## 2. Scope
${scope}

## 3. Responsibilities
${responsibilities}

## 4. Procedure
${procedure}

## 5. Review Cycle
Every 12 months.

## 6. Quality Checklist
${qualityChecklist}`;

        await query(`
          INSERT INTO sops (code, title, category_id, version, content, status, tenant_id)
          VALUES ($1, $2, $3, '1.0.0', $4, 'Draft', $5)
          ON CONFLICT (code) DO NOTHING
        `, [code, title, catId, markdownContent, tenantId]);
        totalSops++;
      }
    }
    console.log(`Seeded ${totalSops} SOPs successfully.`);

    // 7. Seed 75 AI Prompt Skills
    const skillCategories = ['SOP Operations', 'Medical Writing', 'Clinical Trial Support', 'Regulatory Affairs', 'Intelligence & Analytics', 'Pharmacovigilance', 'HEOR & Market Access', 'Quality & Compliance'];
    for (const sc of skillCategories) {
      await query("INSERT INTO skill_categories (name, description) VALUES ($1, $2) ON CONFLICT DO NOTHING", [sc, `${sc} AI Assistant Skills`]);
    }

    const skillsTemplates = [
      { name: 'SOP Builder', cat: 'SOP Operations', desc: 'Drafts a standard markdown SOP body.' },
      { name: 'SOP Reviewer', cat: 'SOP Operations', desc: 'Audits draft text against regulatory frameworks.' },
      { name: 'SWOT Generator', cat: 'Medical Writing', desc: 'Constructs SWOT matrices for clinical trials.' },
      { name: 'Narrative Generator', cat: 'Pharmacovigilance', desc: 'Generates Patient Safety Narratives.' },
      { name: 'FAQ Builder', cat: 'Intelligence & Analytics', desc: 'Compiles medical letter FAQs.' },
      { name: 'eCTD Readiness Checker', cat: 'Regulatory Affairs', desc: 'Verifies guidance folders alignment.' },
      { name: 'CAPA Generator', cat: 'Quality & Compliance', desc: 'Creates root cause CAPA lists.' },
      { name: 'Cost Effectiveness Reviewer', cat: 'HEOR & Market Access', desc: 'Audits cost models sheets.' }
    ];

    let totalSkills = 0;
    const catRows = await query("SELECT id, name FROM skill_categories");
    const skillCatMap = {};
    catRows.rows.forEach(r => {
      skillCatMap[r.name] = r.id;
    });

    for (let i = 1; i <= 75; i++) {
      const idx = String(i).padStart(3, '0');
      const baseSkill = skillsTemplates[(i - 1) % skillsTemplates.length];
      const name = `${baseSkill.name} Module ${idx}`;
      const catId = skillCatMap[baseSkill.cat] || 1;
      
      const systemPrompt = `You are an AI Clinical Assistant configured for ${baseSkill.cat}. Execute task parameters precisely.`;
      const userPrompt = `Review target text and write output following: {input_text}.`;
      const inputSchema = JSON.stringify({
        type: "object",
        properties: {
          input_text: { type: "string", title: "Input Payload Data" }
        },
        required: ["input_text"]
      });
      const outputSchema = JSON.stringify({
        type: "object",
        properties: {
          one_line_takeaway: { type: "string" },
          executive_summary: { type: "string" },
          detailed_output: { type: "string" }
        }
      });

      await query(`
        INSERT INTO skills (name, description, category_id, current_version, is_published, system_prompt, user_prompt, validation_rules, execution_policy, tenant_id)
        VALUES ($1, $2, $3, '1.0.0', true, $4, $5, '{}', '{}', $6)
        ON CONFLICT (name) DO NOTHING
      `, [name, baseSkill.desc, catId, systemPrompt, userPrompt, tenantId]);
      totalSkills++;
    }
    console.log(`Seeded ${totalSkills} AI Skills successfully.`);

    // 8. Seed 200 Knowledge Documents
    const knowledgeCollections = ['Medical Affairs', 'Regulatory Affairs', 'Clinical Research', 'Pharmacovigilance', 'Medical Information', 'Quality & Compliance', 'HEOR', 'Market Access'];
    for (const kc of knowledgeCollections) {
      await query("INSERT INTO knowledge_collections (name, description) VALUES ($1, $2) ON CONFLICT DO NOTHING", [kc, `${kc} Reference Literature`]);
    }

    const collRows = await query("SELECT id, name FROM knowledge_collections");
    const collMap = {};
    collRows.rows.forEach(r => {
      collMap[r.name] = r.id;
    });

    let totalDocs = 0;
    for (let i = 1; i <= 200; i++) {
      const idx = String(i).padStart(3, '0');
      const collName = knowledgeCollections[(i - 1) % knowledgeCollections.length];
      const collId = collMap[collName] || 1;
      const code = `KNOW-${collName.substring(0, 3).toUpperCase()}-${idx}`;
      const title = `${collName} Guidance Monograph ${idx}`;
      const content = `# Reference Monograph: ${title}\n\nThis document logs regulatory guidance, clinical trials evidence parameters, and standard operations boundaries for ${collName} operations.`;

      await query(`
        INSERT INTO knowledge_documents (code, title, collection_id, current_version, content, status, tenant_id)
        VALUES ($1, $2, $3, '1.0.0', $4, 'Approved', $5)
        ON CONFLICT (code) DO NOTHING
      `, [code, title, collId, content, tenantId]);
      totalDocs++;
    }
    console.log(`Seeded ${totalDocs} Knowledge Documents successfully.`);

    console.log('Seeding fully completed.');
  } catch (err) {
    console.error('Failed to seed database programmatically:', err.message);
  }
}

seed();
