# Your Personalized API Setup Guide - Step by Step

## What You Already Have

Based on your files, you have these API keys documented:

- ✅ RESEND_API_KEY: `re_9Va9PPPZ_LQ6od53eR2RWWr35piKNFrj3`
- ✅ GOOGLE_PLACES_API_KEY: `AIzaSyBg90qetc06qivgBX9b-kJlxVVXuBz_FMI`
- ✅ LEONARDO_API_KEY: `02a4b18f-77d5-42ee-b68b-beb43e277849`
- ✅ REPLICATE_API_TOKEN: `YOUR_REPLICATE_API_TOKEN`

## What Still Needs to Be Done

1. Add keys to `.env` file (they're not loaded yet)
2. Verify Resend domain (magicplate.info)
3. Enable Google Cloud billing (required even for free tier)
4. Test everything works
5. Deploy keys to Vercel

## Step-by-Step Setup (In Order)

### STEP 1: Add API Keys to .env File (5 minutes)

**Why:** Your code reads keys from this file. Without it, nothing works.

**What to do:**

1. Open your project folder: `/Users/sydneyrenay/magicplate`
2. Find the `.env` file (it might be hidden - use Cmd+Shift+. to show hidden files)
3. Open `.env` in your code editor
4. Add these lines (copy exactly):

```bash
# Email Service
RESEND_API_KEY=re_9Va9PPPZ_LQ6od53eR2RWWr35piKNFrj3
FROM_EMAIL=sydney@magicplate.info
FROM_NAME="Sydney - MagicPlate"

# Restaurant Scraping
GOOGLE_PLACES_API_KEY=AIzaSyBg90qetc06qivgBX9b-kJlxVVXuBz_FMI

# Image Enhancement
LEONARDO_API_KEY=02a4b18f-77d5-42ee-b68b-beb43e277849
REPLICATE_API_TOKEN=YOUR_REPLICATE_API_TOKEN

# Search Configuration
SEARCH_AREA="Los Angeles, CA"
```

5. Save the file
6. Test it works:
   ```bash
   node scripts/test-all-automation.js
   ```
   You should see ✅ for email and scraping configs now.

**OR use the script:**

```bash
node add-all-keys.js
```

This will automatically add all keys to your `.env` file.

---

### STEP 2: Verify Resend Domain (10 minutes)

**Why:** Resend won't send emails until your domain is verified. This proves you own magicplate.info.

**What to do:**

1. Go to: https://resend.com
2. Sign in with your account
3. Click "Domains" in the left sidebar
4. Click "Add Domain" button
5. Enter: `magicplate.info`
6. Click "Add"
7. Resend will show you DNS records to add - they'll look like:
   ```
   Type: TXT
   Name: @
   Value: resend-domain-verification=abc123...
   ```
8. Go to where you manage your domain (GoDaddy, Namecheap, etc.)
9. Add the DNS records Resend provided
10. Wait 5-10 minutes
11. Go back to Resend dashboard
12. Click "Verify" - should show ✅ Verified

**If you don't know where your domain is:**

- Check your email for domain purchase receipt
- Common registrars: GoDaddy, Namecheap, Google Domains, Cloudflare

**Quick Check:**
- Go to: https://resend.com/domains
- If you see `magicplate.info` with a ✅ checkmark, you're done!
- If it shows "Pending" or "Unverified", you need to add DNS records

---

### STEP 3: Enable Google Cloud Billing (10 minutes)

**Why:** Google requires billing to be enabled even for free tier. You won't be charged unless you exceed $200/month.

**What to do:**

1. Go to: https://console.cloud.google.com
2. Sign in with your Google account
3. At the top, click the project dropdown (should show your project name)
4. If you don't have a project:
   - Click "New Project"
   - Name: "MagicPlate"
   - Click "Create"
   - Wait 10 seconds
5. Click the hamburger menu (☰) in top left
6. Click "Billing"
7. Click "Link a billing account" or "Create billing account"
8. If creating new:
   - Fill in your info
   - Add credit card (required but won't charge unless you exceed free tier)
   - Click "Submit"
9. Select your billing account
10. Link it to your project
11. Wait 1-2 minutes

**Verify Places API is enabled:**

1. Click hamburger menu (☰)
2. Click "APIs & Services" → "Library"
3. Search: "Places API"
4. Click on "Places API"
5. If it says "Enable", click it
6. Wait 10 seconds

**Restrict your API key (Security):**

1. Click hamburger menu (☰)
2. Click "APIs & Services" → "Credentials"
3. Find your API key (starts with AIza)
4. Click on it
5. Under "API restrictions", click "Restrict key"
6. Check "Places API" checkbox
7. Click "Save"

**Quick Check:**
- Go to: https://console.cloud.google.com/apis/library/places-backend.googleapis.com
- Should show "API enabled" (not "Enable" button)
- Go to: https://console.cloud.google.com/apis/credentials
- Your key should show "Restricted" under API restrictions

---

### STEP 4: Test Everything Works (5 minutes)

**Test locally:**

```bash
# Test all systems
node scripts/test-all-automation.js

# Should show ✅ for:
# - RESEND_API_KEY
# - GOOGLE_PLACES_API_KEY
# - Email configuration
# - Scraping configuration
```

**Test email (dry run - won't actually send):**

```bash
npm run email:preview
```

This shows you which restaurants would get emails without actually sending.

**Test scraping (will actually scrape):**

```bash
npm run scrape
```

This should find restaurants in Los Angeles, CA and save them to `data/qualified-leads.json`.

**What success looks like:**
- Test script shows ✅ for all required keys
- Email preview shows list of restaurants
- Scraping finds 20+ restaurants
- No error messages

---

### STEP 5: Deploy to Vercel (10 minutes)

**Why:** Your live site needs API keys too. They're separate from your local `.env` file.

**What to do:**

1. Go to: https://vercel.com
2. Sign in
3. Click on your MagicPlate project
4. Click "Settings" (top menu)
5. Click "Environment Variables" (left sidebar)
6. For EACH key below, click "Add New":

**Key 1: RESEND_API_KEY**
- Name: `RESEND_API_KEY`
- Value: `re_9Va9PPPZ_LQ6od53eR2RWWr35piKNFrj3`
- Environments: Check all (Production, Preview, Development)
- Click "Save"

**Key 2: GOOGLE_PLACES_API_KEY**
- Name: `GOOGLE_PLACES_API_KEY`
- Value: `AIzaSyBg90qetc06qivgBX9b-kJlxVVXuBz_FMI`
- Environments: Check all
- Click "Save"

**Key 3: LEONARDO_API_KEY**
- Name: `LEONARDO_API_KEY`
- Value: `02a4b18f-77d5-42ee-b68b-beb43e277849`
- Environments: Check all
- Click "Save"

**Key 4: REPLICATE_API_TOKEN**
- Name: `REPLICATE_API_TOKEN`
- Value: `YOUR_REPLICATE_API_TOKEN`
- Environments: Check all
- Click "Save"

**Key 5: FROM_EMAIL**
- Name: `FROM_EMAIL`
- Value: `sydney@magicplate.info`
- Environments: Check all
- Click "Save"

**Key 6: FROM_NAME**
- Name: `FROM_NAME`
- Value: `Sydney - MagicPlate`
- Environments: Check all
- Click "Save"

**Key 7: SEARCH_AREA**
- Name: `SEARCH_AREA`
- Value: `Los Angeles, CA`
- Environments: Check all
- Click "Save"

7. After adding all keys, go to "Deployments" tab
8. Click the "..." menu on latest deployment
9. Click "Redeploy"
10. Wait 2-3 minutes
11. Your site now has API keys!

**Quick Check:**
- Go to: https://vercel.com/your-project/settings/environment-variables
- Should see all 7 keys listed
- Latest deployment should show "Ready" status

---

## What Each Key Does

**RESEND_API_KEY** - Sends emails to restaurants
- Without it: Can't send outreach emails
- Free tier: 3,000 emails/month

**GOOGLE_PLACES_API_KEY** - Finds restaurants to contact
- Without it: Can't scrape restaurant data
- Free tier: $200 credit/month (~6,000 searches)

**LEONARDO_API_KEY** - Enhances menu photos
- Without it: Image enhancement feature won't work
- Used for: Photo restoration service

**REPLICATE_API_TOKEN** - Backup for image enhancement
- Without it: If Leonardo fails, no backup
- Used for: Alternative image processing

**FROM_EMAIL** - Your email address for sending
- Used in: All outgoing emails
- Should be: Your verified domain email

**FROM_NAME** - Your name in emails
- Used in: Email "From" field
- Shows as: "Sydney - MagicPlate"

**SEARCH_AREA** - Where to find restaurants
- Default: "Los Angeles, CA"
- Change this to target different cities

---

## Troubleshooting

**"API key not found" after adding to .env:**
- Make sure you saved the file
- Check for typos (no extra spaces before/after =)
- Restart your terminal/editor
- Run: `node scripts/test-all-automation.js` to verify

**"Domain not verified" in Resend:**
- Check DNS records are added correctly at your domain registrar
- Wait 10-15 minutes for DNS to propagate
- Check Resend dashboard for specific error message
- Make sure you added ALL DNS records Resend provided

**"REQUEST_DENIED" from Google:**
- Billing must be enabled (even for free tier)
- Wait 2-3 minutes after enabling billing
- Make sure Places API is enabled in APIs & Services
- Check that your API key is linked to the correct project

**"Keys not working on Vercel:**
- Make sure you added them to Environment Variables (not just .env)
- Make sure you redeployed after adding keys
- Check you selected all environments (Production, Preview, Development)
- Wait 2-3 minutes after redeploy

**"No restaurants found" when scraping:**
- Check GOOGLE_PLACES_API_KEY is correct
- Make sure billing is enabled
- Try a different SEARCH_AREA (e.g., "New York, NY")
- Check Google Cloud Console for API usage/errors

**"Emails not sending":**
- Check Resend domain is verified
- Check RESEND_API_KEY is correct
- Check Resend dashboard for errors
- Make sure FROM_EMAIL matches your verified domain

---

## Next Steps After Setup

Once everything is set up:

1. **Test the full workflow:**
   ```bash
   npm run scrape          # Find restaurants
   npm run email:preview   # See who would get emails
   npm run email:test      # Send to 5 restaurants (test)
   ```

2. **Start using it:**
   ```bash
   npm run scrape          # Find new restaurants
   npm run email           # Send to all qualified leads
   npm run track           # See results
   ```

3. **Monitor your usage:**
   - Resend: https://resend.com/dashboard (check email count)
   - Google Cloud: https://console.cloud.google.com/billing (check API usage)
   - Vercel: https://vercel.com/your-project (check deployment logs)

---

## Quick Reference

**Your API Keys:**
- Resend: `re_9Va9PPPZ_LQ6od53eR2RWWr35piKNFrj3`
- Google Places: `AIzaSyBg90qetc06qivgBX9b-kJlxVVXuBz_FMI`
- Leonardo: `02a4b18f-77d5-42ee-b68b-beb43e277849`
- Replicate: `YOUR_REPLICATE_API_TOKEN`

**Important Links:**
- Resend Dashboard: https://resend.com
- Google Cloud Console: https://console.cloud.google.com
- Vercel Dashboard: https://vercel.com
- Test Script: `node scripts/test-all-automation.js`

**Quick Commands:**
```bash
# Test everything
node scripts/test-all-automation.js

# Add keys automatically
node add-all-keys.js

# Test scraping
npm run scrape

# Test email (dry run)
npm run email:preview
```

---

**You're all set!** Follow these steps in order and your automation will be fully functional! 🚀
