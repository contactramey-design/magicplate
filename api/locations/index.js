// Multi-Location Management API
const express = require('express');
const router = express.Router();
const { findAll, findById, insert, update } = require('../../lib/db');

// GET /api/locations/:restaurant_id - List all locations for a restaurant
router.get('/:restaurant_id', async (req, res) => {
  try {
    const { restaurant_id } = req.params;
    const locations = await findAll('locations', { restaurant_id: parseInt(restaurant_id) }, 'created_at DESC');
    
    res.json({
      restaurant_id: parseInt(restaurant_id),
      locations,
      total: locations.length
    });
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({ error: 'Failed to fetch locations' });
  }
});

// POST /api/locations/:restaurant_id - Create new location
router.post('/:restaurant_id', async (req, res) => {
  try {
    const { restaurant_id } = req.params;
    const { name, address, city, state, zip_code, phone, manager_email, settings } = req.body;
    
    if (!name || !address) {
      return res.status(400).json({ error: 'name and address are required' });
    }
    
    const location = await insert('locations', {
      restaurant_id: parseInt(restaurant_id),
      name,
      address,
      city: city || null,
      state: state || null,
      zip_code: zip_code || null,
      phone: phone || null,
      manager_email: manager_email || null,
      settings: settings || {}
    });
    
    res.json({
      ...location,
      message: 'Location created successfully'
    });
  } catch (error) {
    console.error('Error creating location:', error);
    res.status(500).json({ error: 'Failed to create location' });
  }
});

// PUT /api/locations/:location_id - Update location
router.put('/:location_id', async (req, res) => {
  try {
    const { location_id } = req.params;
    const location = await findById('locations', location_id, 'location_id');
    
    if (!location) {
      return res.status(404).json({ error: 'Location not found' });
    }
    
    const updated = await update('locations', location_id, req.body, 'location_id');
    
    res.json({
      ...updated,
      message: 'Location updated successfully'
    });
  } catch (error) {
    console.error('Error updating location:', error);
    res.status(500).json({ error: 'Failed to update location' });
  }
});

// POST /api/locations/:location_id/sync - Sync content to location
router.post('/:location_id/sync', async (req, res) => {
  try {
    const { location_id } = req.params;
    const { content_type, content_id } = req.body;
    
    // TODO: Implement content synchronization
    // Push content from restaurant level to location
    
    res.json({
      location_id,
      content_type,
      content_id,
      synced_at: new Date().toISOString(),
      message: 'Content synced successfully'
    });
  } catch (error) {
    console.error('Error syncing content:', error);
    res.status(500).json({ error: 'Failed to sync content' });
  }
});

// GET /api/locations/:location_id/customize - Get location-specific customizations
router.get('/:location_id/customize', async (req, res) => {
  try {
    const { location_id } = req.params;
    // TODO: Fetch location-specific settings
    res.json({
      location_id,
      customizations: {
        local_specials: [],
        hours: null,
        menu_overrides: []
      }
    });
  } catch (error) {
    console.error('Error fetching customizations:', error);
    res.status(500).json({ error: 'Failed to fetch customizations' });
  }
});

module.exports = router;
