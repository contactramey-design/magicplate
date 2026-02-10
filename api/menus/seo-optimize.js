// Batch Menu SEO Optimization API
const aiGateway = require('../../lib/ai-gateway');
const { findById } = require('../../lib/db');
let menuKnowledge;
try { menuKnowledge = require('../../lib/menu-knowledge'); } catch(e) { menuKnowledge = null; }

/**
 * POST /api/menus/seo-optimize
 * Comprehensive SEO optimization for menu items with location targeting
 */
module.exports = async (req, res) => {
  try {
    const { restaurant_id, menu_items, location, optimize_type = 'full' } = req.body;

    if (!restaurant_id || !menu_items || !Array.isArray(menu_items)) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['restaurant_id', 'menu_items (array)']
      });
    }

    // Get restaurant data
    let restaurant = {};
    try {
      restaurant = await findById('restaurants', parseInt(restaurant_id), 'restaurant_id') || {};
    } catch (error) {
      console.error('Error fetching restaurant:', error);
    }

    const optimizedItems = [];
    const seoScores = [];

    // Process each menu item
    for (const item of menu_items) {
      let optimized = {
        ...item,
        original_description: item.description || '',
        seo_score: 0,
        keywords: [],
        improvements: [],
        meta_description: '',
        alt_text: '',
        structured_data: null,
        ai_generated: false
      };

      if (aiGateway.isConfigured()) {
        try {
          // Generate comprehensive SEO-optimized description
          const seoResult = await aiGateway.generateSEOOptimizedDescription(
            item,
            restaurant,
            location || restaurant.address || ''
          );

          // Parse result (could be JSON or plain text)
          let seoData;
          try {
            seoData = typeof seoResult === 'string' ? JSON.parse(seoResult) : seoResult;
          } catch {
            // If not JSON, create structure from text
            seoData = {
              description: seoResult,
              keywords: aiGateway.extractKeywords(seoResult, location || restaurant.address || ''),
              seo_score: aiGateway.calculateSEOScore(seoResult),
              meta_description: seoResult.substring(0, 155),
              alt_text: `Photo of ${item.name} at ${restaurant.name || 'restaurant'}`,
              structured_data: aiGateway.generateStructuredData(item, restaurant),
              improvements: []
            };
          }

          optimized.description = seoData.description || seoResult;
          optimized.keywords = seoData.keywords || [];
          optimized.seo_score = seoData.seo_score || 0;
          optimized.improvements = seoData.improvements || [];
          optimized.meta_description = seoData.meta_description || optimized.description.substring(0, 155);
          optimized.alt_text = seoData.alt_text || `Photo of ${item.name} at ${restaurant.name || 'restaurant'}`;
          optimized.structured_data = seoData.structured_data || null;
          optimized.ai_generated = true;
        } catch (aiError) {
          console.error('AI SEO optimization error:', aiError);
          // Fallback: calculate basic SEO score
          optimized.seo_score = optimized.description ? aiGateway.calculateSEOScore(optimized.description) : 0;
          optimized.ai_generated = false;
        }
      } else {
        // Fallback if AI Gateway not configured — use menu knowledge for richer fallback
        if (menuKnowledge && item.name) {
          const seoCtx = menuKnowledge.buildSEOContext(item.name, item.ingredients, item.price);
          const adjectives = seoCtx.suggestedAdjectives || [];
          const adj = adjectives.slice(0, 3).join(', ');
          const ingredients = Array.isArray(item.ingredients) ? item.ingredients.join(', ') : (item.ingredients || '');
          const desc = item.description || `${adj} ${item.name}${ingredients ? ` made with ${ingredients}` : ''}${location ? `, served fresh at our ${location} location` : ''}.`;
          optimized.description = desc;
          optimized.keywords = [...adjectives.slice(0, 5), seoCtx.category.toLowerCase(), item.name.toLowerCase()];
          if (location) optimized.keywords.push(location.toLowerCase());
          optimized.seo_score = 55 + Math.min(adjectives.length * 5, 20) + (location ? 10 : 0) + (ingredients ? 10 : 0);
          optimized.improvements = ['Add more specific descriptors', 'Include dietary info (gluten-free, vegan)', 'Mention cooking method'];
        } else {
          optimized.seo_score = optimized.description ? aiGateway.calculateSEOScore(optimized.description) : 0;
          optimized.keywords = optimized.description ? aiGateway.extractKeywords(optimized.description, location || '') : [];
        }
      }

      optimizedItems.push(optimized);
      seoScores.push(optimized.seo_score);
    }

    const averageScore = seoScores.length > 0 
      ? Math.round(seoScores.reduce((a, b) => a + b, 0) / seoScores.length)
      : 0;

    return res.status(200).json({
      success: true,
      restaurant_id: parseInt(restaurant_id),
      optimized_items: optimizedItems,
      summary: {
        total_items: menu_items.length,
        average_seo_score: averageScore,
        items_optimized: optimizedItems.filter(i => i.ai_generated).length,
        optimization_type: optimize_type,
        location_targeted: location || restaurant.address || null
      }
    });
  } catch (error) {
    console.error('Error in SEO optimization:', error);
    return res.status(500).json({
      error: 'Failed to optimize menu items',
      message: error.message
    });
  }
};
