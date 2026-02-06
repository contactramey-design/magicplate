# ✅ Fixes Applied to Google Places API Scraper

## Changes Made

### 1. Simplified Query (Most Important Fix)
- **Before:** `"independent restaurants Kansas City, MO -site:doordash.com"`
- **After:** `"restaurants Kansas City, MO"`
- **Why:** The "independent" keyword and DoorDash exclusion were too restrictive and causing 0 results

### 2. Removed Invalid DoorDash Exclusion
- **Removed:** `-site:doordash.com` from query
- **Why:** This is web search syntax, not Places API syntax. It doesn't work in Google Places API.

### 3. Changed Default for TARGET_INDEPENDENT
- **Before:** Default was `true` (only independent restaurants)
- **After:** Default is `false` (all restaurants)
- **Why:** Broader search = more results. Can filter chains later if needed.

### 4. Added Better Error Logging
- Now shows the exact query being used
- Shows API error messages if they occur
- Shows helpful suggestions if no results found
- Shows how many places were found

### 5. Post-Filter for Independent Restaurants
- If `TARGET_INDEPENDENT=true` is set, filters out chains AFTER getting results
- Uses a list of common chain indicators
- This way we get results first, then filter

## What This Means

The scraper will now:
1. ✅ Search for ALL restaurants (not just independent)
2. ✅ Get more results (broader search)
3. ✅ Show better error messages if something fails
4. ✅ Still filter chains if you set `TARGET_INDEPENDENT=true` in Vercel

## Next Steps

1. **Commit and push these changes:**
   ```bash
   git add scripts/scrape-restaurants.js api/run-automation.js
   git commit -m "Fix Google Places API scraper - simplify query for better results"
   git push
   ```

2. **Wait for Vercel to redeploy** (or manually redeploy)

3. **Test the automation again:**
   - Go to Vercel → Settings → Cron Jobs
   - Click "Run" on `/api/run-automation`
   - Check logs to see if it finds restaurants now

4. **If you want only independent restaurants:**
   - Add `TARGET_INDEPENDENT=true` to Vercel environment variables
   - It will filter chains after getting results

## Expected Results

You should now see:
- ✅ More than 0 results
- ✅ Logs showing "Found X places from Google Maps"
- ✅ Restaurants being scraped and qualified
- ✅ Emails being sent (if restaurants have emails)

---

**Note:** If you still get 0 results, check:
1. Google Places API is enabled in Google Cloud Console
2. API key has no restrictions blocking Vercel
3. Billing is set up (Places API requires billing)
4. Try a different city name in `SEARCH_AREA`
