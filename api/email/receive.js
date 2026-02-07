// Resend Email Receiving Webhook
// Handles inbound emails sent to your Resend receiving address

const express = require('express');
const router = express.Router();
const { insert, findAll } = require('../../lib/db');

/**
 * POST /api/email/receive
 * Webhook endpoint for Resend to send inbound emails
 * 
 * Resend will POST to this endpoint when emails are received at:
 * <anything>@preneionte.resend.app
 */
router.post('/receive', async (req, res) => {
  try {
    // Resend webhook payload structure
    const { type, data } = req.body;

    // Verify this is an email.received event
    if (type !== 'email.received') {
      return res.status(200).json({ received: true, message: 'Event type not handled' });
    }

    const email = data;
    
    // Extract email details
    const fromEmail = email.from?.email || email.from;
    const fromName = email.from?.name || '';
    const toEmail = email.to || email.recipient;
    const subject = email.subject || '(No Subject)';
    const text = email.text || email.body?.text || '';
    const html = email.html || email.body?.html || '';
    const receivedAt = email.created_at || new Date().toISOString();

    console.log('📧 Received email:', {
      from: fromEmail,
      to: toEmail,
      subject: subject,
      receivedAt: receivedAt
    });

    // Store the received email in database (optional)
    try {
      await insert('received_emails', {
        from_email: fromEmail,
        from_name: fromName,
        to_email: toEmail,
        subject: subject,
        text_content: text,
        html_content: html,
        received_at: receivedAt,
        raw_data: JSON.stringify(email)
      });
    } catch (dbError) {
      console.error('Error storing email in database:', dbError);
      // Continue even if database storage fails
    }

    // Process the email based on recipient
    // You can route emails based on the "to" address
    const recipient = toEmail.toLowerCase();
    
    // Example: Handle replies to support emails
    if (recipient.includes('support') || recipient.includes('help')) {
      // Create support ticket
      try {
        await insert('support_tickets', {
          email: fromEmail,
          subject: `Re: ${subject}`,
          message: text || html,
          status: 'open',
          priority: 'normal',
          created_at: receivedAt
        });
        console.log('✅ Created support ticket from email');
      } catch (ticketError) {
        console.error('Error creating support ticket:', ticketError);
      }
    }

    // Example: Handle replies to outreach emails
    if (recipient.includes('sydney') || recipient.includes('outreach')) {
      // Log as a response to outreach
      console.log('📬 Outreach email reply received from:', fromEmail);
      // You could update lead status, send notification, etc.
    }

    // Always return 200 to acknowledge receipt
    res.status(200).json({
      success: true,
      message: 'Email received and processed',
      email_id: email.id || null
    });

  } catch (error) {
    console.error('Error processing received email:', error);
    // Still return 200 to prevent Resend from retrying
    res.status(200).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/email/receive
 * Health check endpoint
 */
router.get('/receive', (req, res) => {
  res.json({
    status: 'active',
    message: 'Email receiving webhook is ready',
    endpoint: '/api/email/receive',
    method: 'POST',
    instructions: 'Configure this URL in Resend dashboard under Webhooks'
  });
});

module.exports = router;
