"""Dot-to-dot pictures and the "Dot to Dot for Kids" book.

Each picture is an outline in a 0-10 box, built from a polygon, a parametric curve, or a
union of circles/ellipses/polygons traced by ray casting. The outline is turned into
numbered dots; a few solid details (eyes, strings) help the picture read once joined.
"""
import math

from reportlab.lib.colors import HexColor
from reportlab.lib.units import inch

import common as cm
import drawings


def arc(cx, cy, r, a0, a1, n=12):
    return [(cx + r * math.cos(math.radians(a0 + (a1 - a0) * i / n)),
             cy + r * math.sin(math.radians(a0 + (a1 - a0) * i / n))) for i in range(n + 1)]


def star_poly(points, r_out=5, r_in=2.2, cx=5, cy=5):
    return [(cx + (r_out if i % 2 == 0 else r_in) * math.cos(math.radians(90 + i * 180 / points)),
             cy + (r_out if i % 2 == 0 else r_in) * math.sin(math.radians(90 + i * 180 / points)))
            for i in range(points * 2)]


def polar(fn, n=400):
    return [(5 + fn(2 * math.pi * i / n) * math.cos(2 * math.pi * i / n),
             5 + fn(2 * math.pi * i / n) * math.sin(2 * math.pi * i / n)) for i in range(n)]


def heart_curve(n=400):
    pts = []
    for i in range(n):
        t = 2 * math.pi * i / n
        x = 16 * math.sin(t) ** 3
        y = 13 * math.cos(t) - 5 * math.cos(2 * t) - 2 * math.cos(3 * t) - math.cos(4 * t)
        pts.append((5 + x * 0.3, 5.5 + y * 0.3))
    return pts


def _inside_poly(x, y, pts):
    inside = False
    j = len(pts) - 1
    for i in range(len(pts)):
        xi, yi = pts[i]
        xj, yj = pts[j]
        if (yi > y) != (yj > y) and x < (xj - xi) * (y - yi) / (yj - yi) + xi:
            inside = not inside
        j = i
    return inside


def raycast(prims, center=(5, 5), n=360):
    """Outline of a union of primitives: ('c',x,y,r) ('e',x,y,rx,ry) ('he',x,y,rx,ry) ('p',pts) ('r',x0,y0,x1,y1)."""
    def inside(x, y):
        for p in prims:
            k = p[0]
            if k == "c" and (x - p[1]) ** 2 + (y - p[2]) ** 2 <= p[3] ** 2:
                return True
            if k in ("e", "he") and ((x - p[1]) / p[3]) ** 2 + ((y - p[2]) / p[4]) ** 2 <= 1 and (k == "e" or y >= p[2]):
                return True
            if k == "r" and p[1] <= x <= p[3] and p[2] <= y <= p[4]:
                return True
            if k == "p" and _inside_poly(x, y, p[1]):
                return True
        return False

    cx, cy = center
    pts = []
    for i in range(n):
        a = 2 * math.pi * i / n
        r = 8.0
        while r > 0 and not inside(cx + r * math.cos(a), cy + r * math.sin(a)):
            r -= 0.02
        pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
    return pts


def resample(pts, n, closed=True):
    seq = pts + [pts[0]] if closed else pts
    seg = [math.dist(seq[i], seq[i + 1]) for i in range(len(seq) - 1)]
    total = sum(seg)
    count = n if closed else n - 1
    out, acc, i = [], 0.0, 0
    for k in range(count + (0 if closed else 1)):
        target = total * k / count
        while i < len(seg) - 1 and acc + seg[i] < target:
            acc += seg[i]
            i += 1
        t = 0 if seg[i] == 0 else (target - acc) / seg[i]
        a, b = seq[i], seq[i + 1]
        out.append((a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t))
    return out


