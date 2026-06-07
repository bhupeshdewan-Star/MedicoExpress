import { query } from '../config/db.js';

/**
 * Gateway service for LLM Provider Abstraction.
 * Routes requests to OpenAI, Anthropic, Google Gemini, or Ollama,
 * and executes structured responses under test/mock configurations.
 */
export async function callLLM(provider, model, prompt, options = {}) {
  const maxContextTokens = options.max_context_tokens || 8000;
  const maxResponseTokens = options.max_response_tokens || 2000;

  const promptTokenEst = Math.ceil(prompt.length / 4);
  let processedPrompt = prompt;
  if (promptTokenEst > maxContextTokens) {
    console.warn(`[LLM Provider Manager] Truncating prompt from ${promptTokenEst} tokens to budget of ${maxContextTokens}`);
    processedPrompt = prompt.substring(0, maxContextTokens * 4);
  }

  const apiKey = process.env[`${provider.toUpperCase()}_API_KEY`] || null;

  if (!apiKey && provider.toLowerCase() !== 'ollama') {
    return generateMockResponse(provider, model, processedPrompt, maxResponseTokens);
  }

  try {
    if (provider.toLowerCase() === 'openai') {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: model || 'gpt-4o',
          messages: [{ role: 'user', content: processedPrompt }],
          max_tokens: maxResponseTokens
        })
      });
      if (!response.ok) throw new Error(`OpenAI API responded with status ${response.status}`);
      const data = await response.json();
      return {
        text: data.choices[0].message.content,
        model,
        provider: 'openai',
        tokensUsed: data.usage?.total_tokens || 0
      };
    }

    if (provider.toLowerCase() === 'anthropic') {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: model || 'claude-3-5-sonnet-20240620',
          messages: [{ role: 'user', content: processedPrompt }],
          max_tokens: maxResponseTokens
        })
      });
      if (!response.ok) throw new Error(`Anthropic API responded with status ${response.status}`);
      const data = await response.json();
      return {
        text: data.content[0].text,
        model,
        provider: 'anthropic',
        tokensUsed: data.usage?.input_tokens + data.usage?.output_tokens || 0
      };
    }

    if (provider.toLowerCase() === 'gemini') {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model || 'gemini-1.5-pro'}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: processedPrompt }] }],
          generationConfig: { maxOutputTokens: maxResponseTokens }
        })
      });
      if (!response.ok) throw new Error(`Gemini API responded with status ${response.status}`);
      const data = await response.json();
      return {
        text: data.candidates[0].content.parts[0].text,
        model,
        provider: 'gemini',
        tokensUsed: 0
      };
    }

    if (provider.toLowerCase() === 'ollama') {
      const urlSetting = await query(`SELECT setting_value FROM system_settings WHERE setting_key = 'ollama_url'`);
      const baseUrl = urlSetting.rows[0]?.setting_value || 'http://localhost:11434';

      const response = await fetch(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: model || 'llama3',
          messages: [{ role: 'user', content: processedPrompt }],
          stream: false,
          options: { num_predict: maxResponseTokens }
        })
      });
      if (!response.ok) throw new Error('Local Ollama call failed');
      const data = await response.json();
      return {
        text: data.message.content,
        model,
        provider: 'ollama',
        tokensUsed: 0
      };
    }
  } catch (err) {
    console.warn(`[LLM Provider Manager] Call to ${provider} (${model}) failed. Bypassing with validation mock: ${err.message}`);
  }

  return generateMockResponse(provider, model, processedPrompt, maxResponseTokens);
}

