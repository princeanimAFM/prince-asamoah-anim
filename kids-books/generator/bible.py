"""Peg-doll style Bible figures, animals and scenes (sample).

Every figure shares one simple body: a round head on a flared robe. Characters are
told apart by what they wear and carry (veil, head cloth, crown, beard, staff).
"""
import math

from reportlab.lib.colors import HexColor, white
from reportlab.lib.units import inch

import common as cm
import drawings as D

SKIN = ["#f1c27d", "#c68642", "#8d5524", "#e0ac69"]


def _fill(c, color):
    c.setFillColor(HexColor(color) if D._COLOR else white)


def robe(c, cx, cy, s, color, trim=None):
    """Body: rounded, flared robe from cy - s to cy + 0.45 s."""
    p = c.beginPath()
    p.moveTo(cx - 0.3 * s, cy + 0.42 * s)
    p.curveTo(cx - 0.42 * s, cy + 0.1 * s, cx - 0.55 * s, cy - 0.6 * s, cx - 0.58 * s, cy - 0.92 * s)
    p.curveTo(cx - 0.56 * s, cy - 1.0 * s, cx + 0.56 * s, cy - 1.0 * s, cx + 0.58 * s, cy - 0.92 * s)
    p.curveTo(cx + 0.55 * s, cy - 0.6 * s, cx + 0.42 * s, cy + 0.1 * s, cx + 0.3 * s, cy + 0.42 * s)
    p.curveTo(cx + 0.15 * s, cy + 0.5 * s, cx - 0.15 * s, cy + 0.5 * s, cx - 0.3 * s, cy + 0.42 * s)
    _fill(c, color)
    c.drawPath(p, stroke=1, fill=1)
    if trim:  # a band near the hem
        _fill(c, trim)
        p = c.beginPath()
        p.moveTo(cx - 0.55 * s, cy - 0.72 * s)
        p.curveTo(cx - 0.2 * s, cy - 0.8 * s, cx + 0.2 * s, cy - 0.8 * s, cx + 0.55 * s, cy - 0.72 * s)
        p.lineTo(cx + 0.57 * s, cy - 0.86 * s)
        p.curveTo(cx + 0.2 * s, cy - 0.94 * s, cx - 0.2 * s, cy - 0.94 * s, cx - 0.57 * s, cy - 0.86 * s)
        p.close()
        c.drawPath(p, stroke=1, fill=1)


def belt(c, cx, cy, s, color):
    _fill(c, color)
    c.roundRect(cx - 0.4 * s, cy - 0.2 * s, 0.8 * s, 0.11 * s, 0.04 * s, stroke=1, fill=1)


def face(c, cx, hy, r, lw, skin):
    _fill(c, skin)
    c.circle(cx, hy, r, stroke=1, fill=1)
    D.dot(c, cx - 0.33 * r, hy + 0.08 * r, 0.09 * r)
    D.dot(c, cx + 0.33 * r, hy + 0.08 * r, 0.09 * r)
    D.ink(c, lw * 0.8)
    p = c.beginPath()
    p.arc(cx - 0.32 * r, hy - 0.5 * r, cx + 0.32 * r, hy + 0.05 * r, 205, 130)
    c.drawPath(p, stroke=1, fill=0)
    c.setStrokeColor(HexColor("#e57373") if D._COLOR else cm.INK)
    c.setLineWidth(lw * 0.5)
    for d in (-1, 1):  # rosy cheeks
        c.circle(cx + d * 0.58 * r, hy - 0.22 * r, 0.12 * r, stroke=1, fill=0)
    D.ink(c, lw)


