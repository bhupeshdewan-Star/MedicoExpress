# Medical Information Response Skill Proposal

**Document status:** Draft for owner review  
**Version:** 0.1  
**Purpose:** Define a governed Medical Information Response skill package for ClinCommand OS that supports controlled responses to unsolicited HCP, field-force, or internal scientific questions while preserving label discipline, traceability, escalation, and compliance.

## 1. Why This Skill Exists

Medical Information Response is a core support activity for a pharmaceutical medical department.

It must answer questions accurately and quickly, but never at the cost of source quality, jurisdictional control, or compliance discipline.

The skill should help the medical team:

1. answer scientific and product questions consistently;
2. distinguish approved information from unsupported or off-label requests;
3. escalate medical, PV, regulatory, or legal issues correctly;
4. use approved source packs and FAQs;
5. create traceable response drafts;
6. avoid improvisation in high-risk responses;
7. maintain a reusable knowledge base for repeated questions.

## 2. External Skill Scan Summary

The following external skill registries were checked before drafting this proposal:

1. `skills.sh`
2. `Smithery.ai`
3. `SkillsMP`
4. `Agent Skills Me`
5. `SkillsDirectory`

No exact governed “medical information response” skill surfaced as a clean match, but the following nearby patterns were relevant:

- `process-faq`
- `generating-faqs-and-help-content`
- `medical-research`
- `biomedical-search`
- `literature-review`
- `clinical-reports`

## 3. Proposed Skill Positioning

### Proposed Skill Name

Medical Information Response and FAQ Escalation

### Positioning

This skill sits between:

- source-controlled FAQ management,
- scientific evidence retrieval,
- compliant medical-response drafting,
- escalation handling,
- and response archiving.

It is not a promotional claims tool and not a general chat assistant.

## 4. Recommended Skill Bundle

The Medical Information Response capability should be informed by a small bundle of external skill patterns:

1. **Medical evidence retrieval**
   - best fit: `medical-research`
   - purpose: retrieve PubMed evidence and plain-language scientific context

2. **Biomedical and label search**
   - best fit: `biomedical-search`
   - purpose: search biomedical sources, clinical trial data, and drug-label information

3. **FAQ structuring**
   - best fit: `process-faq` and `generating-faqs-and-help-content`
   - purpose: turn question libraries into usable knowledge assets

4. **Clinical response drafting**
   - best fit: `clinical-reports`
   - purpose: enforce precise medical writing, completeness, and compliance

5. **Literature review support**
   - best fit: `literature-review`
   - purpose: support deeper evidence checks when the FAQ is not enough

## 5. Proposed Core Capabilities

The skill should be able to:

1. accept a medical information question;
2. identify whether the question is on-label, off-label, safety-related, comparative, or procedural;
3. resolve the approved source pack and FAQ library;
4. search supporting literature when needed;
5. draft a controlled response;
6. flag any escalation requirement;
7. distinguish answerable and non-answerable portions;
8. preserve traceability from response to source;
9. store the response for reuse where approved;
10. route the question to the correct human reviewer when needed.

## 6. Mandatory Inputs

The skill should require:

- product or therapy area;
- question text;
- source of question;
- geography / jurisdiction;
- approved source pack;
- label or PI reference;
- approved FAQ library, if available;
- safety or PV context;
- response urgency;
- whether the question is off-label or comparative;
- whether a human escalation path is required.

## 7. Expected Outputs

The skill should produce one or more of the following:

1. question classification
2. source-resolution summary
3. response draft
4. escalation recommendation
5. supporting source list
6. final approved answer version
7. FAQ candidate entry
8. response archive record
9. unresolved-question log

## 8. Required Controls

1. Do not answer from memory when a controlled source exists.
2. Do not invent label wording.
3. Do not answer off-label questions as if they were approved content.
4. Do not suppress safety concerns.
5. Do not conceal uncertainty.
6. Escalate PV, regulatory, and legal questions immediately where required.
7. Preserve source-to-answer traceability.
8. Keep approved response and draft response separate.
9. Use a question log to improve the FAQ library.
10. Final release remains subject to human approval.

## 9. Role Separation for the MI Workflow

For medical information response, the subagent model should be:

| Role | Responsibility |
|---|---|
| Intake bot | Classifies the question and records the scope |
| Source bot | Resolves approved source pack, FAQ, label, and references |
| Evidence bot | Searches supporting literature or label sources when needed |
| Draft bot | Writes the controlled response draft |
| Escalation bot | Determines whether PV, regulatory, or legal escalation is required |
| QA bot | Checks traceability, label fidelity, and answer quality |
| Memory bot | Updates the FAQ library and learning log |

## 10. Validation Requirements

Before release, the response should pass:

1. question classification check;
2. source traceability check;
3. label-consistency check;
4. off-label-risk check;
5. safety-escalation check;
6. language-clarity check;
7. response completeness check;
8. archiving check.

## 11. Implementation Plan

### Phase 1
Create the governed Medical Information Response proposal and align it with the ClinCommand OS agent training standard.

### Phase 2
Define the initial control stack:

- approved FAQ library;
- approved source pack;
- label / PI reference;
- escalation matrix;
- response archive.

### Phase 3
Create reusable workflow templates for:

1. standard scientific question
2. safety question
3. comparative question
4. off-label request
5. product-quality complaint linkage
6. escalation response

### Phase 4
Add validation rules and checklists for label fidelity, escalation handling, and source traceability.

### Phase 5
Implement the skill package into the repository as a controlled, reviewable draft and refine it after owner feedback.

## 12. Recommendation

This should be implemented as a **Medical Information Response and FAQ Escalation** package rather than a generic response template.

That gives ClinCommand OS a cleaner architecture:

- questions are classified first,
- approved sources govern the answer,
- escalation is explicit,
- FAQs become reusable controlled assets,
- and human review remains the release gate.

