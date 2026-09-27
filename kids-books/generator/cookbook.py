"""Book: The Little Chef Cookbook for Kids -- 30 easy recipes, printed in color."""
import math

from reportlab.lib.colors import HexColor, white
from reportlab.lib.units import inch
from reportlab.pdfbase import pdfmetrics

import common as cm
import drawings
from recipes import CATEGORIES, R

CAT_COLOR = {"Breakfast": "#fb8c00", "Lunch": "#43a047", "Snacks": "#e53935", "Dinner": "#1e88e5",
             "Desserts": "#8e24aa"}
CAT_TINT = {"Breakfast": "#fff3e0", "Lunch": "#e8f5e9", "Snacks": "#ffebee", "Dinner": "#e3f2fd",
            "Desserts": "#f3e5f5"}
CAT_ART = {"Breakfast": ["teacup", "sun"], "Lunch": ["apple", "house"], "Snacks": ["apple", "star"],
           "Dinner": ["house", "heart"], "Desserts": ["cupcake", "heart"]}
CAT_BLURB = {"Breakfast": "Rise and shine! Tasty ways to start your day.",
             "Lunch": "Wraps, pizzas and sandwiches you can make yourself.",
             "Snacks": "Quick bites for after school and in between.",
             "Dinner": "Help cook dinner for the whole family.",
             "Desserts": "Sweet treats to share (or not!)."}
LEVELS = {1: "Easy", 2: "Medium", 3: "Chef Level"}
ORANGE = HexColor("#ef6c00")
X0, X1 = cm.MARGIN, cm.TRIM_W - cm.MARGIN
TOP = cm.TRIM_H - cm.MARGIN


def wrap(text, font, size, width):
    words, lines, cur = text.split(), [], ""
    for w in words:
        t = (cur + " " + w).strip()
        if pdfmetrics.stringWidth(t, font, size) <= width:
            cur = t
        else:
            lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


def chef_hat(c, cx, cy, s, color=white, stroke=cm.INK):
    c.setStrokeColor(stroke)
    c.setLineWidth(max(1.2, s * 0.08))
    c.setFillColor(color)
    for dx, dy, r in ((-0.35, 0.3, 0.38), (0.35, 0.3, 0.38), (0, 0.5, 0.45)):
        c.circle(cx + dx * s, cy + dy * s, r * s, stroke=1, fill=1)
    c.rect(cx - 0.5 * s, cy - 0.5 * s, s, 0.8 * s, stroke=1, fill=1)
    c.setStrokeColor(color)
    c.setLineWidth(max(1.2, s * 0.08) + 1)
    c.line(cx - 0.47 * s, cy + 0.3 * s, cx + 0.47 * s, cy + 0.3 * s)
    c.setStrokeColor(stroke)
    c.setLineWidth(max(1.2, s * 0.08))
    c.line(cx - 0.5 * s, cy - 0.2 * s, cx + 0.5 * s, cy - 0.2 * s)


def clock(c, cx, cy, s):
    c.setStrokeColor(cm.INK)
    c.setLineWidth(1.8)
    c.setFillColor(white)
    c.circle(cx, cy, s, stroke=1, fill=1)
    c.line(cx, cy, cx, cy + s * 0.7)
    c.line(cx, cy, cx + s * 0.5, cy)


def person(c, cx, cy, s):
    c.setStrokeColor(cm.INK)
    c.setLineWidth(1.8)
    c.setFillColor(white)
    c.circle(cx, cy + s * 0.45, s * 0.35, stroke=1, fill=1)
    p = c.beginPath()
    p.arc(cx - s * 0.7, cy - s * 1.0, cx + s * 0.7, cy + s * 0.4, 0, 180)
    p.close()
    c.drawPath(p, stroke=1, fill=1)


def pill(c, x, y, w, h, color, text=None, size=12, text_color=white):
    c.setFillColor(HexColor(color) if isinstance(color, str) else color)
    c.roundRect(x, y, w, h, h / 2, stroke=0, fill=1)
    if text:
        c.setFillColor(text_color)
        c.setFont("Bold", size)
        c.drawCentredString(x + w / 2, y + h / 2 - size * 0.36, text)


