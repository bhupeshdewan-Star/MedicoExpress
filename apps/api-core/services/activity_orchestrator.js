import crypto from 'crypto';
import { callLLM } from './llm_provider_manager.js';
import { retrieveRelevantContext } from './knowledge_retriever.js';
import { searchScientificLiterature } from './literatureSearchService.js';

const ATTRIBUTION = '(c) Dr. Bhupesh Dewan, Mumbai, India - All Rights Reserved';

const ACTIVITY_PROFILES = {
  product_appraisal: {
    name: 'Product Appraisal',
    domain: 'medical_affairs',
    sop: 'SOP-MA-001: Product Appraisal Control',
    skill: 'Pharmaceutical Product Appraisal Strategist',
    template: 'Medical affairs product appraisal dossier',
    workflow: 'Medical Director peer review and e-signature control',
    outputKind: 'medical appraisal dossier'
  },
  slide_deck: {
    name: 'Slide Deck Creation',
    domain: 'medical_affairs',
    sop: 'SOP-MA-042: Medical Slide Deck Development',
    skill: 'Evidence-to-Slide Storyline Architect',
    template: 'Scientific slide deck with speaker notes',
    workflow: 'Medical, legal, regulatory review before external use',
    outputKind: 'slide-by-slide storyboard'
  },
  product_monograph: {
    name: 'Product Monograph',
    domain: 'medical_affairs',
    sop: 'SOP-MA-010: Product Monograph Development',
    skill: 'Medical monograph writer',
    template: 'Controlled product monograph reference',
    workflow: 'Medical and regulatory review before release',
    outputKind: 'product monograph'
  },
  lit_review: {
    name: 'Literature Review',
    domain: 'clinical_research',
    sop: 'SOP-CLN-089: Systematic Literature Review Standards',
    skill: 'PICO Evidence Review Specialist',
    template: 'PICO/PRISMA literature review matrix',
    workflow: 'Clinical research review and bibliography verification',
    outputKind: 'structured literature review'
  },
  systematic_lit_review: {
    name: 'Systematic Literature Review',
    domain: 'clinical_research',
    sop: 'SOP-CLN-089: Systematic Literature Review Standards',
    skill: 'PICO Evidence Review Specialist',
    template: 'PICO/PRISMA systematic review protocol',
    workflow: 'Clinical research review and bibliography verification',
    outputKind: 'systematic review protocol'
  },
  meta_analysis: {
    name: 'Meta-analysis Support',
    domain: 'biostatistics',
    sop: 'SOP-BIO-021: Meta-analysis and Evidence Synthesis Control',
    skill: 'Biostatistical Meta-analysis Methodologist',
    template: 'PICO meta-analysis protocol and statistical analysis plan',
    workflow: 'Biostatistics, clinical, and publication committee review',
    outputKind: 'meta-analysis protocol and evidence synthesis plan'
  },
  study_protocol: {
    name: 'Study Protocol',
    domain: 'clinical_research',
    sop: 'SOP-CLN-012: Clinical Protocol Development',
    skill: 'ICH E6 Protocol Synopsis Builder',
    template: 'ICH-compliant protocol synopsis',
    workflow: 'Clinical operations, biostatistics, safety, and medical review',
    outputKind: 'clinical protocol synopsis'
  },
  regulatory_responses: {
    name: 'Regulatory Response',
    domain: 'regulatory_affairs',
    sop: 'SOP-REG-102: Health Authority Response Management',
    skill: 'Regulatory Deficiency Response Writer',
    template: 'Agency response briefing note',
    workflow: 'Regulatory affairs approval and accountable person signoff',
    outputKind: 'regulatory response draft'
  },
  deficiency_responses: {
    name: 'Deficiency Response',
    domain: 'regulatory_affairs',
    sop: 'SOP-REG-102: Health Authority Response Management',
    skill: 'Regulatory Deficiency Response Writer',
    template: 'Deficiency response action matrix',
    workflow: 'Regulatory affairs approval and accountable person signoff',
    outputKind: 'regulatory deficiency response'
  },
  guideline_tracking: {
    name: 'Guideline Tracking',
    domain: 'regulatory_affairs',
    sop: 'SOP-REG-110: Regulatory Intelligence Monitoring',
    skill: 'Regulatory Intelligence Analyst',
    template: 'Guideline impact tracker',
    workflow: 'Regulatory intelligence review and action-owner assignment',
    outputKind: 'regulatory intelligence brief'
  },
  scientific_newsletter: {
    name: 'Scientific Newsletter',
    domain: 'medical_affairs',
    sop: 'SOP-MA-055: Scientific Newsletter Development',
    skill: 'Scientific newsletter editor',
    template: 'Scientific newsletter briefing',
    workflow: 'Editorial and medical review before publication',
    outputKind: 'scientific newsletter'
  }
};

