"""30 original, kid-friendly recipes. Steps starting with "!" need a grown-up's help."""

R = []


def recipe(name, cat, time, serves, level, ingredients, tools, steps, tip):
    R.append(dict(name=name, cat=cat, time=time, serves=serves, level=level, ingredients=ingredients,
                  tools=tools, steps=steps, tip=tip))


# ---- Breakfast ------------------------------------------------------------------
recipe("Fluffy Banana Pancakes", "Breakfast", "25 min", "Makes 8", 2,
       ["1 cup all-purpose flour", "1 tablespoon sugar", "2 teaspoons baking powder", "1/4 teaspoon salt",
        "1 ripe banana", "1 egg", "3/4 cup milk", "1 tablespoon melted butter", "Butter or oil for the pan"],
       ["2 mixing bowls", "Fork", "Whisk", "Measuring cups & spoons", "Frying pan", "Spatula"],
       ["Mix the flour, sugar, baking powder, and salt in a big bowl.",
        "In the other bowl, mash the banana with a fork until it is mushy.",
        "Add the egg, milk, and melted butter to the banana and whisk well.",
        "Pour the wet mix into the dry mix. Stir gently until just mixed. Lumps are OK!",
        "!Heat the pan over medium heat and add a little butter or oil.",
        "!Pour in 1/4 cup of batter for each pancake.",
        "!When bubbles pop on top (about 2 minutes), flip and cook 1 to 2 minutes more.",
        "Serve with berries and a drizzle of maple syrup."],
       "Don't over-stir the batter. A few lumps make the fluffiest pancakes!")

recipe("Yogurt Parfait Cups", "Breakfast", "10 min", "Serves 2", 1,
       ["1 cup vanilla yogurt", "1 cup mixed berries", "1/2 cup granola", "1 tablespoon honey"],
       ["2 clear cups or jars", "Spoon", "Colander"],
       ["Wash the berries in a colander and let them drain.",
        "Spoon a layer of yogurt into the bottom of each cup.",
        "Add a layer of berries, then a layer of granola.",
        "Repeat the layers until the cups are full.",
        "Drizzle a little honey on top and eat right away so the granola stays crunchy."],
       "Honey is not safe for babies under 1 year old. Use maple syrup for little siblings.")

recipe("Egg in a Hole", "Breakfast", "15 min", "Serves 1", 2,
       ["1 slice of bread", "1 teaspoon soft butter", "1 egg", "A pinch of salt and pepper"],
       ["Round cookie cutter or small cup", "Butter knife", "Frying pan", "Spatula"],
       ["Press the cookie cutter into the middle of the bread to cut out a circle.",
        "Spread butter on both sides of the bread and the circle.",
        "!Heat the pan over medium heat. Put the bread and the circle in the pan.",
        "!Crack the egg into the hole. Cook for 2 to 3 minutes.",
        "!Flip it over carefully and cook 1 to 2 minutes more until the egg is cooked through.",
        "Sprinkle with salt and pepper. Dip the toasty circle in the yolk!"],
       "Crack the egg into a small cup first, so it's easy to pour and any shell is easy to fish out.")

recipe("Overnight Oats", "Breakfast", "5 min + overnight", "Serves 1", 1,
       ["1/2 cup rolled oats", "1/2 cup milk", "1/4 cup yogurt", "1 teaspoon maple syrup",
        "1/4 cup fruit (berries or sliced banana)"],
       ["Jar with a lid", "Measuring cups & spoons", "Spoon"],
       ["Put the oats, milk, yogurt, and maple syrup in the jar.",
        "Stir everything together really well.",
        "Put the lid on and place the jar in the fridge overnight (at least 6 hours).",
        "In the morning, give it a stir and add your fruit on top."],
       "Make a jar for every day of the week. They keep in the fridge for up to 3 days.")

