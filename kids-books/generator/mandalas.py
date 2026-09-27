"""Book: Mandala Coloring Book for Kids -- 50 bold, simple, original mandalas (single-sided)."""
import math
import random

from reportlab.lib.colors import HexColor, white
from reportlab.lib.units import inch

import common as cm

TITLE = ["Mandala Coloring", "Book for Kids"]
SUBTITLE = "50 Big & Easy Designs for Relaxing Fun"
SAMPLE_PAGE = 5  # page shown in sample-page.png (0-based)
FULL_TITLE = ("Mandala Coloring Book for Kids: 50 Big & Easy Designs for Relaxing Fun, "
              "Ages 6-12")
COUNT = 50
PALETTE = ["#ef5350", "#ffa726", "#ffee58", "#66bb6a", "#29b6f6", "#7e57c2", "#ec407a", "#26a69a"]


def motif_path(c, kind, cx, cy, r_in, r_out, angle, half_w):
    """One motif between radii r_in and r_out, centred on `angle` (radians)."""
    def pt(r, a):
        return cx + r * math.cos(a), cy + r * math.sin(a)

    p = c.beginPath()
    mid = (r_in + r_out) / 2
    if kind == "petal":
        p.moveTo(*pt(r_in, angle))
        p.curveTo(*pt(mid, angle - half_w * 1.4), *pt(r_out * 0.95, angle - half_w * 0.6), *pt(r_out, angle))
        p.curveTo(*pt(r_out * 0.95, angle + half_w * 0.6), *pt(mid, angle + half_w * 1.4), *pt(r_in, angle))
    elif kind == "tear":
        p.moveTo(*pt(r_out, angle))
        p.curveTo(*pt(mid, angle - half_w * 0.5), *pt(r_in, angle - half_w * 1.1), *pt(r_in, angle))
        p.curveTo(*pt(r_in, angle + half_w * 1.1), *pt(mid, angle + half_w * 0.5), *pt(r_out, angle))
    elif kind == "spike":
        p.moveTo(*pt(r_in, angle - half_w))
        p.lineTo(*pt(r_out, angle))
        p.lineTo(*pt(r_in, angle + half_w))
        p.close()
        return p
    elif kind == "arch":
        steps = 16
        p.moveTo(*pt(r_in, angle - half_w))
        for i in range(steps + 1):
            a = angle - half_w + 2 * half_w * i / steps
            r = r_in + (r_out - r_in) * math.sin(math.pi * i / steps)
            p.lineTo(*pt(r, a))
    elif kind == "dot":
        x, y = pt(mid, angle)
        rad = min((r_out - r_in) / 2, mid * math.sin(half_w)) * 0.8
        p.circle(x, y, rad)
        return p
    elif kind == "heart":
        x, y = pt(mid, angle)
        s = min((r_out - r_in) / 2.2, mid * math.sin(half_w) * 0.9)
        p = c.beginPath()
        # Heart pointing to the centre
        rot = angle - math.pi / 2
        pts = [(0, -1), (-1.4, -0.1), (-0.9, 1.0), (0, 0.45), (0.9, 1.0), (1.4, -0.1), (0, -1)]
        tr = [(x + s * (u * math.cos(rot) - v * math.sin(rot)), y + s * (u * math.sin(rot) + v * math.cos(rot)))
              for u, v in pts]
        p.moveTo(*tr[0])
        p.curveTo(*tr[1], *tr[2], *tr[3])
        p.curveTo(*tr[4], *tr[5], *tr[6])
        p.close()
        return p
    p.close()
    return p


