"""Code-drawn illustrations for coloring pages and covers.

Every function draws one object centred on (cx, cy) with overall half-size `s` (points).
In coloring mode (default) shapes are white with black outlines; `colored(True)` gives
flat colors for covers.
"""
import math
import random

from reportlab.lib.colors import HexColor, white

import common as cm

_COLOR = False
PALETTE = {
    "green": "#43a047", "dkgreen": "#2e7d32", "red": "#e53935", "yellow": "#fdd835", "orange": "#fb8c00",
    "brown": "#8d6e63", "blue": "#42a5f5", "ltblue": "#b3e5fc", "purple": "#8e24aa", "pink": "#f48fb1",
    "white": "#ffffff", "black": "#424242", "grey": "#cfd8dc", "tan": "#d7a86e", "cream": "#fff8e1",
}


def colored(on):
    global _COLOR
    _COLOR = on


def fill(c, name):
    c.setFillColor(HexColor(PALETTE[name]) if _COLOR else white)


def ink(c, w):
    c.setStrokeColor(cm.INK)
    c.setLineWidth(w)
    c.setLineJoin(1)
    c.setLineCap(1)


def poly(c, pts, close=True, stroke=1, do_fill=1):
    p = c.beginPath()
    p.moveTo(*pts[0])
    for pt in pts[1:]:
        p.lineTo(*pt)
    if close:
        p.close()
    c.drawPath(p, stroke=stroke, fill=do_fill if close else 0)


def ell(c, cx, cy, rx, ry, rot=0, color="white"):
    fill(c, color)
    c.saveState()
    c.translate(cx, cy)
    c.rotate(rot)
    c.ellipse(-rx, -ry, rx, ry, stroke=1, fill=1)
    c.restoreState()


def circ(c, cx, cy, r, color="white"):
    fill(c, color)
    c.circle(cx, cy, r, stroke=1, fill=1)


def dot(c, cx, cy, r):
    c.setFillColor(cm.INK)
    c.circle(cx, cy, r, stroke=0, fill=1)


def curve(c, pts, close=False, color=None):
    """pts: [start, (c1, c2, end), (c1, c2, end), ...] cubic bezier chain."""
    p = c.beginPath()
    p.moveTo(*pts[0])
    for c1, c2, e in pts[1:]:
        p.curveTo(*c1, *c2, *e)
    if close:
        p.close()
    if color:
        fill(c, color)
    c.drawPath(p, stroke=1, fill=1 if (close and color) else 0)


def tube(c, pts, width, lw, color="white"):
    """Thick outlined stroke (candy cane, stems, arms)."""
    p = c.beginPath()
    p.moveTo(*pts[0])
    for pt in pts[1:]:
        p.lineTo(*pt)
    c.saveState()
    c.setLineCap(1)
    c.setLineJoin(1)
    c.setStrokeColor(cm.INK)
    c.setLineWidth(width + 2 * lw)
    c.drawPath(p, stroke=1, fill=0)
    c.setStrokeColor(HexColor(PALETTE[color]) if _COLOR else white)
    c.setLineWidth(width)
    c.drawPath(p, stroke=1, fill=0)
    c.restoreState()


def union(c, circles, lw, color="white", ellipses=()):
    """Outline of overlapping circles/ellipses as one smooth blob (clouds, bushes, snowmen)."""
    c.saveState()
    c.setFillColor(cm.INK)
    for x, y, r in circles:
        c.circle(x, y, r + lw, stroke=0, fill=1)
    for x, y, rx, ry in ellipses:
        c.ellipse(x - rx - lw, y - ry - lw, x + rx + lw, y + ry + lw, stroke=0, fill=1)
    c.setFillColor(HexColor(PALETTE[color]) if _COLOR else white)
    for x, y, r in circles:
        c.circle(x, y, r, stroke=0, fill=1)
    for x, y, rx, ry in ellipses:
        c.ellipse(x - rx, y - ry, x + rx, y + ry, stroke=0, fill=1)
    c.restoreState()


def smile(c, cx, cy, r, lw):
    c.setLineWidth(lw)
    p = c.beginPath()
    p.arc(cx - r, cy - r, cx + r, cy + r, 200, 140)
    c.drawPath(p, stroke=1, fill=0)


# ---- Christmas ---------------------------------------------------------------

def christmas_tree(c, cx, cy, s, lw=3):
    ink(c, lw)
    fill(c, "brown")
    c.rect(cx - 0.12 * s, cy - s, 0.24 * s, 0.28 * s, stroke=1, fill=1)
    for w, yb, yt in ((0.8, -0.75, -0.05), (0.63, -0.35, 0.35), (0.45, 0.05, 0.72)):
        fill(c, "green")
        poly(c, [(cx - w * s, cy + yb * s), (cx + w * s, cy + yb * s), (cx, cy + yt * s)])
    for i, (ox, oy) in enumerate(((-0.4, -0.62), (0.15, -0.5), (0.5, -0.66), (-0.25, -0.18),
                                  (0.28, -0.1), (0, 0.22), (-0.15, 0.4), (0.18, 0.28))):
        circ(c, cx + ox * s, cy + oy * s, 0.065 * s, ("red", "yellow", "blue")[i % 3])
    fill(c, "yellow")
    c.drawPath(cm.star_path(c, cx, cy + 0.8 * s, 0.19 * s, 0.08 * s), stroke=1, fill=1)


def gift(c, cx, cy, s, lw=3, box="red", ribbon="yellow"):
    ink(c, lw)
    fill(c, box)
    c.rect(cx - 0.6 * s, cy - 0.8 * s, 1.2 * s, 1.0 * s, stroke=1, fill=1)
    c.rect(cx - 0.7 * s, cy + 0.2 * s, 1.4 * s, 0.28 * s, stroke=1, fill=1)
    fill(c, ribbon)
    c.rect(cx - 0.12 * s, cy - 0.8 * s, 0.24 * s, 1.28 * s, stroke=1, fill=1)
    for d in (-1, 1):
        curve(c, [(cx, cy + 0.48 * s), ((cx + d * 0.2 * s, cy + 0.95 * s), (cx + d * 0.65 * s, cy + 0.85 * s),
                                        (cx + d * 0.05 * s, cy + 0.48 * s))], close=True, color=ribbon)
    circ(c, cx, cy + 0.5 * s, 0.09 * s, ribbon)


