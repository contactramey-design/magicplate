# How to Verify Your API Key in Vercel

## Quick Check: Does Vercel Have the Right Key?

### Step 1: Get Your API Key from Google Cloud
1. Go to: https://console.cloud.google.com/apis/credentials
2. Find your API key (the one you're using)
3. **Copy the FULL key** (starts with `AIza...`)
4. Note the first 10 characters and last 4 characters

### Step 2: Check Vercel Environment Variables
1. Go to: https://vercel.com/dashboard
2. Select your `magicplate` project
3. Go to: **Settings** → **Environment Variables**
4. Find: `GOOGLE_PLACES_API_KEY`
5. Click the **eye icon** to reveal the value
6. **Compare**:
   - First 10 characters match?
   - Last 4 characters match?
   - Total length matches?

### Step 3: If They Don't Match
1. Click **Edit** on `GOOGLE_PLACES_API_KEY`
2. Paste the correct key from Google Cloud
3. Make sure **all environments** are selected (Production, Preview, Development)
4. Click **Save**

### Step 4: Redeploy
After updating the key:
1. Go to **Deployments** tab
2. Click **⋯** on latest deployment
3. Click **Redeploy**
4. Wait for deployment to finish (1-2 minutes)
5. Test automation again

## Alternative: Create a New API Key

If you're unsure which key is correct:

1. **In Google Cloud Console:**
   - Go to: APIs & Services → Credentials
   - Click "+ Create Credentials" → "API Key"
   - **IMPORTANT**: Make sure billing is linked FIRST
   - Copy the new key

2. **In Vercel:**
   - Settings → Environment Variables
   - Edit `GOOGLE_PLACES_API_KEY`
   - Paste the new key
   - Save

3. **Redeploy** and test

---

**Most Common Issue**: The API key in Vercel is from an old project or doesn't match the one in Google Cloud.
