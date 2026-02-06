// HeyGen Video Generation API
// Generates videos using HeyGen API with custom scripts

const axios = require('axios');

const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;
const HEYGEN_API_URL = 'https://api.heygen.com/v1';

/**
 * Generate a video using HeyGen
 * @param {Object} params - Video generation parameters
 * @param {string} params.avatar_id - HeyGen avatar ID
 * @param {string} params.script - Video script/text
 * @param {string} params.video_type - Type of video (welcome, training, promotional, etc.)
 * @param {Object} params.metadata - Additional metadata
 * @returns {Promise<Object>} Video generation result
 */
async function generateVideo({ avatar_id, script, video_type = 'welcome', metadata = {} }) {
  if (!HEYGEN_API_KEY) {
    throw new Error('HEYGEN_API_KEY is not configured');
  }

  if (!avatar_id || !script) {
    throw new Error('avatar_id and script are required');
  }

  try {
    // Create video generation request
    const response = await axios.post(
      `${HEYGEN_API_URL}/video/generate`,
      {
        avatar_id,
        script: {
          type: 'text',
          input: script,
          provider: 'microsoft',
          voice_id: metadata.voice_id || 'en-US-JennyNeural' // Default voice
        },
        background: metadata.background || {
          type: 'color',
          value: '#ffffff'
        },
        caption: metadata.caption !== false, // Enable captions by default
        dimension: metadata.dimension || {
          width: 1920,
          height: 1080
        }
      },
      {
        headers: {
          'X-Api-Key': HEYGEN_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      success: true,
      video_id: response.data.video_id,
      status: response.data.status || 'processing',
      video_type,
      avatar_id,
      script,
      message: 'Video generation started'
    };
  } catch (error) {
    console.error('Error generating HeyGen video:', error.response?.data || error.message);
    throw new Error(`Failed to generate video: ${error.response?.data?.message || error.message}`);
  }
}

/**
 * Get video status and URL
 * @param {string} video_id - HeyGen video ID
 * @returns {Promise<Object>} Video status and details
 */
async function getVideoStatus(video_id) {
  if (!HEYGEN_API_KEY) {
    throw new Error('HEYGEN_API_KEY is not configured');
  }

  try {
    const response = await axios.get(
      `${HEYGEN_API_URL}/video/${video_id}`,
      {
        headers: {
          'X-Api-Key': HEYGEN_API_KEY
        }
      }
    );

    return {
      video_id,
      status: response.data.status, // processing, completed, failed
      video_url: response.data.video_url,
      thumbnail_url: response.data.thumbnail_url,
      duration: response.data.duration,
      created_at: response.data.created_at
    };
  } catch (error) {
    console.error('Error fetching video status:', error.response?.data || error.message);
    throw new Error(`Failed to fetch video status: ${error.response?.data?.message || error.message}`);
  }
}

/**
 * Generate welcome video for a restaurant
 * @param {Object} params - Welcome video parameters
 * @param {string} params.restaurant_id - Restaurant ID
 * @param {string} params.restaurant_name - Restaurant name
 * @param {string} params.avatar_id - HeyGen avatar ID
 * @param {string} params.custom_script - Optional custom script
 * @returns {Promise<Object>} Video generation result
 */
async function generateWelcomeVideo({ restaurant_id, restaurant_name, avatar_id, custom_script = null }) {
  const defaultScript = `Hi there! Welcome to ${restaurant_name}. I'm your virtual host, and I'm here to help you discover our amazing menu and services. We're excited to have you here, and we can't wait to serve you something delicious!`;

  const script = custom_script || defaultScript;

  return await generateVideo({
    avatar_id,
    script,
    video_type: 'welcome',
    metadata: {
      restaurant_id,
      restaurant_name
    }
  });
}

/**
 * Generate training video
 * @param {Object} params - Training video parameters
 * @param {string} params.module_id - Training module ID
 * @param {string} params.title - Module title
 * @param {string} params.content - Training content/script
 * @param {string} params.avatar_id - HeyGen avatar ID
 * @returns {Promise<Object>} Video generation result
 */
async function generateTrainingVideo({ module_id, title, content, avatar_id }) {
  const script = `${title}. ${content}`;

  return await generateVideo({
    avatar_id,
    script,
    video_type: 'training',
    metadata: {
      module_id,
      title
    }
  });
}

/**
 * Generate promotional video
 * @param {Object} params - Promotional video parameters
 * @param {string} params.restaurant_id - Restaurant ID
 * @param {string} params.promotion_text - Promotion details
 * @param {string} params.avatar_id - HeyGen avatar ID
 * @returns {Promise<Object>} Video generation result
 */
async function generatePromotionalVideo({ restaurant_id, promotion_text, avatar_id }) {
  return await generateVideo({
    avatar_id,
    script: promotion_text,
    video_type: 'promotional',
    metadata: {
      restaurant_id
    }
  });
}

module.exports = {
  generateVideo,
  getVideoStatus,
  generateWelcomeVideo,
  generateTrainingVideo,
  generatePromotionalVideo
};
