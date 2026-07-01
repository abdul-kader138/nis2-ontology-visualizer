const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const OUT_FILE = path.join(__dirname, 'NIS2_Thesis_Presentation_Abdul_Kader.pdf');
const ASSET_DIR = path.join(__dirname, 'generated_assets');
const W = 1280;
const H = 720;
const M = 54;

const C = {
  bg: '#FFFFFF',
  navy: '#0F2747',
  blue: '#1E86D8',
  green: '#1F8A70',
  amber: '#C98A14',
  red: '#B94A48',
  text: '#1A2433',
  muted: '#5D6775',
  line: '#D7DCE3',
  footer: '#0E3A63',
  soft: '#F7F9FC',
};

function docFactory() {
  const doc = new PDFDocument({
    size: [W, H],
    margin: 0,
    info: {
      Title: 'An OWL-Based Ontology for NIS2 Article 21 Compliance',
      Author: 'Abdul Kader',
      Subject: 'Thesis presentation',
    },
  });
  const stream = fs.createWriteStream(OUT_FILE);
  doc.pipe(stream);
  return { doc, stream };
}

function asset(name) {
  return path.join(ASSET_DIR, name);
}

function background(doc) {
  doc.rect(0, 0, W, H).fill(C.bg);
  doc.save();
  doc.rect(0, H - 22, W, 22).fill(C.footer);
  doc.restore();
}

function footer(doc, idx, total) {
  doc.font('Helvetica').fontSize(10).fillColor('#FFFFFF');
  doc.text('Abdul Kader | NIS2 Article 21 compliance framework', M, H - 16, { width: 900 });
  doc.text(String(idx), W - M - 14, H - 16, { width: 14, align: 'right' });
}

function slideHeader(doc, title, subtitle = '') {
  doc.font('Helvetica-Bold').fontSize(12).fillColor(C.blue).text('MASTER\'S THESIS PRESENTATION', M, 28);
  doc.font('Helvetica-Bold').fontSize(26).fillColor(C.text).text(title, M, 56);
  if (subtitle) {
    doc.font('Helvetica').fontSize(11).fillColor(C.muted).text(subtitle, M, 92);
  }
  doc.save();
  doc.moveTo(M, 120).lineTo(W - M, 120).lineWidth(1).strokeColor(C.line).stroke();
  doc.restore();
}

function paragraph(doc, text, x, y, w, size = 13, color = C.text) {
  doc.font('Helvetica').fontSize(size).fillColor(color).text(text, x, y, {
    width: w,
    lineGap: 4,
  });
}

function bullets(doc, items, x, y, w, size = 13, gap = 12) {
  let cy = y;
  for (const item of items) {
    doc.font('Helvetica').fontSize(size).fillColor(C.text).text('•', x, cy);
    doc.font('Helvetica').fontSize(size).fillColor(C.text).text(item, x + 18, cy, {
      width: w - 18,
      lineGap: 4,
    });
    cy += doc.heightOfString(item, { width: w - 18, lineGap: 4 }) + gap;
  }
}

function imageBox(doc, imagePath, x, y, w, h, caption = '') {
  doc.save();
  doc.rect(x, y, w, h).fill('#FFFFFF').stroke(C.line);
  if (fs.existsSync(imagePath)) {
    doc.image(imagePath, x + 6, y + 6, { fit: [w - 12, h - 28], align: 'center', valign: 'center' });
  } else {
    doc.font('Helvetica').fontSize(12).fillColor(C.red).text('Missing image', x + 20, y + 20);
  }
  if (caption) {
    doc.font('Helvetica').fontSize(11).fillColor(C.muted).text(caption, x + 8, y + h - 18, {
      width: w - 16,
      align: 'center',
    });
  }
  doc.restore();
}

