/**
 * Menu Knowledge Base
 * Provides food category expertise, plating styles, and nutritional context
 * for AI image generation, SEO descriptions, and menu optimization.
 *
 * Built from comprehensive restaurant menu data spanning:
 * - Breakfast items (McMuffins, biscuits, griddles, bagels, oatmeal)
 * - Beef & Pork (burgers, doubles, quarter pounders, ribs)
 * - Chicken & Fish (sandwiches, wraps, nuggets, filet)
 * - Salads (ranch, southwest, grilled/crispy chicken)
 * - Snacks & Sides (fries, wraps, fruit, yogurt)
 * - Desserts (pies, cookies, sundaes, cones)
 * - Beverages (sodas, juices, milk)
 * - Coffee & Tea (lattes, mochas, frappes, iced coffees)
 * - Smoothies & Shakes (fruit smoothies, milkshakes, McFlurries)
 */

// ─── Food Category Taxonomy ───────────────────────────────────────
const FOOD_CATEGORIES = {
  breakfast: {
    label: 'Breakfast',
    keywords: ['egg', 'sausage', 'bacon', 'biscuit', 'muffin', 'mcmuffin', 'griddle', 'bagel', 'hotcake', 'pancake', 'waffle', 'oatmeal', 'hash brown', 'burrito', 'omelet', 'toast', 'cereal', 'croissant', 'cinnamon'],
    plating: 'Warm morning lighting, rustic plate or tray, steam rising, fresh orange juice or coffee in background',
    colors: 'Golden browns, warm yellows, crispy amber edges, bright egg yolks',
    textures: 'Fluffy eggs, crispy bacon, toasted bread, melted cheese strings'
  },
  burgers: {
    label: 'Burgers & Beef',
    keywords: ['burger', 'big mac', 'quarter pounder', 'cheeseburger', 'mcDouble', 'double', 'beef', 'patty', 'whopper', 'slider', 'meatball', 'steak burger'],
    plating: 'Classic burger photography — slightly angled, ingredients visible in cross-section, sesame bun glistening',
    colors: 'Rich browns of grilled meat, vibrant green lettuce, red tomato, golden bun, melted yellow cheese',
    textures: 'Juicy grilled patty with char marks, melted cheese drip, crisp lettuce, soft toasted bun'
  },
  chicken: {
    label: 'Chicken',
    keywords: ['chicken', 'mcchicken', 'nugget', 'crispy', 'grilled chicken', 'popcorn chicken', 'tender', 'wing', 'strip', 'fried chicken'],
    plating: 'Clean presentation highlighting crispy coating or grill marks, dipping sauce nearby',
    colors: 'Golden-brown crispy coating, white tender meat visible, green garnish',
    textures: 'Crunchy exterior with visible crumb texture, moist juicy interior, crispy skin'
  },
  fish_seafood: {
    label: 'Fish & Seafood',
    keywords: ['fish', 'filet', 'salmon', 'shrimp', 'lobster', 'crab', 'tuna', 'cod', 'tilapia', 'sushi', 'seafood', 'calamari'],
    plating: 'Light, elegant plating with lemon wedge, tartar sauce, on clean white or slate',
    colors: 'Golden-fried exterior, white flaky interior, lemon yellow, fresh green herbs',
    textures: 'Flaky tender fish, crispy battered coating, dewy lemon garnish'
  },
  sandwiches_wraps: {
    label: 'Sandwiches & Wraps',
    keywords: ['sandwich', 'wrap', 'mcwrap', 'sub', 'hoagie', 'panini', 'club', 'blt', 'grilled cheese', 'po boy'],
    plating: 'Cut in half showing colorful cross-section, ingredients layered visibly',
    colors: 'Toasted bread golden brown, fresh vegetables bright, dressing visible',
    textures: 'Toasted crispy bread, fresh crunchy lettuce, tender protein, melted cheese'
  },
  salads: {
    label: 'Salads',
    keywords: ['salad', 'caesar', 'ranch', 'southwest', 'garden', 'cobb', 'greek', 'kale', 'spinach', 'mixed greens'],
    plating: 'Wide shallow bowl, ingredients arranged artfully, dressing drizzled on top',
    colors: 'Vibrant greens, red tomatoes, purple onion, orange carrots, white cheese crumbles',
    textures: 'Crisp fresh greens, crunchy croutons, creamy dressing, tender grilled chicken'
  },
  sides: {
    label: 'Sides & Snacks',
    keywords: ['fries', 'french fries', 'onion rings', 'mozzarella sticks', 'tots', 'chips', 'coleslaw', 'corn', 'mac and cheese', 'baked potato', 'rice', 'beans'],
    plating: 'Casual, appetizing pile or neat arrangement, dipping sauce in ramekin',
    colors: 'Golden crispy fries, red ketchup, warm tones',
    textures: 'Crispy exterior, fluffy interior (fries), crunchy coating, stringy cheese'
  },
  desserts: {
    label: 'Desserts',
    keywords: ['pie', 'cookie', 'cake', 'sundae', 'ice cream', 'brownie', 'cheesecake', 'donut', 'churro', 'pastry', 'muffin', 'cupcake', 'cobbler', 'pudding', 'fudge'],
    plating: 'Elegant dessert plating, drizzle of sauce, dollop of cream, mint leaf garnish',
    colors: 'Rich chocolate browns, caramel golds, bright berry reds, white cream, powdered sugar',
    textures: 'Gooey melted chocolate, creamy ice cream, crumbly cookie, flaky pastry, smooth ganache'
  },
  beverages: {
    label: 'Beverages',
    keywords: ['soda', 'coke', 'sprite', 'juice', 'water', 'milk', 'lemonade', 'tea', 'iced tea', 'sweet tea'],
    plating: 'Condensation on glass, ice cubes visible, bright straw, fresh citrus garnish',
    colors: 'Translucent amber, bubbly effervescence, clear ice, bright fruit colors',
    textures: 'Fizzy bubbles, condensation droplets, crystal-clear ice, fresh citrus slice'
  },
  coffee: {
    label: 'Coffee & Specialty Drinks',
    keywords: ['coffee', 'latte', 'mocha', 'cappuccino', 'espresso', 'frappé', 'macchiato', 'americano', 'hot chocolate', 'chai'],
    plating: 'Artistic latte art, warm ceramic mug, cozy café setting, cinnamon or cocoa dusting',
    colors: 'Rich espresso browns, creamy foam whites, caramel drizzle, chocolate swirl',
    textures: 'Velvety microfoam, smooth crema, whipped cream peaks, chocolate shavings'
  },
  smoothies_shakes: {
    label: 'Smoothies & Shakes',
    keywords: ['smoothie', 'shake', 'milkshake', 'mcflurry', 'frappe', 'protein shake', 'acai bowl', 'frozen'],
    plating: 'Tall glass with whipped cream, drizzle, straw, fresh fruit garnish on rim',
    colors: 'Vibrant fruit colors — berry purple, strawberry pink, mango orange, creamy vanilla',
    textures: 'Thick creamy consistency, whipped cream swirls, crushed cookie pieces, candy chunks'
  },
  pizza: {
    label: 'Pizza',
    keywords: ['pizza', 'margherita', 'pepperoni', 'calzone', 'flatbread', 'deep dish', 'thin crust', 'wood-fired'],
    plating: 'Overhead angle or 45°, cheese pull visible, on rustic wood board or pizza stone',
    colors: 'Golden crust, red sauce, white mozzarella stretching, green basil, pepperoni red',
    textures: 'Bubbly melted cheese, crispy charred crust edges, fresh basil leaves, glistening olive oil'
  },
  pasta: {
    label: 'Pasta & Italian',
    keywords: ['pasta', 'spaghetti', 'fettuccine', 'lasagna', 'ravioli', 'penne', 'linguine', 'rigatoni', 'alfredo', 'carbonara', 'bolognese', 'marinara'],
    plating: 'Wide shallow bowl, pasta twirled neatly, sauce ladled, fresh parmesan and basil on top',
    colors: 'Golden pasta, rich red tomato sauce, white cream sauce, green herbs, parmesan white',
    textures: 'Al dente pasta, glossy sauce coating, shaved parmesan curls, fresh herb leaves'
  },
  mexican: {
    label: 'Mexican & Tex-Mex',
    keywords: ['taco', 'burrito', 'quesadilla', 'nachos', 'enchilada', 'fajita', 'guacamole', 'salsa', 'chimichanga', 'tamale', 'churro'],
    plating: 'Colorful, vibrant presentation with fresh cilantro, lime wedge, bright salsas',
    colors: 'Warm corn yellow, red and green peppers, white sour cream, fresh green cilantro, lime green',
    textures: 'Crispy tortilla shell, creamy guacamole, melted cheese, tender seasoned meat, fresh pico'
  },
  asian: {
    label: 'Asian Cuisine',
    keywords: ['sushi', 'ramen', 'pho', 'stir fry', 'spring roll', 'dumpling', 'noodle', 'teriyaki', 'curry', 'pad thai', 'dim sum', 'bao', 'wonton', 'fried rice', 'tempura'],
    plating: 'Minimalist Japanese aesthetic for sushi, steaming bowl for ramen/pho, bamboo mat or lacquer tray',
    colors: 'Bright orange salmon, deep soy brown, fresh green wasabi, pickled pink ginger, nori black',
    textures: 'Glossy soy-glazed surface, silky noodles, crispy tempura batter, fluffy steamed rice, tender dumpling skin'
  },
  bbq_grilled: {
    label: 'BBQ & Grilled',
    keywords: ['bbq', 'barbeque', 'ribs', 'brisket', 'pulled pork', 'grilled', 'smoked', 'char', 'rack', 'tri-tip', 'burnt ends', 'wings'],
    plating: 'Rustic cutting board or butcher paper, visible smoke ring, sauce glaze, coleslaw and pickles on side',
    colors: 'Deep mahogany smoke ring, caramelized dark bark, glossy red-brown BBQ sauce, fresh green pickles',
    textures: 'Tender pulled strands, crispy charred edges, glossy sticky sauce, juicy meat cross-section'
  },
  healthy: {
    label: 'Health & Wellness',
    keywords: ['acai', 'avocado', 'quinoa', 'kale', 'protein', 'grain bowl', 'poke', 'superfood', 'vegan', 'plant-based', 'gluten-free', 'low-carb', 'organic'],
    plating: 'Clean, bright, artful arrangement in a bowl, fresh ingredients visible, natural materials',
    colors: 'Vibrant avocado green, purple acai, quinoa tan, bright microgreens, radish pink',
    textures: 'Creamy avocado, crunchy granola, chewy grains, fresh sprouts, smooth hummus'
  }
};

