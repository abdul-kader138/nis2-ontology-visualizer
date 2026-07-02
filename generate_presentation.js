const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const OUT_FILE = path.join(__dirname, 'NIS2_Thesis_Presentation_Abdul_Kader.pdf');
const ASSET_DIR = path.join(__dirname, 'generated_assets');
const W = 1280;
const H = 720;
const M = 52;

const C = {
  bg: '#FFFFFF',
  navy: '#111827',
  blue: '#1E3A8A',
  green: '#166534',
  amber: '#92400E',
  red: '#991B1B',
  text: '#111827',
  muted: '#4B5563',
  line: '#CBD5E1',
  footer: '#374151',
  soft: '#F8FAFC',
  accent: '#1E3A8A',
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

function rootAsset(name) {
  return path.join(__dirname, name);
}

function background(doc) {
  doc.rect(0, 0, W, H).fill(C.bg);
  doc.save();
  doc.moveTo(M, 24).lineTo(W - M, 24).lineWidth(0.8).strokeColor(C.line).stroke();
  doc.moveTo(M, H - 34).lineTo(W - M, H - 34).lineWidth(0.75).strokeColor(C.line).stroke();
  doc.restore();
}

function footer(doc, idx, total) {
  doc.font('Times-Roman').fontSize(8.5).fillColor(C.muted);
  doc.text('Abdul Kader  |  NIS2 Article 21 compliance framework', M, H - 22, { width: 900 });
  doc.text(`${idx} / ${total}`, W - M - 42, H - 22, { width: 42, align: 'right' });
}

function slideHeader(doc, title, subtitle = '') {
  doc.font('Times-Roman').fontSize(8.5).fillColor(C.muted).text("MASTER'S THESIS PRESENTATION", M, 32, {
    letterSpacing: 1.2,
  });
  doc.font('Times-Bold').fontSize(25).fillColor(C.text).text(title, M, 52);
  if (subtitle) {
    doc.font('Times-Roman').fontSize(11.5).fillColor(C.muted).text(subtitle, M, 84);
  }
  doc.save();
  doc.moveTo(M, 118).lineTo(M + 180, 118).lineWidth(1.2).strokeColor(C.accent).stroke();
  doc.moveTo(M + 180, 118).lineTo(W - M, 118).lineWidth(0.8).strokeColor(C.line).stroke();
  doc.restore();
}

function paragraph(doc, text, x, y, w, size = 13, color = C.text) {
  const actualSize = Math.max(size, 14);
  doc.font('Times-Roman').fontSize(actualSize).fillColor(color).text(text, x, y, {
    width: w,
    lineGap: 2.5,
  });
}

function bullets(doc, items, x, y, w, size = 13, gap = 12) {
  let cy = y;
  const actualSize = Math.max(size, 14);
  for (const item of items) {
    doc.font('Times-Bold').fontSize(actualSize).fillColor(C.accent).text('•', x, cy);
    doc.font('Times-Roman').fontSize(actualSize).fillColor(C.text).text(item, x + 16, cy, {
      width: w - 16,
      lineGap: 2.5,
    });
    cy += doc.heightOfString(item, { width: w - 16, lineGap: 2.5 }) + gap;
  }
}

function imageBox(doc, imagePath, x, y, w, h, caption = '') {
  doc.save();
  doc.rect(x, y, w, h).fill('#FFFFFF');
  const captionH = caption ? 22 : 0;
  if (fs.existsSync(imagePath)) {
    doc.image(imagePath, x + 8, y + 8, { fit: [w - 16, h - captionH - 18], align: 'center', valign: 'center' });
  } else {
    doc.font('Times-Roman').fontSize(12).fillColor(C.red).text('Missing image', x + 20, y + 20);
  }
  doc.rect(x, y, w, h).lineWidth(1).stroke(C.line);
  if (caption) {
    doc.rect(x + 1, y + h - captionH - 1, w - 2, captionH).fill('#FFFFFF');
    doc.font('Times-Italic').fontSize(8.8).fillColor(C.muted).text(caption, x + 10, y + h - captionH + 4, {
      width: w - 20,
      align: 'center',
    });
  }
  doc.restore();
}

function card(doc, x, y, w, h, title, contentFn) {
  doc.save();
  doc.rect(x, y, w, h).fill('#FFFFFF').stroke(C.line);
  doc.rect(x, y, 5, h).fill(C.accent);
  if (title) {
    doc.font('Times-Bold').fontSize(13.5).fillColor(C.text).text(title, x + 18, y + 18);
  }
  if (contentFn) contentFn(x, y, w, h);
  doc.restore();
}

function titleSlide(doc) {
  background(doc);
  doc.font('Times-Bold').fontSize(31).fillColor(C.text).text(
    'An OWL-Based Ontology for\nNIS2 Article 21 Compliance',
    M,
    150,
    { width: 520, lineGap: 6 }
  );
  paragraph(
    doc,
    'A formal, machine-readable framework for representing and evaluating cybersecurity risk-management obligations.',
    M,
    286,
    500,
    15.5,
    C.muted
  );
  bullets(
    doc,
    [
      'Candidate: Abdul Kader',
      'Supervisor: Prof. Enrico Francesconi',
      'Focus: problem, method, implementation, results, and limits',
    ],
    M,
    352,
    520,
    13
  );
  doc.save();
  doc.moveTo(M, 496).lineTo(M + 430, 496).lineWidth(0.8).strokeColor(C.line).stroke();
  doc.font('Times-Bold').fontSize(11.5).fillColor(C.navy).text('OWL 2 DL', M, 512, { width: 120 });
  doc.font('Times-Bold').fontSize(11.5).fillColor(C.navy).text('SHACL', M + 130, 512, { width: 100 });
  doc.font('Times-Bold').fontSize(11.5).fillColor(C.navy).text('SPARQL', M + 230, 512, { width: 120 });
  doc.restore();
  imageBox(
    doc,
    asset('cover_page.png'),
    700,
    118,
    512,
    492,
    'Thesis cover page from the dissertation'
  );
}

function slide2(doc) {
  background(doc);
  slideHeader(doc, 'Research problem and objective', 'Motivation for a formal compliance model');

  bullets(
    doc,
    [
      'NIS2 Article 21 requires technical, operational, and organizational measures.',
      'Assessment is often manual and difficult to reproduce consistently.',
      'The thesis turns Article 21 into a machine-readable model.',
    ],
    M,
    150,
    560,
    15,
    14
  );

  doc.save();
  doc.rect(660, 150, 560, 430).fill('#FFFFFF').stroke(C.line);
  doc.font('Times-Bold').fontSize(15).fillColor(C.text).text('What the thesis contributes', 684, 174);
  bullets(
    doc,
    [
      'OWL 2 DL ontology covering Article 21(2) measure categories.',
      'SHACL constraints for missing or incomplete evidence.',
      'A compact web app for inspection, querying, and visualization.',
    ],
    684,
    218,
    500,
    14,
    10
  );
  doc.font('Times-Bold').fontSize(22).fillColor(C.text).text('Research objective', 684, 430);
  paragraph(
    doc,
    'Transform legal obligations into a structured compliance artifact that can be checked, queried, and explained.',
    684,
    470,
    500,
    15
  );
  doc.restore();
}

function slide3(doc) {
  background(doc);
  slideHeader(doc, 'Regulatory and standards context', 'Positioning NIS2 Article 21 within cybersecurity risk management');

  imageBox(
    doc,
    asset('orca-NIS2-directive-blog-min.png'),
    M,
    150,
    500,
    390,
    'NIS2 directive context and compliance activity in a policy setting'
  );

  imageBox(
    doc,
    asset('cybersecurity-risk-management-frameworks-1024x572.png'),
    600,
    150,
    620,
    300,
    'Recognized cybersecurity frameworks used to organize risk-management thinking'
  );

  doc.save();
  doc.rect(600, 480, 620, 100).fill('#FFFFFF').stroke(C.line);
  doc.font('Times-Bold').fontSize(14).fillColor(C.text).text('Analytical relevance', 624, 502);
  paragraph(
    doc,
    'The presentation connects Article 21 with established cybersecurity governance concepts, so the ontology can be read as both a legal artifact and a risk-management model.',
    624,
    528,
    570,
    12.5
  );
  doc.restore();
}

function slideMeasureMap(doc) {
  background(doc);
  slideHeader(doc, 'Article 21 measure map', 'The thematic areas that structure the ontology model');

  imageBox(
    doc,
    rootAsset('Cyber-security-risk-management-measures-410x1024.png'),
    M,
    150,
    440,
    500,
    'Ten Article 21 thematic areas summarized as a compact visual map'
  );

  doc.save();
  doc.rect(530, 150, 698, 500).fill('#FFFFFF').stroke(C.line);
  doc.font('Times-Bold').fontSize(18).fillColor(C.text).text('Why this image matters', 554, 176);
  bullets(
    doc,
    [
      'It gives a compact overview of the Article 21 scope before the ontology is introduced.',
      'It is directly aligned with the legal measure categories that the thesis formalizes.',
      'It supports the claim that the model is grounded in the structure of the directive, not an abstract re-labeling exercise.',
      'The ontology then refines these areas into the twelve operational classes used for reasoning.',
    ],
    554,
    218,
    630,
    13,
    10
  );
  doc.font('Times-Bold').fontSize(14).fillColor(C.blue).text('Bridge to the model', 554, 468);
  paragraph(
    doc,
    'This visual is justified because it maps directly to the thesis scope: the ontology, validation rules, and compliance output are all derived from these thematic areas.',
    554,
    494,
    610,
    12.5
  );
  doc.restore();
}

function slide4(doc) {
  background(doc);
  slideHeader(doc, 'Methodological approach', 'From legal text to computable compliance');

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
      'Design-science: build the artifact and evaluate it against representative cases.',
      'OWL 2 DL supports classification and reasoning.',
      'SHACL checks whether required evidence is present.',
      'SPARQL supports inspection and querying.',
    ],
    M,
    522,
    560,
    14,
    10
  );

  doc.save();
  doc.rect(660, 512, 560, 112).fill('#FFFFFF').stroke(C.line);
  doc.font('Times-Bold').fontSize(14).fillColor(C.text).text('Modeling decision', 684, 534);
  paragraph(
    doc,
    'The thesis models the ten legal points as twelve operational classes, separating points (g) and (j) where the wording combines distinct concerns.',
    684,
    558,
    500,
    12.5
  );
  doc.restore();
}