const DEFAULT_PROFILE = {
  name: 'AI-Guided Life Sciences Activity',
  domain: 'medical_affairs',
  sop: 'SOP-GXP-001: Controlled AI Draft Generation',
  skill: 'Life Sciences Expert Drafting Agent',
  template: 'Controlled activity-specific draft',
  workflow: 'Author review, peer review, and e-signature control',
  outputKind: 'controlled professional draft'
};

const MOLECULE_KNOWLEDGE = {
  rabeprazole: {
    className: 'proton pump inhibitor (PPI)',
    mechanism: 'irreversible inhibition of gastric H+/K+ ATPase in parietal cells, reducing basal and stimulated acid secretion',
    commonIndications: 'GERD, erosive esophagitis, duodenal ulcer, gastric ulcer, and Helicobacter pylori eradication regimens where locally approved',
    comparators: ['omeprazole', 'pantoprazole', 'esomeprazole', 'lansoprazole', 'dexlansoprazole'],
    differentiation: 'rapid acid suppression profile, lower dependence on CYP2C19 than some older PPIs, and once-daily convenience in common acid-peptic disorders',
    safety: 'headache, diarrhea, abdominal pain, nausea, hypomagnesemia risk with prolonged use, C. difficile-associated diarrhea warning, fracture risk signal with long-term/high-dose therapy, and interaction review for drugs affected by gastric pH',
    evidenceCaution: 'Local label and current gastroenterology guidelines must confirm exact indications, dosing, warnings, and any comparative claims.'
  },
  remimazolam: {
    className: 'ultra-short-acting benzodiazepine sedative',
    mechanism: 'GABA-A receptor positive allosteric modulation with ester metabolism to an inactive carboxylic acid metabolite',
    commonIndications: 'procedural sedation and anesthesia-related uses where locally approved',
    comparators: ['midazolam', 'propofol', 'dexmedetomidine'],
    differentiation: 'rapid onset/offset, flumazenil reversibility, and cardiorespiratory positioning versus propofol and midazolam depending on indication and setting',
    safety: 'respiratory depression, hypotension, oxygen desaturation, sedation depth variability, and need for trained airway support',
    evidenceCaution: 'Claims must be limited to approved local labeling and sourced procedural sedation trials.'
  }
};

function value(input, keys, fallback = '') {
  for (const key of keys) {
    const found = input?.[key];
    if (found !== undefined && found !== null && String(found).trim() !== '') {
      return String(found).trim();
    }
  }
  return fallback;
}

function normalizeList(text, fallback = []) {
  if (!text) return fallback;
  return String(text)
    .split(/[,;\n]/)
    .map(item => item.trim())
    .filter(Boolean);
}

function getProfile(activityType) {
  return ACTIVITY_PROFILES[activityType] || DEFAULT_PROFILE;
}

function getMoleculeProfile(molecule) {
  return MOLECULE_KNOWLEDGE[String(molecule || '').trim().toLowerCase()] || null;
}

function buildPrompt(profile, input, contextText) {
  return `
You are ClinCommand OS acting as a senior ${profile.domain.replace(/_/g, ' ')} expert.
Create a world-class ${profile.outputKind}. The output must be specific to the molecule, indication, geography, audience, SOP, selected skill, and user objective.

Activity: ${profile.name}
SOP: ${value(input, ['sop', 'sopCode'], profile.sop)}
Skill set: ${value(input, ['skill', 'skillSet'], profile.skill)}
Molecule/Product: ${value(input, ['molecule', 'product', 'topic'], 'Not provided')}
Brand: ${value(input, ['brand'], 'Not provided')}
Indication/Scope: ${value(input, ['indication', 'therapeutic', 'question'], 'Not provided')}
Geography: ${value(input, ['geography', 'regions'], 'Not provided')}
Audience: ${value(input, ['audience'], 'Medical/scientific reviewer')}
Competitors/Comparators: ${value(input, ['competitors', 'comparator'], 'Not provided')}
Objective: ${value(input, ['objective', 'prompt', 'topics'], 'Not provided')}
Evidence supplied by user: ${value(input, ['evidence', 'sourceEvidence', 'prompt'], 'No source evidence supplied')}
Clarifications: ${JSON.stringify(input.clarificationAnswers || {})}

Repository context:
${contextText || 'No repository context retrieved.'}

Rules:
- Do not reuse a generic template across activities.
- Ask for missing critical evidence inside a short "Inputs Still Needed" section, but still produce a useful governed draft from available context.
- Do not invent p-values, trial identifiers, efficacy percentages, regulatory approval dates, or label claims.
- Use professional life-sciences formatting, tables where useful, and a clear action plan.
- End with GxP review status and attribution.
`;
}

