# Clinical Summary Preparation Skill Proposal

**Document status:** Draft for owner review  
**Version:** 0.1  
**Related activity:** Clinical Summary Preparation  
**Primary citation style:** Vancouver style  

## 1. Working Title

Clinical Summary Development and Validation

## 2. Purpose

This skill helps ClinCommand OS turn primary evidence into a concise, credible, decision-ready clinical summary.

The output should help a reviewer quickly understand:

- what was studied;
- what was found;
- what matters clinically;
- what is still uncertain.

## 3. Positioning

This skill is not a product monograph skill and not a promotional content skill.

It sits between:

- the evidence pack;
- the clinical question;
- the final summary document.

## 4. Source Hierarchy

The skill must consult sources in this order:

1. owner-approved SOPs and skill files;
2. controlled repository materials;
3. approved project memory and architecture notes;
4. primary literature, trial registries, guidelines, and official documents;
5. external skill registries only when training or improving the skill behavior.

For skill discovery and improvement, the review order should include:

- skills.sh
- Agent Skills Me
- SkillsMP
- SkillsDirectory
- Smithery.ai

Only the best-fitting patterns should be shortlisted and documented.

## 5. Required Human / AI Roles

| Role | Function |
|---|---|
| Planner bot | Locks the clinical question and output format |
| Source bot | Retrieves and ranks study sources |
| Extraction bot | Pulls objectives, methods, results, and limitations |
| Summary bot | Writes the clinical summary in a clear structure |
| Citation bot | Formats Vancouver references and checks numbering |
| QA bot | Checks accuracy and readability |
| Compliance bot | Checks confidentiality, intended use, and fairness |
| Memory bot | Stores what improved the summary and what failed |

## 6. Mandatory Inputs

The skill should require:

- clinical question or evidence topic;
- product or molecule;
- target audience;
- geography;
- source pack or literature set;
- output length;
- preferred structure;
- whether tables or figures are needed;
- whether the summary is study-level or program-level;
- whether downstream reuse is expected.

## 7. Required Capabilities

The skill must be able to:

1. identify the exact clinical question;
2. decide whether the summary should be study-level, evidence-level, or program-level;
3. extract methods, endpoints, and key results;
4. preserve limitations and context;
5. produce a concise but complete clinical summary;
6. maintain Vancouver-style numbering;
7. create a source-to-claim map;
8. avoid flat, repetitive text;
9. support one refinement pass after QA;
10. capture memory notes for self-improvement.

## 8. Output Architecture

The skill should produce:

1. title and purpose
2. evidence scope
3. study / evidence overview
4. key findings
5. safety findings
6. limitations
7. clinical interpretation
8. practical relevance
9. Vancouver reference list
10. traceability notes

## 9. Writing Standard

The clinical summary should be:

- accurate;
- concise;
- readable;
- neutral;
- evidence-led;
- easy to audit.

It should not read like a slide deck, a monograph, or a marketing brochure.

## 10. Controls

1. No invented claim.
2. No numerical value without a source.
3. No unsupported causal or superiority language.
4. No raw URL citations in the body.
5. No missing safety or limitation language when relevant.
6. No confusion between primary evidence and commentary.
7. No repeated visual or textual pattern unless it improves comprehension.

## 11. Quality Thresholds

The output is acceptable only if it demonstrates:

- correct evidence selection;
- correct interpretation;
- full citation traceability;
- balanced tone;
- clear structure;
- usable downstream value.

## 12. Self-Improvement Loop

After each attempt, the AI subagents must record:

- which extraction template worked best;
- which evidence fields were most error-prone;
- which phrasing improved clarity;
- which citations were strongest;
- which repetitive patterns should be avoided next time.

That memory should inform the next summary draft, not replace evidence judgment.

## 13. Validation

Before release, the output must pass:

1. source verification;
2. data extraction accuracy check;
3. Vancouver citation check;
4. limitation check;
5. neutrality check;
6. readability check;
7. traceability check;
8. human review.