recipe("Mini Muffin-Tin Frittatas", "Breakfast", "30 min", "Makes 12", 2,
       ["6 eggs", "1/4 cup milk", "1/2 cup shredded cheese", "1/2 cup chopped veggies (peppers, spinach)",
        "A pinch of salt and pepper", "Cooking spray"],
       ["Mini muffin tin", "Mixing bowl", "Whisk", "Measuring cup with a spout", "Oven mitts"],
       ["!Preheat the oven to 350°F (175°C).",
        "Spray the muffin tin with cooking spray.",
        "Whisk the eggs, milk, salt, and pepper in a bowl.",
        "Put a little cheese and a few veggies in each muffin cup.",
        "Pour the egg mix into each cup until it is 3/4 full.",
        "!Bake for 15 to 18 minutes, until the middles are set.",
        "Let them cool for 5 minutes before popping them out."],
       "Try ham, mushrooms, or tomatoes. What's your favorite combo?")

recipe("Very Berry Smoothie", "Breakfast", "5 min", "Serves 2", 1,
       ["1 banana", "1 cup frozen strawberries", "1 cup milk", "1/2 cup yogurt"],
       ["Blender", "Measuring cups", "2 glasses"],
       ["Peel the banana and break it into pieces.",
        "Put the banana, strawberries, milk, and yogurt in the blender.",
        "!Put the lid on tightly and blend until smooth.",
        "Pour into glasses and enjoy!"],
       "Add a handful of spinach. It turns green, but you won't taste it!")

# ---- Lunch ----------------------------------------------------------------------
recipe("Rainbow Veggie Wraps", "Lunch", "15 min", "Serves 2", 1,
       ["2 large tortillas", "4 tablespoons hummus or cream cheese", "1 shredded carrot",
        "1/2 cucumber, cut into sticks", "1/2 red pepper, cut into strips", "2 lettuce leaves", "2 slices of cheese"],
       ["Butter knife", "Cutting board", "Plate"],
       ["Lay a tortilla flat on the cutting board.",
        "Spread 2 tablespoons of hummus all over it.",
        "Lay the lettuce, cheese, and veggies in rows to make a rainbow.",
        "Roll the tortilla up tightly from one side.",
        "!Cut the wrap in half and show off your rainbow!"],
       "Wrap it in foil or wax paper to keep it together in a lunchbox.")

recipe("Mini Pita Pizzas", "Lunch", "20 min", "Serves 4", 1,
       ["4 small pita breads", "1/2 cup pizza or tomato sauce", "1 cup shredded mozzarella",
        "Toppings: pepperoni, peppers, olives, mushrooms"],
       ["Baking tray", "Spoon", "Oven mitts"],
       ["!Preheat the oven to 400°F (200°C).",
        "Put the pitas on the baking tray.",
        "Spread 2 tablespoons of sauce on each pita.",
        "Sprinkle on the cheese and add your toppings.",
        "!Bake for 8 to 10 minutes, until the cheese is melted and bubbly.",
        "Let them cool for 2 minutes. The cheese is very hot!"],
       "Make a face on your pizza with the toppings!")

recipe("Golden Grilled Cheese", "Lunch", "15 min", "Serves 1", 2,
       ["2 slices of bread", "1 tablespoon soft butter", "2 slices of cheese"],
       ["Butter knife", "Frying pan", "Spatula"],
       ["Spread butter on one side of each slice of bread.",
        "Put one slice butter-side down on a plate. Add the cheese and the other slice, butter-side up.",
        "!Heat the pan over medium-low heat.",
        "!Cook the sandwich 3 to 4 minutes, until golden underneath.",
        "!Flip it carefully and cook 3 minutes more, until the cheese melts.",
        "Cut it into triangles or squares."],
       "Low heat is the secret. It gives the cheese time to melt before the bread burns.")