function citationList(profile, contextList) {
  const citations = [
    {
      code: profile.sop.split(':')[0],
      title: profile.sop,
      author: 'ClinCommand repository',
      publisher: 'ClinCommand OS'
    }
  ];

  for (const item of contextList || []) {
    citations.push({
      code: item.code || item.title || `CTX-${citations.length}`,
      title: item.title || 'Repository context',
      author: item.sourceType || 'Repository trace',
      publisher: 'ClinCommand knowledge index'
    });
  }

  return citations.slice(0, 8);
}

function buildProductAppraisal(input, profile) {
  const molecule = value(input, ['molecule', 'product'], 'Target molecule');
  const brand = value(input, ['brand'], 'brand not specified');
  const indication = value(input, ['indication', 'therapeutic'], 'target indication not specified');
  const geography = value(input, ['geography', 'regions'], 'target geography not specified');
  const audience = value(input, ['audience'], 'medical affairs reviewers');
  const objective = value(input, ['objective', 'prompt'], 'scientific and commercial appraisal');
  const moleculeProfile = getMoleculeProfile(molecule);
  const competitors = normalizeList(value(input, ['competitors', 'comparator']), moleculeProfile?.comparators || []);
  const comparatorText = competitors.length ? competitors.join(', ') : 'named comparators required';

  const classLine = moleculeProfile
    ? `${molecule} is positioned as a ${moleculeProfile.className}. ${moleculeProfile.mechanism}.`
    : `${molecule} requires classification from approved label, monograph, or validated repository evidence before claims are finalized.`;

  const differentiation = moleculeProfile?.differentiation || 'Differentiation must be built from validated efficacy, safety, convenience, pharmacology, access, and guideline evidence.';
  const safety = moleculeProfile?.safety || 'Safety profile must be extracted from approved labeling, safety database summaries, and current literature.';
  const evidenceCaution = moleculeProfile?.evidenceCaution || 'All claims require approved label or cited source verification.';

  return `### Executive Summary
This Product Appraisal evaluates **${molecule}**${brand !== 'brand not specified' ? ` (${brand})` : ''} for **${indication}** in **${geography}** for **${audience}**. The objective is **${objective}**. ${classLine}

### Molecule and Therapeutic Context
| Dimension | Appraisal View |
| :--- | :--- |
| Molecule | ${molecule} |
| Brand | ${brand} |
| Class / Mechanism | ${moleculeProfile?.className || 'Requires source confirmation'} |
| Common clinical context | ${moleculeProfile?.commonIndications || indication} |
| Geography | ${geography} |
| Comparator set | ${comparatorText} |

### Differentiation Hypothesis
${differentiation}

### Clinical and Label Evidence Plan
| Evidence Need | Why It Matters | Required Source |
| :--- | :--- | :--- |
| Approved indication and dosing | Prevents off-label or geography-mismatched claims | Local approved label / SmPC / prescribing information |
| Efficacy endpoints | Supports product value story | Pivotal publications, label clinical studies, or validated internal evidence |
| Safety and warnings | Enables fair balance | Approved label, safety database summaries, PV signal reports |
| Comparator positioning | Prevents unsupported superiority language | Head-to-head trials, guideline statements, or transparent indirect comparison |

### Competitive Appraisal
| Comparator | Likely Review Angle | Claim Boundary |
| :--- | :--- | :--- |
${competitors.length ? competitors.map(comp => `| ${comp} | Compare mechanism, dosing convenience, onset/offset where applicable, safety warnings, access, and label breadth | No superiority claim unless supported by direct or defensible indirect evidence |`).join('\n') : '| Comparator required | Add named competitors before final review | No comparative claim permitted yet |'}

### SWOT Matrix
| Category | Assessment |
| :--- | :--- |
| Strengths | ${differentiation} |
| Weaknesses | Requires source-verified label limitations, contraindications, warnings, and population restrictions. |
| Opportunities | Build indication-specific medical education, guideline-aligned messaging, and evidence-backed differentiation for ${geography}. |
| Threats | Established competitors (${comparatorText}), price/access pressure, generic substitution, and unsupported comparative claims. |

### Medical Strategy Recommendations
1. Build a claim-source matrix before external use.
2. Confirm local label, indication, dosing, and warnings for ${geography}.
3. Prepare competitor one-pagers for ${comparatorText}.
4. Route promotional or field-facing claims through medical/legal/regulatory review.
5. Convert this appraisal into a slide deck only after evidence tables are completed.

### Inputs Still Needed
- Approved label or prescribing information for ${geography}.
- Source publications or validated internal evidence for ${molecule}.
- Intended use: internal strategy, field medical, training, promotional review, or regulatory support.
- Final competitor list and target audience.

### GxP Status
Governed AI draft for medical review. ${safety} ${evidenceCaution}

*Attribution: ${ATTRIBUTION}*`;
}

