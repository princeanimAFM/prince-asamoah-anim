"""Book: Mazes for Kids Ages 4-8 -- 100 original mazes, easy to hard, with solutions."""
import random
from collections import deque

from reportlab.lib.colors import HexColor, white
from reportlab.lib.units import inch

import common as cm

N, S, E, W = 1, 2, 4, 8
DIRS = {N: (0, 1), S: (0, -1), E: (1, 0), W: (-1, 0)}
OPP = {N: S, S: N, E: W, W: E}


def generate(cols, rows, rnd):
    """Recursive-backtracker perfect maze. cells[x][y] holds a bitmask of open sides."""
    cells = [[0] * rows for _ in range(cols)]
    stack = [(0, rows - 1)]
    seen = {(0, rows - 1)}
    while stack:
        x, y = stack[-1]
        options = [(d, x + dx, y + dy) for d, (dx, dy) in DIRS.items()
                   if 0 <= x + dx < cols and 0 <= y + dy < rows and (x + dx, y + dy) not in seen]
        if not options:
            stack.pop()
            continue
        d, nx, ny = rnd.choice(options)
        cells[x][y] |= d
        cells[nx][ny] |= OPP[d]
        seen.add((nx, ny))
        stack.append((nx, ny))
    return cells


def solve(cells, start, goal):
    prev = {start: None}
    q = deque([start])
    while q:
        cur = q.popleft()
        if cur == goal:
            break
        x, y = cur
        for d, (dx, dy) in DIRS.items():
            nxt = (x + dx, y + dy)
            if cells[x][y] & d and nxt not in prev:
                prev[nxt] = cur
                q.append(nxt)
    path, cur = [], goal
    while cur is not None:
        path.append(cur)
        cur = prev[cur]
    return path[::-1]


def draw_maze(c, cells, x0, y0, cell, line_w, solution=None, sol_color=None, color=cm.INK):
    cols, rows = len(cells), len(cells[0])
    c.setStrokeColor(color)
    c.setLineWidth(line_w)
    c.setLineCap(1)
    p = c.beginPath()
    for x in range(cols):
        for y in range(rows):
            px, py = x0 + x * cell, y0 + y * cell
            if not cells[x][y] & N and not (x == 0 and y == rows - 1):
                p.moveTo(px, py + cell); p.lineTo(px + cell, py + cell)
            if not cells[x][y] & W:
                p.moveTo(px, py); p.lineTo(px, py + cell)
            if y == 0 and not (x == cols - 1):
                p.moveTo(px, py); p.lineTo(px + cell, py)
            if x == cols - 1:
                p.moveTo(px + cell, py); p.lineTo(px + cell, py + cell)
    c.drawPath(p, stroke=1, fill=0)
    if solution:
        c.setStrokeColor(sol_color)
        c.setLineWidth(max(cell * 0.28, 1.2))
        c.setLineJoin(1)
        p = c.beginPath()
        pts = [(0, rows)] + solution + [(cols - 1, -1)]
        for i, (x, y) in enumerate(pts):
            px, py = x0 + (x + 0.5) * cell, y0 + (y + 0.5) * cell
            (p.moveTo if i == 0 else p.lineTo)(px, py)
        c.drawPath(p, stroke=1, fill=0)


def build_mazes(levels, seed):
    """levels: [(level name, cols, rows, count)] -> [(level name, cells, solution)]."""
    rnd = random.Random(seed)
    out = []
    for name, cols, rows, count in levels:
        for _ in range(count):
            cells = generate(cols, rows, rnd)
            out.append((name, cells, solve(cells, (0, rows - 1), (cols - 1, 0))))
    return out


def maze_page(c, number, level, cells):
    cols, rows = len(cells), len(cells[0])
    cm.centered(c, f"Maze {number}" if isinstance(number, int) else number, cm.TRIM_H - cm.MARGIN - 30, size=30)
    cm.centered(c, level, cm.TRIM_H - cm.MARGIN - 56, font="Regular", size=15)
    avail_w = cm.TRIM_W - 2 * cm.MARGIN - 0.4 * inch
    avail_h = cm.TRIM_H - 2 * cm.MARGIN - 2.1 * inch
    cell = min(avail_w / cols, avail_h / rows)
    x0 = (cm.TRIM_W - cell * cols) / 2
    y0 = cm.MARGIN + 0.75 * inch + (avail_h - cell * rows) / 2
    draw_maze(c, cells, x0, y0, cell, line_w=max(2.2, min(4.5, cell * 0.07)))
    # Start / finish markers
    c.setFont("Bold", 16)
    c.setFillColor(cm.INK)
    sx, sy = x0 + cell / 2, y0 + rows * cell
    c.drawCentredString(sx, sy + 26, "START")
    arrow(c, sx, sy + 20, sx, sy + 4)
    fx, fy = x0 + (cols - 0.5) * cell, y0
    arrow(c, fx, fy - 4, fx, fy - 20)
    c.drawCentredString(fx, fy - 38, "FINISH")
    c.setLineWidth(2)
    c.drawPath(cm.star_path(c, fx + 50, fy - 32, 12, 5), stroke=1, fill=0)
    c.showPage()


def arrow(c, x1, y1, x2, y2):
    c.setLineWidth(2.5)
    c.setStrokeColor(cm.INK)
    c.line(x1, y1, x2, y2)
    p = c.beginPath()
    d = -6 if y2 < y1 else 6
    p.moveTo(x2, y2); p.lineTo(x2 - 6, y2 - d); p.lineTo(x2 + 6, y2 - d); p.close()
    c.setFillColor(cm.INK)
    c.drawPath(p, stroke=0, fill=1)


