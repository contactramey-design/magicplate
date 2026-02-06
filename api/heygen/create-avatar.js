// HeyGen Avatar Creation API
// Creates restaurant-specific avatars using HeyGen API

const axios = require('axios');

const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;
const HEYGEN_API_URL = 'https://api.heygen.com/v1';

/**
 * Create a new avatar for a restaurant
 * @param {Object} params - Avatar creation parameters
 * @param {string} params.restaurant_id - Restaurant ID
 * @param {string} params.avatar_name - Name for the avatar
 * @param {string} params.base_avatar_id - Optional: Base avatar ID to clone from
 * @returns {Promise<Object>} Avatar creation result
 */
async function createRestaurantAvatar({ restaurant_id, avatar_name, base_avatar_id = null }) {
  if (!HEYGEN_API_KEY) {
    throw new Error('HEYGEN_API_KEY is not configured');
  }

  try {
    // Option 1: Clone from base avatar (Sydney's avatar)
    if (base_avatar_id) {
      const response = await axios.post(
        `${HEYGEN_API_URL}/avatars/clone`,
        {
          source_avatar_id: base_avatar_id,
          name: avatar_name || `Avatar for Restaurant ${restaurant_id}`
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
        avatar_id: response.data.avatar_id,
        avatar_name: response.data.name,
        restaurant_id,
        message: 'Avatar created successfully'
      };
    }

    // Option 2: Create from template or upload
    // This would require image upload or template selection
    // For now, return structure for future implementation
    
    return {
      success: false,
      message: 'Avatar creation from template not yet implemented. Use base_avatar_id to clone.'
    };
  } catch (error) {
    console.error('Error creating HeyGen avatar:', error.response?.data || error.message);
    throw new Error(`Failed to create avatar: ${error.response?.data?.message || error.message}`);
  }
}

/**
 * Get avatar details
 * @param {string} avatar_id - HeyGen avatar ID
 * @returns {Promise<Object>} Avatar details
 */
async function getAvatarDetails(avatar_id) {
  if (!HEYGEN_API_KEY) {
    throw new Error('HEYGEN_API_KEY is not configured');
  }

  try {
    const response = await axios.get(
      `${HEYGEN_API_URL}/avatars/${avatar_id}`,
      {
        headers: {
          'X-Api-Key': HEYGEN_API_KEY
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error fetching avatar details:', error.response?.data || error.message);
    throw new Error(`Failed to fetch avatar: ${error.response?.data?.message || error.message}`);
  }
}

/**
 * List all avatars for a restaurant
 * @param {string} restaurant_id - Restaurant ID
 * @returns {Promise<Array>} List of avatars
 */
async function listRestaurantAvatars(restaurant_id) {
  // TODO: Query database for avatars associated with restaurant_id
  // Then fetch details from HeyGen API
  
  return [];
}

module.exports = {
  createRestaurantAvatar,
  getAvatarDetails,
  listRestaurantAvatars
};
