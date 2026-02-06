// Subscription Management API
// Handles subscription CRUD, tier upgrades/downgrades, usage tracking

const express = require('express');
const router = express.Router();
const { findAll, findById, insert, update, queryMany } = require('../../lib/db');

// Subscription tier limits - Export for use in other modules
const TIER_LIMITS = {
  starter: {
    image_enhancements: 10,
    social_posts: 5,
    email_campaigns: 0,
    videos_generated: 0,
    menus: 1,
    locations: 1
  },
  professional: {
    image_enhancements: -1, // unlimited
    social_posts: -1,
    email_campaigns: -1,
    videos_generated: 1,
    menus: -1,
    locations: 3
  },
  enterprise: {
    image_enhancements: -1,
    social_posts: -1,
    email_campaigns: -1,
    videos_generated: -1,
    menus: -1,
    locations: -1
  }
};

// Export TIER_LIMITS for use in other modules
module.exports.TIER_LIMITS = TIER_LIMITS;

// GET /api/subscriptions - List all subscriptions (with filters)
router.get('/', async (req, res) => {
  try {
    const { restaurant_id, status, tier } = req.query;
    
    const conditions = {};
    if (restaurant_id) conditions.restaurant_id = restaurant_id;
    if (status) conditions.status = status;
    if (tier) conditions.tier = tier;
    
    const subscriptions = await findAll('subscriptions', conditions, 'created_at DESC');
    const total = subscriptions.length;
    
    res.json({
      subscriptions,
      total,
      filters: { restaurant_id, status, tier }
    });
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    res.status(500).json({ error: 'Failed to fetch subscriptions' });
  }
});

// POST /api/subscriptions - Create new subscription
router.post('/', async (req, res) => {
  try {
    const { restaurant_id, tier, billing_cycle = 'monthly', stripe_subscription_id } = req.body;
    
    if (!restaurant_id || !tier) {
      return res.status(400).json({ error: 'restaurant_id and tier are required' });
    }
    
    if (!['starter', 'professional', 'enterprise'].includes(tier)) {
      return res.status(400).json({ error: 'Invalid tier. Must be starter, professional, or enterprise' });
    }
    
    // Calculate renewal_date based on billing_cycle
    const renewalDate = new Date();
    if (billing_cycle === 'monthly') {
      renewalDate.setMonth(renewalDate.getMonth() + 1);
    } else if (billing_cycle === 'annual') {
      renewalDate.setFullYear(renewalDate.getFullYear() + 1);
    }
    
    const subscription = await insert('subscriptions', {
      restaurant_id: parseInt(restaurant_id),
      tier,
      status: 'active',
      billing_cycle,
      renewal_date: renewalDate.toISOString(),
      stripe_subscription_id: stripe_subscription_id || null
    });
    
    res.json({
      ...subscription,
      message: 'Subscription created successfully'
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ error: 'Failed to create subscription' });
  }
});

// GET /api/subscriptions/:id - Get subscription details
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const subscription = await findById('subscriptions', id, 'subscription_id');
    
    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }
    
    // Get usage for this subscription
    const usage = await getUsageMetrics(subscription.subscription_id);
    
    res.json({
      ...subscription,
      limits: TIER_LIMITS[subscription.tier] || {},
      usage
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    res.status(500).json({ error: 'Failed to fetch subscription' });
  }
});

// PUT /api/subscriptions/:id - Update subscription (tier upgrade/downgrade)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const subscription = await findById('subscriptions', id, 'subscription_id');
    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }
    
    // Handle tier changes - update renewal date if billing cycle changes
    if (updates.billing_cycle && updates.billing_cycle !== subscription.billing_cycle) {
      const renewalDate = new Date();
      if (updates.billing_cycle === 'monthly') {
        renewalDate.setMonth(renewalDate.getMonth() + 1);
      } else if (updates.billing_cycle === 'annual') {
        renewalDate.setFullYear(renewalDate.getFullYear() + 1);
      }
      updates.renewal_date = renewalDate.toISOString();
    }
    
    // Validate tier if being changed
    if (updates.tier && !['starter', 'professional', 'enterprise'].includes(updates.tier)) {
      return res.status(400).json({ error: 'Invalid tier' });
    }
    
    const updated = await update('subscriptions', id, updates, 'subscription_id');
    
    res.json({
      ...updated,
      limits: TIER_LIMITS[updated.tier] || {},
      message: 'Subscription updated successfully'
    });
  } catch (error) {
    console.error('Error updating subscription:', error);
    res.status(500).json({ error: 'Failed to update subscription' });
  }
});

// Helper function to get usage metrics
async function getUsageMetrics(subscription_id, start_date = null, end_date = null) {
  try {
    let query = `
      SELECT 
        feature_type,
        SUM(feature_count) as total_count
      FROM usage_tracking
      WHERE subscription_id = $1
    `;
    const params = [subscription_id];
    
    if (start_date) {
      query += ` AND usage_date >= $${params.length + 1}`;
      params.push(start_date);
    }
    
    if (end_date) {
      query += ` AND usage_date <= $${params.length + 1}`;
      params.push(end_date);
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
    console.error('Error getting usage metrics:', error);
    return {
      image_enhancements: 0,
      social_posts: 0,
      email_campaigns: 0,
      videos_generated: 0
    };
  }
}

// GET /api/subscriptions/:id/usage - Get usage metrics for subscription
router.get('/:id/usage', async (req, res) => {
  try {
    const { id } = req.params;
    const { start_date, end_date } = req.query;
    
    const subscription = await findById('subscriptions', id, 'subscription_id');
    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }
    
    const usage = await getUsageMetrics(id, start_date, end_date);
    const limits = TIER_LIMITS[subscription.tier] || {};
    
    res.json({
      subscription_id: id,
      period: { start_date, end_date },
      usage,
      limits
    });
  } catch (error) {
    console.error('Error fetching usage:', error);
    res.status(500).json({ error: 'Failed to fetch usage metrics' });
  }
});

// POST /api/subscriptions/:id/cancel - Cancel subscription
router.post('/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    const subscription = await findById('subscriptions', id, 'subscription_id');
    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }
    
    // Update status to cancelled
    const updated = await update('subscriptions', id, { 
      status: 'cancelled' 
    }, 'subscription_id');
    
    // TODO: Handle Stripe cancellation if stripe_subscription_id exists
    // if (subscription.stripe_subscription_id) {
    //   await stripe.subscriptions.cancel(subscription.stripe_subscription_id);
    // }
    
    res.json({
      ...updated,
      cancelled_at: new Date().toISOString(),
      cancellation_reason: reason || null,
      message: 'Subscription cancelled successfully'
    });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

module.exports = router;