def solutions_pages(c, mazes, heading="Solutions", first_number=1):
    per_page, cols_on_page = 6, 2
    box_w = (cm.TRIM_W - 2 * cm.MARGIN) / cols_on_page
    box_h = (cm.TRIM_H - 2 * cm.MARGIN - 0.6 * inch) / 3
    pages = 0
    for start in range(0, len(mazes), per_page):
        cm.centered(c, heading, cm.TRIM_H - cm.MARGIN - 20, size=24)
        for i, (_, cells, sol) in enumerate(mazes[start:start + per_page]):
            col, row = i % cols_on_page, i // cols_on_page
            bx = cm.MARGIN + col * box_w
            by = cm.TRIM_H - cm.MARGIN - 0.6 * inch - (row + 1) * box_h
            ncols, nrows = len(cells), len(cells[0])
            cell = min((box_w - 30) / ncols, (box_h - 40) / nrows)
            x0 = bx + (box_w - cell * ncols) / 2
            y0 = by + 10 + (box_h - 40 - cell * nrows) / 2
            draw_maze(c, cells, x0, y0, cell, 1.1, sol, HexColor("#7a7a7a"))
            c.setFont("Bold", 12)
            c.setFillColor(cm.INK)
            c.drawCentredString(bx + box_w / 2, by + box_h - 18, f"Maze {first_number + start + i}")
        c.showPage()
        pages += 1
    return pages


class MazeBook(cm.BookSpec):
    def __init__(self, levels, seed, **kw):
        super().__init__(**kw)
        self.levels, self.seed = levels, seed

    def build_interior(self, path):
        mazes = build_mazes(self.levels, self.seed)
        c = cm.new_interior(path, self.full_title)
        pages = cm.front_matter(c, self.title, self.subtitle, self.full_title)
        cm.frame(c)
        cm.centered(c, "How to Play", cm.TRIM_H - 2 * inch, size=40)
        for i, line in enumerate([
            "1. Put your pencil on START.",
            "2. Find a path through the maze to FINISH.",
            "3. You cannot cross any lines!",
            "4. Stuck? Go back and try another way.",
            "5. Mazes get harder as you go. You can do it!",
            "Answers are at the back of the book.",
        ]):
            cm.centered(c, line, cm.TRIM_H - 3.2 * inch - i * 44, font="Regular", size=20)
        c.showPage()
        pages += 1
        for n, (level, cells, _) in enumerate(mazes, 1):
            maze_page(c, n, level, cells)
            pages += 1
        cm.certificate_page(c, "is a Super Maze Master!", f"for finishing all {len(mazes)} mazes")
        pages += 1
        pages += solutions_pages(c, mazes)
        pages = cm.pad_to_even(c, pages)
        c.save()
        return pages


def cover_art(c, x, y, w, h, accent, seed=7, n=11):
    rnd = random.Random(seed)
    cells = generate(n, n, rnd)
    sol = solve(cells, (0, n - 1), (n - 1, 0))
    size = min(w, h) * 0.92
    cx, cy = x + w / 2, y + h / 2
    c.setFillColor(white)
    c.setStrokeColor(cm.INK)
    c.setLineWidth(6)
    c.roundRect(cx - size / 2 - 14, cy - size / 2 - 14, size + 28, size + 28, 26, stroke=1, fill=1)
    cell = size / n
    draw_maze(c, cells, cx - size / 2, cy - size / 2, cell, 5, sol, accent)


BOOK_1 = MazeBook(
    levels=[("Level 1: Warm Up", 6, 7, 20), ("Level 2: Easy", 9, 11, 25),
            ("Level 3: Medium", 12, 15, 30), ("Level 4: Tricky", 16, 20, 25)],
    seed=2026, title=["Mazes for Kids", "Ages 4-8"], subtitle="100 Fun Maze Puzzles from Easy to Hard",
    full_title="Mazes for Kids Ages 4-8: 100 Fun Maze Puzzles from Easy to Hard", sample_page=6,
    cover=dict(badge=["AGES", "4-8"],
               blurb=["Big, bold mazes that grow with your child!",
                      "Start with simple warm-ups and work up to",
                      "tricky challenges that build focus, patience,",
                      "and problem-solving skills."],
               bullets=["100 original mazes in 4 levels", "Large 8.5 x 11 in pages",
                        "Easy-to-hard progression", "Full answer key included",
                        "Certificate of achievement", "Screen-free fun for home & travel"],
               bg="#1e88e5", accent="#ff7043", title_fill="#ffeb3b", art=cover_art, seed=11))

BOOK_2 = MazeBook(
    levels=[("Level 1: Easy", 10, 12, 20), ("Level 2: Medium", 14, 17, 30),
            ("Level 3: Hard", 18, 22, 30), ("Level 4: Expert", 22, 28, 20)],
    seed=3033, title=["Mazes for Kids", "Ages 6-10"], subtitle="100 Challenging Mazes: Book 2",
    full_title="Mazes for Kids Ages 6-10: 100 Challenging Maze Puzzles, Book 2", sample_page=60,
    cover=dict(badge=["AGES", "6-10"],
               blurb=["Ready for a bigger challenge?",
                      "100 brand-new mazes that start at medium and",
                      "climb to expert level. Great for sharp minds",
                      "who have outgrown the easy stuff!"],
               bullets=["100 new mazes, 4 levels up to Expert", "Large 8.5 x 11 in pages",
                        "Builds focus and planning skills", "Full answer key included",
                        "Certificate of achievement", "Perfect follow-up to Book 1"],
               bg="#3949ab", accent="#ffca28", title_fill="#80deea",
               art=lambda *a: cover_art(*a, seed=21, n=15), seed=12))
