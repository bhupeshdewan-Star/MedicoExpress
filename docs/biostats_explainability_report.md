# Biostatistics Explainability Report — ClinCommand OS™
## Document ID: GXP-BXR-001-V1.0
## Date of Review: 2026-06-05

---

### 1. Objectives
This report details the architectural design and roadmap for implementing **AI Explainability and Regulatory Interpretation Controls** for statistical runs inside ClinCommand OS™.

---

### 2. Explainability Design Elements

#### 2.1 Result Explanation ("Explain this result")
- **Mechanism**: Integrate output parameter tables (e.g. p-value, hazard ratio) with the AI Copilot via the `llmRouterService.js` and `output_quality_evaluator.js` pipelines.
- **Output**: Generates a standard natural language summary explaining the clinical meaning of the findings (e.g., "The p-value of 0.00055 indicates a highly significant difference, rejecting the null hypothesis of equal treatment efficacy.").

#### 2.2 Method Selection Rationale ("Why this method was selected")
- **Mechanism**: The UI guided wizard logs the selection flow parameters (e.g., "Independent groups? Yes. Continuous scale? Yes. Assumptions passed? Yes. Selected Welch's T-Test.").
- **Output**: Formulates a structured justification reference matching the Statistical Methods Catalog.

#### 2.3 Assumption Checks Explainability ("Why assumptions passed/failed")
- **Mechanism**: Evaluates pre-flight mathematical checks:
  - Normality (Shapiro-Wilk $p > 0.05$): "Dataset is normally distributed."
  - Homoscedasticity (Levene $p > 0.05$): "Variances are equal."
- **Output**: Detailed diagnostics showing calculated values vs. thresholds ($0.05$).

#### 2.4 Alternative Methods
- **Mechanism**: Mappings in `validation_dataset_registry.js` suggest alternatives:
  - If T-Test normality checks fail: Suggest "Mann-Whitney U (Non-Parametric alternative)".
  - If ANOVA variance check fails: Suggest "Kruskal-Wallis".

#### 2.5 Regulatory Interpretation
- **Mechanism**: Contextually adjusts AI explanations to reference relevant FDA, EMA, or ICH guidelines:
  - For T-Test / ANOVA: Reference *ICH E9 (Statistical Principles for Clinical Trials)*.
  - For Bioequivalence: Reference *FDA Bioequivalence TOST limits ($80\% - 125\%$)*.

---

### 3. Conclusion
The explainability architecture is **fully supported** by the underlying database metadata schemas and gateway design. In Gate 4, this structure will be bound to the AI prompt versioning system (`prompt_versions`) to ensure validated explainability outputs.

---

`© Dr. Bhupesh Dewan, Mumbai, India — All Rights Reserved`
