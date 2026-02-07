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
   * Generate comprehensive SEO-optimized menu description with location targeting
   */
  async generateSEOOptimizedDescription(menuItem, restaurant, location) {
    const prompt = this.buildSEOPrompt(menuItem, restaurant, location);
    
    try {
      const response = await this.generate('anthropic', 'claude-3-opus-20240229', [
        { 
          role: 'system', 
          content: 'You are an expert SEO content writer specializing in restaurant menu optimization for local search. Generate descriptions that rank well in Google while being authentic and appetizing. Always return valid JSON.' 
        },
        { role: 'user', content: prompt }
      ], { 
        temperature: 0.7, 
        max_tokens: 800,
        cache: false 
      });

      // Try to parse as JSON first
      try {
        return JSON.parse(response);
      } catch {
        // If not JSON, create structured response
        return {
          description: response,
          keywords: this.extractKeywords(response, location),
          seo_score: this.calculateSEOScore(response),
          meta_description: response.substring(0, 155),
          alt_text: `Photo of ${menuItem.name} at ${restaurant.name || 'restaurant'}`,
          structured_data: this.generateStructuredData(menuItem, restaurant),
          improvements: this.identifyImprovements(response, menuItem.description || '')
        };
      }
    } catch (error) {
      console.error('AI Gateway SEO error:', error);
      throw error;
    }
  }

  /**
   * Generate SEO-friendly review response
   */
  async generateReviewResponse(restaurant, reviewText, rating) {
    const prompt = `Generate a professional, SEO-friendly response to this customer review for ${restaurant.name}:

Review: "${reviewText}"
Rating: ${rating} stars
Cuisine: ${restaurant.cuisine || 'General'}
Location: ${restaurant.address || 'Not specified'}

Requirements:
- Professional and authentic tone
- Thank the customer
- Address specific concerns if rating < 4
- Include location/cuisine keywords naturally (e.g., "best [cuisine] in [location]")
- Keep under 200 characters
- Encourage return visits
- SEO-optimized language that helps with local search`;

    return this.generate('anthropic', 'claude-3-sonnet-20240229', [
      { 
        role: 'system', 
        content: 'You are an expert in customer service and SEO. Generate review responses that are professional, authentic, and SEO-friendly for local search.' 
      },
      { role: 'user', content: prompt }
    ], { 
      temperature: 0.7, 
      max_tokens: 250,
      cache: false 
    });
  }

  /**
   * Generate citation content for local directories
   */
  async generateCitationContent(restaurant, directory) {
    const prompt = `Generate optimized business listing content for ${restaurant.name} for ${directory}:

Restaurant Details:
- Name: ${restaurant.name}
- Cuisine: ${restaurant.cuisine || 'General'}
- Address: ${restaurant.address || 'Not specified'}
- Description: ${restaurant.description || 'Not specified'}
- Phone: ${restaurant.phone || 'Not specified'}

Requirements for ${directory}:
- Business description (150-300 characters, SEO-optimized)
- Categories/tags (3-5 relevant categories)
- Keywords for local SEO (include location, cuisine type)
- Call-to-action
- Format as JSON with keys: description, categories, keywords, call_to_action`;

    const response = await this.generate('anthropic', 'claude-3-sonnet-20240229', [
      { 
        role: 'system', 
        content: 'You are an expert in local SEO and business directory optimization. Generate content that helps restaurants rank in local search results.' 
      },
      { role: 'user', content: prompt }
    ], { 
      temperature: 0.7, 
      max_tokens: 500,
      cache: false 
    });

    try {
      return JSON.parse(response);
    } catch {
      return {
        description: response,
        categories: [restaurant.cuisine || 'Restaurant', 'Dining', 'Food Service'],
        keywords: this.extractKeywords(response, restaurant.address || ''),
        call_to_action: `Visit ${restaurant.name} for the best ${restaurant.cuisine || 'dining'} experience!`
      };
    }
  }

  /**
   * Build SEO optimization prompt
   */
  buildSEOPrompt(menuItem, restaurant, location) {
    return `Generate a comprehensive SEO-optimized description for this menu item:

Menu Item: ${menuItem.name}
Current Description: ${menuItem.description || 'None'}
Ingredients: ${menuItem.ingredients?.join(', ') || 'Not specified'}
Price: $${menuItem.price || 'N/A'}
Category: ${menuItem.category || 'Main'}

Restaurant Details:
- Name: ${restaurant.name || 'Restaurant'}
- Cuisine: ${restaurant.cuisine || 'General'}
- Location: ${location || restaurant.address || 'Not specified'}

Requirements:
1. Description (under 150 characters for snippets, 2-3 sentences max)
2. Include location-specific keywords (city, neighborhood, region) naturally
3. Include cuisine type and dietary information if applicable
4. Use high-intent keywords like "best [item] in [location]", "fresh", "locally sourced"
5. Make it appetizing and authentic
6. Include structured data (JSON-LD schema for MenuItem)
7. Generate meta description (under 155 characters)
8. Generate alt text for images
9. Calculate SEO score (0-100)
10. List improvements made

Return as JSON:
{
  "description": "SEO-optimized description here",
  "keywords": ["keyword1", "keyword2"],
  "seo_score": 85,
  "improvements": ["Added location keywords", "Included cuisine type"],
  "meta_description": "Meta description under 155 chars",
  "alt_text": "Alt text for image",
  "structured_data": {
    "@context": "https://schema.org",
    "@type": "MenuItem",
    ...
  }
}`;
  }

  /**
   * Extract keywords from text
   */
  extractKeywords(text, location) {
    if (!text) return [];
    const keywords = [];
    
    // Add location keywords
    if (location) {
      const locationParts = location.split(',').map(p => p.trim()).filter(p => p);
      keywords.push(...locationParts);
    }
    
    // Add common SEO keywords
    const commonKeywords = ['best', 'fresh', 'local', 'authentic', 'delicious', 'homemade', 'handmade', 'artisan'];
    commonKeywords.forEach(kw => {
      if (text.toLowerCase().includes(kw)) keywords.push(kw);
    });
    
    // Add cuisine-related keywords if present
    const cuisineKeywords = ['italian', 'mexican', 'american', 'asian', 'mediterranean', 'bbq', 'seafood'];
    cuisineKeywords.forEach(kw => {
      if (text.toLowerCase().includes(kw)) keywords.push(kw);
    });
    
    return [...new Set(keywords)];
  }

  /**
   * Calculate SEO score (0-100)
   */
  calculateSEOScore(description) {
    if (!description) return 0;
    
    let score = 0;
    const desc = description.toLowerCase();
    
    // Length optimization (20 points)
    if (description.length <= 150) score += 20;
    else if (description.length <= 200) score += 15;
    else if (description.length <= 250) score += 10;
    
    if (description.length >= 50) score += 10;
    
    // Keyword presence (30 points)
    if (desc.match(/best|fresh|local|authentic/i)) score += 15;
    if (desc.match(/\d+/) && desc.match(/\$/)) score += 10; // Price mention
    if (desc.split(' ').length >= 10) score += 5; // Sufficient length
    
    // Location mention (20 points)
    if (description.match(/in [A-Z][a-z]+/)) score += 20;
    else if (description.match(/near [A-Z][a-z]+/)) score += 15;
    
    // Dietary/health keywords (10 points)
    if (desc.match(/gluten-free|vegan|vegetarian|organic|healthy/i)) score += 10;
    
    // Descriptive adjectives (10 points)
    const adjectives = ['crispy', 'tender', 'juicy', 'aromatic', 'savory', 'sweet', 'spicy'];
    const foundAdjectives = adjectives.filter(adj => desc.includes(adj));
    score += Math.min(10, foundAdjectives.length * 2);
    
    // Call to action (10 points)
    if (desc.match(/try|order|visit|enjoy|taste/i)) score += 10;
    
    return Math.min(100, score);
  }

  /**
   * Generate structured data (JSON-LD)
   */
  generateStructuredData(menuItem, restaurant) {
    return {
      "@context": "https://schema.org",
      "@type": "MenuItem",
      "name": menuItem.name,
      "description": menuItem.description || '',
      "offers": {
        "@type": "Offer",
        "price": menuItem.price || "0",
        "priceCurrency": "USD"
      },
      "menuAddOn": restaurant.name || "Restaurant",
      "nutrition": menuItem.nutrition || undefined
    };
  }

  /**
   * Identify improvements made
   */
  identifyImprovements(newDescription, oldDescription) {
    const improvements = [];
    
    if (!oldDescription) {
      improvements.push('Created new SEO-optimized description');
    } else {
      if (newDescription.length < oldDescription.length) {
        improvements.push('Optimized length for search snippets');
      }
      if (newDescription.match(/best|fresh|local/i) && !oldDescription.match(/best|fresh|local/i)) {
        improvements.push('Added high-intent SEO keywords');
      }
      if (newDescription.match(/in [A-Z][a-z]+/) && !oldDescription.match(/in [A-Z][a-z]+/)) {
        improvements.push('Added location-specific keywords');
      }
    }
    
    if (newDescription.match(/gluten-free|vegan|vegetarian/i)) {
      improvements.push('Included dietary information');
    }
    
    return improvements.length > 0 ? improvements : ['SEO optimization applied'];
  }

  /**
   * Generate SEO recommendations based on analytics
   */
  async generateSEORecommendations(restaurant, metrics) {
    const prompt = `Analyze this restaurant's SEO performance and provide actionable recommendations:

Restaurant: ${restaurant.name}
Cuisine: ${restaurant.cuisine || 'General'}
Location: ${restaurant.address || 'Not specified'}

Current SEO Metrics:
- Items Optimized: ${metrics.items_optimized || 0}
- Average SEO Score: ${metrics.average_seo_score || 0}
- Keywords Targeted: ${metrics.keywords_targeted?.length || 0}
- Citations Completed: ${metrics.citations_completed || 0}
- Google Business Updated: ${metrics.google_business_updated ? 'Yes' : 'No'}

Provide 5-7 specific, actionable SEO recommendations to improve local search visibility and rankings.`;

    return this.generate('anthropic', 'claude-3-opus-20240229', [
      { 
        role: 'system', 
        content: 'You are an expert SEO consultant specializing in local restaurant marketing. Provide specific, actionable recommendations.' 
      },
      { role: 'user', content: prompt }
    ], { 
      temperature: 0.7, 
      max_tokens: 800,
      cache: false 
    });
  }

  /**
   * Clear cache (useful for testing)
   */
  clearCache() {
    cache.clear();
  }
}

module.exports = new AIGateway();
