# Google Cloud Setup Guide for MagicPlate

## Step-by-Step Instructions

### 1. Enable Places API
1. Go to https://console.cloud.google.com
2. Make sure "MagicPlate-test" project is selected (top left)
3. Click **"APIs & Services"** → **"Library"** (left sidebar)
4. Search for **"Places API"**
5. Click on **"Places API"**
6. Click the blue **"Enable"** button

### 2. Create API Key
1. Go to **"APIs & Services"** → **"Credentials"** (left sidebar)
2. Click **"+ Create Credentials"** → **"API Key"**
3. Your API key will appear (starts with `AIza...`)
4. **Copy the key** - you'll need it in the next step

### 3. (Optional) Restrict the API Key
For security, restrict the key to only Places API:
1. Click **"Restrict Key"** button
2. Under **"API restrictions"**, select **"Restrict key"**
3. In the dropdown, select **"Places API"**
4. Click **"Save"**

### 4. Add Key to Your Project
Once you have your API key, run:
```bash
# Add your key to .env
echo "GOOGLE_PLACES_API_KEY=YOUR_KEY_HERE" >> .env
```

Or manually edit `.env` and add:
```
GOOGLE_PLACES_API_KEY=AIza...your_actual_key_here
```

### 5. Test the Connection
```bash
npm run scrape
```

If it works, you'll see:
```
✅ Found X restaurants
✅ Qualified leads: Y
```

---

## Enable Gemini API (Optional - for AI photo editing)

1. Go to **"APIs & Services"** → **"Library"**
2. Search for **"Generative Language API"** or **"Gemini API"**
3. Click **"Enable"**
4. Create another API key (or use the same one)
5. Add to `.env`:
```
GEMINI_API_KEY=your_gemini_key_here
```

---

## Troubleshooting

**"API key not valid"**
- Make sure Places API is enabled
- Check that you copied the full key (starts with `AIza...`)

**"Billing required"**
- Even with free credits, you need to add a billing account
- Go to **"Billing"** → **"Link a billing account"**
- Google gives $200 free credit for new accounts

**"Permission denied"**
- Check API key restrictions
- Make sure Places API is in the allowed list

---

## Quick Checklist

- [ ] Places API enabled in Google Cloud Console
- [ ] API key created
- [ ] Key added to `.env` file
- [ ] Tested with `npm run scrape`
