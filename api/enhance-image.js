// Load environment variables - check multiple locations
const path = require('path');
const fs = require('fs');

// Try .env.local first (if exists), then .env
const envLocalPath = path.join(__dirname, '..', '.env.local');
const envPath = path.join(__dirname, '..', '.env');

// Load .env first (base config)
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
}

// Then load .env.local (overrides .env, but only if values exist)
if (fs.existsSync(envLocalPath)) {
  const envBackup = { ...process.env }; // Backup .env values
  require('dotenv').config({ path: envLocalPath, override: true });
  
  // If .env.local has empty values, restore from .env
  Object.keys(process.env).forEach(key => {
    if (process.env[key] === '' && envBackup[key] && envBackup[key] !== '') {
      process.env[key] = envBackup[key];
    }
  });
}

// Log what we have
const leoKey = process.env.LEONARDO_API_KEY;
console.log('🔑 LEONARDO_API_KEY in enhance-image:', leoKey ? `Set (${leoKey.length} chars)` : 'NOT SET');

const axios = require('axios');
const FormData = require('form-data');
const fsPromises = require('fs').promises;
// path already declared above

// API Configuration - reload env vars to ensure latest values
// Load .env.local first, then .env (overrides .env.local)
if (fs.existsSync(envLocalPath)) {
  require('dotenv').config({ path: envLocalPath });
}
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath, override: true });
}

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
const REPLICATE_API_URL = 'https://api.replicate.com/v1';
const LEONARDO_API_KEY = process.env.LEONARDO_API_KEY;
const TOGETHER_API_KEY = process.env.TOGETHER_API_KEY;

// Log API key status at module load
console.log('🔑 API Keys at module load:');
console.log('  LEONARDO_API_KEY:', LEONARDO_API_KEY ? `✅ Set (${LEONARDO_API_KEY.length} chars)` : '❌ NOT SET');
console.log('  TOGETHER_API_KEY:', TOGETHER_API_KEY ? `✅ Set (${TOGETHER_API_KEY.length} chars)` : '⚪ Not set');
console.log('  REPLICATE_API_TOKEN:', REPLICATE_API_TOKEN ? `✅ Set (${REPLICATE_API_TOKEN.length} chars)` : '⚪ Not set');

function styleBlock(style) {
  switch (String(style || '').toLowerCase()) {
    case 'casual_diner':
      return 'Bright, friendly, simple plating, clean white plate, natural daylight, cozy diner table, minimal props, approachable vibe.';
    case 'fast_casual':
      return 'Modern clean plating, bright soft lighting, vibrant colors, contemporary tabletop, minimal garnish, social-media ready.';
    case 'fine_dining':
      return 'Dramatic refined lighting, elegant minimal plating, artistic negative space, premium garnish, dark moody luxury background, Michelin-style presentation.';
    case 'cafe_bakery':
      return 'Soft morning window light, airy bright palette, marble/wood surface, cozy cafe vibe, pastel tones, delicate styling.';
    case 'sushi_japanese':
      return 'Clean zen composition, natural soft lighting, ceramic/wood servingware, minimalist garnish, authentic Japanese presentation, calm background.';
    case 'mexican_taqueria':
      return 'Colorful vibrant styling, warm lighting, rustic table, fresh garnish (cilantro/lime), authentic lively vibe, bold but not oversaturated.';
    case 'bbq_smokehouse':
      return 'Rich warm moody lighting, rustic wood board, visible texture and glaze, hearty portions, smoky ambience, bold contrast.';
    case 'pizza_italian':
      return 'Warm inviting trattoria lighting, rustic ceramic plate/wood board, fresh basil/parm garnish, authentic Italian cozy ambiance.';
    case 'bar_sports_grill':
      return 'Punchy contrast, warm lighting, energetic bar vibe, hearty portions, crisp textures, appetizing shine, casual setting.';
    case 'upscale_casual':
    default:
      return 'Cinematic side lighting + subtle rim light, matte ceramic plate, refined garnish (microgreens), premium but relaxed ambiance.';
  }
}

