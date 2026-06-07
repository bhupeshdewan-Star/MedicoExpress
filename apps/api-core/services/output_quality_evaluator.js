// CLINCOMMAND OS™ CLOSED-LOOP QUALITY EVALUATOR
// Author: Dr. Bhupesh Dewan, Mumbai, India
// Copyright Notice: © Dr. Bhupesh Dewan, Mumbai, India — All Rights Reserved

/**
 * Closed-loop Output Quality Evaluator.
 * Grades generated content across 8 GxP parameters:
 * Domain Expertise (20%), Output Structure (15%), Compliance (15%), Explainability (10%),
 * Governance (10%), Evidence Quality (10%), Practical Utility (10%), Reusability (10%).
 */
export function evaluateOutput(promptText, outputText) {
  const text = (outputText || '').toLowerCase();
  
  // 1. Domain Expertise (Weight: 20)
  const expKeywords = ['endpoint', 'efficacy', 'p-value', 'monograph', 'appraisal', 'pharmacology', 'therapeutic', 'clinical', 'trial', 'safety', 'pharmacokinetics', 'pharmacodynamics', 'bioequivalence'];
  const expMatches = expKeywords.filter(kw => text.includes(kw));
  let domainExpertise = 60 + (expMatches.length * 4);
  if (domainExpertise > 100) domainExpertise = 100;
  
  // 2. Output Structure (Weight: 15)
  const structKeywords = ['#', '##', 'executive summary', 'detailed analysis', 'evidence tables', 'swot', 'recommendations', 'limitations', 'references'];
  const structMatches = structKeywords.filter(kw => text.includes(kw));
  let outputStructure = 60 + (structMatches.length * 5);
  if (outputStructure > 100) outputStructure = 100;

  // 3. Compliance (Weight: 15)
  const compKeywords = ['gxp', 'cfr', 'fda', 'ema', 'compliance', 'regulatory', 'warning', 'indication', 'prohibited', 'safety', 'guidelines', '21 cfr'];
  const compMatches = compKeywords.filter(kw => text.includes(kw));
  let compliance = 60 + (compMatches.length * 4);
  if (compliance > 100) compliance = 100;

  // 4. Explainability (Weight: 10)
  const expMeta = ['purpose', 'rationale', 'assumptions', 'limitations', 'source', 'hierarchy', 'confidence', 'indicators'];
  const expMatches2 = expMeta.filter(kw => text.includes(kw));
  let explainability = 60 + (expMatches2.length * 5);
  if (explainability > 100) explainability = 100;

  // 5. Governance (Weight: 10)
  const govKeywords = ['peer review', 'electronic signature', 'signature', 'sign-off', 'approved', 'sop', 'dewan', 'rights reserved'];
  const govMatches = govKeywords.filter(kw => text.includes(kw));
  let governance = 60 + (govMatches.length * 5);
  if (governance > 100) governance = 100;

  // 6. Evidence Quality (Weight: 10)
  const evKeywords = ['trial', 'study', 'p-value', 'data', 'source', 'reference', 'evidence', 'table', 'percent'];
  const evMatches = evKeywords.filter(kw => text.includes(kw));
  let evidenceQuality = 60 + (evMatches.length * 5);
  if (evidenceQuality > 100) evidenceQuality = 100;

  // 7. Practical Utility (Weight: 10)
  const utilKeywords = ['actionable', 'recommendation', 'differentiate', 'competitor', 'product', 'market', 'value'];
  const utilMatches = utilKeywords.filter(kw => text.includes(kw));
  let practicalUtility = 60 + (utilMatches.length * 6);
  if (practicalUtility > 100) practicalUtility = 100;

  // 8. Reusability (Weight: 10)
  const reuseKeywords = ['standard', 'framework', 'generic', 'template', 'reusable', 'general', 'asset', 'guidelines'];
  const reuseMatches = reuseKeywords.filter(kw => text.includes(kw));
  let reusability = 60 + (reuseMatches.length * 5);
  if (reusability > 100) reusability = 100;

  const suggestions = [];
  if (domainExpertise < 80) suggestions.push("Enhance clinical or pharmacological domain terminology.");
  if (outputStructure < 80) suggestions.push("Ensure all structured sections and markdown headers exist.");
  if (compliance < 80) suggestions.push("Improve GxP or regulatory compliance references.");
  if (explainability < 80) suggestions.push("Ensure output contains clear assumptions and limitations.");
  if (governance < 80) suggestions.push("Add SOP referencing or verification statements.");
  if (evidenceQuality < 80) suggestions.push("Provide explicit evidence p-values or source trial citations.");
  if (practicalUtility < 80) suggestions.push("Add concrete recommendations and strategic business utility.");
  if (reusability < 80) suggestions.push("Align the output formatting with standard reusable templates.");

  const averageScore = Math.round(
    (domainExpertise * 20 + 
     outputStructure * 15 + 
     compliance * 15 + 
     explainability * 10 + 
     governance * 10 + 
     evidenceQuality * 10 + 
     practicalUtility * 10 + 
     reusability * 10) / 100
  );

  return {
    isApproved: averageScore >= 80,
    averageScore,
    criteria: {
      completeness: outputStructure,
      scientificAccuracy: domainExpertise,
      regulatoryAlignment: compliance,
      sopCompliance: governance,
      readability: reusability,
      domainExpertise,
      outputStructure,
      compliance,
      explainability,
      governance,
      evidenceQuality,
      practicalUtility,
      reusability
    },
    suggestions
  };
}

/**
 * Creates a feedback prompt instructing the agent on how to refine the output.
 */
export function constructImprovementPrompt(promptText, outputText, evaluation) {
  return `
[Quality Validation Loop]
Your previous output was graded ${evaluation.averageScore}/100 and failed to meet the GxP quality threshold of 80.
Please improve the output. Review the following feedback:

${evaluation.suggestions.map(s => `- ${s}`).join('\n')}

Original Output to Refine:
---
${outputText}
---

Please regenerate the output, addressing all GxP parameters. Ensure you include the mandatory attribution notice:
"© Dr. Bhupesh Dewan, Mumbai, India — All Rights Reserved"
`;
}
