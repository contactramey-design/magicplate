# Quick Setup Guide

## Step 1: Install Dependencies (2 minutes)
```bash
npm install
```

## Step 2: Get Your API Keys (15 minutes)

### SendGrid (Required)
1. Go to https://sendgrid.com
2. Sign up (free tier = 100 emails/day)
3. Verify your email address
4. Go to **Settings** → **API Keys** → **Create API Key**
5. Name it "MagicPlate Outreach"
6. Select "Full Access" or "Restricted Access" (Mail Send)
7. **Copy the key** (you'll only see it once!)

### Google Places API (Recommended)
1. Go to https://console.cloud.google.com
2. Create a new project (or use existing)
3. Enable "Places API"
4. Go to **Credentials** → **Create Credentials** → **API Key**
5. Copy the API key

**OR** Yelp API (Alternative)
1. Go to https://www.yelp.com/developers
2. Create App
3. Get API Key

**OR** Outscraper API (Alternative - Great for bulk scraping)
1. Go to https://outscraper.com
2. Sign up and get API key
3. Copy to `.env` as `OUTSCRAPER_API_KEY`

## Step 3: Configure Environment (2 minutes)
```bash
# Copy the example file
cp .env.example .env

# Edit .env and add your keys:
# - SENDGRID_API_KEY=your_key_here
# - GOOGLE_PLACES_API_KEY=your_key_here
# - SEARCH_AREA=Your City, State
```

## Step 4: Test It (5 minutes)
```bash
# Scrape restaurants in your area
npm run scrape

# Preview who would get emails (dry run)
npm run email:preview

# Send test to 5 restaurants
npm run email:test

# Check results
npm run track
```

## Step 5: Start Outreach!
```bash
# When ready, send to all qualified leads
npm run email
```

## Daily Workflow

1. **Morning**: Change `SEARCH_AREA` in `.env` to target new city
2. **Scrape**: `npm run scrape`
3. **Preview**: `npm run email:preview`
4. **Send**: `npm run email`
5. **Track**: `npm run track`

## Troubleshooting

**"No API keys configured"**
- Make sure you added at least one API key to `.env`
- Check for typos in the key names

**"No qualified leads found"**
- Try a different search area
- Lower `QUALIFICATION_THRESHOLD` in `.env` (try 30 instead of 40)

**"SENDGRID_API_KEY not set"**
- Make sure you created the `.env` file (copy from `.env.example`)
- Check the key is correct in SendGrid dashboard

**Emails not sending**
- Verify your sender email is verified in SendGrid
- Check SendGrid dashboard for error messages
- Make sure you haven't hit the 100/day limit (free tier)

## What Gets Created

- `data/all-leads.json` - All restaurants found
- `data/qualified-leads.json` - Restaurants that qualify (score >= 40)
- `data/sent-emails.json` - Tracking of all emails sent

## Tips

- Start with `npm run email:test` to test with 5 restaurants
- Check `npm run track` regularly to see results
- SendGrid free tier = 100 emails/day (perfect for testing!)
- Focus on one city at a time to test the market

---

**Ready to test the market?** Start with a small area, send test emails, and see what happens! 🚀
