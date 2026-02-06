# How to Extract Before/After Images from Screenshot

## Quick Steps

1. **Open the screenshot in an image editor** (Preview on Mac, Paint on Windows, or any photo editor)

2. **Crop the "before" section:**
   - Select the top section labeled "before"
   - Crop to just the food image (excluding the UI labels if possible)
   - Save as `before.jpg`
   - Recommended size: 550px wide × 350px tall (or maintain aspect ratio)

3. **Crop the "after" section:**
   - Select the bottom section labeled "after"  
   - Crop to just the food image (excluding the UI labels if possible)
   - Save as `after.jpg`
   - Recommended size: 550px wide × 350px tall (or maintain aspect ratio)

4. **Save both images to:**
   ```
   /Users/sydneyrenay/magicplate/public/images/before.jpg
   /Users/sydneyrenay/magicplate/public/images/after.jpg
   ```

## Using Preview on Mac

1. Open the screenshot in Preview
2. Click "Tools" → "Rectangular Selection"
3. Select the "before" image area
4. Click "Tools" → "Crop"
5. Click "Tools" → "Adjust Size" → Set width to 550px (height will auto-adjust)
6. File → Export → Save as `before.jpg` to `/Users/sydneyrenay/magicplate/public/images/`
7. Repeat for "after" image

## Using Online Tools

1. Upload screenshot to: https://www.iloveimg.com/crop-image
2. Crop the "before" section → Download
3. Crop the "after" section → Download
4. Resize both to 550×350px using: https://www.iloveimg.com/resize-image
5. Save to the images folder

## Quick Command (if you have the images ready)

```bash
# Copy your images to the correct location
cp /path/to/before.jpg /Users/sydneyrenay/magicplate/public/images/
cp /path/to/after.jpg /Users/sydneyrenay/magicplate/public/images/
```
