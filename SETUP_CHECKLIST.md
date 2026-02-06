# API Setup Checklist

Use this checklist to track your progress. Check off each item as you complete it.

## Step 1: Add Keys to .env File

- [ ] Opened `.env` file in code editor
- [ ] Added RESEND_API_KEY
- [ ] Added GOOGLE_PLACES_API_KEY
- [ ] Added LEONARDO_API_KEY
- [ ] Added REPLICATE_API_TOKEN
- [ ] Added FROM_EMAIL
- [ ] Added FROM_NAME
- [ ] Added SEARCH_AREA
- [ ] Saved the file
- [ ] Ran test: `node scripts/test-all-automation.js`
- [ ] Test shows ✅ for RESEND_API_KEY
- [ ] Test shows ✅ for GOOGLE_PLACES_API_KEY
- [ ] Test shows ✅ for email configuration
- [ ] Test shows ✅ for scraping configuration

**OR used the script:**
- [ ] Ran: `node add-all-keys.js`
- [ ] Script completed successfully

---

## Step 2: Verify Resend Domain

- [ ] Went to https://resend.com
- [ ] Signed in to account
- [ ] Clicked "Domains" in left sidebar
- [ ] Clicked "Add Domain"
- [ ] Entered `magicplate.info`
- [ ] Clicked "Add"
- [ ] Copied DNS records from Resend
- [ ] Went to domain registrar (GoDaddy, Namecheap, etc.)
- [ ] Added TXT DNS record
- [ ] Added other DNS records (if provided)
- [ ] Waited 5-10 minutes
- [ ] Went back to Resend dashboard
- [ ] Clicked "Verify"
- [ ] Domain shows ✅ Verified

**Quick Check:**
- [ ] Go to https://resend.com/domains
- [ ] See `magicplate.info` with ✅ checkmark

---

## Step 3: Enable Google Cloud Billing

- [ ] Went to https://console.cloud.google.com
- [ ] Signed in with Google account
- [ ] Selected or created "MagicPlate" project
- [ ] Clicked hamburger menu (☰)
- [ ] Clicked "Billing"
- [ ] Created or linked billing account
- [ ] Added credit card (if creating new)
- [ ] Linked billing to project
- [ ] Waited 1-2 minutes

**Enable Places API:**
- [ ] Clicked "APIs & Services" → "Library"
- [ ] Searched for "Places API"
- [ ] Clicked "Places API"
- [ ] Clicked "Enable" (if needed)
- [ ] Waited 10 seconds

**Restrict API Key:**
- [ ] Clicked "APIs & Services" → "Credentials"
- [ ] Found API key (starts with AIza)
- [ ] Clicked on the key
- [ ] Clicked "Restrict key" under API restrictions
- [ ] Checked "Places API" checkbox
- [ ] Clicked "Save"

**Quick Check:**
- [ ] Places API shows "API enabled"
- [ ] API key shows "Restricted" status

---

## Step 4: Test Everything Works

**Local Testing:**
- [ ] Ran: `node scripts/test-all-automation.js`
- [ ] All required tests show ✅
- [ ] No critical errors

**Email Test:**
- [ ] Ran: `npm run email:preview`
- [ ] Shows list of restaurants (or "No qualified leads")
- [ ] No error messages

**Scraping Test:**
- [ ] Ran: `npm run scrape`
- [ ] Found restaurants (check `data/qualified-leads.json`)
- [ ] No "REQUEST_DENIED" errors
- [ ] No "API key not found" errors

**Success Indicators:**
- [ ] Test script shows 80%+ pass rate
- [ ] Email preview works
- [ ] Scraping finds restaurants
- [ ] No critical errors in console

---

## Step 5: Deploy to Vercel

- [ ] Went to https://vercel.com
- [ ] Signed in
- [ ] Clicked on MagicPlate project
- [ ] Clicked "Settings"
- [ ] Clicked "Environment Variables"

**Added Keys:**
- [ ] Added RESEND_API_KEY
- [ ] Added GOOGLE_PLACES_API_KEY
- [ ] Added LEONARDO_API_KEY
- [ ] Added REPLICATE_API_TOKEN
- [ ] Added FROM_EMAIL
- [ ] Added FROM_NAME
- [ ] Added SEARCH_AREA
- [ ] Selected all environments for each key (Production, Preview, Development)

**Redeploy:**
- [ ] Went to "Deployments" tab
- [ ] Clicked "..." on latest deployment
- [ ] Clicked "Redeploy"
- [ ] Waited 2-3 minutes
- [ ] Deployment shows "Ready"

**Quick Check:**
- [ ] All 7 keys visible in Environment Variables
- [ ] Latest deployment successful
- [ ] No deployment errors

---

## Final Verification

- [ ] All steps above completed
- [ ] Test script shows all ✅
- [ ] Can scrape restaurants locally
- [ ] Can preview emails locally
- [ ] Vercel deployment successful
- [ ] Ready to use the system!

---

## If Something Doesn't Work

Check the troubleshooting section in `YOUR_PERSONALIZED_SETUP.md`:

- [ ] API key not found → Check .env file saved correctly
- [ ] Domain not verified → Check DNS records added
- [ ] REQUEST_DENIED → Check Google billing enabled
- [ ] Keys not working on Vercel → Check redeployed after adding keys

---

**Progress:** ___ / 50 items completed

**Status:** 
- [ ] Not started
- [ ] In progress
- [ ] Complete!

---

**Next:** Once all checked, you're ready to start using MagicPlate! 🎉
