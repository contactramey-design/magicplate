// Cron Jobs API
// Handles scheduled tasks for automation

const express = require('express');
const router = express.Router();
const { runScheduledTasks, publishScheduledPosts, sendScheduledCampaigns } = require('./publish-scheduled');

// POST /api/cron/run - Run all scheduled tasks (for Vercel Cron)
router.post('/run', async (req, res) => {
  try {
    const results = await runScheduledTasks();
    res.json({
      success: true,
      results,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error running cron tasks:', error);
    res.status(500).json({ error: 'Failed to run scheduled tasks' });
  }
});

// POST /api/cron/posts - Publish scheduled posts
router.post('/posts', async (req, res) => {
  try {
    const results = await publishScheduledPosts();
    res.json({
      success: true,
      ...results,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error publishing posts:', error);
    res.status(500).json({ error: 'Failed to publish scheduled posts' });
  }
});

// POST /api/cron/campaigns - Send scheduled campaigns
router.post('/campaigns', async (req, res) => {
  try {
    const results = await sendScheduledCampaigns();
    res.json({
      success: true,
      ...results,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error sending campaigns:', error);
    res.status(500).json({ error: 'Failed to send scheduled campaigns' });
  }
});

module.exports = router;
