# Dynamic Skill Quality Engine — Gate 7.0 Foundation Directive

## 1. Engine Architecture
The dynamic quality engine implements a closed-loop validation loop inside `apps/api-core/services/output_quality_evaluator.js`. The engine evaluates LLM output against the 8-dimension rubric and triggers automatic regenerations (up to 3 retries) if the score is below the minimum production threshold of 80.

## 2. Weighted Score Allocation
The final runtime score is computed as:
```javascript
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
```

## 3. Dynamic Validation Logic
- **Domain Expertise**: Evaluates key clinical terms (e.g. `efficacy`, `endpoints`, `bioequivalence`).
- **Output Structure**: Scores presence of executive summary, detailed analysis, and tables.
- **Compliance**: Validates safety warnings, indications, and CFR alignments.
- **Explainability**: Audits assumptions and metadata parameters.
- **Governance**: Assures dynamic SOP bindings and active approvals.
- **Evidence Quality**: Checks for p-values, sample sizes, and trial references.
- **Practical Utility**: Grades actionability of strategic guidance.
- **Reusability**: Audits generalizability parameters.

---

© Dr. Bhupesh Dewan, Mumbai, India — All Rights Reserved
