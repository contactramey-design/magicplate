# Complete Feature Setup Guide
## All Features Ready - Just Plug In Your APIs

This guide shows you exactly what APIs and accounts you need to set up for each feature.

---

## ✅ Feature 1: Photo Enhancements

### Status: **READY** - Just needs API keys

**What's Built:**
- ✅ Usage tracking and limit enforcement
- ✅ Leonardo.ai integration (primary)
- ✅ Replicate backup
- ✅ Together.ai backup
- ✅ Automatic tier limit checking

**APIs Needed:**
1. **Leonardo.ai** (Recommended - Best for food photos)
   - Sign up: https://leonardo.ai
   - Get API key from dashboard
   - Add to `.env`: `LEONARDO_API_KEY=your_key_here`

2. **Replicate** (Backup option)
   - Sign up: https://replicate.com
   - Get API token
   - Add to `.env`: `REPLICATE_API_TOKEN=your_token_here`

3. **Together.ai** (Backup option)
   - Sign up: https://together.ai
   - Get API key
   - Add to `.env`: `TOGETHER_API_KEY=your_key_here`

**API Endpoint:**
- `POST /api/enhance-image`
- Automatically tracks usage
- Enforces tier limits (10/month for Starter, unlimited for Pro/Enterprise)

**Usage:**
```javascript
// Frontend automatically sends restaurant_id
fetch('/api/enhance-image', {
  method: 'POST',
  body: JSON.stringify({
    image: base64Image,
    restaurant_id: 123,
    style: 'upscale_casual'
  })
});
```

---

## ✅ Feature 2: Digital Menus

### Status: **READY** - Fully functional

**What's Built:**
- ✅ Menu creation API
- ✅ Menu management (CRUD)
- ✅ QR code generation (URL structure ready)
- ✅ Tier limit enforcement (1 for Starter, unlimited for Pro/Enterprise)
- ✅ Menu storage in database

**APIs Needed:**
- **None!** Fully self-contained
- QR codes can be generated client-side or with any QR service

**API Endpoints:**
- `POST /api/menus` - Create menu
- `GET /api/menus/:restaurant_id` - List menus
- `GET /api/menus/menu/:menu_id` - Get menu
- `PUT /api/menus/:menu_id` - Update menu
- `DELETE /api/menus/:menu_id` - Delete menu

**Usage:**
```javascript
// Create menu
fetch('/api/menus', {
  method: 'POST',
  body: JSON.stringify({
    restaurant_id: 123,
    name: 'Main Menu',
    items: [
      { name: 'Burger', price: 12.99, description: 'Delicious burger' }
    ],
    settings: { theme: 'modern', layout: 'grid' }
  })
});
```

**Optional QR Service:**
- Use any QR code API (QRCode.js, qrcode.js library, or API service)
- Menu URLs are automatically generated: `/menus/:restaurant_id/:menu_id`

---

## ✅ Feature 3: Social Media Posts

### Status: **READY** - Needs platform APIs

**What's Built:**
- ✅ Post creation and management
- ✅ AI content generation
- ✅ Scheduling system
- ✅ Usage tracking (5/month Starter, unlimited Pro/Enterprise)
- ✅ Database storage

**APIs Needed:**

1. **Instagram Graph API** (For Instagram posting)
   - Set up Facebook Business Page
   - Create Facebook App
   - Get Instagram Business Account connected
   - Add to `.env`:
     - `INSTAGRAM_ACCESS_TOKEN=your_token`
     - `FACEBOOK_APP_ID=your_app_id`

2. **Facebook Graph API** (For Facebook posting)
   - Same setup as Instagram
   - Add to `.env`: `FACEBOOK_ACCESS_TOKEN=your_token`

3. **TikTok API** (For TikTok posting - if available)
   - Sign up: https://developers.tiktok.com
   - Get access token
   - Add to `.env`: `TIKTOK_ACCESS_TOKEN=your_token`

4. **Twitter API** (For Twitter posting)
   - Sign up: https://developer.twitter.com
   - Get API keys
   - Add to `.env`:
     - `TWITTER_API_KEY=your_key`
     - `TWITTER_API_SECRET=your_secret`
     - `TWITTER_ACCESS_TOKEN=your_token`