def subdivide(pts, n, closed=True):
    """Keep every corner and add evenly spaced dots on the longest edges until there are n."""
    seq = pts + [pts[0]] if closed else pts
    edges = [[seq[i], seq[i + 1], 1] for i in range(len(seq) - 1)]
    while sum(e[2] for e in edges) + (0 if closed else 1) < n:
        e = max(edges, key=lambda e: math.dist(e[0], e[1]) / e[2])
        e[2] += 1
    out = []
    for a, b, k in edges:
        for j in range(k):
            out.append((a[0] + (b[0] - a[0]) * j / k, a[1] + (b[1] - a[1]) * j / k))
    if not closed:
        out.append(seq[-1])
    return out


# name: (kind, data, details, closed)
#   kind "poly" keeps corners; "curve" samples evenly.
EYE = lambda x, y, r=0.25: ("dot", x, y, r)

SHAPES = {
    "heart": ("curve", heart_curve(), [], True),
    "star": ("poly", star_poly(5), [], True),
    "house": ("poly", [(1, 0), (1, 5), (0, 5), (5, 9), (7, 7.2), (7, 8.5), (8, 8.5), (8, 6.3), (10, 5), (9, 5),
                       (9, 0), (6, 0), (6, 3), (4, 3), (4, 0)], [("rect", 1.8, 2.8, 3.3, 4.3), ("rect", 6.7, 2.8, 8.2, 4.3)], True),
    "rocket": ("poly", [(5, 10), (6.5, 7.5), (6.8, 4), (8.5, 2), (8.5, 0), (6.5, 1.2), (6, 0.5), (4, 0.5), (3.5, 1.2),
                        (1.5, 0), (1.5, 2), (3.2, 4), (3.5, 7.5)], [("circle", 5, 5.6, 0.8)], True),
    "sailboat": ("poly", [(5, 10), (9, 3.8), (10, 3.8), (8, 0.5), (2, 0.5), (0, 3.8), (1, 3.8)],
                 [("line", [(5, 10), (5, 3.8)])], True),
    "crown": ("poly", [(0, 1), (0, 7), (2.5, 4), (5, 8.5), (7.5, 4), (10, 7), (10, 1)],
              [("circle", 2.5, 2.5, 0.5), ("circle", 5, 2.5, 0.5), ("circle", 7.5, 2.5, 0.5)], True),
    "castle": ("poly", [(0, 0), (0, 8), (0.8, 8), (0.8, 7.3), (1.6, 7.3), (1.6, 8), (2.4, 8), (2.4, 5.5), (3.3, 5.5),
                        (3.3, 6.2), (4.1, 6.2), (4.1, 5.5), (5.9, 5.5), (5.9, 6.2), (6.7, 6.2), (6.7, 5.5), (7.6, 5.5),
                        (7.6, 8), (8.4, 8), (8.4, 7.3), (9.2, 7.3), (9.2, 8), (10, 8), (10, 0), (6, 0), (6, 2.5), (5, 3.5),
                        (4, 2.5), (4, 0)], [("rect", 0.8, 4.5, 1.6, 5.8), ("rect", 8.4, 4.5, 9.2, 5.8)], True),
    "car": ("poly", [(0, 1), (0, 3.5), (2, 4), (3, 6), (7, 6), (8.3, 4), (10, 3.5), (10, 1), (8.8, 1)]
            + arc(7.6, 1, 1.2, 0, -180) + [(3.6, 1)] + arc(2.4, 1, 1.2, 0, -180),
            [("circle", 7.6, 1, 0.6), ("circle", 2.4, 1, 0.6), ("line", [(5, 6), (5, 4)])], True),
    "airplane": ("poly", [(5, 10), (5.6, 9), (5.6, 6.5), (10, 4.5), (10, 3.8), (5.6, 4.8), (5.6, 1.6), (7, 0.6), (7, 0),
                          (5, 0.6), (3, 0), (3, 0.6), (4.4, 1.6), (4.4, 4.8), (0, 3.8), (0, 4.5), (4.4, 6.5), (4.4, 9)],
                 [], True),
    "kite": ("poly", [(5, 10), (8, 6), (5, 2), (2, 6)],
             [("line", [(5, 2), (4.2, 1.2), (5, 0.5), (4.2, 0)]), ("line", [(5, 10), (5, 2)]), ("line", [(2, 6), (8, 6)])], True),
    "diamond": ("poly", [(2, 7), (3.5, 9), (6.5, 9), (8, 7), (5, 1)], [("line", [(2, 7), (8, 7)])], True),
    "bell": ("poly", [(5, 10), (6, 9.6), (6.6, 8.6), (7, 6), (7.6, 3.5), (9, 2.2), (9, 1.5), (1, 1.5), (1, 2.2),
                      (2.4, 3.5), (3, 6), (3.4, 8.6), (4, 9.6)], [("circle", 5, 1, 0.6)], True),
    "mug": ("poly", [(1, 9), (1, 1.5), (2, 0.5), (7, 0.5), (8, 1.5), (8, 3), (9.5, 3.5), (10, 5), (10, 6.5),
                     (9.5, 7.5), (8, 8), (8, 9)], [("line", [(8, 4.3), (8.9, 4.8), (8.9, 6.2), (8, 6.7)])], True),
    "christmas tree": ("poly", [(5, 10), (7, 7.5), (6, 7.5), (8.2, 5), (7, 5), (9.5, 2), (5.8, 2), (5.8, 0), (4.2, 0),
                                (4.2, 2), (0.5, 2), (3, 5), (1.8, 5), (4, 7.5), (3, 7.5)],
                       [("circle", 4, 3.5, 0.4), ("circle", 6.3, 4.2, 0.4), ("circle", 5, 6.3, 0.4)], True),
    "present": ("poly", [(1, 0), (1, 6), (0.5, 6), (0.5, 7.5), (4.2, 7.5), (2.5, 9.5), (3, 10), (5, 7.8), (7, 10),
                         (7.5, 9.5), (5.8, 7.5), (9.5, 7.5), (9.5, 6), (9, 6), (9, 0)],
                [("line", [(4.3, 0), (4.3, 6)]), ("line", [(5.7, 0), (5.7, 6)]), ("line", [(1, 6), (9, 6)])], True),
    "stocking": ("poly", [(2, 10), (6, 10), (6, 4.5), (9.2, 3.5), (9.5, 1.5), (8, 0.3), (4, 0.3), (2, 2)],
                 [("line", [(2, 8.5), (6, 8.5)])], True),
    "mitten": ("poly", [(2, 0), (2, 3), (1.5, 6), (2, 9), (4, 10), (6, 9.5), (7, 7.5), (7.2, 6), (8.6, 7), (9.6, 6.2),
                        (8.8, 4.4), (7.5, 3), (7.5, 0)], [("line", [(2, 1.5), (7.5, 1.5)])], True),
    "gingerbread man": ("poly", [(5.8, 7.3), (8.8, 6.8), (9.5, 6), (8.8, 5.2), (6.5, 5.5), (6.5, 3.5), (8, 0.8), (7.2, 0),
                                 (5, 2.5), (2.8, 0), (2, 0.8), (3.5, 3.5), (3.5, 5.5), (1.2, 5.2), (0.5, 6), (1.2, 6.8),
                                 (4.2, 7.3)] + arc(5, 8.4, 1.36, 234, -54, 14)[1:-1],
                        [EYE(4.5, 8.6), EYE(5.5, 8.6), ("circle", 5, 5.5, 0.3), ("circle", 5, 4.4, 0.3)], True),
    "bat": ("poly", [(4.3, 6), (4, 7.2), (4.6, 6.5), (5.4, 6.5), (6, 7.2), (5.7, 6), (7, 6.5), (9, 7), (10, 6),
                     (9.3, 5.2), (8.8, 4), (8, 4.8), (7, 3.8), (6.3, 4.5), (5, 3), (3.7, 4.5), (3, 3.8), (2, 4.8),
                     (1.2, 4), (0.7, 5.2), (0, 6), (1, 7), (3, 6.5)], [EYE(4.5, 5.5, 0.2), EYE(5.5, 5.5, 0.2)], True),
    "witch hat": ("poly", [(0, 1), (3.2, 2.2), (4.5, 7.5), (7.5, 10), (6, 7), (6.8, 2.2), (10, 1), (8, 0.4), (2, 0.4)],
                  [("line", [(3.4, 3.2), (6.6, 3.2)])], True),
    "ghost": ("poly", arc(5, 5.5, 3.5, 180, 0, 16) + [(8.5, 0.5)] + arc(7.33, 0.5, 1.17, 0, -180, 6)[1:]
              + arc(5, 0.5, 1.16, 0, -180, 6)[1:] + arc(2.67, 0.5, 1.17, 0, -180, 6)[1:],
              [("circle", 4, 6, 0.5), ("circle", 6, 6, 0.5), ("circle", 5, 4.2, 0.5)], True),
    "pumpkin": ("curve", raycast([("e", 5, 4.5, 2.5, 3.2), ("e", 3.2, 4.5, 2.4, 2.9), ("e", 6.8, 4.5, 2.4, 2.9),
                                  ("r", 4.6, 6, 5.4, 9)], (5, 4.5)),
                [("line", [(5, 7.6), (5, 1.4)])], True),
    "cat": ("curve", raycast([("c", 5, 4.5, 3.5), ("p", [(2, 6.5), (1.8, 10), (4.5, 7.9)]),
                              ("p", [(8, 6.5), (8.2, 10), (5.5, 7.9)])], (5, 5)),
            [EYE(3.8, 5.2), EYE(6.2, 5.2), ("line", [(4.6, 4.2), (5.4, 4.2), (5, 3.7), (4.6, 4.2)]),
             ("line", [(2, 4), (4, 3.8)]), ("line", [(8, 4), (6, 3.8)])], True),
    "bear": ("curve", raycast([("c", 5, 4.5, 3.5), ("c", 2.2, 7.5, 1.4), ("c", 7.8, 7.5, 1.4)], (5, 5)),
             [EYE(3.8, 5.4), EYE(6.2, 5.4), ("circle", 5, 3.5, 1.1), EYE(5, 3.9, 0.3)], True),
    "bunny": ("curve", raycast([("c", 5, 3.5, 3), ("e", 3.8, 8, 0.9, 2.6), ("e", 6.2, 8, 0.9, 2.6)], (5, 5)),
              [EYE(4, 4), EYE(6, 4), EYE(5, 3, 0.3)], True),
    "mouse": ("curve", raycast([("c", 5, 4, 3), ("c", 2, 7, 1.8), ("c", 8, 7, 1.8)], (5, 5)),
              [EYE(4, 4.5), EYE(6, 4.5), EYE(5, 3.2, 0.35)], True),
    "snowman": ("curve", raycast([("c", 5, 2.5, 2.5), ("c", 5, 6, 1.8), ("c", 5, 8.6, 1.3)], (5, 5)),
                [EYE(4.5, 8.9, 0.2), EYE(5.5, 8.9, 0.2), EYE(5, 6.4, 0.2), EYE(5, 5.6, 0.2)], True),
    "cloud": ("curve", raycast([("c", 2.8, 4.5, 2), ("c", 5, 6, 2.6), ("c", 7.4, 4.8, 2.1), ("c", 5, 3.8, 2)], (5, 5)),
              [], True),
    "tree": ("curve", raycast([("c", 5, 6.8, 2.6), ("c", 3, 5.5, 1.9), ("c", 7, 5.5, 1.9), ("r", 4.3, 0, 5.7, 4)], (5, 5)),
             [], True),
    "turtle": ("curve", raycast([("e", 5, 5, 3.2, 2.3), ("c", 9, 5.4, 1.1), ("c", 3, 3, 0.9), ("c", 7, 3, 0.9),
                                 ("c", 3, 7, 0.9), ("c", 7, 7, 0.9), ("p", [(1.9, 5.3), (0.6, 5), (1.9, 4.7)])], (5, 5)),
               [EYE(9.4, 5.8, 0.2), ("circle", 5, 5, 1.1)], True),
    "fish": ("curve", raycast([("e", 4.5, 5, 3.5, 2.2), ("p", [(7.5, 5), (10, 7.5), (10, 2.5)])], (5, 5)),
             [EYE(2.5, 5.5, 0.35), ("line", [(3.8, 6.4), (4.4, 5), (3.8, 3.6)])], True),
    "whale": ("curve", raycast([("e", 4.5, 4, 4, 2.5), ("p", [(8, 4.2), (10, 7), (9.2, 4.6), (10, 2.8)])], (5, 4)),
              [EYE(2, 4.4, 0.3), ("line", [(3.5, 6.5), (3.2, 8), (2.6, 8.6)]), ("line", [(3.5, 6.5), (3.9, 8), (4.5, 8.6)])],
              True),
    "bird": ("curve", raycast([("c", 5, 4, 2.8), ("c", 7.3, 6.6, 1.6), ("p", [(8.7, 7.2), (10, 6.6), (8.7, 6)]),
                               ("p", [(2.6, 4.5), (0, 6.5), (0.5, 3.2)])], (5.5, 5)),
             [EYE(7.6, 7, 0.25), ("line", [(3.8, 4.8), (5, 3.2), (6.3, 4.6)])], True),
    "owl": ("curve", raycast([("e", 5, 4.5, 3, 4), ("p", [(2.6, 7.2), (2.4, 9.8), (4.2, 8.2)]),
                              ("p", [(7.4, 7.2), (7.6, 9.8), (5.8, 8.2)])], (5, 5)),
            [("circle", 3.9, 6, 0.9), ("circle", 6.1, 6, 0.9), EYE(3.9, 6, 0.35), EYE(6.1, 6, 0.35),
             ("line", [(4.6, 5), (5, 4.4), (5.4, 5)])], True),
    "butterfly": ("curve", raycast([("e", 2.8, 6.5, 2.2, 2.2), ("e", 7.2, 6.5, 2.2, 2.2), ("e", 3.3, 3, 1.6, 1.8),
                                    ("e", 6.7, 3, 1.6, 1.8), ("e", 5, 5, 0.5, 3.5)], (5, 5)),
                  [("line", [(4.8, 8.4), (4.2, 9.8)]), ("line", [(5.2, 8.4), (5.8, 9.8)]),
                   ("circle", 2.8, 6.5, 0.8), ("circle", 7.2, 6.5, 0.8)], True),
    "ice cream": ("curve", raycast([("c", 5, 7, 2.6), ("p", [(2.6, 6.2), (7.4, 6.2), (5, 0)])], (5, 5.5)),
                  [("line", [(3.6, 4.4), (6.6, 4.4)]), ("line", [(4.2, 2.7), (5.9, 2.7)])], True),
    "balloon": ("curve", raycast([("e", 5, 6, 3, 3.8), ("p", [(4.4, 1.8), (5.6, 1.8), (5, 2.6)])], (5, 6)),
                [("line", [(5, 1.8), (4.5, 1), (5.3, 0.5), (4.8, 0)])], True),
    "apple": ("curve", raycast([("c", 3.8, 4.5, 3), ("c", 6.2, 4.5, 3), ("r", 4.8, 6.5, 5.3, 9.2),
                                ("e", 6.6, 8.6, 1.3, 0.6)], (5, 4.5)), [], True),
    "mushroom": ("curve", raycast([("he", 5, 5.2, 4.8, 4.3), ("r", 3.6, 0.5, 6.4, 5.2)], (5, 5)),
                 [("circle", 3, 7, 0.7), ("circle", 6.3, 8, 0.8), ("circle", 7.3, 6.3, 0.5)], True),
    "flower": ("curve", polar(lambda t: 3.2 + 1.8 * math.cos(5 * t)), [("circle", 5, 5, 1.2)], True),
    "sun": ("poly", star_poly(12, 5, 3.6), [("circle", 5, 5, 2.4)], True),
    "leaf": ("curve", [(5 + 3.2 * math.sin(math.pi * u), 0.5 + 9 * u) for u in [i / 60 for i in range(61)]]
             + [(5 - 3.2 * math.sin(math.pi * u), 0.5 + 9 * u) for u in [i / 60 for i in range(59, 0, -1)]],
             [("line", [(5, 0), (5, 8.5)])], True),
    "moon": ("curve", [(4 + x / 20, 5 + y / 20) for x, y in drawings.crescent_points(0, 0, 100, 60)], [], True),
    "candle": ("poly", [(3, 0), (3, 6), (4.6, 6), (4.2, 7.5), (5, 10), (5.8, 7.5), (5.4, 6), (7, 6), (7, 0)],
               [("line", [(5, 6), (5, 7)])], True),
    "train": ("poly", [(0.5, 1), (0.5, 5), (1.5, 5), (1.5, 8), (2.5, 8), (2.5, 5), (5, 5), (5, 8.5), (4.5, 8.5),
                       (4.5, 9.5), (9.5, 9.5), (9.5, 8.5), (9, 8.5), (9, 1)],
              [("circle", 2.5, 1, 1), ("circle", 7, 1, 1), ("rect", 6, 6, 8, 8)], True),
    "truck": ("poly", [(0, 1), (0, 6.5), (6, 6.5), (6, 4.8), (8, 4.8), (9.6, 3), (10, 3), (10, 1)],
              [("circle", 2.2, 1, 1), ("circle", 8, 1, 1), ("rect", 6.6, 3.2, 7.8, 4.3)], True),
    "long-neck dinosaur": ("poly", [(0, 3), (2, 4.5), (4, 6), (6, 6), (7, 5.5), (8, 8.5), (9, 9.2), (10, 9), (10, 8.4),
                                    (9, 8.2), (8.3, 5), (8, 3.5), (8, 0), (7, 0), (7, 2.5), (5.2, 2.5), (5.2, 0),
                                    (4.2, 0), (4.2, 2.8), (2, 3)], [EYE(9.2, 8.8, 0.18)], True),
    "stegosaurus": ("poly", [(0, 2), (1.5, 3.5), (2, 5), (2.8, 4.6), (3.3, 6.5), (4.2, 5.4), (5, 7.2), (5.8, 5.6),
                             (6.7, 6.8), (7.2, 5.2), (8, 5.6), (8.3, 4.5), (9.5, 4.5), (10, 3.8), (9.5, 3.2), (8.2, 3.1),
                             (7.8, 2.4), (7.8, 0), (6.8, 0), (6.8, 1.8), (4.6, 1.8), (4.6, 0), (3.6, 0), (3.6, 2.2),
                             (1.5, 2.3)], [EYE(9.3, 4, 0.18)], True),
    "t-rex": ("poly", [(0, 4.5), (3, 6.2), (5, 7.2), (6, 8.5), (8.5, 9), (10, 8.2), (10, 7.2), (8.3, 7.1), (8.8, 6.4),
                       (7.3, 6.3), (6.8, 5.5), (7.8, 5), (7.8, 4.6), (6.7, 4.8), (6.5, 3.5), (6.8, 1), (7.8, 0.3),
                       (7.8, 0), (5.8, 0), (5.5, 1.5), (4, 2.5), (2, 3.8)], [EYE(8, 8.3, 0.2)], True),
    "umbrella": ("curve", arc(5, 5, 5, 180, 0, 40) + arc(8.75, 5, 1.25, 0, 180, 8)[1:] + arc(6.25, 5, 1.25, 0, 180, 8)[1:]
                 + arc(3.75, 5, 1.25, 0, 180, 8)[1:] + arc(1.25, 5, 1.25, 0, 180, 8)[1:-1],
                 [("line", [(5, 5), (5, 1)] + arc(4.2, 1, 0.8, 0, -180, 8))], True),
    "spiral": ("curve", [(5 + 0.35 * t * math.cos(t), 5 + 0.35 * t * math.sin(t))
                         for t in [i * 0.05 for i in range(1, 260)]], [], False),
    "candy cane": ("curve", [(6, 0), (6, 7)] + arc(4.3, 7, 1.7, 0, 180, 20) + [(2.6, 5.8)], [], False),
    "star 6": ("poly", star_poly(6, 5, 2.9), [], True),
    "egg": ("curve", [(5 + 3.2 * math.cos(t) * (1 - 0.12 * math.sin(t)), 5 + 4.3 * math.sin(t))
                      for t in [2 * math.pi * i / 300 for i in range(300)]], [("line", [(2, 5), (3, 5.8), (4, 5), (5, 5.8),
                                                                                        (6, 5), (7, 5.8), (8, 5)])], True),
}


