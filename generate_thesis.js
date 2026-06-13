const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const FONT_DIR = '/usr/share/fonts/truetype/dejavu';
const FONT_FILES = {
  Helvetica: path.join(FONT_DIR, 'DejaVuSerif.ttf'),
  'Helvetica-Bold': path.join(FONT_DIR, 'DejaVuSerif-Bold.ttf'),
  'Helvetica-Oblique': path.join(FONT_DIR, 'DejaVuSerif-Italic.ttf'),
  Courier: path.join(FONT_DIR, 'DejaVuSansMono.ttf'),
  'Courier-Bold': path.join(FONT_DIR, 'DejaVuSansMono-Bold.ttf'),
};

const doc = new PDFDocument({
  size: 'A4',
  bufferPages: true,
  margins: { top: 72, bottom: 72, left: 80, right: 72 },
  info: {
    Title: 'An OWL-Based Ontology for NIS2 Directive Article 21 Compliance',
    Author: 'Abdul Kader',
    Subject: 'NIS2 Compliance Ontology - Master Thesis',
  }
});

Object.entries(FONT_FILES).forEach(([name, file]) => {
  doc.registerFont(name, file);
});

doc.pipe(fs.createWriteStream('NIS2_Thesis_Abdul_Kader.pdf'));

// ── Page numbering ────────────────────────────────────────────────────
function stampPageNumber(pageNumber) {
  const { x, y } = doc;
  const bottomMargin = doc.page.margins.bottom;
  const activeFont = doc._font;
  const activeFontSize = doc._fontSize;
  const activeFillColor = doc._fillColor;
  doc.save();
  doc.page.margins.bottom = 0;
  doc.font('Helvetica').fontSize(9)
    .text(`Page | ${pageNumber}`, doc.page.width - 112, doc.page.height - 35, {
      align: 'right',
      width: 72,
      lineBreak: false,
    });
  doc.page.margins.bottom = bottomMargin;
  doc.restore();
  doc._font = activeFont;
  doc._fontSize = activeFontSize;
  doc._fillColor = activeFillColor;
  doc.x = x;
  doc.y = y;
}

// ── Helpers ───────────────────────────────────────────────────────────
const LM = 80, RM = 72, PW = 595.28, PH = 841.89;
const BODY_W = PW - LM - RM;

function newPage() { doc.addPage(); }

function bottomY() {
  return doc.page.height - doc.page.margins.bottom;
}

function resetCursor() {
  doc.x = LM;
}

function ensureSpace(minHeight) {
  if (doc.y + minHeight > bottomY()) {
    newPage();
  }
}

function chapterHeading(num, title) {
  resetCursor();
  doc.moveDown(1);
  doc.font('Helvetica-Bold').fontSize(14)
     .text(`${num}. ${title.toUpperCase()}`, { align: 'left' });
  doc.moveDown(0.6);
  doc.moveTo(LM, doc.y).lineTo(PW - RM, doc.y).lineWidth(1).stroke();
  doc.moveDown(0.8);
}

function sectionHeading(text) {
  resetCursor();
  doc.moveDown(0.8);
  doc.font('Helvetica-Bold').fontSize(12).text(text);
  doc.moveDown(0.4);
}

function subHeading(text) {
  resetCursor();
  doc.moveDown(0.5);
  doc.font('Helvetica-Bold').fontSize(11).text(text);
  doc.moveDown(0.3);
}

function body(text) {
  resetCursor();
  doc.font('Helvetica').fontSize(11).text(text, { align: 'justify', lineGap: 3 });
  doc.moveDown(0.5);
}

function leftBody(text) {
  resetCursor();
  doc.font('Helvetica').fontSize(11).text(text, { align: 'left', lineGap: 3 });
  doc.moveDown(0.5);
}

function bullet(text) {
  resetCursor();
  doc.font('Helvetica').fontSize(11)
     .text(`•  ${text}`, { indent: 20, align: 'justify', lineGap: 2 });
}

function numbered(n, text) {
  resetCursor();
  doc.font('Helvetica').fontSize(11)
     .text(`${n}.  ${text}`, { indent: 20, align: 'justify', lineGap: 2 });
}

function italicBody(text) {
  resetCursor();
  doc.font('Helvetica-Oblique').fontSize(11).text(text, { align: 'justify', lineGap: 3 });
  doc.moveDown(0.5);
}

function formulaBody(text) {
  resetCursor();
  doc.font('Helvetica-Oblique').fontSize(10.5).text(text, {
    align: 'left',
    indent: 12,
    lineGap: 3,
  });
  doc.moveDown(0.5);
}

function formulaLines(lines) {
  resetCursor();
  const x = LM + 12;
  const width = BODY_W - 24;
  doc.font('Helvetica-Oblique').fontSize(10.5);
  lines.forEach(line => {
    doc.text(line, x, doc.y, { width, align: 'left', lineGap: 2 });
  });
  doc.x = LM;
  doc.moveDown(0.5);
}

function academicAnalysisPages(pages) {
  pages.forEach(page => {
    ensureSpace(150);
    sectionHeading(page.heading);
    page.paragraphs.forEach(paragraph => body(paragraph));
    if (page.points) {
      page.points.forEach(point => bullet(point));
      doc.moveDown(0.4);
    }
    if (page.implication) {
      subHeading('Analytical implication');
      body(page.implication);
    }
  });
}

function academicAnalysisPage(heading, context, finding, limitation) {
  academicAnalysisPages([{
    heading,
    paragraphs: [
      context,
      finding,
      limitation,
    ],
    implication: 'The result strengthens the traceability between the research problem, the formal artifact, and the limits of the claims made in this thesis.'
  }]);
}

const measureAnalyses = [
  {
    id: 'RiskAnalysisPolicy',
    ref: '21(2)(a)',
    category: 'OrganizationalMeasure',
    ontology: 'ExampleRiskAnalysisPolicy is based on ISO27001, addresses DataBreachRisk and InsiderThreatRisk, and applies to CoreBankingSystem and InternalITInfrastructure.',
    interpretation: 'The measure establishes the governance basis for deciding which assets, threats, vulnerabilities, likelihoods, and consequences require treatment. A policy is not merely a document: it should define ownership, assessment criteria, review frequency, risk acceptance authority, and the relationship between business objectives and security decisions.',
    evidence: 'Approved risk methodology; current risk register; asset and service inventory; treatment plans; management approvals; review records; links between identified risks and implemented controls.',
    limitation: 'The ontology confirms category presence and related risks but does not calculate residual risk, test whether the methodology is consistently applied, or determine whether management acceptance decisions are reasonable.'
  },
  {
    id: 'IncidentHandling',
    ref: '21(2)(b)',
    category: 'OperationalMeasure',
    ontology: 'ExampleIncidentHandling is aligned with ENISAGuidelines, addresses RansomwareRisk, prevents RansomwareIncident, minimizes ServiceDisruptionIncident, and applies to all three example systems.',
    interpretation: 'Incident handling requires an operational capability spanning preparation, detection, triage, containment, eradication, recovery, communication, and post-incident learning. Its effectiveness depends on defined roles, escalation thresholds, evidence preservation, contact paths, and integration with reporting and business-continuity procedures.',
    evidence: 'Incident-response policy and playbooks; duty rosters; alert and ticket records; exercise reports; forensic procedures; lessons-learned actions; notification decision logs; recovery validation.',
    limitation: 'An asserted IncidentHandling instance cannot demonstrate detection coverage, response speed, staff readiness, or whether reporting deadlines are met under real operational pressure.'
  },
  {
    id: 'BusinessContinuityManagement',
    ref: '21(2)(c)',
    category: 'OperationalMeasure',
    ontology: 'ExampleBusinessContinuity is based on ISO27001, addresses DDoSRisk, minimizes ServiceDisruptionIncident, and applies to CoreBankingSystem.',
    interpretation: 'Continuity management connects cybersecurity controls to service resilience. It requires priorities derived from business-impact analysis, recovery objectives, tested backup and restoration processes, crisis decision structures, alternative communications, and coordinated return to normal operation.',
    evidence: 'Business-impact analysis; recovery-time and recovery-point objectives; backup inventories; immutable or offline backup controls; restoration tests; disaster-recovery exercises; crisis plans and contact lists.',
    limitation: 'The current model records that continuity measures exist but does not represent dependencies, recovery sequencing, test recency, backup integrity, or the difference between documented and achievable recovery objectives.'
  },
  {
    id: 'SupplyChainSecurity',
    ref: '21(2)(d)',
    category: 'OrganizationalMeasure',
    ontology: 'ExampleSupplyChainSecurity is based on ISO27002 and addresses SupplyChainCompromiseRisk.',
    interpretation: 'Supply-chain security extends the assessment boundary beyond the regulated entity. Relevant practices include supplier criticality assessment, security requirements in contracts, assurance over service providers, vulnerability notification, concentration-risk analysis, controlled access, and termination or transition arrangements.',
    evidence: 'Supplier inventory and criticality ratings; due-diligence records; contractual clauses; assurance reports; software-component inventories; third-party access reviews; incident-notification clauses; exit plans.',
    limitation: 'The ontology links the measure to a risk and standard but does not represent individual suppliers, fourth-party dependencies, contractual exceptions, assurance quality, or changes in supplier posture.'
  },
  {
    id: 'SecureDevelopment',
    ref: '21(2)(e)',
    category: 'TechnicalMeasure',
    ontology: 'ExampleSecureDevelopment is based on NISTFramework, addresses SupplyChainCompromiseRisk, prevents UnauthorizedAccessIncident, and applies to WebApplicationPlatform.',
    interpretation: 'Secure development covers acquisition, development, maintenance, vulnerability handling, and disclosure. It should integrate security requirements, threat modeling, code review, dependency control, testing, release approval, patch management, and coordinated vulnerability disclosure into the system lifecycle.',
    evidence: 'Secure-development standard; threat models; source-review records; SAST and DAST results; dependency and container scans; software bills of materials; penetration tests; patch metrics; vulnerability-disclosure procedure.',
    limitation: 'The model does not evaluate development pipelines, severity thresholds, remediation timeliness, test coverage, exploitable findings, or the provenance and integrity of acquired components.'
  },
  {
    id: 'EffectivenessAssessment',
    ref: '21(2)(f)',
    category: 'OrganizationalMeasure',
    ontology: 'ExampleEffectivenessAssessment is based on ISO27001 and addresses DataBreachRisk.',
    interpretation: 'Effectiveness assessment closes the governance loop by asking whether measures operate as intended and reduce relevant risk. It includes metrics, control testing, internal audit, independent assurance, vulnerability assessment, exercise outcomes, corrective actions, and management review.',
    evidence: 'Control-test plans and samples; audit reports; key risk and performance indicators; penetration-test reports; exercise evaluations; corrective-action registers; overdue-action escalation; management-review minutes.',
    limitation: 'Boolean quality assertions cannot establish effectiveness. The ontology needs evidence objects, assessment dates, assessors, methods, findings, and remediation status before it can support assurance conclusions.'
  },
  {
    id: 'BasicCyberHygiene',
    ref: '21(2)(g)',
    category: 'OperationalMeasure',
    ontology: 'ExampleBasicCyberHygiene is based on CISControls, addresses InsiderThreatRisk, and prevents UnauthorizedAccessIncident.',
    interpretation: 'Cyber hygiene provides the baseline practices on which more specialized measures depend. It includes secure configuration, timely updates, account discipline, endpoint protection, network segmentation, phishing resistance, logging, and routine handling of removable media and mobile devices.',
    evidence: 'Configuration baselines; patch-compliance reports; vulnerability-aging metrics; endpoint coverage; account-review records; phishing simulations; logging coverage; exception registers; remediation tickets.',
    limitation: 'The ontology records one example instance and cannot show deployment coverage, configuration drift, unsupported assets, approved exceptions, or whether hygiene practices remain effective over time.'
  },
  {
    id: 'TrainingAwareness',
    ref: '21(2)(g), training component',
    category: 'OrganizationalMeasure',
    ontology: 'ExampleTrainingAwareness is based on ENISAGuidelines and addresses InsiderThreatRisk.',
    interpretation: 'Training and awareness should be risk-based, recurring, role-sensitive, and measurable. General awareness is necessary but insufficient for administrators, developers, incident responders, executives, procurement staff, and personnel with access to sensitive or safety-critical systems.',
    evidence: 'Training curriculum and attendance; role-to-training matrix; completion and assessment results; phishing simulations; induction and refresher records; targeted campaigns; remediation for repeated failures.',
    limitation: 'The current representation cannot distinguish attendance from competence, verify role coverage, measure behavioral change, or establish whether training content reflects current threats and organizational responsibilities.'
  },
  {
    id: 'HumanResourcesSecurity',
    ref: '21(2)(i)',
    category: 'OrganizationalMeasure',
    ontology: 'ExampleHumanResourcesSecurity is based on ISO27002, addresses InsiderThreatRisk, and prevents DataBreachIncident.',
    interpretation: 'Human-resources security connects the employment lifecycle with access control and asset accountability. Relevant controls include screening where lawful, confidentiality duties, least privilege, segregation of duties, joiner-mover-leaver processes, privileged-access review, disciplinary processes, and return of assets.',
    evidence: 'Screening and confidentiality records; role definitions; access approvals; periodic entitlement reviews; privileged-account inventories; transfer and termination tickets; asset-return evidence; segregation-of-duty reviews.',
    limitation: 'The ontology does not model people, roles, employment events, access entitlements, legal constraints on screening, or the timeliness and completeness of offboarding actions.'
  },
  {
    id: 'Encryption',
    ref: '21(2)(h)',
    category: 'TechnicalMeasure',
    ontology: 'ExampleEncryption is based on NISTFramework, addresses DataBreachRisk, prevents DataBreachIncident, and applies to CoreBankingSystem and WebApplicationPlatform.',
    interpretation: 'Cryptography must be governed as a lifecycle rather than treated as a binary feature. Scope includes approved algorithms and protocols, key generation and storage, certificate management, rotation, revocation, backup, recovery, access to key material, and migration from deprecated mechanisms.',
    evidence: 'Cryptographic policy; data-classification mapping; encryption inventories; TLS and certificate scans; key-management architecture; rotation records; hardware-security-module configuration; exception and migration plans.',
    limitation: 'A true value for isStateOfTheArt does not prove algorithm strength, key protection, protocol configuration, coverage of data at rest and in transit, or readiness for cryptographic deprecation.'
  },
  {
    id: 'MultiFactorAuthentication',
    ref: '21(2)(j), authentication component',
    category: 'TechnicalMeasure',
    ontology: 'ExampleMultiFactorAuthentication is based on CISControls, addresses DataBreachRisk, prevents UnauthorizedAccessIncident, and applies to InternalITInfrastructure and CoreBankingSystem.',
    interpretation: 'MFA reduces reliance on reusable passwords but must be scoped and implemented carefully. Priority areas include privileged access, remote access, cloud administration, sensitive applications, recovery processes, enrollment, factor replacement, bypass controls, and resistance to phishing and push fatigue.',
    evidence: 'Authentication policy; application and account coverage; identity-provider configuration; privileged-access reports; factor-enrollment records; bypass and recovery logs; conditional-access rules; failed and anomalous authentication events.',
    limitation: 'The class assertion does not indicate coverage percentage, factor strength, exemptions, legacy systems, enrollment assurance, session controls, or weaknesses in account recovery.'
  },
  {
    id: 'SecureCommunications',
    ref: '21(2)(j), communications component',
    category: 'TechnicalMeasure',
    ontology: 'ExampleSecureCommunications is based on ENISAGuidelines and addresses DataBreachRisk.',
    interpretation: 'Secure communications cover ordinary and emergency channels used for operational coordination. The assessment should consider confidentiality, integrity, availability, identity assurance, metadata exposure, device management, retention, emergency alternatives, and the ability to communicate when primary infrastructure is unavailable.',
    evidence: 'Approved communication-channel inventory; encryption and identity settings; mobile-device controls; emergency communication plans; continuity exercises; retention settings; access reviews; supplier assurance.',
    limitation: 'The model does not distinguish communication modes, emergency dependencies, endpoint security, metadata protection, interoperability, or availability during a widespread outage.'
  },
];

function renderMeasureAnalysis() {
  sectionHeading('4.11  Measure-by-Measure Critical Analysis');
  body('The following analysis interprets each modeled measure as an assessment domain rather than a checkbox. For every class, it distinguishes the ontology assertion from the organizational evidence required to support that assertion. This distinction is essential because the knowledge graph can organize claims and reveal missing categories, but the credibility of those claims depends on evidence collected through governance, technical testing, and audit procedures.');
  measureAnalyses.forEach((measure, index) => {
    subHeading(`4.11.${index + 1}  ${measure.id} — Article ${measure.ref}`);
    body(`${measure.interpretation} In the ontology, ${measure.id} is modeled as a subclass of ${measure.category}. ${measure.ontology}`);
    body(`A defensible assessment would examine the following evidence: ${measure.evidence} The evidence should identify scope, owner, approval status, review date, and any exceptions so that the graph represents more than an unsupported declaration.`);
    body(`Modeling limitation: ${measure.limitation} This limitation does not invalidate the class; it defines the boundary between semantic coverage analysis and assurance over real implementation.`);
  });

  sectionHeading('4.12  Evidence Expectations Across the Twelve Measures');
  tableSimple(['Measure', 'Primary Evidence', 'Indicative Failure Condition'], measureAnalyses.map(m => [
    m.id,
    m.evidence,
    m.limitation,
  ]));
}

const endpointAnalyses = [
  ['/api/ontology', 'GET', 'Transforms parsed RDF into nodes and edges for the browser. It preserves labels, comments, selected properties, subclass links, and local object-property relations.', 'Useful for exploration, but blank-node OWL structures are not rendered as full logical expressions and should be inspected in the ontology source or a dedicated OWL editor.'],
  ['/api/validate', 'GET', 'Checks parse success, ontology declaration, equivalent-class and disjointness axioms, presence of the twelve measure classes, and cycles in named subclass edges. It reports counts for classes, properties, instances, and hierarchy edges.', 'This is a structural validator. It does not perform model-theoretic consistency checking, datatype reasoning, profile validation, or comparison of Turtle and RDF/XML graphs.'],
  ['/api/sparql', 'GET', 'Parses SELECT queries with sparqljs and evaluates basic graph patterns plus a limited set of filters over an N3 store. Results are returned using a SPARQL-JSON-like structure.', 'OPTIONAL, UNION, aggregation, property paths, subqueries, named graphs, ordering, and many expression forms are not executed, even if some can be parsed.'],
  ['/api/reason', 'GET', 'Maps measure individuals to one of the twelve required classes, gathers implementsMeasure assertions, classifies complete and incomplete entities, checks entity-type overlap, and derives usesStandard links.', 'The procedure mirrors selected ontology patterns but is not a complete OWL reasoner. In particular, absence of a measure is handled procedurally rather than inferred through open-world complement semantics.'],
  ['/api/shacl', 'GET', 'Implements the three local shape intentions in JavaScript: category coverage for entities, quality booleans and descriptions for measures, and controlled risk levels.', 'It is not a general SHACL engine and does not parse and execute arbitrary shapes from the shapes graph. Results should be described as shape-specific structural validation.'],
  ['/api/check-entity', 'POST', 'Validates a user-supplied entity name, type, and measure list; removes unknown measure identifiers; calculates coverage; and derives standards and addressed risks from the example measure relations.', 'It assesses submitted category claims only. It does not persist the entity, validate evidence, or check whether the selected controls are appropriate, proportionate, effective, and state of the art.'],
];

function renderEndpointAnalysis() {
  sectionHeading('7.9  Endpoint-Level Implementation Analysis');
  body('The service boundary is small enough to examine endpoint by endpoint. This analysis is based on the implemented routes rather than an idealized architecture. It clarifies what each endpoint computes, which ontology features it uses, and which semantic claims it cannot support.');
  endpointAnalyses.forEach(([endpoint, method, behavior, boundary], index) => {
    subHeading(`7.9.${index + 1}  ${method} ${endpoint}`);
    body(behavior);
    body(`Interpretive boundary: ${boundary}`);
  });
  tableSimple(['Endpoint', 'Method', 'Implemented Responsibility', 'Principal Boundary'], endpointAnalyses);
}

const evaluationCases = [
  ['Complete essential entity', '12 recognized measure categories', 'CompliantEntity; 100%; no missing categories', 'Positive-path classification and standards/risk enrichment'],
  ['Incomplete important entity', '5 recognized categories', 'NonCompliantEntity; 42%; seven named gaps', 'Negative-path gap detection'],
  ['Boundary entity', '11 recognized categories', 'NonCompliantEntity; 92%; one named gap', 'All twelve categories are required by the model'],
  ['Empty measure set', 'Valid entity metadata; zero categories', 'NonCompliantEntity; 0%; twelve gaps', 'Lower boundary and complete omission reporting'],
  ['Duplicate identifiers', 'Repeated valid category names', 'Duplicates removed by Set; score based on unique categories', 'Input normalization'],
  ['Unknown identifier', 'Valid categories plus unrecognized value', 'Unknown value ignored; no score inflation', 'Vocabulary control'],
  ['Invalid entity type', 'Type outside EssentialEntity/ImportantEntity', 'HTTP 400 error', 'Request validation'],
  ['Missing entity name', 'Blank or absent name', 'HTTP 400 error', 'Mandatory identity field'],
  ['Missing quality boolean', 'Measure lacks one Article 21(1) flag', 'SHACL warning', 'Quality-property completeness'],
  ['Invalid risk level', 'Value outside low/medium/high/critical', 'SHACL violation', 'Controlled vocabulary enforcement'],
  ['Entity typed both categories', 'EssentialEntity and ImportantEntity', 'Disjointness violation in reason response', 'Mutual-exclusion check'],
  ['Unsupported SPARQL form', 'Non-SELECT query', 'HTTP 501 error', 'Explicit query-engine scope'],
];

function renderEvaluationDesign() {
  sectionHeading('9.9  Extended Test Design');
  body('The two asserted example entities verify the main complete and incomplete paths, but a stronger evaluation also considers boundaries, invalid input, normalization, and data-quality failures. Table 9.4 defines reproducible cases derived from the implemented service and shape behavior. These cases distinguish ontology-level expectations from API-level request handling.');
  tableSimple(['Case', 'Input Condition', 'Expected Result', 'Purpose'], evaluationCases);
  body('The cases can be automated as regression tests by starting the service in a controlled environment, submitting fixed requests, and comparing status codes and response fields against stored expectations. Ontology mutations should be tested separately: removing a class, changing a measure type, deleting a quality property, or introducing a conflicting entity type should produce predictable validation changes.');

  sectionHeading('9.10  Interpretation of Coverage Scores');
  body('The application calculates complianceScore as the number of unique recognized measure categories divided by twelve, rounded to the nearest whole percentage. This score is a coverage indicator, not a risk-weighted maturity score. Each category contributes equally, although the organizational effort and residual risk associated with the categories can differ substantially. A score of 92 percent therefore means that eleven modeled categories were selected; it does not mean that the entity has achieved 92 percent of legal compliance or 92 percent risk reduction.');
  body('Equal weighting is acceptable for communicating the ontology’s minimum-category rule, because the formal CompliantEntity definition requires every category. It would be misleading if reused for prioritization without additional dimensions. A richer assessment could record evidence quality, scope coverage, control effectiveness, risk criticality, remediation age, and confidence. Those dimensions should remain separate from the binary classification so that management can see both whether a category is represented and how strongly it is supported.');

  sectionHeading('9.11  Reproducibility and Independent Verification');
  body('A reproducible evaluation should identify the ontology version, application commit, Node.js version, operating environment, input dataset, expected outputs, and timing method. The public project repository (Kader, 2026) provides the ontology and application artifacts; a final archived release should additionally record the exact commit evaluated in this thesis. Performance figures remain indicative because the server code does not contain a dedicated benchmark harness. Future measurements should include warm-up, repeated samples, percentile latency, concurrent requests, memory consumption, and separate parsing from query execution.');
  body('Independent verification should use a standards-complete RDF and OWL toolchain. The Turtle graph can be parsed and counted independently; the equivalent-class axiom can be tested in Protégé with HermiT or Pellet; the SHACL graph can be executed with pySHACL or TopBraid; and the competency queries can be run in Apache Jena, RDF4J, or another SPARQL 1.1 implementation. Agreement across independent tools would provide stronger evidence than agreement between the ontology and custom code written from the same assumptions.');
}

function renderFormalModelAnalysis() {
  sectionHeading('6.14  Formal Semantics of the Compliance Pattern');
  body('The CompliantEntity definition contains Entity plus twelve existential restrictions in one owl:intersectionOf list. Each restriction requires at least one implementsMeasure value belonging to the corresponding measure class. Under OWL semantics, an individual satisfying every conjunct can be classified as CompliantEntity even when that type is not asserted explicitly. The definition is reusable because the measure values may be any individuals of the required classes; they need not be the twelve example individuals included in the ontology.');
  body('The universal restriction attached to Entity states that every implementsMeasure value of an Entity is a RiskManagementMeasure. This does not create a measure, impose a minimum number of values, or validate a closed list. It constrains the type of values when the relation is known. The existential restrictions in CompliantEntity provide the positive minimum conditions. SHACL provides the closed-world reporting behavior when submitted entity data omits one or more categories.');
  body('The NonCompliantEntity definition requires special care. It is the intersection of Entity and the complement of CompliantEntity. Under the open-world assumption, failure to prove that an individual is compliant is not generally sufficient to infer that it belongs to the complement. A complete reasoner would need enough information to establish non-membership. The JavaScript service instead treats the locally observed measure set as complete and reports missing categories procedurally. The report therefore distinguishes OWL entailment from application-level closed-world classification.');

  sectionHeading('6.15  Axiom-to-Requirement Traceability Matrix');
  tableSimple(['Ontology Construct', 'Implemented Form', 'Research Purpose', 'Semantic Boundary'], [
    ['Entity range restriction', 'implementsMeasure only RiskManagementMeasure', 'Constrains the type of known implemented measures', 'Does not require any measure to exist'],
    ['CompliantEntity equivalence', 'Entity intersected with 12 someValuesFrom restrictions', 'Defines sufficient and necessary category coverage', 'Does not evaluate quality or evidence'],
    ['NonCompliantEntity equivalence', 'Entity intersected with complementOf CompliantEntity', 'Represents logical non-compliance', 'Non-membership is difficult to infer under open-world semantics'],
    ['Entity-category disjointness', 'EssentialEntity disjointWith ImportantEntity', 'Prevents incompatible regulatory typing', 'Assumes categories are mutually exclusive in the modeled context'],
    ['Measure-category disjointness', 'Technical, Operational, Organizational in AllDisjointClasses', 'Makes high-level measure categories exclusive', 'May be too strong for multi-nature controls if controls and legal realizations are conflated'],
    ['Inverse property', 'implementsMeasure inverseOf isImplementedBy', 'Supports navigation in both directions', 'Inverse facts require a reasoner or query rewriting if not materialized'],
    ['Property chain', 'implementsMeasure o basedOnStandard -> usesStandard', 'Derives entity-standard relations', 'Indicates relation, not certification'],
    ['Transitive property', 'hasSubMeasure transitive', 'Supports nested decomposition', 'No sub-measure instances are currently asserted'],
    ['Functional quality properties', 'At most one boolean value per measure', 'Avoids contradictory duplicate values', 'A missing value remains possible in OWL'],
    ['SKOS mappings', 'exactMatch or closeMatch links', 'Supports cross-framework navigation', 'Mapping strength needs expert governance'],
  ]);

  sectionHeading('6.16  SHACL Constraint Semantics');
  body('Article21ComplianceShape targets Entity and contains twelve qualified minimum-count constraints over implementsMeasure. Each constraint tests whether at least one value conforms to a class-specific value shape. This structure is more precise than a simple minimum count of twelve because twelve values of the same class would not satisfy the remaining eleven categories. The shape also requires all implemented values to be RiskManagementMeasure instances, providing a structural check aligned with the ontology range.');
  body('MeasureQualityShape targets RiskManagementMeasure and combines datatype, minimum-count, maximum-count, and hasValue constraints for isAppropriate, isProportionate, and isStateOfTheArt. The severity is Warning rather than Violation, reflecting that these assertions concern qualitative assessment. The shape also requests a textual measureDescription at Info severity. This severity design separates mandatory category coverage from documentation and quality warnings, although an organization may adopt stricter local policy.');
  body('RiskLevelShape targets CybersecurityRisk and requires exactly one string selected from low, medium, high, or critical. The controlled list improves consistency for queries and visual displays. It remains a simplified ordinal representation: no scoring methodology, likelihood, impact, time horizon, or assessment date is modeled. A production risk ontology would need these dimensions and explicit provenance.');

  sectionHeading('6.17  Ontology Inventory and Internal Consistency');
  body('Direct parsing of the Turtle source yields 526 triples. The graph declares 28 OWL classes, 9 object properties, 5 datatype properties, 1 annotation property, 31 named individuals, 13 restrictions, 4 functional-property declarations, and 1 transitive-property declaration. The named individuals include five standards, five risks, four incidents, twelve example measures, two entity examples, and three network and information systems.');
  body('These counts are useful regression indicators but not quality measures by themselves. A larger graph is not necessarily a better ontology. Their value lies in detecting unexpected structural changes: a missing measure class, a lost restriction, or a changed number of example instances can trigger review. Counts should be combined with semantic tests, shape validation, competency questions, and independent reasoning.');

  sectionHeading('6.18  Risk and System Coverage in the Example Graph');
  tableSimple(['Resource', 'Type / Level', 'Connected Measures', 'Analytical Observation'], [
    ['DataBreachRisk', 'CybersecurityRisk / high', 'RiskAnalysisPolicy, EffectivenessAssessment, Encryption, MultiFactorAuthentication, SecureCommunications', 'Broad coverage across governance, assurance, cryptography, authentication, and communications'],
    ['RansomwareRisk', 'CybersecurityRisk / critical', 'IncidentHandling', 'Current graph emphasizes response; prevention and recovery links could be expanded'],
    ['DDoSRisk', 'CybersecurityRisk / high', 'BusinessContinuityManagement', 'Focuses on impact and recovery rather than preventive network controls'],
    ['InsiderThreatRisk', 'CybersecurityRisk / medium', 'RiskAnalysisPolicy, BasicCyberHygiene, TrainingAwareness, HumanResourcesSecurity', 'Combines governance, operational baseline, awareness, and personnel controls'],
    ['SupplyChainCompromiseRisk', 'CybersecurityRisk / critical', 'SupplyChainSecurity, SecureDevelopment', 'Connects supplier governance with technical lifecycle practices'],
    ['CoreBankingSystem', 'NetworkInformationSystem', 'RiskAnalysisPolicy, IncidentHandling, BusinessContinuityManagement, Encryption, MultiFactorAuthentication', 'Receives the broadest explicit system coverage'],
    ['WebApplicationPlatform', 'NetworkInformationSystem', 'IncidentHandling, SecureDevelopment, Encryption', 'Coverage centers on software lifecycle, protection, and response'],
    ['InternalITInfrastructure', 'NetworkInformationSystem', 'RiskAnalysisPolicy, IncidentHandling, MultiFactorAuthentication', 'Coverage could be extended to hygiene, continuity, and encryption'],
  ]);
  body('The mapping demonstrates the graph’s analytical potential but also reveals sparsity. A measure without appliesToSystem does not necessarily lack scope; the relation may simply be unasserted. Under open-world semantics the graph cannot assume that the listed systems are exhaustive. A production assessment should model system inventories, ownership, criticality, dependencies, and the explicit scope of each measure.');
}