function slide5(doc) {
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
  doc.rect(850, 150, 380, 470).fill('#FFFFFF').stroke(C.line);
  doc.font('Times-Bold').fontSize(15).fillColor(C.text).text('Key classes', 874, 176);
  bullets(
    doc,
    [
      'Entity and RiskManagementMeasure',
      'Technical, Operational, Organizational measures',
      'CybersecurityRisk and SecurityIncident',
    ],
    874,
    216,
    330,
    14,
    10
  );
  doc.font('Times-Bold').fontSize(15).fillColor(C.text).text('Analytical significance', 874, 390);
  bullets(
    doc,
    [
      'Preserves the link between legal provisions and model elements.',
      'Allows the reasoner to infer compliance-relevant classifications.',
      'Supports explanation rather than only a binary result.',
    ],
    874,
    430,
    330,
    14,
    10
  );
  doc.restore();
}

function thesisOntologyEvidenceSlide(doc) {
  background(doc);
  slideHeader(doc, 'Dissertation figures: ontology implementation', 'Selected implementation figures from Chapter 6');

  imageBox(
    doc,
    asset('thesis_class_hierarchy.png'),
    M,
    150,
    480,
    430,
    'Figure 6.1: Protégé class hierarchy for the NIS2 Article 21 ontology'
  );

  imageBox(
    doc,
    asset('thesis_compliance_axiom.png'),
    570,
    150,
    650,
    300,
    'Figure 6.4: OWL equivalent-class structure for CompliantEntity'
  );

  doc.save();
  doc.rect(570, 480, 650, 100).fill('#FFFFFF').stroke(C.line);
  doc.font('Times-Bold').fontSize(14).fillColor(C.text).text('Interpretation', 594, 502);
  paragraph(
    doc,
    'These figures show that the thesis artifact is implemented, not just conceptual. The ontology was built in OWL, inspected in Protégé, and centered on a compliance class covering the Article 21 measure categories.',
    594,
    528,
    590,
    12.5
  );
  doc.restore();
}