def draw_mandala(c, cx, cy, R, rnd, colored=False, line_w=2.4, simple=False):
    """simple=True gives fewer, larger spaces (for seniors and early learners)."""
    c.setLineJoin(1)
    c.setStrokeColor(cm.INK)
    c.setLineWidth(line_w)
    n = rnd.choice([6, 8]) if simple else rnd.choice([8, 10, 12, 12, 16])
    radii = [R]
    ring_count = rnd.randint(2, 3) if simple else rnd.randint(5, 7)
    for _ in range(ring_count):
        radii.append(radii[-1] * (rnd.uniform(0.55, 0.65) if simple else rnd.uniform(0.7, 0.82)))
    colors = PALETTE[:]
    rnd.shuffle(colors)

    def fill(i):
        if colored:
            c.setFillColor(HexColor(colors[i % len(colors)]))
        else:
            c.setFillColor(white)

    # Outer ring to inner: each later layer paints over the previous one.
    for i in range(len(radii) - 1):
        r_out, r_in = radii[i], radii[i + 1]
        kinds = ["petal", "tear", "spike", "arch", "dot", "heart"] if i else ["petal", "arch", "spike"]
        kind = rnd.choice(kinds)
        count = n * (2 if (kind in ("dot", "heart") and i < 2) else 1)
        offset = (math.pi / count) if i % 2 else 0
        half_w = math.pi / count
        if kind in ("dot", "heart"):
            fill(i + 3)
            c.circle(cx, cy, r_out, stroke=1, fill=1)
        for k in range(count):
            a = offset + 2 * math.pi * k / count
            fill(i if kind not in ("dot", "heart") else i + 1)
            c.drawPath(motif_path(c, kind, cx, cy, r_in * 0.9, r_out, a, half_w), stroke=1, fill=1)
        if rnd.random() < 0.5 and kind not in ("dot", "heart"):
            fill(i + 5)
            c.circle(cx, cy, r_in * 0.95, stroke=1, fill=1)
    # Centre flower
    r = radii[-1]
    fill(2)
    c.circle(cx, cy, r, stroke=1, fill=1)
    fill(4)
    for k in range(n // 2):
        c.drawPath(motif_path(c, "petal", cx, cy, 0, r * 0.95, 2 * math.pi * k / (n // 2), math.pi / (n // 2)),
                   stroke=1, fill=1)
    fill(6)
    c.circle(cx, cy, r * 0.28, stroke=1, fill=1)


def build_interior(path, seed=512):
    rnd = random.Random(seed)
    c = cm.new_interior(path, FULL_TITLE)
    cm.title_page(c, TITLE, SUBTITLE)
    cm.copyright_page(c, FULL_TITLE)
    cm.belongs_to_page(c)
    # Color test page
    cm.centered(c, "Test Your Colors Here", cm.TRIM_H - cm.MARGIN - 40, size=32)
    c.setLineWidth(2)
    for i in range(24):
        col, row = i % 4, i // 4
        cx = cm.TRIM_W / 2 + (col - 1.5) * 1.6 * inch
        cy = cm.TRIM_H - cm.MARGIN - 1.6 * inch - row * 1.4 * inch
        c.drawPath(cm.heart_path(c, cx, cy, 0.45 * inch) if (i % 2) else
                   cm.star_path(c, cx, cy, 0.6 * inch, 0.26 * inch), stroke=1, fill=0)
    c.showPage()
    c.showPage()  # blank back so the first design starts on a right-hand page
    pages = 5
    R = (cm.TRIM_W - 2 * cm.MARGIN) / 2 - 0.1 * inch
    for n in range(1, COUNT + 1):
        draw_mandala(c, cm.TRIM_W / 2, cm.TRIM_H / 2 + 0.25 * inch, R, rnd)
        c.setFont("Regular", 11)
        c.setFillColor(cm.INK)
        c.drawCentredString(cm.TRIM_W / 2, cm.MARGIN, f"Design {n}  •  Colored by: ______________________")
        c.showPage()
        c.showPage()  # single-sided: blank back stops markers bleeding through
        pages += 2
    cm.certificate_page(c, "is a Mandala Master Artist!", "for coloring 50 beautiful designs")
    pages += 1
    pages = cm.pad_to_even(c, pages)
    c.save()
    return pages


def cover_art(c, x, y, w, h, accent):
    R = min(w, h) / 2
    draw_mandala(c, x + w / 2, y + h / 2, R, random.Random(99), colored=True, line_w=3.5)


def build_cover(path, pages):
    return cm.make_cover(
        path, pages, title_lines=TITLE, subtitle=SUBTITLE, badge=["AGES", "6-12"],
        blurb=["Calm, creative fun for young artists!",
               "50 original mandalas with bold outlines and",
               "big spaces that are easy to color with crayons,",
               "colored pencils, or markers."],
        bullets=["50 unique, original designs", "Thick lines & big spaces",
                 "Single-sided pages: no bleed-through", "Color test page",
                 "Large 8.5 x 11 in format", "Great gift for creative kids"],
        bg="#00897b", accent="#ff7043", title_fill="#ffffff", art=cover_art, seed=41)