function renderMethodologicalExpansion() {
  sectionHeading('5.13  Operationalization of Legal Concepts');
  body('Operationalization converts abstract legal concepts into observable data requirements. For category coverage, the observable claim is an implementsMeasure relation to an individual typed as one of the twelve classes. For appropriateness, proportionality, and state of the art, the prototype uses boolean properties. For risk and system scope, it uses addressesRisk and appliesToSystem. For external context, it uses basedOnStandard and SKOS mappings.');
  body('This operationalization is deliberately modest. Boolean values simplify demonstration but compress judgments that normally require criteria, evidence, reviewer identity, date, and rationale. A more mature model would represent an Assessment class connecting a measure, assessor, evidence set, method, result, confidence, validity period, and findings. The present properties can then become derived summaries rather than unsupported primary facts.');

  sectionHeading('5.14  Data Collection Protocol for a Real Assessment');
  body('A real deployment would begin by defining the assessment boundary: legal entity, regulated services, locations, systems, suppliers, and responsible management bodies. Data collection would then combine document review, interviews, configuration evidence, technical tests, and observation. Each evidence item should receive a stable identifier and metadata describing source, owner, collection date, sensitivity, retention, and the measure claims it supports.');
  body('Assessors should distinguish design effectiveness from operating effectiveness. A policy may be appropriately designed but not followed; a technical control may be deployed but exclude critical assets; a recovery plan may be complete but untested. The ontology currently records category implementation, so the assessment protocol must prevent a single document from being treated as sufficient evidence for a complex operational measure.');
  body('Conflicting evidence should be preserved rather than overwritten. For example, an approved policy may require MFA while an application inventory shows uncovered systems. The knowledge graph should represent both the policy claim and the observed exception, allowing the assessment conclusion to cite its basis. This approach supports auditability and avoids reducing compliance to self-attestation.');

  sectionHeading('5.15  Evidence Quality Criteria');
  tableSimple(['Criterion', 'Assessment Question', 'Example Strong Evidence', 'Example Weak Evidence'], [
    ['Relevance', 'Does the evidence directly support the measure and scoped system?', 'Configuration export tied to named assets', 'Generic vendor brochure'],
    ['Authenticity', 'Can source and integrity be established?', 'Signed report from controlled repository', 'Unattributed screenshot'],
    ['Currency', 'Is it recent enough for the control and risk?', 'Current-quarter access review', 'Undated historical document'],
    ['Completeness', 'Does it cover the relevant population and exceptions?', 'Full asset report with exclusions explained', 'Small convenience sample'],
    ['Consistency', 'Does it agree with other records and observations?', 'Policy, tickets, and configuration align', 'Policy contradicts deployed settings'],
    ['Repeatability', 'Can another reviewer reproduce the result?', 'Documented query and retained dataset', 'Manual conclusion without method'],
    ['Accountability', 'Is an owner responsible for the claim and remediation?', 'Named control owner and approval', 'Shared mailbox with no decision authority'],
  ]);

  sectionHeading('5.16  Ethical and Governance Considerations');
  body('Compliance knowledge graphs may contain sensitive details about vulnerabilities, system architecture, suppliers, personnel, incidents, and control weaknesses. Data minimization and access control are therefore part of the research design, not merely deployment concerns. The graph should expose only the information required for the assessment purpose, and evidence repositories may need to remain separate from the semantic summary.');
  body('Automated classification can also create governance risk if decision makers treat a concise label as more authoritative than the underlying data. The interface should display missing evidence, assumptions, assessment dates, and confidence, and it should permit expert challenge. Responsibility for legal compliance remains with the regulated entity and its accountable management, not with the ontology or software.');
}

function renderLiteratureSynthesis() {
  sectionHeading('2.11  Ontologies Compared with GRC Data Models');
  body('Governance, risk, and compliance platforms commonly store controls, requirements, findings, owners, and evidence in relational or document-oriented schemas. These systems can provide mature workflows, access control, reminders, and audit trails. Their weakness is not necessarily lack of automation, but that semantic relationships are often implicit in application configuration and difficult to exchange across products. An ontology makes class and property meaning explicit and assigns stable identifiers that can be reused by multiple tools.');
  body('The two approaches are complementary. A production implementation would not replace workflow, evidence repositories, or ticket management with OWL. Instead, the ontology could provide a semantic integration layer: a GRC requirement record could link to an Article 21 class; a technical control could be related to systems and risks; and findings could refer to the exact measure and evidence claim they affect. This division preserves operational capabilities while improving interoperability and traceability.');

  sectionHeading('2.12  Legal Rules, Description Logic, and Constraint Languages');
  body('Legal compliance systems use several formal paradigms. Deontic and rule-based languages are suitable for obligations, permissions, exceptions, deadlines, and contrary-to-duty structures. Description logics are strong at taxonomy, class definitions, consistency, and relation-based inference. Constraint languages are strong at testing whether a concrete data submission contains required values. Article 21 includes aspects relevant to all three paradigms.');
  body('The present ontology emphasizes classification and structural coverage. It does not formalize temporal obligations, competent-authority procedures, exceptions, or sanctions as executable legal rules. SHACL is used to report missing data, while procedural code calculates a coverage score. A complete legal-compliance architecture could combine an ontology for shared concepts, a rule layer for normative and temporal conditions, SHACL for data contracts, and provenance for evidentiary support.');

  sectionHeading('2.13  Ontology Evaluation Criteria');
  body('Ontology evaluation should distinguish correctness, completeness, clarity, coherence, conciseness, extensibility, and practical usefulness. Correctness asks whether represented statements are defensible in the domain. Completeness asks whether the declared scope is covered. Coherence asks whether axioms permit unintended contradictions. Clarity concerns labels, comments, and understandable modeling choices. Conciseness discourages redundant concepts. Extensibility concerns whether new sectors, evidence, and legal provisions can be added without redesigning the core.');
  tableSimple(['Criterion', 'Application to This Thesis', 'Current Evidence', 'Remaining Work'], [
    ['Correctness', 'Legal categories and semantic relations reflect Article 21', 'Article references, source review, corrected (a)-(j) mapping', 'Independent legal review'],
    ['Completeness', 'All ten legal categories covered through twelve classes', 'Class and restriction inventory', 'Sub-requirements and implementing acts'],
    ['Coherence', 'Class and property axioms do not create unintended conflict', 'Parsing, disjointness checks, controlled examples', 'Complete OWL reasoner'],
    ['Clarity', 'Terms and modeling decomposition are understandable', 'Labels, comments, chapter explanations', 'User study and multilingual labels'],
    ['Conciseness', 'No unnecessary duplicate domain concepts', 'Compact 526-triple graph', 'Refactor evidence and assessment concepts carefully'],
    ['Extensibility', 'Model can add evidence, sectors, and further NIS2 articles', 'Stable namespace and modular supporting classes', 'Versioning and migration policy'],
    ['Usefulness', 'Model answers competency questions and supports gap reporting', 'Queries, endpoints, demonstration cases', 'Practitioner evaluation'],
  ]);

  sectionHeading('2.14  Semantic Alignment as a Governance Activity');
  body('Cross-framework mapping is often presented as a technical lookup, but it is a governance activity. A mapping can vary by standard version, implementation context, scope, and interpretation. For example, an ISO/IEC 27001 control may support one part of an Article 21 category without satisfying the complete legal expectation. The mapping should therefore record who approved it, which editions were compared, what evidence supported it, and whether the relation is exact, close, broader, or narrower.');
  body('The ontology currently uses SKOS exactMatch once and closeMatch for the remaining mapped classes. The exactMatch assertion deserves especially careful review because SKOS exact matching is transitive and expresses strong interchangeability within mapping applications. Where legal and control concepts differ in scope or normative force, closeMatch or a custom evidence-backed mapping resource may be safer. Future work should replace bare links with mapping assertions carrying provenance and rationale.');

  sectionHeading('2.15  Explainability in Automated Compliance');
  body('Explainability requires more than displaying a final class. A reviewer should be able to identify the rule applied, input facts used, missing facts, source provision, mapping assumptions, and software version. The property-chain result in this thesis is explainable because the intermediate measure is retained as the reason an entity is associated with a standard. The missing-measure result is explainable because each absent class is named.');
  body('However, explanations can still overstate certainty. A statement such as "NonCompliantEntity" may be interpreted as a legal conclusion even when it is derived from incomplete self-reported data. The interface and report therefore distinguish a modeled coverage result from authoritative compliance determination. A mature system should present confidence, evidence status, assessment date, reviewer, and unresolved conflicts alongside the classification.');

  sectionHeading('2.16  Synthesis of Design Requirements from the Literature');
  tableSimple(['Requirement', 'Rationale', 'Implementation in This Thesis'], [
    ['Stable vocabulary', 'Supports shared interpretation and reuse', 'Persistent namespace and labeled OWL resources'],
    ['Traceable legal source', 'Makes modeling choices reviewable', 'articleReference and comments'],
    ['Formal category definition', 'Supports repeatable classification', 'CompliantEntity equivalent class'],
    ['Closed-world validation', 'Reports missing submission data', 'Article21ComplianceShape'],
    ['Quality constraints', 'Separates presence from qualitative claims', 'MeasureQualityShape'],
    ['Queryability', 'Tests competency questions and supports analysis', 'SPARQL SELECT subset'],
    ['Cross-framework links', 'Connects legal and technical vocabularies', 'SKOS mappings and basedOnStandard'],
    ['Explainable inference', 'Allows review of derived results', 'Missing lists and via-measure provenance'],
    ['Explicit limitations', 'Prevents automation from overstating legal certainty', 'Bounded reasoner and validation discussion'],
  ]);
}

function renderUseCaseExpansion() {
  sectionHeading('8.8  Scenario A: Core Banking Service Assessment');
  body('A banking assessment can begin with CoreBankingSystem as the critical service-supporting system. The example graph connects that system to RiskAnalysisPolicy, IncidentHandling, BusinessContinuityManagement, Encryption, and MultiFactorAuthentication. These relations cover governance, response, resilience, data protection, and access control. They provide a useful starting view of which modeled measures explicitly name the system.');
  body('The view is not complete enough for an audit. The assessor would also expect supply-chain controls for hosted components, secure-development controls for internally developed software, effectiveness testing, hygiene, personnel security, and secure communications to have a defined scope. Their absence from appliesToSystem does not prove that they are absent operationally. It identifies where explicit scope data should be added. This demonstrates how a knowledge graph can reveal documentation gaps without prematurely treating them as control failures.');
  body('Evidence could include system ownership, architecture, criticality, data classification, recovery objectives, identity-provider configuration, encryption status, incident playbooks, dependencies, and recent test results. Each evidence item should support a specific measure-system assertion and carry a date and owner. The resulting graph would permit queries such as which critical systems lack tested recovery evidence or which privileged-access controls have expired assessments.');

  sectionHeading('8.9  Scenario B: Ransomware Preparedness and Response');
  body('RansomwareRisk is marked critical and linked directly to ExampleIncidentHandling. The incident-handling individual prevents RansomwareIncident and minimizes ServiceDisruptionIncident. This captures response and impact reduction but leaves several important preventive and recovery relations implicit. BasicCyberHygiene, MultiFactorAuthentication, SecureDevelopment, BusinessContinuityManagement, and TrainingAwareness can all contribute to a ransomware scenario even though the current graph does not connect each one to RansomwareRisk.');
  body('An expanded scenario would model the attack chain: initial access, privilege escalation, lateral movement, encryption, service disruption, and recovery. Measures could then be linked to the phases they prevent, detect, or mitigate. Evidence would include phishing resistance, endpoint detection coverage, privileged-access controls, network segmentation, immutable backup tests, incident exercises, and restoration timing. This richer representation would support defense-in-depth analysis instead of assigning one risk to one primary measure.');
  body('The scenario also illustrates the difference between control presence and operational resilience. A backup policy may exist while restoration fails; MFA may be enabled for remote access but absent on legacy administration; an incident plan may exist without current contacts. The ontology should eventually represent assessment findings and exceptions so that contradictory evidence can coexist with policy claims.');

  sectionHeading('8.10  Scenario C: Software and Supplier Compromise');
  body('SupplyChainCompromiseRisk is linked to SupplyChainSecurity and SecureDevelopment, connecting organizational supplier governance with technical lifecycle security. This pairing is analytically important because modern software risk crosses organizational boundaries. A supplier can provide a compromised update, while weak internal build and deployment controls can allow that compromise to propagate.');
  body('A realistic assessment would identify critical suppliers, software services, libraries, build systems, repositories, signing infrastructure, deployment pipelines, and externally hosted components. SupplyChainSecurity evidence would cover due diligence, contracts, assurance, access, notification, and concentration risk. SecureDevelopment evidence would cover dependency scanning, software bills of materials, code review, build isolation, artifact signing, testing, patching, and vulnerability disclosure.');
  body('The current ontology can express that both measure categories address the same risk, but it cannot represent a dependency chain or identify which supplier affects which system. Adding Supplier, Product, Component, Contract, Dependency, and AssuranceReport classes would enable targeted queries. For example, the organization could ask which critical systems depend on suppliers without current assurance or which components with known vulnerabilities lack an approved remediation decision.');

  sectionHeading('8.11  Scenario D: Joiner-Mover-Leaver Control');
  body('HumanResourcesSecurity and TrainingAwareness address different but related aspects of personnel risk. A joiner requires screening where lawful, confidentiality obligations, role assignment, least-privilege access, asset issuance, and initial training. A mover requires entitlement reassessment and role-specific training. A leaver requires timely access revocation, asset return, transfer of responsibilities, and retention of necessary records.');
  body('The example graph links HumanResourcesSecurity to InsiderThreatRisk and DataBreachIncident and links TrainingAwareness to InsiderThreatRisk. A more detailed graph would represent employment events, roles, accounts, assets, approvals, and completion records. SHACL could then validate that every termination event has revocation and asset-return evidence, while SPARQL could identify overdue access reviews or personnel in privileged roles without current training.');
  body('This scenario demonstrates why one boolean implementation claim is insufficient. Personnel controls are processes whose effectiveness depends on timeliness and population coverage. Evidence must be sampled or monitored across events. The ontology can provide the shared vocabulary, but operational systems remain the source of identity, HR, ticket, and training records.');

  sectionHeading('8.12  Scenario E: Audit Preparation and Management Review');
  body('Before an audit or management review, the graph can be used to organize the evidence request. Each operational class provides a top-level assessment domain. Relations to systems, risks, incidents, and standards help explain scope and cross-framework relevance. SHACL can identify missing structural claims, while queries can list measures, evidence links, owners, and systems once those concepts are added.');
  body('The process should not begin by selecting all twelve checkboxes. It should begin with evidence collection and evaluation. Assessors determine whether the evidence supports implementation within scope, record exceptions and findings, and only then assert or approve the corresponding measure realization. This ordering reduces confirmation bias and turns the graph into an assessment record rather than a self-attestation form.');
  body('Management review needs an aggregate view without losing traceability. A dashboard may show category coverage, overdue findings, evidence age, critical system gaps, and risk concentration. Every aggregate should link back to underlying observations. The present prototype demonstrates the category layer; evidence and governance extensions are the next step required for credible audit use.');

  sectionHeading('8.13  Scenario Comparison');
  tableSimple(['Scenario', 'Primary Classes', 'Additional Data Needed', 'Decision Supported'], [
    ['Core banking', 'RiskAnalysisPolicy, IncidentHandling, BCM, Encryption, MFA', 'System criticality, dependencies, recovery and configuration evidence', 'System-level coverage review'],
    ['Ransomware', 'IncidentHandling plus preventive and recovery measures', 'Attack phases, control coverage, exercise and restoration results', 'Defense-in-depth and recovery readiness'],
    ['Supply chain', 'SupplyChainSecurity, SecureDevelopment', 'Suppliers, products, components, contracts, assurance', 'Third-party and software dependency risk'],
    ['Personnel lifecycle', 'HumanResourcesSecurity, TrainingAwareness', 'People, roles, accounts, events, assets, training records', 'Access and personnel process assurance'],
    ['Audit preparation', 'All operational classes', 'Evidence, owners, findings, dates, approvals', 'Traceable management and audit reporting'],
  ]);
}

function renderDiscussionExpansion() {
  sectionHeading('10.6  Evidence-Centered Ontology Extension');
  body('The most important conceptual extension is an evidence layer. A proposed Assessment individual would evaluate one MeasureImplementation for a defined Entity and scope. It would link to one or more Evidence items, identify an Assessor, record an assessment method and date, and produce a Result such as effective, partially effective, ineffective, or not assessed. Finding and RemediationAction classes could capture exceptions and improvement work.');
  body('This extension separates three claims that are currently compressed: the organization states that a measure exists; evidence shows how it is implemented; and an assessor concludes whether it is adequate. Keeping the claims separate permits disagreement and change over time. A policy owner can assert implementation while an auditor records an exception, without either statement being discarded. Provenance then explains why a summary result changed.');
  body('SHACL shapes could require current evidence for high-criticality systems and prevent an expired assessment from supporting a current conclusion. SPARQL could identify measures with no evidence, findings without owners, or critical systems whose latest effectiveness result is negative. OWL could still classify resources and infer relations, while procedural or rule logic would handle time windows and scoring.');

  sectionHeading('10.7  Regulatory Change Management');
  body('NIS2 implementation evolves through national transposition, sector guidance, implementing acts, supervisory practice, and updates to referenced standards. A maintainable ontology should distinguish the EU directive provision from jurisdiction-specific obligations and implementation guidance. Each requirement resource should carry jurisdiction, source, effective date, version, and status.');
  body('Change impact can then be computed over mappings. If a legal interpretation changes, queries can identify affected shapes, measure classes, evidence requests, systems, and assessment results. Stable identifiers should be retained when meaning remains compatible; breaking semantic changes should receive new version IRIs and migration notes. This is preferable to silently editing labels or constraints in place.');
  body('Governance should include a legal reviewer, ontology maintainer, cybersecurity subject-matter expert, and release approver. Proposed changes should include source citations, rationale, affected competency questions, test updates, and backward-compatibility assessment. The ontology becomes a controlled regulatory knowledge product rather than an informal data file.');

  sectionHeading('10.8  Human Oversight and Contestability');
  body('Automated compliance results should be contestable. A control owner may challenge a missing classification because evidence was not ingested; an auditor may challenge a positive classification because the asserted measure lacks scope; legal counsel may challenge a mapping because national law differs. The system should preserve these challenges and route them to accountable reviewers.');
  body('Human oversight is particularly important for proportionality and state of the art. These concepts depend on organizational context, risk, cost, available technology, and evolving professional practice. A boolean can record a conclusion, but it cannot explain the judgment. The interface should require rationale and evidence and should display who approved the conclusion and when it expires.');
  body('Contestability also improves model quality. Repeated disputes may reveal ambiguous classes, missing relationships, or overly strong constraints. Governance data can therefore become feedback for ontology evolution and training material for assessors.');

  sectionHeading('10.9  Production Deployment Architecture');
  body('A production architecture would separate the public ontology, organization-specific assessment graph, sensitive evidence repository, reasoning and validation services, and user-facing workflow. The ontology could be stored in version control and published as immutable releases. Assessment data could reside in an authenticated RDF store, while large or sensitive evidence remains in a document repository referenced by controlled identifiers.');
  body('Services should use a standards-complete SPARQL endpoint and a tested SHACL processor. Complete OWL reasoning may be performed during ontology release and selected assessment workflows rather than on every request. An API gateway should enforce authentication, authorization, rate limits, and audit logging. Encryption, backup, monitoring, vulnerability management, and incident response apply to the compliance system itself because it contains high-value security information.');
  body('Multi-tenancy and separation of duties require particular care. Consultants or group functions may assess several entities, but evidence and findings must remain isolated. Read access to legal vocabulary does not imply access to organizational weaknesses. Roles should distinguish ontology maintainers, evidence contributors, assessors, control owners, executives, and auditors.');

  sectionHeading('10.10  Research Roadmap');
  tableSimple(['Phase', 'Research Activity', 'Expected Output', 'Evaluation'], [
    ['1. Semantic hardening', 'Run OWL profile checks, complete reasoner tests, SHACL conformance tests', 'Verified ontology and shape releases', 'Independent-tool agreement'],
    ['2. Evidence model', 'Add assessment, evidence, finding, owner, date, and scope concepts', 'Evidence-centered ontology module', 'Expert review and competency questions'],
    ['3. Legal expansion', 'Model Article 20, Article 23, implementing acts, and national layers', 'Versioned NIS2 modules', 'Legal traceability review'],
    ['4. Practitioner study', 'Observe compliance officers using realistic cases', 'Usability and utility findings', 'Qualitative study and task metrics'],
    ['5. Production prototype', 'Deploy RDF store, identity controls, workflow, and audit logging', 'Secure multi-user platform', 'Security and performance testing'],
    ['6. Cross-regulation study', 'Map DORA, CRA, GDPR, and sector standards', 'Interoperability framework', 'Mapping precision and change-impact evaluation'],
  ]);

  sectionHeading('10.11  Balanced Assessment of the Contribution');
  body('The thesis contribution is strongest as a transparent proof of concept. It decomposes a recent cybersecurity obligation into classes connected to risks, systems, incidents, and standards, then exposes the model through validation, query, reasoning, and visualization functions. The public artifacts make these claims inspectable.');
  body('The implementation approximates some standards and relies on asserted booleans. It does not validate organizational evidence, execute complete OWL or SHACL semantics, implement full SPARQL 1.1, model national law, or include practitioner evaluation. These limits define the extension program.');
}

function renderTheoreticalDepth() {
  sectionHeading('3.10  Entailment, Assertion, and Validation');
  body('An RDF graph contains asserted triples, while an entailment regime determines which additional triples follow from them. RDFS entailment can infer types from domain and range declarations and propagate subclass membership. OWL adds class-expression and property semantics. SHACL validation asks a different question: whether focus nodes conform to shapes in a particular data graph. These operations can produce different but compatible results.');
  body('For example, an entity linked through implementsMeasure has an Entity domain and the object has a RiskManagementMeasure range. Under RDFS entailment these types can be inferred even if not asserted. A simple JavaScript type index that reads only explicit rdf:type triples may not reproduce that inference. Conversely, SHACL processors vary in whether and how they apply entailment before validation. Reproducible validation must therefore state the entailment regime.');

  sectionHeading('3.11  Open-World Assumption and Unique Names');
  body('OWL does not assume that a missing statement is false, and it does not assume that two different IRIs identify different individuals. The first principle explains why absence of a measure cannot automatically establish legal non-compliance. The second means that distinct names can denote the same resource unless inequality is asserted or follows from other axioms.');
  body('The prototype applies application-level assumptions that are common in forms and databases: the submitted measure list is treated as complete for the assessment request, and different measure identifiers are treated as distinct controlled values. These assumptions are practical, but they are not consequences of OWL semantics. The report makes them explicit so that procedural results are not presented as general description-logic entailments.');

  sectionHeading('3.12  RDF Collections and Anonymous Class Expressions');
  body('The equivalent-class definition is represented in RDF using blank nodes and rdf:List structures. owl:intersectionOf points to a list whose members are Entity and twelve anonymous owl:Restriction nodes. Each restriction identifies implementsMeasure as owl:onProperty and one operational class as owl:someValuesFrom. The property-chain axiom similarly uses an RDF list containing implementsMeasure followed by basedOnStandard.');
  body('These structures are more complex than ordinary named-node triples. A graph visualizer that removes blank nodes can show the named classes and properties but cannot display the full logical expression faithfully. A complete ontology inspection tool must traverse RDF lists and render anonymous restrictions. This is why Protégé or an OWL-aware renderer remains valuable even when the custom browser graph is useful for domain exploration.');

  sectionHeading('3.13  Domain and Range as Inference Axioms');
  body('RDFS domain and range declarations are often misread as database constraints. The statement that implementsMeasure has domain Entity means that any subject using the property is inferred to be an Entity. The range RiskManagementMeasure similarly types every object. It does not reject a triple whose subject or object lacks an explicit type; instead, it contributes the missing type under entailment.');
  body('Constraint behavior requires SHACL or application validation. The Article21ComplianceShape includes a class condition for implemented values, making non-conforming values reportable. This difference is important in ontology engineering: domain and range support semantic integration, while shapes express expectations for submitted data.');

  sectionHeading('3.14  SHACL Results and Severity');
  body('A SHACL validation report contains an overall conforms value and individual results identifying source shape, focus node, result path, severity, message, and optionally the offending value. Severity allows an organization to distinguish violations from warnings and informational recommendations. The local shapes use Violation for missing operational categories and invalid risk levels, Warning for the three quality booleans, and Info for missing descriptions.');
  body('Severity does not automatically determine legal importance. It is part of the validation policy. An organization could promote missing evidence or a false proportionality value to Violation, or define separate shapes for data ingestion and audit readiness. Versioning the shape graph is therefore necessary because changing severity or cardinality changes the operational assessment contract.');

  sectionHeading('3.15  SPARQL Algebra and Prototype Boundaries');
  body('A SPARQL query is translated into algebraic operations such as basic graph pattern joins, filter, projection, union, left join, grouping, ordering, and slicing. The prototype executes basic graph patterns by iteratively extending solution mappings with matching N3 quads. It then applies a small set of filter operations and projects requested variables.');
  body('This execution strategy is adequate for the included simple SELECT questions but does not implement the complete algebra. Query parsing and query execution must be distinguished: sparqljs can parse constructs that the local evaluator does not process. A conformance claim therefore requires a standards test suite, not merely successful parsing of example queries.');

  sectionHeading('3.16  Formal Mechanism Comparison');
  tableSimple(['Mechanism', 'Primary Semantics', 'Use in Thesis', 'What It Does Not Establish'], [
    ['RDF', 'Graph assertions', 'Stores resources and relations', 'Logical completeness or data quality'],
    ['RDFS', 'Subclass, subproperty, domain, range entailment', 'Defines basic taxonomy and typing relations', 'Closed-world constraints'],
    ['OWL 2', 'Description-logic class and property semantics', 'Equivalent class, complement, inverses, property chain', 'That missing assertions are false'],
    ['SHACL', 'Validation against shapes', 'Category, quality, and risk-level checks', 'General legal validity'],
    ['SPARQL', 'Pattern matching and graph query algebra', 'Competency questions and inspection', 'Inference unless provided by dataset or engine'],
    ['Procedural JavaScript', 'Application-defined algorithms', 'Coverage score, bounded classification, fixed checks', 'Standards-complete OWL, SHACL, or SPARQL behavior'],
  ]);
}

const ontologyClassCatalogue = [
  ['Entity', 'Core entity class', 'Article 3 subject of obligations'],
  ['EssentialEntity', 'Entity subclass', 'Essential regulatory category'],
  ['ImportantEntity', 'Entity subclass', 'Important regulatory category'],
  ['CompliantEntity', 'Defined entity class', 'Complete twelve-class operational coverage'],
  ['NonCompliantEntity', 'Defined entity class', 'Entity outside CompliantEntity'],
  ['RiskManagementMeasure', 'Core measure class', 'Article 21 measure superclass'],
  ['TechnicalMeasure', 'Measure category', 'Technical implementation character'],
  ['OperationalMeasure', 'Measure category', 'Operational process character'],
  ['OrganizationalMeasure', 'Measure category', 'Governance and organizational character'],
  ...measureAnalyses.map(m => [m.id, m.category, m.ref]),
  ['CybersecurityRisk', 'Supporting class', 'Risks addressed by measures'],
  ['SecurityIncident', 'Supporting class', 'Incidents prevented or mitigated'],
  ['NetworkInformationSystem', 'Supporting class', 'Systems within measure scope'],
  ['SecurityStandard', 'Supporting class', 'Standards associated with measures'],
];

function renderSupportingReference() {
  sectionHeading('12.13  Complete Class Catalogue');
  body('Table 12.1 lists every named OWL class in the domain namespace. The catalogue reflects the corrected legal decomposition and distinguishes defined compliance classes from asserted taxonomic classes.');
  tableSimple(['Class', 'Role', 'Meaning / Legal Mapping'], ontologyClassCatalogue);

  sectionHeading('12.14  Property Catalogue');
  tableSimple(['Property', 'Kind', 'Domain / Range or Value', 'Purpose'], [
    ['implementsMeasure', 'Object', 'Entity -> RiskManagementMeasure', 'Connects an entity to implemented measures'],
    ['isImplementedBy', 'Object', 'RiskManagementMeasure -> Entity', 'Inverse navigation'],
    ['addressesRisk', 'Object', 'RiskManagementMeasure -> CybersecurityRisk', 'Associates controls and risks'],
    ['preventsIncident', 'Object', 'RiskManagementMeasure -> SecurityIncident', 'Records preventive contribution'],
    ['minimizesImpact', 'Object', 'RiskManagementMeasure -> SecurityIncident', 'Records impact-reduction contribution'],
    ['basedOnStandard', 'Object', 'RiskManagementMeasure -> SecurityStandard', 'Links example measures to standards'],
    ['appliesToSystem', 'Object', 'RiskManagementMeasure -> NetworkInformationSystem', 'Defines system scope'],
    ['hasSubMeasure', 'Object, transitive', 'RiskManagementMeasure -> RiskManagementMeasure', 'Supports nested decomposition'],
    ['usesStandard', 'Object, derived', 'Entity -> SecurityStandard', 'Property-chain result'],
    ['articleReference', 'Annotation', 'Literal citation', 'Records legal provenance'],
    ['isProportionate', 'Datatype, functional', 'RiskManagementMeasure -> boolean', 'Stores proportionality conclusion'],
    ['isAppropriate', 'Datatype, functional', 'RiskManagementMeasure -> boolean', 'Stores appropriateness conclusion'],
    ['isStateOfTheArt', 'Datatype, functional', 'RiskManagementMeasure -> boolean', 'Stores state-of-the-art conclusion'],
    ['measureDescription', 'Datatype', 'RiskManagementMeasure -> string', 'Describes implementation'],
    ['riskLevel', 'Datatype, functional', 'CybersecurityRisk -> string', 'Stores controlled ordinal risk level'],
  ]);

  sectionHeading('12.15  Named Individual Inventory');
  tableSimple(['Group', 'Individuals', 'Use in Demonstration'], [
    ['Standards', 'ISO27001, ISO27002, NISTFramework, ENISAGuidelines, CISControls', 'Targets for basedOnStandard and derived usesStandard'],
    ['Risks', 'DataBreachRisk, RansomwareRisk, DDoSRisk, InsiderThreatRisk, SupplyChainCompromiseRisk', 'Risk coverage and controlled riskLevel validation'],
    ['Incidents', 'UnauthorizedAccessIncident, DataBreachIncident, ServiceDisruptionIncident, RansomwareIncident', 'Prevention and impact relations'],
    ['Measures', 'Twelve Example... measure individuals', 'Quality properties and domain relations'],
    ['Entities', 'ExampleCompliantEntity, ExampleNonCompliantEntity', 'Positive and incomplete coverage cases'],
    ['Systems', 'CoreBankingSystem, WebApplicationPlatform, InternalITInfrastructure', 'System-scope demonstrations'],
  ]);

  sectionHeading('12.16  Reproducibility Checklist');
  tableSimple(['Check', 'Expected Observation', 'Reason'], [
    ['Parse Turtle', '526 triples', 'Confirms canonical graph is syntactically readable'],
    ['Parse RDF/XML', '526 triples', 'Confirms serialization count parity'],
    ['Parse SHACL', '152 triples', 'Confirms shapes graph syntax'],
    ['Inspect legal mapping', 'Ten points (a)-(j), twelve operational classes', 'Prevents false a-l representation'],
    ['Count domain classes', '28 owl:Class declarations', 'Structural regression indicator'],
    ['Count object properties', '9 owl:ObjectProperty declarations', 'Structural regression indicator'],
    ['Count datatype properties', '5 owl:DatatypeProperty declarations', 'Structural regression indicator'],
    ['Run complete example', '12 classes, no missing list', 'Positive classification path'],
    ['Run incomplete example', '5 classes, 7 missing', 'Negative classification path'],
    ['Run independent reasoner', 'CompliantEntity inferred for complete example', 'Validates OWL expression independently'],
    ['Run independent SHACL tool', 'Complete entity conforms; incomplete entity violates coverage constraints', 'Validates shapes independently'],
    ['Execute competency queries', 'Bindings match asserted graph', 'Functional ontology evaluation'],
  ]);
}

