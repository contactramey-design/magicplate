# Environment Variables for MagicPlate.ai Platform

## Required Environment Variables

### Database
```bash
# PostgreSQL (for Vercel Postgres or self-hosted)
POSTGRES_URL=postgresql://user:password@host:port/database
POSTGRES_PRISMA_URL=postgresql://user:password@host:port/database?pgbouncer=true
```

### HeyGen API
```bash
# HeyGen API Key for avatar and video generation
HEYGEN_API_KEY=your_heygen_api_key_here

# Optional: Base avatar ID to clone from (Sydney's avatar)
HEYGEN_BASE_AVATAR_ID=your_base_avatar_id_here
```

### Stripe (Billing)
```bash
# Stripe Secret Key
STRIPE_SECRET_KEY=sk_live_...

# Stripe Webhook Secret (for subscription events)
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Publishable Key (for frontend)
STRIPE_PUBLISHABLE_KEY=pk_live_...
```

### AI Gateway (Content Generation)
```bash
# Vercel AI Gateway - Unified interface for all AI operations
# Get from: https://vercel.com/dashboard -> Your Project -> Settings -> AI Gateway
AI_GATEWAY_URL=https://gateway.ai.cloudflare.com/v1
AI_GATEWAY_API_KEY=your_ai_gateway_api_key_here

# Provider API Keys (for AI Gateway to route to)
# At least one is required:
OPENAI_API_KEY=sk-...  # For GPT-4, GPT-3.5
ANTHROPIC_API_KEY=sk-ant-...  # For Claude (recommended)
GOOGLE_GEMINI_API_KEY=...  # For Gemini (optional)
```

### Image Enhancement APIs
```bash
# Leonardo.ai (primary)
LEONARDO_API_KEY=your_leonardo_key_here

# Replicate (backup)
REPLICATE_API_TOKEN=your_replicate_token_here

# Together.ai (optional)
TOGETHER_API_KEY=your_together_key_here
```

### Email Service
```bash
# Resend (primary)
RESEND_API_KEY=re_...

# SendGrid (backup)
SENDGRID_API_KEY=SG....

# Email Configuration
FROM_EMAIL=sydney@magicplate.info
FROM_NAME="Sydney Ramey - MagicPlate.ai"
```

### Lead Scraping
```bash
# Google Places API
GOOGLE_PLACES_API_KEY=your_google_key_here

# Outscraper API (optional)
OUTSCRAPER_API_KEY=your_outscraper_key_here

# Gemini API (for AI analysis)
GEMINI_API_KEY=your_gemini_key_here
```

### Social Media APIs (Future)
```bash
# Instagram Graph API
INSTAGRAM_ACCESS_TOKEN=your_access_token_here
FACEBOOK_APP_ID=your_facebook_app_id_here

# Facebook Graph API
FACEBOOK_ACCESS_TOKEN=your_facebook_token_here
```

### Search Configuration
```bash
# Search area for lead scraping
SEARCH_AREA="Los Angeles, CA"

# Search radius (in meters)
SEARCH_RADIUS=5000

# Qualification rules
MAX_REVIEWS=15
EXCLUDE_DOORDASH=false
QUALIFICATION_THRESHOLD=40
```

## Optional Environment Variables

```bash
# Server Configuration
PORT=3000
NODE_ENV=production

# n8n Webhook (if using automation)
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/...

# Rural Batch Scraping
RURAL_STATE=kansas
RURAL_ZIP_CODES=[66002,26801,66006]
MAX_LEADS_PER_WEEK=100
DELAY_BETWEEN_ZIPS=5000
```

## Setting Up Environment Variables

### Local Development
1. Copy `.env.example` to `.env`
2. Fill in all required variables
3. For sensitive keys, use `.env.local` (gitignored)

### Vercel Deployment
1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add each variable for Production, Preview, and Development environments
4. Redeploy after adding variables

### Environment Variable Priority
1. `.env.local` (highest priority, gitignored)
2. `.env` (base configuration)
3. System environment variables
4. Vercel environment variables (in production)

## Security Notes

- Never commit `.env` or `.env.local` files to git
- Use different API keys for development and production
- Rotate keys regularly
- Use Vercel's environment variable encryption for production
- Keep Stripe webhook secrets secure
