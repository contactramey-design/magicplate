# Verify Steps 2 & 3 Are Complete

## Step 2: Resend Domain Verification

**Quick Check:**
1. Go to: https://resend.com/domains
2. Look for `magicplate.info`
3. Should show: ✅ **Verified** (green checkmark)

**If verified:**
- ✅ You're done with Step 2!
- Emails will send from sydney@magicplate.info

**If not verified:**
- Status shows "Pending" or "Unverified"
- Need to add DNS records (see YOUR_PERSONALIZED_SETUP.md Step 2)

---

## Step 3: Google Cloud Billing

**Quick Check:**
1. Go to: https://console.cloud.google.com/billing
2. Should show your project linked to a billing account
3. Status should be "Active"

**Verify Places API:**
1. Go to: https://console.cloud.google.com/apis/library/places-backend.googleapis.com
2. Should show "API enabled" (not "Enable" button)

**If both are done:**
- ✅ Billing is enabled
- ✅ Places API is enabled
- You're done with Step 3!

**If not:**
- See YOUR_PERSONALIZED_SETUP.md Step 3 for instructions

---

## Test Everything (Step 4)

Once Steps 2 & 3 are verified, test:

```bash
# Test all systems
node scripts/test-all-automation.js

# Test scraping (will actually scrape restaurants)
npm run scrape

# Test email (dry run - won't send)
npm run email:preview
```

**What success looks like:**
- Test script shows ✅ for required keys
- Scraping finds restaurants (check `data/qualified-leads.json`)
- Email preview shows list of restaurants
- No "REQUEST_DENIED" errors
- No "domain not verified" errors

---

## Next: Deploy to Vercel (Step 5)

Once everything works locally, add keys to Vercel and redeploy.

See YOUR_PERSONALIZED_SETUP.md Step 5 for detailed instructions.