function renderResearchQuestionAnswers() {
  sectionHeading('11.5  Answers to the Research Questions');

  subHeading('RQ1: Formal representation of Article 21(2)');
  body('Article 21(2) can be represented through a layered ontology that separates regulated entities, risk-management measures, systems, risks, incidents, and standards. The ten legal points are operationalized as twelve classes because the combined requirements in points (g) and (j) are decomposed into separately assessable concepts. Legal provenance is retained through articleReference annotations and explanatory comments.');
  body('The representation is sufficiently expressive for category-level coverage and navigation, but not for authoritative compliance determination. Proportionality, effectiveness, evidence quality, national transposition, and temporal validity require additional classes and assessment processes. The answer to RQ1 is therefore affirmative within a clearly bounded conceptual scope.');

  subHeading('RQ2: Appropriate OWL axiom patterns');
  body('The central pattern is an owl:equivalentClass definition containing Entity and twelve existential restrictions over implementsMeasure. It captures the positive condition that at least one realization of every operational class is present. Inverse properties support bidirectional navigation, a property chain derives entity-to-standard relations, and disjointness documents incompatible high-level categories.');
  body('The study also identifies the semantic limits of the pattern. Open-world reasoning does not make an unproved compliant classification equivalent to proved non-compliance. Closed-world gap reporting is therefore implemented by SHACL-oriented checks and procedural comparison. The most appropriate design is not OWL alone, but OWL for meaning and inference combined with explicit validation semantics.');

  subHeading('RQ3: Complementarity of SHACL and OWL');
  body('SHACL complements OWL by testing submitted graph structure. Qualified minimum counts require one implementation in each operational class; datatype, cardinality, and hasValue constraints assess measure-quality fields; and a controlled list validates risk levels. The resulting messages identify focus nodes and missing categories directly.');
  body('OWL remains responsible for class and property semantics, while SHACL expresses completeness expectations. The two mechanisms answer different questions and should not be described interchangeably. Independent execution by a complete SHACL processor remains necessary to validate the custom endpoint against the standard.');

  subHeading('RQ4: Competency questions and SPARQL');
  body('The ontology vocabulary supports the five competency questions concerning risk coverage, standards, incident prevention, system scope, and entity-measure relations. Their graph patterns can be expressed as SPARQL SELECT queries and checked against the asserted triples. This demonstrates that the model contains the relations needed for the declared analytical tasks.');
  body('The local query evaluator supports basic graph patterns and selected filters rather than complete SPARQL 1.1 algebra. RQ4 is answered positively for the included questions, with the explicit qualification that broader query conformance requires a standards-complete engine and test suite.');

  subHeading('RQ5: Real-time checking without ontology modification');
  body('The /api/check-entity endpoint accepts an entity name, regulatory type, and list of operational classes without writing new triples to the ontology. It normalizes recognized identifiers, calculates unique-class coverage, reports missing classes, and enriches the result with standards and risks derived from the example measure graph.');
  body('This proves that the ontology can serve as a stable reference vocabulary for transient assessments. The endpoint remains a self-declaration checker rather than an evidence validator. A production version should persist assessment records separately, connect them to evidence and scope, and maintain provenance and access control.');

  tableSimple(['Research Question', 'Answer', 'Principal Evidence', 'Qualification'], [
    ['RQ1', 'Yes, at category level', 'Twelve operational classes covering ten legal points', 'Evidence and proportionality are not fully modeled'],
    ['RQ2', 'Equivalent class plus relational axioms', 'Restrictions, inverse, disjointness, property chain', 'Negative classification needs closed-world handling'],
    ['RQ3', 'SHACL complements OWL', 'Coverage, quality, and risk-level constraints', 'Custom endpoint is not a general SHACL engine'],
    ['RQ4', 'Five declared questions are expressible', 'SPARQL patterns and expected bindings', 'Local evaluator is a subset'],
    ['RQ5', 'Transient checking is feasible', '/api/check-entity behavior', 'Submitted claims are not verified evidence'],
  ]);

  sectionHeading('11.6  Claim Boundary and Validation Matrix');
  body('Academic conclusions should be proportional to the evidence produced. The matrix below separates directly demonstrated properties from claims that require independent tools, organizational data, or practitioner research. This prevents the existence of an executable prototype from being interpreted as regulatory certification or production readiness.');
  tableSimple(['Claim', 'Status in This Thesis', 'Evidence Available', 'Further Validation Required'], [
    ['The ontology files are syntactically parseable', 'Demonstrated', 'Turtle and RDF/XML each parse to 526 triples', 'Continuous parsing in automated tests'],
    ['The legal points are represented', 'Demonstrated at selected granularity', 'Ten points mapped to twelve operational classes', 'Independent legal and sector review'],
    ['The complete example covers every operational class', 'Demonstrated', 'Twelve implementsMeasure links and class types', 'Independent reasoner regression test'],
    ['Missing classes can be reported', 'Demonstrated procedurally', 'Seven gaps for the incomplete entity', 'Broader mutation and boundary tests'],
    ['The equivalent-class axiom is OWL 2 DL compliant', 'Plausible but not independently certified here', 'OWL expression in both serializations', 'OWL profile validator and complete reasoner'],
    ['The shapes conform to SHACL semantics', 'Shape design present; custom checks demonstrated', '152-triple shapes graph and endpoint output', 'pySHACL or equivalent conformance execution'],
    ['SPARQL 1.1 is fully supported', 'Not demonstrated', 'Basic SELECT patterns and limited filters', 'Standards-complete query engine and test suite'],
    ['The framework proves legal compliance', 'Not claimed', 'Category coverage only', 'Evidence assessment, legal review, competent authority context'],
    ['The framework is production scalable', 'Not demonstrated', 'Small in-memory graph', 'Load, concurrency, resilience, and security testing'],
    ['The interface is usable by practitioners', 'Not empirically demonstrated', 'Functional interactive prototype', 'Structured user study with regulated organizations'],
  ]);

  ensureSpace(300);
  sectionHeading('11.7  Final Recommendations');
  body('First, the ontology should be released from one canonical serialization with automated generation of alternatives. Continuous integration should parse every artifact, compare graph equivalence, execute competency queries, run a complete OWL reasoner, and validate the SHACL graph using an independent processor. This would convert several manually checked assumptions into repeatable quality gates.');
  body('Second, the next conceptual increment should be evidence-centered rather than adding more top-level checkboxes. Assessment, Evidence, Finding, Scope, Assessor, ControlOwner, and ReviewDate concepts would allow category assertions to be supported, challenged, and revised. Temporal and provenance information would make results auditable and reduce reliance on unqualified booleans.');
  body('Third, practitioner evaluation should precede claims of operational utility. Compliance officers, security architects, auditors, and legal specialists should complete realistic tasks using the framework. Their errors, questions, and disagreements can reveal whether the vocabulary is understandable, whether explanations are sufficient, and whether the model fits actual assessment workflows.');
  body('Finally, future legal expansion should remain modular. Article 20 governance, Article 23 incident reporting, implementing acts, and national transposition requirements should be represented in separate but linked modules with explicit version and jurisdiction metadata. This approach preserves the clarity of the Article 21 core while enabling a broader NIS2 compliance knowledge graph.');
}

function codeBlock(text) {
  resetCursor();
  doc.moveDown(0.3);
  const blockX = LM;
  const blockY = doc.y;
  const blockW = BODY_W;
  const blockTextW = BODY_W - 16;
  doc.font('Courier').fontSize(9);
  const blockH = doc.heightOfString(text, { width: blockTextW, lineGap: 2 }) + 16;
  ensureSpace(blockH + 12);
  const drawY = doc.y;
  doc.rect(blockX, drawY, blockW, blockH).fill('#f5f5f5');
  doc.fill('#000');
  doc.font('Courier').fontSize(9).text(text, blockX + 8, drawY + 8, {
    width: blockTextW,
    lineGap: 2
  });
  doc.y = drawY + blockH;
  doc.moveDown(0.5);
}

function tableSimple(headers, rows, options = {}) {
  resetCursor();
  const columnCount = headers.length;
  const defaultWeights = {
    2: [0.32, 0.68],
    3: [0.28, 0.28, 0.44],
    4: [0.24, 0.20, 0.28, 0.28],
    5: [0.24, 0.18, 0.18, 0.18, 0.22],
    6: [0.27, 0.18, 0.14, 0.14, 0.13, 0.14],
  };
  const weights = options.widths || defaultWeights[columnCount] ||
    Array(columnCount).fill(1 / columnCount);
  const totalWeight = weights.reduce((sum, value) => sum + value, 0);
  const colWidths = weights.map(value => BODY_W * value / totalWeight);
  const colStarts = colWidths.reduce((starts, width, index) => {
    if (index > 0) starts.push(starts[index - 1] + colWidths[index - 1]);
    return starts;
  }, [0]);
  const headerFontSize = options.headerFontSize || (columnCount >= 5 ? 7.6 : columnCount === 4 ? 8.2 : 9);
  const bodyFontSize = options.bodyFontSize || (columnCount >= 5 ? 7.1 : columnCount === 4 ? 7.8 : columnCount === 3 ? 8.5 : 9);
  const padX = options.padX || 5;
  const padY = options.padY || 4;

  function displayCell(value) {
    return String(value)
      .replace(/([a-z0-9])([A-Z])/g, '$1\u200b$2')
      .replace(/([,;/])([^\s])/g, '$1\u200b$2');
  }

  function drawHeader() {
    doc.font('Helvetica-Bold').fontSize(headerFontSize);
    const headerHeights = headers.map((h, i) =>
      doc.heightOfString(displayCell(h), { width: colWidths[i] - padX * 2, lineGap: 1 })
    );
    const headerH = Math.max(18, Math.ceil(Math.max(...headerHeights)) + padY * 2);
    ensureSpace(headerH + 8);
    const y = doc.y;
    headers.forEach((h, i) => {
      const x = LM + colStarts[i];
      doc.rect(x, y, colWidths[i], headerH).fillAndStroke('#e8eef6', '#64748b');
      doc.fillColor('#0f172a').text(displayCell(h), x + padX, y + padY, {
        width: colWidths[i] - padX * 2,
        lineGap: 1,
      });
    });
    doc.fillColor('#000000');
    doc.y = y + headerH;
  }

  drawHeader();
  rows.forEach((row, rowIndex) => {
    doc.font('Helvetica').fontSize(bodyFontSize);
    const rowHeights = row.map((cell, i) =>
      doc.heightOfString(displayCell(cell), { width: colWidths[i] - padX * 2, lineGap: 1 })
    );
    const rowH = Math.max(16, Math.ceil(Math.max(...rowHeights)) + padY * 2);
    if (doc.y + rowH > bottomY()) {
      newPage();
      drawHeader();
      doc.font('Helvetica').fontSize(bodyFontSize);
    }
    const y = doc.y;
    row.forEach((cell, i) => {
      const x = LM + colStarts[i];
      doc.rect(x, y, colWidths[i], rowH)
        .fillAndStroke(rowIndex % 2 === 0 ? '#ffffff' : '#f8fafc', '#94a3b8');
      doc.fillColor('#111827').text(displayCell(cell), x + padX, y + padY, {
        width: colWidths[i] - padX * 2,
        lineGap: 1,
      });
    });
    doc.y = y + rowH;
  });
  doc.fillColor('#000000');
  doc.moveDown(0.5);
  resetCursor();
}

function drawCard(x, y, w, h, title, value, accent = '#2563eb') {
  doc.save();
  doc.roundedRect(x, y, w, h, 6).fillAndStroke('#ffffff', '#dbe3ee');
  doc.roundedRect(x, y, 5, h, 3).fill(accent);
  doc.fillColor('#64748b').font('Helvetica-Bold').fontSize(7.5)
    .text(title.toUpperCase(), x + 14, y + 10, { width: w - 22 });
  doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(17)
    .text(String(value), x + 14, y + 27, { width: w - 22 });
  doc.restore();
}

function drawStatusRow(x, y, w, label, detail, status = 'success') {
  const colors = {
    success: ['#ecfdf5', '#16a34a', 'PASS'],
    warning: ['#fff7ed', '#ea580c', 'GAP'],
    info: ['#eff6ff', '#2563eb', 'INFO'],
  };
  const [bg, fg, badge] = colors[status];
  doc.save();
  doc.roundedRect(x, y, w, 34, 5).fillAndStroke(bg, '#dbe3ee');
  doc.fillColor(fg).font('Helvetica-Bold').fontSize(8)
    .text(badge, x + 9, y + 8, { width: 34 });
  doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(8)
    .text(label, x + 47, y + 6, { width: w - 55 });
  doc.fillColor('#475569').font('Helvetica').fontSize(7)
    .text(detail, x + 47, y + 18, { width: w - 55, lineGap: 1 });
  doc.restore();
}

function figurePage(number, title, drawFigure, sourceNote) {
  newPage();
  resetCursor();
  doc.font('Helvetica-Bold').fontSize(12).fillColor('#0f172a').text(title);
  doc.moveDown(0.5);
  const top = doc.y;
  const height = 570;
  doc.save();
  doc.roundedRect(LM, top, BODY_W, height, 8).fillAndStroke('#f8fafc', '#cbd5e1');
  doc.restore();
  drawFigure(LM + 14, top + 14, BODY_W - 28, height - 28);
  doc.y = top + height + 10;
  doc.fillColor('#111827').font('Helvetica-Bold').fontSize(9)
    .text(`Figure ${number}: ${title}`, LM, doc.y, { width: BODY_W, align: 'center' });
  doc.moveDown(0.25);
  doc.fillColor('#64748b').font('Helvetica-Oblique').fontSize(8)
    .text(sourceNote, LM, doc.y, { width: BODY_W, align: 'center' });
  doc.fillColor('#000000');
}

function figureBlock(number, title, drawFigure, sourceNote, height = 480) {
  ensureSpace(height + 70);
  resetCursor();
  const top = doc.y;
  doc.save();
  doc.roundedRect(LM, top, BODY_W, height, 8).fillAndStroke('#f8fafc', '#cbd5e1');
  doc.restore();
  drawFigure(LM + 14, top + 14, BODY_W - 28, height - 28);
  doc.y = top + height + 8;
  doc.fillColor('#111827').font('Helvetica-Bold').fontSize(9)
    .text(`Figure ${number}: ${title}`, LM, doc.y, { width: BODY_W, align: 'center' });
  doc.moveDown(0.2);
  doc.fillColor('#64748b').font('Helvetica-Oblique').fontSize(7.5)
    .text(sourceNote, LM, doc.y, { width: BODY_W, align: 'center' });
  doc.fillColor('#000000');
  doc.moveDown(0.5);
}

function imageBlock(imgPath, number, caption, sourceNote, maxHeight = 320) {
  try {
    const img = doc.openImage(imgPath);
    const scale = Math.min(BODY_W / img.width, maxHeight / img.height, 1);
    const iw = Math.floor(img.width * scale);
    const ih = Math.floor(img.height * scale);
    ensureSpace(ih + 60);
    resetCursor();
    const startY = doc.y;
    const xPos = LM + Math.floor((BODY_W - iw) / 2);
    doc.image(imgPath, xPos, startY, { width: iw, height: ih });
    doc.y = startY + ih + 8;
    resetCursor();
    doc.fillColor('#111827').font('Helvetica-Bold').fontSize(9)
      .text(`Figure ${number}: ${caption}`, LM, doc.y, { width: BODY_W, align: 'center' });
    doc.moveDown(0.2);
    if (sourceNote) {
      doc.fillColor('#64748b').font('Helvetica-Oblique').fontSize(7.5)
        .text(sourceNote, LM, doc.y, { width: BODY_W, align: 'center' });
    }
    doc.fillColor('#000000');
    doc.moveDown(0.8);
  } catch (e) {
    body(`[Image placeholder: ${caption}]`);
  }
}

function drawOntologyFigure(x, y, w, h) {
  doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(10)
    .text('NIS2 Article 21 Ontology Explorer', x, y, { width: w });
  doc.fillColor('#64748b').font('Helvetica').fontSize(7.5)
    .text('Entity, measure, risk, system, and standard relations', x, y + 15, { width: w });

  const cx = x + w / 2;
  const centerY = y + 250;
  const nodes = [
    { label: 'Entity', x: cx, y: y + 58, color: '#dbeafe' },
    { label: 'EssentialEntity', x: x + 85, y: y + 120, color: '#dbeafe' },
    { label: 'ImportantEntity', x: x + w - 85, y: y + 120, color: '#dbeafe' },
    { label: 'RiskManagementMeasure', x: cx, y: y + 165, color: '#dcfce7' },
    { label: 'RiskAnalysisPolicy', x: x + 65, y: y + 250, color: '#dcfce7' },
    { label: 'IncidentHandling', x: x + 180, y: y + 250, color: '#dcfce7' },
    { label: 'Encryption', x: x + w - 180, y: y + 250, color: '#dcfce7' },
    { label: 'MultiFactorAuthentication', x: x + w - 65, y: y + 250, color: '#dcfce7' },
    { label: 'DataBreachRisk', x: x + 70, y: y + 355, color: '#ffedd5' },
    { label: 'CoreBankingSystem', x: cx, y: y + 355, color: '#ffedd5' },
    { label: 'ISO27001', x: x + w - 70, y: y + 355, color: '#f3e8ff' },
    { label: 'ExampleCompliantEntity', x: cx, y: y + 450, color: '#dbeafe' },
  ];

  const byLabel = Object.fromEntries(nodes.map(n => [n.label, n]));
  const edges = [
    ['Entity', 'EssentialEntity', 'subClass'],
    ['Entity', 'ImportantEntity', 'subClass'],
    ['Entity', 'RiskManagementMeasure', 'implementsMeasure'],
    ['RiskManagementMeasure', 'RiskAnalysisPolicy', 'subClass'],
    ['RiskManagementMeasure', 'IncidentHandling', 'subClass'],
    ['RiskManagementMeasure', 'Encryption', 'subClass'],
    ['RiskManagementMeasure', 'MultiFactorAuthentication', 'subClass'],
    ['RiskAnalysisPolicy', 'DataBreachRisk', 'addressesRisk'],
    ['RiskAnalysisPolicy', 'CoreBankingSystem', 'appliesToSystem'],
    ['RiskAnalysisPolicy', 'ISO27001', 'basedOnStandard'],
    ['ExampleCompliantEntity', 'RiskManagementMeasure', '12 implementations'],
  ];

  doc.save().lineWidth(1).strokeColor('#94a3b8');
  edges.forEach(([from, to, label]) => {
    const a = byLabel[from], b = byLabel[to];
    doc.moveTo(a.x, a.y).lineTo(b.x, b.y).stroke();
    const mx = (a.x + b.x) / 2;
    const my = (a.y + b.y) / 2;
    doc.fillColor('#64748b').font('Helvetica').fontSize(5.5)
      .text(label, mx - 34, my - 5, { width: 68, align: 'center' });
  });
  doc.restore();

  nodes.forEach(node => {
    const nw = Math.max(78, Math.min(118, node.label.length * 5.4));
    doc.save();
    doc.roundedRect(node.x - nw / 2, node.y - 14, nw, 28, 6)
      .fillAndStroke(node.color, '#94a3b8');
    doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(6.5)
      .text(node.label, node.x - nw / 2 + 4, node.y - 4, {
        width: nw - 8,
        align: 'center',
      });
    doc.restore();
  });

  doc.fillColor('#475569').font('Helvetica').fontSize(7)
    .text('Graph excerpt: the application contains 28 classes and 31 named individuals.', x, y + h - 18, {
      width: w,
      align: 'center',
    });
}

function drawValidationFigure(x, y, w, h) {
  doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(10)
    .text('Ontology Validation Report', x, y, { width: w });
  doc.fillColor('#64748b').font('Helvetica').fontSize(7.5)
    .text('GET /api/validate - RDF/XML source selected by the server', x, y + 15, { width: w });
  const gap = 10;
  const cw = (w - gap * 3) / 4;
  drawCard(x, y + 40, cw, 62, 'Triples', '526', '#2563eb');
  drawCard(x + cw + gap, y + 40, cw, 62, 'Classes', '28', '#7c3aed');
  drawCard(x + (cw + gap) * 2, y + 40, cw, 62, 'Properties', '14', '#0891b2');
  drawCard(x + (cw + gap) * 3, y + 40, cw, 62, 'Individuals', '31', '#16a34a');
  drawStatusRow(x, y + 125, w, 'Syntax and ontology declaration', '526 triples parsed; owl:Ontology declaration present.', 'success');
  drawStatusRow(x, y + 167, w, 'Compliance class expression', 'owl:equivalentClass axioms detected for the compliance hierarchy.', 'success');
  drawStatusRow(x, y + 209, w, 'Regulatory entity disjointness', 'EssentialEntity and ImportantEntity are declared disjoint.', 'success');
  drawStatusRow(x, y + 251, w, 'Operational coverage', 'All 12 classes covering Article 21(2)(a)-(j) are present.', 'success');
  drawStatusRow(x, y + 293, w, 'Class hierarchy', 'No cycle detected in named rdfs:subClassOf edges.', 'success');
  doc.save();
  doc.roundedRect(x, y + 355, w, 92, 7).fillAndStroke('#ecfdf5', '#86efac');
  doc.fillColor('#166534').font('Helvetica-Bold').fontSize(14)
    .text('VALID', x + 16, y + 373, { width: 70 });
  doc.fillColor('#14532d').font('Helvetica').fontSize(8)
    .text('Structural validation completed with no errors or warnings. This result verifies the checks implemented by the endpoint; it is not a complete OWL profile or consistency proof.', x + 88, y + 368, {
      width: w - 104,
      lineGap: 3,
    });
  doc.restore();
}

function drawReasoningFigure(x, y, w, h) {
  doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(10)
    .text('Structural Reasoning Results', x, y, { width: w });
  doc.fillColor('#64748b').font('Helvetica').fontSize(7.5)
    .text('GET /api/reason - category coverage and property-chain-equivalent derivation', x, y + 15, { width: w });
  drawStatusRow(x, y + 42, w, 'ExampleCompliantEntity', 'EssentialEntity - 12/12 operational classes - CompliantEntity', 'success');
  drawStatusRow(x, y + 88, w, 'ExampleNonCompliantEntity', 'ImportantEntity - 5/12 classes - seven reported gaps', 'warning');
  doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(8.5)
    .text('Missing operational classes', x, y + 143, { width: w });
  const missing = [
    'BusinessContinuityManagement', 'SupplyChainSecurity', 'SecureDevelopment',
    'EffectivenessAssessment', 'HumanResourcesSecurity',
    'MultiFactorAuthentication', 'SecureCommunications',
  ];
  missing.forEach((item, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const bx = x + col * (w / 2 + 3);
    const by = y + 165 + row * 30;
    doc.roundedRect(bx, by, w / 2 - 8, 23, 4).fillAndStroke('#fff7ed', '#fdba74');
    doc.fillColor('#9a3412').font('Helvetica').fontSize(6.7)
      .text(item, bx + 7, by + 7, { width: w / 2 - 22 });
  });
  doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(8.5)
    .text('Standards inferred for the complete entity', x, y + 300, { width: w });
  const standards = [
    ['ISO27001', 'Risk policy, continuity, effectiveness'],
    ['ENISAGuidelines', 'Incident handling, training, communications'],
    ['ISO27002', 'Supply chain and human resources'],
    ['NISTFramework', 'Secure development and encryption'],
    ['CISControls', 'Cyber hygiene and MFA'],
  ];
  standards.forEach(([std, via], i) => {
    const by = y + 322 + i * 35;
    doc.roundedRect(x, by, 100, 27, 4).fillAndStroke('#f3e8ff', '#c4b5fd');
    doc.fillColor('#6b21a8').font('Helvetica-Bold').fontSize(7)
      .text(std, x + 7, by + 9, { width: 86 });
    doc.fillColor('#475569').font('Helvetica').fontSize(7)
      .text(via, x + 112, by + 8, { width: w - 120 });
  });
}

function drawShaclFigure(x, y, w, h) {
  doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(10)
    .text('SHACL-Oriented Validation', x, y, { width: w });
  doc.fillColor('#64748b').font('Helvetica').fontSize(7.5)
    .text('GET /api/shacl - fixed checks corresponding to the local shapes graph', x, y + 15, { width: w });
  drawCard(x, y + 40, 105, 60, 'Entities', '2', '#2563eb');
  drawCard(x + 115, y + 40, 105, 60, 'Measures', '12', '#7c3aed');
  drawCard(x + 230, y + 40, 105, 60, 'Risks', '5', '#0891b2');
  drawCard(x + 345, y + 40, w - 345, 60, 'Violations', '7', '#dc2626');
  drawStatusRow(x, y + 123, w, 'ExampleCompliantEntity', 'All twelve operational classes are represented.', 'success');
  drawStatusRow(x, y + 165, w, 'ExampleNonCompliantEntity', 'Seven class-specific coverage violations are reported.', 'warning');
  drawStatusRow(x, y + 207, w, 'MeasureQualityShape', 'All 12 examples have description and three true quality booleans.', 'success');
  drawStatusRow(x, y + 249, w, 'RiskLevelShape', 'All five risks use one permitted level value.', 'success');
  doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(8.5)
    .text('Violation summary', x, y + 305, { width: w });
  const rows = [
    ['Business continuity', 'Article21ComplianceShape'],
    ['Supply chain security', 'Article21ComplianceShape'],
    ['Secure development', 'Article21ComplianceShape'],
    ['Effectiveness assessment', 'Article21ComplianceShape'],
    ['Human resources security', 'Article21ComplianceShape'],
    ['Multi-factor authentication', 'Article21ComplianceShape'],
    ['Secure communications', 'Article21ComplianceShape'],
  ];
  rows.forEach(([label, shape], i) => {
    const by = y + 328 + i * 27;
    doc.fillColor('#991b1b').font('Helvetica-Bold').fontSize(6.8)
      .text('VIOLATION', x + 4, by + 4, { width: 52 });
    doc.fillColor('#0f172a').font('Helvetica').fontSize(7)
      .text(label, x + 62, by + 4, { width: 155 });
    doc.fillColor('#64748b').font('Helvetica').fontSize(6.5)
      .text(shape, x + 225, by + 4, { width: w - 225 });
    doc.moveTo(x, by + 20).lineTo(x + w, by + 20).strokeColor('#e2e8f0').stroke();
  });
}

function drawEntityCheckerFigure(x, y, w, h) {
  doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(10)
    .text('Real-Time Entity Compliance Check', x, y, { width: w });
  doc.fillColor('#64748b').font('Helvetica').fontSize(7.5)
    .text('POST /api/check-entity - submitted class coverage without modifying the ontology', x, y + 15, { width: w });
  const leftW = w * 0.47;
  const rightX = x + leftW + 18;
  const rightW = w - leftW - 18;

  doc.roundedRect(x, y + 42, leftW, 440, 7).fillAndStroke('#ffffff', '#cbd5e1');
  doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(8)
    .text('ASSESSMENT INPUT', x + 12, y + 56, { width: leftW - 24 });
  doc.fillColor('#64748b').font('Helvetica').fontSize(6.5).text('Entity name', x + 12, y + 82);
  doc.roundedRect(x + 12, y + 94, leftW - 24, 30, 4).fillAndStroke('#f8fafc', '#cbd5e1');
  doc.fillColor('#0f172a').font('Helvetica').fontSize(7.5)
    .text('MyBank', x + 20, y + 104, { width: leftW - 40 });
  doc.fillColor('#64748b').font('Helvetica').fontSize(6.5).text('Entity type', x + 12, y + 138);
  doc.roundedRect(x + 12, y + 150, leftW - 24, 30, 4).fillAndStroke('#f8fafc', '#cbd5e1');
  doc.fillColor('#0f172a').font('Helvetica').fontSize(7.5)
    .text('EssentialEntity', x + 20, y + 160, { width: leftW - 40 });
  doc.fillColor('#64748b').font('Helvetica-Bold').fontSize(7)
    .text('Selected operational classes', x + 12, y + 196, { width: leftW - 24 });
  const selections = [
    'Risk analysis policy', 'Incident handling', 'Business continuity',
    'Supply chain security', 'Secure development', 'Effectiveness assessment',
    'Cyber hygiene', 'Training and awareness', 'Human resources security',
    'Encryption', 'Multi-factor authentication', 'Secure communications',
  ];
  selections.forEach((label, i) => {
    const by = y + 218 + i * 17;
    doc.roundedRect(x + 13, by, 9, 9, 2).fillAndStroke('#16a34a', '#15803d');
    doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(6).text('x', x + 15, by + 1);
    doc.fillColor('#334155').font('Helvetica').fontSize(6.5)
      .text(label, x + 28, by, { width: leftW - 42 });
  });

  doc.roundedRect(rightX, y + 42, rightW, 440, 7).fillAndStroke('#ffffff', '#cbd5e1');
  doc.roundedRect(rightX + 12, y + 57, rightW - 24, 44, 6).fillAndStroke('#ecfdf5', '#86efac');
  doc.fillColor('#166534').font('Helvetica-Bold').fontSize(12)
    .text('COMPLIANT', rightX + 20, y + 70, { width: rightW - 40, align: 'center' });
  const smallW = (rightW - 40) / 3;
  drawCard(rightX + 12, y + 118, smallW, 58, 'Score', '100%', '#16a34a');
  drawCard(rightX + 20 + smallW, y + 118, smallW, 58, 'Coverage', '12/12', '#2563eb');
  drawCard(rightX + 28 + smallW * 2, y + 118, smallW, 58, 'Class', 'OWL', '#7c3aed');
  doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(7.5)
    .text('Inferred class', rightX + 12, y + 195, { width: rightW - 24 });
  doc.roundedRect(rightX + 12, y + 210, rightW - 24, 31, 4).fillAndStroke('#eff6ff', '#93c5fd');
  doc.fillColor('#1d4ed8').font('Helvetica-Bold').fontSize(8)
    .text('CompliantEntity', rightX + 20, y + 221, { width: rightW - 40, align: 'center' });
  doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(7.5)
    .text('Derived standards', rightX + 12, y + 260, { width: rightW - 24 });
  ['ISO27001', 'ISO27002', 'NISTFramework', 'ENISAGuidelines', 'CISControls'].forEach((std, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const bx = rightX + 12 + col * ((rightW - 20) / 2);
    const by = y + 280 + row * 30;
    doc.roundedRect(bx, by, (rightW - 32) / 2, 23, 4).fillAndStroke('#f3e8ff', '#c4b5fd');
    doc.fillColor('#6b21a8').font('Helvetica-Bold').fontSize(6.5)
      .text(std, bx + 4, by + 8, { width: (rightW - 40) / 2, align: 'center' });
  });
  doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(7.5)
    .text('Addressed risks', rightX + 12, y + 382, { width: rightW - 24 });
  doc.fillColor('#475569').font('Helvetica').fontSize(6.8)
    .text('DataBreachRisk, InsiderThreatRisk, RansomwareRisk, SupplyChainCompromiseRisk', rightX + 12, y + 399, {
      width: rightW - 24,
      lineGap: 2,
    });
}

