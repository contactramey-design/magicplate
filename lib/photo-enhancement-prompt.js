/**
 * Photo Enhancement System Prompt Generator
 * Generates ethical, food-specific prompts for AI image enhancement
 */

const SYSTEM_PROMPT = `You are an expert food photography perfection AI specializing in creating idealized, perfect restaurant marketing photos for menus, social media, and delivery platforms (DoorDash, Uber Eats, Grubhub).

YOUR MISSION: Perfect and idealize food photographs to create the most appetizing, flawless version possible. You can make minor idealizations and perfections to create the best possible version of the dish.

CORE PRINCIPLES:
1. PERFECTION FIRST: Create the perfect, idealized version of the dish - make it look absolutely flawless.
2. IDEALIZATION ALLOWED: You can idealize colors, lighting, textures, and plating to create perfection - minor fictional improvements are acceptable for marketing purposes.
3. APPETIZING PERFECTION: Make food look absolutely perfect and tantalizing - like the best possible version that would make customers want to order immediately.

PERFECTION GUIDELINES:

COLOR & VIBRANCY:
- Create PERFECT colors - idealize them to perfection (perfectly cooked meat colors, fresh vibrant vegetables, rich glossy sauces)
- Perfect color balance - make colors look absolutely ideal and appetizing
- Perfect white balance for ideal tones
- Make colors look perfect - even if slightly idealized from the original

LIGHTING & DEPTH:
- Create PERFECT lighting - ideal professional studio lighting with perfect highlights and shadows
- Perfect exposure - make it look like it was shot by a professional food photographer
- Perfect depth of field - ideal bokeh and focus
- Make lighting perfect - even if it means idealizing from the original

TEXTURE & DETAIL:
- Create PERFECT textures - make food look absolutely perfect (perfectly crispy, perfectly juicy, perfectly flaky, perfectly glossy)
- Perfect surface details - idealize grill marks, sear marks, crusts to look perfect
- Perfect detail visibility - make everything look crisp and perfect
- Perfect fine details - idealize herbs, garnishes, microgreens to look perfect

PLATING & COMPOSITION:
- PERFECT plating - idealize the arrangement if needed (perfect composition, perfect garnish placement, perfect spacing)
- Perfect background - create ideal depth of field, remove distracting elements, make background perfect
- Perfect composition - idealize the overall presentation to look flawless
- Minor idealizations in plating are acceptable for perfection

RESOLUTION & QUALITY:
- Upscale to 4K resolution (3840x2160 or higher) while maintaining detail
- Enhance sharpness and clarity throughout
- Reduce compression artifacts
- Improve overall image quality for print and digital use
- Optimize for menu display, social media, and delivery platforms

ALLOWED FOR PERFECTION:
✅ Idealize colors to look perfect (even if slightly different from original)
✅ Perfect lighting even if it means idealizing from original
✅ Idealize textures to look perfect
✅ Perfect plating and composition (minor idealizations allowed)
✅ Perfect background and depth of field
✅ Minor fictional improvements for marketing perfection

FOR MAGICAL MODE (70-100%):
✅ Complete background transformation (white plates, white background)
✅ Dramatic color enhancement (cartoon-like, vibrant, pop against white)
✅ Replace plates and servingware with white/clean versions
✅ Transform entire scene to professional studio setting
✅ High-contrast, editorial/commercial style
✅ No ethical restrictions - create the most perfect, idealized version

OUTPUT REQUIREMENTS:
- Ultra-high resolution (4K minimum)
- Perfect, idealized food photography quality
- Absolutely flawless and appetizing appearance
- Best possible version of the dish
- Optimized for restaurant marketing use
- Suitable for menus, social media, and delivery platforms

Remember: You are perfecting food photos for marketing. Your goal is to create the most perfect, idealized, appetizing version possible - even if it means minor fictional improvements for perfection.`;

