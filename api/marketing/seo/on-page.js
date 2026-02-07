// On-Page SEO Optimization API
const express = require('express');
const router = express.Router();
const { findById } = require('../../../lib/db');
const aiGateway = require('../../../lib/ai-gateway');

/**
 * POST /api/marketing/seo/on-page/generate
 * Generate on-page SEO elements (meta titles, descriptions, H1/H2, etc.)
 */
router.post('/generate', async (req, res) => {
  try {
    const { restaurant_id, page_type, content, use_ai = true } = req.body;

    if (!restaurant_id || !page_type) {
      return res.status(400).json({ error: 'restaurant_id and page_type are required' });
    }

    const restaurant = await findById('restaurants', parseInt(restaurant_id), 'restaurant_id');
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    let seoElements = {};

    if (use_ai && aiGateway.isConfigured()) {
      try {
        seoElements = await aiGateway.generateOnPageSEO(restaurant, page_type, content);
      } catch (aiError) {
        console.error('AI on-page SEO error:', aiError);
        seoElements = generateDefaultOnPageSEO(restaurant, page_type, content);
      }
    } else {
      seoElements = generateDefaultOnPageSEO(restaurant, page_type, content);
    }

    res.json({
      success: true,
      restaurant_id: parseInt(restaurant_id),
      page_type,
      seo_elements: seoElements,
      ai_generated: use_ai && aiGateway.isConfigured()
    });
  } catch (error) {
    console.error('Error generating on-page SEO:', error);
    res.status(500).json({ error: 'Failed to generate on-page SEO', details: error.message });
  }
});

/**
 * POST /api/marketing/seo/on-page/content-suggestions
 * Generate blog-style content suggestions for menu items
 */
router.post('/content-suggestions', async (req, res) => {
  try {
    const { restaurant_id, menu_item, use_ai = true } = req.body;

    if (!restaurant_id || !menu_item) {
      return res.status(400).json({ error: 'restaurant_id and menu_item are required' });
    }

    const restaurant = await findById('restaurants', parseInt(restaurant_id), 'restaurant_id');
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    let contentSuggestion = {};

    if (use_ai && aiGateway.isConfigured()) {
      try {
        contentSuggestion = await aiGateway.generateContentSuggestion(restaurant, menu_item);
      } catch (aiError) {
        console.error('AI content suggestion error:', aiError);
        contentSuggestion = generateDefaultContentSuggestion(restaurant, menu_item);
      }
    } else {
      contentSuggestion = generateDefaultContentSuggestion(restaurant, menu_item);
    }

    res.json({
      success: true,
      restaurant_id: parseInt(restaurant_id),
      menu_item: menu_item.name,
      content_suggestion: contentSuggestion,
      ai_generated: use_ai && aiGateway.isConfigured()
    });
  } catch (error) {
    console.error('Error generating content suggestion:', error);
    res.status(500).json({ error: 'Failed to generate content suggestion', details: error.message });
  }
});

function generateDefaultOnPageSEO(restaurant, pageType, content) {
  const location = restaurant.address || '';
  const cuisine = restaurant.cuisine || 'restaurant';
  
  const defaults = {
    meta_title: `${restaurant.name} - Best ${cuisine} in ${location}`,
    meta_description: `Visit ${restaurant.name} for authentic ${cuisine} cuisine. ${restaurant.description || 'Family-friendly restaurant with fresh ingredients.'}`,
    h1: `${restaurant.name} - ${cuisine} Restaurant`,
    h2: [`Our Menu`, `About ${restaurant.name}`, `Visit Us`],
    og_title: `${restaurant.name} - ${cuisine} Restaurant`,
    og_description: restaurant.description || `Best ${cuisine} in ${location}`,
    og_image: restaurant.logo_url || '',
    twitter_card: 'summary_large_image',
    canonical_url: restaurant.website || ''
  };

  return defaults;
}

function generateDefaultContentSuggestion(restaurant, menuItem) {
  return {
    title: `Our Signature ${menuItem.name} - ${restaurant.name}`,
    slug: `${menuItem.name.toLowerCase().replace(/\s+/g, '-')}-story`,
    excerpt: `Discover the story behind our ${menuItem.name} at ${restaurant.name}.`,
    content: `At ${restaurant.name}, our ${menuItem.name} is crafted with care...`,
    keywords: [menuItem.name, restaurant.name, restaurant.cuisine || 'restaurant'],
    meta_description: `Learn about our ${menuItem.name} at ${restaurant.name}.`
  };
}

module.exports = router;
