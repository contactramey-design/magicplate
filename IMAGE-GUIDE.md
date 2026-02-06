# Before/After Image Guide for MagicPlate.ai

## Overview
You need two matching food photos for the before/after slider on your homepage. The slider is already set up and ready - you just need to add the images.

## Image Requirements

### Technical Specs
- **Dimensions**: 550px wide × 350px tall (or maintain 1.57:1 aspect ratio)
- **Format**: JPG or PNG
- **File names**: 
  - `before.jpg` (or `before.png`)
  - `after.jpg` (or `after.png`)
- **Location**: `/public/images/` folder

### Content Requirements

**BEFORE PHOTO (bad/original):**
- Poor lighting (too dark, harsh shadows, or washed out)
- Blurry or slightly out of focus
- Dull colors (muted, desaturated)
- Unappealing presentation (messy plate, poor food arrangement)
- Low resolution or grainy texture
- Unprofessional background or distracting elements
- Harsh shadows or uneven lighting
- Food looks unappetizing or unprofessional

**AFTER PHOTO (enhanced/professional):**
- Bright, even, professional lighting
- Sharp focus and crisp details
- Vibrant, appetizing colors (enhanced saturation)
- Clean, professional presentation
- High resolution, smooth texture
- Clean background or subtle blur
- Professional shadows and highlights
- Food looks irresistible and restaurant-quality

**CRITICAL**: Both photos must have:
- Same exact dish/food item
- Same camera angle and framing
- Same plate/background positioning
- Identical composition (so the slider transition looks natural)

## How to Get the Images

### Option 1: Use an AI Image Generator

**For DALL-E, Midjourney, or Stable Diffusion:**

```
I need two matching food photos for a before/after slider on my restaurant menu enhancement website. The photos must be identical in composition and framing, with only the quality/enhancement differing.

REQUIREMENTS:
1. Same exact dish/food item in both photos
2. Same camera angle and framing
3. Same plate/background positioning
4. Dimensions: 550px wide × 350px tall (or maintain 1.57:1 aspect ratio)
5. File format: JPG or PNG

BEFORE PHOTO (bad/original):
- Poor lighting (too dark, harsh shadows, or washed out)
- Blurry or slightly out of focus
- Dull colors (muted, desaturated)
- Unappealing presentation (messy plate, poor food arrangement)
- Low resolution or grainy texture
- Unprofessional background or distracting elements
- Harsh shadows or uneven lighting
- Food looks unappetizing or unprofessional

AFTER PHOTO (enhanced/professional):
- Bright, even, professional lighting
- Sharp focus and crisp details
- Vibrant, appetizing colors (enhanced saturation)
- Clean, professional presentation
- High resolution, smooth texture
- Clean background or subtle blur
- Professional shadows and highlights
- Food looks irresistible and restaurant-quality

The two photos should look like the SAME dish, just with the "after" version being a professionally enhanced version of the "before" version. This will demonstrate the transformation power of our AI menu enhancement service.

Please create both images with matching composition so they work perfectly in a side-by-side slider comparison.
```

### Option 2: Use Real Photos

1. Take a photo of a dish with your phone (poor lighting, unprofessional)
2. Enhance it using your actual MagicPlate.ai service or photo editing tools
3. Ensure both photos have the same framing/composition
4. Resize both to 550×350px (or maintain aspect ratio)

### Option 3: Use Stock Photos

1. Find a professional food photo from Unsplash/Pexels
2. Create a "bad" version by:
   - Reducing brightness/contrast
   - Adding blur
   - Desaturating colors
   - Adding grain/noise
3. Use the original as the "after" photo
4. Ensure both are the same size and composition

## Adding the Images

Once you have the images:

1. **Save them to the correct location:**
   ```
   /Users/sydneyrenay/magicplate/public/images/before.jpg
   /Users/sydneyrenay/magicplate/public/images/after.jpg
   ```

2. **Or use these commands:**
   ```bash
   # Copy your images to the public/images folder
   cp /path/to/your/before.jpg /Users/sydneyrenay/magicplate/public/images/
   cp /path/to/your/after.jpg /Users/sydneyrenay/magicplate/public/images/
   ```

3. **Test locally:**
   ```bash
   npm run dev:static
   # Visit http://localhost:3000
   ```

4. **Deploy to Vercel:**
   ```bash
   git add public/images/before.jpg public/images/after.jpg
   git commit -m "Add before/after slider images"
   git push origin main
   # Vercel will auto-deploy
   ```

## Troubleshooting

**Images not showing?**
- Check file names match exactly: `before.jpg` and `after.jpg`
- Check file location: `/public/images/`
- Hard refresh browser: `Cmd + Shift + R` (Mac) or `Ctrl + Shift + R` (Windows)

**Slider not working?**
- Ensure both images are the same size
- Check browser console for errors (F12)
- Verify images loaded successfully

**Images look misaligned?**
- Both images must have identical composition
- Same camera angle and framing
- Same plate/food positioning

## Quick Test with Placeholder

If you want to test the slider before getting real images, you can temporarily use:
- Unsplash placeholder: `https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=550&h=350&fit=crop`
- Or create simple colored placeholders

But for production, use real before/after photos that demonstrate your service's value!
