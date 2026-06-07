const path = require("path");
const Module = require("module");
const NODE_ROOT = "C:\\Users\\bhupe\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\node\\node_modules";
const PNPM_ROOT = "C:\\Users\\bhupe\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\node\\node_modules\\.pnpm\\node_modules";
process.env.NODE_PATH = [NODE_ROOT, PNPM_ROOT].join(path.delimiter);
Module._initPaths();
const pptxgen = require("pptxgenjs");

const OUT = path.join(__dirname, "..", "artifacts", "hcp_scientific_slide_deck_demo", "Aceclofenac_HCP_Scientific_Deck_Demo.pptx");
require("fs").mkdirSync(path.dirname(OUT), { recursive: true });

const C = {
  navy: "16324F",
  teal: "117A7B",
  sky: "EAF4F7",
  pale: "F4F8FA",
  gold: "D9C27A",
  green: "E6F4EA",
  amber: "FFF2CC",
  red: "FCE4D6",
  dark: "24313A",
  muted: "5F6B75",
  white: "FFFFFF",
  line: "D9E2E8",
};

const deck = new pptxgen();
deck.layout = "LAYOUT_WIDE";
deck.author = "ClinCommand OS";
deck.company = "Dr. Bhupesh Dewan";
deck.subject = "HCP Scientific Slide Deck Demo";
deck.title = "Aceclofenac HCP Scientific Deck";
deck.lang = "en-US";
deck.theme = {
  headFontFace: "Aptos Display",
  bodyFontFace: "Aptos",
  lang: "en-US",
};
deck.defineLayout({ name: "WIDE", width: 13.333, height: 7.5 });

function addBase(slide, title, subtitle, refLine) {
  slide.background = { color: C.white };
  slide.addShape(deck.ShapeType.rect, { x: 0, y: 0, w: 13.333, h: 0.28, line: { color: C.navy, transparency: 100 }, fill: { color: C.navy } });
  slide.addText(title, {
    x: 0.55, y: 0.38, w: 9.6, h: 0.42,
    fontFace: "Aptos Display", fontSize: 22, bold: true, color: C.navy,
    margin: 0
  });
  if (subtitle) {
    slide.addText(subtitle, {
      x: 0.55, y: 0.84, w: 9.7, h: 0.28,
      fontFace: "Aptos", fontSize: 10.5, color: C.muted,
      margin: 0
    });
  }
  slide.addShape(deck.ShapeType.line, {
    x: 0.55, y: 1.12, w: 12.2, h: 0,
    line: { color: C.line, pt: 1.2 }
  });
  if (refLine) {
    slide.addText(refLine, {
      x: 0.55, y: 7.02, w: 12.2, h: 0.22,
      fontFace: "Aptos", fontSize: 7.6, color: C.muted,
      margin: 0
    });
  }
  slide.addText("ClinCommand OS | demonstration deck | verify local approved label before use", {
    x: 8.0, y: 7.12, w: 4.8, h: 0.18,
    align: "right", fontFace: "Aptos", fontSize: 7.1, color: C.muted,
    margin: 0
  });
}

function addFooter(slide, text) {
  slide.addText(text, {
    x: 0.55, y: 6.7, w: 12.1, h: 0.35,
    fontFace: "Aptos", fontSize: 7.3, color: C.muted,
    margin: 0
  });
}

function addBullets(slide, items, x, y, w, h, fontSize = 16, color = C.dark, bulletColor = C.teal) {
  const runs = [];
  items.forEach((item, idx) => {
    runs.push({ text: item, options: { bullet: { indent: fontSize > 13 ? 18 : 14 }, breakLine: idx < items.length - 1 } });
  });
  slide.addText(runs, {
    x, y, w, h,
    fontFace: "Aptos",
    fontSize,
    color,
    margin: 0,
    paraSpaceAfterPt: fontSize > 13 ? 6 : 4,
    bullet: { indent: fontSize > 13 ? 18 : 14 },
    hanging: 2,
  });
}

function addCard(slide, x, y, w, h, fill, title, body, options = {}) {
  slide.addShape(deck.ShapeType.roundRect, {
    x, y, w, h,
    rectRadius: 0.08,
    line: { color: options.line || C.line, pt: 1 },
    fill: { color: fill },
    shadow: { type: "outer", color: "B7C2CC", blur: 1, angle: 45, distance: 1, opacity: 0.12 },
  });
  slide.addText(title, {
    x: x + 0.14, y: y + 0.12, w: w - 0.28, h: 0.28,
    fontFace: "Aptos Display", fontSize: options.titleSize || 13.5, bold: true, color: options.titleColor || C.navy, margin: 0
  });
  slide.addText(body, {
    x: x + 0.14, y: y + 0.43, w: w - 0.28, h: h - 0.52,
    fontFace: "Aptos", fontSize: options.bodySize || 10.5, color: options.bodyColor || C.dark, margin: 0,
    valign: "mid"
  });
}

function addTable(slide, rows, x, y, w, h, opts = {}) {
  slide.addTable(rows, {
    x, y, w, h,
    border: { color: C.line, pt: 1 },
    fill: "FFFFFF",
    fontFace: "Aptos",
    fontSize: opts.fontSize || 10,
    color: C.dark,
    margin: 0.04,
    rowH: opts.rowH || 0.32,
    autoFit: true,
    colW: opts.colW,
    bold: true,
    headColor: C.white,
    headFill: C.navy,
    valign: "mid",
  });
}

function addNotes(slide, notes) {
  slide.addNotes(notes);
}