def ornament(c, cx, cy, s, lw=3):
    ink(c, lw)
    fill(c, "grey")
    c.rect(cx - 0.18 * s, cy + 0.55 * s, 0.36 * s, 0.2 * s, stroke=1, fill=1)
    p = c.beginPath()
    p.arc(cx - 0.12 * s, cy + 0.72 * s, cx + 0.12 * s, cy + 0.96 * s, 0, 180)
    c.drawPath(p, stroke=1, fill=0)
    circ(c, cx, cy - 0.05 * s, 0.62 * s, "red")
    c.saveState()
    p = c.beginPath()
    p.circle(cx, cy - 0.05 * s, 0.62 * s)
    c.clipPath(p, stroke=0, fill=0)
    for yy in (0.2, -0.3):
        zz = [(cx - 0.7 * s + i * 0.14 * s, cy + (yy + (0.08 if i % 2 else -0.08)) * s) for i in range(11)]
        poly(c, zz, close=False)
    c.restoreState()
    c.drawPath(cm.star_path(c, cx, cy - 0.05 * s, 0.16 * s, 0.07 * s), stroke=1, fill=0)


def candy_cane(c, cx, cy, s, lw=3):
    pts = [(cx + 0.2 * s, cy - 0.9 * s), (cx + 0.2 * s, cy + 0.35 * s)]
    for i in range(0, 181, 15):
        a = math.radians(i)
        pts.append((cx + 0.2 * s - 0.3 * s + 0.3 * s * math.cos(a), cy + 0.35 * s + 0.3 * s * math.sin(a)))
    pts.append((cx - 0.4 * s, cy + 0.15 * s))
    tube(c, pts, 0.22 * s, lw, "white")
    ink(c, lw * 0.8)
    for i in range(6):
        y = cy - 0.8 * s + i * 0.22 * s
        c.line(cx + 0.09 * s, y, cx + 0.31 * s, y + 0.12 * s)


def snowman(c, cx, cy, s, lw=3):
    ink(c, lw)
    union(c, [(cx, cy - 0.5 * s, 0.45 * s), (cx, cy + 0.12 * s, 0.33 * s), (cx, cy + 0.6 * s, 0.24 * s)], lw)
    for d in (-1, 1):  # arms
        c.setLineWidth(lw)
        c.line(cx + d * 0.3 * s, cy + 0.15 * s, cx + d * 0.72 * s, cy + 0.42 * s)
        c.line(cx + d * 0.62 * s, cy + 0.36 * s, cx + d * 0.66 * s, cy + 0.52 * s)
    for dy in (0.25, 0.1, -0.05):
        dot(c, cx, cy + dy * s, 0.035 * s)
    dot(c, cx - 0.08 * s, cy + 0.66 * s, 0.03 * s)
    dot(c, cx + 0.08 * s, cy + 0.66 * s, 0.03 * s)
    fill(c, "orange")
    poly(c, [(cx, cy + 0.6 * s), (cx + 0.25 * s, cy + 0.56 * s), (cx, cy + 0.54 * s)])
    smile(c, cx, cy + 0.56 * s, 0.1 * s, lw * 0.8)
    ink(c, lw)
    fill(c, "black")
    c.rect(cx - 0.3 * s, cy + 0.78 * s, 0.6 * s, 0.07 * s, stroke=1, fill=1)
    c.rect(cx - 0.18 * s, cy + 0.85 * s, 0.36 * s, 0.3 * s, stroke=1, fill=1)
    fill(c, "red")
    c.rect(cx - 0.27 * s, cy + 0.33 * s, 0.54 * s, 0.1 * s, stroke=1, fill=1)
    c.rect(cx + 0.08 * s, cy + 0.05 * s, 0.1 * s, 0.3 * s, stroke=1, fill=1)


def stocking(c, cx, cy, s, lw=3):
    ink(c, lw)
    curve(c, [(cx - 0.35 * s, cy + 0.5 * s),
              ((cx - 0.35 * s, cy + 0.0), (cx - 0.3 * s, cy - 0.2 * s), (cx - 0.3 * s, cy - 0.3 * s)),
              ((cx - 0.3 * s, cy - 0.75 * s), (cx + 0.1 * s, cy - 0.9 * s), (cx + 0.45 * s, cy - 0.75 * s)),
              ((cx + 0.75 * s, cy - 0.62 * s), (cx + 0.7 * s, cy - 0.25 * s), (cx + 0.3 * s, cy - 0.2 * s)),
              ((cx + 0.25 * s, cy - 0.2 * s), (cx + 0.25 * s, cy + 0.2 * s), (cx + 0.25 * s, cy + 0.5 * s))],
          close=True, color="red")
    fill(c, "white")
    c.roundRect(cx - 0.45 * s, cy + 0.45 * s, 0.8 * s, 0.3 * s, 0.08 * s, stroke=1, fill=1)
    c.drawPath(cm.star_path(c, cx - 0.02 * s, cy - 0.15 * s, 0.16 * s, 0.07 * s), stroke=1, fill=0)


def bell(c, cx, cy, s, lw=3):
    ink(c, lw)
    circ(c, cx, cy - 0.62 * s, 0.13 * s, "yellow")
    curve(c, [(cx - 0.65 * s, cy - 0.5 * s),
              ((cx - 0.4 * s, cy - 0.3 * s), (cx - 0.5 * s, cy + 0.55 * s), (cx, cy + 0.6 * s)),
              ((cx + 0.5 * s, cy + 0.55 * s), (cx + 0.4 * s, cy - 0.3 * s), (cx + 0.65 * s, cy - 0.5 * s))],
          close=True, color="yellow")
    for d in (-1, 1):
        curve(c, [(cx, cy + 0.62 * s), ((cx + d * 0.3 * s, cy + 1.0 * s), (cx + d * 0.6 * s, cy + 0.8 * s),
                                        (cx + d * 0.08 * s, cy + 0.62 * s))], close=True, color="red")
    circ(c, cx, cy + 0.64 * s, 0.08 * s, "red")


def mitten(c, cx, cy, s, lw=3):
    ink(c, lw)
    curve(c, [(cx - 0.35 * s, cy - 0.45 * s),
              ((cx - 0.5 * s, cy + 0.1 * s), (cx - 0.45 * s, cy + 0.75 * s), (cx + 0.02 * s, cy + 0.75 * s)),
              ((cx + 0.45 * s, cy + 0.75 * s), (cx + 0.42 * s, cy + 0.25 * s), (cx + 0.38 * s, cy + 0.05 * s)),
              ((cx + 0.55 * s, cy + 0.3 * s), (cx + 0.8 * s, cy + 0.15 * s), (cx + 0.6 * s, cy - 0.1 * s)),
              ((cx + 0.45 * s, cy - 0.28 * s), (cx + 0.38 * s, cy - 0.35 * s), (cx + 0.35 * s, cy - 0.45 * s))],
          close=True, color="blue")
    fill(c, "white")
    c.roundRect(cx - 0.42 * s, cy - 0.75 * s, 0.84 * s, 0.32 * s, 0.08 * s, stroke=1, fill=1)
    c.drawPath(cm.heart_path(c, cx - 0.02 * s, cy + 0.2 * s, 0.14 * s), stroke=1, fill=0)


