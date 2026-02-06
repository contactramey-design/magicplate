// Branding API Routes
const express = require('express');
const router = express.Router();
const { getBrandGuidelines, updateBrandGuidelines, validateContent } = require('./guidelines');

// GET /api/branding/:restaurant_id/guidelines
router.get('/:restaurant_id/guidelines', async (req, res) => {
  try {
    const { restaurant_id } = req.params;
    const guidelines = await getBrandGuidelines(restaurant_id);
    res.json(guidelines);
  } catch (error) {
    console.error('Error fetching guidelines:', error);
    res.status(500).json({ error: 'Failed to fetch brand guidelines' });
  }
});

// PUT /api/branding/:restaurant_id/guidelines
router.put('/:restaurant_id/guidelines', async (req, res) => {
  try {
    const { restaurant_id } = req.params;
    const guidelines = await updateBrandGuidelines(restaurant_id, req.body);
    res.json(guidelines);
  } catch (error) {
    console.error('Error updating guidelines:', error);
    res.status(500).json({ error: 'Failed to update brand guidelines' });
  }
});

// POST /api/branding/:restaurant_id/validate
router.post('/:restaurant_id/validate', async (req, res) => {
  try {
    const { restaurant_id } = req.params;
    const validation = await validateContent(restaurant_id, req.body);
    res.json(validation);
  } catch (error) {
    console.error('Error validating content:', error);
    res.status(500).json({ error: 'Failed to validate content' });
  }
});

// GET /api/branding/:restaurant_id/templates
router.get('/:restaurant_id/templates', async (req, res) => {
  try {
    const { restaurant_id } = req.params;
    // TODO: Fetch templates from database
    res.json({
      restaurant_id,
      templates: []
    });
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

module.exports = router;