function generateMockResponse(provider, model, prompt, maxResponseTokens) {
  const promptLower = prompt.toLowerCase();
  let text = '';

  if (promptLower.includes('product appraisal') || promptLower.includes('swot') || promptLower.includes('competitor benchmark')) {
    const molecule = extractPromptValue(prompt, ['Molecule/Product', 'Molecule', 'Product']) || extractAfterKeyword(prompt, ['for', 'about', 'on']) || 'target molecule';
    const indication = extractPromptValue(prompt, ['Indication/Scope', 'Indication', 'Therapeutic area']) || 'target indication';
    const geography = extractPromptValue(prompt, ['Geography', 'Geographic Market']) || 'target market';
    const competitors = extractPromptValue(prompt, ['Competitors/Comparators', 'Competitors']) || 'named class competitors';
    const profile = getKnownMoleculeProfile(molecule);

    text = `### Executive Summary
This Product Appraisal evaluates **${molecule}** for **${indication}** in **${geography}**. ${profile.summary}

### Molecule-Specific Clinical Context
| Dimension | Appraisal View |
| :--- | :--- |
| Product / Molecule | ${molecule} |
| Pharmacologic class | ${profile.className} |
| Mechanism / rationale | ${profile.mechanism} |
| Clinical use context | ${profile.useContext || indication} |
| Comparator frame | ${competitors} |

### Differentiation Hypothesis
${profile.differentiation}

### Evidence and Claim Architecture
| Claim Area | What the draft may discuss now | What must be sourced before approval |
| :--- | :--- | :--- |
| Efficacy | Mechanistic and class-based rationale for ${indication} | Approved label, pivotal trials, guidelines, or supplied publications |
| Safety | Known class safety topics and fair-balance areas | Local label warnings, contraindications, interactions, and PV summaries |
| Comparator | Structured comparison versus ${competitors} | Direct studies, labels, guidelines, or defensible indirect comparison |
| Positioning | Medical strategy hypothesis | MLR-approved claim-source matrix |

### SWOT Matrix
| Category | Molecule-Specific Assessment |
| :--- | :--- |
| Strengths | ${profile.strengths} |
| Weaknesses | ${profile.weaknesses} |
| Opportunities | Build evidence-backed education and differentiation in ${geography}; tailor messages by specialty and use setting. |
| Threats | Established alternatives, generic substitution or access pressure, class safety warnings, and unsupported superiority claims. |

### Strategic Recommendations
1. Confirm local label, indication, dose, contraindications, and warnings for ${geography}.
2. Build a competitor grid for ${competitors}.
3. Convert each proposed claim into a claim-source row before external use.
4. Generate a slide deck only after evidence, fair balance, and audience are confirmed.

### Inputs Still Needed
Approved label, target audience, source publications, competitor list, and intended use setting.

* **GxP Status**: AI-generated governed draft requiring medical/legal/regulatory review.
* **Attribution**: (c) Dr. Bhupesh Dewan, Mumbai, India - All Rights Reserved`;
  } else if (promptLower.includes('slide deck') || promptLower.includes('presentation')) {
    const molecule = extractPromptValue(prompt, ['Molecule/Product', 'Molecule', 'Product']) || extractAfterKeyword(prompt, ['for', 'about', 'on']) || 'target molecule';
    text = `### Scientific Slide Deck Blueprint: ${molecule}
| Slide | Title | Purpose | Visual Direction |
| :--- | :--- | :--- | :--- |
| 1 | ${molecule}: Scientific Context | Define audience, use setting, and claim boundary | Clean title slide |
| 2 | Disease Landscape | Explain unmet need and treatment flow | Patient journey or landscape map |
| 3 | Molecule Profile | Summarize mechanism and class | Mechanism schematic |
| 4 | Evidence Snapshot | Present approved/source-backed evidence | Evidence table |
| 5 | Safety and Fair Balance | Show warnings and monitoring needs | Safety matrix |
| 6 | Comparator Landscape | Compare only sourced dimensions | Competitor grid |
| 7 | Differentiation Hypothesis | Translate evidence into medical positioning | 2x2 positioning map |
| 8 | Objection Handling | Prepare expert Q&A | Q&A cards |
| 9 | Strategic Implications | Define medical actions | Roadmap |
| 10 | Evidence Gaps and Approval Path | List required sources and MLR steps | Checklist |

* **GxP Status**: Storyboard draft. Source verification and MLR approval required.
* **Attribution**: (c) Dr. Bhupesh Dewan, Mumbai, India - All Rights Reserved`;
  } else if (promptLower.includes('medical') || promptLower.includes('scientific') || promptLower.includes('response')) {
    text = `### Scientific Response Report
* **Target Audience**: Key Opinion Leaders, investigators, or medical reviewers.
* **Evidence Position**: Summarize only source-backed data and separate hypothesis from approved claims.
* **Safety Profile**: Include fair balance, warnings, and source gaps.
* **Regulatory Context**: Confirm local label and intended-use boundary before release.
* **Attribution**: (c) Dr. Bhupesh Dewan, Mumbai, India - All Rights Reserved`;
  } else if (promptLower.includes('regulatory') || promptLower.includes('ectd')) {
    text = `### Regulatory Response Brief
* **Issue Definition**: Restate the agency question or guideline change.
* **Evidence Package**: Map every response statement to submission modules, labels, studies, or source documents.
* **Gap Closure**: Identify missing analyses, owners, and due dates.
* **Recommendation**: Route through regulatory accountable-person approval.
* **Attribution**: (c) Dr. Bhupesh Dewan, Mumbai, India - All Rights Reserved`;
  } else if (promptLower.includes('biostatistics') || promptLower.includes('kaplan')) {
    text = `### Biostatistics Review Summary
* **Method**: Define the statistical method and analysis population before interpretation.
* **Assumptions**: Confirm censoring, missing data, multiplicity, and endpoint hierarchy.
* **Output Needed**: Tables, figures, confidence intervals, and reproducibility checks.
* **Attribution**: (c) Dr. Bhupesh Dewan, Mumbai, India - All Rights Reserved`;
  } else {
    text = `### ClinCommand OS AI Draft
* **Provider**: Resolved via ${provider || 'Simulator'} (${model || 'Default'}).
* **Status**: Governed draft generated under GxP validation boundaries.
* **Next Step**: Provide molecule, indication, audience, geography, SOP, skill set, and source evidence for a full activity-specific output.
* **Attribution**: (c) Dr. Bhupesh Dewan, Mumbai, India - All Rights Reserved`;
  }

  return {
    text,
    model: model || 'sim-model-1.0',
    provider: provider || 'simulator',
    tokensUsed: Math.ceil(text.length / 4)
  };
}

