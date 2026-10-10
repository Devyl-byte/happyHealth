import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { Presentation, PresentationFile } from "@oai/artifact-tool";

const workspaceDir = process.cwd();
const SKILL_DIR = process.env.CODEX_PRESENTATIONS_SKILL_DIR;
const pythonExecutable = process.env.CODEX_RUNTIME_PYTHON;
if (!SKILL_DIR || !pythonExecutable) {
  throw new Error("Set CODEX_PRESENTATIONS_SKILL_DIR and CODEX_RUNTIME_PYTHON before generating decks.");
}
const buildDir = path.join(workspaceDir, ".codex-build", "presentations");
const outputDir = path.join(workspaceDir, "submission", "TEAM_NAME_COLLEGE_NAME");
const previewDir = path.join(buildDir, "previews");
const FONT = "Aptos";
const SIZE = { width: 1280, height: 720 };
const EMU = "12192000,6858000";

const C = {
  ink: "#0B2821",
  dark: "#071816",
  green: "#0B8E69",
  mint: "#DDF5EC",
  paper: "#F3F8F6",
  white: "#FFFFFF",
  muted: "#607A72",
  line: "#CFE0DA",
  amber: "#F1B868",
  amberSoft: "#FFF1D9",
  coral: "#E87868",
};

async function writeBlob(filePath, blob) {
  await fs.writeFile(filePath, new Uint8Array(await blob.arrayBuffer()));
}

function addText(slide, text, position, style = {}) {
  const box = slide.shapes.add({
    geometry: "textbox",
    position,
    fill: "none",
    line: { style: "solid", fill: "none", width: 0 },
  });
  box.text = text;
  box.text.style = {
    fontFamily: FONT,
    fontSize: style.fontSize ?? 20,
    color: style.color ?? C.ink,
    bold: style.bold ?? false,
    alignment: style.alignment ?? "left",
    verticalAlignment: style.verticalAlignment ?? "middle",
    wrap: true,
  };
  return box;
}

function addBox(slide, text, position, options = {}) {
  const box = slide.shapes.add({
    geometry: options.geometry ?? "roundRect",
    position,
    fill: options.fill ?? C.white,
    line: { style: "solid", fill: options.line ?? C.line, width: options.lineWidth ?? 1.2 },
    borderRadius: options.radius ?? "rounded-xl",
  });
  if (text) {
    box.text = text;
    box.text.style = {
      fontFamily: FONT,
      fontSize: options.fontSize ?? 19,
      color: options.color ?? C.ink,
      bold: options.bold ?? true,
      alignment: options.alignment ?? "center",
      verticalAlignment: "middle",
      wrap: true,
    };
  }
  return box;
}

function addRule(slide, left, top, width, color = C.line, height = 2) {
  return slide.shapes.add({
    geometry: "rect",
    position: { left, top, width, height },
    fill: color,
    line: { style: "solid", fill: color, width: 0 },
  });
}

function baseSlide(presentation, title, number) {
  const slide = presentation.slides.add();
  slide.background.fill = C.paper;
  addText(slide, title, { left: 70, top: 42, width: 1050, height: 58 },
    { fontSize: 32, bold: true, color: C.ink });
  addRule(slide, 70, 112, 1140, C.line, 2);
  addText(slide, String(number).padStart(2, "0"),
    { left: 1160, top: 46, width: 50, height: 34 },
    { fontSize: 13, bold: true, color: C.muted, alignment: "right" });
  return slide;
}

