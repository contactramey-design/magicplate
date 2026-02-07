// Automated Restaurant Onboarding using AI Gateway
const aiGateway = require('../../lib/ai-gateway');
const { findById } = require('../../lib/db');
const { generateVideo } = require('../heygen/generate-video');

/**
 * Complete onboarding workflow with AI-generated content
 * POST /api/restaurants/:id/onboard
 */
module.exports = async (req, res) => {
  try {
    const restaurantId = parseInt(req.params.id);
    
    if (!restaurantId) {
      return res.status(400).json({ error: 'Restaurant ID required' });
    }

    // Get restaurant data
    const restaurant = await findById('restaurants', restaurantId);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    const onboardingResults = {
      restaurant_id: restaurantId,
      timestamp: new Date().toISOString(),
      steps: {}
    };

    // Step 1: Generate welcome video script
    try {
      if (aiGateway.isConfigured()) {
        const onboardingContent = await aiGateway.generateOnboardingContent(restaurant);
        
        // Parse onboarding content (assuming it's structured)
        const videoScript = extractVideoScript(onboardingContent);
        onboardingResults.steps.video_script = {
          success: true,
          script: videoScript
        };

        // Step 2: Generate HeyGen welcome video (if HeyGen configured)
        try {
          const videoResult = await generateVideo({
            restaurant_id: restaurantId,
            script: videoScript,
            type: 'welcome'
          });
          onboardingResults.steps.welcome_video = {
            success: true,
            video_url: videoResult.video_url
          };
        } catch (videoError) {
          console.error('HeyGen video generation error:', videoError);
          onboardingResults.steps.welcome_video = {
            success: false,
            error: videoError.message
          };
        }
      } else {
        onboardingResults.steps.video_script = {
          success: false,
          error: 'AI Gateway not configured'
        };
      }
    } catch (error) {
      console.error('Onboarding content generation error:', error);
      onboardingResults.steps.video_script = {
        success: false,
        error: error.message
      };
    }

    // Step 3: Generate brand guidelines suggestions
    try {
      if (aiGateway.isConfigured()) {
        const onboardingContent = await aiGateway.generateOnboardingContent(restaurant);
        const brandGuidelines = extractBrandGuidelines(onboardingContent);
        
        onboardingResults.steps.brand_guidelines = {
          success: true,
          suggestions: brandGuidelines
        };
      } else {
        onboardingResults.steps.brand_guidelines = {
          success: false,
          error: 'AI Gateway not configured'
        };
      }
    } catch (error) {
      console.error('Brand guidelines generation error:', error);
      onboardingResults.steps.brand_guidelines = {
        success: false,
        error: error.message
      };
    }

    // Step 4: Generate content calendar
    try {
      if (aiGateway.isConfigured()) {
        const contentCalendar = await aiGateway.generateContentCalendar(restaurant, 30);
        
        onboardingResults.steps.content_calendar = {
          success: true,
          calendar: parseContentCalendar(contentCalendar)
        };
      } else {
        onboardingResults.steps.content_calendar = {
          success: false,
          error: 'AI Gateway not configured'
        };
      }
    } catch (error) {
      console.error('Content calendar generation error:', error);
      onboardingResults.steps.content_calendar = {
        success: false,
        error: error.message
      };
    }

    // Step 5: Generate menu description templates
    try {
      if (aiGateway.isConfigured() && restaurant.menuItems && restaurant.menuItems.length > 0) {
        const menuDescriptions = await Promise.all(
          restaurant.menuItems.slice(0, 5).map(item => // Generate for first 5 items
            aiGateway.generateMenuDescription(item, restaurant)
          )
        );
        
        onboardingResults.steps.menu_descriptions = {
          success: true,
          descriptions: menuDescriptions
        };
      } else {
        onboardingResults.steps.menu_descriptions = {
          success: false,
          error: 'AI Gateway not configured or no menu items'
        };
      }
    } catch (error) {
      console.error('Menu descriptions generation error:', error);
      onboardingResults.steps.menu_descriptions = {
        success: false,
        error: error.message
      };
    }

    return res.status(200).json({
      success: true,
      onboarding: onboardingResults
    });
  } catch (error) {
    console.error('Onboarding error:', error);
    return res.status(500).json({
      error: 'Onboarding failed',
      message: error.message
    });
  }
};

// Helper functions to parse AI-generated content
function extractVideoScript(content) {
  // Try to extract video script from structured content
  if (typeof content === 'string') {
    const scriptMatch = content.match(/Welcome Video Script[:\s]*(.*?)(?=\n\n|\n2\.|Brand Guidelines|$)/is);
    if (scriptMatch) {
      return scriptMatch[1].trim();
    }
  }
  // Fallback: return first 500 characters
  return typeof content === 'string' ? content.substring(0, 500) : 'Welcome to MagicPlate.ai!';
}

function extractBrandGuidelines(content) {
  // Try to extract brand guidelines from structured content
  if (typeof content === 'string') {
    const guidelinesMatch = content.match(/Brand Guidelines[:\s]*(.*?)(?=\n\n|\n3\.|Content Calendar|$)/is);
    if (guidelinesMatch) {
      return guidelinesMatch[1].trim();
    }
  }
  // Fallback: return basic structure
  return {
    colors: 'Recommended based on cuisine type',
    typography: 'Clean, readable fonts',
    tone: 'Friendly and professional'
  };
}

function parseContentCalendar(content) {
  // Try to parse structured calendar
  if (typeof content === 'string') {
    // Look for day-by-day structure
    const days = content.match(/Day \d+[:\s]*(.*?)(?=Day \d+|$)/gis);
    if (days) {
      return days.map(day => ({
        content: day.trim(),
        platform: 'all'
      }));
    }
  }
  // Fallback: return as single entry
  return [{
    content: typeof content === 'string' ? content : JSON.stringify(content),
    platform: 'all'
  }];
}