function extractPromptValue(prompt, labels) {
  for (const label of labels) {
    const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const match = prompt.match(new RegExp(`${escaped}:\\s*([^\\n]+)`, 'i'));
    if (match?.[1]) {
      const value = match[1].trim();
      if (value && !/not provided/i.test(value)) return value;
    }
  }
  return '';
}

function extractAfterKeyword(prompt, keywords) {
  for (const keyword of keywords) {
    const match = prompt.match(new RegExp(`\\b${keyword}\\s+([A-Za-z][A-Za-z0-9-]{2,})`, 'i'));
    if (match?.[1]) return match[1];
  }
  return '';
}

function getKnownMoleculeProfile(molecule) {
  const key = String(molecule || '').toLowerCase();
  if (key.includes('rabeprazole')) {
    return {
      className: 'proton pump inhibitor (PPI)',
      mechanism: 'irreversible inhibition of gastric H+/K+ ATPase in gastric parietal cells, reducing acid secretion',
      useContext: 'GERD, erosive esophagitis, peptic ulcer disease, and H. pylori eradication regimens where locally approved',
      summary: 'Rabeprazole is a PPI used in acid-peptic disorders; the appraisal should focus on gastroenterology positioning, PPI class differentiation, label-safe claims, and local prescribing context.',
      differentiation: 'A defensible Rabeprazole strategy can explore rapid acid suppression, once-daily convenience, CYP2C19 considerations versus selected PPIs, tolerability, and practical use in GERD. Exact wording must be checked against the local label and source pack.',
      strengths: 'Established PPI class role, broad acid-suppression utility, practical oral therapy, and potential differentiation versus omeprazole, pantoprazole, and esomeprazole depending on local evidence.',
      weaknesses: 'PPI class safety warnings, generic competition, payer/price pressure, and limited room for superiority claims without direct evidence.'
    };
  }

  if (key.includes('remimazolam')) {
    return {
      className: 'ultra-short-acting benzodiazepine sedative',
      mechanism: 'GABA-A receptor positive allosteric modulation with rapid ester metabolism',
      useContext: 'procedural sedation and anesthesia-related settings where locally approved',
      summary: 'Remimazolam requires sedation-specific appraisal across onset/offset, reversibility, cardiorespiratory safety, monitoring requirements, and comparator positioning.',
      differentiation: 'The medical strategy can explore rapid recovery, flumazenil reversibility, and operational fit versus midazolam, propofol, and dexmedetomidine, with claims restricted to approved evidence.',
      strengths: 'Short-acting profile, reversibility, and procedural workflow relevance.',
      weaknesses: 'Requires trained sedation environment, airway readiness, and careful differentiation from entrenched sedatives.'
    };
  }

  return {
    className: 'source-confirmed pharmacologic class required',
    mechanism: 'mechanism must be confirmed from approved label, monograph, or source pack',
    useContext: '',
    summary: 'The appraisal should be molecule-specific, but the pharmacology and indication must be confirmed from the supplied evidence pack before final claims are approved.',
    differentiation: 'Differentiation should be built from mechanism, label, efficacy, safety, dosing, access, and comparator evidence once supplied.',
    strengths: 'Potential clinical value must be mapped from approved indication, mechanism, and source evidence.',
    weaknesses: 'Evidence gaps, label limitations, safety warnings, access constraints, and unsupported comparative claims remain key risks.'
  };
}