def person(c, cx, cy, s, lw=3, robe_color="blue", trim=None, skin=SKIN[1], hat=None, beard=False,
           hair="#4e342e", belt_color=None, holds=None):
    """A peg-doll figure. hat: None|'hair'|'veil'|'headcloth'|'crown'|'curls'. holds: None|'staff'|'gift'|'sling'."""
    D.ink(c, lw)
    hy, r = cy + 0.72 * s, 0.32 * s
    if holds == "staff":  # behind the figure
        D.tube(c, [(cx + 0.6 * s, cy - s), (cx + 0.6 * s, cy + 0.95 * s)], 0.07 * s, lw, "brown")
        D.tube(c, [(cx + 0.6 * s, cy + 0.95 * s)] + [
            (cx + 0.42 * s + 0.18 * s * math.cos(math.radians(a)), cy + 0.95 * s + 0.18 * s * math.sin(math.radians(a)))
            for a in range(0, 181, 20)], 0.07 * s, lw, "brown")
    if hat == "veil":  # long head covering down to the shoulders, drawn behind the face
        p = c.beginPath()
        p.moveTo(cx - 0.45 * s, cy + 0.3 * s)
        p.curveTo(cx - 0.55 * s, hy + 0.2 * s, cx - 0.35 * s, hy + 0.45 * s, cx, hy + 0.45 * s)
        p.curveTo(cx + 0.35 * s, hy + 0.45 * s, cx + 0.55 * s, hy + 0.2 * s, cx + 0.45 * s, cy + 0.3 * s)
        p.close()
        _fill(c, PALETTE_VEIL)
        c.drawPath(p, stroke=1, fill=1)
    robe(c, cx, cy, s, robe_color, trim)
    if belt_color:
        belt(c, cx, cy, s, belt_color)
    face(c, cx, hy, r, lw, skin)
    if beard:  # sits under the smile so the face stays friendly
        p = c.beginPath()
        p.moveTo(cx - 0.92 * r, hy - 0.25 * r)
        p.curveTo(cx - 0.9 * r, hy - 1.35 * r, cx + 0.9 * r, hy - 1.35 * r, cx + 0.92 * r, hy - 0.25 * r)
        p.curveTo(cx + 0.55 * r, hy - 0.7 * r, cx - 0.55 * r, hy - 0.7 * r, cx - 0.92 * r, hy - 0.25 * r)
        p.close()
        _fill(c, hair)
        c.drawPath(p, stroke=1, fill=1)
    if hat in ("hair", "curls"):
        p = c.beginPath()
        p.moveTo(cx - r * 1.02, hy + 0.1 * r)
        p.curveTo(cx - r * 1.1, hy + 1.45 * r, cx + r * 1.1, hy + 1.45 * r, cx + r * 1.02, hy + 0.1 * r)
        p.curveTo(cx + 0.5 * r, hy + 0.65 * r, cx - 0.5 * r, hy + 0.65 * r, cx - r * 1.02, hy + 0.1 * r)
        _fill(c, hair)
        c.drawPath(p, stroke=1, fill=1)
    elif hat == "veil":
        p = c.beginPath()
        p.moveTo(cx - r * 1.05, hy - 0.1 * r)
        p.curveTo(cx - r * 1.15, hy + 1.5 * r, cx + r * 1.15, hy + 1.5 * r, cx + r * 1.05, hy - 0.1 * r)
        p.curveTo(cx + 0.7 * r, hy + 0.8 * r, cx - 0.7 * r, hy + 0.8 * r, cx - r * 1.05, hy - 0.1 * r)
        _fill(c, PALETTE_VEIL)
        c.drawPath(p, stroke=1, fill=1)
    elif hat == "headcloth":
        p = c.beginPath()
        p.moveTo(cx - r * 1.25, hy - 0.9 * r)
        p.curveTo(cx - r * 1.3, hy + 1.3 * r, cx + r * 1.3, hy + 1.3 * r, cx + r * 1.25, hy - 0.9 * r)
        p.lineTo(cx + r * 0.95, hy - 0.2 * r)
        p.curveTo(cx + r * 0.9, hy + 0.55 * r, cx - r * 0.9, hy + 0.55 * r, cx - r * 0.95, hy - 0.2 * r)
        p.close()
        _fill(c, "#d7ccc8")
        c.drawPath(p, stroke=1, fill=1)
        _fill(c, "#8d6e63")
        c.roundRect(cx - r * 1.0, hy + 0.5 * r, 2.0 * r, 0.22 * r, 0.1 * r, stroke=1, fill=1)
    elif hat == "crown":
        p = c.beginPath()
        p.moveTo(cx - 0.75 * r, hy + 0.7 * r)
        for k, (x, y) in enumerate([(-0.75, 1.5), (-0.37, 1.05), (0, 1.6), (0.37, 1.05), (0.75, 1.5), (0.75, 0.7)]):
            p.lineTo(cx + x * r, hy + y * r)
        p.close()
        _fill(c, "#fdd835")
        c.drawPath(p, stroke=1, fill=1)
        _fill(c, "#e53935")
        c.circle(cx, hy + 1.0 * r, 0.12 * r, stroke=1, fill=1)
    if holds == "gift":
        _fill(c, "#fdd835")
        c.roundRect(cx - 0.22 * s, cy - 0.05 * s, 0.44 * s, 0.32 * s, 0.05 * s, stroke=1, fill=1)
        c.drawPath(cm.star_path(c, cx, cy + 0.11 * s, 0.1 * s, 0.045 * s), stroke=1, fill=0)
        for d in (-1, 1):
            _fill(c, skin)
            c.circle(cx + d * 0.25 * s, cy + 0.08 * s, 0.08 * s, stroke=1, fill=1)
    if holds == "sling":
        c.line(cx + 0.35 * s, cy + 0.1 * s, cx + 0.7 * s, cy - 0.35 * s)
        _fill(c, "#9e9e9e")
        c.circle(cx + 0.72 * s, cy - 0.42 * s, 0.08 * s, stroke=1, fill=1)
        _fill(c, skin)
        c.circle(cx + 0.33 * s, cy + 0.12 * s, 0.08 * s, stroke=1, fill=1)


