# AI Photo Enhancement - Complete Implementation Guide

## Overview

This guide provides a complete implementation for the AI Photo Enhancement feature with ethical food photography enhancement, subscription-based usage tracking, and an interactive before/after slider.

## System Prompt

The system prompt is defined in `lib/photo-enhancement-prompt.js` and ensures:
- ✅ Ethical enhancement (no adding/removing ingredients)
- ✅ Food-specific optimization
- ✅ Professional quality output
- ✅ Menu-ready appearance

## Database Schema

The existing `usage_tracking` table handles credit tracking:

```sql
-- Already exists in schema.sql
CREATE TABLE IF NOT EXISTS usage_tracking (
    usage_id SERIAL PRIMARY KEY,
    restaurant_id INTEGER REFERENCES restaurants(restaurant_id),
    subscription_id INTEGER REFERENCES subscriptions(subscription_id),
    feature_type VARCHAR(50) NOT NULL, -- 'image_enhancements'
    feature_count INTEGER DEFAULT 1,
    usage_date DATE DEFAULT CURRENT_DATE,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Frontend Implementation

### File: `public/photo-enhancer.html`

**Features:**
- ✅ Drag & drop file upload
- ✅ File validation (JPG/PNG, max 10MB)
- ✅ Processing spinner
- ✅ Interactive before/after slider (CSS-based, no external library needed)
- ✅ Download enhanced image
- ✅ Confetti effect on success
- ✅ Responsive design
- ✅ Error handling

**Key Functions:**
- `handleFile()` - Validates and previews uploaded file
- `initSlider()` - Creates draggable before/after comparison
- `fileToBase64()` - Converts file to base64 for API
- `triggerConfetti()` - Success animation

## Backend API

### File: `api/enhance-image.js` (Updated)

The existing API already includes:
- ✅ Subscription tier checking
- ✅ Usage limit enforcement
- ✅ Multiple AI provider support (Leonardo, Together, Replicate)
- ✅ Usage tracking

**Integration with New Prompt System:**

Update the `buildRegenPrompt()` function to use the new prompt system:

```javascript
const { getAIGatewayPrompt } = require('../lib/photo-enhancement-prompt');