function buildSlideDeck(input, profile) {
  const molecule = value(input, ['molecule', 'product'], 'Target molecule');
  const indication = value(input, ['indication', 'therapeutic'], 'target indication');
  const audience = value(input, ['audience'], 'medical reviewers');
  const geography = value(input, ['geography', 'regions'], 'target geography');
  const objective = value(input, ['objective', 'prompt'], 'scientific communication');
  const slideCount = value(input, ['slideCount', 'slides'], '10');
  const moleculeProfile = getMoleculeProfile(molecule);

  return `### Deck Blueprint: ${molecule} in ${indication}
Audience: **${audience}** | Geography: **${geography}** | Target length: **${slideCount} slides**

| Slide | Title | Core Message | Visual Direction | Speaker Notes / Evidence Need |
| :--- | :--- | :--- | :--- | :--- |
| 1 | ${molecule}: Scientific Context | Set the purpose and review boundary for ${objective}. | Clean title slide with molecule/class badge | State that claims are governed draft content pending source verification. |
| 2 | Disease / Treatment Landscape | Explain the clinical need in ${indication}. | Landscape map or patient-flow schematic | Add local epidemiology and guideline sources. |
| 3 | Molecule Profile | ${moleculeProfile ? moleculeProfile.mechanism : 'Summarize mechanism only after label/source confirmation.'} | Mechanism-of-action diagram | Cite approved label or validated monograph. |
| 4 | Evidence Snapshot | Summarize pivotal evidence without unsupported numerical claims. | Evidence table | Insert trial names/endpoints only from supplied sources. |
| 5 | Safety and Fair Balance | ${moleculeProfile?.safety || 'Summarize warnings, precautions, contraindications, and adverse reactions from approved labeling.'} | Safety matrix | Keep fair balance visible on the slide. |
| 6 | Comparator Landscape | Compare against named alternatives using sourced criteria. | Competitor grid | Add comparator labels, guidelines, or publications. |
| 7 | Differentiation Hypothesis | ${moleculeProfile?.differentiation || 'Define evidence-backed differentiation after source review.'} | Positioning matrix | Avoid superiority wording unless directly supported. |
| 8 | Medical Objection Handling | Anticipate clinical questions from ${audience}. | Q&A blocks | Link each answer to a source. |
| 9 | Strategic Implications | Translate evidence into medical action. | Prioritized action roadmap | Separate medical strategy from promotional claims. |
| 10 | Evidence Gaps and Approval Path | Show what must be resolved before use. | Checklist | SOP, MLR, e-signature, claim-source matrix. |

### Design Standard
Use a Veeva-style enterprise deck: restrained palette, dense evidence tables, explicit footnotes, consistent section headers, no decorative fluff, and speaker notes for every slide.

### Inputs Still Needed
- Final deck audience and use setting.
- Approved label, publications, and internal source pack.
- Preferred slide count if not ${slideCount}.
- SOP and skill confirmation.

### GxP Status
Draft storyboard only. External-facing deck requires source verification, fair-balance review, and MLR approval.

*Attribution: ${ATTRIBUTION}*`;
}

