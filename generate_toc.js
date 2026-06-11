const PDFDocument = require('pdfkit');
const fs = require('fs');

const doc = new PDFDocument({ margin: 72, size: 'A4' });
doc.pipe(fs.createWriteStream('table of content corrected.pdf'));

const titleFont   = 'Helvetica-Bold';
const normalFont  = 'Helvetica';
const pageW       = doc.page.width - 144; // usable width

// ── Title ──────────────────────────────────────────────────────────────
doc.font(titleFont).fontSize(13)
   .text('An OWL-Based Ontology for NIS2 Directive Article 21 Compliance: Automated', { align: 'center' })
   .text('Validation and Reasoning Framework for Cybersecurity Risk-Management Measures.', { align: 'center' });

doc.moveDown(2);

// ── TOC heading ────────────────────────────────────────────────────────
doc.font(titleFont).fontSize(13).text('Table of Contents');
doc.moveDown(1);

const toc = [
  { level: 1, text: 'Introduction' },
  { level: 2, text: '1.1  Background and Context' },
  { level: 2, text: '1.2  Problem Statement' },
  { level: 2, text: '1.3  Research Objectives' },
  { level: 2, text: '1.4  Research Questions' },
  { level: 2, text: '1.5  Scope and Limitations' },
  { level: 2, text: '1.6  Thesis Structure' },

  { level: 1, text: 'Literature Review' },
  { level: 2, text: '2.1  Semantic Web Technologies and Ontologies' },
  { level: 2, text: '2.2  OWL and RDF Standards' },
  { level: 2, text: '2.3  Regulatory Compliance in Cybersecurity' },
  { level: 2, text: '2.4  NIS2 Directive Overview' },
  { level: 2, text: '2.5  Existing Compliance Tools and Approaches' },
  { level: 2, text: '2.6  Ontology-Based Compliance Systems' },
  { level: 2, text: '2.7  Research Gap' },

  { level: 1, text: 'Theoretical Foundation' },
  { level: 2, text: '3.1  Web Ontology Language (OWL 2)' },
  { level: 2, text: '3.2  RDF and RDFS Fundamentals' },
  { level: 2, text: '3.3  Ontology Engineering Principles' },
  { level: 2, text: '3.4  Reasoning in Description Logics' },
  { level: 2, text: '3.5  SPARQL Query Language' },
  { level: 2, text: '3.6  SHACL (Shapes Constraint Language)' },   // NEW
  { level: 2, text: '3.7  SKOS Vocabulary and Semantic Alignment' }, // NEW

  { level: 1, text: 'NIS2 Directive Article 21: Requirements Analysis' },
  { level: 2, text: '4.1  Article 21 Legal Text and Scope' },       // FIXED (was duplicate NIS2 Overview)
  { level: 2, text: '4.2  Article 21 Requirements' },
  { level: 2, text: '4.3  Essential vs. Important Entities' },
  { level: 2, text: '4.4  Required Cybersecurity Measures (a)–(l)' },
  { level: 2, text: '4.5  Compliance Criteria' },
  { level: 2, text: '4.6  Challenges in Manual Compliance Verification' },

  { level: 1, text: 'Methodology' },
  { level: 2, text: '5.1  Ontology Development Process (METHONTOLOGY)' },
  { level: 2, text: '5.2  Requirements Gathering' },
  { level: 2, text: '5.3  Competency Questions Definition' },        // NEW
  { level: 2, text: '5.4  Class Hierarchy Design' },
  { level: 2, text: '5.5  Property Definition' },
  { level: 2, text: '5.6  Validation Rules Design' },
  { level: 2, text: '5.7  System Architecture' },
  { level: 2, text: '5.8  Technology Stack Selection' },

  { level: 1, text: 'Ontology Design and Implementation' },
  { level: 2, text: '6.1  Ontology Structure and Namespace' },
  { level: 2, text: '6.2  Core Classes' },
  { level: 3, text: '6.2.1  Entity Classes (Essential / Important)' },
  { level: 3, text: '6.2.2  Risk Management Measure Classes' },
  { level: 3, text: '6.2.3  Supporting Classes (Risk, Standard, System)' },
  { level: 2, text: '6.3  Object Properties' },
  { level: 2, text: '6.4  Data Properties' },
  { level: 2, text: '6.5  OWL 2 Axioms (equivalentClass, propertyChain, disjointWith)' },
  { level: 2, text: '6.6  SKOS Annotations and External Alignments' },
  { level: 2, text: '6.7  Competency Questions Validation' },
  { level: 2, text: '6.8  Ontology Validation' },

  { level: 1, text: 'System Implementation' },
  { level: 2, text: '7.1  System Architecture Overview' },
  { level: 2, text: '7.2  Backend Implementation' },
  { level: 3, text: '7.2.1  RDF/OWL Parsing (N3.js)' },
  { level: 3, text: '7.2.2  API Endpoints' },
  { level: 3, text: '7.2.3  Reasoning Engine' },
  { level: 3, text: '7.2.4  SHACL Validation Logic' },
  { level: 3, text: '7.2.5  Property Chain Inference (usesStandard)' },
  { level: 2, text: '7.3  Frontend Implementation' },
  { level: 3, text: '7.3.1  Interactive Knowledge Graph Visualization' },
  { level: 3, text: '7.3.2  User Interface Design' },
  { level: 3, text: '7.3.3  Real-Time Validation' },
  { level: 2, text: '7.4  Integration and Testing' },

  { level: 1, text: 'System Demonstration and Use Cases' },          // RENAMED from "Key Features"
  { level: 2, text: '8.1  Interactive Graph Visualization' },
  { level: 2, text: '8.2  Ontology Validation System' },
  { level: 2, text: '8.3  OWL Reasoning Capabilities' },
  { level: 2, text: '8.4  SPARQL Query Interface' },
  { level: 2, text: '8.5  Class Hierarchy Lookup' },
  { level: 2, text: '8.6  SHACL Shapes Validation' },
  { level: 2, text: '8.7  Measure Coverage Analysis' },
  { level: 2, text: '8.8  Real-Time Entity Compliance Checking' },   // NEW

  { level: 1, text: 'Evaluation and Results' },
  { level: 2, text: '9.1  Ontology Completeness' },
  { level: 2, text: '9.2  Validation Accuracy' },
  { level: 2, text: '9.3  Reasoning Performance' },
  { level: 2, text: '9.4  Usability Assessment' },
  { level: 2, text: '9.5  Case Studies' },
  { level: 2, text: '9.6  Comparison with Existing Approaches' },

  { level: 1, text: 'Discussion' },
  { level: 2, text: '10.1  Problem Solutions' },
  { level: 2, text: '10.2  Contributions to the Field' },
  { level: 2, text: '10.3  Limitations' },
  { level: 2, text: '10.4  Future Work' },
  { level: 2, text: '10.5  Practical Implications' },

  { level: 1, text: 'Conclusion' },
  { level: 2, text: '11.1  Summary of Contributions' },
  { level: 2, text: '11.2  Achievement of Objectives' },
  { level: 2, text: '11.3  Future Research Directions' },
];