// Slide 1
{
  const slide = deck.addSlide();
  slide.background = { color: C.navy };
  slide.addShape(deck.ShapeType.rect, { x: 0, y: 0, w: 13.333, h: 7.5, line: { color: C.navy, transparency: 100 }, fill: { color: C.navy } });
  slide.addShape(deck.ShapeType.rect, { x: 0, y: 0, w: 13.333, h: 1.1, line: { color: C.navy, transparency: 100 }, fill: { color: "0E2538" } });
  slide.addText("Aceclofenac", {
    x: 0.8, y: 1.35, w: 5.8, h: 0.55,
    fontFace: "Aptos Display", fontSize: 30, bold: true, color: C.white, margin: 0
  });
  slide.addText("HCP scientific slide deck demo", {
    x: 0.82, y: 2.0, w: 5.8, h: 0.32,
    fontFace: "Aptos", fontSize: 15, color: "DCE8EE", margin: 0
  });
  slide.addText("For demonstration purposes only | ClinCommand OS", {
    x: 0.82, y: 2.38, w: 5.8, h: 0.24,
    fontFace: "Aptos", fontSize: 10.5, color: "C8D4DC", margin: 0
  });
  addCard(slide, 7.7, 1.15, 4.95, 2.0, "173D56", "Why this deck", "A balanced HCP presentation can explain aceclofenac’s scientific role, practical use, and safety boundaries without drifting into promotional language.", { line: "2B5A76", titleColor: C.white, bodyColor: "EAF2F6" });
  addCard(slide, 7.7, 3.35, 4.95, 2.0, "0F3146", "Use boundary", "Verify the local approved label, pack insert, and approved claims before any real-world use. This is a demonstration deck, not approved content.", { line: "3C5E74", titleColor: C.white, bodyColor: "EAF2F6" });
  slide.addText("ClinCommand OS", { x: 0.82, y: 6.4, w: 2.4, h: 0.3, fontFace: "Aptos Display", fontSize: 16, bold: true, color: C.white, margin: 0 });
  slide.addText("Scientific communication architecture", { x: 0.82, y: 6.72, w: 4.8, h: 0.2, fontFace: "Aptos", fontSize: 8.5, color: "C8D4DC", margin: 0 });
  addNotes(slide, "Opening slide for a 25-slide HCP scientific deck demo on aceclofenac. Speaker should frame this as a balanced scientific overview, not a branded promotion. Recommended first line: 'This deck is for demonstration only; final content must follow the local approved label.'");
}

// Slide 2
{
  const slide = deck.addSlide();
  addBase(slide, "Briefing inputs captured for this deck", "This slide shows the questions the workflow should ask before finalizing an HCP slide request.", "Refs: ClinCommand OS HCP deck workflow; slide request intake standard");
  addCard(slide, 0.6, 1.45, 3.0, 1.55, C.sky, "How many slides?", "Requested output = 25 slides in this demo. In production, the deck length should match the audience, depth, and time available.");
  addCard(slide, 3.75, 1.45, 3.0, 1.55, C.pale, "How long is the talk?", "The speaker time should be confirmed up front so the deck can be concise, moderate, or detailed.");
  addCard(slide, 6.9, 1.45, 3.0, 1.55, "F7F2E4", "Do you need notes?", "Speaker notes should be specified early because they affect the slide density and the amount of content visible on screen.");
  addCard(slide, 10.05, 1.45, 2.7, 1.55, C.green, "Audience", "HCP scientific deck for internal demonstration.");
  addCard(slide, 0.6, 3.35, 5.7, 1.7, "FFFFFF", "Deck assumptions", "25 slides | scientific HCP audience | demonstration purpose | balanced evidence framing | speaker notes included | local PI verification required");
  addCard(slide, 6.55, 3.35, 6.2, 1.7, "FFFFFF", "What this workflow should ask next time", "1) How many slides? 2) How long is the talk? 3) Do you need notes? 4) What is the intended audience and market? 5) Should the deck be scientific, CME, or training?");
  addFooter(slide, "This deck intentionally includes the intake questions as a control pattern so the future workflow can collect them before drafting.");
  addNotes(slide, "Explain that the presentation pipeline should always capture slide count, duration, notes requirement, and audience before drafting. For this demo those inputs are already assumed. Cite that the deck uses 25 slides and includes notes because the user explicitly asked for them.");
}

// Slide 3
{
  const slide = deck.addSlide();
  addBase(slide, "Clinical context: why aceclofenac still matters", "Musculoskeletal pain is common, function-limiting, and often managed with non-steroidal anti-inflammatory drugs when local label use is appropriate.", "Refs: PubMed 34876850; PubMed 15163279");
  addCard(slide, 0.65, 1.5, 3.9, 2.0, C.sky, "Pain", "Persistent pain drives physician visits, self-medication, and loss of function. HCPs need a drug that can reduce pain without hiding risk.");
  addCard(slide, 4.72, 1.5, 3.9, 2.0, C.pale, "Inflammation", "Inflammatory mediators contribute to swelling, stiffness, and tenderness in musculoskeletal disorders and osteoarthritis.");
  addCard(slide, 8.79, 1.5, 3.9, 2.0, "FFF6E6", "Function", "The real clinical goal is improved mobility, daily activity, and quality of life, not just a lower symptom score.");
  addCard(slide, 0.9, 4.0, 11.5, 1.5, "FFFFFF", "Balanced HCP message", "Aceclofenac is best discussed as a symptom-control option within the NSAID class, with the usual class cautions on gastrointestinal, renal, cardiovascular, and hepatic risk.");
  addFooter(slide, "Evidence basis: review articles and osteoarthritis meta-analyses support the class role and the need for balanced risk communication.");
  addNotes(slide, "Describe the clinical setting: musculoskeletal pain and osteoarthritis are common reasons for NSAID use. Emphasize that symptom control must be balanced against GI, renal, cardiovascular, and hepatic risks. Avoid implying disease modification.");
}

