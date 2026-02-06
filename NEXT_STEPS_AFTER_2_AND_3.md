# Next Steps - After Steps 2 & 3

Since you've completed Steps 2 & 3, here's what to do next:

## ✅ What You've Done
- Step 2: Resend domain verified ✅
- Step 3: Google Cloud billing enabled ✅

## 🎯 What's Next

### Step 4: Test Everything Works (5 minutes)

**Test 1: Verify API Keys Are Loaded**
```bash
node scripts/test-all-automation.js
```

Should show:
- ✅ RESEND_API_KEY
- ✅ GOOGLE_PLACES_API_KEY
- ✅ Email configuration
- ✅ Scraping configuration

**Test 2: Test Scraping (Actually Scrapes)**
```bash
npm run scrape
```

This will:
- Find restaurants in Los Angeles, CA
- Save to `data/qualified-leads.json`
- Show you how many were found

**What success looks like:**
- Finds 20+ restaurants
- No "REQUEST_DENIED" errors
- Creates/updates `data/qualified-leads.json`

**Test 3: Test Email (Dry Run - Won't Send)**
```bash
npm run email:preview
```

This shows:
- Which restaurants would get emails
- How many emails would be sent
- No actual emails sent (safe to run)

**What success looks like:**
- Shows list of restaurants
- Shows email addresses
- No "domain not verified" errors

---

### Step 5: Deploy to Vercel (10 minutes)

**Why:** Your live site needs API keys too. Local `.env` and Vercel are separate.

**What to do:**

1. **Go to Vercel:**
   - https://vercel.com
   - Sign in
   - Click on your MagicPlate project

2. **Add Environment Variables:**
   - Click "Settings" (top menu)
   - Click "Environment Variables" (left sidebar)
   - For EACH key, click "Add New":

**Add these 7 keys:**

1. `RESEND_API_KEY` = `re_9Va9PPPZ_LQ6od53eR2RWWr35piKNFrj3`
2. `GOOGLE_PLACES_API_KEY` = `AIzaSyBg90qetc06qivgBX9b-kJlxVVXuBz_FMI`
3. `LEONARDO_API_KEY` = `02a4b18f-77d5-42ee-b68b-beb43e277849`
4. `REPLICATE_API_TOKEN` = `YOUR_REPLICATE_API_TOKEN`
5. `FROM_EMAIL` = `sydney@magicplate.info`
6. `FROM_NAME` = `Sydney - MagicPlate`
7. `SEARCH_AREA` = `Los Angeles, CA`

**For each key:**
- Name: (the key name above)
- Value: (the value above)
- Environments: Check all ✅ (Production, Preview, Development)
- Click "Save"

3. **Redeploy:**
   - Go to "Deployments" tab
   - Click "..." on latest deployment
   - Click "Redeploy"
   - Wait 2-3 minutes

**Verify:**
- All 7 keys visible in Environment Variables
- Latest deployment shows "Ready"
- No deployment errors

---

## Quick Test Commands

```bash
# Test everything
node scripts/test-all-automation.js

# Test scraping
npm run scrape

# Test email (dry run)
npm run email:preview

# Check what's in your leads file
cat data/qualified-leads.json | head -50
```

---

## Troubleshooting

**"REQUEST_DENIED" when scraping:**
- Wait 2-3 minutes after enabling billing
- Make sure Places API is enabled
- Check billing is linked to correct project

**"Domain not verified" when testing email:**
- Check https://resend.com/domains
- Should show ✅ Verified
- If not, see YOUR_PERSONALIZED_SETUP.md Step 2

**Keys not working on Vercel:**
- Make sure you redeployed after adding keys
- Check all environments are selected
- Wait 2-3 minutes after redeploy

---

## You're Almost There!

Once Step 4 (testing) works, you're ready to:
- Start scraping restaurants
- Send outreach emails
- Use the full automation system

Then just add keys to Vercel (Step 5) and you're 100% done! 🎉
