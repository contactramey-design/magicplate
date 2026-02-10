/**
 * Photo Enhancement Prompt System
 * Generates precise, Michelin-star food photography prompts
 * Enhanced with category-specific knowledge from menu-knowledge.js
 */

let menuKnowledge;
try {
  menuKnowledge = require('./menu-knowledge');
} catch (e) {
  menuKnowledge = null;
}

const STYLE_PROMPTS = {
  casual_diner: 'warm natural daylight, clean white plate, simple honest plating, cozy diner atmosphere',
  fast_casual: 'bright modern lighting, contemporary tabletop, vibrant social-media-ready composition',
  fine_dining: 'dramatic moody side-lighting, elegant minimal plating, dark luxurious background, Michelin-star presentation',
  cafe_bakery: 'soft morning window light, marble or wood surface, airy pastel palette, delicate pastry styling',
  sushi_japanese: 'clean zen composition, natural soft lighting, ceramic servingware, minimalist Japanese presentation',
  mexican_taqueria: 'warm colorful lighting, rustic table, fresh cilantro and lime garnish, authentic vibrant setting',
  bbq_smokehouse: 'rich warm lighting, rustic wood board, visible glaze and char marks, smoky hearty atmosphere',
  pizza_italian: 'warm trattoria lighting, rustic ceramic or wood board, fresh basil garnish, authentic Italian ambiance',
  upscale_casual: 'cinematic side-light with subtle rim light, matte ceramic plate, refined microgreen garnish, premium relaxed ambiance'
};

/**
 * Parse structured food identification into components.
 * Handles both the new structured format (CUISINE:/DISH:/ITEMS:) and legacy comma-separated lists.
 */
function parseIdentifiedItems(identifiedItems) {
  if (!identifiedItems) return { cuisine: '', dish: '', items: '', plating: '', colors: '' };

  const result = { cuisine: '', dish: '', items: '', plating: '', colors: '' };

  // Try parsing structured format
  const cuisineMatch = identifiedItems.match(/CUISINE:\s*(.+?)(?:\n|DISH:|ITEMS:|PLATING:|COLORS:|$)/is);
  const dishMatch = identifiedItems.match(/DISH:\s*(.+?)(?:\n|CUISINE:|ITEMS:|PLATING:|COLORS:|$)/is);
  const itemsMatch = identifiedItems.match(/ITEMS:\s*(.+?)(?:\n|CUISINE:|DISH:|PLATING:|COLORS:|$)/is);
  const platingMatch = identifiedItems.match(/PLATING:\s*(.+?)(?:\n|CUISINE:|DISH:|ITEMS:|COLORS:|$)/is);
  const colorsMatch = identifiedItems.match(/COLORS:\s*(.+?)(?:\n|CUISINE:|DISH:|ITEMS:|PLATING:|$)/is);

  if (cuisineMatch) result.cuisine = cuisineMatch[1].trim();
  if (dishMatch) result.dish = dishMatch[1].trim();
  if (itemsMatch) result.items = itemsMatch[1].trim();
  if (platingMatch) result.plating = platingMatch[1].trim();
  if (colorsMatch) result.colors = colorsMatch[1].trim();

  // If no structured fields found, treat the whole string as items (legacy format)
  if (!result.cuisine && !result.dish && !result.items) {
    result.items = identifiedItems;
  }

  return result;
}

/**
 * Build enhancement prompt with identified items deeply embedded for identity preservation
 */