def gingerbread(c, cx, cy, s, lw=3):
    ink(c, lw)
    c.saveState()
    body = [((cx - 0.55 * s, cy + 0.2 * s), (cx + 0.55 * s, cy + 0.2 * s)),
            ((cx - 0.08 * s, cy - 0.2 * s), (cx - 0.35 * s, cy - 0.85 * s)),
            ((cx + 0.08 * s, cy - 0.2 * s), (cx + 0.35 * s, cy - 0.85 * s))]
    for pass_w, col in ((0.26 * s + 2 * lw, cm.INK), (0.26 * s, None)):
        c.setStrokeColor(col if col else (HexColor(PALETTE["tan"]) if _COLOR else white))
        c.setFillColor(col if col else (HexColor(PALETTE["tan"]) if _COLOR else white))
        c.setLineWidth(pass_w)
        c.setLineCap(1)
        for a, b in body:
            c.line(*a, *b)
        extra = lw if col else 0
        c.circle(cx, cy + 0.55 * s, 0.3 * s + extra, stroke=0, fill=1)
        c.ellipse(cx - 0.3 * s - extra, cy - 0.35 * s - extra, cx + 0.3 * s + extra, cy + 0.3 * s + extra,
                  stroke=0, fill=1)
    c.restoreState()
    ink(c, lw)
    dot(c, cx - 0.1 * s, cy + 0.6 * s, 0.035 * s)
    dot(c, cx + 0.1 * s, cy + 0.6 * s, 0.035 * s)
    smile(c, cx, cy + 0.52 * s, 0.12 * s, lw * 0.8)
    for dy in (0.12, -0.05):
        circ(c, cx, cy + dy * s, 0.05 * s, "red")
    for d in (-1, 1):  # icing zigzags
        pts = [(cx + d * (0.38 + 0.04 * (i % 2)) * s, cy + (0.28 - 0.04 * i) * s) for i in range(4)]
        poly(c, [(x, y) for x, y in pts], close=False)


def snowflake(c, cx, cy, s, lw=2.5):
    ink(c, lw)
    for k in range(6):
        a = math.radians(90 + 60 * k)
        ex, ey = cx + s * math.cos(a), cy + s * math.sin(a)
        c.line(cx, cy, ex, ey)
        for t, l in ((0.45, 0.28), (0.72, 0.2)):
            bx, by = cx + t * s * math.cos(a), cy + t * s * math.sin(a)
            for d in (-1, 1):
                b = a + d * math.radians(45)
                c.line(bx, by, bx + l * s * math.cos(b), by + l * s * math.sin(b))
    circ(c, cx, cy, 0.12 * s)


def holly(c, cx, cy, s, lw=3):
    ink(c, lw)
    for d in (-1, 1):
        ex = cx + d * 0.9 * s
        pts = [(cx, cy)]
        for i in range(1, 6):
            t = i / 6
            x = cx + d * 0.9 * s * t
            pts.append((x, cy + (0.28 if i % 2 else 0.18) * s * math.sin(math.pi * t) + 0.12 * s * t))
        pts.append((ex, cy + 0.12 * s))
        for i in range(5, 0, -1):
            t = i / 6
            x = cx + d * 0.9 * s * t
            pts.append((x, cy - (0.28 if i % 2 else 0.18) * s * math.sin(math.pi * t) + 0.12 * s * t))
        fill(c, "green")
        poly(c, pts)
        c.line(cx, cy, ex, cy + 0.12 * s)
    for ox, oy in ((-0.12, 0.12), (0.12, 0.12), (0, -0.08)):
        circ(c, cx + ox * s, cy + oy * s, 0.13 * s, "red")


# ---- Halloween ---------------------------------------------------------------

def pumpkin(c, cx, cy, s, lw=3, face=True):
    ink(c, lw)
    fill(c, "dkgreen")
    poly(c, [(cx - 0.08 * s, cy + 0.5 * s), (cx - 0.02 * s, cy + 0.85 * s), (cx + 0.18 * s, cy + 0.9 * s),
             (cx + 0.1 * s, cy + 0.5 * s)])
    for ox, rx in ((-0.45, 0.5), (0.45, 0.5), (-0.2, 0.45), (0.2, 0.45), (0, 0.42)):
        ell(c, cx + ox * s, cy, rx * s, 0.62 * s, color="orange")
    if face:
        fill(c, "black" if _COLOR else "white")
        for d in (-1, 1):
            poly(c, [(cx + d * 0.32 * s, cy + 0.08 * s), (cx + d * 0.12 * s, cy + 0.08 * s),
                     (cx + d * 0.22 * s, cy + 0.3 * s)])
        poly(c, [(cx - 0.05 * s, cy - 0.02 * s), (cx + 0.05 * s, cy - 0.02 * s), (cx, cy + 0.08 * s)])
        pts = [(cx - 0.42 * s, cy - 0.15 * s)]
        for i in range(9):
            t = i / 8
            pts.append((cx - 0.42 * s + 0.84 * s * t, cy - 0.3 * s - 0.12 * s * math.sin(math.pi * t)
                        + (0.06 * s if i % 2 else 0)))
        pts.append((cx + 0.42 * s, cy - 0.15 * s))
        for i in range(8, -1, -1):
            t = i / 8
            pts.append((cx - 0.42 * s + 0.84 * s * t, cy - 0.2 * s - 0.2 * s * math.sin(math.pi * t)))
        poly(c, pts)


