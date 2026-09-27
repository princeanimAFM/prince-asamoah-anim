"""Book: Letter Tracing Workbook for Preschoolers -- ABC, numbers, shapes, pre-writing lines.

Letters are drawn as single centre-line strokes (like a teacher writes them) rather
than outlined font glyphs, so they trace the way children are taught to print.
Units: x-height = 1, cap/ascender height = 2, baseline = 0, descender = -1.
"""
import math

from reportlab.lib.colors import HexColor, white
from reportlab.lib.units import inch

import common as cm

TITLE = ["Letter Tracing", "for Preschoolers"]
SUBTITLE = "Alphabet, Numbers & Shapes Handwriting Practice"
SAMPLE_PAGE = 8  # page shown in sample-page.png (0-based)
FULL_TITLE = ("Letter Tracing for Preschoolers: Alphabet, Numbers & Shapes "
              "Handwriting Practice Workbook for Kids Ages 3-5")


def L(*pts):
    return ("L", pts)


def A(cx, cy, rx, ry, start, extent):
    return ("A", cx, cy, rx, ry, start, extent)


def D(x, y):
    return ("D", x, y)


CIRCLE = lambda cx=0.5, cy=0.5, r=0.5: A(cx, cy, r, r, 0, 360)

UPPER = {
    "A": (1.3, [L((0, 0), (0.65, 2), (1.3, 0)), L((0.26, 0.8), (1.04, 0.8))]),
    "B": (1.05, [L((0, 0), (0, 2), (0.5, 2)), A(0.5, 1.5, 0.45, 0.5, 90, -180), L((0.5, 1), (0, 1), (0.55, 1)),
                 A(0.55, 0.5, 0.5, 0.5, 90, -180), L((0.55, 0), (0, 0))]),
    "C": (1.6, [A(0.95, 1, 0.95, 1, 45, 270)]),
    "D": (1.3, [L((0.35, 0), (0, 0), (0, 2), (0.35, 2)), A(0.35, 1, 0.9, 1, 90, -180)]),
    "E": (1.0, [L((1.0, 2), (0, 2), (0, 0), (1.0, 0)), L((0, 1), (0.8, 1))]),
    "F": (1.0, [L((1.0, 2), (0, 2), (0, 0)), L((0, 1), (0.8, 1))]),
    "G": (1.75, [A(0.95, 1, 0.95, 1, 45, 280), L((1.73, 0.45), (1.73, 0.95), (1.1, 0.95))]),
    "H": (1.2, [L((0, 0), (0, 2)), L((1.2, 0), (1.2, 2)), L((0, 1), (1.2, 1))]),
    "I": (0.7, [L((0.35, 0), (0.35, 2)), L((0, 2), (0.7, 2)), L((0, 0), (0.7, 0))]),
    "J": (1.0, [L((1.0, 2), (1.0, 0.5)), A(0.5, 0.5, 0.5, 0.5, 0, -180)]),
    "K": (1.1, [L((0, 0), (0, 2)), L((1.1, 2), (0, 0.8)), L((0.38, 1.22), (1.1, 0))]),
    "L": (1.0, [L((0, 2), (0, 0), (1.0, 0))]),
    "M": (1.4, [L((0, 0), (0, 2), (0.7, 0.6), (1.4, 2), (1.4, 0))]),
    "N": (1.2, [L((0, 0), (0, 2), (1.2, 0), (1.2, 2))]),
    "O": (1.9, [A(0.95, 1, 0.95, 1, 0, 360)]),
    "P": (1.05, [L((0, 0), (0, 2), (0.55, 2)), A(0.55, 1.5, 0.5, 0.5, 90, -180), L((0.55, 1), (0, 1))]),
    "Q": (1.9, [A(0.95, 1, 0.95, 1, 0, 360), L((1.1, 0.5), (1.8, -0.05))]),
    "R": (1.1, [L((0, 0), (0, 2), (0.55, 2)), A(0.55, 1.5, 0.5, 0.5, 90, -180), L((0.55, 1), (0, 1)),
                L((0.45, 1), (1.1, 0))]),
    "S": (1.1, [A(0.55, 1.5, 0.55, 0.5, 30, 240), A(0.55, 0.5, 0.55, 0.5, 90, -240)]),
    "T": (1.3, [L((0, 2), (1.3, 2)), L((0.65, 2), (0.65, 0))]),
    "U": (1.2, [L((0, 2), (0, 0.6)), A(0.6, 0.6, 0.6, 0.6, 180, 180), L((1.2, 0.6), (1.2, 2))]),
    "V": (1.3, [L((0, 2), (0.65, 0), (1.3, 2))]),
    "W": (1.8, [L((0, 2), (0.45, 0), (0.9, 1.4), (1.35, 0), (1.8, 2))]),
    "X": (1.2, [L((0, 2), (1.2, 0)), L((1.2, 2), (0, 0))]),
    "Y": (1.3, [L((0, 2), (0.65, 1), (1.3, 2)), L((0.65, 1), (0.65, 0))]),
    "Z": (1.2, [L((0, 2), (1.2, 2), (0, 0), (1.2, 0))]),
}