// ─── Nutritional Ranges (from reference data) ─────────────────────
const NUTRITION_RANGES = {
  breakfast: { calMin: 150, calMax: 1150, avgCal: 480, proteinRange: '1–36g', fatRange: '0–60g' },
  burgers: { calMin: 240, calMax: 750, avgCal: 470, proteinRange: '12–48g', fatRange: '8–43g' },
  chicken: { calMin: 190, calMax: 1880, avgCal: 480, proteinRange: '9–87g', fatRange: '10–118g' },
  salads: { calMin: 140, calMax: 450, avgCal: 270, proteinRange: '6–29g', fatRange: '4.5–22g' },
  sides: { calMin: 15, calMax: 510, avgCal: 200, proteinRange: '0–6g', fatRange: '0–24g' },
  desserts: { calMin: 45, calMax: 340, avgCal: 220, proteinRange: '1–8g', fatRange: '1.5–13g' },
  beverages: { calMin: 0, calMax: 280, avgCal: 100, proteinRange: '0–9g', fatRange: '0–2.5g' },
  coffee: { calMin: 0, calMax: 760, avgCal: 280, proteinRange: '0–19g', fatRange: '0–31g' },
  smoothies_shakes: { calMin: 210, calMax: 930, avgCal: 530, proteinRange: '2–21g', fatRange: '0.5–33g' }
};