def ghost(c, cx, cy, s, lw=3):
    ink(c, lw)
    pts = [(cx - 0.55 * s, cy - 0.7 * s)]
    p = c.beginPath()
    p.moveTo(cx - 0.55 * s, cy - 0.7 * s)
    p.lineTo(cx - 0.55 * s, cy + 0.25 * s)
    p.curveTo(cx - 0.55 * s, cy + 1.0 * s, cx + 0.55 * s, cy + 1.0 * s, cx + 0.55 * s, cy + 0.25 * s)
    p.lineTo(cx + 0.55 * s, cy - 0.7 * s)
    for i in range(4):
        x0 = cx + 0.55 * s - i * 0.275 * s
        p.curveTo(x0 - 0.05 * s, cy - 0.95 * s, x0 - 0.22 * s, cy - 0.95 * s, x0 - 0.275 * s, cy - 0.7 * s)
    p.close()
    fill(c, "white")
    c.drawPath(p, stroke=1, fill=1)
    fill(c, "black")
    for d in (-1, 1):
        ell(c, cx + d * 0.2 * s, cy + 0.3 * s, 0.09 * s, 0.14 * s, color="black")
    ell(c, cx, cy + 0.02 * s, 0.1 * s, 0.13 * s, color="black")
    for d in (-1, 1):  # arms
        curve(c, [(cx + d * 0.55 * s, cy + 0.05 * s),
                  ((cx + d * 0.85 * s, cy + 0.1 * s), (cx + d * 0.85 * s, cy + 0.35 * s), (cx + d * 0.75 * s, cy + 0.4 * s))])


def bat(c, cx, cy, s, lw=3):
    ink(c, lw)
    pts = []
    for d in (-1, 1):
        wing = [(cx + d * 0.15 * s, cy + 0.1 * s), (cx + d * 0.55 * s, cy + 0.45 * s), (cx + d * 1.0 * s, cy + 0.3 * s),
                (cx + d * 0.85 * s, cy - 0.05 * s), (cx + d * 0.72 * s, cy - 0.3 * s),
                (cx + d * 0.55 * s, cy - 0.12 * s), (cx + d * 0.4 * s, cy - 0.3 * s), (cx + d * 0.15 * s, cy - 0.15 * s)]
        fill(c, "purple")
        poly(c, wing)
    ell(c, cx, cy - 0.02 * s, 0.2 * s, 0.3 * s, color="purple")
    for d in (-1, 1):
        fill(c, "purple")
        poly(c, [(cx + d * 0.04 * s, cy + 0.34 * s), (cx + d * 0.2 * s, cy + 0.5 * s), (cx + d * 0.17 * s, cy + 0.26 * s)])
        circ(c, cx + d * 0.08 * s, cy + 0.1 * s, 0.055 * s, "yellow")
        dot(c, cx + d * 0.08 * s, cy + 0.1 * s, 0.02 * s)
    smile(c, cx, cy + 0.0 * s, 0.07 * s, lw * 0.7)


def witch_hat(c, cx, cy, s, lw=3):
    ink(c, lw)
    ell(c, cx, cy - 0.5 * s, 0.9 * s, 0.2 * s, color="purple")
    curve(c, [(cx - 0.45 * s, cy - 0.5 * s),
              ((cx - 0.25 * s, cy + 0.1 * s), (cx - 0.1 * s, cy + 0.6 * s), (cx + 0.35 * s, cy + 0.9 * s)),
              ((cx + 0.15 * s, cy + 0.5 * s), (cx + 0.3 * s, cy + 0.0), (cx + 0.45 * s, cy - 0.5 * s))],
          close=True, color="purple")
    fill(c, "orange")
    poly(c, [(cx - 0.41 * s, cy - 0.4 * s), (cx + 0.43 * s, cy - 0.4 * s), (cx + 0.4 * s, cy - 0.22 * s),
             (cx - 0.36 * s, cy - 0.22 * s)])
    fill(c, "yellow")
    c.rect(cx - 0.1 * s, cy - 0.41 * s, 0.2 * s, 0.2 * s, stroke=1, fill=1)
    fill(c, "purple")
    c.rect(cx - 0.05 * s, cy - 0.36 * s, 0.1 * s, 0.1 * s, stroke=1, fill=1)


def candy(c, cx, cy, s, lw=3):
    ink(c, lw)
    for d in (-1, 1):
        fill(c, "pink")
        poly(c, [(cx + d * 0.3 * s, cy), (cx + d * 0.75 * s, cy + 0.3 * s), (cx + d * 0.65 * s, cy),
                 (cx + d * 0.75 * s, cy - 0.3 * s)])
    circ(c, cx, cy, 0.34 * s, "pink")
    p = c.beginPath()
    p.arc(cx - 0.22 * s, cy - 0.22 * s, cx + 0.22 * s, cy + 0.22 * s, 30, 120)
    c.drawPath(p, stroke=1, fill=0)


def candy_corn(c, cx, cy, s, lw=3):
    ink(c, lw)
    p = c.beginPath()
    p.moveTo(cx, cy + 0.8 * s)
    p.curveTo(cx - 0.3 * s, cy + 0.4 * s, cx - 0.55 * s, cy - 0.3 * s, cx - 0.5 * s, cy - 0.6 * s)
    p.curveTo(cx - 0.2 * s, cy - 0.75 * s, cx + 0.2 * s, cy - 0.75 * s, cx + 0.5 * s, cy - 0.6 * s)
    p.curveTo(cx + 0.55 * s, cy - 0.3 * s, cx + 0.3 * s, cy + 0.4 * s, cx, cy + 0.8 * s)
    fill(c, "yellow")
    c.drawPath(p, stroke=1, fill=1)
    for y, w in ((-0.25, 0.47), (0.25, 0.33)):
        curve(c, [(cx - w * s, cy + y * s), ((cx - 0.2 * s, cy + (y - 0.08) * s), (cx + 0.2 * s, cy + (y - 0.08) * s),
                                             (cx + w * s, cy + y * s))])


def moon(c, cx, cy, s, lw=3):
    ink(c, lw)
    pts = crescent_points(cx, cy, s)
    fill(c, "yellow")
    poly(c, pts)


def crescent_points(cx, cy, s, n=40):
    r1, r2, d = s, 0.85 * s, 0.5 * s
    x = (d * d + r1 * r1 - r2 * r2) / (2 * d)
    y = math.sqrt(max(r1 * r1 - x * x, 0))
    a1 = math.atan2(y, x)
    a2 = math.atan2(y, x - d)
    pts = []
    for i in range(n + 1):
        a = a1 + (2 * math.pi - 2 * a1) * i / n
        pts.append((cx + r1 * math.cos(a), cy + r1 * math.sin(a)))
    for i in range(n + 1):  # inner edge: the left side of the second circle, bottom to top
        a = (2 * math.pi - a2) - (2 * math.pi - 2 * a2) * i / n
        pts.append((cx + d + r2 * math.cos(a), cy + r2 * math.sin(a)))
    return pts