function titleSlide(doc) {
  background(doc);
  doc.font('Helvetica-Bold').fontSize(34).fillColor(C.text).text(
    'An OWL-Based Ontology for\nNIS2 Article 21 Compliance',
    M,
    160,
    { width: 520, lineGap: 8 }
  );
  paragraph(
    doc,
    'Automated validation and reasoning for cybersecurity risk-management measures.',
    M,
    300,
    500,
    16,
    C.muted
  );
  bullets(
    doc,
    [
      'Candidate: Abdul Kader',
      'Supervisor: Prof. Enrico Francesconi',
      'Focus: problem, approach, outcome, and limits',
    ],
    M,
    365,
    520,
    14
  );
  doc.save();
  doc.roundedRect(M, 505, 175, 36, 10).fill(C.navy);
  doc.font('Helvetica-Bold').fontSize(12).fillColor('#FFFFFF').text('OWL 2 DL', M, 516, { width: 175, align: 'center' });
  doc.roundedRect(M + 195, 505, 120, 36, 10).fill(C.green);
  doc.font('Helvetica-Bold').fontSize(12).fillColor('#FFFFFF').text('SHACL', M + 195, 516, { width: 120, align: 'center' });
  doc.roundedRect(M + 335, 505, 130, 36, 10).fill(C.amber);
  doc.font('Helvetica-Bold').fontSize(12).fillColor('#FFFFFF').text('SPARQL', M + 335, 516, { width: 130, align: 'center' });
  doc.restore();
  imageBox(
    doc,
    asset('cover_page.png'),
    700,
    118,
    520,
    500,
    'Thesis cover page from the dissertation'
  );
}

function slide2(doc) {
  background(doc);
  slideHeader(doc, 'Problem and objective', 'Why this thesis exists');

  bullets(
    doc,
    [
      'NIS2 Article 21 defines multiple technical, operational, and organizational measures.',
      'In practice, compliance checking is often manual and document-driven.',
      'That makes verification slow, inconsistent, and hard to reproduce.',
      'The objective is to make Article 21 compliance machine-readable and explainable.',
    ],
    M,
    150,
    560,
    15,
    14
  );

  doc.save();
  doc.roundedRect(660, 150, 560, 430, 14).fill(C.soft).stroke(C.line);
  doc.font('Helvetica-Bold').fontSize(15).fillColor(C.text).text('What the thesis contributes', 684, 174);
  bullets(
    doc,
    [
      'An OWL 2 DL ontology for Article 21(2) requirements.',
      'A compliance class inferred from implemented measures.',
      'SHACL validation for missing or incomplete evidence.',
      'A compact web application for querying and visualization.',
    ],
    684,
    218,
    500,
    14,
    10
  );
  doc.font('Helvetica-Bold').fontSize(28).fillColor(C.blue).text('Goal', 684, 430);
  paragraph(
    doc,
    'Turn legal obligations into a formal model that can be checked, queried, and explained.',
    684,
    470,
    500,
    15
  );
  doc.restore();
}

function slide3(doc) {
  background(doc);
  slideHeader(doc, 'Approach', 'From legal text to computable compliance');

  imageBox(
    doc,
    asset('workflow_diagram.png'),
    M,
    152,
    1160,
    340,
    'Simple thesis workflow: legal text -> ontology -> validation -> outcome'
  );

  bullets(
    doc,
    [
      'Design-science approach: build the artifact, then evaluate it.',
      'The model uses OWL for meaning and inference.',
      'SHACL checks whether required evidence is present.',
      'SPARQL supports inspection and lightweight reporting.',
    ],
    M,
    522,
    560,
    14,
    10
  );

  doc.save();
  doc.roundedRect(660, 512, 560, 112, 14).fill(C.soft).stroke(C.line);
  doc.font('Helvetica-Bold').fontSize(14).fillColor(C.text).text('Design choice', 684, 534);
  paragraph(
    doc,
    'The thesis models the ten legal points as twelve operational classes, splitting point (g) and point (j) where the legal text bundles separate concerns.',
    684,
    558,
    500,
    12.5
  );
  doc.restore();
}

function slide4(doc) {
  background(doc);
  slideHeader(doc, 'Ontology model', 'The structure that makes compliance computable');

  imageBox(
    doc,
    asset('ontology_diagram.png'),
    M,
    150,
    760,
    470,
    'Ontology structure with a central compliance entity and the required measure groups'
  );

  doc.save();
  doc.roundedRect(850, 150, 380, 470, 14).fill('#FFFFFF').stroke(C.line);
  doc.font('Helvetica-Bold').fontSize(15).fillColor(C.text).text('Key classes', 874, 176);
  bullets(
    doc,
    [
      'Entity and RiskManagementMeasure',
      'Technical, Operational, Organizational measures',
      'CybersecurityRisk and SecurityIncident',
      'SecurityStandard and NetworkInformationSystem',
    ],
    874,
    216,
    330,
    14,
    10
  );
  doc.font('Helvetica-Bold').fontSize(15).fillColor(C.text).text('Why it matters', 874, 390);
  bullets(
    doc,
    [
      'Keeps legal provenance visible.',
      'Lets the reasoner infer compliance classes.',
      'Supports explanation, not just a binary result.',
    ],
    874,
    430,
    330,
    14,
    10
  );
  doc.restore();
}