function buildRegenPrompt(style, fictionalLevel = 30, identifiedItems = '') {
  const stylePrompt = STYLE_PROMPTS[style] || STYLE_PROMPTS.upscale_casual;

  // Parse the identified items into structured components
  const parsed = parseIdentifiedItems(identifiedItems);
  const hasIdentification = !!(parsed.items || parsed.dish || parsed.cuisine);

  // Use menu knowledge for category-specific enhancement hints
  let categoryHints = '';
  if (menuKnowledge && identifiedItems) {
    const cat = menuKnowledge.identifyCategory(identifiedItems);
    if (cat && cat.key !== 'general') {
      categoryHints = `\nCATEGORY-SPECIFIC ENHANCEMENT (${cat.label}):
COLORS TO EMPHASIZE: ${cat.colors}.
TEXTURES TO ENHANCE: ${cat.textures}.
PLATING REFERENCE: ${cat.plating}.`;
    }
  }

  // Build a strong identity anchor from parsed data
  let cuisineAnchor = '';
  let dishAnchor = '';
  let itemsAnchor = '';

  if (parsed.cuisine) {
    cuisineAnchor = `This is ${parsed.cuisine} cuisine. The cuisine type MUST remain ${parsed.cuisine}. DO NOT change it to any other cuisine.`;
  }
  if (parsed.dish) {
    dishAnchor = `The dish is: ${parsed.dish}. This MUST remain ${parsed.dish} — do not turn it into a different dish.`;
  }
  if (parsed.items) {
    itemsAnchor = `Food items present: ${parsed.items}. Every single one of these items MUST remain exactly as described.`;
  }

  // Core identity block — the most important part of the prompt
  let identityBlock;
  if (hasIdentification) {
    identityBlock = `ABSOLUTE RULE — FOOD IDENTITY PRESERVATION (THIS OVERRIDES ALL OTHER INSTRUCTIONS):
${cuisineAnchor}
${dishAnchor}
${itemsAnchor}
${parsed.plating ? `Plate layout: ${parsed.plating}.` : ''}
${parsed.colors ? `Original food colors: ${parsed.colors}.` : ''}

You are ENHANCING the photo quality of these EXACT foods. You are NOT creating new food. You are NOT replacing any ingredient. You are NOT changing what is on the plate. The same foods must be in the output — just looking more appetizing with better lighting, sharper detail, and richer colors.

FORBIDDEN: Do NOT swap, substitute, replace, or transform ANY food item into a different food item. A chicken dish must stay chicken. Rice must stay rice. Bread must stay bread. Noodles must stay noodles. The exact same ingredients in the exact same arrangement.`;
  } else {
    identityBlock = `ABSOLUTE RULE — FOOD IDENTITY PRESERVATION:
Preserve the EXACT food items visible in this photo. Do NOT change, substitute, swap, or replace any food item with a different food item. Do NOT change the cuisine type. The same foods must appear in the output — only the photo quality should improve.`;
  }

  // Intensity tiers
  let tier, lightingNote, backgroundNote, colorNote;

  if (fictionalLevel <= 30) {
    tier = 'AUTHENTIC';
    lightingNote = 'Correct exposure and white balance. Add soft directional key light. Subtle fill to open shadows.';
    backgroundNote = 'Keep original background. Reduce clutter and distractions only.';
    colorNote = 'Natural, true-to-life colors. Gentle saturation boost. Rich but realistic.';
  } else if (fictionalLevel <= 70) {
    tier = 'PROFESSIONAL';
    lightingNote = 'Professional studio lighting. Soft key light at 45°, gentle fill, subtle backlight for rim highlights on food edges.';
    backgroundNote = 'Clean, softly blurred background with natural bokeh. Remove all distractions.';
    colorNote = 'Rich, appetizing colors. Deepen reds and browns in meats. Brighten greens. Warm golden tones on bread and pastry.';
  } else {
    tier = 'MICHELIN';
    lightingNote = 'Dramatic cinematic lighting. Strong side-light with deep shadows. Rim light separating food from background. Studio-quality highlights on sauces, glazes, and moisture.';
    backgroundNote = 'Dark, elegant, blurred background with professional bokeh. Clean surface — dark slate, marble, or black. Magazine editorial setting.';
    colorNote = 'Vivid, saturated, high-contrast colors. Deep rich tones. Food colors pop against dark background. Golden highlights, deep shadows. Commercial food photography color grade.';
  }

  // Build texture section with food-specific references
  let textureSection = `TEXTURE & DETAIL:
- Crystal-sharp focus on food surface. Resolve every grain, flake, char mark, and glaze.
- Enhance moisture — subtle sheen on proteins, dewy freshness on vegetables, glossy sauces.
- Crispy edges look crunchier. Juicy cuts look more succulent. Melted cheese stretches.
- Garnishes look fresh-picked — bright herbs, precise microgreens, clean sauce dots.`;

  // Add food-specific texture hints if we have items
  if (parsed.items) {
    textureSection += `\n- Apply these texture enhancements to the EXISTING items only: ${parsed.items}. Make THESE items look their absolute best.`;
  }

  // Reminder at end of prompt to reinforce identity
  const identityReminder = hasIdentification
    ? `\nREMINDER: The food items MUST be identical to the original — ${parsed.dish ? parsed.dish : 'the same dish'}${parsed.cuisine ? ` (${parsed.cuisine} cuisine)` : ''}. Enhance quality only. Do NOT replace any food.`
    : `\nREMINDER: Keep ALL original food items identical. Enhance photo quality only.`;

  return `${identityBlock}

${tier} FOOD PHOTOGRAPHY ENHANCEMENT — Transform this into a ${fictionalLevel <= 30 ? 'polished restaurant' : fictionalLevel <= 70 ? 'professional food magazine' : 'Michelin-star editorial'} photo.

LIGHTING: ${lightingNote}
BACKGROUND: ${backgroundNote}
COLOR: ${colorNote}

${textureSection}

QUALITY:
- 4K resolution, zero noise, zero compression artifacts.
- Professional DSLR shallow depth of field — razor-sharp food, creamy background falloff.
- Print-ready for menus, billboards, and food magazines.

STYLE: ${stylePrompt}
${categoryHints}
The final image should make viewers immediately hungry. This is a photo worthy of a 5-star restaurant menu.
${identityReminder}`;
}

