"""Large-print books for seniors and people living with dementia.

- The Good Old Days word search (nostalgic themes, 14x14 large print)
- Large-print sudoku (one puzzle per page)
- Dementia activity book (gentle, dignified, no-fail activities)
- Easy coloring book for seniors (big simple pictures and simple mandalas)
"""
import random

from reportlab.lib.colors import HexColor, white
from reportlab.lib.units import inch

import common as cm
import drawings
import mandalas
import mazes
import wordsearch

SENIOR_COPYRIGHT = ("", "This book is for enjoyment and gentle mental activity. It is not",
                    "medical advice and is not intended to diagnose, treat, or prevent any condition.")

# ---- The Good Old Days word search ---------------------------------------------

GOOD_OLD_DAYS = [
    ("Soda Fountain", "MILKSHAKE MALT SUNDAE FLOAT STRAW COUNTER STOOL CHERRY JUKEBOX SODA COLA SPRINKLES BOOTH"),
    ("Drive-In Movies", "SCREEN SPEAKER POPCORN CARTOON INTERMISSION CAR BLANKET SNACKS DOUBLE FEATURE STARS NIGHT"),
    ("Grandma's Kitchen", "APRON ROLLING PIN FLOUR SIFTER PIE CRUST OVEN RECIPE COOKIE JAR KETTLE ICEBOX"),
    ("School Days", "CHALKBOARD SATCHEL RECESS SPELLING BEE READER INKWELL DESK TEACHER BELL LUNCHBOX GLOBE"),
    ("Dance Hall", "WALTZ SWING FOXTROT TWIST JITTERBUG BAND DRESS PARTNER RECORD SPIN RHYTHM DANCE"),
    ("Sunday Drive", "CONVERTIBLE ROADMAP PICNIC SCENIC COUNTRY GASOLINE HIGHWAY CHROME FINS WAVE BREEZE"),
    ("On the Farm", "TRACTOR BARN SILO HAYLOFT ROOSTER DAIRY PLOW HARVEST FENCE ORCHARD PASTURE WINDMILL"),
    ("Old Radio Days", "BROADCAST ANTENNA STATIC DIAL ANNOUNCER SERIAL COMEDY NEWS MUSIC PROGRAM TUBES LISTEN"),
    ("Corner Store", "CANDY PENNY COUNTER CLERK REGISTER SODA GUM COMICS BREAD MILK NEWSPAPER SCALE"),
    ("Wash Day", "WASHBOARD CLOTHESLINE PINS BASKET SOAP STARCH IRON WRINGER LINEN BLUING SUNSHINE TUB"),
    ("Sewing Basket", "NEEDLE THREAD THIMBLE BUTTON PATTERN FABRIC PINS SCISSORS HEM QUILT SPOOL LACE"),
    ("Summer Holidays", "BEACH CABIN LAKE CANOE CAMPFIRE SUNBURN LEMONADE FIREFLIES HAMMOCK FISHING POSTCARD"),
    ("Fashion Then", "POODLE SKIRT SADDLE SHOES BOBBY SOCKS FEDORA GLOVES PEARLS BEEHIVE BOWTIE CARDIGAN"),
    ("Family Kitchen Table", "SUPPER GRACE CASSEROLE GRAVY BISCUITS POT ROAST MEATLOAF JELLO NAPKIN PLATE PITCHER"),
    ("Games We Played", "MARBLES HOPSCOTCH JACKS CHECKERS DOMINOES KITES YOYO TAG JUMP ROPE CHARADES BINGO"),
    ("The Milkman", "BOTTLE CREAM PORCH DELIVERY TRUCK CRATE BUTTER DAWN ROUTE CAP GLASS EGGS"),
    ("Main Street", "BANK BARBER BAKERY CINEMA DINER HARDWARE LIBRARY POST OFFICE PHARMACY PARADE SHOPS"),
    ("Train Travel", "STATION TICKET CONDUCTOR WHISTLE STEAM CABOOSE PLATFORM SLEEPER DINING TRACKS BAGGAGE"),
    ("Holiday Traditions", "STOCKING CAROLS TURKEY WREATH GIFTS CARDS FEAST CANDLES TINSEL COOKIES SNOW FAMILY"),
    ("In the Garden", "ROSES TOMATOES HOE TROWEL SEEDS COMPOST TRELLIS BEES DAHLIA PEONY WATERING CAN"),
    ("Baking Day", "OVEN DOUGH YEAST BUTTER SUGAR EGGS MIXING BOWL WHISK LOAF PIE CRUMBS APRON"),
    ("Sweet Treats", "TAFFY LICORICE GUMDROPS FUDGE TOFFEE CARAMEL LOLLIPOP PEPPERMINT BONBONS BUTTERSCOTCH"),
    ("Country Fair", "FERRIS WHEEL RIBBON PIGLET PIE CONTEST COTTON CANDY RODEO QUILTS PRIZE CAROUSEL"),
    ("The Parlor", "PIANO LAMP DOILY ARMCHAIR MANTEL CLOCK RUG PORTRAIT VASE CURTAINS SETTEE RADIO"),
    ("Letters and Mail", "STAMP ENVELOPE POSTMAN MAILBOX TELEGRAM PENPAL POSTCARD INK SEAL ADDRESS NOTE REPLY"),
    ("Old Time Remedies", "HONEY LEMON TEA CHICKEN SOUP HOT WATER BOTTLE MUSTARD PLASTER REST BLANKET"),
    ("Birds in the Yard", "ROBIN CARDINAL BLUEJAY SPARROW WREN FINCH DOVE ORIOLE FEEDER NEST EGGS SONG"),
    ("Flower Shop", "ROSE CARNATION LILY DAISY ORCHID TULIP VIOLET BOUQUET CORSAGE VASE RIBBON BLOOM"),
    ("By the Seaside", "PIER BOARDWALK SEAGULL SANDCASTLE SHELLS TIDE LIGHTHOUSE FERRY ICE CREAM WAVES DUNES"),
    ("Wedding Day", "BRIDE GROOM VEIL BOUQUET RINGS CAKE CHAPEL VOWS TOAST DANCE CONFETTI RICE"),
    ("Around the House", "BROOM MOP DUSTER VACUUM KETTLE TOASTER PERCOLATOR IRON RADIATOR ATTIC CELLAR PORCH"),
    ("Big Band Music", "TRUMPET TROMBONE CLARINET SAXOPHONE DRUMS PIANO BASS SINGER BANDSTAND SWING TUNE"),
    ("Weekend Chores", "MOWING RAKING SWEEPING DUSTING POLISH GARDEN LAUNDRY SHOPPING WASHING PAINTING FIXING"),
    ("Autumn Days", "LEAVES ACORNS PUMPKINS CIDER SWEATER HAYRIDE HARVEST BONFIRE APPLES SQUASH FROST"),
    ("Winter Memories", "SLEDDING SNOWMAN MITTENS SKATING COCOA FIREPLACE SCARF BOOTS ICICLES BLIZZARD QUILT"),
    ("Spring Cleaning", "WINDOWS CURTAINS RUGS BEATER CLOSETS DRAWERS SHELVES PAINT FRESH AIR POLISH TIDY"),
    ("At the Barber", "CLIPPERS COMB RAZOR LATHER TOWEL POLE CHAIR MIRROR TONIC SHAVE TRIM WAIT"),
    ("Picnic in the Park", "BASKET BLANKET SANDWICH LEMONADE PIE ANTS BENCH POND DUCKS SHADE FRISBEE SUN"),
    ("Hobbies", "KNITTING STAMPS COINS PAINTING WOODWORK FISHING BIRDING PUZZLES GARDENING READING BAKING"),
    ("Pets We Loved", "PUPPY KITTEN CANARY GOLDFISH HAMSTER RABBIT PARAKEET TURTLE COLLAR LEASH BONE BOWL"),
    ("Sunday Best", "HAT GLOVES TIE SUIT DRESS SHOES POLISHED PURSE PEARLS BROOCH COAT CHURCH"),
    ("The Library", "BOOKS SHELVES LIBRARIAN CARD STAMP QUIET NOVEL POETRY ATLAS READING TABLE LAMP"),
    ("Tea Time", "TEAPOT CUPS SAUCERS SUGAR CREAM LEMON SCONES CAKE DOILY SPOON KETTLE BISCUITS"),
    ("Fishing Trip", "ROD REEL BAIT HOOK BOBBER LAKE BOAT TACKLE NET TROUT BASS PATIENCE"),
    ("Camping Out", "TENT LANTERN CAMPFIRE MARSHMALLOW SLEEPING BAG COMPASS HIKE STARS CANTEEN OWL"),
    ("Old Hollywood", "MOVIE STAR TICKET USHER BALCONY CURTAIN NEWSREEL CARTOON MATINEE ORGAN LOBBY"),
    ("Baseball Days", "PITCHER CATCHER BAT GLOVE BASES HOMERUN UMPIRE DUGOUT BLEACHERS INNING PEANUTS FAN"),
    ("Toolbox", "HAMMER NAILS SAW WRENCH PLIERS SCREWDRIVER LEVEL TAPE DRILL CLAMP SANDPAPER CHISEL"),
    ("Orchard", "APPLES PEARS PEACHES PLUMS CHERRIES LADDER BUSHEL BLOSSOM TREES PICKING PIE JAM"),
    ("Candy Store Jars", "JELLYBEANS GUMBALLS MINTS BRITTLE CHOCOLATE NOUGAT TRUFFLE MARZIPAN ROCK CANDY"),
    ("Grandpa's Workshop", "WORKBENCH VISE SAWDUST LUMBER HAMMER PLANE LATHE VARNISH SHELF TOOLS BIRDHOUSE"),
    ("Musical Instruments", "PIANO VIOLIN CELLO FLUTE HARP ORGAN BANJO GUITAR ACCORDION HARMONICA DRUM TUBA"),
    ("Kitchen Gadgets", "EGGBEATER CAN OPENER GRATER LADLE SPATULA COLANDER TIMER TONGS PEELER MASHER JAR"),
    ("Weather Watching", "SUNNY CLOUDY RAINBOW THUNDER DRIZZLE BREEZE FOG FROST HAIL STORM SNOWFALL WARM"),
    ("Neighborhood", "SIDEWALK PORCH SWING HEDGE FENCE MAILBOX STREETLAMP LAWN GARDEN NEIGHBOR BICYCLE"),
    ("Around the World", "PARIS ROME LONDON CAIRO TOKYO SYDNEY MADRID ATHENS DUBLIN VIENNA LISBON OSLO"),
    ("Precious Things", "LOCKET PHOTO ALBUM LETTERS QUILT MEDAL DIARY BIBLE RING WATCH TEACUP HEIRLOOM"),
    ("Colors of the Rainbow", "RED ORANGE YELLOW GREEN BLUE INDIGO VIOLET PINK SILVER GOLD IVORY CRIMSON"),
    ("Kindness", "SMILE HUG THANKS HELP SHARE CARE GENTLE PATIENCE FRIEND LOVE GIVE WELCOME"),
    ("Happy Memories", "FAMILY FRIENDS LAUGHTER HOLIDAY BIRTHDAY WEDDING BABY HOME GARDEN MUSIC DANCING"),
]

