// SEO Analytics & Performance Tracking API
const express = require('express');
const router = express.Router();
const { findAll, findById } = require('../../../lib/db');
const aiGateway = require('../../../lib/ai-gateway');

/**
 * GET /api/marketing/seo/analytics/:restaurant_id
 * Get SEO performance metrics and recommendations
 */
router.get('/:restaurant_id', async (req, res) => {
  try {
    const { restaurant_id } = req.params;
    const { start_date, end_date, use_ai = true } = req.query;

    const restaurant = await findById('restaurants', parseInt(restaurant_id), 'restaurant_id');
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    // Get menu items and content assets
    const menus = await findAll('content_assets', {
      restaurant_id: parseInt(restaurant_id),
      type: 'menu'
    });

    // Calculate SEO metrics
    const metrics = {
      items_optimized: menus.length,
      average_seo_score: 0,
      keywords_targeted: [],
      local_rankings: {},
      organic_traffic: 0,
      click_through_rate: 0,
      citations_completed: 0,
      google_business_updated: false
    };

    // Extract keywords from menu metadata
    const allKeywords = new Set();
    menus.forEach(menu => {
      if (menu.metadata && menu.metadata.items) {
        menu.metadata.items.forEach(item => {
          if (item.keywords) {
            item.keywords.forEach(kw => allKeywords.add(kw));
          }
        });
      }
    });
    metrics.keywords_targeted = Array.from(allKeywords);

    // Generate AI recommendations if enabled
    let recommendations = [];
    if (use_ai && aiGateway.isConfigured()) {
      try {
        const aiRecommendations = await aiGateway.generateSEORecommendations(restaurant, metrics);
        recommendations = typeof aiRecommendations === 'string' 
          ? aiRecommendations.split('\n').filter(r => r.trim())
          : aiRecommendations;
      } catch (aiError) {
        console.error('AI recommendations error:', aiError);
        recommendations = [
          'Optimize menu descriptions with location keywords',
          'Update Google Business Profile regularly',
          'Build citations on major directories',
          'Generate review responses for all reviews'
        ];
      }
    } else {
      recommendations = [
        'Optimize menu descriptions with location keywords',
        'Update Google Business Profile regularly',
        'Build citations on major directories',
        'Generate review responses for all reviews'
      ];
    }

    res.json({
      restaurant_id: parseInt(restaurant_id),
      period: { start_date, end_date },
      metrics,
      recommendations,
      generated_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching SEO analytics:', error);
    res.status(500).json({ error: 'Failed to fetch SEO analytics', details: error.message });
  }
});

/**
 * GET /api/marketing/seo/analytics/:restaurant_id/keywords
 * Get keyword performance tracking
 */
router.get('/:restaurant_id/keywords', async (req, res) => {
  try {
    const { restaurant_id } = req.params;

    const menus = await findAll('content_assets', {
      restaurant_id: parseInt(restaurant_id),
      type: 'menu'
    });

    const keywordMap = {};
    menus.forEach(menu => {
      if (menu.metadata && menu.metadata.items) {
        menu.metadata.items.forEach(item => {
          if (item.keywords) {
            item.keywords.forEach(kw => {
              keywordMap[kw] = (keywordMap[kw] || 0) + 1;
            });
          }
        });
      }
    });

    const keywordPerformance = Object.entries(keywordMap)
      .map(([keyword, count]) => ({
        keyword,
        usage_count: count,
        priority: count >= 3 ? 'high' : count >= 2 ? 'medium' : 'low'
      }))
      .sort((a, b) => b.usage_count - a.usage_count);

    res.json({
      restaurant_id: parseInt(restaurant_id),
      keywords: keywordPerformance,
      total_keywords: keywordPerformance.length
    });
  } catch (error) {
    console.error('Error fetching keyword performance:', error);
    res.status(500).json({ error: 'Failed to fetch keyword performance' });
  }
});

module.exports = router;
