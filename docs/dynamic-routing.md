# Dynamic Routing for SEO

This document describes the dynamic routing system implemented for TexEcon to provide SEO-friendly URLs while keeping pages dynamic.

## Route Patterns

The application now supports the following route patterns:

### Static Routes

- `/` - Home page

### Dynamic Routes

- `/page/:pageId` - Page by ID (e.g., `/page/123`)
- `/content/:contentSlug` - Content by slug (e.g., `/content/texas-economy`)
- `/topic/:topicId` - Topic by ID or argument (e.g., `/topic/economic-data`)
- `/section/:sectionSlug` - Section by slug (e.g., `/section/regional-analysis`)

## How It Works

1. **URL Generation**: When a user selects a menu item, the system generates an SEO-friendly URL based on the content type and title.

2. **URL Parsing**: When a user visits a URL directly, the system parses the URL parameters and finds the corresponding content.

3. **SEO Benefits**: Each dynamic page gets its own URL with proper meta tags, structured data, and sitemap entries.

## URL Generation Logic

The system generates URLs based on content characteristics:

```typescript
if (item.parent_page) {
  return `/section/${slug}`;
} else if (item.argument) {
  return `/topic/${item.argument}`;
} else if (item.url && item.url !== '/') {
  return `/content/${slug}`;
} else {
  return `/page/${item.id}`;
}
```

## SEO Features

### Meta Tags

- Dynamic titles based on content
- Dynamic descriptions using content description or generated text
- Dynamic keywords extracted from content
- Proper Open Graph tags for social sharing

### Structured Data

- JSON-LD structured data for each page
- Proper breadcrumb navigation
- Article schema for content pages

### Sitemap

- Automatically generated sitemap.xml
- Dynamic entries for all navigable content
- Proper priority and change frequency settings

## Implementation Files

### Core Routing

- `src/App.tsx` - Route definitions
- `src/pages/home.tsx` - Route handling and content loading
- `src/lib/seo-utils.ts` - SEO utility functions

### Components

- `src/components/navigation.tsx` - Navigation with URL updates
- `src/components/footer.tsx` - Footer links with proper routing

### Build Process

- `scripts/generate-sitemap.js` - Sitemap generation
- Updated build scripts in `package.json`

## Usage Examples

### Navigation

When a user clicks a navigation item, the system:

1. Updates the URL to an SEO-friendly path
2. Updates the page content dynamically
3. Updates meta tags and structured data
4. Maintains browser history

### Direct URL Access

When a user visits a URL directly:

1. The system parses the URL parameters
2. Finds the corresponding content item
3. Loads the content dynamically
4. Sets appropriate SEO meta tags

### Footer Links

Footer links now use the same routing system as navigation, ensuring consistent URL patterns throughout the site.

## Development

### Adding New Route Patterns

To add new route patterns:

1. Add the route to `App.tsx`
2. Update the URL generation logic in `seo-utils.ts`
3. Update the URL parsing logic in `home.tsx`

### Testing Routes

All routes can be tested in development mode. The system will:

- Show appropriate content for valid routes
- Redirect to home for invalid routes
- Maintain proper SEO meta tags in all cases

## SEO Benefits

1. **Clean URLs**: Instead of hash-based navigation, all content has clean, descriptive URLs
2. **Direct Linking**: Content can be shared and accessed directly via URL
3. **Search Engine Indexing**: Each piece of content has its own indexable URL
4. **Social Sharing**: Proper Open Graph tags for social media sharing
5. **Sitemap**: Automated sitemap generation for search engines

## Future Enhancements

- Server-side rendering support for better SEO
- Dynamic sitemap generation from actual content data
- URL history management for better UX
- Analytics integration for route tracking