def dot_points(name, n):
    kind, data, _, closed = SHAPES[name]
    pts = subdivide(data, n, closed) if kind == "poly" and len(data) <= n else resample(data, n, closed)
    if closed:
        area = sum(pts[i][0] * pts[(i + 1) % len(pts)][1] - pts[(i + 1) % len(pts)][0] * pts[i][1] for i in range(len(pts)))
        if area < 0:
            pts = pts[::-1]
        top = max(range(len(pts)), key=lambda i: (pts[i][1], -pts[i][0]))
        pts = pts[top:] + pts[:top]  # start at the top, like most printed dot-to-dots
    return pts


def draw_dot_picture(c, name, n, x0, y0, w, h, font=11):
    kind, data, details, closed = SHAPES[name]
    pts = dot_points(name, n)
    allp = list(data)
    for d in details:  # details (strings, tails, handles) must fit on the page too
        if d[0] in ("dot", "circle"):
            allp += [(d[1] - d[3], d[2] - d[3]), (d[1] + d[3], d[2] + d[3])]
        elif d[0] == "rect":
            allp += [(d[1], d[2]), (d[3], d[4])]
        else:
            allp += list(d[1])
    minx, maxx = min(p[0] for p in allp), max(p[0] for p in allp)
    miny, maxy = min(p[1] for p in allp), max(p[1] for p in allp)
    sc = min((w - 40) / (maxx - minx), (h - 40) / (maxy - miny))
    ox = x0 + (w - (maxx - minx) * sc) / 2 - minx * sc
    oy = y0 + (h - (maxy - miny) * sc) / 2 - miny * sc
    T = lambda p: (ox + p[0] * sc, oy + p[1] * sc)
    # Solid details
    c.saveState()
    c.setStrokeColor(cm.INK)
    c.setLineWidth(2.5)
    c.setLineCap(1)
    c.setLineJoin(1)
    for d in details:
        if d[0] == "dot":
            c.setFillColor(cm.INK)
            c.circle(*T((d[1], d[2])), d[3] * sc, stroke=0, fill=1)
        elif d[0] == "circle":
            c.circle(*T((d[1], d[2])), d[3] * sc, stroke=1, fill=0)
        elif d[0] == "rect":
            (ax, ay), (bx, by) = T((d[1], d[2])), T((d[3], d[4]))
            c.rect(ax, ay, bx - ax, by - ay, stroke=1, fill=0)
        elif d[0] == "line":
            p = c.beginPath()
            for i, q in enumerate(d[1]):
                (p.moveTo if i == 0 else p.lineTo)(*T(q))
            c.drawPath(p, stroke=1, fill=0)
    c.restoreState()
    # Dots and numbers
    m = len(pts)
    for i, p in enumerate(pts):
        x, y = T(p)
        a, b = pts[i - 1] if (closed or i) else pts[i], pts[(i + 1) % m] if (closed or i < m - 1) else pts[i]
        tx, ty = b[0] - a[0], b[1] - a[1]
        ln = math.hypot(tx, ty) or 1
        nx, ny = ty / ln, -tx / ln
        c.setFillColor(cm.INK)
        c.circle(x, y, 3.2 if i else 5, stroke=0, fill=1)
        c.setFont("Bold" if i == 0 else "Regular", font)
        lx, ly = x + nx * (font + 2), y + ny * (font + 2) - font * 0.35
        c.drawCentredString(lx, ly, str(i + 1))
    return pts, T


