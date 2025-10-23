# Creating OG Image for Social Sharing

## Required Image Specs

- **Filename**: `texecon-og-image.jpg`
- **Location**: `client/public/assets/texecon-og-image.jpg`
- **Dimensions**: 1200x630 pixels
- **Format**: JPG (optimized, < 1MB)
- **Content**:
  - TexEcon branding/logo
  - Tagline: "Texas Economic Analysis & Insights"
  - Clean, professional design
  - High contrast for readability

## Quick Creation Options

### Option 1: Use Canva (Recommended)
1. Go to canva.com
2. Select "Facebook Post" or "Custom Size" (1200x630)
3. Add TexEcon branding and text
4. Download as JPG
5. Place in `client/public/assets/texecon-og-image.jpg`

### Option 2: Use Figma
1. Create new frame (1200x630)
2. Design OG image with branding
3. Export as JPG
4. Place in `client/public/assets/texecon-og-image.jpg`

### Option 3: Command Line (ImageMagick)
```bash
# Create a simple placeholder (requires ImageMagick)
convert -size 1200x630 xc:#1e3a8a \
  -font Arial -pointsize 72 -fill white \
  -gravity center -annotate +0-50 'TexEcon' \
  -pointsize 36 -annotate +0+50 'Texas Economic Analysis & Insights' \
  client/public/assets/texecon-og-image.jpg
```

## Testing
After creating the image, test with:
- Facebook Sharing Debugger: https://developers.facebook.com/tools/debug/
- Twitter Card Validator: https://cards-dev.twitter.com/validator
- LinkedIn Post Inspector: https://www.linkedin.com/post-inspector/

## Current Status
⚠️ **Action Required**: Create and place OG image at `client/public/assets/texecon-og-image.jpg`

The SEO component ([client/src/components/seo-head.tsx](../client/src/components/seo-head.tsx)) already references this file on line 19.