recipe("Build-a-Snack-Box Lunch", "Lunch", "10 min", "Serves 1", 1,
       ["Crackers", "Cheese cubes", "Grapes (cut in half for little kids)", "Cucumber slices",
        "2 tablespoons hummus", "Apple slices"],
       ["Lunchbox with sections", "Butter knife", "Cutting board"],
       ["Wash the fruit and veggies.",
        "!Cut the grapes in half and slice the cucumber and apple.",
        "Put each food in its own section of the box.",
        "Try to fit in as many colors as you can!"],
       "A squeeze of lemon juice keeps apple slices from turning brown.")

recipe("Cheesy Chicken Quesadillas", "Lunch", "20 min", "Serves 2", 2,
       ["2 large tortillas", "1 cup cooked shredded chicken", "1 cup shredded cheese", "2 tablespoons salsa"],
       ["Frying pan", "Spatula", "Pizza cutter"],
       ["Sprinkle half the cheese over one half of each tortilla.",
        "Add the chicken and a little salsa, then the rest of the cheese.",
        "Fold each tortilla in half.",
        "!Cook in a dry pan over medium heat for 2 to 3 minutes per side, until the cheese melts.",
        "!Cut into wedges and serve with more salsa."],
       "Leftover chicken from dinner works perfectly here.")

recipe("Picnic Pasta Salad", "Lunch", "25 min", "Serves 4", 2,
       ["2 cups small pasta shapes", "1 cup cherry tomatoes, cut in half", "1/2 cucumber, diced",
        "1/2 cup cheese cubes", "1/4 cup Italian dressing"],
       ["Large pot", "Colander", "Big bowl", "Spoon"],
       ["!Cook the pasta in boiling water following the package directions.",
        "!Drain the pasta in a colander and rinse it with cold water.",
        "Put the cool pasta in the big bowl.",
        "Add the tomatoes, cucumber, and cheese.",
        "Pour on the dressing and stir well.",
        "Chill in the fridge for 15 minutes before eating."],
       "Pasta salad tastes even better the next day!")

# ---- Snacks ---------------------------------------------------------------------
recipe("Ants on a Log", "Snacks", "10 min", "Serves 4", 1,
       ["4 celery sticks", "1/4 cup peanut butter (or sunflower seed butter)", "2 tablespoons raisins"],
       ["Butter knife", "Cutting board"],
       ["Wash the celery and dry it.",
        "!Cut each stick into 2 or 3 shorter pieces.",
        "Spread nut or seed butter in the groove of each piece.",
        "Line up raisins on top like little ants marching along a log!"],
       "Try cream cheese and dried cranberries for 'ladybugs on a log'.")

recipe("Apple Ring Sandwiches", "Snacks", "10 min", "Serves 2", 1,
       ["1 apple", "2 tablespoons peanut butter (or seed butter)", "1 tablespoon granola",
        "1 tablespoon mini chocolate chips (optional)"],
       ["Apple corer", "Sharp knife (for a grown-up)", "Butter knife"],
       ["!Core the apple and slice it into rings about as thick as a pencil.",
        "Spread nut or seed butter on half of the rings.",
        "Sprinkle on the granola and chocolate chips.",
        "Top with the other rings to make little sandwiches."],
       "Use a crunchy, sweet apple like Honeycrisp or Gala.")

recipe("Paper Bag Popcorn", "Snacks", "10 min", "Serves 2", 2,
       ["1/4 cup popcorn kernels", "1 brown paper lunch bag", "1 teaspoon melted butter", "A pinch of salt"],
       ["Microwave", "Big bowl"],
       ["Pour the kernels into the paper bag.",
        "Fold the top of the bag over twice to close it.",
        "!Microwave for 2 to 3 minutes. Stop when the pops slow to 2 seconds apart.",
        "!Open the bag carefully, away from your face. The steam is hot!",
        "Pour into a bowl, drizzle with butter, and sprinkle with salt."],
       "Popcorn is a choking hazard for children under 4. Keep this snack for big kids!")

