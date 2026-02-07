const axios = require('axios');

const AI_GATEWAY_URL = process.env.AI_GATEWAY_URL || 'https://gateway.ai.cloudflare.com/v1';
const AI_GATEWAY_API_KEY = process.env.AI_GATEWAY_API_KEY;

// Simple in-memory cache for cost optimization
const cache = new Map();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

/**
 * Unified AI Gateway interface for all AI operations
 */
class AIGateway {
  constructor() {
    this.baseURL = AI_GATEWAY_URL;
    this.apiKey = AI_GATEWAY_API_KEY;
  }

  /**
   * Check if AI Gateway is configured
   */
  isConfigured() {
    return !!this.apiKey;
  }

  /**
   * Generate content using AI Gateway
   * @param {string} provider - 'openai', 'anthropic', 'google'
   * @param {string} model - Model name
   * @param {Array} messages - Chat messages
   * @param {Object} options - Additional options
   */
  async generate(provider, model, messages, options = {}) {
    if (!this.isConfigured()) {
      throw new Error('AI_GATEWAY_API_KEY not configured. Set it in your .env file.');
    }

    // Build cache key
    const cacheKey = JSON.stringify({ provider, model, messages, options: { max_tokens: options.max_tokens, temperature: options.temperature } });;
    
    // Check cache first (for cost optimization)
    if (options.cache !== false) {
      const cached = cache.get(cacheKey);
      if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
        console.log('✅ Using cached AI response');
        return cached.result;
      }
    }

