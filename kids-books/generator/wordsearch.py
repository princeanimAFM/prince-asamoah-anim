"""Book: Word Search for Kids Ages 6-8 -- 50 themed large-print puzzles with answers."""
import random

from reportlab.lib.colors import HexColor, white
from reportlab.lib.units import inch

import common as cm

THEMES = [
    ("Farm Animals", "COW PIG HORSE SHEEP GOAT DUCK HEN LAMB BARN PONY"),
    ("Ocean Life", "FISH WHALE CRAB SHARK SEAL OCTOPUS SQUID CORAL SHELL STARFISH"),
    ("Outer Space", "MOON SUN STAR PLANET ROCKET COMET ORBIT MARS EARTH ALIEN"),
    ("Dinosaur Days", "FOSSIL BONES EGG CLAW TAIL ROAR SWAMP JUNGLE HORN SCALES"),
    ("Fruits", "APPLE BANANA GRAPE MANGO PEAR PLUM LEMON CHERRY MELON PEACH"),
    ("Veggies", "CARROT PEAS CORN BEAN ONION POTATO TOMATO CELERY KALE PEPPER"),
    ("Colors", "RED BLUE GREEN YELLOW ORANGE PURPLE PINK BROWN BLACK WHITE"),
    ("Shapes", "CIRCLE SQUARE OVAL HEART STAR CUBE CONE DIAMOND ARROW CROSS"),
    ("Weather", "RAIN SNOW WIND CLOUD SUNNY STORM FOG HAIL THUNDER RAINBOW"),
    ("At School", "PENCIL BOOK DESK CHAIR TEACHER CLASS LUNCH RULER PAPER CRAYON"),
    ("Pets", "DOG CAT FISH BIRD HAMSTER RABBIT TURTLE PUPPY KITTEN LEASH"),
    ("Jungle", "TIGER MONKEY SNAKE PARROT VINE FROG LEOPARD SLOTH TREE RIVER"),
    ("Bugs", "ANT BEE FLY MOTH WASP BEETLE SPIDER SNAIL WORM LADYBUG"),
    ("Birds", "OWL ROBIN EAGLE HAWK CROW DOVE SWAN PARROT PENGUIN WING"),
    ("Things That Go", "CAR BUS TRAIN PLANE BIKE BOAT TRUCK VAN SHIP SCOOTER"),
    ("Construction", "CRANE DIGGER DUMP TRUCK BRICK HAMMER DRILL CEMENT HELMET SHOVEL"),
    ("Kitchen", "SPOON FORK PLATE BOWL CUP PAN OVEN SINK KNIFE KETTLE"),
    ("Breakfast", "TOAST EGGS MILK JUICE CEREAL BACON PANCAKE WAFFLE OATS HONEY"),
    ("Desserts", "CAKE PIE COOKIE CANDY DONUT MUFFIN JELLY FUDGE CUPCAKE SUNDAE"),
    ("Sports", "SOCCER TENNIS GOLF SKATE SWIM RUN BALL GOAL TEAM MEDAL"),
    ("Music", "DRUM PIANO FLUTE GUITAR SONG BAND NOTE HARP VIOLIN TRUMPET"),
    ("Body Parts", "HEAD HAND FOOT KNEE NOSE EAR EYE MOUTH ARM ELBOW"),
    ("Clothes", "SHIRT SHOES HAT SOCKS COAT DRESS SCARF GLOVES BOOTS JACKET"),
    ("Family", "MOM DAD SISTER BROTHER BABY AUNT UNCLE COUSIN GRANDMA GRANDPA"),
    ("Feelings", "HAPPY SAD BRAVE CALM PROUD SILLY SCARED ANGRY SHY KIND"),
    ("The Beach", "SAND WAVE SUN TOWEL BUCKET SPADE SHELL SURF CASTLE SEAGULL"),
    ("Camping", "TENT FIRE LOG MAP HIKE LAKE FOREST LANTERN STARS CANOE"),
    ("Garden", "SEED SOIL ROSE TULIP DAISY WATER SHOVEL RAKE BLOOM SPROUT"),
    ("Trees", "OAK PINE MAPLE BIRCH LEAF ROOT BARK BRANCH ACORN WILLOW"),
    ("Winter", "SNOWMAN SLED ICE SKATES MITTENS COCOA FROST SCARF CHILLY IGLOO"),
    ("Summer", "HOT POOL SWIM PICNIC FAN BEACH ICE LEMONADE SHORTS VACATION"),
    ("Autumn", "LEAVES PUMPKIN ACORN HARVEST APPLE RAKE CORN SWEATER BREEZE HAY"),
    ("Spring", "BLOOM RAIN BUNNY CHICK NEST PUDDLE BUD GRASS KITE BUTTERFLY"),
    ("Birthday Party", "CAKE CANDLE GIFT BALLOON PARTY GAMES HAT FRIENDS CARD WISH"),
    ("Helpers", "DOCTOR NURSE CHEF PILOT FARMER BAKER VET POLICE FIREFIGHTER TEACHER"),
    ("Tools", "HAMMER SAW NAIL WRENCH DRILL SCREW TAPE LADDER PLIERS GLUE"),
    ("Arctic", "POLAR BEAR SEAL WALRUS ICE SNOW PENGUIN ORCA FOX HUSKY"),
    ("Desert", "SAND CACTUS CAMEL LIZARD DUNE HOT OASIS SNAKE SCORPION DRY"),
    ("Pirates", "SHIP MAP GOLD PARROT FLAG ISLAND CHEST ANCHOR TREASURE CAPTAIN"),
    ("Castle", "KING QUEEN KNIGHT TOWER CROWN DRAGON MOAT SHIELD PRINCE BRIDGE"),
    ("Fairy Tales", "WAND MAGIC FAIRY WISH ELF GIANT OGRE SPELL GNOME UNICORN"),
    ("Numbers", "ONE TWO THREE FOUR FIVE SIX SEVEN EIGHT NINE TEN"),
    ("Opposites", "BIG SMALL HOT COLD UP DOWN FAST SLOW OPEN CLOSED"),
    ("Toys", "BLOCKS DOLL YOYO TOP PUZZLE ROBOT TEDDY BALL KITE TRAIN"),
    ("Playground", "SLIDE SWING SANDBOX LADDER SEESAW TUNNEL BARS RUN JUMP CLIMB"),
    ("Bedtime", "PILLOW BLANKET DREAM MOON STORY LAMP PAJAMAS YAWN BED SLEEP"),
    ("Big Cats", "LION TIGER JAGUAR PUMA LYNX CHEETAH LEOPARD CUB MANE ROAR"),
    ("Rainforest", "TOUCAN SLOTH JAGUAR MONKEY FROG VINE RAIN CANOPY ORCHID PARROT"),
    ("Science", "MAGNET GERM ATOM LAB TEST FOSSIL PLANET ENERGY LIGHT SOUND"),
    ("Kindness", "SHARE HELP SMILE HUG THANKS PLEASE FRIEND CARE GIVE LOVE"),
]
# Random filler letters must never spell something unkind; re-roll if they do.
BLOCKED = {"ASS", "FUK", "FUC", "SEX", "DIE", "KIL", "GUN", "POO", "PEE", "BUM", "FAT", "UGLY", "HATE",
           "DUMB", "STUPID", "SHIT", "DAMN", "HELL", "CRAP", "NAZI"}


