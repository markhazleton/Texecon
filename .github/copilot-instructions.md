# GitHub Copilot Instructions for TexEcon Project

## Project Overview

TexEcon is a modern, static React application showcasing Texas economic data and team information. The project is built with Vite, React 19, TypeScript, and Tailwind CSS, designed for optimal performance and SEO on GitHub Pages.

## Primary Goals

- **GitHub Pages Hosting**: Deliver a fast, static site optimized for GitHub Pages deployment
- **Content Management**: Dynamic content fetching from WebSpark API with fallback to cached data
- **Performance First**: Minimal bundle size, optimal loading times, and excellent Core Web Vitals
- **SEO Excellence**: Complete meta tags, structured data, sitemaps, and semantic HTML
- **Developer Experience**: Type-safe development with comprehensive tooling and monitoring

## Architecture & Tech Stack

### Core Technologies

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS 3.4 + CSS Variables + Dark Mode
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack Query (React Query)
- **UI Components**: Radix UI primitives + shadcn/ui components
- **Icons**: Lucide React
- **Build Tool**: Vite 7.1 with optimized static output

### Build Pipeline Architecture

```
Source Code → Content Refresh → Sitemap Generation → Vite Build → GitHub Pages Deploy
```

## Build Pipeline Instructions

### 1. Content Refresh Process (`npm run refresh:content`)

- **Script**: `scripts/refresh-content.js`
- **Purpose**: Fetch latest content from WebSpark API or use cached fallback
- **Output**: Updates `client/src/data/webspark-raw.json` and generates refresh report
- **Error Handling**: Graceful fallback to cached content with detailed reporting
- **API Integration**: Authenticated requests to WebSpark CMS with 10-second timeout

### 2. Sitemap Generation (`npm run generate:sitemap`)

- **Script**: `scripts/generate-sitemap.js`
- **Purpose**: Generate SEO-optimized XML sitemap for dynamic routes
- **Output**: Creates `client/public/sitemap.xml` and updates `robots.txt`
- **Routes Covered**: Static pages, dynamic content routes, topic pages, section pages

### 3. Vite Build Process (`vite build`)

- **Entry Point**: `client/index.html`
- **Output Directory**: `dist/`
- **Optimizations**: Tree shaking, code splitting, asset optimization
- **Base Path**: Configurable via `VITE_BASE_PATH` environment variable
- **Bundle Analysis**: Monitors bundle size and performance metrics

### 4. GitHub Pages Deployment

- **Static Output**: All files in `dist/` directory
- **Routing**: Client-side routing with 404.html fallback
- **Assets**: Optimized images, fonts, and static resources
- **Performance**: Gzipped assets, optimal caching headers

## Development Guidelines

### Code Organization

```
client/src/
├── components/         # Reusable UI components
│   ├── ui/            # shadcn/ui components
│   └── *.tsx          # Feature components
├── pages/             # Route components
├── hooks/             # Custom React hooks
├── lib/               # Utility functions and API clients
├── data/              # Static and dynamic content data
└── assets/            # Static assets and images
```

### Component Standards

- Use TypeScript for all components
- Follow shadcn/ui patterns for consistency
- Implement proper error boundaries and loading states
- Include data-testid attributes for testing
- Use semantic HTML and ARIA attributes

### Performance Requirements

- Bundle size < 500KB (gzipped < 150KB)
- First Contentful Paint < 1.5s
- Largest Contentful Paint < 2.5s
- Cumulative Layout Shift < 0.1

### SEO Requirements

- Complete meta tags for all pages
- Structured data (JSON-LD) implementation
- Dynamic sitemap generation
- Semantic HTML structure
- Alt text for all images

## Documentation Instructions

### Session Documentation Location

**All generated documentation must be placed in:**

```
/copilot/session-{YYYY-MM-DD}/
```

### Documentation Types to Generate

1. **Architecture Decisions** (`architecture-decisions.md`)

   - Technology choices and rationale
   - Performance optimization strategies
   - Build pipeline improvements

2. **API Integration** (`api-integration.md`)

   - WebSpark API documentation
   - Error handling strategies
   - Content refresh mechanisms

3. **Deployment Guide** (`deployment-guide.md`)

   - GitHub Pages configuration
   - Environment variables
   - CI/CD pipeline setup

4. **Performance Analysis** (`performance-analysis.md`)

   - Bundle analysis reports
   - Core Web Vitals measurements
   - Optimization recommendations

5. **Component Library** (`component-library.md`)
   - UI component documentation
   - Usage examples and patterns
   - Design system guidelines

## Code Quality Standards

### TypeScript Configuration

- Strict mode enabled
- No implicit any
- Consistent import/export patterns
- Proper type definitions for all props and functions

### Styling Guidelines

- Use Tailwind CSS classes consistently
- Implement CSS variables for theming
- Follow mobile-first responsive design
- Maintain consistent spacing and typography

### Testing Approach

- Component testing with data-testid attributes
- Performance testing for Core Web Vitals
- Content validation and API error handling
- Build process verification

## Environment Variables

### Build-time Variables

- `VITE_BASE_PATH`: Base path for GitHub Pages deployment
- `NODE_ENV`: Environment mode (development/production)

### Runtime Configuration

- Content refresh intervals
- API endpoints and authentication
- Performance monitoring settings

## Troubleshooting Common Issues

### Build Failures

1. **Dependency Issues**: Run `npm install` to ensure all packages are installed
2. **Content Fetch Errors**: Check WebSpark API connectivity and authentication
3. **Bundle Size Warnings**: Analyze and optimize heavy dependencies

### GitHub Pages Deployment

1. **Routing Issues**: Ensure 404.html handles client-side routing
2. **Asset Loading**: Verify base path configuration for subdirectory deployment
3. **Performance**: Monitor and optimize bundle size and loading times

## Monitoring and Analytics

### Content Monitoring (Development Mode)

- Admin dashboard with real-time content validation
- Error monitoring and reporting
- Performance metrics tracking
- Link validation and SEO compliance

### Production Monitoring

- Core Web Vitals tracking
- Bundle size monitoring
- API availability and response times
- Content freshness validation

## Best Practices for Copilot Assistance

### When Writing Code

1. Always consider TypeScript types and interfaces
2. Follow existing component patterns and naming conventions
3. Implement proper error handling and loading states
4. Include accessibility features and semantic HTML
5. Optimize for performance and bundle size

### When Creating Documentation

1. Place all documentation in the session-dated folder
2. Use clear, actionable language with code examples
3. Include troubleshooting steps and common issues
4. Document decisions and rationale for future reference
5. Maintain consistency with existing documentation style

### When Debugging Issues

1. Check build pipeline logs for specific error messages
2. Verify content refresh and API connectivity
3. Analyze bundle composition and performance metrics
4. Test GitHub Pages deployment configuration
5. Validate SEO and accessibility compliance

This project prioritizes performance, maintainability, and user experience while leveraging modern web technologies for optimal GitHub Pages hosting.