SENIOR_STYLE = dict(grid_w=6.3 * inch, bank_font=17, bank_cols=3, bank_row=0.34 * inch, title_size=30)


def senior_rule(i):
    if i < 30:
        return 14, [(1, 0), (0, 1), (1, 1)], "Words go across, down and diagonally"
    return 14, [(1, 0), (0, 1), (1, 1), (1, -1)], "Words go across, down and diagonally (up or down)"


WORD_SEARCH = wordsearch.WordSearchBook(
    GOOD_OLD_DAYS, seed=1955, rule=senior_rule, style=SENIOR_STYLE, kids=False,
    extra_copyright=SENIOR_COPYRIGHT,
    how_to=["Find each word from the list in the grid.", "Circle it, then tick its box in the list.",
            "Words never go backwards.", "Take your time and enjoy the memories!",
            "Answers are at the back of the book."],
    title=["The Good Old Days", "Word Search"], subtitle="60 Large Print Puzzles for Seniors",
    full_title=("The Good Old Days Large Print Word Search for Seniors: 60 Nostalgic Puzzles "
                "for Adults, Easy to Read"),
    sample_page=5,
    cover=dict(badge=["LARGE", "PRINT"],
               blurb=["Take a warm trip down memory lane!",
                      "60 nostalgic word search puzzles about soda",
                      "fountains, dance halls, grandma's kitchen,",
                      "and the simple joys of days gone by."],
               bullets=["60 nostalgic themes", "Extra-large print, one puzzle per page",
                        "No backwards words", "Tick-box word lists",
                        "Full answer key", "A thoughtful gift for parents & grandparents"],
               bg="#00695c", accent="#ffcc80", title_fill="#fff3e0", confetti=False,
               art=lambda *a: wordsearch.cover_art(*a, words=("MEMORY", "DANCE", "PIE", "RADIO", "TEA", "FARM"),
                                                   seed=9), seed=71))