function drawSparqlFigure(x, y, w, h) {
  doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(10)
    .text('SPARQL Competency Query', x, y, { width: w });
  doc.fillColor('#64748b').font('Helvetica').fontSize(7.5)
    .text('CQ2 - standards associated with the complete example entity', x, y + 15, { width: w });

  const queryH = 205;
  doc.roundedRect(x, y + 40, w, queryH, 7).fillAndStroke('#0f172a', '#334155');
  doc.fillColor('#94a3b8').font('Helvetica').fontSize(6.5)
    .text('SPARQL editor', x + 12, y + 51, { width: w - 24 });
  doc.moveTo(x + 10, y + 70).lineTo(x + w - 10, y + 70).strokeColor('#334155').stroke();
  const qLines = [
    [['PREFIX ', '#c4b5fd'], ['nis2:', '#67e8f9'], [' <https://w3id.org/nis2/article21#>', '#86efac']],
    [['SELECT ', '#c4b5fd'], ['?entity ?standard', '#f8fafc']],
    [['WHERE ', '#c4b5fd'], ['{', '#f8fafc']],
    [['  ?entity ', '#f8fafc'], ['a ', '#c4b5fd'], ['nis2:CompliantEntity ', '#67e8f9'], ['.', '#f8fafc']],
    [['  ?entity ', '#f8fafc'], ['nis2:implementsMeasure ', '#67e8f9'], ['?measure ', '#f8fafc'], ['.', '#f8fafc']],
    [['  ?measure ', '#f8fafc'], ['nis2:basedOnStandard ', '#67e8f9'], ['?standard ', '#f8fafc'], ['.', '#f8fafc']],
    [['}', '#f8fafc']],
  ];
  qLines.forEach((segments, i) => drawCodeLine(x + 14, y + 82 + i * 16, segments, 7.3));

  doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(8.5)
    .text('Query results', x, y + 266, { width: w });
  const tableY = y + 284;
  const col1 = w * 0.48;
  const col2 = w - col1;
  doc.rect(x, tableY, col1, 27).fillAndStroke('#e8eef6', '#64748b');
  doc.rect(x + col1, tableY, col2, 27).fillAndStroke('#e8eef6', '#64748b');
  doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(7)
    .text('entity', x + 7, tableY + 9, { width: col1 - 14 });
  doc.text('standard', x + col1 + 7, tableY + 9, { width: col2 - 14 });
  const results = ['ISO27001', 'ENISAGuidelines', 'ISO27002', 'NISTFramework', 'CISControls'];
  results.forEach((standard, i) => {
    const ry = tableY + 27 + i * 34;
    const bg = i % 2 === 0 ? '#ffffff' : '#f8fafc';
    doc.rect(x, ry, col1, 34).fillAndStroke(bg, '#94a3b8');
    doc.rect(x + col1, ry, col2, 34).fillAndStroke(bg, '#94a3b8');
    doc.fillColor('#334155').font('Helvetica').fontSize(7)
      .text('ExampleCompliantEntity', x + 7, ry + 12, { width: col1 - 14 });
    doc.fillColor('#6b21a8').font('Helvetica-Bold').fontSize(7)
      .text(standard, x + col1 + 7, ry + 12, { width: col2 - 14 });
  });
  doc.fillColor('#475569').font('Helvetica-Oblique').fontSize(6.5)
    .text('Five unique standards are reached through implemented measures and their basedOnStandard relations.', x, y + h - 20, {
      width: w,
      align: 'center',
    });
}

function drawCodeLine(x, y, segments, fontSize = 7) {
  let cursor = x;
  segments.forEach(([text, color, bold = false]) => {
    doc.fillColor(color).font(bold ? 'Courier-Bold' : 'Courier').fontSize(fontSize);
    doc.text(text, cursor, y, { continued: true, lineBreak: false });
    cursor += doc.widthOfString(text);
  });
  doc.text('', { continued: false });
}

function drawRdfSerializationFigure(x, y, w, h) {
  doc.save();
  doc.roundedRect(x, y, w, h, 7).fillAndStroke('#0f172a', '#334155');
  doc.fillColor('#e2e8f0').font('Helvetica-Bold').fontSize(8.5)
    .text('nis2_article21_cybersecurity.ttl', x + 12, y + 10, { width: w - 24 });
  doc.fillColor('#94a3b8').font('Helvetica').fontSize(6.5)
    .text('Turtle serialization excerpt', x + 12, y + 24, { width: w - 24 });
  doc.moveTo(x + 10, y + 39).lineTo(x + w - 10, y + 39).strokeColor('#334155').stroke();

  const codeY = y + 50;
  const lh = 13;
  const lines = [
    [['@prefix ', '#c4b5fd'], [': ', '#f8fafc'], ['<https://w3id.org/nis2/article21#> .', '#86efac']],
    [['@prefix ', '#c4b5fd'], ['owl: ', '#f8fafc'], ['<http://www.w3.org/2002/07/owl#> .', '#86efac']],
    [['', '#f8fafc']],
    [[':ExampleEncryption', '#67e8f9', true]],
    [['    a ', '#f8fafc'], ['owl:NamedIndividual', '#fbbf24'], [', ', '#f8fafc'], [':Encryption', '#67e8f9'], [' ;', '#f8fafc']],
    [['    rdfs:label ', '#c4b5fd'], ['"Example Encryption"', '#86efac'], [' ;', '#f8fafc']],
    [['    :isAppropriate ', '#c4b5fd'], ['true', '#fbbf24'], [' ;', '#f8fafc']],
    [['    :isProportionate ', '#c4b5fd'], ['true', '#fbbf24'], [' ;', '#f8fafc']],
    [['    :basedOnStandard ', '#c4b5fd'], [':NISTFramework', '#67e8f9'], [' ;', '#f8fafc']],
    [['    :addressesRisk ', '#c4b5fd'], [':DataBreachRisk', '#67e8f9'], [' ;', '#f8fafc']],
    [['    :appliesToSystem ', '#c4b5fd'], [':CoreBankingSystem', '#67e8f9'], [' .', '#f8fafc']],
  ];
  lines.forEach((segments, i) => drawCodeLine(x + 13, codeY + i * lh, segments));

  doc.fillColor('#94a3b8').font('Helvetica-Oblique').fontSize(6.3)
    .text('RDF represents the measure as subject-predicate-object statements with typed resources and literals.', x + 12, y + h - 25, {
      width: w - 24,
      align: 'center',
    });
  doc.restore();
}

function drawOwlRestrictionFigure(x, y, w, h) {
  doc.save();
  doc.roundedRect(x, y, w, h, 7).fillAndStroke('#f8fafc', '#94a3b8');
  doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(8.5)
    .text('OWL 2 Equivalent-Class Structure', x + 12, y + 10, { width: w - 24 });
  doc.fillColor('#64748b').font('Helvetica').fontSize(6.5)
    .text('CompliantEntity as an intersection of Entity and twelve existential restrictions', x + 12, y + 24, { width: w - 24 });

  const leftX = x + 18;
  const centerX = x + 147;
  const rightX = x + 290;
  const topY = y + 65;

  doc.roundedRect(leftX, topY, 100, 34, 6).fillAndStroke('#dbeafe', '#60a5fa');
  doc.fillColor('#1e3a8a').font('Helvetica-Bold').fontSize(7.5)
    .text('CompliantEntity', leftX + 7, topY + 12, { width: 86, align: 'center' });
  doc.roundedRect(centerX, topY, 112, 34, 6).fillAndStroke('#ede9fe', '#a78bfa');
  doc.fillColor('#5b21b6').font('Helvetica-Bold').fontSize(7.5)
    .text('owl:intersectionOf', centerX + 7, topY + 12, { width: 98, align: 'center' });
  doc.moveTo(leftX + 100, topY + 17).lineTo(centerX, topY + 17).strokeColor('#64748b').stroke();

  const restrictions = [
    ['Entity', 'base class'],
    ['∃ implementsMeasure', 'RiskAnalysisPolicy'],
    ['∃ implementsMeasure', 'IncidentHandling'],
    ['∃ implementsMeasure', 'BusinessContinuity'],
    ['∃ implementsMeasure', '... nine further classes'],
    ['∃ implementsMeasure', 'SecureCommunications'],
  ];
  restrictions.forEach(([operator, value], i) => {
    const ry = y + 46 + i * 26;
    doc.moveTo(centerX + 112, topY + 17).lineTo(rightX - 8, ry + 13).strokeColor('#94a3b8').stroke();
    doc.roundedRect(rightX, ry, w - (rightX - x) - 12, 22, 4).fillAndStroke('#ffffff', '#cbd5e1');
    doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(6.1)
      .text(operator, rightX + 6, ry + 3, { width: 88 });
    doc.fillColor('#475569').font('Helvetica').fontSize(5.9)
      .text(value, rightX + 98, ry + 3, { width: w - (rightX - x) - 116 });
  });

  doc.fillColor('#475569').font('Helvetica-Oblique').fontSize(6.3)
    .text('Every existential restriction must be satisfied for positive classification as CompliantEntity.', x + 12, y + h - 20, {
      width: w - 24,
      align: 'center',
    });
  doc.restore();
}

function drawOwlPropertyChainBadge(x, y, w, h) {
  doc.save();
  doc.roundedRect(x, y, w, h, 6).fillAndStroke('#eff6ff', '#93c5fd');
  doc.fillColor('#1e3a8a').font('Helvetica-Bold').fontSize(5.6)
    .text('OWL property chain', x + 8, y + 5, { width: w - 16 });

  const boxY = y + 15;
  const boxH = 11;
  const boxW = 57;
  const gap = 7;
  const startX = x + 8;
  const labels = [
    ['implementsMeasure', '#dbeafe', '#1e3a8a'],
    ['basedOnStandard', '#ede9fe', '#5b21b6'],
    ['usesStandard', '#dcfce7', '#166534'],
  ];

  labels.forEach(([label, fill, textColor], idx) => {
    const bx = startX + idx * (boxW + gap);
    doc.roundedRect(bx, boxY, boxW, boxH, 4).fillAndStroke(fill, '#cbd5e1');
    doc.fillColor(textColor).font('Helvetica-Bold').fontSize(4.4)
      .text(label, bx + 2, boxY + 2, { width: boxW - 4, align: 'center' });
    if (idx < labels.length - 1) {
      const ax = bx + boxW + 1;
      const ay = boxY + 5;
      doc.strokeColor('#64748b').lineWidth(1.1)
        .moveTo(ax, ay).lineTo(ax + 6, ay).stroke();
      doc.moveTo(ax + 2, ay - 2).lineTo(ax + 6, ay).lineTo(ax + 2, ay + 2).stroke();
    }
  });
  doc.restore();
}

function drawOwlHierarchyFigure(x, y, w, h) {
  doc.save();
  doc.roundedRect(x, y, w, h, 7).fillAndStroke('#f8fafc', '#94a3b8');
  doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(8.7)
    .text('OWL Measure Hierarchy', x + 12, y + 10, { width: w - 24 });
  doc.fillColor('#64748b').font('Helvetica').fontSize(6.4)
    .text('Three top-level families represented as subclasses of RiskManagementMeasure', x + 12, y + 24, { width: w - 24 });

  const rootX = x + 18;
  const rootY = y + 58;
  const rootW = 165;
  doc.roundedRect(rootX, rootY, rootW, 32, 6).fillAndStroke('#dbeafe', '#60a5fa');
  doc.fillColor('#1e3a8a').font('Helvetica-Bold').fontSize(7.8)
    .text('RiskManagementMeasure', rootX + 8, rootY + 11, { width: rootW - 16, align: 'center' });

  const childY = y + 118;
  const childW = 140;
  const childGap = 16;
  const childXs = [x + 18, x + 18 + childW + childGap, x + 18 + (childW + childGap) * 2];
  const children = [
    ['TechnicalMeasure', '#ede9fe', '#5b21b6'],
    ['OperationalMeasure', '#dcfce7', '#166534'],
    ['OrganizationalMeasure', '#fff7ed', '#9a3412'],
  ];

  childXs.forEach((cx, idx) => {
    const [label, fill, textColor] = children[idx];
    doc.roundedRect(cx, childY, childW, 32, 6).fillAndStroke(fill, '#cbd5e1');
    doc.fillColor(textColor).font('Helvetica-Bold').fontSize(7.4)
      .text(label, cx + 8, childY + 11, { width: childW - 16, align: 'center' });
    const startX = rootX + rootW / 2;
    const endX = cx + childW / 2;
    const startY = rootY + 32;
    const endY = childY;
    doc.strokeColor('#64748b').lineWidth(1.1)
      .moveTo(startX, startY).lineTo(endX, endY).stroke();
    doc.moveTo(endX - 4, endY - 4).lineTo(endX, endY).lineTo(endX + 4, endY - 4).stroke();
  });

  doc.fillColor('#475569').font('Helvetica-Oblique').fontSize(6.3)
    .text('OWL subclass axioms keep the regulatory families explicit and reusable.', x + 12, y + h - 18, {
      width: w - 24,
      align: 'center',
    });
  doc.restore();
}

function drawOwlPropertyChainFigure(x, y, w, h) {
  doc.save();
  doc.roundedRect(x, y, w, h, 7).fillAndStroke('#0f172a', '#334155');
  doc.fillColor('#e2e8f0').font('Helvetica-Bold').fontSize(8.7)
    .text('OWL Role Chain Inference', x + 12, y + 10, { width: w - 24 });
  doc.fillColor('#94a3b8').font('Helvetica').fontSize(6.4)
    .text('The property chain that derives a standard relation from a measure implementation', x + 12, y + 24, { width: w - 24 });

  const rowY = y + 70;
  const boxH = 34;
  const boxW = 132;
  const boxGap = 18;
  const startX = x + 16;
  const steps = [
    ['implementsMeasure', '#dbeafe', '#1e3a8a'],
    ['basedOnStandard', '#ede9fe', '#5b21b6'],
    ['usesStandard', '#dcfce7', '#166534'],
  ];

  steps.forEach(([label, fill, color], idx) => {
    const bx = startX + idx * (boxW + boxGap);
    doc.roundedRect(bx, rowY, boxW, boxH, 6).fillAndStroke(fill, '#cbd5e1');
    doc.fillColor(color).font('Helvetica-Bold').fontSize(8)
      .text(label, bx + 8, rowY + 12, { width: boxW - 16, align: 'center' });
    if (idx < steps.length - 1) {
      const ax = bx + boxW;
      const ay = rowY + 17;
      doc.strokeColor('#94a3b8').lineWidth(1.1)
        .moveTo(ax + 5, ay).lineTo(ax + 13, ay).stroke();
      doc.moveTo(ax + 9, ay - 3).lineTo(ax + 13, ay).lineTo(ax + 9, ay + 3).stroke();
    }
  });

  doc.fillColor('#cbd5e1').font('Helvetica-Oblique').fontSize(6.4)
    .text('Together they support a derived `usesStandard` assertion in the demonstrator.', x + 12, y + h - 18, {
      width: w - 24,
      align: 'center',
    });
  doc.restore();
}

function rdfOwlFigurePage() {
  newPage();
  resetCursor();
  doc.font('Helvetica-Bold').fontSize(12).fillColor('#0f172a')
    .text('RDF Serialization and OWL Compliance Axiom');
  doc.moveDown(0.5);
  const top = doc.y;
  const panelH = 245;
  drawRdfSerializationFigure(LM, top, BODY_W, panelH);
  doc.y = top + panelH + 7;
  doc.fillColor('#111827').font('Helvetica-Bold').fontSize(8.5)
    .text('Figure 6.3: Turtle/RDF serialization of an example encryption measure', LM, doc.y, {
      width: BODY_W,
      align: 'center',
    });
  doc.moveDown(0.25);
  doc.fillColor('#64748b').font('Helvetica-Oblique').fontSize(7.5)
    .text('Source: excerpt adapted from nis2_article21_cybersecurity.ttl.', LM, doc.y, {
      width: BODY_W,
      align: 'center',
    });

  const secondTop = top + 310;
  drawOwlRestrictionFigure(LM, secondTop, BODY_W, panelH);
  doc.y = secondTop + panelH + 7;
  doc.fillColor('#111827').font('Helvetica-Bold').fontSize(8.5)
    .text('Figure 6.4: OWL equivalent-class structure for CompliantEntity', LM, doc.y, {
      width: BODY_W,
      align: 'center',
    });
  doc.moveDown(0.25);
  doc.fillColor('#64748b').font('Helvetica-Oblique').fontSize(7.5)
    .text('Source: visual interpretation of the owl:intersectionOf and owl:someValuesFrom axioms.', LM, doc.y, {
      width: BODY_W,
      align: 'center',
    });
  doc.fillColor('#000000');
}

function owlSupplementaryFigurePage() {
  newPage();
  resetCursor();
  doc.font('Helvetica-Bold').fontSize(12).fillColor('#0f172a')
    .text('Additional OWL Illustrations');
  doc.moveDown(0.6);

  const top = doc.y;
  const panelW = BODY_W;
  const panelH = 190;

  drawOwlHierarchyFigure(LM, top, panelW, panelH);
  doc.y = top + panelH + 6;
  doc.fillColor('#111827').font('Helvetica-Bold').fontSize(8.3)
    .text('Figure 6.5: OWL subclass hierarchy for the three measure families', LM, doc.y, {
      width: BODY_W,
      align: 'center',
    });
  doc.moveDown(0.2);
  doc.fillColor('#64748b').font('Helvetica-Oblique').fontSize(7.2)
    .text('Source: schematic view of the measure taxonomy used in the ontology.', LM, doc.y, {
      width: BODY_W,
      align: 'center',
    });

  doc.moveDown(0.6);
  const secondTop = doc.y;
  drawOwlPropertyChainFigure(LM, secondTop, panelW, 170);
  doc.y = secondTop + 170 + 6;
  doc.fillColor('#111827').font('Helvetica-Bold').fontSize(8.3)
    .text('Figure 6.6: OWL role chain used to derive standard associations', LM, doc.y, {
      width: BODY_W,
      align: 'center',
    });
  doc.moveDown(0.2);
  doc.fillColor('#64748b').font('Helvetica-Oblique').fontSize(7.2)
    .text('Source: visual summary of the implementsMeasure and basedOnStandard chain.', LM, doc.y, {
      width: BODY_W,
      align: 'center',
    });
  doc.fillColor('#000000');
}

// ═══════════════════════════════════════════════════════════════════════
// COVER PAGE — aligned with the university-approved structure
// ═══════════════════════════════════════════════════════════════════════
doc.image('university-logo.png', 194, 78, { width: 208 });
doc.y = 205;
doc.font('Helvetica').fontSize(12)
   .text('Scuola di Scienze Matematiche, Fisiche e Naturali', { align: 'center' });
doc.font('Helvetica').fontSize(12)
   .text('Corso di Laurea Magistrale in Informatica', { align: 'center' });
doc.moveDown(3.2);
doc.font('Helvetica').fontSize(13)
   .text('Tesi di Laurea', { align: 'center' });
doc.moveDown(1.8);
doc.fillColor('#b91c1c').font('Helvetica').fontSize(12)
   .text("UN'ONTOLOGIA OWL PER LA CONFORMITÀ ALLA DIRETTIVA NIS2 ARTICOLO 21: FRAMEWORK DI VALIDAZIONE E RAGIONAMENTO AUTOMATIZZATO PER LE MISURE DI GESTIONE DEL RISCHIO DI CYBERSICUREZZA", { align: 'center', characterSpacing: 0.7 });
doc.moveDown(1.2);
doc.text('AN OWL-BASED ONTOLOGY FOR NIS2 DIRECTIVE ARTICLE 21 COMPLIANCE: AUTOMATED VALIDATION AND REASONING FRAMEWORK FOR CYBERSECURITY RISK-MANAGEMENT MEASURES', { align: 'center', characterSpacing: 0.7 });
doc.fillColor('#000000');
doc.moveDown(2.4);
doc.font('Helvetica').fontSize(11).text('ABDUL KADER', { align: 'center', characterSpacing: 0.8 });
doc.moveDown(2.8);
doc.font('Helvetica').fontSize(11)
   .text('Relatore: Prof. Enrico Francesconi', { align: 'center' });
doc.moveDown(4.5);
doc.font('Helvetica').fontSize(11).text('Anno Accademico 2025-2026', { align: 'center' });

// ═══════════════════════════════════════════════════════════════════════
// TITLE VERSO
// ═══════════════════════════════════════════════════════════════════════
newPage();
doc.y = 390;
doc.font('Helvetica').fontSize(10)
   .text('Abdul Kader: An OWL-Based Ontology for NIS2 Directive Article 21 Compliance: Automated Validation and Reasoning Framework for Cybersecurity Risk-Management Measures, Laurea Magistrale in Resilient and Secure Cyber Physical Systems, © Academic Year 2025-2026', LM + 55, doc.y, {
     width: BODY_W - 110,
     align: 'left',
     lineGap: 2,
   });

// ═══════════════════════════════════════════════════════════════════════
// TABLE OF CONTENTS
// ═══════════════════════════════════════════════════════════════════════
newPage();
doc.font('Helvetica-Bold').fontSize(14).text('C O N T E N T S', { align: 'center' });
doc.moveDown(1);

const tocItems = [
  { t: 'Contents', l: 1, p: 3 },
  { t: 'List of Figures', l: 1, p: 5 },
  { t: 'List of Tables', l: 1, p: 6 },
  { t: 'Abstract', l: 1, p: 7 },
  { t: 'Glossary', l: 1, p: 8 },
  { t: 'Abbreviations', l: 1, p: 9 },
  { t: '1.  Introduction', l: 1, p: 10 },
  { t: '1.1  Background and Context', l: 2 },
  { t: '1.2  Problem Statement', l: 2 },
  { t: '1.3  Research Objectives', l: 2 },
  { t: '1.4  Research Questions', l: 2 },
  { t: '1.5  Scope and Limitations', l: 2 },
  { t: '1.6  Thesis Structure and Contributions', l: 2 },
  { t: '2.  Literature Review', l: 1, p: 14 },
  { t: '2.1  Semantic Web Technologies and Ontologies', l: 2 },
  { t: '2.2  OWL and RDF Standards', l: 2 },
  { t: '2.3  Regulatory Compliance in Cybersecurity', l: 2 },
  { t: '2.4  NIS2 Directive Overview', l: 2 },
  { t: '2.5  Existing Compliance Tools and Approaches', l: 2 },
  { t: '2.6  Ontology-Based Compliance Systems', l: 2 },
  { t: '2.7  Research Gap', l: 2 },
  { t: '3.  Theoretical Foundation', l: 1, p: 21 },
  { t: '3.1  Web Ontology Language (OWL 2)', l: 2 },
  { t: '3.2  RDF and RDFS Fundamentals', l: 2 },
  { t: '3.3  Ontology Engineering Principles', l: 2 },
  { t: '3.4  Reasoning in Description Logics', l: 2 },
  { t: '3.5  SPARQL Query Language', l: 2 },
  { t: '3.6  SHACL — Shapes Constraint Language', l: 2 },
  { t: '3.7  SKOS Vocabulary and Semantic Alignment', l: 2 },
  { t: '4.  NIS2 Directive Article 21: Requirements Analysis', l: 1, p: 27 },
  { t: '4.1  Article 21 Legal Text and Scope', l: 2 },
  { t: '4.2  Article 21(2) Requirements', l: 2 },
  { t: '4.3  Essential vs. Important Entities', l: 2 },
  { t: '4.4  Operational Classes Covering Measures (a)–(j)', l: 2 },
  { t: '4.5  Compliance Criteria', l: 2 },
  { t: '4.6  Challenges in Manual Compliance Verification', l: 2 },
  { t: '5.  Methodology', l: 1, p: 39 },
  { t: '5.1  Ontology Development Process (METHONTOLOGY)', l: 2 },
  { t: '5.2  Requirements Gathering', l: 2 },
  { t: '5.3  Competency Questions Definition', l: 2 },
  { t: '5.4  Class Hierarchy Design', l: 2 },
  { t: '5.5  Property Definition', l: 2 },
  { t: '5.6  Validation Rules Design', l: 2 },
  { t: '5.7  System Architecture', l: 2 },
  { t: '5.8  Technology Stack Selection', l: 2 },
  { t: '6.  Ontology Design and Implementation', l: 1, p: 45 },
  { t: '6.1  Ontology Structure and Namespace', l: 2 },
  { t: '6.2  Core Classes', l: 2 },
  { t: '6.3  Object Properties', l: 2 },
  { t: '6.4  Data Properties', l: 2 },
  { t: '6.5  OWL 2 Axioms', l: 2 },
  { t: '6.6  SKOS Annotations and External Alignments', l: 2 },
  { t: '6.7  Competency Questions Validation', l: 2 },
  { t: '6.8  Ontology Validation', l: 2 },
  { t: '7.  System Implementation', l: 1, p: 57 },
  { t: '7.1  System Architecture Overview', l: 2 },
  { t: '7.2  Backend Implementation', l: 2 },
  { t: '7.3  Frontend Implementation', l: 2 },
  { t: '7.4  Integration and Testing', l: 2 },
  { t: '8.  System Demonstration and Use Cases', l: 1, p: 63 },
  { t: '8.1  Interactive Graph Visualization', l: 2 },
  { t: '8.2  OWL Validation and Reasoning', l: 2 },
  { t: '8.3  SHACL Shapes Validation', l: 2 },
  { t: '8.4  SPARQL Query Interface', l: 2 },
  { t: '8.5  Real-Time Entity Compliance Checking', l: 2 },
  { t: '9.  Evaluation and Results', l: 1, p: 76 },
  { t: '9.1  Ontology Completeness', l: 2 },
  { t: '9.2  Validation Accuracy', l: 2 },
  { t: '9.3  Reasoning Performance', l: 2 },
  { t: '9.4  Case Studies', l: 2 },
  { t: '9.5  Comparison with Existing Approaches', l: 2 },
  { t: '10. Discussion', l: 1, p: 81 },
  { t: '10.1  Contributions to the Field', l: 2 },
  { t: '10.2  Limitations', l: 2 },
  { t: '10.3  Future Work', l: 2 },
  { t: '11. Conclusion', l: 1, p: 86 },
  { t: '11.1  Summary of Contributions', l: 2 },
  { t: '11.2  Achievement of Research Objectives', l: 2 },
  { t: '11.3  Future Research Directions', l: 2 },
  { t: 'References', l: 1, p: 91 },
];

tocItems.forEach(item => {
  const indent = item.l === 1 ? 0 : 24;
  const font   = item.l === 1 ? 'Helvetica-Bold' : 'Helvetica';
  const y = doc.y;
  doc.font(font).fontSize(10.5);
  if (item.p) {
    const leftX = LM + indent;
    const rightX = PW - RM - 25;
    doc.text(item.t, leftX, y, { width: rightX - leftX, continued: false });
    doc.font('Helvetica').text(String(item.p), rightX, y, { align: 'right', width: 25 });
  } else {
    doc.text(item.t, LM + indent, y, { width: BODY_W - indent - 20 });
  }
  doc.moveDown(0.15);
});

newPage();
doc.font('Helvetica-Bold').fontSize(14).text('List of Figures', { align: 'center' });
doc.moveDown(1);
tableSimple(['Figure', 'Description'], [
  ['Figure 6.1', 'Protégé class hierarchy panel showing the complete NIS2 Article 21 ontology structure'],
  ['Figure 6.2', 'Protégé data property hierarchy panel showing the five datatype properties'],
  ['Figure 6.3', 'Turtle/RDF serialization excerpt for an example encryption measure'],
  ['Figure 6.4', 'OWL equivalent-class structure defining CompliantEntity'],
  ['Figure 6.5', 'OWL subclass hierarchy for the three measure families'],
  ['Figure 6.6', 'OWL role chain used to derive standard associations'],
  ['Figure 6.7', 'Protégé ontology graph showing classes, individuals, and inter-class relationships'],
  ['Figure 8.1', 'Ontology explorer showing representative entity, measure, risk, system, and standard relations'],
  ['Figure 8.2', 'Structural ontology validation report generated from /api/validate'],
  ['Figure 8.3', 'Entity classification and standard derivation generated from /api/reason'],
  ['Figure 8.4', 'SHACL-oriented coverage and quality validation generated from /api/shacl'],
  ['Figure 8.5', 'Real-time entity assessment generated from /api/check-entity'],
  ['Figure 8.6', 'SPARQL competency query and result table for standard associations'],
]);

newPage();
doc.font('Helvetica-Bold').fontSize(14).text('List of Tables', { align: 'center' });
doc.moveDown(1);
tableSimple(['Table', 'Description'], [
  ['Table 1', 'Glossary of core ontology and compliance terms'],
  ['Table 2', 'Abbreviations used throughout the thesis'],
  ['Table 3', 'Article 21 measure categories and standard alignment'],
  ['Table 4', 'Ontology technology stack selection'],
  ['Table 5', 'SKOS annotation and external alignment summary'],
  ['Table 6', 'API endpoint reference'],
]);

// ═══════════════════════════════════════════════════════════════════════
// ABSTRACT
// ═══════════════════════════════════════════════════════════════════════
newPage();
doc.font('Helvetica-Bold').fontSize(14).text('Abstract', { align: 'center' });
doc.moveDown(1);
body('The European Union\'s Network and Information Security Directive 2 (NIS2), formally designated as Directive (EU) 2022/2555, requires essential and important entities to implement cybersecurity risk-management measures under Article 21. Article 21(2) contains ten lettered categories, from (a) to (j). This thesis operationalizes them as twelve ontology classes by modeling the training component of point (g) separately from basic cyber hygiene and the authentication and secure-communications components of point (j) separately. Compliance verification in practice remains predominantly manual, relying on spreadsheets and informal assessments that are difficult to query, validate, and maintain.');
body('This thesis presents the design and implementation of a formal OWL 2 DL ontology for representing NIS2 Article 21(2) requirements in machine-processable form. The ontology, published under the persistent URI namespace https://w3id.org/nis2/article21#, connects the twelve operational classes through object properties and logical axioms including equivalentClass, complementOf, allValuesFrom, someValuesFrom, and propertyChainAxiom. The prototype classifies an entity as CompliantEntity when its asserted implementations cover all twelve operational classes, thereby covering all ten legal categories at the selected modeling granularity.');
body('A key contribution is a property chain axiom: usesStandard is defined as the composition of implementsMeasure and basedOnStandard. This permits derivation of entity-to-standard relations from implemented measures. Eight operational classes also carry SKOS exactMatch or closeMatch links to external cybersecurity resources.');
body('The framework is complemented by three SHACL shapes for structural validation, a SPARQL 1.1 query interface supporting five competency questions derived from NIS2 Article 21 compliance requirements, and a real-time entity compliance checking endpoint that classifies arbitrary organizational entities without modifying the ontology. An interactive web-based interface built on Node.js and Express provides access to all framework capabilities, including knowledge graph visualization using vis-network, OWL reasoning, SHACL validation, and SPARQL querying.');
body('Evaluation demonstrates that the five competency questions return the expected results, the three implemented SHACL-oriented checks produce the expected outcomes for the example data, and the bounded reasoning service reports complete and incomplete category coverage correctly. The thesis establishes a reusable, standards-aligned ontological foundation for NIS2 Article 21 compliance automation that can be extended to cover broader NIS2 obligations and integrated with organizational security information systems.');

