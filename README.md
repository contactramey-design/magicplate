# MagicPlate.ai Outreach System

Streamlined lead scraping and email outreach system for testing the MagicPlate.ai market.

## 🦞 OpenClaw Integration (NEW!)

MagicPlate now supports **OpenClaw** - an AI assistant that can automate your entire workflow via WhatsApp, Telegram, or Discord!

**Quick Start:**
```bash
# Install OpenClaw
curl -fsSL https://openclaw.ai/install.sh | bash

# Onboard your assistant
openclaw onboard

# Start chatting via WhatsApp/Telegram!
```

**See [OPENCLAW_QUICK_START.md](OPENCLAW_QUICK_START.md) for full setup guide.**

OpenClaw can:
- ✅ Scrape restaurants on command
- ✅ Send emails automatically
- ✅ Multi-channel outreach (Email, WhatsApp, Telegram)
- ✅ Run daily automations
- ✅ Manage your entire MagicPlate workflow

**Control everything from your phone via WhatsApp/Telegram!**

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment
```bash
cp .env.example .env
SENDGRID_API_KEY=your_sendgrid_api_key_here
GOOGLE_PLACES_API_KEY=your_google_places_api_key_here
# OR
YELP_API_KEY=your_yelp_api_key_here
GOOGLE_PLACES_API_KEY=YOUR_NEW_KEY_HERE
RESEND_API_KEY=your_resend_key_here
FROM_EMAIL=sydney@magicplate.info
FROM_NAME="Sydney - MagicPlate"
...
```

### 3. Get API Keys

