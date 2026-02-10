/**
 * /api/identify-food — Identifies food items in a photo using vision AI.
 *
 * Provider priority:
 *  1. Google Gemini Flash (FREE, no credit card needed, excellent at food ID)
 *  2. Replicate LLaVA (paid, requires credits)
 *  3. Graceful skip → enhancement proceeds with prompt rules only
 *
 * To get a FREE Gemini key: https://aistudio.google.com/apikey
 * Set it as GEMINI_API_KEY in .env.local
 */
const path = require('path');
const fs   = require('fs');
const axios = require('axios');

// ── Load env ────────────────────────────────────────────
const envPath      = path.join(__dirname, '..', '.env');
const envLocalPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath))      require('dotenv').config({ path: envPath });
if (fs.existsSync(envLocalPath)) require('dotenv').config({ path: envLocalPath, override: true });

// ── Food identification prompt (shared across providers) ──
const FOOD_ID_PROMPT = `You are a professional chef, food photographer, and cuisine expert. Analyze this food photo with extreme precision.

Your response MUST follow this exact format:

CUISINE: [Identify the cuisine type — e.g. Chinese, Mexican, Italian, Japanese, American, Indian, Thai, French, Korean, Mediterranean, BBQ, Soul Food, etc. If unclear say "Mixed/Unclear"]

DISH: [Name the specific dish if recognizable — e.g. "Sesame Chicken", "Eggs Benedict", "Pad Thai", "Margherita Pizza". If not a known dish, describe it like "Grilled chicken breast with mashed potatoes and green beans"]

ITEMS: [List EVERY food item, drink, sauce, garnish, side dish, and condiment visible. Be VERY specific:
- Say "sesame-glazed fried chicken pieces with sesame seeds" not just "chicken"
- Say "steamed white rice" not just "rice"
- Say "sliced French baguette" not just "bread"
- Say "roasted garlic bulb" not just "garlic"
- Note cooking method if visible (grilled, fried, roasted, steamed, seared, braised, baked)
- Note the color and appearance of sauces (e.g. "dark brown soy-based glaze", "bright orange buffalo sauce", "creamy white alfredo")
- Include garnishes (sesame seeds, scallions, cilantro, parsley, microgreens)]

PLATING: [Describe the plate/bowl/surface and spatial layout — e.g. "white round plate with chicken in center, rice on left side, broccoli on right" or "wooden cutting board with meat sliced in center, small bowls of sides around it"]

COLORS: [List the dominant colors of the food — e.g. "golden brown fried exterior, dark amber glaze, white sesame seeds, green scallion garnish"]

Only describe what you ACTUALLY see. Do NOT guess or add items that are not visible.`;

// ── Provider 1: Google Gemini (FREE) ──────────────────
async function identifyWithGemini(base64Data, mimeType) {
  const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_KEY;
  if (!key) return null;

  console.log('🔍 Using Google Gemini Flash for food identification…');

  const response = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
    {
      contents: [{
        parts: [
          { text: FOOD_ID_PROMPT },
          { inline_data: { mime_type: mimeType, data: base64Data } }
        ]
      }],
      generationConfig: {
        temperature: 0.15,
        maxOutputTokens: 800
      }
    },
    { timeout: 30000 }
  );

  const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (text && text.trim().length > 10) {
    console.log('🔍 Gemini identified:', text.trim().substring(0, 150) + '…');
    return text.trim();
  }

  console.log('⚠️ Gemini returned empty/short response');
  return null;
}

// ── Provider 2: Replicate LLaVA (paid) ────────────────
async function identifyWithReplicate(dataUri) {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) return null;

  console.log('🔍 Using Replicate LLaVA for food identification…');

  const { data } = await axios.post(
    'https://api.replicate.com/v1/predictions',
    {
      version: '2facb4a474a0462c15041b78b1ad70952ea46b5ec6ad29583c0b29dbd4249591',
      input: {
        image: dataUri,
        prompt: FOOD_ID_PROMPT,
        max_tokens: 800,
        temperature: 0.15
      }
    },
    {
      headers: { Authorization: `Token ${token}`, 'Content-Type': 'application/json' },
      timeout: 15000
    }
  );

  // Poll for result
  let result = data;
  const deadline = Date.now() + 60000;
  while (['starting', 'processing'].includes(result.status) && Date.now() < deadline) {
    await new Promise(r => setTimeout(r, 1500));
    const poll = await axios.get(
      `https://api.replicate.com/v1/predictions/${result.id}`,
      { headers: { Authorization: `Token ${token}` }, timeout: 10000 }
    );
    result = poll.data;
  }

  if (result.status === 'succeeded' && result.output) {
    const text = (Array.isArray(result.output) ? result.output.join('') : String(result.output)).trim();
    if (text.length > 10) {
      console.log('🔍 LLaVA identified:', text.substring(0, 150) + '…');
      return text;
    }
  }

  console.log('⚠️ Replicate returned no useful output, status:', result.status);
  return null;
}

// ── Main handler ────────────────────────────────────────
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')   return res.status(405).json({ error: 'Method not allowed' });

  // Check if any vision provider is configured
  const hasGemini = !!(process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_KEY);
  const hasReplicate = !!process.env.REPLICATE_API_TOKEN;

  if (!hasGemini && !hasReplicate) {
    console.log('⚠️ No vision API configured (need GEMINI_API_KEY or REPLICATE_API_TOKEN)');
    return res.status(200).json({
      success: true,
      identified: false,
      description: '',
      message: 'No vision API configured. Get a FREE key at https://aistudio.google.com/apikey and add GEMINI_API_KEY to .env.local'
    });
  }

  // Parse image
  const imageData = req.body.image;
  if (!imageData) return res.status(400).json({ error: 'No image provided' });

  const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
  const imageBuffer = Buffer.from(base64Data, 'base64');

  if (imageBuffer.length > 10 * 1024 * 1024) {
    return res.status(400).json({ error: 'Image too large. Maximum size: 10MB' });
  }

  const mimeMatch = imageData.match(/^data:(image\/\w+);base64,/);
  const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
  const dataUri = `data:${mimeType};base64,${base64Data}`;

  console.log(`🔍 /api/identify-food — ${(imageBuffer.length / 1024).toFixed(0)} KB, providers: ${hasGemini ? 'Gemini' : ''}${hasGemini && hasReplicate ? '+' : ''}${hasReplicate ? 'Replicate' : ''}`);

  // Try providers in priority order
  let description = null;

  // 1. Try Gemini first (free, fast, excellent)
  if (hasGemini && !description) {
    try {
      description = await identifyWithGemini(base64Data, mimeType);
    } catch (err) {
      console.warn('⚠️ Gemini failed:', err.response?.status, err.response?.data?.error?.message || err.message);
    }
  }

  // 2. Fall back to Replicate
  if (hasReplicate && !description) {
    try {
      description = await identifyWithReplicate(dataUri);
    } catch (err) {
      console.warn('⚠️ Replicate failed:', err.response?.status || '', err.response?.data?.detail || err.message);
    }
  }

  // Return result
  if (description) {
    return res.status(200).json({
      success: true,
      identified: true,
      description
    });
  }

  return res.status(200).json({
    success: true,
    identified: false,
    description: '',
    message: 'Could not identify food items. Enhancement will proceed with visual preservation rules.'
  });
};