function slide5(doc) {
  background(doc);
  slideHeader(doc, 'Validation and results', 'What the prototype demonstrates');

  imageBox(
    doc,
    asset('compliance_table.png'),
    M,
    150,
    760,
    500,
    'Worked example from the thesis showing the partial healthcare case and verdicts'
  );

  doc.save();
  doc.roundedRect(850, 150, 380, 230, 14).fill('#FFFFFF').stroke(C.line);
  doc.font('Helvetica-Bold').fontSize(15).fillColor(C.text).text('Observed outcome', 874, 176);
  doc.font('Helvetica-Bold').fontSize(26).fillColor(C.green).text('12 / 12', 874, 220);
  paragraph(doc, 'Full coverage leads to the inferred `CompliantEntity` class.', 874, 260, 320, 12.5);
  doc.font('Helvetica-Bold').fontSize(22).fillColor(C.amber).text('6 / 12', 874, 310);
  paragraph(doc, 'Partial coverage stays non-compliant and makes the gaps visible.', 874, 342, 320, 12.5);
  doc.restore();

  doc.save();
  doc.roundedRect(850, 410, 380, 240, 14).fill(C.soft).stroke(C.line);
  doc.font('Helvetica-Bold').fontSize(15).fillColor(C.text).text('Interpretation', 874, 436);
  bullets(
    doc,
    [
      'The score is coverage, not certification.',
      'Each missing category is named explicitly.',
      'This keeps legal judgment separate from the model.',
    ],
    874,
    476,
    320,
    12.5,
    10
  );
  doc.restore();
}

function slide6(doc) {
  background(doc);
  slideHeader(doc, 'Comparison and limitations', 'Where this thesis is useful, and where it stops');

  imageBox(
    doc,
    asset('comparison_table.png'),
    M,
    150,
    760,
    500,
    'Comparison from the thesis: OWL + SHACL + SPARQL in one demonstrator'
  );

  doc.save();
  doc.roundedRect(850, 150, 380, 240, 14).fill('#FFFFFF').stroke(C.line);
  doc.font('Helvetica-Bold').fontSize(15).fillColor(C.text).text('Strength', 874, 176);
  bullets(
    doc,
    [
      'Formal semantics with OWL 2 DL',
      'Validation with SHACL',
      'Queryable with SPARQL',
    ],
    874,
    214,
    320,
    12.5,
    10
  );
  doc.restore();

  doc.save();
  doc.roundedRect(850, 410, 380, 240, 14).fill(C.soft).stroke(C.line);
  doc.font('Helvetica-Bold').fontSize(15).fillColor(C.text).text('Limitations', 874, 436);
  bullets(
    doc,
    [
      'Prototype reasoning is bounded.',
      'Not a full production compliance system.',
      'Evidence and governance remain future work.',
    ],
    874,
    474,
    320,
    12.5,
    10
  );
  doc.restore();
}

function slide7(doc) {
  background(doc);
  slideHeader(doc, 'System view', 'The implementation stays compact');

  imageBox(
    doc,
    asset('architecture_diagram.png'),
    M,
    155,
    1160,
    340,
    'Three-tier view of the thesis project: data, API, and UI'
  );

  bullets(
    doc,
    [
      'The ontology is stored as RDF/OWL and loaded by the backend.',
      'The API exposes validation, reasoning, and ontology data endpoints.',
      'The browser UI is for graph exploration and quick compliance checks.',
    ],
    M,
    520,
    1140,
    14,
    10
  );
}

function slide8(doc) {
  background(doc);
  slideHeader(doc, 'Research questions', 'What the thesis set out to answer');

  imageBox(
    doc,
    asset('questions_diagram.png'),
    M,
    150,
    1160,
    430,
    'Three research questions presented early, in a compact academic style'
  );

  bullets(
    doc,
    [
      'RQ1: represent Article 21(2) as a layered ontology.',
      'RQ2: define an OWL axiom pattern for compliance coverage.',
      'RQ3: combine SHACL validation with OWL reasoning.',
    ],
    M,
    600,
    1140,
    13,
    10
  );
}

