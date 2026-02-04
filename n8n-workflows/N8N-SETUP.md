# n8n Workflow Setup for MagicPlate.ai

This guide will help you set up the automated outreach workflow in n8n.

## Prerequisites

1. **n8n instance** (self-hosted or cloud)
2. **Resend API key**: `re_9Va9PPPZ_LQ6od53eR2RWWr35piKNFrj3`
3. **Verified domain**: `magicplate.info` in Resend dashboard

## Step 1: Import the Workflow

1. Open your n8n instance
2. Click **Workflows** → **Import from File**
3. Select `n8n-workflows/magicplate-outreach.json`
4. The workflow will be imported with all nodes

## Step 2: Configure Resend API Credential

1. In n8n, go to **Credentials** → **Create New**
2. Search for **HTTP Header Auth**
3. Configure:
   - **Name**: `Resend API Key`
   - **Header Name**: `Authorization`
   - **Header Value**: `Bearer re_9Va9PPPZ_LQ6od53eR2RWWr35piKNFrj3`
4. Save the credential

5. In the workflow, click on **"Send Email via Resend"** node
6. Under **Credentials**, select **"Resend API Key"**
7. Do the same for **"Send Follow-up Email"** node

## Step 3: Configure File Paths

The workflow reads from your local file system. You have two options:

### Option A: Set Environment Variable (Recommended)

1. In n8n settings, add environment variable:
   - **Name**: `WORKSPACE_PATH`
   - **Value**: `/Users/sydneyrenay/magicplate` (or your full path)

### Option B: Update File Paths Manually

1. Click on **"Read Qualified Leads File"** node
2. Update the file path to absolute path:
   ```
   /Users/sydneyrenay/magicplate/data/qualified-leads.json
   ```

3. Do the same for **"Read Sent Emails"** node:
   ```
   /Users/sydneyrenay/magicplate/data/sent-emails.json
   ```

## Step 4: Set Up Resend Webhook (Optional - for email replies)

1. In Resend dashboard, go to **Webhooks**
2. Click **Add Webhook**
3. Set webhook URL to your n8n instance:
   ```
   https://your-n8n-instance.com/webhook/resend-webhook
   ```
4. Select events: **`email.replied`**
5. Save the webhook

6. In n8n, make sure the **"Resend Webhook - Email Replies"** node is activated
7. Copy the webhook URL from the node and use it in Resend dashboard

## Step 5: Configure Schedule Triggers

### Daily Outreach Trigger

1. Click on **"Schedule Trigger - Daily Outreach"** node
2. Set schedule (default: every 24 hours)
3. Adjust as needed (e.g., every 12 hours, weekdays only, etc.)

### Follow-up Trigger

1. Click on **"Schedule Trigger - Follow-ups"** node
2. Set schedule (default: every 24 hours)
3. This will check for leads that need follow-up (emailed 3+ days ago)

## Step 6: Test the Workflow

1. Make sure you have qualified leads:
   ```bash
   npm run scrape
   ```

2. In n8n, click **Execute Workflow** (or wait for scheduled trigger)

3. Check the execution logs to see:
   - How many leads were processed
   - Which emails were sent
   - Any errors

4. Verify emails were sent:
   ```bash
   npm run track
   ```

## Workflow Features

### Main Outreach Flow
- ✅ Reads `data/qualified-leads.json`
- ✅ Filters for unsent leads
- ✅ Loops through each lead
- ✅ Waits 2 seconds between emails (rate limiting)
- ✅ Sends personalized email via Resend
- ✅ Updates lead status to "emailed"
- ✅ Tracks in `data/sent-emails.json`

### Follow-up Flow
- ✅ Reads `data/sent-emails.json`
- ✅ Filters for emails sent 3+ days ago
- ✅ Sends follow-up email
- ✅ Updates tracking

### Email Reply Handling
- ✅ Webhook receives replies from Resend
- ✅ Updates tracking with reply information
- ✅ Marks lead as "replied"

## Customization

### Change Email Template

Edit the **"Prepare Email Content"** node to customize:
- Personalized hooks
- Email content
- Subject lines

### Change Follow-up Timing

Edit the **"Filter - Needs Follow-up"** node:
- Change `days` value (currently 3)
- Adjust the condition as needed

### Change Rate Limiting

Edit the **"Wait Between Emails"** node:
- Change `amount` (currently 2 seconds)
- Adjust based on your Resend limits

## Troubleshooting

### "File not found" errors
- Make sure file paths are correct
- Check that `npm run scrape` has been run
- Verify files exist in `data/` directory

### "Authentication failed" errors
- Verify Resend API key is correct
- Check credential is properly configured
- Make sure domain is verified in Resend

### Emails not sending
- Check Resend dashboard for errors
- Verify domain is verified
- Check rate limits in Resend plan

### Webhook not receiving replies
- Verify webhook URL is correct in Resend
- Check n8n webhook node is activated
- Test webhook manually

## Integration with Your Scripts

This workflow works alongside your Node.js scripts:

1. **Scrape leads**: `npm run scrape` (creates `qualified-leads.json`)
2. **n8n sends emails**: Automatically processes leads
3. **Track results**: `npm run track` (reads `sent-emails.json`)

You can also trigger the workflow manually via webhook:
```bash
curl -X POST https://your-n8n-instance.com/webhook/new-leads \
  -H "Content-Type: application/json" \
  -d '{"trigger": "manual"}'
```

## Next Steps

1. ✅ Import workflow
2. ✅ Configure credentials
3. ✅ Set up file paths
4. ✅ Test with a few leads
5. ✅ Activate schedule triggers
6. ✅ Monitor results

---

**Need help?** Check the n8n documentation or the workflow's sticky note for more details.
