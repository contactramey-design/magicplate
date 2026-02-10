/**
 * /api/identify-food — Lightweight endpoint that ONLY identifies food items
 * in a photo using a vision model (BLIP-2). Returns the description so the
 * user can confirm before spending credits on enhancement.
 */
const path = require('path');
const fs = require('fs');
const axios = require('axios');

// Load env
const envLocalPath = path.join(__dirname, '..', '.env.local');
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) require('dotenv').config({ path: envPath });
if (fs.existsSync(envLocalPath)) require('dotenv').config({ path: envLocalPath, override: true });

module.exports = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) {
    return res.status(200).json({
      success: true,
      identified: false,
      description: '',
      message: 'Vision API not configured — enhancement will proceed without identification.'
    });
  }

  try {
    const imageData = req.body.image; // base64 string
    if (!imageData) {
      return res.status(400).json({ error: 'No image provided' });
    }

    // Convert base64 to buffer
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');

    if (imageBuffer.length > 10 * 1024 * 1024) {
      return res.status(400).json({ error: 'Image too large. Maximum size: 10MB' });
    }

    console.log('🔍 Identifying food items in uploaded image...');

    const dataUri = `data:image/jpeg;base64,${base64Data}`;

    // Call BLIP-2 for visual question answering
    const response = await axios.post(
      'https://api.replicate.com/v1/predictions',
      {
        version: '2e1dddc8621f72155f24cf2e0adbde548458d3cab9f00c0139eea840d0ac4746',
        input: {
          image: dataUri,
          task: 'visual_question_answering',
          question: 'List every food item, drink, cup, plate, bowl, sauce, garnish, side dish, and ingredient visible in this photo. Be very specific about the type of food (e.g. cheeseburger not just burger, caesar salad not just salad). Include quantities if there are multiple items. Format as a comma-separated list.'
        }
      },
      {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Poll for result (BLIP-2 is fast, usually <10s)
    let result = response.data;
    let attempts = 0;
    while (['starting', 'processing'].includes(result.status) && attempts < 30) {
      await new Promise(r => setTimeout(r, 1000));
      const poll = await axios.get(
        `https://api.replicate.com/v1/predictions/${result.id}`,
        { headers: { 'Authorization': `Token ${token}` } }
      );
      result = poll.data;
      attempts++;
    }

    if (result.status !== 'succeeded') {
      console.warn('⚠️ Vision analysis did not succeed, status:', result.status);
      return res.status(200).json({
        success: true,
        identified: false,
        description: '',
        message: 'Could not identify food items. You can still proceed with enhancement.'
      });
    }

    const description = Array.isArray(result.output)
      ? result.output.join(' ')
      : String(result.output || '');

    console.log('🔍 Identified:', description.trim());

    return res.status(200).json({
      success: true,
      identified: true,
      description: description.trim()
    });
  } catch (error) {
    console.error('Food identification error:', error.message);
    // Non-fatal — let user proceed
    return res.status(200).json({
      success: true,
      identified: false,
      description: '',
      message: 'Identification failed. You can still proceed with enhancement.'
    });
  }
};
