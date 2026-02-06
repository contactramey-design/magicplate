# Vercel Environment Variables Setup

## 🔑 Add REPLICATE_API_TOKEN to Vercel

### Step 1: Go to Vercel Dashboard
1. Visit: https://vercel.com/dashboard
2. Select your `magicplate` project
3. Go to **Settings** → **Environment Variables**

### Step 2: Add the Variable
1. Click **Add New**
2. **Name**: `REPLICATE_API_TOKEN`
3. **Value**: `r8_your_actual_token_here` (your Replicate token)
4. **Environment**: Select all (Production, Preview, Development)
5. Click **Save**

### Step 3: Redeploy
After adding the environment variable, you need to redeploy:
- Go to **Deployments** tab
- Click the **⋯** menu on the latest deployment
- Click **Redeploy**

OR push a new commit to trigger auto-deploy:
```bash
git add .
git commit -m "Update API configuration"
git push origin main
```

## 📋 Current Vercel Configuration

✅ **vercel.json** is configured correctly:
- `/api/enhance-image` route is set up
- API file exists at `api/enhance-image.js`

## 🔄 Local vs Vercel

**Local Development** (what you're testing now):
- Uses `.env` file in project root
- Add: `REPLICATE_API_TOKEN=r8_your_token`
- Restart server: `kill $(cat server.pid) && npm run dev`

**Vercel Production**:
- Uses Vercel Dashboard → Environment Variables
- Add the same variable there
- Redeploy after adding

## ✅ Verification

After adding to Vercel, test on your live site:
- Visit: https://magicplate.info
- Try uploading an image
- Should work without "No API configured" error

---

**Note**: Local `.env` and Vercel environment variables are **separate**. You need to add the token to both places if you want to test locally AND on Vercel.
