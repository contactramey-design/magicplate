// Unified Outreach Orchestrator
// Manages multi-channel outreach with fallback strategy

const {
  sendEmailOutreach,
  sendInstagramDM,
  sendFacebookMessage,
  sendWhatsAppMessage,
  sendVoicemail,
  getOutreachMessage
} = require('./outreach-channels');

const fs = require('fs').promises;
const path = require('path');

const TRACKING_FILE = path.join(__dirname, '..', 'data', 'outreach-tracking.json');

/**
 * Load outreach tracking data
 */
async function loadTracking() {
  try {
    const data = await fs.readFile(TRACKING_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    return {
      outreach: [],
      stats: {
        total: 0,
        successful: 0,
        failed: 0,
        by_channel: {
          email: { sent: 0, failed: 0 },
          instagram: { sent: 0, failed: 0 },
          facebook: { sent: 0, failed: 0 },
          whatsapp: { sent: 0, failed: 0 },
          voicemail: { sent: 0, failed: 0 }
        }
      }
    };
  }
}

/**
 * Save outreach attempt
 */
async function saveOutreach(restaurant, result) {
  const tracking = await loadTracking();
  
  tracking.outreach.push({
    restaurant_id: restaurant.id || restaurant.place_id,
    restaurant_name: restaurant.name,
    channel: result.channel,
    success: result.success,
    reason: result.reason,
    timestamp: new Date().toISOString(),
    retry: result.retry || false
  });
  
  tracking.stats.total++;
  if (result.success) {
    tracking.stats.successful++;
    tracking.stats.by_channel[result.channel].sent++;
  } else {
    tracking.stats.failed++;
    tracking.stats.by_channel[result.channel].failed++;
  }
  
  await fs.writeFile(TRACKING_FILE, JSON.stringify(tracking, null, 2));
}

/**
 * Outreach strategy configuration
 * Defines priority order and fallback channels
 */
const OUTREACH_STRATEGY = {
  // Primary channel (tried first)
  primary: ['email'],
  
  // Fallback channels (tried if primary fails)
  fallback: ['whatsapp', 'facebook', 'instagram'],
  
  // Alternative channels (tried if all others fail)
  alternative: ['voicemail'],
  
  // Channels to skip if restaurant doesn't have required data
  requires: {
    email: ['email', 'potentialEmails'],
    instagram: ['instagramId'],
    facebook: ['facebookPageId', 'facebookUserId'],
    whatsapp: ['phone'],
    voicemail: ['phone']
  }
};

/**
 * Check if restaurant has required data for channel
 */
function hasRequiredData(restaurant, channel) {
  const required = OUTREACH_STRATEGY.requires[channel] || [];
  return required.some(field => {
    if (field === 'email' || field === 'potentialEmails') {
      return restaurant.email || (restaurant.potentialEmails && restaurant.potentialEmails.length > 0);
    }
    return restaurant[field];
  });
}

/**
 * Send multi-channel outreach with fallback
 */
async function sendMultiChannelOutreach(restaurant, options = {}) {
  const {
    preferredChannels = null, // Override default strategy
    skipChannels = [], // Channels to skip
    maxAttempts = 3, // Max channels to try
    customMessage = null
  } = options;
  
  // Get message content
  const message = customMessage || getOutreachMessage(restaurant, 'email');
  
  // Determine channel order
  let channelsToTry = preferredChannels || [
    ...OUTREACH_STRATEGY.primary,
    ...OUTREACH_STRATEGY.fallback,
    ...OUTREACH_STRATEGY.alternative
  ];
  
  // Filter out skipped channels
  channelsToTry = channelsToTry.filter(ch => !skipChannels.includes(ch));
  
  // Filter channels based on available data
  channelsToTry = channelsToTry.filter(ch => hasRequiredData(restaurant, ch));
  
  // Limit attempts
  channelsToTry = channelsToTry.slice(0, maxAttempts);
  
  if (channelsToTry.length === 0) {
    return {
      success: false,
      reason: 'no_available_channels',
      attempts: []
    };
  }
  
  const attempts = [];
  let lastResult = null;
  
  // Try each channel in order
  for (const channel of channelsToTry) {
    try {
      let result;
      
      switch (channel) {
        case 'email':
          result = await sendEmailOutreach(restaurant, message);
          break;
        case 'instagram':
          result = await sendInstagramDM(restaurant, message);
          break;
        case 'facebook':
          result = await sendFacebookMessage(restaurant, message);
          break;
        case 'whatsapp':
          result = await sendWhatsAppMessage(restaurant, message);
          break;
        case 'voicemail':
          result = await sendVoicemail(restaurant, message);
          break;
        default:
          result = { success: false, reason: 'unknown_channel', channel };
      }
      
      attempts.push(result);
      lastResult = result;
      
      // Save tracking
      await saveOutreach(restaurant, result);
      
      // If successful, return immediately
      if (result.success) {
        return {
          success: true,
          channel: result.channel,
          attempts,
          message: `Successfully sent via ${result.channel}`
        };
      }
      
      // If it's a retryable error, continue to next channel
      if (result.retry) {
        continue;
      }
      
      // If it's a permanent failure (like no email), continue to next channel
      if (result.reason === 'no_email' || result.reason === 'no_phone') {
        continue;
      }
      
    } catch (error) {
      const errorResult = {
        success: false,
        reason: error.message,
        channel,
        error: error.stack
      };
      attempts.push(errorResult);
      await saveOutreach(restaurant, errorResult);
    }
  }
  
  // All channels failed
  return {
    success: false,
    reason: 'all_channels_failed',
    attempts,
    lastResult
  };
}

/**
 * Batch send outreach to multiple restaurants
 */
async function batchOutreach(restaurants, options = {}) {
  const {
    batchSize = 5,
    delay = 3000, // 3 seconds between batches
    dryRun = false,
    maxRestaurants = null
  } = options;
  
  const restaurantsToContact = restaurants
    .filter(r => r.status !== 'contacted' && r.status !== 'emailed')
    .slice(0, maxRestaurants || restaurants.length);
  
  if (dryRun) {
    console.log(`\n🧪 DRY RUN - Would contact ${restaurantsToContact.length} restaurants:\n`);
    restaurantsToContact.forEach((r, i) => {
      const channels = [];
      if (r.email || r.potentialEmails?.length) channels.push('email');
      if (r.instagramId) channels.push('instagram');
      if (r.facebookPageId) channels.push('facebook');
      if (r.phone) channels.push('whatsapp', 'voicemail');
      
      console.log(`${i + 1}. ${r.name}`);
      console.log(`   Available channels: ${channels.join(', ') || 'none'}`);
      console.log(`   Score: ${r.qualificationScore}\n`);
    });
    return { contacted: 0, failed: 0 };
  }
  
  console.log(`\n📢 Starting multi-channel outreach to ${restaurantsToContact.length} restaurants...\n`);
  
  let contacted = 0;
  let failed = 0;
  
  for (let i = 0; i < restaurantsToContact.length; i += batchSize) {
    const batch = restaurantsToContact.slice(i, i + batchSize);
    
    const results = await Promise.allSettled(
      batch.map(restaurant => sendMultiChannelOutreach(restaurant, options))
    );
    
    results.forEach((result, idx) => {
      const restaurant = batch[idx];
      if (result.status === 'fulfilled' && result.value.success) {
        restaurant.status = 'contacted';
        restaurant.contactedAt = new Date().toISOString();
        restaurant.contactChannel = result.value.channel;
        contacted++;
        console.log(`✅ ${restaurant.name} → ${result.value.channel}`);
      } else {
        failed++;
        const error = result.status === 'rejected' ? result.reason : result.value.reason;
        console.log(`❌ ${restaurant.name} → ${error}`);
      }
    });
    
    // Save progress
    const leadsPath = path.join(__dirname, '..', 'data', 'qualified-leads.json');
    await fs.writeFile(leadsPath, JSON.stringify(restaurants, null, 2));
    
    if (i + batchSize < restaurantsToContact.length) {
      console.log(`⏳ Processed ${i + batchSize}/${restaurantsToContact.length}... Waiting ${delay}ms\n`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  return { contacted, failed };
}

/**
 * Get outreach statistics
 */
async function getOutreachStats() {
  const tracking = await loadTracking();
  return tracking.stats;
}

module.exports = {
  sendMultiChannelOutreach,
  batchOutreach,
  getOutreachStats,
  loadTracking
};
