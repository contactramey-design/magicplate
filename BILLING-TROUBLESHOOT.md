# Billing Error Still Showing? Here's How to Fix It

## The Error
```
REQUEST_DENIED - You must enable Billing on the Google Cloud Project
```

Even after enabling billing, you might still see this error. Here's how to fix it:

## Step 1: Verify Billing is Linked to the Correct Project

1. **Go to Google Cloud Console**: https://console.cloud.google.com
2. **Check which project is selected** (top left dropdown)
3. **Go to Billing**: Click "Billing" in the left sidebar
4. **Verify**: You should see "Billing account: [Your Account]" linked

**If it says "No billing account":**
- Click "Link a billing account"
- Select your billing account
- Click "Set account"

## Step 2: Check Your API Key's Project

1. **Go to**: APIs & Services → Credentials
2. **Find your API key** (the one in Vercel environment variables)
3. **Check which project it's from** (shown in the list)
4. **Make sure billing is enabled for THAT project**

**Common issue**: API key is from Project A, but billing is enabled on Project B.

## Step 3: Wait 2-3 Minutes

After linking billing:
- Wait 2-3 minutes for Google to propagate the changes
- Then test again

## Step 4: Verify Places API is Enabled

1. **Go to**: APIs & Services → Library
2. **Search for**: "Places API"
3. **Make sure it shows**: "API enabled" (green checkmark)
4. **If not**: Click "Enable"

## Step 5: Check API Key Restrictions

1. **Go to**: APIs & Services → Credentials
2. **Click on your API key**
3. **Check "API restrictions"**:
   - Should be "Don't restrict key" OR
   - Should include "Places API" in the allowed list

## Quick Checklist

- [ ] Billing account is created
- [ ] Billing is linked to the project with your API key
- [ ] Places API is enabled in that project
- [ ] API key has no restrictions blocking Places API
- [ ] Waited 2-3 minutes after linking billing
- [ ] API key in Vercel matches the one in Google Cloud

## Still Not Working?

**Option 1: Create a new API key**
1. Go to APIs & Services → Credentials
2. Create a new API key
3. Make sure billing is enabled FIRST
4. Update it in Vercel environment variables

**Option 2: Check project selection**
- Make sure you're looking at the correct project in Google Cloud Console
- The project name should match where you created the API key

---

**Most common issue**: Billing is enabled on one project, but the API key is from a different project. Make sure they match!
