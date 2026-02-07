# Resend Email Receiving Setup for magicplate.info

## Overview

This guide will help you set up email receiving for your `magicplate.info` domain using Resend's receiving address: `<anything>@preneionte.resend.app`

## Step 1: Configure Resend Receiving Address

1. **Go to Resend Dashboard**
   - Visit: https://resend.com/domains
   - Make sure `magicplate.info` is verified

2. **Set Up Receiving Address**
   - Your receiving address is: `<anything>@preneionte.resend.app`
   - This means you can receive emails at:
     - `sydney@preneionte.resend.app`
     - `support@preneionte.resend.app`
     - `info@preneionte.resend.app`
     - `contact@preneionte.resend.app`
     - Any other prefix you want!

## Step 2: Configure Webhook in Resend

1. **Go to Resend Webhooks**
   - Visit: https://resend.com/webhooks
   - Click **"Add Webhook"**

2. **Configure Webhook**
   - **Webhook URL**: `https://magicplate.info/api/email/receive`
   - **Events to Subscribe**:
     - ✅ `email.received` (required for receiving emails)
     - ✅ `email.delivered` (optional - for delivery tracking)
     - ✅ `email.bounced` (optional - for bounce tracking)
     - ✅ `email.complained` (optional - for spam complaints)

3. **Save the Webhook**
   - Resend will send a test webhook to verify the endpoint
   - Make sure your endpoint returns a 200 status code

## Step 3: Update Your Email Addresses

Update your email addresses to use the Resend receiving address:

### Recommended Email Addresses:
- **Main Contact**: `sydney@preneionte.resend.app`
- **Support**: `support@preneionte.resend.app`
- **Info**: `info@preneionte.resend.app`
- **Contact Form**: `contact@preneionte.resend.app`

### Update in Your Code:

1. **Update `.env` file:**
   ```bash
   FROM_EMAIL=sydney@preneionte.resend.app
   FROM_NAME="Sydney - MagicPlate"
   SUPPORT_EMAIL=support@preneionte.resend.app
   CONTACT_EMAIL=contact@preneionte.resend.app
   ```

2. **Update `server.js` contact form:**
   ```javascript
   // Change from:
   to: 'sydney@magicplate.info'
   
   // To:
   to: 'sydney@preneionte.resend.app'
   ```

## Step 4: Test Email Receiving

1. **Send a test email** to one of your receiving addresses:
   ```
   To: sydney@preneionte.resend.app
   Subject: Test Email
   Body: This is a test
   ```

2. **Check your server logs** - you should see:
   ```
   📧 Received email: { from: '...', to: '...', subject: '...' }
   ```

3. **Check the database** (if configured):
   - Emails are stored in the `received_emails` table
   - Support emails automatically create tickets

## Step 5: Database Setup (Optional)

If you want to store received emails in the database, add this table:

```sql
CREATE TABLE IF NOT EXISTS received_emails (
    email_id SERIAL PRIMARY KEY,
    from_email VARCHAR(255) NOT NULL,
    from_name VARCHAR(255),
    to_email VARCHAR(255) NOT NULL,
    subject VARCHAR(500),
    text_content TEXT,
    html_content TEXT,
    received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    raw_data JSONB,
    processed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_received_emails_to ON received_emails(to_email);
CREATE INDEX idx_received_emails_from ON received_emails(from_email);
CREATE INDEX idx_received_emails_received_at ON received_emails(received_at);
```

## How It Works

1. **Email arrives** at `<anything>@preneionte.resend.app`
2. **Resend processes** the email
3. **Resend sends webhook** to `https://magicplate.info/api/email/receive`
4. **Your server receives** the webhook payload
5. **Email is processed**:
   - Stored in database (optional)
   - Support emails create tickets
   - Outreach replies are logged
   - Custom routing based on recipient

## Email Routing Examples

### Support Emails
- **To**: `support@preneionte.resend.app` or `help@preneionte.resend.app`
- **Action**: Automatically creates a support ticket

### Outreach Replies
- **To**: `sydney@preneionte.resend.app` or `outreach@preneionte.resend.app`
- **Action**: Logs as outreach response, updates lead status

### General Contact
- **To**: `contact@preneionte.resend.app` or `info@preneionte.resend.app`
- **Action**: Stores email, sends notification

## Webhook Payload Structure

Resend sends webhooks in this format:

```json
{
  "type": "email.received",
  "data": {
    "id": "email_id",
    "from": {
      "email": "sender@example.com",
      "name": "Sender Name"
    },
    "to": "sydney@preneionte.resend.app",
    "subject": "Email Subject",
    "text": "Plain text content",
    "html": "<html>HTML content</html>",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

## Troubleshooting

### Webhook Not Receiving Emails

1. **Check webhook URL** is correct: `https://magicplate.info/api/email/receive`
2. **Verify domain** is verified in Resend
3. **Check server logs** for webhook requests
4. **Test endpoint** manually:
   ```bash
   curl -X GET https://magicplate.info/api/email/receive
   ```

### Emails Not Being Processed

1. **Check database connection** (if using database storage)
2. **Verify webhook payload** structure matches expected format
3. **Check server logs** for error messages
4. **Ensure endpoint returns 200** status code

### Domain Verification Issues

1. **Go to Resend Domains**: https://resend.com/domains
2. **Check DNS records** are correctly configured
3. **Wait for propagation** (can take up to 48 hours)
4. **Verify SPF, DKIM, DMARC** records are set

## Security Notes

- ✅ Webhook endpoint is public (required for Resend)
- ✅ No authentication needed (Resend validates webhook source)
- ✅ All emails are logged for security
- ✅ Support tickets are automatically created
- ⚠️ Consider adding rate limiting for production

## Next Steps

1. ✅ Configure webhook in Resend dashboard
2. ✅ Update email addresses in your code
3. ✅ Test receiving emails
4. ✅ Set up database table (optional)
5. ✅ Configure email routing rules
6. ✅ Set up notifications for important emails

---

**Your Receiving Address**: `<anything>@preneionte.resend.app`  
**Webhook URL**: `https://magicplate.info/api/email/receive`  
**Status**: Ready to configure! 🚀