LOWER = {
    "a": (1.0, [CIRCLE(), L((1, 1), (1, 0))]),
    "b": (1.0, [L((0, 2), (0, 0)), CIRCLE()]),
    "c": (0.9, [A(0.5, 0.5, 0.5, 0.5, 45, 270)]),
    "d": (1.0, [CIRCLE(), L((1, 2), (1, 0))]),
    "e": (1.0, [L((0, 0.5), (1, 0.5)), A(0.5, 0.5, 0.5, 0.5, 0, 315)]),
    "f": (0.9, [A(0.65, 1.6, 0.3, 0.4, 20, 160), L((0.35, 1.6), (0.35, 0)), L((0, 1), (0.75, 1))]),
    "g": (1.0, [CIRCLE(), L((1, 1), (1, -0.5)), A(0.5, -0.5, 0.5, 0.45, 0, -160)]),
    "h": (1.0, [L((0, 2), (0, 0)), A(0.5, 0.5, 0.5, 0.5, 180, -180), L((1, 0.5), (1, 0))]),
    "i": (0.2, [L((0.1, 1), (0.1, 0)), D(0.1, 1.5)]),
    "j": (0.75, [L((0.6, 1), (0.6, -0.55)), A(0.25, -0.55, 0.35, 0.4, 0, -160), D(0.6, 1.5)]),
    "k": (0.9, [L((0, 2), (0, 0)), L((0.85, 1), (0, 0.4)), L((0.32, 0.63), (0.9, 0))]),
    "l": (0.2, [L((0.1, 2), (0.1, 0))]),
    "m": (1.6, [L((0, 1), (0, 0)), A(0.4, 0.6, 0.4, 0.4, 180, -180), L((0.8, 0.6), (0.8, 0)),
                A(1.2, 0.6, 0.4, 0.4, 180, -180), L((1.6, 0.6), (1.6, 0))]),
    "n": (1.0, [L((0, 1), (0, 0)), A(0.5, 0.5, 0.5, 0.5, 180, -180), L((1, 0.5), (1, 0))]),
    "o": (1.0, [CIRCLE()]),
    "p": (1.0, [L((0, 1), (0, -1)), CIRCLE()]),
    "q": (1.0, [CIRCLE(), L((1, 1), (1, -1))]),
    "r": (0.8, [L((0, 1), (0, 0)), A(0.5, 0.5, 0.5, 0.5, 180, -120)]),
    "s": (0.8, [A(0.4, 0.75, 0.4, 0.25, 30, 240), A(0.4, 0.25, 0.4, 0.25, 90, -240)]),
    "t": (0.8, [L((0.3, 1.7), (0.3, 0.25)), A(0.55, 0.25, 0.25, 0.25, 180, 90), L((0, 1), (0.8, 1))]),
    "u": (1.0, [L((0, 1), (0, 0.5)), A(0.5, 0.5, 0.5, 0.5, 180, 180), L((1, 1), (1, 0))]),
    "v": (1.0, [L((0, 1), (0.5, 0), (1, 1))]),
    "w": (1.4, [L((0, 1), (0.35, 0), (0.7, 0.8), (1.05, 0), (1.4, 1))]),
    "x": (0.9, [L((0, 1), (0.9, 0)), L((0.9, 1), (0, 0))]),
    "y": (1.0, [L((0, 1), (0.55, 0)), L((1, 1), (0.1, -1))]),
    "z": (0.9, [L((0, 1), (0.9, 1), (0, 0), (0.9, 0))]),
}