def place_words(words, size, dirs, rnd):
    for _ in range(500):
        grid = [[None] * size for _ in range(size)]
        placed = []
        ok = True
        for word in sorted(words, key=len, reverse=True):
            spots = []
            for dx, dy in dirs:
                for x in range(size):
                    for y in range(size):
                        ex, ey = x + dx * (len(word) - 1), y + dy * (len(word) - 1)
                        if not (0 <= ex < size and 0 <= ey < size):
                            continue
                        if all(grid[y + dy * i][x + dx * i] in (None, ch) for i, ch in enumerate(word)):
                            spots.append((x, y, dx, dy))
            if not spots:
                ok = False
                break
            x, y, dx, dy = rnd.choice(spots)
            for i, ch in enumerate(word):
                grid[y + dy * i][x + dx * i] = ch
            placed.append((word, x, y, dx, dy))
        if not ok:
            continue
        for y in range(size):
            for x in range(size):
                if grid[y][x] is None:
                    grid[y][x] = rnd.choice("ABCDEFGHIJKLMNOPRSTUVWY")
        if not has_blocked(grid, words):
            return grid, placed
    raise RuntimeError("could not build puzzle")


def has_blocked(grid, words):
    # Ignore blocked strings that are part of a real puzzle word (e.g. HELL inside SHELL).
    blocked = {b for b in BLOCKED if not any(b in w or b in w[::-1] for w in words)}
    n = len(grid)
    lines = ["".join(r) for r in grid] + ["".join(grid[y][x] for y in range(n)) for x in range(n)]
    lines += [l[::-1] for l in lines]
    return any(b in l for l in lines for b in blocked)