# ---- Large-print sudoku --------------------------------------------------------


def _candidates(g, i):
    r, c = divmod(i, 9)
    used = set(g[r * 9:(r + 1) * 9]) | set(g[c::9])
    br, bc = r // 3 * 3, c // 3 * 3
    used |= {g[(br + y) * 9 + bc + x] for y in range(3) for x in range(3)}
    return [d for d in range(1, 10) if d not in used]


def _solve(g, rnd=None, limit=2):
    """Backtracking solver; returns number of solutions found (up to limit). Fills g with the first."""
    empties = [i for i, v in enumerate(g) if v == 0]
    if not empties:
        return 1
    i = min(empties, key=lambda k: len(_candidates(g, k)))
    cands = _candidates(g, i)
    if rnd:
        rnd.shuffle(cands)
    count = 0
    for d in cands:
        g[i] = d
        count += _solve(g, rnd, limit - count)
        if count >= limit:
            if rnd is None:
                g[i] = 0
            return count
        if rnd is not None and count:
            return count
    g[i] = 0
    return count


def make_sudoku(rnd, givens):
    full = [0] * 81
    _solve(full, rnd, 1)
    puzzle = full[:]
    order = list(range(81))
    rnd.shuffle(order)
    filled = 81
    for i in order:
        if filled <= givens:
            break
        keep = puzzle[i]
        puzzle[i] = 0
        if _solve(puzzle[:], None, 2) != 1:
            puzzle[i] = keep
        else:
            filled -= 1
    return puzzle, full


def draw_sudoku(c, puzzle, x0, y_top, cell, font, solution=None):
    c.setStrokeColor(cm.INK)
    for k in range(10):
        c.setLineWidth(3.5 if k % 3 == 0 else 1)
        c.line(x0 + k * cell, y_top, x0 + k * cell, y_top - 9 * cell)
        c.line(x0, y_top - k * cell, x0 + 9 * cell, y_top - k * cell)
    for i in range(81):
        r, col = divmod(i, 9)
        v = puzzle[i] or (solution[i] if solution else 0)
        if not v:
            continue
        c.setFont("Bold" if puzzle[i] else "Regular", font)
        c.setFillColor(cm.INK if puzzle[i] else HexColor("#8a8a8a"))
        c.drawCentredString(x0 + (col + 0.5) * cell, y_top - (r + 0.5) * cell - font * 0.36, str(v))


class SudokuBook(cm.BookSpec):
    def __init__(self, levels, seed, **kw):
        super().__init__(**kw)
        self.levels, self.seed = levels, seed

    def build_interior(self, path):
        rnd = random.Random(self.seed)
        puzzles = [(name,) + make_sudoku(rnd, givens) for name, givens, count in self.levels for _ in range(count)]
        c = cm.new_interior(path, self.full_title)
        pages = cm.front_matter(c, self.title, self.subtitle, self.full_title, kids=False, extra=SENIOR_COPYRIGHT)
        cm.frame(c)
        cm.centered(c, "How to Play Sudoku", cm.TRIM_H - 2 * inch, size=38)
        for i, line in enumerate(["Fill every empty square with a number 1 to 9.",
                                  "Each ROW must use 1 to 9 once.",
                                  "Each COLUMN must use 1 to 9 once.",
                                  "Each 3x3 BOX must use 1 to 9 once.",
                                  "Use a pencil so you can erase.",
                                  "Every puzzle has exactly one answer."]):
            cm.centered(c, line, cm.TRIM_H - 3.2 * inch - i * 46, font="Regular", size=21)
        c.showPage()
        pages += 1
        cell = 0.74 * inch
        for n, (level, puzzle, _) in enumerate(puzzles, 1):
            cm.centered(c, f"Puzzle {n}", cm.TRIM_H - cm.MARGIN - 36, size=36)
            cm.centered(c, level, cm.TRIM_H - cm.MARGIN - 66, font="Regular", size=18)
            x0 = (cm.TRIM_W - 9 * cell) / 2
            draw_sudoku(c, puzzle, x0, cm.TRIM_H - cm.MARGIN - 1.4 * inch, cell, 32)
            c.showPage()
            pages += 1
        per = 6
        small = 0.3 * inch
        for start in range(0, len(puzzles), per):
            cm.centered(c, "Answers", cm.TRIM_H - cm.MARGIN - 24, size=26)
            for k, (_, puzzle, full) in enumerate(puzzles[start:start + per]):
                col, row = k % 2, k // 2
                x0 = cm.MARGIN + 0.2 * inch + col * 3.6 * inch
                y_top = cm.TRIM_H - cm.MARGIN - 0.9 * inch - row * 3.1 * inch
                c.setFont("Bold", 13)
                c.setFillColor(cm.INK)
                c.drawString(x0, y_top + 6, f"Puzzle {start + k + 1}")
                draw_sudoku(c, puzzle, x0, y_top, small, 12, full)
            c.showPage()
            pages += 1
        pages = cm.pad_to_even(c, pages)
        c.save()
        return pages


