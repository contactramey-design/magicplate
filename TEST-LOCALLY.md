# How to Test Locally

## What "Test Locally" Means

**Testing locally** means running the scripts on your computer (not on Vercel) to:
- ✅ Make sure everything works before deploying
- ✅ See what emails would be sent
- ✅ Check if scraping finds restaurants
- ✅ Verify your email template looks good
- ✅ Catch errors early

## Quick Test Commands

### 1. Test Scraping (Find Restaurants)
```bash
npm run scrape
```
**What it does:**
- Searches for restaurants in your `SEARCH_AREA` (Kansas City, MO)
- Uses Google Places API
- Qualifies leads based on your criteria
- Saves to `data/qualified-leads.json`

**Expected output:**
```
🔍 Scraping restaurants in: Kansas City, MO
📡 Scraping from googleMaps...
✅ Found 50 restaurants
📧 Finding email addresses...
✅ Found 15 emails
✨ Qualified leads: 20
💾 Saved leads to data/qualified-leads.json
```

### 2. Preview Emails (See Who Would Get Emails)
```bash
npm run email:preview
```
**What it does:**
- Shows you which restaurants would receive emails
- **Does NOT actually send emails** (dry run)
- Shows email addresses and qualification scores

**Expected output:**
```
🧪 DRY RUN - Would send to 20 restaurants:

1. Restaurant Name
   Email: contact@restaurant.com
   Score: 65 | Issues: outdated_menu, not_on_doordash
```

### 3. Send Test Emails (Actually Send to 5 Restaurants)
```bash
npm run email:test
```
**What it does:**
- **Actually sends emails** to 5 restaurants
- Uses your Resend API
- Tracks results in `data/sent-emails.json`

**Expected output:**
```
📧 Using email service: Resend
📊 Loaded 20 qualified leads

✅ Restaurant 1 → email@example.com (Score: 65)
✅ Restaurant 2 → email@example.com (Score: 60)
...
📊 CAMPAIGN SUMMARY
✅ Sent: 5
❌ Failed: 0
```

### 4. Send to All Qualified Leads
```bash
npm run email
```
**What it does:**
- Sends emails to ALL qualified leads
- Use this when you're ready to send the full campaign

**⚠️ Warning:** This sends to all qualified leads. Test with `npm run email:test` first!

### 5. Check Results
```bash
npm run track
```
**What it does:**
- Shows statistics of all emails sent
- Success rate, total sent, etc.

## Complete Test Workflow

Here's the recommended order:

```bash
# Step 1: Find restaurants
npm run scrape

# Step 2: Preview who would get emails (no actual send)
npm run email:preview

# Step 3: Send test to 5 restaurants
npm run email:test

# Step 4: Check the results
npm run track

# Step 5: If everything looks good, send to all
npm run email
```

## What to Look For

### ✅ Good Signs:
- Scraping finds 20+ restaurants
- Emails have valid addresses
- No errors in the output
- Emails actually arrive in inboxes

### ⚠️ Warning Signs:
- "No API keys configured" → Check your `.env` file
- "No qualified leads" → Try a different `SEARCH_AREA`
- "Failed to send" → Check Resend API key
- Emails going to spam → Verify domain in Resend

## Testing the Automation Endpoint

If you want to test the automation endpoint locally:

```bash
# Start local server
npm run dev

# In another terminal, test the endpoint
curl http://localhost:3000/api/run-automation
```

Or use Node directly:
```bash
node -e "require('./api/run-automation.js')({method:'GET'}, {status: (c)=>console.log('Status:',c), json: (d)=>console.log(JSON.stringify(d,null,2))})"
```

## Common Issues

**"No API keys configured"**
- Make sure `.env` file exists in project root
- Check that keys don't have extra spaces
- Restart terminal after adding keys

**"No qualified leads found"**
- Try a different city: `SEARCH_AREA="Los Angeles, CA"`
- Lower threshold: `QUALIFICATION_THRESHOLD=20` in `.env`

**"Email sending failed"**
- Check Resend API key is correct
- Verify domain is verified in Resend (optional but recommended)

## Next Steps After Testing

Once local tests pass:
1. ✅ Add environment variables to Vercel
2. ✅ Deploy to Vercel
3. ✅ Verify cron job is active
4. ✅ Let automation run daily!

---

**Remember:** Testing locally lets you catch problems before they go live! 🧪