// Slide 4
{
  const slide = deck.addSlide();
  addBase(slide, "From inflammation to pain: where NSAIDs act", "A simple pathway helps HCPs remember why NSAIDs can help symptoms, but not disease progression.", "Refs: PubMed 15163279; PubMed 34876850");
  const y = 1.85;
  addCard(slide, 0.7, y, 2.2, 1.0, C.sky, "Stimulus", "Tissue injury / inflammation");
  addCard(slide, 3.05, y, 2.2, 1.0, C.pale, "Mediator", "Prostaglandins rise");
  addCard(slide, 5.4, y, 2.2, 1.0, "FFF6E6", "Signal", "Pain and swelling increase");
  addCard(slide, 7.75, y, 2.2, 1.0, C.green, "Action", "NSAID reduces prostaglandin synthesis");
  addCard(slide, 10.1, y, 2.55, 1.0, "FFFFFF", "Outcome", "Pain relief and improved function");
  slide.addShape(deck.ShapeType.chevron, { x: 2.32, y: 2.16, w: 0.45, h: 0.35, fill: { color: C.teal }, line: { color: C.teal } });
  slide.addShape(deck.ShapeType.chevron, { x: 4.67, y: 2.16, w: 0.45, h: 0.35, fill: { color: C.teal }, line: { color: C.teal } });
  slide.addShape(deck.ShapeType.chevron, { x: 7.02, y: 2.16, w: 0.45, h: 0.35, fill: { color: C.teal }, line: { color: C.teal } });
  slide.addShape(deck.ShapeType.chevron, { x: 9.37, y: 2.16, w: 0.45, h: 0.35, fill: { color: C.teal }, line: { color: C.teal } });
  addCard(slide, 0.9, 3.8, 11.4, 1.45, "FFFFFF", "Clinical meaning", "The deck should show where aceclofenac fits within symptom management and where non-pharmacologic measures or alternative therapies may be more appropriate.");
  addFooter(slide, "This is a mechanism slide, not a claim that inflammation is always the only driver of pain.");
  addNotes(slide, "Explain the COX/prostaglandin concept in simple terms. Clarify that symptom relief does not imply disease modification. Keep the statement bounded to the NSAID class and avoid overstating benefit.");
}

// Slide 5
{
  const slide = deck.addSlide();
  addBase(slide, "Aceclofenac at a glance", "A concise product summary helps the HCP orient the rest of the deck.", "Refs: PubMed 34876850; EMA PSUSA/00000022/202303");
  addTable(slide, [
    [{ text: "Field", options: { bold: true, color: C.white, fill: C.navy } }, { text: "Summary", options: { bold: true, color: C.white, fill: C.navy } }],
    ["Class", "Oral NSAID (aceclofenac)"],
    ["Typical role", "Symptomatic treatment of inflammatory pain and osteoarthritis, subject to local label"],
    ["Common adult regimen", "Many markets use 100 mg twice daily; verify the local approved PI"],
    ["Key caution", "Class GI, renal, cardiovascular, and hepatic risks"],
    ["Deck purpose", "Demonstration of balanced HCP scientific communication"],
  ], 0.75, 1.55, 6.15, 2.6, { fontSize: 10.1, colW: [1.75, 4.4] });
  addCard(slide, 7.2, 1.6, 5.35, 1.8, C.sky, "How to present it", "State the role, then immediately state the boundaries: verify the local PI, show the evidence, and keep risk visible.");
  addCard(slide, 7.2, 3.6, 5.35, 1.8, C.green, "What not to do", "Do not turn a class NSAID into a universal solution. Avoid unsupported superiority claims or absolute safety language.");
  addFooter(slide, "Aceclofenac labeling varies by market; this deck uses demonstration wording only.");
  addNotes(slide, "Introduce aceclofenac as an oral NSAID, commonly used for inflammatory pain and OA where approved locally. Mention that dosing varies by market and the local PI should control. This is a safe place to remind the audience that class risk remains relevant.");
}

// Slide 6
{
  const slide = deck.addSlide();
  addBase(slide, "Mechanism of action", "This slide bridges pharmacology to bedside relevance without oversimplifying the science.", "Refs: PubMed 15163279; PubChem Aceclofenac");
  addCard(slide, 0.8, 1.55, 2.3, 1.0, C.sky, "Target", "COX pathway");
  addCard(slide, 3.2, 1.55, 2.3, 1.0, C.pale, "Effect", "↓ prostaglandin synthesis");
  addCard(slide, 5.6, 1.55, 2.3, 1.0, "FFF6E6", "Clinical result", "Less pain and inflammation");
  addCard(slide, 8.0, 1.55, 2.3, 1.0, C.green, "Use case", "Symptom control");
  addCard(slide, 10.4, 1.55, 2.1, 1.0, "FFFFFF", "Boundary", "Not disease-modifying");
  addBullets(slide, [
    "Aceclofenac is discussed as an NSAID with anti-inflammatory and analgesic properties.",
    "The HCP message should connect mechanism to symptom relief, mobility, and function.",
    "Mechanistic plausibility does not replace outcome evidence."
  ], 0.9, 3.1, 11.6, 1.5, 16);
  addFooter(slide, "Keep the mechanism slide simple enough that the audience remembers the point without confusion.");
  addNotes(slide, "Use a clean mechanism-to-benefit bridge. Do not imply unique mechanism-based superiority unless the evidence supports it. Keep the wording simple and anchored to symptom relief.");
}