    try {
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          provider,
          model,
          messages,
          max_tokens: options.max_tokens || 1000,
          temperature: options.temperature !== undefined ? options.temperature : 0.7,
          ...options
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 60000 // 60 second timeout
        }
      );

      const result = response.data.choices?.[0]?.message?.content || 
                     response.data.content || 
                     JSON.stringify(response.data);

      // Cache result
      if (options.cache !== false) {
        cache.set(cacheKey, { result, timestamp: Date.now() });
      }

      return result;
    } catch (error) {
      console.error('AI Gateway error:', error.response?.data || error.message);
      
      // If AI Gateway fails, return null (callers should have fallbacks)
      if (options.fallback) {
        return options.fallback;
      }
      
      throw new Error(`AI Gateway request failed: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Generate social media post
   */
  async generateSocialPost(restaurant, platform, context = {}) {
    const prompt = this.buildSocialPostPrompt(restaurant, platform, context);
    
    return this.generate('anthropic', 'claude-3-sonnet-20240229', [
      { 
        role: 'system', 
        content: 'You are an expert restaurant social media marketer. Create engaging, platform-optimized posts that drive engagement and conversions.' 
      },
      { role: 'user', content: prompt }
    ], { 
      temperature: 0.8, 
      max_tokens: 300,
      cache: true 
    });
  }

  /**
   * Personalize email content
   */
  async personalizeEmail(restaurant, baseTemplate) {
    const prompt = this.buildEmailPrompt(restaurant, baseTemplate);
    
    return this.generate('anthropic', 'claude-3-opus-20240229', [
      { 
        role: 'system', 
        content: 'You are an expert B2B email copywriter specializing in restaurant outreach. Create highly personalized, conversion-focused emails.' 
      },
      { role: 'user', content: prompt }
    ], { 
      temperature: 0.9, 
      max_tokens: 1500,
      cache: false // Don't cache personalized emails
    });
  }

  /**
   * Generate menu item description
   */
  async generateMenuDescription(menuItem, restaurant) {
    const prompt = this.buildMenuPrompt(menuItem, restaurant);
    
    return this.generate('openai', 'gpt-4-turbo-preview', [
      { 
        role: 'system', 
        content: 'You are an expert menu copywriter specializing in SEO-optimized, appetizing descriptions that drive orders.' 
      },
      { role: 'user', content: prompt }
    ], { 
      temperature: 0.7, 
      max_tokens: 200,
      cache: true 
    });
  }

  /**
   * Generate onboarding content
   */
  async generateOnboardingContent(restaurant) {
    const prompt = this.buildOnboardingPrompt(restaurant);
    
    return this.generate('anthropic', 'claude-3-opus-20240229', [
      { 
        role: 'system', 
        content: 'You are an expert restaurant onboarding specialist. Create comprehensive, actionable onboarding content.' 
      },
      { role: 'user', content: prompt }
    ], { 
      temperature: 0.8, 
      max_tokens: 2000,
      cache: false 
    });
  }

  /**
   * Generate training module content
   */
  async generateTrainingModule(restaurant, topic) {
    const prompt = this.buildTrainingPrompt(restaurant, topic);
    
    return this.generate('anthropic', 'claude-3-opus-20240229', [
      { 
        role: 'system', 
        content: 'You are an expert training content creator. Create comprehensive, engaging training modules with clear objectives, key points, and practical exercises.' 
      },
      { role: 'user', content: prompt }
    ], { 
      temperature: 0.8, 
      max_tokens: 2500,
      cache: false 
    });
  }

  /**
   * Generate location-specific content
   */
  async syncLocationContent(location, baseContent, restaurant) {
    const prompt = this.buildLocationPrompt(location, baseContent, restaurant);
    
    return this.generate('anthropic', 'claude-3-sonnet-20240229', [
      { 
        role: 'system', 
        content: 'You are an expert at customizing content for specific locations while maintaining brand consistency.' 
      },
      { role: 'user', content: prompt }
    ], { 
      temperature: 0.7, 
      max_tokens: 1000,
      cache: false 
    });
  }

  /**
   * Generate analytics insights
   */
  async generateInsights(restaurant, analytics) {
    const prompt = this.buildInsightsPrompt(restaurant, analytics);
    
    return this.generate('anthropic', 'claude-3-opus-20240229', [
      { 
        role: 'system', 
        content: 'You are an expert restaurant business analyst. Provide actionable insights and recommendations based on performance data.' 
      },
      { role: 'user', content: prompt }
    ], { 
      temperature: 0.7, 
      max_tokens: 1500,
      cache: false 
    });
  }

  /**
   * Recommend image enhancement style
   */
  async recommendImageStyle(restaurant, imageContext) {
    const prompt = this.buildStylePrompt(restaurant, imageContext);
    
    return this.generate('anthropic', 'claude-3-haiku-20240307', [
      { 
        role: 'system', 
        content: 'You are an expert food photographer. Recommend the best enhancement style for restaurant photos.' 
      },
      { role: 'user', content: prompt }
    ], { 
      temperature: 0.5, 
      max_tokens: 100,
      cache: true 
    });
  }

  /**
   * Generate content calendar
   */
  async generateContentCalendar(restaurant, days = 30) {
    const prompt = this.buildCalendarPrompt(restaurant, days);
    
    return this.generate('openai', 'gpt-4-turbo-preview', [
      { 
        role: 'system', 
        content: 'You are an expert social media content strategist. Create engaging, varied content calendars that drive engagement.' 
      },
      { role: 'user', content: prompt }
    ], { 
      temperature: 0.8, 
      max_tokens: 3000,
      cache: false 
    });
  }

  // Prompt building methods
  buildSocialPostPrompt(restaurant, platform, context) {
    return `Create a ${platform} post for ${restaurant.name}:

Restaurant Details:
- Name: ${restaurant.name}
- Cuisine: ${restaurant.cuisine || 'Restaurant'}
- Brand Voice: ${restaurant.brandVoice || 'friendly, professional'}
- Instagram: ${restaurant.instagramHandle ? '@' + restaurant.instagramHandle : 'Not available'}

Context:
${JSON.stringify(context, null, 2)}

Requirements:
- Platform: ${platform} (follow ${platform} best practices)
- Tone: Engaging, authentic, brand-consistent
- Include relevant hashtags (3-5)
- Include a clear call-to-action
- Length: ${platform === 'instagram' ? '1-2 sentences + hashtags' : platform === 'tiktok' ? 'Short and punchy' : '2-3 sentences'}

Generate the post content:`;
  }

  buildEmailPrompt(restaurant, baseTemplate) {
    return `Personalize this email for ${restaurant.name}:

Restaurant Details:
- Name: ${restaurant.name}
- Cuisine: ${restaurant.cuisine || 'Restaurant'}
- Issues: ${restaurant.issues?.join(', ') || 'None identified'}
- Instagram: ${restaurant.instagramHandle ? '@' + restaurant.instagramHandle : 'Not found'}
- Followers: ${restaurant.instagramFollowers || 'Unknown'}
- Location: ${restaurant.address || 'Not specified'}

Base Email Template:
${baseTemplate}

Requirements:
- Make it highly personalized based on their specific situation
- Reference their actual issues/needs
- Keep the core message but make it more engaging
- Add specific value propositions relevant to them
- Maintain professional but friendly tone
- Include clear call-to-action

Generate the personalized email content:`;
  }

  buildMenuPrompt(menuItem, restaurant) {
    return `Write an SEO-optimized, appetizing menu description for:

Menu Item:
- Name: ${menuItem.name}
- Category: ${menuItem.category || 'Main'}
- Ingredients: ${menuItem.ingredients?.join(', ') || 'Not specified'}
- Price: ${menuItem.price || 'Not specified'}

Restaurant:
- Name: ${restaurant.name}
- Cuisine: ${restaurant.cuisine || 'Restaurant'}
- Brand Voice: ${restaurant.brandVoice || 'friendly, professional'}

Requirements:
- SEO-optimized (include relevant keywords naturally)
- Appetizing and descriptive
- Brand-consistent tone
- 2-3 sentences maximum
- Include sensory details (taste, texture, appearance)

Generate the menu description:`;
  }

  buildOnboardingPrompt(restaurant) {
    return `Create comprehensive onboarding content for ${restaurant.name}:

Restaurant Details:
- Name: ${restaurant.name}
- Cuisine: ${restaurant.cuisine || 'Restaurant'}
- Subscription Tier: ${restaurant.subscriptionTier || 'Starter'}
- Locations: ${restaurant.locationCount || 1}

Required Content:
1. Welcome Video Script (2-3 minutes)
   - Welcome message
   - Platform overview
   - Next steps

2. Brand Guidelines Suggestions
   - Color palette recommendations
   - Typography suggestions
   - Tone of voice guidelines
   - Visual style recommendations

3. Initial Social Media Content Calendar (30 days)
   - Daily post ideas
   - Mix of content types (menu highlights, behind-the-scenes, promotions, etc.)
   - Platform-specific recommendations

4. Menu Description Templates
   - Template structure
   - Example descriptions
   - Best practices

5. Training Module Outline
   - Key topics to cover
   - Learning objectives
   - Practical exercises

Generate comprehensive onboarding content:`;
  }

  buildTrainingPrompt(restaurant, topic) {
    return `Create a training module for ${restaurant.name}:

Topic: ${topic}

Restaurant Context:
- Name: ${restaurant.name}
- Cuisine: ${restaurant.cuisine || 'Restaurant'}
- Brand Guidelines: ${JSON.stringify(restaurant.brandGuidelines || {}, null, 2)}
- Subscription Tier: ${restaurant.subscriptionTier || 'Starter'}

Module Requirements:
1. Learning Objectives (3-5 clear objectives)
2. Key Points (detailed breakdown)
3. Practical Exercises (hands-on activities)
4. Quiz Questions (5-10 questions with answers)
5. Resources & References
6. Next Steps

Make it comprehensive, engaging, and practical.`;
  }

  buildLocationPrompt(location, baseContent, restaurant) {
    return `Customize this content for ${location.name}:

Location Details:
- Name: ${location.name}
- Address: ${location.address}
- Local Context: ${location.localContext || 'Standard location'}
- Manager: ${location.managerEmail || 'Not specified'}

Restaurant Brand:
- Name: ${restaurant.name}
- Brand Guidelines: ${JSON.stringify(restaurant.brandGuidelines || {}, null, 2)}

Base Content:
${baseContent}

Requirements:
- Make it location-specific (mention local area, local events, etc.)
- Maintain brand consistency
- Keep core message intact
- Add local relevance
- Professional tone

Generate location-customized content:`;
  }

  buildInsightsPrompt(restaurant, analytics) {
    return `Analyze this restaurant's performance and provide insights:

Restaurant: ${restaurant.name}
Subscription Tier: ${restaurant.subscriptionTier || 'Starter'}

Analytics Data:
${JSON.stringify(analytics, null, 2)}

Provide:
1. Key Insights (3-5 main findings)
2. Strengths (what's working well)
3. Opportunities (areas for improvement)
4. Actionable Recommendations (specific next steps)
5. ROI Analysis (if applicable)

Format as a comprehensive report.`;
  }

  buildStylePrompt(restaurant, imageContext) {
    return `Recommend the best image enhancement style for:

Restaurant: ${restaurant.name}
Cuisine: ${restaurant.cuisine || 'Restaurant'}
Image Context: ${JSON.stringify(imageContext, null, 2)}

Available Styles:
- casual_diner: Bright, friendly, simple plating
- fast_casual: Modern clean plating, vibrant colors
- fine_dining: Dramatic refined lighting, elegant minimal plating
- cafe_bakery: Soft morning window light, airy bright palette
- sushi_japanese: Clean zen composition, natural soft lighting
- mexican_taqueria: Colorful vibrant styling, warm lighting
- bbq_smokehouse: Rich warm moody lighting, rustic wood board
- pizza_italian: Warm inviting trattoria lighting
- bar_sports_grill: Punchy contrast, warm lighting
- upscale_casual: Cinematic side lighting, refined garnish

Recommend the best style (return style name only):`;
  }

  buildCalendarPrompt(restaurant, days) {
    return `Create a ${days}-day social media content calendar for ${restaurant.name}:

Restaurant Details:
- Name: ${restaurant.name}
- Cuisine: ${restaurant.cuisine || 'Restaurant'}
- Brand Voice: ${restaurant.brandVoice || 'friendly, professional'}
- Platforms: Instagram, Facebook, TikTok

Requirements:
- ${days} days of content
- Mix of content types:
  * Menu highlights (30%)
  * Behind-the-scenes (20%)
  * Promotions/specials (20%)
  * Customer testimonials (10%)
  * Educational content (10%)
  * Seasonal/holiday content (10%)
- Include post captions
- Include hashtag suggestions
- Platform-specific recommendations
- Engagement strategies

Generate the content calendar:`;
  }

  /**
   * Clear cache (useful for testing)
   */
  clearCache() {
    cache.clear();
  }
}

module.exports = new AIGateway();