def kids_rule(i):
    if i < 25:
        return 12, [(1, 0), (0, 1)], "Easy: words go across and down"
    return 13, [(1, 0), (0, 1), (1, 1)], "Harder: across, down & diagonal"


def build_puzzles(themes, seed, rule=kids_rule):
    """rule(index) -> (grid size, directions, level caption)."""
    rnd = random.Random(seed)
    out = []
    for i, (theme, words) in enumerate(themes):
        words = words.split()
        assert len(words) == len(set(words)), theme
        size, dirs, level = rule(i)
        assert max(map(len, words)) <= size, theme
        grid, placed = place_words(words, size, dirs, rnd)
        out.append((theme, level, words, grid, placed))
    return out


def draw_grid(c, grid, x0, y_top, cell, font_size, placed=None, hi=None):
    n = len(grid)
    if placed:
        c.saveState()
        c.setStrokeColor(hi)
        c.setLineWidth(cell * 0.7)
        c.setLineCap(1)
        for word, x, y, dx, dy in placed:
            ax, ay = x0 + (x + 0.5) * cell, y_top - (y + 0.5) * cell
            bx = x0 + (x + dx * (len(word) - 1) + 0.5) * cell
            by = y_top - (y + dy * (len(word) - 1) + 0.5) * cell
            c.line(ax, ay, bx, by)
        c.restoreState()
    c.setFont("Mono", font_size)
    c.setFillColor(cm.INK)
    for y in range(n):
        for x in range(n):
            c.drawCentredString(x0 + (x + 0.5) * cell, y_top - (y + 0.5) * cell - font_size * 0.36, grid[y][x])


KIDS_STYLE = dict(grid_w=cm.TRIM_W - 2 * cm.MARGIN - 0.5 * inch, bank_font=17, bank_cols=3, bank_row=0.38 * inch,
                  title_size=32)


