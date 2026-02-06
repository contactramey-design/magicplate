// Franchise Training System API
const express = require('express');
const router = express.Router();
const { generateTrainingVideo } = require('../heygen/generate-video');

// GET /api/training/modules - List training modules
router.get('/modules', async (req, res) => {
  try {
    const { restaurant_id } = req.query;
    // TODO: Fetch modules from database
    res.json({
      restaurant_id,
      modules: []
    });
  } catch (error) {
    console.error('Error fetching modules:', error);
    res.status(500).json({ error: 'Failed to fetch training modules' });
  }
});

// POST /api/training/modules - Create training module
router.post('/modules', async (req, res) => {
  try {
    const { restaurant_id, title, description, content, module_type, avatar_id } = req.body;
    
    if (!restaurant_id || !title || !content) {
      return res.status(400).json({ error: 'restaurant_id, title, and content are required' });
    }
    
    // TODO: Create module in database
    // If avatar_id provided, generate video
    let video_result = null;
    if (avatar_id) {
      try {
        video_result = await generateTrainingVideo({
          module_id: 'new_module_id',
          title,
          content,
          avatar_id
        });
      } catch (videoError) {
        console.error('Error generating training video:', videoError);
        // Continue without video
      }
    }
    
    res.json({
      module_id: 'new_id',
      restaurant_id,
      title,
      module_type: module_type || 'custom',
      video: video_result,
      message: 'Training module created successfully'
    });
  } catch (error) {
    console.error('Error creating module:', error);
    res.status(500).json({ error: 'Failed to create training module' });
  }
});

// POST /api/training/:module_id/generate-video - Generate video for existing module
router.post('/:module_id/generate-video', async (req, res) => {
  try {
    const { module_id } = req.params;
    const { avatar_id } = req.body;
    
    if (!avatar_id) {
      return res.status(400).json({ error: 'avatar_id is required' });
    }
    
    // TODO: Fetch module from database
    const module = {
      title: 'Sample Module',
      content: 'Sample content'
    };
    
    const video_result = await generateTrainingVideo({
      module_id,
      title: module.title,
      content: module.content,
      avatar_id
    });
    
    // TODO: Update module with video URL
    
    res.json({
      module_id,
      video: video_result,
      message: 'Training video generated successfully'
    });
  } catch (error) {
    console.error('Error generating training video:', error);
    res.status(500).json({ error: 'Failed to generate training video' });
  }
});

// GET /api/training/:location_id/progress - Get training progress for location
router.get('/:location_id/progress', async (req, res) => {
  try {
    const { location_id } = req.params;
    // TODO: Fetch progress from database
    res.json({
      location_id,
      modules_completed: 0,
      total_modules: 0,
      progress_percentage: 0,
      employees: []
    });
  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({ error: 'Failed to fetch training progress' });
  }
});

module.exports = router;
