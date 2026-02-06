# Quick Guide: Add API Keys to .env File

## The Problem
Your API keys aren't in the `.env` file yet, so the system can't find them.

## The Solution (2 minutes)

### Option 1: Copy-Paste (Easiest)

1. **Open the file:** `KEYS_TO_ADD_NOW.txt` (I just created this for you)
2. **Copy all the lines** (Cmd+A, then Cmd+C)
3. **Open your `.env` file** in your code editor
4. **Paste at the end** (Cmd+V)
5. **Save** (Cmd+S)

### Option 2: Manual Entry

1. Open `.env` file in your code editor
2. Add these lines one by one:

```
RESEND_API_KEY=re_9Va9PPPZ_LQ6od53eR2RWWr35piKNFrj3
FROM_EMAIL=sydney@magicplate.info
FROM_NAME="Sydney - MagicPlate"
GOOGLE_PLACES_API_KEY=AIzaSyBg90qetc06qivgBX9b-kJlxVVXuBz_FMI
LEONARDO_API_KEY=02a4b18f-77d5-42ee-b68b-beb43e277849
REPLICATE_API_TOKEN=YOUR_REPLICATE_API_TOKEN
SEARCH_AREA="Los Angeles, CA"
```

3. Save the file

### Verify It Worked

After saving, run this in your terminal:

```bash
node scripts/test-all-automation.js
```

You should see:
- ✅ RESEND_API_KEY
- ✅ GOOGLE_PLACES_API_KEY
- ✅ Email configuration
- ✅ Scraping configuration

**If you see ✅ for those, you're done with Step 1!**

---

## Next Steps

Once keys are added:
1. ✅ Step 1: Add keys (you're here)
2. ⏭️ Step 2: Verify Resend domain
3. ⏭️ Step 3: Enable Google Cloud billing
4. ⏭️ Step 4: Test everything
5. ⏭️ Step 5: Deploy to Vercel

See `YOUR_PERSONALIZED_SETUP.md` for detailed instructions on steps 2-5.
