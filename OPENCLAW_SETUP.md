# OpenClaw Integration for MagicPlate.ai

Complete guide to setting up and using OpenClaw with MagicPlate automations.

## 🚀 Quick Start

### 1. Install OpenClaw

```bash
# Option 1: One-liner install (recommended)
curl -fsSL https://openclaw.ai/install.sh | bash

# Option 2: Via npm (if you have Node.js)
npm i -g openclaw

# Option 3: Local install (in this project)
npm install openclaw
```

### 2. Onboard Your Assistant

```bash
openclaw onboard
```

Follow the prompts to:
- Set up your AI model (Claude, GPT, or local)
- Configure your chat app (WhatsApp, Telegram, Discord, etc.)
- Set up your assistant's persona

### 3. Connect MagicPlate Skills

OpenClaw will automatically discover the skills in `openclaw-skills/` directory.

## 📱 Chat App Setup

### WhatsApp
1. OpenClaw will provide a WhatsApp number
2. Send a message to that number
3. Start chatting with your MagicPlate assistant

### Telegram
1. Create a Telegram bot via @BotFather
2. Get your bot token
3. Add to `.env`: `TELEGRAM_BOT_TOKEN=your_token`
4. OpenClaw will connect automatically

### Discord
1. Create a Discord application
2. Add bot to your server
3. OpenClaw will connect via Discord bot

## 🎯 MagicPlate Skills

### 1. Email Automation (`magicplate-email.js`)

**What it does:**
- Sends personalized emails to restaurants
- Manages email campaigns
- Tracks sent emails

**Usage via OpenClaw:**
```
"Send emails to 10 qualified leads"
"Send follow-up emails to restaurants contacted 3 days ago"
"Check email status for MagicPlate leads"
```

**Commands:**
```bash
# Via OpenClaw chat
"Send batch emails to qualified leads"

# Or directly
node -e "require('./openclaw-skills/magicplate-email').sendBatchEmails(10)"
```

### 2. Restaurant Scraping (`magicplate-scraping.js`)

**What it does:**
- Scrapes restaurants from Google Maps
- Qualifies leads based on MagicPlate criteria
- Saves to `data/qualified-leads.json`

**Usage via OpenClaw:**
```
"Scrape restaurants in Kansas City, MO"
"Find 50 restaurants in Los Angeles"
"Qualify the latest scraped leads"
```

**Commands:**
```bash
# Via OpenClaw chat
"Scrape restaurants in Los Angeles, CA"

# Or directly
node -e "require('./openclaw-skills/magicplate-scraping').scrapeAndSave('Los Angeles, CA', 100)"
```

### 3. Multi-Channel Outreach (`magicplate-outreach.js`)

**What it does:**
- Sends outreach via Email, WhatsApp, Telegram
- Tries multiple channels until one succeeds
- Tracks all outreach attempts

**Usage via OpenClaw:**
```
"Send outreach to 5 restaurants via WhatsApp"
"Contact qualified leads via email and WhatsApp"
"Check outreach status"
```

**Commands:**
```bash
# Via OpenClaw chat
"Send outreach to 10 restaurants"

# Or directly
node -e "require('./openclaw-skills/magicplate-outreach').batchOutreach(10, ['email', 'whatsapp'])"
```

## 🤖 Daily Automation

OpenClaw can run daily automations automatically:

**Setup:**
```bash
# Tell OpenClaw to set up daily automation
"Set up daily MagicPlate automation: scrape restaurants at 9 AM, send emails at 10 AM"
```

**What it does:**
1. **9 AM**: Scrape restaurants in target area
2. **10 AM**: Send emails to qualified leads
3. **2 PM**: Send follow-up emails
4. **Weekly**: Generate report

**Manual trigger:**
```bash
node -e "require('./openclaw-skills').dailyAutomation()"
```

## 💬 Example Conversations