function addCover(presentation) {
  const slide = presentation.slides.add();
  slide.background.fill = C.dark;
  addText(slide, "HAPPYHEALTH CHALLENGE PROTOTYPE",
    { left: 84, top: 76, width: 520, height: 30 },
    { fontSize: 14, bold: true, color: "#66D7B2" });
  addText(slide, "Virtual Patient\nModel",
    { left: 84, top: 162, width: 660, height: 190 },
    { fontSize: 58, bold: true, color: C.white });
  addRule(slide, 84, 382, 160, C.green, 8);
  addText(slide,
    "Synthetic EHR and simulated CGM combined to forecast a post-meal glucose spike two hours in advance",
    { left: 84, top: 422, width: 650, height: 110 },
    { fontSize: 23, color: "#C5D9D3" });
  addText(slide, "Research prototype - No real patient data",
    { left: 84, top: 625, width: 520, height: 32 },
    { fontSize: 15, color: "#8BA79F" });
  addText(slide, "0.36",
    { left: 875, top: 180, width: 250, height: 115 },
    { fontSize: 72, bold: true, color: C.amber, alignment: "center" });
  addText(slide, "demo model score",
    { left: 850, top: 294, width: 300, height: 42 },
    { fontSize: 18, color: C.white, alignment: "center" });
  addText(slide, "Calculated by the trained model from the canonical synthetic patient",
    { left: 850, top: 360, width: 300, height: 80 },
    { fontSize: 16, color: "#A8C0B8", alignment: "center" });
}

function addProblemSlide(presentation) {
  const slide = baseSlide(presentation, "The clinical problem", 2);
  addText(slide, "A health record explains the person.\nA wearable explains the moment.",
    { left: 72, top: 155, width: 540, height: 180 },
    { fontSize: 38, bold: true });
  addText(slide,
    "A useful virtual patient needs both. Static context changes slowly, while glucose can change within minutes after a meal.",
    { left: 72, top: 365, width: 520, height: 110 },
    { fontSize: 21, color: C.muted });
  addRule(slide, 655, 166, 2, 410, C.line, 2);
  addText(slide, "STATIC / HISTORICAL",
    { left: 710, top: 160, width: 430, height: 36 },
    { fontSize: 14, bold: true, color: C.green });
  addText(slide, "Age, sex, BMI, diabetes duration, HbA1c, fasting glucose, diagnoses and medication",
    { left: 710, top: 210, width: 440, height: 125 },
    { fontSize: 24, bold: true });
  addText(slide, "DYNAMIC / ACCELERATED SIMULATION",
    { left: 710, top: 390, width: 430, height: 36 },
    { fontSize: 14, bold: true, color: C.green });
  addText(slide, "CGM observations arrive every 15 virtual minutes through the simulated wearable stream",
    { left: 710, top: 440, width: 440, height: 115 },
    { fontSize: 24, bold: true });
  addText(slide, "Prototype focus: type 2 diabetes",
    { left: 72, top: 622, width: 420, height: 28 },
    { fontSize: 14, color: C.muted });
}

function addUseCaseSlide(presentation) {
  const slide = baseSlide(presentation, "Two-hour glucose event forecast", 3);
  addText(slide, "120",
    { left: 80, top: 150, width: 300, height: 140 },
    { fontSize: 88, bold: true, color: C.green });
  addText(slide, "minutes ahead",
    { left: 92, top: 285, width: 290, height: 42 },
    { fontSize: 23, bold: true });
  addText(slide, "Adverse event definition",
    { left: 80, top: 380, width: 330, height: 38 },
    { fontSize: 16, bold: true, color: C.muted });
  addText(slide, "Within 120 minutes, glucose reaches at least 180 mg/dL or rises by at least 40 mg/dL from the meal-time baseline",
    { left: 80, top: 425, width: 390, height: 145 },
    { fontSize: 23, bold: true });
  addRule(slide, 530, 160, 2, 415, C.line, 2);
  const steps = [
    ["01", "Observe", "Read the synthetic patient record and recent CGM history."],
    ["02", "Forecast", "Return an uncalibrated model score and model factors."],
    ["03", "Review", "Let the doctor inspect the timeline and refresh the estimate."],
  ];
  steps.forEach(([n, heading, body], index) => {
    const y = 155 + index * 150;
    addText(slide, n, { left: 585, top: y, width: 55, height: 40 },
      { fontSize: 15, bold: true, color: C.green });
    addText(slide, heading, { left: 660, top: y - 4, width: 250, height: 42 },
      { fontSize: 25, bold: true });
    addText(slide, body, { left: 660, top: y + 40, width: 465, height: 65 },
      { fontSize: 18, color: C.muted });
  });
  addText(slide, "A research estimate supports discussion. It does not prescribe treatment.",
    { left: 585, top: 615, width: 585, height: 34 },
    { fontSize: 15, bold: true, color: C.coral });
}

