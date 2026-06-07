import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  BookOpen, FileText, Briefcase, Activity, CheckSquare, ClipboardCheck, ArrowRight,
  Sparkles, CheckCircle2, ChevronDown, ChevronRight, FileSpreadsheet, Cpu, History,
  Database, ShieldCheck, HelpCircle, Layers, FileDown, Eye, Check, PenTool
} from 'lucide-react';

// Domain configuration including submenus and specific tasks
const DOMAIN_CONFIGS = {
  marketing: {
    title: 'Medical Marketing Activities',
    description: 'Manage scientific content, medical communications, publications planning, and training assets.',
    colorClass: 'text-brand-teal',
    bgClass: 'bg-brand-teal/5',
    borderClass: 'border-brand-teal-light',
    sections: [
      {
        title: 'Scientific Content',
        items: [
          { name: 'Product Appraisals', type: 'product_appraisal' },
          { name: 'Product Monograph', type: 'product_monograph' },
          { name: 'Literature Reviews', type: 'lit_review' },
          { name: 'Scientific Narratives', type: 'scientific_narrative' },
          { name: 'Clinical Summaries', type: 'clinical_summary' },
          { name: 'Slide Deck Creation', type: 'slide_deck' },
          { name: 'KOL Briefs', type: 'kol_brief' },
          { name: 'Competitive Intelligence', type: 'competitor_intel' },
          { name: 'Congress Coverage Reports', type: 'congress_coverage' }
        ]
      },
      {
        title: 'Medical Communications',
        items: [
          { name: 'FAQs', type: 'faq' },
          { name: 'Objection Handlers', type: 'objection_handler' },
          { name: 'Medical Information Responses', type: 'med_info_response' },
          { name: 'Scientific Q&A', type: 'scientific_qa' },
          { name: 'Field Force Support Documents', type: 'field_support' },
          { name: 'MSL Support Tools', type: 'msl_tools' },
          { name: 'Scientific Newsletter Builder', type: 'scientific_newsletter' }
        ]
      },
      {
        title: 'Publication Support',
        items: [
          { name: 'Publication Planning', type: 'pub_planning' },
          { name: 'Abstract Development', type: 'abstract_dev' },
          { name: 'Poster Development', type: 'poster_dev' },
          { name: 'Manuscript Support', type: 'manuscript_support' },
          { name: 'Omnichannel Medical Content', type: 'omnichannel_content' }
        ]
      },
      {
        title: 'Training',
        items: [
          { name: 'Training Modules', type: 'training_modules' },
          { name: 'Scientific Training Materials', type: 'training_materials' },
          { name: 'Assessment Generation', type: 'assessment_gen' },
          { name: 'Advisory Board Materials', type: 'advisory_board' }
        ]
      }
    ]
  },
  clinical: {
    title: 'Clinical Research Services',
    description: 'Design clinical trials protocols, operational plans, medical reports, and pharmacovigilance narratives.',
    colorClass: 'text-brand-blue',
    bgClass: 'bg-brand-blue/5',
    borderClass: 'border-brand-blue/20',
    sections: [
      {
        title: 'Protocol Development',
        items: [
          { name: 'Study Protocols', type: 'study_protocol' },
          { name: 'Synopsis Generation', type: 'synopsis_gen' },
          { name: 'Investigator Brochures', type: 'investigator_brochure' },
          { name: 'ICF Generation & Updates', type: 'icf_gen' }
        ]
      },
      {
        title: 'Clinical Operations',
        items: [
          { name: 'Site Management', type: 'site_mgmt' },
          { name: 'Monitoring Plans', type: 'monitoring_plans' },
          { name: 'Study Timelines', type: 'study_timelines' },
          { name: 'Risk Management Plans', type: 'risk_mgmt' },
          { name: 'Monitoring Visit Reports', type: 'monitoring_reports' }
        ]
      },
      {
        title: 'Medical Writing',
        items: [
          { name: 'Clinical Study Reports (CSR)', type: 'csr_drafting' },
          { name: 'Clinical Summaries', type: 'clinical_summaries_writing' },
          { name: 'Safety Narratives', type: 'safety_narrative' },
          { name: 'CSR Automation', type: 'csr_automation' }
        ]
      },
      {
        title: 'Evidence Generation',
        items: [
          { name: 'Systematic Literature Reviews', type: 'systematic_lit_review' },
          { name: 'Meta-analysis Support', type: 'meta_analysis' },
          { name: 'Evidence Gap Analysis', type: 'evidence_gap' },
          { name: 'Statistical Analysis Plans', type: 'statistical_plans' }
        ]
      },
      {
        title: 'Pharmacovigilance',
        items: [
          { name: 'Signal Detection', type: 'signal_detection' },
          { name: 'Case Narratives', type: 'case_narrative' },
          { name: 'Aggregate Reports', type: 'aggregate_reports' }
        ]
      }
    ]
  },
  regulatory: {
    title: 'Regulatory Services',
    description: 'Orchestrate eCTD submission modules, deficiency letters analysis, and landscape guidelines tracking.',
    colorClass: 'text-brand-green',
    bgClass: 'bg-brand-green/5',
    borderClass: 'border-brand-green/20',
    sections: [
      {
        title: 'Regulatory Writing',
        items: [
          { name: 'CTD Modules', type: 'ctd_modules' },
          { name: 'eCTD Documents', type: 'ectd_docs' },
          { name: 'Regulatory Responses', type: 'regulatory_responses' },
          { name: 'Deficiency Responses', type: 'deficiency_responses' },
          { name: 'IND/NDA/MAA Support', type: 'ind_nda_maa_support' }
        ]
      },
      {
        title: 'Regulatory Intelligence',
        items: [
          { name: 'Guideline Tracking', type: 'guideline_tracking' },
          { name: 'Agency Updates', type: 'agency_updates' },
          { name: 'Regulatory Landscape Reviews', type: 'landscape_reviews' }
        ]
      },
      {
        title: 'Submission Management',
        items: [
          { name: 'Submission Planning', type: 'submission_planning' },
          { name: 'Submission Tracking', type: 'submission_tracking' },
          { name: 'Variation Management', type: 'variation_mgmt' },
          { name: 'Labeling Review', type: 'labeling_review' },
          { name: 'Artwork Review', type: 'artwork_review' }
        ]
      },
      {
        title: 'Compliance',
        items: [
          { name: 'SOP Compliance Reviews', type: 'sop_compliance' },
          { name: 'CAPA Support', type: 'capa_support' },
          { name: 'Audit Readiness', type: 'audit_readiness' },
          { name: 'Submission Readiness Assessment', type: 'submission_readiness' }
        ]
      }
    ]
  }
};

