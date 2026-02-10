// Social Media Post Generation
// AI-powered social media content generation using AI Gateway

const aiGateway = require('../../../lib/ai-gateway');
const { findById } = require('../../../lib/db');

/**
 * Generate social media post content using AI Gateway
 * @param {Object} params - Post generation parameters
 * @param {string} params.restaurant_id - Restaurant ID
 * @param {string} params.platform - Platform (instagram, facebook, tiktok)
 * @param {string} params.post_type - Type of post (menu_item, promotion, announcement)
 * @param {Object} params.context - Context for generation (menu item, promotion details, etc.)
 * @returns {Promise<Object>} Generated post content
 */
async function generateSocialPost({ restaurant_id, platform, post_type, context = {} }) {
  try {
    // Get restaurant data for AI generation
    let restaurant = {};
    if (restaurant_id) {
      try {
        restaurant = await findById('restaurants', parseInt(restaurant_id)) || {};
      } catch (error) {
        console.error('Error fetching restaurant:', error);
      }
    }

    // Try AI Gateway first
    if (aiGateway.isConfigured()) {
      try {
        const aiContent = await aiGateway.generateSocialPost(
          restaurant,
          platform,
          { post_type, ...context }
        );
        
        return {
          restaurant_id,
          platform,
          post_type,
          content: aiContent,
          hashtags: extractHashtags(aiContent),
          suggested_image: context.image_url || null,
          created_at: new Date().toISOString(),
          ai_generated: true
        };
      } catch (aiError) {
        console.error('AI Gateway error, falling back to template:', aiError);
        // Fall through to template-based generation
      }
    }
    
    // Fallback to template-based generation
    const templates = {
      menu_item: {
        instagram: `🍽️ Check out our amazing ${context.item_name || 'new item'}! ${context.description || ''} #${restaurant.name?.replace(/\s+/g, '') || 'restaurant'} #foodie #delicious`,
        facebook: `We're excited to share our ${context.item_name || 'new item'} with you! ${context.description || ''}`,
        tiktok: `You have to try our ${context.item_name || 'new item'}! 🔥 ${context.description || ''}`
      },
      promotion: {
        instagram: `🎉 Special offer! ${context.promotion_details || ''} Limited time only! #${restaurant.name?.replace(/\s+/g, '') || 'restaurant'} #specialoffer`,
        facebook: `Great news! ${context.promotion_details || ''} Don't miss out!`,
        tiktok: `You won't believe this deal! ${context.promotion_details || ''} 🔥`
      },
      announcement: {
        instagram: `📢 ${context.announcement_text || ''} #${restaurant.name?.replace(/\s+/g, '') || 'restaurant'}`,
        facebook: `${context.announcement_text || ''}`,
        tiktok: `${context.announcement_text || ''} 🔥`
      }
    };
    
    const template = templates[post_type]?.[platform] || templates[post_type]?.instagram || '';
    
    // Simple template replacement
    let content = template;
    Object.keys(context).forEach(key => {
      content = content.replace(new RegExp(`{{${key}}}`, 'g'), context[key]);
    });
    
    return {
      restaurant_id,
      platform,
      post_type,
      content,
      hashtags: extractHashtags(content),
      suggested_image: context.image_url || null,
      created_at: new Date().toISOString(),
      ai_generated: false
    };
  } catch (error) {
    console.error('Error generating social post:', error);
    throw error;
  }
}

function extractHashtags(text) {
  const hashtags = text.match(/#\w+/g) || [];
  return hashtags.map(tag => tag.substring(1));
}

module.exports = {
  generateSocialPost
};