def spider_web(c, cx, cy, s, lw=2):
    ink(c, lw)
    n = 8
    for k in range(n):
        a = 2 * math.pi * k / n
        c.line(cx, cy, cx + s * math.cos(a), cy + s * math.sin(a))
    for r in (0.25, 0.45, 0.65, 0.85):
        for k in range(n):
            a1, a2 = 2 * math.pi * k / n, 2 * math.pi * (k + 1) / n
            p1 = (cx + r * s * math.cos(a1), cy + r * s * math.sin(a1))
            p2 = (cx + r * s * math.cos(a2), cy + r * s * math.sin(a2))
            m = (cx + r * s * 0.85 * math.cos((a1 + a2) / 2), cy + r * s * 0.85 * math.sin((a1 + a2) / 2))
            curve(c, [p1, (m, m, p2)])


def spider(c, cx, cy, s, lw=3):
    ink(c, lw)
    c.line(cx, cy + 0.3 * s, cx, cy + s)
    for d in (-1, 1):
        for i, a in enumerate((20, 0, -20, -40)):
            r = math.radians(a)
            kx, ky = cx + d * 0.45 * s * math.cos(r), cy + 0.2 * s + 0.45 * s * math.sin(r)
            c.line(cx, cy, kx, ky)
            c.line(kx, ky, kx + d * 0.2 * s, ky - 0.35 * s)
    circ(c, cx, cy, 0.3 * s, "black")
    circ(c, cx - 0.1 * s, cy + 0.05 * s, 0.08 * s, "white")
    circ(c, cx + 0.1 * s, cy + 0.05 * s, 0.08 * s, "white")
    dot(c, cx - 0.1 * s, cy + 0.05 * s, 0.03 * s)
    dot(c, cx + 0.1 * s, cy + 0.05 * s, 0.03 * s)


def cauldron(c, cx, cy, s, lw=3):
    ink(c, lw)
    for d in (-1, 1):
        fill(c, "black")
        poly(c, [(cx + d * 0.35 * s, cy - 0.55 * s), (cx + d * 0.5 * s, cy - 0.85 * s), (cx + d * 0.25 * s, cy - 0.6 * s)])
    for i, (bx, by, br) in enumerate(((-0.25, 0.55, 0.12), (0.1, 0.7, 0.16), (0.3, 0.5, 0.09), (-0.05, 0.95, 0.08))):
        circ(c, cx + bx * s, cy + by * s, br * s, "green")
    ell(c, cx, cy - 0.05 * s, 0.7 * s, 0.6 * s, color="black")
    ell(c, cx, cy + 0.42 * s, 0.62 * s, 0.14 * s, color="green")


def haunted_house(c, cx, cy, s, lw=3):
    ink(c, lw)
    fill(c, "purple")
    c.rect(cx - 0.6 * s, cy - 0.9 * s, 0.9 * s, 0.9 * s, stroke=1, fill=1)
    poly(c, [(cx - 0.72 * s, cy), (cx - 0.15 * s, cy + 0.5 * s), (cx + 0.42 * s, cy)])
    c.rect(cx + 0.3 * s, cy - 0.9 * s, 0.4 * s, 1.35 * s, stroke=1, fill=1)
    poly(c, [(cx + 0.24 * s, cy + 0.45 * s), (cx + 0.5 * s, cy + 0.95 * s), (cx + 0.76 * s, cy + 0.45 * s)])
    for wx, wy in ((-0.45, -0.35), (0.0, -0.35), (0.43, 0.05), (0.43, -0.4)):
        fill(c, "yellow")
        c.rect(cx + wx * s, cy + wy * s, 0.16 * s, 0.2 * s, stroke=1, fill=1)
        c.line(cx + (wx + 0.08) * s, cy + wy * s, cx + (wx + 0.08) * s, cy + (wy + 0.2) * s)
    fill(c, "brown")
    p = c.beginPath()
    p.moveTo(cx - 0.25 * s, cy - 0.9 * s)
    p.lineTo(cx - 0.25 * s, cy - 0.65 * s)
    p.arcTo(cx - 0.25 * s, cy - 0.75 * s, cx - 0.05 * s, cy - 0.55 * s, 180, -180)
    p.lineTo(cx - 0.05 * s, cy - 0.9 * s)
    p.close()
    c.drawPath(p, stroke=1, fill=1)
    fill(c, "yellow")
    c.circle(cx - 0.15 * s, cy + 0.2 * s, 0.08 * s, stroke=1, fill=1)


def cat(c, cx, cy, s, lw=3):
    ink(c, lw)
    tube(c, [(cx + 0.35 * s, cy - 0.75 * s), (cx + 0.75 * s, cy - 0.6 * s), (cx + 0.85 * s, cy - 0.2 * s),
             (cx + 0.7 * s, cy + 0.05 * s)], 0.13 * s, lw, "black")
    ell(c, cx, cy - 0.35 * s, 0.45 * s, 0.5 * s, color="black")
    for d in (-1, 1):
        fill(c, "black")
        poly(c, [(cx + d * 0.1 * s, cy + 0.55 * s), (cx + d * 0.35 * s, cy + 0.85 * s), (cx + d * 0.38 * s, cy + 0.4 * s)])
    circ(c, cx, cy + 0.35 * s, 0.35 * s, "black")
    for d in (-1, 1):
        ell(c, cx + d * 0.13 * s, cy + 0.4 * s, 0.08 * s, 0.1 * s, color="yellow")
        dot(c, cx + d * 0.13 * s, cy + 0.4 * s, 0.03 * s)
        for k in (-1, 0, 1):
            c.line(cx + d * 0.15 * s, cy + 0.25 * s, cx + d * 0.5 * s, cy + (0.25 + 0.06 * k) * s)
    fill(c, "pink")
    poly(c, [(cx - 0.04 * s, cy + 0.3 * s), (cx + 0.04 * s, cy + 0.3 * s), (cx, cy + 0.25 * s)])