function architectureElements(slide, top = 150) {
  const ehr = addBox(slide, "Synthetic EHR\nJSON fixture",
    { left: 65, top, width: 205, height: 100 }, { fill: C.mint, line: C.green });
  const cgm = addBox(slide, "Simulated CGM\nPython publisher",
    { left: 65, top: top + 210, width: 205, height: 100 }, { fill: C.amberSoft, line: C.amber });
  const mqtt = addBox(slide, "MQTT broker",
    { left: 325, top: top + 210, width: 170, height: 100 }, { fill: C.white });
  const spring = addBox(slide, "Spring Boot\nDigital twin",
    { left: 540, top: top + 85, width: 220, height: 145 },
    { fill: C.dark, line: C.dark, color: C.white, fontSize: 22 });
  const h2 = addBox(slide, "H2 state\nprofile + timeline",
    { left: 565, top: top + 285, width: 170, height: 90 }, { fill: C.white, fontSize: 17 });
  const ml = addBox(slide, "FastAPI\n43-feature model",
    { left: 820, top: top + 25, width: 205, height: 115 }, { fill: C.mint, line: C.green });
  const ui = addBox(slide, "React dashboard\nDoctor view",
    { left: 1045, top: top + 190, width: 175, height: 120 }, { fill: C.white, line: C.green });

  const connect = (from, to) => slide.shapes.connect(to, from, {
    routing: "orthogonal",
    line: { style: "solid", fill: C.green, width: 2.5 },
    head: { type: "arrow", width: "med", length: "med" },
  });
  connect(ehr, spring);
  connect(cgm, mqtt);
  connect(mqtt, spring);
  connect(spring, ml);
  connect(ml, spring);
  connect(spring, h2);
  connect(spring, ui);
  return { ehr, cgm, mqtt, spring, h2, ml, ui };
}

function addArchitectureSlide(presentation, number = 4, standalone = false) {
  const slide = baseSlide(presentation,
    standalone ? "Virtual patient system architecture" : "Static and dynamic data fusion", number);
  architectureElements(slide, 150);
  addText(slide,
    "The browser calls Spring Boot only. The model service and MQTT broker stay behind the application boundary.",
    { left: 120, top: 610, width: 1040, height: 38 },
    { fontSize: 16, color: C.muted, alignment: "center" });
}

function addModelSlide(presentation) {
  const slide = baseSlide(presentation, "Model inputs and prediction path", 5);
  addText(slide, "43",
    { left: 70, top: 145, width: 230, height: 120 },
    { fontSize: 82, bold: true, color: C.green });
  addText(slide, "numeric input features",
    { left: 78, top: 260, width: 300, height: 40 },
    { fontSize: 22, bold: true });
  addText(slide,
    "Recent glucose lags and changes carry the short-term signal. Static patient values add clinical context.",
    { left: 78, top: 330, width: 350, height: 130 },
    { fontSize: 21, color: C.muted });

  const groups = [
    ["CGM history", "Current value, 15/30/60/120-minute lags, variation and range"],
    ["Meal + time", "Meal text signals, time of day and minutes since the previous meal"],
    ["Patient context", "Age, sex, BMI, diabetes duration, HbA1c and fasting glucose"],
    ["Medication context", "Recorded insulin and non-insulin medication event flags"],
  ];
  groups.forEach(([heading, body], index) => {
    const y = 145 + index * 112;
    addText(slide, heading, { left: 500, top: y, width: 235, height: 36 },
      { fontSize: 20, bold: true, color: index === 0 ? C.green : C.ink });
    addText(slide, body, { left: 735, top: y, width: 430, height: 70 },
      { fontSize: 17, color: C.muted });
    if (index < groups.length - 1) addRule(slide, 500, y + 91, 665, C.line, 1);
  });
  addText(slide, "Pipeline: median imputation - missingness indicators - standard scaling - Logistic Regression",
    { left: 500, top: 614, width: 665, height: 34 },
    { fontSize: 14, bold: true, color: C.green });
}

