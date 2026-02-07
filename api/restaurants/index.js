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

// POST /api/restaurants/:id/onboard - Onboarding workflow with AI Gateway
router.post('/:id/onboard', require('./onboard'));

module.exports = router;