function baseNegativePrompt(identifiedItems = '') {
  // Core negatives that always apply
  let negative = 'different food, wrong food, substituted dish, changed dish, food swap, replaced food, replaced ingredients, ' +
    'different cuisine, wrong cuisine, changed cuisine type, different protein, changed protein, swapped ingredients, ' +
    'different meal, transformed dish, altered food items, wrong plating, invented food, ' +
    'text, watermark, logo, handwriting, ' +
    'blurry, soft focus on food, low-res, noisy, grainy, compression artifacts, ' +
    'oversaturated neon colors, underexposed, overexposed, harsh flash, flat lighting, ' +
    'cartoon, illustration, CGI, plastic-looking, artificial, ' +
    'deformed food, melted shapes, extra fingers, extra limbs, ' +
    'cluttered background, messy table, dirty plate, fingerprints on plate';

  // Add cuisine-specific negatives if we know what the food is
  if (identifiedItems) {
    const parsed = parseIdentifiedItems(identifiedItems);
    const lower = (parsed.cuisine + ' ' + parsed.dish + ' ' + parsed.items).toLowerCase();

    // If we detect a specific cuisine, add negatives for other cuisines being swapped in
    if (lower.includes('chinese') || lower.includes('sesame') || lower.includes('stir fry') || lower.includes('wok') || lower.includes('dim sum')) {
      negative += ', steak, frites, french fries, western plating, burger, pizza, pasta, taco';
    } else if (lower.includes('mexican') || lower.includes('taco') || lower.includes('burrito') || lower.includes('enchilada')) {
      negative += ', sushi, ramen, steak frites, dim sum, pasta, croissant';
    } else if (lower.includes('italian') || lower.includes('pasta') || lower.includes('pizza') || lower.includes('risotto')) {
      negative += ', sushi, taco, stir fry, curry, dim sum';
    } else if (lower.includes('japanese') || lower.includes('sushi') || lower.includes('ramen') || lower.includes('tempura')) {
      negative += ', steak, burger, taco, pasta, pizza, french fries';
    } else if (lower.includes('american') || lower.includes('burger') || lower.includes('steak') || lower.includes('bbq')) {
      negative += ', sushi, dim sum, taco, ramen, curry, pad thai';
    } else if (lower.includes('indian') || lower.includes('curry') || lower.includes('naan') || lower.includes('tikka')) {
      negative += ', sushi, burger, taco, pasta, pizza, stir fry';
    }

    // If we see bread specifically, don't let it become something else
    if (lower.includes('bread') || lower.includes('baguette') || lower.includes('roll') || lower.includes('toast')) {
      negative += ', onion, garlic bulb, mushroom replacing bread';
    }
    // If we see chicken, don't let it become steak
    if (lower.includes('chicken') && !lower.includes('steak')) {
      negative += ', beef steak, pork chop, lamb chop, replacing chicken with beef';
    }
    // If we see rice, don't let it become something else
    if (lower.includes('rice') && !lower.includes('fries')) {
      negative += ', french fries replacing rice, mashed potatoes replacing rice';
    }
  }

  return negative;
}

function getAIGatewayPrompt(style = 'upscale_casual') {
  return buildRegenPrompt(style, 50, '');
}

module.exports = {
  STYLE_PROMPTS,
  buildRegenPrompt,
  baseNegativePrompt,
  parseIdentifiedItems,
  getAIGatewayPrompt
};