recipe("Fruit Kebabs with Yogurt Dip", "Snacks", "15 min", "Serves 4", 1,
       ["8 strawberries", "1 cup grapes", "1 cup melon cubes", "1 cup pineapple chunks",
        "1 cup vanilla yogurt", "1 teaspoon honey"],
       ["Wooden skewers", "Small bowl", "Spoon"],
       ["Wash all the fruit and pat it dry.",
        "!Snip the sharp tips off the skewers.",
        "Slide the fruit onto the skewers in a pattern.",
        "Stir the honey into the yogurt to make the dip.",
        "Dip and enjoy!"],
       "Can you make a rainbow kebab? Red, orange, yellow, green...")

recipe("Crunchy Roasted Chickpeas", "Snacks", "40 min", "Serves 4", 2,
       ["1 can chickpeas (15 oz), drained and rinsed", "1 tablespoon olive oil", "1/2 teaspoon salt",
        "1/2 teaspoon paprika"],
       ["Baking tray", "Paper towels", "Bowl", "Oven mitts"],
       ["!Preheat the oven to 400°F (200°C).",
        "Pat the chickpeas dry with paper towels.",
        "Toss them in the bowl with the oil, salt, and paprika.",
        "Spread them out on the baking tray.",
        "!Roast for 25 to 30 minutes, shaking the tray halfway.",
        "Let them cool. They get crunchier as they cool!"],
       "Try cinnamon and a little sugar instead for a sweet version.")

recipe("No-Bake Energy Bites", "Snacks", "15 min + chill", "Makes 12", 1,
       ["1 cup rolled oats", "1/2 cup peanut butter (or seed butter)", "1/3 cup honey",
        "1/2 cup mini chocolate chips", "1 teaspoon vanilla"],
       ["Mixing bowl", "Spoon", "Plate"],
       ["Put everything in the bowl and stir until well mixed.",
        "Chill the mix in the fridge for 20 minutes so it's easier to roll.",
        "Roll into balls about the size of a ping-pong ball.",
        "Keep them in the fridge for up to a week."],
       "Wet your hands a little so the mix doesn't stick.")

# ---- Dinner ---------------------------------------------------------------------
recipe("Baked Mini Meatballs", "Dinner", "40 min", "Serves 4", 3,
       ["1 lb ground beef or turkey", "1 egg", "1/2 cup breadcrumbs", "1/4 cup grated Parmesan",
        "1/2 teaspoon garlic powder", "1/2 teaspoon salt"],
       ["Baking tray", "Parchment paper", "Big bowl", "Oven mitts"],
       ["!Preheat the oven to 400°F (200°C) and line the tray with parchment.",
        "Put everything in the bowl and mix with clean hands.",
        "Roll into balls about 1 inch wide and place them on the tray.",
        "Wash your hands well with soap after touching raw meat.",
        "!Bake for 15 to 18 minutes, until cooked through (165°F inside).",
        "Serve with pasta and sauce, or in a sub roll."],
       "Use a small cookie scoop to make every meatball the same size.")

recipe("Taco Night", "Dinner", "30 min", "Serves 4", 2,
       ["1 lb ground beef or turkey", "1 teaspoon chili powder", "1/2 teaspoon cumin", "1/4 teaspoon garlic powder",
        "1/2 teaspoon salt", "1/3 cup water", "8 taco shells", "Toppings: lettuce, tomato, cheese, salsa"],
       ["Frying pan", "Wooden spoon", "Small bowls for toppings"],
       ["!Cook the meat in the pan over medium heat until no pink is left. Drain the fat.",
        "!Stir in the spices and water. Simmer for 5 minutes.",
        "While it cooks, wash and chop the toppings and put them in bowls.",
        "!Warm the taco shells following the package directions.",
        "Build your own taco with your favorite toppings!"],
       "Set up a taco bar so everyone can build their own.")

