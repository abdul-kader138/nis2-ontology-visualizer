# NIS2 Article 21 — OWL-Based Ontology for Automated Validation and Reasoning

This ontology represents Article 21 of Directive (EU) 2022/2555 (NIS2 Directive) concerning
cybersecurity risk-management measures that essential and important entities must implement.

It supports **automated compliance validation** and **OWL 2 DL reasoning** — a reasoner such as
HermiT or Pellet will automatically classify entities as `CompliantEntity` or not based on which
of the 12 mandatory measures they implement.

## Overview

Article 21 of the NIS2 Directive mandates that essential and important entities implement
appropriate and proportionate technical, operational, and organizational measures to manage risks
to the security of network and information systems. These measures must:

- Be in line with **state-of-the-art** practices
- Be **based on** relevant European and international standards
- **Prevent or minimize** the impact of incidents on service recipients and other services

## Ontology Structure

### Classes

#### Entity Types

| Class | Description |
|-------|-------------|
| `Entity` | Base class for essential or important entities (Article 3) |
| `EssentialEntity` | Essential entities as defined in Article 3(1) |
| `ImportantEntity` | Important entities as defined in Article 3(2) |
| `CompliantEntity` | **OWL 2 DL inferred class** — entities implementing all 12 Article 21(2) measures |

> `EssentialEntity` and `ImportantEntity` are declared `owl:disjointWith` each other.

#### Risk Management Measures

| Class | Type |
|-------|------|
| `RiskManagementMeasure` | Abstract base class |
| `TechnicalMeasure` | Technical measures |
| `OperationalMeasure` | Operational measures |
| `OrganizationalMeasure` | Organizational measures |

The three measure categories are declared `owl:AllDisjointClasses`.

#### Article 21(2) Mandatory Measures

All 12 measures are modelled as OWL classes and referenced in the `CompliantEntity` equivalentClass
restriction so a reasoner can infer compliance automatically.

| # | Class | Article Ref | Category |
|---|-------|-------------|----------|
| a | `RiskAnalysisPolicy` | Art. 21(2)(a) | Organizational |
| b | `IncidentHandling` | Art. 21(2)(b) | Operational |
| c | `BusinessContinuityManagement` | Art. 21(2)(c) | Operational |
| d | `SupplyChainSecurity` | Art. 21(2)(d) | Organizational |
| e | `SecureDevelopment` | Art. 21(2)(e) | Technical |
| f | `EffectivenessAssessment` | Art. 21(2)(f) | Organizational |
| g | `BasicCyberHygiene` | Art. 21(2)(g) | Operational |
| h | `TrainingAwareness` | Art. 21(2)(h) | Organizational |
| i | `HumanResourcesSecurity` | Art. 21(2)(i) | Organizational |
| j | `Encryption` | Art. 21(2)(j) | Technical |
| k | `MultiFactorAuthentication` | Art. 21(2)(k) | Technical |
| l | `SecureCommunications` | Art. 21(2)(l) | Technical |

#### Supporting Classes

- `CybersecurityRisk` — risk to the security of network and information systems
- `SecurityIncident` — any event with an adverse effect on the security of NIS (Article 6(6))
- `NetworkInformationSystem` — as defined in Article 6(1)
- `SecurityStandard` — European or international security standard

### Object Properties

| Property | Domain | Range | Notes |
|----------|--------|-------|-------|
| `implementsMeasure` | `Entity` | `RiskManagementMeasure` | Core compliance relation |
| `isImplementedBy` | `RiskManagementMeasure` | `Entity` | `owl:inverseOf implementsMeasure` |
| `addressesRisk` | `RiskManagementMeasure` | `CybersecurityRisk` | |
| `preventsIncident` | `RiskManagementMeasure` | `SecurityIncident` | |
| `minimizesImpact` | `RiskManagementMeasure` | `SecurityIncident` | |
| `basedOnStandard` | `RiskManagementMeasure` | `SecurityStandard` | |
| `appliesToSystem` | `RiskManagementMeasure` | `NetworkInformationSystem` | |
| `hasSubMeasure` | `RiskManagementMeasure` | `RiskManagementMeasure` | `owl:TransitiveProperty` |

### Data Properties

