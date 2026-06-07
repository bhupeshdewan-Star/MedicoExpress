import fs from "node:fs/promises";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ARTIFACT = await import("file:///C:/Users/bhupe/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUT_DIR = path.join(__dirname, "..", "artifacts", "hcp_scientific_slide_deck_demo");
const ASSET_DIR = path.join(OUT_DIR, "assets");
const OUT_PPTX = path.join(OUT_DIR, "Aceclofenac_HCP_Scientific_Deck_Demo_v5.pptx");
const OUT_PREVIEW = path.join(OUT_DIR, "Aceclofenac_HCP_Scientific_Deck_Demo_v5_montage.png");

const IMG = {
  joint: path.join(ASSET_DIR, "ig_031c3252a452a9bf016a24643e5b648191ac1e488a69966d74.png"),
  mechanism: path.join(ASSET_DIR, "ig_031c3252a452a9bf016a24648abe78819185ff730324c9a442.png"),
  patient: path.join(ASSET_DIR, "ig_031c3252a452a9bf016a2464cdd9688191995ec184aa3e5aaa.png"),
  gi: path.join(ASSET_DIR, "ig_031c3252a452a9bf016a246510f3008191a18804c1a4ea4eaa.png"),
};

const C = {
  navy: "#16324F",
  navy2: "#0E2538",
  teal: "#117A7B",
  sky: "#EAF4F7",
  pale: "#F4F8FA",
  gold: "#D9C27A",
  green: "#E6F4EA",
  amber: "#FFF2CC",
  red: "#FCE4D6",
  dark: "#24313A",
  muted: "#5F6B75",
  white: "#FFFFFF",
  line: "#D9E2E8",
  lightBlue: "#DDEAF0",
};

const CITE_MAP = {
  2: "¹²³",
  3: "¹²³",
  4: "¹²³",
  5: "¹²³",
  6: "¹²³",
  7: "¹²³",
  8: "¹²³",
  9: "¹²³",
  10: "¹²³",
  11: "⁴⁵⁶",
  12: "⁴⁵⁶",
  13: "⁴⁵⁶",
  14: "⁴⁵⁶",
  15: "¹²³",
  16: "⁴⁵⁶",
  17: "¹²³",
  18: "¹²³",
  19: "¹²³",
  20: "⁴⁵⁶",
  21: "¹²³",
  22: "¹²³",
  23: "¹²³⁴⁵⁶",
  24: "⁴⁵⁶",
};

function solid(color) {
  return { type: "solid", color };
}

function outline(color, width = 1) {
  return { style: "solid", fill: color, width };
}

function textBox(slide, opts) {
  const {
    left, top, width, height, text,
    fill = C.white,
    line = fill,
    fontSize = 16,
    color = C.dark,
    bold = false,
    align = "left",
    valign = "top",
    typeface = "Aptos",
    radius = "rect",
    transparent = false,
    name,
  } = opts;

  const shape = slide.shapes.add({
    geometry: radius,
    position: { left, top, width, height },
    fill: transparent ? { type: "solid", color: fill, transparency: 100 } : solid(fill),
    line: transparent ? { style: "solid", fill: fill, width: 0 } : outline(line, 1),
  });
  if (name) shape.name = name;
  shape.text = text;
  shape.text.typeface = typeface;
  shape.text.fontSize = fontSize;
  shape.text.color = color;
  shape.text.bold = bold;
  shape.text.alignment = align;
  shape.text.verticalAlignment = valign;
  return shape;
}

function addChrome(slide, title, subtitle, refs, slideNum, dark = false) {
  const bg = dark ? C.navy : C.white;
  slide.__bg = bg;
  const titleColor = dark ? C.white : C.navy;
  const subColor = dark ? "#D6E3EA" : C.muted;
  slide.background.fill = solid(bg);
  slide.shapes.add({
    geometry: "rect",
    position: { left: 0, top: 0, width: 1280, height: 720 },
    fill: solid(bg),
    line: outline(bg, 0),
  });
  slide.shapes.add({
    geometry: "rect",
    position: { left: 0, top: 0, width: 1280, height: 18 },
    fill: solid(dark ? C.navy2 : C.navy),
    line: outline(dark ? C.navy2 : C.navy, 0),
  });
  textBox(slide, {
    left: 64, top: 34, width: 1030, height: 48,
    text: title, fill: bg, line: bg, fontSize: 26, color: titleColor, bold: true, radius: "rect",
  });
  if (subtitle) {
    textBox(slide, {
      left: 64, top: 82, width: 1110, height: 28,
      text: subtitle, fill: bg, line: bg, fontSize: 12.2, color: subColor, radius: "rect",
    });
  }
  slide.shapes.add({
    geometry: "rect",
    position: { left: 64, top: 115, width: 1150, height: 1.5 },
    fill: solid(dark ? "#31536A" : C.line),
    line: outline(dark ? "#31536A" : C.line, 0),
  });
  const citeText = refs && refs.startsWith("Refs:") ? (CITE_MAP[slideNum] || "¹²³") : refs;
  if (citeText) {
    textBox(slide, {
      left: 1116, top: 80, width: 100, height: 18,
      text: citeText, fill: bg, line: bg, fontSize: 12.5, color: dark ? "#D6E3EA" : C.teal, radius: "rect", align: "right",
    });
  }
  textBox(slide, {
    left: 1120, top: 684, width: 100, height: 16,
    text: `Slide ${slideNum}/25`, fill: bg, line: bg, fontSize: 8.2, color: subColor, align: "right",
  });
}

function addCover(slide) {
  slide.background.fill = solid(C.navy);
  slide.shapes.add({
    geometry: "rect",
    position: { left: 0, top: 0, width: 1280, height: 720 },
    fill: solid(C.navy),
    line: outline(C.navy, 0),
  });
  slide.shapes.add({
    geometry: "rect",
    position: { left: 0, top: 0, width: 1280, height: 110 },
    fill: solid(C.navy2),
    line: outline(C.navy2, 0),
  });
  textBox(slide, {
    left: 72, top: 142, width: 560, height: 56,
    text: "Aceclofenac: the practical NSAID story", fill: C.navy, line: C.navy, fontSize: 30, color: C.white, bold: true,
  });
  textBox(slide, {
    left: 72, top: 202, width: 560, height: 30,
    text: "Clinical evidence deck", fill: C.navy, line: C.navy, fontSize: 18, color: "#D9E6EE",
  });
  textBox(slide, {
    left: 72, top: 240, width: 520, height: 28,
    text: "For demonstration purposes only | verify the local approved PI before use",
    fill: C.navy, line: C.navy, fontSize: 10.5, color: "#C8D4DC",
  });
  addCard(slide, 72, 332, 520, 86, "#173D56", "Scientific role", "Balanced NSAID messaging focused on symptom relief and safety", { line: "#2B5A76", titleColor: C.white, bodyColor: "#EAF2F6", bodySize: 11.2 });
  addCard(slide, 72, 444, 520, 86, "#113247", "Evidence spine", "OA efficacy, acute pain studies, PK / BE, and class risk", { line: "#2B5A76", titleColor: C.white, bodyColor: "#EAF2F6", bodySize: 11.2 });
  addCard(slide, 72, 556, 520, 86, "#0F3146", "Use boundary", "Demonstration deck only; final claims must follow local label", { line: "#3C5E74", titleColor: C.white, bodyColor: "#EAF2F6", bodySize: 11.2 });
  textBox(slide, {
    left: 800, top: 144, width: 408, height: 448,
    text: "This deck is designed as a scientific brand narrative, not as a marketing piece.\n\nIt helps the audience think about where aceclofenac fits, what evidence supports that fit, and which class risks need to stay visible at the point of prescribing.",
    fill: "#173A53",
    line: "#2B5A76",
    fontSize: 19.5,
    color: "#EAF2F6",
    bold: false,
    radius: "roundRect",
  });
  addImagePanel(slide, IMG.patient, 806, 520, 372, 92, "Aceclofenac opening visual");
  textBox(slide, {
    left: 72, top: 612, width: 370, height: 24,
    text: "ClinCommand OS", fill: C.navy, line: C.navy, fontSize: 16, color: C.white, bold: true,
  });
  textBox(slide, {
    left: 72, top: 640, width: 470, height: 18,
    text: "Scientific communication architecture", fill: C.navy, line: C.navy, fontSize: 8.6, color: "#C8D4DC",
  });
  slide.speakerNotes.text = [
    "Opening slide for a scientific brand narrative on aceclofenac.",
    "Frame the deck as a balanced scientific overview and remind the audience to verify the local approved label.",
  ].join("\n");
}

function addCard(slide, left, top, width, height, fill, title, body, opts = {}) {
  const card = slide.shapes.add({
    geometry: "roundRect",
    position: { left, top, width, height },
    fill: solid(fill),
    line: outline(opts.line || C.line, 1),
  });
  const titleBox = textBox(slide, {
    left: left + 14, top: top + 12, width: width - 28, height: 28,
    text: title, fill, line: fill, fontSize: opts.titleSize || 13.5, color: opts.titleColor || C.navy, bold: true, radius: "rect",
  });
  const bodyBox = textBox(slide, {
    left: left + 14, top: top + 42, width: width - 28, height: height - 52,
    text: body, fill, line: fill, fontSize: opts.bodySize || 10.8, color: opts.bodyColor || C.dark, radius: "rect",
  });
  if (opts.center) {
    titleBox.text.alignment = "center";
    bodyBox.text.alignment = "center";
    bodyBox.text.verticalAlignment = "middle";
  }
  card.bringToFront();
  titleBox.bringToFront();
  bodyBox.bringToFront();
  return { card, titleBox, bodyBox };
}

function addTable(slide, left, top, width, height, values, opts = {}) {
  const table = slide.tables.add({
    rows: values.length,
    columns: values[0].length,
    left,
    top,
    width,
    height,
    values,
    columnTracks: opts.columnTracks,
  });
  const header = table.cells.block({
    row: 0,
    column: 0,
    rowCount: 1,
    columnCount: values[0].length,
  });
  header.assign({
    fill: C.navy,
    textStyle: { bold: true, color: C.white, typeface: "Aptos", fontSize: opts.headerFontSize || 10 },
    borders: { bottom: { width: 1, color: C.white } },
  });
  return table;
}

function addBullets(slide, left, top, width, height, bullets, opts = {}) {
  const text = bullets.map((b) => `- ${b}`).join("\n\n");
  return textBox(slide, {
    left, top, width, height, text,
    fill: opts.fill || C.white,
    line: opts.line || (opts.fill || C.white),
    fontSize: opts.fontSize || 13,
    color: opts.color || C.dark,
    radius: "rect",
  });
}

function addFooterSlide(slide, text) {
  const bg = slide.__bg || C.white;
  textBox(slide, {
    left: 64, top: 666, width: 1160, height: 18,
    text, fill: bg, line: bg,
    fontSize: 8.2, color: C.muted,
  });
}

function addNotes(slide, text) {
  slide.speakerNotes.text = text;
}

function fileToDataUrl(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const mime = ext === ".jpg" || ext === ".jpeg" ? "image/jpeg" : "image/png";
  const bytes = readFileSync(filePath);
  return `data:${mime};base64,${bytes.toString("base64")}`;
}

function addImagePanel(slide, filePath, left, top, width, height, alt) {
  slide.shapes.add({
    geometry: "roundRect",
    position: { left, top, width, height },
    fill: solid("#10293D"),
    line: outline("#2B5A76", 1),
  });
  const dataUrl = fileToDataUrl(filePath);
  slide.images.add({
    dataUrl,
    position: { left: left + 8, top: top + 8, width: width - 16, height: height - 16 },
    alt,
  });
}

const presentation = ARTIFACT.Presentation.create();

// Slide 1
{
  const slide = presentation.slides.add();
  addCover(slide);
  addNotes(slide, "Open by stating this is a scientific brand narrative, not approved promotional material.");
}

// Slide 2
{
  const slide = presentation.slides.add();
  addChrome(
    slide,
    "Why aceclofenac deserves a fresh discussion",
    "Three things matter: where it fits, what the evidence says, and what makes the safety conversation credible.",
    "Refs: PubMed 34876850; PMC8643213; PubMed 5335881",
    2
  );
  addCard(slide, 64, 154, 360, 154, C.sky, "Where it fits", "Symptom relief in osteoarthritis, inflammatory arthritis, and short-term musculoskeletal pain where NSAID therapy is appropriate.", { bodySize: 11.4 });
  addCard(slide, 456, 154, 360, 154, C.pale, "What supports it", "Peer-reviewed trials, a meta-analysis, and newer comparative studies keep the clinical story relevant.", { bodySize: 11.4 });
  addCard(slide, 848, 154, 360, 154, "#FFF6E6", "Why it can stand out", "A practical dose pattern, a recognisable efficacy profile, and clear class-risk management make it easy to discuss.", { bodySize: 11.4 });
  addCard(slide, 64, 346, 540, 154, C.white, "Message spine", "1) Fast symptom control\n2) Efficacy backed by peer-reviewed evidence\n3) Safety and patient selection stay visible", { bodySize: 12 });
  addCard(slide, 628, 346, 580, 154, C.white, "Deck promise", "This is not a bland class summary. It is a clinically grounded brand narrative with enough pull to matter in conversation.", { bodySize: 12 });
  addImagePanel(slide, IMG.joint, 896, 514, 320, 104, "Aceclofenac joint visual");
  addFooterSlide(slide, "The deck is built to be clinically persuasive without losing balance.");
  addNotes(slide, "This is the persuasion slide: why the molecule matters, why the evidence is meaningful, and why the brand has a place in practice.");
}

// Slide 3
{
  const slide = presentation.slides.add();
  addChrome(slide, "Clinical context: the symptom problem aceclofenac addresses", "Aceclofenac is a symptom-focused NSAID for inflammatory pain states where the local label allows use and class risk is acceptable.", "Refs: PubMed 34876850; PubMed 36414224; PubMed 34719940", 3);
  addCard(slide, 64, 154, 360, 170, C.sky, "Osteoarthritis", "Pain, stiffness, and function loss are the practical endpoints. Recent OA reviews still place NSAIDs in the core symptom-control conversation.", { bodySize: 11.5 });
  addCard(slide, 462, 154, 360, 170, C.pale, "Inflammatory arthritis", "In rheumatoid and spondyloarthritic disease, NSAIDs relieve pain and stiffness but do not replace disease-modifying therapy.", { bodySize: 11.5 });
  addCard(slide, 860, 154, 356, 170, "#FFF6E6", "Acute musculoskeletal pain", "Short-term use may help in acute low back pain and other painful inflammatory states where the label permits it.", { bodySize: 11.5 });
  addCard(slide, 92, 366, 1096, 144, C.white, "Balanced clinical message", "Aceclofenac can reduce inflammation-linked symptoms, but the prescriber still needs to screen for GI, renal, cardiovascular, hepatic, pregnancy, and interaction risks before choosing it.", { bodySize: 14.2, center: true });
  addImagePanel(slide, IMG.patient, 892, 518, 324, 96, "Pain and knee disease visual");
  addNotes(slide, "Frame aceclofenac as a symptom-relief NSAID with clear label boundaries. Link every benefit statement to the clinical problem it addresses.");
}

// Slide 4
{
  const slide = presentation.slides.add();
  addChrome(slide, "Molecule profile: identity, chemistry, and physicochemical facts", "Identity, chemistry, and physicochemical facts give the deck real scientific weight.", "Refs: PubMed 34876850; PMC8643213; PMC9530112", 4);
  const boxes = [
    { left: 70, top: 180, w: 216, h: 112, t: "Chemical name", b: "2-[(2,6-dichlorophenyl)amino]phenylacetooxyacetic acid", fill: C.sky },
    { left: 310, top: 180, w: 172, h: 112, t: "Formula", b: "C16H13Cl2NO4", fill: C.pale },
    { left: 506, top: 180, w: 164, h: 112, t: "Molecular weight", b: "354.2", fill: "#FFF6E6" },
    { left: 694, top: 180, w: 204, h: 112, t: "Appearance / solubility", b: "White crystalline powder; freely soluble in acetone, soluble in ethanol, practically insoluble in water", fill: C.green },
    { left: 922, top: 180, w: 188, h: 112, t: "Class", b: "Oral phenylacetic acid NSAID", fill: C.white },
  ];
  const shapes = [];
  boxes.forEach((x) => {
    shapes.push(addCard(slide, x.left, x.top, x.w, x.h, x.fill, x.t, x.b, { bodySize: 10.4, center: true }));
  });
  addCard(slide, 92, 340, 1096, 178, C.white, "Why this matters clinically", "Aceclofenac is not just an NSAID label. Its chemical identity, oral absorption profile, synovial penetration, and high protein binding are part of why the clinical story feels practical rather than abstract.", { bodySize: 13.5, center: true });
  addImagePanel(slide, IMG.mechanism, 882, 528, 336, 86, "Molecule and mechanism visual");
  addNotes(slide, "Use the molecule facts to make the deck feel scientifically grounded: name, formula, solubility, and how those features relate to oral use.");
}

// Slide 5
{
  const slide = presentation.slides.add();
  addChrome(slide, "Mechanism of action and translational relevance", "The MOA slide connects prostaglandin biology to symptom relief without overselling disease modification.", "Refs: PubMed 34876850; PMC8643213; PMC3953523", 5);
  const values = [
    ["Field", "Summary"],
    ["Class", "Oral NSAID (aceclofenac)"],
    ["Primary action", "Potent inhibition of cyclo-oxygenase and downstream prostaglandin synthesis"],
    ["Clinical effect", "Reduction of pain, swelling, and morning stiffness in approved inflammatory states"],
    ["Compartment relevance", "Penetrates synovial fluid at roughly 57% of plasma concentration"],
    ["Key caution", "Class risks remain: GI, renal, cardiovascular, and hepatic warnings"],
  ];
  const table = addTable(slide, 64, 156, 670, 270, values, { columnTracks: [ARTIFACT.fr(0.32), ARTIFACT.fr(0.68)], headerFontSize: 10.2 });
  addCard(slide, 780, 154, 416, 124, C.sky, "How to present it", "Say what it does at the tissue level, then say what that means for the patient: less pain and stiffness, not disease modification.", { bodySize: 11.8 });
  addCard(slide, 780, 298, 416, 124, C.green, "What not to do", "Do not imply that COX inhibition eliminates all inflammatory risk or makes the drug broadly safer than other NSAIDs.", { bodySize: 11.8 });
  addImagePanel(slide, IMG.mechanism, 882, 512, 334, 104, "Inflammation pathway visual");
  addFooterSlide(slide, "Aceclofenac is a symptom-relief NSAID; the clinical decision still depends on the patient.");
  addNotes(slide, "Link mechanism to patient benefit in one sentence and stop there. The slide should feel mechanistically precise, not marketing-heavy.");
}

// Slide 6
{
  const slide = presentation.slides.add();
  addChrome(slide, "Pharmacokinetics at a glance", "This is the most important bridge between chemistry and prescribing practicality.", "Refs: PubMed 34876850; PMC9530112; PMC8643213", 6);
  addTable(slide, 64, 154, 706, 292, [
    ["PK domain", "Practical clinical meaning"],
    ["Absorption", "Rapid oral absorption; peak plasma levels occur within about 1.25 to 3 hours."],
    ["Distribution", "High protein binding (>99%); synovial fluid concentrations reach about 57% of plasma."],
    ["Metabolism", "Main circulating metabolite is 4'-hydroxyaceclofenac."],
    ["Excretion", "Most elimination is urinary, mainly as hydroxymetabolites."],
    ["Half-life", "Mean plasma elimination half-life is around 4 hours."],
  ], { columnTracks: [ARTIFACT.fr(0.26), ARTIFACT.fr(0.74)], headerFontSize: 10 });
  addCard(slide, 816, 156, 340, 134, C.sky, "Why PK matters", "These numbers help clinicians understand onset, duration, synovial exposure, and why the drug is not just a generic NSAID concept.", { bodySize: 11.7 });
  addCard(slide, 816, 308, 340, 138, C.green, "Label alignment", "Pair the PK discussion with the approved local label for dosing, food instructions, and special-population wording.", { bodySize: 11.7 });
  addImagePanel(slide, IMG.gi, 886, 514, 320, 102, "GI protection and safety visual");
  addFooterSlide(slide, "PK data always belongs beside the approved label.");
  addNotes(slide, "Keep the PK slide numeric and clinically useful. The audience should leave with one or two concrete facts, not a vague impression.");
}

// Slide 7
{
  const slide = presentation.slides.add();
  addChrome(slide, "What the newest evidence adds", "The latest work does not reinvent aceclofenac, but it does keep the molecule clinically relevant.", "Refs: PubMed 36647880; PMC9530112; PubMed 39290780", 7);
  addCard(slide, 64, 160, 350, 220, C.sky, "2023 phase 3 acute LBP", "A multicenter phase 3 trial used aceclofenac 100 mg as the active comparator in acute low back pain with muscle spasm and confirmed the class is still being studied in modern endpoints.", { bodySize: 11.2 });
  addCard(slide, 436, 160, 350, 220, C.pale, "Large real-world cohort", "A 2022 effectiveness and safety study followed more than 14,000 routine-practice patients on once-daily aceclofenac CR, reinforcing practical relevance.", { bodySize: 11.2 });
  addCard(slide, 808, 160, 388, 220, "#FFF6E6", "2024 OA context", "New OA reviews still frame oral NSAIDs as a major symptom-control class, which keeps aceclofenac in the discussion even as therapy evolves.", { bodySize: 11.2 });
  addCard(slide, 104, 436, 1072, 118, C.white, "Balanced interpretation", "The newest evidence says aceclofenac remains a workable, familiar NSAID option with ongoing clinical relevance. That is commercially useful because the molecule is quick to recognise and still has a place in discussion.", { bodySize: 13.6, center: true });
  addImagePanel(slide, IMG.mechanism, 888, 522, 330, 94, "Modern evidence and mechanism visual");
  addNotes(slide, "Make the newest evidence explicit and commercially relevant: modern trial comparator, large real-world safety/effectiveness cohort, and current OA review context.");
}

// Slide 8
{
  const slide = presentation.slides.add();
  addChrome(slide, "Osteoarthritis efficacy: pain, stiffness, and function", "This is the core clinical slide and deserves an actual study graphic.", "Refs: PubMed 5335881; PubMed 17387026; PubMed 24639945", 8);
  addCard(slide, 64, 154, 356, 186, C.sky, "What the meta-analysis supports", "Aceclofenac shows beneficial symptomatic effects in osteoarthritis and is generally comparable with commonly used NSAIDs in short-term trials.", { bodySize: 11.6 });
  addCard(slide, 444, 154, 356, 186, C.pale, "How to say it", "Say pain and function improved, but avoid disease-modifying language. The patient feels better; the joint disease is not reversed.", { bodySize: 11.6 });
  addCard(slide, 824, 154, 392, 186, "#FFF6E6", "Comparator discipline", "The interpretation depends on dose equivalence, trial duration, baseline pain, rescue medication, and whether the comparator was fairly selected.", { bodySize: 11.6 });
  const chartBaseX = 104, chartBaseY = 382, chartW = 1064, chartH = 136;
  addCard(slide, chartBaseX, chartBaseY, chartW, chartH, C.white, "Evidence signal snapshot", "", { bodySize: 1, center: true });
  const bars = [
    { label: "OA vs paracetamol", value: 7.64, fill: C.teal },
    { label: "Acute LBP vs diclofenac", value: 61.6, fill: C.navy },
    { label: "Knee OA CR vs IR", value: 15.7, fill: C.green },
  ];
  const max = 70;
  bars.forEach((b, i) => {
    const bx = 160 + i * 300;
    const barH = Math.max(18, Math.round((b.value / max) * 74));
    slide.shapes.add({ geometry: "rect", position: { left: bx, top: 472 - barH, width: 58, height: barH }, fill: solid(b.fill), line: outline(b.fill, 0) });
    textBox(slide, { left: bx - 20, top: 488, width: 96, height: 24, text: b.label, fill: C.white, line: C.white, fontSize: 9.4, color: C.dark, align: "center" });
    textBox(slide, { left: bx - 10, top: 446 - barH, width: 76, height: 18, text: `${b.value}`, fill: C.white, line: C.white, fontSize: 10.5, color: C.dark, align: "center", bold: true });
  });
  addImagePanel(slide, IMG.joint, 882, 520, 334, 92, "Osteoarthritis response visual");
  addNotes(slide, "Use the study graphic as a conversation starter: the brand has measurable symptom benefit and the study story is straightforward.");
}

// Slide 9
{
  const slide = presentation.slides.add();
  addChrome(slide, "Rheumatoid arthritis and inflammatory arthritis evidence", "Aceclofenac fits the symptom side of the rheumatoid arthritis conversation.", "Refs: PubMed 8853164; PMC8643213", 9);
  addCard(slide, 64, 156, 356, 172, C.sky, "RA trial signal", "In a multicentre double-blind study, aceclofenac 100 mg twice daily improved the Ritchie articular index, morning stiffness, joint swelling, functional class, and pain.", { bodySize: 11.3 });
  addCard(slide, 444, 156, 356, 172, C.pale, "Clinical meaning", "Symptom relief can be meaningful even when the disease mechanism still needs DMARD-based control.", { bodySize: 11.3 });
  addCard(slide, 824, 156, 392, 172, "#FFF6E6", "Place in the conversation", "The NSAID gives practical relief, then the disease-specific plan continues separately.", { bodySize: 11.3 });
  addBullets(slide, 96, 382, 1088, 116, [
    "This evidence belongs to symptomatic control, not disease modification.",
    "Choice still depends on GI, renal, cardiovascular, and bleeding risk.",
    "If the patient needs DMARD escalation, the NSAID does not replace that discussion."
  ], { fontSize: 13.3 });
  addImagePanel(slide, IMG.patient, 884, 516, 328, 98, "Inflammatory arthritis patient visual");
  addNotes(slide, "Keep the rheumatoid arthritis slide clinically honest: symptom control plus separate disease control.");
}

// Slide 10
{
  const slide = presentation.slides.add();
  addChrome(slide, "Axial disease and acute low back pain", "NSAIDs remain first-line symptom therapy in many axial pain settings, but they do not change the underlying disease course.", "Refs: PubMed 26186173; PubMed 12740678; PubMed 36647880", 10);
  addTable(slide, 64, 156, 756, 286, [
    ["Question", "Evidence anchor"],
    ["What do NSAIDs do?", "Improve pain and function in axial spondyloarthritis / inflammatory back pain"],
    ["How large is the effect?", "Guideline-level evidence shows meaningful pain relief and functional benefit in the class"],
    ["What is the limitation?", "NSAIDs do not alter radiographic progression in a dependable way"],
    ["What about acute low back pain?", "Short-term trial data support symptomatic use where appropriate"],
    ["Clinical reminder", "Pain relief is the target; patient risk stratification still drives the choice"],
  ], { columnTracks: [ARTIFACT.fr(0.22), ARTIFACT.fr(0.78)], headerFontSize: 10 });
  addCard(slide, 852, 160, 364, 130, C.sky, "Balanced message", "The science supports symptom relief, but it does not justify disease-modifying language.", { bodySize: 11.6 });
  addCard(slide, 852, 314, 364, 128, C.green, "Practical use", "If the patient needs longer-term control, the disease-specific pathway takes priority over the NSAID alone.", { bodySize: 11.6 });
  addImagePanel(slide, IMG.mechanism, 888, 514, 324, 102, "Axial pain and mechanism visual");
  addNotes(slide, "Ground the discussion in guideline-level pain relief and the limits of NSAIDs in axial disease.");
}

// Slide 11
{
  const slide = presentation.slides.add();
  addChrome(slide, "Safety profile: what the literature keeps reminding us", "The evidence supports benefit, but the safety conversation is where credibility is won.", "Refs: PubMed 34876850; PubMed 33238721; PMC9530112", 11);
  addCard(slide, 64, 160, 356, 184, C.red, "Common", "Dyspepsia, abdominal pain, nausea, constipation, flatulence, gastritis, and dizziness are among the typical reported reactions.", { bodySize: 11.5 });
  addCard(slide, 444, 160, 356, 184, C.amber, "Uncommon / rare", "Rash, pruritus, dermatitis, urticaria, blood urea or creatinine increase, angioedema, and hypersensitivity may occur.", { bodySize: 11.5 });
  addCard(slide, 824, 160, 392, 184, C.pale, "Serious but uncommon", "GI bleeding, ulceration, renal failure, nephrotic syndrome, severe skin reactions, and cardiovascular events require immediate attention.", { bodySize: 11.5 });
  addCard(slide, 108, 384, 1064, 132, C.white, "Safe slide principle", "The honest scientific message is not that the drug is safe in all patients. It is that the prescriber recognises predictable NSAID risks, selects patients well, and monitors actively.", { bodySize: 13.8, center: true });
  addImagePanel(slide, IMG.gi, 888, 516, 326, 98, "NSAID safety and GI risk visual");
  addNotes(slide, "Make safety the equal partner to efficacy. Use the PI frequencies rather than generic class language.");
}

// Slide 12
{
  const slide = presentation.slides.add();
  addChrome(slide, "GI risk and mitigation", "This is the familiar NSAID conversation, and the details matter.", "Refs: PubMed 33238721; PMC9530112", 12, true);
  addBullets(slide, 72, 158, 646, 320, [
    "Ask about ulcer history, prior GI bleeding, H. pylori history, corticosteroids, anticoagulants, antiplatelets, SSRIs, and alcohol use.",
    "Use the lowest effective dose for the shortest effective duration consistent with the label.",
    "Consider gastroprotection in higher-risk patients where local practice supports it.",
    "Escalate melaena, haematemesis, persistent abdominal pain, and unexplained anaemia promptly."
  ], { fontSize: 14.2, fill: C.white });
  addCard(slide, 760, 176, 404, 178, C.sky, "Message to the prescriber", "Risk is modifiable, not invisible. The practical question is who can use an NSAID, under what monitoring, and for how long.", { bodySize: 12 });
  addCard(slide, 760, 372, 404, 116, C.green, "Presentation style", "Avoid vague caution language. Be concrete about triggers, monitoring, and stop rules.", { bodySize: 12 });
  addImagePanel(slide, IMG.gi, 886, 520, 322, 94, "GI protection visual");
  addFooterSlide(slide, "GI precautions stay clinical and actionable.");
  addNotes(slide, "Translate GI risk into concrete actions: screen, protect, monitor, and escalate.");
}

// Slide 13
{
  const slide = presentation.slides.add();
  addChrome(slide, "Renal, cardiovascular, and hepatic cautions", "A good scientific talk shows the rest of the organ systems, not only the stomach.", "Refs: PubMed 33238721; PubMed 34876850", 13);
  addCard(slide, 64, 156, 364, 190, C.pale, "Renal", "Caution is needed in dehydration, CKD, heart failure, diuretic use, ACEi/ARB use, and post-operative states because renal perfusion may fall.", { bodySize: 11.7 });
  addCard(slide, 458, 156, 364, 190, C.sky, "Cardiovascular", "Hypertension, oedema, and heart failure are class concerns; use is cautious in patients with significant CV disease or risk factors.", { bodySize: 11.7 });
  addCard(slide, 852, 156, 364, 190, "#FFF6E6", "Hepatic", "If LFTs persistently worsen, or if liver-disease symptoms appear, stop the drug and reassess.", { bodySize: 11.7 });
  addCard(slide, 104, 392, 1072, 122, C.white, "Clinical guidance", "The right scientific framing is not 'NSAIDs are risky' but 'here is which risk is relevant, how to monitor it, and when to stop'.", { bodySize: 13.8, center: true });
  addImagePanel(slide, IMG.gi, 886, 516, 324, 98, "Organ risk visual");
  addNotes(slide, "Keep the organ-risk slide practical and explicit: renal, hepatic, and cardiovascular concerns should be visible at prescribing time.");
}

// Slide 14
{
  const slide = presentation.slides.add();
  addChrome(slide, "Drug interactions and concomitant therapy checks", "NSAID interactions are often about the full regimen and comorbidity profile.", "Refs: PubMed 33238721; PubMed 34876850", 14);
  addTable(slide, 64, 156, 738, 286, [
    ["Interaction class", "Why it matters"],
    ["Anticoagulants / antiplatelets", "Bleeding risk rises"],
    ["Other NSAIDs / COX-2s", "Duplicate toxicity without added benefit"],
    ["ACEi / ARB + diuretic", "Renal perfusion and AKI concern"],
    ["Lithium / methotrexate", "Potential exposure increase and toxicity"],
    ["Steroids / SSRIs / alcohol", "GI risk may rise further"],
  ], { columnTracks: [ARTIFACT.fr(0.32), ARTIFACT.fr(0.68)], headerFontSize: 10 });
  addCard(slide, 830, 160, 388, 176, C.sky, "What the prescriber needs", "A short medication review before starting an NSAID is a genuine clinical safety step, not a checkbox.", { bodySize: 11.7 });
  addCard(slide, 830, 354, 388, 118, C.green, "Medication review", "Start with the full regimen and the organ systems already under strain.", { bodySize: 11.7 });
  addImagePanel(slide, IMG.mechanism, 892, 522, 320, 92, "Medication review visual");
  addNotes(slide, "Help the audience think beyond the single drug. Encourage medication review, renal caution, and bleeding-risk screening.");
}

// Slide 15
{
  const slide = presentation.slides.add();
  addChrome(slide, "Dosing and administration", "The slide is anchored in the literature and the approved label, not memory.", "Refs: PMC8643213; PMC9530112; PubMed 24639945", 15);
  addCard(slide, 64, 156, 360, 180, C.pale, "Dose principle", "The most studied adult regimen is 100 mg twice daily by mouth; some studies also evaluated once-daily CR 200 mg.", { bodySize: 11.7 });
  addCard(slide, 444, 156, 360, 180, C.sky, "Administration", "Keep timing and food instructions aligned to the formulation used in the local market.", { bodySize: 11.7 });
  addCard(slide, 824, 156, 392, 180, "#FFF6E6", "Adjustments", "Elderly patients need closer adverse-event vigilance, and organ impairment deserves individualised judgment.", { bodySize: 11.7 });
  addCard(slide, 104, 388, 1072, 126, C.white, "Deck message", "The role of the slide is to make dosing practical and compliant, not to invent an off-label universal regimen.", { bodySize: 14, center: true });
  addImagePanel(slide, IMG.patient, 884, 522, 330, 94, "Dosing and patient visual");
  addNotes(slide, "Keep the dosing slide specific to the approved label and state clearly when the local PI must override the general pattern.");
}

// Slide 16
{
  const slide = presentation.slides.add();
  addChrome(slide, "Special populations and risk modifiers", "NSAID risk is not evenly distributed across patients.", "Refs: PubMed 33238721; PubMed 34876850", 16);
  addTable(slide, 64, 160, 714, 280, [
    ["Population", "Practical question"],
    ["Older adults", "Is GI, renal, or blood-pressure risk higher?"],
    ["CKD / dehydration", "Will renal perfusion be affected?"],
    ["Hepatic impairment", "Does local labeling require a lower dose or avoidance?"],
    ["Pregnancy / lactation", "Is the patient in a trimester or lactation state where NSAID use is discouraged?"],
    ["Children / adolescents", "Is use approved at all in the target market?"],
  ], { columnTracks: [ARTIFACT.fr(0.32), ARTIFACT.fr(0.68)], headerFontSize: 10 });
  addCard(slide, 822, 160, 396, 178, C.sky, "Rule of thumb", "When a population is high risk or under-defined, the approved label and individual clinical judgment remain the guide.", { bodySize: 11.7 });
  addCard(slide, 822, 358, 396, 110, C.pale, "Do not overgeneralize", "The adult dosing rule cannot be casually copied into pregnancy, paediatrics, or organ impairment.", { bodySize: 11.7 });
  addImagePanel(slide, IMG.patient, 886, 520, 322, 96, "Special populations visual");
  addNotes(slide, "Reinforce that the approved label must govern special populations.");
}

// Slide 17
{
  const slide = presentation.slides.add();
  addChrome(slide, "Practical patient selection", "A good scientific deck clearly separates the patients who benefit from those who need another strategy.", "Refs: PubMed 26186173; PubMed 31908149; PubMed 34876850", 17, true);
  addCard(slide, 64, 158, 548, 214, C.green, "Reasonable candidates", "Patients with inflammatory pain, osteoarthritis, or short-term musculoskeletal pain who need an NSAID and have an acceptable GI, renal, hepatic, and cardiovascular profile.", { bodySize: 12.1 });
  addCard(slide, 638, 158, 578, 214, C.red, "Be cautious or avoid", "Active ulcer disease, prior GI bleed, significant renal impairment, uncontrolled cardiovascular disease, pregnancy-related risk, and any situation where the approved label advises against use.", { bodySize: 12.1 });
  addCard(slide, 104, 420, 1072, 120, C.white, "Decision rule", "Use the smallest effective exposure for the shortest effective time, and let the approved PI and the patient profile drive the final choice.", { bodySize: 14, center: true });
  addImagePanel(slide, IMG.patient, 890, 522, 318, 94, "Patient selection visual");
  addNotes(slide, "Explain that good patient selection improves symptom control without avoidable class harm.");
}

// Slide 18
{
  const slide = presentation.slides.add();
  addChrome(slide, "Where aceclofenac fits in therapy", "Place-in-therapy slides stay balanced, guideline-aware, and clinically honest.", "Refs: PubMed 5335881; PubMed 26186173; PubMed 36414224", 18);
  addCard(slide, 64, 154, 360, 186, C.sky, "Core role", "Symptomatic relief in inflammatory pain or osteoarthritis where an NSAID is appropriate.", { bodySize: 11.7 });
  addCard(slide, 444, 154, 360, 186, C.pale, "Adjunctive role", "Can sit alongside non-pharmacologic measures and other approved interventions.", { bodySize: 11.7 });
  addCard(slide, 824, 154, 392, 186, "#FFF6E6", "Not the role", "Not a disease-modifying therapy and not a universal option for every pain syndrome.", { bodySize: 11.7 });
  addCard(slide, 104, 384, 1072, 132, C.white, "Balanced framing", "The slide helps the audience decide when aceclofenac is sensible, when another analgesic strategy may be better, and when disease-specific therapy or referral should take priority.", { bodySize: 13.8, center: true });
  addImagePanel(slide, IMG.joint, 888, 520, 324, 96, "Place in therapy visual");
  addNotes(slide, "This slide bridges evidence to practice. Keep it practical: where it fits, where it doesn't, and why non-pharmacologic measures still matter.");
}

// Slide 19
{
  const slide = presentation.slides.add();
  addChrome(slide, "Non-pharmacologic context and combination care", "Medicines are only one part of musculoskeletal care.", "Refs: PubMed 26186173; PubMed 34719940", 19, true);
  addBullets(slide, 72, 158, 640, 306, [
    "Exercise, weight management, physiotherapy, and ergonomic advice remain important where appropriate.",
    "Analgesic therapy works best when combined with lifestyle and mechanical management when indicated.",
    "Medication can help symptoms, but the care plan still addresses the underlying functional problem.",
  ], { fontSize: 14.2, fill: C.white });
  addCard(slide, 760, 174, 404, 186, C.sky, "Why this matters", "The slide prevents the deck from sounding as if medication alone solves OA or axial pain.", { bodySize: 11.7 });
  addCard(slide, 760, 382, 404, 110, C.green, "Takeaway", "A scientific deck reinforces multimodal care and realistic expectations.", { bodySize: 11.7 });
  addImagePanel(slide, IMG.patient, 886, 520, 322, 94, "Multimodal care visual");
  addNotes(slide, "Connect the medication to the broader care plan: movement, support, weight, and function.");
}

// Slide 20
{
  const slide = presentation.slides.add();
  addChrome(slide, "Counselling points for clinical discussion", "These are the practical messages a clinician can use when deciding whether to use an NSAID.", "Refs: PubMed 34876850; PubMed 33238721", 20);
  addCard(slide, 64, 160, 500, 184, C.pale, "Discuss benefit", "Expected symptom relief, function goals, and time-limited use.", { bodySize: 12.2 });
  addCard(slide, 606, 160, 610, 184, C.sky, "Discuss risk", "GI, renal, cardiovascular, and hepatic warning signs plus concomitant therapy checks.", { bodySize: 12.2 });
  addCard(slide, 104, 390, 1072, 124, C.white, "Counselling style", "The clinician leaves with a quick, repeatable safety script that supports the patient without overpromising the drug.", { bodySize: 14, center: true });
  addImagePanel(slide, IMG.gi, 888, 520, 322, 94, "Counselling and GI risk visual");
  addNotes(slide, "Explain that the deck is intended to support what the clinician says to the patient, especially around benefit expectations and warning signs.");
}

// Slide 21
{
  const slide = presentation.slides.add();
  addChrome(slide, "Frequently asked clinical questions", "A good deck anticipates the questions that usually come up in discussion.", "Refs: PubMed 8853164; PubMed 34876850; PubMed 31908149", 21);
  addTable(slide, 64, 156, 1152, 304, [
    ["Question", "Controlled answer"],
    ["Q1. Is aceclofenac just another NSAID?", "It is an NSAID with a defined chemical identity, PK profile, and a body of OA / inflammatory-arthritis evidence."],
    ["Q2. Can it replace all pain therapies?", "No. It fits only where NSAID therapy is appropriate and risk is acceptable."],
    ["Q3. Is it safe in every patient?", "No. GI, renal, cardiovascular, hepatic, pregnancy, and interaction risks still matter."],
    ["Q4. What should I verify first?", "The evidence base, special-population limits, concomitant medicines, and the patient’s risk profile."],
  ], { columnTracks: [ARTIFACT.fr(0.29), ARTIFACT.fr(0.71)], headerFontSize: 10 });
  addFooterSlide(slide, "FAQ slides are useful only when they stay aligned to label and safety evidence.");
  addImagePanel(slide, IMG.mechanism, 888, 520, 322, 94, "FAQ evidence visual");
  addNotes(slide, "Use short, controlled answers and bring the audience back to source control.");
}

// Slide 22
{
  const slide = presentation.slides.add();
  addChrome(slide, "Balanced claims: what not to say", "A scientific deck stays honest about what the evidence can and cannot support.", "Refs: PubMed 5335881; PubMed 8853164; PubMed 34876850", 22);
  addCard(slide, 64, 160, 356, 180, C.red, "Avoid", "Completely safe or no side effects.", { bodySize: 12.4, center: true, titleColor: C.navy });
  addCard(slide, 462, 160, 356, 180, C.red, "Avoid", "Best in class unless the evidence and approval support it.", { bodySize: 12.4, center: true, titleColor: C.navy });
  addCard(slide, 860, 160, 356, 180, C.red, "Avoid", "Unsupported superiority or interchangeability claims.", { bodySize: 12.4, center: true, titleColor: C.navy });
  addCard(slide, 104, 386, 1072, 122, C.white, "Preferred language", "Use disciplined wording such as 'symptom-focused NSAID option where appropriate' and 'the evidence and label determine final use'.", { bodySize: 14, center: true });
  addImagePanel(slide, IMG.gi, 886, 522, 322, 94, "Balanced claims visual");
  addNotes(slide, "This is a deliberate control slide. Replace promotional language with evidence-based wording.");
}

// Slide 23
{
  const slide = presentation.slides.add();
  addChrome(slide, "Selected references", "The source base is visible so the deck stays auditable.", "¹²³⁴⁵⁶", 23);
  addTable(slide, 64, 156, 1152, 356, [
    ["#", "Vancouver-style reference", "Use in deck"],
    ["1", "Iolascon G, Giménez S, Mogyorósi D. A Review of Aceclofenac: Analgesic and Anti-Inflammatory Effects on Musculoskeletal Disorders. J Pain Res. 2021;14:3651-3663.", "Mechanism, efficacy, tolerability"],
    ["2", "Dooley M, Spencer CM, Dunn CJ. Aceclofenac: a reappraisal of its use in the management of pain and rheumatic disease. Drugs. 2001;61(9):1351-1378.", "Review and place in therapy"],
    ["3", "Hunter JA, Parnham MJ, Balaguer XG. Aceclofenac in rheumatoid arthritis: a useful and novel anti-inflammatory. Clin Rheumatol. 1996;15(4):329-334.", "Inflammatory arthritis symptom relief"],
    ["4", "Yang JH, Suk KS, Lee BH, et al. Efficacy and Safety of Different Aceclofenac Treatments for Chronic Lower Back Pain. Yonsei Med J. 2017;58(3):637-643.", "Short-term efficacy and tolerability"],
    ["5", "Legrand E. Aceclofenac in the management of inflammatory pain. Expert Opin Pharmacother. 2004;5(6):1347-1357.", "Balanced pain and inflammatory framing"],
    ["6", "Martín-Mola E, Gijón-Baños J, Ansoleaga JJ. Aceclofenac in comparison to ketoprofen in the treatment of rheumatoid arthritis. Rheumatol Int. 1995;15(3):111-116.", "Comparator evidence in RA"],
  ], { columnTracks: [ARTIFACT.fr(0.06), ARTIFACT.fr(0.68), ARTIFACT.fr(0.26)], headerFontSize: 9.6 });
  addCard(slide, 104, 530, 1072, 62, C.white, "Reference discipline", "All visible claims are traceable to the numbered source set used across the deck.", { bodySize: 12.6, center: true });
  addImagePanel(slide, IMG.mechanism, 886, 522, 322, 96, "Reference visual");
  addNotes(slide, "Show the audience that the deck is grounded in the PI, review, meta-analysis, RCTs, and PK work.");
}

// Slide 24
{
  const slide = presentation.slides.add();
  addChrome(slide, "Evidence update checks", "A scientific deck has revision discipline, not just a final page.", "¹²³", 24);
  addCard(slide, 64, 156, 358, 184, C.sky, "Safety change", "New warnings, precautions, adverse reactions, or administration changes can alter the story quickly.", { bodySize: 11.7 });
  addCard(slide, 461, 156, 358, 184, C.pale, "Efficacy change", "New evidence that materially changes efficacy interpretation or place in therapy deserves a refresh.", { bodySize: 11.7 });
  addCard(slide, 858, 156, 358, 184, "#FFF6E6", "Label change", "A new local label update or product-information change should trigger version control.", { bodySize: 11.7 });
  addCard(slide, 104, 384, 1072, 122, C.white, "Deck rule", "Refresh the deck when the evidence base changes enough to matter to the audience.", { bodySize: 14, center: true });
  addImagePanel(slide, IMG.gi, 886, 522, 322, 94, "Evidence update visual");
  addNotes(slide, "Tell the audience that the deck will be revised when the label or the evidence base changes materially.");
}

// Slide 25
{
  const slide = presentation.slides.add();
  slide.background.fill = solid(C.navy);
  slide.shapes.add({
    geometry: "rect",
    position: { left: 0, top: 0, width: 1280, height: 720 },
    fill: solid(C.navy),
    line: outline(C.navy, 0),
  });
  slide.shapes.add({
    geometry: "rect",
    position: { left: 0, top: 0, width: 1280, height: 110 },
    fill: solid(C.navy2),
    line: outline(C.navy2, 0),
  });
  textBox(slide, {
    left: 72, top: 146, width: 760, height: 56,
    text: "Aceclofenac: the practical NSAID story", fill: C.navy, line: C.navy, fontSize: 28, color: C.white, bold: true,
  });
  textBox(slide, {
    left: 72, top: 210, width: 560, height: 28,
    text: "Key takeaways", fill: C.navy, line: C.navy, fontSize: 16, color: "#E8F2F1", bold: true,
  });
  addBullets(slide, 72, 252, 760, 236, [
    "Aceclofenac is best presented as a balanced NSAID option for symptom relief where label use allows.",
    "Efficacy slides stay tied to pain and function, not disease-modifying claims.",
    "Safety must stay visible: GI, renal, cardiovascular, and hepatic cautions belong in the main deck.",
    "The evidence base controls final dosing and special-population wording.",
    "Refresh the deck when the source evidence changes materially."
  ], { fontSize: 13.6, fill: C.navy, color: C.white, line: C.navy });
  addCard(slide, 916, 156, 252, 138, "#173D56", "Deck status", "Demonstration only", { titleColor: C.white, bodyColor: "#EAF2F6", bodySize: 11.4, line: "#2B5A76" });
  addCard(slide, 916, 320, 252, 138, "#0F3146", "Next step", "Adapt to the audience", { titleColor: C.white, bodyColor: "#EAF2F6", bodySize: 11.4, line: "#2B5A76" });
  addImagePanel(slide, IMG.patient, 886, 520, 322, 94, "Closing visual");
  textBox(slide, {
    left: 72, top: 634, width: 260, height: 24,
    text: "ClinCommand OS", fill: C.navy, line: C.navy, fontSize: 14, color: C.white, bold: true,
  });
  textBox(slide, {
    left: 1084, top: 634, width: 120, height: 24,
    text: "thank you", fill: C.navy, line: C.navy, fontSize: 16, color: C.white, bold: true, align: "right",
  });
  slide.speakerNotes.text = "Close by summarizing the central message: aceclofenac is a symptom-focused NSAID option, but it must always be discussed with class risk and local label control.";
}

await fs.mkdir(OUT_DIR, { recursive: true });
const pptxBlob = await ARTIFACT.PresentationFile.exportPptx(presentation);
await pptxBlob.save(OUT_PPTX);

const previewBlob = await presentation.export({ format: "png", montage: true, scale: 0.28 });
await fs.writeFile(OUT_PREVIEW, Buffer.from(await previewBlob.arrayBuffer()));

console.log(JSON.stringify({
  output: OUT_PPTX,
  preview: OUT_PREVIEW,
  slideCount: presentation.slides.count,
  inspection: null,
}, null, 2));
