// Delivery App Integration API - DoorDash, Uber Eats SEO hooks
const express = require('express');
const router = express.Router();
const { findById } = require('../../../lib/db');
const aiGateway = require('../../../lib/ai-gateway');

/**
 * POST /api/marketing/seo/delivery/optimize-for-platform
 * Optimize menu items for delivery platforms (DoorDash, Uber Eats)
 */
router.post('/optimize-for-platform', async (req, res) => {
  try {
    const { restaurant_id, menu_items, platform, use_ai = true } = req.body;

    if (!restaurant_id || !menu_items || !platform) {
      return res.status(400).json({ 
        error: 'restaurant_id, menu_items, and platform are required',
        platforms: ['doordash', 'ubereats', 'grubhub', 'postmates']
      });
    }

    const restaurant = await findById('restaurants', parseInt(restaurant_id), 'restaurant_id');
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    const optimizedItems = [];

    for (const item of menu_items) {
      let optimized = { ...item };

      if (use_ai && aiGateway.isConfigured()) {
        try {
          const platformOptimized = await aiGateway.optimizeForDeliveryPlatform(
            item,
            restaurant,
            platform
          );
          optimized = { ...optimized, ...platformOptimized };
          optimized.ai_optimized = true;
        } catch (aiError) {
          console.error('AI delivery optimization error:', aiError);
          optimized = applyDefaultDeliveryOptimization(item, platform);
          optimized.ai_optimized = false;
        }
      } else {
        optimized = applyDefaultDeliveryOptimization(item, platform);
      }

      optimizedItems.push(optimized);
    }

    res.json({
      success: true,
      restaurant_id: parseInt(restaurant_id),
      platform,
      optimized_items: optimizedItems,
      ai_optimized: use_ai && aiGateway.isConfigured()
    });
  } catch (error) {
    console.error('Error optimizing for delivery platform:', error);
    res.status(500).json({ error: 'Failed to optimize for delivery platform', details: error.message });
  }
});

/**
 * GET /api/marketing/seo/delivery/platform-requirements
 * Get platform-specific requirements and best practices
 */
router.get('/platform-requirements', (req, res) => {
  res.json({
    platforms: {
      doordash: {
        name: 'DoorDash',
        description_requirements: {
          max_length: 500,
          required_fields: ['name', 'price'],
          recommended_fields: ['description', 'ingredients', 'allergens'],
          seo_tips: [
            'Include location keywords naturally',
            'Highlight dietary options (gluten-free, vegan)',
            'Use descriptive adjectives (fresh, local, authentic)',
            'Mention preparation style (handmade, house-made)'
          ]
        },
        image_requirements: {
          min_resolution: '1200x1200',
          format: 'JPG or PNG',
          max_size: '5MB',
          alt_text_required: true
        }
      },
      ubereats: {
        name: 'Uber Eats',
        description_requirements: {
          max_length: 300,
          required_fields: ['name', 'price'],
          recommended_fields: ['description', 'spice_level', 'dietary_info'],
          seo_tips: [
            'Keep descriptions concise but descriptive',
            'Include popular keywords',
            'Highlight unique selling points',
            'Mention portion size if relevant'
          ]
        },
        image_requirements: {
          min_resolution: '1000x1000',
          format: 'JPG or PNG',
          max_size: '10MB',
          alt_text_required: true
        }
      },
      grubhub: {
        name: 'Grubhub',
        description_requirements: {
          max_length: 400,
          required_fields: ['name', 'price'],
          recommended_fields: ['description', 'ingredients'],
          seo_tips: [
            'Focus on taste and quality',
            'Include preparation details',
            'Mention local sourcing if applicable',
            'Highlight dietary accommodations'
          ]
        },
        image_requirements: {
          min_resolution: '800x800',
          format: 'JPG or PNG',
          max_size: '5MB',
          alt_text_required: true
        }
      }
    }
  });
});

function applyDefaultDeliveryOptimization(item, platform) {
  const optimized = { ...item };
  
  // Platform-specific optimizations
  if (platform === 'doordash') {
    optimized.platform_description = optimized.description || `${optimized.name} - Fresh and delicious`;
    optimized.platform_name = optimized.name;
  } else if (platform === 'ubereats') {
    optimized.platform_description = (optimized.description || optimized.name).substring(0, 300);
    optimized.platform_name = optimized.name;
  } else if (platform === 'grubhub') {
    optimized.platform_description = (optimized.description || optimized.name).substring(0, 400);
    optimized.platform_name = optimized.name;
  }

  return optimized;
}

module.exports = router;