// Slide 7
{
  const slide = deck.addSlide();
  addBase(slide, "Pharmacokinetic essentials", "A practical PK slide helps HCPs understand dose, frequency, and what to watch in special situations.", "Refs: PubMed 32898192; PubMed 18498912; PubMed 17090444");
  addTable(slide, [
    [{ text: "PK domain", options: { bold: true, color: C.white, fill: C.navy } }, { text: "Practical HCP meaning", options: { bold: true, color: C.white, fill: C.navy } }],
    ["Absorption", "Oral exposure supports routine outpatient use; exact timing can vary by formulation"],
    ["Distribution", "Typical NSAID distribution considerations; review local label if unusual formulation or combination product"],
    ["Metabolism", "Metabolized in the body; published studies describe relevant PK behavior for formulation development"],
    ["Excretion", "Follow the approved label for any special renal or hepatic precautions"],
    ["Clinical use note", "Use the local PI for exact timing, food instructions, and adjustment rules"],
  ], 0.75, 1.55, 7.1, 2.9, { fontSize: 9.8, colW: [1.55, 5.3] });
  addCard(slide, 8.15, 1.6, 4.35, 2.1, C.sky, "Why PK matters", "HCPs care about whether a medicine can be dosed conveniently, how long effect lasts, and whether special populations need extra caution.");
  addCard(slide, 8.15, 3.95, 4.35, 1.8, C.green, "Demo caution", "This deck does not replace a local prescribing label. Use the approved PI for dose and administration details.");
  addFooter(slide, "A separate formulation or market may have different approved instructions.");
  addNotes(slide, "Explain that PK supports dosing convenience and safe use, but exact dose and administration must come from the approved PI. Do not overstate any one PK parameter as a clinical outcome.");
}

// Slide 8
{
  const slide = deck.addSlide();
  addBase(slide, "Evidence map: what the literature can tell us", "A strong slide deck explains which evidence types are doing the heavy lifting.", "Refs: PubMed 34876850; PMC 8643213; PMC 5335881");
  const cols = [
    { x: 0.7, title: "Review and meta-analysis", body: "Best for overall pattern of efficacy and safety, subject to study quality and heterogeneity." },
    { x: 3.85, title: "Randomized trials", body: "Best for direct comparative efficacy within a defined population and endpoint." },
    { x: 7.0, title: "PK / BE studies", body: "Useful for formulation and bioequivalence questions, not for efficacy claims." },
    { x: 10.15, title: "Safety reviews", body: "Help frame class risk, warnings, and risk-mitigation language." },
  ];
  cols.forEach((c, idx) => addCard(slide, c.x, 1.6, 2.65, 2.3, idx % 2 === 0 ? C.sky : C.pale, c.title, c.body));
  addCard(slide, 0.95, 4.25, 11.4, 1.45, "FFFFFF", "Balanced interpretation", "Evidence synthesis should always state where the data are strong, where they are supportive, and where the deck is relying on class context rather than direct comparative evidence.");
  addFooter(slide, "The best HCP slides make the evidence hierarchy visible instead of hiding it.");
  addNotes(slide, "Walk the audience through the evidence hierarchy. Distinguish review-level evidence from direct trials and from PK/bioequivalence studies. Make it clear that each evidence type answers a different question.");
}

// Slide 9
{
  const slide = deck.addSlide();
  addBase(slide, "Osteoarthritis efficacy: pain and function", "Aceclofenac is most often discussed in osteoarthritis where symptom relief is the core endpoint.", "Refs: PMC 5335881; Eur J Rheumatol 2017/2016 OA meta-analysis");
  addCard(slide, 0.75, 1.55, 4.05, 2.25, C.sky, "Key message", "Meta-analytic evidence supports symptomatic benefit in osteoarthritis, especially for pain and functional outcomes.");
  addCard(slide, 5.0, 1.55, 3.95, 2.25, C.pale, "How to say it", "Use precise wording: 'improves symptoms' rather than 'changes disease course' or 'fixes the joint'.");
  addCard(slide, 9.15, 1.55, 3.45, 2.25, "FFF6E6", "Keep in mind", "Outcome interpretation depends on comparator, dose, duration, and baseline severity.");
  addCard(slide, 1.0, 4.15, 11.2, 1.55, "FFFFFF", "HCP takeaway", "Aceclofenac can be discussed as a symptom-focused option in OA when NSAID therapy is appropriate and class risks are addressed.");
  addFooter(slide, "Do not claim superiority if the data support only benefit within a class context.");
  addNotes(slide, "Summarize osteoarthritis efficacy as symptom relief with pain and function improvement. Keep the language cautious and evidence-based. Mention that the exact magnitude varies by study and comparator.");
}