def owl(c, cx, cy, s, lw=3):
    ink(c, lw)
    ell(c, cx, cy - 0.1 * s, 0.55 * s, 0.75 * s, color="brown")
    for d in (-1, 1):
        fill(c, "brown")
        poly(c, [(cx + d * 0.2 * s, cy + 0.55 * s), (cx + d * 0.45 * s, cy + 0.9 * s), (cx + d * 0.5 * s, cy + 0.4 * s)])
        curve(c, [(cx + d * 0.5 * s, cy + 0.1 * s), ((cx + d * 0.3 * s, cy - 0.2 * s), (cx + d * 0.3 * s, cy - 0.5 * s),
                                                   (cx + d * 0.45 * s, cy - 0.65 * s))])
        circ(c, cx + d * 0.22 * s, cy + 0.3 * s, 0.2 * s, "cream")
        circ(c, cx + d * 0.22 * s, cy + 0.3 * s, 0.08 * s, "black")
    ell(c, cx, cy - 0.3 * s, 0.25 * s, 0.3 * s, color="tan")
    fill(c, "orange")
    poly(c, [(cx - 0.07 * s, cy + 0.15 * s), (cx + 0.07 * s, cy + 0.15 * s), (cx, cy + 0.0 * s)])
    for i in range(3):
        p = c.beginPath()
        p.arc(cx - 0.12 * s + i * 0.12 * s - 0.06 * s, cy - 0.4 * s, cx - 0.12 * s + i * 0.12 * s + 0.06 * s,
              cy - 0.28 * s, 180, 180)
        c.drawPath(p, stroke=1, fill=0)


# ---- Everyday (senior coloring, dot-to-dot extras) ----------------------------

def flower(c, cx, cy, s, lw=3, petals=8, petal_color="pink"):
    ink(c, lw)
    tube(c, [(cx, cy - s), (cx, cy)], 0.08 * s, lw, "green")
    for d in (-1, 1):
        ell(c, cx + d * 0.22 * s, cy - 0.6 * s, 0.22 * s, 0.09 * s, rot=d * 30, color="green")
    for k in range(petals):
        a = 360 * k / petals
        r = math.radians(a)
        ell(c, cx + 0.3 * s * math.cos(r), cy + 0.25 * s + 0.3 * s * math.sin(r), 0.25 * s, 0.11 * s, rot=a,
            color=petal_color)
    circ(c, cx, cy + 0.25 * s, 0.14 * s, "yellow")


def tulip(c, cx, cy, s, lw=3):
    ink(c, lw)
    tube(c, [(cx, cy - s), (cx, cy)], 0.08 * s, lw, "green")
    for d in (-1, 1):
        curve(c, [(cx, cy - 0.9 * s), ((cx + d * 0.5 * s, cy - 0.7 * s), (cx + d * 0.5 * s, cy - 0.3 * s),
                                       (cx + d * 0.35 * s, cy - 0.1 * s)),
                  ((cx + d * 0.3 * s, cy - 0.45 * s), (cx + d * 0.15 * s, cy - 0.7 * s), (cx, cy - 0.9 * s))],
              close=True, color="green")
    p = c.beginPath()
    p.moveTo(cx - 0.35 * s, cy + 0.6 * s)
    p.curveTo(cx - 0.4 * s, cy + 0.1 * s, cx - 0.2 * s, cy - 0.05 * s, cx, cy - 0.05 * s)
    p.curveTo(cx + 0.2 * s, cy - 0.05 * s, cx + 0.4 * s, cy + 0.1 * s, cx + 0.35 * s, cy + 0.6 * s)
    p.lineTo(cx + 0.18 * s, cy + 0.4 * s)
    p.lineTo(cx, cy + 0.65 * s)
    p.lineTo(cx - 0.18 * s, cy + 0.4 * s)
    p.close()
    fill(c, "red")
    c.drawPath(p, stroke=1, fill=1)


def sun(c, cx, cy, s, lw=3):
    ink(c, lw)
    for k in range(12):
        a = 2 * math.pi * k / 12
        fill(c, "orange")
        poly(c, [(cx + 0.55 * s * math.cos(a - 0.15), cy + 0.55 * s * math.sin(a - 0.15)),
                 (cx + 0.95 * s * math.cos(a), cy + 0.95 * s * math.sin(a)),
                 (cx + 0.55 * s * math.cos(a + 0.15), cy + 0.55 * s * math.sin(a + 0.15))])
    circ(c, cx, cy, 0.58 * s, "yellow")
    dot(c, cx - 0.18 * s, cy + 0.12 * s, 0.05 * s)
    dot(c, cx + 0.18 * s, cy + 0.12 * s, 0.05 * s)
    smile(c, cx, cy, 0.25 * s, lw)


def house(c, cx, cy, s, lw=3):
    ink(c, lw)
    fill(c, "red")
    c.rect(cx + 0.35 * s, cy + 0.2 * s, 0.18 * s, 0.5 * s, stroke=1, fill=1)
    fill(c, "cream")
    c.rect(cx - 0.65 * s, cy - 0.9 * s, 1.3 * s, 1.0 * s, stroke=1, fill=1)
    fill(c, "red")
    poly(c, [(cx - 0.8 * s, cy + 0.1 * s), (cx, cy + 0.85 * s), (cx + 0.8 * s, cy + 0.1 * s)])
    fill(c, "brown")
    c.rect(cx - 0.15 * s, cy - 0.9 * s, 0.3 * s, 0.55 * s, stroke=1, fill=1)
    for wx in (-0.5, 0.25):
        fill(c, "ltblue")
        c.rect(cx + wx * s, cy - 0.45 * s, 0.25 * s, 0.25 * s, stroke=1, fill=1)
        c.line(cx + (wx + 0.125) * s, cy - 0.45 * s, cx + (wx + 0.125) * s, cy - 0.2 * s)
        c.line(cx + wx * s, cy - 0.325 * s, cx + (wx + 0.25) * s, cy - 0.325 * s)
    circ(c, cx, cy + 0.35 * s, 0.13 * s, "ltblue")


def tree(c, cx, cy, s, lw=3):
    ink(c, lw)
    fill(c, "brown")
    poly(c, [(cx - 0.15 * s, cy - s), (cx - 0.1 * s, cy), (cx + 0.1 * s, cy), (cx + 0.15 * s, cy - s)])
    union(c, [(cx, cy + 0.45 * s, 0.4 * s), (cx - 0.38 * s, cy + 0.15 * s, 0.33 * s), (cx + 0.38 * s, cy + 0.15 * s, 0.33 * s),
              (cx - 0.2 * s, cy + 0.65 * s, 0.28 * s), (cx + 0.22 * s, cy + 0.62 * s, 0.3 * s)], lw, "green")
    for ox, oy in ((-0.3, 0.2), (0.25, 0.35), (0.0, 0.6), (0.4, 0.05)):
        circ(c, cx + ox * s, cy + oy * s, 0.06 * s, "red")