function addEvaluationSlide(presentation) {
  const slide = baseSlide(presentation, "Patient-level evaluation", 6);
  addText(slide,
    "Each patient belongs to one split only, which reduces leakage between training and evaluation.",
    { left: 70, top: 135, width: 610, height: 70 },
    { fontSize: 20, color: C.muted });
  slide.charts.add("bar", {
    position: { left: 80, top: 225, width: 700, height: 360 },
    categories: ["Validation", "Test"],
    series: [
      { name: "Logistic ROC AUC", values: [0.701, 0.757], fill: C.green },
      { name: "Logistic F1", values: [0.779, 0.742], fill: C.amber },
      { name: "Dummy F1", values: [0.824, 0.757], fill: C.coral },
    ],
    hasLegend: true,
    legend: { position: "bottom" },
    dataLabels: { showValue: true, position: "outEnd", numberFormatCode: "0.000" },
    yAxis: { min: 0, max: 1, majorUnit: 0.2, numberFormatCode: "0.0",
      majorGridlines: { style: "solid", fill: C.line, width: 1 } },
  });
  addText(slide, "0.757",
    { left: 875, top: 200, width: 255, height: 95 },
    { fontSize: 64, bold: true, color: C.green, alignment: "center" });
  addText(slide, "test ROC AUC",
    { left: 875, top: 292, width: 255, height: 36 },
    { fontSize: 18, bold: true, alignment: "center" });
  addRule(slide, 900, 365, 205, C.line, 2);
  addText(slide,
    "Test F1 is 0.742 versus 0.757 for an always-positive dummy. ROC AUC shows ranking signal, but the result does not establish calibration, clinical safety or patient benefit.",
    { left: 855, top: 395, width: 295, height: 130 },
    { fontSize: 18, color: C.muted, alignment: "center" });
  addText(slide, "Source: reproducible baseline evaluation in this repository",
    { left: 70, top: 632, width: 620, height: 25 },
    { fontSize: 12, color: C.muted });
}

function addDashboardSlide(presentation) {
  const slide = baseSlide(presentation, "Doctor dashboard", 7);
  const frame = addBox(slide, "", { left: 70, top: 140, width: 780, height: 470 },
    { fill: C.white, line: C.line, radius: "rounded-xl" });
  addText(slide, "Virtual Patient Monitor",
    { left: 105, top: 165, width: 420, height: 45 },
    { fontSize: 26, bold: true });
  addText(slide, "SYNTHETIC DEMONSTRATION PATIENT",
    { left: 105, top: 224, width: 440, height: 28 },
    { fontSize: 12, bold: true, color: C.green });
  addRule(slide, 105, 270, 710, C.line, 1);
  addText(slide, "142",
    { left: 112, top: 300, width: 150, height: 80 },
    { fontSize: 52, bold: true });
  addText(slide, "mg/dL current glucose",
    { left: 112, top: 378, width: 220, height: 32 },
    { fontSize: 15, color: C.muted });
  addText(slide, "0.36",
    { left: 590, top: 300, width: 170, height: 80 },
    { fontSize: 52, bold: true, color: C.amber, alignment: "center" });
  addText(slide, "uncalibrated model score",
    { left: 565, top: 378, width: 220, height: 32 },
    { fontSize: 15, bold: true, alignment: "center" });
  addText(slide, "CGM timeline",
    { left: 112, top: 455, width: 180, height: 30 },
    { fontSize: 15, bold: true, color: C.muted });
  const chartLeft = 130;
  const chartTop = 515;
  const values = [112,114,116,118,121,126,131,136,142];
  for (let i = 0; i < values.length; i++) {
    const x = chartLeft + i * 70;
    const y = chartTop + 50 - (values[i] - 110) * 1.25;
    slide.shapes.add({
      geometry: "ellipse",
      position: { left: x, top: y, width: 12, height: 12 },
      fill: C.green,
      line: { style: "solid", fill: C.green, width: 0 },
    });
  }
  addText(slide, "The working React screen shows the same values through the live Spring Boot API.",
    { left: 910, top: 165, width: 290, height: 90 },
    { fontSize: 24, bold: true });
  const notes = [
    "The score caveat is written explicitly and does not rely on colour.",
    "Model factors describe influence, not clinical cause.",
    "Unavailable services never produce a fake score.",
    "The synthetic and research-only labels stay visible.",
  ];
  notes.forEach((text, index) => {
    addText(slide, String(index + 1).padStart(2, "0"),
      { left: 910, top: 305 + index * 72, width: 35, height: 32 },
      { fontSize: 13, bold: true, color: C.green });
    addText(slide, text,
      { left: 960, top: 296 + index * 72, width: 230, height: 58 },
      { fontSize: 16, color: C.muted });
  });
}

