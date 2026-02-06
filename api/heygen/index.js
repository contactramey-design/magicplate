// HeyGen API Routes
// Main router for HeyGen integration endpoints

const express = require('express');
const router = express.Router();
const { createRestaurantAvatar, getAvatarDetails, listRestaurantAvatars } = require('./create-avatar');
const { generateVideo, getVideoStatus, generateWelcomeVideo, generateTrainingVideo, generatePromotionalVideo } = require('./generate-video');

// POST /api/heygen/create-avatar - Create restaurant avatar
router.post('/create-avatar', async (req, res) => {
  try {
    const { restaurant_id, avatar_name, base_avatar_id } = req.body;

    if (!restaurant_id) {
      return res.status(400).json({ error: 'restaurant_id is required' });
    }

    const result = await createRestaurantAvatar({
      restaurant_id,
      avatar_name: avatar_name || `Avatar for Restaurant ${restaurant_id}`,
      base_avatar_id
    });

    res.json(result);
  } catch (error) {
    console.error('Error in create-avatar:', error);
    res.status(500).json({ error: error.message || 'Failed to create avatar' });
  }
});

// GET /api/heygen/avatar/:id - Get avatar details
router.get('/avatar/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const details = await getAvatarDetails(id);
    res.json(details);
  } catch (error) {
    console.error('Error fetching avatar:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch avatar' });
  }
});

// GET /api/heygen/restaurant/:restaurant_id/avatars - List restaurant avatars
router.get('/restaurant/:restaurant_id/avatars', async (req, res) => {
  try {
    const { restaurant_id } = req.params;
    const avatars = await listRestaurantAvatars(restaurant_id);
    res.json({ restaurant_id, avatars });
  } catch (error) {
    console.error('Error listing avatars:', error);
    res.status(500).json({ error: error.message || 'Failed to list avatars' });
  }
});

// POST /api/heygen/generate-video - Generate video
router.post('/generate-video', async (req, res) => {
  try {
    const { avatar_id, script, video_type, metadata } = req.body;

    if (!avatar_id || !script) {
      return res.status(400).json({ error: 'avatar_id and script are required' });
    }

    const result = await generateVideo({
      avatar_id,
      script,
      video_type: video_type || 'welcome',
      metadata: metadata || {}
    });

    res.json(result);
  } catch (error) {
    console.error('Error generating video:', error);
    res.status(500).json({ error: error.message || 'Failed to generate video' });
  }
});

// GET /api/heygen/video/:id - Get video status
router.get('/video/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const status = await getVideoStatus(id);
    res.json(status);
  } catch (error) {
    console.error('Error fetching video status:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch video status' });
  }
});

// POST /api/heygen/welcome-video - Generate welcome video
router.post('/welcome-video', async (req, res) => {
  try {
    const { restaurant_id, restaurant_name, avatar_id, custom_script } = req.body;

    if (!restaurant_id || !restaurant_name || !avatar_id) {
      return res.status(400).json({ error: 'restaurant_id, restaurant_name, and avatar_id are required' });
    }

    const result = await generateWelcomeVideo({
      restaurant_id,
      restaurant_name,
      avatar_id,
      custom_script
    });

    res.json(result);
  } catch (error) {
    console.error('Error generating welcome video:', error);
    res.status(500).json({ error: error.message || 'Failed to generate welcome video' });
  }
});

// POST /api/heygen/training-video - Generate training video
router.post('/training-video', async (req, res) => {
  try {
    const { module_id, title, content, avatar_id } = req.body;

    if (!module_id || !title || !content || !avatar_id) {
      return res.status(400).json({ error: 'module_id, title, content, and avatar_id are required' });
    }

    const result = await generateTrainingVideo({
      module_id,
      title,
      content,
      avatar_id
    });

    res.json(result);
  } catch (error) {
    console.error('Error generating training video:', error);
    res.status(500).json({ error: error.message || 'Failed to generate training video' });
  }
});

// POST /api/heygen/promotional-video - Generate promotional video
router.post('/promotional-video', async (req, res) => {
  try {
    const { restaurant_id, promotion_text, avatar_id } = req.body;

    if (!restaurant_id || !promotion_text || !avatar_id) {
      return res.status(400).json({ error: 'restaurant_id, promotion_text, and avatar_id are required' });
    }

    const result = await generatePromotionalVideo({
      restaurant_id,
      promotion_text,
      avatar_id
    });

    res.json(result);
  } catch (error) {
    console.error('Error generating promotional video:', error);
    res.status(500).json({ error: error.message || 'Failed to generate promotional video' });
  }
});

// GET /api/heygen/templates - List video templates
router.get('/templates', async (req, res) => {
  try {
    // Return predefined video templates
    const templates = [
      {
        template_id: 'welcome',
        name: 'Welcome Video',
        description: 'Standard welcome video for new customers',
        script_template: 'Hi there! Welcome to {{restaurant_name}}. I\'m your virtual host...'
      },
      {
        template_id: 'menu_highlight',
        name: 'Menu Highlight',
        description: 'Highlight a specific menu item',
        script_template: 'Today we\'re featuring {{item_name}}. {{item_description}}...'
      },
      {
        template_id: 'promotion',
        name: 'Promotion Announcement',
        description: 'Announce a special promotion or offer',
        script_template: 'Great news! {{promotion_details}}...'
      },
      {
        template_id: 'training_onboarding',
        name: 'Staff Onboarding',
        description: 'Training video for new staff members',
        script_template: 'Welcome to the team! Today we\'ll cover {{topic}}...'
      }
    ];

    res.json({ templates });
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

module.exports = router;
