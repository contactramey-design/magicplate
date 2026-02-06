# Troubleshooting Guide - Common Issues & Solutions

## Quick Diagnosis

First, run this to see what's wrong:
```bash
node scripts/test-all-automation.js
```

This will show you exactly what's missing or broken.

---

## API Key Issues

### Problem: "API key not found" or "RESEND_API_KEY is not set"

**Symptoms:**
- Test script shows ❌ for API keys
- Scripts fail with "API key not configured"

**Solutions:**

1. **Check .env file exists:**
   ```bash
   ls -la .env
   ```
   If it doesn't exist, create it:
   ```bash
   touch .env
   ```

2. **Check keys are in .env:**
   ```bash
   cat .env | grep RESEND_API_KEY
   ```
   Should show: `RESEND_API_KEY=re_...`

3. **Check for typos:**
   - No spaces around the `=` sign
   - Key name is exactly: `RESEND_API_KEY` (not `RESEND_KEY` or `RESEND_API`)
   - Value doesn't have quotes unless needed

4. **Make sure file is saved:**
   - In your editor, check the file shows as "saved" (no dot/circle)
   - Try closing and reopening the file

5. **Restart terminal/editor:**
   - Sometimes environment variables need a refresh
   - Close terminal and open new one
   - Or restart your code editor

6. **Use the script:**
   ```bash
   node add-all-keys.js
   ```
   This automatically adds all keys correctly.

---

## Resend Domain Issues

### Problem: "Domain not verified" or emails not sending

**Symptoms:**
- Resend dashboard shows domain as "Pending" or "Unverified"
- Emails fail with "domain not verified" error

**Solutions:**

1. **Check DNS records:**
   - Go to https://resend.com/domains
   - Click on `magicplate.info`
   - Copy the DNS records shown
   - Go to your domain registrar
   - Make sure ALL records are added exactly as shown

2. **Wait for DNS propagation:**
   - DNS changes can take 5-60 minutes
   - Wait at least 10 minutes after adding records
   - Check again in Resend dashboard

3. **Verify DNS records:**
   - Use a DNS checker: https://dnschecker.org
   - Search for your domain
   - Check TXT records match what Resend provided

4. **Check domain registrar:**
   - Make sure you're editing DNS at the right place
   - Some domains use external DNS (Cloudflare, etc.)
   - Check where your domain's nameservers point

5. **Common mistakes:**
   - Forgot to save DNS changes at registrar
   - Added records to wrong domain
   - Typo in DNS record value
   - Using wrong record type (TXT vs CNAME)

---

## Google Cloud Issues

### Problem: "REQUEST_DENIED - You must enable Billing"

**Symptoms:**
- Scraping fails with "REQUEST_DENIED"
- Error mentions billing

**Solutions:**

1. **Enable billing:**
   - Go to: https://console.cloud.google.com/billing
   - Click "Link a billing account"
   - Create or select billing account
   - Link to your project
   - Wait 2-3 minutes

2. **Verify billing is linked:**
   - Go to: https://console.cloud.google.com/billing
   - Should show your project linked to billing account
   - Status should be "Active"

3. **Check Places API is enabled:**
   - Go to: https://console.cloud.google.com/apis/library/places-backend.googleapis.com
   - Should show "API enabled" (not "Enable" button)
   - If not enabled, click "Enable"

4. **Verify API key:**
   - Go to: https://console.cloud.google.com/apis/credentials
   - Find your key (starts with AIza)
   - Make sure it's the same one in your .env file

5. **Check API key restrictions:**
   - Click on your API key
   - Under "API restrictions", should allow "Places API"
   - If too restricted, it might block requests

6. **Wait for propagation:**
   - After enabling billing, wait 2-3 minutes
   - Google needs time to activate

---

### Problem: "API key not valid" or "Invalid API key"

**Symptoms:**
- Scraping fails with authentication error
- Google returns "invalid key" error

**Solutions:**

1. **Check key is correct:**
   - Go to: https://console.cloud.google.com/apis/credentials
   - Find your key
   - Compare with key in .env file
   - Make sure they match exactly

2. **Check for extra characters:**
   - No spaces before/after key
   - No quotes around key (unless in .env format)
   - No line breaks in key

3. **Check key is for correct project:**
   - Make sure key is from the project with billing enabled
   - Make sure Places API is enabled in that project

4. **Regenerate key if needed:**
   - In Google Cloud Console
   - Click on your key
   - Click "Regenerate key"
   - Copy new key
   - Update .env file

---

## Vercel Deployment Issues

### Problem: "Environment variable not found" on Vercel

**Symptoms:**
- Site works locally but not on Vercel
- Vercel logs show "API key not found"

**Solutions:**

1. **Check keys are added:**
   - Go to: https://vercel.com/your-project/settings/environment-variables
   - Should see all 7 keys listed
   - If missing, add them

2. **Check environments selected:**
   - When adding key, make sure you check:
     - ✅ Production
     - ✅ Preview
     - ✅ Development
   - Keys only work for selected environments

