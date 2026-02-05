# Automation Setup Status

## ✅ Completed

- [x] **Google Places API**: Configured and tested
- [x] **Resend API**: Configured and tested  
- [x] **Email Template**: Updated with MagicPlate.ai content
- [x] **Automation Endpoint**: Created at `/api/run-automation.js`
- [x] **Vercel Cron**: Configured in `vercel.json` (daily at 9 AM UTC)
- [x] **Local Environment**: All variables set in `.env`
- [x] **Domain**: `magicplate.info` connected to Vercel

## 🔧 Action Required (You Need to Do These)

### 1. Add Environment Variables to Vercel ⚠️ CRITICAL

**Location:** Vercel Dashboard → Your Project → Settings → Environment Variables

**File to reference:** `vercel-env-vars.txt` (contains all values)

**Steps:**
1. Go to https://vercel.com/dashboard
2. Select your `magicplate` project
3. Click **Settings** → **Environment Variables**
4. For each variable in `vercel-env-vars.txt`:
   - Click "Add New"
   - Paste the variable name and value
   - Select **Production**, **Preview**, AND **Development**
   - Click "Save"
5. After adding all variables, **redeploy** your project

### 2. Verify Domain in Resend (Recommended)

**Why:** Improves email deliverability

**Steps:**
1. Go to https://resend.com/domains
2. Click "Add Domain" → Enter `magicplate.info`
3. Copy the DNS records shown:
   - TXT record for DKIM
   - TXT record for SPF  
   - MX record
4. Add to GoDaddy:
   - Go to GoDaddy → My Products → DNS
   - Add each record
5. Wait 10-30 minutes
6. In Resend, click "Restart" → Toggle "Enable Sending" ON

### 3. Deploy to Vercel

```bash
# If connected to GitHub:
git add .
git commit -m "Complete automation setup"
git push

# Or deploy directly:
vercel --prod
```

### 4. Verify Cron Job

1. Vercel Dashboard → Your Project → **Settings** → **Cron Jobs**
2. Should see: `/api/run-automation` scheduled for `0 9 * * *`
3. Status should be "Active"

## 🧪 Testing

### Test Locally First
```bash
# Test scraping
npm run scrape

# Test email sending (5 test emails)
npm run email:test
```

### Test Automation Endpoint
After deploying to Vercel:
```bash
# Replace with your actual Vercel URL
curl https://your-project.vercel.app/api/run-automation
```

Or use Vercel Dashboard:
- Go to **Functions** tab
- Find `/api/run-automation`
- Click "Invoke"

## 📊 What Happens When Automation Runs

**Daily at 9:00 AM UTC:**

1. **Scraping Phase** (10-20 seconds)
   - Searches for restaurants in `SEARCH_AREA` (Kansas City, MO)
   - Uses Google Places API
   - Qualifies leads based on your criteria
   - Finds email addresses

2. **Email Phase** (30-45 seconds)
   - Sends up to 30 emails (MAX_EMAILS_PER_DAY)
   - Uses Resend API
   - Tracks success/failure
   - Personalizes each email

3. **Results**
   - Returns JSON with stats
   - Logs available in Vercel Dashboard

## 🎯 Success Indicators

You'll know it's working when:
- ✅ Cron job shows "Active" in Vercel
- ✅ Logs show successful runs (check Vercel Dashboard → Logs)
- ✅ You see emails being sent (check Resend dashboard)
- ✅ No timeout errors (if you see these, reduce MAX_EMAILS_PER_DAY)

## ⚠️ Important Limits

- **Vercel Free Tier**: 60 seconds max execution time
- **Resend Free Tier**: 3,000 emails/month
- **Google Places API**: ~$0.017 per 1,000 requests (very cheap)

## 🆘 Troubleshooting

**"Function timeout"**
- Reduce `MAX_EMAILS_PER_DAY` to 20 in Vercel env vars
- Reduce `SEARCH_RADIUS` to 5

**"No API keys configured"**
- Check Vercel environment variables are set
- Make sure you selected all environments (Production/Preview/Development)
- Redeploy after adding variables

**"Domain not verified"**
- Complete Step 2 above (Resend domain verification)
- Wait 30 minutes for DNS propagation

**"Emails going to spam"**
- Complete Resend domain verification
- Wait 24-48 hours for sender reputation

---

## 📝 Quick Reference

**Local Testing:**
```bash
npm run scrape          # Find restaurants
npm run email:test      # Send 5 test emails
npm run email           # Send to all qualified
npm run track           # View stats
```

**Vercel Automation:**
- Runs daily at 9 AM UTC automatically
- No action needed after setup
- Check logs in Vercel Dashboard

**Files:**
- `vercel-env-vars.txt` - Copy these to Vercel
- `SETUP-AUTOMATION.md` - Detailed setup guide
- `VERCEL-AUTOMATION.md` - Automation documentation

---

**Next Step:** Add environment variables to Vercel (see Step 1 above) 🚀