def band(c, title, color, subtitle=None, h=1.25 * inch):
    c.setFillColor(HexColor(color))
    c.roundRect(X0, TOP - h, X1 - X0, h, 20, stroke=0, fill=1)
    size = cm.fit_font_size(title, "Bold", 34, X1 - X0 - 0.5 * inch)
    cm.outlined_text(c, title, cm.TRIM_W / 2, TOP - h / 2 - (4 if subtitle else size * 0.35), "Bold", size,
                     white, cm.INK, 4)
    if subtitle:
        c.setFont("Bold", 13)
        c.setFillColor(white)
        c.drawCentredString(cm.TRIM_W / 2, TOP - h + 12, subtitle)


def recipe_pages(c, n, r):
    col, tint = CAT_COLOR[r["cat"]], HexColor(CAT_TINT[r["cat"]])
    # ---- Page 1: overview + ingredients ----
    band(c, r["name"], col, f"RECIPE {n}  •  {r['cat'].upper()}")
    y = TOP - 1.25 * inch - 0.55 * inch
    stats = [("clock", r["time"]), ("person", r["serves"]), ("hat", LEVELS[r["level"]])]
    w = (X1 - X0 - 0.4 * inch) / 3
    for k, (icon, text) in enumerate(stats):
        x = X0 + k * (w + 0.2 * inch)
        c.setFillColor(tint)
        c.roundRect(x, y - 0.1 * inch, w, 0.62 * inch, 14, stroke=0, fill=1)
        ix, iy = x + 0.35 * inch, y + 0.21 * inch
        if icon == "clock":
            clock(c, ix, iy, 11)
        elif icon == "person":
            person(c, ix, iy, 13)
        else:
            chef_hat(c, ix, iy, 10)
        c.setFillColor(cm.INK)
        c.setFont("Bold", cm.fit_font_size(text, "Bold", 15, w - 0.75 * inch))
        c.drawString(x + 0.65 * inch, iy - 5, text)
    # Ingredients box
    y -= 0.45 * inch
    lines = []
    for ing in r["ingredients"]:
        lines.append(wrap(ing, "Regular", 16, X1 - X0 - 1.3 * inch))
    tools = wrap(", ".join(r["tools"]), "Regular", 15, X1 - X0 - 0.8 * inch)
    box_h = 0.75 * inch + sum(len(l) for l in lines) * 22 + len(lines) * 8
    c.setFillColor(tint)
    c.roundRect(X0, y - box_h, X1 - X0, box_h, 18, stroke=0, fill=1)
    pill(c, X0 + 0.3 * inch, y - 0.45 * inch, 2.4 * inch, 0.36 * inch, col, "YOU WILL NEED", 15)
    yy = y - 0.85 * inch
    for chunk in lines:
        c.setStrokeColor(HexColor(col))
        c.setLineWidth(2)
        c.setFillColor(white)
        c.roundRect(X0 + 0.35 * inch, yy - 3, 15, 15, 3, stroke=1, fill=1)
        c.setFillColor(cm.INK)
        c.setFont("Regular", 16)
        for line in chunk:
            c.drawString(X0 + 0.75 * inch, yy, line)
            yy -= 22
        yy -= 8
    y = y - box_h - 0.3 * inch
    # Tools box
    tools_h = 0.65 * inch + len(tools) * 20
    c.setFillColor(HexColor("#f5f5f5"))
    c.roundRect(X0, y - tools_h, X1 - X0, tools_h, 18, stroke=0, fill=1)
    pill(c, X0 + 0.3 * inch, y - 0.45 * inch, 1.3 * inch, 0.36 * inch, "#616161", "TOOLS", 15)
    c.setFillColor(cm.INK)
    c.setFont("Regular", 15)
    for k, line in enumerate(tools):
        c.drawString(X0 + 0.4 * inch, y - 0.75 * inch - k * 20, line)
    # Illustration in the space left
    space_top, space_bottom = y - tools_h - 0.2 * inch, cm.MARGIN
    if space_top - space_bottom > 1.2 * inch:
        s = min((space_top - space_bottom) / 2.4, 1.6 * inch)
        drawings.colored(True)
        art = CAT_ART[r["cat"]]
        drawings.DRAW[art[n % 2]](c, cm.TRIM_W / 2, (space_top + space_bottom) / 2, s, 3)
        drawings.colored(False)
    c.showPage()

    # ---- Page 2: steps ----
    band(c, "Let's Cook!", col, r["name"].upper(), h=1.0 * inch)
    y0 = TOP - 1.0 * inch - 0.5 * inch
    width = X1 - X0 - 0.9 * inch
    tip = wrap(r["tip"], "Regular", 15, X1 - X0 - 0.7 * inch)
    tip_h = 0.65 * inch + len(tip) * 20
    floor = cm.MARGIN + 1.35 * inch + tip_h + 0.1 * inch
    # Shrink the text a little for long recipes so every step fits above the tip box.
    for size in (17, 16, 15, 14, 13):
        lead, gap = size + 6, size * 1.9
        layout = []
        for step in r["steps"]:
            adult = step.startswith("!")
            text = step.lstrip("!")
            indent = 1.55 * inch if adult else 0
            first = wrap(text, "Regular", size, width - indent)
            rest = wrap(" ".join(first[1:]), "Regular", size, width) if len(first) > 1 else []
            layout.append((adult, indent, first[0], rest))
        height = sum(len(rest) * lead + gap for _, _, _, rest in layout)
        if y0 - height >= floor:
            break
    y = y0
    for k, (adult, indent, first, rest) in enumerate(layout, 1):
        c.setFillColor(HexColor(col))
        c.circle(X0 + 0.25 * inch, y + 6, 15, stroke=0, fill=1)
        c.setFillColor(white)
        c.setFont("Bold", 16)
        c.drawCentredString(X0 + 0.25 * inch, y, str(k))
        tx = X0 + 0.7 * inch
        if adult:
            pill(c, tx, y - 4, 1.45 * inch, 0.3 * inch, ORANGE, "GROWN-UP HELP", 10)
        c.setFillColor(cm.INK)
        c.setFont("Regular", size)
        c.drawString(tx + indent, y, first)
        for line in rest:
            y -= lead
            c.drawString(tx, y, line)
        y -= gap
    # Chef's tip
    ty = max(y + gap - lead - 0.2 * inch, cm.MARGIN + 1.35 * inch + tip_h)
    c.setFillColor(HexColor("#fff9c4"))
    c.roundRect(X0, ty - tip_h, X1 - X0, tip_h, 18, stroke=0, fill=1)
    pill(c, X0 + 0.3 * inch, ty - 0.45 * inch, 1.7 * inch, 0.36 * inch, "#f9a825", "CHEF'S TIP", 15)
    c.setFillColor(cm.INK)
    c.setFont("Regular", 15)
    for k, line in enumerate(tip):
        c.drawString(X0 + 0.35 * inch, ty - 0.75 * inch - k * 20, line)
    # Rating
    ry = cm.MARGIN + 0.75 * inch
    c.setFont("Bold", 18)
    c.drawString(X0, ry, "How did you like it?")
    c.setStrokeColor(cm.INK)
    c.setLineWidth(2)
    c.setFillColor(white)
    for k in range(5):
        c.drawPath(cm.star_path(c, X0 + 3.1 * inch + k * 0.55 * inch, ry + 6, 14, 6), stroke=1, fill=1)
    c.setFont("Regular", 14)
    c.setFillColor(cm.INK)
    c.drawString(X0, cm.MARGIN + 0.2 * inch, "Notes:")
    c.setStrokeColor(HexColor("#bdbdbd"))
    c.setLineWidth(1)
    c.line(X0 + 0.7 * inch, cm.MARGIN + 0.2 * inch, X1, cm.MARGIN + 0.2 * inch)
    c.showPage()


