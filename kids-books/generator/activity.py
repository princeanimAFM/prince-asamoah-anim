"""Seasonal activity books: coloring scenes, mazes, word searches, dot-to-dots and drawing prompts."""
import random

from reportlab.lib.colors import white
from reportlab.lib.units import inch

import common as cm
import dots
import drawings
import mazes
import wordsearch

WS_STYLE = dict(grid_w=cm.TRIM_W - 2 * cm.MARGIN - 0.9 * inch, bank_font=22, bank_cols=2, bank_row=0.42 * inch,
                title_size=30)


def ws_rule(i):
    return (10, [(1, 0), (0, 1)], "Words go across and down") if i < 6 else \
        (11, [(1, 0), (0, 1), (1, 1)], "Words go across, down & diagonal")


def coloring_page(c, caption, main, extras, rnd, snow=False, stars=False):
    cm.centered(c, caption, cm.TRIM_H - cm.MARGIN - 34, size=32, max_width=cm.TRIM_W - 2 * cm.MARGIN)
    x0, y0 = cm.MARGIN, cm.MARGIN + 0.1 * inch
    w, h = cm.TRIM_W - 2 * cm.MARGIN, cm.TRIM_H - 2 * cm.MARGIN - 0.9 * inch
    c.setStrokeColor(cm.INK)
    c.setLineWidth(3)
    c.roundRect(x0, y0, w, h, 20, stroke=1, fill=0)
    drawings.scene(c, main, extras, x0 + 10, y0 + 10, w - 20, h - 20, rnd, lw=3.4, snow=snow, stars=stars)
    c.showPage()


def draw_page(c, prompt):
    cm.centered(c, prompt, cm.TRIM_H - cm.MARGIN - 34, size=28, max_width=cm.TRIM_W - 2 * cm.MARGIN)
    c.setStrokeColor(cm.INK)
    c.setLineWidth(3)
    c.roundRect(cm.MARGIN, cm.MARGIN + 0.1 * inch, cm.TRIM_W - 2 * cm.MARGIN, cm.TRIM_H - 2 * cm.MARGIN - 0.9 * inch,
                20, stroke=1, fill=0)
    c.showPage()


class SeasonalBook(cm.BookSpec):
    def __init__(self, scenes, word_themes, dot_pictures, maze_captions, draw_prompts, certificate,
                 snow=False, stars=False, seed=1, **kw):
        super().__init__(**kw)
        self.scenes, self.word_themes, self.dot_pictures = scenes, word_themes, dot_pictures
        self.maze_captions, self.draw_prompts, self.certificate = maze_captions, draw_prompts, certificate
        self.snow, self.stars, self.seed = snow, stars, seed

    def build_interior(self, path):
        rnd = random.Random(self.seed)
        levels = [("", 7, 8, 5), ("", 9, 11, 5), ("", 12, 14, 5)]
        maze_list = mazes.build_mazes(levels, self.seed)
        puzzles = wordsearch.build_puzzles(self.word_themes, self.seed, ws_rule)
        c = cm.new_interior(path, self.full_title)
        pages = cm.front_matter(c, self.title, self.subtitle, self.full_title)
        cm.frame(c)
        cm.centered(c, "What's Inside?", cm.TRIM_H - 2 * inch, size=40)
        inside = [f"{len(self.scenes)} coloring pages", f"{len(maze_list)} mazes",
                  f"{len(puzzles)} word searches", f"{len(self.dot_pictures)} dot-to-dots",
                  f"{len(self.draw_prompts)} draw-your-own pages", "Answers at the back!"]
        for i, line in enumerate(inside):
            cm.centered(c, line, cm.TRIM_H - 3.2 * inch - i * 46, font="Regular", size=22)
        c.showPage()
        pages += 1
        # Interleave activity types so every few pages feel different.
        queues = {
            "color": list(self.scenes), "maze": list(enumerate(maze_list, 1)),
            "ws": list(enumerate(puzzles, 1)), "dots": list(enumerate(self.dot_pictures, 1)),
            "draw": list(self.draw_prompts)}
        pattern = ["color", "maze", "color", "ws", "color", "dots", "maze", "color", "ws", "draw"]
        while any(queues.values()):
            for kind in pattern:
                if not queues[kind]:
                    continue
                item = queues[kind].pop(0)
                if kind == "color":
                    caption, main, extras = item
                    coloring_page(c, caption, main, extras, rnd, self.snow, self.stars)
                elif kind == "maze":
                    n, (_, cells, _) = item
                    mazes.maze_page(c, f"Maze {n}", self.maze_captions[(n - 1) % len(self.maze_captions)], cells)
                elif kind == "ws":
                    n, (theme, level, words, grid, _) = item
                    wordsearch.puzzle_page(c, n, theme, level, words, grid, WS_STYLE)
                elif kind == "dots":
                    n, (name, count) = item
                    dots.dot_page(c, n, name, count)
                else:
                    draw_page(c, item)
                pages += 1
        cm.certificate_page(c, *self.certificate)
        pages += 1
        pages += mazes.solutions_pages(c, maze_list, "Maze Answers")
        pages += wordsearch.solutions_pages(c, puzzles, "Word Search Answers")
        pages = cm.pad_to_even(c, pages)
        c.save()
        return pages