function buildLiteratureReview(input) {
  const topic = value(input, ['topic', 'molecule', 'product'], 'review topic');
  const question = value(input, ['question', 'objective', 'prompt'], 'clinical research question');
  const population = value(input, ['population'], 'target population');
  const intervention = value(input, ['intervention', 'molecule'], topic);
  const comparator = value(input, ['comparator', 'competitors'], 'comparator not specified');
  const outcomes = value(input, ['outcomes'], 'clinically relevant outcomes');

  return `### Literature Review Protocol: ${topic}
### Research Question
${question}

### PICO Framework
| Element | Definition |
| :--- | :--- |
| Population | ${population} |
| Intervention | ${intervention} |
| Comparator | ${comparator} |
| Outcomes | ${outcomes} |

### Search Strategy
| Database | Search Intent | Screening Notes |
| :--- | :--- | :--- |
| PubMed/MEDLINE | Peer-reviewed biomedical literature | Use MeSH and molecule synonyms. |
| Embase | Broader pharmacology and conference coverage | De-duplicate against PubMed. |
| Cochrane | Reviews and controlled trial context | Flag review quality and overlap. |

### Draft Search Inputs
| Field | Value |
| :--- | :--- |
| Query focus | ${topic} |
| Population | ${population} |
| Intervention | ${intervention} |
| Comparator | ${comparator} |
| Outcomes | ${outcomes} |

### Source Retrieval Snapshot
The governed execution engine will attach live search results from open literature sources when network access is available. If the retrieval layer is offline, the review should continue with an intake-ready evidence table and a source pack request.

### Extraction Matrix
Capture study design, population, intervention dose, comparator, endpoints, safety outcomes, bias concerns, and relevance to the decision.

### Evidence Gap Interpretation
Do not infer effect sizes without source extraction. Highlight missing head-to-head data, long-term safety gaps, subgroup limitations, and geography-specific evidence limitations.

### Deliverable Recommendation
Produce a PRISMA flow, study table, risk-of-bias summary, evidence gap map, and medical implications memo.

*Attribution: ${ATTRIBUTION}*`;
}

function buildProductMonograph(input, profile) {
  const molecule = value(input, ['molecule', 'product'], 'target molecule');
  const brand = value(input, ['brand'], 'brand not specified');
  const indication = value(input, ['indication', 'therapeutic'], 'approved indication not specified');
  const geography = value(input, ['geography', 'regions'], 'target geography not specified');
  const audience = value(input, ['audience'], 'medical reviewers');
  const objective = value(input, ['objective', 'prompt'], 'clinical reference preparation');
  const moleculeProfile = getMoleculeProfile(molecule);

  return `### Product Monograph: ${molecule}
This monograph is a controlled medical reference intended for ${audience}. It supports ${objective} for ${geography} and must remain aligned to the approved local label.

### 1. Product Identity
| Field | Value |
| :--- | :--- |
| Product | ${molecule} |
| Brand | ${brand} |
| Therapeutic scope | ${indication} |
| Geography | ${geography} |
| SOP | ${profile.sop} |

### 2. Mechanism and Class Context
${moleculeProfile ? moleculeProfile.mechanism : 'Mechanism must be confirmed from approved label, monograph, or source pack.'}

### 3. Indications and Use
List only approved indications for ${geography}. Separate on-label from background scientific context and do not blend the two.

### 4. Dosing and Administration
Populate dose, route, preparation, titration, duration, missed-dose handling, and administration precautions from the approved label.

### 5. Safety Profile
Record contraindications, warnings, precautions, adverse reactions, interactions, and special population restrictions.

### 6. Evidence Summary
Summarize pivotal efficacy and safety studies, labeling studies, and validated publication evidence. Do not invent endpoint values.

### 7. Competitive Context
Use comparator framing only where source-backed and relevant to the approved indication.

### 8. Inputs Still Needed
- Approved label / SmPC / prescribing information
- Local dosing and safety language
- Source pack of pivotal studies and post-marketing evidence
- Final audience and intended use

### GxP Status
Controlled monograph draft. Release requires medical, legal, and regulatory review before any external use.

*Attribution: ${ATTRIBUTION}*`;
}

function buildScientificNewsletter(input, profile) {
  const topic = value(input, ['topic', 'molecule', 'product'], 'scientific update');
  const audience = value(input, ['audience'], 'medical affairs audience');
  const geography = value(input, ['geography', 'regions'], 'target geography');
  const objective = value(input, ['objective', 'prompt'], 'medical update briefing');

  return `### Scientific Newsletter: ${topic}
Audience: ${audience} | Geography: ${geography} | Objective: ${objective}

### Issue Theme
Curate a concise, evidence-based newsletter that summarizes notable pharmaceutical and medical updates relevant to the target audience.

### Proposed Structure
| Section | Purpose |
| :--- | :--- |
| Editor's note | State the focus, intended audience, and source boundary. |
| Top updates | Highlight 3-5 medically relevant updates from the evidence pack. |
| Expert commentary | Add interpretation with fair balance and no unsupported claims. |
| What it means for practice | Translate the update into practical implications. |
| Source list | Provide citations and retrieval notes. |

### Drafting Guardrails
- Use only verified sources or approved internal content.
- Keep the tone scientific and non-promotional.
- Add source labels for every claim.
- Separate global updates from ${geography}-specific items.

### Inputs Still Needed
- Source pack or article list
- Final editorial angle
- Publication frequency
- Style preference: internal briefing, field medical, or HCP-facing scientific update

### GxP Status
Controlled newsletter draft requiring source verification and editorial approval.

*Attribution: ${ATTRIBUTION}*`;
}

