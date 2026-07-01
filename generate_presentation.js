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
  navy: '#1F2937',
  blue: '#334155',
  green: '#365F3D',
  amber: '#6B5B2A',
  red: '#7F1D1D',
  text: '#111827',
  muted: '#4B5563',
  line: '#9CA3AF',
  footer: '#111827',
  soft: '#F3F4F6',
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
  doc.moveTo(M, H - 32).lineTo(W - M, H - 32).lineWidth(0.75).strokeColor(C.line).stroke();
  doc.restore();
}

function footer(doc, idx, total) {
  doc.font('Times-Roman').fontSize(9).fillColor(C.muted);
  doc.text('Abdul Kader | NIS2 Article 21 compliance framework', M, H - 22, { width: 900 });
  doc.text(`${idx} / ${total}`, W - M - 42, H - 22, { width: 42, align: 'right' });
}

function slideHeader(doc, title, subtitle = '') {
  doc.font('Times-Roman').fontSize(10).fillColor(C.muted).text('Master\'s Thesis Presentation', M, 30);
  doc.font('Times-Bold').fontSize(24).fillColor(C.text).text(title, M, 58);
  if (subtitle) {
    doc.font('Times-Roman').fontSize(11).fillColor(C.muted).text(subtitle, M, 92);
  }
  doc.save();
  doc.moveTo(M, 120).lineTo(W - M, 120).lineWidth(0.75).strokeColor(C.line).stroke();
  doc.restore();
}

function paragraph(doc, text, x, y, w, size = 13, color = C.text) {
  doc.font('Times-Roman').fontSize(size).fillColor(color).text(text, x, y, {
    width: w,
    lineGap: 4,
  });
}

function bullets(doc, items, x, y, w, size = 13, gap = 12) {
  let cy = y;
  for (const item of items) {
    doc.font('Times-Roman').fontSize(size).fillColor(C.text).text('–', x, cy);
    doc.font('Times-Roman').fontSize(size).fillColor(C.text).text(item, x + 18, cy, {
      width: w - 18,
      lineGap: 4,
    });
    cy += doc.heightOfString(item, { width: w - 18, lineGap: 4 }) + gap;
  }
}

function imageBox(doc, imagePath, x, y, w, h, caption = '') {
  doc.save();
  doc.rect(x, y, w, h).fill('#FFFFFF');
  if (fs.existsSync(imagePath)) {
    doc.image(imagePath, x + 6, y + 6, { fit: [w - 12, h - 28], align: 'center', valign: 'center' });
  } else {
    doc.font('Times-Roman').fontSize(12).fillColor(C.red).text('Missing image', x + 20, y + 20);
  }
  doc.rect(x, y, w, h).lineWidth(0.5).stroke(C.line);
  if (caption) {
    doc.font('Times-Italic').fontSize(10.5).fillColor(C.muted).text(caption, x + 8, y + h - 18, {
      width: w - 16,
      align: 'center',
    });
  }
  doc.restore();
}

