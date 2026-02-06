# Resend Automation - Why It Didn't Run Today

## ✅ What's Configured

1. **Cron Job**: Set in `vercel.json` to run daily at 9 AM UTC
2. **Automation Endpoint**: `/api/run-automation.js` exists and is ready
3. **Email Service**: Resend is configured in `config/email-config.js`

## 🔍 Why It Might Not Have Run

### Most Likely Causes:

1. **Cron Job Not Activated in Vercel**
   - The cron needs to be deployed and activated
   - Go to: Vercel Dashboard → Your Project → Settings → Cron Jobs
   - Should see: `/api/run-automation` with status "Active"

2. **Missing Environment Variables in Vercel**
   - Vercel needs these env vars (separate from your local `.env`):
     - `GOOGLE_PLACES_API_KEY`
     - `RESEND_API_KEY`
     - `FROM_EMAIL=sydney@magicplate.info`
     - `FROM_NAME=Sydney - MagicPlate`
     - `SEARCH_AREA=Kansas City, MO`
     - `MAX_EMAILS_PER_DAY=30` (optional)

3. **Time Zone Confusion**
   - Cron is set to `0 9 * * *` = **9 AM UTC**
   - That's **4 AM EST** / **1 AM PST**
   - If you expected it at a different time, that's why it didn't run

4. **Project Not Deployed**
   - Cron only runs on deployed projects
   - Check if your latest deployment succeeded

## 🚀 Quick Fix Steps

### Step 1: Verify Cron Job in Vercel (2 minutes)

1. Go to: https://vercel.com/dashboard
2. Select your `magicplate` project
3. Click **Settings** → **Cron Jobs**
4. **What you should see:**
   - Path: `/api/run-automation`
   - Schedule: `0 9 * * *`
   - Status: **Active** (not Paused)

**If it's NOT there:**
- Make sure `vercel.json` is committed to GitHub
- Push to GitHub: `git push origin main`
- Vercel will auto-deploy
- Wait 2-3 minutes, then check again

### Step 2: Add Environment Variables to Vercel (5 minutes)

1. In Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
2. Add these (if missing):

```bash
GOOGLE_PLACES_API_KEY=AIzaSyBg90qetc06qivgBX9b-kJlxVVXuBz_FMI
RESEND_API_KEY=re_9Va9PPPZ_LQ6od53eR2RWWr35piKNFrj3
FROM_EMAIL=sydney@magicplate.info
FROM_NAME=Sydney - MagicPlate
SEARCH_AREA=Kansas City, MO
MAX_EMAILS_PER_DAY=30
```

3. **Important**: Select **all environments** (Production, Preview, Development)
4. Click **Save**

### Step 3: Redeploy (1 minute)

After adding env vars, redeploy:
- Go to **Deployments** tab
- Click **⋯** on latest deployment
- Click **Redeploy**

OR just push a commit:
```bash
git add .
git commit -m "Update automation config"
git push
```

### Step 4: Test Manually (1 minute)

Test if the endpoint works:
```bash
curl https://your-project.vercel.app/api/run-automation
```

Or visit in browser: `https://magicplate.info/api/run-automation`

**Expected response:**
```json
{
  "success": true,
  "scraping": { ... },
  "emailing": { ... }
}
```

### Step 5: Check Execution Logs

1. Go to **Deployments** → **Latest**
2. Click **Functions** tab
3. Find `/api/run-automation`
4. Click to see execution logs
5. Check if it ran today and what happened

## ⏰ Change the Schedule (Optional)

If you want it to run at a different time, edit `vercel.json`:

```json
"crons": [
  {
    "path": "/api/run-automation",
    "schedule": "0 14 * * *"  // 2 PM UTC = 9 AM EST
  }
]
```

**Common schedules:**
- `0 9 * * *` = 9 AM UTC (4 AM EST)
- `0 14 * * *` = 2 PM UTC (9 AM EST)
- `0 17 * * *` = 5 PM UTC (12 PM EST)

Use https://crontab.guru to create custom schedules.

## ✅ Verification Checklist

- [ ] Cron job shows as "Active" in Vercel Dashboard
- [ ] All environment variables are set in Vercel
- [ ] Latest deployment succeeded
- [ ] Manual test of `/api/run-automation` works
- [ ] Execution logs show the function ran (check tomorrow at 9 AM UTC)

## 🐛 Still Not Working?

1. **Check Vercel Function Logs:**
   - Deployments → Latest → Functions → `/api/run-automation`
   - Look for error messages

2. **Verify Resend Domain:**
   - Go to https://resend.com/domains
   - Make sure `magicplate.info` is verified
   - DNS records should be set

3. **Test Resend API Key:**
   ```bash
   curl -X POST https://api.resend.com/emails \
     -H "Authorization: Bearer re_9Va9PPPZ_LQ6od53eR2RWWr35piKNFrj3" \
     -H "Content-Type: application/json" \
     -d '{"from":"sydney@magicplate.info","to":"your-email@example.com","subject":"Test","html":"<p>Test</p>"}'
   ```

4. **Check Google Places API:**
   - Make sure API key is valid
   - Places API is enabled in Google Cloud

## 📊 Monitor Automation

After fixing, monitor:
- **Vercel Dashboard** → Deployments → Functions → Execution logs
- **Resend Dashboard** → Emails → See sent emails
- Check `data/sent-emails.json` (if accessible)

---

**Next Run**: The cron will run tomorrow at 9 AM UTC (or whatever time you set). You can also trigger it manually by visiting the endpoint URL.