DIGITS = {
    "0": (1.2, [A(0.6, 1, 0.6, 1, 0, 360)]),
    "1": (0.6, [L((0, 1.6), (0.5, 2), (0.5, 0))]),
    "2": (1.1, [A(0.55, 1.45, 0.5, 0.55, 160, -190), L((0.98, 1.17), (0, 0), (1.1, 0))]),
    "3": (1.0, [A(0.5, 1.5, 0.5, 0.5, 150, -240), A(0.5, 0.5, 0.5, 0.5, 90, -240)]),
    "4": (1.1, [L((0.8, 0), (0.8, 2), (0, 0.6), (1.1, 0.6))]),
    "5": (1.05, [L((1, 2), (0.15, 2), (0.15, 1.02)), A(0.5, 0.6, 0.5, 0.6, 135, -270)]),
    "6": (1.0, [A(0.5, 0.55, 0.5, 0.55, 0, 360), L((0.85, 2), (0.05, 0.62))]),
    "7": (1.1, [L((0, 2), (1.1, 2), (0.35, 0))]),
    "8": (1.0, [A(0.5, 1.5, 0.42, 0.5, 0, 360), A(0.5, 0.5, 0.5, 0.5, 0, 360)]),
    "9": (1.0, [A(0.5, 1.45, 0.5, 0.55, 0, 360), L((1.0, 1.45), (0.45, 0))]),
}
GLYPHS = {**UPPER, **LOWER, **DIGITS}
GAP = 0.35  # between letters in a word, in units

WORDS = {
    "A": "apple", "B": "ball", "C": "cat", "D": "dog", "E": "egg", "F": "fish", "G": "goat",
    "H": "hat", "I": "igloo", "J": "jam", "K": "kite", "L": "lion", "M": "moon", "N": "nest",
    "O": "owl", "P": "pig", "Q": "queen", "R": "rain", "S": "sun", "T": "tree", "U": "up",
    "V": "van", "W": "web", "X": "box", "Y": "yarn", "Z": "zoo",
}
NUMBER_WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"]


def stroke_glyph(c, ch, x, y, u, style):
    """Draw one glyph with its baseline at y. style: 'solid' | 'dotted'."""
    w, strokes = GLYPHS[ch]
    c.saveState()
    c.setLineCap(1)
    c.setLineJoin(1)
    if style == "solid":
        c.setStrokeColor(cm.INK)
        c.setLineWidth(max(2.5, u * 0.14))
    else:
        c.setStrokeColor(HexColor("#555555"))
        c.setLineWidth(max(1.8, u * 0.085))
        c.setDash([0.1, max(3.5, u * 0.16)])
    for s in strokes:
        if s[0] == "L":
            p = c.beginPath()
            for i, (px, py) in enumerate(s[1]):
                (p.moveTo if i == 0 else p.lineTo)(x + px * u, y + py * u)
            c.drawPath(p, stroke=1, fill=0)
        elif s[0] == "A":
            _, cx, cy, rx, ry, start, extent = s
            p = c.beginPath()
            steps = max(12, int(abs(extent) / 6))
            for i in range(steps + 1):
                a = math.radians(start + extent * i / steps)
                px, py = x + (cx + rx * math.cos(a)) * u, y + (cy + ry * math.sin(a)) * u
                (p.moveTo if i == 0 else p.lineTo)(px, py)
            c.drawPath(p, stroke=1, fill=0)
        else:
            c.setFillColor(cm.INK if style == "solid" else HexColor("#6b6b6b"))
            c.circle(x + s[1] * u, y + s[2] * u, max(2.5, u * 0.1), stroke=0, fill=1)
    c.restoreState()
    return w


def word_width(text):
    return sum(GLYPHS[ch][0] for ch in text) + GAP * (len(text) - 1)


def draw_word(c, text, x, y, u, style):
    for ch in text:
        stroke_glyph(c, ch, x, y, u, style)
        x += (GLYPHS[ch][0] + GAP) * u


