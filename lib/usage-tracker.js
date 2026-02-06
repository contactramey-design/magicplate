// Usage Tracking Module
// Tracks feature usage for subscription limits

const { insert, queryMany } = require('./db');

/**
 * Track usage of a feature
 * @param {Object} params - Usage tracking parameters
 * @param {number} params.restaurant_id - Restaurant ID
 * @param {number} params.subscription_id - Subscription ID
 * @param {string} params.feature_type - Feature type (image_enhancements, social_posts, etc.)
 * @param {number} params.feature_count - Count to add (default: 1)
 * @param {Object} params.metadata - Additional metadata
 */
async function trackUsage({ restaurant_id, subscription_id, feature_type, feature_count = 1, metadata = {} }) {
  try {
    const usage = await insert('usage_tracking', {
      restaurant_id: parseInt(restaurant_id),
      subscription_id: parseInt(subscription_id),
      feature_type,
      feature_count: parseInt(feature_count),
      usage_date: new Date().toISOString().split('T')[0],
      metadata: metadata || {}
    });
    
    return usage;
  } catch (error) {
    console.error('Error tracking usage:', error);
    // Don't throw - usage tracking shouldn't break the main flow
    return null;
  }
}

/**
 * Get current month usage for a subscription
 * @param {number} subscription_id - Subscription ID
 * @param {string} feature_type - Feature type (optional)
 * @returns {Promise<Object>} Usage summary
 */
async function getCurrentUsage(subscription_id, feature_type = null) {
  try {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    let query = `
      SELECT 
        feature_type,
        SUM(feature_count) as total_count
      FROM usage_tracking
      WHERE subscription_id = $1
        AND usage_date >= $2
    `;
    const params = [subscription_id, startOfMonth.toISOString().split('T')[0]];
    
    if (feature_type) {
      query += ` AND feature_type = $3`;
      params.push(feature_type);
    }
    
    query += ` GROUP BY feature_type`;
    
    const result = await queryMany(query, params);
    
    const usage = {
      image_enhancements: 0,
      social_posts: 0,
      email_campaigns: 0,
      videos_generated: 0
    };
    
    result.forEach(row => {
      if (usage.hasOwnProperty(row.feature_type)) {
        usage[row.feature_type] = parseInt(row.total_count) || 0;
      }
    });
    
    return usage;
  } catch (error) {
    console.error('Error getting current usage:', error);
    return {
      image_enhancements: 0,
      social_posts: 0,
      email_campaigns: 0,
      videos_generated: 0
    };
  }
}

/**
 * Check if usage is within limits
 * @param {number} subscription_id - Subscription ID
 * @param {string} feature_type - Feature type
 * @param {Object} limits - Tier limits
 * @returns {Promise<Object>} { allowed: boolean, current: number, limit: number }
 */
async function checkUsageLimit(subscription_id, feature_type, limits) {
  const currentUsage = await getCurrentUsage(subscription_id, feature_type);
  const current = currentUsage[feature_type] || 0;
  const limit = limits[feature_type];
  
  // -1 means unlimited
  if (limit === -1) {
    return { allowed: true, current, limit: -1 };
  }
  
  return {
    allowed: current < limit,
    current,
    limit,
    remaining: Math.max(0, limit - current)
  };
}

module.exports = {
  trackUsage,
  getCurrentUsage,
  checkUsageLimit
};
