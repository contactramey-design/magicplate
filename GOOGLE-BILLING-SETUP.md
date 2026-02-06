# Enable Google Cloud Billing for Places API

## The Error
```
REQUEST_DENIED - You must enable Billing on the Google Cloud Project
```

This means your Google Cloud Project doesn't have billing enabled. **Even though Places API has a free tier, billing must be enabled.**

## Quick Fix (5 minutes)

### Step 1: Go to Google Cloud Console
1. Visit: https://console.cloud.google.com/project/_/billing/enable
2. Or go to: https://console.cloud.google.com → Select your project → Billing

### Step 2: Enable Billing
1. Click **"Link a billing account"** or **"Create billing account"**
2. If you don't have a billing account:
   - Click **"Create billing account"**
   - Fill in your information
   - Add a payment method (credit card)
   - **Don't worry - you won't be charged unless you exceed the free tier**

### Step 3: Link to Your Project
1. Select your project (the one with your Places API key)
2. Link the billing account to the project
3. Wait 1-2 minutes for it to activate

## Free Tier Limits

**Google Places API Free Tier:**
- **$200 free credit per month**
- Text Search: $32 per 1,000 requests
- Place Details: $17 per 1,000 requests
- **You can make ~6,000 searches per month for FREE**

**For your automation:**
- Running daily = ~30 searches/month
- Well within the free tier
- **You won't be charged anything**

## Verify It's Working

After enabling billing:
1. Wait 2-3 minutes
2. Go back to Vercel → Settings → Cron Jobs
3. Click **"Run"** on `/api/run-automation`
4. Check logs - should see restaurants now!

## Cost Estimate

**Your usage:**
- 1 automation run = ~1-2 API calls
- Daily runs = ~30-60 calls/month
- **Cost: $0 (well within free tier)**

**Even if you scale up:**
- 100 runs/month = ~200 API calls = ~$6.40/month
- Still very affordable

## Troubleshooting

**"Billing account already exists"**
- Just link it to your project

**"Payment method declined"**
- Check your card details
- Try a different payment method

**"Still getting REQUEST_DENIED"**
- Wait 2-3 minutes after enabling
- Make sure billing is linked to the correct project
- Check that Places API is enabled in APIs & Services

---

**Bottom line:** Enable billing → Wait 2 minutes → Test again → Should work! 🎉
