# 🚀 Quick Start Guide - MagicPlate Outreach

## ✅ System Status Check

I've verified your system. Here's what you need to do:

---

## 📋 Step 1: Set Up API Keys (REQUIRED)

### Email (Required - Primary Channel)

**Option A: Resend (Recommended)**
1. Go to https://resend.com
2. Sign up for free account
3. Get API key from dashboard
4. Add to `.env`:
```bash
RESEND_API_KEY=re_xxxxxxxxxxxxx
FROM_EMAIL=sydney@magicplate.info
FROM_NAME="Sydney - MagicPlate"
```

**Option B: SendGrid**
1. Go to https://sendgrid.com
2. Sign up for free account (100 emails/day)
3. Get API key from dashboard
4. Add to `.env`:
```bash
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
FROM_EMAIL=sydney@magicplate.info
FROM_NAME="Sydney - MagicPlate"
```

### Google Places API (Required for Scraping)
1. Go to https://console.cloud.google.com
2. Create project or use existing
3. Enable "Places API"
4. Create API key
5. Add to `.env`:
```bash
GOOGLE_PLACES_API_KEY=re_9Va9PPPZ_LQ6od53eR2RWWr35piKNFrj3
```

---

## 📋 Step 2: Optional Channels

### WhatsApp/Voicemail (Zappy)
**Note:** Zappy may not exist. Alternatives:
- **Twilio** (for WhatsApp/SMS/Voicemail)
- **RingCentral** (for voicemail)

If you have Zappy:
```bash
ZAPPY_API_KEY=your_zappy_key
ZAPPY_PHONE_NUMBER=+18056689973
```

### Facebook Messenger
```bash
FACEBOOK_ACCESS_TOKEN=your_token
FACEBOOK_PAGE_ID=your_page_id
```

### Instagram DM
```bash
INSTAGRAM_ACCESS_TOKEN=your_token
INSTAGRAM_BUSINESS_ACCOUNT_ID=your_ig_id
FACEBOOK_APP_ID=your_app_id
```

---

## 📋 Step 3: Test the System

### 1. Verify API Keys
```bash
node -e "require('dotenv').config(); console.log('Email:', process.env.RESEND_API_KEY ? '✅' : '❌'); console.log('Google:', process.env.GOOGLE_PLACES_API_KEY ? '✅' : '❌');"
```

### 2. Scrape Restaurants
```bash
npm run scrape
```
This will:
- Find restaurants in your search area
- Qualify leads
- Find emails, Instagram, Facebook, phone numbers
- Save to `data/qualified-leads.json`

### 3. Preview Outreach (Dry Run)
```bash
npm run outreach:preview
```
This shows who would be contacted without actually sending.

### 4. Test Outreach (5 restaurants)
```bash
npm run outreach:test
```
This sends to first 5 restaurants to test.

### 5. Full Outreach
```bash
npm run outreach
```
This sends to all qualified leads.

---

## 📊 Current Status

✅ **System is built and ready**
✅ **Qualified leads file exists** (`data/qualified-leads.json`)
❌ **API keys need to be added** (Email + Google Places minimum)

---

## 🎯 Minimum Setup (To Get Started)

**Just add these 2 API keys:**
1. `RESEND_API_KEY` or `SENDGRID_API_KEY` (for email)
2. `GOOGLE_PLACES_API_KEY` (for scraping)

Then run:
```bash
npm run scrape        # Find restaurants
npm run outreach:test # Test outreach
```

---

## 📚 Full Documentation

- **Multi-Channel Setup:** `MULTI_CHANNEL_OUTREACH_SETUP.md`
- **Outreach Complete:** `OUTREACH_COMPLETE.md`
- **Instagram Setup:** `INSTAGRAM-SETUP.md`

---

## 🆘 Need Help?

1. **Email not working?** Check API key and sender email verification
2. **No leads found?** Check Google Places API key and search area
3. **Outreach failing?** Check `data/outreach-tracking.json` for errors

---

## ✅ Next Steps

1. **Add Email API key** (Resend or SendGrid)
2. **Add Google Places API key**
3. **Run:** `npm run scrape`
4. **Test:** `npm run outreach:test`
5. **Scale:** `npm run outreach`

**You're ready to go!** 🚀
