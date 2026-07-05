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
  florenceBlue: '#00527C',
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
  doc.rect(0, H - 30, W, 30).fill(C.florenceBlue);
  doc.moveTo(M, 28).lineTo(W - M, 28).lineWidth(0.9).strokeColor(C.line).stroke();
  doc.restore();
}

function footer(doc, idx, total) {
  doc.font('Helvetica').fontSize(11).fillColor('#FFFFFF');
  doc.text('Abdul Kader  |  NIS2 Article 21 compliance framework', M, H - 21, { width: 900 });
  doc.font('Helvetica-Bold').fontSize(13).fillColor('#FFFFFF');
  doc.text(`${idx}`, W - M - 42, H - 23, { width: 42, align: 'right' });
}

function slideHeader(doc, title, subtitle = '') {
  doc.font('Helvetica').fontSize(11).fillColor(C.muted).text("MASTER'S THESIS PRESENTATION", M, 36, {
    letterSpacing: 1.2,
  });
  doc.font('Helvetica-Bold').fontSize(44).fillColor(C.text).text(title, M, 58);
  if (subtitle) {
    doc.font('Helvetica').fontSize(20).fillColor(C.muted).text(subtitle, M, 110);
  }
  doc.save();
  doc.moveTo(M, 142).lineTo(M + 230, 142).lineWidth(2).strokeColor(C.florenceBlue).stroke();
  doc.moveTo(M + 230, 142).lineTo(W - M, 142).lineWidth(0.9).strokeColor(C.line).stroke();
  doc.restore();
}

function paragraph(doc, text, x, y, w, size = 13, color = C.text) {
  const actualSize = Math.max(size + 3, 23);
  doc.font('Helvetica').fontSize(actualSize).fillColor(color).text(text, x, y, {
    width: w,
    lineGap: 4,
  });
}

function bullets(doc, items, x, y, w, size = 13, gap = 12) {
  let cy = y;
  const actualSize = Math.max(size + 3, 23);
  for (const item of items) {
    doc.font('Helvetica-Bold').fontSize(actualSize).fillColor(C.accent).text('•', x, cy);
    doc.font('Helvetica').fontSize(actualSize).fillColor(C.text).text(item, x + 16, cy, {
      width: w - 16,
      lineGap: 4,
    });
    cy += doc.heightOfString(item, { width: w - 16, lineGap: 4 }) + gap;
  }
}

function compactBullets(doc, items, x, y, w, size = 13, gap = 7) {
  let cy = y;
  for (const item of items) {
    doc.font('Helvetica-Bold').fontSize(size).fillColor(C.accent).text('•', x, cy);
    doc.font('Helvetica').fontSize(size).fillColor(C.text).text(item, x + 13, cy, {
      width: w - 13,
      lineGap: 2,
    });
    cy += doc.heightOfString(item, { width: w - 13, lineGap: 2 }) + gap;
  }
}

function codeBlock(doc, lines, x, y, w, title = '') {
  const lineH = 16;
  const pad = 14;
  const titleH = title ? 22 : 0;
  const h = pad * 2 + titleH + lines.length * lineH;
  doc.save();
  doc.rect(x, y, w, h).fill('#F8FAFC').stroke(C.line);
  if (title) {
    doc.font('Helvetica-Bold').fontSize(12).fillColor(C.text).text(title, x + pad, y + 10, { width: w - pad * 2 });
  }
  let cy = y + pad + titleH;
  for (const line of lines) {
    doc.font('Courier').fontSize(11.4).fillColor(C.navy).text(line, x + pad, cy, {
      width: w - pad * 2,
      continued: false,
    });
    cy += lineH;
  }
  doc.restore();
  return h;
}