// Import the new prompt system
const { getAIGatewayPrompt } = require('../lib/photo-enhancement-prompt');

function buildRegenPrompt(style) {
  try {
    // Use the comprehensive ethical food photography prompt
    const prompt = getAIGatewayPrompt(style);
    // Ensure prompt is not too long (Leonardo has limits)
    if (prompt && prompt.length > 1000) {
      console.warn('Prompt is very long, truncating to 1000 chars');
      return prompt.substring(0, 1000);
    }
    return prompt;
  } catch (error) {
    console.error('Error generating prompt, using fallback:', error);
    // Fallback to original prompt if new system fails
    return (
      'Professional restaurant food photography. Re-generate a premium marketing photo of the same dish concept as the reference image. ' +
      'Hero subject centered, appetizing proportions, realistic texture, crisp detail, glossy highlights, natural shadows. ' +
      'Clean composition with intentional negative space, shallow depth of field, creamy bokeh background. ' +
      'Ultra-realistic, editorial commercial food photo, high detail, sharp focus on food. ' +
      styleBlock(style)
    );
  }
}

function baseNegativePrompt() {
  return (
    'text, watermark, logo, menu text, handwriting, extra plates, extra food items, cluttered table, ' +
    'blurry, low-res, noisy, grainy, oversaturated, underexposed, overexposed, harsh flash, ' +
    'cartoon, illustration, CGI, plastic-looking, deformed food, duplicate garnish, messy smear'
  );
}

/**
 * Enhance image using Replicate API
 * Recommended models for food photography:
 * - blackforestlabs/flux-pro
 * - fofr/realistic-vision-v5.1
 * - lucataco/flux-pro
 */
