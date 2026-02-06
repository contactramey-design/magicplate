// Cron Job: Publish Scheduled Posts
// Runs periodically to publish scheduled social media posts

const { getScheduledPosts, publishPost } = require('../social/posts');
const { getScheduledCampaigns, sendCampaign } = require('../email/campaigns');

/**
 * Publish all scheduled posts that are due
 */
async function publishScheduledPosts() {
  try {
    const scheduledPosts = await getScheduledPosts();
    console.log(`Found ${scheduledPosts.length} scheduled posts to publish`);
    
    const results = {
      published: 0,
      failed: 0,
      errors: []
    };
    
    for (const post of scheduledPosts) {
      try {
        // TODO: Actually publish to platform (Instagram API, Facebook API, etc.)
        // For now, just mark as published
        await publishPost(post.post_id);
        results.published++;
        console.log(`✅ Published post ${post.post_id} to ${post.platform}`);
      } catch (error) {
        console.error(`❌ Failed to publish post ${post.post_id}:`, error);
        results.failed++;
        results.errors.push({ post_id: post.post_id, error: error.message });
      }
    }
    
    return results;
  } catch (error) {
    console.error('Error in publishScheduledPosts:', error);
    throw error;
  }
}

/**
 * Send all scheduled email campaigns that are due
 */
async function sendScheduledCampaigns() {
  try {
    const scheduledCampaigns = await getScheduledCampaigns();
    console.log(`Found ${scheduledCampaigns.length} scheduled campaigns to send`);
    
    const results = {
      sent: 0,
      failed: 0,
      errors: []
    };
    
    for (const campaign of scheduledCampaigns) {
      try {
        await sendCampaign(campaign.campaign_id);
        results.sent++;
        console.log(`✅ Sent campaign ${campaign.campaign_id}: ${campaign.name}`);
      } catch (error) {
        console.error(`❌ Failed to send campaign ${campaign.campaign_id}:`, error);
        results.failed++;
        results.errors.push({ campaign_id: campaign.campaign_id, error: error.message });
      }
    }
    
    return results;
  } catch (error) {
    console.error('Error in sendScheduledCampaigns:', error);
    throw error;
  }
}

/**
 * Main cron function - runs all scheduled tasks
 */
async function runScheduledTasks() {
  console.log('🕐 Running scheduled tasks...');
  
  const results = {
    posts: null,
    campaigns: null
  };
  
  try {
    results.posts = await publishScheduledPosts();
  } catch (error) {
    console.error('Error publishing posts:', error);
  }
  
  try {
    results.campaigns = await sendScheduledCampaigns();
  } catch (error) {
    console.error('Error sending campaigns:', error);
  }
  
  return results;
}

module.exports = {
  publishScheduledPosts,
  sendScheduledCampaigns,
  runScheduledTasks
};