def butterfly(c, cx, cy, s, lw=3):
    ink(c, lw)
    for d in (-1, 1):
        curve(c, [(cx, cy + 0.05 * s), ((cx + d * 0.3 * s, cy + 0.9 * s), (cx + d * 1.0 * s, cy + 0.8 * s),
                                        (cx + d * 0.85 * s, cy + 0.3 * s)),
                  ((cx + d * 0.75 * s, cy + 0.05 * s), (cx + d * 0.3 * s, cy + 0.05 * s), (cx, cy + 0.05 * s))],
              close=True, color="purple")
        curve(c, [(cx, cy), ((cx + d * 0.25 * s, cy - 0.05 * s), (cx + d * 0.8 * s, cy - 0.2 * s),
                             (cx + d * 0.6 * s, cy - 0.6 * s)),
                  ((cx + d * 0.45 * s, cy - 0.8 * s), (cx + d * 0.1 * s, cy - 0.5 * s), (cx, cy))],
              close=True, color="pink")
        circ(c, cx + d * 0.55 * s, cy + 0.45 * s, 0.13 * s, "yellow")
        circ(c, cx + d * 0.4 * s, cy - 0.35 * s, 0.09 * s, "yellow")
        curve(c, [(cx, cy + 0.5 * s), ((cx + d * 0.05 * s, cy + 0.75 * s), (cx + d * 0.15 * s, cy + 0.85 * s),
                                       (cx + d * 0.25 * s, cy + 0.9 * s))])
        dot(c, cx + d * 0.25 * s, cy + 0.9 * s, 0.035 * s)
    ell(c, cx, cy, 0.08 * s, 0.5 * s, color="black")


def teacup(c, cx, cy, s, lw=3):
    ink(c, lw)
    ell(c, cx, cy - 0.55 * s, 0.85 * s, 0.15 * s, color="ltblue")
    tube(c, [(cx + 0.5 * s, cy + 0.1 * s), (cx + 0.8 * s, cy + 0.05 * s), (cx + 0.8 * s, cy - 0.2 * s),
             (cx + 0.45 * s, cy - 0.3 * s)], 0.09 * s, lw, "ltblue")
    p = c.beginPath()
    p.moveTo(cx - 0.6 * s, cy + 0.2 * s)
    p.curveTo(cx - 0.6 * s, cy - 0.3 * s, cx - 0.35 * s, cy - 0.55 * s, cx, cy - 0.55 * s)
    p.curveTo(cx + 0.35 * s, cy - 0.55 * s, cx + 0.6 * s, cy - 0.3 * s, cx + 0.6 * s, cy + 0.2 * s)
    p.close()
    fill(c, "ltblue")
    c.drawPath(p, stroke=1, fill=1)
    ell(c, cx, cy + 0.2 * s, 0.6 * s, 0.1 * s, color="brown")
    c.drawPath(cm.heart_path(c, cx, cy - 0.18 * s, 0.13 * s), stroke=1, fill=0)
    for ox in (-0.2, 0.15):
        curve(c, [(cx + ox * s, cy + 0.4 * s), ((cx + (ox - 0.12) * s, cy + 0.55 * s), (cx + (ox + 0.12) * s, cy + 0.7 * s),
                                                (cx + ox * s, cy + 0.85 * s))])


def apple(c, cx, cy, s, lw=3):
    ink(c, lw)
    tube(c, [(cx, cy + 0.45 * s), (cx + 0.05 * s, cy + 0.8 * s)], 0.06 * s, lw, "brown")
    ell(c, cx + 0.25 * s, cy + 0.7 * s, 0.2 * s, 0.08 * s, rot=25, color="green")
    p = c.beginPath()
    p.moveTo(cx, cy + 0.45 * s)
    p.curveTo(cx - 0.3 * s, cy + 0.7 * s, cx - 0.85 * s, cy + 0.5 * s, cx - 0.7 * s, cy - 0.2 * s)
    p.curveTo(cx - 0.6 * s, cy - 0.7 * s, cx - 0.2 * s, cy - 0.85 * s, cx, cy - 0.7 * s)
    p.curveTo(cx + 0.2 * s, cy - 0.85 * s, cx + 0.6 * s, cy - 0.7 * s, cx + 0.7 * s, cy - 0.2 * s)
    p.curveTo(cx + 0.85 * s, cy + 0.5 * s, cx + 0.3 * s, cy + 0.7 * s, cx, cy + 0.45 * s)
    fill(c, "red")
    c.drawPath(p, stroke=1, fill=1)
    curve(c, [(cx - 0.45 * s, cy + 0.15 * s), ((cx - 0.5 * s, cy - 0.1 * s), (cx - 0.45 * s, cy - 0.3 * s),
                                               (cx - 0.35 * s, cy - 0.4 * s))])


def fish(c, cx, cy, s, lw=3):
    ink(c, lw)
    fill(c, "orange")
    poly(c, [(cx + 0.45 * s, cy), (cx + 0.9 * s, cy + 0.4 * s), (cx + 0.9 * s, cy - 0.4 * s)])
    p = c.beginPath()
    p.moveTo(cx - 0.75 * s, cy)
    p.curveTo(cx - 0.4 * s, cy + 0.6 * s, cx + 0.3 * s, cy + 0.55 * s, cx + 0.55 * s, cy)
    p.curveTo(cx + 0.3 * s, cy - 0.55 * s, cx - 0.4 * s, cy - 0.6 * s, cx - 0.75 * s, cy)
    fill(c, "orange")
    c.drawPath(p, stroke=1, fill=1)
    circ(c, cx - 0.4 * s, cy + 0.08 * s, 0.09 * s, "white")
    dot(c, cx - 0.4 * s, cy + 0.08 * s, 0.04 * s)
    for ox in (-0.15, 0.05, 0.25):
        p = c.beginPath()
        p.arc(cx + (ox - 0.12) * s, cy - 0.25 * s, cx + (ox + 0.12) * s, cy + 0.25 * s, -60, 120)
        c.drawPath(p, stroke=1, fill=0)


def cloud(c, cx, cy, s, lw=3):
    union(c, [(cx - 0.45 * s, cy - 0.1 * s, 0.32 * s), (cx, cy + 0.12 * s, 0.42 * s), (cx + 0.45 * s, cy - 0.05 * s, 0.35 * s),
              (cx, cy - 0.2 * s, 0.3 * s)], lw, "white")