3. **Redeploy after adding:**
   - Adding keys doesn't update running deployments
   - Must redeploy:
     - Go to "Deployments" tab
     - Click "..." on latest
     - Click "Redeploy"
     - Wait 2-3 minutes

4. **Check key values:**
   - Make sure values match your .env file exactly
   - No extra spaces or characters
   - Copy-paste directly from .env

5. **Check deployment logs:**
   - Go to deployment
   - Click "Functions" tab
   - Check logs for specific error
   - Look for which key is missing

---

## Scraping Issues

### Problem: "No restaurants found" or empty results

**Symptoms:**
- Scraping runs but finds 0 restaurants
- `data/qualified-leads.json` is empty

**Solutions:**

1. **Check API key works:**
   ```bash
   node scripts/test-all-automation.js
   ```
   Should show ✅ for GOOGLE_PLACES_API_KEY

2. **Check billing enabled:**
   - Go to Google Cloud Console
   - Check billing is linked
   - Wait 2-3 minutes if just enabled

3. **Try different search area:**
   - Edit `.env`: `SEARCH_AREA="New York, NY"`
   - Try a major city
   - Some areas have fewer restaurants

4. **Check API quota:**
   - Go to: https://console.cloud.google.com/apis/api/places-backend.googleapis.com/quotas
   - Check if you've hit limits
   - Free tier: $200/month credit

5. **Check for errors:**
   - Look at scraping output
   - Check for "REQUEST_DENIED" or other errors
   - Google Cloud Console → APIs & Services → Dashboard shows errors

6. **Lower qualification threshold:**
   - Edit `.env`: `QUALIFICATION_THRESHOLD=30`
   - Default is 40, might be too high
   - Lower = more restaurants qualify

---

## Email Issues

### Problem: "Email not sending" or "Authentication failed"

**Symptoms:**
- Email script runs but no emails sent
- Error about authentication or domain

**Solutions:**

1. **Check domain verified:**
   - Go to: https://resend.com/domains
   - Should show ✅ Verified for magicplate.info
   - If not, see "Resend Domain Issues" above

2. **Check API key:**
   ```bash
   node scripts/test-all-automation.js
   ```
   Should show ✅ for RESEND_API_KEY

3. **Check FROM_EMAIL:**
   - Must match verified domain
   - Use: `sydney@magicplate.info` (not Gmail, etc.)
   - Check in Resend dashboard

4. **Check Resend dashboard:**
   - Go to: https://resend.com/emails
   - See if emails are being sent
   - Check for error messages
   - Check rate limits

5. **Test with preview first:**
   ```bash
   npm run email:preview
   ```
   This shows who would get emails without sending

6. **Check email addresses:**
   - Make sure restaurants have valid emails
   - Check `data/qualified-leads.json`
   - Some restaurants might not have emails

---

## General Issues

### Problem: "Module not found" or import errors

**Symptoms:**
- Scripts fail with "Cannot find module"
- Import errors

**Solutions:**

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Check Node.js version:**
   ```bash
   node --version
   ```
   Should be v14 or higher

3. **Check file paths:**
   - Make sure you're in project directory: `/Users/sydneyrenay/magicplate`
   - Run: `pwd` to check

---

### Problem: Scripts run but nothing happens

**Symptoms:**
- No errors, but no results
- Scripts complete but no data

**Solutions:**

1. **Check data files:**
   ```bash
   ls -la data/
   ```
   Should see `qualified-leads.json`, `all-leads.json`

2. **Check file contents:**
   ```bash
   cat data/qualified-leads.json
   ```
   Should show restaurant data (not empty `[]`)

3. **Run with verbose output:**
   ```bash
   npm run scrape
   ```
   Should show progress messages

4. **Check for silent failures:**
   - Look for any error messages
   - Check console output carefully
   - Some errors don't stop execution

---

## Getting Help

If nothing above works:

1. **Run diagnostic:**
   ```bash
   node scripts/test-all-automation.js
   ```
   Copy the full output

2. **Check logs:**
   - Look at error messages carefully
   - Check which step failed
   - Note exact error text

3. **Verify each step:**
   - Go through SETUP_CHECKLIST.md
   - Make sure each item is done
   - Don't skip steps

4. **Common mistakes:**
   - Forgot to save .env file
   - Added keys to wrong file
   - Didn't wait for DNS/billing to activate
   - Typo in API key
   - Wrong environment in Vercel

---

## Quick Fixes

**Everything broken? Start fresh:**
```bash
# 1. Add all keys
node add-all-keys.js

# 2. Test
node scripts/test-all-automation.js

# 3. Fix what's missing
```

**Just need to test one thing:**
```bash
# Test email
npm run email:preview

# Test scraping
npm run scrape

# Test everything
node scripts/test-all-automation.js
```

**Check what's configured:**
```bash
node -e "require('dotenv').config(); console.log('Resend:', !!process.env.RESEND_API_KEY); console.log('Google:', !!process.env.GOOGLE_PLACES_API_KEY);"
```

Should show: `Resend: true` and `Google: true`

---

**Still stuck?** Check `YOUR_PERSONALIZED_SETUP.md` for detailed step-by-step instructions.
