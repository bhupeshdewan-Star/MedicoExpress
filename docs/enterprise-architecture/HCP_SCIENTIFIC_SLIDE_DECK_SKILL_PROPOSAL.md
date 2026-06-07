# HCP Scientific Slide Deck Skill Proposal

**Document status:** Draft for owner review  
**Version:** 0.1  
**Purpose:** Define a governed HCP Scientific Slide Deck skill package for ClinCommand OS that supports balanced scientific presentation of approved product and disease information for healthcare professionals.

## 1. Why This Skill Exists

HCP scientific slide decks are distinct from CME slides and from field-force training slides.

They must be clinically useful, visually readable, source-backed, and compliant with the approved label and company controls.

The skill should help the medical team:

1. build HCP-facing scientific decks;
2. present disease and product evidence clearly;
3. keep claims balanced and traceable;
4. use strong visuals instead of dense text blocks;
5. maintain on-label boundaries;
6. support scientific discussion without becoming promotional copy;
7. preserve a reusable approved deck structure.

## 2. External Skill Scan Summary

The following external skill registries were checked before drafting this proposal:

1. `skills.sh`
2. `Smithery.ai`
3. `SkillsMP`
4. `Agent Skills Me`
5. `SkillsDirectory`

Relevant external skill patterns surfaced included:

- `scientific-slides`
- `slidev`
- `presentation`
- `document-pptx`
- `pptx-generation`
- `baoyu-slide-deck`
- `generate-image`
- `scientific-schematics`

## 3. Proposed Skill Positioning

### Proposed Skill Name

HCP Scientific Slide Deck Development

### Positioning

This skill sits between approved scientific source packs and a finished HCP-facing presentation.

It is not a CME teaching deck, not a sales training deck, and not a general marketing deck.

## 4. Recommended Skill Bundle

The HCP scientific slide deck capability should be informed by a small bundle of external skill patterns:

1. **Scientific presentation design**
   - best fit: `scientific-slides`
   - purpose: strong scientific narrative, visually engaging slide planning, research-backed structure

2. **PowerPoint deck generation**
   - best fit: `pptx-generation` or `document-pptx`
   - purpose: structured deck assembly and PowerPoint output

3. **Technical slide formatting**
   - best fit: `slidev`
   - purpose: alternate slide logic for rich scientific or technical presentations

4. **Visual asset support**
   - best fit: `generate-image` and `scientific-schematics`
   - purpose: create or source strong scientific visuals

5. **Scientific content quality control**
   - best fit: `medical-research` and `literature-review`
   - purpose: keep the scientific evidence accurate and current

## 5. Proposed Core Capabilities

The skill should be able to:

1. accept a scientific topic and HCP audience definition;
2. define the deck objective and message hierarchy;
3. use approved scientific source packs only;
4. plan a slide-by-slide narrative;
5. choose the right visual type for each slide;
6. keep text concise and readable;
7. show evidence without clutter;
8. maintain label and fair-balance discipline;
9. add slide-level references;
10. support speaker notes where needed.

## 6. Mandatory Inputs

The skill should require:

- product name or therapeutic topic;
- audience type;
- deck purpose;
- geography / jurisdiction;
- approved source pack;
- approved claims or evidence anchor;
- duration or slide count target;
- visual style requirements;
- citation style;
- whether speaker notes are needed;
- whether the deck is for a scientific meeting, HCP discussion, or internal review.

## 7. Expected Outputs

The skill should produce one or more of the following:

1. deck blueprint
2. slide-by-slide outline
3. speaker notes
4. source map
5. visual plan
6. fairness and balance checklist
7. slide-level reference list
8. reusable deck template recommendation
9. final content plan for PowerPoint or Slidev

## 8. Required Controls

1. Do not mix with CME or field-force training content.
2. Do not use unsupported superiority claims.
3. Do not hide limitations or safety information.
4. Keep on-label boundaries visible.
5. Use a strong visual element on each slide where possible.
6. Avoid dense text blocks and decorative clutter.
7. Include slide-level references where relevant.
8. Preserve source-to-slide traceability.
9. Use approved visuals or clearly marked generated visuals where allowed.
10. Final release remains subject to human scientific and compliance review.

## 9. Role Separation for the Slide Workflow

For HCP scientific slide decks, the subagent model should be:

| Role | Responsibility |
|---|---|
| Planner bot | Defines objective, audience, and slide architecture |
| Evidence bot | Resolves source pack and evidence anchors |
| Visual bot | Plans diagrams, icons, charts, and illustrative assets |
| Draft bot | Builds slide content and notes |
| Balance bot | Checks claims, limitations, and label discipline |
| QA bot | Checks slide readability, consistency, and traceability |
| Memory bot | Stores approved slide patterns and reusable layouts |

## 10. Validation Requirements

Before release, the deck should pass:

1. slide-order check;
2. content-completeness check;
3. source-traceability check;
4. label-fidelity check;
5. fairness and balance check;
6. visual readability check;
7. slide-level reference check;
8. speaker-note consistency check;
9. formatting consistency check;
10. human review check.

## 11. Implementation Plan

### Phase 1
Create the governed HCP Scientific Slide Deck proposal and align it with the ClinCommand OS agent training standard.

### Phase 2
Select the initial slide bundle to adopt for implementation:

- `scientific-slides`
- `pptx-generation`
- `document-pptx`
- `generate-image`
- `scientific-schematics`

### Phase 3
Create reusable slide templates for:

1. disease overview
2. mechanism of action
3. evidence summary
4. efficacy
5. safety
6. place in therapy
7. practical use
8. summary

### Phase 4
Add validation rules and checklists for readability, visual quality, slide-level reference control, and approved-claims discipline.

### Phase 5
Implement the skill package into the repository as a controlled, reviewable draft and refine it after owner feedback.

## 12. Recommendation

This should be implemented as a **HCP Scientific Slide Deck Development** package rather than a generic presentation skill.

That gives ClinCommand OS a cleaner architecture:

- scientific slide decks stay distinct from CME and training decks,
- visual quality becomes a first-class control,
- claims stay source-backed,
- and the output remains reviewable and compliant.