// Slide 10
{
  const slide = deck.addSlide();
  addBase(slide, "Comparative efficacy: what makes a fair comparison?", "Not every comparative slide is a good comparison. Show the comparator, endpoint, and duration.", "Refs: PubMed 30120508; PubMed 36086745");
  addTable(slide, [
    [{ text: "Question", options: { bold: true, color: C.white, fill: C.navy } }, { text: "Fair comparison checklist", options: { bold: true, color: C.white, fill: C.navy } }],
    ["Comparator", "Was the comparator appropriate and correctly dosed?"],
    ["Population", "Was it the same disease severity and background therapy?"],
    ["Endpoint", "Was pain, function, or a surrogate endpoint measured consistently?"],
    ["Duration", "Was follow-up long enough to see meaningful benefit and risk?"],
    ["Conclusion", "Was the result statistically and clinically meaningful?"],
  ], 0.85, 1.6, 7.3, 2.7, { fontSize: 9.6, colW: [1.7, 5.5] });
  addCard(slide, 8.35, 1.7, 4.25, 2.1, C.sky, "Balanced message", "Comparative slide decks should avoid hanging comparisons that look impressive but are not clinically fair.");
  addCard(slide, 8.35, 4.0, 4.25, 1.8, C.green, "Practical use", "If the comparator is not identical in dose, population, or duration, say so plainly.");
  addFooter(slide, "Fair comparison is a discipline, not a design choice.");
  addNotes(slide, "Explain how to judge comparative NSAID data fairly. If the comparator is not equivalent or the design is weak, the slide should say so. Avoid overclaiming across-trial differences.");
}

// Slide 11
{
  const slide = deck.addSlide();
  addBase(slide, "Acute pain and postoperative evidence", "Aceclofenac has also been studied in acute and postoperative pain settings, but the deck should keep claims narrow.", "Refs: PMC 4170891; PubMed 15163279");
  addCard(slide, 0.8, 1.6, 4.1, 2.05, C.sky, "Evidence type", "Randomized and review evidence supports analgesic use in acute pain contexts, depending on local label.");
  addCard(slide, 5.05, 1.6, 4.1, 2.05, C.pale, "How to present", "Say 'analgesic option' rather than 'best postoperative pain drug'.");
  addCard(slide, 9.3, 1.6, 3.2, 2.05, "FFF6E6", "Boundaries", "Postoperative settings require procedure-specific review and safety screening.");
  addCard(slide, 1.0, 4.1, 11.2, 1.55, "FFFFFF", "Clinical meaning", "The slide should communicate that evidence exists in acute pain, but the choice of NSAID still depends on the patient’s GI, renal, and bleeding risk profile.");
  addFooter(slide, "Short-term analgesia does not eliminate the class safety checklist.");
  addNotes(slide, "Present acute pain evidence carefully. Keep the talk focused on symptom relief and the need for procedure-specific judgment. Do not imply all NSAIDs are interchangeable in every postoperative setting.");
}

// Slide 12
{
  const slide = deck.addSlide();
  addBase(slide, "Safety profile overview", "The strongest HCP slide decks are explicit about risk before they are explicit about benefit.", "Refs: EMA PSUSA/00000022/202303; LiverTox NSAIDs");
  addCard(slide, 0.8, 1.6, 3.9, 2.0, C.red, "GI", "Dyspepsia, ulceration, and bleeding are the classic NSAID concerns.");
  addCard(slide, 4.95, 1.6, 3.9, 2.0, C.amber, "Renal", "Renal perfusion effects matter, especially in older or volume-depleted patients.");
  addCard(slide, 9.1, 1.6, 3.4, 2.0, C.pale, "Hepatic/CV", "Hepatic enzyme elevations and cardiovascular caution are part of the class conversation.");
  addCard(slide, 1.0, 4.15, 11.2, 1.45, "FFFFFF", "Safe slide principle", "The presentation should never use 'completely safe' or 'no side effects' language. Instead, say what is known, what is monitored, and when to escalate.");
  addFooter(slide, "Safety should be visible in the same deck as efficacy, not buried in a small appendix.");
  addNotes(slide, "Set the tone here: safety is the equal partner to efficacy. Mention the major NSAID risks and the importance of monitoring and patient selection. Avoid absolute safety language.");
}

// Slide 13
{
  const slide = deck.addSlide();
  addBase(slide, "GI risk and mitigation", "This is the most familiar NSAID discussion point for many HCPs.", "Refs: EMA PSUSA/00000022/202303; NSAID safety reviews");
  addBullets(slide, [
    "Ask about ulcer history, prior GI bleed, concomitant antiplatelets or anticoagulants, and alcohol use.",
    "Use the lowest effective dose and the shortest effective duration consistent with the label.",
    "Consider gastroprotection where the patient’s risk profile warrants it.",
    "Escalate persistent abdominal pain, melaena, haematemesis, or unexplained anemia promptly."
  ], 0.9, 1.7, 6.5, 2.8, 14.5);
  addCard(slide, 7.8, 1.7, 4.75, 2.35, C.sky, "Message to the HCP", "The risk is manageable when the patient is selected carefully and the warning signs are not normalized.");
  addCard(slide, 7.8, 4.25, 4.75, 1.35, "FFFFFF", "Presentation style", "Keep this slide specific and practical rather than generic.");
  addFooter(slide, "GI warnings are a core part of NSAID scientific communication.");
  addNotes(slide, "Translate the class GI risk into concrete clinical actions: screen, protect, monitor, and escalate. Keep the advice practical and aligned with the approved label.");
}