def guide_lines(c, x0, x1, base, u, descender=True):
    c.saveState()
    c.setStrokeColor(HexColor("#4a4a4a"))
    c.setLineWidth(1.2)
    c.line(x0, base + 2 * u, x1, base + 2 * u)
    c.line(x0, base, x1, base)
    c.setDash([5, 5])
    c.setStrokeColor(HexColor("#9e9e9e"))
    c.setLineWidth(1)
    c.line(x0, base + u, x1, base + u)
    if descender:
        c.setDash([2, 5])
        c.setStrokeColor(HexColor("#c4c4c4"))
        c.line(x0, base - u, x1, base - u)
    c.restoreState()


def practice_row(c, base, u, text, repeat=True, first_solid=True, descender=True):
    """A handwriting row: a solid model, then dotted copies to trace across the width."""
    x0, x1 = cm.MARGIN, cm.TRIM_W - cm.MARGIN
    guide_lines(c, x0, x1, base, u, descender)
    x = x0 + 0.15 * inch
    step = (word_width(text) + GAP * 2.2) * u
    first = True
    while x + word_width(text) * u <= x1 - 0.1 * inch:
        draw_word(c, text, x, base, u, "solid" if (first and first_solid) else "dotted")
        first = False
        x += step
        if not repeat:
            break


def letter_page(c, upper):
    lower = upper.lower()
    word = WORDS[upper]
    top = cm.TRIM_H - cm.MARGIN
    # Header: big letter pair + word
    big = 0.5 * inch
    stroke_glyph(c, upper, cm.MARGIN + 0.2 * inch, top - 1.05 * inch, big, "solid")
    stroke_glyph(c, lower, cm.MARGIN + 0.35 * inch + (GLYPHS[upper][0] + 0.3) * big,
                 top - 1.05 * inch, big, "solid")
    c.setFont("Bold", 30)
    c.setFillColor(cm.INK)
    c.drawRightString(cm.TRIM_W - cm.MARGIN, top - 0.45 * inch, f"{upper} is for")
    c.setFont("Bold", 40)
    c.drawRightString(cm.TRIM_W - cm.MARGIN, top - 1.1 * inch, word)
    u = 0.36 * inch
    rows = [(upper, True), (upper, False), (lower, True), (lower, False), (word, True), (word, False)]
    base = top - 2.4 * inch
    for text, solid in rows:
        practice_row(c, base, u, text, first_solid=solid)
        base -= 3.25 * u
    c.showPage()


def count_page(c, n):
    top = cm.TRIM_H - cm.MARGIN
    big = 1.15 * inch
    glyphs = str(n)
    w = word_width(glyphs) * big
    draw_word(c, glyphs, cm.MARGIN + 0.3 * inch, top - 2.4 * inch, big, "dotted")
    c.setFont("Bold", 44)
    c.setFillColor(cm.INK)
    c.drawRightString(cm.TRIM_W - cm.MARGIN, top - 1.1 * inch, NUMBER_WORDS[n])
    c.setFont("Regular", 16)
    c.drawRightString(cm.TRIM_W - cm.MARGIN, top - 1.55 * inch, "Trace the number, then")
    c.drawRightString(cm.TRIM_W - cm.MARGIN, top - 1.85 * inch,
                      "draw a big circle!" if n == 0 else f"color {n} star{'s' if n != 1 else ''}!")
    # Counting stars
    y = top - 3.3 * inch
    c.setStrokeColor(cm.INK)
    c.setLineWidth(2.5)
    if n == 0:
        c.setFont("Regular", 18)
        c.drawCentredString(cm.TRIM_W / 2, y, "Zero means none at all! 0 looks like a circle.")
    for i in range(n):
        col, row = i % 5, i // 5
        cx = cm.TRIM_W / 2 + (col - 2) * 1.3 * inch
        c.drawPath(cm.star_path(c, cx, y - row * 1.2 * inch, 0.5 * inch, 0.21 * inch), stroke=1, fill=0)
    u = 0.36 * inch
    base = top - 6.2 * inch
    for solid in (True, False, False):
        practice_row(c, base, u, glyphs, first_solid=solid, descender=False)
        base -= 2.9 * u
    c.showPage()


def numbers_11_20_page(c):
    cm.centered(c, "Numbers 11 to 20", cm.TRIM_H - cm.MARGIN - 30, size=30)
    u = 0.32 * inch
    base = cm.TRIM_H - cm.MARGIN - 1.2 * inch
    for n in range(11, 21):
        practice_row(c, base, u, str(n), first_solid=True, descender=False)
        base -= 2.65 * u
    c.showPage()