PALETTE_VEIL = "#64b5f6"


def baby_in_manger(c, cx, cy, s, lw=3, skin=SKIN[1]):
    D.ink(c, lw)
    _fill(c, "#a1887f")
    for d in (-1, 1):  # crossed legs of the manger
        c.line(cx + d * 0.7 * s, cy - 0.65 * s, cx - d * 0.3 * s, cy + 0.05 * s)
    p = c.beginPath()
    p.moveTo(cx - 0.85 * s, cy + 0.2 * s)
    p.lineTo(cx + 0.85 * s, cy + 0.2 * s)
    p.lineTo(cx + 0.6 * s, cy - 0.3 * s)
    p.lineTo(cx - 0.6 * s, cy - 0.3 * s)
    p.close()
    c.drawPath(p, stroke=1, fill=1)
    _fill(c, "#ffe082")  # hay
    pts = [(cx - 0.85 * s + i * 0.17 * s, cy + (0.2 + (0.12 if i % 2 else 0.02)) * s) for i in range(11)]
    D.poly(c, [(cx - 0.85 * s, cy + 0.2 * s)] + pts + [(cx + 0.85 * s, cy + 0.2 * s)])
    _fill(c, "#ffffff")  # swaddled baby
    c.ellipse(cx - 0.55 * s, cy + 0.2 * s, cx + 0.35 * s, cy + 0.58 * s, stroke=1, fill=1)
    for k in range(3):
        x = cx - 0.35 * s + k * 0.2 * s
        c.line(x, cy + 0.24 * s, x + 0.08 * s, cy + 0.54 * s)
    face(c, cx + 0.42 * s, cy + 0.42 * s, 0.2 * s, lw, skin)


def sheep(c, cx, cy, s, lw=3):
    D.ink(c, lw)
    for dx in (-0.35, -0.15, 0.2, 0.4):
        D.tube(c, [(cx + dx * s, cy - 0.2 * s), (cx + dx * s, cy - 0.6 * s)], 0.09 * s, lw, "black")
    D.union(c, [(cx - 0.35 * s, cy, 0.25 * s), (cx, cy + 0.08 * s, 0.3 * s), (cx + 0.35 * s, cy, 0.25 * s),
                (cx, cy - 0.12 * s, 0.28 * s)], lw, "white")
    D.ell(c, cx + 0.62 * s, cy + 0.1 * s, 0.17 * s, 0.22 * s, color="black")
    D.ell(c, cx + 0.5 * s, cy + 0.25 * s, 0.12 * s, 0.05 * s, rot=20, color="black")
    _fill(c, "#ffffff")
    c.circle(cx + 0.66 * s, cy + 0.16 * s, 0.035 * s, stroke=0, fill=1)


def stable(c, cx, cy, w, h, lw=3):
    D.ink(c, lw)
    _fill(c, "#d7b899")
    c.rect(cx - w / 2 + 0.08 * w, cy, 0.06 * w, h * 0.7, stroke=1, fill=1)
    c.rect(cx + w / 2 - 0.14 * w, cy, 0.06 * w, h * 0.7, stroke=1, fill=1)
    _fill(c, "#a1887f")
    D.poly(c, [(cx - w / 2, cy + h * 0.66), (cx, cy + h), (cx + w / 2, cy + h * 0.66),
               (cx + w / 2 - 0.05 * w, cy + h * 0.6), (cx, cy + h * 0.9), (cx - w / 2 + 0.05 * w, cy + h * 0.6)])