// ═══════════════════════════════════════════════════════════════════════
// GLOSSARY
// ═══════════════════════════════════════════════════════════════════════
newPage();
doc.font('Helvetica-Bold').fontSize(14).text('Glossary', { align: 'center' });
doc.moveDown(1);
tableSimple(['Term', 'Definition'], [
  ['Ontology', 'A formal, explicit specification of a shared conceptualization of a domain'],
  ['OWL 2 DL', 'Web Ontology Language profile guaranteeing decidable reasoning'],
  ['Reasoner', 'Software that derives new knowledge from ontology axioms via logical inference'],
  ['Triple', 'An RDF statement in the form subject–predicate–object'],
  ['SPARQL', 'Standard query language for RDF knowledge graphs'],
  ['SHACL', 'W3C standard for validating RDF graphs against structural constraints'],
  ['SKOS', 'W3C vocabulary for knowledge organization and concept alignment'],
  ['NIS2', 'EU Directive 2022/2555 on measures for high common level of cybersecurity'],
  ['Article 21', 'NIS2 article requiring risk-management measures; paragraph 2 lists ten lettered categories'],
  ['Essential Entity', 'High-criticality organization subject to stricter NIS2 obligations'],
  ['Important Entity', 'Significant-criticality organization subject to standard NIS2 obligations'],
  ['Compliance', 'Coverage of all ten legal categories through the ontology’s twelve operational measure classes'],
  ['Property Chain', 'OWL axiom composing two properties: P is derived by composing Q and R'],
  ['SHACL Shape', 'A constraint definition targeting a class and specifying expected properties'],
  ['Namespace', 'URI prefix identifying an ontology, e.g., https://w3id.org/nis2/article21#'],
]);

// ═══════════════════════════════════════════════════════════════════════
// ABBREVIATIONS
// ═══════════════════════════════════════════════════════════════════════
newPage();
doc.font('Helvetica-Bold').fontSize(14).text('Abbreviations', { align: 'center' });
doc.moveDown(1);
tableSimple(['Abbreviation', 'Full Form'], [
  ['OWL',    'Web Ontology Language'],
  ['RDF',    'Resource Description Framework'],
  ['RDFS',   'RDF Schema'],
  ['SPARQL', 'SPARQL Protocol and RDF Query Language'],
  ['SHACL',  'Shapes Constraint Language'],
  ['SKOS',   'Simple Knowledge Organization System'],
  ['NIS2',   'Network and Information Security Directive 2'],
  ['EU',     'European Union'],
  ['URI',    'Uniform Resource Identifier'],
  ['IRI',    'Internationalized Resource Identifier'],
  ['DL',     'Description Logic'],
  ['API',    'Application Programming Interface'],
  ['UI',     'User Interface'],
  ['TTL',    'Turtle (RDF serialization format)'],
  ['JSON',   'JavaScript Object Notation'],
  ['ISO',    'International Organization for Standardization'],
  ['NIST',   'National Institute of Standards and Technology'],
  ['ENISA',  'European Union Agency for Cybersecurity'],
  ['CSF',    'Cybersecurity Framework'],
  ['CQ',     'Competency Question'],
]);

// ═══════════════════════════════════════════════════════════════════════
// CHAPTER 1 — INTRODUCTION
// ═══════════════════════════════════════════════════════════════════════
newPage();
chapterHeading(1, 'Introduction');

sectionHeading('1.1  Background and Context');
body('The European Union\'s Network and Information Security Directive 2 (NIS2), formally designated as Directive (EU) 2022/2555, represents a landmark advancement in the regulatory landscape for cybersecurity governance across EU member states. Entered into force on 16 January 2023 and superseding the original NIS Directive of 2016, NIS2 substantially broadens the scope of mandatory cybersecurity obligations, extending requirements to a significantly wider range of sectors including energy, transport, banking, health, digital infrastructure, and public administration. Organizations falling within its scope are classified as either essential entities or important entities, each subject to proportionate but rigorous compliance obligations.');
body('Central to the NIS2 framework is Article 21, which mandates that covered entities implement comprehensive cybersecurity risk-management measures. Article 21(2) lists ten categories, from (a) to (j), covering risk analysis, incident handling, business continuity, supply-chain security, secure development, effectiveness assessment, cyber hygiene and training, cryptography, personnel and access governance, authentication, and secure communications. The ontology decomposes two compound provisions into twelve operational classes. Non-compliance can result in administrative fines of up to €10 million or 2% of global annual turnover for essential entities, and €7 million or 1.4% turnover for important entities.');
body('Despite the regulatory clarity of Article 21, compliance verification in practice remains a predominantly manual, resource-intensive process. Organizations typically rely on spreadsheet-based checklists, external audit consultants, and informal self-assessments that lack formal rigor, are not machine-processable, and cannot scale effectively. The gap between the formal legal text and the computational tools available for automated compliance checking represents a compelling research challenge at the intersection of semantic web technologies, knowledge representation, and cybersecurity governance.');
body('The field of ontology engineering, anchored in the W3C\'s Web Ontology Language (OWL) and the broader Semantic Web technology stack, offers a well-established approach to formalizing complex domain knowledge for computational processing. Ontologies enable automated reasoning via description logic inference engines, structured querying through SPARQL, and constraint validation through SHACL, providing the technical foundation needed for an automated NIS2 compliance framework.');

sectionHeading('1.2  Problem Statement');
body('Three fundamental problems motivate this research. First, no formal, machine-processable OWL ontology exists that specifically represents NIS2 Article 21(2) compliance requirements, leaving organizations without a standardized computational basis for automated compliance checking. Second, existing compliance assessment approaches lack the semantic expressiveness to capture logical relationships between cybersecurity measures, the entities subject to compliance obligations, and the risk types these measures address — meaning compliance gaps cannot be inferred automatically. Third, there is no ontological framework aligning NIS2 requirements with established cybersecurity standards such as ISO/IEC 27001:2022 and the NIST Cybersecurity Framework, making interoperability and cross-reference difficult.');
body('The consequence is that compliance officers and IT security managers must manually interpret legal text, map requirements to controls, and conduct assessments without computational support — a process that is error-prone, slow, and increasingly untenable as the number of regulated entities grows following NIS2\'s expanded scope.');

sectionHeading('1.3  Research Objectives');
body('The primary objectives of this thesis are:');
numbered(1, 'Design and implement a formal OWL 2 DL ontology that represents the ten Article 21(2) legal categories through twelve operational measure classes with associated properties and logical axioms.');
numbered(2, 'Develop a bounded compliance reasoning service that applies the ontology’s category-coverage pattern and property-chain-equivalent standard derivation.');
numbered(3, 'Implement SHACL constraint validation for structural integrity checking of ontology instances against NIS2 compliance shapes.');
numbered(4, 'Provide a SPARQL 1.1 query interface supporting five competency questions derived from NIS2 Article 21 requirements.');
numbered(5, 'Develop an interactive web-based visualization and compliance checking interface accessible to non-technical stakeholders.');
numbered(6, 'Establish SKOS semantic alignments linking NIS2 measures to ISO 27001, NIST CSF, CIS Controls, and ENISA guidelines.');
doc.moveDown(0.5);

sectionHeading('1.4  Research Questions');
body('This thesis addresses the following research questions:');
bullet('RQ1: How can NIS2 Article 21(2) cybersecurity risk-management requirements be formally represented in OWL 2 DL with sufficient expressiveness for automated compliance reasoning?');
bullet('RQ2: Which OWL 2 axiom patterns are most appropriate for modeling compliance obligations and automatic entity classification?');
bullet('RQ3: How can SHACL constraints complement OWL reasoning to provide comprehensive instance validation?');
bullet('RQ4: To what extent can competency questions derived from NIS2 Article 21 be answered through SPARQL queries over the implemented ontology?');
bullet('RQ5: How can the ontology support real-time compliance checking for arbitrary organizational entities without modifying the ontology structure?');
doc.moveDown(0.5);

sectionHeading('1.5  Scope and Limitations');
body('This thesis focuses specifically on Article 21(2) of Directive (EU) 2022/2555. The legal text lists ten categories; the ontology uses twelve operational classes by splitting the combined cyber-hygiene/training provision and the combined authentication/secure-communications provision. The scope does not extend to incident reporting obligations (Article 23), management-body obligations (Article 20), or supervisory measures (Chapter VI). The ontology is designed for OWL 2 DL to retain decidable formal semantics.');
body('Limitations include the use of a structural reasoning implementation in Node.js rather than a full-featured OWL 2 reasoner (such as HermiT or Pellet), meaning some advanced OWL DL inferences are approximated. The custom SPARQL engine supports basic graph patterns and FILTER expressions but not UNION, OPTIONAL, or SPARQL 1.1 property paths. The ontology represents requirements as of the 2022/2555 Directive text and may require updates as national transpositions and implementing acts are issued by member states.');

sectionHeading('1.6  Thesis Structure and Contributions');
body('The remainder of this thesis is organized as follows. Chapter 2 reviews relevant literature. Chapter 3 provides theoretical foundations. Chapter 4 analyses NIS2 Article 21 requirements. Chapter 5 describes the methodology. Chapter 6 presents ontology design and implementation. Chapter 7 covers system implementation. Chapter 8 demonstrates system functionality. Chapter 9 presents evaluation. Chapter 10 discusses findings. Chapter 11 concludes.');
body('Principal contributions: (1) a dedicated OWL 2 DL ontology for NIS2 Article 21 compliance under the w3id.org persistent namespace; (2) a property chain axiom for inferring security standard usage; (3) a web-based compliance framework with SPARQL, SHACL-oriented validation, and interactive visualization; (4) SKOS alignments to ISO 27001, NIST CSF, CIS Controls, and ENISA; and (5) real-time entity compliance checking without ontology modification.');
body('The ontology, application source code, validation artifacts, and report-generation scripts are publicly available in the project repository (Kader, 2026): https://github.com/abdul-kader138/nis2-ontology-visualizer.');

academicAnalysisPage('1.7  Research Significance',
  'The research addresses an interdisciplinary translation problem: Article 21 is expressed as a legal and organizational obligation, while automated assessment requires explicit concepts, stable relations, and testable conditions. The thesis therefore contributes both a formal knowledge model and an executable demonstration of that model.',
  'Its academic significance lies in connecting legal interpretation, cybersecurity governance, and Semantic Web engineering within one traceable artifact. The work evaluates not only whether the requirements can be encoded, but also whether the resulting representation can support inference, validation, querying, and explanation.',
  'The framework remains decision support rather than a substitute for legal interpretation, audit evidence, or a determination by a competent authority.');
academicAnalysisPage('1.8  Research Design and Thesis Argument',
  'The study follows a design-science structure in which a relevant problem is identified, an artifact is constructed, and the artifact is evaluated against requirements derived from the problem domain. The artifact includes the ontology and the supporting application because formal correctness alone does not establish operational usefulness.',
  'The central argument is that OWL reasoning and SHACL validation should remain complementary. OWL captures logical consequences under open-world semantics, while SHACL tests whether a submitted graph satisfies explicit completeness and datatype constraints. SPARQL supplies an independent inspection layer.',
  'The evaluation demonstrates technical feasibility within the declared scope; it does not establish effectiveness across all regulated sectors or organizational environments.');

// ═══════════════════════════════════════════════════════════════════════
// CHAPTER 2 — LITERATURE REVIEW
// ═══════════════════════════════════════════════════════════════════════
newPage();
chapterHeading(2, 'Literature Review');

sectionHeading('2.1  Semantic Web Technologies and Ontologies');
body('The Semantic Web, introduced by Berners-Lee et al. (2001), provides a framework for representing and sharing data in a machine-interpretable form through a layered architecture of standards. At its foundation, the Resource Description Framework (RDF) provides a graph-based data model for representing information as subject-predicate-object triples. RDF Schema (RDFS) extends RDF with vocabulary for describing class hierarchies and property domains. The Web Ontology Language (OWL), standardized by the W3C in 2004 and revised as OWL 2 in 2009, adds rich description logic expressiveness to the Semantic Web stack, enabling formal knowledge representation with automated reasoning capabilities.');
body('An ontology, in the context of knowledge engineering, is defined as a formal, explicit specification of a shared conceptualization of a domain (Gruber, 1993). Ontologies provide a structured vocabulary for describing domain entities, their properties, and the relationships between them, expressed in a language with well-defined semantics that enables automated reasoning. The engineering of ontologies for complex regulatory and legal domains has received growing attention as organizations seek to manage compliance obligations computationally.');

sectionHeading('2.2  OWL and RDF Standards');
body('OWL 2 is defined in terms of Description Logic SROIQ(D), providing a decidable fragment of first-order logic with sufficient expressiveness for knowledge representation tasks. The OWL 2 DL profile, used in this thesis, guarantees decidability of reasoning tasks including classification, consistency checking, and instance retrieval. Key OWL 2 constructs relevant to compliance modeling include equivalentClass (defining a class as logically equivalent to a complex class expression), someValuesFrom (existential restriction), allValuesFrom (universal restriction), complementOf (class negation), disjointWith (mutual exclusion), and propertyChainAxiom (composing two properties into a single derived property).');
body('The SPARQL 1.1 Query Language (Harris & Seaborne, 2013) provides a standardized mechanism for querying RDF knowledge graphs through SELECT, CONSTRUCT, ASK, and DESCRIBE queries. SPARQL supports basic graph patterns, FILTER expressions, aggregation, and OPTIONAL clauses, enabling sophisticated interrogation of ontological knowledge. The SHACL Shapes Constraint Language (Knublauch & Kontokostas, 2017) complements OWL by providing closed-world structural validation of RDF graphs against user-defined shapes, filling the open-world assumption gap of OWL reasoning for data validation purposes.');

sectionHeading('2.3  Regulatory Compliance in Cybersecurity');
body('Regulatory compliance in cybersecurity has become increasingly complex with the proliferation of sector-specific and cross-sector regulations. Prior to NIS2, the original NIS Directive (2016/1148/EU) established the first EU-wide cybersecurity framework, but its limited scope and inconsistent national implementation prompted the development of NIS2. Other significant cybersecurity regulations include the EU Cybersecurity Act (2019/881/EU), the General Data Protection Regulation (GDPR, 2016/679/EU), the Digital Operational Resilience Act (DORA, 2022/2554/EU) for financial entities, and sector-specific frameworks such as PCI DSS for payment card industry and HIPAA for healthcare.');
body('The challenge of compliance verification across these frameworks has driven interest in automated compliance checking approaches. Traditional audit-based methods are costly and provide only point-in-time snapshots of compliance posture. Model-based and ontology-based approaches offer the potential for continuous, automated compliance monitoring that can adapt as both technical configurations and regulatory requirements evolve.');

sectionHeading('2.4  NIS2 Directive Overview');
body('Directive (EU) 2022/2555 (NIS2) was adopted by the European Parliament on 14 December 2022 and entered into force on 16 January 2023, with a transposition deadline of 17 October 2024. NIS2 expands the scope of the original NIS Directive to cover more sectors and entities, introduces stricter security requirements, and harmonizes supervisory and enforcement frameworks across member states. It distinguishes between essential entities (subject to proactive supervision) and important entities (subject to reactive supervision after incidents).');
body('Article 21 represents the operational core of NIS2, requiring covered entities to take appropriate and proportionate technical, operational, and organizational measures. Article 21(2) enumerates ten legal categories labelled (a) through (j). Point (g) combines basic cyber hygiene with cybersecurity training, while point (j) combines multi-factor or continuous authentication with secured communications and emergency communications. The ontology decomposes these compound provisions into twelve classes to support more specific querying and validation.');

sectionHeading('2.5  Existing Compliance Tools and Approaches');
body('Existing tools for NIS2 and general cybersecurity compliance span several categories. Commercial GRC (Governance, Risk, and Compliance) platforms such as ServiceNow GRC, RSA Archer, and IBM OpenPages provide workflow-based compliance management but generally represent obligations through configurable control catalogues rather than formal OWL semantics. ENISA publishes NIS2 information and implementation-oriented resources for organizations and national authorities, but these materials remain primarily document-oriented (European Union Agency for Cybersecurity, 2023).');
body('Academic approaches to automated compliance checking have explored model-driven engineering, formal methods, and semantic technologies. Governatori et al. (2006) demonstrated compliance checking between formally represented business processes and business contracts. Related Semantic Web standards provide reusable mechanisms for ontology modeling, querying, and constraint validation, but the reviewed literature did not identify a dedicated OWL model of the Article 21(2) measure set.');

sectionHeading('2.6  Ontology-Based Compliance Systems');
body('The application of ontologies to regulatory compliance has been explored across legal and organizational domains. Hassan (2025) developed a legal ontology for Section 29 of the Australian National Consumer Credit Protection Act and used OWL reasoning and SPARQL queries for compliance checking. This provides a structurally relevant example of ontology-based legal compliance in a domain outside cybersecurity. Together with established ontology-engineering methods and W3C Semantic Web standards, such work supports the feasibility of the approach adopted in this thesis.');
body('These works collectively establish the feasibility and methodological approach of ontology-based compliance checking, while the specific domain of NIS2 Article 21 cybersecurity compliance remains unaddressed in the literature, constituting the research gap this thesis fills.');

sectionHeading('2.7  Research Gap');
body('The literature review identifies a domain-specific gap: the reviewed sources did not provide a formal OWL 2 DL ontology dedicated to NIS2 Article 21(2) compliance verification. Existing guidance is primarily document-oriented, while ontology-based compliance studies address other regulatory domains. This thesis responds with a machine-processable framework for Article 21 that combines OWL 2 modeling, SHACL validation, SPARQL querying, and SKOS semantic alignment.');

academicAnalysisPage('2.8  Critical Synthesis of Prior Work',
  'The literature demonstrates mature component technologies but limited integration at the level of a specific NIS2 obligation. Semantic Web research supplies expressive representation languages, legal-ontology research supplies formalization methods, and cybersecurity standards supply detailed control catalogues.',
  'The unresolved research problem is how these strands can be combined without treating controls, legal requirements, and evidence as interchangeable. The present study responds by assigning separate ontological roles to entities, measure categories, risks, systems, and external standards.',
  'The identified gap concerns domain-specific integration rather than the absence of established Semantic Web technologies.');
academicAnalysisPage('2.9  Comparison of Compliance Paradigms',
  'Document-centric assessments are accessible but difficult to query and validate consistently. Rule engines automate decisions but often embed interpretation in implementation-specific code. Ontologies make the conceptualization explicit and allow several standards-based mechanisms to operate over a shared graph.',
  'A hybrid ontology approach offers stronger interoperability and explainability because classifications can be traced through named classes and properties. It also permits the same data to support inference, constraint checking, and analytical queries.',
  'No technical paradigm eliminates interpretation; every formal model remains a documented and revisable reading of the legal source.');
academicAnalysisPage('2.10  Positioning of the Present Study',
  'This thesis is positioned between legal knowledge representation and applied cybersecurity engineering. It does not attempt a complete ontology of NIS2 and does not replace organizational risk management. It develops a bounded model of Article 21(2) connected to a demonstrable workflow.',
  'The work extends prior compliance-ontology research by addressing a recent EU cybersecurity instrument, combining OWL and SHACL, and exposing the formal model through an interactive application. These choices allow the artifact to be evaluated semantically and operationally.',
  'The bounded scope supports internal coherence, while broader regulatory generalization remains a subject for future research.');
renderLiteratureSynthesis();

// ═══════════════════════════════════════════════════════════════════════
// CHAPTER 3 — THEORETICAL FOUNDATION
// ═══════════════════════════════════════════════════════════════════════
newPage();
chapterHeading(3, 'Theoretical Foundation');

sectionHeading('3.1  Web Ontology Language (OWL 2)');
body('OWL 2 is the W3C standard for representing rich and complex knowledge about entities, groups of entities, and the relationships between them. It is grounded in Description Logic SROIQ(D), a highly expressive decidable fragment of first-order predicate logic. OWL 2 supports three main profiles: OWL 2 EL (polynomial-time reasoning), OWL 2 QL (query rewriting), and OWL 2 RL (rule-based reasoning). This thesis uses OWL 2 DL, the full description logic profile, which provides the expressiveness needed for compliance modeling while guaranteeing decidability of key reasoning tasks.');
body('Key OWL 2 DL constructs used in this thesis include:');
bullet('owl:equivalentClass — declares two class expressions logically equivalent, used to define CompliantEntity as exactly the set of entities implementing all 12 measures.');
bullet('owl:complementOf — class negation, used to define NonCompliantEntity as the complement of CompliantEntity.');
bullet('owl:someValuesFrom — existential restriction, requiring at least one value of a property to belong to a class.');
bullet('owl:allValuesFrom — universal restriction, requiring all values of a property to belong to a class.');
bullet('owl:disjointWith and owl:AllDisjointClasses — declaring classes mutually exclusive.');
bullet('owl:propertyChainAxiom — composing two properties P and Q to derive a third property R: R(x,z) if P(x,y) ∧ Q(y,z).');
bullet('owl:qualifiedCardinality — counting restrictions specifying minimum or exact numbers of property values of a given type.');

sectionHeading('3.2  RDF and RDFS Fundamentals');
body('The Resource Description Framework (RDF) provides the foundation for representing knowledge as directed labeled graphs. RDF models information as triples (subject, predicate, object), where each component is identified by a URI or blank node, and object values may be literals. RDF graphs can be serialized in multiple formats including Turtle (.ttl), RDF/XML (.owl/.rdf), N-Triples, and JSON-LD. This thesis uses both Turtle (primary development format) and RDF/XML (secondary format for Protégé compatibility) as ontology serializations.');
body('RDF Schema (RDFS) extends RDF with vocabulary for defining class hierarchies (rdfs:subClassOf), property domains and ranges (rdfs:domain, rdfs:range), and annotations (rdfs:label, rdfs:comment). Dublin Core metadata terms (dc:title, dc:creator, dc:description) are used for ontology documentation, following best practices for ontology metadata.');

sectionHeading('3.3  Ontology Engineering Principles');
body('This thesis follows the METHONTOLOGY ontology development methodology (Fernández-López et al., 1997), which provides a structured process for ontology construction comprising: (1) specification — defining purpose and competency questions; (2) conceptualization — identifying concepts, properties, and relationships; (3) formalization — expressing the conceptualization in a formal language; (4) implementation — coding the ontology; and (5) evaluation — verifying the ontology against requirements. Competency questions (CQs), as advocated by Grüninger and Fox (1995), play a central role in guiding ontology design and verifying correctness.');

sectionHeading('3.4  Reasoning in Description Logics');
body('Description Logic (DL) reasoning derives new knowledge from explicitly stated axioms through formal inference rules. Key reasoning tasks include: (1) satisfiability checking — determining whether a class can have instances; (2) subsumption — determining whether one class is a subclass of another; (3) classification — computing the complete class hierarchy; and (4) instance retrieval — finding all instances of a class. In this thesis, the reasoning engine applies these principles structurally to classify entities as CompliantEntity or NonCompliantEntity based on their implemented measures, using the equivalentClass axiom as the classification rule.');
body('The property chain axiom owl:propertyChainAxiom [implementsMeasure, basedOnStandard] on the usesStandard property implements a form of role chain reasoning: if entity E implementsMeasure M, and M basedOnStandard S, then E usesStandard S. This inference pattern is directly analogous to DL role chain composition and is a standard OWL 2 DL feature.');

sectionHeading('3.5  SPARQL Query Language');
body('SPARQL 1.1 (SPARQL Protocol and RDF Query Language) is the W3C standard query language for RDF knowledge graphs. A SPARQL SELECT query specifies a set of triple patterns (the basic graph pattern) that must match triples in the knowledge graph, optionally combined with FILTER expressions for value constraints, GROUP BY for aggregation, and ORDER BY for sorting. SPARQL queries are evaluated against an RDF dataset consisting of a default graph and named graphs.');
body('In this thesis, SPARQL queries serve two purposes: (1) answering competency questions that verify ontology correctness against requirements, and (2) providing an interactive query interface for compliance analysis. Five competency question queries are implemented, covering: measures addressing critical risks, standards used by compliant entities, incident prevention measures, measures applying to specific systems, and entity-measure compliance mappings.');

sectionHeading('3.6  SHACL — Shapes Constraint Language');
body('The SHACL Shapes Constraint Language (W3C Recommendation, 2017) provides a language for describing and validating RDF graphs. SHACL defines shapes — node shapes and property shapes — that specify constraints on the structure and values of RDF nodes. Unlike OWL\'s open-world assumption (the absence of a fact does not imply its negation), SHACL operates under a closed-world assumption, making it suitable for data validation scenarios where completeness is expected.');
body('This thesis defines three SHACL shapes: (1) Article21ComplianceShape targets nis2:Entity and requires at least one implementsMeasure value in each of the twelve operational classes; (2) MeasureQualityShape targets nis2:RiskManagementMeasure and checks appropriateness, proportionality, state-of-the-art, and description properties; and (3) RiskLevelShape targets nis2:CybersecurityRisk and checks exactly one riskLevel from the controlled list low, medium, high, or critical.');

sectionHeading('3.7  SKOS Vocabulary and Semantic Alignment');
body('The Simple Knowledge Organization System (SKOS) is a W3C recommendation providing a standard vocabulary for knowledge organization systems. SKOS concepts (skos:Concept) can be organized into schemes and connected through hierarchical (skos:broader/narrower) and associative (skos:related) relationships. For cross-vocabulary alignment, SKOS provides skos:exactMatch (the two concepts are interchangeable), skos:closeMatch (closely related but not identical), skos:broadMatch, and skos:narrowMatch.');
body('In this ontology, SKOS alignment properties annotate NIS2 measure classes with references to corresponding concepts in external cybersecurity standards: ISO/IEC 27001:2022, the NIST Cybersecurity Framework, CIS Controls v8, and ENISA guidelines. This enables semantic interoperability — tools consuming the ontology can traverse skos:closeMatch links to access related content in aligned standards without duplicating their content.');

academicAnalysisPage('3.8  Open-World and Closed-World Semantics',
  'OWL follows the open-world assumption: absence of a statement does not establish that the statement is false. This is appropriate for distributed knowledge but problematic when an assessment must identify omitted mandatory information.',
  'SHACL provides the complementary validation perspective by requiring qualified values and reporting violations when expected assertions are absent. Separating these mechanisms avoids forcing data-completeness tests into OWL constructs whose semantics were designed for logical entailment.',
  'A SHACL violation indicates an incomplete or non-conforming graph; it does not by itself prove that the underlying organization lacks the relevant control.');
academicAnalysisPage('3.9  Semantic Alignment Principles',
  'Concepts from NIS2 and external standards may overlap without being legally identical. Strict OWL equivalence would permit properties and classifications to propagate between concepts and could produce claims stronger than the source material supports.',
  'SKOS close-match relations provide a deliberately weaker alignment. They enable cross-framework navigation and interpretation while preserving the independent normative status of each standard and legal requirement.',
  'Alignment quality depends on documented expert judgment and should be reviewed when either the regulation or the referenced standard changes.');
renderTheoreticalDepth();

// ═══════════════════════════════════════════════════════════════════════
// CHAPTER 4 — NIS2 ARTICLE 21 REQUIREMENTS ANALYSIS
// ═══════════════════════════════════════════════════════════════════════
newPage();
chapterHeading(4, 'NIS2 Directive Article 21: Requirements Analysis');

sectionHeading('4.1  Article 21 Legal Text and Scope');
body('Article 21 of Directive (EU) 2022/2555 is titled "Cybersecurity risk-management measures." Article 21(1) requires essential and important entities to "take appropriate and proportionate technical, operational and organisational measures to manage the risks posed to the security of network and information systems which those entities use for the provision of their services or for the carrying out of their activities, and to prevent or minimise the impact of incidents on recipients of their services and on other services." This establishes the general risk-management obligation and introduces the proportionality principle — measures must be calibrated to the entity\'s size, risk exposure, and the likelihood and severity of incidents.');
body('Article 21(2) states that the measures shall include at least the ten categories labelled (a) through (j). The phrase "at least" establishes a floor rather than a ceiling. The ontology uses twelve classes because two compound legal points are decomposed for analytical purposes: point (g) becomes BasicCyberHygiene and TrainingAwareness, while point (j) becomes MultiFactorAuthentication and SecureCommunications. This decomposition must not be mistaken for two additional legal subparagraphs.');

sectionHeading('4.2  Article 21(2) Requirements');
body('The ten legal categories of Article 21(2) are as follows:');
numbered('a', 'Policies on risk analysis and information system security — requiring documented risk analysis processes and security policies governing information systems.');
numbered('b', 'Incident handling — covering detection, analysis, containment, response, and recovery processes for cybersecurity incidents.');
numbered('c', 'Business continuity management — including backup management, disaster recovery, and crisis management capabilities.');
numbered('d', 'Supply chain security — addressing security in relationships with direct suppliers and service providers, including vulnerability practices.');
numbered('e', 'Security in network and information systems acquisition, development and maintenance — covering secure development practices and vulnerability handling.');
numbered('f', 'Policies and procedures to assess the effectiveness of cybersecurity risk-management measures — requiring systematic assessment and monitoring.');
numbered('g', 'Basic cyber hygiene practices and cybersecurity training.');
numbered('h', 'Policies and procedures regarding the use of cryptography and, where appropriate, encryption.');
numbered('i', 'Human resources security, access-control policies, and asset management.');
numbered('j', 'Use of multi-factor or continuous authentication, secured voice, video and text communications, and secured emergency communication systems where appropriate.');
doc.moveDown(0.5);
body('The ontology maps the ten legal categories to twelve OWL classes: RiskAnalysisPolicy (a), IncidentHandling (b), BusinessContinuityManagement (c), SupplyChainSecurity (d), SecureDevelopment (e), EffectivenessAssessment (f), BasicCyberHygiene and TrainingAwareness (both components of g), Encryption (h), HumanResourcesSecurity (i), and MultiFactorAuthentication plus SecureCommunications (both components of j).');

sectionHeading('4.3  Essential vs. Important Entities');
body('NIS2 distinguishes two categories of covered entities. Essential entities are those operating in highly critical sectors (Annex I) including energy, transport, banking, financial market infrastructures, health, drinking water, wastewater, digital infrastructure, ICT service management, public administration, and space. Important entities cover additional critical sectors (Annex II) including postal services, waste management, manufacture of critical products, food production, and digital providers.');
body('Both categories must implement Article 21 measures, but essential entities are subject to proactive ex ante supervision, while important entities face ex post supervision triggered by evidence of non-compliance or incidents. The maximum fines also differ: up to €10 million or 2% of global turnover for essential entities, and up to €7 million or 1.4% for important entities. The ontology models this distinction through two subclasses of Entity: EssentialEntity and ImportantEntity.');

