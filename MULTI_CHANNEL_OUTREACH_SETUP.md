# Multi-Channel Outreach Setup Guide

## Overview

The MagicPlate multi-channel outreach system allows you to contact restaurants via:
- ✅ **Email** (Primary)
- ✅ **WhatsApp** (via Zappy)
- ✅ **Facebook Messenger**
- ✅ **Instagram DM** (Limited - requires prior interaction)
- ✅ **Voicemail** (via Zappy)

The system automatically tries channels in priority order and falls back to alternatives if the primary channel fails.

---

## Quick Start

### 1. Set Up Email (Required - Primary Channel)

**Option A: Resend (Recommended)**
```bash
# Sign up at https://resend.com
# Get API key from dashboard
RESEND_API_KEY=re_xxxxxxxxxxxxx
```

**Option B: SendGrid**
```bash
# Sign up at https://sendgrid.com
# Get API key from dashboard
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
```

**Also set:**
```bash
FROM_EMAIL=sydney@magicplate.info
FROM_NAME="Sydney - MagicPlate"
```

---

### 2. Set Up WhatsApp & Voicemail (Zappy)

**Zappy Setup:**
1. Sign up at https://zappy.app (or check if they have an API)
2. Get API key from dashboard
3. Get your phone number (the one you'll send from)

**Add to `.env`:**
```bash
ZAPPY_API_KEY=your_zappy_api_key
ZAPPY_PHONE_NUMBER=+18056689973  # Your phone number with country code
```

**Note:** If Zappy doesn't exist, you can use:
- **Twilio** for WhatsApp and SMS
- **RingCentral** for voicemail
- **Vonage** for messaging

---

### 3. Set Up Facebook Messenger

**Facebook Setup:**
1. Create Facebook Business Page
2. Go to [Meta for Developers](https://developers.facebook.com/)
3. Create a new app
4. Add "Messenger" product
5. Get Page Access Token

**Add to `.env`:**
```bash
FACEBOOK_ACCESS_TOKEN=your_page_access_token
FACEBOOK_PAGE_ID=your_page_id
```

**Note:** Facebook Messenger has restrictions:
- Users must message you first (24-hour window)
- Or you can send message requests (limited)

---

### 4. Set Up Instagram DM

**Instagram Setup:**
1. Connect Instagram Business Account to Facebook Page
2. Use same Facebook App from step 3
3. Get Instagram Business Account ID

**Add to `.env`:**
```bash
INSTAGRAM_ACCESS_TOKEN=your_instagram_access_token
INSTAGRAM_BUSINESS_ACCOUNT_ID=your_ig_account_id
```

**Note:** Instagram DM has strict limitations:
- Users must message you first
- Or use message requests (very limited)
- Best for follow-up, not cold outreach

---

## Usage

### Basic Usage

```bash
# Preview (dry run) - see who would be contacted
npm run outreach:preview

# Send to first 5 restaurants (test)
npm run outreach:test

# Send to all qualified leads
npm run outreach
```

### Advanced Usage

```bash
# Email only
npm run outreach:email-only

# WhatsApp only
npm run outreach:whatsapp-only

# Custom channels
node scripts/multi-channel-outreach.js --channels=email,whatsapp

# Skip certain channels
node scripts/multi-channel-outreach.js --skip=instagram,facebook

# Limit number of contacts
node scripts/multi-channel-outreach.js --max=10
```

---

## How It Works

### Outreach Strategy

1. **Primary Channel:** Email (tried first)
2. **Fallback Channels:** WhatsApp, Facebook, Instagram (if email fails)
3. **Alternative:** Voicemail (if all others fail)

### Channel Priority

The system tries channels in this order:
1. Email (if restaurant has email)
2. WhatsApp (if restaurant has phone)
3. Facebook Messenger (if restaurant has Facebook page)
4. Instagram DM (if restaurant has Instagram)
5. Voicemail (if restaurant has phone)

### Automatic Fallback

- If email fails → tries WhatsApp
- If WhatsApp fails → tries Facebook
- If Facebook fails → tries Instagram
- If Instagram fails → tries Voicemail
- Stops when one succeeds

---

## Tracking

All outreach is tracked in `data/outreach-tracking.json`:

```json
{
  "outreach": [
    {
      "restaurant_id": "ChIJ...",
      "restaurant_name": "Joe's Pizza",
      "channel": "email",
      "success": true,
      "timestamp": "2024-01-15T10:30:00Z"
    }
  ],
  "stats": {
    "total": 100,
    "successful": 85,
    "failed": 15,
    "by_channel": {
      "email": { "sent": 70, "failed": 5 },
      "whatsapp": { "sent": 10, "failed": 2 },
      "facebook": { "sent": 5, "failed": 8 }
    }
  }
}
```

---

## Troubleshooting

### Email Not Working

**Check:**
- API key is correct
- Sender email is verified
- Domain is authenticated (DKIM/SPF)
- Not hitting rate limits

**Common Issues:**
- `does not exist` → Email address invalid, tries next email
- `rate limit` → Wait and retry later
- `bounced` → Email address doesn't exist

### WhatsApp Not Working

**Check:**
- Zappy API key is correct
- Phone number format is correct (include country code)
- Zappy account has credits

**Note:** If Zappy doesn't work, consider:
- **Twilio WhatsApp API** (requires approval)
- **WhatsApp Business API** (requires business verification)

### Facebook/Instagram Not Working

**Check:**
- Access token is valid
- Page/account is connected
- User has messaged you first (for Messenger)

**Limitations:**
- Facebook Messenger: 24-hour window after user messages you
- Instagram DM: Very limited for cold outreach

---

## Best Practices

### 1. Start with Email
Email is the most reliable channel for cold outreach.

### 2. Use WhatsApp for Follow-up
If email doesn't get a response, try WhatsApp (more personal).

### 3. Respect Rate Limits
- Email: 100/day (SendGrid free), 3,000/month (Resend free)
- WhatsApp: Check Zappy limits
- Facebook/Instagram: Very limited

### 4. Personalize Messages
The system automatically personalizes based on restaurant issues:
- Not on DoorDash → Mentions delivery opportunity
- No website → Mentions online presence
- No photos → Mentions photo enhancement

### 5. Track Everything
Check `data/outreach-tracking.json` regularly to see:
- Which channels work best
- Success rates
- Common failure reasons

---

## Alternative Services

If Zappy doesn't work, here are alternatives:

### WhatsApp Alternatives:
- **Twilio WhatsApp API** - Requires approval, but reliable
- **WhatsApp Business API** - Official, requires business verification
- **MessageBird** - WhatsApp Business API provider

### Voicemail Alternatives:
- **Twilio Voice** - Make calls and leave voicemail
- **RingCentral** - Business phone system with voicemail
- **Vonage** - Voice API for voicemail

### Facebook/Instagram Alternatives:
- **ManyChat** - Facebook Messenger automation (requires user opt-in)
- **Chatfuel** - Facebook Messenger bots (requires user opt-in)

---

## Next Steps

1. **Set up Email** (Required)
2. **Set up Zappy** (For WhatsApp/Voicemail)
3. **Test with 5 restaurants**: `npm run outreach:test`
4. **Review tracking**: Check `data/outreach-tracking.json`
5. **Scale up**: `npm run outreach`

---

## Support

If you encounter issues:
1. Check `.env` file has all required keys
2. Test each channel individually
3. Check `data/outreach-tracking.json` for error details
4. Review API documentation for each service