| Property | Domain | Range | Notes |
|----------|--------|-------|-------|
| `isProportionate` | `RiskManagementMeasure` | `xsd:boolean` | `owl:FunctionalProperty` |
| `isAppropriate` | `RiskManagementMeasure` | `xsd:boolean` | `owl:FunctionalProperty` |
| `isStateOfTheArt` | `RiskManagementMeasure` | `xsd:boolean` | `owl:FunctionalProperty` |
| `measureDescription` | `RiskManagementMeasure` | `xsd:string` | |
| `riskLevel` | `CybersecurityRisk` | `xsd:string` | `owl:FunctionalProperty` |

## OWL 2 DL Reasoning

The key feature is the `CompliantEntity` **equivalent class definition**:

```turtle
:CompliantEntity owl:equivalentClass [
    owl:intersectionOf (
        :Entity
        [ owl:onProperty :implementsMeasure ; owl:someValuesFrom :RiskAnalysisPolicy ]
        [ owl:onProperty :implementsMeasure ; owl:someValuesFrom :IncidentHandling ]
        # ... all 12 Article 21(2) measures
    )
] .
```

Any `Entity` individual that implements at least one instance of each of the 12 mandatory measures
will be **automatically inferred** as a `CompliantEntity` by a DL reasoner.

### To run full OWL 2 DL reasoning

1. Open `nis2_article21_cybersecurity.owl` in **Protégé 5.x**
2. Select **Reasoner → HermiT** (or Pellet)
3. Click **Start Reasoner**
4. `ExampleCompliantEntity` will appear under `CompliantEntity` in the inferred hierarchy
5. `ExampleNonCompliantEntity` will remain unclassified as compliant

## Files

| File | Description |
|------|-------------|
| `nis2_article21_cybersecurity.owl` | OWL 2 ontology in RDF/XML format |
| `nis2_article21_cybersecurity.ttl` | OWL 2 ontology in Turtle format (more readable) |
| `server.js` | Node.js/Express backend — REST APIs for visualisation, validation, SPARQL, and reasoning |
| `public/index.html` | Interactive web application |

## Web Application

Start the application:

```bash
npm install
node server.js
# open http://localhost:3000
```

### API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/ontology` | Graph data for interactive vis-network visualisation |
| `GET /api/validate` | Article 21 compliance structural validation report |
| `GET /api/sparql?query=…` | Real SPARQL 1.1 SELECT engine (sparqljs + N3 Store) |
| `GET /api/reason` | OWL 2 DL compliance inference — classifies entities as compliant or not |

### SPARQL Examples

```sparql
# All classes
PREFIX owl: <http://www.w3.org/2002/07/owl#>
SELECT * WHERE { ?s rdf:type owl:Class }

# Entities and their implemented measures
PREFIX : <http://www.semanticweb.org/nis2/article21#>
SELECT ?entity ?measure WHERE {
    ?entity rdf:type :EssentialEntity .
    ?entity :implementsMeasure ?measure
}
```

## Standards Referenced

| Standard | Purpose |
|----------|---------|
| ISO/IEC 27001 | Information security management systems |
| ISO/IEC 27002 | Information security controls |
| NIST Cybersecurity Framework (CSF 2.0) | Risk management framework |
| ENISA Guidelines | EU cybersecurity agency guidance |
| CIS Controls v8 | Prioritised cyber defence controls |

## Example Usage (Turtle)

```turtle
# A fully compliant essential entity
:MyEssentialEntity a :EssentialEntity ;
    :implementsMeasure :MyRiskAnalysisPolicy ;
    :implementsMeasure :MyIncidentHandling ;
    :implementsMeasure :MyBusinessContinuity ;
    :implementsMeasure :MySupplyChainSecurity ;
    :implementsMeasure :MySecureDevelopment ;
    :implementsMeasure :MyEffectivenessAssessment ;
    :implementsMeasure :MyBasicCyberHygiene ;
    :implementsMeasure :MyTrainingAwareness ;
    :implementsMeasure :MyHumanResourcesSecurity ;
    :implementsMeasure :MyEncryption ;
    :implementsMeasure :MyMFA ;
    :implementsMeasure :MySecureCommunications .
# → A reasoner will infer :MyEssentialEntity rdf:type :CompliantEntity
```

## Legal Reference

Directive (EU) 2022/2555 of the European Parliament and of the Council of 14 December 2022 on
measures for a high common level of cybersecurity across the Union (NIS2 Directive)

Official Journal: OJ L 333, 27.12.2022, p. 80–152

## License

This ontology is provided for educational and research purposes.
Please refer to the original directive for authoritative legal information.