def chapter_page(c, cat, first, last):
    col = CAT_COLOR[cat]
    c.setFillColor(HexColor(col))
    c.roundRect(X0, cm.MARGIN, X1 - X0, TOP - cm.MARGIN, 30, stroke=0, fill=1)
    cm.outlined_text(c, cat, cm.TRIM_W / 2, TOP - 2.2 * inch, "Bold", 72, white, cm.INK, 8)
    c.setFont("Bold", cm.fit_font_size(CAT_BLURB[cat], "Bold", 20, X1 - X0 - 0.6 * inch))
    c.setFillColor(white)
    c.drawCentredString(cm.TRIM_W / 2, TOP - 2.9 * inch, CAT_BLURB[cat])
    c.setFont("Bold", 20)
    c.drawCentredString(cm.TRIM_W / 2, TOP - 3.3 * inch, f"Recipes {first} to {last}")
    c.setFillColor(white)
    c.circle(cm.TRIM_W / 2, cm.TRIM_H * 0.33, 2.1 * inch, stroke=0, fill=1)
    drawings.colored(True)
    a, b = CAT_ART[cat]
    drawings.DRAW[a](c, cm.TRIM_W / 2 - 0.75 * inch, cm.TRIM_H * 0.33, 1.0 * inch, 4)
    drawings.DRAW[b](c, cm.TRIM_W / 2 + 0.85 * inch, cm.TRIM_H * 0.33 + 0.5 * inch, 0.7 * inch, 4)
    drawings.colored(False)
    c.showPage()