// ─── Identify food category from dish name ────────────────────────
function identifyCategory(dishName) {
  const lower = (dishName || '').toLowerCase();
  for (const [key, cat] of Object.entries(FOOD_CATEGORIES)) {
    for (const kw of cat.keywords) {
      if (lower.includes(kw)) return { key, ...cat };
    }
  }
  // Fallback to generic
  return {
    key: 'general',
    label: 'General',
    plating: 'Clean professional plating on white ceramic, natural lighting',
    colors: 'Natural appetizing food colors, warm tones',
    textures: 'Fresh, appetizing, well-prepared appearance'
  };
}

// ─── Build category-aware image prompt ────────────────────────────
function buildCategoryAwarePrompt(dishName, ingredients, style = 'professional') {
  const cat = identifyCategory(dishName);

  const base = `Professional appetizing food photograph of ${dishName}`;
  const ingredientLine = ingredients ? `, featuring ${ingredients}` : '';

  const styleMap = {
    professional: `${cat.plating}. Soft directional key light, shallow depth of field. Print-ready quality.`,
    rustic: `Rustic warm presentation. ${cat.plating}. Warm amber lighting, natural wood textures.`,
    modern: `Minimalist fine-dining plating. Dark elegant background. ${cat.plating}. Dramatic studio lighting.`,
    casual: `Inviting casual presentation. ${cat.plating}. Bright cheerful natural light, approachable and appetizing.`
  };

  const styleDesc = styleMap[style] || styleMap.professional;

  return {
    prompt: `${base}${ingredientLine}. ${styleDesc}
COLORS: ${cat.colors}.
TEXTURES: ${cat.textures}.
Ultra-sharp focus on food, 4K quality, no text, no watermark, professional DSLR bokeh.`,
    category: cat.label,
    negativePrompt: 'text, watermark, logo, label, handwriting, blurry, low-res, noisy, grainy, cartoon, illustration, CGI, deformed food, plastic-looking, extra plates, cluttered, ugly, bad composition, oversaturated, harsh flash'
  };
}