def shape_path(c, name, cx, cy, r):
    p = c.beginPath()
    if name == "circle":
        p.circle(cx, cy, r)
    elif name == "square":
        p.rect(cx - r, cy - r, 2 * r, 2 * r)
    elif name == "rectangle":
        p.rect(cx - 1.4 * r, cy - 0.8 * r, 2.8 * r, 1.6 * r)
    elif name == "triangle":
        p.moveTo(cx, cy + r); p.lineTo(cx - 1.1 * r, cy - 0.85 * r); p.lineTo(cx + 1.1 * r, cy - 0.85 * r); p.close()
    elif name == "diamond":
        p.moveTo(cx, cy + 1.1 * r); p.lineTo(cx - 0.8 * r, cy); p.lineTo(cx, cy - 1.1 * r); p.lineTo(cx + 0.8 * r, cy); p.close()
    elif name == "oval":
        p.ellipse(cx - 1.3 * r, cy - 0.8 * r, 2.6 * r, 1.6 * r)
    elif name == "star":
        return cm.star_path(c, cx, cy, 1.1 * r, 0.45 * r)
    elif name == "heart":
        return cm.heart_path(c, cx, cy + 0.1 * r, 1.0 * r)
    return p


SHAPES = ["circle", "square", "triangle", "rectangle", "oval", "diamond", "star", "heart"]


def shape_page(c, name):
    cm.centered(c, f"Trace the {name}", cm.TRIM_H - cm.MARGIN - 30, size=32)
    c.saveState()
    c.setStrokeColor(HexColor("#6b6b6b"))
    c.setLineWidth(3)
    c.setLineCap(1)
    c.setDash([0.1, 9])
    c.drawPath(shape_path(c, name, cm.TRIM_W / 2, cm.TRIM_H * 0.62, 1.7 * inch), stroke=1, fill=0)
    for i in range(3):
        c.drawPath(shape_path(c, name, cm.TRIM_W / 2 + (i - 1) * 2.4 * inch, cm.TRIM_H * 0.24, 0.72 * inch),
                   stroke=1, fill=0)
    c.restoreState()
    cm.centered(c, "Now color them in!", cm.MARGIN + 0.1 * inch, font="Regular", size=16)
    c.showPage()


def warmup_page(c, kind):
    names = {"lines": "Straight Lines", "zigzag": "Zig Zags", "waves": "Waves", "loops": "Loops & Hills"}
    cm.centered(c, f"Warm Up: {names[kind]}", cm.TRIM_H - cm.MARGIN - 30, size=30)
    cm.centered(c, "Follow the dots from left to right.", cm.TRIM_H - cm.MARGIN - 60, font="Regular", size=15)
    x0, x1 = cm.MARGIN + 0.5 * inch, cm.TRIM_W - cm.MARGIN - 0.2 * inch
    c.saveState()
    c.setLineCap(1)
    for r in range(6):
        y = cm.TRIM_H - cm.MARGIN - 1.6 * inch - r * 1.4 * inch
        c.setFillColor(cm.INK)
        c.circle(x0 - 0.25 * inch, y, 6, stroke=0, fill=1)  # start dot
        c.setStrokeColor(HexColor("#6b6b6b"))
        c.setLineWidth(2.5)
        c.setDash([0.1, 7])
        p = c.beginPath()
        steps = 240
        h = 0.45 * inch
        for i in range(steps + 1):
            t = i / steps
            x = x0 + t * (x1 - x0)
            if kind == "lines":
                yy = y
            elif kind == "zigzag":
                ph = (t * 8) % 1
                yy = y + h * (1 - 4 * abs(ph - 0.5))
            elif kind == "waves":
                yy = y + h * math.sin(t * 2 * math.pi * 4)
            else:  # prolate trochoid: a row of cursive-style loops
                d = 0.3 * inch
                th = t * 7 * 2 * math.pi
                k = (x1 - x0 - 2 * d) / (7 * 2 * math.pi)
                x = x0 + d + k * th - d * math.sin(th)
                yy = y - d * math.cos(th)
            (p.moveTo if i == 0 else p.lineTo)(x, yy)
        c.drawPath(p, stroke=1, fill=0)
        c.setDash([])
    c.restoreState()
    c.showPage()