function slide6(doc) {
  background(doc);
  slideHeader(doc, 'Validation and results', 'Prototype-level evaluation findings');

  imageBox(
    doc,
    asset('compliance_table.png'),
    M,
    150,
    710,
    500,
    'Worked example from the thesis showing the partial healthcare case and verdicts'
  );

  doc.save();
  doc.rect(782, 150, 446, 230).fill('#FFFFFF').stroke(C.line);
  doc.font('Times-Bold').fontSize(16).fillColor(C.text).text('Observed outcome', 806, 176);
  doc.font('Times-Bold').fontSize(30).fillColor(C.green).text('12 / 12', 806, 220);
  paragraph(doc, 'Full coverage yields the inferred `CompliantEntity` class.', 806, 262, 394, 13.5);
  doc.font('Times-Bold').fontSize(24).fillColor(C.amber).text('6 / 12', 806, 304);
  paragraph(doc, 'Partial coverage stays non-compliant and exposes the gaps.', 806, 342, 394, 13.5);
  doc.restore();

  doc.save();
  doc.rect(782, 410, 446, 240).fill('#FFFFFF').stroke(C.line);
  doc.font('Times-Bold').fontSize(16).fillColor(C.text).text('Interpretation', 806, 436);
  bullets(
    doc,
    [
      'The result measures modeled coverage, not legal certification.',
      'Missing requirement categories are identified explicitly.',
    ],
    806,
    476,
    394,
    13,
    12
  );
  doc.restore();
}