function addSafetySlide(presentation) {
  const slide = baseSlide(presentation, "Privacy, safety and responsible scope", 8);
  addText(slide, "PUBLIC DEMO",
    { left: 75, top: 155, width: 300, height: 35 },
    { fontSize: 14, bold: true, color: C.green });
  addText(slide, "One fully synthetic patient",
    { left: 75, top: 205, width: 470, height: 65 },
    { fontSize: 34, bold: true });
  addText(slide,
    "The repository includes a generated profile and simulated CGM. It contains no identifiable patient record.",
    { left: 75, top: 285, width: 470, height: 120 },
    { fontSize: 21, color: C.muted });
  addRule(slide, 620, 155, 2, 420, C.line, 2);
  addText(slide, "RESEARCH TRAINING DATA",
    { left: 675, top: 155, width: 390, height: 35 },
    { fontSize: 14, bold: true, color: C.green });
  addText(slide, "Raw patient-level files stay outside Git",
    { left: 675, top: 205, width: 480, height: 85 },
    { fontSize: 34, bold: true });
  addText(slide,
    "The committed artifact contains only fitted coefficients and aggregate metadata. Source data terms remain separate from the MIT code licence.",
    { left: 675, top: 305, width: 480, height: 125 },
    { fontSize: 21, color: C.muted });
  addText(slide,
    "Not clinically validated - Not for diagnosis, treatment, dosing or emergency decisions",
    { left: 125, top: 600, width: 1030, height: 42 },
    { fontSize: 19, bold: true, color: C.coral, alignment: "center" });
}

function addDemoSlide(presentation) {
  const slide = baseSlide(presentation, "Demonstration and submission readiness", 9);
  addText(slide, "RUN THE PROTOTYPE",
    { left: 75, top: 150, width: 360, height: 35 },
    { fontSize: 14, bold: true, color: C.green });
  const demoSteps = [
    ["1", "Start Docker Compose"],
    ["2", "Open localhost:3000"],
    ["3", "Refresh the prediction"],
    ["4", "Watch simulated CGM update the twin"],
  ];
  demoSteps.forEach(([n, text], index) => {
    addText(slide, n, { left: 80, top: 210 + index * 82, width: 50, height: 48 },
      { fontSize: 28, bold: true, color: C.green, alignment: "center" });
    addText(slide, text, { left: 155, top: 210 + index * 82, width: 400, height: 48 },
      { fontSize: 23, bold: true });
  });
  addRule(slide, 620, 155, 2, 420, C.line, 2);
  addText(slide, "REMAINING TEAM ACTIONS",
    { left: 675, top: 150, width: 390, height: 35 },
    { fontSize: 14, bold: true, color: C.coral });
  const remaining = [
    "Add the official team and college details",
    "Record and link the 20-minute demo video",
    "Complete the clinical language review",
    "Run the full Docker stack from a clean computer",
  ];
  remaining.forEach((text, index) => {
    addText(slide, "OPEN", { left: 675, top: 214 + index * 80, width: 50, height: 35 },
      { fontSize: 10, bold: true, color: C.coral });
    addText(slide, text, { left: 745, top: 208 + index * 80, width: 410, height: 58 },
      { fontSize: 21, color: C.ink });
  });
  addText(slide, "Component tests pass. Team identity, clinical sign-off, video and clean-computer Docker verification remain.",
    { left: 75, top: 615, width: 1080, height: 35 },
    { fontSize: 16, bold: true, color: C.green, alignment: "center" });
}

