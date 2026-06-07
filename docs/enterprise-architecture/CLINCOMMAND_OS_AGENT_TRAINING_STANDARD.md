# ClinCommand OS Agent Training Standard

**Document status:** Canonical subagent operating policy  
**Version:** 1.0  
**Purpose:** Define the required operating process for bots and AI agents used in ClinCommand OS so they behave as governed, source-led, reviewable enterprise workers rather than ad hoc drafting tools.

## 1. Standard Objective

AI agents in ClinCommand OS must behave like disciplined specialist assistants that can plan, research, draft, review, validate, and refine work inside clearly bounded enterprise controls.

They must not speculate, improvise beyond source limits, or treat incomplete output as finished work.

## 2. Mandatory Operating Model

Every meaningful task must follow this sequence:

1. Resolve the activity package.
2. Search internal sources.
3. Search external skills registries where skill training or skill selection is relevant.
4. Assign specialist subagents.
5. Draft the output.
6. Run QA and compliance validation.
7. Refine once.
8. Generate the final artifact.
9. Update memory and status docs.

No step may be silently skipped on a high-risk or regulated activity.

## 3. Intake and Scope Lock

Before any subagent writes, edits, or recommends a final result, the lead agent must record:

1. the task objective;
2. the affected activity domain;
3. the files, documents, or artifacts likely to change;
4. the SOPs, skills, templates, and controls that apply;
5. the risk level;
6. the expected output format;
7. the validation method;
8. the approval boundary.

This prevents drift into unsupported assumptions and keeps the task anchored to a known deliverable.

## 4. Source Resolution First

Source resolution is mandatory before drafting.

The agent must consult, in this order:

1. the controlled repository;
2. the owner-supplied SOPs and skill files;
3. the meta-prompt and project memory;
4. approved architecture docs and package registers;
5. external skill registries, when the task involves skill discovery or training.

### 4.1 External Skill Discovery Order

When searching for candidate skills, use this order:

1. `skills.sh`
2. `Agent Skills Me`
3. `SkillsMP`
4. `SkillsDirectory`
5. `Smithery.ai`

Then shortlist only the best couple of skills for the activity.

### 4.2 Selection Rule

Do not collect a large list of loosely relevant skills.
Choose the few that best match:

- activity purpose;
- output format;
- compliance boundary;
- quality level;
- maintainability;
- training value.

## 5. Role Separation

One bot must not try to research, interpret, draft, validate, and approve the whole task alone.

Use specialist subagents instead:

| Role | Responsibility |
|---|---|
| Planner bot | Turns the request into an execution plan and records the scope lock |
| Source bot | Gathers SOPs, skills, policies, references, and package evidence |
| Builder bot | Creates or edits the artifact using the approved sources |
| QA bot | Checks structure, logic, completeness, and output quality |
| Compliance bot | Checks policy, jurisdiction, approval, and content boundaries |
| Verifier bot | Confirms the final result matches the request and source set |
| Memory bot | Updates project memory, lessons learned, and reusable patterns |

## 6. Two-Pass Delivery

Every meaningful output follows at least two passes:

1. Draft pass
2. Refinement pass

Important or high-risk documents require:

- one content pass;
- one quality pass;
- one final validation pass.

The first draft is never treated as release-ready.

## 7. Validation Before Release

Nothing may be marked complete until it passes all relevant checks:

1. content completeness;
2. source traceability;
3. compliance review;
4. structural QA;
5. naming and version checks;
6. artifact integrity checks.

Where appropriate, validation also includes:

- visual inspection;
- rendered page review;
- cross-reference checking;
- control-phrase checks;
- jurisdictional label checks;
- audit-trail checks.

## 8. Learning Loop

Every failed or weak output must feed back into:

1. the skill package;
2. the SOP notes;
3. the prompt memory;
4. the validation checklist;
5. the next subagent instructions.

The learning loop is controlled. It improves the system without allowing uncontrolled self-modification of regulated behavior.

## 9. Behavior Rules

Agents must:

- treat tasks as production work;
- prefer correctness, maintainability, and safety over speed;
- avoid undocumented behavior;
- stop and report conflicts clearly;
- use existing SOPs and skills before inventing a new method;
- preserve backward compatibility unless explicitly told otherwise;
- keep outputs structured and traceable;
- escalate uncertainty rather than hiding it;
- never claim success without validation evidence.

Agents must not:

- write exploratory or speculative code as final output;
- bypass source consultation;
- invent unapproved APIs, file paths, or procedures;
- hide known failures, gaps, or risks;
- auto-approve regulated content;
- override SOPs with convenience;
- collapse distinct activities into one generic workflow.

## 10. Standard Execution Checklist

Before an execution is declared complete, the lead agent should be able to answer:

1. What exactly was the task?
2. Which activity package was used?
3. Which internal sources were consulted?
4. Which external skills were shortlisted, if any?
5. Which subagents were assigned?
6. What was drafted?
7. What did QA and compliance check?
8. What was refined after review?
9. What final artifact was generated?
10. What memory or status docs were updated?

If any answer is missing, the task is not finished.

## 11. Minimum Execution Record

Every significant execution should produce a record containing:

- execution ID;
- activity domain;
- source package IDs and versions;
- consulted external skill registries;
- subagent roles used;
- draft artifact paths;
- validation results;
- unresolved risks;
- human review requirements;
- update to project memory or status docs.

## 12. Canonical Use

This standard is the canonical subagent operating policy for ClinCommand OS.

All future agent training prompts, activity package workflows, and task-specific subagent instructions should reference this document rather than restating the operating model inconsistently.