### Scraping
```
You: "Scrape restaurants in Kansas City, MO"
OpenClaw: "🔍 Scraping restaurants in Kansas City, MO...
✅ Found 87 restaurants
✅ 23 qualified leads (score >= 40)
Saved to data/qualified-leads.json"
```

### Email Outreach
```
You: "Send emails to 5 qualified leads"
OpenClaw: "📧 Sending emails...
✅ Sent to: Joe's Pizza
✅ Sent to: Maria's Restaurant
✅ Sent to: The Burger Place
❌ Failed: No email for Tony's Diner
✅ 3/5 emails sent successfully"
```

### Multi-Channel
```
You: "Contact restaurants without emails via WhatsApp"
OpenClaw: "📱 Contacting via WhatsApp...
✅ Contacted: Joe's Pizza (+1-555-1234)
✅ Contacted: Maria's Restaurant (+1-555-5678)
✅ 2/2 WhatsApp messages sent"
```

## 🔧 Configuration

### Environment Variables

Add to your `.env`:

```bash
# Email
RESEND_API_KEY=re_...
SENDGRID_API_KEY=SG...
FROM_EMAIL=sydney@magicplate.info
FROM_NAME="Sydney - MagicPlate"

# Scraping
GOOGLE_PLACES_API_KEY=AIza...
YELP_API_KEY=...
OUTSCRAPER_API_KEY=...

# Outreach
VAPI_API_KEY=...  # For WhatsApp
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...

# Search
SEARCH_AREA="Los Angeles, CA"
```

### OpenClaw Config

Edit `openclaw.config.js` to customize:
- Assistant name and persona
- File paths
- Automation schedules
- Skill settings

## 📊 Monitoring

### Check Status
```
You: "Show MagicPlate stats"
OpenClaw: "📊 MagicPlate Statistics:
- Total Leads: 1,234
- Qualified: 456
- Emails Sent: 234
- WhatsApp Sent: 89
- Success Rate: 87%"
```

### View Logs
```bash
# OpenClaw logs
openclaw logs

# MagicPlate tracking files
cat data/sent-emails.json
cat data/outreach-tracking.json
```

## 🎨 Custom Skills

OpenClaw can build its own skills! Just ask:

```
You: "Create a skill to check if restaurants are on DoorDash"
OpenClaw: "🔨 Building DoorDash check skill...
✅ Skill created: check-doordash.js"
```

## 🚨 Troubleshooting

### OpenClaw not responding
```bash
# Check if OpenClaw is running
openclaw status

# Restart OpenClaw
openclaw restart
```

### Skills not working
```bash
# Check API keys
node -e "require('dotenv').config(); console.log('Resend:', !!process.env.RESEND_API_KEY)"

# Test skill directly
node -e "require('./openclaw-skills/magicplate-email').sendBatchEmails(1, true)"
```

### Chat app not connected
- WhatsApp: Make sure you sent a message to OpenClaw's WhatsApp number
- Telegram: Check `TELEGRAM_BOT_TOKEN` in `.env`
- Discord: Verify bot is added to your server

## 📚 Resources

- **OpenClaw Website**: https://openclaw.ai
- **OpenClaw GitHub**: https://github.com/openclaw/openclaw
- **OpenClaw Docs**: https://openclaw.ai/docs
- **OpenClaw Discord**: Join the community

## 🎯 Next Steps

1. ✅ Install OpenClaw
2. ✅ Onboard your assistant
3. ✅ Connect WhatsApp/Telegram
4. ✅ Test email sending
5. ✅ Set up daily automation
6. ✅ Customize skills as needed

## 💡 Pro Tips

1. **Start Simple**: Begin with email automation, then add WhatsApp
2. **Monitor Daily**: Check OpenClaw logs and tracking files
3. **Iterate**: Ask OpenClaw to improve skills based on results
4. **Automate Everything**: Let OpenClaw handle repetitive tasks
5. **Use Memory**: OpenClaw remembers your preferences and context

---

**Need Help?** Ask OpenClaw directly via your chat app, or check the OpenClaw Discord community!