async function finalizeDeck(presentation, name, requirements) {
  const { finalizePresentation } = await import(pathToFileURL(
    path.join(SKILL_DIR, "container_tools", "artifact_tool_utils.mjs")
  ).href);
  const stagingDir = path.join(buildDir, `finalize-${name}`);
  await fs.mkdir(stagingDir, { recursive: true });
  await fs.mkdir(outputDir, { recursive: true });
  const candidatePath = path.join(stagingDir, `${name}-candidate.pptx`);
  const finalPath = path.join(outputDir, `${name}.pptx`);
  await (await PresentationFile.exportPptx(presentation)).save(candidatePath);
  await finalizePresentation({
    ...requirements,
    workspaceDir,
    candidatePath,
    finalPath,
    pythonExecutable,
    integrityValidatorPath: path.join(SKILL_DIR, "container_tools", "inspect_presentation_package_integrity.py"),
    layoutValidatorPath: path.join(SKILL_DIR, "container_tools", "inspect_presentation_layout_geometry.py"),
    layoutArgs: ["--expected-slide-size-emu", EMU, "--validate-heading-fit"],
    fontPolicy: { basis: "design", families: [FONT] },
    expectedSlideSizeEmu: EMU,
    verifyArtifactToolImport: true,
    receiptPath: path.join(stagingDir, `${name}.validation.json`),
  });
  return finalPath;
}

async function renderDeck(presentation, prefix) {
  const folder = path.join(previewDir, prefix);
  await fs.mkdir(folder, { recursive: true });
  for (const [index, slide] of presentation.slides.items.entries()) {
    const fileName = `slide-${String(index + 1).padStart(2, "0")}.png`;
    await writeBlob(path.join(folder, fileName),
      await presentation.export({ slide, format: "png", scale: 1 }));
  }
  await writeBlob(path.join(folder, "montage.webp"),
    await presentation.export({ format: "webp", montage: true }));
}

async function main() {
  await fs.mkdir(buildDir, { recursive: true });
  const deck = Presentation.create({ slideSize: SIZE });
  addCover(deck);
  addProblemSlide(deck);
  addUseCaseSlide(deck);
  addArchitectureSlide(deck);
  addModelSlide(deck);
  addEvaluationSlide(deck);
  addDashboardSlide(deck);
  addSafetySlide(deck);
  addDemoSlide(deck);

  const architecture = Presentation.create({ slideSize: SIZE });
  addArchitectureSlide(architecture, 1, true);

  await renderDeck(deck, "project-presentation");
  await renderDeck(architecture, "architecture");

  await finalizeDeck(deck, "happyhealth_virtual_patient_presentation_v7", {
    explicitTotalSlideCount: 9,
    requiredNativeTableOwnerSlides: [],
    requiredNativeChartOwnerSlides: [6],
    materializeLiteralChartWorkbooks: true,
  });
  await finalizeDeck(architecture, "happyhealth_architecture_diagram_v7", {
    explicitTotalSlideCount: 1,
    requiredNativeTableOwnerSlides: [],
    requiredNativeChartOwnerSlides: [],
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
