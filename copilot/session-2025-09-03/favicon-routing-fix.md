# Favicon Routing Fix for Section Pages

## Issue

When users navigated to `/section/{pagename}` routes on texecon.com, the browser was trying to load favicon files from the wrong paths, resulting in 404 errors:

```
GET https://texecon.com/section/favicon.svg?v=bd8f74d 404 (Not Found)
GET https://texecon.com/section/favicon.ico?v=bd8f74d 404 (Not Found)
GET https://texecon.com/section/favicon-32x32.png?v=bd8f74d 404 (Not Found)
```

## Root Cause

The favicon links in the HTML were using relative paths (`./favicon.ico`) instead of absolute paths (`/favicon.ico`). When users visited `/section/mark-hazleton`, the browser tried to resolve `./favicon.ico` relative to the current path, resulting in `/section/favicon.ico` instead of `/favicon.ico`.

## Solution

Updated all favicon-related paths to use absolute paths in three files:

### 1. `client/index.html`

Changed all favicon links from relative to absolute paths:

**Before:**

```html
<link rel="icon" href="./favicon.ico" />
<link rel="shortcut icon" href="./favicon.ico" />
<link rel="icon" type="image/png" sizes="16x16" href="./favicon-16x16.png" />
```

**After:**

```html
<link rel="icon" href="/favicon.ico" />
<link rel="shortcut icon" href="/favicon.ico" />
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
```

### 2. `client/public/site.webmanifest`

Updated the web app manifest to use absolute paths:

**Before:**

```json
"icons": [
  { "src": "./favicon-16x16.png", "sizes": "16x16", "type": "image/png" },
  ...
],
"start_url": "./"
```

**After:**

```json
"icons": [
  { "src": "/favicon-16x16.png", "sizes": "16x16", "type": "image/png" },
  ...
],
"start_url": "/"
```

### 3. `client/public/browserconfig.xml`

Updated Microsoft tile configuration to use absolute paths:

**Before:**

```xml
<square70x70logo src="./favicon-70x70.png" />
<square150x150logo src="./favicon-150x150.png" />
```

**After:**

```xml
<square70x70logo src="/favicon-70x70.png" />
<square150x150logo src="/favicon-150x150.png" />
```

## Result

✅ All favicon files now load correctly from the root domain regardless of the current route
✅ No more 404 errors when visiting `/section/{pagename}` routes
✅ Proper caching and versioning still maintained by Vite build process
✅ Works correctly with GitHub Pages subdirectory deployment configuration

## Testing

The fix was verified by:

1. Building the project successfully with `npm run build`
2. Confirming that the output HTML contains absolute paths with proper version parameters
3. Verifying that manifest and browserconfig files are correctly processed

## Impact

This fix ensures that:

- Users visiting team member pages (`/section/mark-hazleton`, `/section/jared-hazleton`) don't see console errors
- Browser favicon requests work correctly for all dynamic routes
- SEO and performance are not impacted by missing favicon files
- Progressive Web App (PWA) functionality works properly with correct manifest paths
