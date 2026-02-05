# Complete Automation Setup Checklist

## ✅ What's Already Done

- [x] Google Places API key configured
- [x] Resend API key configured  
- [x] Email template updated
- [x] Automation endpoint created (`/api/run-automation.js`)
- [x] Vercel cron configured in `vercel.json`
- [x] Domain connected to Vercel (`magicplate.info`)

## 🔧 What You Need to Do

### Step 1: Verify Domain in Resend (5 minutes)

**Why:** Improves email deliverability - emails won't go to spam

1. Go to https://resend.com/domains
2. Click "Add Domain"
3. Enter: `magicplate.info`
4. Copy the DNS records shown
5. Add them to GoDaddy DNS:
   - Go to GoDaddy → My Products → DNS
   - Add the TXT records (DKIM and SPF)
   - Add the MX record
6. Wait 10-30 minutes
7. Click "Restart" in Resend
8. Toggle "Enable Sending" ON

### Step 2: Add Environment Variables to Vercel (5 minutes)

**Why:** Vercel needs your API keys to run automation

1. Go to https://vercel.com/dashboard
2. Select your `magicplate` project
3. Go to **Settings** → **Environment Variables**
4. Add these variables:

```
GOOGLE_PLACES_API_KEY=AIzaSyBzArcqfRqDguqL4d9F4xSAq2zbuEOyYNk
RESEND_API_KEY=re_9Va9PPPZ_LQ6od53eR2RWWr35piKNFrj3
FROM_EMAIL=sydney@magicplate.info
FROM_NAME=Sydney Ramey - MagicPlate.ai
SEARCH_AREA=Kansas City, MO
MAX_REVIEWS=50
QUALIFICATION_THRESHOLD=20
EXCLUDE_DOORDASH=false
TARGET_INDEPENDENT=false
MAX_EMAILS_PER_DAY=30
```

5. Make sure to select **Production**, **Preview**, and **Development** for each
6. Click "Save"

### Step 3: Deploy to Vercel (2 minutes)

```bash
# If connected to GitHub, just push:
git add .
git commit -m "Complete automation setup"
git push

# Or deploy directly:
vercel --prod
```

### Step 4: Verify Cron Job (2 minutes)

1. Go to Vercel Dashboard → Your Project → **Settings** → **Cron Jobs**
2. You should see:
   - Path: `/api/run-automation`
   - Schedule: `0 9 * * *` (Daily at 9 AM UTC)
   - Status: Active

### Step 5: Test the Automation (5 minutes)

**Option A: Test via Vercel Dashboard**
1. Go to your project → **Functions** tab
2. Find `/api/run-automation`
3. Click "Invoke" to test manually

**Option B: Test via curl**
```bash
curl https://your-project.vercel.app/api/run-automation
```

**Option C: Test locally first**
```bash
npm run scrape
npm run email:test
```

## 📊 Monitoring

### Check Logs
- Vercel Dashboard → Your Project → **Logs**
- Filter by `/api/run-automation`
- Look for success/error messages

### Check Results
The automation returns JSON:
```json
{
  "success": true,
  "scraping": {
    "totalLeads": 50,
    "qualifiedLeads": 20
  },
  "emailing": {
    "successful": 15,
    "failed": 5
  }
}
```

## ⚠️ Important Notes

1. **Vercel Free Tier Limits:**
   - 60 seconds max execution time
   - If timeout, reduce `MAX_EMAILS_PER_DAY` to 20-25

2. **Resend Limits:**
   - Free tier: 3,000 emails/month
   - Default: 30 emails/day = ~900/month (safe)

3. **Google Places API:**
   - ~$0.017 per 1,000 requests
   - Scraping 50 restaurants ≈ $0.01
   - Very cheap for testing

## 🎯 Success Criteria

You'll know it's working when:
- ✅ Cron job shows as "Active" in Vercel
- ✅ Logs show successful runs
- ✅ You receive emails from `sydney@magicplate.info`
- ✅ `data/sent-emails.json` gets updated (if using local storage)

## 🆘 Troubleshooting

**"Function timeout"**
- Reduce `MAX_EMAILS_PER_DAY` to 20
- Reduce `SEARCH_RADIUS` to 5km

**"No API keys configured"**
- Check Vercel environment variables are set
- Redeploy after adding variables

**"Domain not verified"**
- Check Resend dashboard
- Verify DNS records in GoDaddy
- Wait 30 minutes for propagation

**"Emails going to spam"**
- Complete domain verification in Resend
- Add SPF/DKIM records
- Wait 24-48 hours for reputation to build

---

**Once these steps are done, your automation will run daily at 9 AM UTC!** 🚀
