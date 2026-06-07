# Product Appraisal Evidence, Skill, and Validation Controls

**Document status:** Proposed  
**Version:** 0.1

## 1. Evidence Policy

### Evidence Classes

| Class | Examples | Permitted use |
|---|---|---|
| Authoritative regulatory | Approved label, SmPC, assessment report, official authority communication | Regulatory status, approved use, warnings, dosing |
| Primary clinical | Peer-reviewed trial publication, verified clinical study report, registered result | Efficacy, safety, study design, limitations |
| Systematic and guideline | Systematic review, meta-analysis, recognized guideline | Context, treatment landscape, evidence synthesis |
| Internal validated | Approved internal evidence package or analysis | Internal strategy within approved scope |
| Supporting contextual | High-quality narrative review, congress material with provenance | Context only; limitations required |
| Unverified or informal | Unverified web content, model memory, unattributed content | Not permitted as supporting evidence |

### Evidence Rules

- Every material factual claim requires a source reference.
- Every recommendation must distinguish supporting evidence from organizational judgment.
- Sources must retain origin, version or publication date, retrieval date, and integrity reference where available.
- Conflicting evidence must be represented, not silently resolved.
- Recency is judged by context; newer does not automatically mean stronger.
- Evidence generated after the cut-off date triggers an impact assessment rather than silently entering the release.
- AI model memory is never accepted as evidence.

## 2. Required Human Skills

| Skill ID | Skill | Perform | Review | Approve |
|---|---|---:|---:|---:|
| SK-MA-PA-001 | Product Appraisal Methodology | Advanced | Expert | Expert |
| SK-MA-EA-001 | Clinical Evidence Appraisal | Advanced | Expert | Advanced |
| SK-MA-SCI-001 | Scientific and Medical Writing | Advanced | Advanced | Advanced |
| SK-GOV-SOP-001 | SOP-Governed Work Execution | Current | Current | Current |
| SK-GOV-AI-001 | Governed AI Use and Validation | Current when AI used | Current | Current |
| SK-TA-* | Relevant Therapeutic-Area Competency | Advanced | Expert or designated specialist | Advanced |

Conditional skills:

- Safety/PV review when material safety interpretation is present.
- Regulatory review when labeling, approval status, or regulatory strategy is material.
- Biostatistics review when new statistical interpretation or reanalysis is performed.
- Preclinical expertise when nonclinical evidence materially informs conclusions.

### Independence Rules

- Primary author cannot provide final medical approval.
- AI agents cannot satisfy any human skill requirement.
- Reviewer and approver must have current competency evidence.
- Conflicts of interest must be declared and resolved.

## 3. Agent Capabilities

Initial permitted agent capabilities:

- resolve SOP and workflow candidates;
- retrieve approved evidence;
- extract structured findings;
- assess evidence quality using approved rules;
- prepare competitor evidence tables;
- draft controlled sections;
- validate claims and citations;
- identify gaps, conflicts, and required escalation.

Agents may not:

- invent or infer unsupported facts;
- make final claim-acceptance decisions;
- suppress conflicting evidence;
- approve or release the appraisal.

## 4. Validation Checklist

### Critical Checks

- Correct product, indication, geography, audience, and intended use.
- Effective SOP, workflow, template, and skills pinned.
- All mandatory sections present or justified.
- All material claims trace to permitted evidence.
- Label, approval status, dosing, and safety statements verified.
- No unsupported superiority, promotional, or off-label claims.
- Material conflicting evidence and uncertainty disclosed.
- Human reviewer independence and competency confirmed.
- All critical findings resolved.
- Release versions and manifest created correctly.

### Major Checks

- Search cut-off and evidence plan documented.
- Comparator selection justified.
- Evidence quality and limitations consistently described.
- Recommendations follow from evidence and are clearly labeled.
- AI executions, sources, prompts, and tools are traceable.
- Conditional specialist reviews completed where triggered.

### Minor Checks

- Formatting, terminology, references, and section consistency.
- Non-material editorial issues.

### Validation Decision

- Any open critical finding blocks medical review or approval.
- Major findings require resolution or documented authorized acceptance.
- Minor findings may be deferred only when they do not affect meaning or controlled use.

## 5. Approval Meaning

Recommended approval statement:

```text
I confirm that I have reviewed this Product Appraisal for its stated intended
use and that, to the best of my professional judgment, its material scientific
conclusions are balanced, adequately supported, appropriately qualified, and
ready for controlled release.
```

