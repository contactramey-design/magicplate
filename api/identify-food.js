/**
 * /api/identify-food — Lightweight endpoint that identifies food items
 * in a photo using a vision model (BLIP). Returns the description so the
 * user can confirm before spending credits on enhancement.
 *
 * Two-pass approach:
 *  1. image_captioning  → "a plate of grilled chicken with rice and greens"
 *  2. visual_question_answering → "chicken, rice, green beans, lemon wedge"
 * Combines both for a richer description.
 */
const path = require('path');
const fs   = require('fs');
const axios = require('axios');

// ── Load env ────────────────────────────────────────────
const envLocalPath = path.join(__dirname, '..', '.env.local');
const envPath      = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath))      require('dotenv').config({ path: envPath });
if (fs.existsSync(envLocalPath)) require('dotenv').config({ path: envLocalPath, override: true });

// BLIP model on Replicate (salesforce/blip)
const BLIP_VERSION = '2e1dddc8621f72155f24cf2e0adbde548458d3cab9f00c0139eea840d0ac4746';

// ── Helpers ─────────────────────────────────────────────

/**
 * Run a single prediction on Replicate and poll until done.
 * @param {string} token  Replicate API token
 * @param {object} input  Model inputs
 * @param {number} timeoutSec  Max seconds to wait
 * @returns {Promise<string>} Model output text
 */
async function runBlip(token, input, timeoutSec = 45) {
  const { data } = await axios.post(
    'https://api.replicate.com/v1/predictions',
    { version: BLIP_VERSION, input },
    { headers: { Authorization: `Token ${token}`, 'Content-Type': 'application/json' } }
  );

  let result = data;
  const deadline = Date.now() + timeoutSec * 1000;

  while (['starting', 'processing'].includes(result.status) && Date.now() < deadline) {
    await new Promise(r => setTimeout(r, 1200));
    const poll = await axios.get(
      `https://api.replicate.com/v1/predictions/${result.id}`,
      { headers: { Authorization: `Token ${token}` } }
    );
    result = poll.data;
  }

  if (result.status !== 'succeeded') {
    throw new Error(`Model status: ${result.status} (waited ${timeoutSec}s)`);
  }

  return Array.isArray(result.output) ? result.output.join(' ') : String(result.output || '');
}

/**
 * Two-pass identification:
 *  Pass 1 — captioning (gives a sentence: "a plate of grilled chicken…")
 *  Pass 2 — VQA (gives a list: "chicken, rice, green beans…")
 *  Combine both for a richer description.
 */
async function identifyFood(token, dataUri) {
  let caption = '';
  let vqaAnswer = '';

  // ── Pass 1: image captioning ──
  try {
    console.log('🔍  Pass 1 — image captioning…');
    caption = await runBlip(token, {
      image: dataUri,
      task: 'image_captioning'
    });
    caption = caption.replace(/^Caption:\s*/i, '').trim();
    console.log('   Caption:', caption);
  } catch (err) {
    console.warn('⚠️  Captioning pass failed:', err.message);
  }

  // ── Pass 2: visual question answering ──
  try {
    console.log('🔍  Pass 2 — VQA for specific items…');
    vqaAnswer = await runBlip(token, {
      image: dataUri,
      task: 'visual_question_answering',
      question: 'What specific food items, drinks, and dishes are in this photo?'
    });
    vqaAnswer = vqaAnswer.replace(/^Answer:\s*/i, '').trim();
    console.log('   VQA:', vqaAnswer);
  } catch (err) {
    console.warn('⚠️  VQA pass failed:', err.message);
  }

  // ── Combine ──
  if (caption && vqaAnswer) {
    // De-duplicate: if VQA just repeats the caption, skip it
    if (caption.toLowerCase().includes(vqaAnswer.toLowerCase()) ||
        vqaAnswer.toLowerCase().includes(caption.toLowerCase())) {
      return caption.length >= vqaAnswer.length ? caption : vqaAnswer;
    }
    return `${caption}  —  Specific items: ${vqaAnswer}`;
  }
  return caption || vqaAnswer || '';
}

// ── Main handler ────────────────────────────────────────
module.exports = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')   return res.status(405).json({ error: 'Method not allowed' });

  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) {
    // No vision key → skip gracefully; frontend will show manual-input fallback
    return res.status(200).json({
      success: true,
      identified: false,
      description: '',
      message: 'Vision API not configured — you can describe the food manually.'
    });
  }

  // ── Parse image ────────────────────────────────────────
  const imageData = req.body.image;
  if (!imageData) {
    return res.status(400).json({ error: 'No image provided' });
  }

  const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
  const imageBuffer = Buffer.from(base64Data, 'base64');

  if (imageBuffer.length > 10 * 1024 * 1024) {
    return res.status(400).json({ error: 'Image too large. Maximum size: 10MB' });
  }

  // Detect mime type from original data URI (default to jpeg)
  const mimeMatch = imageData.match(/^data:(image\/\w+);base64,/);
  const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
  const dataUri = `data:${mimeType};base64,${base64Data}`;

  console.log(`🔍 /api/identify-food — image size: ${(imageBuffer.length / 1024).toFixed(0)} KB`);

  try {
    const description = await identifyFood(token, dataUri);

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
      message: 'Could not identify food items. You can describe them manually below.'
    });
  } catch (error) {
    console.error('Food identification error:', error.message);
    // Non-fatal — let user describe manually
    return res.status(200).json({
      success: true,
      identified: false,
      description: '',
      message: 'Identification failed. Please describe the food items manually.'
    });
  }
};