def puzzle_page(c, number, theme, level, words, grid, style=KIDS_STYLE):
    top = cm.TRIM_H - cm.MARGIN
    cm.centered(c, f"#{number}  {theme}", top - 30, size=style["title_size"], max_width=cm.TRIM_W - 2 * cm.MARGIN)
    cm.centered(c, level, top - 58, font="Regular", size=14)
    n = len(grid)
    cell = style["grid_w"] / n
    x0 = (cm.TRIM_W - n * cell) / 2
    y_top = top - 1.15 * inch
    c.setStrokeColor(cm.INK)
    c.setLineWidth(3)
    c.roundRect(x0 - 10, y_top - n * cell - 10, n * cell + 20, n * cell + 20, 14, stroke=1, fill=0)
    draw_grid(c, grid, x0, y_top, cell, cell * 0.62)
    # Word bank with tick boxes
    wy = y_top - n * cell - 0.5 * inch
    cols = style["bank_cols"]
    col_w = (cm.TRIM_W - 2 * cm.MARGIN) / cols
    fs = style["bank_font"]
    c.setFont("Bold", fs)
    for i, w in enumerate(words):
        cx = cm.MARGIN + (i % cols) * col_w + 0.25 * inch
        cy = wy - (i // cols) * style["bank_row"]
        c.setLineWidth(1.5)
        c.rect(cx, cy - 2, fs * 0.8, fs * 0.8, stroke=1, fill=0)
        c.drawString(cx + fs * 1.3, cy, w)
    c.showPage()


def solutions_pages(c, puzzles, heading="Answers", first_number=1):
    per_page = 6
    box_w = (cm.TRIM_W - 2 * cm.MARGIN) / 2
    box_h = (cm.TRIM_H - 2 * cm.MARGIN - 0.6 * inch) / 3
    pages = 0
    for start in range(0, len(puzzles), per_page):
        cm.centered(c, heading, cm.TRIM_H - cm.MARGIN - 20, size=24)
        for i, (theme, _, _, grid, placed) in enumerate(puzzles[start:start + per_page]):
            col, row = i % 2, i // 2
            bx = cm.MARGIN + col * box_w
            by_top = cm.TRIM_H - cm.MARGIN - 0.6 * inch - row * box_h
            n = len(grid)
            cell = min(box_w - 30, box_h - 36) / n
            x0 = bx + (box_w - n * cell) / 2
            c.setFont("Bold", 12)
            c.setFillColor(cm.INK)
            c.drawCentredString(bx + box_w / 2, by_top - 14, f"#{first_number + start + i}  {theme}")
            draw_grid(c, grid, x0, by_top - 24, cell, cell * 0.6, placed, HexColor("#cfcfcf"))
        c.showPage()
        pages += 1
    return pages


class WordSearchBook(cm.BookSpec):
    def __init__(self, themes, seed, how_to, rule=kids_rule, style=KIDS_STYLE, certificate=None, kids=True,
                 extra_copyright=(), **kw):
        super().__init__(**kw)
        self.themes, self.seed, self.how_to, self.rule, self.style = themes, seed, how_to, rule, style
        self.certificate, self.kids, self.extra_copyright = certificate, kids, extra_copyright

    def build_interior(self, path):
        puzzles = build_puzzles(self.themes, self.seed, self.rule)
        c = cm.new_interior(path, self.full_title)
        pages = cm.front_matter(c, self.title, self.subtitle, self.full_title, self.kids, self.extra_copyright)
        cm.frame(c)
        cm.centered(c, "How to Play", cm.TRIM_H - 2 * inch, size=40)
        for i, line in enumerate(self.how_to):
            cm.centered(c, line, cm.TRIM_H - 3.2 * inch - i * 44, font="Regular", size=19)
        c.showPage()
        pages += 1
        for n, (theme, level, words, grid, _) in enumerate(puzzles, 1):
            puzzle_page(c, n, theme, level, words, grid, self.style)
            pages += 1
        if self.certificate:
            cm.certificate_page(c, *self.certificate)
            pages += 1
        pages += solutions_pages(c, puzzles)
        pages = cm.pad_to_even(c, pages)
        c.save()
        return pages


def cover_art(c, x, y, w, h, accent, words=("FUN", "READ", "SPELL", "FIND", "WORDS", "PLAY"), seed=3):
    rnd = random.Random(seed)
    grid, placed = place_words(list(words), 8, [(1, 0), (0, 1), (1, 1)], rnd)
    size = min(w, h) * 0.9
    cell = size / 8
    x0, y_top = x + (w - size) / 2, y + (h + size) / 2
    c.setFillColor(white)
    c.setStrokeColor(cm.INK)
    c.setLineWidth(6)
    c.roundRect(x0 - 14, y_top - size - 14, size + 28, size + 28, 26, stroke=1, fill=1)
    draw_grid(c, grid, x0, y_top, cell, cell * 0.6, placed, accent)


BOOK = WordSearchBook(
    THEMES, seed=68, certificate=("is a Word Search Champion!", "for finding all the words in 50 puzzles"),
    how_to=["Find every word from the list in the grid.", "Circle it, then tick its box in the list.",
            "Puzzles 1-25: words go across or down.", "Puzzles 26-50: words can also go diagonally!",
            "Answers are at the back of the book."],
    title=["Word Search", "for Kids Ages 6-8"], subtitle="50 Large-Print Puzzles to Boost Spelling & Vocabulary",
    full_title="Word Search for Kids Ages 6-8: 50 Large-Print Puzzles to Boost Spelling & Vocabulary",
    sample_page=6,
    cover=dict(badge=["AGES", "6-8"],
               blurb=["50 themed puzzles with big, easy-to-read letters.",
                      "From farm animals to outer space, kids hunt for",
                      "words while building spelling, reading, and focus",
                      "skills. Perfect for home, school, and road trips!"],
               bullets=["50 fun themes, 500 words to find", "Large-print 12x12 & 13x13 grids",
                        "Easy first, then diagonal challenges", "Tick-box word lists",
                        "Full answer key", "Certificate of achievement"],
               bg="#8e24aa", accent="#ffd54f", title_fill="#ffd54f", art=cover_art, seed=31))
