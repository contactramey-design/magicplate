// Multi-Channel Outreach System
// Handles Email, Instagram, Facebook, WhatsApp, and Voicemail

const axios = require('axios');
const { sendEmail } = require('../config/email-config');
const fs = require('fs').promises;
const path = require('path');

/**
 * Send outreach via Email
 */
async function sendEmailOutreach(restaurant, message) {
  const emailsToTry = restaurant.email 
    ? [restaurant.email, ...(restaurant.potentialEmails || [])]
    : restaurant.potentialEmails || [];
  
  if (emailsToTry.length === 0) {
    return { success: false, reason: 'no_email', channel: 'email' };
  }
  
  for (const email of emailsToTry) {
    try {
      const emailData = {
        to: email,
        from: {
          email: process.env.FROM_EMAIL || 'sydney@magicplate.info',
          name: process.env.FROM_NAME || 'Sydney - MagicPlate'
        },
        subject: message.subject || 'Elevate Your Menu, Boost Revenue & Outshine the Competition',
        html: message.html || message.text,
        text: message.text || message.html?.replace(/<[^>]*>/g, '')
      };
      
      await sendEmail(emailData);
      return { success: true, email, channel: 'email' };
    } catch (error) {
      const errorMessage = error.error?.message || error.message || 'Unknown error';
      
      // Check for email validation errors
      if (errorMessage.includes('does not exist') || 
          errorMessage.includes('invalid') || 
          errorMessage.includes('bounced')) {
        continue; // Try next email
      }
      
      // If it's a rate limit or temporary error, return to retry later
      if (errorMessage.includes('rate limit') || errorMessage.includes('quota')) {
        return { success: false, reason: 'rate_limit', channel: 'email', retry: true };
      }
      
      // Last email failed
      if (email === emailsToTry[emailsToTry.length - 1]) {
        return { success: false, reason: errorMessage, channel: 'email' };
      }
    }
  }
  
  return { success: false, reason: 'all_emails_failed', channel: 'email' };
}

/**
 * Send outreach via Instagram DM
 * Note: Instagram Graph API has strict limitations on DMs
 * This uses the Instagram Messaging API which requires:
 * - Instagram Business Account
 * - User must have messaged you first OR
 * - Use Instagram's "Message Request" feature (limited)
 */