// Slide 14
{
  const slide = deck.addSlide();
  addBase(slide, "Renal, cardiovascular, and hepatic cautions", "A balanced deck does not treat class risk as a footnote.", "Refs: EMA PSUSA/00000022/202303; LiverTox NSAIDs");
  addCard(slide, 0.75, 1.65, 3.9, 2.35, C.pale, "Renal", "Risk increases with dehydration, CKD, diuretics, and ACEi/ARB use.");
  addCard(slide, 4.78, 1.65, 3.9, 2.35, C.sky, "Cardiovascular", "NSAID use can be relevant in patients with hypertension, fluid retention, or cardiovascular disease.");
  addCard(slide, 8.81, 1.65, 3.75, 2.35, "FFF6E6", "Hepatic", "Monitor for liver test abnormalities where clinically indicated and follow the local PI.");
  addCard(slide, 1.0, 4.4, 11.2, 1.25, "FFFFFF", "Clinical guidance", "The slide should signal when a patient needs a different strategy or closer monitoring, not just a different prescription pad.");
  addFooter(slide, "Risk mitigation is part of the scientific message, not a legal appendix.");
  addNotes(slide, "Summarize the renal, cardiovascular, and hepatic precautions in plain language. Make the audience think about hydration, kidney function, blood pressure, and liver monitoring when appropriate.");
}

// Slide 15
{
  const slide = deck.addSlide();
  addBase(slide, "Drug interactions and concomitant therapy checks", "NSAID interactions are often about the whole regimen, not just the NSAID.", "Refs: NSAID class safety reviews; approved label");
  addTable(slide, [
    [{ text: "Interaction class", options: { bold: true, color: C.white, fill: C.navy } }, { text: "Why it matters", options: { bold: true, color: C.white, fill: C.navy } }],
    ["Anticoagulants / antiplatelets", "Bleeding risk rises"],
    ["Other NSAIDs", "Duplicate toxicity without added benefit"],
    ["ACEi/ARB + diuretic", "Renal perfusion / AKI concern"],
    ["Lithium / methotrexate", "Potential exposure increase"],
    ["Alcohol / steroids", "GI risk may rise further"],
  ], 0.9, 1.7, 7.0, 2.6, { fontSize: 9.6, colW: [2.25, 4.75] });
  addCard(slide, 8.25, 1.75, 4.35, 2.0, C.sky, "What the HCP needs", "A quick medication review before starting or refilling an NSAID is a safety intervention, not a formality.");
  addCard(slide, 8.25, 4.0, 4.35, 1.6, C.green, "Tip", "Interaction slides should be short, practical, and actionable.");
  addFooter(slide, "This slide should trigger a medication-reconciliation habit.");
  addNotes(slide, "Help the audience think beyond the single drug. The interaction slide should encourage medication review, renal caution, and bleeding-risk screening before use.");
}

// Slide 16
{
  const slide = deck.addSlide();
  addBase(slide, "Dosing and administration", "Keep the slide practical, but let the approved PI control the final wording.", "Refs: local PI to verify; review articles on aceclofenac");
  addCard(slide, 0.8, 1.6, 4.0, 2.2, C.pale, "Dose principle", "Many markets use 100 mg twice daily in adults, but the local approved PI must control the final wording.");
  addCard(slide, 5.0, 1.6, 4.0, 2.2, C.sky, "Administration", "State the timing, food instructions, and formulation details only as approved locally.");
  addCard(slide, 9.2, 1.6, 3.3, 2.2, "FFF6E6", "Adjustments", "Age, renal function, hepatic status, and comedications may alter the decision.");
  addCard(slide, 1.0, 4.25, 11.2, 1.35, "FFFFFF", "Deck message", "The role of the slide is to help the HCP use the product correctly, not to invent dosing instructions.");
  addFooter(slide, "Verify the local PI before any real-world use or dissemination.");
  addNotes(slide, "Be explicit that the dose shown is a common market pattern, not a universal instruction. The final local PI should prevail on administration timing and special-population adjustments.");
}

// Slide 17
{
  const slide = deck.addSlide();
  addBase(slide, "Practical patient selection", "A good HCP deck shows who may benefit and who may need another option.", "Refs: review articles; NSAID safety guidance");
  addCard(slide, 0.8, 1.65, 5.2, 2.25, C.green, "Reasonable candidates", "Patients with inflammatory pain or osteoarthritis who need a symptom-focused NSAID option and have an acceptable GI, renal, and cardiovascular risk profile.");
  addCard(slide, 6.25, 1.65, 5.95, 2.25, C.red, "Be cautious / avoid", "High GI risk, significant renal impairment, uncontrolled cardiovascular disease, active ulcer disease, and situations where local label or clinician judgment advises against NSAID use.");
  addCard(slide, 1.0, 4.25, 11.2, 1.4, "FFFFFF", "Decision rule", "Use the smallest effective exposure for the shortest effective time, and always let the local PI and patient profile drive the final choice.");
  addFooter(slide, "Patient selection is where benefit and risk are actually balanced.");
  addNotes(slide, "Explain that the best patient selection is the one that improves symptoms without creating avoidable class harm. The audience should leave with a screening habit, not just a brand memory.");
}

