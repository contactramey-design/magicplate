# OpenClaw Setup - Next Steps

Follow these steps to complete your OpenClaw setup:

## Step 1: Verify Installation ✅

Run the setup checker:
```bash
node setup-openclaw.js
```

This will show you:
- ✅ OpenClaw installation status
- ✅ API keys status
- ✅ Skills availability
- ✅ Data directory status

## Step 2: Install OpenClaw (if not installed)

If OpenClaw is not installed, run:
```bash
curl -fsSL https://openclaw.ai/install.sh | bash
```

**OR** via npm:
```bash
npm i -g openclaw
```

## Step 3: Onboard Your Assistant

Run the onboarding:
```bash
openclaw onboard
```

This will:
1. Ask you to choose an AI model (Claude, GPT, or local)
2. Set up your assistant's persona
3. Configure chat app connections
4. Create your assistant profile

## Step 4: Connect Chat App

### Option A: WhatsApp (Recommended)

1. OpenClaw will provide a WhatsApp number during onboarding
2. Send a message to that number
3. Start chatting!

### Option B: Telegram

1. Create a bot via @BotFather on Telegram
2. Get your bot token
3. Add to `.env`:
   ```bash
   TELEGRAM_BOT_TOKEN=your_bot_token_here
   TELEGRAM_CHAT_ID=your_chat_id_here
   ```
4. OpenClaw will connect automatically

### Option C: Discord

1. Create a Discord application
2. Add bot to your server
3. OpenClaw will connect via Discord bot

## Step 5: Test It Out

Once connected, message your OpenClaw assistant:

### Test Scraping
```
You: "Scrape restaurants in Los Angeles, CA"
OpenClaw: "🔍 Scraping restaurants...
✅ Found 87 restaurants
✅ 23 qualified leads"
```

### Test Email
```
You: "Send emails to 5 qualified leads"
OpenClaw: "📧 Sending emails...
✅ Sent 5 emails successfully"
```

### Test Outreach
```
You: "Contact restaurants via WhatsApp"
OpenClaw: "📱 Contacting via WhatsApp...
✅ Contacted 3 restaurants"
```

## Step 6: Set Up Daily Automation

Tell OpenClaw to set up daily automation:
```
You: "Set up daily MagicPlate automation:
- Scrape restaurants at 9 AM
- Send emails at 10 AM
- Follow-ups at 2 PM"
```

Or run manually:
```bash
npm run openclaw:daily
```

## Required API Keys

Make sure these are in your `.env`:

```bash
# Required
RESEND_API_KEY=re_...
GOOGLE_PLACES_API_KEY=AIza...

# Optional (for multi-channel)
VAPI_API_KEY=...          # WhatsApp
TELEGRAM_BOT_TOKEN=...     # Telegram
INSTAGRAM_ACCESS_TOKEN=... # Instagram
FACEBOOK_ACCESS_TOKEN=...  # Facebook
```

## Troubleshooting

### OpenClaw not found
```bash
# Check if it's installed
which openclaw

# If not, install it
curl -fsSL https://openclaw.ai/install.sh | bash

# Reload your shell
source ~/.zshrc  # or ~/.bashrc
```

### API keys not working
```bash
# Check your .env file
cat .env | grep API_KEY

# Test API keys
node setup-openclaw.js
```

### Skills not loading
```bash
# Check if skills directory exists
ls openclaw-skills/

# Should see:
# - magicplate-email.js
# - magicplate-scraping.js
# - magicplate-outreach.js
# - index.js
```

### Chat app not connecting
- **WhatsApp**: Make sure you sent a message to OpenClaw's number
- **Telegram**: Check `TELEGRAM_BOT_TOKEN` in `.env`
- **Discord**: Verify bot is added to your server

## Quick Commands

```bash
# Check setup status
node setup-openclaw.js

# Install OpenClaw
curl -fsSL https://openclaw.ai/install.sh | bash

# Onboard
openclaw onboard

# Test scraping
npm run openclaw:scrape

# Test email
npm run openclaw:email

# Test outreach
npm run openclaw:outreach

# Daily automation
npm run openclaw:daily
```

## Need Help?

- **Quick Start**: See `OPENCLAW_QUICK_START.md`
- **Full Setup**: See `OPENCLAW_SETUP.md`
- **OpenClaw Docs**: https://openclaw.ai/docs
- **OpenClaw Discord**: Join the community

---

**You're almost there!** Just follow the steps above and you'll be automating MagicPlate with OpenClaw in no time! 🦞