def sudoku_cover_art(c, x, y, w, h, accent):
    rnd = random.Random(4)
    puzzle, full = make_sudoku(rnd, 40)
    size = min(w, h) * 0.9
    cell = size / 9
    x0, y_top = x + (w - size) / 2, y + (h + size) / 2
    c.setFillColor(white)
    c.setStrokeColor(cm.INK)
    c.setLineWidth(6)
    c.roundRect(x0 - 14, y_top - size - 14, size + 28, size + 28, 26, stroke=1, fill=1)
    c.setFillColor(accent)
    for i in (10, 20, 30, 40, 50, 60, 70):  # a few shaded squares for color
        r, col = divmod(i, 9)
        if not puzzle[i]:
            c.rect(x0 + col * cell, y_top - (r + 1) * cell, cell, cell, stroke=0, fill=1)
    draw_sudoku(c, puzzle, x0, y_top, cell, cell * 0.55)


SUDOKU = SudokuBook(
    levels=[("Easy", 38, 50), ("Medium", 32, 50)], seed=1981,
    title=["Large Print Sudoku", "for Seniors"], subtitle="100 Easy to Medium Puzzles, One Per Page",
    full_title=("Large Print Sudoku for Seniors: 100 Easy to Medium Puzzles with Solutions, "
                "One Puzzle Per Page"),
    sample_page=4,
    cover=dict(badge=["LARGE", "PRINT"],
               blurb=["Big, bold, and easy on the eyes.",
                      "100 sudoku puzzles printed one per page in",
                      "extra-large numbers, starting easy and moving",
                      "gently to medium. Perfect for daily brain exercise."],
               bullets=["100 puzzles: 50 easy, 50 medium", "One puzzle per page",
                        "Extra-large 32 pt numbers", "Every puzzle has one unique answer",
                        "Solutions at the back", "Great gift for puzzle lovers"],
               bg="#1565c0", accent="#ffe082", title_fill="#ffffff", confetti=False,
               art=sudoku_cover_art, seed=72))

# ---- Dementia activity book -----------------------------------------------------

SAYINGS = [
    ("An apple a day keeps the ___ away.", "doctor", "teacher", "baker"),
    ("The early bird catches the ___.", "worm", "train", "cold"),
    ("Don't cry over spilled ___.", "milk", "salt", "sugar"),
    ("Every cloud has a silver ___.", "lining", "spoon", "coin"),
    ("A penny saved is a penny ___.", "earned", "lost", "spent"),
    ("Actions speak louder than ___.", "words", "bells", "drums"),
    ("Better late than ___.", "never", "early", "sorry"),
    ("Birds of a feather flock ___.", "together", "south", "away"),
    ("Home is where the ___ is.", "heart", "garden", "kettle"),
    ("Two heads are better than ___.", "one", "none", "three"),
    ("Practice makes ___.", "perfect", "noise", "dinner"),
    ("Rome wasn't built in a ___.", "day", "week", "hurry"),
    ("Where there's a will, there's a ___.", "way", "gate", "road"),
    ("Look before you ___.", "leap", "sleep", "speak"),
    ("Don't count your chickens before they ___.", "hatch", "sing", "sleep"),
    ("The grass is always greener on the other ___.", "side", "hill", "farm"),
    ("Absence makes the heart grow ___.", "fonder", "colder", "older"),
    ("A picture is worth a thousand ___.", "words", "dollars", "smiles"),
    ("Laughter is the best ___.", "medicine", "music", "friend"),
    ("Honesty is the best ___.", "policy", "gift", "answer"),
    ("Slow and steady wins the ___.", "race", "prize", "game"),
    ("Beauty is in the eye of the ___.", "beholder", "storm", "needle"),
    ("Easy come, easy ___.", "go", "stay", "sleep"),
    ("Out of sight, out of ___.", "mind", "town", "reach"),
    ("Great minds think ___.", "alike", "slowly", "loudly"),
    ("Time flies when you're having ___.", "fun", "tea", "rain"),
    ("You can't judge a book by its ___.", "cover", "title", "price"),
    ("Too many cooks spoil the ___.", "broth", "party", "kitchen"),
    ("A watched pot never ___.", "boils", "breaks", "spills"),
    ("Make hay while the sun ___.", "shines", "sets", "sleeps"),
    ("Strike while the iron is ___.", "hot", "new", "heavy"),
    ("There's no place like ___.", "home", "Paris", "work"),
    ("Every dog has its ___.", "day", "bone", "bed"),
    ("Money doesn't grow on ___.", "trees", "farms", "shelves"),
    ("Still waters run ___.", "deep", "cold", "fast"),
    ("Many hands make light ___.", "work", "bread", "music"),
    ("Knowledge is ___.", "power", "money", "quiet"),
    ("All's well that ends ___.", "well", "early", "soon"),
    ("A friend in need is a friend ___.", "indeed", "tomorrow", "nearby"),
    ("Home sweet ___.", "home", "honey", "garden"),
]