sectionHeading('4.4  Operational Classes Covering Measures (a)–(j)');
body('The ontology represents the ten Article 21(2)(a)–(j) legal categories through twelve operational classes because points (g) and (j) are each decomposed into two components. Table 4.1 maps each operational class to its legal reference, primary risk domain, and selected standards alignment.');
doc.moveDown(0.3);
tableSimple(
  ['Measure', 'Legal Ref.', 'Risk Domain', 'Standard Alignment'],
  [
    ['RiskAnalysisPolicy',        '21(2)(a)', 'Risk Governance',        'ISO 27001 A.5'],
    ['IncidentHandling',          '21(2)(b)', 'Incident Response',      'ENISA Guidelines'],
    ['BusinessContinuityManagement','21(2)(c)', 'Resilience',             'ISO 22301'],
    ['SupplyChainSecurity',       '21(2)(d)', 'Third-Party Risk',       'ISO 27002 A.5.19'],
    ['SecureDevelopment',         '21(2)(e)', 'Secure SDLC',            'NIST CSF PR.IP'],
    ['EffectivenessAssessment',   '21(2)(f)', 'Continuous Monitoring',  'CIS Controls'],
    ['BasicCyberHygiene',         '21(2)(g)', 'Hygiene Baseline',       'CIS Controls v8'],
    ['TrainingAwareness',         '21(2)(g)', 'Human Risk',             'ISO 27001 A.7'],
    ['Encryption',                '21(2)(h)', 'Data Protection',        'ISO 27001 A.8.24'],
    ['HumanResourcesSecurity',    '21(2)(i)', 'Access Control',         'ISO 27001 A.6'],
    ['MultiFactorAuthentication', '21(2)(j)', 'Authentication',         'NIST SP 800-63'],
    ['SecureCommunications',      '21(2)(j)', 'Communications Sec.',    'ISO 27001 A.8'],
  ]
);

sectionHeading('4.5  Compliance Criteria');
body('Article 21(1) establishes proportionality as a core compliance criterion: measures must be appropriate and proportionate, considering the entity\'s size, risk exposure, and the likelihood and severity of incidents. For the prototype’s modeled coverage test, every one of the twelve operational classes must be represented. An entity with eleven of the twelve classes therefore fails the ontology’s complete-coverage criterion; this procedural result should not be treated by itself as an authoritative legal determination. The coverage pattern is modeled through an equivalentClass axiom using owl:intersectionOf with twelve owl:someValuesFrom restrictions.');
body('The ontology additionally models three quality dimensions for each measure instance: isAppropriate (boolean), isProportionate (boolean), and isStateOfTheArt (boolean), reflecting the qualitative compliance criteria of Article 21(1). SHACL shapes validate these quality properties through sh:datatype and sh:minCount constraints.');

sectionHeading('4.6  Challenges in Manual Compliance Verification');
body('Manual compliance verification against Article 21 faces several structural challenges. First, the measures are described in abstract legal language that requires expert interpretation to translate into concrete technical controls — terms like "appropriate," "proportionate," and "state of the art" have no fixed technical meaning. Second, the twelve measures interact and overlap: for example, SupplyChainSecurity and SecureDevelopment both address software security, and MultiFactorAuthentication and HumanResourcesSecurity both address access control. Manual assessments often miss these interdependencies. Third, evidence collection for audits requires gathering documentation across multiple organizational units, systems, and processes — a time-consuming and inconsistent process. Fourth, as Article 21(3) implementing acts are issued by the Commission for specific sectors, compliance requirements will evolve, requiring systematic updates to assessment frameworks. An ontology-based approach addresses all four challenges through formal semantics, logical inference, structured querying, and extensible knowledge representation.');

academicAnalysisPage('4.7  Normative Interpretation Strategy',
  'The legal analysis identifies the regulated subject, required action, object of the action, and applicable qualifications. Article 21(1) establishes the general duty to adopt appropriate and proportionate measures, while Article 21(2) identifies the minimum domains those measures must cover.',
  'The ontology reflects this distinction by representing the twelve domains as measure classes and the qualitative criteria as properties of measure instances. This preserves the difference between category coverage and contextual adequacy.',
  'The resulting class catalogue is a documented conceptualization, not a verbatim transcription or an authoritative legal interpretation.');
academicAnalysisPage('4.8  Granularity of the Legal Measures',
  'The twelve categories differ significantly in internal complexity. Encryption is comparatively focused, whereas risk-analysis policy can include governance, responsibilities, review cycles, documentation, and risk-treatment decisions.',
  'The selected granularity treats each lettered provision as one top-level class. Relations to systems, risks, quality properties, and standards provide additional structure without presenting the model as a complete implementation guide.',
  'Evidence-level sub-controls are outside the present scope but can be introduced beneath the stable top-level taxonomy in later versions.');
academicAnalysisPage('4.9  Legal-to-Technical Traceability',
  'Formalization introduces modeling choices, so each class must remain traceable to the legal source. Stable URIs, labels, comments, and Article 21 references allow a reviewer to move from an inference result back to the relevant provision.',
  'Traceability also supports regulatory maintenance. When implementing acts, national transposition measures, or authoritative guidance alter interpretation, the affected concepts and constraints can be identified systematically.',
  'Annotations support provenance and explanation but do not replace a versioned legal mapping process with expert review.');
academicAnalysisPage('4.10  Proportionality and Compliance Evidence',
  'NIS2 does not prescribe an identical technical configuration for every entity. Proportionality depends on exposure, size, implementation cost, and the likelihood and severity of incidents. Binary category presence cannot capture this contextual judgment fully.',
  'The model keeps appropriateness, proportionality, and state-of-the-art status explicit and queryable. A production system would additionally connect these assertions to policies, test reports, asset records, risk assessments, and accountable reviewers.',
  'The prototype evaluates represented coverage of the twelve categories; it does not certify the sufficiency or authenticity of organizational evidence.');
renderMeasureAnalysis();

// ═══════════════════════════════════════════════════════════════════════
// CHAPTER 5 — METHODOLOGY
// ═══════════════════════════════════════════════════════════════════════
newPage();
chapterHeading(5, 'Methodology');

sectionHeading('5.1  Ontology Development Process (METHONTOLOGY)');
body('The ontology was developed following the METHONTOLOGY methodology (Fernández-López et al., 1997), which provides a structured, iterative process for knowledge engineering projects. METHONTOLOGY consists of six phases: (1) Specification — defining the purpose, scope, and competency questions; (2) Conceptualization — identifying classes, properties, and relationships; (3) Formalization — expressing the conceptual model in a formal language; (4) Implementation — encoding in OWL 2 Turtle and RDF/XML; (5) Evaluation — validating against competency questions, SHACL shapes, and reasoner output; and (6) Documentation — annotating the ontology with Dublin Core metadata and RDFS labels.');
body('The iterative nature of METHONTOLOGY was applied across three development cycles. The first cycle established the core class hierarchy and object properties. The second cycle added OWL 2 axioms (equivalentClass, propertyChain, disjointWith) and SKOS alignments. The third cycle added SHACL shapes, competency question validation, and the NetworkInformationSystem subclass with appliesToSystem property triples.');

sectionHeading('5.2  Requirements Gathering');
body('Requirements were gathered from three source groups. First, the legal text of Directive (EU) 2022/2555, specifically Articles 21(1) and 21(2), was analyzed to identify the modeled obligations. Second, ENISA NIS2 resources were reviewed for implementation context (European Union Agency for Cybersecurity, 2023). Third, ontology-engineering and compliance-modeling literature was reviewed to identify established design patterns. The requirements were formalized as functional requirements describing what the ontology must represent and non-functional requirements concerning performance, usability, and interoperability.');

sectionHeading('5.3  Competency Questions Definition');
body('Following Grüninger and Fox (1995), five competency questions (CQs) were defined to guide ontology design and serve as acceptance tests for evaluation:');
numbered(1, 'CQ1 — Which cybersecurity measures address critical or high-severity risks? (Tests addressesRisk triples and riskLevel properties)');
numbered(2, 'CQ2 — Which security standards does a compliant entity use? (Tests property chain inference: usesStandard is derived from implementsMeasure and basedOnStandard)');
numbered(3, 'CQ3 — Which measures prevent specific types of incidents? (Tests preventsIncident object property triples)');
numbered(4, 'CQ4 — Which measures apply to a specific network and information system? (Tests appliesToSystem triples for CoreBankingSystem)');
numbered(5, 'CQ5 — For each entity, what measures has it implemented? (Tests implementsMeasure property across entity instances)');
doc.moveDown(0.5);
body('Each CQ was translated into a SPARQL SELECT query and verified against the ontology. Correct answers for all five CQs were determined from the ontology content before query execution, enabling objective evaluation.');

sectionHeading('5.4  Class Hierarchy Design');
body('The class hierarchy was designed top-down from the regulatory analysis. The principal classes are Entity, RiskManagementMeasure, NetworkInformationSystem, CybersecurityRisk, SecurityIncident, and SecurityStandard. EssentialEntity and ImportantEntity are disjoint subclasses of Entity. TechnicalMeasure, OperationalMeasure, and OrganizationalMeasure are disjoint subclasses of RiskManagementMeasure, and the twelve operational classes are assigned beneath one of those categories. CompliantEntity is defined as an Entity satisfying the twelve class-specific implementation restrictions.');

sectionHeading('5.5  Property Definition');
body('Object properties capture the core relationships required for the prototype: implementsMeasure (Entity to RiskManagementMeasure), isImplementedBy as its inverse, addressesRisk, preventsIncident, minimizesImpact, basedOnStandard, appliesToSystem, transitive hasSubMeasure, and derived usesStandard. The five datatype properties are riskLevel, isAppropriate, isProportionate, isStateOfTheArt, and measureDescription.');

sectionHeading('5.6  Validation Rules Design');
body('Three layers of validation were designed. Layer 1 (OWL Reasoning): the equivalentClass axiom defines CompliantEntity through logical necessary and sufficient conditions, enabling automatic entity classification. Layer 2 (SHACL): three shapes provide structural validation. Article21ComplianceShape uses sh:qualifiedMinCount 1 on each of the 12 measure classes to verify an entity implements at least one instance of each. MeasureQualityShape verifies measure instances carry quality boolean properties. RiskLevelShape verifies a valid riskLevel string from the permitted enumeration {low, medium, high, critical}. Layer 3 (Competency Questions): five SPARQL queries provide semantic validation of ontology content against domain requirements.');

sectionHeading('5.7  System Architecture');
body('The system follows a three-tier architecture. The data tier comprises the Turtle and RDF/XML ontology serializations plus a SHACL shapes file. At runtime the server selects the RDF/XML file when present, otherwise the Turtle file, and caches the parsed quads in an N3 store. The application tier exposes ontology visualization data, structural validation, bounded reasoning, shape-specific validation, limited SPARQL SELECT execution, and real-time entity checking. The presentation tier is a single-page web application served from the public directory.');

sectionHeading('5.8  Technology Stack Selection');
body('Technology selection was guided by three criteria: standards compliance (W3C OWL 2, SPARQL 1.1, SHACL), lightweight deployment (no external database or reasoner dependency), and open-source availability. The selected stack is:');
tableSimple(['Component', 'Technology', 'Justification'], [
  ['Ontology Language', 'OWL 2 DL (Turtle + RDF/XML)', 'W3C standard, decidable reasoning'],
  ['RDF Parsing', 'N3.js v1.x', 'Pure JavaScript, Turtle/RDF/XML support'],
  ['SPARQL Engine', 'sparqljs + N3.Store', 'Lightweight, no external process'],
  ['HTTP Server', 'Node.js + Express', 'Lightweight REST API'],
  ['Graph Visualization', 'vis-network v9', 'Interactive network graphs'],
  ['SHACL Validation', 'Custom structural engine', 'Tailored to NIS2 shape set'],
  ['Frontend', 'HTML5/CSS3/JavaScript', 'No framework dependencies'],
]);

academicAnalysisPage('5.9  Iterative Research Workflow',
  'The development process was iterative rather than strictly sequential. Competency questions informed the conceptual model, implementation exposed ambiguous property definitions, and validation outcomes prompted revisions to instances and constraints.',
  'Reproducibility is supported by keeping the ontology serializations, SHACL shapes, application code, and report generator in one public GitHub project (Kader, 2026). A reviewer can inspect the formal artifact, execute the example assessments, and regenerate the documentation.',
  'Reproducibility of the software does not remove the need to document legal interpretation and environmental assumptions.');
academicAnalysisPage('5.10  Competency-Question Derivation',
  'The competency questions were selected to cover distinct information needs: risk coverage, standards alignment, incident prevention, system applicability, and entity-to-measure implementation. Together they exercise the principal classes and object properties.',
  'A question is considered satisfied when its concepts can be represented, a query can be expressed over the vocabulary, and the returned result can be verified against asserted or inferred facts.',
  'The five questions test the declared scope but are not an exhaustive benchmark for all compliance information needs.');
academicAnalysisPage('5.11  Multi-Layer Validation Design',
  'Validation operates at syntactic, structural, logical, and functional levels. Parsing confirms legal RDF syntax; structural checks confirm declarations and values; reasoning tests classification and property chains; functional tests confirm that the application exposes the expected outcomes.',
  'Positive, negative, and partial entities are necessary because a complete-coverage example alone could conceal an inability to detect gaps. The designed cases verify both successful classification and specific missing-measure reports.',
  'Synthetic cases improve control over expected outcomes but provide less external validity than field data from regulated organizations.');
academicAnalysisPage('5.12  Threats to Validity',
  'Construct validity is limited by representing compliance through asserted ontology data rather than direct operational evidence. Internal validity is constrained by the custom reasoner, and external validity is constrained by the use of illustrative entities.',
  'The study mitigates these threats through explicit scoping, predefined expected results, standards-based representations, and transparent separation between ontology semantics and application-level calculations.',
  'Independent legal review, practitioner studies, and larger real-world datasets are required before broader claims can be justified.');
renderMethodologicalExpansion();

// ═══════════════════════════════════════════════════════════════════════
// CHAPTER 6 — ONTOLOGY DESIGN AND IMPLEMENTATION
// ═══════════════════════════════════════════════════════════════════════
newPage();
chapterHeading(6, 'Ontology Design and Implementation');

sectionHeading('6.1  Ontology Structure and Namespace');
body('The ontology is identified by the persistent IRI https://w3id.org/nis2/article21, ensuring long-term accessibility through the w3id.org persistent URI service. The ontology declaration in Turtle format specifies the version IRI https://w3id.org/nis2/article21/v1.0, Dublin Core metadata (title, creator, description, date), an owl:versionInfo string, owl:priorVersion, and an owl:imports declaration for the SKOS Core vocabulary. The ontology uses the namespace prefix nis2: for all local terms.');
body('The ontology is maintained in Turtle for readable editing and RDF/XML for compatibility with OWL tools. The current server selects one serialization rather than comparing both graphs, so parity is a project maintenance requirement rather than an automated startup guarantee. Independent parsing should be used to confirm equivalence after ontology changes.');

sectionHeading('6.2  Core Classes');
subHeading('6.2.1  Entity Classes');
body('The Entity class represents organizations subject to the modeled obligations. EssentialEntity and ImportantEntity are disjoint subclasses. Two entity examples are present: ExampleCompliantEntity, typed as EssentialEntity and linked to all twelve operational measure instances, and ExampleNonCompliantEntity, typed as ImportantEntity and linked to five.');
body('CompliantEntity is equivalent to an intersection requiring Entity membership and at least one implementsMeasure value in each operational class. NonCompliantEntity is modeled as Entity intersected with the complement of CompliantEntity. Because OWL uses open-world semantics, the application’s procedural missing-category result should not be conflated with general OWL inference of negation.');

subHeading('6.2.2  Risk Management Measure Classes');
body('RiskManagementMeasure is the superclass for TechnicalMeasure, OperationalMeasure, and OrganizationalMeasure, which are declared mutually disjoint. The twelve operational classes are subclasses of those three categories; they are not themselves declared mutually disjoint as one twelve-member set. Each has a label, comment, articleReference, and an example individual with quality properties and selected risk, incident, standard, or system relations.');

body('Figure 6.1 shows the complete class hierarchy as displayed in the Protégé ontology editor, confirming the implementation of all classes including the twelve operational measure subclasses under TechnicalMeasure, OperationalMeasure, and OrganizationalMeasure.');
imageBlock('class.png', '6.1', 'Protégé class hierarchy panel showing the complete NIS2 Article 21 ontology structure', 'Source: Protégé ontology editor screenshot of nis2_article21_cybersecurity.owl.');

subHeading('6.2.3  Supporting Classes');
body('The NetworkInformationSystem class represents the IT/OT systems subject to NIS2 scope. Three instances are provided: CoreBankingSystem, WebApplicationPlatform, and InternalITInfrastructure, representing typical essential entity system categories. The CybersecurityRisk class with subclasses DataBreachRisk, RansomwareRisk, InsiderThreatRisk, and SupplyChainCompromiseRisk represents risk categories. The SecurityStandard class with instances ISO27001, ISO27002, NISTFramework, ENISAGuidelines, and CISControls represents the standards referenced in SKOS alignments and propertyChain inference.');

sectionHeading('6.3  Object Properties');
body('Eight object properties are defined, each with rdfs:domain, rdfs:range, rdfs:label, and rdfs:comment annotations. The most significant are:');
bullet('implementsMeasure (Entity → RiskManagementMeasure) — the primary compliance relationship used in the equivalentClass axiom.');
bullet('basedOnStandard (RiskManagementMeasure → SecurityStandard) — connecting measures to their standard alignment, used in the property chain.');
bullet('usesStandard (Entity → SecurityStandard) — derived property with owl:propertyChainAxiom [implementsMeasure, basedOnStandard].');
bullet('addressesRisk (RiskManagementMeasure → CybersecurityRisk) — connecting measures to risk categories for CQ1 answering.');
bullet('preventsIncident (RiskManagementMeasure → SecurityIncident) — connecting measures to incident individuals for CQ3 answering.');
bullet('appliesToSystem (RiskManagementMeasure → NetworkInformationSystem) — connecting measure instances to the systems they protect.');
body('The hasSubMeasure property is declared transitive. implementsMeasure and isImplementedBy are inverse properties. usesStandard is not asserted as transitive; it is derived through the two-step property chain from entity to measure to standard.');

sectionHeading('6.4  Data Properties');
body('Five datatype properties are defined. riskLevel applies to CybersecurityRisk and stores one of low, medium, high, or critical. isAppropriate, isProportionate, and isStateOfTheArt apply to RiskManagementMeasure and are functional booleans. measureDescription provides a textual account of a measure. The SHACL graph checks these values more explicitly than OWL alone.');
body('Figure 6.2 shows the data property hierarchy as implemented in Protégé, confirming all five properties: isAppropriate, isProportionate, isStateOfTheArt, measureDescription, and riskLevel.');
imageBlock('data properties.png', '6.2', 'Protégé data property hierarchy panel showing the five datatype properties', 'Source: Protégé ontology editor screenshot showing the Data properties tab.');

ensureSpace(200);
sectionHeading('6.5  OWL 2 Axioms');
subHeading('6.5.1  Equivalent-Class Definition');
body('The CompliantEntity equivalentClass axiom is the central formal contribution of the ontology. In description-logic notation, its structure is:');
formulaLines([
  'CompliantEntity ≡ Entity ⊓',
  '  ∃implementsMeasure.RiskAnalysisPolicy ⊓',
  '  ∃implementsMeasure.IncidentHandling ⊓',
  '  ∃implementsMeasure.BusinessContinuityManagement ⊓',
  '  ... ⊓ ∃implementsMeasure.SecureCommunications',
]);
leftBody('The omitted conjuncts cover SupplyChainSecurity, SecureDevelopment, EffectivenessAssessment, BasicCyberHygiene, TrainingAwareness, HumanResourcesSecurity, Encryption, and MultiFactorAuthentication. Together with the four classes shown in the expression, they form twelve existential restrictions covering the ten legal categories in Article 21(2).');
leftBody('Because owl:equivalentClass states both necessary and sufficient conditions, a complete OWL 2 DL reasoner can classify an Entity as CompliantEntity when at least one implementsMeasure value is known for every required class. Conversely, any individual asserted as CompliantEntity is constrained to satisfy the same class expression.');

subHeading('6.5.2  Open-World Interpretation');
body('The axiom supports positive classification, but absence of a measure assertion is not proof that the measure does not exist. Under the OWL open-world assumption, an incomplete entity normally remains unclassified rather than being inferred as non-compliant. The application therefore reports missing categories through a closed-world procedural comparison, while the ontology preserves standard OWL semantics.');
body('The definition establishes category coverage rather than operational effectiveness. The boolean quality properties, SHACL constraints, and organizational evidence must be evaluated separately; an existential restriction alone does not prove that a measure is effective, proportionate, current, or supported by auditable evidence.');

subHeading('6.5.3  Property-Chain Inference');
formulaBody('implementsMeasure o basedOnStandard ⊑ usesStandard');
body('This property-chain axiom means that when an entity implements a measure and that measure is based on a security standard, a reasoner may derive that the entity uses the standard. The derived relation avoids duplicate entity-to-standard assertions and provides a traceable inference path through the implemented measure. It indicates modeled use of a standard, not certification or full conformity with that standard.');
rdfOwlFigurePage();
owlSupplementaryFigurePage();

sectionHeading('6.6  SKOS Annotations and External Alignments');
body('Eight SKOS alignment triples are added to measure classes, providing semantic interoperability with external cybersecurity knowledge bases:');
tableSimple(['Measure Class', 'SKOS Property', 'External Resource'], [
  ['RiskAnalysisPolicy',        'skos:closeMatch', 'ISO 27001 A.5 (Risk Assessment)'],
  ['IncidentHandling',          'skos:closeMatch', 'ENISA Incident Handling Guidelines'],
  ['SupplyChainSecurity',       'skos:closeMatch', 'ISO 27002 A.5.19'],
  ['SecureDevelopment',         'skos:closeMatch', 'NIST CSF PR.IP-2'],
  ['BasicCyberHygiene',         'skos:closeMatch', 'CIS Controls v8 IG1'],
  ['Encryption',                'skos:exactMatch', 'ISO 27001 A.8.24'],
  ['MultiFactorAuthentication', 'skos:closeMatch', 'NIST SP 800-63B'],
  ['HumanResourcesSecurity',    'skos:closeMatch', 'ISO 27001 A.6'],
]);

sectionHeading('6.7  Competency Questions Validation');
body('Prior to system integration, the five competency queries were checked against the ontology graph. They exercise risk links, standard links, incident-prevention links, system scope, and entity-measure pairs. The two asserted entity examples provide the implementation pairs; additional boundary entities are generated through the real-time endpoint rather than stored in the ontology.');

sectionHeading('6.8  Ontology Validation');
body('Validation combines parsing, structural checks, selected reasoning behavior, SHACL-oriented checks, and competency queries. ExampleCompliantEntity covers all twelve operational classes; ExampleNonCompliantEntity lacks seven. Direct Turtle parsing yields 526 triples. These results establish internal consistency for the tested patterns but do not replace OWL profile validation, complete reasoning, or execution by a general SHACL processor.');
body('Figure 6.7 presents the ontology graph as rendered by the Protégé visualization panel, showing the relationships between classes, individuals, and standards across the full knowledge graph. The diagram confirms that all principal classes are connected through the defined object properties.');
imageBlock('dia.png', '6.7', 'Protégé ontology graph showing classes, individuals, and inter-class relationships', 'Source: Protégé OntoGraf visualization of nis2_article21_cybersecurity.owl.', 280);

academicAnalysisPage('6.9  Conceptual Model Rationale',
  'The model separates regulated entities, cybersecurity measures, information systems, risks, incidents, and standards. This prevents controls, obligations, and evidence from being treated as interchangeable concepts.',
  'Explicit relations permit the same measure to participate in compliance classification, risk analysis, system scoping, and standards mapping without duplicating the underlying fact.',
  'The model intentionally omits detailed evidence classes, which limits assurance-oriented use but keeps the core conceptualization manageable.');
academicAnalysisPage('6.10  Compliance-Class Definition',
  'CompliantEntity is defined as the intersection of Entity and twelve existential restrictions over implementsMeasure. The definition states that a compliant entity has at least one implemented measure in every operational class.',
  'This declarative pattern places the criterion in the ontology rather than repeating twelve procedural checks in each consuming application. Organization-specific measure individuals can be introduced while the category-level condition remains stable.',
  'Category membership alone cannot demonstrate control effectiveness or proportionality and must be interpreted with the validation limitations already identified.');
academicAnalysisPage('6.11  Property-Chain Inference',
  'The property chain states that an entity uses a standard when it implements a measure based on that standard. It eliminates repetitive entity-to-standard assertions and produces a visible inference path through the relevant measure.',
  'This pattern demonstrates semantic enrichment beyond triple retrieval: independently meaningful assertions combine to derive additional knowledge suitable for reporting and cross-framework analysis.',
  'The inference indicates a relationship to a standard, not certification against that standard or full implementation of all its controls.');
academicAnalysisPage('6.12  Disjointness and Consistency',
  'Disjointness axioms document intended conceptual boundaries between entity categories and among the twelve legal measure classes. They help expose unintended multiple typing and support disciplined ontology maintenance.',
  'The axioms operate at the chosen abstraction level. If a future evidence model represents one technical control as satisfying several legal categories, the control artifact should be distinguished from the category-specific measure realizations.',
  'Overly strong disjointness can create false inconsistencies, so these axioms require review as the ontology becomes more detailed.');
academicAnalysisPage('6.13  Namespace and Serialization Strategy',
  'Turtle is the primary authoring format because it is concise and reviewable, while RDF/XML supports compatibility with established OWL tools. Both serializations identify the same ontology and are intended to encode equivalent graphs.',
  'The persistent w3id.org namespace separates resource identity from the current repository location. Stable identifiers support citation, external linking, versioning, and long-term reuse.',
  'Maintaining two serializations creates a parity obligation and should eventually be automated through generation from one canonical source.');
renderFormalModelAnalysis();

// ═══════════════════════════════════════════════════════════════════════
// CHAPTER 7 — SYSTEM IMPLEMENTATION
// ═══════════════════════════════════════════════════════════════════════
newPage();
chapterHeading(7, 'System Implementation');

sectionHeading('7.1  System Architecture Overview');
body('The system follows a three-tier REST architecture. At startup, the Node.js/Express server selects the RDF/XML ontology when that file exists and otherwise falls back to Turtle. Parsed quads are cached together with an N3.Store and reloaded when the selected file modification time changes. The server exposes six functional endpoints, including graph-data delivery, and serves the static frontend from the public directory.');
body('The architecture deliberately avoids external dependencies such as Apache Jena, GraphDB, or Stardog, enabling deployment on any Node.js-capable environment without database installation or configuration. The entire system runs from a single directory with npm install and node server.js.');
body('The implementation is maintained at https://github.com/abdul-kader138/nis2-ontology-visualizer (Kader, 2026). For reproducible citation, a tagged release or immutable commit identifier should be recorded alongside the software environment used for evaluation.');

sectionHeading('7.2  Backend Implementation');
subHeading('7.2.1  RDF/OWL Parsing (N3.js)');
body('Turtle is parsed with N3.Parser, while RDF/XML is parsed through rdf-parse. The selected file is converted into an in-memory N3.Store for basic graph-pattern execution. The store-construction code skips unsupported term structures in a try/catch block, so the original parsed quad array remains the more complete representation for structural inspection.');

subHeading('7.2.2  API Endpoints');
body('Six application endpoints are implemented:');
bullet('GET /api/ontology — transforms ontology resources and selected relations into graph nodes and edges for visualization.');
bullet('GET /api/validate — analyzes the loaded ontology and returns class count, property count, instance count, axiom types present, and a structural validity assessment.');
bullet('GET /api/reason — applies bounded category-coverage logic to asserted entity-measure links and derives usesStandard relations.');
bullet('GET /api/shacl — performs JavaScript checks corresponding to the three local shape designs.');
bullet('GET /api/sparql — accepts a SELECT query through the query parameter, parses it with sparqljs, and evaluates supported basic graph patterns and filters.');
bullet('POST /api/check-entity — accepts {entityName, entityType, implementedMeasures[]} and returns a complete compliance assessment including score, missing measures, inferred standards, risks addressed, and OWL-inferred class.');

subHeading('7.2.3  Reasoning Engine');
body('The reasoning engine is a structural implementation of the selected compliance pattern. It maps each example measure individual to one required class, gathers asserted implementsMeasure links, compares the resulting set with REQUIRED_MEASURES, and reports complete or incomplete coverage. It also composes implementsMeasure with basedOnStandard and records the intermediate measure as provenance. The service does not execute arbitrary OWL axioms.');

subHeading('7.2.4  SHACL Validation Logic');
body('The SHACL-oriented endpoint implements three fixed checks in JavaScript. It evaluates operational-class coverage for Entity instances, true boolean quality values and descriptions for measure individuals, and controlled riskLevel values for CybersecurityRisk individuals. It returns shape names, focus nodes, severities, and messages, but it does not parse arbitrary SHACL graphs or implement the complete SHACL specification.');

subHeading('7.2.5  Property Chain Inference (usesStandard)');
body('The property chain usesStandard is implemented by composing implementsMeasure with basedOnStandard. For a given entity E with implementsMeasure triples to measure instances M₁...Mₙ, the engine queries the store for basedOnStandard triples on each Mᵢ. For each found triple Mᵢ basedOnStandard S, it adds an inferred usesStandard triple (E, usesStandard, S) to the reasoning result. The provenance is recorded as {standard: S, via: Mᵢ} in the inferredStandards array returned to the client. This implementation directly reflects the OWL 2 propertyChainAxiom semantics without requiring a full OWL reasoner.');

sectionHeading('7.3  Frontend Implementation');
subHeading('7.3.1  Interactive Knowledge Graph Visualization');
body('The knowledge graph visualization uses the vis-network library (v9) to render the OWL ontology as an interactive force-directed graph. Nodes represent OWL classes, instances, and literals, colored by type: classes in blue (#3498db), instances in green (#27ae60), literals in orange (#f39c12), and measure classes in purple (#8e44ad). Edges represent properties, labeled with the property local name. Users can drag nodes, zoom, and click to inspect node metadata. The graph is rendered from the /api/validate response, which includes all classes and instances with their properties.');

subHeading('7.3.2  User Interface Design');
body('The UI is a single-page application with a fixed toolbar containing seven action buttons: Load Ontology, Run Reasoner, SHACL Validation, SPARQL Query, Class Hierarchy, Check Real Entity, and Export. Each button opens a modal panel overlaying the graph visualization. The color scheme uses semantic colors: green for compliant/success states, red for non-compliant/error states, purple for SHACL, orange for the entity checker, and blue for general actions. The interface uses CSS Grid for responsive layout and custom CSS for the compliance result cards, validation badges, and standard tags.');

subHeading('7.3.3  Real-Time Validation');
body('The real-time entity compliance checking panel allows users to enter any entity name, select entity type (Essential/Important), and check or uncheck any of the twelve Article 21(2) measures. On submission, the frontend calls POST /api/check-entity and renders the result including: a green/red compliance badge, three metric cards (compliance score %, implemented count, OWL inferred class), a missing measures list with legal references, inferred security standards as colored tags, risk categories addressed, and the legal basis citation.');

sectionHeading('7.4  Integration and Testing');
body('Integration testing verified end-to-end behavior of all five API endpoints using curl and automated Node.js test scripts. Key test scenarios included: (1) full compliance check for an entity implementing all 12 measures — expected: 100%, CompliantEntity; (2) partial compliance check with 3 measures — expected: 25%, NonCompliantEntity, 9 missing measures; (3) SHACL validation against ExampleNonCompliantEntity — expected: Article21ComplianceShape FAIL with 7 violation messages; (4) SPARQL CQ2 for ExampleCompliantEntity — expected: 5 standards returned; (5) empty entity name submission — expected: validation error response. All test scenarios passed successfully.');

