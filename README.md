# TexEcon - Texas Economic Analysis

A modern static React application providing expert analysis and commentary on the Texas economy. Built with React 19, TypeScript, and Tailwind CSS for optimal performance and SEO on GitHub Pages.

## Features

- **Build-time Content Management**: Fresh content from WebSpark API with cached fallbacks
- **Static Site Generation**: Pre-rendered pages for optimal SEO and performance
- **Progressive Enhancement**: Client-side routing with static HTML fallbacks
- **Advanced SEO**: Structured data, dynamic sitemaps, and enhanced meta tags
- **Performance Optimized**: Cache busting, asset optimization, and Core Web Vitals focus

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Type check
npm run type-check

# Clean build artifacts
npm run clean

# Fetch latest content from API
npm run fetch:content

# Generate sitemap from API data
npm run generate:sitemap

# Build for production (full pipeline)
npm run build

# Generate static pages post-build
npm run generate:static-pages

# Start production preview server
npm run start

# Preview production build locally
npm run preview
```

## Build Pipeline

The complete build process includes:

1. **Clean**: Remove previous build artifacts (`target/` directory)
2. **Content Fetch**: Retrieve latest content from WebSpark API
3. **Sitemap Generation**: Create SEO-optimized XML sitemap
4. **Vite Build**: Compile and optimize the application
5. **Static Page Generation**: Create indexed HTML files for dynamic routes

## Deployment

This site is automatically deployed to GitHub Pages when changes are pushed to the main branch.

The deployment process:

1. Runs the complete build pipeline
2. Configures base path based on domain setup (custom domain or GitHub Pages)
3. Uploads build artifacts to GitHub Pages
4. Deploys with custom domain support (texecon.com)

## Technology Stack

- **React 19** - Latest React with concurrent features
- **TypeScript** - Type safety and enhanced developer experience
- **Vite 7.1** - Fast build tool with advanced static generation
- **Tailwind CSS 4.1** - Modern CSS framework with CSS-first configuration
- **Radix UI** - Accessible UI component primitives
- **shadcn/ui** - Beautiful, customizable component library
- **Lucide React** - Consistent icon library
- **Wouter** - Lightweight client-side routing

## Content Management

Content is fetched from a headless CMS (WebSpark) during the build process. The system includes:

- **API Integration**: Authenticated requests to WebSpark CMS
- **Content Processing**: Transform raw API data into optimized structures
- **Fallback System**: Graceful degradation to cached content
- **Type Generation**: Automatic TypeScript interfaces from API responses
- **Build Reports**: Detailed analysis of content fetch and processing

### Content Types

- Economic analysis and insights
- Team member profiles and information
- Economic metrics and data visualizations
- Dynamic navigation structure
- SEO-optimized content organization

## Project Structure

```text
client/
  public/          # Static assets (favicons, CNAME, robots.txt)
  src/
    components/    # React components and UI library
    data/         # Cached content data and generated types
    hooks/        # Custom React hooks
    lib/          # Utilities and configuration
    pages/        # Route components and page layouts
scripts/          # Build automation and content management
target/           # Built application (configurable via TARGET_DIR)
```

## Environment Configuration

### Build Variables

- `VITE_BASE_PATH`: Base path for deployment (defaults to `/`)
- `TARGET_DIR`: Output directory (defaults to `target/`)
- `BUILD_ID`: Build identifier for cache busting
- `SITE_BASE_URL`: Base URL for sitemap generation
- `CUSTOM_DOMAIN`: Custom domain for GitHub Pages

### Content API

- **Endpoint**: WebSpark CMS API
- **Authentication**: Bearer token authentication
- **Timeout**: 10-second request timeout
- **Fallback**: Cached content with detailed error reporting

## Performance Features

- **Bundle Optimization**: Tree shaking and code splitting
- **Cache Busting**: Automatic asset versioning with build IDs
- **Static Generation**: Pre-rendered HTML for all routes
- **Core Web Vitals**: Optimized for excellent performance scores
- **Progressive Loading**: Efficient asset delivery and caching
