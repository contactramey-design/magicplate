// Menu Description Generation using AI Gateway
const aiGateway = require('../../lib/ai-gateway');
const { findById } = require('../../lib/db');

/**
 * Generate SEO-optimized menu description
 * POST /api/menus/generate-description
 */
module.exports = async (req, res) => {
  try {
    const { menu_item, restaurant_id } = req.body;

    if (!menu_item || !restaurant_id) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['menu_item', 'restaurant_id']
      });
    }

    // Get restaurant data
    let restaurant = {};
    try {
      restaurant = await findById('restaurants', parseInt(restaurant_id)) || {};
    } catch (error) {
      console.error('Error fetching restaurant:', error);
    }

    // Generate description using AI Gateway
    let description = '';
    let ai_generated = false;

    if (aiGateway.isConfigured()) {
      try {
        description = await aiGateway.generateMenuDescription(menu_item, restaurant);
        ai_generated = true;
      } catch (aiError) {
        console.error('AI Gateway error:', aiError);
        // Fallback to basic description
        description = `${menu_item.name}: ${menu_item.description || 'Delicious menu item'}`;
      }
    } else {
      // Fallback if AI Gateway not configured
      description = menu_item.description || `${menu_item.name} - A delicious addition to our menu.`;
    }

    return res.status(200).json({
      success: true,
      menu_item: {
        ...menu_item,
        description,
        ai_generated
      },
      restaurant_id
    });
  } catch (error) {
    console.error('Error generating menu description:', error);
    return res.status(500).json({
      error: 'Failed to generate menu description',
      message: error.message
    });
  }
};
