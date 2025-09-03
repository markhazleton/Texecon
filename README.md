# TexEcon - Texas Economic Analysis

A static website providing expert analysis and commentary on the Texas economy.

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview
```

## Deployment

This site is automatically deployed to GitHub Pages when changes are pushed to the main branch.

The build process:

1. Refreshes content from the WebSpark API
2. Builds the static site with Vite
3. Deploys to GitHub Pages

## Technology Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Radix UI** - Accessible UI components
- **Lucide React** - Icons
- **React Query** - Data fetching and caching
- **Wouter** - Client-side routing

## Content Management

Content is fetched from a headless CMS via API during the build process. The site includes:

- Economic analysis and insights
- Team information
- Economic metrics and data visualizations
- Navigation and site structure

## Project Structure

```text
client/
  public/          # Static assets
  src/
    components/    # React components
    data/         # Cached content data
    hooks/        # Custom React hooks
    lib/          # Utilities and configuration
    pages/        # Page components
scripts/          # Build and content refresh scripts
```
