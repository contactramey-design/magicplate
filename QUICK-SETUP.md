# 🚀 Quick Setup Checklist for Image Enhancement

## ✅ Step-by-Step Setup (5 minutes)

### 1. Get Your API Key

**Recommended: Replicate (easiest to start)**
- Visit: https://replicate.com
- Sign up (free account)
- Go to: https://replicate.com/account/api-tokens
- Click "Create token"
- Copy the token (starts with `r8_...`)

### 2. Add API Key to Local Environment

Create or edit `.env` file in project root:
```bash
# Add this line (replace with your actual token)
REPLICATE_API_TOKEN=r8_your_actual_token_here
```

### 3. Add API Key to Vercel

1. Go to: https://vercel.com/dashboard
2. Select your `magicplate` project
3. Go to **Settings** → **Environment Variables**
4. Click **Add New**
5. Name: `REPLICATE_API_TOKEN`
6. Value: `r8_your_actual_token_here`
7. Environment: **Production, Preview, Development** (select all)
8. Click **Save**

### 4. Test Locally

```bash
# Make sure dependencies are installed
npm install

# Start local server
npm run dev:static

# Visit http://localhost:3000
# Try uploading an image via the form
```

### 5. Deploy to Production

```bash
git add .
git commit -m "Add image enhancement automation"
git push origin main
# Vercel will auto-deploy
```

## 🧪 Testing the API

Once you have your API key set up, test the endpoint:

```bash
# Test with a sample image (base64 encoded)
curl -X POST http://localhost:3000/api/enhance-image \
  -H "Content-Type: application/json" \
  -d '{"image": "data:image/jpeg;base64,/9j/4AAQ..."}'
```

Or use the homepage form - it's easier!

## 📊 Expected Behavior

1. User uploads image → Form shows "Selected: filename.jpg"
2. User clicks "Enhance with AI" → Status shows "Enhancing..."
3. After 20-40 seconds → Status shows "Done! Drag the slider..."
4. Slider automatically updates with before/after images
5. User can drag slider to compare

## ⚠️ Common Issues

**"No image enhancement API configured"**
- Make sure you added `REPLICATE_API_TOKEN` to `.env` (local) or Vercel (production)
- Check for typos in the variable name
- Restart your dev server after adding to `.env`

**"Enhancement failed"**
- Check your API token is valid
- Verify you have credits/quota on Replicate
- Check Replicate status: https://status.replicate.com

**Images not showing**
- Check browser console (F12) for errors
- Verify `/public/images/enhanced/` directory exists
- Check file permissions

## 🎯 Next Steps After Setup

1. ✅ Test with a real menu photo
2. ✅ Verify the slider updates correctly
3. ✅ Check image quality meets your standards
4. ✅ Monitor API usage/costs
5. ⏭️ Add cleanup script for old images (optional)
6. ⏭️ Add email collection on upload (optional)

---

**Ready to go!** Once you add your API key, the automation is fully functional.
