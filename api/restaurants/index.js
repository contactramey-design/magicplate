// Restaurant Management API
// Handles restaurant CRUD, onboarding workflow

const express = require('express');
const router = express.Router();
const { findAll, findById, insert, update, queryMany } = require('../../lib/db');
const { setupRestaurantAvatar } = require('../../scripts/setup-restaurant-avatar');

// GET /api/restaurants - List all restaurants
router.get('/', async (req, res) => {
  try {
    const { subscription_tier, status, limit = 50, offset = 0 } = req.query;
    
    const conditions = {};
    if (subscription_tier) conditions.subscription_tier = subscription_tier;
    if (status) conditions.status = status;
    
    const restaurants = await findAll('restaurants', conditions, 'created_at DESC', parseInt(limit), parseInt(offset));
    const total = restaurants.length;
    
    res.json({
      restaurants,
      total,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    res.status(500).json({ error: 'Failed to fetch restaurants' });
  }
});

// POST /api/restaurants - Create new restaurant
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, website, subscription_tier = 'starter' } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({ error: 'name and email are required' });
    }
    
    if (!['starter', 'professional', 'enterprise'].includes(subscription_tier)) {
      return res.status(400).json({ error: 'Invalid subscription_tier' });
    }
    
    const restaurant = await insert('restaurants', {
      name,
      email,
      phone: phone || null,
      website: website || null,
      subscription_tier,
      location_count: 1,
      status: 'active'
    });
    
    res.json({
      ...restaurant,
      message: 'Restaurant created successfully'
    });
  } catch (error) {
    console.error('Error creating restaurant:', error);
    res.status(500).json({ error: 'Failed to create restaurant' });
  }
});

// GET /api/restaurants/:id - Get restaurant details
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const restaurant = await findById('restaurants', id, 'restaurant_id');
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }
    
    // Get related data
    const [locations, subscriptions, brandGuidelines] = await Promise.all([
      findAll('locations', { restaurant_id: id }),
      findAll('subscriptions', { restaurant_id: id, status: 'active' }),
      findAll('brand_guidelines', { restaurant_id: id })
    ]);
    
    res.json({
      ...restaurant,
      locations,
      subscription: subscriptions[0] || null,
      brand_guidelines: brandGuidelines[0] || null
    });
  } catch (error) {
    console.error('Error fetching restaurant:', error);
    res.status(500).json({ error: 'Failed to fetch restaurant' });
  }
});

// PUT /api/restaurants/:id - Update restaurant
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const restaurant = await findById('restaurants', id, 'restaurant_id');
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }
    
    // Validate subscription_tier if being updated
    if (updates.subscription_tier && !['starter', 'professional', 'enterprise'].includes(updates.subscription_tier)) {
      return res.status(400).json({ error: 'Invalid subscription_tier' });
    }
    
    const updated = await update('restaurants', id, updates, 'restaurant_id');
    
    res.json({
      ...updated,
      message: 'Restaurant updated successfully'
    });
  } catch (error) {
    console.error('Error updating restaurant:', error);
    res.status(500).json({ error: 'Failed to update restaurant' });
  }
});

// POST /api/restaurants/:id/onboard - Onboarding workflow
router.post('/:id/onboard', async (req, res) => {
  try {
    const { id } = req.params;
    const { setup_avatar = false, create_welcome_video = false, base_avatar_id = null } = req.body;
    
    const restaurant = await findById('restaurants', id, 'restaurant_id');
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }
    
    const onboardingSteps = [];
    
    // Step 1: Create default subscription if doesn't exist
    const existingSubscriptions = await findAll('subscriptions', { restaurant_id: id, status: 'active' });
    if (existingSubscriptions.length === 0) {
      const subscription = await insert('subscriptions', {
        restaurant_id: id,
        tier: restaurant.subscription_tier || 'starter',
        status: 'active',
        billing_cycle: 'monthly',
        renewal_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      });
      onboardingSteps.push({ step: 'subscription_created', status: 'completed', subscription_id: subscription.subscription_id });
    }
    
    // Step 2: Set up HeyGen avatar (if requested)
    let avatarResult = null;
    if (setup_avatar) {
      try {
        avatarResult = await setupRestaurantAvatar({
          restaurant_id: id,
          restaurant_name: restaurant.name,
          base_avatar_id: base_avatar_id || process.env.HEYGEN_BASE_AVATAR_ID,
          create_welcome_video: create_welcome_video
        });
        onboardingSteps.push({ step: 'avatar_created', status: 'completed', avatar_id: avatarResult.avatar?.avatar_id });
      } catch (error) {
        console.error('Avatar setup error:', error);
        onboardingSteps.push({ step: 'avatar_created', status: 'failed', error: error.message });
      }
    }
    
    // Step 3: Create initial brand guidelines
    const existingGuidelines = await findAll('brand_guidelines', { restaurant_id: id });
    if (existingGuidelines.length === 0) {
      const guidelines = await insert('brand_guidelines', {
        restaurant_id: id,
        colors: { primary: '#4caf50', secondary: '#66bb6a', accent: '#ffffff' },
        fonts: { heading: 'Inter', body: 'Inter' },
        tone: 'professional'
      });
      onboardingSteps.push({ step: 'brand_guidelines_created', status: 'completed', guideline_id: guidelines.guideline_id });
    }
    
    // Step 4: Set up first location if doesn't exist
    const existingLocations = await findAll('locations', { restaurant_id: id });
    if (existingLocations.length === 0) {
      const location = await insert('locations', {
        restaurant_id: id,
        name: `${restaurant.name} - Main Location`,
        settings: {}
      });
      onboardingSteps.push({ step: 'location_created', status: 'completed', location_id: location.location_id });
    }
    
    res.json({
      restaurant_id: id,
      onboarding_status: 'completed',
      steps: onboardingSteps,
      avatar: avatarResult?.avatar || null,
      welcome_video: avatarResult?.welcome_video || null,
      message: 'Onboarding workflow completed'
    });
  } catch (error) {
    console.error('Error in onboarding:', error);
    res.status(500).json({ error: 'Failed to start onboarding workflow' });
  }
});

module.exports = router;