// Slide 18
{
  const slide = deck.addSlide();
  addBase(slide, "Special populations and risk modifiers", "This slide reminds HCPs that NSAID risk is not evenly distributed.", "Refs: EMA PSUSA/00000022/202303; local PI");
  addTable(slide, [
    [{ text: "Population", options: { bold: true, color: C.white, fill: C.navy } }, { text: "Practical question", options: { bold: true, color: C.white, fill: C.navy } }],
    ["Older adults", "Is GI, renal, or blood-pressure risk higher?"],
    ["CKD / dehydration", "Will renal perfusion be affected?"],
    ["Hepatic impairment", "Does local labeling require a change or avoidance?"],
    ["Pregnancy/lactation", "Does the local PI allow use?"],
    ["Children / adolescents", "Is use approved at all in the target market?"],
  ], 0.85, 1.68, 7.0, 2.7, { fontSize: 9.6, colW: [2.3, 4.7] });
  addCard(slide, 8.25, 1.7, 4.35, 2.0, C.sky, "Rule of thumb", "When the population is high risk or under-defined, the slide should direct the HCP back to the approved PI and clinical judgment.");
  addCard(slide, 8.25, 4.0, 4.35, 1.65, C.pale, "Do not overgeneralize", "Adult label language cannot simply be copied into pediatric or pregnancy care.");
  addFooter(slide, "Special-population guidance is a label issue, not a decorative disclaimer.");
  addNotes(slide, "This slide should reinforce that the approved label must govern special populations. The audience should be encouraged to check local restrictions rather than infer class use.");
}

// Slide 19
{
  const slide = deck.addSlide();
  addBase(slide, "Where aceclofenac fits in therapy", "Place-in-therapy slides should be balanced and realistic.", "Refs: review articles; OA meta-analysis");
  addCard(slide, 0.8, 1.6, 3.6, 2.15, C.sky, "Core role", "Symptomatic relief in inflammatory pain or OA where an NSAID is appropriate.");
  addCard(slide, 4.6, 1.6, 3.6, 2.15, C.pale, "Adjunctive role", "Can sit alongside non-pharmacologic measures and other approved interventions.");
  addCard(slide, 8.4, 1.6, 3.6, 2.15, "FFF6E6", "Not the role", "Not a disease-modifying therapy and not a universal option for every pain syndrome.");
  addCard(slide, 1.0, 4.25, 11.1, 1.4, "FFFFFF", "Balanced framing", "The slide should help HCPs understand when aceclofenac is a sensible choice and when an alternate strategy is a better fit.");
  addFooter(slide, "Place in therapy should be supported by evidence, not by enthusiasm alone.");
  addNotes(slide, "This slide is the bridge from evidence to practice. Keep it practical: when it fits, when it doesn’t, and why non-pharmacologic measures still matter.");
}

// Slide 20
{
  const slide = deck.addSlide();
  addBase(slide, "Non-pharmacologic context and combination care", "A good deck reminds HCPs that medicines are only one part of musculoskeletal care.", "Refs: OA reviews and guidelines context");
  addBullets(slide, [
    "Exercise, weight management, physiotherapy, and ergonomic advice remain important where appropriate.",
    "Analgesic therapy should be combined with lifestyle and mechanical management when indicated.",
    "Medication can help symptoms, but the care plan should still address the underlying functional problem."
  ], 0.95, 1.72, 6.7, 2.3, 14.2);
  addCard(slide, 7.9, 1.7, 4.55, 2.15, C.sky, "Why this matters", "The slide prevents the deck from sounding as if medicine alone solves OA or back pain.");
  addCard(slide, 7.9, 4.05, 4.55, 1.6, C.green, "Takeaway", "A scientific HCP deck should reinforce multimodal care.");
  addFooter(slide, "This protects the presentation from becoming drug-only messaging.");
  addNotes(slide, "Connect the medication to the broader care plan: movement, support, weight, and function. This is where the deck feels like HCP science rather than marketing.");
}

// Slide 21
{
  const slide = deck.addSlide();
  addBase(slide, "Counselling points for HCP discussion", "These are the practical messages a clinician can use when deciding whether to use an NSAID.", "Refs: NSAID class safety guidance");
  addCard(slide, 0.8, 1.6, 5.0, 2.2, C.pale, "Discuss benefit", "Expected symptom relief, function goals, and time-limited use.");
  addCard(slide, 5.95, 1.6, 5.75, 2.2, C.sky, "Discuss risk", "GI, renal, cardiovascular, and hepatic warning signs plus concomitant therapy checks.");
  addCard(slide, 1.0, 4.2, 11.0, 1.45, "FFFFFF", "Counselling style", "The HCP should leave with a quick, repeatable safety script that supports the patient without overpromising the drug.");
  addFooter(slide, "Counselling is part of scientific communication and risk reduction.");
  addNotes(slide, "Explain that the deck is intended to support what the clinician says to the patient, especially around benefit expectations and warning signs. This is a practical bridge slide.");
}

// Slide 22
{
  const slide = deck.addSlide();
  addBase(slide, "Frequently asked HCP questions", "A good deck anticipates the questions that usually come up in discussion.", "Refs: review articles; local PI");
  const qas = [
    ["Q1. Is aceclofenac unique?", "It is an NSAID with a recognized role in symptom relief; any claim of uniqueness must be evidence-based and local-label compliant."],
    ["Q2. Can it replace all pain therapies?", "No. It fits only where NSAID therapy is appropriate and risk is acceptable."],
    ["Q3. Is it safe in every patient?", "No. GI, renal, cardiovascular, hepatic, and interaction risks still matter."],
    ["Q4. What should I verify first?", "The approved local PI, special-population limits, and concomitant medicines."],
  ];
  addTable(slide, [
    [{ text: "Question", options: { bold: true, color: C.white, fill: C.navy } }, { text: "Controlled answer", options: { bold: true, color: C.white, fill: C.navy } }],
    ...qas
  ], 0.75, 1.65, 11.7, 2.95, { fontSize: 9.5, colW: [3.4, 8.0] });
  addFooter(slide, "FAQ slides are useful, but they must remain aligned to label and safety evidence.");
  addNotes(slide, "Use short, controlled answers. Never use FAQ slides to smuggle in promotional language. The correct response should always bring the audience back to source control.");
}

