# Fixed: Missing API Route

## The Issue
The `/api/run-automation` route wasn't showing up in Vercel logs because it wasn't explicitly added to the `rewrites` in `vercel.json`.

## What I Fixed
Added the route to `vercel.json`:
```json
{
  "source": "/api/run-automation",
  "destination": "/api/run-automation"
}
```

## Next Steps

1. **Wait for Vercel to redeploy** (should happen automatically after the git push)
   - Check: Deployments tab → Should see a new deployment starting

2. **After deployment finishes** (1-2 minutes):
   - Go to: Settings → Cron Jobs
   - Click: "Run" on `/api/run-automation`
   - Go to: Logs tab
   - You should now see `/api/run-automation` in the route filter!

3. **Check the results**:
   - Look for the automation logs
   - Should see restaurant scraping results

---

**The route should now be available!** Wait for the deployment to finish, then test it.
