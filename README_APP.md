# NIS2 Article 21 Ontology Visualizer

A Node.js web application for visualizing and validating the NIS2 Article 21 Cybersecurity Risk‑Management Measures Ontology.

## Features

- **Interactive Graph Visualization**: Explore the ontology structure as an interactive network graph (classes + example instances).
- **Multiple Layout Options**: Switch between hierarchical and organic layouts to view the Article 21 measure hierarchy from different perspectives.
- **Category Filtering**: Filter nodes by category (Entities, Measures, Supporting Classes) to reduce visual clutter.
- **Node Information Panel**: Click any node to see its label, type, category, ID, and a short description (from labels/comments/properties).
- **Statistics Bar**: Live counts of **Nodes**, **Relationships**, and **distinct Types (Classes)** for the currently visible subgraph.
- **Ontology Validation Report**: Run a built‑in validator against the ontology (syntax, required Article 21 measures, orphaned nodes, class hierarchy issues).
- **Article 21 Measure Coverage**: Checks for all 12 measures (10 core + Multi‑Factor Authentication + Secure Communications).
- **UI Measure Toggle (Simulation)**: Enable/disable measures from the UI to see how compliance and validation change without modifying the OWL/TTL files.
- **Performance Optimizations**: In‑memory caching (60s TTL) to avoid re‑parsing the ontology on every request.
- **SPARQL Query Endpoint**: Basic SPARQL query support for programmatic access to ontology data.
- **OWL Reasoning / SHACL Validation Stub**: Endpoint ready for integration with external reasoners or SHACL engines.
- **Robust RDF Parsing**: Handles both N3 (Turtle) and RDF.js (RDF/XML) quad formats with unified term extraction.
- **Responsive Design**: Modern, user‑friendly interface that works well on large and small screens.

## Data Source

- **Primary**: `nis2_article21_cybersecurity.owl` (RDF/XML OWL ontology)
- **Alternative (fallback)**: `nis2_article21_cybersecurity.ttl` (Turtle), used only if the OWL file is not found.

The OWL file is the main source of truth (authored in Protégé). The server parses OWL/TTL into RDF quads and exposes them as JSON for visualization and validation.

## Installation

1. Install Node.js (v16 or higher recommended).

2. Install dependencies:

```bash
npm install
```

## Running the Application

1. Start the server:

```bash
npm start
```

Or for development with auto‑reload:

```bash
npm run dev
```

2. Open your browser and navigate to:

```text
http://localhost:3000
```

## Project Structure

```text
.
├── server.js                           # Express server, OWL/TTL parsing, validation logic
├── package.json                        # Node.js dependencies and scripts
├── public/
│   └── index.html                      # Frontend visualization and validation UI
├── nis2_article21_cybersecurity.owl    # OWL ontology in RDF/XML (primary source)
├── nis2_article21_cybersecurity.ttl    # Ontology in Turtle (optional / fallback)
└── README_APP.md                       # This file
```

## API Endpoints

### `GET /api/ontology`

Parses the ontology and returns a graph‑friendly JSON structure:

- `nodes`: array of ontology nodes (classes and instances), including:
  - `id`: full IRI
  - `label`: human‑readable label
  - `type`: OWL class/type (e.g. `RiskAnalysisPolicy`, `Encryption`)
  - `category`: high‑level category (`entity`, `measure`, `supporting`)
  - `properties`: data properties (e.g. `measureDescription`, `isAppropriate`)
  - `tooltip`: pre‑built text used in node tooltips
- `edges`: array of relationships between nodes, including:
  - `from` / `to`: source and target IRIs
  - `label`: relation name (e.g. `rdfs:subClassOf`, `basedOnStandard`)
  - `type`: `inheritance` or `property`
  - `dashes`: `true` for ontology object properties (non‑inheritance)

This endpoint drives the main network visualization.

### `GET /api/validate`

Runs a set of structural checks and returns a validation report:

- `valid`: overall boolean status
- `errors`: critical issues (e.g. RDF syntax errors)
- `warnings`: non‑fatal issues (e.g. missing measures, orphaned nodes)
- `info`: human‑readable summary messages
- `statistics`:
  - `totalQuads`: total RDF triples parsed
  - `totalNodes`: total distinct resources
  - `totalClasses`: number of OWL classes
  - `totalProperties`: number of object + data properties
  - `totalInstances`: number of instances/individuals
  - `totalEdges`: number of subclass and property edges
  - `requiredMeasuresFound` / `requiredMeasuresTotal`: Article 21 measure coverage