function slide7(doc) {
  background(doc);
  slideHeader(doc, 'Comparison and limitations', 'Scope of contribution and stated boundaries');

  imageBox(
    doc,
    asset('comparison_table.png'),
    M,
    150,
    720,
    500,
    'Comparison from the thesis: OWL + SHACL + SPARQL in one demonstrator'
  );

  doc.save();
  doc.rect(800, 150, 428, 240).fill('#FFFFFF').stroke(C.line);
  doc.font('Times-Bold').fontSize(16).fillColor(C.text).text('Strength', 824, 176);
  bullets(
    doc,
    [
      'Formal semantics through OWL 2 DL',
      'Constraint validation through SHACL',
    ],
    824,
    214,
    380,
    13,
    12
  );
  doc.restore();

  doc.save();
  doc.rect(800, 410, 428, 240).fill('#FFFFFF').stroke(C.line);
  doc.font('Times-Bold').fontSize(16).fillColor(C.text).text('Limitations', 824, 436);
  bullets(
    doc,
    [
      'Reasoning is demonstrated within a bounded prototype setting.',
      'Production-grade evidence governance remains future work.',
    ],
    824,
    474,
    380,
    13,
    12
  );
  doc.restore();
}

function slide8(doc) {
  background(doc);
  slideHeader(doc, 'System architecture', 'Implementation structure of the prototype');

  imageBox(
    doc,
    asset('architecture_diagram.png'),
    M,
    155,
    1160,
    380,
    'Three-tier view of the thesis project: data, API, and UI'
  );

  bullets(
    doc,
    [
      'The ontology is stored as RDF/OWL and loaded by the backend.',
      'The API exposes validation, reasoning, and ontology-data endpoints.',
    ],
    M,
    558,
    1140,
    14,
    10
  );
}