def info_page(c, title, color, items, two_col=False, size=17):
    band(c, title, color)
    y = TOP - 1.25 * inch - 0.55 * inch
    for k, (head, body) in enumerate(items):
        c.setFillColor(HexColor(color))
        c.circle(X0 + 0.2 * inch, y + 6, 8, stroke=0, fill=1)
        c.setFillColor(cm.INK)
        c.setFont("Bold", size)
        c.drawString(X0 + 0.45 * inch, y, head)
        hw = pdfmetrics.stringWidth(head + "  ", "Bold", size)
        lines = wrap(body, "Regular", size, X1 - X0 - 0.5 * inch - hw)
        c.setFont("Regular", size)
        if lines:
            c.drawString(X0 + 0.45 * inch + hw, y, lines[0])
            rest = wrap(" ".join(lines[1:]), "Regular", size, X1 - X0 - 0.5 * inch)
            for line in rest:
                y -= size + 6
                c.drawString(X0 + 0.45 * inch, y, line)
        y -= size + 20
    c.showPage()


def my_recipe_page(c, k):
    band(c, "My Own Recipe", "#00897b", f"CREATED BY CHEF ____________")
    y = TOP - 1.25 * inch - 0.5 * inch
    c.setFont("Bold", 18)
    c.setFillColor(cm.INK)
    c.drawString(X0, y, "Recipe name:")
    c.setStrokeColor(HexColor("#bdbdbd"))
    c.setLineWidth(1)
    c.line(X0 + 1.6 * inch, y - 2, X1, y - 2)
    y -= 0.6 * inch
    for label, rows in (("You will need:", 5), ("Steps:", 6)):
        c.setFont("Bold", 18)
        c.drawString(X0, y, label)
        y -= 0.45 * inch
        for _ in range(rows):
            c.line(X0 + 0.2 * inch, y, X1, y)
            y -= 0.4 * inch
        y -= 0.15 * inch
    c.setFont("Bold", 18)
    c.drawString(X0, y, "Draw it:")
    c.setStrokeColor(cm.INK)
    c.roundRect(X0 + 1.2 * inch, cm.MARGIN, X1 - X0 - 1.2 * inch, y - cm.MARGIN + 10, 14, stroke=1, fill=0)
    c.showPage()