PAIRS = [("Salt", "Pepper"), ("Bread", "Butter"), ("Cup", "Saucer"), ("Knife", "Fork"), ("Needle", "Thread"),
         ("Pen", "Paper"), ("Lock", "Key"), ("Shoes", "Socks"), ("Bacon", "Eggs"), ("Table", "Chair"),
         ("Thunder", "Lightning"), ("Bucket", "Spade"), ("Fish", "Chips"), ("Soap", "Water"), ("Day", "Night"),
         ("Sun", "Moon"), ("Hammer", "Nail"), ("Macaroni", "Cheese"), ("Milk", "Cookies"), ("Bride", "Groom"),
         ("King", "Queen"), ("Pots", "Pans"), ("Sweet", "Sour"), ("Bat", "Ball"), ("Hugs", "Kisses"),
         ("Horse", "Carriage"), ("Washer", "Dryer"), ("Hot", "Cold"), ("Up", "Down"), ("Black", "White"),
         ("Pencil", "Eraser"), ("Toothbrush", "Toothpaste"), ("Peanut Butter", "Jelly"), ("Rock", "Roll"),
         ("Hide", "Seek"), ("Cats", "Dogs"), ("Rise", "Shine"), ("Pins", "Needles"), ("Left", "Right"),
         ("Question", "Answer")]

ODD_ONE_OUT = [
    ("apple", "banana", "pear", "hammer"), ("dog", "cat", "horse", "chair"), ("red", "blue", "green", "spoon"),
    ("shirt", "sock", "hat", "carrot"), ("piano", "violin", "drum", "pillow"), ("rose", "tulip", "daisy", "bus"),
    ("car", "bus", "train", "lemon"), ("January", "March", "June", "Monday"), ("spoon", "fork", "knife", "sock"),
    ("robin", "sparrow", "eagle", "trout"), ("oak", "pine", "maple", "tiger"), ("milk", "juice", "tea", "bread"),
    ("circle", "square", "triangle", "window"), ("summer", "winter", "spring", "Tuesday"),
    ("nurse", "doctor", "teacher", "banana"), ("bed", "sofa", "chair", "cloud"), ("pen", "pencil", "crayon", "shoe"),
    ("salmon", "cod", "tuna", "goat"), ("snow", "rain", "hail", "table"), ("cake", "pie", "cookie", "broom"),
    ("ring", "necklace", "bracelet", "radish"), ("kitchen", "bedroom", "bathroom", "river"),
    ("ship", "boat", "canoe", "kettle"), ("one", "two", "three", "apple"), ("eye", "nose", "ear", "bucket"),
    ("waltz", "tango", "polka", "turnip"), ("lion", "tiger", "leopard", "teacup"), ("bread", "bagel", "muffin", "glove"),
    ("guitar", "trumpet", "flute", "potato"), ("Paris", "London", "Rome", "pillow"),
]

CATEGORIES = ["flowers", "fruits", "farm animals", "things in a kitchen", "colors", "things that are cold",
              "things at the beach", "vegetables", "things that fly", "musical instruments", "girls' names",
              "boys' names", "desserts", "jobs", "things you wear", "birds", "things in a garden", "sports",
              "countries", "breakfast foods"]

MEMORIES = ["What was the name of a pet you loved?", "Describe the house you grew up in.",
            "What was your favorite song when you were young?", "What games did you play as a child?",
            "What was your first job?", "Who was your best friend at school?",
            "What was a favorite meal your family made?", "Describe a happy holiday memory.",
            "Where did you go on a special trip?", "What was your favorite subject at school?",
            "What is a skill you are proud of?", "Describe a celebration you remember well.",
            "What did you do on weekends when you were young?", "What was a favorite film or show?",
            "Tell about someone who always made you laugh.", "What is your favorite season, and why?"]

EASY_WORDS = [
    ("Flowers", "ROSE LILY DAISY TULIP IRIS POPPY"), ("Fruit", "APPLE PEAR PLUM GRAPE LEMON PEACH"),
    ("Pets", "DOG CAT FISH BIRD RABBIT PUPPY"), ("Kitchen", "CUP PLATE SPOON FORK BOWL KETTLE"),
    ("Weather", "SUN RAIN SNOW WIND CLOUD FROST"), ("Colors", "RED BLUE GREEN PINK GOLD WHITE"),
    ("Garden", "SEED SOIL HOSE BEES LAWN SHED"), ("Breakfast", "TOAST EGGS TEA JAM OATS HONEY"),
    ("Clothes", "HAT COAT SCARF SHOES SOCKS DRESS"), ("Music", "SONG PIANO DRUM BAND NOTE HARP"),
    ("Seaside", "SAND SHELL WAVE BOAT PIER GULL"), ("Family", "MOTHER FATHER SISTER SON AUNT NIECE"),
]

MISSING = ["CAT", "DOG", "SUN", "HAT", "CUP", "BED", "HOME", "BOOK", "TREE", "ROSE", "BIRD", "FISH", "CAKE",
           "MILK", "RAIN", "SHOE", "DOOR", "LAMP", "SOAP", "BELL", "APPLE", "CHAIR", "BREAD", "HOUSE", "SMILE",
           "TABLE", "PIANO", "GRASS", "CLOUD", "HEART", "SPOON", "TOAST", "LEMON", "HONEY", "TRAIN", "WATCH",
           "GARDEN", "SUMMER", "FLOWER", "WINDOW"]

COLOR_OBJECTS = ["flower", "teacup", "house", "butterfly", "apple", "sun", "sailboat", "tulip", "fish", "tree"]
COUNT_OBJECTS = [("stars", "star"), ("hearts", "heart"), ("apples", "apple"), ("flowers", "flower"),
                 ("teacups", "teacup"), ("fish", "fish")]


def header(c, title, instruction):
    cm.centered(c, title, cm.TRIM_H - cm.MARGIN - 36, size=34, max_width=cm.TRIM_W - 2 * cm.MARGIN)
    cm.centered(c, instruction, cm.TRIM_H - cm.MARGIN - 70, font="Regular", size=19,
                max_width=cm.TRIM_W - 2 * cm.MARGIN)