class DotBook(cm.BookSpec):
    def __init__(self, pictures, **kw):
        super().__init__(**kw)
        self.pictures = pictures  # list of (name, dots)

    def build_interior(self, path):
        c = cm.new_interior(path, self.full_title)
        pages = cm.front_matter(c, self.title, self.subtitle, self.full_title, kids=True)
        cm.frame(c)
        cm.centered(c, "How to Play", cm.TRIM_H - 2 * inch, size=40)
        for i, line in enumerate(["Find the big dot with number 1.", "Draw a line to 2, then 3, then 4...",
                                  "Keep going until you reach the last number.", "Join the last dot back to 1",
                                  "(unless it's a spiral or candy cane!)", "Then color your picture!"]):
            cm.centered(c, line, cm.TRIM_H - 3.2 * inch - i * 44, font="Regular", size=20)
        c.showPage()
        pages += 1
        for k, (name, n) in enumerate(self.pictures, 1):
            dot_page(c, k, name, n)
            pages += 1
        cm.certificate_page(c, "is a Dot-to-Dot Superstar!", f"for finishing all {len(self.pictures)} pictures")
        pages = cm.pad_to_even(c, pages + 1)
        c.save()
        return pages


def dot_page(c, k, name, n):
    top = cm.TRIM_H - cm.MARGIN
    cm.centered(c, f"Connect the Dots #{k}", top - 30, size=30)
    cm.centered(c, f"Join the dots from 1 to {n}, then color it in!", top - 56, font="Regular", size=15)
    draw_dot_picture(c, name, n, cm.MARGIN, cm.MARGIN + 0.7 * inch, cm.TRIM_W - 2 * cm.MARGIN,
                     cm.TRIM_H - 2 * cm.MARGIN - 1.7 * inch, font=12 if n < 45 else 10)
    c.saveState()  # upside-down answer, a classic puzzle-book touch
    c.translate(cm.TRIM_W / 2, cm.MARGIN + 0.25 * inch)
    c.rotate(180)
    c.setFont("Regular", 11)
    c.setFillColor(HexColor("#777777"))
    c.drawCentredString(0, 0, f"It's a {name}!")
    c.restoreState()
    c.showPage()


