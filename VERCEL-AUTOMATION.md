# Vercel Cron Automation Setup

## ✅ What's Been Set Up

1. **Automation Endpoint**: `/api/run-automation.js`
   - Scrapes restaurants from your configured area
   - Qualifies leads based on your criteria
   - Sends emails to qualified leads (with daily limit)
   - Returns detailed results

2. **Cron Schedule**: Daily at 9:00 AM UTC
   - Configured in `vercel.json`
   - Can be changed to any schedule you prefer

## 🚀 How It Works

### Daily Automation Flow

1. **Scraping** (Step 1)
   - Uses your `SEARCH_AREA` from `.env`
   - Scrapes via Google Places API (or Yelp/Outscraper)
   - Finds restaurant emails
   - Qualifies leads based on your scoring system

2. **Email Sending** (Step 2)
   - Filters qualified leads that have emails
   - Respects daily limit (default: 30 emails)
   - Sends personalized outreach emails via Resend
   - Tracks all sent emails in `data/sent-emails.json`

3. **Results** (Step 3)
   - Returns JSON with stats
   - Logs everything for monitoring

## 📋 Environment Variables Needed

Make sure these are set in **Vercel Dashboard** → **Settings** → **Environment Variables**:

```bash
# Required
GOOGLE_PLACES_API_KEY=AIza...your_key
RESEND_API_KEY=re_...your_key
FROM_EMAIL=sydney@magicplate.info
FROM_NAME="Sydney - MagicPlate"

# Configuration
SEARCH_AREA="Kansas City, MO"
MAX_REVIEWS=50
QUALIFICATION_THRESHOLD=20
EXCLUDE_DOORDASH=false
TARGET_INDEPENDENT=false

# Optional
MAX_EMAILS_PER_DAY=30  # Daily email limit (default: 30)
SEARCH_RADIUS=10        # Search radius in km
YELP_API_KEY=           # Optional alternative source
OUTSCRAPER_API_KEY=     # Optional alternative source
```

## ⚙️ Customizing the Schedule

Edit `vercel.json` to change when it runs:

```json
{
  "crons": [
    {
      "path": "/api/run-automation",
      "schedule": "0 9 * * *"  // Change this
    }
  ]
}
```

**Common Schedules:**
- `0 9 * * *` - Daily at 9:00 AM UTC
- `0 0 * * *` - Daily at midnight UTC
- `0 */6 * * *` - Every 6 hours
- `0 9 * * 1` - Every Monday at 9:00 AM UTC
- `0 9,15 * * *` - Twice daily at 9 AM and 3 PM UTC

Use [crontab.guru](https://crontab.guru) to create custom schedules.

## 🧪 Testing Locally

Test the automation endpoint before deploying:

```bash
# Start local server
npm run dev

# In another terminal, trigger the automation
curl http://localhost:3000/api/run-automation
```

Or test directly with Node:

```bash
node -e "require('./api/run-automation.js')({method:'GET'}, {status: (c)=>c, json: (d)=>console.log(JSON.stringify(d,null,2))})"
```

## 🚢 Deploying to Vercel

1. **Push to GitHub** (if not already):
   ```bash
   git add .
   git commit -m "Add Vercel cron automation"
   git push
   ```

2. **Deploy on Vercel**:
   - If connected to GitHub, it auto-deploys
   - Or run: `vercel --prod`

3. **Verify Cron Job**:
   - Go to Vercel Dashboard → Your Project → Settings → Cron Jobs
   - You should see `/api/run-automation` scheduled

4. **Test the Endpoint**:
   ```bash
   curl https://your-project.vercel.app/api/run-automation
   ```

## 📊 Monitoring

### View Logs
- Vercel Dashboard → Your Project → Logs
- Filter by `/api/run-automation`

### Check Results
The endpoint returns JSON with stats:
```json
{
  "success": true,
  "duration": "45.23s",
  "scraping": {
    "totalLeads": 50,
    "qualifiedLeads": 20,
    "leadsWithEmails": 15
  },
  "emailing": {
    "attempted": 15,
    "successful": 12,
    "failed": 3
  }
}
```

### Track Sent Emails
Check `data/sent-emails.json` (stored in Vercel's file system, or use a database for persistence)

## ⚠️ Important Notes

1. **Vercel Free Tier Limits**:
   - 60 seconds max execution time per cron job
   - 10 cron jobs max
   - 100GB-hours compute time/month

2. **Rate Limiting**:
   - Default: 30 emails per day (configurable via `MAX_EMAILS_PER_DAY`)
   - Adjust based on your Resend limits (3,000/month free tier)

3. **Error Handling**:
   - Automation continues even if some emails fail
   - All errors are logged and returned in response

4. **Data Persistence**:
   - JSON files work for MVP
   - Consider database (MongoDB, Supabase) for production scale

## 🔧 Troubleshooting

**Cron job not running?**
- Check Vercel Dashboard → Settings → Cron Jobs
- Verify the schedule is correct
- Check logs for errors

**"Timeout" errors?**
- Reduce `MAX_EMAILS_PER_DAY` (default: 30)
- Reduce `SEARCH_RADIUS` to scrape fewer leads
- Split into multiple cron jobs (morning/evening)

**No emails sent?**
- Check `RESEND_API_KEY` is set in Vercel
- Verify domain is verified in Resend dashboard
- Check logs for specific errors

**"No API keys configured"?**
- Make sure `GOOGLE_PLACES_API_KEY` is set in Vercel environment variables
- Redeploy after adding environment variables

## 🎯 Next Steps

1. **Add Environment Variables** to Vercel
2. **Deploy** the updated code
3. **Test** the endpoint manually first
4. **Monitor** the first few cron runs
5. **Adjust** schedule/limits as needed

---

**Ready to automate!** 🚀 Your outreach will now run daily automatically.
