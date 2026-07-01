from pathlib import Path

import fitz
from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parent
OUT = ROOT / 'generated_assets'
THESIS = ROOT / 'NIS2_Thesis_Abdul_Kader.pdf'


def font(size, bold=False):
    path = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf' if bold else '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
    try:
        return ImageFont.truetype(path, size)
    except Exception:
        return ImageFont.load_default()


def render_page(page_no, name, zoom=1.9):
    doc = fitz.open(str(THESIS))
    page = doc.load_page(page_no - 1)
    pix = page.get_pixmap(matrix=fitz.Matrix(zoom, zoom), alpha=False)
    out = OUT / name
    pix.save(str(out))
    # Normalize to a plain RGB PNG for PDFKit compatibility.
    Image.open(out).convert('RGB').save(out)
    return out


def label_box(draw, xy, text, fill, text_fill='#ffffff', size=18):
    x1, y1, x2, y2 = xy
    draw.rounded_rectangle(xy, radius=22, fill=fill)
    f = font(size, True)
    bbox = draw.multiline_textbbox((0, 0), text, font=f, spacing=4, align='center')
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    tx = x1 + (x2 - x1 - tw) / 2
    ty = y1 + (y2 - y1 - th) / 2 - 2
    draw.multiline_text((tx, ty), text, font=f, fill=text_fill, spacing=4, align='center')


def workflow_diagram():
    img = Image.new('RGB', (1600, 760), '#F8FBFF')
    d = ImageDraw.Draw(img)
    title = font(42, True)
    sub = font(22)
    d.text((70, 50), 'Problem -> model -> outcome', fill='#16304F', font=title)
    d.text((70, 102), 'A compact thesis workflow, shown as a simple process instead of a decorative graphic.', fill='#607086', font=sub)

    label_box(d, (90, 220, 430, 370), 'Legal text\nNIS2 Article 21', '#17304F', size=26)
    label_box(d, (580, 220, 1020, 370), 'Ontology + SHACL\nOWL 2 DL validation', '#1E86D8', size=26)
    label_box(d, (1090, 220, 1510, 370), 'Outcome\nExplainable compliance', '#1F8A70', size=26)

    arrow_color = '#9AA8B9'
    d.line((430, 295, 570, 295), fill=arrow_color, width=7)
    d.polygon([(565, 281), (590, 295), (565, 309)], fill=arrow_color)
    d.line((1020, 295, 1080, 295), fill=arrow_color, width=7)
    d.polygon([(1075, 281), (1100, 295), (1075, 309)], fill=arrow_color)

    notes = [
        ('Manual review', 120, 500, '#B94A48'),
        ('Reasoning', 635, 500, '#1E86D8'),
        ('Validation', 1120, 500, '#1F8A70'),
    ]
    for txt, x, y, fill in notes:
        d.rounded_rectangle((x, y, x + 250, y + 74), radius=18, fill='#FFFFFF', outline=fill, width=4)
        d.text((x + 28, y + 22), txt, fill='#18304E', font=font(23, True))

    img.save(OUT / 'workflow_diagram.png')


def ontology_diagram():
    img = Image.new('RGB', (1600, 900), '#F8FBFF')
    d = ImageDraw.Draw(img)
    d.text((70, 50), 'Ontology structure', fill='#16304F', font=font(42, True))
    d.text((70, 102), 'A central compliant entity supported by the Article 21 measure groups.', fill='#607086', font=font(22))

    cx, cy = 800, 420
    r = 120
    d.ellipse((cx - r, cy - r, cx + r, cy + r), fill='#17304F', outline='#17304F')
    d.multiline_text((cx - 88, cy - 35), 'Compliant\nEntity', fill='white', font=font(28, True), spacing=4, align='center')

    groups = [
        (270, 220, 'Risk analysis\npolicy', '#17304F'),
        (260, 430, 'Incident handling\n& continuity', '#1E86D8'),
        (315, 650, 'Supply chain\n& development', '#1F8A70'),
        (1185, 220, 'Training\n& hygiene', '#C98A14'),
        (1200, 430, 'Encryption\n& HR security', '#B94A48'),
        (1165, 650, 'MFA\n& secure comms', '#163A63'),
    ]
    for x, y, text, color in groups:
        d.line((cx, cy, x, y), fill='#CFD8E3', width=5)
        d.rounded_rectangle((x - 120, y - 45, x + 120, y + 45), radius=20, fill='white', outline=color, width=4)
        d.multiline_text((x - 92, y - 20), text, fill='#18304E', font=font(22, True), align='center', spacing=4)

    legend = [
        ('Entity', '#17304F'),
        ('Measure families', '#1E86D8'),
        ('Validation', '#1F8A70'),
        ('Query layer', '#C98A14'),
        ('Outcome', '#B94A48'),
    ]
    x = 70
    for label, color in legend:
        d.rounded_rectangle((x, 760, x + 260, 830), radius=18, fill='white', outline='#D7DCE3', width=3)
        d.rounded_rectangle((x, 760, x + 12, 830), radius=6, fill=color)
        d.text((x + 24, 784), label, fill='#18304E', font=font(20, True))
        x += 292

    img.save(OUT / 'ontology_diagram.png')


