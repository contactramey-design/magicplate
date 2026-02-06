# OpenClaw Setup Checklist

Use this checklist to complete your OpenClaw setup:

## ✅ Pre-Setup (Already Done)
- [x] OpenClaw skills created
- [x] Configuration file created
- [x] Integration scripts ready
- [x] Documentation complete

## 🔧 Installation Steps

### Step 1: Install OpenClaw
```bash
curl -fsSL https://openclaw.ai/install.sh | bash
```
- [ ] OpenClaw installed successfully
- [ ] Verified with: `which openclaw`

### Step 2: Verify API Keys
```bash
node setup-openclaw.js
```
- [ ] RESEND_API_KEY is set
- [ ] GOOGLE_PLACES_API_KEY is set
- [ ] Optional keys added (VAPI, Telegram, etc.)

### Step 3: Onboard Assistant
```bash
openclaw onboard
```
- [ ] AI model selected (Claude/GPT/local)
- [ ] Assistant persona configured
- [ ] Chat app connection set up

### Step 4: Connect Chat App
- [ ] WhatsApp connected (or)
- [ ] Telegram connected (or)
- [ ] Discord connected

### Step 5: Test Skills
- [ ] Test scraping: `npm run openclaw:scrape`
- [ ] Test email: `npm run openclaw:email`
- [ ] Test outreach: `npm run openclaw:outreach`

### Step 6: Set Up Automation
- [ ] Daily automation configured
- [ ] Schedules set (9 AM scraping, 10 AM emails, etc.)
- [ ] Tested daily automation: `npm run openclaw:daily`

## 🎯 Quick Commands Reference

```bash
# Check setup status
node setup-openclaw.js

# Install OpenClaw
curl -fsSL https://openclaw.ai/install.sh | bash

# Onboard
openclaw onboard

# Test commands
npm run openclaw:scrape
npm run openclaw:email
npm run openclaw:outreach
npm run openclaw:daily
```

## 📚 Documentation

- Quick Start: `OPENCLAW_QUICK_START.md`
- Full Setup: `OPENCLAW_SETUP.md`
- Next Steps: `OPENCLAW_NEXT_STEPS.md`
- This Checklist: `SETUP_CHECKLIST_OPENCLAW.md`

---

**Current Status:** Ready to install OpenClaw! 🦞
