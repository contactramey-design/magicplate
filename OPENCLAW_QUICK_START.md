# OpenClaw Quick Start for MagicPlate

Get OpenClaw running with MagicPlate in 5 minutes!

## 🚀 Installation

### Step 1: Install OpenClaw

```bash
# Run this one command (installs everything)
curl -fsSL https://openclaw.ai/install.sh | bash
```

**OR** if you prefer npm:
```bash
npm i -g openclaw
```

### Step 2: Onboard Your Assistant

```bash
openclaw onboard
```

This will:
- Set up your AI model (Claude, GPT, or local)
- Configure your chat app connection
- Create your assistant persona

### Step 3: Connect Your Chat App

**WhatsApp:**
1. OpenClaw will give you a WhatsApp number
2. Send a message to that number
3. Start chatting!

**Telegram:**
1. Create bot via @BotFather on Telegram
2. Get your bot token
3. Add to `.env`: `TELEGRAM_BOT_TOKEN=your_token`
4. OpenClaw connects automatically

## 🎯 Test It Out

### Via OpenClaw Chat (Recommended)

Open WhatsApp/Telegram and message your OpenClaw assistant:

```
You: "Scrape restaurants in Los Angeles, CA"
OpenClaw: "🔍 Scraping restaurants...
✅ Found 87 restaurants
✅ 23 qualified leads"
```

```
You: "Send emails to 5 qualified leads"
OpenClaw: "📧 Sending emails...
✅ Sent 5 emails successfully"
```

### Via Command Line

```bash
# Scrape restaurants
npm run openclaw:scrape

# Send emails
npm run openclaw:email

# Multi-channel outreach
npm run openclaw:outreach

# Daily automation
npm run openclaw:daily
```

## 📋 Required API Keys

Make sure these are in your `.env`:

```bash
# Email (required)
RESEND_API_KEY=re_...

# Scraping (required)
GOOGLE_PLACES_API_KEY=AIza...

# WhatsApp (optional)
VAPI_API_KEY=...
```

## 🎨 What You Can Do

### Scraping
- "Scrape restaurants in [city]"
- "Find 50 restaurants in Kansas City"
- "Qualify the latest leads"

### Email
- "Send emails to 10 leads"
- "Send follow-up emails"
- "Check email status"

### Outreach
- "Contact restaurants via WhatsApp"
- "Send outreach to 5 leads"
- "Multi-channel outreach to qualified leads"

### Automation
- "Set up daily automation"
- "Run daily MagicPlate tasks"
- "Show me stats"

## 🔧 Troubleshooting

**OpenClaw not responding?**
```bash
openclaw status
openclaw restart
```

**Skills not working?**
```bash
# Check API keys
node -e "require('dotenv').config(); console.log('Resend:', !!process.env.RESEND_API_KEY)"
```

**Need help?**
- Check `OPENCLAW_SETUP.md` for detailed docs
- Ask OpenClaw directly via chat!
- Join OpenClaw Discord: https://discord.gg/openclaw

## 🎉 You're Ready!

Start chatting with OpenClaw via WhatsApp/Telegram and automate your MagicPlate workflows!

---

**Next Steps:**
1. ✅ Install OpenClaw
2. ✅ Connect WhatsApp/Telegram
3. ✅ Test scraping
4. ✅ Test email sending
5. ✅ Set up daily automation
