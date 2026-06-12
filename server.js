const express = require('express');
const fs = require('fs');
const path = require('path');
const { Readable } = require('stream');
const { Parser: N3Parser, Store: N3Store, DataFactory } = require('n3');
const rdfParse = require('rdf-parse').default;
const getStream = require('get-stream');
const { Parser: SparqlParser } = require('sparqljs');

const BASE_URI = 'https://w3id.org/nis2/article21#';

// Operational classes covering the ten Article 21(2)(a)-(j) legal categories.
// Point (g) is split into hygiene/training and point (j) into MFA/communications.
const REQUIRED_MEASURES = [
  'RiskAnalysisPolicy',
  'IncidentHandling',
  'BusinessContinuityManagement',
  'SupplyChainSecurity',
  'SecureDevelopment',
  'EffectivenessAssessment',
  'BasicCyberHygiene',
  'TrainingAwareness',
  'HumanResourcesSecurity',
  'Encryption',
  'MultiFactorAuthentication',
  'SecureCommunications',
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function localName(uri) {
  if (!uri) return '';
  if (uri.includes('#')) return uri.split('#')[1];
  return uri.split('/').pop();
}

function termValue(term) {
  if (!term) return '';
  if (typeof term === 'string') return term;
  return term.value ?? term.toString();
}

// ---------------------------------------------------------------------------
// RDF parsing
// ---------------------------------------------------------------------------

function getOntologyFilePath() {
  const owlPath = path.join(__dirname, 'nis2_article21_cybersecurity.owl');
  if (fs.existsSync(owlPath)) return owlPath;
  return path.join(__dirname, 'nis2_article21_cybersecurity.ttl');
}

async function parseRDFFile(filePath) {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const ext = path.extname(filePath).toLowerCase();
  const contentType = (ext === '.ttl') ? 'text/turtle' : 'application/rdf+xml';

  if (contentType === 'text/turtle') {
    const parser = new N3Parser();
    return parser.parse(fileContent);
  }
  const textStream = Readable.from([fileContent]);
  const quadStream = await rdfParse.parse(textStream, { contentType });
  return getStream.array(quadStream);
}

// In-memory cache
let cache = null;

async function getCachedQuads() {
  const filePath = getOntologyFilePath();
  const mtime = fs.statSync(filePath).mtimeMs;
  if (cache && cache.filePath === filePath && cache.mtime === mtime) {
    return cache;
  }
  const quads = await parseRDFFile(filePath);

  // Build an N3 Store for SPARQL execution
  const store = new N3Store();
  for (const q of quads) {
    try {
      store.addQuad(
        DataFactory.namedNode(termValue(q.subject)),
        DataFactory.namedNode(termValue(q.predicate)),
        q.object?.termType === 'Literal'
          ? DataFactory.literal(
              q.object.value,
              q.object.datatype
                ? DataFactory.namedNode(q.object.datatype.value)
                : undefined
            )
          : DataFactory.namedNode(termValue(q.object))
      );
    } catch (_) {
      // Skip blank nodes and other unsupported term types
    }
  }

  cache = { quads, store, filePath, mtime };
  return cache;
}

// ---------------------------------------------------------------------------
// Ontology element counting (used by validation + stats)
// ---------------------------------------------------------------------------

function countOntologyElements(quads) {
  const classes = new Set();
  const properties = new Set();

  for (const q of quads) {
    const pred = termValue(q.predicate);
    const obj = termValue(q.object);
    const subj = termValue(q.subject);

    if (pred === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type') {
      if (obj === 'http://www.w3.org/2002/07/owl#Class') classes.add(subj);
      if (
        obj === 'http://www.w3.org/2002/07/owl#ObjectProperty' ||
        obj === 'http://www.w3.org/2002/07/owl#DatatypeProperty'
      )
        properties.add(subj);
    }
  }

  // Instances: typed as one of our namespace classes, but not themselves a class
  const instances = new Set();
  for (const q of quads) {
    const pred = termValue(q.predicate);
    const obj = termValue(q.object);
    const subj = termValue(q.subject);
    if (
      pred === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' &&
      obj.startsWith(BASE_URI) &&
      obj !== 'http://www.w3.org/2002/07/owl#Class' &&
      !classes.has(subj)
    ) {
      instances.add(subj);
    }
  }

  return { classes, properties, instances };
}

// ---------------------------------------------------------------------------
// Express app
// ---------------------------------------------------------------------------

const app = express();
const PORT = 3000;

app.use(express.static('public'));

// ---------------------------------------------------------------------------
// GET /api/ontology  — graph data for vis-network
// ---------------------------------------------------------------------------

app.get('/api/ontology', async (req, res) => {
  try {
    const { quads } = await getCachedQuads();
    const nodes = new Map();
    const edges = [];

    function ensureNode(uri) {
      if (!nodes.has(uri)) {
        nodes.set(uri, {
          id: uri,
          label: localName(uri),
          type: 'unknown',
          properties: {},
          comments: [],
        });
      }
      return nodes.get(uri);
    }

    for (const quad of quads) {
      const subj = termValue(quad.subject);
      const pred = termValue(quad.predicate);
      const obj = termValue(quad.object);

      ensureNode(subj);

      if (pred === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type') {
        if (obj === 'http://www.w3.org/2002/07/owl#Class') {
          nodes.get(subj).type = localName(subj);
        } else {
          nodes.get(subj).type = localName(obj);
          if (obj.startsWith(BASE_URI)) ensureNode(obj);
        }
      } else if (pred === 'http://www.w3.org/2000/01/rdf-schema#label') {
        nodes.get(subj).label = obj;
      } else if (pred === 'http://www.w3.org/2000/01/rdf-schema#comment') {
        nodes.get(subj).comments.push(obj);
      } else if (pred === 'http://www.w3.org/2000/01/rdf-schema#subClassOf') {
        if (obj.startsWith(BASE_URI)) {
          ensureNode(obj);
          edges.push({ from: subj, to: obj, label: 'rdfs:subClassOf', type: 'inheritance', arrows: 'to' });
        }
      } else if (pred.startsWith(BASE_URI)) {
        const isLiteral =
          quad.object?.termType === 'Literal' ||
          (typeof quad.object === 'object' && quad.object?.datatype);
        if (isLiteral) {
          nodes.get(subj).properties[localName(pred)] = obj;
        } else if (obj.startsWith(BASE_URI)) {
          ensureNode(obj);
          edges.push({
            from: subj,
            to: obj,
            label: localName(pred),
            type: 'property',
            arrows: 'to',
            dashes: true,
          });
        }
      }
    }

    // Remove OWL structural nodes (properties, ontology declaration, blank nodes)
    const SKIP_TYPES = new Set([
      'ObjectProperty', 'DatatypeProperty', 'Ontology', 'TransitiveProperty', 'FunctionalProperty',
    ]);
    const SKIP_IDS = new Set([
      'implementsMeasure', 'isImplementedBy', 'addressesRisk', 'preventsIncident',
      'minimizesImpact', 'basedOnStandard', 'appliesToSystem', 'hasSubMeasure',
      'isProportionate', 'isAppropriate', 'isStateOfTheArt', 'measureDescription', 'riskLevel',
    ]);

    const ENTITY_IDS = new Set(['Entity', 'EssentialEntity', 'ImportantEntity', 'CompliantEntity']);
    const MEASURE_TYPES = new Set([
      'RiskManagementMeasure', 'TechnicalMeasure', 'OperationalMeasure', 'OrganizationalMeasure',
      ...REQUIRED_MEASURES,
    ]);
    const SUPPORTING_TYPES = new Set([
      'CybersecurityRisk', 'SecurityIncident', 'NetworkInformationSystem', 'SecurityStandard',
    ]);

    const nodesArray = Array.from(nodes.values())
      .filter(n => {
        const id = localName(n.id);
        return !SKIP_TYPES.has(n.type) && !SKIP_IDS.has(id) && n.type !== 'AllDisjointClasses';
      })
      .map(n => {
        const id = localName(n.id);
        let category = 'other';
        let color = '#FFE6CC';

        if (ENTITY_IDS.has(id) || ENTITY_IDS.has(n.type)) {
          category = 'entity';
          color = '#E6F3FF';
        } else if (MEASURE_TYPES.has(id) || MEASURE_TYPES.has(n.type)) {
          category = 'measure';
          color = '#E6FFE6';
        } else if (SUPPORTING_TYPES.has(id) || SUPPORTING_TYPES.has(n.type)) {
          category = 'supporting';
          color = '#FFE6CC';
        }

        let tooltip = n.type || 'Unknown';
        if (n.comments.length > 0) tooltip += `\n\n${n.comments[0]}`;
        if (Object.keys(n.properties).length > 0)
          tooltip += `\n\nProperties: ${Object.keys(n.properties).join(', ')}`;

        return {
          id: n.id,
          label: n.label || id,
          type: n.type || 'unknown',
          category,
          color,
          properties: n.properties,
          tooltip,
        };
      });

    res.json({ nodes: nodesArray, edges });
  } catch (err) {
    console.error('Error in /api/ontology:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// GET /api/validate  — Article 21 compliance validation
// ---------------------------------------------------------------------------

app.get('/api/validate', async (req, res) => {
  try {
    const { quads, filePath } = await getCachedQuads();
    const result = { valid: true, errors: [], warnings: [], info: [], statistics: {} };

    const fileType = path.extname(filePath) === '.owl' ? 'RDF/XML' : 'Turtle';
    result.info.push(`✓ Syntax valid — ${quads.length} triples parsed from ${fileType}`);

    const { classes, properties, instances } = countOntologyElements(quads);

    // Check ontology declaration
    const hasOntologyDecl = quads.some(
      q =>
        termValue(q.predicate) === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' &&
        termValue(q.object) === 'http://www.w3.org/2002/07/owl#Ontology'
    );
    if (!hasOntologyDecl) {
      result.warnings.push({ type: 'Missing Declaration', message: 'No owl:Ontology declaration found' });
    } else {
      result.info.push('✓ Ontology declaration present');
    }

    // Check OWL 2 reasoning axioms
    const hasEquivClass = quads.some(
      q => termValue(q.predicate) === 'http://www.w3.org/2002/07/owl#equivalentClass'
    );
    if (!hasEquivClass) {
      result.warnings.push({
        type: 'Missing Reasoning Axioms',
        message: 'No owl:equivalentClass axioms found. CompliantEntity cannot be inferred by a reasoner.',
      });
    } else {
      result.info.push('✓ OWL 2 equivalentClass axioms present — reasoner can infer CompliantEntity');
    }

    // Check disjointWith
    const hasDisjoint = quads.some(
      q => termValue(q.predicate) === 'http://www.w3.org/2002/07/owl#disjointWith'
    );
    if (hasDisjoint) {
      result.info.push('✓ owl:disjointWith axioms present — EssentialEntity and ImportantEntity are disjoint');
    }

    // Check all 12 operational classes are defined.
    const foundMeasures = new Set();
    for (const q of quads) {
      if (
        termValue(q.predicate) === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' &&
        termValue(q.object) === 'http://www.w3.org/2002/07/owl#Class'
      ) {
        const name = localName(termValue(q.subject));
        if (REQUIRED_MEASURES.includes(name)) foundMeasures.add(name);
      }
    }

    const missingMeasures = REQUIRED_MEASURES.filter(m => !foundMeasures.has(m));
    if (missingMeasures.length > 0) {
      result.warnings.push({
        type: 'Missing Measures',
        message: `Missing required Article 21 measures: ${missingMeasures.join(', ')}`,
      });
    } else {
      result.info.push(`✓ All ${REQUIRED_MEASURES.length} operational classes covering Article 21(2)(a)-(j) are present`);
    }

    // Check for circular class hierarchy
    const subClassEdges = [];
    for (const q of quads) {
      if (termValue(q.predicate) === 'http://www.w3.org/2000/01/rdf-schema#subClassOf') {
        subClassEdges.push({ from: termValue(q.subject), to: termValue(q.object) });
      }
    }
    const hierarchyMap = new Map();
    subClassEdges.forEach(({ from, to }) => {
      if (!hierarchyMap.has(from)) hierarchyMap.set(from, []);
      hierarchyMap.get(from).push(to);
    });

    function hasCycle(node, visited = new Set(), stack = new Set()) {
      if (stack.has(node)) return true;
      if (visited.has(node)) return false;
      visited.add(node);
      stack.add(node);
      for (const child of hierarchyMap.get(node) || []) {
        if (hasCycle(child, visited, stack)) return true;
      }
      stack.delete(node);
      return false;
    }

    const hasCyclic = Array.from(hierarchyMap.keys()).some(n => hasCycle(n));
    if (hasCyclic) {
      result.errors.push({ type: 'Circular Hierarchy', message: 'Circular dependency detected in class hierarchy' });
      result.valid = false;
    } else {
      result.info.push('✓ No circular dependencies in class hierarchy');
    }

    result.statistics = {
      totalQuads: quads.length,
      totalClasses: classes.size,
      totalProperties: properties.size,
      totalInstances: instances.size,
      totalEdges: subClassEdges.length,
      requiredMeasuresFound: foundMeasures.size,
      requiredMeasuresTotal: REQUIRED_MEASURES.length,
    };

    result.info.push(
      `✓ ${classes.size} classes · ${properties.size} properties · ${instances.size} instances`
    );

    if (result.errors.length === 0 && result.warnings.length === 0) {
      result.info.push('✓ Ontology validation passed with no issues');
    }

    res.json(result);
  } catch (err) {
    console.error('Error in /api/validate:', err.message);
    res.status(500).json({ valid: false, errors: [{ type: 'Validation Error', message: err.message }], warnings: [], info: [] });
  }
});

// ---------------------------------------------------------------------------
// GET /api/sparql  — limited SPARQL SELECT (BGP + basic FILTER; sparqljs + N3 Store)
// ---------------------------------------------------------------------------

app.get('/api/sparql', async (req, res) => {
  const queryStr = (req.query.query || '').toString().trim();
  if (!queryStr) return res.status(400).json({ error: 'Missing ?query= parameter' });

  let parsed;
  const sparqlParser = new SparqlParser({
    prefixes: {
      '':     BASE_URI,
      owl:    'http://www.w3.org/2002/07/owl#',
      rdf:    'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
      rdfs:   'http://www.w3.org/2000/01/rdf-schema#',
      xsd:    'http://www.w3.org/2001/XMLSchema#',
      dc:     'http://purl.org/dc/elements/1.1/',
      skos:   'http://www.w3.org/2004/02/skos/core#',
    },
  });

  try {
    parsed = sparqlParser.parse(queryStr);
  } catch (e) {
    return res.status(400).json({ error: `SPARQL parse error: ${e.message}` });
  }

  if (parsed.type !== 'query' || parsed.queryType !== 'SELECT') {
    return res.status(501).json({ error: 'Only SELECT queries are supported' });
  }

  try {
    const { store } = await getCachedQuads();

    // Collect variable names requested
    const selectAll = parsed.variables.length === 1 && parsed.variables[0].value === '*';
    const requestedVars = selectAll ? null : parsed.variables.map(v => v.value);

    // Execute the WHERE clause BGP patterns (Basic Graph Patterns only)
    const bgpPatterns = (parsed.where || []).filter(p => p.type === 'bgp');
    const filterPatterns = (parsed.where || []).filter(p => p.type === 'filter');

    // Start with empty binding (one solution with no variable assignments)
    let solutions = [{}];

    for (const bgp of bgpPatterns) {
      for (const triple of bgp.triples) {
        solutions = matchTriple(store, triple, solutions);
      }
    }

    // Apply FILTER expressions (handles simple comparisons only)
    for (const f of filterPatterns) {
      solutions = solutions.filter(sol => evalFilter(f.expression, sol));
    }

    // Apply SELECT variable projection
    if (requestedVars) {
      solutions = solutions.map(sol => {
        const projected = {};
        for (const v of requestedVars) {
          if (sol[v] !== undefined) projected[v] = sol[v];
        }
        return projected;
      });
    }

    // Determine result variable names
    const vars =
      requestedVars ||
      (solutions.length > 0 ? Object.keys(solutions[0]) : []);

    // Format as SPARQL JSON results
    const bindings = solutions.map(sol =>
      Object.fromEntries(
        Object.entries(sol).map(([k, term]) => [
          k,
          {
            value: term.value,
            type: term.termType === 'Literal' ? 'literal' : 'uri',
            ...(term.datatype ? { datatype: term.datatype.value } : {}),
          },
        ])
      )
    );

    res.json({ head: { vars }, results: { bindings } });
  } catch (err) {
    console.error('Error in /api/sparql:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Evaluate a single triple pattern against the N3 Store and extend solutions
function matchTriple(store, triple, solutions) {
  const next = [];
  for (const sol of solutions) {
    const s = bindTerm(triple.subject, sol);
    const p = bindTerm(triple.predicate, sol);
    const o = bindTerm(triple.object, sol);

    const quads = store.getQuads(s, p, o, null);
    for (const quad of quads) {
      const extended = { ...sol };
      let ok = true;

      ok = ok && bindVar(triple.subject, quad.subject, extended);
      ok = ok && bindVar(triple.predicate, quad.predicate, extended);
      ok = ok && bindVar(triple.object, quad.object, extended);

      if (ok) next.push(extended);
    }
  }
  return next;
}

// Convert a parsed term to an N3-compatible value (null = wildcard)
function bindTerm(term, sol) {
  if (!term) return null;
  if (term.termType === 'Variable') {
    const bound = sol[term.value];
    return bound || null;
  }
  if (term.termType === 'NamedNode') return DataFactory.namedNode(term.value);
  if (term.termType === 'Literal')
    return DataFactory.literal(
      term.value,
      term.datatype ? DataFactory.namedNode(term.datatype.value) : undefined
    );
  return null;
}

// Attempt to assign a quad term to a variable; return false on conflict
function bindVar(pattern, quadTerm, sol) {
  if (!pattern || pattern.termType !== 'Variable') return true;
  const varName = pattern.value;
  if (sol[varName] === undefined) {
    sol[varName] = quadTerm;
    return true;
  }
  return sol[varName].value === quadTerm.value;
}

// Basic FILTER evaluation (handles strstarts, comparison, logical and/or)
function evalFilter(expr, sol) {
  if (!expr) return true;
  try {
    if (expr.type === 'operation') {
      const op = expr.operator;
      const args = expr.args;

      if (op === 'strstarts') {
        const a = resolveExpr(args[0], sol);
        const b = resolveExpr(args[1], sol);
        return a.startsWith(b);
      }
      if (op === 'str') return resolveExpr(args[0], sol);
      if (op === '=') return resolveExpr(args[0], sol) === resolveExpr(args[1], sol);
      if (op === '!=') return resolveExpr(args[0], sol) !== resolveExpr(args[1], sol);
      if (op === '&&') return evalFilter(args[0], sol) && evalFilter(args[1], sol);
      if (op === '||') return evalFilter(args[0], sol) || evalFilter(args[1], sol);
      if (op === '!') return !evalFilter(args[0], sol);
    }
  } catch (_) {}
  return true;
}

function resolveExpr(expr, sol) {
  if (!expr) return '';
  if (expr.termType === 'Variable') {
    const t = sol[expr.value];
    return t ? t.value : '';
  }
  if (expr.termType === 'Literal' || expr.termType === 'NamedNode') return expr.value;
  if (expr.type === 'operation' && expr.operator === 'str') {
    return resolveExpr(expr.args[0], sol);
  }
  return '';
}

// ---------------------------------------------------------------------------
// GET /api/reason  — OWL 2 compliance reasoning (structural inference)
// ---------------------------------------------------------------------------

app.get('/api/reason', async (req, res) => {
  try {
    const { quads } = await getCachedQuads();

    // Build a map: entity -> set of measure class names implemented
    const entityMeasures = new Map();
    const entityTypes = new Map();
    const measureClassOf = new Map();

    // Step 1: collect what class each measure instance belongs to
    for (const q of quads) {
      const pred = termValue(q.predicate);
      const obj = termValue(q.object);
      const subj = termValue(q.subject);
      if (
        pred === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' &&
        obj.startsWith(BASE_URI)
      ) {
        const cls = localName(obj);
        if (REQUIRED_MEASURES.includes(cls)) {
          measureClassOf.set(subj, cls);
        }
      }
    }

    // Step 2: collect entities and their implemented measures
    for (const q of quads) {
      const pred = termValue(q.predicate);
      const obj = termValue(q.object);
      const subj = termValue(q.subject);

      if (pred === BASE_URI + 'implementsMeasure') {
        if (!entityMeasures.has(subj)) entityMeasures.set(subj, new Set());
        const measureClass = measureClassOf.get(obj);
        if (measureClass) entityMeasures.get(subj).add(measureClass);
      }

      if (pred === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type') {
        const cls = localName(obj);
        if (cls === 'EssentialEntity' || cls === 'ImportantEntity') {
          entityTypes.set(subj, cls);
        }
      }
    }

    // Step 3: classify each entity
    const inferredCompliant = [];
    const inferredNonCompliant = [];

    for (const [entity, measures] of entityMeasures.entries()) {
      const missing = REQUIRED_MEASURES.filter(m => !measures.has(m));
      const entityLabel = localName(entity);
      const entityType = entityTypes.get(entity) || 'Entity';
      if (missing.length === 0) {
        inferredCompliant.push({ entity: entityLabel, type: entityType, implements: measures.size });
      } else {
        inferredNonCompliant.push({
          entity: entityLabel,
          type: entityType,
          implements: measures.size,
          missing,
        });
      }
    }

    // Step 4: check disjointness (EssentialEntity ∩ ImportantEntity must be empty)
    const disjointnessViolations = [];
    const essentials = new Set();
    const importants = new Set();
    for (const [ent, type] of entityTypes.entries()) {
      if (type === 'EssentialEntity') essentials.add(ent);
      if (type === 'ImportantEntity') importants.add(ent);
    }
    for (const e of essentials) {
      if (importants.has(e))
        disjointnessViolations.push(`${localName(e)} is both EssentialEntity and ImportantEntity`);
    }

    // Step 5: property chain inference — usesStandard
    // owl:propertyChainAxiom ( :implementsMeasure :basedOnStandard )
    // For each entity, collect all standards used transitively via implemented measures
    const measureStandards = new Map();
    for (const q of quads) {
      if (termValue(q.predicate) === BASE_URI + 'basedOnStandard') {
        const measure = termValue(q.subject);
        const standard = termValue(q.object);
        if (!measureStandards.has(measure)) measureStandards.set(measure, new Set());
        measureStandards.get(measure).add(standard);
      }
    }

    const inferredUsesStandard = [];
    for (const q of quads) {
      if (termValue(q.predicate) === BASE_URI + 'implementsMeasure') {
        const entity = termValue(q.subject);
        const measure = termValue(q.object);
        const standards = measureStandards.get(measure) || new Set();
        for (const std of standards) {
          inferredUsesStandard.push({
            entity: localName(entity),
            standard: localName(std),
            via: localName(measure),
          });
        }
      }
    }

    // Deduplicate entity→standard pairs (keep unique entity+standard, list all vias)
    const stdMap = new Map();
    for (const t of inferredUsesStandard) {
      const key = `${t.entity}::${t.standard}`;
      if (!stdMap.has(key)) stdMap.set(key, { entity: t.entity, standard: t.standard, via: [] });
      stdMap.get(key).via.push(t.via);
    }
    const inferredStandards = Array.from(stdMap.values());

    res.json({
      supported: true,
      description:
        'Structural OWL 2 DL compliance inference based on the CompliantEntity equivalentClass axiom. ' +
        'For full OWL 2 reasoning load the ontology into Protégé with HermiT or Pellet.',
      inferredCompliant,
      inferredNonCompliant,
      disjointnessViolations,
      inferredStandards,
      summary: {
        totalEntities: entityMeasures.size,
        compliant: inferredCompliant.length,
        nonCompliant: inferredNonCompliant.length,
        disjointnessViolations: disjointnessViolations.length,
        inferredStandardLinks: inferredStandards.length,
      },
    });
  } catch (err) {
    console.error('Error in /api/reason:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// GET /api/shacl  — structural SHACL shapes validation
// Implements the three shapes defined in nis2_article21_compliance.shacl.ttl
// ---------------------------------------------------------------------------

app.get('/api/shacl', async (req, res) => {
  try {
    const { quads } = await getCachedQuads();

    const violations = [];
    const warnings = [];
    const info = [];

    const RDF_TYPE = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type';
    const XSD_BOOLEAN = 'http://www.w3.org/2001/XMLSchema#boolean';

    // Build indexes: typeMap (uri → Set<classLocalName>), propMap (uri → Map<predURI, [{value,datatype}]>)
    const typeMap = new Map();
    const propMap = new Map();

    for (const q of quads) {
      const s = termValue(q.subject);
      const p = termValue(q.predicate);
      const o = termValue(q.object);

      if (p === RDF_TYPE) {
        if (!typeMap.has(s)) typeMap.set(s, new Set());
        typeMap.get(s).add(localName(o));
      }

      if (!propMap.has(s)) propMap.set(s, new Map());
      const pm = propMap.get(s);
      if (!pm.has(p)) pm.set(p, []);
      pm.get(p).push({ value: o, datatype: q.object?.datatype?.value });
    }

    const getValues = (uri, pred) => (propMap.get(uri) || new Map()).get(pred) || [];
    const getBool = (uri, pred) =>
      getValues(uri, pred).some(v => v.value === 'true' && v.datatype === XSD_BOOLEAN);
    const typesOf = (uri) => typeMap.get(uri) || new Set();

    // -----------------------------------------------------------------------
    // Shape 1: Article21ComplianceShape — sh:targetClass :Entity
    // -----------------------------------------------------------------------
    const IMPL = BASE_URI + 'implementsMeasure';

    const entities = Array.from(typeMap.entries())
      .filter(([, t]) => t.has('Entity') || t.has('EssentialEntity') || t.has('ImportantEntity'))
      .map(([uri]) => uri);

    for (const entity of entities) {
      const implementedClasses = new Set();
      for (const { value: measureURI } of getValues(entity, IMPL)) {
        for (const cls of typesOf(measureURI)) {
          if (REQUIRED_MEASURES.includes(cls)) implementedClasses.add(cls);
        }
      }

      const missing = REQUIRED_MEASURES.filter(m => !implementedClasses.has(m));
      const eLabel = localName(entity);

      if (missing.length === 0) {
        info.push(`✓ ${eLabel}: all 12 operational classes covering Article 21(2)(a)-(j) are implemented`);
      } else {
        for (const m of missing) {
          violations.push({
            shape: 'Article21ComplianceShape',
            focusNode: eLabel,
            severity: 'sh:Violation',
            message: `Article 21(2): ${eLabel} is missing required measure: ${m}`,
          });
        }
      }

      // All measures must be RiskManagementMeasure instances
      for (const { value: measureURI } of getValues(entity, IMPL)) {
        const mTypes = typesOf(measureURI);
        const isRMM = mTypes.has('RiskManagementMeasure') || REQUIRED_MEASURES.some(rm => mTypes.has(rm));
        if (!isRMM) {
          violations.push({
            shape: 'Article21ComplianceShape',
            focusNode: eLabel,
            severity: 'sh:Violation',
            message: `Article 21(1): ${localName(measureURI)} implemented by ${eLabel} is not a RiskManagementMeasure`,
          });
        }
      }
    }

    // -----------------------------------------------------------------------
    // Shape 2: MeasureQualityShape — sh:targetClass :RiskManagementMeasure
    // -----------------------------------------------------------------------
    const IS_APPROPRIATE = BASE_URI + 'isAppropriate';
    const IS_PROPORTIONATE = BASE_URI + 'isProportionate';
    const IS_STATE_OF_ART = BASE_URI + 'isStateOfTheArt';
    const MEASURE_DESC = BASE_URI + 'measureDescription';

    const measures = Array.from(typeMap.entries())
      .filter(([, t]) => REQUIRED_MEASURES.some(rm => t.has(rm)))
      .map(([uri]) => uri);

    for (const measure of measures) {
      const mLabel = localName(measure);

      if (!getBool(measure, IS_APPROPRIATE)) {
        warnings.push({ shape: 'MeasureQualityShape', focusNode: mLabel, severity: 'sh:Warning',
          message: `Article 21(1): ${mLabel} — isAppropriate is not set to true` });
      }
      if (!getBool(measure, IS_PROPORTIONATE)) {
        warnings.push({ shape: 'MeasureQualityShape', focusNode: mLabel, severity: 'sh:Warning',
          message: `Article 21(1): ${mLabel} — isProportionate is not set to true` });
      }
      if (!getBool(measure, IS_STATE_OF_ART)) {
        warnings.push({ shape: 'MeasureQualityShape', focusNode: mLabel, severity: 'sh:Warning',
          message: `Article 21(1): ${mLabel} — isStateOfTheArt is not set to true` });
      }
      if (getValues(measure, MEASURE_DESC).length === 0) {
        info.push(`ℹ ${mLabel}: no measureDescription (best practice)`);
      } else {
        info.push(`✓ ${mLabel}: measure quality properties validated`);
      }
    }

    // -----------------------------------------------------------------------
    // Shape 3: RiskLevelShape — sh:targetClass :CybersecurityRisk
    // -----------------------------------------------------------------------
    const RISK_LEVEL = BASE_URI + 'riskLevel';
    const VALID_LEVELS = new Set(['low', 'medium', 'high', 'critical']);

    const risks = Array.from(typeMap.entries())
      .filter(([, t]) => t.has('CybersecurityRisk'))
      .map(([uri]) => uri);

    for (const risk of risks) {
      const rLabel = localName(risk);
      const levels = getValues(risk, RISK_LEVEL);

      if (levels.length === 0) {
        violations.push({ shape: 'RiskLevelShape', focusNode: rLabel, severity: 'sh:Violation',
          message: `${rLabel}: riskLevel is missing (must be one of: low, medium, high, critical)` });
      } else if (levels.length > 1) {
        violations.push({ shape: 'RiskLevelShape', focusNode: rLabel, severity: 'sh:Violation',
          message: `${rLabel}: riskLevel must have exactly one value, found ${levels.length}` });
      } else if (!VALID_LEVELS.has(levels[0].value)) {
        violations.push({ shape: 'RiskLevelShape', focusNode: rLabel, severity: 'sh:Violation',
          message: `${rLabel}: riskLevel "${levels[0].value}" is not valid (must be: low, medium, high, critical)` });
      } else {
        info.push(`✓ ${rLabel}: riskLevel "${levels[0].value}" is valid`);
      }
    }

    res.json({
      conforms: violations.length === 0,
      shapesGraph: 'https://w3id.org/nis2/article21/shacl',
      shapesFile: 'nis2_article21_compliance.shacl.ttl',
      violations,
      warnings,
      info,
      summary: {
        entitiesChecked: entities.length,
        measuresChecked: measures.length,
        risksChecked: risks.length,
        totalViolations: violations.length,
        totalWarnings: warnings.length,
      },
    });
  } catch (err) {
    console.error('Error in /api/shacl:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// POST /api/check-entity  — check compliance of a real (user-supplied) entity
// Body: { entityName, entityType, implementedMeasures[] }
// Does NOT modify the ontology file — pure in-memory reasoning
// ---------------------------------------------------------------------------

app.use(express.json());

app.post('/api/check-entity', async (req, res) => {
  try {
    const { entityName, entityType, implementedMeasures } = req.body;

    if (!entityName || typeof entityName !== 'string' || !entityName.trim()) {
      return res.status(400).json({ error: 'entityName is required' });
    }
    if (!['EssentialEntity', 'ImportantEntity'].includes(entityType)) {
      return res.status(400).json({ error: 'entityType must be EssentialEntity or ImportantEntity' });
    }
    if (!Array.isArray(implementedMeasures)) {
      return res.status(400).json({ error: 'implementedMeasures must be an array' });
    }

    const name = entityName.trim();
    const provided = new Set(implementedMeasures.filter(m => REQUIRED_MEASURES.includes(m)));
    const missing = REQUIRED_MEASURES.filter(m => !provided.has(m));
    const compliant = missing.length === 0;

    // Property chain inference: usesStandard = implementsMeasure ∘ basedOnStandard
    // Use the cached store to look up which standard each measure is based on
    const { quads } = await getCachedQuads();
    const measureStandards = new Map();
    for (const q of quads) {
      if (termValue(q.predicate) === BASE_URI + 'basedOnStandard') {
        const measureLocal = localName(termValue(q.subject));
        const std = localName(termValue(q.object));
        if (!measureStandards.has(measureLocal)) measureStandards.set(measureLocal, new Set());
        measureStandards.get(measureLocal).add(std);
      }
    }

    const standardsUsed = new Set();
    const standardsDetail = [];
    for (const m of provided) {
      const stds = measureStandards.get(`Example${m}`) || measureStandards.get(m) || new Set();
      for (const std of stds) {
        if (!standardsUsed.has(std)) {
          standardsUsed.add(std);
          standardsDetail.push({ standard: std, via: m });
        }
      }
    }

    // Risk coverage: which risks does this entity's measures address?
    const measureRisks = new Map();
    for (const q of quads) {
      if (termValue(q.predicate) === BASE_URI + 'addressesRisk') {
        const mLocal = localName(termValue(q.subject));
        const risk = localName(termValue(q.object));
        if (!measureRisks.has(mLocal)) measureRisks.set(mLocal, new Set());
        measureRisks.get(mLocal).add(risk);
      }
    }

    const risksAddressed = new Set();
    for (const m of provided) {
      const risks = measureRisks.get(`Example${m}`) || measureRisks.get(m) || new Set();
      for (const r of risks) risksAddressed.add(r);
    }

    // Compliance score
    const score = Math.round((provided.size / REQUIRED_MEASURES.length) * 100);

    res.json({
      entityName: name,
      entityType,
      compliant,
      complianceScore: score,
      implementedCount: provided.size,
      totalRequired: REQUIRED_MEASURES.length,
      implementedMeasures: Array.from(provided),
      missingMeasures: missing,
      inferredClass: compliant ? 'CompliantEntity' : 'NonCompliantEntity',
      inferredStandards: standardsDetail,
      risksAddressed: Array.from(risksAddressed),
      legalBasis: 'Directive (EU) 2022/2555, Article 21(2)',
    });
  } catch (err) {
    console.error('Error in /api/check-entity:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`NIS2 Ontology server running at http://localhost:${PORT}`);
});
