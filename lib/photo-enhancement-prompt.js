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
 * Build enhancement prompt with identified items embedded
 */
function buildRegenPrompt(style, fictionalLevel = 30, identifiedItems = '') {
  const stylePrompt = STYLE_PROMPTS[style] || STYLE_PROMPTS.upscale_casual;

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

  // Core identity block — ensures the AI preserves the actual food
  const identityBlock = identifiedItems
    ? `CRITICAL — THIS PHOTO CONTAINS: ${identifiedItems}
You MUST keep these EXACT items. Do NOT substitute, remove, or add any food. Enhance ONLY quality.`
    : `CRITICAL — Preserve the EXACT food items in this photo. Do NOT change, substitute, or add any food.`;

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

  return `${identityBlock}

${tier} FOOD PHOTOGRAPHY ENHANCEMENT — Transform this into a ${fictionalLevel <= 30 ? 'polished restaurant' : fictionalLevel <= 70 ? 'professional food magazine' : 'Michelin-star editorial'} photo.

LIGHTING: ${lightingNote}
BACKGROUND: ${backgroundNote}
COLOR: ${colorNote}

TEXTURE & DETAIL:
- Crystal-sharp focus on food surface. Resolve every grain, flake, char mark, and glaze.
- Enhance moisture — subtle sheen on proteins, dewy freshness on vegetables, glossy sauces.
- Crispy edges look crunchier. Juicy cuts look more succulent. Melted cheese stretches.
- Garnishes look fresh-picked — bright herbs, precise microgreens, clean sauce dots.

QUALITY:
- 4K resolution, zero noise, zero compression artifacts.
- Professional DSLR shallow depth of field — razor-sharp food, creamy background falloff.
- Print-ready for menus, billboards, and food magazines.

STYLE: ${stylePrompt}
${categoryHints}
The final image should make viewers immediately hungry. This is a photo worthy of a 5-star restaurant menu.`;
}

function baseNegativePrompt() {
  return 'different food, wrong food, substituted dish, changed cuisine, extra food items, ' +
    'text, watermark, logo, handwriting, ' +
    'blurry, soft focus on food, low-res, noisy, grainy, compression artifacts, ' +
    'oversaturated neon colors, underexposed, overexposed, harsh flash, flat lighting, ' +
    'cartoon, illustration, CGI, plastic-looking, artificial, ' +
    'deformed food, melted shapes, extra fingers, extra limbs, ' +
    'cluttered background, messy table, dirty plate, fingerprints on plate';
}

function getAIGatewayPrompt(style = 'upscale_casual') {
  return buildRegenPrompt(style, 50, '');
}

module.exports = {
  STYLE_PROMPTS,
  buildRegenPrompt,
  baseNegativePrompt,
  getAIGatewayPrompt
};
