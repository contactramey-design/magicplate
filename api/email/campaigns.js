// Email Marketing Campaign Management
// Handles email campaign creation, sending, and automation

const { insert, findById, findAll, update, queryMany } = require('../../lib/db');
const { sendEmail } = require('../../config/email-config');
const { trackUsage } = require('../../lib/usage-tracker');

/**
 * Create an email campaign
 * @param {Object} params - Campaign parameters
 * @param {number} params.restaurant_id - Restaurant ID
 * @param {string} params.name - Campaign name
 * @param {string} params.subject - Email subject
 * @param {string} params.template_id - Template ID or HTML content
 * @param {Array} params.recipients - List of recipient emails
 * @param {Date} params.scheduled_time - Scheduled send time (optional)
 * @returns {Promise<Object>} Created campaign
 */
async function createCampaign({ restaurant_id, name, subject, template_id, recipients = [], scheduled_time = null }) {
  // Get subscription
  const subscriptions = await findAll('subscriptions', {
    restaurant_id: parseInt(restaurant_id),
    status: 'active'
  });
  
  if (subscriptions.length === 0) {
    throw new Error('No active subscription found');
  }
  
  const subscription = subscriptions[0];
  
  // Check tier - only Professional and Enterprise have email campaigns
  if (subscription.tier === 'starter') {
    throw new Error('Email campaigns are only available on Professional and Enterprise plans');
  }
  
  const campaign = await insert('email_campaigns', {
    restaurant_id: parseInt(restaurant_id),
    name,
    subject,
    template_id: template_id || null,
    status: scheduled_time ? 'scheduled' : 'draft',
    scheduled_time: scheduled_time ? new Date(scheduled_time).toISOString() : null,
    sent_count: 0,
    open_count: 0,
    click_count: 0
  });
  
  // Store recipients in metadata (or separate table in future)
  if (recipients.length > 0) {
    await update('email_campaigns', campaign.campaign_id, {
      metadata: { recipients }
    }, 'campaign_id');
  }
  
  return campaign;
}

/**
 * Send a campaign
 */
async function sendCampaign(campaign_id) {
  const campaign = await findById('email_campaigns', campaign_id, 'campaign_id');
  if (!campaign) {
    throw new Error('Campaign not found');
  }
  
  if (campaign.status === 'completed') {
    throw new Error('Campaign already sent');
  }
  
  // Get recipients
  const recipients = campaign.metadata?.recipients || [];
  if (recipients.length === 0) {
    throw new Error('No recipients specified');
  }
  
  // Get restaurant for email context
  const restaurant = await findById('restaurants', campaign.restaurant_id, 'restaurant_id');
  
  // Update status to sending
  await update('email_campaigns', campaign_id, {
    status: 'sending'
  }, 'campaign_id');
  
  let sentCount = 0;
  let errorCount = 0;
  
  // Send to each recipient
  for (const recipient of recipients) {
    try {
      await sendEmail({
        to: recipient,
        from: {
          email: process.env.FROM_EMAIL || 'sydney@magicplate.info',
          name: process.env.FROM_NAME || 'MagicPlate.ai'
        },
        subject: campaign.subject,
        html: campaign.template_id || '<p>Email content</p>', // TODO: Load template
        text: campaign.template_id || 'Email content'
      });
      
      sentCount++;
    } catch (error) {
      console.error(`Error sending to ${recipient}:`, error);
      errorCount++;
    }
  }
  
  // Update campaign status
  const updated = await update('email_campaigns', campaign_id, {
    status: 'completed',
    sent_count: sentCount
  }, 'campaign_id');
  
  // Track usage
  const subscriptions = await findAll('subscriptions', {
    restaurant_id: campaign.restaurant_id,
    status: 'active'
  });
  
  if (subscriptions.length > 0) {
    await trackUsage({
      restaurant_id: campaign.restaurant_id,
      subscription_id: subscriptions[0].subscription_id,
      feature_type: 'email_campaigns',
      feature_count: sentCount
    });
  }
  
  return {
    ...updated,
    sent_count: sentCount,
    error_count: errorCount
  };
}

/**
 * List campaigns for a restaurant
 */
async function listCampaigns(restaurant_id) {
  return await findAll('email_campaigns', {
    restaurant_id: parseInt(restaurant_id)
  }, 'created_at DESC');
}

/**
 * Get scheduled campaigns (for cron job)
 */
async function getScheduledCampaigns() {
  const now = new Date().toISOString();
  const query = `
    SELECT * FROM email_campaigns
    WHERE status = 'scheduled'
      AND scheduled_time <= $1
    ORDER BY scheduled_time ASC
  `;
  
  return await queryMany(query, [now]);
}

module.exports = {
  createCampaign,
  sendCampaign,
  listCampaigns,
  getScheduledCampaigns
};