recipe("Buttery Noodles with Peas", "Dinner", "20 min", "Serves 4", 2,
       ["8 oz pasta", "1 cup frozen peas", "2 tablespoons butter", "1/3 cup grated Parmesan", "A pinch of salt"],
       ["Large pot", "Colander", "Wooden spoon"],
       ["!Cook the pasta in boiling water following the package directions.",
        "!Add the peas for the last 2 minutes of cooking.",
        "!Drain the pasta and peas in a colander.",
        "Put them back in the pot and stir in the butter and cheese until melted.",
        "Taste and add a pinch of salt if needed."],
       "Add some cooked chicken or ham to make it heartier.")

recipe("Sheet-Pan Chicken & Veggies", "Dinner", "45 min", "Serves 4", 3,
       ["1 lb chicken tenders", "2 cups baby potatoes, halved", "1 cup broccoli florets", "1 cup baby carrots",
        "2 tablespoons olive oil", "1 teaspoon salt", "1/2 teaspoon garlic powder", "1/2 teaspoon paprika"],
       ["Large baking tray", "Big bowl", "Oven mitts"],
       ["!Preheat the oven to 425°F (220°C).",
        "Toss the potatoes and carrots with half the oil and spices. Spread them on the tray.",
        "!Roast for 15 minutes.",
        "Toss the chicken and broccoli with the rest of the oil and spices.",
        "Wash your hands well with soap after touching raw chicken.",
        "!Add the chicken and broccoli to the tray and roast 15 to 20 minutes more, until the chicken is 165°F inside."],
       "Everything cooks on one tray, so there's hardly any washing up!")

recipe("Veggie Fried Rice", "Dinner", "25 min", "Serves 4", 3,
       ["3 cups cooked rice (cold, from the day before)", "1 cup frozen mixed vegetables", "2 eggs",
        "2 tablespoons low-sodium soy sauce", "1 tablespoon vegetable oil", "2 green onions"],
       ["Large frying pan or wok", "Wooden spoon", "Kitchen scissors"],
       ["Snip the green onions into small pieces with kitchen scissors.",
        "!Heat the oil in the pan over medium-high heat. Cook the veggies for 3 minutes.",
        "!Push the veggies to one side. Crack in the eggs and scramble them.",
        "!Add the rice and stir-fry for 5 minutes until hot.",
        "Stir in the soy sauce and sprinkle on the green onions."],
       "Cold rice from the fridge makes the best fried rice. Fresh rice gets mushy.")

recipe("Baked Potato Bar", "Dinner", "70 min", "Serves 4", 2,
       ["4 russet potatoes", "1 tablespoon oil", "A pinch of salt",
        "Toppings: cheese, sour cream, broccoli, chives, beans"],
       ["Fork", "Baking tray", "Oven mitts", "Small bowls"],
       ["Scrub the potatoes clean under running water.",
        "!Preheat the oven to 400°F (200°C). Poke each potato a few times with a fork.",
        "Rub the potatoes with oil and sprinkle with salt.",
        "!Bake for 50 to 60 minutes, until soft when squeezed with an oven mitt.",
        "!Cut each potato open and fluff the inside with a fork.",
        "Add your favorite toppings!"],
       "Leftover taco meat or chili makes a great potato topping.")

# ---- Desserts -------------------------------------------------------------------
recipe("Chocolate Chip Cookies", "Desserts", "35 min", "Makes 24", 2,
       ["1/2 cup (1 stick) soft butter", "1/2 cup brown sugar", "1/4 cup white sugar", "1 egg",
        "1 teaspoon vanilla", "1 1/4 cups all-purpose flour", "1/2 teaspoon baking soda", "1/4 teaspoon salt",
        "1 cup chocolate chips"],
       ["Mixing bowl", "Electric mixer or wooden spoon", "2 baking trays", "Parchment paper", "Oven mitts"],
       ["!Preheat the oven to 350°F (175°C). Line the trays with parchment.",
        "Beat the butter and both sugars until light and creamy.",
        "Beat in the egg and vanilla.",
        "Stir in the flour, baking soda, and salt, then fold in the chocolate chips.",
        "Scoop tablespoon-size balls onto the trays, 2 inches apart.",
        "!Bake for 9 to 11 minutes, until golden at the edges.",
        "Let the cookies cool on the tray for 5 minutes."],
       "Don't eat raw cookie dough. Raw egg and raw flour can make you sick.")