The frontend renders this as a rich "Ontology Validation Report" panel.

**Performance Note**: Results are cached for 60 seconds to improve response times on repeated requests.

### `GET /api/sparql`

Basic SPARQL query endpoint for programmatic access to the ontology:

- **Query Parameter**: `query` (URL-encoded SPARQL query string)
- **Supported**: `SELECT * WHERE { ?s ?p ?o }` (returns all triples)
- **Response Format**: SPARQL JSON results format:
  ```json
  {
    "head": { "vars": ["s", "p", "o"] },
    "results": { "bindings": [...] }
  }
  ```
- **Limitations**: Currently supports only the basic `SELECT * WHERE { ?s ?p ?o }` pattern. For full SPARQL 1.1 support, integrate a SPARQL engine (e.g., [Comunica](https://comunica.dev/)).

**Example**:
```bash
curl "http://localhost:3000/api/sparql?query=SELECT%20*%20WHERE%20{%20?s%20?p%20?o%20}"
```

### `GET /api/reason`

Stub endpoint for OWL reasoning and SHACL validation:

- **Purpose**: Placeholder for future integration with OWL reasoners (e.g., HermiT, Pellet) or SHACL validation engines.
- **Response**: Returns a JSON message indicating that reasoning/SHACL validation is not yet implemented, along with basic statistics about the ontology.
- **Future Integration**: This endpoint can be extended to call external reasoning services or embed a JavaScript-based reasoner.

**Example Response**:
```json
{
  "supported": false,
  "message": "OWL reasoning / SHACL validation is not implemented...",
  "statisticsHint": {
    "totalQuads": 217
  }
}
```

## Usage

1. **View the Graph**
   - The ontology is automatically loaded from the OWL file and displayed as a network graph.

2. **Navigate**
   - Drag nodes to reposition them.
   - Scroll to zoom in/out.
   - Click and drag on empty space to pan the view.

3. **Layout Options**
   - **Hierarchical Layout**: Organizes nodes in a top‑down tree based on `rdfs:subClassOf` relations (useful to see the Article 21 measure hierarchy).
   - **Organic Layout**: Uses a force‑directed physics simulation for a more natural cluster view.

4. **Filter by Category**
   - Use the dropdown (`All`, `Entities`, `Measures`, `Supporting Classes`) to filter which node categories are visible.

5. **Node Information**
   - Click any node to open the side panel with:
     - Label, type, category, short local ID
     - Description (label/comment/properties overview)

6. **Validation**
   - Click **“Validate Ontology”** to open the validation panel.
   - Review RDF triple counts, class/property/instance counts, and Article 21 measure coverage.
   - Inspect any warnings (e.g. missing measures, orphaned nodes, hierarchy issues).

7. **Measure Toggle (Simulation Mode)**
   - Click **“Toggle Measures”** to open the measure toggle panel.
   - Enable/disable individual Article 21 measures (e.g. disable MFA) to see how compliance indicators change.
   - This only affects the UI and validation display; **the OWL/TTL files are never modified**.

## Performance & Production Features

- **In-Memory Caching**: Parsed ontology quads are cached for 60 seconds, reducing parse overhead on repeated API calls.
- **Robust Quad Handling**: Unified term extraction that works with both N3 (Turtle) and RDF.js (RDF/XML) quad formats, ensuring reliable parsing regardless of input format.
- **Error Handling**: Comprehensive error handling for malformed RDF, missing files, and parsing failures.
- **Production-Ready Architecture**: Modular design with clear separation between parsing, caching, validation, and API endpoints.

## Technologies Used

- **Node.js**: Server runtime
- **Express**: Web framework
- **N3**: RDF/Turtle parser
- **rdf-parse**: Generic RDF parser used for RDF/XML OWL files
- **get-stream**: Stream utilities for RDF parsing
- **vis-network**: Graph visualization library
- **HTML/CSS/JavaScript**: Frontend UI

## Troubleshooting

- **Port already in use**: Change the `PORT` in `server.js` (default: `3000`).
- **Ontology not loading**:
  - Ensure `nis2_article21_cybersecurity.owl` is in the project root (or the TTL fallback).
  - Check the browser console (`F12`) and server logs for parse errors.
- **Validation shows syntax errors**: Open the OWL/TTL file in Protégé and run its built‑in reasoner/validator, then re‑export.
- **Dependencies issues**: Delete `node_modules`, run `npm install` again.

## License

MIT