def ark(c, cx, cy, s, lw=3):
    D.ink(c, lw)
    _fill(c, "#d7b899")
    c.rect(cx - 0.5 * s, cy + 0.05 * s, 1.0 * s, 0.45 * s, stroke=1, fill=1)
    _fill(c, "#a1887f")
    D.poly(c, [(cx - 0.6 * s, cy + 0.5 * s), (cx, cy + 0.85 * s), (cx + 0.6 * s, cy + 0.5 * s)])
    for wx in (-0.3, 0.12):
        _fill(c, "#b3e5fc")
        c.rect(cx + wx * s, cy + 0.17 * s, 0.18 * s, 0.18 * s, stroke=1, fill=1)
    p = c.beginPath()
    p.moveTo(cx - 1.1 * s, cy + 0.15 * s)
    p.lineTo(cx + 1.1 * s, cy + 0.15 * s)
    p.curveTo(cx + 0.95 * s, cy - 0.45 * s, cx + 0.6 * s, cy - 0.5 * s, cx, cy - 0.5 * s)
    p.curveTo(cx - 0.6 * s, cy - 0.5 * s, cx - 0.95 * s, cy - 0.45 * s, cx - 1.1 * s, cy + 0.15 * s)
    _fill(c, "#8d6e63")
    c.drawPath(p, stroke=1, fill=1)
    p = c.beginPath()
    p.moveTo(cx - 1.02 * s, cy - 0.1 * s)
    p.curveTo(cx - 0.6 * s, cy - 0.2 * s, cx + 0.6 * s, cy - 0.2 * s, cx + 1.02 * s, cy - 0.1 * s)
    c.drawPath(p, stroke=1, fill=0)


def rainbow(c, cx, cy, r, lw=3):
    D.ink(c, lw)
    cols = ["#e53935", "#fb8c00", "#fdd835", "#43a047", "#1e88e5", "#8e24aa"]
    band = r * 0.1
    for k, col in enumerate(cols):
        rr = r - k * band
        p = c.beginPath()
        p.moveTo(cx - rr, cy)
        p.arcTo(cx - rr, cy - rr, cx + rr, cy + rr, 180, -180)
        p.lineTo(cx + rr - band, cy)
        p.arcTo(cx - rr + band, cy - rr + band, cx + rr - band, cy + rr - band, 0, 180)
        p.close()
        _fill(c, col)
        c.drawPath(p, stroke=1, fill=1)


def page(c, title, verse, ref, draw):
    """Coloring page: title, picture in a rounded frame, memory verse at the bottom."""
    cm.centered(c, title, cm.TRIM_H - cm.MARGIN - 34, size=34, max_width=cm.TRIM_W - 2 * cm.MARGIN)
    x0, y0 = cm.MARGIN, cm.MARGIN + 1.35 * inch
    w, h = cm.TRIM_W - 2 * cm.MARGIN, cm.TRIM_H - 2 * cm.MARGIN - 2.2 * inch
    c.setStrokeColor(cm.INK)
    c.setLineWidth(3)
    c.roundRect(x0, y0, w, h, 22, stroke=1, fill=0)
    draw(c, x0, y0, w, h)
    from cookbook import wrap
    lines = wrap(f"“{verse}”", "Regular", 16, w - 0.6 * inch)
    y = cm.MARGIN + 0.95 * inch
    c.setFillColor(cm.INK)
    for line in lines:
        cm.centered(c, line, y, font="Regular", size=16)
        y -= 21
    cm.centered(c, ref + " (WEB)", y - 2, font="Bold", size=13)
    c.showPage()


def nativity(c, x0, y0, w, h):
    cx, base = x0 + w / 2, y0 + 0.9 * inch
    D.ink(c, 3)
    c.line(x0 + 20, base - 0.35 * inch, x0 + w - 20, base - 0.35 * inch)
    stable(c, cx, base - 0.35 * inch, w * 0.86, h * 0.86)
    _fill(c, "#fdd835")
    c.drawPath(cm.star_path(c, cx, y0 + h - 0.55 * inch, 0.42 * inch, 0.17 * inch, points=8), stroke=1, fill=1)
    s = 1.25 * inch
    person(c, cx - 2.0 * inch, base + 0.65 * inch, s, robe_color="#90caf9", hat="veil", skin=SKIN[1])
    person(c, cx + 2.0 * inch, base + 0.65 * inch, s, robe_color="#a1887f", trim="#6d4c41", hat="headcloth",
           beard=True, skin=SKIN[2], belt_color="#6d4c41", holds="staff")
    baby_in_manger(c, cx, base + 0.15 * inch, 0.95 * inch)
    sheep(c, cx - 0.95 * inch, base - 0.6 * inch, 0.36 * inch)
    sheep(c, cx + 0.85 * inch, base - 0.6 * inch, 0.34 * inch)