// ─── Generate SEO description with food knowledge ─────────────────
function buildSEOContext(dishName, ingredients, price) {
  const cat = identifyCategory(dishName);
  return {
    category: cat.label,
    suggestedAdjectives: getCategoryAdjectives(cat.key),
    nutritionContext: NUTRITION_RANGES[cat.key] || null
  };
}

function getCategoryAdjectives(categoryKey) {
  const adjectives = {
    breakfast: ['farm-fresh', 'golden', 'fluffy', 'crispy', 'hearty', 'savory', 'buttery', 'toasted', 'home-style'],
    burgers: ['juicy', 'flame-grilled', 'hand-crafted', 'char-broiled', 'smash-style', 'towering', 'loaded', 'mouthwatering'],
    chicken: ['crispy', 'golden-fried', 'tender', 'juicy', 'herb-crusted', 'buttermilk', 'hand-breaded', 'succulent'],
    fish_seafood: ['flaky', 'fresh-caught', 'pan-seared', 'delicate', 'lemon-kissed', 'crispy-battered', 'ocean-fresh'],
    sandwiches_wraps: ['loaded', 'stacked', 'toasted', 'pressed', 'overstuffed', 'fresh-made', 'artisan'],
    salads: ['crisp', 'garden-fresh', 'vibrant', 'tossed', 'seasonal', 'farm-to-table', 'refreshing'],
    sides: ['golden', 'crispy', 'seasoned', 'hand-cut', 'signature', 'shareable', 'perfectly-fried'],
    desserts: ['decadent', 'rich', 'velvety', 'house-made', 'warm', 'indulgent', 'heavenly', 'freshly-baked'],
    beverages: ['refreshing', 'ice-cold', 'freshly-squeezed', 'handcrafted', 'classic'],
    coffee: ['artisan', 'hand-pulled', 'velvety', 'rich', 'aromatic', 'freshly-brewed', 'barista-crafted'],
    smoothies_shakes: ['creamy', 'thick', 'blended', 'fresh-fruit', 'indulgent', 'frosty', 'handspun'],
    pizza: ['wood-fired', 'hand-tossed', 'artisan', 'stone-baked', 'bubbly', 'crispy-crust', 'loaded'],
    pasta: ['al-dente', 'house-made', 'slow-simmered', 'creamy', 'rich', 'traditional', 'hand-rolled'],
    mexican: ['authentic', 'zesty', 'fire-roasted', 'fresh', 'street-style', 'handmade', 'smothered'],
    asian: ['hand-crafted', 'wok-tossed', 'steaming', 'umami-rich', 'delicate', 'aromatic', 'freshly-rolled'],
    bbq_grilled: ['slow-smoked', 'pit-fired', 'tender', 'fall-off-the-bone', 'hickory-smoked', 'char-grilled', 'glazed'],
    healthy: ['nutrient-rich', 'plant-powered', 'superfood', 'clean', 'wholesome', 'vibrant', 'nourishing']
  };
  return adjectives[categoryKey] || ['delicious', 'fresh', 'appetizing', 'perfectly-prepared'];
}

module.exports = {
  FOOD_CATEGORIES,
  NUTRITION_RANGES,
  identifyCategory,
  buildCategoryAwarePrompt,
  buildSEOContext,
  getCategoryAdjectives
};
