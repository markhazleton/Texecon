# Deployment Guide - GitHub Pages

## Overview

This guide documents the deployment process for TexEcon to GitHub Pages, including build pipeline configuration, environment setup, and troubleshooting procedures.

## Build Pipeline Architecture

```
Content Refresh → Sitemap Generation → Vite Build → GitHub Pages Deploy
```

### Step 1: Content Refresh

**Script**: `npm run refresh:content`

**Purpose**: Fetch latest content from WebSpark API or use cached fallback

**Process**:

1. Attempts API call to WebSpark CMS with 10-second timeout
2. On success: Updates `client/src/data/webspark-raw.json`
3. On failure: Falls back to cached content with detailed reporting
4. Generates refresh report in `client/src/data/content-refresh-report.json`

### Step 2: Sitemap Generation

**Script**: `npm run generate:sitemap`

**Purpose**: Generate SEO-optimized XML sitemap for dynamic routes

**Process**:

1. Creates `client/public/sitemap.xml` with all route patterns
2. Updates `client/public/robots.txt` with sitemap reference
3. Includes static pages and dynamic content routes

### Step 3: Vite Build

**Script**: `vite build`

**Purpose**: Create optimized static build for GitHub Pages

**Configuration**:

- **Input**: `client/index.html`
- **Output**: `dist/` directory
- **Base Path**: Configurable via `VITE_BASE_PATH` environment variable
- **Optimizations**: Tree shaking, code splitting, asset optimization

## GitHub Pages Configuration

### Repository Settings

- **Source**: Deploy from `main` branch
- **Folder**: `/dist` (after build)
- **Custom Domain**: Optional (texecon.com)

### Environment Variables

#### Build Environment

```bash
NODE_ENV=production
VITE_BASE_PATH=/  # For root domain, or /repository-name for subdirectory
```

#### GitHub Actions (if using)

```yaml
env:
  NODE_ENV: production
  VITE_BASE_PATH: ${{ github.repository != 'username/username.github.io' && format('/{0}', github.event.repository.name) || '/' }}
```

## Build Commands

### Local Development

```bash
npm run dev          # Start development server
npm run build        # Full production build
npm run preview      # Preview production build locally
```

### Production Build Process

```bash
npm run clean        # Clean dist directory
npm run refresh:content  # Fetch latest content
npm run generate:sitemap # Generate sitemap
vite build          # Create optimized build
```

### Complete Build and Preview

```bash
npm run start       # Runs clean → refresh → sitemap → build → preview
```

## File Structure

### Source Structure

```
client/
├── index.html          # Entry point
├── public/             # Static assets
│   ├── sitemap.xml     # Generated sitemap
│   ├── robots.txt      # Generated robots.txt
│   └── favicon files   # Favicon assets
└── src/
    ├── components/     # React components
    ├── pages/          # Route components
    ├── data/           # Content data
    └── assets/         # Source assets
```

### Build Output

```
dist/
├── index.html                    # 7.33 kB
├── assets/
│   ├── index-CmBmcvZ2.css       # 51.97 kB (Tailwind CSS)
│   └── index-DAOo1N8o.js        # 433.90 kB (React app)
└── [static assets]               # Favicons, images, etc.
```

## Routing Configuration

### Client-Side Routing

The application uses Wouter for client-side routing with these patterns:

```typescript
/                      # Home page
/page/:pageId          # Content by page ID
/content/:contentSlug  # Content by slug
/topic/:topicId        # Topic pages
/section/:sectionSlug  # Section pages
```

### GitHub Pages Routing

- **404.html**: Handles client-side routing fallback
- **Base Path**: Configured for subdirectory deployment if needed
- **History API**: Supported with proper fallback

## Content Management

### WebSpark API Integration

```javascript
const apiUrl = 'https://webspark.markhazleton.com/api/WebCMS/websites/1';
const headers = {
  'Accept': 'application/json',
  'Authorization': 'Bearer MARKHAZLETON-WEB',
  'Cookie': '.AspNetCore.Antiforgery.DlpvxuBJxZo=...'
};
```

### Content Refresh Strategy

1. **API-First**: Always attempt fresh content fetch
2. **Graceful Fallback**: Use cached content on API failure
3. **Detailed Reporting**: Log all refresh attempts and results
4. **Build Integration**: Content refresh runs before every build

## SEO Optimization

### Meta Tags

- Dynamic meta descriptions based on content
- Open Graph tags for social sharing
- Twitter Card metadata
- Canonical URLs for all pages

### Structured Data

- JSON-LD implementation for organization data
- Page-specific structured data
- Team member schema markup

### Sitemap

- Automatically generated XML sitemap
- Includes all dynamic routes
- Updated with each build

## Performance Optimization

### Build Optimizations

- **Tree Shaking**: Removes unused code
- **Code Splitting**: Separates vendor and app code
- **Asset Optimization**: Minification and compression
- **CSS Purging**: Removes unused Tailwind classes

### Runtime Performance

- **Lazy Loading**: Images and components
- **Caching Strategy**: Optimal cache headers
- **Bundle Size**: < 500 kB target (433.90 kB actual)
- **Gzip Compression**: < 150 kB target (135.27 kB actual)

## Deployment Checklist

### Pre-Deployment

- [ ] Run `npm run build` locally
- [ ] Verify content refresh success
- [ ] Check sitemap generation
- [ ] Validate bundle size
- [ ] Test routing functionality

### GitHub Pages Deployment

- [ ] Push to main branch
- [ ] Wait for GitHub Pages build
- [ ] Verify site accessibility
- [ ] Test all routes
- [ ] Validate SEO elements

### Post-Deployment

- [ ] Run Lighthouse audit
- [ ] Check Core Web Vitals
- [ ] Verify content accuracy
- [ ] Test mobile responsiveness
- [ ] Monitor error rates

## Troubleshooting

### Common Build Issues

#### Content Refresh Failures

```bash
⚠️  API fetch failed: [error message]
📚 Using existing cached content...
```

**Solution**: Build continues with cached content; investigate API connectivity

#### Missing Dependencies

```bash
[vite]: Rollup failed to resolve import
```

**Solution**: Check package.json and run `npm install`

#### Bundle Size Warnings

```bash
(!) Some chunks are larger than 500 kBs
```

**Solution**: Analyze bundle composition and optimize heavy dependencies

### GitHub Pages Issues

#### 404 Errors on Routes

**Cause**: Client-side routing not properly configured
**Solution**: Ensure 404.html exists and handles routing fallback

#### Asset Loading Issues

**Cause**: Incorrect base path configuration
**Solution**: Verify VITE_BASE_PATH matches repository structure

#### Performance Issues

**Cause**: Large bundle size or unoptimized assets
**Solution**: Run bundle analysis and optimize dependencies

## Monitoring

### Build Monitoring

- Content refresh success/failure rates
- Build time tracking
- Bundle size monitoring
- Dependency security updates

### Runtime Monitoring

- Core Web Vitals measurement
- Error rate tracking
- Content freshness validation
- API availability monitoring

This deployment guide ensures reliable and optimized deployment of the TexEcon application to GitHub Pages.