export default function Workspace({ domain }) {
  const { token, user } = useAuth() as any;
  const config = DOMAIN_CONFIGS[domain] || DOMAIN_CONFIGS.marketing;
  
  // Accordion collapsed state management
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  
  // Active task selection
  const [activeTask, setActiveTask] = useState<any>(null);
  
  // Intake Wizard steps: 1 (Welcome), 2 (Form), 3 (Clarification), 4 (Recommendations), 5 (Execution)
  const [intakeStep, setIntakeStep] = useState(1);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [clarificationAnswers, setClarificationAnswers] = useState<Record<string, string>>({});
  const [generating, setGenerating] = useState(false);
  const [generationLogs, setGenerationLogs] = useState<string[]>([]);
  const [finalOutput, setFinalOutput] = useState<any>(null);
  const [activeOutputTab, setActiveOutputTab] = useState('document');
  
  // E-Sign parameters
  const [eSignOpen, setESignOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [reason, setReason] = useState('Author verification and audit vault commit.');
  const [eSignSuccess, setESignSuccess] = useState(false);

  const normalizeCitation = (citation: any, index: number) => {
    if (typeof citation === 'string') {
      return {
        code: citation,
        title: citation,
        author: 'Repository trace',
        publisher: 'ClinCommand repository'
      };
    }

    return {
      code: citation?.code || citation?.id || `REF-${index + 1}`,
      title: citation?.title || citation?.name || 'Repository evidence reference',
      author: citation?.author || citation?.source || 'Repository trace',
      journal: citation?.journal,
      publisher: citation?.publisher || citation?.system || 'ClinCommand repository'
    };
  };

  const normalizeFinalOutput = (output: any) => {
    const rawCitations = Array.isArray(output?.citations) ? output.citations : [];
    const leafHash = String(
      output?.leafHash ||
      output?.executionId ||
      output?.auditHash ||
      output?.traceId ||
      'pending-audit-hash'
    );

    return {
      title: output?.title || `${activeTask?.name || 'AI Activity'}: ${formData.molecule || formData.topic || 'Draft'}`,
      documentText: output?.documentText || output?.outputText || output?.text || 'No document text was returned by the execution engine.',
      sopMatched: output?.sopMatched || 'SOP-MA-001: Product Appraisal Control',
      skillUsed: output?.skillUsed || 'Pharmaceutical Product Appraisal Skill',
      templateUsed: output?.templateUsed || 'Repository-governed product appraisal framework',
      workflowRouted: output?.workflowRouted || 'SOP-MA-001 medical affairs review and signature control',
      citations: rawCitations.map(normalizeCitation),
      leafHash,
      executionId: output?.executionId,
      qualityScore: output?.qualityScore,
      model: output?.model,
      verdict: output?.verdict || 'PASS'
    };
  };

  const getDisplayHash = (output: any) => String(
    output?.leafHash ||
    output?.executionId ||
    output?.auditHash ||
    output?.traceId ||
    'pending-audit-hash'
  );

  // Set default collapsed fields
  useEffect(() => {
    setActiveTask(null);
    setIntakeStep(1);
    setFormData({});
    setClarificationAnswers({});
    setFinalOutput(null);
  }, [domain]);

  const [dbIntakeForms, setDbIntakeForms] = useState<Record<string, any>>({});
  
  // Fetch dynamic intake forms configuration from PostgreSQL
  useEffect(() => {
    if (!token || token.includes('simulated')) return;
    const fetchForms = async () => {
      try {
        const res = await fetch('/api/v1/intake/forms', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          const formsMap: Record<string, any> = {};
          data.forEach((f: any) => {
            formsMap[f.name] = f;
          });
          setDbIntakeForms(formsMap);
        }
      } catch (err) {
        console.warn('Failed to fetch dynamic intake forms from server:', err);
      }
    };
    fetchForms();
  }, [token]);

  const sessionId = activeTask ? `${domain}-${activeTask.type}-${user?.id}` : null;

  // Session Recovery: Load draft intake session state from PostgreSQL
  useEffect(() => {
    if (!sessionId || !token || token.includes('simulated')) return;

    const recoverSession = async () => {
      try {
        const res = await fetch(`/api/v1/intake/session/${sessionId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.status === 'DRAFT') {
            setFormData(data.form_data || {});
            setIntakeStep(data.current_step || 1);
            if (data.clarification_answers) {
              setClarificationAnswers(data.clarification_answers);
            }
            console.log('GxP Session Recovery: Loaded draft state.', data);
          }
        }
      } catch (err) {
        console.warn('Failed to recover draft intake session:', err);
      }
    };
    recoverSession();
  }, [sessionId, token]);

  // Auto-Save: Debounced session backup to PostgreSQL
  useEffect(() => {
    if (!sessionId || !token || token.includes('simulated') || intakeStep >= 5) return;

    const autoSave = async () => {
      try {
        await fetch('/api/v1/intake/session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            id: sessionId,
            domain,
            formData,
            clarificationAnswers,
            currentStep: intakeStep,
            status: 'DRAFT'
          })
        });
      } catch (err) {
        console.warn('GxP Auto-Save failed:', err);
      }
    };

    const timeoutId = setTimeout(autoSave, 800); // 800ms debounce window
    return () => clearTimeout(timeoutId);
  }, [formData, clarificationAnswers, intakeStep, sessionId, token]);

  const toggleSection = (sectionTitle) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionTitle]: !prev[sectionTitle]
    }));
  };

  const handleSelectItem = (item) => {
    setActiveTask(item);
    setIntakeStep(1);
    setFormData({});
    setClarificationAnswers({});
    setFinalOutput(null);
  };

  // Step 2 form configurations
  const getIntakeFields = (type) => {
    if (dbIntakeForms[type]) {
      return dbIntakeForms[type].fields;
    }
    switch (type) {
      case 'product_appraisal':
        return [
          { key: 'molecule', label: 'Molecule Name', placeholder: 'e.g. Remimazolam' },
          { key: 'brand', label: 'Brand Name (Optional)', placeholder: 'e.g. Byfavo' },
          { key: 'therapeutic', label: 'Therapeutic Area', placeholder: 'e.g. Anesthesiology' },
          { key: 'indication', label: 'Indication', placeholder: 'e.g. Procedural Sedation' },
          { key: 'geography', label: 'Geographic Market', placeholder: 'e.g. India, EU, US' },
          { key: 'audience', label: 'Target Audience', placeholder: 'e.g. MSL team, KOLs, medical reviewers' },
          { key: 'competitors', label: 'Competitor Products (Comma separated)', placeholder: 'e.g. Propofol, Midazolam' },
          { key: 'sop', label: 'SOP to Apply', placeholder: 'e.g. SOP-MA-001 Product Appraisal Control' },
          { key: 'skill', label: 'AI Skill Set', placeholder: 'e.g. Product appraisal strategist + claim-source mapper' },
          { key: 'objective', label: 'Appraisal Objective', placeholder: 'e.g. Market approval and positioning' },
          { key: 'evidence', label: 'Evidence / Source Pack', placeholder: 'Paste label excerpts, trial abstracts, publication notes, or repository references.', isTextArea: true },
          { key: 'prompt', label: 'Custom Positioning / SWOT Focus', placeholder: 'What specific product positioning or competitive benchmarking is required?', isTextArea: true }
        ];
      case 'product_monograph':
        return [
          { key: 'molecule', label: 'Molecule Name', placeholder: 'e.g. Remimazolam' },
          { key: 'brand', label: 'Brand Name (Optional)', placeholder: 'e.g. Byfavo' },
          { key: 'therapeutic', label: 'Therapeutic Area', placeholder: 'e.g. Anesthesiology' },
          { key: 'indication', label: 'Approved Indication', placeholder: 'e.g. Procedural Sedation' },
          { key: 'geography', label: 'Geographic Market', placeholder: 'e.g. India, EU, US' },
          { key: 'audience', label: 'Target Audience', placeholder: 'e.g. medical reviewers, regulatory teams' },
          { key: 'sop', label: 'SOP to Apply', placeholder: 'e.g. SOP-MA-010 Product Monograph Development' },
          { key: 'skill', label: 'AI Skill Set', placeholder: 'e.g. Medical monograph writer' },
          { key: 'objective', label: 'Monograph Objective', placeholder: 'e.g. Core medical reference' },
          { key: 'evidence', label: 'Evidence / Source Pack', placeholder: 'Paste label excerpts, trials, publications, or validated references.', isTextArea: true },
          { key: 'prompt', label: 'Additional Guidance', placeholder: 'Specify the structure, emphasis, or compliance boundary.', isTextArea: true }
        ];
      case 'slide_deck':
        return [
          { key: 'molecule', label: 'Molecule Name', placeholder: 'e.g. Rabeprazole' },
          { key: 'brand', label: 'Brand Name (Optional)', placeholder: 'e.g. AcipHex / local brand' },
          { key: 'therapeutic', label: 'Therapeutic Area', placeholder: 'e.g. Gastroenterology' },
          { key: 'indication', label: 'Deck Indication / Topic', placeholder: 'e.g. GERD management' },
          { key: 'geography', label: 'Geographic Market', placeholder: 'e.g. India, US, EU' },
          { key: 'audience', label: 'Audience', placeholder: 'e.g. Gastroenterologists, MSLs, field medical team' },
          { key: 'slideCount', label: 'Preferred Slide Count', placeholder: 'e.g. 10' },
          { key: 'sop', label: 'SOP to Apply', placeholder: 'e.g. SOP-MA-042 Medical Slide Deck Development' },
          { key: 'skill', label: 'AI Skill Set', placeholder: 'e.g. Evidence-to-slide storyline architect' },
          { key: 'objective', label: 'Deck Objective', placeholder: 'e.g. Internal medical training, KOL discussion, launch readiness' },
          { key: 'evidence', label: 'Evidence / Source Pack', placeholder: 'Paste label excerpts, trial data, publication summaries, or approved claims.', isTextArea: true },
          { key: 'prompt', label: 'Narrative Direction', placeholder: 'Describe the storyline, claims to test, visual style, and sections you expect.', isTextArea: true }
        ];
      case 'lit_review':
        return [
          { key: 'topic', label: 'Topic Name', placeholder: 'e.g. GLP-1 agonists in Obesity' },
          { key: 'question', label: 'Research Question', placeholder: 'e.g. Efficacy of Semaglutide vs Liraglutide' },
          { key: 'population', label: 'Population', placeholder: 'e.g. Adults with BMI > 30' },
          { key: 'intervention', label: 'Intervention', placeholder: 'e.g. Semaglutide 2.4mg once weekly' },
          { key: 'comparator', label: 'Comparator', placeholder: 'e.g. Liraglutide 3.0mg daily' },
          { key: 'outcomes', label: 'Outcomes', placeholder: 'e.g. Percentage body weight reduction at 56 weeks' },
          { key: 'daterange', label: 'Date Range', placeholder: 'e.g. 2018 - 2026' },
          { key: 'databases', label: 'Preferred Databases', placeholder: 'e.g. PubMed, Embase, Cochrane' },
          { key: 'audience', label: 'Target Audience', placeholder: 'e.g. clinical research team, publication committee' },
          { key: 'sop', label: 'SOP to Apply', placeholder: 'e.g. SOP-CLN-089 Systematic Review Standards' },
          { key: 'skill', label: 'AI Skill Set', placeholder: 'e.g. PICO evidence review specialist' },
          { key: 'evidence', label: 'Known Evidence / Seed References', placeholder: 'Paste known papers, trial names, labels, or search strings.', isTextArea: true },
          { key: 'prompt', label: 'Evidence Gap Details', placeholder: 'Please describe the evidence gap or clinical question you want investigated.', isTextArea: true }
        ];
      case 'meta_analysis':
        return [
          { key: 'molecule', label: 'Intervention / Molecule', placeholder: 'e.g. Remimazolam' },
          { key: 'topic', label: 'Meta-analysis Topic', placeholder: 'e.g. Remimazolam for procedural sedation' },
          { key: 'population', label: 'Population', placeholder: 'e.g. Adults undergoing short procedures' },
          { key: 'comparator', label: 'Comparator / Control', placeholder: 'e.g. Midazolam, Propofol, placebo' },
          { key: 'outcomes', label: 'Outcomes / Endpoints', placeholder: 'e.g. sedation success, recovery time, hypotension, respiratory depression' },
          { key: 'effectMeasure', label: 'Effect Measure', placeholder: 'e.g. risk ratio, mean difference, hazard ratio' },
          { key: 'model', label: 'Statistical Model', placeholder: 'e.g. random-effects, fixed-effect, Bayesian NMA' },
          { key: 'databases', label: 'Search Databases', placeholder: 'e.g. PubMed, Embase, Cochrane, ClinicalTrials.gov' },
          { key: 'geography', label: 'Geographic / Setting Scope', placeholder: 'e.g. global procedural sedation trials' },
          { key: 'sop', label: 'SOP to Apply', placeholder: 'e.g. SOP-BIO-021 Meta-analysis and Evidence Synthesis Control' },
          { key: 'skill', label: 'AI Skill Set', placeholder: 'e.g. Biostatistical meta-analysis methodologist' },
          { key: 'evidence', label: 'Study List / Extracted Data', placeholder: 'Paste study names, abstracts, event counts, means/SDs, HRs/CIs, or source notes.', isTextArea: true },
          { key: 'prompt', label: 'Analysis Objective', placeholder: 'Describe the comparison, endpoint hierarchy, subgroup needs, and preferred output.', isTextArea: true }
        ];
      case 'study_protocol':
        return [
          { key: 'molecule', label: 'Molecule Name', placeholder: 'e.g. Obeticholic Acid' },
          { key: 'indication', label: 'Indication', placeholder: 'e.g. Primary Biliary Cholangitis' },
          { key: 'phase', label: 'Study Phase', placeholder: 'e.g. Phase IIIb Clinical Trial' },
          { key: 'objectives', label: 'Objectives', placeholder: 'e.g. Evaluate long-term safety and survival benefits' },
          { key: 'endpoints', label: 'Primary Endpoints', placeholder: 'e.g. Reduction in alkaline phosphatase levels' },
          { key: 'population', label: 'Study Population Criteria', placeholder: 'e.g. Adult patients with inadequate response to UDCA' },
          { key: 'geography', label: 'Geographic Regions', placeholder: 'e.g. Multi-center (US, EU, APAC)' },
          { key: 'audience', label: 'Target Review Audience', placeholder: 'e.g. sponsor team, CRO, investigator meeting' },
          { key: 'sop', label: 'SOP to Apply', placeholder: 'e.g. SOP-CLN-012 Study Protocol Standards' },
          { key: 'skill', label: 'AI Skill Set', placeholder: 'e.g. ICH E6 protocol synopsis builder' },
          { key: 'evidence', label: 'Protocol Inputs / Source Pack', placeholder: 'Paste study assumptions, comparator, schedule, or regulatory advice.', isTextArea: true },
          { key: 'prompt', label: 'Section Prioritization & Objectives', placeholder: 'What protocol sections should be prioritized?', isTextArea: true }
        ];
      case 'guideline_tracking':
        return [
          { key: 'agencies', label: 'Regulatory Agencies', placeholder: 'e.g. FDA, EMA, CDSCO' },
          { key: 'therapeutic', label: 'Therapeutic Area', placeholder: 'e.g. Oncology, Cardiology' },
          { key: 'category', label: 'Product Category', placeholder: 'e.g. Biologics, Small Molecules' },
          { key: 'regions', label: 'Geographic Regions', placeholder: 'e.g. North America, European Union' },
          { key: 'topics', label: 'Topics of Interest', placeholder: 'e.g. Biosimilars Guideline updates, CAR-T guidelines' },
          { key: 'audience', label: 'Target Audience', placeholder: 'e.g. regulatory affairs, labeling team, submission team' },
          { key: 'sop', label: 'SOP to Apply', placeholder: 'e.g. SOP-REG-110 Regulatory Intelligence Monitoring' },
          { key: 'skill', label: 'AI Skill Set', placeholder: 'e.g. regulatory intelligence analyst' },
          { key: 'evidence', label: 'Agency Source / Known Guidance', placeholder: 'Paste agency links, titles, notes, or deficiency text.', isTextArea: true },
          { key: 'prompt', label: 'Guidance Level Preference', placeholder: 'Would you like draft guidance, final guidance, agency notices, or all updates?', isTextArea: true }
        ];
      case 'scientific_newsletter':
        return [
          { key: 'topic', label: 'Newsletter Theme', placeholder: 'e.g. Medical and pharma updates' },
          { key: 'audience', label: 'Target Audience', placeholder: 'e.g. medical affairs, field medical, HCPs' },
          { key: 'geography', label: 'Geographic Scope', placeholder: 'e.g. India, Global' },
          { key: 'objective', label: 'Editorial Objective', placeholder: 'e.g. monthly evidence briefing' },
          { key: 'sop', label: 'SOP to Apply', placeholder: 'e.g. SOP-MA-055 Scientific Newsletter Development' },
          { key: 'skill', label: 'AI Skill Set', placeholder: 'e.g. Scientific newsletter editor' },
          { key: 'evidence', label: 'Source Pack / Article List', placeholder: 'Paste article titles, abstracts, or source links.', isTextArea: true },
          { key: 'prompt', label: 'Editorial Angle', placeholder: 'Specify the angle, sections, or tone.', isTextArea: true }
        ];
      default:
        return [
          { key: 'molecule', label: 'Molecule Name / Product Ref', placeholder: 'e.g. Remimazolam' },
          { key: 'therapeutic', label: 'Therapeutic Indication / Scope', placeholder: 'e.g. Anesthesiology - procedural sedation' },
          { key: 'geography', label: 'Geographic Market', placeholder: 'e.g. India, EU, US' },
          { key: 'audience', label: 'Target Audience', placeholder: 'e.g. medical reviewers, regulators, KOLs, study team' },
          { key: 'sop', label: 'SOP to Apply', placeholder: 'Select or type the SOP governing this activity' },
          { key: 'skill', label: 'AI Skill Set', placeholder: 'Describe the specialist AI skill to use' },
          { key: 'evidence', label: 'Evidence / Source Pack', placeholder: 'Paste source evidence, label text, trial notes, or repository references.', isTextArea: true },
          { key: 'prompt', label: 'Requirement Summary', placeholder: 'Describe what outputs, drafts, or workflows are required for this action.', isTextArea: true }
        ];
    }
  };

  // Simulated validation/clarification questions
  const getAIClarifications = (type) => {
    switch (type) {
      case 'product_appraisal':
        return [
          { key: 'q1', label: 'Which claim boundary should govern this appraisal: internal medical strategy, field medical, promotional review, or regulatory support?' },
          { key: 'q2', label: 'Which comparator set and geography should be treated as final for this draft?' }
        ];
      case 'product_monograph':
        return [
          { key: 'q1', label: 'Should the monograph be written as a core medical reference or an audience-specific summary?' },
          { key: 'q2', label: 'Do you want strict approved-label language only, or a source-backed scientific context section as well?' }
        ];
      case 'slide_deck':
        return [
          { key: 'q1', label: 'Should this deck be written as scientific training, KOL discussion, launch readiness, or medical/legal/regulatory review material?' },
          { key: 'q2', label: 'Do you want detailed speaker notes and evidence footnotes on every slide?' }
        ];
      case 'lit_review':
        return [
          { key: 'q1', label: 'Should the literature search retrieve peer-reviewed journals only, or include medRxiv preprints?' },
          { key: 'q2', label: 'Should the study extraction filter exclude trials evaluating combinations with metformin?' }
        ];
      case 'meta_analysis':
        return [
          { key: 'q1', label: 'Should this be pairwise meta-analysis only, or should we plan a network meta-analysis if the treatment network supports it?' },
          { key: 'q2', label: 'Which endpoint and timepoint should be treated as primary for pooling?' }
        ];
      case 'study_protocol':
        return [
          { key: 'q1', label: 'Should we run sample-size power calculation recommendations matching the draft design?' },
          { key: 'q2', label: 'Is there a specific historical trial control group dataset we should link as a baseline reference?' }
        ];
      case 'guideline_tracking':
        return [
          { key: 'q1', label: 'Do you want email updates scheduled for weekly changes digests, or instant alerts on draft updates?' },
          { key: 'q2', label: 'Should guideline filters target drug-device combination regulations specifically?' }
        ];
      case 'scientific_newsletter':
        return [
          { key: 'q1', label: 'Should the newsletter be internal medical affairs only, or HCP-facing after review?' },
          { key: 'q2', label: 'Do you want a short bulletin format or a full featured update with article summaries?' }
        ];
      default:
        return [
          { key: 'q1', label: 'What regulatory jurisdiction rules (FDA vs. EMA vs. CDSCO) should govern the draft guidelines?' },
          { key: 'q2', label: 'Should we prioritize local database references over global PubMed literature pools?' }
        ];
    }
  };

  const getActivityGovernanceProfile = (type) => {
    const profiles = {
      product_appraisal: {
        sop: 'SOP-MA-001: Product Appraisal Control',
        template: 'Medical affairs product appraisal dossier',
        skill: 'Product appraisal strategist',
        workflow: 'Medical Director peer review and e-signature control'
      },
      product_monograph: {
        sop: 'SOP-MA-010: Product Monograph Development',
        template: 'Controlled product monograph reference',
        skill: 'Medical monograph writer',
        workflow: 'Medical and regulatory review before release'
      },
      slide_deck: {
        sop: 'SOP-MA-042: Medical Slide Deck Development',
        template: 'Scientific slide deck with speaker notes',
        skill: 'Evidence-to-slide storyline architect',
        workflow: 'Medical/legal/regulatory review before external use'
      },
      lit_review: {
        sop: 'SOP-CLN-089: Systematic Review Standards',
        template: 'PICO / PRISMA evidence extraction matrix',
        skill: 'PICO evidence review specialist',
        workflow: 'Clinical research review and bibliography verification'
      },
      systematic_lit_review: {
        sop: 'SOP-CLN-089: Systematic Review Standards',
        template: 'PICO / PRISMA systematic review protocol',
        skill: 'PICO evidence review specialist',
        workflow: 'Clinical research review and bibliography verification'
      },
      meta_analysis: {
        sop: 'SOP-BIO-021: Meta-analysis and Evidence Synthesis Control',
        template: 'PICO meta-analysis protocol and statistical analysis plan',
        skill: 'Biostatistical meta-analysis methodologist',
        workflow: 'Biostatistics, clinical, and publication committee review'
      },
      study_protocol: {
        sop: 'SOP-CLN-012: Clinical Protocol Development',
        template: 'ICH-compliant protocol synopsis',
        skill: 'ICH E6 protocol synopsis builder',
        workflow: 'Clinical operations, biostatistics, safety, and medical review'
      },
      guideline_tracking: {
        sop: 'SOP-REG-110: Regulatory Intelligence Monitoring',
        template: 'Guideline impact tracker',
        skill: 'Regulatory intelligence analyst',
        workflow: 'Regulatory intelligence review and action-owner assignment'
      },
      scientific_newsletter: {
        sop: 'SOP-MA-055: Scientific Newsletter Development',
        template: 'Scientific newsletter briefing',
        skill: 'Scientific newsletter editor',
        workflow: 'Editorial and medical review before publication'
      },
      regulatory_responses: {
        sop: 'SOP-REG-102: Health Authority Response Management',
        template: 'Agency response briefing note',
        skill: 'Regulatory deficiency response writer',
        workflow: 'Regulatory affairs approval and accountable person signoff'
      },
      deficiency_responses: {
        sop: 'SOP-REG-102: Health Authority Response Management',
        template: 'Deficiency response action matrix',
        skill: 'Regulatory deficiency response writer',
        workflow: 'Regulatory affairs approval and accountable person signoff'
      }
    };

    return profiles[type] || {
      sop: formData.sop || 'SOP-GXP-001: Controlled AI Draft Generation',
      template: `${activeTask?.name || 'Activity'} controlled draft`,
      skill: formData.skill || 'Life sciences expert drafting agent',
      workflow: 'Author review, peer review, and e-signature control'
    };
  };

  const handleNextStep = () => {
    if (intakeStep === 2) {
      // Transition with a short AI thinking delay
      setIntakeStep(3);
    } else if (intakeStep === 3) {
      setIntakeStep(4);
    }
  };

  const buildFinalOutput = async () => {
    if (!token || token.includes('simulated')) {
      return normalizeFinalOutput(generateSimulatedOutput(activeTask.type, formData, clarificationAnswers));
    }

    try {
      const response = await fetch('/api/v1/activities/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          activityType: activeTask.type,
          domain,
          input: formData,
          clarificationAnswers
        })
      });

      if (response.ok) {
        return normalizeFinalOutput(await response.json());
      }

      const errorPayload = await response.json().catch(() => ({}));
      throw new Error(errorPayload.message || errorPayload.error || 'AI activity execution failed');
    } catch (err) {
      console.warn('Governed AI activity execution failed:', err);
      return normalizeFinalOutput({
        title: `${activeTask.name}: ${formData.molecule || formData.topic || 'Draft'}${formData.indication ? ` (${formData.indication})` : ''}`,
        documentText: `### Execution Blocked
The governed AI activity execution path could not complete.

### Clinical Claim Safety
No efficacy, safety, onset-time, p-value, comparator, or adverse-event claims have been generated because the repository execution did not return a validated result.

### Required Action
Verify repository synchronization, AI provider configuration, and mapped SOP/skill settings, then rerun with source evidence attached.`,
        sopMatched: formData.sop || 'Mapped SOP pending confirmation',
        skillUsed: formData.skill || 'Mapped AI skill pending confirmation',
        templateUsed: 'Repository-governed activity framework',
        workflowRouted: 'Blocked pending governed execution',
        citations: [],
        leafHash: 'blocked'
      });
    }
  };

  // Launch compilation logs animation
  const handleLaunchExecution = () => {
    setIntakeStep(5);
    setGenerating(true);
    setGenerationLogs([]);

    // Submit session draft status update to Postgres
    if (sessionId && !token.includes('simulated')) {
      fetch(`/api/v1/intake/session/${sessionId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ formData, clarificationAnswers })
      }).catch(err => console.warn('Intake session submit failed:', err));
    }
    
    const logs = [
      '[SYSTEM] Initializing intake session routing parameters...',
      `[DATABASE] Context query mapped to active Tenant ID: ${user?.tenant_id || 1}`,
      '[KNOWLEDGEBASE] Running pgvector index search mapping topics...',
      `[AI ROUTER] Matching ${activeTask.name} to specialist activity engine...`,
      `[AI ENGINE] Applying ${formData.skill || getActivityGovernanceProfile(activeTask.type).skill} under ${formData.sop || getActivityGovernanceProfile(activeTask.type).sop}...`,
      '[COMPLIANCE] Validating requirements schema checks...',
      '[SECURITY] Injecting Row-Level Security (RLS) execution locks...',
      '[AUDIT VAULT] Committing signature hash to blockchain ledger...',
      '[SUCCESS] Artifact compilation completed. Registering leaf hash block.'
    ];

    logs.forEach((log, index) => {
      setTimeout(() => {
        setGenerationLogs(prev => [...prev, log]);
        if (index === logs.length - 1) {
          setGenerating(false);
          buildFinalOutput().then(setFinalOutput);
        }
      }, (index + 1) * 350);
    });
  };

  const generateSimulatedOutput = (type, inputs, clarifications) => {
    const molecule = inputs.molecule || 'Remimazolam';
    const therapeutic = inputs.therapeutic || 'Anesthesiology';
    const indication = inputs.indication || 'Procedural Sedation';
    
    switch (type) {
      case 'product_appraisal':
        return {
          title: `Product Appraisal: ${molecule} (${indication})`,
          documentText: `### 1. Executive Summary
          This Product Appraisal draft establishes the requested scientific review scope for ${molecule} in ${therapeutic} for the indication of ${indication}. Clinical claims are intentionally withheld until source trials, labels, or publications are attached and reviewed.
          
          ### 2. Clinical Trial & Efficacy Reference Mapping
          * **Primary Trial:** Evidence required before trial identifiers or endpoint results can be asserted.
          * **Results:** No p-values, onset times, response rates, or safety rates are generated without source evidence.
          
          ### 3. SWOT Competitive Benchmarking Matrix
          
          | Category | Assessment Parameters | Clinical Justification |
          | :--- | :--- | :--- |
          | **Strengths** | Pending evidence extraction | Requires cited efficacy or safety source. |
          | **Weaknesses** | Pending evidence extraction | Requires cited limitations, exclusions, or safety source. |
          | **Opportunities** | Pending market and label review | Requires approved indication and access context. |
          | **Threats** | Pending competitor review | Requires sourced comparator evidence. |
          
          ### 4. Product Monograph & Packaging Directives
          All clinical labeling must be checked against approved labeling and applicable local guidance before use.`,
          sopMatched: 'SOP-MA-001: Product Appraisal Control Guidelines',
          skillUsed: 'Pharmaceutical Product Appraisal Skill (repository)',
          templateUsed: 'Repository-governed Appraisal Framework',
          workflowRouted: 'Medical Director review and e-signature control',
          citations: [],
          leafHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
        };
      case 'lit_review':
        return {
          title: `Literature Review: ${inputs.topic || 'GLP-1 vs GIP Efficacy'}`,
          documentText: `### 1. Systematic Review Focus
          * **Research Question:** ${inputs.question || 'Comparative efficacy on weight loss outcomes.'}
          * **Population:** Patients with target BMI metrics.
          * **Intervention:** ${inputs.intervention || 'Semaglutide'}
          
          ### 2. PICO Framework Extraction Matrix
          
          | Element | Definition Parameters | Selected Target Criteria |
          | :--- | :--- | :--- |
          | **Population** | Adult Obese Patients | BMI > 30 kg/m² without diabetes mellitus |
          | **Intervention** | Once-weekly GLP-1 | Semaglutide 2.4mg Subcutaneous injection |
          | **Comparator** | Once-daily GLP-1 | Liraglutide 3.0mg Subcutaneous injection |
          | **Outcome** | Primary Endpoint | Percentage weight reduction at week 56 |
          
          ### 3. PRISMA Extraction Flowchart
          * **Records Identified:** PubMed (n=452), Embase (n=812), Cochrane (n=45).
          * **Duplicates Removed:** n=288.
          * **Screened Records:** n=1,021.
          * **Studies Included in Meta-Analysis:** n=12 clinical trials.
          
          ### 4. Evidence Gap Analysis & Meta-Analysis
          Significant clinical data gaps exist regarding long-term compliance (>2 years) and rebound obesity occurrences after therapy cessation.`,
          sopMatched: 'SOP-CLN-089: Systematic Review Methodology',
          skillUsed: 'PICO Query Compiler (v2.1)',
          templateUsed: 'PRISMA Extraction Outline',
          workflowRouted: 'Clinical Research Director Signoff',
          citations: [
            { code: 'PUB-NEJM-2021', title: 'Once-Weekly Semaglutide in Adults with Overweight or Obesity.', journal: 'New England Journal of Medicine', author: 'Wilding et al.' },
            { code: 'PUB-LANCET-2022', title: 'Liraglutide and cardiovascular outcomes in obese trials.', journal: 'The Lancet', author: 'Davies et al.' }
          ],
          leafHash: '8f73b64c6dc92d6e3c5ec8ec4ec85c988b9015949b934a362f7902d1b785d92e'
        };
      case 'product_monograph':
        return {
          title: `Product Monograph: ${molecule}`,
          documentText: `### 1. Product Identity
This controlled monograph reference summarizes ${molecule} for ${therapeutic} and must stay aligned with approved local labeling.

### 2. Indications and Use
Approved indication boundary must be taken from the validated source pack.

### 3. Safety Profile
Warnings, precautions, contraindications, and interactions must be sourced before release.

### 4. Evidence Summary
Insert pivotal studies, labeling claims, and publication references only from validated sources.

### 5. Inputs Still Needed
Approved label, dosing, local safety language, and audience-specific formatting preferences.`,
          sopMatched: 'SOP-MA-010: Product Monograph Development',
          skillUsed: 'Medical monograph writer',
          templateUsed: 'Controlled product monograph reference',
          workflowRouted: 'Medical and regulatory review before release',
          citations: [],
          leafHash: 'monograph-placeholder-hash'
        };
      case 'scientific_newsletter':
        return {
          title: `Scientific Newsletter: ${inputs.topic || 'Medical Updates'}`,
          documentText: `### 1. Editorial Summary
Curate medically relevant updates for ${inputs.audience || 'medical affairs'} in ${inputs.geography || 'global'}.

### 2. Top Stories
Summarize 3-5 validated updates from the source pack.

### 3. Practice Implications
Describe the scientific relevance without promotional language.

### 4. Sources
Attach article titles, authors, journal names, and publication dates.

### 5. Inputs Still Needed
Source pack, editorial angle, publishing frequency, and approval route.`,
          sopMatched: 'SOP-MA-055: Scientific Newsletter Development',
          skillUsed: 'Scientific newsletter editor',
          templateUsed: 'Scientific newsletter briefing',
          workflowRouted: 'Editorial and medical review before publication',
          citations: [],
          leafHash: 'newsletter-placeholder-hash'
        };
      case 'study_protocol':
        return {
          title: `Study Protocol Outline: ${molecule} (${indication})`,
          documentText: `### 1. Synopsis & Protocol ID
          * **Protocol Code:** Clin-${molecule}-PhaseIIIb
          * **Indication:** ${indication}
          * **Molecule:** ${molecule}
          * **Study Phase:** ${inputs.phase || 'Phase IIIb Clinical Trial'}
          
          ### 2. Primary & Secondary Endpoints
          * **Primary:** ${inputs.endpoints || 'Safety and survival benefit rates.'}
          * **Secondary:** Pharmacokinetics clearance rates, quality-of-life survey results, hospital stay reduction durations.
          
          ### 3. Design Matrix Summary
          
          | Section | Design Criteria | Protocol Definition |
          | :--- | :--- | :--- |
          | **Design Type** | Double-blind, Randomized | Multi-center active comparator controlled trial. |
          | **Dosage Schedule** | Experimental Arm | Titration from 5mg up to 15mg weekly based on tolerance. |
          | **Inclusion Criteria** | Age 18-75 years | Patient diagnosed with Primary Biliary Cholangitis. |
          
          ### 4. Regulatory Safety Mapping
          Safety reports must document all treatment-emergent adverse events (TEAEs) to database vaults in under 24 hours to comply with PV standards.`,
          sopMatched: 'SOP-CLN-012: Study Protocol Development Standards',
          skillUsed: 'Protocol Synopsis Builder (v1.0)',
          templateUsed: 'Clinical Trials Protocol Outline',
          workflowRouted: 'Institutional Review Board (IRB) Review Workflow',
          citations: [
            { code: 'REG-ICH-E6', title: 'ICH E6(R2) Guideline for Good Clinical Practice.', publisher: 'ICH Assembly', author: 'ICH Quality Board' }
          ],
          leafHash: '52efc6db24e12c129aebe4c899f8d92827ae41e4649f935da495992b7852a420'
        };
      case 'meta_analysis':
        return {
          title: `Meta-analysis Protocol: ${inputs.topic || `${molecule} evidence synthesis`}`,
          documentText: `### Meta-analysis Protocol
This draft defines a source-controlled evidence synthesis plan for **${molecule}** in **${therapeutic}**. It does not invent pooled estimates; it specifies how the analysis should be performed once eligible study data are supplied.

### PICO Framework
| Element | Planned Definition |
| :--- | :--- |
| Population | ${inputs.population || 'Target population to be confirmed'} |
| Intervention | ${inputs.molecule || molecule} |
| Comparator | ${inputs.comparator || 'Comparator/control to be confirmed'} |
| Outcomes | ${inputs.outcomes || 'Primary and secondary outcomes to be defined'} |

### Statistical Analysis Plan
| Domain | Planned Method |
| :--- | :--- |
| Effect measure | ${inputs.effectMeasure || 'RR/OR for binary outcomes; MD/SMD for continuous outcomes; HR for time-to-event outcomes'} |
| Pooling model | ${inputs.model || 'Random-effects model unless homogeneity supports fixed-effect'} |
| Heterogeneity | I2, tau2, Cochran Q, and clinical heterogeneity review |
| Sensitivity analysis | Exclude high-risk-of-bias studies; leave-one-out; fixed vs random-effects comparison |
| Certainty | GRADE evidence profile |

### Extraction Requirements
Study identity, population, treatment arms, endpoint definitions, event counts or means/SDs, confidence intervals, follow-up timepoint, analysis population, and risk-of-bias domains.

### Deliverables
1. PRISMA flow.
2. Study characteristics table.
3. Forest plot plan.
4. Heterogeneity and sensitivity plan.
5. Risk-of-bias and GRADE summary.
6. Plain-language clinical interpretation.

### Inputs Still Needed
Eligible studies, extracted endpoint data, primary endpoint, timepoint, and decision on pairwise versus network meta-analysis.`,
          sopMatched: 'SOP-BIO-021: Meta-analysis and Evidence Synthesis Control',
          skillUsed: 'Biostatistical Meta-analysis Methodologist',
          templateUsed: 'PICO Meta-analysis Statistical Plan',
          workflowRouted: 'Biostatistics and Clinical Evidence Review',
          citations: [
            { code: 'PRISMA-2020', title: 'PRISMA 2020 reporting framework.', publisher: 'PRISMA', author: 'Evidence synthesis standards' },
            { code: 'GRADE', title: 'GRADE certainty of evidence approach.', publisher: 'GRADE Working Group', author: 'Evidence appraisal standards' }
          ],
          leafHash: '9b22c4d31b6e809125a6c99b8c5f55a9120ad4f14f7a8ff5348df82d6a47e531'
        };
      case 'guideline_tracking':
        return {
          title: `Regulatory Intelligence Report: ${inputs.agencies || 'FDA/EMA Guidance'}`,
          documentText: `### 1. Active Regulatory Guideline Updates
          * **Target Agencies:** ${inputs.agencies || 'FDA, EMA'}
          * **Product Category:** ${inputs.category || 'Small Molecules'}
          * **Therapeutic Scope:** ${inputs.therapeutic || 'Oncology'}
          
          ### 2. Landscape Analysis & Tracking Index
          
          | Agency | Guidance Code & Document Title | Release Date | Target Compliance Action |
          | :--- | :--- | :--- | :--- |
          | **US FDA** | FDA-2025-D-01: Biosimilar Labeling Standards | Jan 2026 | Adjust draft SOP label validation processes. |
          | **EMA** | EMA/CHMP/3201: Clinical Investigation Rules | Nov 2025 | Update Phase III study design templates. |
          
          ### 3. Therapeutic Focus Impact Assessment
          Updates dictate that all comparative immunogenicity assays must run validated parallel check assays, requiring updates in quality control check rules.`,
          sopMatched: 'SOP-REG-102: Regulatory Guidelines Identification',
          skillUsed: 'Regulatory Impact Analyzer (v1.4)',
          templateUsed: 'Agency Notifications Digest',
          workflowRouted: 'Regulatory Affairs Board Review Workflow',
          citations: [
            { code: 'REG-FDA-2025', title: 'Labeling for Biosimilar and Interchangeable Biosimilar Products Guidance.', publisher: 'FDA Center for Biologics Evaluation', author: 'US FDA Guidance Lead' }
          ],
          leafHash: 'a5c0b1129afbf4c8996fb92427ae41e46495991b7852b855e3b0c44298fc1c14'
        };
      default:
        return {
          title: `Task Artifact: ${activeTask.name}`,
          documentText: `### 1. Document Overview
          This compliant clinical draft was compiled for ${molecule} in target area ${therapeutic}.
          
          ### 2. Regulatory Compliance Summary
          * **Standard Mapped:** GxP Life Sciences controls.
          * **Audit Hash Vault:** Immutable ledger verification active.
          
          ### 3. Mapped Parameters
          
          | Parameter | Mapped Value | Compliance Check |
          | :--- | :--- | :--- |
          | **Molecule** | ${molecule} | Mapped |
          | **Scope** | ${therapeutic} | Mapped |
          
          ### 4. Project Blueprint Draft
          Draft text has been compiled under security isolation constraints. User verification signatures are required to seal the document version.`,
          sopMatched: 'SOP-REG-102: Regulatory Compliance Guidelines',
          skillUsed: 'Generic Draft Builder (v1.0)',
          templateUsed: 'Life Sciences Core Template',
          workflowRouted: 'Standard Team Peer Review (SLA: 24h)',
          citations: [
            { code: 'REG-COMP', title: 'Global Life Sciences Document Compliance Standards.', publisher: 'Regulatory Review Board', author: 'Audit Lead' }
          ],
          leafHash: 'f4e2b02427ae41e4649f935da495992b7852a42052efc6db24e12c129aebe4c8'
        };
    }
  };

  // E-Sign Submission handler
  const handleConfirmESign = (e) => {
    e.preventDefault();
    if (!password) return;
    
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setESignSuccess(true);
      setESignOpen(false);
      // Append signature directly to the document Text
      setFinalOutput(prev => ({
        ...prev,
        documentText: `${prev?.documentText || ''}\n\n---\n\n### 5. Verified GxP Electronic Signatures\n* **Signed By:** ${user?.username || 'admin'} (Role: ${user?.role || 'Head of Department'})\n* **Signed Date:** ${new Date().toLocaleString()}\n* **Purpose:** ${reason}\n* **Compliance:** 21 CFR Part 11 Authenticated\n* **SHA-256 Seal Integrity Hash:** ${getDisplayHash(prev)}`
      }));
    }, 1000);
  };

  return (
    <div className="h-full flex overflow-hidden -m-6">
      {/* Dynamic Submenu Workspace Sidebar */}
      <aside className="w-[280px] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="font-display font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${domain === 'marketing' ? 'bg-brand-teal' : domain === 'clinical' ? 'bg-brand-blue' : 'bg-brand-green'}`}></span>
            <span>{config.title}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">{config.description}</p>
        </div>

        {/* Expandable Accordion Sections */}
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {config.sections.map((sect, i) => {
            const isCollapsed = collapsedSections[sect.title];
            return (
              <div key={i} className="space-y-1">
                <button
                  onClick={() => toggleSection(sect.title)}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <span>{sect.title}</span>
                  {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                </button>
                
                {!isCollapsed && (
                  <div className="pl-2 space-y-0.5">
                    {sect.items.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelectItem(item)}
                        className={`w-full text-left px-3 py-2 text-sm rounded-button transition-colors flex items-center gap-2 ${
                          activeTask?.name === item.name
                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-slate-200'
                        }`}
                      >
                        <PenTool className="h-3 w-3 opacity-60" />
                        <span className="truncate">{item.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </aside>

      {/* Main Workspace Pane */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-slate-950 overflow-hidden">
        {activeTask ? (
          /* Universal Intelligent Intake Wizard & Output Workspace */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
              <div>
                <h3 className="font-display font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2 text-sm">
                  <Sparkles className="h-4 w-4 text-brand-teal" />
                  <span>AI Intake: {activeTask.name}</span>
                </h3>
              </div>
              <button
                onClick={() => setActiveTask(null)}
                className="text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                Exit Workspace
              </button>
            </div>

            {/* Wizard Steps Navigation Bar (Visual only) */}
            <div className="bg-slate-100 dark:bg-slate-900 px-6 py-2.5 border-b border-slate-200 dark:border-slate-800 flex justify-between text-xs text-slate-500 font-medium">
              {[
                { step: 1, label: 'Welcome Screen' },
                { step: 2, label: 'Requirement Form' },
                { step: 3, label: 'AI Clarification' },
                { step: 4, label: 'System Recommendations' },
                { step: 5, label: 'Compliant Output' }
              ].map((s, idx) => (
                <div key={idx} className={`flex items-center gap-2 ${intakeStep === s.step ? 'text-brand-teal-dark font-bold' : intakeStep > s.step ? 'text-slate-800 dark:text-slate-200' : ''}`}>
                  <span className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] ${intakeStep === s.step ? 'bg-brand-teal/20 text-brand-teal-dark border border-brand-teal' : intakeStep > s.step ? 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300' : 'bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800'}`}>
                    {s.step}
                  </span>
                  <span className="hidden sm:inline">{s.label}</span>
                  {idx < 4 && <ChevronRight className="h-3 w-3 text-slate-400" />}
                </div>
              ))}
            </div>

            {/* Wizard Body content area */}
            <div className="flex-1 overflow-y-auto p-6 flex justify-center">
              <div className="w-full max-w-4xl space-y-6">
                
                {/* STEP 1: Welcome Screen */}
                {intakeStep === 1 && (
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card shadow-sm p-8 text-center max-w-2xl mx-auto mt-8 space-y-6">
                    <div className="h-16 w-16 bg-brand-teal/10 rounded-full flex items-center justify-center mx-auto">
                      <Sparkles className="h-8 w-8 text-brand-teal" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-display font-bold text-slate-900 dark:text-slate-100">
                        Welcome to {activeTask.name} Builder
                      </h3>
                      <p className="text-sm text-slate-500 leading-relaxed">
                        This AI-guided intake engine will collect study parameters, map compliance guidelines, and recommend the optimal authoring workflow before compiling drafts.
                      </p>
                    </div>
                    <button
                      onClick={() => setIntakeStep(2)}
                      className="px-5 py-2.5 bg-brand-teal hover:bg-brand-teal-dark text-white rounded-button font-semibold text-sm transition-colors inline-flex items-center gap-2"
                    >
                      <span>Get Started</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {/* STEP 2: Requirement Collection Form */}
                {intakeStep === 2 && (
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card shadow-sm p-6 space-y-6">
                    <div>
                      <h4 className="font-display font-semibold text-slate-900 dark:text-slate-100 text-sm">Step 2: Collect Study & Output Requirements</h4>
                      <p className="text-xs text-slate-400 mt-1">Please provide the initial details below. We will use these to select target reference sets.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {getIntakeFields(activeTask.type).map((field) => (
                        <div key={field.key} className={field.isTextArea ? 'md:col-span-2 space-y-1.5' : 'space-y-1.5'}>
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{field.label}</label>
                          {field.isTextArea ? (
                            <textarea
                              value={formData[field.key] || ''}
                              onChange={(e) => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                              placeholder={field.placeholder}
                              rows={3}
                              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-button bg-white dark:bg-slate-950 text-sm text-slate-800 dark:text-slate-200"
                            />
                          ) : (
                            <input
                              type="text"
                              value={formData[field.key] || ''}
                              onChange={(e) => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                              placeholder={field.placeholder}
                              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-button bg-white dark:bg-slate-950 text-sm text-slate-800 dark:text-slate-200"
                            />
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                      <button
                        onClick={handleNextStep}
                        className="px-4 py-2 bg-brand-teal hover:bg-brand-teal-dark text-white rounded-button font-semibold text-sm transition-colors flex items-center gap-2"
                      >
                        <span>Analyze Requirements</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 3: AI Clarification Engine */}
                {intakeStep === 3 && (
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card shadow-sm p-6 space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-brand-teal/10 rounded-full flex items-center justify-center text-brand-teal-dark">
                        <Cpu className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="font-display font-semibold text-slate-900 dark:text-slate-100 text-sm">Step 3: AI Clarifications Mappings</h4>
                        <p className="text-xs text-slate-400 mt-0.5">The AI analyzed your context. Clarify these questions to improve accuracy.</p>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-card border border-slate-100 dark:border-slate-800/60 text-xs text-slate-600 dark:text-slate-300 space-y-1">
                      <span className="font-bold text-brand-teal-dark">AI Business Analyst:</span>
                      <p className="leading-relaxed">I have scanned the parameters. To map the target templates correctly and filter evidence references, please clarify the following:</p>
                    </div>

                    <div className="space-y-4">
                      {getAIClarifications(activeTask.type).map((q) => (
                        <div key={q.key} className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 leading-normal">{q.label}</label>
                          <input
                            type="text"
                            value={clarificationAnswers[q.key] || ''}
                            onChange={(e) => setClarificationAnswers(prev => ({ ...prev, [q.key]: e.target.value }))}
                            placeholder="e.g. Yes, prioritize Phase III publications."
                            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-button bg-white dark:bg-slate-950 text-sm text-slate-800 dark:text-slate-200"
                          />
                        </div>
                      ))}
                    </div>

                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between">
                      <button
                        onClick={() => setIntakeStep(2)}
                        className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-button text-sm font-semibold transition-colors"
                      >
                        Back
                      </button>
                      <button
                        onClick={handleNextStep}
                        className="px-4 py-2 bg-brand-teal hover:bg-brand-teal-dark text-white rounded-button font-semibold text-sm transition-colors flex items-center gap-2"
                      >
                        <span>Extract Recommendations</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 4: Recommendations Board */}
                {intakeStep === 4 && (
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card shadow-sm p-6 space-y-6">
                    <div>
                      <h4 className="font-display font-semibold text-slate-900 dark:text-slate-100 text-sm">Step 4: Mapped System Recommendations</h4>
                      <p className="text-xs text-slate-400 mt-1">Our intelligence layers mapped these validated SOP guidelines, skills templates, and approval pathways.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* SOP Card */}
                      <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-card bg-slate-50/50 dark:bg-slate-900/40 flex items-start gap-3">
                        <FileText className="h-5 w-5 text-brand-teal mt-0.5 shrink-0" />
                        <div>
                          <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">MAPPED SOP CONTROL</h5>
                          <span className="text-sm font-semibold text-slate-850 dark:text-slate-100 block mt-1">
                            {formData.sop || getActivityGovernanceProfile(activeTask.type).sop}
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">Status: Validated | 21 CFR Part 11 Compliant</span>
                        </div>
                      </div>

                      {/* Template Card */}
                      <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-card bg-slate-50/50 dark:bg-slate-900/40 flex items-start gap-3">
                        <Layers className="h-5 w-5 text-brand-blue mt-0.5 shrink-0" />
                        <div>
                          <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">RECOMMENDED TEMPLATE</h5>
                          <span className="text-sm font-semibold text-slate-850 dark:text-slate-100 block mt-1">
                            {getActivityGovernanceProfile(activeTask.type).template}
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">Version: v2.4 (Approved)</span>
                        </div>
                      </div>

                      {/* Skill Card */}
                      <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-card bg-slate-50/50 dark:bg-slate-900/40 flex items-start gap-3">
                        <Cpu className="h-5 w-5 text-brand-teal mt-0.5 shrink-0" />
                        <div>
                          <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">AI SKILL PROMPT</h5>
                          <span className="text-sm font-semibold text-slate-850 dark:text-slate-100 block mt-1">
                            {formData.skill || getActivityGovernanceProfile(activeTask.type).skill}
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">Engine: ClinCommand AI activity orchestrator</span>
                        </div>
                      </div>

                      {/* Workflow Card */}
                      <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-card bg-slate-50/50 dark:bg-slate-900/40 flex items-start gap-3">
                        <ClipboardCheck className="h-5 w-5 text-brand-green mt-0.5 shrink-0" />
                        <div>
                          <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">APPROVAL WORKFLOW</h5>
                          <span className="text-sm font-semibold text-slate-850 dark:text-slate-100 block mt-1">
                            {getActivityGovernanceProfile(activeTask.type).workflow}
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">SLA: 48 Hours | Roles: Author, Reviewer, Signer</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between">
                      <button
                        onClick={() => setIntakeStep(3)}
                        className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-button text-sm font-semibold transition-colors"
                      >
                        Back
                      </button>
                      <button
                        onClick={handleLaunchExecution}
                        className="px-5 py-2.5 bg-brand-teal hover:bg-brand-teal-dark text-white rounded-button font-semibold text-sm transition-colors flex items-center gap-2"
                      >
                        <span>Confirm & Generate Draft</span>
                        <Sparkles className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 5: Execution Hashing & Output Document */}
                {intakeStep === 5 && (
                  <div className="space-y-6">
                    {generating ? (
                      /* Compliance Compilations Logging Screen */
                      <div className="bg-slate-950 text-brand-teal-light p-6 rounded-card border border-brand-teal/20 font-mono text-xs space-y-2 min-h-[220px]">
                        <div className="flex justify-between border-b border-brand-teal/20 pb-2 mb-3 text-[10px] uppercase font-bold tracking-wider text-slate-400">
                          <span>GxP Engine Compilation Terminal</span>
                          <span className="animate-pulse">Active Sync</span>
                        </div>
                        {generationLogs.map((log, i) => (
                          <div key={i} className="leading-relaxed">{log}</div>
                        ))}
                        <div className="flex items-center gap-2 mt-4 text-white">
                          <span className="animate-spin h-3.5 w-3.5 border-2 border-brand-teal border-t-transparent rounded-full shrink-0"></span>
                          <span>Compiling clinical draft text tokens...</span>
                        </div>
                      </div>
                    ) : finalOutput ? (
                      /* Success Output Screen */
                      <div className="space-y-5">
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card shadow-sm p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-brand-green/10 text-brand-green border border-brand-green-light rounded-full flex items-center justify-center">
                              <CheckCircle2 className="h-5 w-5" />
                            </div>
                            <div>
                              <h4 className="font-display font-semibold text-slate-900 dark:text-slate-100 text-sm">{finalOutput.title}</h4>
                              <p className="text-[10px] text-slate-400 mt-0.5">Status: Generated & Registered | Leaf SHA-256: {getDisplayHash(finalOutput).substring(0, 16)}...</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => window.print()}
                              className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 text-xs font-semibold rounded-button text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors inline-flex items-center gap-1.5"
                            >
                              <FileDown className="h-3.5 w-3.5" />
                              <span>Export PDF</span>
                            </button>
                            <button
                              onClick={() => setESignOpen(true)}
                              className="px-3 py-1.5 bg-brand-teal text-white text-xs font-semibold rounded-button hover:bg-brand-teal-dark transition-colors inline-flex items-center gap-1.5"
                            >
                              <ShieldCheck className="h-3.5 w-3.5" />
                              <span>21 CFR E-Sign</span>
                            </button>
                          </div>
                        </div>

                        {/* Tabs Layout */}
                        <div className="border-b border-slate-200 dark:border-slate-800 flex text-sm">
                          {[
                            { key: 'document', label: 'Draft Document text' },
                            { key: 'compliance', label: 'SOP & Compliance check' },
                            { key: 'evidence', label: 'RAG Citations' },
                            { key: 'audit', label: 'AI Engine Analytics' }
                          ].map(t => (
                            <button
                              key={t.key}
                              onClick={() => setActiveOutputTab(t.key)}
                              className={`px-4 py-2 font-medium border-b-2 transition-colors ${activeOutputTab === t.key ? 'border-brand-teal text-brand-teal-dark font-semibold' : 'border-transparent text-slate-550 dark:text-slate-400 hover:text-slate-800'}`}
                            >
                              {t.label}
                            </button>
                          ))}
                        </div>

                        {/* TAB 1: Document Text View */}
                        {activeOutputTab === 'document' && (
                          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-card shadow-sm max-w-none text-slate-850 dark:text-slate-200 whitespace-pre-line leading-relaxed text-sm">
                            {finalOutput.documentText}
                          </div>
                        )}

                        {/* TAB 2: Compliance Mapped Checks */}
                        {activeOutputTab === 'compliance' && (
                          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-card shadow-sm space-y-4">
                            <h4 className="font-display font-semibold text-slate-900 dark:text-slate-100 text-sm">SOP Compliance Signoff Matrix</h4>
                            
                            <div className="space-y-3">
                              <div className="flex items-center justify-between p-3 border border-slate-100 dark:border-slate-800 rounded-card bg-slate-50/50 dark:bg-slate-900/40">
                                <div className="text-xs">
                                  <div className="font-bold text-slate-700 dark:text-slate-300">SOP Mapped Reference</div>
                                  <div className="text-slate-400 mt-0.5">{finalOutput.sopMatched}</div>
                                </div>
                                <span className="px-2 py-0.5 bg-green-50 text-green-700 border border-green-200 text-[10px] font-bold rounded-full">Pass</span>
                              </div>

                              <div className="flex items-center justify-between p-3 border border-slate-100 dark:border-slate-800 rounded-card bg-slate-50/50 dark:bg-slate-900/40">
                                <div className="text-xs">
                                  <div className="font-bold text-slate-700 dark:text-slate-300">FDA 21 CFR Part 11 Rule set Check</div>
                                  <div className="text-slate-400 mt-0.5">Author audits and signature authentication records required.</div>
                                </div>
                                <span className="px-2 py-0.5 bg-green-50 text-green-700 border border-green-200 text-[10px] font-bold rounded-full">Pass</span>
                              </div>

                              <div className="flex items-center justify-between p-3 border border-slate-100 dark:border-slate-800 rounded-card bg-slate-50/50 dark:bg-slate-900/40">
                                <div className="text-xs">
                                  <div className="font-bold text-slate-700 dark:text-slate-300">Workflow Signoff Routing Mapped</div>
                                  <div className="text-slate-400 mt-0.5">Primary Target: {finalOutput.workflowRouted}</div>
                                </div>
                                <span className="px-2 py-0.5 bg-green-50 text-green-700 border border-green-200 text-[10px] font-bold rounded-full">Active</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* TAB 3: Evidence references */}
                        {activeOutputTab === 'evidence' && (
                          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-card shadow-sm space-y-4">
                            <h4 className="font-display font-semibold text-slate-900 dark:text-slate-100 text-sm">Indexed Scientific Citations & Sources</h4>
                            
                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                              {finalOutput.citations.length === 0 ? (
                                <div className="py-3 text-xs text-slate-400">
                                  No source citations were attached to this execution. Clinical claims remain blocked until approved evidence is supplied.
                                </div>
                              ) : finalOutput.citations.map((cit, idx) => (
                                <div key={idx} className="py-3 flex gap-3 items-start">
                                  <div className="h-6 w-12 bg-slate-100 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 text-[10px] font-bold text-brand-teal-dark flex items-center justify-center rounded shrink-0">
                                    {cit.code}
                                  </div>
                                  <div>
                                    <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">{cit.title}</div>
                                    <div className="text-xs text-slate-400 mt-0.5">Author: {cit.author} | {cit.journal || cit.publisher}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* TAB 4: Engine details */}
                        {activeOutputTab === 'audit' && (
                          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-card shadow-sm space-y-4">
                            <h4 className="font-display font-semibold text-slate-900 dark:text-slate-100 text-sm">AI Router telemetry & Cryptographic Vault Details</h4>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                              <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-card space-y-1">
                                <span className="text-slate-400 block font-bold uppercase text-[9px] tracking-wider">Target LLM Model</span>
                                <span className="font-semibold text-slate-800 dark:text-slate-200">{finalOutput.model || 'ClinCommand activity-orchestrator-v1'}</span>
                              </div>
                              <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-card space-y-1">
                                <span className="text-slate-400 block font-bold uppercase text-[9px] tracking-wider">Engine Latency</span>
                                <span className="font-semibold text-slate-800 dark:text-slate-200">1.45 Seconds</span>
                              </div>
                              <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-card space-y-1">
                                <span className="text-slate-400 block font-bold uppercase text-[9px] tracking-wider">Dynamic Prompt Skill Mapped</span>
                                <span className="font-semibold text-slate-800 dark:text-slate-200">{finalOutput.skillUsed}</span>
                              </div>
                              <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-card space-y-1">
                                <span className="text-slate-400 block font-bold uppercase text-[9px] tracking-wider">Immutable Merkle Leaf Hash</span>
                                <span className="font-mono font-semibold text-brand-teal-dark truncate block">{getDisplayHash(finalOutput)}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Welcome/Dashboard View if no task is selected */
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Upper Workspace vision card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card shadow-sm p-6 flex flex-col md:flex-row items-center justify-between gap-5 relative overflow-hidden">
              <div className="space-y-2 relative z-10">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-teal/10 text-brand-teal-dark`}>
                  Active Workspace Directory
                </span>
                <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-slate-100">{config.title} Workspace</h2>
                <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
                  {config.description} Click on any submenu task item in the sidebar accordion to launch the dynamic Intelligent Intake wizard engine.
                </p>
              </div>
              <div className="h-16 w-16 bg-brand-teal/10 rounded-full flex items-center justify-center shrink-0">
                <Layers className="h-8 w-8 text-brand-teal" />
              </div>
            </div>

            {/* Subsystem Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              
              {/* Central pane: Tasks & Activities */}
              <div className="lg:col-span-2 space-y-5">
                {/* Recent drafts list */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card shadow-sm p-6 space-y-4">
                  <h3 className="font-display font-semibold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                    <FileText className="h-4 w-4 text-brand-teal" />
                    <span>Recent Active Drafts</span>
                  </h3>
                  
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                    <div className="py-2.5 flex items-center justify-between hover:bg-slate-50/40 dark:hover:bg-slate-800/20 px-2 rounded transition-colors">
                      <div className="font-semibold text-slate-850 dark:text-slate-200">Product Appraisal Outline: Obeticholic Acid</div>
                      <div className="text-slate-400">Created: 2 hours ago by med_advisor</div>
                    </div>
                    <div className="py-2.5 flex items-center justify-between hover:bg-slate-50/40 dark:hover:bg-slate-800/20 px-2 rounded transition-colors">
                      <div className="font-semibold text-slate-850 dark:text-slate-200">Systematic Literature Review Search Criteria: GLP-1</div>
                      <div className="text-slate-400">Created: Yesterday by clinical_research_lead</div>
                    </div>
                    <div className="py-2.5 flex items-center justify-between hover:bg-slate-50/40 dark:hover:bg-slate-800/20 px-2 rounded transition-colors">
                      <div className="font-semibold text-slate-850 dark:text-slate-200">Regulatory Response Plan: CDSCO FDA Response letter</div>
                      <div className="text-slate-400">Created: 3 days ago by regulatory_officer</div>
                    </div>
                  </div>
                </div>

                {/* Assigned tasks */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card shadow-sm p-6 space-y-4">
                  <h3 className="font-display font-semibold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                    <CheckSquare className="h-4 w-4 text-brand-blue" />
                    <span>My Actionable Tasks</span>
                  </h3>
                  
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                    <div className="py-2.5 flex items-center gap-3">
                      <span className="h-2 w-2 rounded-full bg-brand-teal shrink-0"></span>
                      <div className="flex-1">
                        <div className="font-semibold text-slate-850 dark:text-slate-200">Approve clinical synopsis draft draft for Byfavo Phase IV</div>
                        <div className="text-slate-400 mt-0.5">Workflow: Protocol Development | Due: In 2 days</div>
                      </div>
                    </div>
                    <div className="py-2.5 flex items-center gap-3">
                      <span className="h-2 w-2 rounded-full bg-brand-blue shrink-0"></span>
                      <div className="flex-1">
                        <div className="font-semibold text-slate-850 dark:text-slate-200">Audit response check validation log audit_vault tables</div>
                        <div className="text-slate-400 mt-0.5">Workflow: Submission Management | Due: In 4 days</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar recommendations panel */}
              <div className="space-y-5">
                {/* AI Copilot Panel */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card shadow-sm p-6 space-y-4">
                  <h3 className="font-display font-semibold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                    <Cpu className="h-4 w-4 text-brand-teal animate-pulse" />
                    <span>AI Copilot Suggestions</span>
                  </h3>
                  
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Based on your workspace context (<strong>{domain.toUpperCase()}</strong>), here are active recommendations to accelerate your workflows:
                  </p>

                  <div className="space-y-3 pt-2 text-xs">
                    <div className="p-3 border border-slate-100 dark:border-slate-800 rounded-card hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors">
                      <span className="font-semibold text-brand-teal-dark">SOP-MKT-042 (Product Appraisal Standards)</span>
                      <p className="text-slate-400 mt-0.5">Guidelines for compiling structured clinical and competitor SWOT analyses.</p>
                    </div>
                    <div className="p-3 border border-slate-100 dark:border-slate-800 rounded-card hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors">
                      <span className="font-semibold text-brand-blue">Clinical Trials Synopsis Template (ICH compliant)</span>
                      <p className="text-slate-400 mt-0.5">Standard outlines structure for Phase III trials synopsis summaries.</p>
                    </div>
                  </div>
                </div>

                {/* System Stats Widget */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card shadow-sm p-6 space-y-3 text-xs text-slate-500">
                  <div className="flex items-center justify-between">
                    <span>Active Sync Connection</span>
                    <span className="text-brand-green font-semibold">Online</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Compliance Vault Lock</span>
                    <span className="text-brand-teal-dark font-semibold">Merkle Block #412</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Tenant Boundary</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">Isolated</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* E-SIGNATURE MODAL (21 CFR PART 11 COMPLIANT) */}
      {eSignOpen && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-w-md w-full rounded-card shadow-2xl p-6 space-y-6">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-6 w-6 text-brand-teal" />
              <div>
                <h4 className="font-display font-semibold text-slate-900 dark:text-slate-100 text-base">FDA 21 CFR Part 11 Electronic Signature</h4>
                <p className="text-xs text-slate-400 mt-0.5">Authenticate your identity to seal this GxP record.</p>
              </div>
            </div>

            <form onSubmit={handleConfirmESign} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Signing Purpose</label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-button bg-slate-50 dark:bg-slate-850 text-xs text-slate-700 dark:text-slate-350"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Confirm Login Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter login credentials"
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-button bg-white dark:bg-slate-950 text-sm text-slate-800 dark:text-slate-200"
                  required
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setESignOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-button text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-teal text-white hover:bg-brand-teal-dark rounded-button text-xs font-semibold transition-colors"
                >
                  Sign Document Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