def noah(c, x0, y0, w, h):
    cx = x0 + w / 2
    rainbow(c, cx, y0 + h * 0.48, w * 0.44)
    D.cloud(c, x0 + 1.0 * inch, y0 + h * 0.5, 0.75 * inch, 3)
    D.cloud(c, x0 + w - 1.0 * inch, y0 + h * 0.5, 0.75 * inch, 3)
    ark(c, cx + 0.6 * inch, y0 + h * 0.3, 1.6 * inch)
    D.waves(c, x0 + 15, x0 + w - 15, y0 + h * 0.2, 9, 3)
    person(c, cx - 2.3 * inch, y0 + h * 0.2, 1.05 * inch, robe_color="#a5d6a7", trim="#2e7d32", hat="hair",
           hair="#bdbdbd", beard=True, skin=SKIN[0], belt_color="#2e7d32", holds="staff")
    sheep(c, x0 + w - 1.2 * inch, y0 + 0.45 * inch, 0.45 * inch)
    sheep(c, x0 + w - 2.3 * inch, y0 + 0.4 * inch, 0.4 * inch)
    D.star(c, x0 + 0.7 * inch, y0 + h - 0.6 * inch, 0.25 * inch, 3)


def lineup(c, x0, y0, w, h):
    """The cast in color, for covers and the sample sheet."""
    figs = [
        ("Mary", dict(robe_color="#90caf9", hat="veil", skin=SKIN[1])),
        ("Joseph", dict(robe_color="#a1887f", trim="#6d4c41", hat="headcloth", beard=True, skin=SKIN[2],
                        belt_color="#6d4c41", holds="staff")),
        ("Noah", dict(robe_color="#a5d6a7", trim="#2e7d32", hat="hair", hair="#bdbdbd", beard=True, skin=SKIN[0],
                      belt_color="#2e7d32", holds="staff")),
        ("Shepherd", dict(robe_color="#ffcc80", hat="headcloth", skin=SKIN[3], belt_color="#6d4c41", holds="staff")),
        ("Wise Man", dict(robe_color="#ce93d8", trim="#fdd835", hat="crown", beard=True, hair="#212121",
                          skin=SKIN[2], belt_color="#fdd835", holds="gift")),
        ("David", dict(robe_color="#ef9a9a", hat="curls", hair="#5d4037", skin=SKIN[1], belt_color="#8d6e63",
                       holds="sling")),
    ]
    s = min(w / (len(figs) * 1.55), h / 3.0)
    for k, (name, kw) in enumerate(figs):
        cx = x0 + w * (k + 0.5) / len(figs)
        person(c, cx, y0 + h * 0.5, s, **kw)
        c.setFont("Bold", s * 0.23)
        c.setFillColor(cm.INK)
        c.drawCentredString(cx, y0 + h * 0.5 - 1.35 * s, name)


def build_sample(path):
    c = cm.new_interior(path, "Bible Stories Coloring Book: sample pages")
    D.colored(True)
    cm.centered(c, "Meet the Characters", cm.TRIM_H - cm.MARGIN - 34, size=34)
    cm.centered(c, "(cover style, in color)", cm.TRIM_H - cm.MARGIN - 60, font="Regular", size=14)
    lineup(c, cm.MARGIN, cm.TRIM_H * 0.5, cm.TRIM_W - 2 * cm.MARGIN, cm.TRIM_H * 0.38)
    baby_in_manger(c, cm.TRIM_W * 0.3, cm.TRIM_H * 0.3, 1.0 * inch)
    sheep(c, cm.TRIM_W * 0.68, cm.TRIM_H * 0.3, 0.8 * inch)
    ark(c, cm.TRIM_W / 2, cm.MARGIN + 0.9 * inch, 1.2 * inch)
    c.showPage()
    D.colored(False)
    page(c, "Jesus Is Born", "For there is born to you today, in David’s city, a Savior, who is Christ the Lord.",
         "Luke 2:11", nativity)
    page(c, "Noah and the Rainbow",
         "I set my rainbow in the cloud, and it will be a sign of a covenant between me and the earth.",
         "Genesis 9:13", noah)
    c.save()


if __name__ == "__main__":
    import sys
    build_sample(sys.argv[1])
