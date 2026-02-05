# Instagram Profile Discovery Setup

This guide explains how to set up Instagram profile discovery using Facebook's Instagram Graph API. This feature allows you to automatically find restaurant Instagram profiles and use that data to personalize your outreach emails.

## Overview

The Instagram discovery feature:
- Finds Instagram Business accounts linked to Facebook Pages
- Extracts Instagram handles, follower counts, and bio information
- Uses Instagram data to personalize email outreach
- Falls back to website scraping if API is unavailable

## Prerequisites

1. **Facebook Business Account** - You need a Facebook Business account
2. **Facebook App** - Create a Facebook App in Meta for Developers
3. **Instagram Business Account** - The restaurants you're targeting need Instagram Business accounts (linked to Facebook Pages)

## Step 1: Create a Facebook App

1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Click **"My Apps"** → **"Create App"**
3. Choose **"Business"** as the app type
4. Fill in:
   - **App Name**: MagicPlate Outreach
   - **App Contact Email**: your-email@magicplate.info
5. Click **"Create App"**

## Step 2: Add Instagram Graph API

1. In your app dashboard, go to **"Add Products"**
2. Find **"Instagram Graph API"** and click **"Set Up"**
3. This will add the Instagram Graph API to your app

## Step 3: Get Access Token

### Option A: User Access Token (Testing)

1. Go to **Tools** → **Graph API Explorer**
2. Select your app from the dropdown
3. Click **"Generate Access Token"**
4. Select permissions:
   - `pages_read_engagement`
   - `pages_read_user_content`
   - `instagram_basic`
   - `instagram_manage_comments` (if needed)
5. Copy the access token

**Note**: User tokens expire after 60 days. For production, use a Page Access Token.

### Option B: Page Access Token (Production)

1. Go to **Tools** → **Graph API Explorer**
2. Select your app
3. Under **"User or Page"**, select your Facebook Page
4. Generate token with same permissions
5. This token doesn't expire (unless revoked)

## Step 4: Get Facebook App ID

1. In your app dashboard, go to **Settings** → **Basic**
2. Copy your **App ID**

## Step 5: Configure Environment Variables

Add these to your `.env` file:

```bash
# Instagram Graph API
INSTAGRAM_ACCESS_TOKEN=your_access_token_here
FACEBOOK_APP_ID=your_facebook_app_id_here
```

## Step 6: Test the Integration

Run a test scrape to verify Instagram discovery is working:

```bash
npm run scrape
```

You should see:
```
📱 Finding Instagram profiles...
✅ Found X Instagram profiles
```

## How It Works

### Strategy 1: Facebook Pages API
1. Searches Facebook Pages matching restaurant name
2. Checks if page has Instagram Business Account linked
3. Retrieves Instagram account details (handle, followers, bio, etc.)

### Strategy 2: Website Scraping (Fallback)
1. If API fails or no Instagram account found
2. Scrapes restaurant website for Instagram links
3. Extracts Instagram handle from links

## Rate Limits

- **Facebook Graph API**: 200 calls per hour per user
- **Batch Processing**: Default is 5 restaurants per batch with 2-second delay
- **Website Scraping**: Respects website rate limits

## Troubleshooting

### "Instagram API authentication failed"
- Check that `INSTAGRAM_ACCESS_TOKEN` is valid
- Verify token hasn't expired (user tokens expire after 60 days)
- Ensure token has required permissions

### "No Instagram profiles found"
- Many restaurants don't have Instagram Business accounts
- Some may only have personal Instagram accounts (not discoverable via API)
- Website scraping fallback will still find some profiles

### Rate Limit Errors
- Reduce batch size in `findInstagramProfiles()` function
- Increase delay between batches
- Consider using Page Access Token instead of User Token

## Data Collected

For each restaurant with Instagram, the system collects:
- `instagramHandle`: Instagram username (e.g., "restaurantname")
- `instagramUrl`: Full Instagram URL
- `instagramId`: Instagram Business Account ID
- `instagramFollowers`: Follower count
- `instagramBio`: Bio text
- `profilePicture`: Profile picture URL
- `facebookPageId`: Linked Facebook Page ID
- `facebookPageName`: Facebook Page name

## Email Personalization

Instagram data is automatically used to personalize emails:
- Mentions Instagram handle: "I noticed your Instagram (@restaurantname)..."
- References follower count for growth opportunities
- Uses bio information for context

## Legal & Compliance

✅ **Compliant**: Using official Facebook/Instagram Graph API
✅ **Public Data Only**: Only accesses public Instagram Business account data
✅ **Rate Limited**: Respects API rate limits
✅ **No Automation**: Does NOT send automated DMs (compliant with Instagram ToS)

## Next Steps

1. Set up Facebook App and get access token
2. Add environment variables to `.env`
3. Test with a small scrape
4. Monitor rate limits and adjust batch size if needed
5. Review personalized emails to see Instagram mentions

## Support

If you encounter issues:
1. Check Facebook App status in Meta for Developers dashboard
2. Verify access token permissions
3. Review API error messages in console logs
4. Test API directly using Graph API Explorer