def sayings_page(c, items, rnd):
    header(c, "Finish the Saying", "Circle the word that finishes each saying.")
    y = cm.TRIM_H - cm.MARGIN - 1.8 * inch
    for text, *choices in items:
        cm.centered(c, text, y, size=21, max_width=cm.TRIM_W - 2 * cm.MARGIN)
        opts = choices[:]
        rnd.shuffle(opts)
        for k, o in enumerate(opts):
            cm.centered(c, o, y - 36, font="Regular", size=21, x=cm.TRIM_W / 2 + (k - 1) * 2.2 * inch)
        y -= 1.65 * inch
    c.showPage()


def pairs_page(c, items, rnd):
    header(c, "Perfect Pairs", "Draw a line to join the words that go together.")
    right = [b for _, b in items]
    rnd.shuffle(right)
    y = cm.TRIM_H - cm.MARGIN - 2.1 * inch
    for (a, _), b in zip(items, right):
        for x, word in ((cm.MARGIN + 1.3 * inch, a), (cm.TRIM_W - cm.MARGIN - 1.3 * inch, b)):
            c.setFont("Bold", 26)
            c.setFillColor(cm.INK)
            c.drawCentredString(x, y, word)
        c.circle(cm.MARGIN + 2.9 * inch, y + 9, 6, stroke=0, fill=1)
        c.circle(cm.TRIM_W - cm.MARGIN - 2.9 * inch, y + 9, 6, stroke=0, fill=1)
        y -= 1.5 * inch
    c.showPage()


def odd_page(c, items, rnd):
    header(c, "Odd One Out", "Circle the word that does not belong.")
    y = cm.TRIM_H - cm.MARGIN - 1.9 * inch
    for group in items:
        words = list(group)
        rnd.shuffle(words)
        c.setFont("Bold", 22)
        c.setFillColor(cm.INK)
        for k, w in enumerate(words):
            c.drawCentredString(cm.MARGIN + (k + 0.5) * (cm.TRIM_W - 2 * cm.MARGIN) / 4, y, w)
        c.setStrokeColor(LIGHTLINE)
        c.setLineWidth(1)
        c.line(cm.MARGIN, y - 0.45 * inch, cm.TRIM_W - cm.MARGIN, y - 0.45 * inch)
        y -= 1.35 * inch
    c.showPage()


LIGHTLINE = HexColor("#bdbdbd")


def lines(c, y, count, gap=0.55 * inch):
    c.setStrokeColor(LIGHTLINE)
    c.setLineWidth(1.2)
    for k in range(count):
        c.line(cm.MARGIN + 0.3 * inch, y - k * gap, cm.TRIM_W - cm.MARGIN - 0.3 * inch, y - k * gap)


def category_page(c, cats):
    header(c, "Name Five", "Write five things for each list. There are no wrong answers!")
    y = cm.TRIM_H - cm.MARGIN - 1.8 * inch
    for cat in cats:
        cm.centered(c, f"Name 5 {cat}", y, size=24)
        lines(c, y - 0.6 * inch, 5)
        y -= 4.2 * inch
    c.showPage()


def memory_page(c, prompts):
    header(c, "Memory Lane", "Write, draw, or simply talk about your answer.")
    y = cm.TRIM_H - cm.MARGIN - 1.8 * inch
    for q in prompts:
        cm.centered(c, q, y, size=22, max_width=cm.TRIM_W - 2 * cm.MARGIN)
        lines(c, y - 0.6 * inch, 5)
        y -= 4.2 * inch
    c.showPage()


def math_page(c, rnd, n):
    header(c, "Simple Sums", "Write the answer in each box.")
    y = cm.TRIM_H - cm.MARGIN - 2.0 * inch
    probs = []
    for _ in range(8):
        if rnd.random() < 0.5 or n < 2:
            a, b = rnd.randint(1, 9 + n * 2), rnd.randint(1, 9)
            probs.append((f"{a} + {b} =", a + b))
        else:
            a = rnd.randint(5, 18)
            b = rnd.randint(1, a - 1)
            probs.append((f"{a} - {b} =", a - b))
    for k, (text, _) in enumerate(probs):
        col, row = k % 2, k // 2
        x = cm.MARGIN + 0.5 * inch + col * 3.6 * inch
        yy = y - row * 1.75 * inch
        c.setFont("Bold", 34)
        c.setFillColor(cm.INK)
        c.drawString(x, yy, text)
        c.setLineWidth(2)
        c.setStrokeColor(cm.INK)
        c.roundRect(x + 2.3 * inch, yy - 0.2 * inch, 0.95 * inch, 0.75 * inch, 8, stroke=1, fill=0)
    c.showPage()
    return [a for _, a in probs]


def count_page(c, rnd, label, name):
    n = rnd.randint(4, 9)
    header(c, f"How Many {label.title()}?", f"Count the {label}, then write the number in the box.")
    placed = []
    box = (cm.MARGIN + 0.4 * inch, cm.MARGIN + 1.8 * inch, cm.TRIM_W - cm.MARGIN - 0.4 * inch,
           cm.TRIM_H - cm.MARGIN - 1.6 * inch)
    s = 0.62 * inch
    while len(placed) < n:
        x, y = rnd.uniform(box[0] + s, box[2] - s), rnd.uniform(box[1] + s, box[3] - s)
        if all((x - px) ** 2 + (y - py) ** 2 > (2.4 * s) ** 2 for px, py in placed):
            placed.append((x, y))
    for x, y in placed:
        drawings.DRAW[name](c, x, y, s, 3)
    c.setFont("Bold", 26)
    c.setFillColor(cm.INK)
    c.drawString(cm.TRIM_W / 2 - 2 * inch, cm.MARGIN + 0.55 * inch, "I counted:")
    c.setLineWidth(2)
    c.setStrokeColor(cm.INK)
    c.roundRect(cm.TRIM_W / 2 + 0.3 * inch, cm.MARGIN + 0.3 * inch, 1.2 * inch, 0.9 * inch, 8, stroke=1, fill=0)
    c.showPage()
    return n