let chapterNum = 0;
toc.forEach(item => {
  if (item.level === 1) {
    chapterNum++;
    doc.moveDown(0.5);
    doc.font(titleFont).fontSize(11).text(`${chapterNum}.  ${item.text}`);
    doc.moveDown(0.3);
  } else if (item.level === 2) {
    doc.font(normalFont).fontSize(11)
       .text(item.text, { indent: 36 });
    doc.moveDown(0.25);
  } else {
    doc.font(normalFont).fontSize(10)
       .text(item.text, { indent: 72 });
    doc.moveDown(0.2);
  }
});

// References & Appendices
doc.moveDown(0.5);
doc.font(titleFont).fontSize(11).text('References');
doc.moveDown(0.5);
doc.font(titleFont).fontSize(11).text('Appendices');
doc.moveDown(0.3);

const appendices = [
  'Appendix A — Full Ontology (Turtle / TTL)',
  'Appendix B — OWL/RDF-XML File',
  'Appendix C — SHACL Shapes File',
  'Appendix D — API Endpoint Reference',
  'Appendix E — Competency Question SPARQL Queries',
];
appendices.forEach(a => {
  doc.font(normalFont).fontSize(11).text(a, { indent: 36 });
  doc.moveDown(0.25);
});

doc.end();
console.log('PDF generated: table of content corrected.pdf');
