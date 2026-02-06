# Resend Automation Check - Why It Didn't Run Today

## Quick Diagnosis

### 1. Check Vercel Cron Job Status

Go to: **Vercel Dashboard → Your Project → Settings → Cron Jobs**

**What to look for:**
- ✅ `/api/run-automation` should be listed
- ✅ Status should be "Active" (not "Paused" or "Failed")
- ✅ Schedule should show: `0 9 * * *` (9 AM UTC daily)

**If it's NOT there or NOT active:**
- The cron job needs to be deployed
- Make sure `vercel.json` is committed and pushed to GitHub
- Redeploy the project on Vercel

### 2. Check Environment Variables in Vercel

Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**

**Required variables:**
```bash
GOOGLE_PLACES_API_KEY=your_key_here
RESEND_API_KEY=re_9Va9PPPZ_LQ6od53eR2RWWr35piKNFrj3
FROM_EMAIL=sydney@magicplate.info
FROM_NAME=Sydney - MagicPlate
SEARCH_AREA=Kansas City, MO
MAX_EMAILS_PER_DAY=30
```

**Check:**
- ✅ All variables are set
- ✅ No typos in variable names
- ✅ Values are correct (especially RESEND_API_KEY)

### 3. Check Recent Deployments

Go to: **Vercel Dashboard → Your Project → Deployments**

**What to look for:**
- ✅ Latest deployment succeeded
- ✅ `vercel.json` is included in the deployment
- ✅ Deployment happened after you added the cron job

### 4. Check Execution Logs

Go to: **Vercel Dashboard → Your Project → Deployments → Latest → Functions**

**Look for:**
- `/api/run-automation` function executions
- Any error messages
- Execution times (should show around 9 AM UTC if it ran)

### 5. Test the Endpoint Manually

**Option A: Via Browser/curl:**
```bash
curl https://your-project.vercel.app/api/run-automation
```

**Option B: Check Vercel Function Logs:**
- Go to Deployments → Latest → Functions → `/api/run-automation`
- Click "View Logs" to see if it executed

## Common Issues

### Issue: Cron job not showing in Vercel
**Fix:**
1. Make sure `vercel.json` is in your repo root
2. Commit and push to GitHub
3. Redeploy on Vercel (or let auto-deploy trigger)
4. Wait a few minutes, then check Cron Jobs again

### Issue: Cron shows but didn't run
**Possible causes:**
1. **Time zone confusion**: 9 AM UTC = 4 AM EST / 1 AM PST
   - Check what time it is in UTC when you expected it to run
2. **Project not deployed**: Cron only runs on deployed projects
3. **Environment variables missing**: Check Vercel env vars
4. **Function timeout**: Vercel has 60s limit for cron jobs

### Issue: Automation runs but no emails sent
**Check:**
1. `RESEND_API_KEY` is set in Vercel
2. Resend domain is verified (`magicplate.info`)
3. `FROM_EMAIL` matches verified domain
4. Check Vercel function logs for errors

## Quick Fix Steps

1. **Verify cron is configured:**
   ```bash
   # Check vercel.json exists and has cron config
   cat vercel.json
   ```

2. **Push to GitHub:**
   ```bash
   git add vercel.json
   git commit -m "Ensure cron job is configured"
   git push
   ```

3. **Check Vercel Dashboard:**
   - Settings → Cron Jobs → Should see `/api/run-automation`

4. **Add missing env vars:**
   - Settings → Environment Variables
   - Add any missing ones from the list above

5. **Test manually:**
   ```bash
   curl https://your-project.vercel.app/api/run-automation
   ```

## Time Zone Reference

The cron is set to `0 9 * * *` which is **9 AM UTC**.

**Convert to your time:**
- EST (UTC-5): 4:00 AM
- PST (UTC-8): 1:00 AM
- CST (UTC-6): 3:00 AM

If you want it to run at a different time, change the schedule in `vercel.json`.

## Next Steps

1. ✅ Check Vercel Dashboard for cron job status
2. ✅ Verify all environment variables are set
3. ✅ Test the endpoint manually
4. ✅ Check execution logs
5. ✅ Adjust schedule if needed