async function sendInstagramDM(restaurant, message) {
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  const instagramId = restaurant.instagramId;
  
  if (!accessToken || !instagramId) {
    return { success: false, reason: 'no_instagram_access', channel: 'instagram' };
  }
  
  try {
    // Instagram Messaging API - Send message request
    // Note: This only works if the user has previously interacted with your account
    // For cold outreach, you need to use Instagram's "Message Request" feature
    const response = await axios.post(
      `https://graph.facebook.com/v18.0/${instagramId}/messages`,
      {
        recipient: { id: instagramId },
        message: {
          text: message.text || message.html?.replace(/<[^>]*>/g, '')
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return { success: true, messageId: response.data.message_id, channel: 'instagram' };
  } catch (error) {
    // Instagram DM restrictions
    if (error.response?.status === 403) {
      return { 
        success: false, 
        reason: 'instagram_dm_restricted', 
        channel: 'instagram',
        note: 'Instagram requires users to message you first or use message requests'
      };
    }
    
    return { 
      success: false, 
      reason: error.response?.data?.error?.message || error.message, 
      channel: 'instagram' 
    };
  }
}

/**
 * Send outreach via Facebook Messenger
 */
async function sendFacebookMessage(restaurant, message) {
  const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;
  const pageId = process.env.FACEBOOK_PAGE_ID;
  const recipientId = restaurant.facebookPageId || restaurant.facebookUserId;
  
  if (!accessToken || !pageId || !recipientId) {
    return { success: false, reason: 'no_facebook_access', channel: 'facebook' };
  }
  
  try {
    // Facebook Messenger API - Send message
    const response = await axios.post(
      `https://graph.facebook.com/v18.0/${pageId}/messages`,
      {
        recipient: { id: recipientId },
        message: {
          text: message.text || message.html?.replace(/<[^>]*>/g, '')
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return { success: true, messageId: response.data.message_id, channel: 'facebook' };
  } catch (error) {
    // Facebook Messenger restrictions
    if (error.response?.status === 403) {
      return { 
        success: false, 
        reason: 'facebook_messenger_restricted', 
        channel: 'facebook',
        note: 'Facebook requires users to message you first (24-hour window)'
      };
    }
    
    return { 
      success: false, 
      reason: error.response?.data?.error?.message || error.message, 
      channel: 'facebook' 
    };
  }
}

/**
 * Send outreach via WhatsApp using VAPI API
 */
async function sendWhatsAppMessage(restaurant, message) {
  const vapiApiKey = process.env.VAPI_API_KEY;
  const vapiPhoneNumber = process.env.VAPI_PHONE_NUMBER || process.env.ZAPPY_PHONE_NUMBER; // Support both for backward compatibility
  
  if (!vapiApiKey) {
    return { success: false, reason: 'no_vapi_config', channel: 'whatsapp' };
  }
  
  const phoneNumber = restaurant.phone;
  if (!phoneNumber) {
    return { success: false, reason: 'no_phone', channel: 'whatsapp' };
  }
  
  // Format phone number (remove non-digits, add country code if needed)
  let formattedPhone = phoneNumber.replace(/\D/g, '');
  if (!formattedPhone.startsWith('1') && formattedPhone.length === 10) {
    formattedPhone = '1' + formattedPhone; // Add US country code
  }
  
  try {
    // VAPI API - Send WhatsApp message
    // Documentation: https://docs.vapi.ai
    const response = await axios.post(
      'https://api.vapi.ai/v1/messages',
      {
        to: `+${formattedPhone}`,
        message: message.text || message.html?.replace(/<[^>]*>/g, ''),
        channel: 'whatsapp'
      },
      {
        headers: {
          'Authorization': `Bearer ${vapiApiKey}`,
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
 * Send voicemail via VAPI API
 */
async function sendVoicemail(restaurant, message) {
  const vapiApiKey = process.env.VAPI_API_KEY;
  
  if (!vapiApiKey) {
    return { success: false, reason: 'no_vapi_config', channel: 'voicemail' };
  }
  
  const phoneNumber = restaurant.phone;
  if (!phoneNumber) {
    return { success: false, reason: 'no_phone', channel: 'voicemail' };
  }
  
  let formattedPhone = phoneNumber.replace(/\D/g, '');
  if (!formattedPhone.startsWith('1') && formattedPhone.length === 10) {
    formattedPhone = '1' + formattedPhone;
  }
  
  try {
    // VAPI API - Send voicemail
    // Documentation: https://docs.vapi.ai
    const response = await axios.post(
      'https://api.vapi.ai/v1/calls',
      {
        phoneNumberId: process.env.VAPI_PHONE_NUMBER_ID, // Your VAPI phone number ID
        customer: {
          number: `+${formattedPhone}`
        },
        // VAPI uses text-to-speech for voicemail
        message: message.text || message.html?.replace(/<[^>]*>/g, '')
      },
      {
        headers: {
          'Authorization': `Bearer ${vapiApiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return { success: true, callId: response.data.id, channel: 'voicemail' };
  } catch (error) {
    return { 
      success: false, 
      reason: error.response?.data?.error || error.message, 
      channel: 'voicemail' 
    };
  }
}

/**
 * Get message content for a restaurant
 */
function getOutreachMessage(restaurant, channel = 'email') {
  const issues = restaurant.issues || [];
  let personalizedHook = '';
  
  if (issues.includes('not_on_doordash')) {
    personalizedHook = 'We noticed you\'re not on DoorDash yet—this is a huge opportunity to unlock 20-40% more revenue from delivery customers.';
  } else if (issues.includes('no_website') || issues.includes('broken_website')) {
    personalizedHook = 'We noticed your restaurant could benefit from a stronger online presence—especially a shareable digital menu.';
  } else if (issues.includes('no_menu_photos') || issues.includes('no_professional_photos')) {
    personalizedHook = 'Your menu items deserve to look as amazing as they taste. We can transform your current photos into stunning visuals.';
  } else {
    personalizedHook = 'We help restaurants like yours transform their menu presentation and digital presence to drive more sales.';
  }
  
  const message = `Hi ${restaurant.name || 'there'}!

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
MagicPlate.ai`;

  // Format for different channels
  if (channel === 'email') {
    return {
      subject: 'Elevate Your Menu, Boost Revenue & Outshine the Competition',
      text: message,
      html: message.replace(/\n/g, '<br>')
    };
  } else {
    // For social/WhatsApp, shorter version
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

module.exports = {
  sendEmailOutreach,
  sendInstagramDM,
  sendFacebookMessage,
  sendWhatsAppMessage,
  sendVoicemail,
  getOutreachMessage
};