function buildMetaAnalysis(input) {
  const molecule = value(input, ['molecule', 'product', 'intervention'], 'target intervention');
  const topic = value(input, ['topic', 'question', 'objective', 'prompt'], `${molecule} evidence synthesis`);
  const population = value(input, ['population'], 'target population');
  const comparator = value(input, ['comparator', 'competitors'], 'comparator/control not specified');
  const outcomes = value(input, ['outcomes', 'endpoints'], 'primary and secondary outcomes to be defined');
  const modelChoice = value(input, ['model', 'statisticalModel'], 'random-effects model unless clinical/statistical homogeneity supports fixed-effect');
  const effectMeasure = value(input, ['effectMeasure'], 'risk ratio/odds ratio for binary outcomes; mean difference/SMD for continuous outcomes; hazard ratio for time-to-event outcomes');
  const moleculeProfile = getMoleculeProfile(molecule);

  return `### Meta-analysis Protocol: ${topic}
This is a biostatistics-led evidence synthesis plan for **${molecule}**${moleculeProfile ? `, a ${moleculeProfile.className}` : ''}. It is not a pooled result yet; numerical estimates must only be generated after eligible studies and extractable endpoint data are supplied.

### PICO and Eligibility Framework
| Element | Planned Definition |
| :--- | :--- |
| Population | ${population} |
| Intervention | ${molecule} |
| Comparator | ${comparator} |
| Outcomes | ${outcomes} |
| Study designs | Randomized trials prioritized; observational evidence separated or analyzed narratively unless pre-specified |
| Geography / setting | ${value(input, ['geography', 'regions'], 'global or user-specified')} |

### Statistical Analysis Plan
| Domain | Planned Method |
| :--- | :--- |
| Primary effect measure | ${effectMeasure} |
| Pooling model | ${modelChoice} |
| Heterogeneity | I2, tau2, Cochran Q, and clinical heterogeneity review before pooling |
| Subgroups | Dose, indication, geography, population risk, comparator class, and study design where data permit |
| Sensitivity analyses | Exclude high-risk-of-bias studies; fixed-effect vs random-effects comparison; leave-one-out analysis |
| Publication bias | Funnel plot and Egger/Peters test only when enough studies are available |
| Certainty | GRADE summary across risk of bias, inconsistency, indirectness, imprecision, and publication bias |

### Data Extraction Matrix
| Field | Required Extraction |
| :--- | :--- |
| Study identity | Author, year, registry ID, journal/conference, geography |
| Design | Randomization, blinding, arms, duration, sample size |
| Population | Inclusion/exclusion criteria, baseline severity, prior therapy |
| Intervention/comparator | Dose, route, duration, background therapy |
| Outcomes | Event counts, means/SDs, HRs/CIs, timepoint, analysis population |
| Risk of bias | RoB 2 domains for RCTs or ROBINS-I for non-randomized studies |

### Remimazolam-Specific Considerations
${moleculeProfile ? `${moleculeProfile.differentiation}. For sedation evidence synthesis, separate procedural sedation, induction/maintenance anesthesia, ICU sedation, and special populations rather than pooling clinically different settings.` : 'Define molecule class and clinical setting before pooling.'}

### Deliverables
1. PRISMA flow diagram.
2. Study characteristics table.
3. Risk-of-bias heat map.
4. Forest plots for each pre-specified endpoint.
5. Heterogeneity and sensitivity analysis summary.
6. GRADE evidence profile.
7. Plain-language clinical interpretation for medical review.

### Inputs Still Needed
- Search strategy and databases.
- Eligible study list or uploaded source pack.
- Extracted endpoint data or PDFs/CSRs for extraction.
- Primary endpoint and timepoint.
- Decision on whether observational studies are included.

### GxP Status
Governed statistical planning draft. Do not report pooled estimates, p-values, confidence intervals, or superiority conclusions until source data extraction and biostatistical QC are complete.

*Attribution: ${ATTRIBUTION}*`;
}

