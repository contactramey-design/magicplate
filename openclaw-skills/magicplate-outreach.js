/**
 * OpenClaw Skill: MagicPlate Multi-Channel Outreach
 * Handles outreach via Email, WhatsApp, Telegram, Facebook, Instagram
 */

const { sendEmailToRestaurant } = require('./magicplate-email');
const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');
require('dotenv').config();

/**
 * Send WhatsApp message via VAPI
 */
async function sendWhatsApp(restaurant, message) {
  const vapiKey = process.env.VAPI_API_KEY;
  if (!vapiKey) {
    return { success: false, reason: 'VAPI_API_KEY not set' };
  }

  const phone = restaurant.phone;
  if (!phone) {
    return { success: false, reason: 'no_phone' };
  }

  // Format phone number
  let formattedPhone = phone.replace(/\D/g, '');
  if (!formattedPhone.startsWith('1') && formattedPhone.length === 10) {
    formattedPhone = '1' + formattedPhone;
  }

  try {
    // VAPI API for WhatsApp
    const response = await axios.post(
      'https://api.vapi.ai/v1/messages',
      {
        to: `+${formattedPhone}`,
        message: message.text || message,
        channel: 'whatsapp'
      },
      {
        headers: {
          'Authorization': `Bearer ${vapiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return { success: true, messageId: response.data.id, channel: 'whatsapp' };
  } catch (error) {
    return {
      success: false,
      reason: error.response?.data?.error || error.message,
      channel: 'whatsapp'
    };
  }
}

/**
 * Send Telegram message
 */
async function sendTelegram(restaurant, message) {
  const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
  const telegramChatId = process.env.TELEGRAM_CHAT_ID;
  
  if (!telegramBotToken || !telegramChatId) {
    return { success: false, reason: 'Telegram not configured' };
  }

  // For Telegram, we'd need the restaurant's Telegram username or chat ID
  // This is a placeholder - you'd need to collect Telegram info during scraping
  return { success: false, reason: 'Telegram contact info not available' };
}

/**
 * Get personalized message for restaurant
 */
function getOutreachMessage(restaurant, channel = 'email') {
  const issues = restaurant.issues || [];
  let personalizedHook = '';
  
  if (issues.includes('not_on_doordash')) {
    personalizedHook = 'We noticed you\'re not on DoorDash yet—this is a huge opportunity to unlock 20-40% more revenue.';
  } else if (issues.includes('no_website')) {
    personalizedHook = 'We noticed your restaurant could benefit from a stronger online presence.';
  } else if (issues.includes('no_professional_photos')) {
    personalizedHook = 'Your menu items deserve to look as amazing as they taste.';
  } else {
    personalizedHook = 'We help restaurants transform their menu presentation to drive more sales.';
  }

  if (channel === 'email') {
    return {
      subject: 'Elevate Your Menu, Boost Revenue & Outshine the Competition',
      text: `Hi ${restaurant.name || 'there'}!

${personalizedHook}

We offer:
✨ AI-powered menu photo enhancement
📱 Digital menu creation
📧 Email marketing campaigns
📱 Social media automation

Ready to see how we can help? Let's schedule a brief 15-minute call!

📧 Reply to this message
📞 Call or text: (805) 668-9973
🌐 Visit: https://magicplate.info

Best,
Sydney Ramey
MagicPlate.ai`
    };
  } else {
    // Shorter version for WhatsApp/Telegram
    return {
      text: `Hi ${restaurant.name || 'there'}! 👋

${personalizedHook}

We help restaurants transform their menu presentation with AI-powered photo enhancement, digital menus, and marketing automation.

Ready to grow? Let's chat! 📞 (805) 668-9973
🌐 https://magicplate.info

- Sydney, MagicPlate.ai`
    };
  }
}

/**
 * Multi-channel outreach to a restaurant
 */
async function sendMultiChannelOutreach(restaurant, channels = ['email']) {
  const message = getOutreachMessage(restaurant, channels[0]);
  const results = [];

  for (const channel of channels) {
    let result;
    
    switch (channel) {
      case 'email':
        if (restaurant.email) {
          result = await sendEmailToRestaurant(restaurant);
          result.channel = 'email';
        } else {
          result = { success: false, reason: 'no_email', channel: 'email' };
        }
        break;
        
      case 'whatsapp':
        result = await sendWhatsApp(restaurant, message);
        break;
        
      case 'telegram':
        result = await sendTelegram(restaurant, message);
        break;
        
      default:
        result = { success: false, reason: 'unsupported_channel', channel };
    }
    
    results.push(result);
    
    // If successful, stop trying other channels
    if (result.success) {
      break;
    }
  }

  return {
    restaurant: restaurant.name,
    results,
    success: results.some(r => r.success)
  };
}

/**
 * Batch outreach to qualified leads
 */
async function batchOutreach(maxContacts = null, channels = ['email', 'whatsapp']) {
  const leadsPath = path.join(__dirname, '..', 'data', 'qualified-leads.json');
  const trackingPath = path.join(__dirname, '..', 'data', 'outreach-tracking.json');
  
  let leads = [];
  let tracking = [];
  
  try {
    const data = await fs.readFile(leadsPath, 'utf8');
    leads = JSON.parse(data);
  } catch (error) {
    throw new Error(`Could not read leads: ${error.message}`);
  }
  
  try {
    const data = await fs.readFile(trackingPath, 'utf8');
    tracking = JSON.parse(data);
  } catch {
    tracking = [];
  }
  
  const contacted = new Set(tracking.map(t => t.restaurant_id || t.email));
  const uncontacted = leads.filter(lead => 
    !contacted.has(lead.place_id) && !contacted.has(lead.email)
  );
  
  if (maxContacts) {
    uncontacted.splice(maxContacts);
  }
  
  const results = [];
  
  for (const lead of uncontacted) {
    const result = await sendMultiChannelOutreach(lead, channels);
    results.push(result);
    
    // Track result
    tracking.push({
      restaurant_id: lead.place_id,
      restaurant_name: lead.name,
      email: lead.email,
      phone: lead.phone,
      contacted_at: new Date().toISOString(),
      channels_attempted: channels,
      success: result.success,
      channel_used: result.results.find(r => r.success)?.channel || null
    });
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  
  await fs.writeFile(trackingPath, JSON.stringify(tracking, null, 2));
  
  return {
    total: uncontacted.length,
    contacted: results.filter(r => r.success).length,
    failed: results.filter(r => !r.success).length,
    results
  };
}

module.exports = {
  sendWhatsApp,
  sendTelegram,
  getOutreachMessage,
  sendMultiChannelOutreach,
  batchOutreach
};