recipe("Banana Nice Cream", "Desserts", "10 min + freeze", "Serves 2", 1,
       ["2 ripe bananas, sliced and frozen", "2 tablespoons milk",
        "Optional: 1 tablespoon cocoa powder or peanut butter"],
       ["Blender or food processor", "Spatula", "Bowls"],
       ["Put the frozen banana slices and milk in the blender.",
        "!Blend, stopping to scrape down the sides, until smooth and creamy.",
        "Add cocoa or peanut butter and blend again if you like.",
        "Eat right away, or freeze for 30 minutes for a firmer scoop."],
       "Freeze bananas when they have brown spots. They're sweetest then!")

recipe("Crispy Rice Cereal Treats", "Desserts", "15 min + cool", "Makes 16", 2,
       ["3 tablespoons butter", "4 cups mini marshmallows (a 10 oz bag)", "6 cups crispy rice cereal"],
       ["Large pot", "Wooden spoon", "9 x 13 inch pan", "Butter for greasing"],
       ["Butter the pan so the treats won't stick.",
        "!Melt the butter in the pot over low heat. Add the marshmallows and stir until melted.",
        "!Take the pot off the heat and stir in the cereal until coated.",
        "Press the mix into the pan with a buttered spatula.",
        "Let it cool for 30 minutes, then cut into squares."],
       "Stir in sprinkles for a party version!")

recipe("Strawberry Yogurt Pops", "Desserts", "10 min + 4 hours", "Makes 6", 1,
       ["2 cups vanilla yogurt", "1 cup strawberries, stems removed", "2 tablespoons honey"],
       ["Blender", "Ice pop molds", "Measuring cup with a spout"],
       ["Wash the strawberries and pull off the green tops.",
        "!Blend the yogurt, strawberries, and honey until smooth.",
        "Pour into the ice pop molds and add the sticks.",
        "Freeze for at least 4 hours.",
        "Run the molds under warm water for a few seconds to slide the pops out."],
       "Try blueberries or mango for a different color and flavor.")

recipe("One-Minute Mug Brownie", "Desserts", "5 min", "Serves 1", 2,
       ["4 tablespoons all-purpose flour", "4 tablespoons sugar", "2 tablespoons cocoa powder", "A pinch of salt",
        "3 tablespoons milk", "2 tablespoons vegetable oil", "1 tablespoon chocolate chips"],
       ["Large microwave-safe mug", "Fork", "Measuring spoons"],
       ["Put the flour, sugar, cocoa, and salt in the mug and mix with a fork.",
        "Add the milk and oil and stir until there are no dry bits.",
        "Sprinkle the chocolate chips on top.",
        "!Microwave for 60 to 75 seconds.",
        "!The mug will be very hot! Let it cool for 2 minutes before eating."],
       "Top with a small scoop of ice cream for a special treat.")

recipe("Chocolate-Dipped Strawberries", "Desserts", "20 min + chill", "Serves 4", 2,
       ["1 cup chocolate chips", "1 teaspoon coconut oil", "1 lb strawberries, washed and dried", "Sprinkles"],
       ["Microwave-safe bowl", "Spoon", "Tray", "Parchment paper"],
       ["Line the tray with parchment paper.",
        "!Melt the chocolate and oil in the microwave in 30-second bursts, stirring each time.",
        "Hold a strawberry by its leaves and dip it into the chocolate.",
        "Add sprinkles and place it on the tray.",
        "Chill in the fridge for 15 minutes until the chocolate is firm."],
       "The strawberries must be totally dry, or the chocolate won't stick.")

CATEGORIES = ["Breakfast", "Lunch", "Snacks", "Dinner", "Desserts"]
assert len(R) == 30