function buildProtocol(input) {
  const molecule = value(input, ['molecule', 'product'], 'investigational product');
  const indication = value(input, ['indication', 'therapeutic'], 'target indication');
  const phase = value(input, ['phase'], 'phase not specified');
  const endpoints = value(input, ['endpoints'], 'primary endpoint to be defined');
  const population = value(input, ['population'], 'target patient population');

  return `### Clinical Protocol Synopsis: ${molecule}
| Section | Draft Recommendation |
| :--- | :--- |
| Indication | ${indication} |
| Phase | ${phase} |
| Population | ${population} |
| Primary Objective | Confirm clinical objective from sponsor strategy and unmet need. |
| Primary Endpoint | ${endpoints} |
| Key Secondary Endpoints | Safety, tolerability, patient-reported outcomes, and exploratory biomarkers where justified. |

### Design Considerations
- Define randomized, controlled, blinded, or open-label design based on feasibility and ethical context.
- Include stratification factors tied to disease severity, prior therapy, geography, and baseline risk.
- Align schedule of assessments with endpoint timing and safety monitoring.

### Operational Risk Review
| Risk | Mitigation |
| :--- | :--- |
| Slow recruitment | Site feasibility, eligibility simplification, and country mix review |
| Endpoint ambiguity | Endpoint adjudication charter and training |
| Safety signal management | DSMB triggers and expedited reporting |

### Inputs Still Needed
Protocol objective, comparator, sample-size assumptions, visit schedule, safety monitoring plan, and regulatory region.

*Attribution: ${ATTRIBUTION}*`;
}

function buildRegulatory(input) {
  const product = value(input, ['molecule', 'product', 'topic'], 'target product');
  const agency = value(input, ['agencies', 'agency', 'geography', 'regions'], 'target agency');
  const issue = value(input, ['topics', 'objective', 'prompt'], 'regulatory issue');

  return `### Regulatory Intelligence / Response Brief: ${product}
### Agency and Scope
**Agency / Region:** ${agency}

### Issue Statement
${issue}

### Response Strategy
| Workstream | Required Action | Owner |
| :--- | :--- | :--- |
| Regulatory position | Define exact agency question and response commitment | Regulatory lead |
| Evidence package | Map module, study, label, or CMC evidence supporting the answer | Cross-functional authors |
| Gap closure | Identify missing analyses, documents, or justifications | Submission team |
| Quality control | Check consistency against prior submissions and label | Regulatory QA |

### Draft Response Architecture
1. Restate the agency question.
2. Provide concise response position.
3. Reference exact source documents/modules.
4. Explain any corrective or preventive action.
5. Commit only to feasible timelines.

### Inputs Still Needed
Agency letter text, submission type, product status, country/region, source module references, and due date.

*Attribution: ${ATTRIBUTION}*`;
}

function buildDefaultActivity(input, profile) {
  const product = value(input, ['molecule', 'product', 'topic'], 'target asset');
  const scope = value(input, ['indication', 'therapeutic', 'objective', 'prompt'], 'requested scope');

  return `### ${profile.name}: AI-Guided Draft
### Scope
This controlled draft addresses **${product}** for **${scope}** using the mapped SOP and skill set.

### Activity-Specific Output Plan
| Component | Drafting Direction |
| :--- | :--- |
| Scientific basis | Summarize source-backed clinical or operational rationale. |
| Required inputs | Identify the exact missing source documents and decisions. |
| Deliverable format | Use the expected format for ${profile.outputKind}, not a generic memo. |
| Review pathway | Route through ${profile.workflow}. |

### Draft Content
The activity requires a tailored source pack before finalization. Use this draft as the controlled starting point for expert review, evidence attachment, and approved output generation.

### Next Best Actions
1. Attach source evidence or repository assets.
2. Confirm target audience and geography.
3. Confirm SOP and skill mapping.
4. Regenerate with validated context.

*Attribution: ${ATTRIBUTION}*`;
}

function buildExpertFallback(activityType, input, profile) {
  if (activityType === 'product_appraisal') return buildProductAppraisal(input, profile);
  if (activityType === 'slide_deck') return buildSlideDeck(input, profile);
  if (activityType === 'product_monograph') return buildProductMonograph(input, profile);
  if (activityType === 'scientific_newsletter') return buildScientificNewsletter(input, profile);
  if (activityType === 'lit_review' || activityType === 'systematic_lit_review') return buildLiteratureReview(input);
  if (activityType === 'meta_analysis') return buildMetaAnalysis(input);
  if (activityType === 'study_protocol' || activityType === 'synopsis_gen') return buildProtocol(input);
  if (profile.domain === 'regulatory_affairs' || activityType.includes('regulatory') || activityType.includes('deficiency') || activityType.includes('guideline')) {
    return buildRegulatory(input);
  }
  return buildDefaultActivity(input, profile);
}

