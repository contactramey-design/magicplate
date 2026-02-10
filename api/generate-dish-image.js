// Text-to-Image Dish Generation API
// Generates a professional food photo from a dish name + ingredients description
// Uses Leonardo.ai pure text-to-image (no init image needed)

const path = require('path');
const fs = require('fs');

// Load environment variables
const envLocalPath = path.join(__dirname, '..', '.env.local');
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) require('dotenv').config({ path: envPath });
if (fs.existsSync(envLocalPath)) require('dotenv').config({ path: envLocalPath, override: true });

const axios = require('axios');
const { buildCategoryAwarePrompt, identifyCategory } = require('../lib/menu-knowledge');

const LEONARDO_API_KEY = process.env.LEONARDO_API_KEY;

/**
 * Build a food photography prompt for text-to-image generation
 * Uses menu-knowledge category data for category-specific lighting, colors, and textures
 */
function buildDishPrompt(dishName, ingredients, style = 'professional') {
  const result = buildCategoryAwarePrompt(dishName, ingredients, style);
  return result.prompt;
}

function negativePrompt(dishName) {
  const result = buildCategoryAwarePrompt(dishName, '', 'professional');
  return result.negativePrompt;
}

/**
 * Generate a dish image using Leonardo text-to-image
 */
async function generateWithLeonardo(dishName, ingredients, style) {
  if (!LEONARDO_API_KEY) {
    throw new Error('LEONARDO_API_KEY not configured. Add it to .env.local');
  }

  const prompt = buildDishPrompt(dishName, ingredients, style);
  console.log(`🍽️  Generating image for: ${dishName}`);
  console.log(`📝 Prompt: ${prompt.substring(0, 120)}...`);

  // Pure text-to-image — no init_image_id
  const generationData = {
    prompt: prompt,
    negative_prompt: negativePrompt(dishName),
    modelId: 'aa77f04e-3eec-4034-9c07-d0f619684628', // Leonardo Kino XL
    num_images: 1,
    width: 1024,
    height: 1024,
    guidance_scale: 8,
    num_inference_steps: 30,
    scheduler: 'LEONARDO',
    photoReal: true,
    photoRealVersion: 'v2',
    alchemy: true,
    presetStyle: 'FOOD'
  };

  // Step 1: Start generation
  const response = await axios.post(
    'https://cloud.leonardo.ai/api/rest/v1/generations',
    generationData,
    {
      headers: {
        'Authorization': `Bearer ${LEONARDO_API_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );

  const generationId = response.data.sdGenerationJob?.generationId ||
                        response.data.generationId ||
                        response.data.id;
  if (!generationId) {
    console.error('Leonardo response:', JSON.stringify(response.data, null, 2));
    throw new Error('Failed to get generation ID from Leonardo');
  }
  console.log(`⏳ Generation started, ID: ${generationId}`);

  // Step 2: Poll for completion (max 2 minutes)
  let status = 'PENDING';
  let result = null;
  let attempts = 0;
  const maxAttempts = 60;

  while (status === 'PENDING' && attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 2000));

    const statusResponse = await axios.get(
      `https://cloud.leonardo.ai/api/rest/v1/generations/${generationId}`,
      { headers: { 'Authorization': `Bearer ${LEONARDO_API_KEY}` } }
    );

    status = statusResponse.data.generations_by_pk?.status ||
             statusResponse.data.status ||
             statusResponse.data.generation?.status;

    result = statusResponse.data.generations_by_pk ||
             statusResponse.data.generation ||
             statusResponse.data;

    if (status === 'COMPLETE' || status === 'completed') break;
    if (status === 'FAILED' || status === 'failed') {
      throw new Error('Leonardo generation failed');
    }
    attempts++;
  }

  if (!result || (status !== 'COMPLETE' && status !== 'completed')) {
    throw new Error(`Generation timed out. Status: ${status}`);
  }

  const imageUrl = result.generated_images?.[0]?.url ||
                   result.images?.[0]?.url ||
                   result.url;

  if (!imageUrl) {
    throw new Error('No image URL in Leonardo response');
  }

  console.log(`✅ Image generated for ${dishName}: ${imageUrl}`);
  return imageUrl;
}

/**
 * Main handler
 */
module.exports = async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { dish_name, ingredients, style } = req.body;

    if (!dish_name || typeof dish_name !== 'string' || !dish_name.trim()) {
      return res.status(400).json({ error: 'dish_name is required' });
    }

    const imageUrl = await generateWithLeonardo(
      dish_name.trim(),
      (ingredients || '').trim(),
      style || 'professional'
    );

    return res.json({
      success: true,
      dish_name: dish_name.trim(),
      imageUrl,
      prompt: buildDishPrompt(dish_name.trim(), (ingredients || '').trim(), style || 'professional')
    });
  } catch (error) {
    console.error('❌ Dish image generation error:', error.message);

    const status = error.response?.status;
    let userMessage = error.message;
    if (status === 401) userMessage = 'Invalid Leonardo API key.';
    else if (status === 402) userMessage = 'Insufficient Leonardo credits.';
    else if (status === 429) userMessage = 'Rate limited — please wait a moment and try again.';

    return res.status(500).json({
      error: 'Generation failed',
      message: userMessage,
      service: 'leonardo'
    });
  }
};