**API Endpoints:**
- `POST /api/social/posts` - Create post
- `POST /api/social/generate` - Generate AI post
- `POST /api/social/schedule` - Schedule post
- `POST /api/social/publish/:post_id` - Publish post
- `GET /api/social/posts/:restaurant_id` - List posts

**Setup Steps:**
1. Create Facebook Business Page for your restaurant
2. Connect Instagram Business Account
3. Create Facebook App
4. Get access tokens
5. Add to `.env`

**Usage:**
```javascript
// Generate AI post
fetch('/api/social/generate', {
  method: 'POST',
  body: JSON.stringify({
    restaurant_id: 123,
    platform: 'instagram',
    post_type: 'menu_item',
    context: {
      item_name: 'Burger',
      description: 'Amazing burger'
    }
  })
});
```

---

## ✅ Feature 4: HeyGen Avatar Videos

### Status: **READY** - Needs HeyGen API key

**What's Built:**
- ✅ Avatar creation system
- ✅ Video generation (welcome, training, promotional)
- ✅ Template system
- ✅ Usage tracking (1 included Professional, unlimited Enterprise)
- ✅ Database storage

**APIs Needed:**
1. **HeyGen API**
   - Sign up: https://heygen.com
   - Get API key from dashboard
   - Add to `.env`: `HEYGEN_API_KEY=your_key_here`
   - Optional: `HEYGEN_BASE_AVATAR_ID=your_base_avatar_id` (Sydney's avatar)

**API Endpoints:**
- `POST /api/heygen/create-avatar` - Create restaurant avatar
- `POST /api/heygen/generate-video` - Generate video
- `POST /api/heygen/welcome-video` - Generate welcome video
- `POST /api/heygen/training-video` - Generate training video
- `POST /api/heygen/promotional-video` - Generate promotional video
- `GET /api/heygen/video/:id` - Get video status

**Setup Steps:**
1. Sign up for HeyGen
2. Create base avatar (or use existing)
3. Get API key
4. Add to `.env`

**Usage:**
```javascript
// Create avatar during onboarding
fetch('/api/restaurants/123/onboard', {
  method: 'POST',
  body: JSON.stringify({
    setup_avatar: true,
    create_welcome_video: true
  })
});
```

---

## ✅ Feature 5: Email Marketing

### Status: **READY** - Needs email service

**What's Built:**
- ✅ Campaign creation and management
- ✅ Template system
- ✅ Scheduling
- ✅ Recipient management
- ✅ Send tracking
- ✅ Tier restrictions (Starter: templates only, Pro/Enterprise: full campaigns)

**APIs Needed:**
1. **Resend** (Recommended)
   - Sign up: https://resend.com
   - Get API key
   - Add to `.env`: `RESEND_API_KEY=re_...`

2. **SendGrid** (Alternative)
   - Sign up: https://sendgrid.com
   - Get API key
   - Add to `.env`: `SENDGRID_API_KEY=SG....`

**Already Configured:**
- ✅ Email service integration in `config/email-config.js`
- ✅ Supports both Resend and SendGrid

**API Endpoints:**
- `POST /api/email/campaigns` - Create campaign
- `POST /api/email/campaigns/:id/send` - Send campaign
- `GET /api/email/campaigns/:restaurant_id` - List campaigns

**Usage:**
```javascript
// Create campaign
fetch('/api/email/campaigns', {
  method: 'POST',
  body: JSON.stringify({
    restaurant_id: 123,
    name: 'New Menu Launch',
    subject: 'Check out our new menu!',
    recipients: ['customer1@email.com', 'customer2@email.com'],
    template_id: 'menu_launch'
  })
});
```

---

## ✅ Feature 6: Multi-Location Management

### Status: **READY** - Fully functional

**What's Built:**
- ✅ Location CRUD operations
- ✅ Location-specific customization
- ✅ Content synchronization
- ✅ Tier limits (1 Starter, 3 Professional, unlimited Enterprise)

**APIs Needed:**
- **None!** Fully self-contained

**API Endpoints:**
- `GET /api/locations/:restaurant_id` - List locations
- `POST /api/locations/:restaurant_id` - Create location
- `PUT /api/locations/:location_id` - Update location
- `POST /api/locations/:location_id/sync` - Sync content
- `GET /api/locations/:location_id/customize` - Get customizations

**Usage:**
```javascript
// Create location
fetch('/api/locations/123', {
  method: 'POST',
  body: JSON.stringify({
    name: 'Downtown Location',
    address: '123 Main St',
    city: 'Los Angeles',
    state: 'CA',
    zip_code: '90001'
  })
});
```

---

## ✅ Feature 7: Support System

### Status: **READY** - Fully functional

**What's Built:**
- ✅ Ticket creation
- ✅ Priority handling (tier-based)
- ✅ Email notifications
- ✅ Ticket tracking

**APIs Needed:**
- **None!** Uses existing email service

**API Endpoints:**
- `POST /api/support/tickets` - Create ticket
- `GET /api/support/tickets/:restaurant_id` - List tickets

**Usage:**
```javascript
// Create support ticket
fetch('/api/support/tickets', {
  method: 'POST',
  body: JSON.stringify({
    restaurant_id: 123,
    subject: 'Need help with menu upload',
    message: 'I\'m having trouble uploading my menu...',
    priority: 'high',
    category: 'technical'
  })
});
```

---

## 🔄 Automation: Cron Jobs

### Status: **READY** - Set up Vercel Cron

**What's Built:**
- ✅ Scheduled post publishing
- ✅ Scheduled campaign sending
- ✅ Cron job endpoints

**Setup:**
1. Add to `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/cron/run",
    "schedule": "0 * * * *"
  }]
}
```

2. Or use Vercel Cron dashboard to set up:
   - `/api/cron/posts` - Every hour
   - `/api/cron/campaigns` - Every hour

**API Endpoints:**
- `POST /api/cron/run` - Run all scheduled tasks
- `POST /api/cron/posts` - Publish scheduled posts
- `POST /api/cron/campaigns` - Send scheduled campaigns

---

## 📋 Complete API Setup Checklist

### Required for Basic Functionality:
- [ ] **Leonardo.ai API Key** - Photo enhancements
- [ ] **Resend or SendGrid API Key** - Email service
- [ ] **HeyGen API Key** - Video generation (Professional/Enterprise)

### Required for Social Media:
- [ ] **Facebook Business Page** - For Instagram/Facebook
- [ ] **Instagram Business Account** - Connected to Facebook
- [ ] **Facebook App** - For API access
- [ ] **Instagram Access Token** - From Facebook Graph API
- [ ] **Facebook Access Token** - From Facebook Graph API

### Optional but Recommended:
- [ ] **Replicate API Token** - Backup for photo enhancement
- [ ] **Together.ai API Key** - Backup for photo enhancement
- [ ] **Twitter API Keys** - For Twitter posting
- [ ] **TikTok API Access** - For TikTok posting

### Already Configured:
- ✅ Database schema (PostgreSQL)
- ✅ Usage tracking system
- ✅ Tier limit enforcement
- ✅ All API endpoints
- ✅ Email templates
- ✅ Support system

---

## 🚀 Quick Start

1. **Set up required APIs:**
   ```bash
   # Add to .env
   LEONARDO_API_KEY=your_key
   RESEND_API_KEY=your_key
   HEYGEN_API_KEY=your_key
   ```

2. **Set up social media (if needed):**
   - Follow `INSTAGRAM-SETUP.md` guide
   - Add tokens to `.env`

3. **Test each feature:**
   - Photo enhancement: Upload image on homepage
   - Digital menu: Create via API
   - Social posts: Generate via API
   - Email campaigns: Create via API

4. **Set up automation:**
   - Configure Vercel Cron for scheduled posts/campaigns

---

## 📊 Feature Status Summary

| Feature | Status | API Needed | Ready to Use |
|---------|--------|------------|-------------|
| Photo Enhancements | ✅ Complete | Leonardo.ai | ✅ Yes |
| Digital Menus | ✅ Complete | None | ✅ Yes |
| Social Media Posts | ✅ Complete | Instagram/Facebook | ⏳ Needs tokens |
| HeyGen Videos | ✅ Complete | HeyGen | ⏳ Needs API key |
| Email Marketing | ✅ Complete | Resend/SendGrid | ✅ Yes (already configured) |
| Multi-Location | ✅ Complete | None | ✅ Yes |
| Support System | ✅ Complete | None | ✅ Yes |

**All features are fully built and ready. Just add your API keys and you're good to go!**