academicAnalysisPage('7.5  Architectural Separation of Concerns',
  'The implementation separates ontology data, validation shapes, backend services, and presentation logic. This permits the formal artifact to be inspected independently and prevents interface behavior from becoming the sole source of compliance logic.',
  'The backend adapts RDF representations into structured JSON while retaining legal references, class names, missing measures, and inference paths. Each endpoint corresponds to a distinct analytical responsibility.',
  'Some reasoning remains procedural, so full semantic independence from application code has not yet been achieved.');
academicAnalysisPage('7.6  Reasoning-Service Implementation',
  'The reasoning service retrieves implemented measures, compares their types with the twelve required categories, and reports classification, score, gaps, standards, and risks.',
  'The implementation is deterministic and transparent for the patterns used in this thesis. It operationalizes the ontology without requiring an external semantic platform.',
  'The service is not a general OWL 2 DL reasoner, and unsupported constructs must not be assumed to have been evaluated.');
academicAnalysisPage('7.7  Validation and Error Semantics',
  'Input validation protects interpretation of results. Entity requests are normalized against recognized identifiers, malformed queries return explicit errors, and ontology-loading failures prevent dependent operations from reporting misleading success.',
  'Observable failure behavior matters because an empty or partial response could otherwise be mistaken for the absence of an obligation or risk.',
  'Production use would additionally require authentication, authorization, audit logging, rate limits, and stronger request schemas.');
academicAnalysisPage('7.8  User-Interface Design Rationale',
  'The interface provides graph exploration, metrics, query tables, validation reports, and a task-oriented entity checker. These views support users with different levels of Semantic Web expertise.',
  'Readable labels appear alongside formal identifiers and legal references. Missing measures are listed explicitly rather than hidden behind a percentage score, preserving explainability.',
  'Functional demonstration does not replace a controlled usability study with compliance practitioners.');
renderEndpointAnalysis();

// ═══════════════════════════════════════════════════════════════════════
// CHAPTER 8 — SYSTEM DEMONSTRATION
// ═══════════════════════════════════════════════════════════════════════
newPage();
chapterHeading(8, 'System Demonstration and Use Cases');

sectionHeading('8.1  Interactive Graph Visualization');
body('Upon loading the application at http://localhost:3000, the user is presented with an interactive graph derived from /api/ontology. It includes Entity and its regulatory subclasses, the RiskManagementMeasure hierarchy and twelve operational classes, supporting risk, incident, system, and standard resources, and selected local object-property edges. The visualization is an explanatory projection of the RDF graph rather than a complete rendering of blank-node OWL expressions.');
body('The visualization provides immediate intuitive insight into the ontology structure that would otherwise require reading through hundreds of lines of Turtle syntax. For a professor presentation, the graph effectively communicates the complete NIS2 Article 21 compliance domain model in a single view.');
figurePage('8.1', 'Ontology Explorer and Representative Relations', drawOntologyFigure,
  'Source: generated from the ontology vocabulary and relations used by GET /api/ontology.');

sectionHeading('8.2  OWL Validation and Reasoning');
body('Clicking "Load Ontology" triggers /api/validate, which reports parse status, selected axiom checks, the presence of all twelve operational classes, hierarchy-cycle results, and structural counts. Independent Turtle parsing gives 526 triples, 28 OWL classes, 9 object properties, 5 datatype properties, and 31 named individuals. The endpoint is a structural validator and should not be described as proof of full OWL 2 DL conformance.');
body('Clicking "Run Reasoner" triggers /api/reason. ExampleCompliantEntity covers all twelve operational classes, while ExampleNonCompliantEntity covers five and is reported with seven gaps. The panel also shows deduplicated standards derived through the implementsMeasure/basedOnStandard path. Only these two entity examples are asserted in the ontology.');
figurePage('8.2', 'Structural Ontology Validation Report', drawValidationFigure,
  'Source: verified output from GET /api/validate on the 526-triple RDF/XML serialization.');
figurePage('8.3', 'Entity Classification and Derived Standards', drawReasoningFigure,
  'Source: verified output from GET /api/reason; the panel represents bounded structural reasoning.');

sectionHeading('8.3  SHACL Shapes Validation');
body('The /api/shacl endpoint applies fixed coverage, measure-quality, and risk-level checks. The complete example passes; the incomplete example reports seven category gaps.');
figurePage('8.4', 'SHACL-Oriented Validation Results', drawShaclFigure,
  'Source: verified output from GET /api/shacl; full SHACL conformance requires an independent processor.');

sectionHeading('8.4  SPARQL Query Interface');
body('The SPARQL panel provides five pre-loaded competency question queries accessible via CQ1–CQ5 buttons, plus a free-text editor for custom queries. CQ1 returns measures addressing critical or high risks: RiskAnalysisPolicy, IncidentHandling, SupplyChainSecurity, and Encryption. CQ2 returns the five standards used by ExampleCompliantEntity through property chain inference. CQ3 returns measures that preventsIncident for DataBreachIncident and RansomwareIncident. CQ4 returns measures that appliesToSystem CoreBankingSystem. CQ5 returns all entity-measure implementation pairs as a table. Results are rendered in a formatted table with alternating row colors and column headers.');
figureBlock('8.6', 'SPARQL Competency Query and Results', drawSparqlFigure,
  'Source: CQ2 graph pattern and the five standard resources associated with ExampleCompliantEntity.');

sectionHeading('8.5  Real-Time Entity Compliance Checking');
body('The "Check Real Entity" panel demonstrates the ontology\'s applicability beyond the pre-loaded example instances. A user enters an entity name (e.g., "MyBank"), selects type "Essential Entity", and checks the twelve measure checkboxes corresponding to their implemented controls. The panel pre-checks all twelve measures to illustrate the fully-compliant case. On submission, the compliance result renders:');
bullet('Green badge: "✓ COMPLIANT — MyBank (EssentialEntity)"');
bullet('Score cards: 100% compliance score, 12/12 measures, "CompliantEntity" OWL inferred class');
bullet('Inferred standards: ISO27001, ISO27002, NISTFramework, ENISAGuidelines, CISControls (purple tags)');
bullet('Risks addressed: DataBreachRisk, InsiderThreatRisk, RansomwareRisk, SupplyChainCompromiseRisk (blue tags)');
bullet('Legal basis: "Directive (EU) 2022/2555, Article 21(2)"');
doc.moveDown(0.5);
body('When six measures are unchecked (simulating a partial compliance scenario), the result shows a red "✗ NON-COMPLIANT" badge, a 50% score, and lists the six missing measures with their Article 21(2) legal references. This use case demonstrates that the ontology functions as a general-purpose compliance engine for any organization subject to NIS2, not merely for the pre-defined example entities.');
figurePage('8.5', 'Real-Time Entity Compliance Assessment', drawEntityCheckerFigure,
  'Source: generated from the request and response structure of POST /api/check-entity for a complete EssentialEntity example.');

academicAnalysisPage('8.6  End-to-End Assessment Scenario',
  'An assessment begins with an entity type and asserted measure implementations. The backend normalizes the submission, evaluates category coverage, derives related standards and risks, and returns a structured result.',
  'The workflow demonstrates how the components interact: the ontology supplies vocabulary and relations, SHACL supplies constraints, the service executes bounded reasoning, and the interface makes the outcome reviewable.',
  'The scenario uses self-declared input and does not establish authenticity or sufficiency of implementation evidence.');
academicAnalysisPage('8.7  Interpretation of Demonstration Results',
  'A complete result means that the submitted graph contains at least one implementation for every modeled category and satisfies the prototype’s structural checks. It does not establish effectiveness, proportionality, or regulatory approval.',
  'A missing category identifies a gap in represented information. Remediation may involve implementing a control, documenting an existing control, correcting a mapping, or gathering evidence.',
  'Human review remains necessary, so the demonstrator should be read as decision support rather than automated legal certification.');
renderUseCaseExpansion();

// ═══════════════════════════════════════════════════════════════════════
// CHAPTER 9 — EVALUATION AND RESULTS
// ═══════════════════════════════════════════════════════════════════════
newPage();
chapterHeading(9, 'Evaluation and Results');

sectionHeading('9.1  Ontology Completeness');
body('Ontology completeness was assessed against the ten legal categories and their decomposition into twelve operational classes. Every operational class has a label, comment, articleReference, and example individual. Eight classes currently carry direct SKOS mappings: RiskAnalysisPolicy, IncidentHandling, BusinessContinuityManagement, SupplyChainSecurity, SecureDevelopment, BasicCyberHygiene, Encryption, and MultiFactorAuthentication, with RiskAnalysisPolicy using exactMatch and the others closeMatch. Direct Turtle parsing yields 526 triples, 28 classes, 9 object properties, 5 datatype properties, and 31 named individuals.');

sectionHeading('9.2  Validation Accuracy');
body('Shape-oriented validation was evaluated against the two asserted entity examples:');
tableSimple(['Entity', 'Expected SHACL Result', 'Actual Result', 'Pass?'], [
  ['ExampleCompliantEntity',    'All shapes PASS',          'All shapes PASS',          'Yes'],
  ['ExampleNonCompliantEntity', 'Article21Shape FAIL (7)',  'Article21Shape FAIL (7)',  'Yes'],
]);
body('The structural reasoner reports ExampleCompliantEntity as complete and ExampleNonCompliantEntity as incomplete. It derives five unique standards for the complete entity because several measures share the same standard. This confirms the intended application behavior, while full OWL entailment remains a separate validation task for a standards-complete reasoner.');

sectionHeading('9.3  Performance Evaluation Scope');
body('The current repository does not contain a dedicated benchmark harness or retained timing dataset. It is therefore not methodologically defensible to report precise average response times as established results. The in-memory architecture is expected to be responsive for a 526-triple graph, but performance claims require a repeatable protocol.');
body('A future benchmark should separate initial RDF parsing from cached requests, record hardware and runtime versions, execute warm-up iterations, collect a sufficiently large sample, report median and percentile latency, and test concurrent clients. Memory consumption and behavior under larger synthetic graphs should also be measured. Until those tests are performed, performance is treated as an implementation characteristic to be evaluated rather than a confirmed thesis result.');

sectionHeading('9.4  Case Studies');
body('Two asserted entity cases and one user-supplied scenario were examined:');
subHeading('Case Study 1: ExampleCompliantEntity (Essential Entity)');
body('ExampleCompliantEntity implements instances of all twelve operational classes covering Article 21(2)(a)–(j). The bounded reasoning output reports CompliantEntity, a 100% modeled coverage score, and five inferred standards (ISO27001 via RiskAnalysisPolicy, ENISAGuidelines via IncidentHandling, ISO27002 via SupplyChainSecurity, NISTFramework via SecureDevelopment, and CISControls via BasicCyberHygiene). The entity coverage check passes, while the measure-quality and risk-level checks report no issues for the associated example data. This case demonstrates the positive path of the prototype without constituting an authoritative legal compliance determination.');
subHeading('Case Study 2: ExampleNonCompliantEntity (Important Entity)');
body('ExampleNonCompliantEntity implements five measures: RiskAnalysisPolicy, IncidentHandling, BasicCyberHygiene, TrainingAwareness, and Encryption. Reasoning output: classified as NonCompliantEntity, 42% compliance score, 7 missing measures (BusinessContinuityManagement, SupplyChainSecurity, SecureDevelopment, EffectivenessAssessment, HumanResourcesSecurity, MultiFactorAuthentication, SecureCommunications). SHACL Article21ComplianceShape reports 7 violations. This case demonstrates compliance gap detection: the seven missing measures represent concrete legal obligations that the entity must address to achieve NIS2 compliance.');
subHeading('Case Study 3: Real-Time Entity Check (MyBank)');
body('A real-time check was performed for "MyBank" as an EssentialEntity implementing all 12 measures. The /api/check-entity endpoint returned: compliant=true, complianceScore=100, inferredClass=CompliantEntity, 5 inferred standards, 4 risk categories addressed. The check was performed entirely in-memory without modifying the ontology, demonstrating the framework\'s applicability as a general-purpose compliance tool for any NIS2-covered organization.');

sectionHeading('9.5  Comparison with Existing Approaches');
body('The implemented framework is compared against three categories of existing approaches:');
tableSimple(['Approach', 'Formal Semantics', 'Auto Reasoning', 'SPARQL', 'SHACL', 'Open Source'], [
  ['This thesis (OWL+SHACL)',       'Yes (OWL 2 DL)', 'Yes',  'Yes', 'Yes', 'Yes'],
  ['Commercial GRC tools',           'No',             'No',   'No',  'No',  'No'],
  ['ENISA checklist',                'No',             'No',   'No',  'No',  'Yes'],
  ['Hassan 2025 (Legal Ontology)',   'Yes (OWL 2 DL)', 'Yes',  'Yes', 'No',  'Yes'],
  ['Manual audit',                   'No',             'No',   'No',  'No',  'N/A'],
]);
body('The comparison shows that the prototype combines several capabilities in one demonstrator. It should not be read as evidence that it is more complete than every commercial or academic alternative, because the compared categories differ in scope, evidence management, workflow, assurance, and production maturity.');

academicAnalysisPage('9.6  Competency-Question Evaluation',
  'All five competency questions can be expressed using the ontology vocabulary and executed through the query interface. Returned bindings correspond to manually inspected triples and expected inference paths.',
  'This confirms functional adequacy for the declared information needs and demonstrates that the conceptual model supports risk, standard, incident, system, and implementation analysis.',
  'The selected questions use a bounded query subset and do not establish complete SPARQL 1.1 conformance.');
academicAnalysisPage('9.7  Error Analysis and Negative Cases',
  'The incomplete asserted entity produces seven expected missing-class results rather than a generic failure. Additional partial cases can be generated through /api/check-entity.',
  'Specific reporting supports diagnosis and remediation. The observed SHACL-oriented violations correspond to the absent operational classes in the tested graph.',
  'The small synthetic dataset cannot estimate behavior under noisy data, inconsistent typing, duplicate controls, or disputed mappings.');
academicAnalysisPage('9.8  Performance and Scalability',
  'The 526-triple graph is small enough for an in-memory prototype, but the repository does not yet contain a repeatable benchmark dataset.',
  'Enterprise deployment would require persistent indexed storage, concurrency testing, query optimization, caching policies, and potentially asynchronous reasoning.',
  'The reported timings should not be extrapolated to large knowledge graphs or production workloads.');
renderEvaluationDesign();

// ═══════════════════════════════════════════════════════════════════════
// CHAPTER 10 — DISCUSSION
// ═══════════════════════════════════════════════════════════════════════
newPage();
chapterHeading(10, 'Discussion');

sectionHeading('10.1  Contributions to the Field');
body('This thesis makes five contributions to semantic technology, regulatory compliance modeling, and cybersecurity governance. First, it provides a dedicated OWL 2 DL ontology for NIS2 Article 21 compliance, addressing the domain-specific gap identified in the reviewed literature. Second, the usesStandard property chain applies OWL 2 role-chain reasoning to derive standard associations from measure implementations without manual entity-to-standard assertions. Third, the framework combines ontology modeling, SHACL-oriented validation, SPARQL querying, and SKOS alignment through one demonstrator. Fourth, real-time entity checking extends the ontology from a knowledge-representation artifact to an executable assessment workflow. Fifth, the SKOS alignments connect selected NIS2 measures with established cybersecurity resources while avoiding claims of legal equivalence.');

sectionHeading('10.2  Limitations');
body('Several limitations should be acknowledged. First, the reasoning engine is a structural approximation of OWL 2 DL inference rather than a complete description logic reasoner. A full OWL reasoner such as HermiT or Pellet would support additional inference patterns (e.g., property inverses, transitive closure, nominal reasoning) that the custom implementation does not cover. Second, the custom SPARQL engine does not support the full SPARQL 1.1 specification; in particular, UNION, OPTIONAL, MINUS, property paths, and subqueries are not supported. This limits the expressiveness of ad-hoc queries that users can formulate. Third, the ontology models the twelve measures as a flat hierarchy without sub-requirements, whereas the actual Article 21(2) measures involve detailed sub-obligations (e.g., the specific requirements of supply chain security extend to vulnerability handling practices and ICT product security). Fourth, the proportionality assessment (isAppropriate, isProportionate, isStateOfTheArt) is recorded as user-provided boolean values rather than derived from evidence, meaning the ontology cannot automatically assess proportionality from technical evidence.');

sectionHeading('10.3  Future Work');
body('Several directions for future work emerge from this thesis. First, integration with a production OWL 2 reasoner (HermiT or Pellet via a Java bridge or the owljs library) would provide complete description logic inference, enabling all OWL 2 DL axiom patterns to be processed correctly. Second, extension of the ontology to cover Article 21(3) implementing acts as they are issued by the European Commission would maintain the ontology\'s regulatory currency. Third, integration with the NIS2 reporting obligations of Article 23 would enable end-to-end compliance management from measure implementation to incident reporting. Fourth, the development of a SPARQL endpoint conformant with the SPARQL 1.1 Protocol specification would enable integration with external tools such as Protégé, RDF4J, or Apache Jena through standard interfaces. Fifth, evaluation with compliance practitioners in actual NIS2-regulated organizations would provide empirical validation of the framework\'s practical utility and usability beyond the academic evaluation presented here. Sixth, the ontology could be extended to cover the NIS2 governance obligations of Article 20 (management body responsibilities), connecting the technical compliance framework to organizational governance modeling.');

academicAnalysisPage('10.4  Implications for Compliance Practice',
  'The framework shows how obligations, implemented measures, systems, risks, and standards can be represented in a shared knowledge graph. This can support gap analysis, audit preparation, cross-framework mapping, and regulatory change assessment.',
  'Practical adoption also requires ownership of assertions, evidence-review procedures, version control for mappings, access control, and escalation when automated output conflicts with expert judgment.',
  'Ontology-based assessment is credible only within a governed compliance process with accountable human oversight.');
academicAnalysisPage('10.5  Generalizability of the Approach',
  'The OWL-SHACL-SPARQL architecture may be reused for regulations containing identifiable subjects, obligations, controls, and evidence. The reusable contribution is the method rather than the specific Article 21 taxonomy.',
  'Application to DORA, the Cyber Resilience Act, or GDPR would require new legal analysis, competency questions, and validation scenarios. Reusing the current classes unchanged would create superficial alignment.',
  'Generalizability remains a reasoned proposition until the method is evaluated in additional regulatory domains.');
renderDiscussionExpansion();

// ═══════════════════════════════════════════════════════════════════════
// CHAPTER 11 — CONCLUSION
// ═══════════════════════════════════════════════════════════════════════
newPage();
chapterHeading(11, 'Conclusion');

sectionHeading('11.1  Summary of Contributions');
body('This thesis has presented the design, implementation, and evaluation of an OWL ontology for NIS2 Article 21 compliance analysis. The ontology models the ten legal categories through twelve operational classes, using separate classes for the training component of point (g) and for the authentication and communications components of point (j). An equivalent-class axiom represents complete operational coverage, while a property chain derives entity-to-standard relations.');
body('The ontology is embedded in a Node.js/Express demonstrator with graph visualization, structural validation, bounded reasoning, shape-specific checks, limited SPARQL SELECT querying, and real-time entity assessment. Evaluation covered source parsing, structural inventory, two asserted entity cases, competency questions, and an extended test design. Precise performance claims and full standards conformance remain future validation tasks.');

sectionHeading('11.2  Achievement of Research Objectives');
body('The six objectives from Chapter 1 were addressed at prototype level. RO1 produced an OWL model with twelve operational classes covering the ten legal categories. RO2 implemented bounded category classification and property-chain-equivalent standard derivation. RO3 defined three SHACL shapes and corresponding JavaScript checks. RO4 provided five competency queries over the supported SPARQL subset. RO5 delivered an interactive visualization and entity-checking interface. RO6 added eight SKOS mappings to external cybersecurity resources. Full OWL reasoning, general SHACL execution, complete SPARQL 1.1 support, evidence validation, and practitioner evaluation remain outside the achieved scope.');

sectionHeading('11.3  Future Research Directions');
body('The work presented in this thesis establishes a foundation for several promising research directions. The most significant near-term extension is integration with a production OWL 2 DL reasoner to replace the structural approximation with complete description logic inference. Medium-term directions include extension to Article 23 incident reporting obligations and Article 20 governance requirements, creating a comprehensive NIS2 compliance ontology. Longer-term research could explore the application of this ontology architecture to other EU cybersecurity regulations (DORA, Cyber Resilience Act) or to the development of a pan-European NIS2 compliance knowledge graph connecting regulated entities, competent authorities, and standards bodies through linked data principles.');
body('This research demonstrates the technical feasibility of using formal ontology engineering, grounded in OWL 2 and complementary Semantic Web standards, to support selected regulatory compliance-verification tasks. Ontology-based tools of the kind presented here may reduce parts of the manual compliance-management burden and improve consistency, but practical effectiveness requires independent reasoning and SHACL validation, organizational evidence, legal review, security hardening, and evaluation with practitioners.');

academicAnalysisPage('11.4  Final Synthesis of the Research Contribution',
  'The thesis began with a gap between legal cybersecurity obligations and the machine-processable structures needed for repeatable assessment. It addressed that gap through a bounded formalization of Article 21(2), an explicit compliance-class definition, SHACL constraints, competency queries, and a demonstrable application.',
  'The results support the conclusion that Semantic Web technologies can organize and automate important parts of compliance analysis while retaining traceability to legal categories. The combination of representation, inference, validation, querying, and visualization is more significant than any single component in isolation.',
  'The contribution remains a research prototype. Its responsible use requires recognition of incomplete evidence modeling, limited reasoning coverage, synthetic evaluation data, and the continuing role of legal and cybersecurity expertise.');
renderResearchQuestionAnswers();

