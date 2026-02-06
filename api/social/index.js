// Social Media API Routes
const express = require('express');
const router = express.Router();
const { createPost, generateAndCreatePost, schedulePost, publishPost, listPosts } = require('./posts');

// POST /api/social/posts - Create new post
router.post('/posts', async (req, res) => {
  try {
    const { restaurant_id, platform, content, image_url, video_url, scheduled_time } = req.body;
    
    if (!restaurant_id || !platform || !content) {
      return res.status(400).json({ error: 'restaurant_id, platform, and content are required' });
    }
    
    const post = await createPost({
      restaurant_id,
      platform,
      content,
      image_url,
      video_url,
      scheduled_time
    });
    
    res.json({
      ...post,
      message: 'Post created successfully'
    });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: error.message || 'Failed to create post' });
  }
});

// POST /api/social/generate - Generate AI post
router.post('/generate', async (req, res) => {
  try {
    const { restaurant_id, platform, post_type, context } = req.body;
    
    if (!restaurant_id || !platform || !post_type) {
      return res.status(400).json({ error: 'restaurant_id, platform, and post_type are required' });
    }
    
    const post = await generateAndCreatePost({
      restaurant_id,
      platform,
      post_type,
      context: context || {}
    });
    
    res.json({
      ...post,
      message: 'AI post generated and created successfully'
    });
  } catch (error) {
    console.error('Error generating post:', error);
    res.status(500).json({ error: error.message || 'Failed to generate post' });
  }
});

// POST /api/social/schedule - Schedule a post
router.post('/schedule', async (req, res) => {
  try {
    const { post_id, scheduled_time } = req.body;
    
    if (!post_id || !scheduled_time) {
      return res.status(400).json({ error: 'post_id and scheduled_time are required' });
    }
    
    const post = await schedulePost(post_id, scheduled_time);
    res.json({
      ...post,
      message: 'Post scheduled successfully'
    });
  } catch (error) {
    console.error('Error scheduling post:', error);
    res.status(500).json({ error: error.message || 'Failed to schedule post' });
  }
});

// POST /api/social/publish/:post_id - Publish a post
router.post('/publish/:post_id', async (req, res) => {
  try {
    const { post_id } = req.params;
    const post = await publishPost(post_id);
    
    res.json({
      ...post,
      message: 'Post published successfully'
    });
  } catch (error) {
    console.error('Error publishing post:', error);
    res.status(500).json({ error: error.message || 'Failed to publish post' });
  }
});

// GET /api/social/posts/:restaurant_id - List posts
router.get('/posts/:restaurant_id', async (req, res) => {
  try {
    const { restaurant_id } = req.params;
    const { platform, status } = req.query;
    
    const posts = await listPosts(restaurant_id, { platform, status });
    
    res.json({
      restaurant_id: parseInt(restaurant_id),
      posts,
      total: posts.length
    });
  } catch (error) {
    console.error('Error listing posts:', error);
    res.status(500).json({ error: 'Failed to list posts' });
  }
});

module.exports = router;