def scene_art(main, extras, bg_items):
    def art(c, x, y, w, h, accent):
        drawings.colored(True)
        c.setFillColor(white)
        c.setStrokeColor(cm.INK)
        c.setLineWidth(6)
        c.roundRect(x, y, w, h, 30, stroke=1, fill=1)
        s = min(w, h) * 0.36
        for fx, fy, name, k in bg_items:
            drawings.DRAW[name](c, x + w * fx, y + h * fy, s * k, 3)
        drawings.DRAW[main](c, x + w / 2, y + h * 0.5, s, 4)
        for fx, fy, name, k in extras:
            drawings.DRAW[name](c, x + w * fx, y + h * fy, s * k, 3.5)
        drawings.colored(False)
    return art


CHRISTMAS = SeasonalBook(
    scenes=[
        ("Merry Christmas!", "christmas_tree", ["gift", "gift", "star", "snowflake"]),
        ("Hello, Snowman!", "snowman", ["christmas_tree", "mitten", "snowflake", "star"]),
        ("Presents for Everyone", "gift", ["gift", "candy_cane", "snowflake", "bell"]),
        ("Jingle Bells", "bell", ["holly", "star", "snowflake", "snowflake"]),
        ("Gingerbread Friend", "gingerbread", ["candy_cane", "cupcake", "star", "snowflake"]),
        ("Hang the Stockings", "stocking", ["stocking", "candy_cane", "star", "holly"]),
        ("Shiny Ornament", "ornament", ["ornament", "ornament", "snowflake", "star"]),
        ("Warm Mittens", "mitten", ["mitten", "snowman", "snowflake", "snowflake"]),
        ("Cozy Christmas Home", "house", ["christmas_tree", "snowman", "moon", "star"]),
        ("Sweet Candy Canes", "candy_cane", ["candy_cane", "gingerbread", "holly", "star"]),
        ("Let It Snow!", "snowflake", ["snowman", "mitten", "snowflake", "snowflake"]),
        ("Deck the Halls", "holly", ["bell", "ornament", "star", "star"]),
        ("Starry Christmas Night", "star", ["christmas_tree", "house", "moon", "snowflake"]),
        ("Christmas Treats", "cupcake", ["gingerbread", "candy_cane", "star", "holly"]),
        ("Snowy Forest", "tree", ["christmas_tree", "christmas_tree", "snowflake", "moon"]),
        ("A Gift Just for You", "gift", ["stocking", "ornament", "star", "bell"]),
        ("Snowman Family", "snowman", ["snowman", "snowman", "snowflake", "star"]),
        ("Christmas Morning", "christmas_tree", ["stocking", "gift", "sun", "snowflake"]),
        ("Ring the Bells", "bell", ["bell", "bell", "star", "holly"]),
        ("Happy Holidays!", "ornament", ["gift", "gingerbread", "holly", "snowflake"]),
    ],
    word_themes=[
        ("Christmas Eve", "SANTA SLEIGH STAR TREE GIFT BELL SNOW ELF"),
        ("Winter Fun", "SLED SKATE SNOWMAN SCARF HAT COCOA ICE COLD"),
        ("Christmas Treats", "COOKIE CAKE CANDY PIE FUDGE MILK TREAT JAM"),
        ("Decorations", "LIGHTS STAR WREATH BOW TINSEL BELL HOLLY GARLAND"),
        ("North Pole", "SANTA ELVES REINDEER SLEIGH TOYS WORKSHOP MAP SNOW"),
        ("Presents", "GIFT BOX RIBBON BOW TAG PAPER SURPRISE WRAP"),
        ("Christmas Tree", "PINE STAR LIGHTS ORNAMENT BRANCH NEEDLES ANGEL TOP"),
        ("Cozy Night", "FIRE SOCKS BLANKET STORY LAMP PAJAMAS SLEEP DREAM"),
        ("Snow Day", "SNOWFLAKE SNOWBALL MITTENS BOOTS COAT FROST FORT PLAY"),
        ("Christmas Songs", "SING CAROL JINGLE BELLS MERRY CHOIR NOTE MUSIC"),
        ("Family Time", "FAMILY HUG LOVE SHARE GIVE THANKS JOY PEACE"),
        ("Santa's Sleigh", "SLEIGH REINDEER FLY ROOF SACK TOYS NIGHT MOON"),
    ],
    dot_pictures=[("star", 12), ("present", 18), ("bell", 20), ("mitten", 22), ("stocking", 24),
                  ("candle", 26), ("candy cane", 28), ("christmas tree", 32), ("snowman", 36), ("gingerbread man", 40)],
    maze_captions=["Help Santa find the chimney!", "Lead the elf to the toy shop!",
                   "Guide the reindeer to the sleigh!", "Take the gift to the tree!",
                   "Help the snowman find his hat!"],
    draw_prompts=["Draw your dream present!", "Draw your Christmas tree!", "Draw your family at Christmas!"],
    certificate=("is a Christmas Activity Star!", "for finishing every puzzle and picture"),
    snow=True, seed=1225,
    title=["Christmas Activity", "Book for Kids"], subtitle="Coloring, Mazes, Word Search & Dot to Dot",
    full_title=("Christmas Activity Book for Kids Ages 4-8: Coloring, Mazes, Word Search & Dot to Dot Fun"),
    sample_page=4,
    cover=dict(badge=["AGES", "4-8"],
               blurb=["Hours of festive, screen-free fun!",
                      "Kids color snowmen and Christmas trees, solve",
                      "mazes and word searches, and connect the dots",
                      "to reveal holiday surprises."],
               bullets=["20 Christmas coloring pages", "15 mazes & 12 word searches",
                        "10 dot-to-dot pictures", "3 draw-your-own pages",
                        "Answers & certificate included", "A perfect stocking stuffer!"],
               bg="#c62828", accent="#2e7d32", title_fill="#ffffff",
               art=scene_art("christmas_tree", [(0.2, 0.2, "gift", 0.45), (0.8, 0.2, "gift", 0.4),
                                                 (0.85, 0.8, "star", 0.3)],
                             [(0.15, 0.78, "snowflake", 0.3)]), seed=61))