def architecture_diagram():
    img = Image.new('RGB', (1600, 760), '#F8FBFF')
    d = ImageDraw.Draw(img)
    d.text((70, 50), 'System architecture', fill='#16304F', font=font(42, True))
    d.text((70, 102), 'Three layers keep the project simple: ontology data, backend services, and browser UI.', fill='#607086', font=font(22))

    boxes = [
        (110, 240, 390, 400, '#17304F', 'Data layer', 'OWL / Turtle\nSHACL shapes\nExample entities'),
        (610, 240, 890, 400, '#1E86D8', 'API layer', 'Validation endpoint\nReasoning endpoint\nSPARQL endpoint'),
        (1110, 240, 1390, 400, '#1F8A70', 'UI layer', 'Graph visualizer\nEntity checker\nResult views'),
    ]
    for x1, y1, x2, y2, color, head, body in boxes:
        d.rounded_rectangle((x1, y1, x2, y2), radius=24, fill='white', outline=color, width=5)
        d.rectangle((x1, y1, x1 + 16, y2), fill=color)
        d.text((x1 + 28, y1 + 22), head, fill='#18304E', font=font(26, True))
        d.multiline_text((x1 + 28, y1 + 82), body, fill='#1A2433', font=font(22), spacing=8)

    arrow = '#9AA8B9'
    d.line((400, 320, 600, 320), fill=arrow, width=6)
    d.polygon([(595, 306), (620, 320), (595, 334)], fill=arrow)
    d.line((900, 320, 1100, 320), fill=arrow, width=6)
    d.polygon([(1095, 306), (1120, 320), (1095, 334)], fill=arrow)

    img.save(OUT / 'architecture_diagram.png')


def stack_diagram():
    img = Image.new('RGB', (1600, 760), '#F8FBFF')
    d = ImageDraw.Draw(img)
    d.text((70, 50), 'Technology stack', fill='#16304F', font=font(42, True))
    d.text((70, 102), 'The thesis uses a small, standard stack rather than a heavy custom system.', fill='#607086', font=font(22))

    items = [
        ('OWL 2 DL', '#17304F', 90, 220, 250, 110),
        ('Protégé', '#1E86D8', 370, 220, 250, 110),
        ('SHACL', '#1F8A70', 650, 220, 250, 110),
        ('SPARQL', '#C98A14', 930, 220, 250, 110),
        ('Express API', '#B94A48', 1210, 220, 250, 110),
    ]
    for label, color, x, y, w, h in items:
        d.rounded_rectangle((x, y, x + w, y + h), radius=20, fill='white', outline=color, width=5)
        d.rectangle((x, y, x + 14, y + h), fill=color)
        d.multiline_text((x + 26, y + 36), label, fill='#18304E', font=font(28, True), spacing=4)

    d.line((340, 275, 370, 275), fill='#9AA8B9', width=6)
    d.line((620, 275, 650, 275), fill='#9AA8B9', width=6)
    d.line((900, 275, 930, 275), fill='#9AA8B9', width=6)
    d.line((1180, 275, 1210, 275), fill='#9AA8B9', width=6)

    d.text((90, 450), 'Why this matters', fill='#16304F', font=font(30, True))
    d.multiline_text((90, 500), 'A small stack keeps the thesis reproducible,\nstandard-based, and easier to explain in a defense.', fill='#1A2433', font=font(22), spacing=8)

    img.save(OUT / 'stack_diagram.png')


def questions_diagram():
    img = Image.new('RGB', (1600, 760), '#F8FBFF')
    d = ImageDraw.Draw(img)
    d.text((70, 50), 'Research questions', fill='#16304F', font=font(42, True))
    d.text((70, 102), 'The presentation should answer these three things early and clearly.', fill='#607086', font=font(22))

    qs = [
        ('RQ1', 'Can Article 21(2) be represented\nas a layered ontology?', '#17304F'),
        ('RQ2', 'Which OWL axiom pattern best captures\ncompliance coverage?', '#1E86D8'),
        ('RQ3', 'How do SHACL and OWL complement\none another?', '#1F8A70'),
    ]
    y = 210
    for label, text, color in qs:
        d.rounded_rectangle((90, y, 1510, y + 120), radius=20, fill='white', outline=color, width=5)
        d.rectangle((90, y, 106, y + 120), fill=color)
        d.text((126, y + 32), label, fill='#FFFFFF', font=font(26, True))
        d.multiline_text((220, y + 26), text, fill='#18304E', font=font(26, True), spacing=6)
        y += 155
    img.save(OUT / 'questions_diagram.png')


def render_crop(page_no, name, clip, zoom=2.1):
    doc = fitz.open(str(THESIS))
    page = doc.load_page(page_no - 1)
    pix = page.get_pixmap(matrix=fitz.Matrix(zoom, zoom), clip=clip, alpha=False)
    out = OUT / name
    pix.save(str(out))
    Image.open(out).convert('RGB').save(out)
    return out


def main():
    OUT.mkdir(exist_ok=True)
    render_page(1, 'cover_page.png', zoom=1.6)
    doc = fitz.open(str(THESIS))
    p81 = doc.load_page(80)
    p85 = doc.load_page(84)
    rect81 = p81.rect
    rect85 = p85.rect
    render_crop(81, 'compliance_table.png', fitz.Rect(0, 0, rect81.width, rect81.height * 0.72))
    render_crop(85, 'comparison_table.png', fitz.Rect(0, 0, rect85.width, rect85.height * 0.58))
    workflow_diagram()
    ontology_diagram()
    architecture_diagram()
    stack_diagram()
    questions_diagram()


if __name__ == '__main__':
    main()