def missing_page(c, words, rnd):
    header(c, "Missing Letter", "Fill in the missing letter to finish each word.")
    y = cm.TRIM_H - cm.MARGIN - 2.0 * inch
    answers = []
    for k, w in enumerate(words):
        i = rnd.randint(1, len(w) - 1) if len(w) > 3 else 1
        shown = " ".join("_" if j == i else ch for j, ch in enumerate(w))
        col, row = k % 2, k // 2
        c.setFont("Mono", 38)
        c.setFillColor(cm.INK)
        c.drawCentredString(cm.TRIM_W / 2 + (col - 0.5) * 3.6 * inch, y - row * 1.8 * inch, shown)
        answers.append(w)
    c.showPage()
    return answers


def color_page(c, name):
    header(c, "Color Me", "Use any colors you like.")
    drawings.DRAW[name](c, cm.TRIM_W / 2, cm.TRIM_H / 2 - 0.4 * inch, 2.9 * inch, 5)
    c.showPage()


def text_answers(c, title, rows):
    """Simple answer list pages; returns pages used."""
    pages = 0
    per = 30
    for start in range(0, len(rows), per):
        cm.centered(c, title, cm.TRIM_H - cm.MARGIN - 28, size=26)
        y = cm.TRIM_H - cm.MARGIN - 1.0 * inch
        for k, row in enumerate(rows[start:start + per]):
            col = k // 15
            c.setFont("Regular", 13)
            c.setFillColor(cm.INK)
            c.drawString(cm.MARGIN + col * 3.7 * inch, y - (k % 15) * 0.5 * inch, row)
        c.showPage()
        pages += 1
    return pages


class DementiaBook(cm.BookSpec):
    def build_interior(self, path):
        rnd = random.Random(1944)
        c = cm.new_interior(path, self.full_title)
        pages = cm.front_matter(c, self.title, self.subtitle, self.full_title, kids=False, extra=SENIOR_COPYRIGHT)
        cm.frame(c)
        cm.centered(c, "A Note for Caregivers", cm.TRIM_H - 1.9 * inch, size=32)
        for i, line in enumerate([
            "These activities are made to be enjoyed, not tested.",
            "There is no rush and no wrong way to use this book.",
            "Pick any page. Skip any page. Come back any time.",
            "Try doing a page together and talking as you go.",
            "The Memory Lane and Name Five pages are great",
            "conversation starters with family and friends.",
            "Answers are at the back if you want them.",
        ]):
            cm.centered(c, line, cm.TRIM_H - 3.0 * inch - i * 42, font="Regular", size=18)
        c.showPage()
        pages += 1
        ws = wordsearch.build_puzzles(EASY_WORDS, 77, lambda i: (9, [(1, 0)] if i < 6 else [(1, 0), (0, 1)],
                                                                 "Words go across" if i < 6 else "Words go across and down"))
        maze_list = mazes.build_mazes([("A gentle path", 5, 6, 4), ("A little longer", 6, 7, 4)], 88)
        queues = {
            "say": [SAYINGS[i:i + 5] for i in range(0, len(SAYINGS), 5)],
            "pair": [PAIRS[i:i + 5] for i in range(0, len(PAIRS), 5)],
            "odd": [ODD_ONE_OUT[i:i + 6] for i in range(0, len(ODD_ONE_OUT), 6)],
            "cat": [CATEGORIES[i:i + 2] for i in range(0, len(CATEGORIES), 2)],
            "mem": [MEMORIES[i:i + 2] for i in range(0, len(MEMORIES), 2)],
            "ws": list(enumerate(ws, 1)), "maze": list(enumerate(maze_list, 1)), "math": list(range(6)),
            "count": list(COUNT_OBJECTS), "miss": [MISSING[i:i + 8] for i in range(0, len(MISSING), 8)],
            "color": list(COLOR_OBJECTS)}
        pattern = ["ws", "say", "color", "pair", "mem", "maze", "odd", "count", "cat", "math", "miss", "color", "ws"]
        ans = {"say": [], "odd": [], "math": [], "count": [], "miss": [], "pair": []}
        n_say = n_odd = n_math = n_count = n_miss = n_pair = 0
        while any(queues.values()):
            for kind in pattern:
                if not queues[kind]:
                    continue
                item = queues[kind].pop(0)
                pages += 1
                if kind == "ws":
                    n, (theme, level, words, grid, _) = item
                    wordsearch.puzzle_page(c, n, theme, level, words, grid,
                                           dict(grid_w=6.2 * inch, bank_font=26, bank_cols=3, bank_row=0.5 * inch,
                                                title_size=34))
                elif kind == "say":
                    n_say += 1
                    sayings_page(c, item, rnd)
                    ans["say"] += [f"{t.replace('___', a.upper())}" for t, a, *_ in item]
                elif kind == "pair":
                    pairs_page(c, item, rnd)
                    ans["pair"] += [f"{a} & {b}" for a, b in item]
                elif kind == "odd":
                    odd_page(c, item, rnd)
                    ans["odd"] += [f"{', '.join(g[:3])}:  {g[3].upper()}" for g in item]
                elif kind == "cat":
                    category_page(c, item)
                elif kind == "mem":
                    memory_page(c, item)
                elif kind == "maze":
                    n, (level, cells, _) = item
                    mazes.maze_page(c, f"Maze {n}", level, cells)
                elif kind == "math":
                    ans["math"].append(f"Sums page {len(ans['math']) + 1}:  " + ", ".join(map(str, math_page(c, rnd, item))))
                elif kind == "count":
                    label, name = item
                    ans["count"].append(f"How many {label}?  {count_page(c, rnd, label, name)}")
                elif kind == "miss":
                    ans["miss"].append("  ".join(missing_page(c, item, rnd)))
                else:
                    color_page(c, item)
        rows = (["FINISH THE SAYING"] + ans["say"] + ["", "ODD ONE OUT"] + ans["odd"] + ["", "PERFECT PAIRS"]
                + ans["pair"] + ["", "SIMPLE SUMS"] + ans["math"] + ["", "COUNTING"] + ans["count"]
                + ["", "MISSING LETTER"] + ans["miss"])
        pages += text_answers(c, "Answers", rows)
        pages += wordsearch.solutions_pages(c, ws, "Word Search Answers")
        pages += mazes.solutions_pages(c, maze_list, "Maze Answers")
        pages = cm.pad_to_even(c, pages)
        c.save()
        return pages