function slide9(doc) {
  background(doc);
  slideHeader(doc, 'Research questions', 'What the thesis set out to answer');

  imageBox(
    doc,
    asset('questions_diagram.png'),
    M,
    150,
    1160,
    450,
    'Three research questions presented early, in a compact academic style'
  );

  bullets(
    doc,
    [
      'RQ1: How can Article 21(2) be represented as a layered ontology?',
      'RQ2: Which OWL axiom pattern can express compliance coverage?',
    ],
    M,
    616,
    1140,
    13,
    10
  );
}

function slide10(doc) {
  background(doc);
  slideHeader(doc, 'Technology stack', 'Standards and implementation technologies');

  imageBox(
    doc,
    asset('stack_diagram.png'),
    M,
    150,
    1160,
    320
  );

  bullets(
    doc,
    [
      'The stack is based on reproducible Semantic Web technologies.',
      'It keeps the thesis grounded in standards-based knowledge representation.',
    ],
    M,
    500,
    1140,
    14,
    10
  );
}

function slide11(doc) {
  background(doc);
  slideHeader(doc, 'Prototype architecture', 'Inspectable implementation layer');

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
  doc.rect(M, 510, 1160, 110).fill('#FFFFFF').stroke(C.line);
  doc.font('Times-Bold').fontSize(14).fillColor(C.text).text('Implementation note', M + 22, 532);
  paragraph(
    doc,
    'The prototype loads the ontology, exposes validation and reasoning endpoints, and presents results in a browser view for inspection and demonstration.',
    M + 22,
    558,
    1110,
    13
  );
  doc.restore();
}

function thesisGraphEvidenceSlide(doc) {
  background(doc);
  slideHeader(doc, 'Dissertation figures: ontology visualization', 'Graph excerpt from the implemented prototype');

  imageBox(
    doc,
    asset('thesis_ontology_explorer.png'),
    M,
    145,
    640,
    500,
    'Figure 8.1: ontology explorer showing entity, measure, risk, system, and standard relations'
  );

  doc.save();
  doc.rect(740, 150, 480, 220).fill('#FFFFFF').stroke(C.line);
  doc.font('Times-Bold').fontSize(15).fillColor(C.text).text('Interpretive value', 764, 176);
  bullets(
    doc,
    [
      'Entities are connected to implemented measures.',
      'Measures are connected to systems, risks, and standards.',
    ],
    764,
    216,
    420,
    13,
    10
  );
  doc.restore();

  doc.save();
  doc.rect(740, 405, 480, 160).fill('#FFFFFF').stroke(C.line);
  doc.font('Times-Bold').fontSize(14).fillColor(C.text).text('Connection to the research claim', 764, 430);
  paragraph(
    doc,
    'This screenshot shows the bridge between the ontology vocabulary and the web-based inspection layer. It supports the claim that the model can be queried and explained, not only stored as a static file.',
    764,
    456,
    420,
    12.5
  );
  doc.restore();
}

function thesisPrototypeEvidenceSlide(doc) {
  background(doc);
  slideHeader(doc, 'Dissertation figures: prototype outputs', 'Reasoning and real-time compliance assessment');

  imageBox(
    doc,
    asset('thesis_reasoning_result.png'),
    M,
    150,
    540,
    470,
    'Figure 8.3: classification, missing classes, and derived standards'
  );

  imageBox(
    doc,
    asset('thesis_entity_assessment.png'),
    680,
    150,
    540,
    470,
    'Figure 8.5: real-time entity compliance assessment'
  );
}

