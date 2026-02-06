// Email Marketing API Routes
const express = require('express');
const router = express.Router();
const { createCampaign, sendCampaign, listCampaigns } = require('./campaigns');

// POST /api/email/campaigns - Create campaign
router.post('/campaigns', async (req, res) => {
  try {
    const { restaurant_id, name, subject, template_id, recipients, scheduled_time } = req.body;
    
    if (!restaurant_id || !name || !subject) {
      return res.status(400).json({ error: 'restaurant_id, name, and subject are required' });
    }
    
    const campaign = await createCampaign({
      restaurant_id,
      name,
      subject,
      template_id,
      recipients: recipients || [],
      scheduled_time
    });
    
    res.json({
      ...campaign,
      message: 'Campaign created successfully'
    });
  } catch (error) {
    console.error('Error creating campaign:', error);
    res.status(500).json({ error: error.message || 'Failed to create campaign' });
  }
});

// POST /api/email/campaigns/:id/send - Send campaign
router.post('/campaigns/:id/send', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await sendCampaign(id);
    
    res.json({
      ...result,
      message: `Campaign sent to ${result.sent_count} recipients`
    });
  } catch (error) {
    console.error('Error sending campaign:', error);
    res.status(500).json({ error: error.message || 'Failed to send campaign' });
  }
});

// GET /api/email/campaigns/:restaurant_id - List campaigns
router.get('/campaigns/:restaurant_id', async (req, res) => {
  try {
    const { restaurant_id } = req.params;
    const campaigns = await listCampaigns(restaurant_id);
    
    res.json({
      restaurant_id: parseInt(restaurant_id),
      campaigns,
      total: campaigns.length
    });
  } catch (error) {
    console.error('Error listing campaigns:', error);
    res.status(500).json({ error: 'Failed to list campaigns' });
  }
});

module.exports = router;