class Cookbook(cm.BookSpec):
    def build_interior(self, path):
        c = cm.new_interior(path, self.full_title)
        pages = cm.front_matter(c, self.title, self.subtitle, self.full_title, kids=True, extra=(
            "", "Cooking involves heat and sharp tools. Children should always cook with an adult.",
            "Check every ingredient for allergies. Recipes marked GROWN-UP HELP need an adult."))
        info_page(c, "Welcome, Little Chef!", "#00897b", [
            ("Cooking is fun!", "In this book you'll find 30 recipes for breakfast, lunch, snacks, dinner and desserts."),
            ("Read first.", "Read the whole recipe before you start, and gather everything you need."),
            ("Tick it off.", "Tick each box on the 'You Will Need' list as you get the ingredient out."),
            ("Level:", "Each recipe is marked Easy, Medium, or Chef Level. Start with the easy ones!"),
            ("GROWN-UP HELP", "Steps with this orange label use the stove, oven, blender or a sharp knife. "
                              "Always ask a grown-up to do or help with these."),
            ("Rate it!", "After you cook, color in the stars to show how much you liked it."),
        ])
        info_page(c, "Kitchen Safety Rules", "#e53935", [
            ("1.", "Always ask a grown-up before you start cooking."),
            ("2.", "Wash your hands with soap and water before you cook, and after touching raw meat or eggs."),
            ("3.", "Tie back long hair and roll up your sleeves."),
            ("4.", "Only a grown-up uses sharp knives, the stove, the oven and the blender."),
            ("5.", "Use oven mitts for anything hot, and turn pot handles away from the edge."),
            ("6.", "Never taste raw dough, raw eggs or raw meat."),
            ("7.", "Wipe up spills right away so nobody slips."),
            ("8.", "Clean up as you go. A tidy kitchen is a happy kitchen!"),
        ])
        info_page(c, "Measuring Made Easy", "#1e88e5", [
            ("Cups", "are for bigger amounts like flour, milk and oats. Fill, then level the top with a knife."),
            ("Tablespoon (tbsp)", "is the bigger spoon. 3 teaspoons = 1 tablespoon."),
            ("Teaspoon (tsp)", "is the small spoon, for things like salt and baking powder."),
            ("1 cup", "= 16 tablespoons = about 240 ml."),
            ("1/2 cup", "= 8 tablespoons = about 120 ml."),
            ("1/4 cup", "= 4 tablespoons = about 60 ml."),
            ("1 stick of butter", "= 1/2 cup = 8 tablespoons."),
            ("Oven temperatures", "350°F = 175°C, 400°F = 200°C, 425°F = 220°C."),
        ])
        info_page(c, "Cooking Words", "#8e24aa", [
            ("Stir:", "Mix gently in circles with a spoon."),
            ("Whisk:", "Beat quickly with a whisk or fork to add air."),
            ("Fold:", "Mix very gently by lifting from the bottom, so you don't squash the air out."),
            ("Mash:", "Squash soft food, like a banana, with a fork or masher."),
            ("Simmer:", "Cook just below boiling, with small bubbles."),
            ("Preheat:", "Turn the oven on early so it is hot when your food goes in."),
            ("Drain:", "Pour food into a colander so the water runs away."),
            ("Chill:", "Put in the fridge to get cold and firm."),
        ])
        pages += 4
        n = 0
        for cat in CATEGORIES:
            items = [r for r in R if r["cat"] == cat]
            chapter_page(c, cat, n + 1, n + len(items))
            pages += 1
            for r in items:
                n += 1
                recipe_pages(c, n, r)
                pages += 2
        for k in range(4):
            my_recipe_page(c, k)
            pages += 1
        cm.certificate_page(c, "is an Official Junior Chef!", "for cooking up something delicious")
        pages += 1
        pages = cm.pad_to_even(c, pages)
        c.save()
        return pages


def cover_art(c, x, y, w, h, accent):
    c.setFillColor(white)
    c.setStrokeColor(cm.INK)
    c.setLineWidth(6)
    c.roundRect(x, y, w, h, 30, stroke=1, fill=1)
    s = min(w, h) * 0.2
    chef_hat(c, x + w / 2, y + h * 0.66, s * 1.4)
    drawings.colored(True)
    drawings.cupcake(c, x + w * 0.2, y + h * 0.28, s * 0.85, 4)
    drawings.apple(c, x + w * 0.5, y + h * 0.25, s * 0.8, 4)
    drawings.teacup(c, x + w * 0.8, y + h * 0.27, s * 0.8, 4)
    drawings.colored(False)


BOOK = Cookbook(
    title=["The Little Chef", "Cookbook for Kids"], subtitle="30 Easy, Fun Recipes for Kids Ages 8-12",
    full_title=("The Little Chef Cookbook for Kids: 30 Easy, Fun Recipes for Kids Ages 8-12, "
                "with Kitchen Safety and Cooking Skills"),
    sample_page=9,
    cover=dict(badge=["AGES", "8-12"],
               blurb=["Get cooking with 30 easy, tasty recipes!",
                      "Pancakes, pizzas, tacos, cookies and more,",
                      "with simple steps, tick-box ingredient lists",
                      "and GROWN-UP HELP labels for safety."],
               bullets=["30 easy, original recipes", "Breakfast, lunch, snacks, dinner & desserts",
                        "Kitchen safety & measuring guides", "Step-by-step in full color",
                        "Pages to write your own recipes", "Junior Chef certificate"],
               bg="#ff7043", accent="#43a047", title_fill="#ffffff", art=cover_art, seed=81,
               spine_per_page=cm.SPINE_PER_PAGE_COLOR))
