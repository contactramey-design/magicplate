// Social Media Post Management
// Handles post creation, scheduling, and publishing

const { insert, findById, findAll, update, queryMany } = require('../../lib/db');
const { trackUsage, checkUsageLimit } = require('../../lib/usage-tracker');
const { generateSocialPost } = require('../marketing/social/generate-post');

// Tier limits
const TIER_LIMITS = {
  starter: { social_posts: 5 },
  professional: { social_posts: -1 },
  enterprise: { social_posts: -1 }
};

/**
 * Create a social media post
 * @param {Object} params - Post creation parameters
 * @param {number} params.restaurant_id - Restaurant ID
 * @param {string} params.platform - Platform (instagram, facebook, tiktok, twitter)
 * @param {string} params.content - Post content
 * @param {string} params.image_url - Image URL (optional)
 * @param {string} params.video_url - Video URL (optional)
 * @param {Date} params.scheduled_time - Scheduled time (optional, for immediate posting)
 * @returns {Promise<Object>} Created post
 */
async function createPost({ restaurant_id, platform, content, image_url = null, video_url = null, scheduled_time = null }) {
  // Get subscription
  const subscriptions = await findAll('subscriptions', {
    restaurant_id: parseInt(restaurant_id),
    status: 'active'
  });
  
  if (subscriptions.length === 0) {
    throw new Error('No active subscription found');
  }
  
  const subscription = subscriptions[0];
  const limits = TIER_LIMITS[subscription.tier] || {};
  
  // Check limit if not unlimited
  if (limits.social_posts !== -1) {
    const usageCheck = await checkUsageLimit(
      subscription.subscription_id,
      'social_posts',
      limits
    );
    
    if (!usageCheck.allowed) {
      throw new Error(`Social post limit reached. ${limits.social_posts} posts/month allowed on ${subscription.tier} plan.`);
    }
  }
  
  // Create post
  const post = await insert('social_posts', {
    restaurant_id: parseInt(restaurant_id),
    platform,
    content,
    image_url: image_url || null,
    video_url: video_url || null,
    scheduled_time: scheduled_time ? new Date(scheduled_time).toISOString() : null,
    status: scheduled_time ? 'scheduled' : 'draft',
    metadata: {}
  });
  
  // Track usage
  await trackUsage({
    restaurant_id: parseInt(restaurant_id),
    subscription_id: subscription.subscription_id,
    feature_type: 'social_posts',
    feature_count: 1
  });
  
  return post;
}

/**
 * Generate and create AI social media post
 */
async function generateAndCreatePost({ restaurant_id, platform, post_type, context = {} }) {
  // Generate post content using AI
  const generatedPost = await generateSocialPost({
    restaurant_id,
    platform,
    post_type,
    context
  });
  
  // Create the post
  return await createPost({
    restaurant_id,
    platform,
    content: generatedPost.content,
    image_url: generatedPost.suggested_image
  });
}

/**
 * Schedule a post
 */
async function schedulePost(post_id, scheduled_time) {
  const post = await findById('social_posts', post_id, 'post_id');
  if (!post) {
    throw new Error('Post not found');
  }
  
  return await update('social_posts', post_id, {
    scheduled_time: new Date(scheduled_time).toISOString(),
    status: 'scheduled'
  }, 'post_id');
}

/**
 * Publish a post (mark as published)
 */
async function publishPost(post_id) {
  const post = await findById('social_posts', post_id, 'post_id');
  if (!post) {
    throw new Error('Post not found');
  }
  
  // TODO: Actually publish to platform (Instagram API, Facebook API, etc.)
  // For now, just mark as published
  
  return await update('social_posts', post_id, {
    status: 'published',
    published_at: new Date().toISOString()
  }, 'post_id');
}

/**
 * List posts for a restaurant
 */
async function listPosts(restaurant_id, filters = {}) {
  const conditions = { restaurant_id: parseInt(restaurant_id) };
  if (filters.platform) conditions.platform = filters.platform;
  if (filters.status) conditions.status = filters.status;
  
  return await findAll('social_posts', conditions, 'created_at DESC');
}

/**
 * Get scheduled posts (for cron job to publish)
 */
async function getScheduledPosts() {
  const now = new Date().toISOString();
  const query = `
    SELECT * FROM social_posts
    WHERE status = 'scheduled'
      AND scheduled_time <= $1
    ORDER BY scheduled_time ASC
  `;
  
  return await queryMany(query, [now]);
}

module.exports = {
  createPost,
  generateAndCreatePost,
  schedulePost,
  publishPost,
  listPosts,
  getScheduledPosts
};
