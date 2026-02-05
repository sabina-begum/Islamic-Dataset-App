# PWA Icons Setup

## Quick Fix for "Missing Icons" Error

The PWA install button is showing a warning because the PNG icon files are missing. Here's how to fix it:

### Step 1: Generate Icons Online (Easiest Method)

1. **Go to:** https://www.favicon-generator.org/
2. **Upload the SVG file:** `public/icons/icon.svg`
3. **Download the package** - it will include all required sizes
4. **Extract and rename** the files to match our requirements

### Step 2: Alternative - Use RealFaviconGenerator

1. **Go to:** https://realfavicongenerator.net/
2. **Upload:** `public/icons/icon.svg`
3. **Configure settings:**
   - Background: #059669 (green)
   - Foreground: White
4. **Download** and extract to `public/icons/`

### Step 3: Required Files

After generating, you need these files in `public/icons/`:

- `icon-72x72.png`
- `icon-96x96.png`
- `icon-128x128.png`
- `icon-144x144.png`
- `icon-152x152.png`
- `icon-192x192.png`
- `icon-384x384.png`
- `icon-512x512.png`

### Step 4: Test

1. Place the PNG files in `public/icons/`
2. Restart your development server
3. The install button should now work properly

### Manual Method (if online tools don't work)

If you have ImageMagick installed:

```bash
convert public/icons/icon.svg -resize 72x72 public/icons/icon-72x72.png
convert public/icons/icon.svg -resize 96x96 public/icons/icon-96x96.png
convert public/icons/icon.svg -resize 128x128 public/icons/icon-128x128.png
convert public/icons/icon.svg -resize 144x144 public/icons/icon-144x144.png
convert public/icons/icon.svg -resize 152x152 public/icons/icon-152x152.png
convert public/icons/icon.svg -resize 192x192 public/icons/icon-192x192.png
convert public/icons/icon.svg -resize 384x384 public/icons/icon-384x384.png
convert public/icons/icon.svg -resize 512x512 public/icons/icon-512x512.png
```

Once you have the PNG files, the PWA install button will work! 🎉
