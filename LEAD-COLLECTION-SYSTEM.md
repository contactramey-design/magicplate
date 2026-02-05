# Lead Collection System - Manual Outreach Workflow

## ✅ What's Changed

The automation now collects **ALL qualified leads** regardless of email status, giving you a complete list to work from manually.

## How It Works Now

### 1. Scraping & Qualification
- Scrapes restaurants from Google Places API
- Qualifies them based on your criteria (score >= 40)
- Tries to find emails (but doesn't require them)

### 2. Saves All Qualified Leads
- **JSON File**: `data/qualified-leads.json` - All qualified leads with full data
- **CSV File**: `data/qualified-leads-YYYY-MM-DD.csv` - Easy to open in Excel/Google Sheets

### 3. Automated Email Sending (Optional)
- Still sends emails to leads that have emails found
- But doesn't require emails - saves everything regardless

## CSV Export Format

The CSV includes:
- Restaurant Name
- Phone
- Website
- Address
- City, State
- Email (if found)
- Potential Emails (guessed patterns like info@domain.com)
- Qualification Score
- Issues (what makes them a good lead)
- Rating & Reviews
- On DoorDash (Yes/No)
- Has Website (Yes/No)

## Manual Outreach Workflow

### Step 1: Get Your Lead List
After automation runs, you'll have:
- `data/qualified-leads.json` - Full data
- `data/qualified-leads-YYYY-MM-DD.csv` - Spreadsheet format

### Step 2: Open CSV in Excel/Google Sheets
1. Download the CSV from Vercel (or access locally)
2. Open in Excel or Google Sheets
3. Review the leads

### Step 3: Find Emails Manually
For each restaurant:
1. Visit their website
2. Check contact page
3. Look for email in footer/about page
4. Check social media (Instagram/Facebook often have contact info)
5. Add email to the CSV

### Step 4: Outreach Options

**Option A: Email (if you find emails)**
- Use the email addresses you found
- Send personalized outreach

**Option B: Phone Outreach**
- Use the phone numbers in the CSV
- Call during off-peak hours
- Quick pitch about MagicPlate.ai

**Option C: Social Media**
- Find them on Instagram/Facebook
- DM with a brief intro
- Link to your website

**Option D: Contact Forms**
- Fill out contact forms on their website
- Mention you have a free sample to show

## Why This Is Better

✅ **More Control**: You decide who to contact and when
✅ **Better Targeting**: Review leads before reaching out
✅ **Higher Quality**: Manual email finding = better accuracy
✅ **Flexible Outreach**: Use email, phone, or social media
✅ **No Spam**: Only contact restaurants you've reviewed

## Accessing Your Lead Lists

### From Vercel (Production)
The CSV/JSON files are saved in the Vercel function's file system. To access:
1. Check Vercel logs for the file path
2. Or download via Vercel's file system (if accessible)
3. Or set up a download endpoint (can add this)

### From Local Development
Files are saved to `data/` directory:
- `data/qualified-leads.json`
- `data/qualified-leads-YYYY-MM-DD.csv`

## Next Steps

1. **Run automation** - Collects leads daily
2. **Review CSV** - Open in spreadsheet
3. **Find emails manually** - More accurate than automated
4. **Outreach** - Use your preferred method

---

**The automation now works as a lead collection system, not just an email sender!**