def balloon(c, cx, cy, s, lw=3, color="red"):
    ink(c, lw * 0.7)
    curve(c, [(cx, cy - 0.45 * s), ((cx - 0.15 * s, cy - 0.65 * s), (cx + 0.15 * s, cy - 0.8 * s), (cx, cy - s))])
    ink(c, lw)
    fill(c, color)
    poly(c, [(cx, cy - 0.35 * s), (cx - 0.07 * s, cy - 0.47 * s), (cx + 0.07 * s, cy - 0.47 * s)])
    ell(c, cx, cy + 0.15 * s, 0.38 * s, 0.5 * s, color=color)


def sailboat(c, cx, cy, s, lw=3):
    ink(c, lw)
    c.line(cx, cy - 0.35 * s, cx, cy + 0.9 * s)
    fill(c, "cream")
    poly(c, [(cx + 0.05 * s, cy + 0.85 * s), (cx + 0.05 * s, cy - 0.25 * s), (cx + 0.7 * s, cy - 0.25 * s)])
    fill(c, "yellow")
    poly(c, [(cx - 0.05 * s, cy + 0.7 * s), (cx - 0.05 * s, cy - 0.25 * s), (cx - 0.55 * s, cy - 0.25 * s)])
    fill(c, "red")
    poly(c, [(cx, cy + 0.9 * s), (cx + 0.25 * s, cy + 0.82 * s), (cx, cy + 0.74 * s)])
    fill(c, "brown")
    poly(c, [(cx - 0.85 * s, cy - 0.35 * s), (cx + 0.85 * s, cy - 0.35 * s), (cx + 0.6 * s, cy - 0.65 * s),
             (cx - 0.6 * s, cy - 0.65 * s)])
    waves(c, cx - s, cx + s, cy - 0.75 * s, 0.08 * s, lw)


def waves(c, x0, x1, y, h, lw):
    ink(c, lw)
    n = 8
    w = (x1 - x0) / n
    for i in range(n):
        p = c.beginPath()
        p.arc(x0 + i * w, y - h, x0 + (i + 1) * w, y + h, 0, 180)
        c.drawPath(p, stroke=1, fill=0)


def cupcake(c, cx, cy, s, lw=3):
    ink(c, lw)
    fill(c, "ltblue")
    poly(c, [(cx - 0.55 * s, cy), (cx + 0.55 * s, cy), (cx + 0.4 * s, cy - 0.8 * s), (cx - 0.4 * s, cy - 0.8 * s)])
    for i in range(1, 5):
        x = -0.55 + 1.1 * i / 5
        c.line(cx + x * s, cy, cx + x * 0.73 * s, cy - 0.8 * s)
    union(c, [(cx - 0.35 * s, cy + 0.1 * s, 0.25 * s), (cx + 0.35 * s, cy + 0.1 * s, 0.25 * s), (cx, cy + 0.2 * s, 0.3 * s),
              (cx, cy + 0.48 * s, 0.22 * s)], lw, "pink")
    circ(c, cx, cy + 0.78 * s, 0.12 * s, "red")
    curve(c, [(cx, cy + 0.9 * s), ((cx + 0.05 * s, cy + 1.0 * s), (cx + 0.12 * s, cy + 1.02 * s), (cx + 0.18 * s, cy + 1.02 * s))])


def mushroom(c, cx, cy, s, lw=3):
    ink(c, lw)
    fill(c, "cream")
    c.roundRect(cx - 0.2 * s, cy - 0.8 * s, 0.4 * s, 0.8 * s, 0.1 * s, stroke=1, fill=1)
    p = c.beginPath()
    p.moveTo(cx - 0.75 * s, cy - 0.05 * s)
    p.curveTo(cx - 0.75 * s, cy + 0.8 * s, cx + 0.75 * s, cy + 0.8 * s, cx + 0.75 * s, cy - 0.05 * s)
    p.close()
    fill(c, "red")
    c.drawPath(p, stroke=1, fill=1)
    for ox, oy, r in ((-0.4, 0.15, 0.1), (0.05, 0.4, 0.12), (0.4, 0.15, 0.09), (-0.12, 0.1, 0.07)):
        circ(c, cx + ox * s, cy + oy * s, r * s, "white")


def heart(c, cx, cy, s, lw=3):
    ink(c, lw)
    fill(c, "red")
    c.drawPath(cm.heart_path(c, cx, cy + 0.1 * s, 0.8 * s), stroke=1, fill=1)


def star(c, cx, cy, s, lw=3):
    ink(c, lw)
    fill(c, "yellow")
    c.drawPath(cm.star_path(c, cx, cy, s, 0.45 * s), stroke=1, fill=1)


def ground(c, x0, x1, y, lw=3, snow=False):
    ink(c, lw)
    p = c.beginPath()
    p.moveTo(x0, y)
    p.curveTo(x0 + (x1 - x0) * 0.3, y + 25, x0 + (x1 - x0) * 0.6, y - 20, x1, y + 10)
    c.drawPath(p, stroke=1, fill=0)


DRAW = {name: fn for name, fn in globals().items()
        if callable(fn) and not name.startswith("_") and fn.__module__ == __name__
        and name not in ("colored", "fill", "ink", "poly", "ell", "circ", "dot", "curve", "tube", "union",
                         "smile", "crescent_points", "waves", "ground")}


def scene(c, main, extras, x0, y0, w, h, rnd=None, lw=3.2, snow=False, stars=False):
    """A coloring page: one big main object plus smaller companions and a horizon."""
    rnd = rnd or random.Random(0)
    base = y0 + h * 0.12
    ground(c, x0, x0 + w, base, lw)
    if snow:
        for _ in range(14):
            circ_x, circ_y = rnd.uniform(x0 + 20, x0 + w - 20), rnd.uniform(base + h * 0.55, y0 + h - 20)
            ink(c, lw * 0.8)
            circ(c, circ_x, circ_y, rnd.uniform(4, 8))
    if stars:
        for _ in range(6):
            ink(c, lw * 0.8)
            c.drawPath(cm.star_path(c, rnd.uniform(x0 + 20, x0 + w - 20), rnd.uniform(base + h * 0.7, y0 + h - 20),
                                    12, 5), stroke=1, fill=0)
    s = min(w, h) * 0.4
    DRAW[main](c, x0 + w / 2, base + s * 1.1, s, lw)
    slots = [(0.14, 0.13), (0.86, 0.13), (0.14, 0.78), (0.86, 0.78)]
    for (fx, fy), name in zip(slots, extras):
        es = min(w, h) * 0.11
        DRAW[name](c, x0 + w * fx, base + (h - (base - y0)) * fy - (es * 0.4 if fy < 0.5 else 0) + es * 0.2, es, lw * 0.85)
