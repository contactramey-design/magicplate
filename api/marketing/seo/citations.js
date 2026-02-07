// Local SEO Citation Builder API
const express = require('express');
const router = express.Router();
const { findById } = require('../../../lib/db');
const aiGateway = require('../../../lib/ai-gateway');

/**
 * POST /api/marketing/seo/citations/generate
 * Generate citation content for local directories
 */
router.post('/generate', async (req, res) => {
  try {
    const { restaurant_id, directory, use_ai = true } = req.body;

    if (!restaurant_id || !directory) {
      return res.status(400).json({ error: 'restaurant_id and directory are required' });
    }

    const restaurant = await findById('restaurants', parseInt(restaurant_id), 'restaurant_id');
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    let citationContent = {};

    if (use_ai && aiGateway.isConfigured()) {
      try {
        citationContent = await aiGateway.generateCitationContent(restaurant, directory);
      } catch (aiError) {
        console.error('AI citation generation error:', aiError);
        citationContent = generateDefaultCitation(restaurant, directory);
      }
    } else {
      citationContent = generateDefaultCitation(restaurant, directory);
    }

    res.json({
      success: true,
      restaurant_id: parseInt(restaurant_id),
      directory,
      citation_content: citationContent,
      ai_generated: use_ai && aiGateway.isConfigured()
    });
  } catch (error) {
    console.error('Error generating citation:', error);
    res.status(500).json({ error: 'Failed to generate citation content', details: error.message });
  }
});

/**
 * GET /api/marketing/seo/citations/directories
 * List recommended citation directories
 */
router.get('/directories', (req, res) => {
  res.json({
    directories: [
      { 
        name: 'Google Business Profile', 
        url: 'https://business.google.com', 
        priority: 'critical',
        description: 'Most important for local SEO. Free to claim and update.',
        signup_url: 'https://business.google.com'
      },
      { 
        name: 'Yelp', 
        url: 'https://biz.yelp.com', 
        priority: 'high',
        description: 'Essential for local restaurant visibility. Free business listing.',
        signup_url: 'https://biz.yelp.com'
      },
      { 
        name: 'TripAdvisor', 
        url: 'https://www.tripadvisor.com/GetListed', 
        priority: 'high',
        description: 'Important for travelers and tourists. Free listing.',
        signup_url: 'https://www.tripadvisor.com/GetListed'
      },
      { 
        name: 'Facebook Business', 
        url: 'https://www.facebook.com/business', 
        priority: 'high',
        description: 'Social media presence and local discovery. Free.',
        signup_url: 'https://www.facebook.com/business'
      },
      { 
        name: 'Yellow Pages', 
        url: 'https://www.yellowpages.com', 
        priority: 'medium',
        description: 'Traditional directory still used by many. Free basic listing.',
        signup_url: 'https://www.yellowpages.com/add'
      },
      { 
        name: 'Foursquare', 
        url: 'https://foursquare.com', 
        priority: 'medium',
        description: 'Location-based discovery platform. Free.',
        signup_url: 'https://foursquare.com'
      },
      { 
        name: 'Bing Places', 
        url: 'https://www.bingplaces.com', 
        priority: 'medium',
        description: 'Bing search engine business listing. Free.',
        signup_url: 'https://www.bingplaces.com'
      },
      { 
        name: 'Apple Maps', 
        url: 'https://mapsconnect.apple.com', 
        priority: 'medium',
        description: 'Apple Maps business listing. Free.',
        signup_url: 'https://mapsconnect.apple.com'
      }
    ],
    total: 8,
    priority_order: ['critical', 'high', 'medium', 'low']
  });
});

/**
 * POST /api/marketing/seo/citations/batch-generate
 * Generate citations for multiple directories at once
 */
router.post('/batch-generate', async (req, res) => {
  try {
    const { restaurant_id, directories, use_ai = true } = req.body;

    if (!restaurant_id || !directories || !Array.isArray(directories)) {
      return res.status(400).json({ error: 'restaurant_id and directories array are required' });
    }

    const restaurant = await findById('restaurants', parseInt(restaurant_id), 'restaurant_id');
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    const citations = [];

    for (const directory of directories) {
      try {
        let citationContent = {};
        
        if (use_ai && aiGateway.isConfigured()) {
          citationContent = await aiGateway.generateCitationContent(restaurant, directory);
        } else {
          citationContent = generateDefaultCitation(restaurant, directory);
        }

        citations.push({
          directory,
          content: citationContent,
          generated: true
        });
      } catch (error) {
        citations.push({
          directory,
          content: generateDefaultCitation(restaurant, directory),
          generated: false,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      restaurant_id: parseInt(restaurant_id),
      citations,
      total_generated: citations.filter(c => c.generated).length
    });
  } catch (error) {
    console.error('Error in batch citation generation:', error);
    res.status(500).json({ error: 'Failed to generate citations', details: error.message });
  }
});

function generateDefaultCitation(restaurant, directory) {
  return {
    description: `${restaurant.name} is a ${restaurant.cuisine || 'restaurant'} located at ${restaurant.address || 'your location'}. We offer ${restaurant.cuisine || 'delicious'} cuisine in a ${restaurant.description ? restaurant.description.toLowerCase() : 'welcoming'} atmosphere.`,
    categories: [
      restaurant.cuisine || 'Restaurant',
      'Dining',
      'Food Service'
    ],
    keywords: [
      restaurant.name,
      restaurant.cuisine || 'restaurant',
      ...(restaurant.address ? restaurant.address.split(',').map(p => p.trim()) : [])
    ],
    call_to_action: `Visit ${restaurant.name} for the best ${restaurant.cuisine || 'dining'} experience!`
  };
}

module.exports = router;
