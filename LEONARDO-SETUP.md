# Leonardo.ai API Setup Guide

## Quick Fix for "No image enhancement API configured" Error

### Step 1: Get Your Leonardo API Key

1. Go to https://leonardo.ai
2. Sign up or log in
3. Navigate to **Account → API Tokens** (or **Settings → API**)
4. Click **Create API Key** or **Generate Token**
5. Copy the token (it will look something like `sk-...` or similar)

### Step 2: Add to .env File

1. Open the `.env` file in your project root (`/Users/sydneyrenay/magicplate/.env`)
2. Add this line (replace with your actual key):

```bash
LEONARDO_API_KEY=your_actual_key_here
```

**CRITICAL FORMATTING RULES:**
- ✅ NO spaces around the `=` sign
- ✅ NO quotes around the value
- ✅ NO comments on the same line
- ✅ Variable name must be exactly `LEONARDO_API_KEY` (case-sensitive)

**Correct:**
```bash
LEONARDO_API_KEY=sk_abc123xyz789
```

**Wrong:**
```bash
LEONARDO_API_KEY = sk_abc123xyz789    # ❌ Spaces
LEONARDO_API_KEY="sk_abc123xyz789"    # ❌ Quotes
LEONARDO_API_KEY=sk_abc123xyz789 # key  # ❌ Comment on same line
leonardo_api_key=sk_abc123xyz789       # ❌ Wrong case
```

### Step 3: Verify Setup

Run the verification script:

```bash
node verify-setup.js
```

You should see:
```
✅ LEONARDO_API_KEY: Set (XX characters)
```

### Step 4: Restart Server

**IMPORTANT:** You must restart the server after adding the API key!

1. Stop the current server (Ctrl+C in the terminal)
2. Start it again:
```bash
npm run dev
```

### Step 5: Test

1. Go to http://localhost:3000
2. Scroll to "Transform Your Photo"
3. Upload an image
4. Select a restaurant style
5. Click "✨ Transform with AI"

## Diagnostic Tools

### Check API Configuration

Visit this URL in your browser:
```
http://localhost:3000/api/check-config
```

This will show you:
- Which APIs are configured
- Length of each key
- Preview of the key (first 10 characters)

### Run Verification Script

```bash
node verify-setup.js
```

This checks:
- Environment variables
- API implementation
- Server configuration
- Provides recommendations

## Common Issues

### Issue: "No image enhancement API configured"

**Cause:** API key not in .env or wrong format

**Fix:**
1. Check `.env` file exists in project root
2. Verify line: `LEONARDO_API_KEY=your_key` (no spaces, no quotes)
3. Restart server after adding key

### Issue: "401 Unauthorized" or "Invalid token"

**Cause:** API key is invalid or expired

**Fix:**
1. Get a new API key from Leonardo.ai
2. Update `.env` file
3. Restart server

### Issue: "402 Insufficient credits"

**Cause:** Leonardo account has no credits

**Fix:**
1. Go to Leonardo.ai dashboard
2. Add credits to your account
3. Retry the transformation

### Issue: Key not loading after adding to .env

**Possible causes:**
1. Wrong file location (must be in project root)
2. Wrong format (spaces, quotes, etc.)
3. Server not restarted
4. Typo in variable name

**Fix:**
1. Run `node verify-setup.js` to check
2. Visit `http://localhost:3000/api/check-config` to see what's loaded
3. Double-check `.env` file format
4. Restart server

## API Implementation Details

The implementation uses:
- **PhotoReal v2** for food photography
- **FOOD preset style** for restaurant images
- **Image-to-image** transformation (not just upscaling)
- **Presigned URL upload** flow (2-step process)

## Need Help?

1. Check server logs: `tail -f server.log`
2. Check browser console (F12) for frontend errors
3. Run `node verify-setup.js` for diagnostics
4. Visit `/api/check-config` endpoint for API status