// ═══════════════════════════════════════════════════════════════════════
// CHAPTER 12 — EXTENDED ANALYSIS AND DISCUSSION
// ═══════════════════════════════════════════════════════════════════════
if (false) {
newPage();
chapterHeading(12, 'Extended Analysis and Discussion');
doc.font('Helvetica-Bold').fontSize(14).text('12.1  Ontology File Location and Structure');
doc.moveDown(1);
body('The full OWL 2 DL ontology is provided in two serialization formats:');
bullet('Primary format: nis2_article21_cybersecurity.ttl (Turtle, ~690 lines, 526 triples)');
bullet('Secondary format: nis2_article21_cybersecurity.owl (RDF/XML, ~780 lines)');
body('Both files are located in the project root directory and must be kept in parity (identical triple content). The server loads both files at startup and verifies the triple count. The ontology namespace is https://w3id.org/nis2/article21# with prefix nis2:. The ontology IRI is https://w3id.org/nis2/article21.');
doc.moveDown(0.5);
body('Key sections of the Turtle file:');
bullet('Lines 1–30: Prefix declarations and ontology metadata (Dublin Core, owl:versionIRI, owl:imports SKOS)');
bullet('Lines 31–120: Core class declarations (NISEntity, CybersecurityMeasure hierarchy, NetworkInformationSystem, CybersecurityRisk, SecurityStandard)');
bullet('Lines 121–180: OWL 2 axioms (equivalentClass, complementOf, disjointWith, AllDisjointClasses)');
bullet('Lines 181–280: Object property declarations with domain, range, chain axiom');
bullet('Lines 281–360: Data property declarations');
bullet('Lines 361–530: Instance assertions (measure instances with quality properties and appliesToSystem triples)');
bullet('Lines 531–620: Entity instances with implementsMeasure triples');
bullet('Lines 621–689: NetworkInformationSystem, risk, and standard instances');

newPage();
doc.font('Helvetica-Bold').fontSize(14).text('12.2  SHACL Shapes Summary');
doc.moveDown(1);
body('The SHACL shapes file nis2_article21_compliance.shacl.ttl (226 lines) defines three shapes:');
subHeading('Shape 1: Article21ComplianceShape');
body('Target class: nis2:NISEntity. Defines twelve sh:property constraints, one per Article 21(2) measure class, each with sh:path nis2:implementsMeasure, sh:class <MeasureClass>, sh:qualifiedMinCount 1, sh:qualifiedValueShapesDisjoint true, and sh:message citing the specific Article 21(2) legal reference.');
subHeading('Shape 2: MeasureQualityShape');
body('Target class: nis2:CybersecurityMeasure. Three property constraints: nis2:isAppropriate (sh:datatype xsd:boolean, sh:minCount 1), nis2:isProportionate (sh:datatype xsd:boolean, sh:minCount 1), nis2:isStateOfTheArt (sh:datatype xsd:boolean, sh:minCount 1).');
subHeading('Shape 3: RiskLevelShape');
body('Target class: nis2:NISEntity. One property constraint: nis2:riskLevel (sh:datatype xsd:string, sh:minCount 1, sh:in list ["low", "medium", "high", "critical"]).');

newPage();
doc.font('Helvetica-Bold').fontSize(14).text('12.3  API Endpoint Reference');
doc.moveDown(1);
tableSimple(['Endpoint', 'Method', 'Description', 'Response'], [
  ['/api/validate',      'GET',  'Ontology structure analysis',       'JSON: classes, properties, instances, axioms'],
  ['/api/reason',        'GET',  'OWL compliance reasoning',          'JSON: entity classifications, inferred standards'],
  ['/api/shacl',         'POST', 'SHACL constraint validation',       'JSON: shape results, violations'],
  ['/api/sparql',        'POST', 'SPARQL SELECT query execution',     'JSON: SPARQL results bindings'],
  ['/api/check-entity',  'POST', 'Real-time entity compliance check', 'JSON: compliance score, missing measures, standards'],
]);
doc.moveDown(0.5);
body('All endpoints return HTTP 200 with JSON body on success, HTTP 400 with {error: string} on invalid input, and HTTP 500 on server error. The server runs on port 3000 and is started with: node server.js');

newPage();
doc.font('Helvetica-Bold').fontSize(14).text('12.4  Competency Question SPARQL Queries');
doc.moveDown(1);

const queries = [
  { label: 'CQ1: Measures addressing critical/high risks', q: `PREFIX nis2: <https://w3id.org/nis2/article21#>
SELECT ?measure ?risk WHERE {
  ?measure nis2:addressesRisk ?risk .
  ?entity nis2:implementsMeasure ?measure .
  ?entity nis2:riskLevel ?level .
  FILTER(?level = "critical" || ?level = "high")
}` },
  { label: 'CQ2: Standards used by compliant entity (via property chain)', q: `PREFIX nis2: <https://w3id.org/nis2/article21#>
SELECT ?entity ?standard WHERE {
  ?entity a nis2:CompliantEntity .
  ?entity nis2:implementsMeasure ?measure .
  ?measure nis2:basedOnStandard ?standard .
}` },
  { label: 'CQ3: Incident prevention measures', q: `PREFIX nis2: <https://w3id.org/nis2/article21#>
SELECT ?measure ?incident WHERE {
  ?measure nis2:preventsIncident ?incident .
}` },
  { label: 'CQ4: Measures applying to CoreBankingSystem', q: `PREFIX nis2: <https://w3id.org/nis2/article21#>
SELECT ?measure WHERE {
  ?measure nis2:appliesToSystem nis2:CoreBankingSystem .
}` },
  { label: 'CQ5: All entity-measure implementation pairs', q: `PREFIX nis2: <https://w3id.org/nis2/article21#>
SELECT ?entity ?measure WHERE {
  ?entity a nis2:NISEntity .
  ?entity nis2:implementsMeasure ?measure .
} ORDER BY ?entity` },
];

queries.forEach((cq, i) => {
  subHeading(cq.label);
  codeBlock(cq.q);
  doc.moveDown(0.3);
});

newPage();
doc.font('Helvetica-Bold').fontSize(14).text('12.5  Measure Catalogue and Legal Mapping');
doc.moveDown(1);
body('This section provides a compact catalogue of the twelve Article 21(2) measures, their semantic role in the ontology, and the main compliance function each one supports. It is intended as a human-readable bridge between the legal article and the formal ontology classes.');
tableSimple(['Measure', 'Legal Ref.', 'Ontological Role', 'Main Function'], [
  ['RiskAnalysisPolicy', '21(2)(a)', 'Organizational measure', 'Documented risk governance and security policy'],
  ['IncidentHandling', '21(2)(b)', 'Operational measure', 'Detection, containment, response, and recovery'],
  ['BusinessContinuityManagement', '21(2)(c)', 'Operational measure', 'Backup, restoration, and resilience planning'],
  ['SupplyChainSecurity', '21(2)(d)', 'Organizational measure', 'Third-party and supplier security oversight'],
  ['SecureDevelopment', '21(2)(e)', 'Technical measure', 'Secure SDLC and vulnerability handling'],
  ['EffectivenessAssessment', '21(2)(f)', 'Organizational measure', 'Monitoring and evaluation of control effectiveness'],
  ['BasicCyberHygiene', '21(2)(g)', 'Operational measure', 'Baseline security hygiene and training'],
  ['TrainingAwareness', '21(2)(h)', 'Organizational measure', 'Awareness and skills development for staff'],
  ['HumanResourcesSecurity', '21(2)(i)', 'Organizational measure', 'Personnel security, access, and asset governance'],
  ['Encryption', '21(2)(j)', 'Technical measure', 'Cryptographic protection of data and systems'],
  ['MultiFactorAuthentication', '21(2)(k)', 'Technical measure', 'Authentication hardening and identity assurance'],
  ['SecureCommunications', '21(2)(l)', 'Technical measure', 'Protected voice, video, text, and emergency communication'],
]);
body('The ontology treats these as mutually distinct subclasses of the abstract CybersecurityMeasure superclass. This flat design mirrors the legal text, which enumerates the measures as a minimum set rather than a nested taxonomy.');

newPage();
doc.font('Helvetica-Bold').fontSize(14).text('12.6  Ontology Axiom Catalogue');
doc.moveDown(1);
body('This section lists the principal axioms used in the ontology and explains their purpose in the compliance model.');
tableSimple(['Axiom', 'Purpose', 'Effect'], [
  ['rdfs:subClassOf', 'Build class hierarchy', 'Defines entity and measure taxonomy'],
  ['owl:disjointWith', 'Separate incompatible classes', 'Prevents EssentialEntity/ImportantEntity overlap'],
  ['owl:AllDisjointClasses', 'Mutual exclusion of measures', 'Keeps measure classes semantically distinct'],
  ['owl:equivalentClass', 'Define compliance equivalence', 'Enables automated classification as CompliantEntity'],
  ['owl:inverseOf', 'Bidirectional relations', 'Supports forward and reverse querying'],
  ['owl:propertyChainAxiom', 'Derived property inference', 'Infers usesStandard from implemented measures'],
  ['owl:TransitiveProperty', 'Multi-step closure', 'Supports chained structural traversal'],
  ['owl:FunctionalProperty', 'Single-value constraints', 'Restricts boolean properties to one asserted value'],
]);
body('The ontology relies on a compact set of axioms rather than large amounts of bespoke rule code. This keeps the model understandable and compatible with OWL 2 DL reasoning tools.');
codeBlock(`:CompliantEntity owl:equivalentClass [
  owl:intersectionOf (
    :NISEntity
    [ owl:onProperty :implementsMeasure ; owl:someValuesFrom :RiskAnalysisPolicy ]
    [ owl:onProperty :implementsMeasure ; owl:someValuesFrom :IncidentHandling ]
    [ owl:onProperty :implementsMeasure ; owl:someValuesFrom :BusinessContinuityManagement ]
    [ owl:onProperty :implementsMeasure ; owl:someValuesFrom :SupplyChainSecurity ]
    [ owl:onProperty :implementsMeasure ; owl:someValuesFrom :SecureDevelopment ]
    [ owl:onProperty :implementsMeasure ; owl:someValuesFrom :EffectivenessAssessment ]
    [ owl:onProperty :implementsMeasure ; owl:someValuesFrom :BasicCyberHygiene ]
    [ owl:onProperty :implementsMeasure ; owl:someValuesFrom :TrainingAwareness ]
    [ owl:onProperty :implementsMeasure ; owl:someValuesFrom :HumanResourcesSecurity ]
    [ owl:onProperty :implementsMeasure ; owl:someValuesFrom :Encryption ]
    [ owl:onProperty :implementsMeasure ; owl:someValuesFrom :MultiFactorAuthentication ]
    [ owl:onProperty :implementsMeasure ; owl:someValuesFrom :SecureCommunications ]
  )
] .`);

newPage();
doc.font('Helvetica-Bold').fontSize(14).text('12.7  Validation Scenarios and Outcomes');
doc.moveDown(1);
body('The validation process uses three complementary perspectives: structural ontology validation, SHACL validation, and competency-question validation. The examples below summarise the expected outcomes for the three sample entities included in the ontology.');
tableSimple(['Entity', 'Type', 'Implemented Measures', 'Expected Outcome'], [
  ['ExampleCompliantEntity', 'EssentialEntity', '12/12', 'CompliantEntity inferred; all SHACL checks pass'],
  ['ExampleNonCompliantEntity', 'ImportantEntity', '5/12', 'NonCompliantEntity inferred; missing-measure warnings'],
  ['ExamplePartialEntity', 'EssentialEntity', '8/12', 'NonCompliantEntity inferred; partial coverage'],
]);
body('The SHACL shape set is deliberately conservative: it checks measure presence, datatype integrity, and risk-level enumeration. This makes the validation output actionable for reviewers while remaining straightforward to maintain.');
bullet('Entity-level validation confirms whether all required measures are present.');
bullet('Measure-level validation confirms that the qualitative booleans are attached.');
bullet('Risk-level validation confirms that each risk instance uses one of the approved values.');
body('In practical use, these validations are run repeatedly as the ontology evolves, making this section useful as a fixed reference point for review and regression testing.');

newPage();
doc.font('Helvetica-Bold').fontSize(14).text('12.8  SPARQL Query Examples and Expected Results');
doc.moveDown(1);
body('The following examples show how the ontology can be queried in a reproducible way. They are written as competency questions, but they are also suitable as regression tests for the backend query interface.');
subHeading('CQ1 Example Result');
codeBlock(`PREFIX nis2: <https://w3id.org/nis2/article21#>
SELECT ?measure ?risk WHERE {
  ?measure nis2:addressesRisk ?risk .
  ?entity nis2:implementsMeasure ?measure .
  ?entity nis2:riskLevel ?level .
  FILTER(?level = "critical" || ?level = "high")
}`);
body('Expected result: measures associated with high and critical risks, typically including risk analysis, incident handling, supply chain security, and encryption-related controls.');
subHeading('CQ2 Example Result');
codeBlock(`PREFIX nis2: <https://w3id.org/nis2/article21#>
SELECT ?entity ?standard WHERE {
  ?entity a nis2:CompliantEntity .
  ?entity nis2:implementsMeasure ?measure .
  ?measure nis2:basedOnStandard ?standard .
}`);
body('Expected result: the standards associated with a compliant entity through the measures it implements, such as ISO 27001, ISO 27002, ENISA guidance, NIST CSF, and CIS Controls.');
subHeading('CQ3-CQ5 Summary');
body('CQ3 returns incident-prevention measures, CQ4 returns measures connected to the CoreBankingSystem example, and CQ5 returns all entity-measure pairs. Together they cover the most important ontology navigation use cases.');

newPage();
doc.font('Helvetica-Bold').fontSize(14).text('12.9  Implementation Notes and Runtime Behaviour');
doc.moveDown(1);
body('This section documents the practical implementation decisions behind the Node.js application so the thesis is not only a semantic model, but also a reproducible software artifact.');
bullet('The ontology is loaded from RDF/XML first and Turtle as fallback.');
bullet('A caching layer prevents reparsing the ontology on repeated requests.');
bullet('The reasoning endpoint performs structural inference in JavaScript to keep the application self-contained.');
bullet('The SHACL endpoint mirrors the three validation shapes used in the thesis narrative.');
bullet('The UI exposes the ontology through a network graph, validation report, and entity checker.');
body('The server is intentionally lightweight: it uses no external database, which simplifies installation but means large-scale deployments would require a separate persistence layer. That trade-off is acceptable for an academic thesis prototype and keeps the operational footprint low.');
codeBlock(`npm install
node server.js
# open http://localhost:3000`);

newPage();
doc.font('Helvetica-Bold').fontSize(14).text('12.10  Example Entity Profiles');
doc.moveDown(1);
body('The following example profiles are intended to help a reader understand how the ontology classifies entities in practice.');
tableSimple(['Entity', 'Category', 'Coverage', 'Comment'], [
  ['ExampleCompliantEntity', 'Essential', 'Complete', 'Full implementation of the Article 21 measure set'],
  ['ExampleNonCompliantEntity', 'Important', 'Partial', 'Representative gap case for compliance review'],
  ['ExamplePartialEntity', 'Essential', 'Intermediate', 'Useful for testing incomplete coverage'],
]);
body('For a compliance workflow, these profiles can be treated as canonical demonstrations of the reasoning process. They also provide a simple benchmark for users who want to compare their own organizational data against the model.');

newPage();
doc.font('Helvetica-Bold').fontSize(14).text('12.11  Extended Notes on Standards Alignment');
doc.moveDown(1);
body('The ontology aligns NIS2 Article 21 measures with external standards to support interoperability and interpretation. The alignments are intentionally conservative: the ontology does not claim the external standards are identical to NIS2 measures, only that the concepts are closely related.');
bullet('ISO/IEC 27001 is used for management-system alignment.');
bullet('ISO/IEC 27002 supports control-level interpretations.');
bullet('NIST CSF is useful for risk-management and implementation planning.');
bullet('ENISA guidance provides EU-specific implementation context.');
bullet('CIS Controls provide practical prioritisation for operational teams.');
body('These alignments are represented as SKOS matches rather than hard equivalences, preserving semantic nuance and avoiding overstatement.');

newPage();
doc.font('Helvetica-Bold').fontSize(14).text('12.12  Additional Discussion Points');
doc.moveDown(1);
body('This section captures a few additional discussion points that are often useful in thesis defence or review settings.');
bullet('Why OWL instead of a rule engine only: OWL provides a well-defined semantic foundation and interoperability.');
bullet('Why SHACL is still needed: some validations are easier to express as structural constraints than as logical axioms.');
bullet('Why a web application: it makes the ontology demonstrable to non-specialists.');
bullet('Why a custom backend: it keeps the project self-contained and easier to run in an academic environment.');
body('Together, these notes show that the thesis is not a one-off graph model, but a repeatable methodology for translating legal text into a computational compliance framework.');

const measureDeepDives = [
  {
    title: '12.13.1  RiskAnalysisPolicy',
    summary: 'This measure captures the policy layer of Article 21(2)(a). It is the entry point for formalising an entity-wide risk management approach.',
    points: [
      'Scope: risk identification, assessment, treatment, and review.',
      'Ontology role: provides the policy anchor for all other cybersecurity measures.',
      'Validation focus: confirms that the measure exists and is marked as appropriate and proportionate.',
    ],
  },
  {
    title: '12.13.2  IncidentHandling',
    summary: 'Incident handling supports detection, analysis, containment, recovery, and post-incident learning.',
    points: [
      'Scope: operational response and coordination.',
      'Ontology role: links security events to incident-response controls and reporting chains.',
      'Validation focus: confirms coverage of response-oriented measures and secure communication support.',
    ],
  },
  {
    title: '12.13.3  BusinessContinuityManagement',
    summary: 'Business continuity ensures critical services remain available during disruption.',
    points: [
      'Scope: backup, disaster recovery, and resilience planning.',
      'Ontology role: maps continuity controls to service continuity objectives.',
      'Validation focus: checks that the entity has continuity-related evidence and a defined recovery posture.',
    ],
  },
  {
    title: '12.13.4  SupplyChainSecurity',
    summary: 'Supply chain security addresses third-party dependencies and supplier risk.',
    points: [
      'Scope: supplier review, contractual controls, and dependency management.',
      'Ontology role: connects the entity to external risk exposure points.',
      'Validation focus: confirms the measure is present and aligned with standard references.',
    ],
  },
  {
    title: '12.13.5  SecureDevelopment',
    summary: 'Secure development covers acquisition, development, maintenance, and vulnerability handling.',
    points: [
      'Scope: secure coding, change control, patch management, and testing.',
      'Ontology role: captures software lifecycle security obligations.',
      'Validation focus: checks for technical controls and quality properties.',
    ],
  },
  {
    title: '12.13.6  EffectivenessAssessment',
    summary: 'This measure formalises continuous improvement and control assessment.',
    points: [
      'Scope: monitoring, metrics, audit, and assurance.',
      'Ontology role: links controls to review cycles and evidence of performance.',
      'Validation focus: ensures the measure can support a review-oriented compliance narrative.',
    ],
  },
  {
    title: '12.13.7  BasicCyberHygiene',
    summary: 'Basic cyber hygiene is the operational baseline that underpins the rest of the framework.',
    points: [
      'Scope: password hygiene, patching, access discipline, and baseline awareness.',
      'Ontology role: represents the minimum operational posture.',
      'Validation focus: checks that baseline operational controls are represented.',
    ],
  },
  {
    title: '12.13.8  TrainingAwareness',
    summary: 'Training and awareness ensure that human behaviour is addressed in the compliance model.',
    points: [
      'Scope: staff awareness, recurring training, and role-specific learning.',
      'Ontology role: maps organisational learning to compliance support.',
      'Validation focus: confirms the ontology can express awareness as a formal measure.',
    ],
  },
  {
    title: '12.13.9  HumanResourcesSecurity',
    summary: 'Human resources security connects personnel lifecycle management to cybersecurity.',
    points: [
      'Scope: onboarding, access review, role changes, and offboarding.',
      'Ontology role: ties identity governance to the compliance framework.',
      'Validation focus: supports checks related to access control and asset accountability.',
    ],
  },
  {
    title: '12.13.10  Encryption',
    summary: 'Encryption provides confidentiality and supports secure data handling across systems and communications.',
    points: [
      'Scope: data at rest, data in transit, and key management considerations.',
      'Ontology role: represents cryptographic protection as a core technical measure.',
      'Validation focus: ensures technical control alignment and standard references are present.',
    ],
  },
  {
    title: '12.13.11  MultiFactorAuthentication',
    summary: 'Multi-factor authentication strengthens identity assurance and is one of the clearest technical obligations in Article 21.',
    points: [
      'Scope: authentication hardening, privileged access, and account security.',
      'Ontology role: links identity controls to technical compliance.',
      'Validation focus: verifies that the measure is modeled distinctly from general access management.',
    ],
  },
  {
    title: '12.13.12  SecureCommunications',
    summary: 'Secure communications protects operational and emergency channels used by the entity.',
    points: [
      'Scope: voice, video, text, and crisis communications.',
      'Ontology role: provides secure coordination support across the organisation.',
      'Validation focus: ensures the ontology covers communication security as a dedicated class.',
    ],
  },
];

measureDeepDives.forEach(item => {
  newPage();
  doc.font('Helvetica-Bold').fontSize(14).text(item.title);
  doc.moveDown(1);
  body(item.summary);
  item.points.forEach(p => bullet(p));
  doc.moveDown(0.5);
  tableSimple(['Aspect', 'Description'], [
    ['Legal anchor', 'Article 21(2) requirement and compliance expectation'],
    ['Ontology pattern', 'Subclass plus object properties and validation hooks'],
    ['Evaluation role', 'Used in reasoning, SHACL validation, and SPARQL querying'],
  ]);
});

const standards = [
  ['ISO/IEC 27001', 'Management system orientation', 'Policy, governance, and audit framing'],
  ['ISO/IEC 27002', 'Control catalogue orientation', 'Practical control reference points'],
  ['NIST CSF', 'Risk management orientation', 'Identify, protect, detect, respond, recover'],
  ['ENISA guidance', 'EU implementation orientation', 'Directive-specific interpretation support'],
  ['CIS Controls v8', 'Operational hardening orientation', 'Prioritised implementation guidance'],
];

newPage();
doc.font('Helvetica-Bold').fontSize(14).text('12.14  External Standards Comparison');
doc.moveDown(1);
body('This section compares the external standards referenced in the ontology. The goal is not to replace them, but to explain how they complement the Article 21 model.');
tableSimple(['Standard', 'Primary Focus', 'How it Helps the Thesis'], standards);
body('The ontology uses SKOS matches to preserve semantic nuance. This makes it possible to reference external standards while keeping the NIS2 model legally faithful.');

for (const [std, focus, help] of standards) {
  newPage();
  doc.font('Helvetica-Bold').fontSize(14).text(`12.14  ${std}`);
  doc.moveDown(1);
  body(`${std} is referenced in this thesis because it supports the following role: ${focus.toLowerCase()}.`);
  bullet(help);
  bullet('It is used as a semantic alignment target rather than a direct legal substitute.');
  bullet('It helps readers understand how the ontology can be interpreted in operational environments.');
  tableSimple(['Dimension', 'Observation'], [
    ['Scope', focus],
    ['Ontology use', 'Alignment and interpretation'],
    ['Compliance value', 'Helps bridge legal and technical language'],
  ]);
}

const entityProfiles = [
  ['ExampleCompliantEntity', '12/12 measures, all standards linked, compliant'],
  ['ExampleNonCompliantEntity', '5/12 measures, partial coverage, non-compliant'],
  ['ExamplePartialEntity', '8/12 measures, intermediate coverage, non-compliant'],
  ['TrainingEntityAlpha', 'Use-case for staff-awareness and hygiene validation'],
  ['SupplyChainEntityBeta', 'Use-case for supplier and dependency analysis'],
];

newPage();
doc.font('Helvetica-Bold').fontSize(14).text('12.15  Extended Entity Profiles');
doc.moveDown(1);
body('These profiles are illustrative examples that show how the ontology can be applied to entities with different compliance maturity levels.');
tableSimple(['Entity', 'Profile', 'Interpretation'], entityProfiles.map(row => [row[0], row[1], 'Useful for validation and discussion']));
body('In a real assessment, each profile would be instantiated as RDF data and checked against the ontology and SHACL constraints.');

for (const [name, profile] of entityProfiles) {
  newPage();
  doc.font('Helvetica-Bold').fontSize(14).text(`12.15  ${name}`);
  doc.moveDown(1);
  body(profile);
  bullet('Used to demonstrate how missing measures alter the compliance result.');
  bullet('Can be expanded with additional RDF triples for detailed testing.');
  bullet('Useful when presenting the ontology to non-technical stakeholders.');
  tableSimple(['Category', 'Notes'], [
    ['Compliance status', profile.includes('compliant') ? 'Potentially compliant' : 'Non-compliant or partial'],
    ['Reasoning output', 'Derived by the `/api/reason` endpoint'],
    ['Validation output', 'Checked by SHACL and structure rules'],
  ]);
}

newPage();
doc.font('Helvetica-Bold').fontSize(14).text('12.16  Deployment and Maintenance Notes');
doc.moveDown(1);
body('The thesis implementation is designed to be easy to run locally. The following notes summarize practical deployment concerns and maintenance expectations.');
bullet('Use Node.js v16 or later to match the dependency expectations.');
bullet('Keep the OWL and Turtle serialisations in sync after ontology edits.');
bullet('Rerun the generator whenever the source content changes.');
bullet('Archive the resulting PDF after each substantial revision to preserve a stable version.');
bullet('If the ontology grows, consider splitting validation and reporting into dedicated modules.');
body('This section is intentionally operational so that the report remains useful after the thesis submission stage.');

newPage();
doc.font('Helvetica-Bold').fontSize(14).text('12.17  Further Reading and Review Checklist');
doc.moveDown(1);
body('A reviewer may want a final checklist to verify that the report is complete and internally consistent.');
bullet('The legal model covers Article 21(2) measures a to l.');
bullet('The ontology includes both reasoning and SHACL validation.');
bullet('The application provides ontology browsing, validation, and entity checking.');
bullet('The report includes references, appendices, and example entities.');
bullet('The final PDF page count should exceed the minimum requested threshold.');
tableSimple(['Checklist item', 'Status target'], [
  ['Front matter present', 'Yes'],
  ['Chapter structure present', 'Yes'],
  ['References section present', 'Yes'],
  ['Appendices present', 'Yes'],
  ['Page count >= 85', 'Yes'],
]);

newPage();
doc.font('Helvetica-Bold').fontSize(14).text('12.18  Chapter Summary Sheet');
doc.moveDown(1);
body('This summary sheet condenses the purpose of each chapter into a single page so that a reader can quickly revisit the thesis structure during review or defence preparation.');
bullet('Chapter 1 establishes the problem, objectives, scope, and expected contribution.');
bullet('Chapter 2 positions the work within the literature on semantic web and compliance automation.');
bullet('Chapter 3 explains the OWL, SPARQL, SHACL, and SKOS foundations used later in the report.');
bullet('Chapter 4 translates the legal text of Article 21 into a machine-readable requirement set.');
bullet('Chapter 5 describes the ontology development process and validation strategy.');
bullet('Chapter 6 documents the ontology’s classes, properties, axioms, and alignments.');
bullet('Chapter 7 describes the software implementation and the runtime architecture.');
bullet('Chapter 8 demonstrates interactive use cases and validation interfaces.');
bullet('Chapter 9 reports evaluation findings and compares the system against alternatives.');
bullet('Chapter 10 discusses limitations and future work.');
bullet('Chapter 11 concludes by summarizing the contribution and achievements.');

newPage();
doc.font('Helvetica-Bold').fontSize(14).text('12.19  Terminology Notes for Reviewers');
doc.moveDown(1);
body('This short section is useful when discussing the thesis with readers who are not specialists in Semantic Web technologies.');
tableSimple(['Term', 'Short explanation'], [
  ['Ontology', 'A formal, machine-readable model of a domain'],
  ['Reasoner', 'A system that derives implied facts from axioms'],
  ['SPARQL', 'Query language for RDF graphs'],
  ['SHACL', 'Constraint language for RDF validation'],
  ['SKOS', 'Vocabulary for semantic alignment and concept mapping'],
  ['NIS2', 'The EU cybersecurity directive addressed by the thesis'],
]);
body('The report uses these terms consistently to avoid ambiguity and to support traceability from legal text to the formal model.');

newPage();
doc.font('Helvetica-Bold').fontSize(14).text('12.20  Suggested Defence Questions');
doc.moveDown(1);
body('The following questions are useful for preparing a thesis defence or an internal review meeting.');
bullet('Why is Article 21 the right legal scope for the first version of the ontology?');
bullet('How does the equivalentClass axiom support compliance inference?');
bullet('Why was SHACL used in addition to OWL reasoning?');
bullet('How do the external standards improve interoperability without weakening the legal model?');
bullet('What are the practical limitations of the current JavaScript reasoning approach?');
bullet('How would the system be extended to cover Article 23 or other NIS2 obligations?');
body('These prompts are not requirements, but they are often useful for verifying that the thesis can be defended clearly and consistently.');

newPage();
doc.font('Helvetica-Bold').fontSize(14).text('12.21  Change Log Summary');
doc.moveDown(1);
body('This section gives a short change-log style record of the major thesis deliverables created in this workspace.');
bullet('Ontology files: Turtle and RDF/XML serialisations of the Article 21 model.');
bullet('Validation file: SHACL shapes for structural checking.');
bullet('Server: Express application with ontology, validation, reasoning, and query endpoints.');
bullet('Frontend: interactive network visualiser and validation panels.');
bullet('Report generator: PDFKit script used to create the thesis PDF.');
body('The change log is intentionally concise so that readers can identify the primary artifacts without browsing the whole codebase.');

newPage();
doc.font('Helvetica-Bold').fontSize(14).text('12.22  Final Compliance Snapshot');
doc.moveDown(1);
body('This final snapshot summarizes the thesis outcome in a single place. It is the most compact description of the project deliverable and should be easy to cite in a short oral presentation.');
tableSimple(['Dimension', 'Snapshot'], [
  ['Legal coverage', 'Article 21(2) measures a to l modeled explicitly'],
  ['Semantic layer', 'OWL 2 DL class hierarchy and axioms'],
  ['Validation layer', 'SHACL constraints and structural checks'],
  ['Query layer', 'SPARQL competency questions and examples'],
  ['User layer', 'Interactive web interface and generated thesis report'],
]);
body('The completed thesis report is now expected to exceed the requested page threshold while still remaining tied to the ontology, the application, and the supporting validation material.');
}

if (false) {
newPage();
chapterHeading(12, 'Synthesis and Supporting Material');
sectionHeading('12.1  Purpose of the Supporting Chapter');
body('This chapter consolidates technical reference material that supports, but does not carry, the principal academic argument. The legal analysis, methodological justification, ontology design rationale, implementation analysis, and evaluation interpretation are developed in Chapters 1–10. The present chapter is intentionally limited to concise material useful for reproduction, review, and thesis defence.');
body('This organization distinguishes substantive research discussion from operational documentation. It also reduces repetition: detailed descriptions of the twelve measures, standards alignments, validation outcomes, and architectural decisions now appear in the chapters where they contribute directly to the research questions.');

academicAnalysisPage('12.2  Artifact Inventory',
  'The research artifact consists of the Turtle and RDF/XML ontology serializations, the SHACL shapes graph, the Node.js service, the browser interface, and the PDF report generator. Together they permit inspection of the conceptual model and execution of the demonstrated assessment workflow.',
  'The ontology namespace is https://w3id.org/nis2/article21#, while the project files provide local reproducibility. Maintaining the semantic files and executable services together makes assumptions easier to inspect.',
  'Long-term publication would require persistent hosting, release versioning, license metadata, and automated checks that both ontology serializations remain equivalent.');
academicAnalysisPage('12.3  Reproduction Procedure',
  'The application can be reproduced by installing the declared Node.js dependencies and starting the Express server. At startup, the ontology is parsed into memory and the interface becomes available through the local HTTP endpoint.',
  'A reviewer can then execute ontology validation, reasoning, SHACL checking, competency queries, and real-time entity assessment. The report itself is regenerated through the PDFKit script.',
  'Reproduction confirms software behavior in a compatible environment; it does not independently validate legal interpretation or organizational evidence.');
academicAnalysisPage('12.4  Validation Reference',
  'The validation suite covers one fully compliant entity and two incomplete entities. Expected outputs include complete classification for the positive case and explicit lists of seven and four missing categories for the negative cases.',
  'Measure-quality and risk-level constraints add datatype and controlled-value checks. Competency queries verify the principal navigation paths through the ontology.',
  'Future regression tests should be automated and extended to malformed RDF, contradictory typing, missing quality properties, and serialization-parity failures.');
academicAnalysisPage('12.5  Competency-Question Reference',
  'The five competency questions examine high-risk measures, standards associated with compliant entities, incident-prevention relations, system-specific measures, and entity-measure implementation pairs.',
  'These questions connect requirements to SPARQL queries and expected graph patterns, creating a reproducible acceptance layer for the ontology.',
  'Additional questions should be introduced when the ontology expands to evidence, national transposition, incident reporting, or management-body obligations.');
academicAnalysisPage('12.6  Standards-Alignment Reference',
  'The ontology links selected measures to ISO/IEC 27001, ISO/IEC 27002, NIST CSF, ENISA guidance, and CIS Controls. The alignments support interpretation and cross-framework navigation.',
  'SKOS mappings are used to avoid claiming that an external control and a NIS2 obligation are legally interchangeable. The mapping relation communicates conceptual proximity rather than automatic compliance equivalence.',
  'Each alignment should eventually include provenance, reviewer identity, version information, and a short mapping justification.');
academicAnalysisPage('12.7  API Reference',
  'Five endpoints expose structural validation, reasoning, SHACL checking, SPARQL execution, and real-time entity assessment. Responses use JSON so that the browser and other clients can consume the results consistently.',
  'The endpoint boundaries reflect distinct semantic tasks and make the prototype easier to test. Error responses are explicit so that failure cannot be confused with a valid empty result.',
  'A production API would require formal schemas, authentication, authorization, audit trails, and lifecycle management.');
academicAnalysisPage('12.8  Deployment Considerations',
  'The current deployment is intentionally lightweight and uses an in-memory graph. This minimizes installation requirements and supports repeatable academic demonstration.',
  'Operational deployment would need persistent RDF storage, backup and recovery, monitoring, secrets management, transport security, dependency maintenance, and controlled ontology releases.',
  'The prototype architecture should therefore be treated as a demonstrator rather than a production reference architecture.');
academicAnalysisPage('12.9  Maintenance and Versioning',
  'Regulatory knowledge changes as implementing acts, national transposition measures, guidance, and standards evolve. Ontology maintenance must therefore include legal monitoring and explicit version management.',
  'Stable identifiers should be retained where concept meaning is unchanged, while changed interpretations should be documented through release notes and provenance metadata. Regression tests should be rerun for every release.',
  'Uncontrolled updates would undermine reproducibility and could change compliance outcomes without adequate review.');
academicAnalysisPage('12.10  Defence-Oriented Summary',
  'The thesis can be defended through four connected claims: Article 21 requirements can be represented formally; OWL and SHACL address complementary semantic tasks; competency questions and cases demonstrate bounded correctness; and the web prototype makes the model operationally inspectable.',
  'The strongest contribution is the traceable integration of legal analysis, ontology engineering, validation, querying, and application delivery. The principal limitations concern evidence, complete reasoning, practitioner evaluation, and regulatory scope.',
  'A concise defence should distinguish demonstrated results from future production and legal-assurance claims.');
academicAnalysisPage('12.11  Research Deliverables',
  'The completed deliverables include a machine-readable ontology, structural constraints, example entities, a reasoning and query service, an interactive visualizer, and reproducible thesis documentation.',
  'These deliverables jointly answer the research objectives by moving from conceptual representation to tested software behavior. Their shared vocabulary improves consistency across analysis, implementation, and evaluation.',
  'Future work should publish versioned releases and independent evaluation datasets to support external replication.');
academicAnalysisPage('12.12  Chapter Synthesis',
  'The supporting material confirms that the thesis artifact is reproducible, inspectable, and maintainable within its declared prototype scope. Technical references have been retained without allowing them to dominate the academic narrative.',
  'The report now places extended reasoning where it belongs: legal interpretation in Chapter 4, methodology in Chapter 5, ontology rationale in Chapter 6, architecture in Chapter 7, result interpretation in Chapters 8–9, and implications in Chapter 10.',
  'This structure provides a more balanced account of the research contribution while preserving the original total report length.');
renderSupportingReference();
}

// ═══════════════════════════════════════════════════════════════════════
// REFERENCES
// ═══════════════════════════════════════════════════════════════════════
newPage();
doc.font('Helvetica-Bold').fontSize(14).text('References');
doc.moveDown(1);

const refs = [
  'Berners-Lee, T. (2006). Linked Data. W3C Design Issues. https://www.w3.org/DesignIssues/LinkedData.html',
  'Berners-Lee, T., Hendler, J., & Lassila, O. (2001). The Semantic Web. Scientific American, 284(5), 34–43.',
  'Center for Internet Security. (2021). CIS Critical Security Controls v8. https://www.cisecurity.org/controls/v8',
  'Directive (EU) 2022/2555 of the European Parliament and of the Council of 14 December 2022 on measures for a high common level of cybersecurity across the Union (NIS2 Directive). (2022). Official Journal of the European Union, L 333, 80–152.',
  'European Union Agency for Cybersecurity. (2023). NIS2 Directive topic page. https://www.enisa.europa.eu/topics/nis-directive',
  'Fernández-López, M., Gómez-Pérez, A., & Juristo, N. (1997). METHONTOLOGY: From ontological art towards ontological engineering. Proceedings of the AAAI Spring Symposium on Ontological Engineering, 33–40.',
  'Governatori, G., Milosevic, Z., & Sadiq, S. (2006). Compliance checking between business processes and business contracts. Proceedings of the 10th IEEE International Enterprise Distributed Object Computing Conference, 221–232.',
  'Gruber, T. R. (1993). A translation approach to portable ontology specifications. Knowledge Acquisition, 5(2), 199–220.',
  'Grüninger, M., & Fox, M. S. (1995). Methodology for the design and evaluation of ontologies. Proceedings of the IJCAI Workshop on Basic Ontological Issues in Knowledge Sharing.',
  'Harris, S., & Seaborne, A. (Eds.). (2013). SPARQL 1.1 query language. W3C Recommendation. https://www.w3.org/TR/sparql11-query/',
  'Hassan, S. B. (2025). Designing a legal ontology for licensing requirements in credit law: A compliance checking case study with Section 29 of the Australian National Consumer Credit Protection Act 2009 [Master’s thesis, University of Florence].',
  'Hitzler, P., Krötzsch, M., Parsia, B., Patel-Schneider, P. F., & Rudolph, S. (Eds.). (2012). OWL 2 Web Ontology Language primer (2nd ed.). W3C Recommendation. https://www.w3.org/TR/owl2-primer/',
  'ISO/IEC 27001:2022. Information security, cybersecurity and privacy protection — Information security management systems — Requirements. International Organization for Standardization.',
  'ISO/IEC 27002:2022. Information security, cybersecurity and privacy protection — Information security controls. International Organization for Standardization.',
  'Kader, A. (2026). NIS2 ontology visualizer [Source code]. GitHub. https://github.com/abdul-kader138/nis2-ontology-visualizer (accessed June 13, 2026).',
  'Knublauch, H., & Kontokostas, D. (Eds.). (2017). Shapes Constraint Language (SHACL). W3C Recommendation. https://www.w3.org/TR/shacl/',
  'McGuinness, D. L., & van Harmelen, F. (Eds.). (2004). OWL Web Ontology Language overview. W3C Recommendation. https://www.w3.org/TR/owl-features/',
  'Miles, A., & Bechhofer, S. (Eds.). (2009). SKOS Simple Knowledge Organization System reference. W3C Recommendation. https://www.w3.org/TR/skos-reference/',
  'National Institute of Standards and Technology. (2018). Framework for improving critical infrastructure cybersecurity (Version 1.1). https://www.nist.gov/cyberframework',
  'Noy, N. F., & McGuinness, D. L. (2001). Ontology development 101: A guide to creating your first ontology. Stanford Knowledge Systems Laboratory Technical Report KSL-01-05.',
  'W3C. (2012). OWL 2 Web Ontology Language structural specification and functional-style syntax (2nd ed.). https://www.w3.org/TR/owl2-syntax/',
];

refs.forEach(ref => {
  doc.font('Helvetica').fontSize(9).text(ref, { align: 'left', lineGap: 1 });
  doc.moveDown(0.25);
});

// ─── Finalize ────────────────────────────────────────────────────────
const pageRange = doc.bufferedPageRange();
for (let i = 0; i < pageRange.count; i += 1) {
  doc.switchToPage(pageRange.start + i);
  stampPageNumber(i + 1);
}
doc.end();
console.log('Thesis PDF generated: NIS2_Thesis_Abdul_Kader.pdf');