def dementia_cover_art(c, x, y, w, h, accent):
    drawings.colored(True)
    c.setFillColor(white)
    c.setStrokeColor(cm.INK)
    c.setLineWidth(6)
    c.roundRect(x, y, w, h, 30, stroke=1, fill=1)
    s = min(w, h) * 0.2
    drawings.teacup(c, x + w * 0.28, y + h * 0.7, s, 4)
    drawings.flower(c, x + w * 0.72, y + h * 0.7, s, 4)
    c.setFillColor(cm.INK)
    c.setFont("Bold", cm.fit_font_size("3 + 4 = 7", "Bold", s * 0.5, w * 0.4))
    c.drawCentredString(x + w * 0.5, y + h * 0.36, "3 + 4 = 7")
    c.setFont("Mono", cm.fit_font_size("R O _ E", "Mono", s * 0.55, w * 0.4))
    c.drawCentredString(x + w * 0.5, y + h * 0.13, "R O _ E")
    drawings.colored(False)


DEMENTIA = DementiaBook(
    title=["Dementia Activity Book", "for Seniors"], subtitle="Easy Large Print Puzzles, Games & Memories",
    full_title=("Dementia Activity Book for Seniors: Easy Large Print Puzzles, Memory Games, Word Searches "
                "and Coloring for Adults with Alzheimer's"),
    sample_page=5,
    cover=dict(badge=["LARGE", "PRINT"],
               blurb=["Gentle, enjoyable activities designed to feel",
                      "achievable, never frustrating. Big print, one",
                      "activity per page, and plenty of variety for",
                      "quiet time alone or shared with a caregiver."],
               bullets=["Easy word searches & mazes", "Finish the saying & perfect pairs",
                        "Odd one out, counting & simple sums", "Memory Lane conversation starters",
                        "Simple coloring pages", "Answers & a caregiver's guide"],
               bg="#5e35b1", accent="#ffab91", title_fill="#ffffff", confetti=False,
               art=dementia_cover_art, seed=73))

# ---- Easy coloring book for seniors --------------------------------------------

SENIOR_PICTURES = ["flower", "teacup", "house", "butterfly", "apple", "sun", "sailboat", "tulip", "fish", "tree",
                   "cupcake", "mushroom", "balloon", "heart", "star", "owl", "cat", "bell", "gift", "snowman",
                   "pumpkin", "christmas_tree", "ornament", "holly", "mitten"]


class SeniorColoringBook(cm.BookSpec):
    def build_interior(self, path):
        rnd = random.Random(2024)
        c = cm.new_interior(path, self.full_title)
        pages = cm.front_matter(c, self.title, self.subtitle, self.full_title, kids=False, extra=SENIOR_COPYRIGHT)
        R = (cm.TRIM_W - 2 * cm.MARGIN) / 2 - 0.2 * inch
        items = []
        for k, name in enumerate(SENIOR_PICTURES):
            items.append(("pic", name))
            items.append(("mandala", k))
        for kind, item in items:
            if kind == "pic":
                drawings.DRAW[item](c, cm.TRIM_W / 2, cm.TRIM_H / 2 + 0.3 * inch, 3.5 * inch, 5.5)
                label = item.replace("_", " ").title()
            else:
                mandalas.draw_mandala(c, cm.TRIM_W / 2, cm.TRIM_H / 2 + 0.3 * inch, R, rnd, line_w=4.5, simple=True)
                label = "Pattern"
            c.setFont("Regular", 16)
            c.setFillColor(cm.INK)
            c.drawCentredString(cm.TRIM_W / 2, cm.MARGIN + 0.1 * inch, label)
            c.showPage()
            c.showPage()  # single-sided pages
            pages += 2
        pages = cm.pad_to_even(c, pages)
        c.save()
        return pages


def senior_color_art(c, x, y, w, h, accent):
    drawings.colored(True)
    c.setFillColor(white)
    c.setStrokeColor(cm.INK)
    c.setLineWidth(6)
    c.roundRect(x, y, w, h, 30, stroke=1, fill=1)
    s = min(w, h) * 0.2
    drawings.flower(c, x + w * 0.25, y + h * 0.3, s, 4)
    drawings.teacup(c, x + w * 0.72, y + h * 0.28, s, 4)
    drawings.butterfly(c, x + w * 0.3, y + h * 0.75, s * 0.9, 4)
    drawings.sun(c, x + w * 0.73, y + h * 0.74, s * 0.9, 4)
    drawings.colored(False)


SENIOR_COLORING = SeniorColoringBook(
    title=["Easy Coloring Book", "for Seniors"], subtitle="50 Simple, Bold Designs in Large Print",
    full_title=("Easy Coloring Book for Seniors: 50 Simple, Bold Large Print Designs for Adults "
                "with Dementia, Beginners and Relaxation"),
    sample_page=2,
    cover=dict(badge=["BIG &", "BOLD"],
               blurb=["Relaxing coloring with no fiddly details.",
                      "50 simple pictures and patterns with thick",
                      "outlines and big spaces, easy to see and",
                      "easy to color. Printed on one side only."],
               bullets=["25 everyday pictures", "25 simple patterns", "Extra-thick lines, big spaces",
                        "Single-sided pages", "Large 8.5 x 11 in format", "Calming and confidence-building"],
               bg="#ef6c00", accent="#4db6ac", title_fill="#ffffff", confetti=False,
               art=senior_color_art, seed=74))