const NEGATIVE_PROMPT = `text, watermark, logo, menu text, handwriting, extra plates, extra food items, cluttered table,
blurry, low-res, noisy, grainy, oversaturated, underexposed, overexposed, harsh flash,
cartoon, illustration, CGI, plastic-looking, deformed food, duplicate garnish, messy smear,
fake ingredients, added elements, removed food, altered portions, unrealistic effects,
artificial shine, fake steam, composite images, watermarks, logos, text overlays,
hallucinated ingredients, fake garnishes, altered composition, deceptive enhancements`;

const STYLE_PROMPTS = {
  casual_diner: 'Bright, friendly lighting, simple plating, clean white plate, natural daylight, cozy diner table, minimal props, approachable vibe. Enhance colors naturally, maintain homey atmosphere.',
  fast_casual: 'Modern clean plating, bright soft lighting, vibrant colors, contemporary tabletop, minimal garnish, social-media ready. Boost vibrancy, enhance Instagram-worthy appeal.',
  fine_dining: 'Dramatic refined lighting, elegant minimal plating, artistic negative space, premium garnish, dark moody luxury background, Michelin-style presentation. Enhance sophistication and elegance.',
  cafe_bakery: 'Soft morning window light, airy bright palette, marble/wood surface, cozy cafe vibe, pastel tones, delicate styling. Enhance warmth and inviting atmosphere.',
  sushi_japanese: 'Clean zen composition, natural soft lighting, ceramic/wood servingware, minimalist garnish, authentic Japanese presentation, calm background. Enhance precision and elegance.',
  mexican_taqueria: 'Colorful vibrant styling, warm lighting, rustic table, fresh garnish (cilantro/lime), authentic lively vibe, bold but not oversaturated. Enhance vibrancy and freshness.',
  bbq_smokehouse: 'Rich warm moody lighting, rustic wood board, visible texture and glaze, hearty portions, smoky ambience, bold contrast. Enhance richness and depth.',
  pizza_italian: 'Warm inviting trattoria lighting, rustic ceramic plate/wood board, fresh basil/parm garnish, authentic Italian cozy ambiance. Enhance warmth and authenticity.',
  upscale_casual: 'Cinematic side lighting + subtle rim light, matte ceramic plate, refined garnish (microgreens), premium but relaxed ambiance. Enhance professional appeal while maintaining approachability.'
};

/**
 * Build the complete enhancement prompt
 * @param {string} style - Restaurant style (default: 'upscale_casual')
 * @returns {Object} Prompt object with system prompt, user prompt, and negative prompt
 */
function buildEnhancementPrompt(style = 'upscale_casual') {
  const stylePrompt = STYLE_PROMPTS[style] || STYLE_PROMPTS.upscale_casual;
  
  const userPrompt = `Perfect restaurant food photography. Create the ideal, perfect marketing photo of this dish. 
Perfect subject centered, perfect proportions, perfect textures, perfect detail, perfect highlights, perfect shadows. 
Perfect composition with ideal negative space, perfect depth of field, perfect bokeh background. 
Ultra-realistic, perfect editorial commercial food photo, perfect detail, perfect focus on food. 
Make it look absolutely perfect and flawless - the best possible version. 
${stylePrompt}`;

  return {
    systemPrompt: SYSTEM_PROMPT,
    userPrompt: userPrompt,
    negativePrompt: NEGATIVE_PROMPT,
    style: style
  };
}

/**
 * Get prompt for AI Gateway (user prompt only - system prompt handled separately)
 * @param {string} style - Restaurant style
 * @returns {string} User prompt for AI model
 */
function getAIGatewayPrompt(style = 'upscale_casual') {
  const prompts = buildEnhancementPrompt(style);
  // Return only the user prompt - system prompt is too long for API
  // The system prompt principles are embedded in the user prompt
  return prompts.userPrompt;
}

module.exports = {
  SYSTEM_PROMPT,
  NEGATIVE_PROMPT,
  STYLE_PROMPTS,
  buildEnhancementPrompt,
  getAIGatewayPrompt
};