def name_page(c):
    cm.centered(c, "I Can Write My Name!", cm.TRIM_H - cm.MARGIN - 30, size=32)
    cm.centered(c, "Ask a grown-up to write your name on the first line.",
                cm.TRIM_H - cm.MARGIN - 60, font="Regular", size=14)
    u = 0.36 * inch
    base = cm.TRIM_H - cm.MARGIN - 1.6 * inch
    for _ in range(7):
        guide_lines(c, cm.MARGIN, cm.TRIM_W - cm.MARGIN, base, u)
        base -= 3.35 * u
    c.showPage()


def build_interior(path):
    c = cm.new_interior(path, FULL_TITLE)
    cm.title_page(c, TITLE, SUBTITLE)
    cm.copyright_page(c, FULL_TITLE)
    cm.belongs_to_page(c)
    pages = 3
    cm.frame(c)
    cm.centered(c, "Tips for Grown-Ups", cm.TRIM_H - 2 * inch, size=34)
    for i, line in enumerate([
        "Use a thick pencil or crayon for little hands.",
        "Start each stroke at the top and pull down.",
        "Trace the dots first, then try on your own.",
        "Short, happy sessions (10 minutes) work best.",
        "Praise effort, not perfection!",
    ]):
        cm.centered(c, line, cm.TRIM_H - 3.2 * inch - i * 44, font="Regular", size=18)
    c.showPage()
    pages += 1
    for kind in ("lines", "zigzag", "waves", "loops"):
        warmup_page(c, kind)
        pages += 1
    for ch in "ABCDEFGHIJKLMNOPQRSTUVWXYZ":
        letter_page(c, ch)
        pages += 1
    for n in range(0, 11):
        count_page(c, n)
        pages += 1
    numbers_11_20_page(c)
    pages += 1
    for s in SHAPES:
        shape_page(c, s)
        pages += 1
    name_page(c)
    cm.certificate_page(c, "is a Tracing Superstar!", "for learning letters, numbers & shapes")
    pages += 2
    pages = cm.pad_to_even(c, pages)
    c.save()
    return pages


def cover_art(c, x, y, w, h, accent):
    c.setFillColor(white)
    c.setStrokeColor(cm.INK)
    c.setLineWidth(6)
    c.roundRect(x, y, w, h, 30, stroke=1, fill=1)
    u = min(h / 7.5, w / (word_width("Abc") + 1.5))
    base = y + h * 0.58
    guide_lines(c, x + 20, x + w - 20, base, u, descender=False)
    tx = x + (w - word_width("Abc") * u) / 2
    for ch, style in zip("Abc", ("solid", "dotted", "dotted")):
        stroke_glyph(c, ch, tx, base, u, style)
        tx += (GLYPHS[ch][0] + GAP) * u
    u2 = u * 0.7
    base2 = y + h * 0.12
    tx = x + (w - word_width("123") * u2) / 2
    for ch in "123":
        stroke_glyph(c, ch, tx, base2, u2, "dotted")
        tx += (GLYPHS[ch][0] + GAP) * u2
    c.setFillColor(accent)
    c.setStrokeColor(cm.INK)
    c.setLineWidth(3)
    for i, s in enumerate(("star", "heart")):
        cx = x + w * (0.15 if i == 0 else 0.85)
        c.drawPath(shape_path(c, s, cx, base2 + u2, u2 * 0.7), stroke=1, fill=1)


def build_cover(path, pages):
    return cm.make_cover(
        path, pages, title_lines=TITLE, subtitle=SUBTITLE, badge=["AGES", "3-5"],
        blurb=["Help your little one get ready for school!",
               "Kids trace dotted letters, numbers, and shapes",
               "line by line, building pencil control and",
               "confidence one happy page at a time."],
        bullets=["Pre-writing warm-ups", "Every letter A-Z, upper & lowercase",
                 "Numbers 0-20 with counting fun", "8 shapes to trace and color",
                 "Big 8.5 x 11 in pages", "Certificate of achievement"],
        bg="#43a047", accent="#ffb300", title_fill="#ffffff", art=cover_art, seed=21)
