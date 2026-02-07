// Menu Update Notifications API
const express = require('express');
const router = express.Router();
const { findAll, findById } = require('../../../lib/db');
const { Resend } = require('resend');

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

/**
 * POST /api/marketing/menu/notify
 * Send notifications to customers about menu updates
 */
router.post('/notify', async (req, res) => {
  try {
    const { restaurant_id, menu_id, notification_type, customer_emails, custom_message } = req.body;

    if (!restaurant_id || !notification_type) {
      return res.status(400).json({ error: 'restaurant_id and notification_type are required' });
    }

    // Get restaurant data
    const restaurant = await findById('restaurants', parseInt(restaurant_id), 'restaurant_id');
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    // Get menu data if menu_id provided
    let menuData = null;
    if (menu_id) {
      const menu = await findById('content_assets', menu_id, 'asset_id');
      if (menu && menu.type === 'menu') {
        menuData = menu;
      }
    }

    // Determine notification content based on type
    let subject = '';
    let message = '';

    switch (notification_type) {
      case 'new_item':
        subject = `New Menu Item at ${restaurant.name}!`;
        message = custom_message || `We're excited to announce a new addition to our menu at ${restaurant.name}! Check it out on our digital menu.`;
        break;
      case 'menu_update':
        subject = `Menu Updated at ${restaurant.name}`;
        message = custom_message || `We've updated our menu with new items and improvements. Visit our digital menu to see what's new!`;
        break;
      case 'special_offer':
        subject = `Special Offer at ${restaurant.name}`;
        message = custom_message || `Don't miss our special offer! Check out our menu for limited-time deals.`;
        break;
      default:
        subject = `Update from ${restaurant.name}`;
        message = custom_message || `We have an update for you from ${restaurant.name}!`;
    }

    // If customer_emails provided, send emails
    let emails_sent = 0;
    let email_errors = [];

    if (customer_emails && Array.isArray(customer_emails) && customer_emails.length > 0 && resend) {
      for (const email of customer_emails) {
        try {
          await resend.emails.send({
            from: process.env.FROM_EMAIL || 'MagicPlate <noreply@magicplate.info>',
            to: email,
            subject: subject,
            html: `
              <!DOCTYPE html>
              <html>
              <head>
                <style>
                  body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                  .header { background: linear-gradient(135deg, #4caf50, #66bb6a); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                  .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                  .button { display: inline-block; background: #4caf50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header">
                    <h1>${restaurant.name}</h1>
                  </div>
                  <div class="content">
                    <p>${message}</p>
                    ${menuData ? `<a href="${menuData.url}" class="button">View Menu</a>` : ''}
                  </div>
                </div>
              </body>
              </html>
            `
          });
          emails_sent++;
        } catch (emailError) {
          email_errors.push({ email, error: emailError.message });
        }
      }
    }

    res.json({
      success: true,
      restaurant_id: parseInt(restaurant_id),
      notification_type,
      emails_sent,
      email_errors: email_errors.length > 0 ? email_errors : undefined,
      message: `Notification processed. ${emails_sent} email(s) sent.`
    });

  } catch (error) {
    console.error('Error sending menu notifications:', error);
    res.status(500).json({ error: 'Failed to send menu notifications', details: error.message });
  }
});

/**
 * GET /api/marketing/menu/notify
 * Get notification settings for a restaurant
 */
router.get('/notify/:restaurant_id', async (req, res) => {
  try {
    const { restaurant_id } = req.params;
    
    // TODO: Fetch notification preferences from database
    res.json({
      restaurant_id: parseInt(restaurant_id),
      auto_notify: false,
      notification_types: ['new_item', 'menu_update', 'special_offer'],
      customer_list_size: 0
    });
  } catch (error) {
    console.error('Error fetching notification settings:', error);
    res.status(500).json({ error: 'Failed to fetch notification settings' });
  }
});

module.exports = router;