**Resend** (Recommended - Better deliverability):
1. Sign up at [resend.com](https://resend.com) (free tier = 3,000 emails/month)
2. Get your API key from the dashboard
3. Copy key to `.env` as `RESEND_API_KEY`
4. Verify your domain (`magicplate.info`) in Resend dashboard

**OR SendGrid** (Alternative):
1. Sign up at [sendgrid.com](https://sendgrid.com) (free tier = 100 emails/day)
2. Go to Settings → API Keys → Create API Key
3. Name it "MagicPlate Outreach"
4. Copy key to `.env` as `SENDGRID_API_KEY`

**Note:** If both `RESEND_API_KEY` and `SENDGRID_API_KEY` are set, Resend will be used.

**Google Places API** (Recommended):
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create project or select existing
3. Enable "Places API"
4. Create API Key
5. Copy to `.env` as `GOOGLE_PLACES_API_KEY`

**OR Yelp API** (Alternative):
1. Go to [yelp.com/developers](https://www.yelp.com/developers)
2. Create App
3. Get API Key
4. Copy to `.env` as `YELP_API_KEY`

**OR Outscraper API** (Alternative - Great for bulk scraping):
1. Go to [outscraper.com](https://outscraper.com)
2. Sign up and get API key
3. Copy to `.env` as `OUTSCRAPER_API_KEY`

**Instagram Graph API** (Optional - For profile discovery):
1. See [INSTAGRAM-SETUP.md](INSTAGRAM-SETUP.md) for detailed setup instructions
2. Create Facebook App in [Meta for Developers](https://developers.facebook.com/)
3. Get access token and App ID
4. Copy to `.env` as `INSTAGRAM_ACCESS_TOKEN` and `FACEBOOK_APP_ID`

### 4. Configure Search Area

#### Option A: Single City/Area
Edit `.env`:
```bash
SEARCH_AREA=Los Angeles, CA
```

#### Option B: Geo-coordinates with Radius (Rural Areas)
For targeting specific rural areas with radius:
```bash
GEOCODE=38.9072,-77.0369,100
# Format: latitude,longitude,radiuskm
# This searches within 100km of the coordinates
```

#### Option C: Batch ZIP Code Processing (Rural Areas)
For processing multiple rural ZIP codes:
```bash
# Method 1: Array of ZIP codes
RURAL_ZIP_CODES=[66002,26801,66006,26802]

# Method 2: Comma-separated
RURAL_ZIP_CODES=66002,26801,66006,26802

# Method 3: Predefined states
RURAL_STATE=kansas        # Uses 70+ rural KS ZIP codes
RURAL_STATE=westvirginia  # Uses 25+ rural WV ZIP codes
```

**Rural Targeting Examples:**
- Kansas rural: `RURAL_STATE=kansas` or `RURAL_ZIP_CODES=[66002,66006,66007]`
- West Virginia rural: `RURAL_STATE=westvirginia` or `RURAL_ZIP_CODES=[26801,26802,26804]`
- Custom: `RURAL_ZIP_CODES=[66002,26801,66006]`

### 5. Test It Out

#### Single Area Scraping
```bash
# Scrape restaurants in your area
npm run scrape

# Preview who would get emails
npm run email:preview

# Send test to 5 restaurants
npm run email:test

# Check tracking
npm run track
```

#### Rural Area Batch Scraping
```bash
# Set ZIP codes in .env first (see above)
npm run scrape:rural

# This will process multiple ZIP codes with rate limiting
# Target: 50-100 qualified leads/week (ethical limit)
```

## Commands

| Command | Description |
|---------|-------------|
| `npm run scrape` | Find and qualify restaurants in your search area |
| `npm run scrape:rural` | Batch process multiple rural ZIP codes (with rate limiting) |
| `npm run email:preview` | Preview which restaurants would receive emails (dry run) |
| `npm run email:test` | Send emails to 5 restaurants (testing) |
| `npm run email` | Send emails to all qualified leads |
| `npm run track` | View outreach statistics and results |

## How It Works

1. **Scraping**: Finds restaurants from Google Maps/Yelp/Outscraper in your search area
2. **Qualification**: Scores each restaurant based on:
   - Low/no internet presence
   - Not on DoorDash
   - Outdated website/menu
   - No professional photos
   - Low social media presence
3. **Email Finding**: Attempts to find contact emails from websites
4. **Outreach**: Sends personalized MagicPlate.ai emails to qualified leads
5. **Tracking**: Records all sent emails and success rates

## Qualification Criteria

Restaurants are scored based on:
- **No website** (30 points)
- **Not on DoorDash** (25 points)
- **No social media** (20 points)
- **Outdated menu** (15 points)
- **Low rating** (10 points)
- **No professional photos** (10 points)

Minimum score to qualify: **40 points** (configurable in `.env`)

## Daily Workflow

### Single Area Workflow
```bash
# Morning: Scrape new area
# Edit .env: SEARCH_AREA="New City, State"
npm run scrape

# Preview before sending
npm run email:preview

# Send campaign
npm run email

# Track results
npm run track
```

### Rural Area Batch Workflow
```bash
# Set up rural ZIP codes in .env
# RURAL_ZIP_CODES=[66002,26801,66006] or RURAL_STATE=kansas

# Run batch scraping (respects weekly limits)
npm run scrape:rural

# Review qualified leads
npm run email:preview

# Send to qualified leads (respects daily email limits)
npm run email

# Track results
npm run track
```

**Weekly Rural Targeting Example:**
```bash
# Week 1: Kansas rural areas
RURAL_STATE=kansas
npm run scrape:rural  # Processes 70+ ZIP codes, finds ~50-100 qualified leads

# Week 2: West Virginia rural areas  
RURAL_STATE=westvirginia
npm run scrape:rural  # Processes 25+ ZIP codes, finds ~30-50 qualified leads

# Week 3: Custom ZIP codes
RURAL_ZIP_CODES=[66002,26801,66006,26802,66007]
npm run scrape:rural  # Processes specific ZIPs
```

## Files

- `data/all-leads.json` - All scraped restaurants
- `data/qualified-leads.json` - Qualified restaurants (score >= 40)
- `data/sent-emails.json` - Tracking of all sent emails

## Email Settings

All emails are sent from `sydney@magicplate.info` (configured in `.env`).

The system automatically:
- Personalizes emails based on restaurant issues
- Handles email validation errors
- Tracks success/failure rates
- Prevents duplicate sends

## Ethical Scraping Guidelines

**Important:** This tool is designed for ethical, respectful lead generation:

- ✅ **Public Data Only**: Only uses publicly available APIs (Google Maps, Yelp, Outscraper)
- ✅ **Rate Limiting**: Built-in delays between requests (2+ seconds)
- ✅ **Weekly Limits**: Default limit of 50-100 leads/week to start
- ✅ **No Aggressive Scraping**: Respects API rate limits and terms of service
- ✅ **Transparent**: All data sources are disclosed and publicly accessible

**Best Practices:**
- Start with 50-100 leads/week to validate the market
- Use rate limiting (configured automatically)
- Only target restaurants that publicly list their information
- Respect opt-out requests immediately
- Follow CAN-SPAM and GDPR guidelines for email outreach

## Tips

- **Start small**: Use `npm run email:test` to test with 5 restaurants first
- **Check tracking**: Run `npm run track` regularly to monitor results
- **Rural targeting**: Use `npm run scrape:rural` for batch ZIP code processing
- **Geo-targeting**: Use `GEOCODE=lat,lng,radiuskm` for specific rural areas
- **Rate limits**: 
  - SendGrid free tier = 100 emails/day
  - Resend free tier = 3,000 emails/month
  - Batch scraping respects 2-second delays between searches

## Troubleshooting

**No qualified leads found?**
- Try a different search area
- Lower `QUALIFICATION_THRESHOLD` in `.env` (default: 40)

**Emails failing?**
- Check SendGrid API key is correct
- Verify sender email is verified in SendGrid
- Check `data/sent-emails.json` for error reasons

**No emails found?**
- Many restaurants don't list emails publicly
- Consider using email finder APIs (Hunter.io, Clearbit) for better results

## Advanced: Rural Area Targeting

### Why Rural Areas?

Rural restaurants often have:
- ✅ Less competition from digital agencies
- ✅ Lower online presence (higher qualification scores)
- ✅ Less likely to be on DoorDash
- ✅ More receptive to affordable digital solutions

### Pre-configured Rural ZIP Codes

The system includes pre-configured ZIP codes for:
- **Kansas**: 70+ rural ZIP codes (66002, 66006, 66007, etc.)
- **West Virginia**: 25+ rural ZIP codes (26801, 26802, 26804, etc.)

### Custom Rural Targeting

You can also use:
1. **Geocode with radius**: `GEOCODE=38.9072,-77.0369,100` (100km radius)
2. **Custom ZIP array**: `RURAL_ZIP_CODES=[66002,26801,66006]`
3. **Query filters**: Automatically excludes DoorDash restaurants
4. **Independent focus**: Targets independent restaurants by default

### Rate Limiting & Ethics

- **Weekly limit**: 50-100 qualified leads (configurable via `MAX_LEADS_PER_WEEK`)
- **Delay between ZIPs**: 2 seconds (configurable via `DELAY_BETWEEN_ZIPS`)
- **Respects API limits**: Built-in delays prevent aggressive scraping
- **Public data only**: Only uses publicly available restaurant information

## Next Steps

Once you get responses:
1. Track which restaurants respond
2. Follow up with interested leads
3. Adjust email templates based on what works
4. Scale to more areas as you validate the market
5. Use rural batch processing for systematic coverage

---

**Domain**: magicplate.info  
**Contact**: sydney@magicplate.info | (805) 668-9973

**Ethical Note**: This tool is designed for respectful, ethical lead generation using only public data sources. Always respect rate limits, API terms of service, and opt-out requests.