function slide9(doc) {
  background(doc);
  slideHeader(doc, 'Technology stack', 'A small, standard toolchain');

  imageBox(
    doc,
    asset('stack_diagram.png'),
    M,
    150,
    1160,
    430,
    'OWL, Protégé, SHACL, SPARQL, and a small Express backend'
  );

  bullets(
    doc,
    [
      'The stack is standard and reproducible.',
      'It keeps the thesis grounded in Semantic Web tooling.',
      'It avoids unnecessary custom infrastructure.',
    ],
    M,
    600,
    1140,
    13,
    10
  );
}

function slide10(doc) {
  background(doc);
  slideHeader(doc, 'Prototype view', 'What the user can actually inspect');

  imageBox(
    doc,
    asset('architecture_diagram.png'),
    M,
    150,
    1160,
    340,
    'Three-tier implementation used by the thesis prototype'
  );

  doc.save();
  doc.roundedRect(M, 510, 1160, 110, 14).fill(C.soft).stroke(C.line);
  doc.font('Helvetica-Bold').fontSize(14).fillColor(C.text).text('Practical takeaway', M + 22, 532);
  paragraph(
    doc,
    'The prototype is intentionally small: it loads the ontology, exposes validation and reasoning endpoints, and presents the result in a browser-friendly view.',
    M + 22,
    558,
    1110,
    13
  );
  doc.restore();
}

function slide11(doc) {
  background(doc);
  slideHeader(doc, 'Conclusion', 'Use this as your final one-minute summary');

  doc.save();
  doc.roundedRect(M, 150, 1160, 180, 14).fill('#FFFFFF').stroke(C.line);
  doc.font('Helvetica-Bold').fontSize(18).fillColor(C.text).text('Takeaway', M + 24, 176);
  paragraph(
    doc,
    'This thesis shows that NIS2 Article 21 compliance can be represented as a formal ontology, validated with shapes, queried with SPARQL, and explained through a small web application.',
    M + 24,
    214,
    1110,
    16
  );
  doc.restore();

  doc.save();
  doc.roundedRect(M, 360, 1160, 220, 14).fill(C.soft).stroke(C.line);
  doc.font('Helvetica-Bold').fontSize(15).fillColor(C.text).text('What to say out loud', M + 24, 386);
  bullets(
    doc,
    [
      'The problem is manual and inconsistent verification.',
      'The solution is a machine-readable, traceable ontology.',
      'The result is clear gap detection and explainable outcomes.',
    ],
    M + 24,
    424,
    1080,
    13,
    11
  );
  doc.restore();

  doc.font('Helvetica-Bold').fontSize(24).fillColor(C.blue).text('Thank you', M, 620);
  imageBox(doc, asset('cover_page.png'), 980, 560, 240, 120, 'Thesis cover');
}

function slide12(doc) {
  background(doc);
  slideHeader(doc, 'Future work', 'A sensible closing slide for the defense');

  doc.save();
  doc.roundedRect(M, 160, 560, 420, 14).fill('#FFFFFF').stroke(C.line);
  doc.font('Helvetica-Bold').fontSize(15).fillColor(C.text).text('Next steps', M + 24, 186);
  bullets(
    doc,
    [
      'Connect the prototype to a standards-complete reasoner.',
      'Add evidence, provenance, and review metadata.',
      'Extend the model beyond Article 21 to other NIS2 duties.',
      'Test the system with realistic data and user feedback.',
    ],
    M + 24,
    226,
    500,
    13,
    10
  );
  doc.restore();

  imageBox(
    doc,
    asset('comparison_table.png'),
    660,
    160,
    560,
    420,
    'A concise reminder that the thesis combines semantics, validation, and querying'
  );

  doc.save();
  doc.roundedRect(M, 610, 1160, 48, 14).fill(C.soft).stroke(C.line);
  doc.font('Helvetica-Bold').fontSize(12).fillColor(C.blue).text('Closing point', M + 18, 626);
  doc.font('Helvetica').fontSize(11).fillColor(C.text).text(
    'The thesis is strongest as a formal compliance framework and demonstration, not as a finished production system.',
    M + 120,
    626,
    { width: 970 }
  );
  doc.restore();
}

async function main() {
  const { doc, stream } = docFactory();
  const slides = [titleSlide, slide2, slide3, slide4, slide5, slide6, slide7, slide8, slide9, slide10, slide11, slide12];
  slides.forEach((slide, i) => {
    slide(doc);
    footer(doc, i + 1, slides.length);
    if (i < slides.length - 1) doc.addPage({ size: [W, H], margin: 0 });
  });
  doc.end();
  await new Promise((resolve, reject) => {
    stream.on('finish', resolve);
    stream.on('error', reject);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