HALLOWEEN = SeasonalBook(
    scenes=[
        ("Happy Halloween!", "pumpkin", ["pumpkin", "candy", "bat", "moon"]),
        ("Friendly Ghost", "ghost", ["pumpkin", "candy_corn", "bat", "star"]),
        ("Bats at Night", "bat", ["bat", "haunted_house", "moon", "star"]),
        ("The Witch's Hat", "witch_hat", ["cauldron", "cat", "moon", "bat"]),
        ("Trick or Treat!", "candy", ["candy_corn", "candy", "star", "moon"]),
        ("Spooky House", "haunted_house", ["pumpkin", "ghost", "bat", "moon"]),
        ("Black Cat", "cat", ["pumpkin", "witch_hat", "moon", "star"]),
        ("Bubbling Cauldron", "cauldron", ["witch_hat", "candy", "bat", "star"]),
        ("Wise Old Owl", "owl", ["tree", "pumpkin", "moon", "star"]),
        ("Itsy Bitsy Spider", "spider_web", ["spider", "pumpkin", "moon", "bat"]),
        ("Candy Corn Party", "candy_corn", ["candy_corn", "candy", "star", "star"]),
        ("Pumpkin Patch", "pumpkin", ["pumpkin", "mushroom", "owl", "moon"]),
        ("Boo!", "ghost", ["ghost", "ghost", "star", "moon"]),
        ("Moonlit Night", "moon", ["haunted_house", "cat", "bat", "star"]),
        ("Hanging Spider", "spider", ["spider_web", "candy", "star", "bat"]),
        ("Autumn Treats", "cupcake", ["apple", "candy_corn", "star", "moon"]),
        ("Mushroom Forest", "mushroom", ["mushroom", "owl", "moon", "star"]),
        ("Pumpkin Friends", "pumpkin", ["cat", "ghost", "bat", "moon"]),
        ("Magic Potion", "cauldron", ["cauldron", "spider", "star", "moon"]),
        ("Halloween Night", "haunted_house", ["witch_hat", "pumpkin", "bat", "moon"]),
    ],
    word_themes=[
        ("Halloween Night", "MOON BAT OWL GHOST STARS DARK NIGHT BOO"),
        ("Trick or Treat", "CANDY TREAT BAG MASK DOOR KNOCK TRICK FUN"),
        ("Costumes", "WITCH PIRATE ROBOT FAIRY CAPE MASK HAT WIG"),
        ("Pumpkin Patch", "PUMPKIN VINE PATCH STEM SEEDS ORANGE CARVE PIE"),
        ("Spooky Things", "SPIDER WEB BAT GHOST CAT OWL BROOM CAULDRON"),
        ("Autumn", "LEAVES ACORN HARVEST APPLE CORN HAY SCARECROW WIND"),
        ("Party Time", "GAMES MUSIC DANCE CANDY CAKE PUNCH FRIENDS PARTY"),
        ("Witch's Kitchen", "POTION CAULDRON SPOON BUBBLE BREW MAGIC SPELL WAND"),
        ("Night Creatures", "BAT OWL CAT SPIDER MOTH FOX TOAD RAT"),
        ("Haunted House", "DOOR STAIRS ATTIC CREAK DUST COBWEB CANDLE SHADOW"),
        ("Candy Bag", "CARAMEL LOLLIPOP GUMMY TOFFEE CHOCOLATE MINT CANDYCORN TAFFY"),
        ("Fall Fun", "HAYRIDE MAZE PICNIC CIDER BONFIRE SWEATER BOOTS RAKE"),
    ],
    dot_pictures=[("moon", 14), ("witch hat", 16), ("bat", 22), ("candle", 24), ("cat", 26), ("mushroom", 28),
                  ("ghost", 30), ("owl", 34), ("pumpkin", 38), ("castle", 42)],
    maze_captions=["Help the ghost find its friends!", "Lead the cat to the pumpkin!",
                   "Find the way to the candy!", "Guide the bat back to its cave!",
                   "Help the witch find her broom!"],
    draw_prompts=["Draw your Halloween costume!", "Draw a funny jack-o'-lantern face!", "Draw a friendly monster!"],
    certificate=("is a Halloween Activity Star!", "for finishing every puzzle and picture"),
    stars=True, seed=1031,
    title=["Halloween Activity", "Book for Kids"], subtitle="Coloring, Mazes, Word Search & Dot to Dot",
    full_title=("Halloween Activity Book for Kids Ages 4-8: Coloring, Mazes, Word Search & Dot to Dot Fun"),
    sample_page=4,
    cover=dict(badge=["AGES", "4-8"],
               blurb=["Spooky (but not scary!) fun for little ones.",
                      "Kids color pumpkins and friendly ghosts, solve",
                      "mazes and word searches, and connect the dots",
                      "to reveal Halloween surprises."],
               bullets=["20 Halloween coloring pages", "15 mazes & 12 word searches",
                        "10 dot-to-dot pictures", "3 draw-your-own pages",
                        "Answers & certificate included", "A great alternative to candy!"],
               bg="#4a148c", accent="#fb8c00", title_fill="#ffb74d",
               art=scene_art("pumpkin", [(0.2, 0.75, "ghost", 0.4), (0.8, 0.22, "candy", 0.35),
                                         (0.2, 0.2, "candy_corn", 0.3)],
                             [(0.82, 0.8, "moon", 0.35)]), seed=62))