// Slide 23
{
  const slide = deck.addSlide();
  addBase(slide, "Balanced claims: what not to say", "A scientific deck stays honest about what the evidence can and cannot support.", "Refs: EMA PSUSA/00000022/202303; review literature");
  addCard(slide, 0.8, 1.6, 3.8, 2.2, C.red, "Avoid", "“Completely safe” or “no side effects.”");
  addCard(slide, 4.8, 1.6, 3.8, 2.2, C.red, "Avoid", "“Best in class” unless the evidence and approval support it.");
  addCard(slide, 8.8, 1.6, 3.7, 2.2, C.red, "Avoid", "Unsupported superiority or interchangeability claims.");
  addCard(slide, 1.0, 4.2, 11.1, 1.4, "FFFFFF", "Preferred language", "“A symptom-focused NSAID option where appropriate” is safer than overreaching claims.");
  addFooter(slide, "Balanced language protects both the audience and the product team.");
  addNotes(slide, "This slide is a deliberate control slide. Read the red-box examples aloud and then replace them with better evidence-based language. The goal is to train disciplined wording.");
}

// Slide 24
{
  const slide = deck.addSlide();
  addBase(slide, "Evidence and reference map", "A scientific deck becomes stronger when the audience can see the source base.", "Refs: PubMed 34876850; PMC 8643213; PMC 5335881; PubMed 36086745; EMA PSUSA/00000022/202303");
  const refs = [
    ["1", "Review of aceclofenac in musculoskeletal disorders", "PMID 34876850 / PMC 8643213"],
    ["2", "Aceclofenac in inflammatory pain", "PMID 15163279"],
    ["3", "OA meta-analysis of randomized trials", "PMC 5335881"],
    ["4", "Safety/efficacy review and NSAID class context", "PMID 36086745 / EMA PSUSA"],
    ["5", "PK / bioequivalence studies", "PMID 32898192 / 17090444"],
  ];
  addTable(slide, [
    [{ text: "#", options: { bold: true, color: C.white, fill: C.navy } }, { text: "Reference", options: { bold: true, color: C.white, fill: C.navy } }, { text: "Use in deck", options: { bold: true, color: C.white, fill: C.navy } }],
    ...refs
  ], 0.75, 1.6, 11.8, 2.4, { fontSize: 9.2, colW: [0.45, 7.0, 4.35] });
  addCard(slide, 0.95, 4.25, 11.15, 1.35, "FFFFFF", "How to use the references", "Keep the full citation list in the notes or appendix and keep the visible slide text concise. This preserves readability while keeping the audit trail intact.");
  addFooter(slide, "The reference map is the bridge between an attractive deck and a defensible deck.");
  addNotes(slide, "Show the audience that the deck is grounded in a review article, a meta-analysis, safety context, and PK studies. Keep the visible slide tidy and let the notes carry the fuller citation list.");
}

// Slide 25
{
  const slide = deck.addSlide();
  slide.background = { color: C.navy };
  slide.addShape(deck.ShapeType.rect, { x: 0, y: 0, w: 13.333, h: 7.5, line: { color: C.navy, transparency: 100 }, fill: { color: C.navy } });
  slide.addText("Aceclofenac HCP scientific deck", {
    x: 0.85, y: 1.2, w: 6.8, h: 0.5,
    fontFace: "Aptos Display", fontSize: 26, bold: true, color: C.white, margin: 0
  });
  slide.addText("Key takeaways", {
    x: 0.85, y: 1.8, w: 4.5, h: 0.3,
    fontFace: "Aptos Display", fontSize: 14, bold: true, color: "E8F2F1", margin: 0
  });
  addBullets(slide, [
    "Aceclofenac is best presented as a balanced NSAID option for symptom relief where local labeling allows.",
    "Efficacy slides should stay tied to pain and function, not disease-modifying claims.",
    "Safety must stay visible: GI, renal, cardiovascular, and hepatic cautions belong in the main deck.",
    "The local PI should control final dosing and special-population wording.",
    "Speaker notes and slide count should be confirmed up front for any real delivery version."
  ], 0.95, 2.15, 8.7, 2.9, 14.5, C.white);
  addCard(slide, 9.95, 1.35, 2.55, 2.0, "173D56", "Deck status", "Demonstration only", { line: "2B5A76", titleColor: C.white, bodyColor: "EAF2F6", bodySize: 11 });
  addCard(slide, 9.95, 3.55, 2.55, 2.0, "0F3146", "Next step", "Adapt to local PI and audience", { line: "2B5A76", titleColor: C.white, bodyColor: "EAF2F6", bodySize: 11 });
  slide.addText("ClinCommand OS", { x: 0.85, y: 6.5, w: 2.6, h: 0.2, fontFace: "Aptos Display", fontSize: 14, bold: true, color: C.white, margin: 0 });
  slide.addText("thank you", { x: 10.75, y: 6.45, w: 1.8, h: 0.25, fontFace: "Aptos Display", fontSize: 16, bold: true, color: C.white, margin: 0, align: "right" });
  addNotes(slide, "Close by summarizing the central message: aceclofenac is a symptom-focused NSAID option, but it must always be discussed with class risk and local label control. Mention that the deck was built as a 25-slide demo with notes and can now be adapted to a specific audience duration.");
}

deck.writeFile({ fileName: OUT })
  .then(() => console.log(OUT))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