async function enhanceImageWithReplicate(imageBuffer, imageName) {
  if (!REPLICATE_API_TOKEN) {
    throw new Error('REPLICATE_API_TOKEN not configured');
  }

  // Step 1: Upload image to Replicate
  // Replicate's /files endpoint expects multipart/form-data with a "content" part.
  const uploadForm = new FormData();
  uploadForm.append('content', imageBuffer, {
    filename: imageName || 'upload.jpg',
    contentType: 'application/octet-stream',
  });

  const uploadResponse = await axios.post(`${REPLICATE_API_URL}/files`, uploadForm, {
    headers: {
      'Authorization': `Token ${REPLICATE_API_TOKEN}`,
      ...uploadForm.getHeaders(),
    },
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
  });
  
  const uploadedFileUrl = uploadResponse.data.urls.get;
  
  // Validate the uploaded file URL format
  if (!uploadedFileUrl || typeof uploadedFileUrl !== 'string') {
    throw new Error('Invalid file URL from Replicate upload');
  }
  
  // Step 2: Use a reliable image enhancement model
  // Try owner/model format first (Replicate's preferred format)
  let prediction;
  let lastError = null;
  
  // Try format 1: owner/model
  try {
    prediction = await axios.post(
      `${REPLICATE_API_URL}/predictions`,
      {
        version: "nightmareai/real-esrgan",
        input: {
          image: uploadedFileUrl,
          scale: 2
        }
      },
      {
        headers: {
          'Authorization': `Token ${REPLICATE_API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    lastError = error;
    console.error('Format 1 (owner/model) failed:', error.response?.data || error.message);
    
    // Try format 2: version hash
    try {
      prediction = await axios.post(
        `${REPLICATE_API_URL}/predictions`,
        {
          version: "42fed1c4974146d4d2414e2be2c527b0af8b7f5",
          input: {
            image: uploadedFileUrl,
            scale: 2
          }
        },
        {
          headers: {
            'Authorization': `Token ${REPLICATE_API_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );
    } catch (error2) {
      lastError = error2;
      console.error('Format 2 (version hash) failed:', error2.response?.data || error2.message);
      
      // If both fail, throw with detailed error
      const errorDetails = error2.response?.data || error.response?.data || {};
      throw new Error(`Both model formats failed. Last error: ${errorDetails.detail || errorDetails.error || error2.message}`);
    }
  }
  
  // Step 3: Poll for completion
  let result = prediction.data;
  while (result.status === 'starting' || result.status === 'processing') {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const statusResponse = await axios.get(
      `${REPLICATE_API_URL}/predictions/${result.id}`,
      {
        headers: {
          'Authorization': `Token ${REPLICATE_API_TOKEN}`
        }
      }
    );
    result = statusResponse.data;
  }
  
  if (result.status === 'failed') {
    throw new Error(result.error || 'Enhancement failed');
  }
  
  return result;
}

/**
 * Enhance image using Leonardo.ai API (Image-to-Image)
 * Uses Leonardo's image-to-image endpoint for food photography enhancement
 */
async function enhanceImageWithLeonardo(imageBuffer, imageName, style = 'upscale_casual') {
  if (!LEONARDO_API_KEY) {
    throw new Error('LEONARDO_API_KEY not configured');
  }

  // Extract file extension from filename
  const getExtension = (filename) => {
    if (!filename) return 'jpg';
    const parts = filename.toLowerCase().split('.');
    if (parts.length < 2) return 'jpg';
    const ext = parts[parts.length - 1];
    // Normalize extension
    if (ext === 'jpeg') return 'jpg';
    if (['jpg', 'png', 'webp'].includes(ext)) return ext;
    return 'jpg'; // Default to jpg
  };

  const extension = getExtension(imageName);

  // Step 1: Get presigned URL from Leonardo
  let initImageId;
  try {
    console.log('Requesting presigned URL from Leonardo...');
    console.log('File extension:', extension);
    const initResponse = await axios.post(
      'https://cloud.leonardo.ai/api/rest/v1/init-image',
      {
        extension: extension
      },
      {
        headers: {
          'Authorization': `Bearer ${LEONARDO_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Init image response:', initResponse.data);
    const uploadInitImage = initResponse.data.uploadInitImage;
    
    if (!uploadInitImage) {
      console.error('Init response structure:', JSON.stringify(initResponse.data, null, 2));
      throw new Error('Failed to get presigned URL from Leonardo');
    }
    
    const presignedUrl = uploadInitImage.url;
    initImageId = uploadInitImage.id;
    
    if (!presignedUrl || !initImageId) {
      throw new Error('Missing presigned URL or init image ID');
    }
    
    console.log('Got presigned URL, uploading image to S3...');
    
    // Step 2: Upload image to presigned S3 URL
    // Note: Presigned URLs use PUT method with the raw image buffer
    const uploadResponse = await axios.put(presignedUrl, imageBuffer, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Content-Length': imageBuffer.length.toString()
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      timeout: 120000 // 2 minutes max (presigned URLs expire)
    });
    
    console.log('Image uploaded to S3 successfully, status:', uploadResponse.status);
    console.log('Init image ID:', initImageId);
  } catch (uploadError) {
    console.error('Leonardo upload error:', uploadError.response?.data || uploadError.message);
    console.error('Upload error status:', uploadError.response?.status);
    throw new Error(`Failed to upload image: ${uploadError.response?.data?.detail || uploadError.response?.data?.error || uploadError.message}`);
  }

  // Step 3: Generate enhanced image using image-to-image with PhotoReal for food
  const prompt = buildRegenPrompt(style);
  const negativePrompt = baseNegativePrompt();
  
  const generationData = {
    prompt: prompt,
    negative_prompt: negativePrompt,
    init_image_id: initImageId,
    modelId: 'aa77f04e-3eec-4034-9c07-d0f619684628', // Leonardo Kino XL (supports PhotoReal)
    num_images: 1,
    width: 1024,
    height: 1024,
    guidance_scale: 7,
    num_inference_steps: 30,
    init_strength: 0.65, // Lower = more transformation, higher = closer to original
    scheduler: 'LEONARDO',
    seed: null,
    // PhotoReal settings for food photography
    photoReal: true,
    photoRealVersion: 'v2',
    alchemy: true,
    presetStyle: 'FOOD' // Food photography preset
  };

  try {
    console.log('Starting Leonardo generation with data:', JSON.stringify({ ...generationData, init_image_id: initImageId }, null, 2));
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

    console.log('Generation response:', response.data);
    const generationId = response.data.sdGenerationJob?.generationId || response.data.generationId || response.data.id;
    if (!generationId) {
      console.error('Generation response structure:', JSON.stringify(response.data, null, 2));
      throw new Error('Failed to get generation ID from Leonardo response');
    }
    console.log('Generation started, ID:', generationId);

    // Step 4: Poll for completion
    let status = 'PENDING';
    let result = null;
    let attempts = 0;
    const maxAttempts = 120; // 2 minutes max

    while (status === 'PENDING' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Check every 2 seconds
      
      console.log(`Polling generation status (attempt ${attempts + 1}/${maxAttempts})...`);
      const statusResponse = await axios.get(
        `https://cloud.leonardo.ai/api/rest/v1/generations/${generationId}`,
        {
          headers: {
            'Authorization': `Bearer ${LEONARDO_API_KEY}`
          }
        }
      );

      // Try different response structures
      status = statusResponse.data.generations_by_pk?.status || 
               statusResponse.data.status || 
               statusResponse.data.generation?.status;
      
      result = statusResponse.data.generations_by_pk || 
               statusResponse.data.generation || 
               statusResponse.data;
      
      console.log('Status:', status);
      
      if (status === 'COMPLETE' || status === 'completed') {
        break;
      } else if (status === 'FAILED' || status === 'failed') {
        throw new Error('Generation failed on Leonardo side');
      }
      
      attempts++;
    }

    if (!result || (status !== 'COMPLETE' && status !== 'completed')) {
      throw new Error(`Generation timed out or failed. Final status: ${status}`);
    }

    // Get the generated image URL (try different response structures)
    const generatedImageUrl = result.generated_images?.[0]?.url || 
                              result.images?.[0]?.url ||
                              result.url ||
                              result.generated_images?.[0] ||
                              result.images?.[0];
    
    console.log('Generated image URL:', generatedImageUrl);
    
    if (!generatedImageUrl) {
      console.error('Result structure:', JSON.stringify(result, null, 2));
      throw new Error('No generated image URL found in result');
    }

    return {
      output: [generatedImageUrl],
      id: generationId
    };
  } catch (error) {
    console.error('Leonardo generation error:', error.response?.data || error.message);
    throw new Error(`Leonardo generation failed: ${error.response?.data?.detail || error.message}`);
  }
}

/**
 * Enhance image using Together.ai (Flux Pro) - Image-to-Image
 */
async function enhanceImageWithTogether(imageBuffer, imageName, style = 'upscale_casual') {
  if (!TOGETHER_API_KEY) {
    throw new Error('TOGETHER_API_KEY not configured');
  }

  // Convert image to base64
  const base64Image = imageBuffer.toString('base64');
  const prompt = buildRegenPrompt(style);
  const negativePrompt = baseNegativePrompt();
  
  try {
    const response = await axios.post(
      'https://api.together.xyz/inference',
      {
        model: 'black-forest-labs/FLUX.1-pro',
        prompt: prompt,
        negative_prompt: negativePrompt,
        image: `data:image/jpeg;base64,${base64Image}`,
        steps: 40,  // Balanced quality/speed
        guidance_scale: 7.5,  // Balanced stylization
        strength: 0.7  // Image-to-image strength (0.7 = good balance between original and transformation)
      },
      {
        headers: {
          'Authorization': `Bearer ${TOGETHER_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
  
    // Together returns the image URL directly in the response
    const imageUrl = response.data?.output?.choices?.[0]?.image || response.data?.output?.image;
    if (!imageUrl) {
      throw new Error('No image URL in Together response');
    }
    
    return {
      output: [imageUrl],
      id: response.data?.id || Date.now().toString()
    };
  } catch (error) {
    console.error('Together generation error:', error.response?.data || error.message);
    throw new Error(`Together generation failed: ${error.response?.data?.detail || error.message}`);
  }
}

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  // Reload environment variables on each request (in case .env was updated)
  // Load .env.local first, then .env (overrides .env.local)
  if (fs.existsSync(envLocalPath)) {
    require('dotenv').config({ path: envLocalPath });
  }
  if (fs.existsSync(envPath)) {
    require('dotenv').config({ path: envPath, override: true });
  }
  
    // Re-read API keys after reloading env
    const currentLeonardoKey = process.env.LEONARDO_API_KEY;
    const currentTogetherKey = process.env.TOGETHER_API_KEY;
    const currentReplicateToken = process.env.REPLICATE_API_TOKEN;
    
    console.log('🔑 API Keys on request:');
    console.log('  LEONARDO_API_KEY:', currentLeonardoKey ? `✅ Set (${currentLeonardoKey.length} chars)` : '❌ NOT SET');
    console.log('  TOGETHER_API_KEY:', currentTogetherKey ? `✅ Set (${currentTogetherKey.length} chars)` : '❌ NOT SET');
    console.log('  REPLICATE_API_TOKEN:', currentReplicateToken ? `✅ Set (${currentReplicateToken.length} chars)` : '❌ NOT SET');
  
  try {
    const imageData = req.body.image; // base64 string
    const imageName = req.body.filename || 'upload.jpg';
    const style = String(req.body?.style || 'upscale_casual');
    const restaurant_id = req.body.restaurant_id;
    
    if (!imageData) {
      return res.status(400).json({ error: 'No image provided' });
    }
    
    // Check usage limits if restaurant_id provided
    if (restaurant_id) {
      try {
        const { checkUsageLimit } = require('../lib/usage-tracker');
        const { findAll } = require('../lib/db');
        
        // Tier limits
        const TIER_LIMITS = {
          starter: { image_enhancements: 10 },
          professional: { image_enhancements: -1 },
          enterprise: { image_enhancements: -1 }
        };
        
        const subscriptions = await findAll('subscriptions', {
          restaurant_id: parseInt(restaurant_id),
          status: 'active'
        });
        
        if (subscriptions.length > 0) {
          const subscription = subscriptions[0];
          const limits = TIER_LIMITS[subscription.tier] || {};
          
          if (limits.image_enhancements !== -1) {
            const usageCheck = await checkUsageLimit(
              subscription.subscription_id,
              'image_enhancements',
              limits
            );
            
            if (!usageCheck.allowed) {
              return res.status(403).json({
                error: 'Image enhancement limit reached',
                message: `You've used ${usageCheck.current} of ${usageCheck.limit} enhancements this month. Upgrade to Professional for unlimited enhancements.`,
                current: usageCheck.current,
                limit: usageCheck.limit,
                remaining: usageCheck.remaining
              });
            }
          }
        }
      } catch (limitError) {
        console.error('Limit check error (non-fatal):', limitError);
        // Continue if limit check fails
      }
    }
    
    // Convert base64 to buffer
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');
    
    // Validate image size (max 10MB)
    if (imageBuffer.length > 10 * 1024 * 1024) {
      return res.status(400).json({ error: 'Image too large. Maximum size: 10MB' });
    }
    
    // Choose enhancement service (priority: Leonardo > Together > Replicate)
    // Leonardo is prioritized for food photography image-to-image
    let result;
    let serviceUsed = 'none';
    
    // Check which APIs are configured
    console.log('API Configuration check:');
    console.log('- LEONARDO_API_KEY:', LEONARDO_API_KEY ? 'Set (length: ' + LEONARDO_API_KEY.length + ')' : 'Not set');
    console.log('- TOGETHER_API_KEY:', TOGETHER_API_KEY ? 'Set (length: ' + TOGETHER_API_KEY.length + ')' : 'Not set');
    console.log('- REPLICATE_API_TOKEN:', REPLICATE_API_TOKEN ? 'Set (length: ' + REPLICATE_API_TOKEN.length + ')' : 'Not set');
    
    try {
      // Use the reloaded keys (currentLeonardoKey, etc.)
      if (currentLeonardoKey) {
        console.log('✅ Using Leonardo.ai for enhancement...');
        result = await enhanceImageWithLeonardo(imageBuffer, imageName, style);
        serviceUsed = 'leonardo';
      } else if (currentTogetherKey) {
        console.log('✅ Using Together.ai for enhancement...');
        result = await enhanceImageWithTogether(imageBuffer, imageName, style);
        serviceUsed = 'together';
      } else if (currentReplicateToken) {
        console.log('✅ Using Replicate for enhancement...');
        result = await enhanceImageWithReplicate(imageBuffer, imageName);
        serviceUsed = 'replicate';
      } else {
        // Provide detailed help message
        const helpMessage = `
No image enhancement API configured.

To fix this:
1. Get your Leonardo API key from https://leonardo.ai
2. Open the .env.local file in your project root
3. Add this line (NO spaces, NO quotes):
   LEONARDO_API_KEY=your_actual_key_here
4. Save the file (Cmd+S in VS Code)
5. The server will reload automatically

Current status:
- LEONARDO_API_KEY: ${currentLeonardoKey ? 'Set' : 'NOT SET'}
- TOGETHER_API_KEY: ${currentTogetherKey ? 'Set' : 'NOT SET'}
- REPLICATE_API_TOKEN: ${currentReplicateToken ? 'Set' : 'NOT SET'}

Check: http://localhost:3000/api/check-config
        `.trim();
        
        return res.status(500).json({ 
          error: 'No image enhancement API configured',
          message: helpMessage,
          configured: {
            leonardo: !!currentLeonardoKey,
            together: !!currentTogetherKey,
            replicate: !!currentReplicateToken
          }
        });
      }
    } catch (apiError) {
      console.error('API enhancement error:', apiError);
      console.error('Service used:', serviceUsed);
      console.error('Error response:', apiError.response?.data);
      console.error('Error status:', apiError.response?.status);
      console.error('Error message:', apiError.message);
      
      // Provide more helpful error messages
      let errorMessage = apiError.message || 'Enhancement failed';
      if (apiError.response?.data?.detail) {
        errorMessage = apiError.response.data.detail;
      } else if (apiError.response?.data?.error) {
        errorMessage = apiError.response.data.error;
      } else if (apiError.response?.data?.message) {
        errorMessage = apiError.response.data.message;
      }
      
      // Check for specific Leonardo errors
      if (serviceUsed === 'leonardo') {
        if (apiError.response?.status === 401) {
          errorMessage = 'Leonardo API key is invalid or missing. Please check your LEONARDO_API_KEY.';
        } else if (apiError.response?.status === 402) {
          errorMessage = 'Leonardo account has insufficient credits. Please add credits to your account.';
        } else if (apiError.response?.status === 404) {
          errorMessage = 'Leonardo API endpoint not found. Please check the API documentation.';
        }
      }
      
      // Check for pattern matching errors specifically
      if (errorMessage.includes('pattern') || errorMessage.includes('string did not match')) {
        errorMessage = 'Invalid model or parameter format. Please check the API configuration.';
      }
      
      return res.status(500).json({ 
        error: 'Enhancement failed',
        message: errorMessage,
        service: serviceUsed,
        details: process.env.NODE_ENV === 'development' ? {
          fullError: apiError.response?.data,
          status: apiError.response?.status,
          statusText: apiError.response?.statusText,
          stack: apiError.stack
        } : undefined
      });
    }
    
    // Get enhanced image URL
    let enhancedImageUrl;
    if (serviceUsed === 'replicate') {
      enhancedImageUrl = result.output?.[0] || result.output;
    } else if (serviceUsed === 'leonardo') {
      enhancedImageUrl = result.generations?.[0]?.url;
    } else if (serviceUsed === 'together') {
      enhancedImageUrl = result.output?.choices?.[0]?.image || result.output?.image;
    }
    
    if (!enhancedImageUrl) {
      return res.status(500).json({ 
        error: 'No enhanced image returned',
        result: result
      });
    }
    
    // Save images to public directory
    const outputDir = path.join(process.cwd(), 'public', 'images', 'enhanced');
    await fs.mkdir(outputDir, { recursive: true });
    
    const timestamp = Date.now();
    const beforePath = path.join(outputDir, `before-${timestamp}.jpg`);
    const afterPath = path.join(outputDir, `after-${timestamp}.jpg`);
    
    // Save original as "before"
    await fsPromises.writeFile(beforePath, imageBuffer);
    
    // Download and save enhanced image as "after"
    const enhancedResponse = await axios.get(enhancedImageUrl, { 
      responseType: 'arraybuffer',
      timeout: 30000
    });
    await fsPromises.writeFile(afterPath, Buffer.from(enhancedResponse.data));
    
    // Track usage if restaurant_id provided
    if (req.body.restaurant_id) {
      try {
        const { trackUsage } = require('../lib/usage-tracker');
        const { findAll } = require('../lib/db');
        
        const subscriptions = await findAll('subscriptions', {
          restaurant_id: parseInt(req.body.restaurant_id),
          status: 'active'
        });
        
        if (subscriptions.length > 0) {
          await trackUsage({
            restaurant_id: parseInt(req.body.restaurant_id),
            subscription_id: subscriptions[0].subscription_id,
            feature_type: 'image_enhancements',
            feature_count: 1
          });
        }
      } catch (usageError) {
        console.error('Usage tracking error (non-fatal):', usageError);
        // Don't fail the request if usage tracking fails
      }
    }
    
    return res.status(200).json({
      success: true,
      beforeUrl: `/images/enhanced/before-${timestamp}.jpg`,
      afterUrl: enhancedImageUrl, // Use API URL directly (faster) or local path
      output: [enhancedImageUrl], // Also include in output array for compatibility
      jobId: result.id || result.generationId,
      service: serviceUsed
    });
    
  } catch (error) {
    console.error('❌ Enhancement error:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Log API-specific errors
    if (error.response) {
      console.error('API Response Status:', error.response.status);
      console.error('API Response Data:', JSON.stringify(error.response.data, null, 2));
    }
    
    // Provide user-friendly error message
    let userMessage = error.message || 'Enhancement failed';
    
    // Check for specific error types
    if (error.message?.includes('API key') || error.message?.includes('not configured')) {
      userMessage = 'Image enhancement API not configured. Please check your API keys.';
    } else if (error.response?.status === 401) {
      userMessage = 'API authentication failed. Please check your API keys.';
    } else if (error.response?.status === 402) {
      userMessage = 'Insufficient API credits. Please add credits to your account.';
    } else if (error.response?.data?.detail) {
      userMessage = error.response.data.detail;
    } else if (error.response?.data?.error) {
      userMessage = error.response.data.error;
    }
    
    return res.status(500).json({ 
      error: 'Enhancement failed', 
      message: userMessage,
      details: process.env.NODE_ENV === 'development' ? {
        originalError: error.message,
        stack: error.stack,
        apiResponse: error.response?.data,
        apiStatus: error.response?.status
      } : undefined
    });
  }
};