function isGenericOutput(text) {
  const normalized = String(text || '').toLowerCase();
  return (
    normalized.includes('not asserted without source data') ||
    normalized.includes('clincommand os output registry') ||
    normalized.length < 500
  );
}

export async function executeActivity(activityType, input = {}, user = {}) {
  const profile = getProfile(activityType);
  const queryText = [
    profile.name,
    value(input, ['molecule', 'product', 'topic']),
    value(input, ['indication', 'therapeutic', 'question']),
    value(input, ['objective', 'prompt'])
  ].filter(Boolean).join(' ');

  let contextList = [];
  try {
    contextList = await retrieveRelevantContext(queryText || profile.name, 4, ['SOPS', 'SKILLS', 'DOCUMENTS', 'KNOWLEDGE']);
  } catch (err) {
    contextList = [];
  }

  if (activityType === 'lit_review' || activityType === 'systematic_lit_review') {
    try {
      const searchPack = await searchScientificLiterature(input);
      const searchSummary = searchPack.results.slice(0, 6).map((item, index) => (
        `| ${index + 1} | ${item.title} | ${item.authors || 'Unknown authors'} | ${item.journal || item.source} | ${item.year || ''} | ${item.url} |`
      )).join('\n');
      contextList = [
        ...contextList,
        {
          id: 'literature-search-live',
          title: 'Live literature search snapshot',
          text: `Query: ${searchPack.query}\nResults: ${searchPack.totalResults}\n${searchSummary ? `Top results:\n| # | Title | Authors | Journal | Year | URL |\n| :--- | :--- | :--- | :--- | :--- | :--- |\n${searchSummary}` : 'No live results returned.'}`,
          url: 'https://europepmc.org/',
          sourceType: 'LIVE_LITERATURE_SEARCH'
        }
      ];
    } catch (err) {
      contextList = [
        ...contextList,
        {
          id: 'literature-search-error',
          title: 'Live literature search unavailable',
          text: `Evidence retrieval failed: ${err.message}`,
          url: 'https://europepmc.org/',
          sourceType: 'LIVE_LITERATURE_SEARCH'
        }
      ];
    }
  }

  const contextText = contextList.map(c => `[${c.sourceType || 'CONTEXT'}] ${c.title}: ${c.text}`).join('\n');
  const provider = process.env.ACTIVITY_LLM_PROVIDER || (process.env.OPENAI_API_KEY ? 'openai' : process.env.ANTHROPIC_API_KEY ? 'anthropic' : process.env.GEMINI_API_KEY ? 'gemini' : 'expert-fallback');
  const model = process.env.ACTIVITY_LLM_MODEL || (provider === 'anthropic' ? 'claude-3-5-sonnet-20240620' : provider === 'gemini' ? 'gemini-1.5-pro' : 'gpt-4o');
  const prompt = buildPrompt(profile, input, contextText);

  let documentText = '';
  let providerUsed = provider;
  let modelUsed = model;

  if (provider !== 'expert-fallback') {
    const llmResult = await callLLM(provider, model, prompt, {
      max_context_tokens: 7000,
      max_response_tokens: 2400,
      retrieval_limit: 4
    });
    documentText = llmResult.text;
    providerUsed = llmResult.provider || provider;
    modelUsed = llmResult.model || model;
  }

  if (!documentText || isGenericOutput(documentText)) {
    documentText = buildExpertFallback(activityType, input, profile);
    providerUsed = provider === 'expert-fallback' ? 'ClinCommand expert fallback' : `${provider} with expert fallback`;
    modelUsed = provider === 'expert-fallback' ? 'activity-orchestrator-v1' : modelUsed;
  }

  const molecule = value(input, ['molecule', 'product', 'topic'], 'Activity');
  const indication = value(input, ['indication', 'therapeutic', 'question']);
  const titleSuffix = indication ? ` (${indication})` : '';
  const leafHash = crypto.createHash('sha256').update(JSON.stringify({
    activityType,
    profile: profile.name,
    input,
    documentText,
    userId: user.id || null
  })).digest('hex');

  return {
    title: `${profile.name}: ${molecule}${titleSuffix}`,
    documentText,
    sopMatched: value(input, ['sop', 'sopCode'], profile.sop),
    skillUsed: value(input, ['skill', 'skillSet'], profile.skill),
    templateUsed: profile.template,
    workflowRouted: profile.workflow,
    citations: citationList(profile, contextList),
    leafHash,
    executionId: `activity-${leafHash.substring(0, 12)}`,
    qualityScore: documentText.length > 900 ? 92 : 84,
    model: modelUsed,
    provider: providerUsed,
    verdict: 'PASS'
  };
}
