# Literature Review Skill Proposal

**Document status:** Draft for owner review  
**Version:** 0.1  
**Purpose:** Define a governed literature-review skill package for ClinCommand OS that supports narrative reviews, systematic reviews, evidence mapping, and research synthesis while preserving source traceability and publication-grade discipline.

## 1. Why This Skill Exists

ClinCommand OS needs a literature-review capability that is broader than a simple search tool and stricter than a casual summary helper.

The skill should help the medical and scientific teams:

1. search literature with intent and structure;
2. separate narrative review from systematic review;
3. verify source existence before citation;
4. assess study quality and relevance;
5. synthesize findings thematically;
6. identify evidence gaps and conflicts;
7. support publication, monograph, appraisal, and strategic evidence work;
8. maintain reproducibility and traceability.

## 2. External Skill Scan Summary

The following external skill registries were checked before drafting this proposal:

1. `skills.sh`
2. `Smithery.ai`
3. `SkillsMP`
4. `Agent Skills Me`
5. `SkillsDirectory`

Relevant external skill patterns surfaced included:

- `medical-research`
- `literature-review`
- `literature-search`
- `search-lit`
- `deep-research`
- `scientific-manuscript-review`
- `peer-review`
- `research-documentation`

## 3. Proposed Skill Positioning

### Proposed Skill Name

Literature Review and Evidence Synthesis

### Positioning

This skill sits between database search and publication-ready synthesis.

It should support:

- narrative literature review;
- systematic literature review;
- scoping review;
- evidence mapping;
- bibliometric style exploration when needed;
- structured study-by-study synthesis;
- manuscript-support review work.

## 4. Recommended Skill Bundle

The literature-review capability should be informed by a small bundle of external skill patterns:

1. **Medical literature retrieval**
   - best fit: `medical-research`
   - purpose: PubMed-focused retrieval and plain-language scientific summary

2. **Systematic literature review**
   - best fit: `literature-review`
   - purpose: rigorous multi-database review with thematic synthesis and citation verification

3. **Cross-database literature search**
   - best fit: `literature-search` or `search-lit`
   - purpose: search across PubMed, Semantic Scholar, arXiv, bioRxiv, and medRxiv

4. **Deep research orchestration**
   - best fit: `deep-research`
   - purpose: multi-source validation, source verification, and structured findings

5. **Peer-review and manuscript quality control**
   - best fit: `peer-review` or `scientific-manuscript-review`
   - purpose: challenge bias, structure, method quality, and writing clarity

6. **Research documentation**
   - best fit: `research-documentation`
   - purpose: capturing search results, evidence tables, and review outputs in a structured record

## 5. Proposed Core Capabilities

The skill should be able to:

1. accept a review question or topic;
2. determine whether the task is narrative, systematic, scoping, or gap-focused;
3. define search terms and inclusion rules;
4. search multiple databases or sources where appropriate;
5. verify source identity before citing;
6. screen titles, abstracts, and full text where needed;
7. abstract study methods, results, and limitations;
8. synthesize by theme, chronology, population, or comparison;
9. identify conflicts and gaps;
10. output a clean evidence-backed review.

## 6. Mandatory Inputs

The literature-review skill should require:

- review question or topic;
- review type;
- therapeutic area or domain;
- intended audience;
- evidence cut-off date;
- preferred databases;
- geographic scope if relevant;
- inclusion/exclusion criteria;
- citation style;
- whether publication support is needed;
- whether tables or figures are needed.

## 7. Expected Outputs

The skill should produce one or more of the following:

1. review plan
2. search strategy
3. screened literature list
4. evidence table
5. thematic synthesis
6. evidence gap analysis
7. conflict map
8. annotated bibliography
9. manuscript-support outline
10. publication-ready summary

## 8. Required Controls

1. Do not invent citations or source metadata.
2. Verify source existence before using a reference.
3. Distinguish narrative review from systematic review.
4. Make inclusion and exclusion criteria visible.
5. Label preprints and grey literature clearly.
6. Preserve negative and neutral evidence.
7. Report uncertainty and disagreement explicitly.
8. Keep citation style consistent.
9. Do not overclaim certainty from a small or biased evidence set.
10. Final content remains subject to human review.

## 9. Role Separation for the Review Workflow

For literature review, the subagent model should be:

| Role | Responsibility |
|---|---|
| Planner bot | Defines review type, question, and scope |
| Search bot | Searches databases and retrieves candidate sources |
| Screening bot | Screens title/abstract/full text against criteria |
| Abstraction bot | Extracts study characteristics and results |
| Synthesis bot | Produces thematic or structured evidence synthesis |
| Peer-review bot | Challenges bias, omissions, and methodological weakness |
| Compliance bot | Checks citation and publication boundaries |
| Memory bot | Stores approved search patterns and lessons learned |

## 10. Validation Requirements

Before release, the review output should pass:

1. source traceability check;
2. citation verification check;
3. screening-rule consistency check;
4. evidence-table completeness check;
5. synthesis coherence check;
6. negative-evidence check;
7. bias-awareness check;
8. reviewer-ready formatting check.

## 11. Implementation Plan

### Phase 1
Create the governed literature-review proposal and align it with the ClinCommand OS agent training standard.

### Phase 2
Decide the initial skill bundle to adopt for implementation:

- `medical-research`
- `literature-review`
- `literature-search`
- `deep-research`
- `peer-review`
- `research-documentation`

### Phase 3
Create reusable workflow templates for:

1. narrative literature review
2. systematic literature review
3. scoping review
4. evidence gap analysis
5. manuscript-support review

### Phase 4
Add validation rules and checklists for search traceability, screening logic, source quality, and synthesis quality.

### Phase 5
Implement the skill package into the repository as a controlled, reviewable draft and refine it after owner feedback.

## 12. Recommendation

This should be implemented as a **Literature Review and Evidence Synthesis** package rather than as one undifferentiated search skill.

That gives ClinCommand OS a cleaner architecture:

- search and retrieval stay disciplined,
- narrative and systematic review modes remain distinct,
- manuscript support remains separate from raw search,
- and all outputs remain governed by SOP and validation.