function thesisQueryEvidenceSlide(doc) {
  background(doc);
  slideHeader(doc, 'Dissertation figures: SPARQL query layer', 'Competency-question execution over the ontology graph');

  imageBox(
    doc,
    asset('thesis_sparql_query.png'),
    M,
    150,
    690,
    470,
    'Figure 8.6: SPARQL competency query and result table'
  );

  doc.save();
  doc.rect(790, 150, 430, 210).fill('#FFFFFF').stroke(C.line);
  doc.font('Times-Bold').fontSize(15).fillColor(C.text).text('What this demonstrates', 814, 176);
  bullets(
    doc,
    [
      'The ontology can be inspected through query patterns.',
      'Standards linked to a compliant entity can be retrieved from the graph.',
    ],
    814,
    216,
    370,
    12.5,
    9
  );
  doc.restore();

  doc.save();
  doc.rect(790, 400, 430, 120).fill('#FFFFFF').stroke(C.line);
  paragraph(
    doc,
    'This slide completes the sequence: ontology representation, validation, reasoning, and information retrieval.',
    814,
    426,
    370,
    12.5
  );
  doc.restore();
}

function slide12(doc) {
  background(doc);
  slideHeader(doc, 'Conclusion', 'Final synthesis of the research contribution');

  doc.save();
  doc.rect(M, 150, 1160, 180).fill('#FFFFFF').stroke(C.line);
  doc.font('Times-Bold').fontSize(18).fillColor(C.text).text('Takeaway', M + 24, 176);
  paragraph(
    doc,
    'This thesis shows that NIS2 Article 21 compliance can be represented as a formal ontology, validated with SHACL shapes, queried with SPARQL, and explained through a compact web application.',
    M + 24,
    214,
    1110,
    16
  );
  doc.restore();

  doc.save();
  doc.rect(M, 360, 1160, 220).fill('#FFFFFF').stroke(C.line);
  doc.font('Times-Bold').fontSize(15).fillColor(C.text).text('Core claims', M + 24, 386);
  bullets(
    doc,
    [
      'Manual verification becomes more consistent through formal representation.',
      'A traceable ontology bridges legal text and compliance evidence.',
    ],
    M + 24,
    424,
    1080,
    13,
    11
  );
  doc.restore();

  doc.font('Times-Bold').fontSize(24).fillColor(C.blue).text('Thank you', M, 620);
  imageBox(doc, asset('cover_page.png'), 980, 560, 240, 120, 'Thesis cover');
}

function slide13(doc) {
  background(doc);
  slideHeader(doc, 'Future work', 'Research extensions and validation requirements');

  doc.save();
  doc.rect(M, 160, 520, 420).fill('#FFFFFF').stroke(C.line);
  doc.font('Times-Bold').fontSize(16).fillColor(C.text).text('Next steps', M + 24, 186);
  bullets(
    doc,
    [
      'Integrate the prototype with a standards-complete reasoner.',
      'Add evidence, provenance, and review metadata.',
      'Evaluate the system with realistic organizational data.',
    ],
    M + 24,
    226,
    460,
    13.5,
    10
  );
  doc.restore();

  imageBox(
    doc,
    asset('comparison_table.png'),
    620,
    160,
    608,
    320
  );

  paragraph(
    doc,
    'A concise reminder that the thesis combines semantics, validation, and querying.',
    620,
    500,
    608,
    12.5
  );

  doc.save();
  doc.rect(M, 604, 1160, 56).fill('#FFFFFF').stroke(C.line);
  doc.font('Times-Bold').fontSize(12).fillColor(C.text).text('Closing point', M + 18, 621);
  doc.font('Times-Roman').fontSize(11.5).fillColor(C.text).text(
    'This work is a formal compliance demonstrator, not a production deployment.',
    M + 120,
    620,
    { width: 980 }
  );
  doc.restore();
}

async function main() {
  const { doc, stream } = docFactory();
  const slides = [
    titleSlide,
    slide2,
    slideMeasureMap,
    slide3,
    slide4,
    slide5,
    thesisOntologyEvidenceSlide,
    slide6,
    slide7,
    slide8,
    slide9,
    slide10,
    slide11,
    thesisGraphEvidenceSlide,
    thesisPrototypeEvidenceSlide,
    thesisQueryEvidenceSlide,
    slide12,
    slide13,
  ];
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