function titleSlide(doc) {
  background(doc);
  doc.font('Times-Bold').fontSize(34).fillColor(C.text).text(
    'An OWL-Based Ontology for\nNIS2 Article 21 Compliance',
    M,
    160,
    { width: 520, lineGap: 8 }
  );
  paragraph(
    doc,
    'A formal, machine-readable framework for representing and evaluating cybersecurity risk-management obligations.',
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
      'Focus: research problem, methodology, implementation, findings, and limitations',
    ],
    M,
    365,
    520,
    14
  );
  doc.save();
  doc.moveTo(M, 510).lineTo(M + 465, 510).lineWidth(0.75).strokeColor(C.line).stroke();
  doc.font('Times-Roman').fontSize(12).fillColor(C.text).text('OWL 2 DL', M, 524, { width: 120 });
  doc.text('SHACL', M + 145, 524, { width: 100 });
  doc.text('SPARQL', M + 260, 524, { width: 120 });
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
  slideHeader(doc, 'Research problem and objective', 'Motivation for a formal compliance model');

  bullets(
    doc,
    [
      'NIS2 Article 21 requires entities to adopt technical, operational, and organizational cybersecurity risk-management measures.',
      'Compliance assessment is frequently performed through manual document review and fragmented evidence collection.',
      'Manual assessment can reduce consistency, reproducibility, and transparency in the interpretation of requirements.',
      'The thesis objective is to represent Article 21 compliance in a machine-readable and explainable form.',
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
      'An OWL 2 DL ontology covering the Article 21(2) measure categories.',
      'A compliance classification pattern inferred from implemented measures.',
      'SHACL constraints for detecting absent or incomplete compliance evidence.',
      'A compact web application for ontology inspection, querying, and visualization.',
    ],
    684,
    218,
    500,
    14,
    10
  );
  doc.font('Times-Bold').fontSize(24).fillColor(C.text).text('Research objective', 684, 430);
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
    rootAsset('image-1.jpg'),
    M,
    150,
    500,
    390,
    'NIST Cybersecurity Framework functions as a reference model for risk-management thinking'
  );

  imageBox(
    doc,
    asset('workflow_diagram.png'),
    600,
    150,
    620,
    300,
    'Thesis workflow linking legal requirements, semantic modeling, validation, and explainable output'
  );

  doc.save();
  doc.rect(600, 480, 620, 100).fill('#FFFFFF').stroke(C.line);
  doc.font('Times-Bold').fontSize(14).fillColor(C.text).text('Analytical relevance', 624, 502);
  paragraph(
    doc,
    'The presentation connects a regulatory obligation, NIS2 Article 21, with established cybersecurity governance concepts. This makes the ontology easier to interpret as both a legal-compliance artifact and a risk-management model.',
    624,
    528,
    570,
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
      'A design-science methodology is used: construct the artifact and evaluate its behavior against representative cases.',
      'OWL 2 DL provides the semantic structure required for classification and reasoning.',
      'SHACL validates whether required compliance evidence is present and structurally complete.',
      'SPARQL enables inspection, querying, and lightweight reporting over the knowledge graph.',
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
    'The thesis models the ten legal points as twelve operational classes, separating point (g) and point (j) where the legal wording combines distinct compliance concerns.',
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
      'SecurityStandard and NetworkInformationSystem',
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
      'Preserves the link between legal provisions and technical model elements.',
      'Allows the reasoner to infer compliance-relevant classifications.',
      'Supports explanation of outcomes rather than only a binary result.',
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
    'These figures show that the thesis artifact is not only conceptual. The ontology was implemented in OWL, inspected in Protégé, and structured around a compliance class whose definition requires coverage of the operational Article 21 measure categories.',
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
    760,
    500,
    'Worked example from the thesis showing the partial healthcare case and verdicts'
  );

  doc.save();
  doc.rect(850, 150, 380, 230).fill('#FFFFFF').stroke(C.line);
  doc.font('Times-Bold').fontSize(15).fillColor(C.text).text('Observed outcome', 874, 176);
  doc.font('Times-Bold').fontSize(26).fillColor(C.green).text('12 / 12', 874, 220);
  paragraph(doc, 'Full coverage leads to the inferred `CompliantEntity` class.', 874, 260, 320, 12.5);
  doc.font('Times-Bold').fontSize(22).fillColor(C.amber).text('6 / 12', 874, 310);
  paragraph(doc, 'Partial coverage stays non-compliant and makes the gaps visible.', 874, 342, 320, 12.5);
  doc.restore();

  doc.save();
  doc.rect(850, 410, 380, 240).fill('#FFFFFF').stroke(C.line);
  doc.font('Times-Bold').fontSize(15).fillColor(C.text).text('Interpretation', 874, 436);
  bullets(
    doc,
    [
      'The result represents modeled coverage, not formal legal certification.',
      'Each missing requirement category is identified explicitly.',
      'Legal judgment remains separate from the computational model.',
    ],
    874,
    476,
    320,
    12.5,
    10
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
    760,
    500,
    'Comparison from the thesis: OWL + SHACL + SPARQL in one demonstrator'
  );

  doc.save();
  doc.rect(850, 150, 380, 240).fill('#FFFFFF').stroke(C.line);
  doc.font('Times-Bold').fontSize(15).fillColor(C.text).text('Strength', 874, 176);
  bullets(
    doc,
    [
      'Formal semantics through OWL 2 DL',
      'Constraint validation through SHACL',
      'Transparent inspection through SPARQL queries',
    ],
    874,
    214,
    320,
    12.5,
    10
  );
  doc.restore();

  doc.save();
  doc.rect(850, 410, 380, 240).fill('#FFFFFF').stroke(C.line);
  doc.font('Times-Bold').fontSize(15).fillColor(C.text).text('Limitations', 874, 436);
  bullets(
    doc,
    [
      'Reasoning is demonstrated within a bounded prototype setting.',
      'The artifact is not a complete production compliance-management system.',
      'Evidence lifecycle management, provenance, and governance workflows remain future work.',
    ],
    874,
    474,
    320,
    12.5,
    10
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
    340,
    'Three-tier view of the thesis project: data, API, and UI'
  );

  bullets(
    doc,
    [
      'The ontology is stored as RDF/OWL and loaded by the backend service.',
      'The API exposes validation, reasoning, and ontology-data endpoints.',
      'The browser interface supports graph exploration and preliminary compliance checks.',
    ],
    M,
    520,
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
    430,
    'Three research questions presented early, in a compact academic style'
  );

  bullets(
    doc,
    [
      'RQ1: How can Article 21(2) be represented as a layered ontology?',
      'RQ2: Which OWL axiom pattern can express compliance coverage?',
      'RQ3: How can SHACL validation complement OWL reasoning?',
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
  slideHeader(doc, 'Technology stack', 'Standards and implementation technologies');

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
      'The stack is based on established and reproducible Semantic Web technologies.',
      'It keeps the thesis grounded in standards-based knowledge representation.',
      'It minimizes custom infrastructure so the research contribution remains clear.',
    ],
    M,
    600,
    1140,
    13,
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
    'The prototype loads the ontology, exposes validation and reasoning endpoints, and presents results in a browser-based view suitable for inspection and demonstration.',
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
      'The visualization makes the semantic model inspectable for a defense audience.',
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
    'This screenshot demonstrates the practical bridge between the ontology vocabulary and the web-based inspection layer. It supports the claim that the model can be queried and explained, not only stored as a static file.',
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
      'Standards associated with a compliant entity can be retrieved from graph relations.',
      'Competency questions provide a testable link between research requirements and system behavior.',
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
    'This slide makes the query component visible, completing the educational sequence: ontology representation, validation, reasoning, and information retrieval.',
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
    'This thesis demonstrates that NIS2 Article 21 compliance can be represented as a formal ontology, validated with SHACL shapes, queried with SPARQL, and explained through a compact web application.',
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
      'Manual verification can be made more consistent through formal representation.',
      'A traceable ontology provides a structured bridge between legal text and compliance evidence.',
      'The prototype demonstrates explicit gap detection and explainable compliance outcomes.',
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
  doc.rect(M, 160, 560, 420).fill('#FFFFFF').stroke(C.line);
  doc.font('Times-Bold').fontSize(15).fillColor(C.text).text('Next steps', M + 24, 186);
  bullets(
    doc,
    [
      'Integrate the prototype with a standards-complete reasoner.',
      'Add evidence, provenance, and review metadata.',
      'Extend the model beyond Article 21 to other NIS2 duties.',
      'Evaluate the system with realistic organizational data and user feedback.',
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
  doc.rect(M, 610, 1160, 48).fill('#FFFFFF').stroke(C.line);
  doc.font('Times-Bold').fontSize(12).fillColor(C.blue).text('Closing point', M + 18, 626);
  doc.font('Times-Roman').fontSize(11).fillColor(C.text).text(
    'The thesis should be understood as a formal compliance framework and research demonstrator, not as a finished production system.',
    M + 120,
    626,
    { width: 970 }
  );
  doc.restore();
}

async function main() {
  const { doc, stream } = docFactory();
  const slides = [
    titleSlide,
    slide2,
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