function imageBox(doc, imagePath, x, y, w, h, caption = '') {
  doc.save();
  doc.rect(x, y, w, h).fill('#FFFFFF');
  const captionH = caption ? 22 : 0;
  if (fs.existsSync(imagePath)) {
    doc.image(imagePath, x + 8, y + 8, { fit: [w - 16, h - captionH - 18], align: 'center', valign: 'center' });
  } else {
    doc.font('Helvetica').fontSize(12).fillColor(C.red).text('Missing image', x + 20, y + 20);
  }
  doc.rect(x, y, w, h).lineWidth(1).stroke(C.line);
  if (caption) {
    doc.rect(x + 1, y + h - captionH - 1, w - 2, captionH).fill('#FFFFFF');
    doc.font('Helvetica-Oblique').fontSize(8.8).fillColor(C.muted).text(caption, x + 10, y + h - captionH + 4, {
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
    doc.font('Helvetica-Bold').fontSize(16).fillColor(C.text).text(title, x + 18, y + 18);
  }
  if (contentFn) contentFn(x, y, w, h);
  doc.restore();
}

function measureTile(doc, idx, text, x, y, w, h, color) {
  doc.save();
  doc.rect(x, y, w, h).fill('#FFFFFF').stroke(C.line);
  doc.rect(x, y, 52, h).fill(color);
  doc.font('Helvetica-Bold').fontSize(20).fillColor('#FFFFFF').text(String(idx), x, y + 17, {
    width: 52,
    align: 'center',
  });
  doc.font('Helvetica-Bold').fontSize(12.8).fillColor(C.text).text(text, x + 68, y + 10, {
    width: w - 86,
    lineGap: 1.8,
  });
  doc.restore();
}

function ontologyNode(doc, x, y, w, h, label, color) {
  doc.save();
  doc.roundedRect(x, y, w, h, 8).fill('#FFFFFF').stroke(color);
  doc.lineWidth(2).strokeColor(color).roundedRect(x, y, w, h, 8).stroke();
  doc.font('Helvetica-Bold').fontSize(13).fillColor(C.text).text(label, x + 12, y + 14, {
    width: w - 24,
    align: 'center',
    lineGap: 2,
  });
  doc.restore();
}

function processStep(doc, x, y, w, h, title, subtitle, color) {
  doc.save();
  doc.roundedRect(x, y, w, h, 10).fill(color);
  doc.font('Helvetica-Bold').fontSize(17).fillColor('#FFFFFF').text(title, x + 16, y + 19, {
    width: w - 32,
    align: 'center',
  });
  doc.font('Helvetica-Bold').fontSize(14).fillColor('#FFFFFF').text(subtitle, x + 16, y + 44, {
    width: w - 32,
    align: 'center',
  });
  doc.restore();
}

function arrow(doc, x1, y1, x2, y2) {
  doc.save();
  doc.lineWidth(3).strokeColor('#94A3B8').moveTo(x1, y1).lineTo(x2, y2).stroke();
  doc.polygon([x2, y2], [x2 - 13, y2 - 8], [x2 - 13, y2 + 8]).fill('#94A3B8');
  doc.restore();
}

function outlineChip(doc, x, y, w, text, color) {
  doc.save();
  doc.roundedRect(x, y, w, 38, 7).fill('#FFFFFF');
  doc.lineWidth(2).strokeColor(color).roundedRect(x, y, w, 38, 7).stroke();
  doc.font('Helvetica-Bold').fontSize(13).fillColor(C.text).text(text, x + 14, y + 12, {
    width: w - 28,
  });
  doc.restore();
}

function architectureLayer(doc, x, y, w, h, color, title, lines) {
  doc.save();
  doc.roundedRect(x, y, w, h, 8).fill('#FFFFFF');
  doc.lineWidth(2).strokeColor(color).roundedRect(x, y, w, h, 8).stroke();
  doc.rect(x, y, 10, h).fill(color);
  doc.font('Helvetica-Bold').fontSize(19).fillColor(C.text).text(title, x + 22, y + 44, {
    width: w - 36,
    align: 'center',
  });
  doc.restore();
}

function verdictCell(doc, x, y, w, label, color) {
  doc.save();
  doc.roundedRect(x, y + 7, w, 19, 5).fill(color);
  doc.font('Helvetica-Bold').fontSize(8.6).fillColor('#FFFFFF').text(label, x + 4, y + 12, {
    width: w - 8,
    align: 'center',
  });
  doc.restore();
}

function complianceTable(doc, x, y, w, h) {
  const rows = [
    ['(a)', 'Risk analysis policies', 'Implemented', 'COMPLIANT', C.green],
    ['(b)', 'Incident handling', 'Implemented', 'COMPLIANT', C.green],
    ['(c)', 'Business continuity', 'No measure asserted', 'VIOLATION', C.red],
    ['(d)', 'Supply-chain security', 'No measure asserted', 'VIOLATION', C.red],
    ['(e)', 'Acquisition and development', 'No measure asserted', 'VIOLATION', C.red],
    ['(f)', 'Effectiveness assessment', 'No measure asserted', 'VIOLATION', C.red],
    ['(g)', 'Cyber hygiene and training', 'Training awareness', 'COMPLIANT', C.green],
    ['(h)', 'Cryptography and encryption', 'Encryption implemented', 'COMPLIANT', C.green],
    ['(i)', 'HR, access, and assets', 'No measure asserted', 'VIOLATION', C.red],
    ['(j)', 'MFA and secure comms', 'MFA only; secure comms missing', 'PARTIAL', C.amber],
  ];
  const cols = [44, 216, 238, 96];
  const startX = x + 22;
  let cy = y + 76;

  doc.save();
  doc.rect(x, y, w, h).fill('#FFFFFF').stroke(C.line);
  doc.font('Helvetica-Bold').fontSize(22).fillColor(C.text).text('Partial healthcare case', x + 22, y + 24);
  doc.font('Helvetica').fontSize(12.5).fillColor(C.muted).text(
    'Representative validation result: implemented measures are matched against Article 21 categories.',
    x + 22,
    y + 52,
    { width: w - 44 }
  );

  doc.rect(startX, cy, w - 44, 30).fill('#F1F5F9');
  const headers = ['Art.', 'Requirement category', 'Evidence state', 'Verdict'];
  let hx = startX;
  for (let i = 0; i < headers.length; i += 1) {
    doc.font('Helvetica-Bold').fontSize(10.5).fillColor(C.text).text(headers[i], hx + 7, cy + 9, {
      width: cols[i] - 14,
    });
    hx += cols[i];
  }
  cy += 30;

  for (const [art, category, evidence, verdict, color] of rows) {
    doc.rect(startX, cy, w - 44, 34).fill(rows.indexOf(rows.find((r) => r[0] === art)) % 2 === 0 ? '#FFFFFF' : '#F8FAFC');
    doc.rect(startX, cy, w - 44, 34).stroke(C.line);
    doc.font('Helvetica-Bold').fontSize(9.8).fillColor(C.text).text(art, startX + 7, cy + 11, { width: cols[0] - 14 });
    doc.font('Helvetica').fontSize(9.8).fillColor(C.text).text(category, startX + cols[0] + 7, cy + 8, {
      width: cols[1] - 14,
      lineGap: 1,
    });
    doc.font('Helvetica').fontSize(9.6).fillColor(C.text).text(evidence, startX + cols[0] + cols[1] + 7, cy + 8, {
      width: cols[2] - 14,
      lineGap: 1,
    });
    verdictCell(doc, startX + cols[0] + cols[1] + cols[2] + 6, cy, cols[3] - 12, verdict, color);
    cy += 34;
  }

  doc.font('Helvetica-Oblique').fontSize(8.8).fillColor(C.muted).text(
    'Worked example from the thesis showing the partial healthcare case and verdicts',
    x + 10,
    y + h - 24,
    { width: w - 20, align: 'center' }
  );
  doc.restore();
}

function comparisonTable(doc, x, y, w, h) {
  const rows = [
    ['This thesis', 'Yes', 'Yes', 'Yes', 'Yes', 'Yes'],
    ['Commercial GRC tools', 'No', 'No', 'No', 'No', 'No'],
    ['Manual checklist', 'No', 'No', 'No', 'No', 'Yes'],
  ];
  const availableW = w - 56;
  const baseCols = [190, 112, 96, 80, 80, 82];
  const scale = Math.min(1, availableW / baseCols.reduce((sum, col) => sum + col, 0));
  const cols = baseCols.map((col) => Math.floor(col * scale));
  const startX = x + 28;
  let cy = y + 118;

  doc.save();
  doc.rect(x, y, w, h).fill('#FFFFFF').stroke(C.line);
  doc.font('Helvetica-Bold').fontSize(24).fillColor(C.text).text('Comparison with existing approaches', x + 28, y + 72);
  doc.font('Helvetica').fontSize(13).fillColor(C.muted).text(
    'The thesis combines semantics, reasoning, SPARQL, and SHACL in one demonstrator.',
    x + 28,
    y + 100,
    { width: w - 56 }
  );

  doc.rect(startX, cy, w - 56, 38).fill('#F1F5F9');
  const headers = ['Approach', 'Formal semantics', 'Auto reasoning', 'SPARQL', 'SHACL', 'Open source'];
  let hx = startX;
  for (let i = 0; i < headers.length; i += 1) {
    doc.font('Helvetica-Bold').fontSize(9.4 * scale).fillColor(C.text).text(headers[i], hx + 6, cy + 8, {
      width: cols[i] - 12,
      lineGap: 1,
    });
    hx += cols[i];
  }
  cy += 38;

  rows.forEach((row, rowIndex) => {
    doc.rect(startX, cy, w - 56, 42).fill(rowIndex % 2 === 0 ? '#FFFFFF' : '#F8FAFC').stroke(C.line);
    let rx = startX;
    row.forEach((cell, i) => {
      const isYes = cell === 'Yes';
      doc.font(i === 0 ? 'Helvetica-Bold' : 'Helvetica').fontSize(10.8 * scale).fillColor(isYes ? C.green : cell === 'No' ? C.red : C.text).text(cell, rx + 6, cy + 14, {
        width: cols[i] - 12,
        align: i === 0 ? 'left' : 'center',
      });
      rx += cols[i];
    });
    cy += 42;
  });

  doc.font('Helvetica-Oblique').fontSize(8.8).fillColor(C.muted).text(
    'Comparison from the thesis: OWL + SHACL + SPARQL in one demonstrator',
    x + 10,
    y + h - 24,
    { width: w - 20, align: 'center' }
  );
  doc.restore();
}

function standardChip(doc, x, y, w, label) {
  doc.save();
  doc.roundedRect(x, y, w, 30, 5).fill('#F3E8FF');
  doc.lineWidth(1).strokeColor('#C4B5FD').roundedRect(x, y, w, 30, 5).stroke();
  doc.font('Helvetica-Bold').fontSize(10.5).fillColor('#6D28D9').text(label, x + 8, y + 10, {
    width: w - 16,
    align: 'center',
  });
  doc.restore();
}

function reasoningOutputPanel(doc, x, y, w, h) {
  doc.save();
  doc.rect(x, y, w, h).fill('#FFFFFF').stroke(C.line);
  doc.font('Helvetica-Bold').fontSize(21).fillColor(C.text).text('Structural reasoning result', x + 22, y + 24);
  doc.font('Helvetica').fontSize(12).fillColor(C.muted).text(
    'Classification, missing operational classes, and inferred standards.',
    x + 22,
    y + 53,
    { width: w - 44 }
  );

  doc.roundedRect(x + 22, y + 92, w - 44, 42, 6).fill('#DCFCE7');
  doc.font('Helvetica-Bold').fontSize(12).fillColor(C.green).text('PASS', x + 38, y + 106, { width: 54 });
  doc.font('Helvetica-Bold').fontSize(12).fillColor(C.text).text('ExampleCompliantEntity', x + 100, y + 100);
  doc.font('Helvetica').fontSize(10.2).fillColor(C.text).text('12 / 12 operational classes -> CompliantEntity', x + 100, y + 116);

  doc.roundedRect(x + 22, y + 148, w - 44, 42, 6).fill('#FEF3C7');
  doc.font('Helvetica-Bold').fontSize(12).fillColor(C.amber).text('GAP', x + 38, y + 162, { width: 54 });
  doc.font('Helvetica-Bold').fontSize(12).fillColor(C.text).text('ExampleNonCompliantEntity', x + 100, y + 156);
  doc.font('Helvetica').fontSize(10.2).fillColor(C.text).text('5 / 12 classes implemented -> gaps reported', x + 100, y + 172);

  doc.font('Helvetica-Bold').fontSize(13).fillColor(C.text).text('Missing operational classes', x + 22, y + 220);
  const missing = [
    'Business continuity',
    'Supply-chain security',
    'Secure development',
    'Effectiveness assessment',
    'HR security',
    'MFA',
    'Secure communications',
  ];
  missing.forEach((label, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const bx = x + 22 + col * 230;
    const by = y + 250 + row * 34;
    doc.roundedRect(bx, by, 208, 25, 5).fill('#FFF7ED');
    doc.lineWidth(1).strokeColor('#FDBA74').roundedRect(bx, by, 208, 25, 5).stroke();
    doc.font('Helvetica').fontSize(9.8).fillColor(C.amber).text(label, bx + 8, by + 8, { width: 192 });
  });

  doc.font('Helvetica-Bold').fontSize(13).fillColor(C.text).text('Standards inferred for the complete entity', x + 22, y + 392);
  ['ISO27001', 'ISO27002', 'NIST', 'ENISA', 'CIS Controls'].forEach((label, i) => {
    standardChip(doc, x + 22 + i * 98, y + 422, 88, label);
  });
  doc.restore();
}

function entityAssessmentPanel(doc, x, y, w, h) {
  doc.save();
  doc.rect(x, y, w, h).fill('#FFFFFF').stroke(C.line);
  doc.font('Helvetica-Bold').fontSize(21).fillColor(C.text).text('Real-time compliance check', x + 22, y + 24);
  doc.font('Helvetica').fontSize(12).fillColor(C.muted).text('Submitted class coverage without modifying the ontology.', x + 22, y + 53);

  doc.roundedRect(x + 22, y + 92, w - 44, 54, 7).fill('#DCFCE7');
  doc.font('Helvetica-Bold').fontSize(24).fillColor(C.green).text('COMPLIANT', x + 22, y + 109, {
    width: w - 44,
    align: 'center',
  });

  const stats = [
    ['Score', '100%'],
    ['Coverage', '12 / 12'],
    ['Class', 'OWL'],
  ];
  stats.forEach(([label, value], i) => {
    const bx = x + 22 + i * 150;
    doc.rect(bx, y + 176, 124, 72).fill('#FFFFFF').stroke(C.line);
    doc.rect(bx, y + 176, 6, 72).fill(i === 0 ? C.green : i === 1 ? '#2563EB' : '#7C3AED');
    doc.font('Helvetica-Bold').fontSize(10).fillColor(C.muted).text(label, bx + 16, y + 192, { width: 92, align: 'center' });
    doc.font('Helvetica-Bold').fontSize(21).fillColor(C.text).text(value, bx + 16, y + 212, { width: 92, align: 'center' });
  });

  doc.font('Helvetica-Bold').fontSize(13).fillColor(C.text).text('Selected operational classes', x + 22, y + 280);
  const selected = ['Risk analysis', 'Incident handling', 'Business continuity', 'Supply chain', 'Secure development', 'Effectiveness', 'Cyber hygiene', 'Training', 'HR security', 'Encryption', 'MFA', 'Secure comms'];
  selected.forEach((label, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const tx = x + 22 + col * 230;
    const ty = y + 310 + row * 22;
    doc.rect(tx, ty + 2, 12, 12).fill(C.green);
    doc.font('Helvetica').fontSize(9.6).fillColor(C.text).text(label, tx + 20, ty, { width: 190 });
  });

  doc.font('Helvetica-Bold').fontSize(13).fillColor(C.text).text('Derived standards', x + 22, y + 452);
  ['ISO27001', 'ISO27002', 'NIST', 'ENISA', 'CIS'].forEach((label, i) => {
    standardChip(doc, x + 132 + i * 78, y + 446, 68, label);
  });
  doc.restore();
}

function sparqlEvidencePanel(doc, x, y, w, h) {
  doc.save();
  doc.rect(x, y, w, h).fill('#FFFFFF').stroke(C.line);
  doc.font('Helvetica-Bold').fontSize(25).fillColor(C.text).text('SPARQL competency query', x + 28, y + 24);
  doc.font('Helvetica').fontSize(15).fillColor(C.muted).text(
    'CQ2: standards associated with the complete example entity.',
    x + 28,
    y + 58,
    { width: w - 56 }
  );

  const codeX = x + 28;
  const codeY = y + 98;
  doc.roundedRect(codeX, codeY, w - 56, 252, 8).fill(C.navy);
  const codeLines = [
    'PREFIX nis2: <https://w3id.org/nis2/article21#>',
    '',
    'SELECT ?entity ?standard',
    'WHERE {',
    '  ?entity a nis2:CompliantEntity .',
    '  ?entity nis2:implementsMeasure ?measure .',
    '  ?measure nis2:basedOnStandard ?standard .',
    '}',
  ];
  codeLines.forEach((line, i) => {
    doc.font('Courier').fontSize(14.2).fillColor(i === 0 ? '#6EE7B7' : '#E5E7EB').text(line, codeX + 24, codeY + 26 + i * 27, {
      width: w - 104,
    });
  });

  doc.font('Helvetica-Bold').fontSize(18).fillColor(C.text).text('Query results', x + 28, y + 378);
  doc.rect(x + 28, y + 412, w - 56, 38).fill('#F1F5F9').stroke(C.line);
  doc.font('Helvetica-Bold').fontSize(13.5).fillColor(C.text).text('entity', x + 42, y + 425, { width: 300 });
  doc.font('Helvetica-Bold').fontSize(13.5).fillColor(C.text).text('standard', x + 380, y + 425, { width: 250 });
  const results = [
    ['ExampleCompliantEntity', 'ISO27001'],
    ['ExampleCompliantEntity', 'ISO27002'],
  ];
  results.forEach((row, i) => {
    const ry = y + 450 + i * 42;
    doc.rect(x + 28, ry, w - 56, 42).fill(i % 2 === 0 ? '#FFFFFF' : '#F8FAFC').stroke(C.line);
    doc.font('Helvetica').fontSize(13.5).fillColor(C.text).text(row[0], x + 42, ry + 14, { width: 300 });
    doc.font('Helvetica-Bold').fontSize(13.5).fillColor('#6D28D9').text(row[1], x + 380, ry + 14, { width: 250 });
  });
  doc.restore();
}

function hierarchyItem(doc, x, y, label, level = 0, color = C.text, bold = false) {
  const indent = level * 22;
  doc.font(bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(12.5).fillColor(color);
  doc.circle(x + indent, y + 7, 4).fill(color === C.text ? C.amber : color);
  doc.fillColor(color).text(label, x + indent + 12, y, { width: 365 - indent });
}

function ontologyHierarchyPanel(doc, x, y, w, h) {
  doc.save();
  doc.rect(x, y, w, h).fill('#FFFFFF').stroke(C.line);
  doc.font('Helvetica-Bold').fontSize(22).fillColor(C.text).text('Figure 6.1: OWL class hierarchy', x + 24, y + 24);
  doc.font('Helvetica').fontSize(12.5).fillColor(C.muted).text(
    'Readable reconstruction of the Protégé hierarchy used in the thesis implementation.',
    x + 24,
    y + 54,
    { width: w - 48 }
  );

  doc.font('Helvetica-Bold').fontSize(15).fillColor(C.text).text('Top-level ontology classes', x + 24, y + 100);
  const topClasses = ['Entity', 'RiskManagementMeasure', 'CybersecurityRisk', 'NetworkInformationSystem', 'SecurityIncident', 'SecurityStandard'];
  topClasses.forEach((label, i) => {
    const bx = x + 24 + (i % 2) * 220;
    const by = y + 132 + Math.floor(i / 2) * 42;
    doc.roundedRect(bx, by, 196, 30, 5).fill('#F8FAFC').stroke(C.line);
    doc.font('Helvetica-Bold').fontSize(11.5).fillColor(i < 2 ? C.florenceBlue : C.text).text(label, bx + 10, by + 9, {
      width: 176,
      align: 'center',
    });
  });

  doc.font('Helvetica-Bold').fontSize(15).fillColor(C.text).text('RiskManagementMeasure subclasses', x + 24, y + 286);
  const families = [
    ['OperationalMeasure', ['Basic cyber hygiene', 'Business continuity', 'Incident handling']],
    ['OrganizationalMeasure', ['Risk analysis policy', 'Supply-chain security', 'Training awareness']],
    ['TechnicalMeasure', ['Encryption', 'MFA', 'Secure communications']],
  ];
  families.forEach(([title, items], i) => {
    const bx = x + 24 + i * 150;
    const by = y + 322;
    doc.rect(bx, by, 136, 118).fill('#FFFFFF').stroke(C.line);
    doc.rect(bx, by, 136, 28).fill(i === 0 ? '#DCFCE7' : i === 1 ? '#DBEAFE' : '#FEF3C7');
    doc.font('Helvetica-Bold').fontSize(10.8).fillColor(C.text).text(title, bx + 8, by + 9, { width: 120, align: 'center' });
    items.forEach((item, j) => {
      doc.font('Helvetica').fontSize(10.5).fillColor(C.text).text(`• ${item}`, bx + 10, by + 42 + j * 22, {
        width: 116,
      });
    });
  });

  doc.font('Helvetica-Oblique').fontSize(8.8).fillColor(C.muted).text(
    'Figure 6.1: Protégé class hierarchy for the NIS2 Article 21 ontology',
    x + 10,
    y + h - 24,
    { width: w - 20, align: 'center' }
  );
  doc.restore();
}

function axiomBox(doc, x, y, w, label, color, fill = '#FFFFFF') {
  doc.save();
  doc.roundedRect(x, y, w, 44, 7).fill(fill);
  doc.lineWidth(1.5).strokeColor(color).roundedRect(x, y, w, 44, 7).stroke();
  doc.font('Helvetica-Bold').fontSize(12.5).fillColor(color).text(label, x + 10, y + 14, {
    width: w - 20,
    align: 'center',
  });
  doc.restore();
}

function complianceAxiomPanel(doc, x, y, w, h) {
  doc.save();
  doc.rect(x, y, w, h).fill('#FFFFFF').stroke(C.line);
  doc.font('Helvetica-Bold').fontSize(22).fillColor(C.text).text('Figure 6.4: CompliantEntity axiom', x + 24, y + 24);
  doc.font('Helvetica').fontSize(12.5).fillColor(C.muted).text(
    'OWL equivalent-class structure represented as an intersection of entity type and required measures.',
    x + 24,
    y + 54,
    { width: w - 48 }
  );

  axiomBox(doc, x + 30, y + 120, 150, 'CompliantEntity', '#2563EB', '#DBEAFE');
  axiomBox(doc, x + 230, y + 120, 170, 'owl:intersectionOf', '#7C3AED', '#F3E8FF');
  doc.lineWidth(2).strokeColor('#94A3B8').moveTo(x + 180, y + 142).lineTo(x + 230, y + 142).stroke();
  doc.moveTo(x + 400, y + 142).lineTo(x + 446, y + 142).stroke();

  const restrictions = [
    'Entity',
    'implementsMeasure RiskAnalysisPolicy',
    'implementsMeasure IncidentHandling',
  ];
  restrictions.forEach((label, i) => {
    const by = y + 102 + i * 54;
    axiomBox(doc, x + 446, by, 176, label, C.text);
    doc.lineWidth(1.5).strokeColor('#94A3B8').moveTo(x + 400, y + 142).lineTo(x + 446, by + 22).stroke();
  });

  doc.rect(x + 30, y + h - 86, w - 60, 54).fill('#F8FAFC').stroke(C.line);
  doc.font('Helvetica-Bold').fontSize(12.5).fillColor(C.text).text('Classification condition', x + 48, y + h - 70);
  doc.font('Helvetica').fontSize(12.5).fillColor(C.text).text(
    'Every existential restriction must be satisfied before the entity can be classified as CompliantEntity.',
    x + 220,
    y + h - 70,
    { width: w - 270 }
  );
  doc.restore();
}

function titleSlide(doc) {
  doc.rect(0, 0, W, H).fill(C.florenceBlue);
  doc.save();
  doc.opacity(0.08);
  doc.circle(1010, 470, 310).lineWidth(44).stroke('#FFFFFF');
  doc.circle(1010, 470, 210).lineWidth(28).stroke('#FFFFFF');
  doc.font('Helvetica-Bold').fontSize(170).fillColor('#FFFFFF').text('UNIFI', 690, 245, {
    width: 520,
    align: 'center',
    rotate: -18,
  });
  doc.restore();

  doc.font('Helvetica-Bold').fontSize(20).fillColor('#FFFFFF').text('UNIVERSITA', 74, 50, { width: 230 });
  doc.font('Helvetica-Bold').fontSize(20).fillColor('#FFFFFF').text('DEGLI STUDI', 74, 78, { width: 230 });
  doc.font('Helvetica-Bold').fontSize(25).fillColor('#FFFFFF').text('FIRENZE', 74, 108, { width: 230 });
  doc.moveTo(44, 48).lineTo(44, 148).lineWidth(2.2).strokeColor('#FFFFFF').stroke();

  doc.font('Helvetica').fontSize(34).fillColor('#FFFFFF').text("Master's Thesis Defence", 120, 158, {
    width: W - 240,
    align: 'center',
  });
  doc.font('Helvetica-Bold').fontSize(54).fillColor('#FFFFFF').text(
    'An OWL-Based Ontology for NIS2 Article 21 Compliance',
    110,
    220,
    { width: W - 220, align: 'center', lineGap: 10 }
  );
  doc.save();
  doc.moveTo(230, 410).lineTo(W - 230, 410).lineWidth(1.4).strokeColor('#FFFFFF').stroke();
  doc.restore();
  doc.font('Helvetica').fontSize(26).fillColor('#FFFFFF').text('Supervisor: Prof. Enrico Francesconi', 180, 452, {
    width: 920,
    align: 'left',
  });
  doc.font('Helvetica').fontSize(22).fillColor('#FFFFFF').text('Candidate: Abdul Kader', 180, 500, {
    width: 920,
    align: 'left',
  });
  doc.font('Helvetica').fontSize(17).fillColor('#D7EAF4').text('OWL 2 DL   |   SHACL   |   SPARQL', 180, 570, {
    width: 920,
    align: 'left',
  });
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
  doc.font('Helvetica-Bold').fontSize(15).fillColor(C.text).text('What the thesis contributes', 684, 174);
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
  doc.font('Helvetica-Bold').fontSize(22).fillColor(C.text).text('Research objective', 684, 430);
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
  doc.font('Helvetica-Bold').fontSize(14).fillColor(C.text).text('Analytical relevance', 624, 502);
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

  doc.save();
  doc.rect(M, 145, 640, 510).fill('#FFFFFF').stroke(C.line);
  doc.font('Helvetica-Bold').fontSize(19).fillColor(C.text).text('Ten thematic areas in NIS2 Article 21(2)', M + 24, 172);
  doc.font('Helvetica').fontSize(12.5).fillColor(C.muted).text(
    'Redrawn as text for presentation readability instead of scaling a tall infographic.',
    M + 24,
    201,
    { width: 590 }
  );

  const measures = [
    'Risk analysis and information-system security policies',
    'Incident handling',
    'Business continuity and crisis management',
    'Supply-chain security',
    'Security in network and information systems acquisition, development, and maintenance',
    'Policies and procedures to assess cybersecurity risk-management effectiveness',
    'Basic cyber hygiene practices and cybersecurity training',
    'Cryptography and encryption policies and procedures',
    'Human resources security, access-control policies, and asset management',
    'Multi-factor authentication and secure communications',
  ];
  const colors = [C.florenceBlue, C.blue, C.green, C.amber, C.red];
  const tileW = 286;
  const tileH = 72;
  const gapX = 20;
  const gapY = 8;
  for (let i = 0; i < measures.length; i += 1) {
    const col = i % 2;
    const row = Math.floor(i / 2);
    measureTile(
      doc,
      i + 1,
      measures[i],
      M + 24 + col * (tileW + gapX),
      238 + row * (tileH + gapY),
      tileW,
      tileH,
      colors[i % colors.length]
    );
  }
  doc.restore();

  doc.save();
  doc.rect(730, 145, 498, 510).fill('#FFFFFF').stroke(C.line);
  doc.font('Helvetica-Bold').fontSize(24).fillColor(C.text).text('How the map is used', 754, 182);
  bullets(
    doc,
    [
      'Article 21 measure categories become ontology classes.',
      'The ten legal points are refined into twelve operational classes.',
      'The same classes drive reasoning, SHACL validation, and SPARQL checks.',
    ],
    754,
    242,
    430,
    17,
    18
  );
  doc.restore();
}

function slide4(doc) {
  background(doc);
  slideHeader(doc, 'Methodological approach', 'From legal text to computable compliance');

  doc.save();
  doc.rect(M, 152, 1160, 340).fill('#FFFFFF').stroke(C.line);
  doc.font('Helvetica-Bold').fontSize(24).fillColor(C.text).text('Problem -> model -> outcome', M + 34, 184);
  doc.font('Helvetica').fontSize(13.5).fillColor(C.muted).text(
    'A compact thesis workflow from legal interpretation to machine-checkable compliance output.',
    M + 34,
    218,
    { width: 900 }
  );

  processStep(doc, 120, 285, 250, 88, 'Legal text', 'NIS2 Article 21', C.navy);
  processStep(doc, 500, 285, 280, 88, 'Ontology + SHACL', 'OWL 2 DL validation', '#1E86D8');
  processStep(doc, 910, 285, 250, 88, 'Outcome', 'Explainable compliance', '#1F8A70');
  arrow(doc, 370, 329, 500, 329);
  arrow(doc, 780, 329, 910, 329);

  outlineChip(doc, 152, 418, 176, 'Manual review', C.red);
  outlineChip(doc, 552, 418, 176, 'Reasoning', '#1E86D8');
  outlineChip(doc, 948, 418, 176, 'Validation', '#1F8A70');
  doc.font('Helvetica-Oblique').fontSize(8.8).fillColor(C.muted).text(
    'Simple thesis workflow: legal text -> ontology -> validation -> outcome',
    M + 10,
    466,
    { width: 1140, align: 'center' }
  );
  doc.restore();

  bullets(
    doc,
    [
      'Design-science: build the artifact and evaluate it against representative cases.',
      'OWL 2 DL supports classification and reasoning.',
      'SHACL and SPARQL support validation and querying.',
    ],
    M,
    522,
    560,
    14,
    10
  );

  doc.save();
  doc.rect(660, 512, 560, 112).fill('#FFFFFF').stroke(C.line);
  doc.font('Helvetica-Bold').fontSize(14).fillColor(C.text).text('Modeling decision', 684, 534);
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

  doc.save();
  doc.rect(M, 150, 760, 470).fill('#FFFFFF').stroke(C.line);
  doc.font('Helvetica-Bold').fontSize(22).fillColor(C.text).text('Ontology structure', M + 28, 180);
  doc.font('Helvetica').fontSize(13.5).fillColor(C.muted).text(
    'A central compliant entity supported by Article 21 measure groups.',
    M + 28,
    212,
    { width: 690 }
  );

  const cx = 432;
  const cy = 390;
  const radius = 72;
  const nodes = [
    { x: 104, y: 252, w: 170, h: 58, label: 'Risk analysis\npolicy', color: C.navy, ax: 274, ay: 281, bx: cx - 62, by: cy - 36 },
    { x: 100, y: 372, w: 180, h: 58, label: 'Incident handling\n& continuity', color: '#1E86D8', ax: 280, ay: 401, bx: cx - radius, by: cy },
    { x: 128, y: 492, w: 192, h: 58, label: 'Supply chain\n& development', color: '#1F8A70', ax: 320, ay: 521, bx: cx - 52, by: cy + 48 },
    { x: 592, y: 252, w: 170, h: 58, label: 'Training\n& hygiene', color: C.amber, ax: 592, ay: 281, bx: cx + 62, by: cy - 36 },
    { x: 604, y: 372, w: 178, h: 58, label: 'Encryption\n& HR security', color: C.red, ax: 604, ay: 401, bx: cx + radius, by: cy },
    { x: 592, y: 492, w: 190, h: 58, label: 'MFA\n& secure comms', color: C.navy, ax: 592, ay: 521, bx: cx + 52, by: cy + 48 },
  ];
  doc.lineWidth(2.4).strokeColor('#CBD5E1');
  for (const node of nodes) {
    doc.moveTo(node.ax, node.ay).lineTo(node.bx, node.by).stroke();
  }

  doc.circle(cx, cy, radius).fill(C.navy);
  doc.font('Helvetica-Bold').fontSize(18).fillColor('#FFFFFF').text('Compliant\nEntity', cx - 58, cy - 21, {
    width: 116,
    align: 'center',
    lineGap: 2,
  });
  for (const node of nodes) {
    ontologyNode(doc, node.x, node.y, node.w, node.h, node.label, node.color);
  }

  const legend = [
    ['Entity', C.navy],
    ['Measure groups', '#1E86D8'],
    ['Validation', '#1F8A70'],
    ['Query layer', C.amber],
    ['Outcome', C.red],
  ];
  let lx = M + 48;
  for (const [label, color] of legend) {
    doc.rect(lx, 585, 12, 36).fill(color);
    doc.rect(lx, 585, 126, 36).lineWidth(1).stroke(C.line);
    doc.font('Helvetica-Bold').fontSize(10.5).fillColor(C.text).text(label, lx + 20, 598, { width: 96 });
    lx += 140;
  }
  doc.font('Helvetica-Oblique').fontSize(8.8).fillColor(C.muted).text(
    'Ontology structure with a central compliance entity and the required measure groups',
    M + 10,
    630,
    { width: 740, align: 'center' }
  );
  doc.restore();

  doc.save();
  doc.rect(850, 150, 380, 470).fill('#FFFFFF').stroke(C.line);
  doc.font('Helvetica-Bold').fontSize(23).fillColor(C.text).text('Key concepts', 874, 182);
  bullets(
    doc,
    [
      'Entity',
      'RiskManagementMeasure',
      'Article 21 measure classes',
    ],
    874,
    230,
    330,
    16,
    16
  );
  doc.font('Helvetica-Bold').fontSize(23).fillColor(C.text).text('Why it matters', 874, 390);
  bullets(
    doc,
    [
      'Legal references remain traceable.',
      'Reasoning can explain compliance results.',
    ],
    874,
    438,
    330,
    16,
    16
  );
  doc.restore();
}

function thesisOntologyEvidenceSlide(doc) {
  background(doc);
  slideHeader(doc, 'Dissertation figures: ontology implementation', 'Selected implementation figures from Chapter 6');

  ontologyHierarchyPanel(doc, M, 150, 500, 500);
  complianceAxiomPanel(doc, 590, 150, 638, 350);

  doc.save();
  doc.rect(590, 525, 638, 96).fill('#FFFFFF').stroke(C.line);
  doc.font('Helvetica-Bold').fontSize(16).fillColor(C.text).text('Interpretation', 614, 545);
  doc.font('Helvetica').fontSize(16).fillColor(C.text).text(
    'The ontology is implemented in OWL, inspected in Protégé, and centered on a compliance class covering the Article 21 measure categories.',
    614,
    572,
    { width: 582, height: 44, lineGap: 3 }
  );
  doc.restore();
}

function ruleImplementationSlide(doc) {
  background(doc);
  slideHeader(doc, 'Example: Article 21 rule implemented and checked', 'Article 21(2)(c): business continuity and crisis management');

  doc.save();
  doc.rect(M, 168, 350, 270).fill('#FFFFFF').stroke(C.line);
  doc.font('Helvetica-Bold').fontSize(22).fillColor(C.text).text('1. Legal rule', M + 22, 194);
  doc.font('Helvetica').fontSize(22).fillColor(C.text).text(
    'Article 21(2)(c) requires business continuity, backup management, disaster recovery and crisis management.',
    M + 22,
    242,
    { width: 306, lineGap: 5 }
  );
  doc.restore();

  doc.save();
  doc.rect(435, 168, 390, 270).fill('#FFFFFF').stroke(C.line);
  doc.font('Helvetica-Bold').fontSize(22).fillColor(C.text).text('2. Ontology implementation', 457, 194);
  doc.font('Helvetica').fontSize(17).fillColor(C.text).text('The legal rule is modeled as an OWL class:', 457, 238, {
    width: 346,
    lineGap: 5,
  });
  doc.font('Courier-Bold').fontSize(14).fillColor(C.florenceBlue).text(':BusinessContinuityManagement', 457, 292, {
    width: 346,
  });
  doc.font('Helvetica').fontSize(16).fillColor(C.text).text('with article reference:', 457, 326, {
    width: 346,
  });
  doc.font('Courier-Bold').fontSize(14).fillColor(C.florenceBlue).text('"Article 21(2)(c)"', 457, 354, {
    width: 346,
  });
  doc.font('Helvetica').fontSize(16).fillColor(C.muted).text('The entity is checked through :implementsMeasure links.', 457, 386, {
    width: 346,
    lineGap: 4,
  });
  doc.restore();

  codeBlock(
    doc,
    [
      'PREFIX : <https://w3id.org/nis2/article21#>',
      '',
      'ASK {',
      '  :MedCenterHospital :implementsMeasure ?m .',
      '  ?m a :BusinessContinuityManagement .',
      '}',
      '',
      '# Result: false',
    ],
    860,
    168,
    368,
    '3. SPARQL compliance check'
  );

  doc.save();
  doc.rect(M, 500, 1176, 120).fill('#FEF3C7').stroke('#F59E0B');
  doc.font('Helvetica-Bold').fontSize(25).fillColor(C.amber).text('Compliance interpretation', M + 28, 526);
  doc.font('Helvetica').fontSize(22).fillColor(C.text).text(
    'For MedCenterHospital, the ASK query returns false: no implemented measure is typed as BusinessContinuityManagement. Therefore, the prototype reports Article 21(2)(c) as a missing requirement.',
    M + 360,
    524,
    { width: 800, lineGap: 5 }
  );
  doc.restore();
}

function slide6(doc) {
  background(doc);
  slideHeader(doc, 'Validation and results', 'Prototype-level evaluation findings');

  complianceTable(doc, M, 150, 710, 500);

  doc.save();
  doc.rect(782, 150, 446, 250).fill('#FFFFFF').stroke(C.line);
  doc.font('Helvetica-Bold').fontSize(24).fillColor(C.text).text('Observed outcome', 806, 176);
  doc.font('Helvetica-Bold').fontSize(42).fillColor(C.green).text('12 / 12', 806, 222, {
    width: 170,
    lineBreak: false,
  });
  doc.font('Helvetica').fontSize(20).fillColor(C.text).text('Full coverage: compliant classification.', 806, 276, {
    width: 380,
    lineGap: 4,
  });
  doc.font('Helvetica-Bold').fontSize(42).fillColor(C.amber).text('6 / 12', 806, 326, {
    width: 170,
    lineBreak: false,
  });
  doc.font('Helvetica').fontSize(20).fillColor(C.text).text('Partial coverage: gaps are exposed.', 970, 333, {
    width: 220,
    lineGap: 4,
  });
  doc.restore();

  doc.save();
  doc.rect(782, 430, 446, 180).fill('#FFFFFF').stroke(C.line);
  doc.font('Helvetica-Bold').fontSize(24).fillColor(C.text).text('Interpretation', 806, 458);
  bullets(
    doc,
    [
      'The result measures modeled coverage, not legal certification.',
      'Missing requirement categories are identified explicitly.',
    ],
    806,
    502,
    394,
    14,
    10
  );
  doc.restore();
}

function webApplicationSlide(doc) {
  background(doc);
  slideHeader(doc, 'Web application prototype', 'How the implementation makes the ontology usable');

  doc.save();
  doc.rect(M, 165, 575, 330).fill('#FFFFFF').stroke(C.line);
  doc.font('Helvetica-Bold').fontSize(22).fillColor(C.text).text('System architecture', M + 24, 194);
  doc.font('Helvetica').fontSize(12.5).fillColor(C.muted).text(
    'Three layers: ontology data, backend services, and browser UI.',
    M + 24,
    224,
    { width: 520 }
  );
  architectureLayer(doc, 82, 292, 150, 126, C.navy, 'Data layer', ['OWL / Turtle', 'SHACL shapes', 'Example entities']);
  architectureLayer(doc, 268, 292, 162, 126, '#1E86D8', 'API layer', ['Validation endpoint', 'Reasoning endpoint', 'SPARQL endpoint']);
  architectureLayer(doc, 466, 292, 150, 126, '#1F8A70', 'UI layer', ['Graph visualizer', 'Entity checker', 'Result views']);
  arrow(doc, 232, 355, 268, 355);
  arrow(doc, 430, 355, 466, 355);
  doc.font('Helvetica-Oblique').fontSize(8.8).fillColor(C.muted).text(
    'Prototype architecture: ontology data, backend API, and browser interface',
    M + 10,
    468,
    { width: 555, align: 'center' }
  );
  doc.restore();

  doc.save();
  doc.rect(680, 165, 548, 330).fill('#FFFFFF').stroke(C.line);
  doc.font('Helvetica-Bold').fontSize(26).fillColor(C.text).text('Technology used', 706, 194);
  bullets(
    doc,
    [
      'Node.js and Express backend',
      'RDF/OWL parsing with rdf-parse and N3',
      'Browser interface with HTML, CSS, and JavaScript',
      'Ontology files served as TTL/OWL data',
    ],
    706,
    248,
    480,
    16,
    12
  );
  doc.restore();

  doc.save();
  doc.rect(M, 515, 1176, 105).fill('#FEF3C7').stroke('#F59E0B');
  doc.font('Helvetica-Bold').fontSize(22).fillColor(C.amber).text('Role in solving the problem', M + 26, 540, {
    width: 300,
  });
  doc.font('Helvetica').fontSize(19).fillColor(C.text).text(
    'The web application turns the formal ontology into an inspectable tool: users can browse the model, run checks, and see which Article 21 obligations are satisfied or missing.',
    M + 340,
    538,
    { width: 820, lineGap: 4 }
  );
  doc.restore();
}

function slide7(doc) {
  background(doc);
  slideHeader(doc, 'Comparison and limitations', 'Scope of contribution and stated boundaries');

  comparisonTable(doc, M, 150, 720, 500);

  doc.save();
  doc.rect(800, 150, 428, 240).fill('#FFFFFF').stroke(C.line);
  doc.font('Helvetica-Bold').fontSize(16).fillColor(C.text).text('Strength', 824, 176);
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
  doc.font('Helvetica-Bold').fontSize(16).fillColor(C.text).text('Limitations', 824, 436);
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
  doc.font('Helvetica-Bold').fontSize(14).fillColor(C.text).text('Implementation note', M + 22, 532);
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
  doc.font('Helvetica-Bold').fontSize(15).fillColor(C.text).text('Interpretive value', 764, 176);
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
  doc.font('Helvetica-Bold').fontSize(14).fillColor(C.text).text('Connection to the research claim', 764, 430);
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

  reasoningOutputPanel(doc, M, 150, 560, 470);
  entityAssessmentPanel(doc, 668, 150, 560, 470);
}

function thesisQueryEvidenceSlide(doc) {
  background(doc);
  slideHeader(doc, 'Dissertation figures: SPARQL query layer', 'Competency-question execution over the ontology graph');

  sparqlEvidencePanel(doc, M, 150, 690, 500);

  doc.save();
  doc.rect(790, 150, 430, 210).fill('#FFFFFF').stroke(C.line);
  doc.font('Helvetica-Bold').fontSize(20).fillColor(C.text).text('What this demonstrates', 814, 176);
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

function defenseQuestionsSlide(doc) {
  background(doc);
  slideHeader(doc, 'Approach, alternatives, and limits', 'Likely defence questions answered directly');

  const topY = 160;
  const colW = 372;
  const gap = 14;

  card(doc, M, topY, colW, 208, 'Why OWL?', (x, y, w) => {
    compactBullets(
      doc,
      [
        'Formal semantics for Article 21 concepts.',
        'Class hierarchy and reusable vocabulary.',
        'Reasoning can infer CompliantEntity.',
      ],
      x + 22,
      y + 58,
      w - 44,
      16,
      9
    );
  });

  card(doc, M + colW + gap, topY, colW, 208, 'Alternatives considered', (x, y, w) => {
    compactBullets(
      doc,
      [
        'Spreadsheets are simple but cannot reason.',
        'Databases store structure, not legal meaning.',
        'Rule engines are weaker as shared vocabulary.',
      ],
      x + 22,
      y + 58,
      w - 44,
      16,
      9
    );
  });

  card(doc, M + (colW + gap) * 2, topY, colW, 208, 'Type of data', (x, y, w) => {
    compactBullets(
      doc,
      [
        'RDF triples, OWL classes, and properties.',
        'SHACL shapes and SPARQL query results.',
        'Example claims, not verified legal evidence.',
      ],
      x + 22,
      y + 58,
      w - 44,
      16,
      9
    );
  });

  card(doc, M, 392, colW, 208, 'Website UI', (x, y, w) => {
    compactBullets(
      doc,
      [
        'Graph visualization of ontology relations.',
        'Validation, reasoning, SHACL, SPARQL panels.',
        'Real-time entity compliance checker.',
      ],
      x + 22,
      y + 58,
      w - 44,
      16,
      9
    );
  });

  card(doc, M + colW + gap, 392, colW, 208, 'Challenges', (x, y, w) => {
    compactBullets(
      doc,
      [
        'Translating legal text into precise classes.',
        'Handling OWL open-world semantics.',
        'Reporting missing evidence without overclaiming.',
      ],
      x + 22,
      y + 58,
      w - 44,
      16,
      9
    );
  });

  card(doc, M + (colW + gap) * 2, 392, colW, 208, 'Limits and next step', (x, y, w) => {
    compactBullets(
      doc,
      [
        'Research prototype, not official certification.',
        'Use complete OWL, SHACL, and SPARQL engines.',
        'Add evidence, provenance, and real cases.',
      ],
      x + 22,
      y + 58,
      w - 44,
      16,
      9
    );
  });
}

function slide12(doc) {
  background(doc);
  slideHeader(doc, 'Conclusion', 'Final synthesis of the research contribution');

  doc.save();
  doc.font('Helvetica-Bold').fontSize(30).fillColor(C.text).text('Main takeaway', M, 170);
  doc.font('Helvetica').fontSize(27).fillColor(C.text).text(
    'NIS2 Article 21 compliance can be represented as a formal ontology, validated with SHACL, queried with SPARQL, and explained through a compact prototype.',
    M,
    225,
    { width: 1120, lineGap: 8 }
  );
  doc.restore();

  doc.save();
  doc.font('Helvetica-Bold').fontSize(28).fillColor(C.text).text('Core claims', M, 385);
  bullets(
    doc,
    [
      'Manual verification becomes more consistent through formal representation.',
      'A traceable ontology bridges legal text and compliance evidence.',
    ],
    M,
    435,
    1080,
    18,
    18
  );
  doc.restore();

  doc.font('Helvetica-Bold').fontSize(34).fillColor(C.florenceBlue).text('Thank you', M, 612);
}

function slide13(doc) {
  background(doc);
  slideHeader(doc, 'Future work', 'Research extensions and validation requirements');

  doc.save();
  doc.rect(M, 160, 520, 420).fill('#FFFFFF').stroke(C.line);
  doc.font('Helvetica-Bold').fontSize(16).fillColor(C.text).text('Next steps', M + 24, 186);
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

  comparisonTable(doc, 620, 160, 608, 320);

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
  doc.font('Helvetica-Bold').fontSize(15).fillColor(C.text).text('Closing point', M + 18, 619);
  doc.font('Helvetica').fontSize(15).fillColor(C.text).text(
    'This work is a formal compliance demonstrator, not a production deployment.',
    M + 120,
    619,
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
    slide4,
    slide5,
    thesisOntologyEvidenceSlide,
    ruleImplementationSlide,
    webApplicationSlide,
    slide6,
    slide7,
    thesisPrototypeEvidenceSlide,
    thesisQueryEvidenceSlide,
    defenseQuestionsSlide,
    slide12,
    slide13,
  ];
  slides.forEach((slide, i) => {
    slide(doc);
    if (i > 0) footer(doc, i + 1, slides.length);
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