function buildRegenPrompt(style) {
  return getAIGatewayPrompt(style);
}
```

## Subscription Limits

Defined in `api/enhance-image.js`:

```javascript
const TIER_LIMITS = {
  starter: { image_enhancements: 10 },      // 10/month
  professional: { image_enhancements: -1 }, // Unlimited
  enterprise: { image_enhancements: -1 }    // Unlimited
};
```

## Usage Tracking

The `lib/usage-tracker.js` module handles:
- Monthly credit reset
- Usage counting
- Limit checking
- Automatic tracking after enhancement

## API Endpoint

**POST `/api/enhance-image`**

**Request:**
```json
{
  "image": "data:image/jpeg;base64,...",
  "filename": "burger.jpg",
  "restaurant_id": 1,
  "style": "upscale_casual"
}
```

**Response:**
```json
{
  "success": true,
  "beforeUrl": "/images/enhanced/before-1234567890.jpg",
  "afterUrl": "https://cdn.leonardo.ai/...",
  "output": ["https://cdn.leonardo.ai/..."],
  "jobId": "generation-id",
  "service": "leonardo"
}
```

**Error Response:**
```json
{
  "error": "Image enhancement limit reached",
  "message": "You've used 10 of 10 enhancements this month...",
  "current": 10,
  "limit": 10,
  "remaining": 0
}
```

## Frontend Flow

1. **Upload**: User drags/drops or selects image
2. **Validation**: Check file type (JPG/PNG) and size (max 10MB)
3. **Preview**: Show original image
4. **Enhance**: Click "Enhance Photo" button
5. **Processing**: Show spinner with "Enhancing..." message
6. **Result**: Display before/after slider
7. **Download**: User can download enhanced image
8. **New Photo**: Option to enhance another image

## Before/After Slider

The slider is implemented with pure CSS and JavaScript:

**Features:**
- Horizontal drag to compare
- Click anywhere to move slider
- Touch support for mobile
- Smooth animations
- Labels ("Before" / "After")

**Implementation:**
- Uses `clip-path: inset()` for reveal effect
- Mouse and touch event handlers
- Responsive design

## Error Handling

**Frontend:**
- File type validation
- File size validation
- API error display
- Network error handling
- User-friendly error messages

**Backend:**
- Subscription validation
- Credit limit checking
- API provider fallback
- Detailed error responses
- Usage tracking errors (non-fatal)

## UI Polish

**Confetti Effect:**
- Simple CSS animation
- Triggered on successful enhancement
- 50 particles with random colors
- Auto-cleanup after 3 seconds

**Status Messages:**
- Success: Green background
- Error: Orange background
- Clear, actionable messages

**Responsive Design:**
- Mobile-friendly upload zone
- Touch-optimized slider
- Stacked buttons on mobile
- Adaptive image sizing

## Integration with Existing System

The photo enhancer integrates with:
- ✅ Subscription system (`subscriptions` table)
- ✅ Usage tracking (`usage_tracking` table)
- ✅ Restaurant management (`restaurants` table)
- ✅ Content assets (`content_assets` table - can store enhanced images)

## Next Steps for Production

1. **Storage**: Consider cloud storage (S3, Cloudinary) for enhanced images
2. **CDN**: Serve images via CDN for faster loading
3. **Batch Processing**: Allow multiple image uploads
4. **Image History**: Store enhancement history per restaurant
5. **Analytics**: Track enhancement success rates
6. **Watermarking**: Optional watermark for Starter tier
7. **Export Options**: Multiple format/size downloads

## Testing Checklist

- [ ] Upload valid JPG image
- [ ] Upload valid PNG image
- [ ] Reject invalid file types
- [ ] Reject files over 10MB
- [ ] Check Starter tier limit (10/month)
- [ ] Verify Professional/Enterprise unlimited
- [ ] Test slider drag functionality
- [ ] Test slider click functionality
- [ ] Test mobile touch events
- [ ] Verify download functionality
- [ ] Check error messages
- [ ] Verify usage tracking
- [ ] Test confetti animation
- [ ] Verify responsive design

## Performance Optimization

- **Image Compression**: Compress before upload
- **Lazy Loading**: Load images on demand
- **Caching**: Cache enhanced images
- **CDN**: Use CDN for image delivery
- **Progressive Loading**: Show low-res preview first

## Security Considerations

- ✅ File type validation
- ✅ File size limits
- ✅ Base64 encoding for API
- ✅ Restaurant ID validation
- ✅ Subscription verification
- ✅ Rate limiting (via usage tracking)

## Accessibility

- ✅ Keyboard navigation support
- ✅ Screen reader labels
- ✅ High contrast mode support
- ✅ Focus indicators
- ✅ ARIA labels

## Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Dependencies

**Frontend:**
- None (pure HTML/CSS/JavaScript)

**Backend:**
- `lib/photo-enhancement-prompt.js` (new)
- `lib/usage-tracker.js` (existing)
- `lib/db.js` (existing)
- `api/enhance-image.js` (existing, needs prompt update)

## File Structure

```
magicplate/
├── public/
│   └── photo-enhancer.html (NEW)
├── lib/
│   └── photo-enhancement-prompt.js (NEW)
├── api/
│   └── enhance-image.js (UPDATE - use new prompt)
└── AI_PHOTO_ENHANCEMENT_SYSTEM_PROMPT.md (NEW - documentation)
```

## Quick Start

1. **Update enhance-image.js** to use new prompt system
2. **Access photo enhancer** at `/photo-enhancer.html`
3. **Test with sample image**
4. **Verify usage tracking** in database
5. **Check subscription limits** are enforced

## Support

For issues or questions:
- Check `AI_PHOTO_ENHANCEMENT_SYSTEM_PROMPT.md` for prompt details
- Review `lib/photo-enhancement-prompt.js` for prompt generation
- Check API logs for enhancement errors
- Verify subscription status in database