def cover_art(c, x, y, w, h, accent):
    c.setFillColor(HexColor("#ffffff"))
    c.setStrokeColor(cm.INK)
    c.setLineWidth(6)
    c.roundRect(x, y, w, h, 30, stroke=1, fill=1)
    # Half-joined dinosaur, ready to finish
    pts, T = draw_dot_picture(c, "t-rex", 30, x + 10, y + 10, w - 20, h - 20, font=14)
    c.setStrokeColor(accent)
    c.setLineWidth(5)
    c.setLineCap(1)
    p = c.beginPath()
    for i, q in enumerate(pts[:19]):
        (p.moveTo if i == 0 else p.lineTo)(*T(q))
    c.drawPath(p, stroke=1, fill=0)


KIDS_ORDER = ["heart", "star", "kite", "diamond", "crown", "house", "sailboat", "candle", "fish", "balloon",
              "apple", "ice cream", "cloud", "bell", "mug", "truck", "car", "cat", "bear", "bunny", "mouse",
              "sun", "flower", "leaf", "moon", "egg", "star 6", "mushroom", "tree", "rocket", "train", "airplane",
              "whale", "bird", "turtle", "owl", "butterfly", "umbrella", "castle", "snowman", "pumpkin", "ghost",
              "bat", "christmas tree", "present", "long-neck dinosaur", "stegosaurus", "t-rex", "spiral", "candy cane"]

BOOK = DotBook(
    [(name, 10 + round(i * 50 / (len(KIDS_ORDER) - 1))) for i, name in enumerate(KIDS_ORDER)],
    title=["Dot to Dot", "for Kids Ages 4-8"], subtitle="50 Connect the Dots Puzzles: Count 1 to 60",
    full_title="Dot to Dot for Kids Ages 4-8: 50 Connect the Dots Puzzles, Count 1 to 60",
    sample_page=15,
    cover=dict(badge=["AGES", "4-8"],
               blurb=["Count, connect, and color!",
                      "Kids join the numbered dots to reveal animals,",
                      "dinosaurs, rockets, castles and more, building",
                      "number skills and pencil control as they go."],
               bullets=["50 original pictures to discover", "Starts at 10 dots, builds to 60",
                        "Big, clear numbers", "Color every picture when done",
                        "Large 8.5 x 11 in pages", "Certificate of achievement"],
               bg="#f4511e", accent="#1e88e5", title_fill="#fff176", art=cover_art, seed=51))
