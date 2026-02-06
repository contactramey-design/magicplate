/**
 * OpenClaw Skill: MagicPlate Email Automation
 * Handles email sending, campaigns, and follow-ups
 */

const { Resend } = require('resend');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const sendgrid = process.env.SENDGRID_API_KEY ? require('@sendgrid/mail') : null;

if (sendgrid) {
  sendgrid.setApiKey(process.env.SENDGRID_API_KEY);
}

/**
 * Send email to a restaurant
 */
async function sendEmailToRestaurant(restaurant, template = 'initialOutreach') {
  if (!resend && !sendgrid) {
    throw new Error('No email service configured. Set RESEND_API_KEY or SENDGRID_API_KEY');
  }

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

  const emailContent = {
    to: restaurant.email,
    from: {
      email: process.env.FROM_EMAIL || 'sydney@magicplate.info',
      name: process.env.FROM_NAME || 'Sydney - MagicPlate'
    },
    subject: 'Elevate Your Menu, Boost Revenue & Outshine the Competition',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 40px 30px; text-align: center; }
          .content { padding: 40px 30px; }
          .cta-button { display: inline-block; background: #10b981; color: white; padding: 16px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>MagicPlate.ai</h1>
            <p>Make Every Plate Magical ✨</p>
          </div>
          <div class="content">
            <p><strong>Hi ${restaurant.name || 'there'}!</strong></p>
            <p>My name is Sydney, and I'm reaching out from <strong>MagicPlate.ai</strong>. ${personalizedHook}</p>
            <p>We specialize in AI-powered menu photo enhancement, digital menu creation, and marketing automation – transforming your restaurant's online presence to drive more sales.</p>
            <p><strong>Starting at $299/month</strong> - Get your magical digital menu in 48 hours.</p>
            <div style="text-align: center;">
              <a href="https://magicplate.info" class="cta-button">Schedule a Free 15-Minute Call</a>
            </div>
            <p>📧 Reply to this email | 📞 (805) 668-9973</p>
            <p>Best,<br>Sydney Ramey<br>MagicPlate.ai</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Hi ${restaurant.name || 'there'}!

My name is Sydney, and I'm reaching out from MagicPlate.ai. ${personalizedHook}

We specialize in AI-powered menu photo enhancement, digital menu creation, and marketing automation.

Starting at $299/month - Get your magical digital menu in 48 hours.

Schedule a call: https://magicplate.info
Reply to this email | Call: (805) 668-9973

Best,
Sydney Ramey
MagicPlate.ai`
  };

  try {
    if (resend) {
      const result = await resend.emails.send(emailContent);
      return { success: true, id: result.data?.id, service: 'resend' };
    } else if (sendgrid) {
      await sendgrid.send(emailContent);
      return { success: true, service: 'sendgrid' };
    }
  } catch (error) {
    return { 
      success: false, 
      error: error.message || error.response?.body?.errors?.[0]?.message || 'Unknown error' 
    };
  }
}

/**
 * Send batch emails to qualified leads
 */
async function sendBatchEmails(maxEmails = null, dryRun = false) {
  const leadsPath = path.join(__dirname, '..', 'data', 'qualified-leads.json');
  const trackingPath = path.join(__dirname, '..', 'data', 'sent-emails.json');
  
  let leads = [];
  let tracking = [];
  
  try {
    const data = await fs.readFile(leadsPath, 'utf8');
    leads = JSON.parse(data);
  } catch (error) {
    throw new Error(`Could not read leads file: ${error.message}`);
  }
  
  try {
    const data = await fs.readFile(trackingPath, 'utf8');
    tracking = JSON.parse(data);
  } catch {
    tracking = [];
  }
  
  const sentEmails = new Set(tracking.map(t => t.email || t.restaurant_id));
  const unsentLeads = leads.filter(lead => 
    lead.email && !sentEmails.has(lead.email) && !sentEmails.has(lead.place_id)
  );
  
  if (maxEmails) {
    unsentLeads.splice(maxEmails);
  }
  
  const results = [];
  
  for (const lead of unsentLeads) {
    if (dryRun) {
      results.push({ 
        restaurant: lead.name, 
        email: lead.email, 
        status: 'would_send' 
      });
      continue;
    }
    
    const result = await sendEmailToRestaurant(lead);
    results.push({
      restaurant: lead.name,
      email: lead.email,
      ...result
    });
    
    if (result.success) {
      tracking.push({
        restaurant_id: lead.place_id,
        restaurant_name: lead.name,
        email: lead.email,
        sent_at: new Date().toISOString(),
        channel: 'email',
        status: 'sent'
      });
    }
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  if (!dryRun) {
    await fs.writeFile(trackingPath, JSON.stringify(tracking, null, 2));
  }
  
  return {
    total: unsentLeads.length,
    sent: results.filter(r => r.success || r.status === 'would_send').length,
    failed: results.filter(r => !r.success && r.status !== 'would_send').length,
    results
  };
}

module.exports = {
  sendEmailToRestaurant,
  sendBatchEmails
};
