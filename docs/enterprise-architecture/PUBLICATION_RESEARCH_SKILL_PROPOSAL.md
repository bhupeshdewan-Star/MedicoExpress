# Publication Research Skill Proposal

**Document status:** Draft for owner review  
**Version:** 0.1  
**Purpose:** Define a governed publication-research skill package for ClinCommand OS that supports literature discovery, evidence synthesis, publication planning, manuscript support, and publication-quality reporting.

## 1. Why This Skill Exists

ClinCommand OS needs a publication-research capability that is stronger than a plain literature search assistant and more controlled than a generic writing helper.

The proposed skill should help the medical and scientific teams:

1. find relevant evidence quickly;
2. verify source quality and date relevance;
3. map evidence to a publication question;
4. identify gaps, novelty, and publication angles;
5. support abstracts, posters, manuscripts, and literature reviews;
6. preserve traceability from claim to source;
7. maintain publication ethics and controlled output discipline.

## 2. External Skill Scan Summary

The following external skill registries were checked before drafting this proposal:

1. `skills.sh`
2. `Smithery.ai`
3. `SkillsMP`
4. `Agent Skills Me`
5. `SkillsDirectory`

The scan surfaced several relevant research-oriented skills, especially:

- `medical-research` from `gexijin/vibe`
- `literature-search` / `search-lit`
- `deep-research`
- `research-documentation`
- `research-to-essay`
- `analyze-stats`
- `academic-research-writer`

## 3. Proposed Skill Positioning

### Proposed Skill Name

Publication Research and Evidence Synthesis

### Positioning

This skill sits between literature search and publication drafting.

It is not only a search skill and not only a writing skill. It is a governed evidence workflow that produces publication-ready research support material for:

- literature reviews;
- evidence maps;
- publication plans;
- abstracts;
- posters;
- manuscripts;
- scientific narratives;
- journal response support;
- slide-linked publication summaries where needed.

## 4. Recommended Skill Bundle

The publication-research capability should be informed by a small bundle of external skill patterns:

1. **Medical literature discovery**
   - best fit: `medical-research`
   - purpose: PubMed-focused retrieval and plain-language scientific interpretation

2. **Cross-database literature search**
   - best fit: `literature-search` or `search-lit`
   - purpose: search across PubMed, Semantic Scholar, bioRxiv, and medRxiv with verified citations

3. **Deep evidence synthesis**
   - best fit: `deep-research`
   - purpose: multi-source synthesis, source verification, and structured research output

4. **Publication-quality documentation**
   - best fit: `research-documentation` or `research-to-essay`
   - purpose: organizing findings into publication-ready structures

5. **Statistical and figure support**
   - best fit: `analyze-stats`
   - purpose: generating publication-ready tables, figures, and analysis outputs

6. **Academic-style writing discipline**
   - best fit: `academic-research-writer`
   - purpose: supporting formal scholarly tone, citation management, and manuscript structure

## 5. Proposed Core Capabilities

The skill should be able to:

1. accept a publication question or topic;
2. define a search strategy;
3. search peer-reviewed and preprint sources where relevant;
4. identify inclusion and exclusion criteria;
5. verify citation details before using them;
6. summarize study design, comparator, population, endpoints, and limitations;
7. build evidence tables;
8. identify novelty, gap, and publication angle;
9. support publication planning for abstracts, posters, and manuscripts;
10. produce journal-ready synthesis with traceable references.

## 6. Mandatory Inputs

The publication-research skill should require:

- topic or research question;
- target publication type;
- target audience;
- disease or therapeutic area;
- journal or congress target, if known;
- geography or jurisdiction, if relevant;
- timeline;
- evidence cut-off date;
- preferred citation style;
- whether statistics or figures are needed;
- whether manuscript, abstract, poster, or review output is required.

## 7. Expected Outputs

The skill should produce one or more of the following:

1. publication research plan
2. search strategy
3. source list with verified references
4. abstracted evidence table
5. gap and novelty assessment
6. publication angle options
7. manuscript outline
8. abstract draft
9. poster skeleton
10. publication-quality summary
11. statistical support table or figure, when relevant

## 8. Required Controls

1. Every reference must be traceable to a source URL, DOI, PMID, or journal record.
2. Publication claims must distinguish evidence, interpretation, and opinion.
3. Search strategy and selection criteria must be visible.
4. Grey literature and preprints must be labelled clearly.
5. Publication bias and sponsor influence must be acknowledged where relevant.
6. No fabricated citations, journals, authors, or publication dates.
7. No unsupported superiority claims.
8. No hidden omissions of negative or neutral evidence.
9. Statistical outputs must be reproducible where possible.
10. Final publication use remains subject to human scientific and compliance review.

## 9. Role Separation for the Publication Workflow

For publication research, the subagent model should be:

| Role | Responsibility |
|---|---|
| Planner bot | Defines question, scope, output type, and review plan |
| Search bot | Searches databases and registries with verified source retrieval |
| Abstraction bot | Extracts study details into structured evidence tables |
| Synthesis bot | Combines findings into publication-ready narrative |
| Stats bot | Supports tables, figures, and analysis interpretation |
| Compliance bot | Checks ethical, citation, and publication boundary issues |
| QA bot | Checks consistency, completeness, and source traceability |
| Memory bot | Stores approved patterns and lessons learned |

## 10. Validation Requirements

Before release, the publication-research output should pass:

1. source traceability check;
2. citation format check;
3. study abstraction completeness check;
4. evidence balance check;
5. negative-evidence check;
6. publication ethics check;
7. figure/table consistency check;
8. reviewer-ready formatting check.

## 11. Implementation Plan

### Phase 1
Create the governed skill proposal and align it with the existing ClinCommand agent training standard.

### Phase 2
Decide the core skill bundle to adopt for implementation:

- `medical-research`
- `literature-search`
- `deep-research`
- `analyze-stats`
- `research-documentation`

### Phase 3
Create publication-research workflow templates for:

1. literature review
2. evidence summary
3. abstract planning
4. poster planning
5. manuscript planning
6. publication response support

### Phase 4
Add validation rules and reusable checklists for citation traceability, bias awareness, and publication-quality output.

### Phase 5
Implement the skill package into the repository as a controlled, reviewable draft and then refine it after owner feedback.

## 12. Recommendation

This proposal should be implemented as a **Publication Research and Evidence Synthesis** package rather than as a single generic research skill.

That gives ClinCommand OS a cleaner architecture:

- medical research stays focused on scientific retrieval and summary,
- publication research stays focused on publication-grade synthesis and output planning,
- statistics stays separate,
- and all outputs remain governed by SOP and validation.

